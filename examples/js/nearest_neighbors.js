( function() {"use strict";
    var $canvas, ctx, data, utils;
    data = {
        points : [],
        tree : null
    };
    utils = {
        generatePoints : function utilsGenPoints(noOfPoints, maxX, maxY) {
            var i, x, y;
            var points = [];
            //add points
            for( i = 0; i < noOfPoints; ++i) {
                x = Math.floor(Math.random() * maxX);
                y = Math.floor(Math.random() * maxY);

                points.push([x, y]);
            }
            return points;
        },
        drawPoints : function utilsDrawPoints(ctx, points) {
            var _2PI = 2 * Math.PI;
            var msg = "Drawing of " + points.length + " points.";
            console.time(msg);
            points.forEach(function(point) {
                ctx.beginPath();
                ctx.arc(point[0], point[1], 2, _2PI, false);
                ctx.fill();
                ctx.stroke();
            });
            console.timeEnd(msg);
        },
        setNormalStyles : function utilsSetNormalStyles(ctx) {
            ctx.fillStyle = "#d55";
            ctx.strokeStyle = "#444";
        },
        setSelectedStyles : function utilsSetSelectedStyles(ctx) {
            ctx.fillStyle = "#5d5";
            ctx.strokeStyle = "#eee";
        }
    };

    //get canvas
    $canvas = $('#canvas');
    ctx = $canvas[0].getContext('2d');

    $('#populate').bind('click', function() {
        var width = $canvas.width(), height = $canvas.height();

        //create new points
        data.points = utils.generatePoints($('#points').val(), width, height);
        if (data.points.length < 50) {
            console.log(JSON.stringify(data.points));
        }
        //build tree with default options
        data.tree = kdtree.buildTree(data.points);

        //clear canvas and draw points
        ctx.clearRect(0, 0, width, height);
        utils.setNormalStyles(ctx);
        utils.drawPoints(ctx, data.points);
    }).trigger('click');

    $canvas.bind('click', function(e) {
        console.time("Searching (kdtree)");
        console.log("Searching (kdtree)", e.offsetX, e.offsetY);
        var neighbors = data.tree.search([e.offsetX, e.offsetY], $('#neighs').val());
        console.timeEnd("Searching (kdtree)");
        if (!neighbors.forEach) {
            neighbors = [neighbors];
        }
        utils.setSelectedStyles(ctx);
        utils.drawPoints(ctx, neighbors);
        console.time("Searching (linear)");
        kdtree._kdtree.utils.linearSearch(data.points, [e.offsetX, e.offsetY], $('#neighs').val());
        console.timeEnd("Searching (linear)");
    });
    //canvas handling
}());
