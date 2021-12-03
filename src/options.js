/* global document, chrome, localStorage, addEventListener, location */

function initOptions() {
	const options = localStorage.options ? JSON.parse(localStorage.options) : {};
	const safeMethodInput = document.getElementById("safeMethodInput");
	const injectInFrameInput = document.getElementById("injectInFrameInput");
	const addContextMenuInput = document.getElementById("addContextMenuInput");
	safeMethodInput.checked = options.safeMethod;
	injectInFrameInput.checked = options.injectInFrame;
	addContextMenuInput.checked = options.addContextMenu;
	safeMethodInput.addEventListener("change", () => {
		options.safeMethod = safeMethodInput.checked;
		localStorage.options = JSON.stringify(options);
	});
	injectInFrameInput.addEventListener("change", () => {
		options.injectInFrame = injectInFrameInput.checked;
		localStorage.options = JSON.stringify(options);
	});
	addContextMenuInput.addEventListener("change", () => {
		options.addContextMenu = addContextMenuInput.checked;
		localStorage.options = JSON.stringify(options);
		chrome.runtime.sendMessage("refreshMenuEntry");
	});
	document.getElementById("open-editor").addEventListener("click", location.href = "csseditor.html", false);
}

addEventListener("load", initOptions, false);
