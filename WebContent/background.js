chrome.extension.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(msg) {
		if (msg.init)
			port.postMessage( {
				init : true,
				options : localStorage.options ? JSON.parse(localStorage.options) : {}
			});
	});
});