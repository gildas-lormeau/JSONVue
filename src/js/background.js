/* global chrome, fetch, Worker, localStorage, importScripts, formatter, linter, TextEncoder, crypto */

const WORKER_API_AVAILABLE = typeof Worker != "undefined";
const LOCAL_STORAGE_API_AVAILABLE = typeof localStorage != "undefined";
const MENU_ID_COPY_PATH = "copy-path";
const MENU_ID_COPY_VALUE = "copy-value";
const MENU_ID_COPY_JSON_VALUE = "copy-json-value";
const DEFAULT_OPTIONS = {
	maxDepthLevelExpanded: 0,
	addContextMenu: true,
	jsonPrefix: "^\\)]}',|for\\s*\\(;;\\);|while\\s*(1);"
};
const LEGACY_STYLESHEET_HASH = "[217,103,31,97,255,43,250,60,65,196,134,101,148,173,69,129,51,72,223,43]";

if (!WORKER_API_AVAILABLE) {
	importScripts("/js/workers/formatter.js");
	importScripts("/js/workers/linter.js");
}

let extensionReady;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	onMessage(message).then(sendResponse);
	return true;
});
chrome.contextMenus.onClicked.addListener((info, tab) => chrome.tabs.sendMessage(tab.id, {
	copy: true,
	type: info.menuItemId
}));
addMenuEntry(true);
init();

async function init() {
	extensionReady = migrateSettings();
	await initDefaultSettings(await getSettings());
	await refreshMenuEntry();
}

async function migrateSettings() {
	const promises = [];
	if (LOCAL_STORAGE_API_AVAILABLE) {
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

async function initDefaultSettings(settings) {
	let optionsChanged;
	if (!settings.options) {
		settings.options = {};
		optionsChanged = true;
	}
	const options = settings.options;
	if (typeof options.maxDepthLevelExpanded == "undefined") {
		options.maxDepthLevelExpanded = DEFAULT_OPTIONS.maxDepthLevelExpanded;
		optionsChanged = true;
	}
	if (typeof options.addContextMenu == "undefined") {
		options.addContextMenu = DEFAULT_OPTIONS.addContextMenu;
		optionsChanged = true;
	}
	if (typeof options.jsonPrefix == "undefined") {
		options.jsonPrefix = DEFAULT_OPTIONS.jsonPrefix;
		optionsChanged = true;
	}
	if (optionsChanged) {
		await setSetting("options", options);
	}
	if (settings.theme) {
		const encoder = new TextEncoder();
		const hash = JSON.stringify(Array.from(new Uint8Array(await crypto.subtle.digest("SHA-1", encoder.encode(settings.theme)))));
		if (hash == LEGACY_STYLESHEET_HASH) {
			await setSetting("theme", await getDefaultTheme());
		}
	} else {
		await setSetting("theme", await getDefaultTheme());
	}
}

async function onMessage(message) {
	let result;
	if (message.getTheme) {
		result = (await getSettings()).theme;
	}
	if (message.getOptions) {
		result = (await getSettings()).options;
	}
	if (message.setSetting) {
		await setSetting(message.name, message.value);
	}
	if (message.jsonToHTML) {
		result = formatHTML(message.json, message.functionName, message.supportBigInt);
	}
	if (message.resetOptions) {
		await setSetting("options", DEFAULT_OPTIONS);
	}
	if (message.refreshMenuEntry) {
		await refreshMenuEntry();
	}
	return result || {};
}

async function formatHTML(json, functionName, supportBigInt) {
	const result = await Promise.all([formatHTMLAsync(json, functionName, supportBigInt), getContentStylesheet()]);
	result[0].stylesheet = result[1];
	return result[0];
}

async function formatHTMLAsync(json, functionName, supportBigInt) {
	if (WORKER_API_AVAILABLE) {
		const response = await executeWorker("js/workers/formatter.js", { json: json, functionName, supportBigInt });
		if (response.html) {
			return { html: response.html };
		}
		if (response.error) {
			const response = await executeWorker("js/workers/linter.js", json);
			return { error: response.error, loc: response.loc };
		}
	} else {
		try {
			return { html: formatter.format(json, functionName, supportBigInt) };
		} catch (error) {
			const response = linter.lint(json);
			return { error: response.error, loc: response.loc };
		}
	}
}

function executeWorker(path, message) {
	return new Promise((resolve, reject) => {
		const worker = new Worker(path);
		worker.addEventListener("message", onMessage, false);
		worker.addEventListener("error", onError, false);
		worker.postMessage(message);

		function onMessage(event) {
			worker.removeEventListener("message", onMessage, false);
			worker.removeEventListener("error", onError, false);
			worker.terminate();
			resolve(event.data);
		}

		function onError(event) {
			reject(event.detail.error);
		}
	});
}

async function refreshMenuEntry() {
	const settings = await getSettings();
	chrome.contextMenus.removeAll();
	if (settings.options.addContextMenu) {
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
		contexts: ["page", "selection", "link"]
	});
	chrome.contextMenus.create({
		id: MENU_ID_COPY_VALUE,
		title: "Copy value",
		contexts: ["page", "selection", "link"]
	});
	chrome.contextMenus.create({
		id: MENU_ID_COPY_JSON_VALUE,
		title: "Copy JSON value",
		contexts: ["page", "selection", "link"]
	});
}

async function getDefaultTheme() {
	return (await fetch("/css/jsonvue.css")).text();
}

async function getContentStylesheet() {
	return (await Promise.all([
		(await fetch("/css/jsonvue-error.css")).text(),
		(await fetch("/css/jsonvue-core.css")).text(),
		(await getSettings()).theme
	])).join("\n");
}

async function getSettings() {
	await extensionReady;
	return new Promise(resolve => chrome.storage.local.get(["options", "theme"], result => resolve(result)));
}

async function setSetting(name, value) {
	await extensionReady;
	return new Promise(resolve => chrome.storage.local.set({ [name]: value }, result => resolve(result)));
}