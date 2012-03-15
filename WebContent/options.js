function initOptions() {
	var bgPage = chrome.extension.getBackgroundPage(), options = localStorage.options ? JSON.parse(localStorage.options) : {};
	var safeMethodInput = document.getElementById("safeMethodInput"), injectInFrameInput = document.getElementById("injectInFrameInput"), addMenuEntryInput = document
			.getElementById("addMenuEntryInput");
	safeMethodInput.checked = options.safeMethod;
	injectInFrameInput.checked = options.injectInFrame;
	addMenuEntryInput.checked = options.addMenuEntry;
	safeMethodInput.addEventListener("change", function() {
		options.safeMethod = safeMethodInput.checked;
		localStorage.options = JSON.stringify(options);
	});
	injectInFrameInput.addEventListener("change", function() {
		options.injectInFrame = injectInFrameInput.checked;
		localStorage.options = JSON.stringify(options);
	});
	addMenuEntryInput.addEventListener("change", function() {
		options.addMenuEntry = addMenuEntryInput.checked;
		if (options.addMenuEntry)
			bgPage.addMenuEntry();
		else
			bgPage.removeMenuEntry();
		localStorage.options = JSON.stringify(options);
	});
}
