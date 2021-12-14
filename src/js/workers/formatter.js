/* global globalThis, addEventListener, postMessage, BigInt */

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
	else if (valueType == "number" || valueType == "bigint")
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

// regexpxs extracted from
// (c) BSD-3-Clause
// https://github.com/fastify/secure-json-parse/graphs/contributors and https://github.com/hapijs/bourne/graphs/contributors

const suspectProtoRx = /(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])/;
const suspectConstructorRx = /(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)/;

/*
	json_parse.js
	2012-06-20

	Public Domain.

	NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

	This file creates a json_parse function.
	During create you can (optionally) specify some behavioural switches

		require('json-bigint')(options)

			The optional options parameter holds switches that drive certain
			aspects of the parsing process:
			* options.strict = true will warn about duplicate-key usage in the json.
			  The default (strict = false) will silently ignore those and overwrite
			  values for keys that are in duplicate use.

	The resulting function follows this signature:
		json_parse(text, reviver)
			This method parses a JSON text to produce an object or array.
			It can throw a SyntaxError exception.

			The optional reviver parameter is a function that can filter and
			transform the results. It receives each of the keys and values,
			and its return value is used instead of the original value.
			If it returns what it received, then the structure is not modified.
			If it returns undefined then the member is deleted.

			Example:

			// Parse the text. Values that look like ISO date strings will
			// be converted to Date objects.

			myData = json_parse(text, function (key, value) {
				var a;
				if (typeof value === 'string') {
					a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
					if (a) {
						return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
							+a[5], +a[6]));
					}
				}
				return value;
			});

	This is a reference implementation. You are free to copy, modify, or
	redistribute.

	This code should be minified before deployment.
	See http://javascript.crockford.com/jsmin.html

	USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
	NOT CONTROL.
*/

/*members "", "\"", "\/", "\\", at, b, call, charAt, f, fromCharCode,
	hasOwnProperty, message, n, name, prototype, push, r, t, text
*/

var json_parse = function (options) {
	"use strict";

	// This is a function that can parse a JSON text, producing a JavaScript
	// data structure. It is a simple, recursive descent parser. It does not use
	// eval or regular expressions, so it can be used as a model for implementing
	// a JSON parser in other languages.

	// We are defining the function inside of another function to avoid creating
	// global variables.

	// Default options one can override by passing options to the parse()
	var _options = {
		strict: false, // not being strict means do not generate syntax errors for "duplicate key"
		storeAsString: false, // toggles whether the values should be stored as BigNumber (default) or a string
		alwaysParseAsBig: false, // toggles whether all numbers should be Big
		useNativeBigInt: false, // toggles whether to use native BigInt instead of bignumber.js
		protoAction: "error",
		constructorAction: "error",
	};

	// If there are options, then use them to override the default _options
	if (options !== undefined && options !== null) {
		if (options.strict === true) {
			_options.strict = true;
		}
		if (options.storeAsString === true) {
			_options.storeAsString = true;
		}
		_options.alwaysParseAsBig =
			options.alwaysParseAsBig === true ? options.alwaysParseAsBig : false;
		_options.useNativeBigInt =
			options.useNativeBigInt === true ? options.useNativeBigInt : false;

		if (typeof options.constructorAction !== "undefined") {
			if (
				options.constructorAction === "error" ||
				options.constructorAction === "ignore" ||
				options.constructorAction === "preserve"
			) {
				_options.constructorAction = options.constructorAction;
			} else {
				throw new Error(
					`Incorrect value for constructorAction option, must be "error", "ignore" or undefined but passed ${options.constructorAction}`
				);
			}
		}

		if (typeof options.protoAction !== "undefined") {
			if (
				options.protoAction === "error" ||
				options.protoAction === "ignore" ||
				options.protoAction === "preserve"
			) {
				_options.protoAction = options.protoAction;
			} else {
				throw new Error(
					`Incorrect value for protoAction option, must be "error", "ignore" or undefined but passed ${options.protoAction}`
				);
			}
		}
	}

	var at, // The index of the current character
		ch, // The current character
		escapee = {
			"\"": "\"",
			"\\": "\\",
			"/": "/",
			b: "\b",
			f: "\f",
			n: "\n",
			r: "\r",
			t: "\t",
		},
		text,
		error = function (m) {
			// Call error when something is wrong.

			throw {
				name: "SyntaxError",
				message: m,
				at: at,
				text: text,
			};
		},
		next = function (c) {
			// If a c parameter is provided, verify that it matches the current character.

			if (c && c !== ch) {
				error("Expected '" + c + "' instead of '" + ch + "'");
			}

			// Get the next character. When there are no more characters,
			// return the empty string.

			ch = text.charAt(at);
			at += 1;
			return ch;
		},
		number = function () {
			// Parse a number value.

			var number,
				string = "";

			if (ch === "-") {
				string = "-";
				next("-");
			}
			while (ch >= "0" && ch <= "9") {
				string += ch;
				next();
			}
			if (ch === ".") {
				string += ".";
				while (next() && ch >= "0" && ch <= "9") {
					string += ch;
				}
			}
			if (ch === "e" || ch === "E") {
				string += ch;
				next();
				if (ch === "-" || ch === "+") {
					string += ch;
					next();
				}
				while (ch >= "0" && ch <= "9") {
					string += ch;
					next();
				}
			}
			number = +string;
			if (!isFinite(number)) {
				error("Bad number");
			} else {
				// if (BigNumber == null) BigNumber = require("bignumber.js");
				if (Number.isSafeInteger(number))
					return !_options.alwaysParseAsBig
						? number
						: BigInt(number);
				else
					// Number with fractional part should be treated as number(double) including big integers in scientific notation, i.e 1.79e+308
					return _options.storeAsString
						? string
						: /[.eE]/.test(string)
							? number
							: BigInt(string);
			}
		},
		string = function () {
			// Parse a string value.

			var hex,
				i,
				string = "",
				uffff;

			// When parsing for string values, we must look for " and \ characters.

			if (ch === "\"") {
				var startAt = at;
				while (next()) {
					if (ch === "\"") {
						if (at - 1 > startAt) string += text.substring(startAt, at - 1);
						next();
						return string;
					}
					if (ch === "\\") {
						if (at - 1 > startAt) string += text.substring(startAt, at - 1);
						next();
						if (ch === "u") {
							uffff = 0;
							for (i = 0; i < 4; i += 1) {
								hex = parseInt(next(), 16);
								if (!isFinite(hex)) {
									break;
								}
								uffff = uffff * 16 + hex;
							}
							string += String.fromCharCode(uffff);
						} else if (typeof escapee[ch] === "string") {
							string += escapee[ch];
						} else {
							break;
						}
						startAt = at;
					}
				}
			}
			error("Bad string");
		},
		white = function () {
			// Skip whitespace.

			while (ch && ch <= " ") {
				next();
			}
		},
		word = function () {
			// true, false, or null.

			switch (ch) {
				case "t":
					next("t");
					next("r");
					next("u");
					next("e");
					return true;
				case "f":
					next("f");
					next("a");
					next("l");
					next("s");
					next("e");
					return false;
				case "n":
					next("n");
					next("u");
					next("l");
					next("l");
					return null;
			}
			error("Unexpected '" + ch + "'");
		},
		value, // Place holder for the value function.
		array = function () {
			// Parse an array value.

			var array = [];

			if (ch === "[") {
				next("[");
				white();
				if (ch === "]") {
					next("]");
					return array; // empty array
				}
				while (ch) {
					array.push(value());
					white();
					if (ch === "]") {
						next("]");
						return array;
					}
					next(",");
					white();
				}
			}
			error("Bad array");
		},
		object = function () {
			// Parse an object value.

			var key,
				object = Object.create(null);

			if (ch === "{") {
				next("{");
				white();
				if (ch === "}") {
					next("}");
					return object; // empty object
				}
				while (ch) {
					key = string();
					white();
					next(":");
					if (
						_options.strict === true &&
						Object.hasOwnProperty.call(object, key)
					) {
						error("Duplicate key \"" + key + "\"");
					}

					if (suspectProtoRx.test(key) === true) {
						if (_options.protoAction === "error") {
							error("Object contains forbidden prototype property");
						} else if (_options.protoAction === "ignore") {
							value();
						} else {
							object[key] = value();
						}
					} else if (suspectConstructorRx.test(key) === true) {
						if (_options.constructorAction === "error") {
							error("Object contains forbidden constructor property");
						} else if (_options.constructorAction === "ignore") {
							value();
						} else {
							object[key] = value();
						}
					} else {
						object[key] = value();
					}

					white();
					if (ch === "}") {
						next("}");
						return object;
					}
					next(",");
					white();
				}
			}
			error("Bad object");
		};

	value = function () {
		// Parse a JSON value. It could be an object, an array, a string, a number,
		// or a word.

		white();
		switch (ch) {
			case "{":
				return object();
			case "[":
				return array();
			case "\"":
				return string();
			case "-":
				return number();
			default:
				return ch >= "0" && ch <= "9" ? number() : word();
		}
	};

	// Return the json_parse function. It will have access to all of the above
	// functions and variables.

	return function (source, reviver) {
		var result;

		text = source + "";
		at = 0;
		ch = " ";
		result = value();
		white();
		if (ch) {
			error("Syntax error");
		}

		// If there is a reviver function, we recursively walk the new structure,
		// passing each name/value pair to the reviver function for possible
		// transformation, starting with a temporary root object that holds the result
		// in an empty key. If there is not a reviver function, we simply return the
		// result.

		return typeof reviver === "function"
			? (function walk(holder, key) {
				var v,
					value = holder[key];
				if (value && typeof value === "object") {
					Object.keys(value).forEach(function (k) {
						v = walk(value, k);
						if (v !== undefined) {
							value[k] = v;
						} else {
							delete value[k];
						}
					});
				}
				return reviver.call(holder, key, value);
			})({ "": result }, "")
			: result;
	};
};

const parseJson = json_parse();

function format(json, functionName, supportBigInt) {
	let object;
	if (supportBigInt) {
		object = parseJson(json);
	} else {
		object = JSON.parse(json);
	}
	return jsonToHTML(object, functionName);
}

if (typeof postMessage == "undefined") {
	globalThis.formatter = { format };
} else {
	addEventListener("message", event => {
		try {
			postMessage({
				onjsonToHTML: true,
				html: format(event.data.json, event.data.functionName, event.data.supportBigInt)
			});
		} catch (error) {
			postMessage({ error: true });
			return;
		}
	}, false);
}

