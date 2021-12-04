/* global chrome, fetch, chrome, document, Worker, localStorage */

const MENU_ID_COPY_PATH = "copy-path";
const MENU_ID_COPY_VALUE = "copy-value";
const MENU_ID_COPY_JSON_VALUE = "copy-json-value";

let extensionReady, copiedPath, copiedValue;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	onmessage(message, sender, sendResponse);
	return true;
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId == MENU_ID_COPY_PATH) {
		copyText(tab, copiedPath);
	}
	if (info.menuItemId == MENU_ID_COPY_VALUE) {
		copyText(tab, copiedValue);
	}
	if (info.menuItemId == MENU_ID_COPY_JSON_VALUE) {
		copyText(tab, JSON.stringify(copiedValue));
	}
});
init();

async function init() {
	extensionReady = migrateSettings();
	const settings = await getSettings();
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
	await refreshMenuEntry();
}

function copyText(tab, value) {
	if (typeof document != "undefined") {
		const command = "copy";
		document.addEventListener(command, listener);
		document.execCommand(command);
		document.removeEventListener(command, listener);
	} else {
		chrome.tabs.sendMessage(tab.id, { copy: true, value });
	}

	function listener(event) {
		event.clipboardData.setData("text/plain", value);
		event.preventDefault();
	}
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
	if (message.init) {
		sendResponse({ options: (await getSettings()).options || {} });
	}
	if (message.copyPropertyPath) {
		copiedPath = message.path;
		copiedValue = message.value;
	}
	if (message.jsonToHTML) {
		workerFormatter = new Worker("js/worker-formatter.js");
		workerFormatter.addEventListener("message", onWorkerFormatterMessage, false);
		workerFormatter.postMessage({ json: json, fnName: message.fnName });
	}

	function onWorkerJSONLintMessage(event) {
		const message = JSON.parse(event.data);
		workerJSONLint.removeEventListener("message", onWorkerJSONLintMessage, false);
		workerJSONLint.terminate();
		sendResponse({ error: message.error, loc: message.loc, offset: message.offset || 0 });
	}

	async function onWorkerFormatterMessage(event) {
		const message = event.data;
		workerFormatter.removeEventListener("message", onWorkerFormatterMessage, false);
		workerFormatter.terminate();
		if (message.html) {
			sendResponse({ html: message.html, theme: (await getSettings()).theme });
		}
		if (message.error) {
			workerJSONLint = new Worker("js/worker-JSONLint.js");
			workerJSONLint.addEventListener("message", onWorkerJSONLintMessage, false);
			workerJSONLint.postMessage(json);
		}
	}
}

async function refreshMenuEntry() {
	const settings = await getSettings();
	const options = (settings).options;
	chrome.contextMenus.removeAll();
	if (options.addContextMenu) {
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