this.Runner = {
	_prepare: function(s) {
		return "index.php?file="+s;
	},
	tests: function() {
		var tests=[],s;
		var args = Array.prototype.slice.call(arguments, 0);
		if (args.length == 1 && args instanceof Array) {
			args = args[0];
		}
		for (var i in args) {
			s = args[i];
			if (typeof s === 'string') {
				s = {
					page: s,
					title: s
				};
			}
			if (!s.page) {
				console.error("Unknown: ", s);
			} else {
				if (s.title === undefined) {
					s.title = s.page;
				}
				s.page = this._prepare(s.page);
			}
			tests.push(s);
		}
		return tests;
	},
	run: function(tests, sequential, runnerDone) {
		sequential = sequential ? true : false;
		QUnit.run(tests, sequential, runnerDone);
	}
};
