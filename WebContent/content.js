function JSONFormatter() {
}
JSONFormatter.prototype = {
	htmlEncode : function(t) {
		return t != null ? t.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';
	},

	decorateWithSpan : function(value, className) {
		return '<span class="' + className + '">' + this.htmlEncode(value) + '</span>';
	},

	valueToHTML : function(value) {
		var valueType = typeof value, output = "";
		if (value == null) {
			output += this.decorateWithSpan('null', 'null');
		} else if (value && value.constructor == Array) {
			output += this.arrayToHTML(value);
		} else if (valueType == 'object') {
			output += this.objectToHTML(value);
		} else if (valueType == 'number') {
			output += this.decorateWithSpan(value, 'num');
		} else if (valueType == 'string') {
			if (/^(http|https):\/\/[^\s]+$/.test(value)) {
				output += this.decorateWithSpan('"', 'string') + '<a href="' + value + '">' + this.htmlEncode(value) + '</a>'
						+ this.decorateWithSpan('"', 'string');
			} else {
				output += this.decorateWithSpan('"' + value + '"', 'string');
			}
		} else if (valueType == 'boolean') {
			output += this.decorateWithSpan(value, 'bool');
		}

		return output;
	},

	arrayToHTML : function(json) {
		var prop, output = '[<ul class="array collapsible">', hasContents = false;
		for (prop in json) {
			hasContents = true;
			output += '<li>';
			output += this.valueToHTML(json[prop]);
			output += '</li>';
		}
		output += '</ul>]';

		if (!hasContents) {
			output = "[ ]";
		}

		return output;
	},

	objectToHTML : function(json) {
		var prop, output = '{<ul class="obj collapsible">', hasContents = false;
		for (prop in json) {
			hasContents = true;
			output += '<li>';
			output += '<span class="prop">' + this.htmlEncode(prop) + '</span>: ';
			output += this.valueToHTML(json[prop]);
			output += '</li>';
		}
		output += '</ul>}';

		if (!hasContents) {
			output = "{ }";
		}

		return output;
	},

	jsonToHTML : function(json, fnName) {
		var output = '';
		if (fnName)
			output += '<div class="fn">' + fnName + '(</div>';
		output += '<div id="json">';
		output += this.valueToHTML(json);
		output += '</div>';
		if (fnName)
			output += '<div class="fn">)</div>';
		return output;
	}
};

/**
 * Click handler for collapsing and expanding objects and arrays
 * 
 * @param {Event} evt
 */
function collapse(evt) {
	var ellipsis, collapser = evt.target, target = collapser.parentNode.getElementsByClassName('collapsible')[0];
	if (!target)
		return;

	if (target.style.display == 'none') {
		ellipsis = target.parentNode.getElementsByClassName('ellipsis')[0];
		target.parentNode.removeChild(ellipsis);
		target.style.display = '';
	} else {
		target.style.display = 'none';
		ellipsis = document.createElement('span');
		ellipsis.className = 'ellipsis';
		ellipsis.innerHTML = ' &hellip; ';
		target.parentNode.insertBefore(ellipsis, target);
	}
	collapser.innerHTML = (collapser.innerHTML == '-') ? '+' : '-';
}

function displayObject(jsonText, fnName) {
	var parsedObject, errorBox, closeBox;
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
	document.body.innerHTML = '<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL("content.css") + '">'
			+ new JSONFormatter().jsonToHTML(parsedObject, fnName);
	Array.prototype.forEach.call(document.getElementsByClassName('collapsible'), function(childItem) {
		var collapser, item = childItem.parentNode;
		if (item.nodeName == 'LI') {
			collapser = document.createElement('div');
			collapser.className = 'collapser';
			collapser.innerHTML = '-';
			collapser.addEventListener('click', collapse, false);
			item.insertBefore(collapser, item.firstChild);
		}
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
	var port = chrome.extension.connect();
	port.onMessage.addListener(function(msg) {
		if (msg.init)
			processData(data, msg.options);
	});
	port.postMessage({
		init : true
	});
}

function load() {
	var child, data;
	if (document.body && document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0) {
		child = document.body.children.length ? document.body.childNodes[0] : document.body;
		data = extractData(child.innerText.trim());
		if (data)
			init(data);
	}
}

load();