(function() {
    var Canvas;
    Canvas = (function() {

        Canvas.prototype.canvas = null;

        Canvas.prototype.ctx = null;

        Canvas.prototype.state = {
            ctrl : false,
            drawing : false,
            pos : {
                x : -1,
                y : -1
            },
            lastRectangle : {
                sx : 99999999,
                sy : 99999999,
                ex : -1,
                ey : -1
            }
        };

        Canvas.prototype.size = 7;

        function Canvas(canvas) {
            var CTRL_KEY, SHIFT_KEY, body, _this = this;
            this.canvas = canvas;
            this.$canvas = $(canvas);
            this.ctx = canvas.getContext('2d');
            this.ctx.lineCap = "round";
            this.ctx.lineJoin = "round";
            this.ctx.lineWidth = this.size;
            this.ctx.strokeStyle = "#025D8C";
            this.ctx.fillStyle = "#025D8C";
            canvas.onselectstart = function() {
                return false;
            };
            canvas.addEventListener('mousedown', this._mouseDown.bind(this));
            canvas.addEventListener('mousemove', this._mouseMove.bind(this));
            body = document.body;
            body.addEventListener('mouseup', this._mouseUp.bind(this));
            CTRL_KEY = 17;
            SHIFT_KEY = 16;
            body.addEventListener('keydown', function(evt) {
                if((evt.keyCode === CTRL_KEY || evt.keyCode === SHIFT_KEY) && !_this.state.ctrl) {
                    _this.canvas.classList.add('drawing');
                    _this.clear();
                    _this.state.ctrl = true;
                    return app.EventManager.fire('symbol-started', _this.canvas);
                }
            });
            body.addEventListener('keyup', function(evt) {
                if(evt.keyCode === CTRL_KEY || evt.keyCode === SHIFT_KEY) {
                    _this.canvas.classList.remove('drawing');
                    _this.state.drawing = false;
                    app.EventManager.fire('symbol-drawn', _this.canvas, _this.size, _this.state.lastRectangle);
                    return _this.state.ctrl = false;
                }
            });
        }


        Canvas.prototype.clear = function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this._resetLastRect();
            return app.EventManager.fire('symbol-cleared');
        };

        Canvas.prototype._resetLastRect = function() {
            var lastRect;
            lastRect = this.state.lastRectangle;
            lastRect.sx = 1000000;
            lastRect.sy = 1000000;
            lastRect.ex = -1;
            return lastRect.ey = -1;
        };

        Canvas.prototype._getPos = function(evt) {
            var offset;
            offset = this.$canvas.offset();
            return [evt.pageX - offset.left, evt.pageY - offset.top];
        };

        Canvas.prototype._currentPos = function(x, y) {
            var lastRect;
            this.state.pos.x = x;
            this.state.pos.y = y;
            lastRect = this.state.lastRectangle;
            if(x < lastRect.sx)
                lastRect.sx = x;
            if(x > lastRect.ex)
                lastRect.ex = x;
            if(y < lastRect.sy)
                lastRect.sy = y;
            if(y > lastRect.ey)
                return lastRect.ey = y;
        };

        Canvas.prototype._mouseDown = function(evt) {
            var x, y, _ref; _ref = this._getPos(evt), x = _ref[0], y = _ref[1];
            this._currentPos(x, y);
            if(evt.ctrlKey || evt.shiftKey)
                return this.state.drawing = true;
        };

        Canvas.prototype._mouseUp = function(evt) {
            if(this.state.drawing) {
                this.state.drawing = false;
                this.ctx.beginPath();
                this.ctx.arc(this.state.pos.x, this.state.pos.y, this.size / 2, 0, 2 * Math.PI, true);
                return this.ctx.fill();
            }
        };

        Canvas.prototype._mouseMove = function(evt) {
            var x, y, _ref;
            if(this.state.drawing) { _ref = this._getPos(evt), x = _ref[0], y = _ref[1];
                this.ctx.beginPath();
                this.ctx.moveTo(this.state.pos.x, this.state.pos.y);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                return this._currentPos(x, y);
            }
        };
        return Canvas;

    })();

    app.canvas = new Canvas(document.getElementById('canvas'));

}).call(this);
