/* global globalThis, addEventListener, postMessage */

/**
 * Adapted the code in to order to run in a web worker. 
 * 
 * Original author: Benjamin Hollis
 */

function htmlEncode(t) {
	return t != null ? t.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
}

function decorateWithSpan(value, className) {
	return "<span class=\"" + htmlEncode(className) + "\">" + htmlEncode(value) + "</span>";
}

function valueToHTML(value) {
	const valueType = typeof value;
	let output = "";
	if (value == null)
		output += decorateWithSpan("null", "type-null");
	else if (value && value.constructor == Array)
		output += arrayToHTML(value);
	else if (valueType == "object")
		output += objectToHTML(value);
	else if (valueType == "number")
		output += decorateWithSpan(value, "type-number");
	else if (valueType == "string")
		if (/^https?:\/\/[^\s]+$/.test(value))
			output += decorateWithSpan("\"", "type-string") + "<a href=\"" + htmlEncode(value) + "\">" + htmlEncode(value) + "</a>" + decorateWithSpan("\"", "type-string");
		else
			output += decorateWithSpan("\"" + value + "\"", "type-string");
	else if (valueType == "boolean")
		output += decorateWithSpan(value, "type-boolean");

	return output;
}

function arrayToHTML(json) {
	let indexValue, length, output = "<div class=\"collapser\"></div>[<span class=\"ellipsis\"></span><ul class=\"array collapsible\">", hasContents = false;
	for (indexValue = 0, length = json.length; indexValue < length; indexValue++) {
		hasContents = true;
		output += "<li><div class=\"hoverable\">";
		output += valueToHTML(json[indexValue]);
		if (indexValue < length - 1)
			output += ",";
		output += "</div></li>";
	}
	output += "</ul>]";
	if (!hasContents)
		output = "[ ]";
	return output;
}

function objectToHTML(json) {
	let indexKey, key, length, keys = Object.keys(json), output = "<div class=\"collapser\"></div>{<span class=\"ellipsis\"></span><ul class=\"obj collapsible\">", hasContents = false;
	for (indexKey = 0, length = keys.length; indexKey < length; indexKey++) {
		key = keys[indexKey];
		hasContents = true;
		output += "<li><div class=\"hoverable\">";
		output += "<span class=\"property\">" + htmlEncode(key) + "</span>: ";
		output += valueToHTML(json[key]);
		if (indexKey < length - 1)
			output += ",";
		output += "</div></li>";
	}
	output += "</ul>}";
	if (!hasContents)
		output = "{ }";
	return output;
}

function jsonToHTML(json, functionName) {
	let output = "";
	if (functionName)
		output += "<div class=\"callback-function\">" + htmlEncode(functionName) + "(</div>";
	output += "<div id=\"json\">";
	output += valueToHTML(json);
	output += "</div>";
	if (functionName)
		output += "<div class=\"callback-function\">)</div>";
	return output;
}

function format(json, functionName) {
	let object;
	object = JSON.parse(json);
	return jsonToHTML(object, functionName);
}

if (typeof postMessage == "undefined") {
	globalThis.formatter = { format };
} else {
	addEventListener("message", event => {
		try {
			postMessage({
				onjsonToHTML: true,
				html: format(event.data.json, event.data.functionName)
			});
		} catch (error) {
			postMessage({ error: true });
			return;
		}
	}, false);
}

