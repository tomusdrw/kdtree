kdtree = ( function() {
    var kdtree = {};
    kdtree.utils = {
        extend : function utilsExtend(obj) {
            var i, args;
            args = Array.prototype.slice.call(arguments, 1);
            args.forEach(function(ext) {
                for(var x in ext) {
                    if(ext.hasOwnProperty(x)) {
                        obj[x] = ext[x];
                    }
                }
            });
            return obj;
        },
        partition : function utilsPartition(data, left, right, pivotIndex) {
            var swap = function(i, j) {
                var t = data[i];
                data[i] = data[j];
                data[j] = t;
            };
            var pivot, newIndex, i;
            pivot = data[pivotIndex];
            swap(pivotIndex, right);
            newIndex = left;
            for( i = left; i < right; ++i) {
                if(data[i] < pivot) {
                    swap(newIndex, i); ++newIndex;
                }
            }
            //move pivot
            swap(right, newIndex);
            return newIndex;
        },
        select : function utilsSelect(data, k) {
            var select = function select(left, right) {
                if(left == right) {
                    return data[left];
                }
                //Select pivot
                var pivotIndex = left + Math.floor(Math.random() * (right - left + 1));
                //partition
                pivotIndex = kdtree.utils.partition(data, left, right, pivotIndex);
                if(pivotIndex == k) {
                    return data[pivotIndex];
                }
                //TODO no reccurence!
                if(k < pivotIndex) {
                    return select(left, pivotIndex - 1);
                }
                return select(pivotIndex + 1, right);
            };
            return select(0, data.length - 1);
        },
        median : function utilsMedian(data) {
            return kdtree.utils.select(data, Math.floor(data.length / 2));
        }
    };

    /**
     * Terminal node - bucket
     * @param values Array of values in this bucket
     */
    kdtree.Bucket = function kdtreeBucket(values) {
        this.values = values;
    };
    kdtree.Bucket.prototype = {
        /**
         * Distinguish from kdtree.Node
         */
        isBucket : true,
        /**
         * Array of values
         */
        values : []
    };
    /**
     * Nonterminal node
     */
    kdtree.Node = function kdtreeNode(discr, partition, left, right) {
        this.discr = discr;
        this.partition = partition;
        this.left = left;
        this.right = right;
    };
    kdtree.Node.prototype = {
        /**
         * Indicates that node is not a bucket
         */
        isBucket : false,
        /**
         * Discriminant (coordinate index)
         */
        discr : null,
        /**
         * Partition value (value of coordinate)
         */
        partition : null,
        /**
         * Left subtree
         */
        left : null,
        /**
         * Right subtree
         */
        right : null
    };

    kdtree.KdTree = function kdtreeKdTree() {

    };
    kdtree.spreadEst = function kdtreeSpreadEst(coordinate, data) {
        //find min and max
        var min, max = data[0][coordinate];
        data.forEach(function(x) {
            var v = x[coordinate];
            if(v < min) {
                min = v;
            } else if(v > max) {
                max = v;
            }
        });
        return max - min;
    };
    kdtree.median = function kdtreeMedian(coord, orgData) {
        var data = [];
        orgData.forEach(function(x) {
            data.push(x[coord]);
        });
        return kdtree.utils.median(data);
    };
    kdtree.partition = function kdtreePartition(coord, pivot, data) {
        var left = [], right = [];
        //TODO: better implementation: in-situ and split
        data.forEach(function(x) {
            if(x[coord] < pivot) {
                left.push(x);
            } else {
                right.push(x);
            }
        });
        return {
            left : left,
            right : right
        };
    };
    kdtree.buildTree = function kdtreeBuildTree(data, opts) {
        //Return terminal node
        if(data.length <= opts.bucketSize) {
            return new kdtree.Bucket(data);
        }
        //Find coordinate with greatest spread
        var maxSpread, estSpread, maxCoord, median, part, left, right, j;
        maxSpread = 0;
        for( j = 0; j < opts.k; ++j) {
            estSpread = kdtree.spreadEst(j, data);
            if(estSpread > maxSpread) {
                maxSpread = estSpread;
                maxCoord = j;
            }
        }
        median = kdtree.median(maxCoord, data);
        part = kdtree.partition(maxCoord, median, data);

        //TODO: maybe some callbacks to make it "less recursive"?
        left = kdtree.buildTree(part.left, opts);
        right = kdtree.buildTree(part.right, opts);

        return new kdtree.Node(maxCoord, median, left, right);
    };
    return {
        /**
         * @param data Array of points (Matrix)
         * @param opts Additional options
         */
        buildTree : function kdtreeBuildTree(data, opts) {
            if(!Array.isArray(data)) {
                throw {
                    "msg" : "Data argument have to be an array."
                };
            }
            if(data.length == 0) {
                throw {
                    "msg" : "Data cannot be empty."
                };
            }
            if(!Array.isArray(data[0])) {
                throw {
                    "msg" : "Data should be matrix."
                };
            }
            //Prepare options
            opts = kdtree.utils.extend({
                bucketSize : 10
            }, opts);
            opts.k = data[0].length;

            return kdtree.buildTree(data, opts);
        },
        _kdtree : kdtree
    };
}());
