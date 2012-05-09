<?php
define("TO_LOAD", 1);
define("LOADED", 2);
$tests = require("tests.inc.php");
if (isset($_SERVER['arg']) && count($_SERVER['argv']) > 1) {
	$_GET['file'] = $_SERVER['argv'][1];
}
$single = !empty($_GET['file']);
$key = $single ? $_GET['file'] : false;
if (!isset($tests[$key])) {
	$single = false;
}
$loaded = array();
function loadModule($loaded, $tests, $name) {
	$module_name = $name;
	$loaded[$name] = TO_LOAD;
	if (isset($tests[$name])) {
		if (isset($tests[$name]['toLoad'])) {
			$toLoad = $tests[$name]['toLoad'];
			if (!is_array($toLoad)) {
				$toLoad = array($toLoad);
			}
			foreach ($toLoad as $v) {
				if (empty($loaded[$v])) {
					$loaded = loadModule($loaded, $tests, $v);
				}
			}
		}
		//now load source
		if (isset($tests[$name]['src'])) {
			$name = $tests[$name]['src'];
		}
	}
	if (!is_array($name)) {
		$name = array($name);
	}
	foreach ($name as $v) {
		if ($v !== false && (empty($loaded[$v]) || $loaded[$v] !== LOADED)) {
			$loaded[$v] = LOADED;
			echo "\t<!-- Loading $v -->\n";
			$v = '../js/'.str_replace('.', '/', $v).'.js';
			echo "\t<script type=\"text/javascript\" src=\"$v\"></script>\n";
		}
	}
	if (isset($tests[$module_name]['run'])) {
		echo "\t<script type=\"text/javascript\">{$tests[$module_name]['run']}</script>\n";
	}
	return $loaded;
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>blacksoft.kdtree test suite</title>
<link href="libs/pavlov/lib/qunit.css" rel="stylesheet"
	type="text/css" />

<?php if (!$single) { ?>
    <link href="libs/runner/qunit-runner.css" rel="stylesheet" type="text/css" />
<?php } ?>
    <script type="text/javascript" src="libs/pavlov/lib/qunit.js"></script>
    <script type="text/javascript" src="libs/runner/qunit-junit-output.js"></script>
    <script type="text/javascript" src="libs/pavlov/pavlov.js"></script>
    <script type="text/javascript" src="libs/jquery-1.7.1.min.js"></script>
    <script type="text/javascript" src="libs/runner/qunit-runner.js"></script>
<?php if (!$single) { ?>
    <script type="text/javascript" src="libs/runner/runner.js"></script>
<?php } else {
	loadModule($loaded, $tests, $key);
	//load test
	if (isset($tests[$key]['test'])) {
		$testFile = $tests[$key]['test'];
	} else {
		$testFile = $key;
	}
	echo "\t<script type=\"text/javascript\" src=\"$testFile.js\"></script>\n";
?>
<?php } ?>
</head>
<body>




<?php if (!$single) { ?>
	<div>
		<h1 id="qunit-header">pl.vojna.rpg.client Test suite</h1>
		<h2 id="qunit-banner"></h2>
		<h2 id="qunit-runner-userAgent"></h2>
		<div id="runner-test-page-container"></div>
	</div>

	<script type="text/javascript">
<?php
$t = array();
foreach($tests as $k=>$v) {
	if (!(isset($v['src']) && $v['src'] === false)) {
		$t[] = "'$k'";
	}
}
?>
		var tests = [<?php echo join(', ', $t); ?>];
		var t = Runner.tests(tests);
		Runner.run(t);
    </script>








<?php } else { ?>
	<h1 id="qunit-header"></h1>
	<h2 id="qunit-banner"></h2>
	<div id="qunit-testrunner-toolbar"></div>
	<h2 id="qunit-userAgent"></h2>
	<ol id="qunit-tests"></ol>
<?php } ?>
</body>
</html>
