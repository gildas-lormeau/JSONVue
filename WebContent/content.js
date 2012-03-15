var port = chrome.extension.connect(), collapsers;

function displayError(error, loc, offset) {
	var link = document.createElement("link"), pre = document.body.firstChild.firstChild, text = pre.textContent.substring(offset), start = 0, ranges = [], idx = 0, end, range = document
			.createRange(), imgError = document.createElement("img"), content = document.createElement("div"), errorPosition = document.createElement("span"), container = document
			.createElement("div"), closeButton = document.createElement("div");
	link.rel = "stylesheet";
	link.type = "text/css";
	link.href = chrome.extension.getURL("content_error.css");
	document.head.appendChild(link);
	while (idx != -1) {
		idx = text.indexOf("\n", start);
		ranges.push(start);
		start = idx + 1;
	}
	start = ranges[loc.first_line - 1] + loc.first_column + offset;
	end = ranges[loc.last_line - 1] + loc.last_column + offset;
	range.setStart(pre, start);
	if (start == end - 1)
		range.setEnd(pre, start);
	else
		range.setEnd(pre, end);
	errorPosition.className = "error-position";
	errorPosition.id = "error-position";
	range.surroundContents(errorPosition);
	imgError.src = "error.gif";
	errorPosition.insertBefore(imgError, errorPosition.firstChild);
	content.className = "content";
	closeButton.className = "close-error";
	closeButton.onclick = function() {
		content.parentElement.removeChild(content);
	};
	content.textContent = error;
	content.appendChild(closeButton);
	container.className = "container";
	container.appendChild(content);
	errorPosition.parentNode.insertBefore(container, errorPosition.nextSibling);
	location.hash = "error-position";
	history.replaceState({}, "", "#");
}

function displayObject(json, fnName, offset) {
	if (!json)
		return;
	port.postMessage({
		jsonToHTML : true,
		json : json,
		fnName : fnName,
		offset : offset
	});
}

function extractData(rawText) {
	var tokens, text = rawText.trim();

	function test(text) {
		return ((text.charAt(0) == "[" && text.charAt(text.length - 1) == "]") || (text.charAt(0) == "{" && text.charAt(text.length - 1) == "}"));
	}

	if (test(text))
		return {
			text : rawText,
			offset : 0
		};
	tokens = text.match(/^([^\s\(]*)\s*\(([\s\S]*)\)\s*;?$/);
	if (tokens && tokens[1] && tokens[2]) {
		if (test(tokens[2].trim()))
			return {
				fnName : tokens[1],
				text : tokens[2],
				offset : rawText.indexOf(tokens[2])
			};
	}
}

function processData(data, options) {
	var xhr;
	if (window == top || options.injectInFrame)
		if (options.safeMethod) {
			xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (this.readyState == 4) {
					data = extractData(this.responseText);
					if (data)
						displayObject(data.text, data.fnName, data.offset);
				}
			};
			xhr.open("GET", document.location.href, true);
			xhr.send(null);
		} else if (data)
			displayObject(data.text, data.fnName, data.offset);
}

function ontoggle(event) {
	var collapsed, target = event.target;
	if (event.target.className == 'collapser') {
		collapsed = target.parentNode.getElementsByClassName('collapsible')[0];
		if (collapsed.parentNode.classList.contains("collapsed"))
			collapsed.parentNode.classList.remove("collapsed");
		else
			collapsed.parentNode.classList.add("collapsed");
	}
}

function onexpand() {
	Array.prototype.forEach.call(collapsers, function(collapsed) {
		if (collapsed.parentNode.classList.contains("collapsed"))
			collapsed.parentNode.classList.remove("collapsed");
	});
}

function onreduce() {
	Array.prototype.forEach.call(collapsers, function(collapsed) {
		if (!collapsed.parentNode.classList.contains("collapsed"))
			collapsed.parentNode.classList.add("collapsed");
	});
}

var onmouseMove = (function() {
	var lastLI;

	function onmouseOut() {
		var statusElement = document.querySelector(".status");
		if (lastLI) {
			lastLI.firstChild.classList.remove("hovered");
			lastLI = null;
			statusElement.innerText = "";
		}
	}

	return function(event) {
		var target = event.target, element = target, str = "", statusElement = document.querySelector(".status");
		if (element.tagName != "LI") {
			while (element && element.tagName != "LI")
				element = element.parentNode;
			if (element && element.tagName == 'LI') {
				if (lastLI && element != lastLI)
					lastLI.firstChild.classList.remove("hovered");
				element.firstChild.classList.add("hovered");
				lastLI = element;
				do {
					if (element.parentNode.classList.contains("array")) {
						var index = [].indexOf.call(element.parentNode.children, element);
						str = "[" + index + "]" + str;
					}
					if (element.parentNode.classList.contains("obj")) {
						str = "." + element.firstChild.firstChild.innerText + str;
					}
					element = element.parentNode.parentNode.parentNode;
				} while (element.tagName == "LI");
				if (str.charAt(0) == '.')
					str = str.substring(1);
				statusElement.innerText = str;
				return;
			}
		}
		onmouseOut();
	};
})();

function init(data) {
	var propertyPath = "";

	port.onMessage.addListener(function(msg) {
		var statusElement, toolboxElement, expandElement, reduceElement, viewSourceElement, optionsElement, content = "";
		if (msg.oninit)
			processData(data, msg.options);
		if (msg.getPropertyPath)
			port.postMessage({
				ongetPropertyPath : true,
				path : propertyPath
			});
		if (msg.onjsonToHTML)
			if (msg.html) {
				content += '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("jsonview-core.css") + '">';
				content += "<style>" + msg.theme + "</style>";
				content += msg.html;
				document.body.innerHTML = content;
				collapsers = document.querySelectorAll("#json .collapsible .collapsible");
				statusElement = document.createElement("div");
				statusElement.className = "status";
				document.body.appendChild(statusElement);
				toolboxElement = document.createElement("div");
				toolboxElement.className = "toolbox";
				expandElement = document.createElement("span");
				expandElement.title = "expand all";
				expandElement.innerText = "+";
				reduceElement = document.createElement("span");
				reduceElement.title = "reduce all";
				reduceElement.innerText = "-";
				viewSourceElement = document.createElement("a");
				viewSourceElement.innerText = "View source";
				viewSourceElement.target = "_blank";
				viewSourceElement.href = "view-source:" + location.href;
				optionsElement = document.createElement("img");
				optionsElement.title = "options";
				optionsElement.src = chrome.extension.getURL("options.png");
				toolboxElement.appendChild(expandElement);
				toolboxElement.appendChild(reduceElement);
				toolboxElement.appendChild(viewSourceElement);
				toolboxElement.appendChild(optionsElement);
				document.body.appendChild(toolboxElement);
				document.body.addEventListener('click', ontoggle, false);
				document.body.addEventListener('mouseover', onmouseMove, false);
				expandElement.addEventListener('click', onexpand, false);
				reduceElement.addEventListener('click', onreduce, false);
				optionsElement.addEventListener("click", function() {
					window.open(chrome.extension.getURL("options.html"));
				}, false);
				document.body.addEventListener("contextmenu", function() {
					propertyPath = statusElement.innerText;
				}, true);
			} else if (msg.json)
				port.postMessage({
					getError : true,
					json : json,
					fnName : fnName
				});
		if (msg.ongetError) {
			displayError(msg.error, msg.loc, msg.offset);
		}
	});
	port.postMessage({
		init : true
	});
}

function load() {
	var child, data;
	if (document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0)) {
		child = document.body.children.length ? document.body.childNodes[0] : document.body;
		data = extractData(child.innerText);
		if (data)
			init(data);
	}
}

load();
