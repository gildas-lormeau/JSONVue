/* global document, chrome, fetch, chrome, Worker, getSelection, localStorage */

let extensionReady, copiedPath, copiedValue, copyPathMenuEntryId, copyValueMenuEntryId, settings;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	onmessage(message, sender, sendResponse);
	return true;
});
init();

async function init() {
	extensionReady = migrateSettings();
	settings = await getSettings();
	if (settings.options && typeof settings.options.addContextMenu == "undefined") {
		settings.options.addContextMenu = true;
		await setSetting("options", settings.options);
	}
	if (!settings.theme) {
		const theme = await getDefaultTheme();
		await setSetting("theme", theme);
		await refreshMenuEntry();
	} else {
		await refreshMenuEntry();
	}
}

async function migrateSettings() {
	const promises = [];
	if (localStorage.options) {
		promises.push(new Promise(resolve => {
			chrome.storage.local.set({ options: JSON.parse(localStorage.options) }, () => resolve());
			delete localStorage.options;
		}));
	}
	if (localStorage.theme) {
		promises.push(new Promise(resolve => {
			chrome.storage.local.set({ theme: localStorage.theme }, () => resolve());
			delete localStorage.theme;
		}));
	}
	await Promise.all(promises);
}

async function onmessage(message, sender, sendResponse) {
	const json = message.json;
	let workerFormatter, workerJSONLint;
	if (message.setSetting) {
		await setSetting(message.name, message.value);
	}
	if (message.getSettings) {
		const settings = await getSettings();
		sendResponse(settings);
	}
	if (message.refreshMenuEntry) {
		await refreshMenuEntry();
	}
	if (message.init)
		sendResponse({
			options: (await getSettings()).options || {}
		});
	if (message.copyPropertyPath) {
		copiedPath = message.path;
		copiedValue = message.value;
	}
	if (message.jsonToHTML) {
		workerFormatter = new Worker("js/worker-formatter.js");
		workerFormatter.addEventListener("message", onWorkerFormatterMessage, false);
		workerFormatter.postMessage({
			json: json,
			fnName: message.fnName
		});
	}

	function onWorkerJSONLintMessage(event) {
		const message = JSON.parse(event.data);
		workerJSONLint.removeEventListener("message", onWorkerJSONLintMessage, false);
		workerJSONLint.terminate();
		sendResponse({
			error: message.error,
			loc: message.loc,
			offset: message.offset || 0
		});
	}

	async function onWorkerFormatterMessage(event) {
		const message = event.data;
		workerFormatter.removeEventListener("message", onWorkerFormatterMessage, false);
		workerFormatter.terminate();
		if (message.html)
			sendResponse({
				html: message.html,
				theme: (await getSettings()).theme
			});
		if (message.error) {
			workerJSONLint = new Worker("js/worker-JSONLint.js");
			workerJSONLint.addEventListener("message", onWorkerJSONLintMessage, false);
			workerJSONLint.postMessage(json);
		}
	}
}

async function refreshMenuEntry() {
	const options = (await getSettings()).options;
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

async function getSettings() {
	await extensionReady;
	return new Promise(resolve => chrome.storage.local.get(["options", "theme"], result => resolve(result)));
}

async function setSetting(name, value) {
	await extensionReady;
	return new Promise(resolve => chrome.storage.local.set({ [name]: value }, result => resolve(result)));
}