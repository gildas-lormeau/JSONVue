function JSONFormatter() {
}
JSONFormatter.prototype = {
	htmlEncode : function(t) {
		return t != null ? t.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';
	},

	decorateWithSpan : function(value, className) {
		return '<span class="' + className + '">' + this.htmlEncode(value) + '</span>';
	},

	valueToHTML : function(value) {
		var valueType = typeof value, output = "";
		if (value == null) {
			output += this.decorateWithSpan('null', 'null');
		} else if (value && value.constructor == Array) {
			output += this.arrayToHTML(value);
		} else if (valueType == 'object') {
			output += this.objectToHTML(value);
		} else if (valueType == 'number') {
			output += this.decorateWithSpan(value, 'num');
		} else if (valueType == 'string') {
			if (/^(http|https):\/\/[^\s]+$/.test(value)) {
				output += this.decorateWithSpan('"', 'string') + '<a href="' + value + '">' + this.htmlEncode(value) + '</a>'
						+ this.decorateWithSpan('"', 'string');
			} else {
				output += this.decorateWithSpan('"' + value + '"', 'string');
			}
		} else if (valueType == 'boolean') {
			output += this.decorateWithSpan(value, 'bool');
		}

		return output;
	},

	arrayToHTML : function(json) {
		var prop, output = '<div class="collapser">-</div>[<ul class="array collapsible">', hasContents = false;
		for (prop in json) {
			hasContents = true;
			output += '<li>';
			output += this.valueToHTML(json[prop]);
			output += '</li>';
		}
		output += '</ul>]';

		if (!hasContents) {
			output = "[ ]";
		}

		return output;
	},

	objectToHTML : function(json) {
		var prop, output = '<div class="collapser">-</div>{<ul class="obj collapsible">', hasContents = false;
		for (prop in json) {
			hasContents = true;
			output += '<li>';
			output += '<span class="prop">' + this.htmlEncode(prop) + '</span>: ';
			output += this.valueToHTML(json[prop]);
			output += '</li>';
		}
		output += '</ul>}';

		if (!hasContents) {
			output = "{ }";
		}

		return output;
	},

	jsonToHTML : function(json, fnName) {
		var output = '';
		if (fnName)
			output += '<div class="fn">' + fnName + '(</div>';
		output += '<div id="json">';
		output += this.valueToHTML(json);
		output += '</div>';
		if (fnName)
			output += '<div class="fn">)</div>';
		return output;
	}
};

addEventListener("message", function(event) {
	postMessage({
		onjsonToHTML : true,
		data : (new JSONFormatter()).jsonToHTML(event.data.parsedObject, event.data.fnName)
	});
}, false);
