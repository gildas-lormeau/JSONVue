/* global document, chrome, localStorage, addEventListener, location */

function initOptions() {
	const options = localStorage.options ? JSON.parse(localStorage.options) : {};
	const injectInFrameInput = document.getElementById("injectInFrameInput");
	const addContextMenuInput = document.getElementById("addContextMenuInput");
	injectInFrameInput.checked = options.injectInFrame;
	addContextMenuInput.checked = options.addContextMenu;
	injectInFrameInput.addEventListener("change", () => {
		options.injectInFrame = injectInFrameInput.checked;
		localStorage.options = JSON.stringify(options);
	});
	addContextMenuInput.addEventListener("change", () => {
		options.addContextMenu = addContextMenuInput.checked;
		localStorage.options = JSON.stringify(options);
		chrome.runtime.sendMessage("refreshMenuEntry");
	});
	document.getElementById("open-editor").addEventListener("click", () => location.href = "css-editor.html", false);
}

addEventListener("load", initOptions, false);
