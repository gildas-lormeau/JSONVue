  var container = document.getElementById('jsoneditor');

  var options = {
    mode: 'text',
    modes: ['code', 'text', 'view'], // allowed modes
    error: function (err) {
      alert(err.toString());
    }
  };

  var json = {
    "array": [1, 2, 3],
    "boolean": true,
    "null": null,
    "number": 123,
    "object": {"a": "b", "c": "d"},
    "string": "Hello World"
  };

  var editor = new JSONEditor(container, options, json);