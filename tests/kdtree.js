QUnit.specify("kdtree", function() {
    QUnit.specify.extendAssertions({
        arrayEquals : function(actual, expected, message) {
            if (!message) {
                message = "expected: " + expected + ", got: "+actual;
            }
            var isOk = true;
            isOk = actual.length == expected.length;
            if (isOk) {
                for (var i = 0; i<actual.length; ++i) {
                    isOk = isOk & (actual[i] == expected[i]);
                }
            }
            ok(isOk, message);
        }
    });

    var cut = kdtree._kdtree;

    describe("kdtree.utils.partition", function() {
        var utils = cut.utils;
        given(
            [[1, 2, 3, 4, 5], 4, [1, 2, 3, 4, 5]],
            [[5, 3, 4, 2, 1], 4, [1, 3, 4, 2, 5]],
            [[1, 5, 4, 2, 3], 2, [1, 3, 2, 4, 5]])//
        .it("should perform partition", function(data, pivotIndex, expected) {
            // when
            var newIndex = utils.partition(data, 0, data.length - 1, pivotIndex);

            // then
            assert(data).arrayEquals(expected);
        });
    });

    describe("kdtree.utils.select", function() {
        var utils = cut.utils;
        given(
            [[1, 2, 3, 4, 5], 4, 5],
            [[5, 3, 4, 2, 1], 3, 4],
            [[1, 5, 4, 2, 3], 2, 3],
            [[615, 31, 44], 1, 44],
            [[1234, 235, 32, 41], 3, 1234]
            )//
        .it("should select k-th element", function(data, k, expected) {
            // when
            var s = utils.select(data, k);

            // then
            assert(s).isEqualTo(expected);
        });
    });

    describe("kdtree.utils.median", function() {
        var utils = cut.utils;
        given(
            [[1, 2, 3, 4, 5], 3],
            [[5, 3, 4, 2, 1, 6], 4],
            [[1, 5, 4, 2, 3, 7, 123], 4],
            [[615, 31, 44], 44],
            [[1234, 235, 32, 41], 235]
            )//
        .it("should select median", function(data, expected) {
            // when
            var med = utils.median(data);

            // then
            assert(med).isEqualTo(expected);
        });
    });

    describe("kdtree.buildTree", function(){
        cut = kdtree;
        var testData = [
            [1, 5, 15, 12, 3, -4],
            [4, 3, 17, 1, 61, 61],
            [1, 16, 123, -5 ,12, 4],
            [2, 234, -51, 234, 2, 12],
            [123, 415, 13, 541, 4, 3]
        ];

        it('should create single bucket', function(){
            //when
            var tree = cut.buildTree(testData);

            //then
            assert(tree.root.isBucket).isTrue();
            assert(tree.root.values).arrayEquals(testData);
        });

        it('should create kdtree tree', function(){
            //when
             var tree = cut.buildTree(testData, {bucketSize: 2});
             var root = tree.root;
             console.log(root);
             //then
             assert(root.isBucket).isFalse();
             assert(root.discr).isEqualTo(3);
             assert(root.partition).isEqualTo(12);

             var left = root.left;
             var right = root.right;
             assert(right.isBucket).isTrue();

             assert(left.isBucket).isFalse();
             assert(left.discr).isEqualTo(2);
             assert(left.partition).isEqualTo(17);

             assert(left.left.isBucket).isTrue();
             assert(left.right.isBucket).isTrue();
        });

        given(
            2, 3, 4, 5, 10
        ).it('should find exact point with given bucketSize', function(bucket){
             var tree = cut.buildTree(testData, {bucketSize: bucket});
             //when
             var result = tree.search(testData[0]);

             //then
             assert(result).isSameAs(testData[0]);
        });

        given(
            2, 3, 4, 10
        ).it('should find 2 neareast neighbours given bucketSize', function(bucket){
            var tree = cut.buildTree(testData, {bucketSize: bucket});
             //when
             var result = tree.search([4, 3, 17, 1, 61, 62], 2);

             //then
             assert(result.length).isEqualTo(2);
             assert(result[0]).isSameAs(testData[0]);
             assert(result[1]).isSameAs(testData[1]);
        });
    });










});