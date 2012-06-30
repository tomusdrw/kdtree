( function(app) {
    var scaledCanvas = document.getElementById('scaled');
    var scaledCtx = scaledCanvas.getContext('2d');

    app.EventManager.listen('symbol-cleared', function() {
        scaledCtx.clearRect(0, 0, scaledCanvas.width, scaledCanvas.height);
    });

    app.EventManager.listen('symbol-drawn', function(canvas, orgSize, lastRect) {
        //Firstly we need to scale image
        var imageData = utils.scaleImage(canvas, orgSize, lastRect);

        //Then convert it
        var vector = utils.convertImage(imageData, scaledCanvas.width);

        //And pass to classification
        app.EventManager.fire('symbol-converted', vector);
    });
    var utils = {
        scaleImage : function(canvas, size, lastRect) {
            var size2 = size / 2;
            scaledCtx.clearRect(0, 0, scaledCanvas.width, scaledCanvas.height);
            scaledCtx.drawImage(canvas, lastRect.sx - size2, lastRect.sy - size2, lastRect.ex - lastRect.sx + size, lastRect.ey - lastRect.sy + size,
            //Target image
            0, 0, scaledCanvas.width, scaledCanvas.height);
            return scaledCtx.getImageData(0, 0, scaledCanvas.width, scaledCanvas.height).data;
        },
        convertImage : function(imgData, size) {
            var blocks = 5;
            var threshold = 128;
            var blockSize = Math.floor(size / blocks);

            var blockSum = [];
            //fill with zeros
            for(var i = 0; i < blocks; ++i) {
                blockSum[i] = [];
                for(var j = 0; j < blocks; ++j) {
                    blockSum[i][j] = 0;
                }
            }
            //count pixels in blocks
            for(var i = 0; i < imgData.length; i += 4) {
                var x = Math.floor(((i / 4) % size) / blockSize);
                var y = Math.floor(Math.floor(i / 4 / size) / blockSize);
                var total = imgData[i] + imgData[i + 1] + imgData[i + 2];
                if(total > threshold) {
                    blockSum[y][x]++;
                }
            }
            //flatten the result
            return _.flatten(blockSum, true);
        }
    };
}(this.app));
