function initOptions() {
	var options = localStorage.options ? JSON.parse(localStorage.options) : {};
	var safeMethodInput = document.getElementById("safeMethodInput");
	safeMethodInput.checked = options.safeMethod;
	safeMethodInput.addEventListener("change", function() {
		options.safeMethod = safeMethodInput.checked;
		localStorage.options = JSON.stringify(options);
	});
	document.getElementById('main').style.display = 'block';
}
