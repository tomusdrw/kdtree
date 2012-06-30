JavaScript [k-d tree](http://en.wikipedia.org/wiki/K-d_tree) implementation.
================================================

Supports:
 * building balanced tree from predefined data
 * performing search for any given number of nearest neighbours

See [examples of usage](http://examples.blacksoft.eu/blacksoft.kdtree/examples):
 * [Nearest points on plane](http://examples.blacksoft.eu/blacksoft.kdtree/examples/NearestPoints.html)
 * [Classification (knn method)](http://examples.blacksoft.eu/blacksoft.kdtree/examples/Classification.html)

See [test suite](http://examples.blacksoft.eu/blacksoft.kdtree/tests/kdtree.html).

You can tune distance metric (default is euclid) and provide bucket size. Example:
```javascript
var data = [
	[1, 2, 3, {additional: "data"}],
	[4, 5, 6, {additional: "data2"}]
];
var k = data[0].length - 1;
var options = {
	/**
	 * Defines bucket (terminal node) maximal size (default: 10)
	 */
	bucketSize : 10,
	/**
	 * Data dimension (default: data[0].length)
	 */
	k : k,
	/**
	 * Dissimilarity function (default: sqrt)
	 */
	dissim : function(sum) {
		return Math.sqrt(sum);
	},
	/**
	 * Coordinate distance (default: (a-b)^2)
	 */
	coordinateDistance : function(a, b) {
		var d = a - b;
		return d * d;
	}
};
var tree = kdtree.buildTree(data, options);
var noOfNeighboursToFind = 2;
var neighbours = tree.search([1, 2, 3], noOfNeighboursToFind);

neighbours[0][k].additional === "data"; //true
neighbours[1][k].additional === "data2"; //true
```

Implementation is based on paper:
JH Friedman, JL Bentley, "An algorithm for finding best matches in logarithmic expected time.", 1977

