var jsonview = {};

(function() {

	var child, data;

	if (document.body && document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0) {
		child = document.body.children.length ? document.body.childNodes[0] : document.body;
		data = child.innerText.trim();
		if (data) {
			chrome.extension.sendRequest({
				init : true
			}, function(response) {
				if (response.init) {
					jsonview.data = data;
					jsonview.options = JSON.parse(response.options);
				}
			});
		}
	}

})();
