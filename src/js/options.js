/* global document, chrome, open */

const injectInFrameInput = document.getElementById("injectInFrameInput");
const addContextMenuInput = document.getElementById("addContextMenuInput");
document.getElementById("openEditorButton").addEventListener("click", event => {
	open("css-editor.html", "jsonvue-css-editor");
	event.stopPropagation();
}, false);

chrome.runtime.sendMessage({ getSettings: true }, settings => {
	const options = settings.options;
	injectInFrameInput.checked = options.injectInFrame;
	addContextMenuInput.checked = options.addContextMenu;
	injectInFrameInput.addEventListener("change", () => {
		options.injectInFrame = injectInFrameInput.checked;
		chrome.runtime.sendMessage({ setSetting: true, name: "options", value: options });
	});
	addContextMenuInput.addEventListener("change", () => {
		options.addContextMenu = addContextMenuInput.checked;
		chrome.runtime.sendMessage({ setSetting: true, refreshMenuEntry: true, name: "options", value: options });
	});
});
