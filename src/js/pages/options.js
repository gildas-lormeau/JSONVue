/* global document, chrome, open */

const injectInFrameInput = document.getElementById("injectInFrameInput");
const supportBigIntInput = document.getElementById("supportBigIntInput");
const addContextMenuInput = document.getElementById("addContextMenuInput");
const maxDepthLevelExpandedInput = document.getElementById("maxDepthLevelExpandedInput");
const jsonPrefixInput = document.getElementById("jsonPrefixInput");
document.getElementById("openEditorButton").addEventListener("click", event => {
	open("css-editor.html", "jsonvue-css-editor");
	event.stopPropagation();
}, false);
document.getElementById("resetButton").addEventListener("click", event => {
	chrome.runtime.sendMessage({ resetOptions: true }, init);
	event.stopPropagation();
}, false);
init();

function init() {
	chrome.runtime.sendMessage({ getOptions: true }, options => {
		injectInFrameInput.checked = options.injectInFrame;
		supportBigIntInput.checked = options.supportBigInt;
		addContextMenuInput.checked = options.addContextMenu;
		maxDepthLevelExpandedInput.valueAsNumber = options.maxDepthLevelExpanded;
		jsonPrefixInput.value = options.jsonPrefix;
		injectInFrameInput.onchange = () => {
			options.injectInFrame = injectInFrameInput.checked;
			chrome.runtime.sendMessage({ setSetting: true, name: "options", value: options });
		};
		supportBigIntInput.onchange = () => {
			options.supportBigInt = supportBigIntInput.checked;
			chrome.runtime.sendMessage({ setSetting: true, name: "options", value: options });
		};
		addContextMenuInput.onchange = () => {
			options.addContextMenu = addContextMenuInput.checked;
			chrome.runtime.sendMessage({ setSetting: true, refreshMenuEntry: true, name: "options", value: options });
		};
		maxDepthLevelExpandedInput.onchange = () => {
			options.maxDepthLevelExpanded = maxDepthLevelExpandedInput.valueAsNumber;
			chrome.runtime.sendMessage({ setSetting: true, name: "options", value: options });
		};
		jsonPrefixInput.onchange = () => {
			options.jsonPrefix = jsonPrefixInput.value;
			chrome.runtime.sendMessage({ setSetting: true, name: "options", value: options });
		};
	});
}