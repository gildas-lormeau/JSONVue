function initOptions() {
	var bgPage = chrome.extension.getBackgroundPage(), options = localStorage.options ? JSON.parse(localStorage.options) : {};
	var safeMethodInput = document.getElementById("safeMethodInput");
	var injectInFrameInput = document.getElementById("injectInFrameInput");
	var addContextMenuInput = document.getElementById("addContextMenuInput");
	var formatDates = document.getElementById("formatDates");
	var formatMultilineStrings = document.getElementById("formatMultilineStrings");
	
	safeMethodInput.checked = options.safeMethod;
	injectInFrameInput.checked = options.injectInFrame;
	addContextMenuInput.checked = options.addContextMenu;
	formatDates.checked = options.formatDates;
	formatMultilineStrings.checked = options.formatMultilineStrings;
	
	safeMethodInput.addEventListener("change", function() {
		options.safeMethod = safeMethodInput.checked;
		localStorage.options = JSON.stringify(options);
	});
	injectInFrameInput.addEventListener("change", function() {
		options.injectInFrame = injectInFrameInput.checked;
		localStorage.options = JSON.stringify(options);
	});
	addContextMenuInput.addEventListener("change", function() {
		options.addContextMenu = addContextMenuInput.checked;
		localStorage.options = JSON.stringify(options);
		bgPage.refreshMenuEntry();
	});
	formatDates.addEventListener("change", function() {
		options.formatDates = formatDates.checked;
		localStorage.options = JSON.stringify(options);
	});
	formatMultilineStrings.addEventListener("change", function() {
		options.formatMultilineStrings = formatMultilineStrings.checked;
		localStorage.options = JSON.stringify(options);
	});
}

addEventListener("load", initOptions, false);
