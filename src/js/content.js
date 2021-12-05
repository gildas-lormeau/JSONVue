/* global window, document, chrome, location, history, top */

const CLASS_COLLAPSED = "collapsed";
const CLASS_HOVERED = "hovered";
const CLASS_SELECTED = "selected";
const TAG_LIST_ITEM = "LI";

let collapserElements, statusElement, jsonObject, jsonSelector, jsonPath, selectedListItem, hoveredListItem, originalBody;
chrome.runtime.onMessage.addListener(message => {
	if (message.copyText) {
		copyText(message.value);
	}
});
if (document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0)) {
	const child = document.body.children.length ? document.body.childNodes[0] : document.body;
	const data = extractData(child.innerText);
	if (data) {
		originalBody = document.body.cloneNode(true);
		chrome.runtime.sendMessage({ init: true }, options => processData(data, options));
	}
}

function extractData(rawText) {
	const text = rawText.trim();
	let tokens;
	if (test(text)) {
		return {
			text: rawText,
			offset: 0
		};
	} else {
		tokens = text.match(/^([^\s(]*)\s*\(([\s\S]*)\)\s*;?$/);
		if (tokens && tokens[1] && tokens[2]) {
			if (test(tokens[2].trim())) {
				return {
					fnName: tokens[1],
					text: tokens[2],
					offset: rawText.indexOf(tokens[2])
				};
			}
		}
	}

	function test(text) {
		return ((text.charAt(0) == "[" && text.charAt(text.length - 1) == "]") || (text.charAt(0) == "{" && text.charAt(text.length - 1) == "}"));
	}
}

function processData(data, options) {
	if ((window == top || options.injectInFrame) && data && data.text) {
		const json = data.text;
		chrome.runtime.sendMessage({
			jsonToHTML: true,
			json,
			fnName: data.fnName,
			offset: data.offset
		}, result => {
			if (result.html) {
				displayUI(result.theme, result.html);
			}
			if (result.error) {
				displayError(result.error, result.loc, result.offset);
			}
		});
		try {
			jsonObject = JSON.parse(json);
		} catch (error) {
			// ignored
		}
	}
}

function displayError(error, loc, offset) {
	const link = document.createElement("link");
	const pre = document.body.firstChild.firstChild;
	const text = pre.textContent.substring(offset);
	const range = document.createRange();
	const imgError = document.createElement("img");
	const content = document.createElement("div");
	const errorPosition = document.createElement("span");
	const container = document.createElement("div");
	const closeButton = document.createElement("div");
	const ranges = [];
	let startRange = 0, indexRange = 0;
	link.rel = "stylesheet";
	link.type = "text/css";
	link.href = chrome.runtime.getURL("css/content-error.css");
	document.head.appendChild(link);
	while (indexRange != -1) {
		indexRange = text.indexOf("\n", startRange);
		ranges.push(startRange);
		startRange = indexRange + 1;
	}
	startRange = ranges[loc.first_line - 1] + loc.first_column + offset;
	const endRange = ranges[loc.last_line - 1] + loc.last_column + offset;
	range.setStart(pre, startRange);
	if (startRange == endRange - 1) {
		range.setEnd(pre, startRange);
	} else {
		range.setEnd(pre, endRange);
	}
	errorPosition.className = "error-position";
	errorPosition.id = "error-position";
	range.surroundContents(errorPosition);
	imgError.src = chrome.runtime.getURL("resources/error-icon.gif");
	errorPosition.insertBefore(imgError, errorPosition.firstChild);
	content.className = "content";
	closeButton.className = "close-error";
	closeButton.onclick = () => content.parentElement.removeChild(content);
	content.textContent = error;
	content.appendChild(closeButton);
	container.className = "container";
	container.appendChild(content);
	errorPosition.parentNode.insertBefore(container, errorPosition.nextSibling);
	location.hash = "error-position";
	history.replaceState({}, "", "#");
}

function displayUI(theme, html) {
	const baseStyleElement = document.createElement("link");
	const userStyleElement = document.createElement("style");
	const copyPathElement = document.createElement("div");
	const toolboxElement = document.createElement("div");
	const expandElement = document.createElement("span");
	const viewSourceElement = document.createElement("a");
	const reduceElement = document.createElement("span");
	statusElement = document.createElement("div");
	baseStyleElement.rel = "stylesheet";
	baseStyleElement.type = "text/css";
	baseStyleElement.href = chrome.runtime.getURL("css/jsonvue-core.css");
	document.head.appendChild(baseStyleElement);
	userStyleElement.appendChild(document.createTextNode(theme));
	document.head.appendChild(userStyleElement);
	document.body.innerHTML = html;
	collapserElements = document.querySelectorAll("#json .collapsible .collapsible");
	statusElement.className = "status";
	copyPathElement.className = "copy-path";
	statusElement.appendChild(copyPathElement);
	document.body.appendChild(statusElement);
	toolboxElement.className = "toolbox";
	expandElement.title = "expand all";
	expandElement.innerText = "+";
	viewSourceElement.title = "view source";
	viewSourceElement.innerText = "view source";
	reduceElement.title = "reduce all";
	reduceElement.innerText = "-";
	toolboxElement.appendChild(expandElement);
	toolboxElement.appendChild(viewSourceElement);
	toolboxElement.appendChild(reduceElement);
	document.body.appendChild(toolboxElement);
	document.body.addEventListener("click", onToggle, false);
	document.body.addEventListener("mouseover", onMouseMove, false);
	document.body.addEventListener("click", onMouseClick, false);
	document.body.addEventListener("contextmenu", onContextMenu, false);
	expandElement.addEventListener("click", onExpandAll, false);
	viewSourceElement.addEventListener("click", onViewSource, false);
	reduceElement.addEventListener("click", onCollapseAll, false);
	copyPathElement.addEventListener("click", event => {
		if (event.isTrusted) {
			chrome.runtime.sendMessage({
				copyPropertyPath: true,
				path: statusElement.innerText
			});
		}
	}, false);
}

function onToggle(event) {
	const target = event.target;
	if (target.className == "collapser") {
		const collapsed = target.parentNode.getElementsByClassName("collapsible")[0];
		collapsed.parentNode.classList.toggle(CLASS_COLLAPSED);
		event.stopImmediatePropagation();
	}
}

function onExpandAll() {
	collapserElements.forEach(collapsed => collapsed.parentNode.classList.remove(CLASS_COLLAPSED));
}

function onCollapseAll() {
	collapserElements.forEach(collapsed => collapsed.parentNode.classList.add(CLASS_COLLAPSED));
}

function onViewSource() {
	document.body.replaceWith(originalBody);
}

function onMouseMove(event) {
	if (event.isTrusted) {
		jsonPath = "";
		let element = getParentListItem(event.target);
		if (element) {
			jsonSelector = [];
			if (hoveredListItem) {
				hoveredListItem.firstChild.classList.remove(CLASS_HOVERED);
			}
			hoveredListItem = element;
			element.firstChild.classList.add(CLASS_HOVERED);
			do {
				if (element.parentNode.classList.contains("array")) {
					const index = [].indexOf.call(element.parentNode.children, element);
					jsonPath = "[" + index + "]" + jsonPath;
					jsonSelector.unshift(index);
				}
				if (element.parentNode.classList.contains("obj")) {
					const key = element.firstChild.firstChild.innerText;
					jsonPath = "." + key + jsonPath;
					jsonSelector.unshift(key);
				}
				element = element.parentNode.parentNode.parentNode;
			} while (element.tagName == TAG_LIST_ITEM);
			if (jsonPath.charAt(0) == ".") {
				jsonPath = jsonPath.substring(1);
			}
			statusElement.innerText = jsonPath;
		} else if (hoveredListItem) {
			hoveredListItem.firstChild.classList.remove(CLASS_HOVERED);
			hoveredListItem = null;
			statusElement.innerText = "";
			jsonSelector = [];
		}
	}
}

function onMouseClick(event) {
	const previousSelectedListItem = selectedListItem;
	if (selectedListItem) {
		selectedListItem.firstChild.classList.remove(CLASS_SELECTED);
		selectedListItem = null;
	}
	const newSelectedListItem = getParentListItem(event.target);
	if (newSelectedListItem && previousSelectedListItem != newSelectedListItem) {
		selectedListItem = newSelectedListItem;
		selectedListItem.firstChild.classList.add(CLASS_SELECTED);
	}
}

function onContextMenu(event) {
	if (event.isTrusted) {
		const currentListItem = getParentListItem(event.target);
		let value = jsonObject, path = "";
		if (currentListItem) {
			jsonSelector.forEach(propertyName => value = value[propertyName]);
			path = jsonPath;
		}
		chrome.runtime.sendMessage({
			copyPropertyPath: true,
			path,
			value: typeof value == "object" ? JSON.stringify(value) : value
		});
	}
}

function getParentListItem(element) {
	if (element.tagName != TAG_LIST_ITEM) {
		while (element && element.tagName != TAG_LIST_ITEM) {
			element = element.parentNode;
		}
	}
	if (element && element.tagName == TAG_LIST_ITEM) {
		return element;
	}
}

function copyText(value) {
	const command = "copy";
	document.addEventListener(command, listener);
	document.execCommand(command);
	document.removeEventListener(command, listener);

	function listener(event) {
		event.clipboardData.setData("text/plain", value);
		event.preventDefault();
	}
}