var port = chrome.extension.connect();

function displayObject(jsonText, fnName) {
	var parsedObject, errorBox, closeBox, worker;

	if (!jsonText)
		return;
	try {
		parsedObject = JSON.parse(jsonText);
	} catch (e) {
	}
	document.body.style.fontFamily = "monospace"; // chrome bug : does not work in external CSS stylesheet
	if (!parsedObject) {
		try {
			jsonlint.parse(jsonText);
		} catch (e) {
			document.body.innerHTML += '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content_error.css") + '">';
			errorBox = document.createElement("pre");
			closeBox = document.createElement("div");
			errorBox.className = "error";
			closeBox.className = "close-error";
			closeBox.onclick = function() {
				errorBox.parentElement.removeChild(errorBox);
			};
			errorBox.textContent = e;
			errorBox.appendChild(closeBox);
			setTimeout(function() {
				document.body.appendChild(errorBox);
				errorBox.style.pixelLeft = Math.max(0, Math.floor((window.innerWidth - errorBox.offsetWidth) / 2));
				errorBox.style.pixelTop = Math.max(0, Math.floor((window.innerHeight - errorBox.offsetHeight) / 2));
			}, 100);
		}
		return;
	}
	port.postMessage({
		jsonToHTML : true,
		parsedObject : parsedObject,
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

function init(data) {
	port.onMessage.addListener(function(msg) {
		if (msg.oninit)
			processData(data, msg.options);
		if (msg.onjsonToHTML) {
			document.body.innerHTML = '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content.css") + '">' + msg.data;
			document.body.addEventListener('click', function(event) {
				var ellipsis, collapsed, target = event.target;
				if (event.target.className == 'collapser') {
					collapsed = target.parentNode.getElementsByClassName('collapsible')[0];
					if (collapsed.style.display == 'none') {
						ellipsis = collapsed.parentNode.getElementsByClassName('ellipsis')[0];
						collapsed.parentNode.removeChild(ellipsis);
						collapsed.style.display = '';
					} else {
						collapsed.style.display = 'none';
						ellipsis = document.createElement('span');
						ellipsis.className = 'ellipsis';
						ellipsis.innerHTML = ' &hellip; ';
						collapsed.parentNode.insertBefore(ellipsis, collapsed);
					}
					target.innerHTML = (target.innerHTML == '-') ? '+' : '-';
				}
			}, false);
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
