/* global window, document, chrome, top */

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
	const jsonInfo = extractJsonInfo(child.innerText);
	if (jsonInfo) {
		originalBody = document.body.cloneNode(true);
		chrome.runtime.sendMessage({ init: true }, options => processData(jsonInfo, options));
	}
}

function extractJsonInfo(rawText) {
	const text = rawText.trim();
	let tokens;
	if (detectJson(text)) {
		return {
			text: rawText,
			offset: 0
		};
	} else {
		tokens = text.match(/^([^\s(]*)\s*\(([\s\S]*)\)\s*;?$/);
		if (tokens && tokens[1] && tokens[2]) {
			if (detectJson(tokens[2].trim())) {
				return {
					functionName: tokens[1],
					text: tokens[2],
					offset: rawText.indexOf(tokens[2])
				};
			}
		}
	}

	function detectJson(text) {
		return ((text.charAt(0) == "[" && text.charAt(text.length - 1) == "]") || (text.charAt(0) == "{" && text.charAt(text.length - 1) == "}"));
	}
}

function processData(jsonInfo, options) {
	if ((window == top || options.injectInFrame) && jsonInfo && jsonInfo.text) {
		const json = jsonInfo.text;
		chrome.runtime.sendMessage({
			jsonToHTML: true,
			json,
			functionName: jsonInfo.functionName,
			offset: jsonInfo.offset
		}, result => {
			if (result.html) {
				displayUI(result.theme, result.html);
				try {
					jsonObject = JSON.parse(json);
				} catch (error) {
					// ignored
				}
			}
			if (result.error) {
				displayError(result.error, result.loc, result.offset);
			}
		});
	}
}

function displayError(error, loc, offset) {
	const linkElement = document.createElement("link");
	const preElement = document.body.firstChild.firstChild;
	const textElement = preElement.textContent.substring(offset);
	const iconElement = document.createElement("img");
	const contentElement = document.createElement("div");
	const errorPositionElement = document.createElement("span");
	const containerElement = document.createElement("div");
	const closeButtonElement = document.createElement("div");
	const range = document.createRange();
	const ranges = [];
	let startRange = 0, indexRange = 0;
	linkElement.rel = "stylesheet";
	linkElement.type = "text/css";
	linkElement.href = chrome.runtime.getURL("css/content-error.css");
	document.head.appendChild(linkElement);
	while (indexRange != -1) {
		indexRange = textElement.indexOf("\n", startRange);
		ranges.push(startRange);
		startRange = indexRange + 1;
	}
	startRange = ranges[loc.first_line - 1] + loc.first_column + offset;
	const endRange = ranges[loc.last_line - 1] + loc.last_column + offset;
	range.setStart(preElement, startRange);
	if (startRange == endRange - 1) {
		range.setEnd(preElement, startRange);
	} else {
		range.setEnd(preElement, endRange);
	}
	errorPositionElement.className = "error-position";
	range.surroundContents(errorPositionElement);
	iconElement.src = chrome.runtime.getURL("resources/error-icon.gif");
	errorPositionElement.insertBefore(iconElement, errorPositionElement.firstChild);
	contentElement.className = "content";
	closeButtonElement.className = "close-error";
	closeButtonElement.addEventListener("click", onCloseError, false);
	contentElement.textContent = error;
	contentElement.appendChild(closeButtonElement);
	containerElement.className = "container";
	containerElement.appendChild(contentElement);
	errorPositionElement.parentNode.insertBefore(containerElement, errorPositionElement.nextSibling);

	function onCloseError(event) {
		if (event.isTrusted) {
			contentElement.parentElement.removeChild(contentElement);
		}
	}
}

function displayUI(theme, html) {
	const baseStyleElement = document.createElement("link");
	const userStyleElement = document.createElement("style");
	const toolboxElement = document.createElement("div");
	const openCollapsiblesElement = document.createElement("span");
	const viewSourceElement = document.createElement("a");
	const closeCollapsiblesElement = document.createElement("span");
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
	document.body.appendChild(statusElement);
	toolboxElement.className = "toolbox";
	openCollapsiblesElement.title = "expand all";
	openCollapsiblesElement.innerText = "+";
	viewSourceElement.title = "view source";
	viewSourceElement.innerText = "view source";
	closeCollapsiblesElement.title = "reduce all";
	closeCollapsiblesElement.innerText = "-";
	toolboxElement.appendChild(openCollapsiblesElement);
	toolboxElement.appendChild(viewSourceElement);
	toolboxElement.appendChild(closeCollapsiblesElement);
	document.body.appendChild(toolboxElement);
	document.body.addEventListener("click", onToggleCollapsible, false);
	document.body.addEventListener("mouseover", onMouseMove, false);
	document.body.addEventListener("click", onMouseClick, false);
	document.body.addEventListener("contextmenu", onContextMenu, false);
	openCollapsiblesElement.addEventListener("click", onOpenCollapsibles, false);
	viewSourceElement.addEventListener("click", onViewSource, false);
	closeCollapsiblesElement.addEventListener("click", onCloseCollapsibles, false);
}

function onToggleCollapsible(event) {
	if (event.isTrusted) {
		const target = event.target;
		if (target.className == "collapser") {
			const collapsed = target.parentNode.getElementsByClassName("collapsible")[0];
			collapsed.parentNode.classList.toggle(CLASS_COLLAPSED);
			event.stopImmediatePropagation();
		}
	}
}

function onOpenCollapsibles(event) {
	if (event.isTrusted) {
		collapserElements.forEach(collapsed => collapsed.parentNode.classList.remove(CLASS_COLLAPSED));
	}
}

function onCloseCollapsibles(event) {
	if (event.isTrusted) {
		collapserElements.forEach(collapsed => collapsed.parentNode.classList.add(CLASS_COLLAPSED));
	}
}

function onViewSource(event) {
	if (event.isTrusted) {
		document.body.replaceWith(originalBody);
	}
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
	if (event.isTrusted) {
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