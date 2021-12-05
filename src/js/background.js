/* global chrome, fetch, chrome, Worker, localStorage */

const MENU_ID_COPY_PATH = "copy-path";
const MENU_ID_COPY_VALUE = "copy-value";
const MENU_ID_COPY_JSON_VALUE = "copy-json-value";

let extensionReady, copiedPath, copiedValue;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	onMessage(message, sendResponse);
	return true;
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId == MENU_ID_COPY_PATH && copiedPath !== undefined) {
		copyText(tab, copiedPath);
	}
	if (info.menuItemId == MENU_ID_COPY_VALUE && copiedValue !== undefined) {
		copyText(tab, copiedValue);
	}
	if (info.menuItemId == MENU_ID_COPY_JSON_VALUE && copiedValue !== undefined) {
		copyText(tab, JSON.stringify(copiedValue));
	}
});
addMenuEntry(true);
init();

async function init() {
	extensionReady = migrateSettings();
	const settings = await getSettings();
	await initDefaultSettings(settings);
	await refreshMenuEntry();
}

async function initDefaultSettings(settings) {
	if (!settings.options) {
		settings.options = {};
	}
	if (settings.options && typeof settings.options.addContextMenu == "undefined") {
		settings.options.addContextMenu = true;
		await setSetting("options", settings.options);
	}
	if (!settings.theme) {
		const theme = await getDefaultTheme();
		await setSetting("theme", theme);
	}
}

function copyText(tab, value) {
	chrome.tabs.sendMessage(tab.id, { copyText: true, value });
}

async function migrateSettings() {
	const promises = [];
	if (typeof localStorage != "undefined") {
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
	}
	await Promise.all(promises);
}

async function onMessage(message, sendResponse) {
	const json = message.json;
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
	if (message.init) {
		sendResponse({ options: (await getSettings()).options || {} });
	}
	if (message.copyPropertyPath) {
		copiedPath = message.path;
		copiedValue = message.value;
	}
	if (message.jsonToHTML) {
		const result = await formatHTML(json, message.functionName, message.offset);
		if (result.html) {
			result.theme = (await getSettings()).theme;
		}
		sendResponse(result);
	}
}

function formatHTML(json, functionName, offset) {
	return new Promise(resolve => {
		const workerFormatter = new Worker("js/worker-formatter.js");
		let workerJSONLint;
		workerFormatter.addEventListener("message", onWorkerFormatterMessage, false);
		workerFormatter.postMessage({ json: json, functionName });

		function onWorkerFormatterMessage(event) {
			const message = event.data;
			workerFormatter.removeEventListener("message", onWorkerFormatterMessage, false);
			workerFormatter.terminate();
			if (message.html) {
				resolve({ html: message.html });
			}
			if (message.error) {
				workerJSONLint = new Worker("js/worker-JSONLint.js");
				workerJSONLint.addEventListener("message", onWorkerJSONLintMessage, false);
				workerJSONLint.postMessage(json);
			}
		}

		function onWorkerJSONLintMessage(event) {
			const message = JSON.parse(event.data);
			workerJSONLint.removeEventListener("message", onWorkerJSONLintMessage, false);
			workerJSONLint.terminate();
			resolve({ error: message.error, loc: message.loc, offset });
		}
	});
}

async function refreshMenuEntry() {
	const settings = await getSettings();
	const options = (settings).options;
	chrome.contextMenus.removeAll();
	if (options.addContextMenu) {
		addMenuEntry();
	}
}

function addMenuEntry(removeAll) {
	if (removeAll) {
		chrome.contextMenus.removeAll();
	}
	chrome.contextMenus.create({
		id: MENU_ID_COPY_PATH,
		title: "Copy path",
		contexts: ["page", "link"]
	});
	chrome.contextMenus.create({
		id: MENU_ID_COPY_VALUE,
		title: "Copy value",
		contexts: ["page", "link"]
	});
	chrome.contextMenus.create({
		id: MENU_ID_COPY_JSON_VALUE,
		title: "Copy JSON value",
		contexts: ["page", "link"]
	});
}

async function getDefaultTheme() {
	return (await fetch("css/jsonvue.css")).text();
}

async function getSettings() {
	await extensionReady;
	return new Promise(resolve => chrome.storage.local.get(["options", "theme"], result => resolve(result)));
}

async function setSetting(name, value) {
	await extensionReady;
	return new Promise(resolve => chrome.storage.local.set({ [name]: value }, result => resolve(result)));
}