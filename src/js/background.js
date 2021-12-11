/* global chrome, fetch, Worker, localStorage, importScripts, formatter, linter */

const WORKER_API_AVAILABLE = typeof Worker != "undefined";
const LOCAL_STORAGE_API_AVAILABLE = typeof localStorage != "undefined";
const MENU_ID_COPY_PATH = "copy-path";
const MENU_ID_COPY_VALUE = "copy-value";
const MENU_ID_COPY_JSON_VALUE = "copy-json-value";
const DEFAULT_SETTINGS = {
	maxDepthLevelExpanded: 0,
	addContextMenu: true,
	jsonPrefix: "^\\)]}',|for\\s*\\(;;\\);|while\\s*(1);"
};

if (!WORKER_API_AVAILABLE) {
	importScripts("/js/workers/formatter.js");
	importScripts("/js/workers/linter.js");
}

let extensionReady;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	onMessage(message).then(sendResponse);
	return true;
});
chrome.contextMenus.onClicked.addListener((info, tab) => chrome.tabs.sendMessage(tab.id, { copy: true, type: info.menuItemId }));
addMenuEntry(true);
init();

async function init() {
	extensionReady = migrateSettings();
	await initDefaultSettings(await getSettings());
	await refreshMenuEntry();
}

async function initDefaultSettings(settings) {
	if (!settings.options) {
		settings.options = {};
		optionsChanged = true;
	}
	const options = settings.options;
	let optionsChanged;
	if (typeof options.maxDepthLevelExpanded == "undefined") {
		options.maxDepthLevelExpanded = DEFAULT_SETTINGS.maxDepthLevelExpanded;
		optionsChanged = true;
	}
	if (typeof options.addContextMenu == "undefined") {
		options.addContextMenu = DEFAULT_SETTINGS.addContextMenu;
		optionsChanged = true;
	}
	if (typeof options.jsonPrefix == "undefined") {
		options.jsonPrefix = DEFAULT_SETTINGS.jsonPrefix;
		optionsChanged = true;
	}
	if (optionsChanged) {
		await setSetting("options", options);
	}
	if (!settings.theme) {
		await setSetting("theme", await getDefaultTheme());
	}
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
		result = formatHTML(message.json, message.functionName);
	}
	if (message.resetOptions) {
		await setSetting("options", DEFAULT_SETTINGS);
	}
	if (message.refreshMenuEntry) {
		await refreshMenuEntry();
	}
	return result || {};
}

async function formatHTML(json, functionName) {
	const result = await Promise.all([formatHTMLAsync(json, functionName), getContentStylesheet()]);
	result[0].stylesheet = result[1];
	return result[0];
}

async function formatHTMLAsync(json, functionName) {
	if (WORKER_API_AVAILABLE) {
		const response = await executeWorker("js/workers/formatter.js", { json: json, functionName });
		if (response.html) {
			return { html: response.html };
		}
		if (response.error) {
			const response = await executeWorker("js/workers/linter.js", json);
			return { error: response.error, loc: response.loc };
		}
	} else {
		try {
			return { html: formatter.format(json, functionName) };
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