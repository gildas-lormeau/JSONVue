(function() {

	var SAMPLE_PART1 = '<!doctype html><html><head><meta charset="UTF-8"></head><body><link rel="stylesheet" type="text/css" href="jsonview-core.css"><style>';
	var SAMPLE_PART2 = '</style><div id="json"><div class="collapser"></div>{<span class="ellipsis"></span><ul class="obj collapsible"><li><div class="hoverable"><span class="property">hey</span>: <span class="type-string">"guy"</span>,</div></li><li><div class="hoverable"><span class="property">anumber</span>: <span class="type-number">243</span>,</div></li><li><div class="hoverable"><span class="property">anobject</span>: <div class="collapser"></div>{<span class="ellipsis"></span><ul class="obj collapsible"><li><div class="hoverable"><span class="property">whoa</span>: <span class="type-string">"nuts"</span>,</div></li><li><div class="hoverable collapsed"><span class="property">anarray</span>: <div class="collapser"></div>[<span class="ellipsis"></span><ul class="array collapsible"><li><div class="hoverable"><span class="type-number">1</span>,</div></li><li><div class="hoverable"><span class="type-number">2</span>,</div></li><li><div class="hoverable"><span class="type-string">"thr&lt;h1&gt;ee"</span></div></li></ul>],</div></li><li><div class="hoverable hovered"><span class="property">more</span>: <span class="type-string">"stuff"</span></div></li></ul>},</div></li><li><div class="hoverable"><span class="property">awesome</span>: <span class="type-boolean">true</span>,</div></li><li><div class="hoverable"><span class="property">bogus</span>: <span class="type-boolean">false</span>,</div></li><li><div class="hoverable"><span class="property">meaning</span>: <span class="type-null">null</span>,</div></li><li><div class="hoverable"><span class="property">link</span>: <span class="type-string">"</span><a href="#">http://jsonview.com</a><span class="type-string">"</span>,</div></li><li><div class="hoverable"><span class="property">notLink</span>: <span class="type-string">"http://jsonview.com is great"</span></div></li></ul>}</div></body></html>';
	var PASSIVE_KEYS = [ "Down", "Up", "Left", "Right", "End", "Home", "PageDown", "PageUp", "Control", "Alt", "Shift", "Insert" ];

	var bgPage = chrome.extension.getBackgroundPage(), editor = document.getElementById("editor"), resetButton = document.getElementById("reset-button"), saveButton = document
			.getElementById("save-button"), previewer = document.getElementById("previewer").contentWindow, codemirror;

	function updatePreview() {
		previewer.document.open();
		previewer.document.write(SAMPLE_PART1);
		previewer.document.write(codemirror.getValue());
		previewer.document.write(SAMPLE_PART2);
		previewer.document.close();
	}

	resetButton.addEventListener("click", function() {
		bgPage.getDefaultTheme(function(theme) {
			codemirror.setValue(theme);
			updatePreview();
		});
	}, false);

	saveButton.addEventListener("click", function() {
		localStorage.theme = codemirror.getValue();
	}, false);

	addEventListener("load", function() {
		var timeoutOnKey;
		codemirror = CodeMirror.fromTextArea(editor, {
			onKeyEvent : function(editor, event) {
				if (event.type == "keyup" && PASSIVE_KEYS.indexOf(event.keyIdentifier) == -1) {
					if (timeoutOnKey)
						clearTimeout(timeoutOnKey);
					timeoutOnKey = setTimeout(updatePreview, 500);
				}
			}
		});
		codemirror.setValue(localStorage.theme);
		updatePreview();
	}, false);

})();
