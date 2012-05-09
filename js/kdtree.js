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

    kdtree.KdTree = function kdtreeKdTree(root, opts) {
        this.root = root;
        this.opts = opts;
    };
    kdtree.KdTree.prototype = {
        root : null,
        opts : null,
        search : function kdtreeSearch(point, noOfNeighs) {
            if(point.length !== this.opts.k) {
                throw {
                    "msg" : "Incorrect point dimension!"
                };
            }
            noOfNeighs = noOfNeighs || 1;
            var bounds = {
                upper : [],
                lower : []
            };
            //Initialization
            point.forEach(function(x, i) {
                bounds.lower[i] = -Infinity;
                bounds.upper[i] = Infinity;
            });
            var i;
            var queue = [];
            for( i = 0; i < noOfNeighs; ++i) {
                queue.push({
                    node : null,
                    dist : Infinity
                });
            }
            //Searching
            var searchRight = function(d, p, node) {
                var temp = bounds.lower[d];
                bounds.lower[d] = p;
                if(search(node.right)) {
                    return true;
                }
                bounds.lower[d] = temp;
                return false;
            };
            var searchLeft = function(d, p, node) {
                var temp = bounds.upper[d];
                bounds.upper[d] = p;
                if(search(node.left)) {
                    return true;
                }
                bounds.upper[d] = temp;
                return false;
            };
            var opts = this.opts;
            var search = function kdtreeSearch2(node) {
                if(node.isBucket) {
                    node.values.forEach(function(x) {
                        var i, dist, len;
                        dist = kdtree.distance(x, point, opts);
                        len = queue.length;
                        for( i = 0; i < len; ++i) {
                            if(dist >= queue[i].dist) {
                                return;
                            }
                        }
                        //update queue
                        queue.push({
                            node : x,
                            dist : dist
                        });
                        //sort
                        queue.sort(function(a, b) {
                            return b.dist - a.dist;
                        });
                        //trim
                        queue.splice(0, 1);
                    });
                    if(kdtree.ballWithinBounds(point, bounds, queue, opts)) {
                        return true;
                    }
                    return false;
                }
                var temp, d, p;
                d = node.discr;
                p = node.partition;
                //go to closer son
                if(point[d] <= p) {
                    if(searchLeft(d, p, node)) {
                        return true;
                    }
                } else {
                    if(searchRight(d, p, node)) {
                        return true;
                    }
                }
                //recursive call on farther son (if necessary)
                if(point[d] <= p) {
                    temp = bounds.lower[d];
                    bounds.lower[d] = p;
                    if(kdtree.boundsOverlapBall(point, bounds, queue, opts)) {
                        if(search(node.right)) {
                            return true;
                        }
                    }
                    bounds.lower[d] = temp;
                } else {
                    temp = bounds.upper[d];
                    bounds.upper[d] = p;
                    if(kdtree.boundsOverlapBall(point, bounds, queue, opts)) {
                        if(search(node.left)) {
                            return true;
                        }
                    }
                    bounds.upper[d] = temp;
                }
                //Terminate?
                if(kdtree.ballWithinBounds(point, bounds, queue, opts)) {
                    return true;
                }
                return false;
            };
            search(this.root);

            var ret = [];
            queue.forEach(function(x){
               ret.push(x.node);
            });
            if (ret.length === 1) {
                return ret[0];
            }
            return ret;
        }
    };
    kdtree.distance = function kdtreeDistance(a, b, opts) {
        var i, sum = 0;
        for( i = 0; i < a.length; ++i) {
            sum = sum + kdtree.coordinateDistance(i, a, b, opts);
        }
        return opts.dissim(sum);
    };
    kdtree.coordinateDistance = function kdtreeCoordinateDistance(coord, point, bound, opts) {
        return opts.coordinateDistance(point[coord], bound[coord]);
    };
    kdtree.ballWithinBounds = function kdtreeBallWithinBounds(point, bounds, queue, opts) {
        var d, firstDist;
        firstDist = queue[0].dist;

        for( d = 0; d < point.length; ++d) {
            if(kdtree.coordinateDistance(d, point, bounds.lower, opts) <= firstDist || kdtree.coordinateDistance(d, point, bounds.upper, opts) <= firstDist) {
                return false;
            }
        }
        return true;
    };
    kdtree.boundsOverlapBall = function kdtreeBoundsOverlapBall(point, bounds, queue, opts) {
        var sum, d;
        sum = 0;
        var firstDist = queue[0].dist;
        for( d = 0; d < point.length; ++d) {
            if(point[d] < bounds.lower[d]) {
                sum = sum + kdtree.coordinateDistance(d, point, bounds.lower, opts);
                if(opts.dissim(sum) > firstDist) {
                    return true;
                }
            } else if(point[d] > bounds.upper[d]) {
                sum = sum + kdtree.coordinateDistance(d, point, bounds.upper, opts);
                if(opts.dissim(sum) > firstDist) {
                    return true;
                }
            }
        }
        return false;
    };
    kdtree.spreadEst = function kdtreeSpreadEst(coordinate, data) {
        //find min and max
        var min, max;
        min = max = data[0][coordinate];
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
            //Pivots has to be in left part!
            if(x[coord] <= pivot) {
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
                bucketSize : 10,
                dissim : function(sum) {
                    return Math.sqrt(sum);
                },
                coordinateDistance : function(a, b) {
                    var d = a - b;
                    return d * d;
                }
            }, opts);
            opts.k = data[0].length;

            var root = kdtree.buildTree(data, opts);

            return new kdtree.KdTree(root, opts);
        },
        _kdtree : kdtree
    };
}());
