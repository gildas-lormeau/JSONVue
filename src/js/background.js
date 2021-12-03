/* global document, chrome, fetch, localStorage, chrome, Worker, getSelection */

let copiedPath, copiedValue, copyPathMenuEntryId, copyValueMenuEntryId, options;

async function getDefaultTheme() {
	return (await fetch("css/jsonvue.css")).text();
}

function copy(value) {
	const selElement = document.createElement("span");
	const selRange = document.createRange();
	selElement.innerText = value;
	document.body.appendChild(selElement);
	selRange.selectNodeContents(selElement);
	const selection = getSelection();
	selection.removeAllRanges();
	selection.addRange(selRange);
	document.execCommand("Copy");
	document.body.removeChild(selElement);
}

function refreshMenuEntry() {
	const options = localStorage.options ? JSON.parse(localStorage.options) : {};
	if (options.addContextMenu && !copyPathMenuEntryId) {
		copyPathMenuEntryId = chrome.contextMenus.create({
			title: "Copy path",
			contexts: ["page", "link"],
			onclick: () => copy(copiedPath)
		});
		copyValueMenuEntryId = chrome.contextMenus.create({
			title: "Copy value",
			contexts: ["page", "link"],
			onclick: () => copy(copiedValue)
		});
	}
	if (!options.addContextMenu && copyPathMenuEntryId) {
		chrome.contextMenus.remove(copyPathMenuEntryId);
		chrome.contextMenus.remove(copyValueMenuEntryId);
		copyPathMenuEntryId = null;
	}
}

options = {};
if (localStorage.options)
	options = JSON.parse(localStorage.options);
if (typeof options.addContextMenu == "undefined") {
	options.addContextMenu = true;
	localStorage.options = JSON.stringify(options);
}

if (!localStorage.theme)
	getDefaultTheme().then(theme => {
		localStorage.theme = theme;
		refreshMenuEntry();
	});
else
	refreshMenuEntry();

chrome.runtime.onConnect.addListener(port => {
	port.onMessage.addListener(msg => {
		const json = msg.json;
		let workerFormatter, workerJSONLint;

		function onWorkerJSONLintMessage(event) {
			const message = JSON.parse(event.data);
			workerJSONLint.removeEventListener("message", onWorkerJSONLintMessage, false);
			workerJSONLint.terminate();
			port.postMessage({
				ongetError: true,
				error: message.error,
				loc: message.loc,
				offset: msg.offset
			});
		}

		function onWorkerFormatterMessage(event) {
			const message = event.data;
			workerFormatter.removeEventListener("message", onWorkerFormatterMessage, false);
			workerFormatter.terminate();
			if (message.html)
				port.postMessage({
					onjsonToHTML: true,
					html: message.html,
					theme: localStorage.theme
				});
			if (message.error) {
				workerJSONLint = new Worker("js/worker-JSONLint.js");
				workerJSONLint.addEventListener("message", onWorkerJSONLintMessage, false);
				workerJSONLint.postMessage(json);
			}
		}

		if (msg.init)
			port.postMessage({
				oninit: true,
				options: localStorage.options ? JSON.parse(localStorage.options) : {}
			});
		if (msg.copyPropertyPath) {
			copiedPath = msg.path;
			copiedValue = msg.value;
		}
		if (msg.jsonToHTML) {
			workerFormatter = new Worker("js/worker-formatter.js");
			workerFormatter.addEventListener("message", onWorkerFormatterMessage, false);
			workerFormatter.postMessage({
				json: json,
				fnName: msg.fnName
			});
		}
	});
});
chrome.runtime.onMessage.addListener(message => {
	if (message == "refreshMenuEntry")
		refreshMenuEntry();
});