this.app = this.app || {};
//
( function(app) {
    //Number of neighbours
    var K = 3;
    //Classification data dimension
    var DIMENSION = 25;

    //Build tree
    console.time("buildTree");
    var tree = kdtree.buildTree(app.data, {
        //everything on indices geq DIMENSION
        //is considered additional data
        k : DIMENSION
    });
    //add images
    var $symbols = $('.symbols');
    _.each(app.images, function(img, x){
       var $img = $('<img width="75" height="75" />').attr("title", x).attr("alt", x).attr("src", img);
       $symbols.append($img);
    });

    console.timeEnd("buildTree");

    app.EventManager.listen('symbol-converted', function(point) {
        //perform tree search
        console.time("tree.search");
        var neighbours = tree.search(point, K);
        console.timeEnd("tree.search");

        //handle returned data
        var perClassResults = {};
        _.each(neighbours, function(neighbour) {
            //Last data of point indicates class
            var clazz = neighbour[DIMENSION];
            perClassResults[clazz] = perClassResults[clazz] || [];
            //add new point to data
            perClassResults[clazz].push(neighbour);
        });
        //Convert results
        var results = [];
        _.each(perClassResults, function(resultArr, clazz) {
            var noOfInstances = resultArr.length;
            results.push({
                clazz : clazz,
                prob : noOfInstances / K,
                times : noOfInstances
            });
        });
        //Sort results
        results.sort(function(a, b) {
            return b.times - a.times;
        });
        //Return result that was most common
        app.EventManager.fire('symbol-classified', results[0].clazz, results);
    });
    var $reconText = $('#recognized');
    var $reconImg = $('#recognizedImg');
    var $reconOthers = $('#recognizedOthers');
    //displaying of classified symbol
    app.EventManager.listen('symbol-classified', function(clazz, others) {
        $reconImg.attr('src', app.images[clazz]);
        $reconText.removeClass('not_recognized');
        $reconText.text("Recognized as (" + Math.round(100 * others[0].prob) + "%)");

        //draw other symbols
        $reconOthers.empty();
        if(others.length > 1) {
            $reconOthers.append('Other possible matches:');
            var o = others.slice(1);
            _.each(o, function(v) {
                var prob = Math.round(v.prob * 100);
                var $div = $('<div>').appendTo($reconOthers);
                $('<img width="30" height="30"/>').attr('src', app.images[v.clazz]).appendTo($div);
                $div.append("(" + prob + "%) ");
            });
        }
    });
}(this.app));
