(function() {
    var EventManager, __slice = Array.prototype.slice;
    EventManager = (function() {

        EventManager.prototype._listeners = null;

        function EventManager() {
            this._listeners = {};
        }


        EventManager.prototype.listen = function(eventName, func) {
            var _base;
            if((_base = this._listeners)[eventName] == null)
                _base[eventName] = [];
            return this._listeners[eventName].push(func);
        };

        EventManager.prototype.stopListening = function(eventName, func) {
            return this._listeners[eventName] = _.without(this._listeners[eventName], func);
        };

        EventManager.prototype.fire = function() {
            var args, eventName, _base, _this = this; eventName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
            if((_base = this._listeners)[eventName] == null)
                _base[eventName] = [];
            return _.defer(function() {
                return _this._listeners[eventName].forEach(function(func) {
                    return func.apply(_this, args);
                });
            });
        };
        return EventManager;

    })();

    app.EventManager = new EventManager;

}).call(this);
