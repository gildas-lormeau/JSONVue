/* global document, chrome, location */

chrome.runtime.sendMessage({ getSettings: true }, settings => {
	const options = settings.options;
	const injectInFrameInput = document.getElementById("injectInFrameInput");
	const addContextMenuInput = document.getElementById("addContextMenuInput");
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
	document.getElementById("open-editor").addEventListener("click", () => location.href = "css-editor.html", false);
});
