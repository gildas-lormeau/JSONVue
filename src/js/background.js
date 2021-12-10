/* global chrome, fetch, Worker, localStorage, importScripts, formatter, linter */

const WORKER_API_AVAILABLE = typeof Worker != "undefined";
const LOCAL_STORAGE_API_AVAILABLE = typeof localStorage != "undefined";
const MENU_ID_COPY_PATH = "copy-path";
const MENU_ID_COPY_VALUE = "copy-value";
const MENU_ID_COPY_JSON_VALUE = "copy-json-value";

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
	const settings = await getSettings();
	await initDefaultSettings(settings);
	await refreshMenuEntry();
}

async function initDefaultSettings(settings) {
	if (!settings.options) {
		settings.options = {};
	}
	if (typeof settings.options.maxDepthLevelExpanded == "undefined") {
		settings.options.maxDepthLevelExpanded = 0;
		await setSetting("options", settings.options);
	}
	if (typeof settings.options.addContextMenu == "undefined") {
		settings.options.addContextMenu = true;
		await setSetting("options", settings.options);
	}
	if (!settings.theme) {
		const theme = await getDefaultTheme();
		await setSetting("theme", theme);
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
	const json = message.json;
	if (message.setSetting) {
		await setSetting(message.name, message.value);
		return {};
	}
	if (message.getSettings) {
		const settings = await getSettings();
		return settings;
	}
	if (message.refreshMenuEntry) {
		await refreshMenuEntry();
		return {};
	}
	if (message.init) {
		return {
			options: (await getSettings()).options || {},
			theme: await getTheme()
		};
	}
	if (message.jsonToHTML) {
		const result = await formatHTML(json, message.functionName, message.offset);
		return result;
	}
}

async function formatHTML(json, functionName, offset) {
	if (WORKER_API_AVAILABLE) {
		const response = await executeWorker("js/workers/formatter.js", { json: json, functionName });
		if (response.html) {
			return { html: response.html };
		}
		if (response.error) {
			const message = await executeWorker("js/workers/linter.js", json);
			return { error: message.error, loc: message.loc, offset };
		}
	} else {
		try {
			const html = formatter.format(json, functionName);
			return { html };
		} catch (error) {
			const result = linter.lint(json);
			return { error: result.error, loc: result.loc, offset };
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
			worker.addEventListener("error", onError, false);
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
	return (await fetch("/css/jsonvue.css")).text();
}

async function getTheme() {
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