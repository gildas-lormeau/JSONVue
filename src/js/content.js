/* global navigator, window, document, chrome, location, history, top */

let collapsers, jsonObject, jsonSelector, selectedLI, originalBody;
chrome.runtime.onMessage.addListener(message => {
	if (message.copy) {
		copy(message.value);
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
		} catch (e) {
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
	let startRange = 0, indexRange = 0, endRange;
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
	endRange = ranges[loc.last_line - 1] + loc.last_column + offset;
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
	baseStyleElement.rel = "stylesheet";
	baseStyleElement.type = "text/css";
	baseStyleElement.href = chrome.runtime.getURL("css/jsonvue-core.css");
	document.head.appendChild(baseStyleElement);
	const userStyleElement = document.createElement("style");
	userStyleElement.appendChild(document.createTextNode(theme));
	document.head.appendChild(userStyleElement);
	document.body.innerHTML = html;
	collapsers = document.querySelectorAll("#json .collapsible .collapsible");
	const statusElement = document.createElement("div");
	statusElement.className = "status";
	const copyPathElement = document.createElement("div");
	copyPathElement.className = "copy-path";
	statusElement.appendChild(copyPathElement);
	document.body.appendChild(statusElement);
	const toolboxElement = document.createElement("div");
	toolboxElement.className = "toolbox";
	const expandElement = document.createElement("span");
	expandElement.title = "expand all";
	expandElement.innerText = "+";
	const viewSourceElement = document.createElement("a");
	viewSourceElement.title = "view source";
	viewSourceElement.innerText = "view source";
	const reduceElement = document.createElement("span");
	reduceElement.title = "reduce all";
	reduceElement.innerText = "-";
	toolboxElement.appendChild(expandElement);
	toolboxElement.appendChild(viewSourceElement);
	toolboxElement.appendChild(reduceElement);
	document.body.appendChild(toolboxElement);
	document.body.addEventListener("click", ontoggle, false);
	document.body.addEventListener("mouseover", onmouseMove, false);
	document.body.addEventListener("click", onmouseClick, false);
	document.body.addEventListener("contextmenu", onContextMenu, false);
	expandElement.addEventListener("click", onexpand, false);
	viewSourceElement.addEventListener("click", onviewsource, false);
	reduceElement.addEventListener("click", onreduce, false);
	copyPathElement.addEventListener("click", event => {
		if (event.isTrusted) {
			chrome.runtime.sendMessage({
				copyPropertyPath: true,
				path: statusElement.innerText
			});
		}
	}, false);
}

function ontoggle(event) {
	const target = event.target;
	if (event.target.className == "collapser") {
		const collapsed = target.parentNode.getElementsByClassName("collapsible")[0];
		if (collapsed.parentNode.classList.contains("collapsed")) {
			collapsed.parentNode.classList.remove("collapsed");
		} else {
			collapsed.parentNode.classList.add("collapsed");
		}
	}
}

function onexpand() {
	collapsers.forEach(collapsed => {
		if (collapsed.parentNode.classList.contains("collapsed")) {
			collapsed.parentNode.classList.remove("collapsed");
		}
	});
}

function onreduce() {
	collapsers.forEach(collapsed => {
		if (!collapsed.parentNode.classList.contains("collapsed")) {
			collapsed.parentNode.classList.add("collapsed");
		}
	});
}

function onviewsource() {
	document.body.replaceWith(originalBody);
}

function getParentLI(element) {
	if (element.tagName != "LI") {
		while (element && element.tagName != "LI") {
			element = element.parentNode;
		}
	}
	if (element && element.tagName == "LI") {
		return element;
	}
}

const onmouseMove = (() => {
	let hoveredLI;
	return event => {
		if (event.isTrusted) {
			const statusElement = document.querySelector(".status");
			let str = "";
			let element = getParentLI(event.target);
			if (element) {
				jsonSelector = [];
				if (hoveredLI) {
					hoveredLI.firstChild.classList.remove("hovered");
				}
				hoveredLI = element;
				element.firstChild.classList.add("hovered");
				do {
					if (element.parentNode.classList.contains("array")) {
						const index = [].indexOf.call(element.parentNode.children, element);
						str = "[" + index + "]" + str;
						jsonSelector.unshift(index);
					}
					if (element.parentNode.classList.contains("obj")) {
						const key = element.firstChild.firstChild.innerText;
						str = "." + key + str;
						jsonSelector.unshift(key);
					}
					element = element.parentNode.parentNode.parentNode;
				} while (element.tagName == "LI");
				if (str.charAt(0) == ".") {
					str = str.substring(1);
				}
				statusElement.innerText = str;
				return;
			}
			onmouseOut();
		}
	};

	function onmouseOut() {
		const statusElement = document.querySelector(".status");
		if (hoveredLI) {
			hoveredLI.firstChild.classList.remove("hovered");
			hoveredLI = null;
			statusElement.innerText = "";
			jsonSelector = [];
		}
	}
})();

function onmouseClick(event) {
	if (selectedLI) {
		selectedLI.firstChild.classList.remove("selected");
	}
	selectedLI = getParentLI(event.target);
	if (selectedLI) {
		selectedLI.firstChild.classList.add("selected");
	}
}

function onContextMenu(event) {
	if (event.isTrusted) {
		const currentLI = getParentLI(event.target);
		const statusElement = document.querySelector(".status");
		if (currentLI) {
			let value = jsonObject;
			jsonSelector.forEach(propertyName => value = value[propertyName]);
			chrome.runtime.sendMessage({
				copyPropertyPath: true,
				path: statusElement.innerText,
				value: typeof value == "object" ? JSON.stringify(value) : value
			});
		} else {
			chrome.runtime.sendMessage({
				copyPropertyPath: true,
				path: "",
				value: typeof jsonObject == "object" ? JSON.stringify(jsonObject) : jsonObject
			});
		}
	}
}

function copy(value) {
	return navigator.clipboard.writeText(value);
}