QUnit.specify("kdtree", function() {
    QUnit.specify.extendAssertions({
        arrayEquals : function(actual, expected, message) {
            if (!message) {
                message = "expected: " + JSON.stringify(expected) + ", got: "+JSON.stringify(actual);
            }
            var isOk = true;
            isOk = actual.length == expected.length;
            if (isOk) {
                for (var i = 0; i<actual.length; ++i) {
                    isOk = isOk & (actual[i] == expected[i]);
                }
            } else {
                message = message + " (expected size: "+expected.length+" got: "+actual.length+")";
            }
            ok(isOk, message);
        }
    });

    var cut = kdtree._kdtree;
    var utils = cut.utils;
    describe("kdtree.buildTree2", function() {
        var data = {
            data1 : [[168, 284], [217, 421], [271, 152], [112, 199], [548, 335], [184, 456], [564, 300], [505, 172], [317, 318], [96, 450], [39, 63]],
            data2 : [[17, 468], [521, 255], [555, 190], [5, 247], [485, 59], [574, 249], [559, 228], [26, 20], [58, 16], [292, 124], [302, 331]],
            data3 : [[500,52],[38,271],[579,105],[158,256],[594,330],[474,268],[418,329],[188,112],[556,396],[376,15],[247,393],[22,72],[304,18],[524,31],[461,220],[19,401],[91,10],[277,230],[138,87],[583,261],[103,0],[319,127],[215,403],[577,305],[36,74],[101,183],[222,445],[34,389],[34,411],[490,216],[324,338],[236,21],[371,436],[523,372],[517,418],[281,407],[100,245],[593,319],[232,351],[406,147]]
        };

        //bug fix for
        given([data.data3, [223, 169], 10], [data.data2, [482, 417], 10], [data.data1, [398, 145], 6])
        .it('should find exact number of neighbours', function(data, search, noOfNeighs) {
            //given
            var tree = cut.buildTree(data);
            console.log(tree);

            //when
            var result = tree.search(search, noOfNeighs);
            var res2 = utils.linearSearch(data, search, noOfNeighs);

            console.log(result);
            console.log(res2);
            //then
            assert(result[0]).isNotNull();
            assert(result).arrayEquals(res2);
        });
    });



    describe("kdtree.utils.partition", function() {
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
     describe("kdtree.buildTree", function(){
        var testData = [
            [1, 5, 15, 12, 3, -4],
            [4, 3, 17, 1, 61, 61],
            [1, 16, 123, -5 ,12, 4],
            [2, 234, -51, 234, 2, 12],
            [123, 415, 13, 541, 4, 3]
        ];
        it('should use data with given k', function(){
             var tree = cut.buildTree(testData, {bucketSize: 3, k: 4});
             //when
             var result = tree.search([4, 3, 17, 1], 2);

             //then
             assert(result.length).isEqualTo(2);
             assert(result[0]).isSameAs(testData[0]);
             assert(result[1]).isSameAs(testData[1]);
        });
     });










});