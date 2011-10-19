chrome.extension.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(msg) {
		var worker;

		function onWorkerMessage(event) {
			var msg = event.data;
			worker.removeEventListener("message", onmessage, false);
			worker.terminate();
			port.postMessage({
				onjsonToHTML : true,
				data : msg.data
			});
		}

		if (msg.init)
			port.postMessage({
				oninit : true,
				options : localStorage.options ? JSON.parse(localStorage.options) : {}
			});
		if (msg.jsonToHTML) {
			worker = new Worker("worker.js");
			worker.addEventListener("message", onWorkerMessage, false);
			worker.postMessage({
				parsedObject : msg.parsedObject,
				fnName : msg.fnName
			});
		}
	});
});
