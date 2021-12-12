/* global document, chrome, fetch, setTimeout, clearTimeout, CodeMirror */

const SAMPLE_PART1 = "<!doctype html><html><head><meta charset=\"UTF-8\"></head><body><link rel=\"stylesheet\" type=\"text/css\" href=\"css/jsonvue-core.css\"><link rel=\"stylesheet\" type=\"text/css\" href=\"css/css-editor-core.css\"><style>";
const SAMPLE_PART2 = "</style><div id=\"json\"><div class=\"collapser\"></div>{<span class=\"ellipsis\"></span><ul class=\"obj collapsible\"><li><div class=\"hoverable\"><span class=\"property\">hey</span>: <span class=\"type-string\">\"guy\"</span>,</div></li><li><div class=\"hoverable\"><span class=\"property\">anumber</span>: <span class=\"type-number\">243</span>,</div></li><li><div class=\"hoverable\"><span class=\"property\">anobject</span>: <div class=\"collapser\"></div>{<span class=\"ellipsis\"></span><ul class=\"obj collapsible\"><li><div class=\"hoverable\"><span class=\"property\">whoa</span>: <span class=\"type-string\">\"nuts\"</span>,</div></li><li><div class=\"hoverable collapsed\"><span class=\"property\">anarray</span>: <div class=\"collapser\"></div>[<span class=\"ellipsis\"></span><ul class=\"array collapsible\"><li><div class=\"hoverable\"><span class=\"type-number\">1</span>,</div></li><li><div class=\"hoverable\"><span class=\"type-number\">2</span>,</div></li><li><div class=\"hoverable\"><span class=\"type-string\">\"thr&lt;h1&gt;ee\"</span></div></li></ul>],</div></li><li><div class=\"hoverable hovered\"><span class=\"property\">more</span>: <span class=\"type-string\">\"stuff\"</span></div></li></ul>},</div></li><li><div class=\"hoverable\"><span class=\"property\">awesome</span>: <span class=\"type-boolean\">true</span>,</div></li><li><div class=\"hoverable\"><span class=\"property\">bogus</span>: <span class=\"type-boolean\">false</span>,</div></li><li><div class=\"hoverable\"><span class=\"property\">meaning</span>: <span class=\"type-null\">null</span>,</div></li><li><div class=\"hoverable\"><span class=\"property\">link</span>: <span class=\"type-string\">\"</span><a href=\"#\">https://www.example.com</a><span class=\"type-string\">\"</span>,</div></li><li><div class=\"hoverable selected\"><span class=\"property\">notLink</span>: <span class=\"type-string\">\"https://www.example.com is great\"</span></div></li></ul>}</div></body></html>";
const PASSIVE_KEYS = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "End", "Home", "PageDown", "PageUp", "ControlLeft", "ControlRight", "AltLeft", "ShiftLeft", "ShiftRight", "Insert"];

const editor = document.getElementById("editor");
const resetButton = document.getElementById("reset-button");
const saveButton = document.getElementById("save-button");
const previewer = document.getElementById("previewer").contentWindow;

let timeoutOnKey;
const codemirror = CodeMirror.fromTextArea(editor);
codemirror.on("keyup", onKeyUpEditor);
resetButton.addEventListener("click", resetTheme, false);
saveButton.addEventListener("click", () => chrome.runtime.sendMessage({ setSetting: true, name: "theme", value: codemirror.getValue() }), false);
chrome.runtime.sendMessage({ getTheme: true }, init);

function init(theme) {
	codemirror.setValue(theme);
	updatePreview();
}

async function resetTheme() {
	codemirror.setValue(await (await fetch("css/jsonvue.css")).text());
	updatePreview();
}

function onKeyUpEditor(editor, event) {
	if (PASSIVE_KEYS.indexOf(event.code) == -1) {
		if (timeoutOnKey) {
			clearTimeout(timeoutOnKey);
		}
		timeoutOnKey = setTimeout(updatePreview, 500);
	}
}

function updatePreview() {
	previewer.document.open();
	previewer.document.write(SAMPLE_PART1);
	previewer.document.write(codemirror.getValue());
	previewer.document.write(SAMPLE_PART2);
	previewer.document.close();
}