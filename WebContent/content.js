var port = chrome.extension.connect(), collapsers;

function displayError(error) {
	document.body.innerHTML += '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_error.css") + '">';
	errorBox = document.createElement("pre");
	closeBox = document.createElement("div");
	errorBox.className = "error";
	closeBox.className = "close-error";
	closeBox.onclick = function() {
		errorBox.parentElement.removeChild(errorBox);
	};
	errorBox.textContent = error;
	errorBox.appendChild(closeBox);
	setTimeout(function() {
		document.body.appendChild(errorBox);
		errorBox.style.pixelLeft = Math.max(0, Math.floor((window.innerWidth - errorBox.offsetWidth) / 2));
		errorBox.style.pixelTop = Math.max(0, Math.floor((window.innerHeight - errorBox.offsetHeight) / 2));
	}, 100);
}

function displayObject(json, fnName) {
	if (!json)
		return;
	port.postMessage({
		jsonToHTML : true,
		json : json,
		fnName : fnName
	});
}

function extractData(text) {
	var tokens;
	if ((text.charAt(0) == "{" || text.charAt(0) == "[") && (text.charAt(text.length - 1) == "}" || text.charAt(text.length - 1) == "]"))
		return {
			text : text
		};
	tokens = text.match(/^([^\s\(]*)\s*\(\s*([\[{].*[\]}])\s*\)(?:\s*;?)*\s*$/);
	if (tokens && tokens[1] && tokens[2])
		return {
			fnName : tokens[1],
			text : tokens[2]
		};
}

function processData(data, options) {
	var xhr;
	if (options.safeMethod) {
		xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
				data = extractData(this.responseText);
				if (data)
					displayObject(data.text, data.fnName);
			}
		};
		xhr.open("GET", document.location.href, true);
		xhr.send(null);
	} else if (data)
		displayObject(data.text, data.fnName);
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
	port.onMessage.addListener(function(msg) {
		var statusElement, toolboxElement, expandElement, reduceElement, viewSourceElement, optionsElement, content = "";
		if (msg.oninit)
			processData(data, msg.options);
		if (msg.onjsonToHTML)
			if (msg.html) {
				content += '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("jsonview-core.css") + '">';
				// content += '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("jsonview.css") + '">';
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
			} else if (msg.json)
				port.postMessage({
					getError : true,
					json : json,
					fnName : fnName
				});
		if (msg.ongetError) {
			displayError(msg.error);
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
		data = extractData(child.innerText.trim());
		if (data)
			init(data);
	}
}

load();
