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
});