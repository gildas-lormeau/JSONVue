function htmlEncode(t) {
	return t != null ? t.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';
}

function decorateWithSpan(value, className) {
	return '<span class="' + className + '">' + htmlEncode(value) + '</span>';
}

function valueToHTML(value) {
	var valueType = typeof value, output = "";
	if (value == null) {
		output += decorateWithSpan('null', 'null');
	} else if (value && value.constructor == Array) {
		output += arrayToHTML(value);
	} else if (valueType == 'object') {
		output += objectToHTML(value);
	} else if (valueType == 'number') {
		output += decorateWithSpan(value, 'num');
	} else if (valueType == 'string') {
		if (/^(http|https):\/\/[^\s]+$/.test(value)) {
			output += decorateWithSpan('"', 'string') + '<a href="' + value + '">' + htmlEncode(value) + '</a>' + decorateWithSpan('"', 'string');
		} else {
			output += decorateWithSpan('"' + value + '"', 'string');
		}
	} else if (valueType == 'boolean') {
		output += decorateWithSpan(value, 'bool');
	}

	return output;
}

function arrayToHTML(json) {
	var prop, output = '<div class="collapser">-</div>[<ul class="array collapsible">', hasContents = false;
	for (prop in json) {
		hasContents = true;
		output += '<li><div>';
		output += valueToHTML(json[prop]);
		output += '</div></li>';
	}
	output += '</ul>]';

	if (!hasContents) {
		output = "[ ]";
	}

	return output;
}

function objectToHTML(json) {
	var prop, output = '<div class="collapser">-</div>{<ul class="obj collapsible">', hasContents = false;
	for (prop in json) {
		hasContents = true;
		output += '<li><div>';
		output += '<span class="prop">' + htmlEncode(prop) + '</span>: ';
		output += valueToHTML(json[prop]);
		output += '</div></li>';
	}
	output += '</ul>}';

	if (!hasContents) {
		output = "{ }";
	}

	return output;
}

function jsonToHTML(json, fnName) {
	var output = '';
	if (fnName)
		output += '<div class="fn">' + fnName + '(</div>';
	output += '<div id="json">';
	output += valueToHTML(json);
	output += '</div>';
	if (fnName)
		output += '<div class="fn">)</div>';
	return output;
}

addEventListener("message", function(event) {
	var object;
	try {
		object = JSON.parse(event.data.json);
	} catch (e) {
		postMessage({
			error : true
		});
		return;
	}
	postMessage({
		onjsonToHTML : true,
		html : jsonToHTML(object, event.data.fnName)
	});
}, false);
