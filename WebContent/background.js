var tabPorts = [];

function getDefaultTheme(callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4)
			callback(xhr.responseText);
	};
	xhr.open("GET", "jsonview.css", true);
	xhr.send(null);
}

chrome.contextMenus.create({
	title : "Copy path to clipboard",
	contexts : [ "all" ],
	onclick : function(info, tab) {
		if (tabPorts[tab.id])
			tabPorts[tab.id].postMessage({
				getPropertyPath : true
			});
	}
});

function init() {
	chrome.extension.onConnect.addListener(function(port) {
		if (!tabPorts[port.sender.tab.id]) {
			tabPorts[port.sender.tab.id] = port;
			port.onDisconnect.addListener(function(msg) {
				tabPorts[port.sender.tab.id] = null;
			});
		}
		port.onMessage.addListener(function(msg) {
			var workerFormatter, workerJSONLint, json = msg.json, selElement, selRange, selection;

			function onWorkerJSONLintMessage() {
				var message = JSON.parse(event.data);
				workerJSONLint.removeEventListener("message", onWorkerJSONLintMessage, false);
				workerJSONLint.terminate();
				port.postMessage({
					ongetError : true,
					error : message.error,
					loc : message.loc,
					offset : msg.offset
				});
			}

			function onWorkerFormatterMessage(event) {
				var message = event.data;
				workerFormatter.removeEventListener("message", onWorkerFormatterMessage, false);
				workerFormatter.terminate();
				if (message.html)
					port.postMessage({
						onjsonToHTML : true,
						html : message.html,
						theme : localStorage.theme
					});
				if (message.error) {
					workerJSONLint = new Worker("workerJSONLint.js");
					workerJSONLint.addEventListener("message", onWorkerJSONLintMessage, false);
					workerJSONLint.postMessage(json);
				}
			}

			if (msg.init)
				port.postMessage({
					oninit : true,
					options : localStorage.options ? JSON.parse(localStorage.options) : {}
				});
			if (msg.ongetPropertyPath) {
				selElement = document.createElement("span");
				selRange = document.createRange();
				selElement.innerText = msg.path;
				document.body.appendChild(selElement);
				selRange.selectNodeContents(selElement);
				selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(selRange);
				document.execCommand('Copy');
				document.body.removeChild(selElement);
			}
			if (msg.jsonToHTML) {
				workerFormatter = new Worker("workerFormatter.js");
				workerFormatter.addEventListener("message", onWorkerFormatterMessage, false);
				workerFormatter.postMessage({
					json : json,
					fnName : msg.fnName
				});
			}
		});
	});
}

if (!localStorage.theme)
	getDefaultTheme(function(theme) {
		localStorage.theme = theme;
		init();
	});
else
	init();
