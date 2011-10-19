chrome.extension.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(msg) {
		var workerFormatter, workerJSONLint, json = msg.json;

		function onWorkerJSONLintMessage() {
			workerJSONLint.removeEventListener("message", onWorkerJSONLintMessage, false);
			workerJSONLint.terminate();
			port.postMessage({
				ongetError : true,
				error : event.data
			});
		}

		function onWorkerFormatterMessage(event) {
			var msg = event.data;
			workerFormatter.removeEventListener("message", onWorkerFormatterMessage, false);
			workerFormatter.terminate();
			if (msg.html)
				port.postMessage({
					onjsonToHTML : true,
					html : msg.html
				});
			if (msg.error) {
				workerJSONLint = new Worker("workerJSONLint.js");
				workerJSONLint.addEventListener("message", onWorkerJSONLintMessage, false);
				workerJSONLint.postMessage(json);
			}
		}

		if (msg.init)
			port.postMessage({
				oninit : true,
				options : localStorage.options ? JSON.parse(localStorage.options) : {}
			});
		if (msg.jsonToHTML) {
			workerFormatter = new Worker("workerFormatter.js");
			workerFormatter.addEventListener("message", onWorkerFormatterMessage, false);
			workerFormatter.postMessage({
				json : json,
				fnName : msg.fnName
			});
		}
	});
});
