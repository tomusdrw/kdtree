(function() {
	var module, moduleStart, testStart, testCases = [], current_test_assertions = [];
	var console = window.outputConsole || window.console;

	console.log('<?xml version="1.0" encoding="UTF-8"?>');
	console.log('<testsuites name="testsuites">');
	QUnit.begin = function() {
		// That does not work when invoked in PhantomJS
	};

	QUnit.moduleStart = function(name) {
		moduleStart = new Date();
		module = name;
		testCases = [];
	};

	QUnit.moduleDone = function(name, failed, total) {
		// context = { name, failed, passed, total }
		var xml = '\t<testsuite name="' + name + '" errors="0" failures="' + failed + '" tests="'
				+ total + '" time="' + (new Date() - moduleStart) / 1000 + '"';
		if (testCases.length) {
			xml += '>\n';
			for ( var i = 0, l = testCases.length; i < l; i++) {
				xml += testCases[i];
			}
			xml += '\t</testsuite>';
		} else {
			xml += '/>\n';
		}
		console.log(xml);
	};

	QUnit.testStart = function() {
		testStart = new Date();
	};

	QUnit.testDone = function(name, failed, total) {
		// result = { name, failed, passed, total }
		var xml = '\t\t<testcase classname="' + module + '" name="' + name + '" time="'
				+ (new Date() - testStart) / 1000 + '"';
		if (failed) {
			xml += '>\n';
			for ( var i = 0; i < current_test_assertions.length; i++) {
				xml += "\t\t\t" + current_test_assertions[i];
			}
			xml += '\t\t</testcase>\n';
		} else {
			xml += '/>\n';
		}
		current_test_assertions = [];
		testCases.push(xml);
	};

	QUnit.log = function(details) {
		// details = { result , actual, expected, message }
		if (details.result) {
			return;
		}
		var message = details.message || "";
		if (details.expected) {
			if (message) {
				message += ", ";
			}
			message = "expected: " + details.expected + ", but was: " + details.actual;
		}
		var xml = '<failure type="failed" message="' + message + '"/>\n';

		current_test_assertions.push(xml);
	};

	QUnit.done = function(result) {
		console.log('</testsuites>');
		return result.failed > 0 ? 1 : 0;
	};
}());
