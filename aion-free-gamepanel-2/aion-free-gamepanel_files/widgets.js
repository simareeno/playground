(function(resolver) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = resolver();
	} else if (typeof define === 'function' && define.amd) {
		define(["module"], resolver);
	} else {
		var _global;
		if (typeof window !== 'undefined') {
			_global = window;
		} else if (typeof global !== 'undefined') {
			_global = global;
		} else if (typeof self !== 'undefined') {
			_global = self;
		} else {
			_global = this;
		}
		var config = _global['WebComponents'];
		typeof(config) !== 'object' && (config = void(0));
		_global['WebComponents'] = resolver({
			config: function() {
				return config;
			}
		});
	}
})(function(module) {
	// Fix for xpath library
	var Functions, Utilities;

	// Custom require factory
	var require = (function(dependencyList, modules) {
		return function(moduleName) {
			return modules[dependencyList.indexOf(moduleName)];
		};
	})(["module"], arguments), require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Standalone extraction of Backbone.Events, no external dependency required.
 * Degrades nicely when Backone/underscore are already available in the current
 * global context.
 *
 * Note that docs suggest to use underscore's `_.extend()` method to add Events
 * support to some given object. A `mixin()` method has been added to the Events
 * prototype to avoid using underscore for that sole purpose:
 *
 *     var myEventEmitter = BackboneEvents.mixin({});
 *
 * Or for a function constructor:
 *
 *     function MyConstructor(){}
 *     MyConstructor.prototype.foo = function(){}
 *     BackboneEvents.mixin(MyConstructor.prototype);
 *
 * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
 * (c) 2013 Nicolas Perriault
 */
/* global exports:true, define, module */
"use strict";

(function () {
  var root = this,
      nativeForEach = Array.prototype.forEach,
      hasOwnProperty = Object.prototype.hasOwnProperty,
      slice = Array.prototype.slice,
      idCounter = 0;

  // Returns a partial implementation matching the minimal API subset required
  // by Backbone.Events
  function miniscore() {
    return {
      keys: Object.keys || function (obj) {
        if (typeof obj !== "object" && typeof obj !== "function" || obj === null) {
          throw new TypeError("keys() called on a non-object");
        }
        var key,
            keys = [];
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            keys[keys.length] = key;
          }
        }
        return keys;
      },

      uniqueId: function uniqueId(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
      },

      has: function has(obj, key) {
        return hasOwnProperty.call(obj, key);
      },

      each: function each(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
          obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
          for (var i = 0, l = obj.length; i < l; i++) {
            iterator.call(context, obj[i], i, obj);
          }
        } else {
          for (var key in obj) {
            if (this.has(obj, key)) {
              iterator.call(context, obj[key], key, obj);
            }
          }
        }
      },

      once: function once(func) {
        var ran = false,
            memo;
        return function () {
          if (ran) return memo;
          ran = true;
          memo = func.apply(this, arguments);
          func = null;
          return memo;
        };
      }
    };
  }

  var _ = miniscore(),
      Events;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function on(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({ callback: callback, context: context, ctx: context || this });
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function once(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function () {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function off(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if (callback && callback !== ev.callback && callback !== ev.callback._callback || context && context !== ev.context) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function trigger(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function stopListening(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return this;
      var deleteListener = !name && !callback;
      if (typeof name === 'object') callback = this;
      if (obj) (listeners = {})[obj._listenerId] = obj;
      for (var id in listeners) {
        listeners[id].off(name, callback, this);
        if (deleteListener) delete this._listeners[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function eventsApi(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function triggerEvents(events, args) {
    var ev,
        i = -1,
        l = events.length,
        a1 = args[0],
        a2 = args[1],
        a3 = args[2];
    switch (args.length) {
      case 0:
        while (++i < l) (ev = events[i]).callback.call(ev.ctx);return;
      case 1:
        while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1);return;
      case 2:
        while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2);return;
      case 3:
        while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);return;
      default:
        while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = { listenTo: 'on', listenToOnce: 'once' };

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function (implementation, method) {
    Events[method] = function (obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
      listeners[id] = obj;
      if (typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind = Events.on;
  Events.unbind = Events.off;

  // Mixin utility
  Events.mixin = function (proto) {
    var exports = ['on', 'once', 'off', 'trigger', 'stopListening', 'listenTo', 'listenToOnce', 'bind', 'unbind'];
    _.each(exports, function (name) {
      proto[name] = this[name];
    }, this);
    return proto;
  };

  // Export Events as BackboneEvents depending on current context
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Events;
    }
    exports.BackboneEvents = Events;
  } else if (typeof define === "function" && typeof define.amd == "object") {
    define(function () {
      return Events;
    });
  } else {
    root.BackboneEvents = Events;
  }
})(undefined);

},{}],2:[function(require,module,exports){
'use strict';

module.exports = require('./backbone-events-standalone');

},{"./backbone-events-standalone":1}],3:[function(require,module,exports){
"use strict";

},{}],4:[function(require,module,exports){
// shim for using process in browser
'use strict';

var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
    try {
        cachedSetTimeout = setTimeout;
    } catch (e) {
        cachedSetTimeout = function () {
            throw new Error('setTimeout is not defined');
        };
    }
    try {
        cachedClearTimeout = clearTimeout;
    } catch (e) {
        cachedClearTimeout = function () {
            throw new Error('clearTimeout is not defined');
        };
    }
})();
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        return setTimeout(fun, 0);
    } else {
        return cachedSetTimeout.call(null, fun, 0);
    }
}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        clearTimeout(marker);
    } else {
        cachedClearTimeout.call(null, marker);
    }
}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () {
    return '/';
};
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function () {
    return 0;
};

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utils = require('./utils');

var _asap = require('./asap');

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var GET_THEN_ERROR = new ErrorObject();

function selfFullfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    GET_THEN_ERROR.error = error;
    return GET_THEN_ERROR;
  }
}

function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
  try {
    then.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then) {
  (0, _asap.asap)(function (promise) {
    var sealed = false;
    var error = tryThen(then, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      resolve(promise, value);
    }, function (reason) {
      reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable) {
  if (maybeThenable.constructor === promise.constructor) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    var then = getThen(maybeThenable);

    if (then === GET_THEN_ERROR) {
      reject(promise, GET_THEN_ERROR.error);
    } else if (then === undefined) {
      fulfill(promise, maybeThenable);
    } else if ((0, _utils.isFunction)(then)) {
      handleForeignThenable(promise, maybeThenable, then);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFullfillment());
  } else if ((0, _utils.objectOrFunction)(value)) {
    handleMaybeThenable(promise, value);
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    (0, _asap.asap)(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  (0, _asap.asap)(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var subscribers = parent._subscribers;
  var length = subscribers.length;

  parent._onerror = null;

  subscribers[length] = child;
  subscribers[length + FULFILLED] = onFulfillment;
  subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    (0, _asap.asap)(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child,
      callback,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function ErrorObject() {
  this.error = null;
}

var TRY_CATCH_ERROR = new ErrorObject();

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = (0, _utils.isFunction)(callback),
      value,
      error,
      succeeded,
      failed;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
      resolve(promise, value);
    } else if (failed) {
      reject(promise, error);
    } else if (settled === FULFILLED) {
      fulfill(promise, value);
    } else if (settled === REJECTED) {
      reject(promise, value);
    }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

exports.noop = noop;
exports.resolve = resolve;
exports.reject = reject;
exports.fulfill = fulfill;
exports.subscribe = subscribe;
exports.publish = publish;
exports.publishRejection = publishRejection;
exports.initializePromise = initializePromise;
exports.invokeCallback = invokeCallback;
exports.FULFILLED = FULFILLED;
exports.REJECTED = REJECTED;
exports.PENDING = PENDING;

},{"./asap":6,"./utils":13}],6:[function(require,module,exports){
(function (process){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.setScheduler = setScheduler;
exports.setAsap = setAsap;
var len = 0;
var toString = ({}).toString;
var vertxNext;
var customSchedulerFn;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

exports.asap = asap;

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  exports.asap = asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  var nextTick = process.nextTick;
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // setImmediate should be used instead instead
  var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
  if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
    nextTick = setImmediate;
  }
  return function () {
    nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  return function () {
    vertxNext(flush);
  };
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  return function () {
    setTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertex() {
  try {
    var r = require;
    var vertx = r('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertex();
} else {
  scheduleFlush = useSetTimeout();
}

}).call(this,require('_process'))
},{"_process":4}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utils = require('./utils');

var _internal = require('./-internal');

function Enumerator(Constructor, input) {
  var enumerator = this;

  enumerator._instanceConstructor = Constructor;
  enumerator.promise = new Constructor(_internal.noop);

  if (enumerator._validateInput(input)) {
    enumerator._input = input;
    enumerator.length = input.length;
    enumerator._remaining = input.length;

    enumerator._init();

    if (enumerator.length === 0) {
      (0, _internal.fulfill)(enumerator.promise, enumerator._result);
    } else {
      enumerator.length = enumerator.length || 0;
      enumerator._enumerate();
      if (enumerator._remaining === 0) {
        (0, _internal.fulfill)(enumerator.promise, enumerator._result);
      }
    }
  } else {
    (0, _internal.reject)(enumerator.promise, enumerator._validationError());
  }
}

Enumerator.prototype._validateInput = function (input) {
  return (0, _utils.isArray)(input);
};

Enumerator.prototype._validationError = function () {
  return new Error('Array Methods must be provided an Array');
};

Enumerator.prototype._init = function () {
  this._result = new Array(this.length);
};

exports['default'] = Enumerator;

Enumerator.prototype._enumerate = function () {
  var enumerator = this;

  var length = enumerator.length;
  var promise = enumerator.promise;
  var input = enumerator._input;

  for (var i = 0; promise._state === _internal.PENDING && i < length; i++) {
    enumerator._eachEntry(input[i], i);
  }
};

Enumerator.prototype._eachEntry = function (entry, i) {
  var enumerator = this;
  var c = enumerator._instanceConstructor;

  if ((0, _utils.isMaybeThenable)(entry)) {
    if (entry.constructor === c && entry._state !== _internal.PENDING) {
      entry._onerror = null;
      enumerator._settledAt(entry._state, i, entry._result);
    } else {
      enumerator._willSettleAt(c.resolve(entry), i);
    }
  } else {
    enumerator._remaining--;
    enumerator._result[i] = entry;
  }
};

Enumerator.prototype._settledAt = function (state, i, value) {
  var enumerator = this;
  var promise = enumerator.promise;

  if (promise._state === _internal.PENDING) {
    enumerator._remaining--;

    if (state === _internal.REJECTED) {
      (0, _internal.reject)(promise, value);
    } else {
      enumerator._result[i] = value;
    }
  }

  if (enumerator._remaining === 0) {
    (0, _internal.fulfill)(promise, enumerator._result);
  }
};

Enumerator.prototype._willSettleAt = function (promise, i) {
  var enumerator = this;

  (0, _internal.subscribe)(promise, undefined, function (value) {
    enumerator._settledAt(_internal.FULFILLED, i, value);
  }, function (reason) {
    enumerator._settledAt(_internal.REJECTED, i, reason);
  });
};
module.exports = exports['default'];

},{"./-internal":5,"./utils":13}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('./utils');

var _internal = require('./-internal');

var _asap = require('./asap');

var _promiseAll = require('./promise/all');

var _promiseAll2 = _interopRequireDefault(_promiseAll);

var _promiseRace = require('./promise/race');

var _promiseRace2 = _interopRequireDefault(_promiseRace);

var _promiseResolve = require('./promise/resolve');

var _promiseResolve2 = _interopRequireDefault(_promiseResolve);

var _promiseReject = require('./promise/reject');

var _promiseReject2 = _interopRequireDefault(_promiseReject);

var counter = 0;

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

exports['default'] = Promise;

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  var promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      var xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {function} resolver
  Useful for tooling.
  @constructor
*/
function Promise(resolver) {
  this._id = counter++;
  this._state = undefined;
  this._result = undefined;
  this._subscribers = [];

  if (_internal.noop !== resolver) {
    if (!(0, _utils.isFunction)(resolver)) {
      needsResolver();
    }

    if (!(this instanceof Promise)) {
      needsNew();
    }

    (0, _internal.initializePromise)(this, resolver);
  }
}

Promise.all = _promiseAll2['default'];
Promise.race = _promiseRace2['default'];
Promise.resolve = _promiseResolve2['default'];
Promise.reject = _promiseReject2['default'];
Promise._setScheduler = _asap.setScheduler;
Promise._setAsap = _asap.setAsap;
Promise._asap = _asap.asap;

Promise.prototype = {
  constructor: Promise,

  /**
    The primary way of interacting with a promise is through its `then` method,
    which registers callbacks to receive either a promise's eventual value or the
    reason why the promise cannot be fulfilled.
  
    ```js
    findUser().then(function(user){
      // user is available
    }, function(reason){
      // user is unavailable, and you are given the reason why
    });
    ```
  
    Chaining
    --------
  
    The return value of `then` is itself a promise.  This second, 'downstream'
    promise is resolved with the return value of the first promise's fulfillment
    or rejection handler, or rejected if the handler throws an exception.
  
    ```js
    findUser().then(function (user) {
      return user.name;
    }, function (reason) {
      return 'default name';
    }).then(function (userName) {
      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
      // will be `'default name'`
    });
  
    findUser().then(function (user) {
      throw new Error('Found user, but still unhappy');
    }, function (reason) {
      throw new Error('`findUser` rejected and we're unhappy');
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
    });
    ```
    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
  
    ```js
    findUser().then(function (user) {
      throw new PedagogicalException('Upstream error');
    }).then(function (value) {
      // never reached
    }).then(function (value) {
      // never reached
    }, function (reason) {
      // The `PedgagocialException` is propagated all the way down to here
    });
    ```
  
    Assimilation
    ------------
  
    Sometimes the value you want to propagate to a downstream promise can only be
    retrieved asynchronously. This can be achieved by returning a promise in the
    fulfillment or rejection handler. The downstream promise will then be pending
    until the returned promise is settled. This is called *assimilation*.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // The user's comments are now available
    });
    ```
  
    If the assimliated promise rejects, then the downstream promise will also reject.
  
    ```js
    findUser().then(function (user) {
      return findCommentsByAuthor(user);
    }).then(function (comments) {
      // If `findCommentsByAuthor` fulfills, we'll have the value here
    }, function (reason) {
      // If `findCommentsByAuthor` rejects, we'll have the reason here
    });
    ```
  
    Simple Example
    --------------
  
    Synchronous Example
  
    ```javascript
    var result;
  
    try {
      result = findResult();
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
    findResult(function(result, err){
      if (err) {
        // failure
      } else {
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findResult().then(function(result){
      // success
    }, function(reason){
      // failure
    });
    ```
  
    Advanced Example
    --------------
  
    Synchronous Example
  
    ```javascript
    var author, books;
  
    try {
      author = findAuthor();
      books  = findBooksByAuthor(author);
      // success
    } catch(reason) {
      // failure
    }
    ```
  
    Errback Example
  
    ```js
  
    function foundBooks(books) {
  
    }
  
    function failure(reason) {
  
    }
  
    findAuthor(function(author, err){
      if (err) {
        failure(err);
        // failure
      } else {
        try {
          findBoooksByAuthor(author, function(books, err) {
            if (err) {
              failure(err);
            } else {
              try {
                foundBooks(books);
              } catch(reason) {
                failure(reason);
              }
            }
          });
        } catch(error) {
          failure(err);
        }
        // success
      }
    });
    ```
  
    Promise Example;
  
    ```javascript
    findAuthor().
      then(findBooksByAuthor).
      then(function(books){
        // found books
    }).catch(function(reason){
      // something went wrong
    });
    ```
  
    @method then
    @param {Function} onFulfilled
    @param {Function} onRejected
    Useful for tooling.
    @return {Promise}
  */
  then: function then(onFulfillment, onRejection) {
    var parent = this;
    var state = parent._state;

    if (state === _internal.FULFILLED && !onFulfillment || state === _internal.REJECTED && !onRejection) {
      return this;
    }

    var child = new this.constructor(_internal.noop);
    var result = parent._result;

    if (state) {
      var callback = arguments[state - 1];
      (0, _asap.asap)(function () {
        (0, _internal.invokeCallback)(state, child, callback, result);
      });
    } else {
      (0, _internal.subscribe)(parent, child, onFulfillment, onRejection);
    }

    return child;
  },

  /**
    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
    as the catch block of a try/catch statement.
  
    ```js
    function findAuthor(){
      throw new Error('couldn't find that author');
    }
  
    // synchronous
    try {
      findAuthor();
    } catch(reason) {
      // something went wrong
    }
  
    // async with promises
    findAuthor().catch(function(reason){
      // something went wrong
    });
    ```
  
    @method catch
    @param {Function} onRejection
    Useful for tooling.
    @return {Promise}
  */
  'catch': function _catch(onRejection) {
    return this.then(null, onRejection);
  }
};
module.exports = exports['default'];

},{"./-internal":5,"./asap":6,"./promise/all":9,"./promise/race":10,"./promise/reject":11,"./promise/resolve":12,"./utils":13}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = all;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _enumerator = require('../enumerator');

var _enumerator2 = _interopRequireDefault(_enumerator);

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  var promise1 = resolve(1);
  var promise2 = resolve(2);
  var promise3 = resolve(3);
  var promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  var promise1 = resolve(1);
  var promise2 = reject(new Error("2"));
  var promise3 = reject(new Error("3"));
  var promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/

function all(entries) {
  return new _enumerator2['default'](this, entries).promise;
}

module.exports = exports['default'];

},{"../enumerator":7}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = race;

var _utils = require("../utils");

var _internal = require('../-internal');

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  var promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  var promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  var promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  var promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/

function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  var promise = new Constructor(_internal.noop);

  if (!(0, _utils.isArray)(entries)) {
    (0, _internal.reject)(promise, new TypeError('You must pass an array to race.'));
    return promise;
  }

  var length = entries.length;

  function onFulfillment(value) {
    (0, _internal.resolve)(promise, value);
  }

  function onRejection(reason) {
    (0, _internal.reject)(promise, reason);
  }

  for (var i = 0; promise._state === _internal.PENDING && i < length; i++) {
    (0, _internal.subscribe)(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
  }

  return promise;
}

module.exports = exports['default'];

},{"../-internal":5,"../utils":13}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = reject;

var _internal = require('../-internal');

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  var promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  var promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/

function reject(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(_internal.noop);
  (0, _internal.reject)(promise, reason);
  return promise;
}

module.exports = exports['default'];

},{"../-internal":5}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = resolve;

var _internal = require('../-internal');

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  var promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  var promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/

function resolve(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(_internal.noop);
  (0, _internal.resolve)(promise, object);
  return promise;
}

module.exports = exports['default'];

},{"../-internal":5}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.objectOrFunction = objectOrFunction;
exports.isFunction = isFunction;
exports.isMaybeThenable = isMaybeThenable;

function objectOrFunction(x) {
  return typeof x === 'function' || typeof x === 'object' && x !== null;
}

function isFunction(x) {
  return typeof x === 'function';
}

function isMaybeThenable(x) {
  return typeof x === 'object' && x !== null;
}

var _isArray;
if (!Array.isArray) {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
} else {
  _isArray = Array.isArray;
}

var isArray = _isArray;
exports.isArray = isArray;

},{}],14:[function(require,module,exports){
/**
 * FastDom
 *
 * Eliminates layout thrashing
 * by batching DOM read/write
 * interactions.
 *
 * @author Wilson Page <wilsonpage@me.com>
 */

'use strict';

;(function (fastdom) {

  'use strict';

  // Normalize rAF
  var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function (cb) {
    return window.setTimeout(cb, 1000 / 60);
  };

  /**
   * Creates a fresh
   * FastDom instance.
   *
   * @constructor
   */
  function FastDom() {
    this.frames = [];
    this.lastId = 0;

    // Placing the rAF method
    // on the instance allows
    // us to replace it with
    // a stub for testing.
    this.raf = raf;

    this.batch = {
      hash: {},
      read: [],
      write: [],
      mode: null
    };
  }

  /**
   * Adds a job to the
   * read batch and schedules
   * a new frame if need be.
   *
   * @param  {Function} fn
   * @public
   */
  FastDom.prototype.read = function (fn, ctx) {
    var job = this.add('read', fn, ctx);
    var id = job.id;

    // Add this job to the read queue
    this.batch.read.push(job.id);

    // We should *not* schedule a new frame if:
    // 1. We're 'reading'
    // 2. A frame is already scheduled
    var doesntNeedFrame = this.batch.mode === 'reading' || this.batch.scheduled;

    // If a frame isn't needed, return
    if (doesntNeedFrame) return id;

    // Schedule a new
    // frame, then return
    this.scheduleBatch();
    return id;
  };

  /**
   * Adds a job to the
   * write batch and schedules
   * a new frame if need be.
   *
   * @param  {Function} fn
   * @public
   */
  FastDom.prototype.write = function (fn, ctx) {
    var job = this.add('write', fn, ctx);
    var mode = this.batch.mode;
    var id = job.id;

    // Push the job id into the queue
    this.batch.write.push(job.id);

    // We should *not* schedule a new frame if:
    // 1. We are 'writing'
    // 2. We are 'reading'
    // 3. A frame is already scheduled.
    var doesntNeedFrame = mode === 'writing' || mode === 'reading' || this.batch.scheduled;

    // If a frame isn't needed, return
    if (doesntNeedFrame) return id;

    // Schedule a new
    // frame, then return
    this.scheduleBatch();
    return id;
  };

  /**
   * Defers the given job
   * by the number of frames
   * specified.
   *
   * If no frames are given
   * then the job is run in
   * the next free frame.
   *
   * @param  {Number}   frame
   * @param  {Function} fn
   * @public
   */
  FastDom.prototype.defer = function (frame, fn, ctx) {

    // Accepts two arguments
    if (typeof frame === 'function') {
      ctx = fn;
      fn = frame;
      frame = 1;
    }

    var self = this;
    var index = frame - 1;

    return this.schedule(index, function () {
      self.run({
        fn: fn,
        ctx: ctx
      });
    });
  };

  /**
   * Clears a scheduled 'read',
   * 'write' or 'defer' job.
   *
   * @param  {Number|String} id
   * @public
   */
  FastDom.prototype.clear = function (id) {

    // Defer jobs are cleared differently
    if (typeof id === 'function') {
      return this.clearFrame(id);
    }

    // Allow ids to be passed as strings
    id = Number(id);

    var job = this.batch.hash[id];
    if (!job) return;

    var list = this.batch[job.type];
    var index = list.indexOf(id);

    // Clear references
    delete this.batch.hash[id];
    if (~index) list.splice(index, 1);
  };

  /**
   * Clears a scheduled frame.
   *
   * @param  {Function} frame
   * @private
   */
  FastDom.prototype.clearFrame = function (frame) {
    var index = this.frames.indexOf(frame);
    if (~index) this.frames.splice(index, 1);
  };

  /**
   * Schedules a new read/write
   * batch if one isn't pending.
   *
   * @private
   */
  FastDom.prototype.scheduleBatch = function () {
    var self = this;

    // Schedule batch for next frame
    this.schedule(0, function () {
      self.batch.scheduled = false;
      self.runBatch();
    });

    // Set flag to indicate
    // a frame has been scheduled
    this.batch.scheduled = true;
  };

  /**
   * Generates a unique
   * id for a job.
   *
   * @return {Number}
   * @private
   */
  FastDom.prototype.uniqueId = function () {
    return ++this.lastId;
  };

  /**
   * Calls each job in
   * the list passed.
   *
   * If a context has been
   * stored on the function
   * then it is used, else the
   * current `this` is used.
   *
   * @param  {Array} list
   * @private
   */
  FastDom.prototype.flush = function (list) {
    var id;

    while (id = list.shift()) {
      this.run(this.batch.hash[id]);
    }
  };

  /**
   * Runs any 'read' jobs followed
   * by any 'write' jobs.
   *
   * We run this inside a try catch
   * so that if any jobs error, we
   * are able to recover and continue
   * to flush the batch until it's empty.
   *
   * @private
   */
  FastDom.prototype.runBatch = function () {
    try {

      // Set the mode to 'reading',
      // then empty all read jobs
      this.batch.mode = 'reading';
      this.flush(this.batch.read);

      // Set the mode to 'writing'
      // then empty all write jobs
      this.batch.mode = 'writing';
      this.flush(this.batch.write);

      this.batch.mode = null;
    } catch (e) {
      this.runBatch();
      throw e;
    }
  };

  /**
   * Adds a new job to
   * the given batch.
   *
   * @param {Array}   list
   * @param {Function} fn
   * @param {Object}   ctx
   * @returns {Number} id
   * @private
   */
  FastDom.prototype.add = function (type, fn, ctx) {
    var id = this.uniqueId();
    return this.batch.hash[id] = {
      id: id,
      fn: fn,
      ctx: ctx,
      type: type
    };
  };

  /**
   * Runs a given job.
   *
   * Applications using FastDom
   * have the options of setting
   * `fastdom.onError`.
   *
   * This will catch any
   * errors that may throw
   * inside callbacks, which
   * is useful as often DOM
   * nodes have been removed
   * since a job was scheduled.
   *
   * Example:
   *
   *   fastdom.onError = function(e) {
   *     // Runs when jobs error
   *   };
   *
   * @param  {Object} job
   * @private
   */
  FastDom.prototype.run = function (job) {
    var ctx = job.ctx || this;
    var fn = job.fn;

    // Clear reference to the job
    delete this.batch.hash[job.id];

    // If no `onError` handler
    // has been registered, just
    // run the job normally.
    if (!this.onError) {
      return fn.call(ctx);
    }

    // If an `onError` handler
    // has been registered, catch
    // errors that throw inside
    // callbacks, and run the
    // handler instead.
    try {
      fn.call(ctx);
    } catch (e) {
      this.onError(e);
    }
  };

  /**
   * Starts a rAF loop
   * to empty the frame queue.
   *
   * @private
   */
  FastDom.prototype.loop = function () {
    var self = this;
    var raf = this.raf;

    // Don't start more than one loop
    if (this.looping) return;

    raf(function frame() {
      var fn = self.frames.shift();

      // If no more frames,
      // stop looping
      if (!self.frames.length) {
        self.looping = false;

        // Otherwise, schedule the
        // next frame
      } else {
          raf(frame);
        }

      // Run the frame.  Note that
      // this may throw an error
      // in user code, but all
      // fastdom tasks are dealt
      // with already so the code
      // will continue to iterate
      if (fn) fn();
    });

    this.looping = true;
  };

  /**
   * Adds a function to
   * a specified index
   * of the frame queue.
   *
   * @param  {Number}   index
   * @param  {Function} fn
   * @return {Function}
   * @private
   */
  FastDom.prototype.schedule = function (index, fn) {

    // Make sure this slot
    // hasn't already been
    // taken. If it has, try
    // re-scheduling for the next slot
    if (this.frames[index]) {
      return this.schedule(index + 1, fn);
    }

    // Start the rAF
    // loop to empty
    // the frame queue
    this.loop();

    // Insert this function into
    // the frames queue and return
    return this.frames[index] = fn;
  };

  // We only ever want there to be
  // one instance of FastDom in an app
  fastdom = fastdom || new FastDom();

  /**
   * Expose 'fastdom'
   */

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = fastdom;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return fastdom;
    });
  } else {
    window['fastdom'] = fastdom;
  }
})(window.fastdom);

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var ATTR_IGNORE = 'data-skate-ignore';
exports.ATTR_IGNORE = ATTR_IGNORE;
var TYPE_ATTRIBUTE = 'a';
exports.TYPE_ATTRIBUTE = TYPE_ATTRIBUTE;
var TYPE_CLASSNAME = 'c';
exports.TYPE_CLASSNAME = TYPE_CLASSNAME;
var TYPE_ELEMENT = 't';
exports.TYPE_ELEMENT = TYPE_ELEMENT;

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (element) {
  var namespace = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  var data = element.__SKATE_DATA || (element.__SKATE_DATA = {});
  return namespace && (data[namespace] || (data[namespace] = {})) || data;
};

module.exports = exports['default'];

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _globals = require('./globals');

var _globals2 = _interopRequireDefault(_globals);

var _lifecycle = require('./lifecycle');

var _mutationObserver = require('./mutation-observer');

var _mutationObserver2 = _interopRequireDefault(_mutationObserver);

var _utils = require('./utils');

/**
 * The document observer handler.
 *
 * @param {Array} mutations The mutations to handle.
 *
 * @returns {undefined}
 */
function documentObserverHandler(mutations) {
  var mutationsLen = mutations.length;

  for (var a = 0; a < mutationsLen; a++) {
    var mutation = mutations[a];
    var addedNodes = mutation.addedNodes;
    var removedNodes = mutation.removedNodes;

    // Since siblings are batched together, we check the first node's parent
    // node to see if it is ignored. If it is then we don't process any added
    // nodes. This prevents having to check every node.
    if (addedNodes && addedNodes.length && !(0, _utils.getClosestIgnoredElement)(addedNodes[0].parentNode)) {
      (0, _lifecycle.initElements)(addedNodes);
    }

    // We can't check batched nodes here because they won't have a parent node.
    if (removedNodes && removedNodes.length) {
      (0, _lifecycle.removeElements)(removedNodes);
    }
  }
}

/**
 * Creates a new mutation observer for listening to Skate definitions for the
 * document.
 *
 * @param {Element} root The element to observe.
 *
 * @returns {MutationObserver}
 */
function createDocumentObserver() {
  var observer = new _mutationObserver2['default'](documentObserverHandler);

  // Observe after the DOM content has loaded.
  observer.observe(document, {
    childList: true,
    subtree: true
  });

  return observer;
}

exports['default'] = {
  register: function register(fixIe) {
    // IE has issues with reporting removedNodes correctly. See the polyfill for
    // details. If we fix IE, we must also re-define the document observer.
    if (fixIe) {
      _mutationObserver2['default'].fixIe();
      this.unregister();
    }

    if (!_globals2['default'].observer) {
      _globals2['default'].observer = createDocumentObserver();
    }

    return this;
  },

  unregister: function unregister() {
    if (_globals2['default'].observer) {
      _globals2['default'].observer.disconnect();
      _globals2['default'].observer = undefined;
    }

    return this;
  }
};
module.exports = exports['default'];

},{"./globals":18,"./lifecycle":19,"./mutation-observer":20,"./utils":23}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
if (!window.__skate) {
  window.__skate = {
    observer: undefined,
    registry: {}
  };
}

exports['default'] = window.__skate;
module.exports = exports['default'];

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _constants = require('./constants');

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

var _mutationObserver = require('./mutation-observer');

var _mutationObserver2 = _interopRequireDefault(_mutationObserver);

var _registry = require('./registry');

var _registry2 = _interopRequireDefault(_registry);

var _utils = require('./utils');

var Node = window.Node;

var elProto = window.HTMLElement.prototype;
var nativeMatchesSelector = elProto.matches || elProto.msMatchesSelector || elProto.webkitMatchesSelector || elProto.mozMatchesSelector || elProto.oMatchesSelector;
// Only IE9 has this msMatchesSelector bug, but best to detect it.
var hasNativeMatchesSelectorDetattachedBug = !nativeMatchesSelector.call(document.createElement('div'), 'div');
var matchesSelector = function matchesSelector(element, selector) {
  if (hasNativeMatchesSelectorDetattachedBug) {
    var clone = element.cloneNode();
    document.createElement('div').appendChild(clone);
    return nativeMatchesSelector.call(clone, selector);
  }
  return nativeMatchesSelector.call(element, selector);
};

/**
 * Parses an event definition and returns information about it.
 *
 * @param {String} e The event to parse.
 *
 * @returns {Object]}
 */
function parseEvent(e) {
  var parts = e.split(' ');
  return {
    name: parts.shift(),
    delegate: parts.join(' ')
  };
}

/**
 * Sets the defined attributes to their default values, if specified.
 *
 * @param {Element} target The web component element.
 * @param {Object} component The web component definition.
 *
 * @returns {undefined}
 */
function initAttributes(target, component) {
  var componentAttributes = component.attributes;

  if (typeof componentAttributes !== 'object') {
    return;
  }

  for (var attribute in componentAttributes) {
    if ((0, _utils.hasOwn)(componentAttributes, attribute) && (0, _utils.hasOwn)(componentAttributes[attribute], 'value') && !target.hasAttribute(attribute)) {
      var value = componentAttributes[attribute].value;
      value = typeof value === 'function' ? value(target) : value;
      target.setAttribute(attribute, value);
    }
  }
}

/**
 * Defines a property that proxies the specified attribute.
 *
 * @param {Element} target The web component element.
 * @param {String} attribute The attribute name to proxy.
 *
 * @returns {undefined}
 */
function defineAttributeProperty(target, attribute, property) {
  Object.defineProperty(target, property, {
    get: function get() {
      return this.getAttribute(attribute);
    },
    set: function set(value) {
      if (value === undefined) {
        this.removeAttribute(attribute);
      } else {
        this.setAttribute(attribute, value);
      }
    }
  });
}

/**
 * Adds links from attributes to properties.
 *
 * @param {Element} target The web component element.
 * @param {Object} component The web component definition.
 *
 * @returns {undefined}
 */
function addAttributeToPropertyLinks(target, component) {
  var componentAttributes = component.attributes;

  if (typeof componentAttributes !== 'object') {
    return;
  }

  for (var attribute in componentAttributes) {
    var property = (0, _utils.camelCase)(attribute);
    if ((0, _utils.hasOwn)(componentAttributes, attribute) && !(0, _utils.hasOwn)(target, property)) {
      defineAttributeProperty(target, attribute, property);
    }
  }
}

function triggerAttributeChanged(target, component, data) {
  var callback;
  var type;
  var name = data.name;
  var newValue = data.newValue;
  var oldValue = data.oldValue;
  var newValueIsString = typeof newValue === 'string';
  var oldValueIsString = typeof oldValue === 'string';
  var attrs = component.attributes;
  var specific = attrs && attrs[name];

  if (!oldValueIsString && newValueIsString) {
    type = 'created';
  } else if (oldValueIsString && newValueIsString) {
    type = 'updated';
  } else if (oldValueIsString && !newValueIsString) {
    type = 'removed';
  }

  if (specific && typeof specific[type] === 'function') {
    callback = specific[type];
  } else if (specific && typeof specific.fallback === 'function') {
    callback = specific.fallback;
  } else if (typeof specific === 'function') {
    callback = specific;
  } else if (typeof attrs === 'function') {
    callback = attrs;
  }

  // Ensure values are null if undefined.
  newValue = newValue === undefined ? null : newValue;
  oldValue = oldValue === undefined ? null : oldValue;

  // There may still not be a callback.
  if (callback) {
    callback(target, {
      type: type,
      name: name,
      newValue: newValue,
      oldValue: oldValue
    });
  }
}

function triggerAttributesCreated(target, component) {
  var a;
  var attrs = target.attributes;
  var attrsCopy = [];
  var attrsLen = attrs.length;

  for (a = 0; a < attrsLen; a++) {
    attrsCopy.push(attrs[a]);
  }

  // In default web components, attribute changes aren't triggered for
  // attributes that already exist on an element when it is bound. This sucks
  // when you want to reuse and separate code for attributes away from your
  // lifecycle callbacks. Skate will initialise each attribute by calling the
  // created callback for the attributes that already exist on the element.
  for (a = 0; a < attrsLen; a++) {
    var attr = attrsCopy[a];
    triggerAttributeChanged(target, component, {
      name: attr.nodeName,
      newValue: attr.value || attr.nodeValue
    });
  }
}

function addAttributeListeners(target, component) {
  var attrs = target.attributes;

  if (!component.attributes || _registry2['default'].isNativeCustomElement(component.id)) {
    return;
  }

  var observer = new _mutationObserver2['default'](function (mutations) {
    mutations.forEach(function (mutation) {
      var name = mutation.attributeName;
      var attr = attrs[name];

      triggerAttributeChanged(target, component, {
        name: name,
        newValue: attr && (attr.value || attr.nodeValue),
        oldValue: mutation.oldValue
      });
    });
  });

  observer.observe(target, {
    attributes: true,
    attributeOldValue: true
  });
}

/**
 * Binds event listeners for the specified event handlers.
 *
 * @param {Element} target The component element.
 * @param {Object} component The component data.
 *
 * @returns {undefined}
 */
function addEventListeners(target, component) {
  if (typeof component.events !== 'object') {
    return;
  }

  function makeHandler(handler, delegate) {
    return function (e) {
      // If we're not delegating, trigger directly on the component element.
      if (!delegate) {
        return handler(target, e, target);
      }

      // If we're delegating, but the target doesn't match, then we've have
      // to go up the tree until we find a matching ancestor or stop at the
      // component element, or document. If a matching ancestor is found, the
      // handler is triggered on it.
      var current = e.target;

      while (current && current !== document && current !== target.parentNode) {
        if (matchesSelector(current, delegate)) {
          return handler(target, e, current);
        }

        current = current.parentNode;
      }
    };
  }

  (0, _utils.objEach)(component.events, function (handler, name) {
    var evt = parseEvent(name);
    var useCapture = !!evt.delegate && (evt.name === 'blur' || evt.name === 'focus');
    target.addEventListener(evt.name, makeHandler(handler, evt.delegate), useCapture);
  });
}

/**
 * Triggers the created lifecycle callback.
 *
 * @param {Element} target The component element.
 * @param {Object} component The component data.
 *
 * @returns {undefined}
 */
function triggerCreated(target, component) {
  var targetData = (0, _data2['default'])(target, component.id);

  if (targetData.created) {
    return;
  }

  targetData.created = true;

  // TODO: This doesn't need to happen if using native.
  (0, _utils.inherit)(target, component.prototype, true);

  // We use the unresolved / resolved attributes to flag whether or not the
  // element has been templated or not.
  if (component.template && !target.hasAttribute(component.resolvedAttribute)) {
    component.template(target);
  }

  target.removeAttribute(component.unresolvedAttribute);
  target.setAttribute(component.resolvedAttribute, '');
  addEventListeners(target, component);
  addAttributeListeners(target, component);
  addAttributeToPropertyLinks(target, component);
  initAttributes(target, component);
  triggerAttributesCreated(target, component);

  if (component.created) {
    component.created(target);
  }
}

/**
 * Triggers the attached lifecycle callback.
 *
 * @param {Element} target The component element.
 * @param {Object} component The component data.
 *
 * @returns {undefined}
 */
function triggerAttached(target, component) {
  var targetData = (0, _data2['default'])(target, component.id);

  if (targetData.attached) {
    return;
  }

  if (!(0, _utils.elementContains)(document, target)) {
    return;
  }

  targetData.attached = true;

  if (component.attached) {
    component.attached(target);
  }

  targetData.detached = false;
}

/**
 * Triggers the detached lifecycle callback.
 *
 * @param {Element} target The component element.
 * @param {Object} component The component data.
 *
 * @returns {undefined}
 */
function triggerDetached(target, component) {
  var targetData = (0, _data2['default'])(target, component.id);

  if (targetData.detached) {
    return;
  }

  targetData.detached = true;

  if (component.detached) {
    component.detached(target);
  }

  targetData.attached = false;
}

/**
 * Triggers the entire element lifecycle if it's not being ignored.
 *
 * @param {Element} target The component element.
 * @param {Object} component The component data.
 *
 * @returns {undefined}
 */
function triggerLifecycle(target, component) {
  triggerCreated(target, component);
  triggerAttached(target, component);
}

/**
 * Initialises a set of elements.
 *
 * @param {DOMNodeList | Array} elements A traversable set of elements.
 *
 * @returns {undefined}
 */
function initElements(elements) {
  // [CATION] Don't cache elements length! Components initialization could append nodes
  // as siblings (see label's element behaviour for example) and this could lead to problems with
  // components placed at the end of processing childNodes because they will change they index
  // position and get out of cached value range.
  for (var a = 0; a < elements.length; a++) {
    var element = elements[a];

    if (element.nodeType !== Node.ELEMENT_NODE || element.attributes[_constants.ATTR_IGNORE]) {
      continue;
    }

    var currentNodeDefinitions = _registry2['default'].getForElement(element);
    var currentNodeDefinitionsLength = currentNodeDefinitions.length;

    for (var b = 0; b < currentNodeDefinitionsLength; b++) {
      triggerLifecycle(element, currentNodeDefinitions[b]);
    }

    // When <object> tag is used to expose NPAPI api to js may have different behaviour then other
    // tags. One of those differences is that it's childNodes can be undefined.
    var elementChildNodes = element.childNodes || [];
    var elementChildNodesLen = elementChildNodes.length;

    if (elementChildNodesLen) {
      initElements(elementChildNodes);
    }
  }
}

/**
 * Triggers the remove lifecycle callback on all of the elements.
 *
 * @param {DOMNodeList} elements The elements to trigger the remove lifecycle
 * callback on.
 *
 * @returns {undefined}
 */
function removeElements(elements) {
  // Don't cache `childNodes` length. For more info see description in `initElements` function.
  for (var a = 0; a < elements.length; a++) {
    var element = elements[a];

    if (element.nodeType !== Node.ELEMENT_NODE) {
      continue;
    }

    removeElements(element.childNodes);

    var definitions = _registry2['default'].getForElement(element);
    var definitionsLen = definitions.length;

    for (var b = 0; b < definitionsLen; b++) {
      triggerDetached(element, definitions[b]);
    }
  }
}

exports.initElements = initElements;
exports.removeElements = removeElements;
exports.triggerAttached = triggerAttached;
exports.triggerAttributeChanged = triggerAttributeChanged;
exports.triggerCreated = triggerCreated;
exports.triggerDetached = triggerDetached;

},{"./constants":15,"./data":16,"./mutation-observer":20,"./registry":21,"./utils":23}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utils = require('./utils');

var Node = window.Node;
var Attr = window.Attr;

var NativeMutationObserver = window.MutationObserver || window.WebkitMutationObserver || window.MozMutationObserver;
var isFixingIe = false;
var isIe = window.navigator.userAgent.indexOf('Trident') > -1;

/**
 * Creates a new mutation record.
 *
 * @param {Element} target The HTML element that was affected.
 * @param {String} type The type of mutation.
 *
 * @returns {Object}
 */
function newMutationRecord(target, type) {
  return {
    addedNodes: null,
    attributeName: null,
    attributeNamespace: null,
    nextSibling: null,
    oldValue: null,
    previousSibling: null,
    removedNodes: null,
    target: target,
    type: type || 'childList'
  };
}

/**
 * Takes an element and recursively saves it's tree structure on each element so
 * that they can be restored later after IE screws things up.
 *
 * @param {Node} node The node to save the tree for.
 *
 * @returns {undefined}
 */
function walkTree(node, cb) {
  var childNodes = node.childNodes;

  if (!childNodes) {
    return;
  }

  var childNodesLen = childNodes.length;

  for (var a = 0; a < childNodesLen; a++) {
    var childNode = childNodes[a];
    cb(childNode);
    walkTree(childNode, cb);
  }
}

// Mutation Observer "Polyfill"
// ----------------------------

/**
 * This "polyfill" only polyfills what we need for Skate to function. It
 * batches updates and does the bare minimum during synchronous operation
 * which make mutation event performance bearable. The rest is batched on the
 * next tick. Like mutation observers, each mutation is divided into sibling
 * groups for each parent that had mutations. All attribute mutations are
 * batched into separate records regardless of the element they occured on.
 *
 * @param {Function} callback The callback to execute with the mutation info.
 *
 * @returns {undefined}
 */
function MutationObserver(callback) {
  if (NativeMutationObserver && !isFixingIe) {
    return new NativeMutationObserver(callback);
  }

  this.callback = callback;
  this.elements = [];
}

/**
 * IE 11 has a bug that prevents descendant nodes from being reported as removed
 * to a mutation observer in IE 11 if an ancestor node's innerHTML is reset.
 * This same bug also happens when using Mutation Events in IE 9 / 10. Because of
 * this, we must ensure that observers and events get triggered properly on
 * those descendant nodes. In order to do this we have to override `innerHTML`
 * and then manually trigger an event.
 *
 * See: https://connect.microsoft.com/IE/feedback/details/817132/ie-11-childnodes-are-missing-from-mutationobserver-mutations-removednodes-after-setting-innerhtml
 *
 * @returns {undefined}
 */
MutationObserver.fixIe = function () {
  // Fix once only if we need to.
  if (!isIe || isFixingIe) {
    return;
  }

  // We have to call the old innerHTML getter and setter.
  var oldInnerHTML = Object.getOwnPropertyDescriptor(_utils.elementPrototype, 'innerHTML');

  // This redefines the innerHTML property so that we can ensure that events
  // are properly triggered.
  Object.defineProperty(_utils.elementPrototype, 'innerHTML', {
    get: function get() {
      return oldInnerHTML.get.call(this);
    },
    set: function set(html) {
      walkTree(this, function (node) {
        var mutationEvent = document.createEvent('MutationEvent');
        mutationEvent.initMutationEvent('DOMNodeRemoved', true, false, null, null, null, null, null);
        node.dispatchEvent(mutationEvent);
      });

      oldInnerHTML.set.call(this, html);
    }
  });

  // Flag so the polyfill is used for all subsequent Mutation Observer objects.
  isFixingIe = true;
};

Object.defineProperty(MutationObserver, 'isFixingIe', {
  get: function get() {
    return isFixingIe;
  }
});

MutationObserver.prototype = {
  observe: function observe(target, options) {
    function addEventToBatch(e) {
      batchedEvents.push(e);
      batchEvents();
    }

    function batchEvent(e) {
      var eTarget = e.target;

      // In some test environments, e.target has been nulled after the tests
      // are done and a batch is still processing.
      if (!eTarget) {
        return;
      }

      var eType = e.type;
      var eTargetParent = eTarget.parentNode;

      if (!canTriggerInsertOrRemove(eTargetParent)) {
        return;
      }

      // The same bug that affects IE 11 also affects IE 9 / 10 with Mutation
      // Events.
      //
      // IE 11 bug: https://connect.microsoft.com/IE/feedback/details/817132/ie-11-childnodes-are-missing-from-mutationobserver-mutations-removednodes-after-setting-innerhtml
      var shouldWorkAroundIeRemoveBug = isFixingIe && eType === 'DOMNodeRemoved';
      var isDescendant = lastBatchedElement && lastBatchedElement.nodeType === Node.ELEMENT_NODE && (0, _utils.elementContains)(lastBatchedElement, eTarget);

      // This checks to see if the element is contained in the last batched
      // element. If it is, then we don't batch it because elements are
      // batched into first-children of a given parent. However, IE is (of
      // course) an exception to this and destroys the DOM tree heirarchy
      // before the callback gets fired if the element was removed. Because of
      // this, we have to let through all descendants that had the event
      // triggered on it.
      if (!shouldWorkAroundIeRemoveBug && isDescendant) {
        return;
      }

      if (!lastBatchedRecord || lastBatchedRecord.target !== eTargetParent) {
        batchedRecords.push(lastBatchedRecord = newMutationRecord(eTargetParent));
      }

      if (eType === 'DOMNodeInserted') {
        if (!lastBatchedRecord.addedNodes) {
          lastBatchedRecord.addedNodes = [];
        }

        lastBatchedRecord.addedNodes.push(eTarget);
      } else {
        if (!lastBatchedRecord.removedNodes) {
          lastBatchedRecord.removedNodes = [];
        }

        lastBatchedRecord.removedNodes.push(eTarget);
      }

      lastBatchedElement = eTarget;
    }

    function canTriggerAttributeModification(eTarget) {
      return options.attributes && (options.subtree || eTarget === target);
    }

    function canTriggerInsertOrRemove(eTargetParent) {
      return options.childList && (options.subtree || eTargetParent === target);
    }

    var that = this;

    // Batching insert and remove.
    var lastBatchedElement;
    var lastBatchedRecord;
    var batchedEvents = [];
    var batchedRecords = [];
    var batchEvents = (0, _utils.debounce)(function () {
      var batchedEventsLen = batchedEvents.length;

      for (var a = 0; a < batchedEventsLen; a++) {
        batchEvent(batchedEvents[a]);
      }

      that.callback(batchedRecords);
      batchedEvents = [];
      batchedRecords = [];
      lastBatchedElement = undefined;
      lastBatchedRecord = undefined;
    });

    // Batching attributes.
    var attributeOldValueCache = {};
    var attributeMutations = [];
    var batchAttributeMods = (0, _utils.debounce)(function () {
      // We keep track of the old length just in case attributes are
      // modified within a handler.
      var len = attributeMutations.length;

      // Call the handler with the current modifications.
      that.callback(attributeMutations);

      // We remove only up to the current point just in case more
      // modifications were queued.
      attributeMutations.splice(0, len);
    });

    var observed = {
      target: target,
      options: options,
      insertHandler: addEventToBatch,
      removeHandler: addEventToBatch,
      attributeHandler: function attributeHandler(e) {
        var eTarget = e.target;

        if (!(e.relatedNode instanceof Attr)) {
          // IE10 fires two mutation events for attributes, one with the
          // target as the relatedNode, and one where it's the attribute.
          //
          // Re: relatedNode, "In the case of the DOMAttrModified event
          // it indicates the Attr node which was modified, added, or
          // removed." [1]
          //
          // [1]: https://msdn.microsoft.com/en-us/library/ff943606%28v=vs.85%29.aspx
          return;
        }

        if (!canTriggerAttributeModification(eTarget)) {
          return;
        }

        var eAttrName = e.attrName;
        var ePrevValue = e.prevValue;
        var eNewValue = e.newValue;
        var record = newMutationRecord(eTarget, 'attributes');
        record.attributeName = eAttrName;

        if (options.attributeOldValue) {
          record.oldValue = attributeOldValueCache[eAttrName] || ePrevValue || null;
        }

        attributeMutations.push(record);

        // We keep track of old values so that when IE incorrectly reports
        // the old value we can ensure it is actually correct.
        if (options.attributeOldValue) {
          attributeOldValueCache[eAttrName] = eNewValue;
        }

        batchAttributeMods();
      }
    };

    this.elements.push(observed);

    if (options.childList) {
      target.addEventListener('DOMNodeInserted', observed.insertHandler);
      target.addEventListener('DOMNodeRemoved', observed.removeHandler);
    }

    if (options.attributes) {
      target.addEventListener('DOMAttrModified', observed.attributeHandler);
    }

    return this;
  },

  disconnect: function disconnect() {
    (0, _utils.objEach)(this.elements, function (observed) {
      observed.target.removeEventListener('DOMNodeInserted', observed.insertHandler);
      observed.target.removeEventListener('DOMNodeRemoved', observed.removeHandler);
      observed.target.removeEventListener('DOMAttrModified', observed.attributeHandler);
    });

    this.elements = [];

    return this;
  }
};

exports['default'] = MutationObserver;
module.exports = exports['default'];

},{"./utils":23}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _constants = require('./constants');

var _globals = require('./globals');

var _globals2 = _interopRequireDefault(_globals);

var _utils = require('./utils');

/**
 * Returns the class list for the specified element.
 *
 * @param {Element} element The element to get the class list for.
 *
 * @returns {ClassList | Array}
 */
function getClassList(element) {
  var classList = element.classList;

  if (classList) {
    return classList;
  }

  var attrs = element.attributes;

  return attrs['class'] && attrs['class'].nodeValue.split(/\s+/) || [];
}

exports['default'] = {
  clear: function clear() {
    _globals2['default'].registry = {};
    return this;
  },

  get: function get(id) {
    return (0, _utils.hasOwn)(_globals2['default'].registry, id) && _globals2['default'].registry[id];
  },

  getForElement: function getForElement(element) {
    var attrs = element.attributes;
    var attrsLen = attrs.length;
    var definitions = [];
    var isAttr = attrs.is;
    var isAttrValue = isAttr && (isAttr.value || isAttr.nodeValue);

    // Using localName as fallback for edge cases when processing <object> tag that is used
    // as inteface to NPAPI plugin.
    var tag = (element.tagName || element.localName).toLowerCase();
    var isAttrOrTag = isAttrValue || tag;
    var definition;
    var tagToExtend;

    if (this.isType(isAttrOrTag, _constants.TYPE_ELEMENT)) {
      definition = _globals2['default'].registry[isAttrOrTag];
      tagToExtend = definition['extends'];

      if (isAttrValue) {
        if (tag === tagToExtend) {
          definitions.push(definition);
        }
      } else if (!tagToExtend) {
        definitions.push(definition);
      }
    }

    for (var a = 0; a < attrsLen; a++) {
      var attr = attrs[a].nodeName;

      if (this.isType(attr, _constants.TYPE_ATTRIBUTE)) {
        definition = _globals2['default'].registry[attr];
        tagToExtend = definition['extends'];

        if (!tagToExtend || tag === tagToExtend) {
          definitions.push(definition);
        }
      }
    }

    var classList = getClassList(element);
    var classListLen = classList.length;

    for (var b = 0; b < classListLen; b++) {
      var className = classList[b];

      if (this.isType(className, _constants.TYPE_CLASSNAME)) {
        definition = _globals2['default'].registry[className];
        tagToExtend = definition['extends'];

        if (!tagToExtend || tag === tagToExtend) {
          definitions.push(definition);
        }
      }
    }

    return definitions;
  },

  isType: function isType(id, type) {
    var def = this.get(id);
    return def && def.type === type;
  },

  isNativeCustomElement: function isNativeCustomElement(id) {
    return (0, _utils.supportsNativeCustomElements)() && this.isType(id, _constants.TYPE_ELEMENT) && (0, _utils.isValidNativeCustomElementName)(id);
  },

  set: function set(id, definition) {
    if ((0, _utils.hasOwn)(_globals2['default'].registry, id)) {
      throw new Error('A component definition of type "' + definition.type + '" with the ID of "' + id + '" already exists.');
    }

    _globals2['default'].registry[id] = definition;

    return this;
  }
};
module.exports = exports['default'];

},{"./constants":15,"./globals":18,"./utils":23}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _constants = require('./constants');

var _documentObserver = require('./document-observer');

var _documentObserver2 = _interopRequireDefault(_documentObserver);

var _lifecycle = require('./lifecycle');

var _registry = require('./registry');

var _registry2 = _interopRequireDefault(_registry);

var _utils = require('./utils');

var _version = require('./version');

var _version2 = _interopRequireDefault(_version);

var HTMLElement = window.HTMLElement;

// IE <= 10 can fire "interactive" too early (#243).
var isOldIE = !!document.attachEvent; // attachEvent was removed in IE11.

function isReady() {
  if (isOldIE) {
    return document.readyState === 'complete';
  } else {
    return document.readyState === 'interactive' || document.readyState === 'complete';
  }
}

/**
 * Initialises all valid elements in the document. Ensures that it does not
 * happen more than once in the same execution, and that it happens after the DOM is ready.
 *
 * @returns {undefined}
 */
var initDocument = (0, _utils.debounce)(function () {
  var initialiseSkateElementsOnDomLoad = function initialiseSkateElementsOnDomLoad() {
    (0, _lifecycle.initElements)(document.documentElement.childNodes);
  };
  if (isReady()) {
    initialiseSkateElementsOnDomLoad();
  } else {
    if (isOldIE) {
      window.addEventListener('load', initialiseSkateElementsOnDomLoad);
    } else {
      document.addEventListener('DOMContentLoaded', initialiseSkateElementsOnDomLoad);
    }
  }
});

/**
 * Creates a constructor for the specified definition.
 *
 * @param {Object} definition The definition information to use for generating the constructor.
 *
 * @returns {Function} The element constructor.
 */
function makeElementConstructor(definition) {
  function CustomElement() {
    var element;
    var tagToExtend = definition['extends'];
    var definitionId = definition.id;

    if (tagToExtend) {
      element = document.createElement(tagToExtend);
      element.setAttribute('is', definitionId);
    } else {
      element = document.createElement(definitionId);
    }

    // Ensure the definition prototype is up to date with the element's
    // prototype. This ensures that overwriting the element prototype still
    // works.
    definition.prototype = CustomElement.prototype;

    // If they use the constructor we don't have to wait until it's attached.
    (0, _lifecycle.triggerCreated)(element, definition);

    return element;
  }

  // This allows modifications to the element prototype propagate to the
  // definition prototype.
  CustomElement.prototype = definition.prototype;

  return CustomElement;
}

// Public API
// ----------

/**
 * Creates a listener for the specified definition.
 *
 * @param {String} id The ID of the definition.
 * @param {Object | Function} definition The definition definition.
 *
 * @returns {Function} Constructor that returns a custom element.
 */
function skate(id, definition) {
  // Just in case the definition is shared, we duplicate it so that internal
  // modifications to the original aren't shared.
  definition = (0, _utils.inherit)({}, definition);
  definition = (0, _utils.inherit)(definition, skate.defaults);
  definition.id = id;

  _registry2['default'].set(id, definition);

  if (_registry2['default'].isNativeCustomElement(id)) {
    var elementPrototype = definition['extends'] ? document.createElement(definition['extends']).constructor.prototype : HTMLElement.prototype;

    if (!elementPrototype.isPrototypeOf(definition.prototype)) {
      definition.prototype = (0, _utils.inherit)(Object.create(elementPrototype), definition.prototype, true);
    }

    var options = {
      prototype: (0, _utils.inherit)(definition.prototype, {
        createdCallback: function createdCallback() {
          (0, _lifecycle.triggerCreated)(this, definition);
        },
        attachedCallback: function attachedCallback() {
          (0, _lifecycle.triggerAttached)(this, definition);
        },
        detachedCallback: function detachedCallback() {
          (0, _lifecycle.triggerDetached)(this, definition);
        },
        attributeChangedCallback: function attributeChangedCallback(name, oldValue, newValue) {
          (0, _lifecycle.triggerAttributeChanged)(this, definition, {
            name: name,
            oldValue: oldValue,
            newValue: newValue
          });
        }
      })
    };

    if (definition['extends']) {
      options['extends'] = definition['extends'];
    }

    return document.registerElement(id, options);
  }

  initDocument();
  _documentObserver2['default'].register(!!definition.detached);

  if (_registry2['default'].isType(id, _constants.TYPE_ELEMENT)) {
    return makeElementConstructor(definition);
  }
}

/**
 * Synchronously initialises the specified element or elements and descendants.
 *
 * @param {Mixed} nodes The node, or nodes to initialise. Can be anything:
 *                      jQuery, DOMNodeList, DOMNode, selector etc.
 *
 * @returns {skate}
 */
skate.init = function (nodes) {
  var nodesToUse = nodes;

  if (!nodes) {
    return nodes;
  }

  if (typeof nodes === 'string') {
    nodesToUse = nodes = document.querySelectorAll(nodes);
  } else if (nodes instanceof HTMLElement) {
    nodesToUse = [nodes];
  }

  (0, _lifecycle.initElements)(nodesToUse);

  return nodes;
};

// Restriction type constants.
skate.type = {
  ATTRIBUTE: _constants.TYPE_ATTRIBUTE,
  CLASSNAME: _constants.TYPE_CLASSNAME,
  ELEMENT: _constants.TYPE_ELEMENT
};

// Makes checking the version easy when debugging.
skate.version = _version2['default'];

/**
 * The default options for a definition.
 *
 * @var {Object}
 */
skate.defaults = {
  // Attribute lifecycle callback or callbacks.
  attributes: undefined,

  // The events to manage the binding and unbinding of during the definition's
  // lifecycle.
  events: undefined,

  // Restricts a particular definition to binding explicitly to an element with
  // a tag name that matches the specified value.
  'extends': undefined,

  // The ID of the definition. This is automatically set in the `skate()`
  // function.
  id: '',

  // Properties and methods to add to each element.
  prototype: {},

  // The attribute name to add after calling the created() callback.
  resolvedAttribute: 'resolved',

  // The template to replace the content of the element with.
  template: undefined,

  // The type of bindings to allow.
  type: _constants.TYPE_ELEMENT,

  // The attribute name to remove after calling the created() callback.
  unresolvedAttribute: 'unresolved'
};

// Exporting
// ---------

var previousSkate = window.skate;
skate.noConflict = function () {
  window.skate = previousSkate;
  return skate;
};

// Global
window.skate = skate;

// ES6
exports['default'] = skate;
module.exports = exports['default'];

},{"./constants":15,"./document-observer":17,"./lifecycle":19,"./registry":21,"./utils":23,"./version":24}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.hasOwn = hasOwn;
exports.camelCase = camelCase;
exports.elementContains = elementContains;
exports.debounce = debounce;
exports.getClosestIgnoredElement = getClosestIgnoredElement;
exports.inherit = inherit;
exports.objEach = objEach;
exports.supportsNativeCustomElements = supportsNativeCustomElements;
exports.isValidNativeCustomElementName = isValidNativeCustomElementName;

var _constants = require('./constants');

var DocumentFragment = window.DocumentFragment;
var elementPrototype = window.HTMLElement.prototype;
exports.elementPrototype = elementPrototype;
var elementPrototypeContains = elementPrototype.contains;

/**
 * Checks {}.hasOwnProperty in a safe way.
 *
 * @param {Object} obj The object the property is on.
 * @param {String} key The object key to check.
 *
 * @returns {Boolean}
 */

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Camel-cases the specified string.
 *
 * @param {String} str The string to camel-case.
 *
 * @returns {String}
 */

function camelCase(str) {
  return str.split(/-/g).map(function (str, index) {
    return index === 0 ? str : str[0].toUpperCase() + str.substring(1);
  }).join('');
}

/**
 * Returns whether or not the source element contains the target element.
 * This is for browsers that don't support Element.prototype.contains on an
 * HTMLUnknownElement.
 *
 * @param {HTMLElement} source The source element.
 * @param {HTMLElement} target The target element.
 *
 * @returns {Boolean}
 */

function elementContains(source, target) {
  // The document element does not have the contains method in IE.
  if (source === document && !source.contains) {
    return document.head.contains(target) || document.body.contains(target);
  }

  return source.contains ? source.contains(target) : elementPrototypeContains.call(source, target);
}

/**
 * Returns a function that will prevent more than one call in a single clock
 * tick.
 *
 * @param {Function} fn The function to call.
 *
 * @returns {Function}
 */

function debounce(fn) {
  var called = false;

  return function () {
    if (!called) {
      called = true;
      setTimeout(function () {
        called = false;
        fn();
      }, 1);
    }
  };
}

/**
 * Returns whether or not the specified element has been selectively ignored.
 *
 * @param {Element} element The element to check and traverse up from.
 *
 * @returns {Boolean}
 */

function getClosestIgnoredElement(element) {
  var parent = element;

  while (parent && parent !== document && !(parent instanceof DocumentFragment)) {
    if (parent.hasAttribute(_constants.ATTR_IGNORE)) {
      return parent;
    }

    parent = parent.parentNode;
  }
}

/**
 * Merges the second argument into the first.
 *
 * @param {Object} child The object to merge into.
 * @param {Object} parent The object to merge from.
 * @param {Boolean} overwrite Whether or not to overwrite properties on the child.
 *
 * @returns {Object} Returns the child object.
 */

function inherit(child, parent, overwrite) {
  var names = Object.getOwnPropertyNames(parent);
  var namesLen = names.length;

  for (var a = 0; a < namesLen; a++) {
    var name = names[a];

    if (overwrite || child[name] === undefined) {
      var desc = Object.getOwnPropertyDescriptor(parent, name);
      var shouldDefineProps = desc.get || desc.set || !desc.writable || !desc.enumerable || !desc.configurable;

      if (shouldDefineProps) {
        Object.defineProperty(child, name, desc);
      } else {
        child[name] = parent[name];
      }
    }
  }

  return child;
}

/**
 * Traverses an object checking hasOwnProperty.
 *
 * @param {Object} obj The object to traverse.
 * @param {Function} fn The function to call for each item in the object.
 *
 * @returns {undefined}
 */

function objEach(obj, fn) {
  for (var a in obj) {
    if (hasOwn(obj, a)) {
      fn(obj[a], a);
    }
  }
}

function supportsNativeCustomElements() {
  return typeof document.registerElement === 'function';
}

function isValidNativeCustomElementName(name) {
  return name.indexOf('-') > 0;
}

},{"./constants":15}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = '0.13.11';
module.exports = exports['default'];

},{}],25:[function(require,module,exports){
var createElement = require("./vdom/create-element.js")

module.exports = createElement

},{"./vdom/create-element.js":32}],26:[function(require,module,exports){
var diff = require("./vtree/diff.js")

module.exports = diff

},{"./vtree/diff.js":48}],27:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":3}],28:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],29:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],30:[function(require,module,exports){
var patch = require("./vdom/patch.js")

module.exports = patch

},{"./vdom/patch.js":35}],31:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook.js")

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        } else if (isHook(propValue)) {
            removeProperty(node, propName, propValue, previous)
            if (propValue.hook) {
                propValue.hook(node,
                    propName,
                    previous ? previous[propName] : undefined)
            }
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                node[propName] = propValue
            }
        }
    }
}

function removeProperty(node, propName, propValue, previous) {
    if (previous) {
        var previousValue = previous[propName]

        if (!isHook(previousValue)) {
            if (propName === "attributes") {
                for (var attrName in previousValue) {
                    node.removeAttribute(attrName)
                }
            } else if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = ""
                }
            } else if (typeof previousValue === "string") {
                node[propName] = ""
            } else {
                node[propName] = null
            }
        } else if (previousValue.unhook) {
            previousValue.unhook(node, propName, propValue)
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    var previousValue = previous ? previous[propName] : undefined

    // Set attributes
    if (propName === "attributes") {
        for (var attrName in propValue) {
            var attrValue = propValue[attrName]

            if (attrValue === undefined) {
                node.removeAttribute(attrName)
            } else {
                node.setAttribute(attrName, attrValue)
            }
        }

        return
    }

    if(previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue
        return
    }

    if (!isObject(node[propName])) {
        node[propName] = {}
    }

    var replacer = propName === "style" ? "" : undefined

    for (var k in propValue) {
        var value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

},{"../vnode/is-vhook.js":39,"is-object":28}],32:[function(require,module,exports){
var document = require("global/document")

var applyProperties = require("./apply-properties")

var isVNode = require("../vnode/is-vnode.js")
var isVText = require("../vnode/is-vtext.js")
var isWidget = require("../vnode/is-widget.js")
var handleThunk = require("../vnode/handle-thunk.js")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    vnode = handleThunk(vnode).a

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

},{"../vnode/handle-thunk.js":37,"../vnode/is-vnode.js":40,"../vnode/is-vtext.js":41,"../vnode/is-widget.js":42,"./apply-properties":31,"global/document":27}],33:[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}

},{}],34:[function(require,module,exports){
var applyProperties = require("./apply-properties")

var isWidget = require("../vnode/is-widget.js")
var VPatch = require("../vnode/vpatch.js")

var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties)
            return domNode
        case VPatch.THUNK:
            return replaceRoot(domNode,
                renderOptions.patch(domNode, patch, renderOptions))
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = renderOptions.render(vText, renderOptions)

        if (parentNode && newNode !== domNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    var updating = updateWidget(leftVNode, widget)
    var newNode

    if (updating) {
        newNode = widget.update(leftVNode, domNode) || domNode
    } else {
        newNode = renderOptions.render(widget, renderOptions)
    }

    var parentNode = domNode.parentNode

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    if (!updating) {
        destroyWidget(domNode, leftVNode)
    }

    return newNode
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, moves) {
    var childNodes = domNode.childNodes
    var keyMap = {}
    var node
    var remove
    var insert

    for (var i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i]
        node = childNodes[remove.from]
        if (remove.key) {
            keyMap[remove.key] = node
        }
        domNode.removeChild(node)
    }

    var length = childNodes.length
    for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j]
        node = keyMap[insert.key]
        // this is the weirdest bug i've ever seen in webkit
        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        oldRoot.parentNode.replaceChild(newRoot, oldRoot)
    }

    return newRoot;
}

},{"../vnode/is-widget.js":42,"../vnode/vpatch.js":45,"./apply-properties":31,"./update-widget":36}],35:[function(require,module,exports){
var document = require("global/document")
var isArray = require("x-is-array")

var render = require("./create-element")
var domIndex = require("./dom-index")
var patchOp = require("./patch-op")
module.exports = patch

function patch(rootNode, patches, renderOptions) {
    renderOptions = renderOptions || {}
    renderOptions.patch = renderOptions.patch && renderOptions.patch !== patch
        ? renderOptions.patch
        : patchRecursive
    renderOptions.render = renderOptions.render || render

    return renderOptions.patch(rootNode, patches, renderOptions)
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument

    if (!renderOptions.document && ownerDocument !== document) {
        renderOptions.document = ownerDocument
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}

},{"./create-element":32,"./dom-index":33,"./patch-op":34,"global/document":27,"x-is-array":29}],36:[function(require,module,exports){
var isWidget = require("../vnode/is-widget.js")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id
        } else {
            return a.init === b.init
        }
    }

    return false
}

},{"../vnode/is-widget.js":42}],37:[function(require,module,exports){
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")

module.exports = handleThunk

function handleThunk(a, b) {
    var renderedA = a
    var renderedB = b

    if (isThunk(b)) {
        renderedB = renderThunk(b, a)
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null)
    }

    return {
        a: renderedA,
        b: renderedB
    }
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous)
    }

    if (!(isVNode(renderedThunk) ||
            isVText(renderedThunk) ||
            isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk
}

},{"./is-thunk":38,"./is-vnode":40,"./is-vtext":41,"./is-widget":42}],38:[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],39:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],40:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":43}],41:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":43}],42:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],43:[function(require,module,exports){
module.exports = "2"

},{}],44:[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var hasThunks = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hasThunks = hasThunks
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-thunk":38,"./is-vhook":39,"./is-vnode":40,"./is-widget":42,"./version":43}],45:[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7
VirtualPatch.THUNK = 8

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":43}],46:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":43}],47:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook")

module.exports = diffProps

function diffProps(a, b) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {}
            diff[aKey] = undefined
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (aValue === bValue) {
            continue
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {}
                diff[aKey] = bValue
            } else if (isHook(bValue)) {
                 diff = diff || {}
                 diff[aKey] = bValue
            } else {
                var objectDiff = diffProps(aValue, bValue)
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff
                }
            }
        } else {
            diff = diff || {}
            diff[aKey] = bValue
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function getPrototype(value) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else if (value.__proto__) {
    return value.__proto__
  } else if (value.constructor) {
    return value.constructor.prototype
  }
}

},{"../vnode/is-vhook":39,"is-object":28}],48:[function(require,module,exports){
var isArray = require("x-is-array")

var VPatch = require("../vnode/vpatch")
var isVNode = require("../vnode/is-vnode")
var isVText = require("../vnode/is-vtext")
var isWidget = require("../vnode/is-widget")
var isThunk = require("../vnode/is-thunk")
var handleThunk = require("../vnode/handle-thunk")

var diffProps = require("./diff-props")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        return
    }

    var apply = patch[index]
    var applyClear = false

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index)
            apply = patch[index]
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
                apply = diffChildren(a, b, patch, apply, index)
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                applyClear = true
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            applyClear = true
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            applyClear = true
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            applyClear = true
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
    }

    if (apply) {
        patch[index] = apply
    }

    if (applyClear) {
        clearState(a, patch, index)
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var orderedSet = reorder(aChildren, b.children)
    var bChildren = orderedSet.children

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (orderedSet.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(
            VPatch.ORDER,
            a,
            orderedSet.moves
        ))
    }

    return apply
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index)
    destroyWidgets(vNode, patch, index)
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(VPatch.REMOVE, vNode, null)
            )
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b)
    var thunkPatch = diff(nodes.a, nodes.b)
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true
        }
    }

    return false
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(
                    VPatch.PROPS,
                    vNode,
                    undefinedKeys(vNode.hooks)
                )
            )
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                unhook(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

function undefinedKeys(obj) {
    var result = {}

    for (var key in obj) {
        result[key] = undefined
    }

    return result
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {
    // O(M) time, O(M) memory
    var bChildIndex = keyIndex(bChildren)
    var bKeys = bChildIndex.keys
    var bFree = bChildIndex.free

    if (bFree.length === bChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(N) time, O(N) memory
    var aChildIndex = keyIndex(aChildren)
    var aKeys = aChildIndex.keys
    var aFree = aChildIndex.free

    if (aFree.length === aChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(MAX(N, M)) memory
    var newChildren = []

    var freeIndex = 0
    var freeCount = bFree.length
    var deletedItems = 0

    // Iterate through a and match a node in b
    // O(N) time,
    for (var i = 0 ; i < aChildren.length; i++) {
        var aItem = aChildren[i]
        var itemIndex

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                itemIndex = bKeys[aItem.key]
                newChildren.push(bChildren[itemIndex])

            } else {
                // Remove old keyed items
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        } else {
            // Match the item in a with the next free item in b
            if (freeIndex < freeCount) {
                itemIndex = bFree[freeIndex++]
                newChildren.push(bChildren[itemIndex])
            } else {
                // There are no free items in b to match with
                // the free items in a, so the extra free nodes
                // are deleted.
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        }
    }

    var lastFreeIndex = freeIndex >= bFree.length ?
        bChildren.length :
        bFree[freeIndex]

    // Iterate through b and append any new keys
    // O(M) time
    for (var j = 0; j < bChildren.length; j++) {
        var newItem = bChildren[j]

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                // We are adding new items to the end and then sorting them
                // in place. In future we should insert new items in place.
                newChildren.push(newItem)
            }
        } else if (j >= lastFreeIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem)
        }
    }

    var simulate = newChildren.slice()
    var simulateIndex = 0
    var removes = []
    var inserts = []
    var simulateItem

    for (var k = 0; k < bChildren.length;) {
        var wantedItem = bChildren[k]
        simulateItem = simulate[simulateIndex]

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null))
            simulateItem = simulate[simulateIndex]
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            // if we need a key in this position...
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    // if an insert doesn't put this key in place, it needs to move
                    if (bKeys[simulateItem.key] !== k + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key))
                        simulateItem = simulate[simulateIndex]
                        // if the remove didn't put the wanted item in place, we need to insert it
                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({key: wantedItem.key, to: k})
                        }
                        // items are matching, so skip ahead
                        else {
                            simulateIndex++
                        }
                    }
                    else {
                        inserts.push({key: wantedItem.key, to: k})
                    }
                }
                else {
                    inserts.push({key: wantedItem.key, to: k})
                }
                k++
            }
            // a key in simulate has no matching wanted key, remove it
            else if (simulateItem && simulateItem.key) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key))
            }
        }
        else {
            simulateIndex++
            k++
        }
    }

    // remove all the remaining nodes from simulate
    while(simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex]
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
    }

    // If the only moves we have are deletes then we can just
    // let the delete patch remove these items.
    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        }
    }

    return {
        children: newChildren,
        moves: {
            removes: removes,
            inserts: inserts
        }
    }
}

function remove(arr, index, key) {
    arr.splice(index, 1)

    return {
        from: index,
        key: key
    }
}

function keyIndex(children) {
    var keys = {}
    var free = []
    var length = children.length

    for (var i = 0; i < length; i++) {
        var child = children[i]

        if (child.key) {
            keys[child.key] = i
        } else {
            free.push(i)
        }
    }

    return {
        keys: keys,     // A hash of key name to index
        free: free      // An array of unkeyed item indices
    }
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

},{"../vnode/handle-thunk":37,"../vnode/is-thunk":38,"../vnode/is-vnode":40,"../vnode/is-vtext":41,"../vnode/is-widget":42,"../vnode/vpatch":45,"./diff-props":47,"x-is-array":29}],49:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _list = require('./list');

var _list2 = _interopRequireDefault(_list);

var _libPromise = require('./lib/promise');

var _libPromise2 = _interopRequireDefault(_libPromise);

var _skatejsSrcSkate = require('skatejs/src/skate');

var _skatejsSrcSkate2 = _interopRequireDefault(_skatejsSrcSkate);

var _skatejsSrcMutationObserver = require('skatejs/src/mutation-observer');

var _skatejsSrcMutationObserver2 = _interopRequireDefault(_skatejsSrcMutationObserver);

var _libUtils = require('./lib/utils');

var _libUtilsDom = require('./lib/utils/dom');

var _libUtilsEvents = require('./lib/utils/events');

var _libUtilsPromises = require('./lib/utils/promises');

var _renderer = require('./renderer');

var _renderer2 = _interopRequireDefault(_renderer);

var _modulesLoader = require('./modules-loader');

var _modulesLoader2 = _interopRequireDefault(_modulesLoader);

var _worker = require('./worker');

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _componentSpecification = require('./component/specification');

var _libUvdom = require('./lib/uvdom');

var _libUvdom2 = _interopRequireDefault(_libUvdom);

var componentsProto = {
	_rendering: false,
	_attached: false,
	_innert: true,
	_ready: false,
	_pending: null,

	renderNode: null,
	modelNode: null,
	render: null,

	renderModel: function renderModel(force) {
		var _this = this;

		var _instance = this._instance;
		var rendered = _instance.rendered;
		var ready = _instance.ready;

		this._rendering = true;

		// Отправляем полученное UVDOM дерево на отрисовку.
		this.createRenderingTree(force).then(function (renderingTree) {
			if (renderingTree) {
				return new _libPromise2['default'](function (resolve) {
					_this.render(renderingTree, resolve);
				});
			}

			// Если в результате рендеринга вернулось falsy значение, но не undefined,
			// то считаем что отрисовка компонента завершена и он может выстреливать
			// событие о готовности.
			return typeof renderingTree === 'undefined';
		}).then(function (skipped) {
			_this._rendering = false;

			if (!skipped) {
				typeof rendered === 'function' && rendered.call(_this);
				_this.dispatchEvent((0, _libUtilsEvents.createEvent)('rendered', {
					bubbles: true,
					cancelable: true
				}));

				if (!_this._ready) {
					_this._ready = true;
					typeof ready === 'function' && ready.call(_this);
					_list2['default'].trigger('ready', _this);
					_this.dispatchEvent((0, _libUtilsEvents.createEvent)('ready', {
						bubbles: true,
						cancelable: true
					}));
				}
			}
		}).then(function () {
			return _this._pendingRender && _this.renderModel();
		})['catch'](function (error) {
			(0, _libUtils.warning)(error);
			_this._rendering = false;
		});
	},

	createRenderingTree: function createRenderingTree(forceDump) {
		var name = this._instance.name;

		// Если мы мы поменяли в модели то что не отслеживается
		// MutationObserver (например атрибуты у потомков), то forceDump поможет
		// при рендеринге сбросить кеш в модели.
		if (forceDump) {
			this.modelNode.flushDump();
		}

		// Шаблон может быть как функцией так и UVDOM деревом.
		// Если шаблон – функция, то передаем ему модель и ждем на выходе
		// преобразованное UVDOM дерево.
		// Если шаблон – UVDOM дерево, то отправляем его и модель на преобразование
		// в XSL шаблонизатор.
		if (this.template == null) {
			return _libPromise2['default'].reject('Unable to locate template for "' + name + '" component');
		} else if (typeof this.template === 'function') {
			return _libPromise2['default'].resolve(this.template(this.modelNode.resolve()));
		} else if (this.template.children != null) {
			(0, _libUtils.warning)('Be warned that for current time xsl templating has low performance! Consider to check "%s" component', name);

			if (this._worker == null) {
				this._worker = new _worker.TemplateWorker(this.template);
			}
			return this._worker.template(this.modelNode.resolve());
		}
		return _libPromise2['default'].reject('Unable to process template for "' + name + '" component');
	},

	// Публичный метод для форсированной актуализации состояния жизненного цикла компонента.
	// Может пригодится для редких кейсов, когда инициализация компонента прошла не до конца
	// по каким-то причинам.
	checkComponentAndActualizeLifecycleIfNeeded: function checkComponentAndActualizeLifecycleIfNeeded() {
		return componentsLifecycle.attached(this);
	}
};

var componentsLifecycle = {
	template: function template(element) {
		var _innert = element._innert;
		var instance = element._instance;
		var userProto = element._userProto;
		var Model = element._model_constructor;

		element._pending = [];

		if (element.modelNode != null || _innert) {
			return;
		}

		element.dispatchEvent((0, _libUtilsEvents.createEvent)('preparing', {
			bubbles: true,
			cancelable: true
		}));

		var outerModel = (0, _libUtilsDom.HTMLtoModel)(element);
		var attrModel = {};

		// Собираем пользовательские атрибуты.
		instance.hostAttributes.forEach(function (attrName) {
			var attrValue = element.getAttribute(attrName);

			if (attrValue != null) {
				attrModel[attrName] = attrValue;
			}
		});

		var model = (0, _libUtils.assign)({}, instance.model, outerModel, attrModel);

		element.modelNode = new Model();
		element.modelNode.addEventListener('model-changed', onModelChange.bind(element, instance));
		element.modelNode.fill(model);

		// Проверяем чтоб разработчик не мог при описании компонента переопределить свойства
		// учавствующие в жизненном цикле библиотеки.
		Object.keys(componentsProto).filter(function (name) {
			return name in userProto;
		}).forEach(function (name) {
			throw new Error('You can\'t define "' + name + '" property! It\'s used in library lifecicle.');
		});

		// Делаем автобинд контекста к пользовательским методам.
		Object.keys(userProto).filter(function (name) {
			return typeof userProto[name] === 'function';
		}).forEach(function (methodName) {
			element[methodName] = element[methodName].bind(element);
		});

		typeof instance.prepare === 'function' && instance.prepare.call(element);
		element.dispatchEvent((0, _libUtilsEvents.createEvent)('prepared', {
			bubbles: true,
			cancelable: true
		}));

		// Даем в методе `prepared` сделать синхронные изменения модели после чего
		// включаем отслеживание изменений, чтоб не дублировать изначальный рендеринг.
		element.modelNode.resume();
	},

	created: function created(element) {
		var _innert = element._innert;
		var instance = element._instance;

		if (_innert) {
			return;
		}

		// При клонировании элемента вызывает хук `created` но не вызывается `template`,
		// поэтому делаем это самостоятельно.
		if (element.modelNode == null) {
			this.template(element);
		}

		// Если это повторный вызов метода из-за не консистентности поведения в разных
		// браузерах, то проверяем условия необходимые для правильной условии если они
		// выполняются, то выходим их метода.
		if (element.renderNode && element.contains(element.renderNode) && element.contains(element.modelNode)) {
			return;
		}

		element.renderNode = document.createElement(instance.name + '-view');
		element.render = (0, _renderer2['default'])(element.renderNode);

		// Реализовываем специальное поведение у компонентов. В качестве childNodes
		// компонент может содержать только вью и модель. Для остальных элементов
		// применяются следующие правила:
		// 1. Если нода является тегом, имеет `nodeName` == 'content' и атрибут `name`,
		//    то ее переносим в модель;
		// 2. В остальных случаях выносим ноду за пределы компонента. Помещая ее сразу
		//    после компонента (`nextSibling`).
		var observer = new _skatejsSrcMutationObserver2['default'](function (mutations) {
			if (_innert) {
				return;
			}
			processChildNodes(element);
		});

		observer.observe(element, {
			childList: true
		});

		typeof instance.created === 'function' && instance.created.call(element);
		_list2['default'].trigger('created', element);
		element.dispatchEvent((0, _libUtilsEvents.createEvent)('created', {
			bubbles: true,
			cancelable: true
		}));
	},

	attached: function attached(element) {
		var _element$_instance = element._instance;
		var instance = _element$_instance === undefined ? {} : _element$_instance;

		if (isInnert(element)) {
			element.setAttribute('innert', '');
			return element._innert = true;
		}
		element.removeAttribute('innert');
		element._innert = false;

		// Бывает что в некоторых браузерах attach происходит раньше create, поэтому
		// убеждаемся что пайплайн создания компонента не нарушен.
		if (element.modelNode == null) {
			this.created(element);
		}

		processChildNodes(element);

		!element.contains(element.renderNode) && element.appendChild(element.renderNode);
		!element.contains(element.modelNode) && element.appendChild(element.modelNode);

		element._attached = true;
		element.renderModel();

		typeof instance.attached === 'function' && instance.attached.call(element);
		_list2['default'].trigger('attached', element);
		element.dispatchEvent((0, _libUtilsEvents.createEvent)('attached', {
			bubbles: true,
			cancelable: true
		}));
	},

	detached: function detached(element) {
		var _element$_instance2 = element._instance;
		var instance = _element$_instance2 === undefined ? {} : _element$_instance2;

		element._innert = true;
		element._attached = false;

		element.contains(element.renderNode) && element.removeChild(element.renderNode);
		element.contains(element.modelNode) && element.removeChild(element.modelNode);

		typeof instance.detached === 'function' && instance.detached.call(element);
		_list2['default'].trigger('detached', element);
		element.dispatchEvent((0, _libUtilsEvents.createEvent)('detached', {
			bubbles: true,
			cancelable: true
		}));

		// Если у кастомного элемента изменили родителя через `appendChild`, то из-за
		// не коректной работы полифила MutationObserver (IE) может произойти condition race между
		// вызовом хуков `attached` и `detached`. Во избежание создания не верного состояния
		// жизненного цикла компонента проверяем если в стадии `detached` компонент находится
		// в DOM дереве, то запускаем механизм актуализации состояния его жизненного цикла.
		if (element.ownerDocument.body.contains(element)) {
			element.checkComponentAndActualizeLifecycleIfNeeded();
		}
	}
};

var componentsLifecycleEvents = {
	preparing: function preparing(element, event) {
		element._pending.push(event.target.nodeName.toLowerCase());
	},

	ready: function ready(element, event) {
		var complete = element._instance.complete;

		var index = element._pending.indexOf(event.target.nodeName.toLowerCase());

		if (~index) {
			element._pending.splice(index, 1);
		}

		if (!element._pending.length) {
			typeof complete === 'function' && complete.call(element);
			_list2['default'].trigger('complete', element);
			element.dispatchEvent((0, _libUtilsEvents.createEvent)('complete', {
				bubbles: true,
				cancelable: true
			}));
		}
	}
};

var COMPONENT_RESOLVING_TIMEOUT = 10000;

var registry = {};

exports['default'] = function (params) {
	var scripts = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
	var styles = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

	if (typeof scripts === 'function') {
		scripts = [scripts];
	}

	var definition = (0, _libUtils.assign)((0, _libUtils.deepCopy)(_componentSpecification.defaults), params);

	return resolveComponent(definition).then(function (instance) {
		return getImports(instance.imports).then(function (imports) {
			var utils = {};

			if (instance.helpers instanceof _libUvdom2['default']) {
				styles = instance.helpers.styles.concat(styles);
			}

			utils.helpers = instance.helpers = new _libUvdom2['default']({
				name: instance.name,
				styles: styles,
				imports: imports
			});

			scripts.forEach(function (script) {
				return script.call(instance, utils);
			});

			return instance;
		});
	}).then(registerComponent).then(function (instance) {
		var userProto = gatherUserContract(instance, _componentSpecification.defaults);
		var Model = (0, _model2['default'])(instance.name);
		var attributes = {};

		if (instance.type != null) {
			attributes.tid = {
				value: instance.type
			};
		}

		instance.hostAttributes.forEach(function (attrName) {
			attributes[attrName] = function (element, change) {
				// Если по каким-то причинам модель не была готова, то даже не пытаемся
				// обрабатывать атрибуты.
				if (element.modelNode == null) {
					return;
				}

				var name = change.name;
				var newValue = change.newValue;

				var property = element.modelNode.get(name);

				// Если значение пришло `null` или `undefined`, то в модель записываем его как
				// пустое. Это особенно важно для IE который запись делает через `innerHTML`.
				newValue == null && (newValue = '');

				if (property) {
					// Из-за бага в IE11 и воркараунда в полифиле MutationObserver задание
					// текстового значения через `textContent` не всегда вызывает генерации
					// события об изменении.
					if (_skatejsSrcMutationObserver2['default'].isFixingIe) {
						property.innerHTML = newValue;
					} else {
						property.textContent = newValue;
					}
				}
			};
		});

		var HTMLCustomElement = (0, _skatejsSrcSkate2['default'])(instance.name, (0, _libUtils.assign)({
			attributes: attributes,
			events: (0, _libUtils.assign)({}, instance.events, componentsLifecycleEvents),
			prototype: (0, _libUtils.assign)({
				_instance: instance,
				_userProto: userProto,
				_attributes: attributes,
				_model_constructor: Model,
				template: instance.template
			}, userProto, componentsProto)
		}, componentsLifecycle));

		typeof instance.registered === 'function' && instance.registered(HTMLCustomElement);
		_list2['default'].trigger('registered', instance.name, HTMLCustomElement);

		return HTMLCustomElement;
	})['catch'](function (error) {
		throw new Error(error);
	});
};

function resolveComponent() {
	var instance = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	return getComponent(instance['extends']).then(function (baseInstance) {
		return (0, _componentSpecification.merge)(baseInstance, instance);
	}, function () {
		return _libPromise2['default'].resolve(instance);
	});
}

function getImports(list) {
	var componentsList = list.filter(function (item) {
		return item.local;
	}).map(function (item) {
		return item.name;
	});

	var modulesList = list.filter(function (item) {
		return !item.local;
	});

	return _libPromise2['default'].all([getComponents(componentsList), getModules(modulesList.map(function (item) {
		return item.path;
	}))]).then(function (_ref) {
		var _ref2 = _slicedToArray(_ref, 2);

		var components = _ref2[0];
		var modules = _ref2[1];

		return [].concat(componentsList.map(function (name, i) {
			return {
				id: name,
				'export': components[i]
			};
		}), modulesList.map(function (item, i) {
			return {
				id: item.name,
				'export': modules[i]
			};
		}));
	});
}

function getComponents(list) {
	return _libPromise2['default'].all(list.filter(Boolean).map(getComponent));
}

function getModules(list) {
	if (!list.length) {
		return _libPromise2['default'].resolve([]);
	}

	return new _libPromise2['default'](function (resolve, reject) {
		(0, _modulesLoader2['default'])(list, function () {
			for (var _len = arguments.length, modules = Array(_len), _key = 0; _key < _len; _key++) {
				modules[_key] = arguments[_key];
			}

			return resolve(modules);
		}, reject);
	});
}

function getComponent(name) {
	if (name == null) {
		return _libPromise2['default'].reject();
	}

	return getLazyComponent(name).promise;
}

function getLazyComponent(name) {
	if (!registry[name]) {
		registry[name] = (0, _libUtilsPromises.defer)();
	}

	var timer = setTimeout(function () {
		(0, _libUtils.warning)('Component "' + name + '" resolving taking too long.');
	}, COMPONENT_RESOLVING_TIMEOUT);

	registry[name].promise.then(function () {
		return clearTimeout(timer);
	});

	return registry[name];
}

function registerComponent(instance) {
	var name = instance.name;

	var component = getLazyComponent(name);

	component.resolve(instance);
	return component.promise;
}

function onModelChange(instance, event) {
	var _this2 = this;

	if (this._innert) {
		return;
	}
	this._attached && this.renderModel();

	if (typeof instance.modelChanged === 'function') {
		var _event$detail = event.detail;
		var prevSnapshot = _event$detail.prevSnapshot;
		var newSnapshot = _event$detail.newSnapshot;
		var stringify = JSON.stringify;

		Object.keys(newSnapshot).map(function (propName) {
			if (stringify(prevSnapshot[propName]) != stringify(newSnapshot[propName])) {
				return propName;
			}
		}).filter(Boolean).map(function (propName) {
			var prevValue = (0, _libUtilsDom.ModelAttrToHTML)(prevSnapshot, propName);
			var value = _this2.modelNode.querySelector('content[name="' + propName + '"]');

			return {
				propName: propName,
				prevValue: prevValue,
				value: value
			};
		}).forEach(function (payload) {
			var propName = payload.propName;
			var prevValue = payload.prevValue;
			var value = payload.value;

			instance.modelChanged.call(_this2, propName, prevValue, value);
		});
	}
}

function gatherUserContract(instance, defaults) {
	var userContract = {};

	Object.keys(instance).forEach(function (key) {
		if (!(key in defaults)) {
			userContract[key] = instance[key];
		}
	});

	return userContract;
}

function moveChildAwayFromNode(child) {
	var parent = child.parentNode;

	if (parent.nextSibling) {
		parent.parentNode.insertBefore(child, parent.nextSibling);
	} else {
		parent.parentNode.appendChild(child);
	}
}

function isInnert(node) {
	var innert = false;
	var parent = node.parentNode;

	if (!document.body.contains(node)) {
		return true;
	}

	while (!innert && parent !== document.body) {
		innert = parent.nodeName.toLowerCase() === 'content';
		parent = parent.parentNode;
	}

	return innert;
}

function processChildNode(element, node) {
	if (node == null) {
		return;
	}

	if (node.nodeName.toLowerCase() === 'content') {
		var propName = node.getAttribute('name');

		if (propName == null) {
			return moveChildAwayFromNode(node);
		}

		var modelProp = element.modelNode.get(propName);

		if (modelProp) {
			element.modelNode.replaceChild(node, modelProp);
		} else {
			element.modelNode.appendChild(node);
		}
		return;
	} else if (node === element.renderNode || node === element.modelNode) {
		return;
	}
	moveChildAwayFromNode(node);
}

function processChildNodes(element) {
	for (var i = 0, _length = element.childNodes.length; i < _length; i++) {
		processChildNode(element, element.childNodes[i]);
	}
}
module.exports = exports['default'];

},{"./component/specification":50,"./lib/promise":52,"./lib/utils":53,"./lib/utils/dom":54,"./lib/utils/events":56,"./lib/utils/promises":58,"./lib/uvdom":59,"./list":60,"./model":61,"./modules-loader":62,"./renderer":66,"./worker":68,"skatejs/src/mutation-observer":20,"skatejs/src/skate":22}],50:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.merge = merge;

var _libUtils = require('../lib/utils');

var defaults = {
	name: null,
	type: null,
	'extends': null,
	imports: [],
	events: {},
	hostAttributes: [],
	model: null,
	template: null,
	prepare: null,
	created: null,
	attached: null,
	rendered: null,
	ready: null,
	complete: null,
	detached: null,
	modelChanged: null,

	_addEvent: function _addEvent(event, selector, handler) {
		if (typeof selector === 'function') {
			handler = selector;
			selector = null;
		}
		this.events || (this.events = {});
		this.events[[event].concat(selector || []).join(' ')] = handler;
	},

	_addFeature: function _addFeature(feature) {
		(0, _libUtils.assign)(this, feature);
	}
};

exports.defaults = defaults;
var inactiveComponentPostfix = '-definition';
exports.inactiveComponentPostfix = inactiveComponentPostfix;
var inactiveComponentNameRegexp = new RegExp(inactiveComponentPostfix + '$');
exports.inactiveComponentNameRegexp = inactiveComponentNameRegexp;
var inactiveComponentRefDataAttr = 'data-reference-name';

exports.inactiveComponentRefDataAttr = inactiveComponentRefDataAttr;

function merge(base, target) {
	var events = batchHandlers(base.events, target.events, Object.keys((0, _libUtils.assign)({}, base.events, target.events)));
	var lifecycleMethods = batchHandlers(base, target, ['prepare', 'created', 'attached', 'rendered', 'ready', 'complete', 'detached', 'modelChanged']);
	var duplicates = [];
	var hostAttributes = [].concat(base.hostAttributes, target.hostAttributes).filter(Boolean).filter(function (attrName) {
		if (! ~duplicates.indexOf(attrName)) {
			duplicates.push(attrName);
			return true;
		}
	});
	var imports = {};

	return (0, _libUtils.assign)({}, base, target, {
		type: target.type || base.type,
		imports: base.imports.concat(target.imports).filter(function (item) {
			var name = item.name;

			return imports[name] == null && (imports[name] = true);
		}),
		events: events,
		hostAttributes: hostAttributes,
		model: (0, _libUtils.assign)({}, base.model, target.model),
		template: base.template
	}, lifecycleMethods);
}

function batchHandlers(base, target, propList) {
	var result = {};

	propList.forEach(function (prop) {
		if (base[prop] && target[prop]) {
			result[prop] = function () {
				for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
					args[_key] = arguments[_key];
				}

				base[prop].apply(this, args);
				target[prop].apply(this, args);
			};
		} else {
			result[prop] = base[prop] || target[prop];
		}
	});

	return result;
}

},{"../lib/utils":53}],51:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.get = get;
exports.extend = extend;
exports.update = update;

var _libUtils = require('./lib/utils');

var config = {};

function get() {
	return config;
}

function extend(obj) {
	return (0, _libUtils.assign)(config, obj);
}

function update(obj) {
	return config = (0, _libUtils.assign)({}, obj);
}

},{"./lib/utils":53}],52:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _es6PromiseLibEs6PromisePromise = require('es6-promise/lib/es6-promise/promise');

var _es6PromiseLibEs6PromisePromise2 = _interopRequireDefault(_es6PromiseLibEs6PromisePromise);

exports['default'] = typeof Promise !== 'undefined' ? Promise : _es6PromiseLibEs6PromisePromise2['default'];
module.exports = exports['default'];

},{"es6-promise/lib/es6-promise/promise":8}],53:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.assign = assign;
exports.warning = warning;
exports.deepCopy = deepCopy;
exports.throttle = throttle;
function ToObject(val) {
	if (val == null) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function assign(target, source) {
	var from;
	var keys;
	var to = ToObject(target);

	for (var s = 1; s < arguments.length; s++) {
		from = arguments[s];
		keys = Object.keys(Object(from));

		for (var i = 0; i < keys.length; i++) {
			try {
				to[keys[i]] = from[keys[i]];
			} catch (e) {}
		}
	}

	return to;
}

function warning(format) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	var argIndex = 0;

	console.warn('Warning: ' + ('' + format).replace(/%s/g, function () {
		return args[argIndex++];
	}));
}

// Быстрая реализация глубокого клонирования с поддержкой многих типов.
// Код взят из http://stackoverflow.com/a/1042676/896280

function deepCopy(target) {
	if (target == null || typeof target != 'object') {
		return target;
	}

	if (target.constructor != Object && target.constructor != Array) {
		return target;
	}

	if (~[Date, RegExp, Function, String, Number, Boolean].indexOf(target.constructor)) {
		return new target.constructor(target);
	}

	var result = new target.constructor();

	for (var name in target) {
		result[name] = typeof result[name] === 'undefined' ? deepCopy(target[name]) : result[name];
	}

	return result;
}

// Функция `throttle` позаимствована у underscore.js (http://underscorejs.org/#throttle)

function throttle(func, wait) {
	var context;
	var args;
	var timeout;
	var result;
	var previous = 0;
	var later = function later() {
		previous = new Date();
		timeout = null;
		result = func.apply(context, args);
	};

	return function () {
		var now = new Date();
		var remaining = wait - (now - previous);

		context = this;
		args = arguments;

		if (remaining <= 0) {
			clearTimeout(timeout);
			timeout = null;
			previous = now;
			result = func.apply(context, args);
		} else if (!timeout) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	};
}

},{}],54:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.HTMLtoModel = HTMLtoModel;
exports.ModelAttrToHTML = ModelAttrToHTML;
exports.ModelToHTML = ModelToHTML;
exports.findRootPropertyNode = findRootPropertyNode;
exports.resolveModelRefs = resolveModelRefs;
exports.isCustomElement = isCustomElement;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _parsersHtmlToUvdom = require('../../parsers/html-to-uvdom');

var _parsersHtmlToUvdom2 = _interopRequireDefault(_parsersHtmlToUvdom);

var _parsersUvdomToHtml = require('../../parsers/uvdom-to-html');

var _parsersUvdomToHtml2 = _interopRequireDefault(_parsersUvdomToHtml);

var _parser = require('./parser');

var _componentSpecification = require('../../component/specification');

function HTMLtoModel(node) {
	var model = {};

	(0, _parser.nodesToArray)(node.childNodes).forEach(function (child) {
		if (child.nodeType === Node.ELEMENT_NODE) {
			var property = (0, _parsersHtmlToUvdom2['default'])(child, {
				onTagNameResolve: function onTagNameResolve(node) {
					node.removeAttribute('data-reactid');
					return node.tagName.toLowerCase();
				}
			});

			var _ref = property.attrs || {};

			var name = _ref.name;

			if (property.component === 'content' && name) {
				model[name] = property.children;
			}
		}
	});

	return model;
}

function ModelAttrToHTML(model, attrName) {
	return ModelToHTML(model).querySelector('content[name="' + attrName + '"]');
}

function uvdomNodeToRef(node, name) {
	node.attrs || (node.attrs = {});
	node.attrs[_componentSpecification.inactiveComponentRefDataAttr] = name;
	return name + _componentSpecification.inactiveComponentPostfix;
}

function ModelToHTML(model) {
	var fragment = document.createDocumentFragment();

	Object.keys(model).forEach(function (name) {
		var uvdomNode = {
			component: 'content',
			attrs: {
				name: name
			},
			children: model[name]
		};

		fragment.appendChild((0, _parsersUvdomToHtml2['default'])(uvdomNode, {
			onTypeNameResolve: function onTypeNameResolve(uvdomNode) {
				var tag = uvdomNode.tag;
				var component = uvdomNode.component;

				// [TODO] Добавить обработку тегов, которые загружают внешние ресурсы (img и т.д.).
				// Их тоже необходимо сделать инертными в модели.
				if (~['style', 'script', 'img'].indexOf(tag)) {
					return uvdomNodeToRef(uvdomNode, tag);
				}

				return tag || component;
			}
		}));
	});

	return fragment;
}

function findRootPropertyNode(_x) {
	var _again = true;

	_function: while (_again) {
		var node = _x;
		_again = false;

		if (node == null || node.nodeType == null) {
			return node;
		}

		var tagName = node.tagName;

		if (tagName && tagName.toLowerCase() === 'content' && node.hasAttribute('name')) {
			return node;
		}

		if (node.parentNode != null) {
			_x = node.parentNode;
			_again = true;
			tagName = undefined;
			continue _function;
		}
	}
}

function resolveModelRefs(model) {
	var modelFragment = undefined;

	if (model instanceof HTMLElement) {
		modelFragment = document.createDocumentFragment();
		(0, _parser.nodesToArray)(model.cloneNode(true).childNodes).forEach(modelFragment.appendChild.bind(modelFragment));
	} else {
		modelFragment = ModelToHTML(model);
	}

	var selectNodes = (0, _parser.nodesToArray)(modelFragment.querySelectorAll('content[select]'));

	var _loop = function (i) {
		var element = selectNodes[i];
		var selectName = element.getAttribute('select');
		var target = undefined;

		(0, _parser.nodesToArray)(modelFragment.childNodes).some(function (child) {
			if (child.getAttribute('name') === selectName) {
				target = child;
				return true;
			}
		});

		if (target) {
			(function () {
				var targetClone = target.cloneNode(true);
				var targetPlaceholders = targetClone.querySelectorAll('content:not([select]):not([ref]):not([name])');
				var children = (0, _parser.nodesToArray)(element.cloneNode(true).childNodes);

				if (children.length && targetPlaceholders.length) {
					(0, _parser.nodesToArray)(targetPlaceholders).forEach(function (node) {
						children.forEach(function (child) {
							node.parentNode.insertBefore(child, node);
						});
						node.parentNode.removeChild(node);
					});
				}

				var innerSelectNodes = (0, _parser.nodesToArray)(targetClone.querySelectorAll('content[select]'));

				if (innerSelectNodes) {
					selectNodes = selectNodes.concat(innerSelectNodes);
				}

				(0, _parser.nodesToArray)(targetClone.childNodes).forEach(function (child) {
					element.parentNode.insertBefore(child, element);
				});
				element.parentNode.removeChild(element);
			})();
		}
	};

	for (var i = 0; i < selectNodes.length; i++) {
		_loop(i);
	}

	(0, _parser.nodesToArray)(modelFragment.querySelectorAll('content[select]')).forEach(function (element) {
		var selectName = element.getAttribute('select');
		var target = undefined;

		(0, _parser.nodesToArray)(modelFragment.childNodes).some(function (child) {
			if (child.getAttribute('name') === selectName) {
				target = child;
				return true;
			}
		});

		if (target) {
			(function () {
				var targetClone = target.cloneNode(true);
				var targetPlaceholders = targetClone.querySelectorAll('content:not([select]):not([ref]):not([name])');
				var children = (0, _parser.nodesToArray)(element.cloneNode(true).childNodes);

				if (children.length && targetPlaceholders.length) {
					(0, _parser.nodesToArray)(targetPlaceholders).forEach(function (node) {
						children.forEach(function (child) {
							node.parentNode.insertBefore(child, node);
						});
						node.parentNode.removeChild(node);
					});
				}

				(0, _parser.nodesToArray)(targetClone.childNodes).forEach(function (child) {
					element.parentNode.insertBefore(child, element);
				});
				element.parentNode.removeChild(element);
			})();
		}
	});

	(0, _parser.nodesToArray)(modelFragment.querySelectorAll('content[ref]')).forEach(function (element) {
		var refName = element.getAttribute('ref');
		var target = undefined;

		(0, _parser.nodesToArray)(modelFragment.childNodes).some(function (child) {
			if (child.getAttribute('name') === refName) {
				target = child;
				return true;
			}
		});

		if (target) {
			(0, _parser.nodesToArray)(target.cloneNode(true).childNodes).forEach(function (child) {
				element.appendChild(child);
			});
			element.removeAttribute('ref');
		}
	});

	return HTMLtoModel(modelFragment);
}

function isCustomElement(type) {
	return !(0, _parser.isCommonElement)(type) && ! ~['content', 'item'].indexOf(type);
}

},{"../../component/specification":50,"../../parsers/html-to-uvdom":63,"../../parsers/uvdom-to-html":64,"./parser":57}],55:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var htmlTags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rb', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr'];

exports.htmlTags = htmlTags;
var svgTags = ['a', 'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile', 'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'script', 'set', 'stop', 'style', 'svg', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref', 'tspan', 'use', 'view', 'vkern'];
exports.svgTags = svgTags;

},{}],56:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.createEvent = createEvent;

var _utils = require('../utils');

// Шим для CustomEvent (IE > 9)

function createEvent(name, params) {
	var event;

	params = (0, _utils.assign)({
		bubbles: false,
		cancelable: false,
		detail: undefined
	}, params);

	try {
		event = new CustomEvent(name, params);
	} catch (e) {
		event = document.createEvent('CustomEvent');
		event.initCustomEvent(name, params.bubbles, params.cancelable, params.detail);
	}

	return event;
}

},{"../utils":53}],57:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.nodesToArray = nodesToArray;
exports.toArray = toArray;
exports.capitalize = capitalize;
exports.HtmlAttrToUvdomAttr = HtmlAttrToUvdomAttr;
exports.UvdomAttrToHtmlAttr = UvdomAttrToHtmlAttr;
exports.isCommonElement = isCommonElement;
exports.hash = hash;

var _entities = require('./entities');

var HTMLCollection = global.HTMLCollection;
var NodeList = global.NodeList;
var document = global.document;
var btoa = global.btoa;
var eventNameRegex = /^on([a-z]+)$/;
exports.eventNameRegex = eventNameRegex;
var domTagNameRegex = /^([a-z]+:)?(h[1-6]|[a-z]+)$/;

exports.domTagNameRegex = domTagNameRegex;

function nodesToArray(nodes) {
	var list = [];

	if (nodes instanceof HTMLCollection || nodes instanceof NodeList) {
		list = list.concat(toArray(nodes));
	} else if (nodes) {
		list.push(nodes);
	}
	return list;
}

function toArray() {
	var arr = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

	return Array.prototype.slice.call(arr, 0);
}

function capitalize(word) {
	word = '' + word;
	return word.charAt(0).toUpperCase() + word.slice(1);
}

// Стандартные html атрибуты которые пишутся через `-`.
var attrTransformExeptionList = [
// HTML attributes
'http-equiv', 'accept-charset',

// SVG attributes
'accent-height', 'alignment-baseline', 'arabic-form', 'baseline-shift', 'cap-height', 'clip-path', 'clip-rule', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'dominant-baseline', 'enable-background', 'fill-opacity', 'fill-rule', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'glyph-name', 'glyph-orientation-horizontal', 'glyph-orientation-vertical', 'horiz-adv-x', 'horiz-origin-x', 'image-rendering', 'letter-spacing', 'lighting-color', 'marker-end', 'marker-mid', 'marker-start', 'overline-position', 'overline-thickness', 'panose-1', 'paint-order', 'pointer-events', 'rendering-intent', 'shape-rendering', 'stop-color', 'stop-opacity', 'strikethrough-position', 'strikethrough-thickness', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'text-anchor', 'text-decoration', 'text-rendering', 'underline-position', 'underline-thickness', 'unicode-bidi', 'unicode-range', 'units-per-em', 'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'word-spacing', 'writing-mode', 'x-height'];

exports.attrTransformExeptionList = attrTransformExeptionList;
var attrsMapping = {
	// Custom mapping
	'class': 'className',

	// SVG attributes
	'allowReorder': 'allowReorder',
	'attributeName': 'attributeName',
	'attributeType': 'attributeType',
	'autoReverse': 'autoReverse',
	'baseFrequency': 'baseFrequency',
	'baseProfile': 'baseProfile',
	'calcMode': 'calcMode',
	'clipPathUnits': 'clipPathUnits',
	'contentScriptType': 'contentScriptType',
	'contentStyleType': 'contentStyleType',
	'diffuseConstant': 'diffuseConstant',
	'edgeMode': 'edgeMode',
	'externalResourcesRequired': 'externalResourcesRequired',
	'filterRes': 'filterRes',
	'filterUnits': 'filterUnits',
	'glyphRef': 'glyphRef',
	'gradientTransform': 'gradientTransform',
	'gradientUnits': 'gradientUnits',
	'kernelMatrix': 'kernelMatrix',
	'kernelUnitLength': 'kernelUnitLength',
	'keyPoints': 'keyPoints',
	'keySplines': 'keySplines',
	'keyTimes': 'keyTimes',
	'lengthAdjust': 'lengthAdjust',
	'limitingConeAngle': 'limitingConeAngle',
	'markerHeight': 'markerHeight',
	'markerUnits': 'markerUnits',
	'markerWidth': 'markerWidth',
	'maskContentUnits': 'maskContentUnits',
	'maskUnits': 'maskUnits',
	'numOctaves': 'numOctaves',
	'pathLength': 'pathLength',
	'patternContentUnits': 'patternContentUnits',
	'patternTransform': 'patternTransform',
	'patternUnits': 'patternUnits',
	'pointsAtX': 'pointsAtX',
	'pointsAtY': 'pointsAtY',
	'pointsAtZ': 'pointsAtZ',
	'preserveAlpha': 'preserveAlpha',
	'preserveAspectRatio': 'preserveAspectRatio',
	'primitiveUnits': 'primitiveUnits',
	'refX': 'refX',
	'refY': 'refY',
	'repeatCount': 'repeatCount',
	'repeatDur': 'repeatDur',
	'requiredExtensions': 'requiredExtensions',
	'requiredFeatures': 'requiredFeatures',
	'specularConstant': 'specularConstant',
	'specularExponent': 'specularExponent',
	'spreadMethod': 'spreadMethod',
	'startOffset': 'startOffset',
	'stdDeviation': 'stdDeviation',
	'stitchTiles': 'stitchTiles',
	'surfaceScale': 'surfaceScale',
	'systemLanguage': 'systemLanguage',
	'tableValues': 'tableValues',
	'targetX': 'targetX',
	'targetY': 'targetY',
	'textLength': 'textLength',
	'viewBox': 'viewBox',
	'viewTarget': 'viewTarget',
	'xChannelSelector': 'xChannelSelector',
	'yChannelSelector': 'yChannelSelector',
	'zoomAndPan': 'zoomAndPan'
};

var reverseAttrsMapping = Object.keys(attrsMapping).reduce(function (target, name) {
	target[attrsMapping[name]] = name;
	return target;
}, {});

function HtmlAttrToUvdomAttr(name) {
	if (~name.indexOf('-') && !/^data-.+$/.test(name) && attrTransformExeptionList.indexOf(name) < 0) {
		name = name.split('-').map(function (part, i) {
			return !i ? part : capitalize(part);
		}).join('');
	}
	return attrsMapping[name] || name;
}

function UvdomAttrToHtmlAttr(name) {
	if (reverseAttrsMapping[name]) {
		return reverseAttrsMapping[name];
	}

	if (! ~name.indexOf('-')) {
		name = name.split(/([A-Z]{2,}|[A-Z][^A-Z]+)/).filter(Boolean).map(function (item) {
			return item.toLowerCase();
		}).join('-');
	}
	return name;
}

function isCommonElement() {
	var tagName = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

	return domTagNameRegex.test(tagName) && (tagName.indexOf(':') > 0 || !! ~_entities.htmlTags.indexOf(tagName) || !! ~_entities.svgTags.indexOf(tagName));
}

function hash() {
	var str = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

	return str.split('').reduce(function (prev, value) {
		prev = (prev << 5) - prev + value.charCodeAt(0);
		return prev & prev;
	}, 0);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./entities":55}],58:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.defer = defer;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _promise = require('../promise');

var _promise2 = _interopRequireDefault(_promise);

function defer() {
	var deferred = {};

	deferred.promise = new _promise2['default'](function (resolve, reject) {
		deferred.resolve = resolve;
		deferred.reject = reject;
	});

	return deferred;
}

},{"../promise":52}],59:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsParser = require('./utils/parser');

var _modulesLoader = require('../modules-loader');

var _modulesLoader2 = _interopRequireDefault(_modulesLoader);

var _promise = require('./promise');

var _promise2 = _interopRequireDefault(_promise);

var _utils = require('./utils');

var TemplateUtils = (function () {
	function TemplateUtils() {
		var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, TemplateUtils);

		this.params = params;
		this.assign = _utils.assign;
	}

	_createClass(TemplateUtils, [{
		key: 'createElement',
		value: function createElement(type, attrs) {
			var node = {};
			var attrNames = Object.keys(attrs || {});

			for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
				children[_key - 2] = arguments[_key];
			}

			if (children.length) {
				node.children = children.length > 1 ? children : children[0];
			}

			if (attrNames.length) {
				node.attrs = {};
				attrNames.filter(function (name) {
					return typeof attrs[name] !== 'undefined';
				}).forEach(function (name) {
					if (name === 'key' || name === 'ref') {
						node[name] = attrs[name];
					} else {
						node.attrs[name] = attrs[name];
					}
				});
			}

			if ((0, _utilsParser.isCommonElement)(type)) {
				node.tag = type;
			} else {
				node.component = type;
			}

			return node;
		}
	}, {
		key: 'createShadowRootFor',
		value: function createShadowRootFor(node) {
			var id = arguments.length <= 1 || arguments[1] === undefined ? 'main' : arguments[1];

			var style = undefined;

			this.styles.some(function (item) {
				if (item.name === id) {
					style = item;
					return true;
				}
			});

			if (style) {
				var _style = style;
				var shadowRootId = _style.shadowRootId;
				var styleContent = _style.styles;

				return this.createElement('span', {
					'data-shadow-root-id': shadowRootId
				}, this.createElement('style', {
					'data-shadow-styles-id': shadowRootId
				}, styleContent), node);
			}

			return node;
		}
	}, {
		key: 'requireImport',
		value: function requireImport(name) {
			var result = undefined;

			this.imports.some(function (item) {
				if (item.id === name) {
					result = item['export'];
					return true;
				}
			});

			if (!result) {
				throw new Error('Can\'t require component that wasn\'t specified in definition! You must add <link rel="import" /> for "' + this.componentName + '" component first.');
			}

			return result;
		}
	}, {
		key: 'loadExternalModule',
		value: function loadExternalModule(path) {
			return new _promise2['default'](function (resolve, reject) {
				(0, _modulesLoader2['default'])([path], resolve, reject);
			});
		}
	}, {
		key: 'componentName',
		get: function get() {
			return this.params.name;
		}
	}, {
		key: 'styles',
		get: function get() {
			return this.params.styles || [];
		}
	}, {
		key: 'imports',
		get: function get() {
			return this.params.imports || [];
		}
	}]);

	return TemplateUtils;
})();

exports['default'] = TemplateUtils;
module.exports = exports['default'];

},{"../modules-loader":62,"./promise":52,"./utils":53,"./utils/parser":57}],60:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _backboneEventsStandalone = require('backbone-events-standalone');

var _backboneEventsStandalone2 = _interopRequireDefault(_backboneEventsStandalone);

var ComponentsList = (function () {
	function ComponentsList() {
		var _this = this;

		_classCallCheck(this, ComponentsList);

		_backboneEventsStandalone2['default'].mixin(this);

		this.map = {};
		this.registered = [];
		this.constructors = {};

		this.on('attached', function (element) {
			var name = element.nodeName.toLowerCase();

			if (!has(_this.map, name)) {
				add(_this.map, name, []);
			}
			add(_this.map[name], element);
		});

		this.on('detached', function (element) {
			var name = element.nodeName.toLowerCase();

			if (has(_this.map, name)) {
				remove(_this.map[name], element);
			}
		});

		this.on('registered', function (name, constructor) {
			_this.constructors[name] = constructor;
			add(_this.registered, name);
		});
	}

	_createClass(ComponentsList, [{
		key: 'getAttached',
		value: function getAttached(name) {
			return this.map[name];
		}
	}, {
		key: 'getAttachedNames',
		value: function getAttachedNames() {
			return Object.keys(this.map);
		}
	}, {
		key: 'getRegisteredNames',
		value: function getRegisteredNames() {
			return this.registered.slice(0);
		}
	}, {
		key: 'isRegistered',
		value: function isRegistered(name) {
			return has(this.registered, name);
		}
	}, {
		key: 'getConstructorFor',
		value: function getConstructorFor(name) {
			return this.constructors[name];
		}
	}]);

	return ComponentsList;
})();

exports['default'] = new ComponentsList();

function add(target, name, value) {
	if (Array.isArray(target)) {
		! ~target.indexOf(name) && target.push(name);
	} else {
		target[name] = value;
	}
}

function remove(target, name) {
	if (Array.isArray(target)) {
		var index = target.indexOf(name);
		~index && target.splice(index, 1);
	} else {
		delete target[name];
	}
}

function has(target, name) {
	if (Array.isArray(target)) {
		return !! ~target.indexOf(name);
	} else {
		return !!target[name];
	}
}
module.exports = exports['default'];

},{"backbone-events-standalone":2}],61:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _skatejsSrcSkate = require('skatejs/src/skate');

var _skatejsSrcSkate2 = _interopRequireDefault(_skatejsSrcSkate);

var _skatejsSrcMutationObserver = require('skatejs/src/mutation-observer');

var _skatejsSrcMutationObserver2 = _interopRequireDefault(_skatejsSrcMutationObserver);

var _libUtilsDom = require('./lib/utils/dom');

var _libUtils = require('./lib/utils');

var _libUtilsEvents = require('./lib/utils/events');

var _libUtilsParser = require('./lib/utils/parser');

var THROTTLE_TIMEOUT = 300;

exports['default'] = function (instanceName) {
	var modelName = (instanceName || 'unknown') + '-model';

	return (0, _skatejsSrcSkate2['default'])(modelName, {
		prototype: {
			_dump: null,

			dispatcher: null,
			observer: null,

			get: function get(name, selector) {
				if (name === undefined) name = '';

				var result = undefined;

				(0, _libUtilsParser.nodesToArray)(this.childNodes).some(function (node) {
					if (node.nodeName.toLowerCase() === 'content' && node.getAttribute('name') === name) {
						result = node;
						return true;
					}
				});

				if (selector) {
					result = result.querySelector(selector);
				}
				return result;
			},

			getValue: function getValue(name) {
				var prop = this.get(name);

				if (prop == null) {
					return;
				}
				return prop.textContent;
			},

			dump: function dump() {
				this._dump || (this._dump = (0, _libUtilsDom.HTMLtoModel)(this));
				return this._dump;
			},

			resolve: function resolve() {
				return (0, _libUtilsDom.resolveModelRefs)(this);
			},

			flushDump: function flushDump() {
				this._dump = null;
			},

			fill: function fill(model) {
				this.appendChild((0, _libUtilsDom.ModelToHTML)(model));
			},

			suspend: function suspend() {
				this.observer != null && this.observer.disconnect();
				this.observer = null;
			},

			resume: function resume() {
				this.observer != null && this.suspend();
				this.observer = new _skatejsSrcMutationObserver2['default'](this.dispatcher);
				this.observer.observe(this, {
					childList: true,
					subtree: true
				});
			},

			batchUpdate: function batchUpdate(updater) {
				if (typeof updater === 'function') {
					this.suspend();
					updater.call(this);
					this.resume();
					this.dispatcher();
				}
			}
		},

		template: function template(element) {
			element.style.display = 'none';
		},

		created: function created(element) {
			var dispatch = (0, _libUtils.throttle)(dispatcher.bind(element), THROTTLE_TIMEOUT);
			element.dispatcher = function (mutations) {
				return dispatch(mutations, element.dump());
			};
		},

		attached: function attached(element) {
			element.dump();
		}
	});
};

function dispatcher(mutations, prevSnapshot) {
	if (mutations === undefined) mutations = [];

	var newSnapshot = undefined;

	this.flushDump();
	newSnapshot = this.dump();

	var event = (0, _libUtilsEvents.createEvent)('model-changed', {
		detail: {
			prevSnapshot: prevSnapshot,
			newSnapshot: newSnapshot,
			mutations: mutations
		}
	});

	this.dispatchEvent(event);
}
module.exports = exports['default'];

},{"./lib/utils":53,"./lib/utils/dom":54,"./lib/utils/events":56,"./lib/utils/parser":57,"skatejs/src/mutation-observer":20,"skatejs/src/skate":22}],62:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _libUtils = require('./lib/utils');

var load = function load() {
	return window.require.apply(window, arguments);
};

function loader(deps, callback, fail) {
	return load(deps, function () {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return callback.apply(undefined, _toConsumableArray(args.map(interopES6Modules)));
	}, fail);
}

exports['default'] = (0, _libUtils.assign)(loader, {
	register: function register(loader) {
		if (typeof loader === 'function') {
			load = loader;
		}
		return this;
	}
});

// Обрабатываем конструкцию ES6 модулей замернутых в amd.
function interopES6Modules(module) {
	if (module.__esModule) return module['default'] != null ? module['default'] : module;
	return module;
}
module.exports = exports['default'];

},{"./lib/utils":53}],63:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = parser;

var _libUtils = require('../lib/utils');

var _libUtilsParser = require('../lib/utils/parser');

var nodeTypes = {
	ELEMENT_NODE: 1,
	ATTRIBUTE_NODE: 2,
	TEXT_NODE: 3,
	CDATA_SECTION_NODE: 4,
	ENTITY_REFERENCE_NODE: 5,
	ENTITY_NODE: 6,
	PROCESSING_INSTRUCTION_NODE: 7,
	COMMENT_NODE: 8,
	DOCUMENT_NODE: 9,
	DOCUMENT_TYPE_NODE: 10,
	DOCUMENT_FRAGMENT_NODE: 11,
	NOTATION_NODE: 12
};

function parser() {
	var target = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	if (typeof target === 'string' && target) {
		var content = target;

		target = document.createElement('span');
		target.innerHTML = content;
		target.setAttribute('data-is-uvdoom-wrapper', '');
	} else if (typeof target.cloneNode !== 'function') {
		return {};
	}

	return parseNodes((0, _libUtilsParser.nodesToArray)(target.cloneNode(true)), params);
}

function parseNodes() {
	var nodes = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
	var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	var vNodes = [];

	nodes.forEach(function (node) {
		var vNode = {};

		if (node.nodeType === nodeTypes.ELEMENT_NODE) {
			var tagName = node.tagName.toLowerCase();

			if (typeof params.onTagNameResolve === 'function') {
				tagName = params.onTagNameResolve(node) || tagName;
			}

			if ((0, _libUtilsParser.isCommonElement)(tagName)) {
				vNode.tag = tagName;
			} else {
				vNode.component = tagName;
			}

			if (node.hasAttributes()) {
				(0, _libUtilsParser.toArray)(node.attributes).forEach(function (attr) {
					var name = attr.name;
					var value = attr.value;

					// Преобразовываем название атрибута в нотацию UVDOM.
					name = (0, _libUtilsParser.HtmlAttrToUvdomAttr)(name);

					if (vNode.component && name === 'is') {
						vNode['extends'] = value;
					} else if (['key', 'ref'].indexOf(name) >= 0) {
						value != null && (vNode[name] = value);
					} else if (_libUtilsParser.eventNameRegex.test(name)) {
						var match = name.match(_libUtilsParser.eventNameRegex);

						if (match) {
							vNode.events || (vNode.events = {});
							vNode.events[match[1]] = value;
						}
					} else {
						var parsedValue = undefined;

						try {
							parsedValue = JSON.parse(value);
						} catch (e) {}

						// Спасибо IE11 за то что у тебя `JSON.parse('000123')` это валидный JSON...
						// Чтоб избежать проблемы со строками которые парсятся, как числа
						// мы делаем проверку — если результат `JSON.parse()` это не массив
						// или объект, то не используем распарсенное значение.
						if (parsedValue != null && typeof parsedValue === 'object') {
							value = parsedValue;
						}

						if (name === 'style') {
							name = 'cssText';
						}

						vNode.attrs || (vNode.attrs = {});
						vNode.attrs[name] = value;
					}
				});
			}

			processNodeChildren(node, vNode, params);

			vNodes.push(vNode);
		} else if (node.nodeType === nodeTypes.TEXT_NODE) {
			var text = node.textContent.replace(/[\t\n\r]+/g, '');

			text && vNodes.push(text);
		} else if (node.nodeType === nodeTypes.DOCUMENT_FRAGMENT_NODE) {
			vNode.tag = 'document-fragment';
			processNodeChildren(node, vNode, params);
			vNodes.push(vNode);
		} else if ([nodeTypes.COMMENT_NODE, nodeTypes.CDATA_SECTION_NODE].indexOf(node.nodeType) < 0) {
			console.warn('Unhandled node type: ' + node.nodeType);
		}
	});

	if (!vNodes.length) {
		return null;
	}

	return vNodes.length > 1 ? vNodes : vNodes[0];
}

function processNodeChildren(node, vNode) {
	var params = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	if (node.childNodes) {
		var childNodes = parseNodes((0, _libUtilsParser.nodesToArray)(node.childNodes), params);

		if (childNodes) {
			vNode.children = childNodes;
		}
	}
	return vNode;
}
module.exports = exports['default'];

},{"../lib/utils":53,"../lib/utils/parser":57}],64:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _libUtils = require('../lib/utils');

var _libUtilsParser = require('../lib/utils/parser');

exports['default'] = function (uvdom, params) {
	if (typeof uvdom === 'object' && !Array.isArray(uvdom)) {
		var type = uvdom.tag || uvdom.component;

		if (typeof type === 'string' && type) {
			return toHTML(params, uvdom);
		}
	}
	return null;
};

function toHTML(params, uvdom) {
	if (params === undefined) params = {};

	var processNodes = toHTML.bind(this, params);

	if (Array.isArray(uvdom)) {
		if (uvdom.length === 1) {
			return processNodes(uvdom[0]);
		}
		return uvdom.map(processNodes);
	} else if (uvdom != null && typeof uvdom === 'object') {
		var type = typeof params.onTypeNameResolve === 'function' ? params.onTypeNameResolve(uvdom) : uvdom.tag || uvdom.component;
		var children = processNodes(uvdom.children);
		var node = createNode(type);

		if (Array.isArray(children)) {
			children.map(processTextNode).forEach(function (child) {
				node.appendChild(child);
			});
		} else if (children != null) {
			node.appendChild(processTextNode(children));
		}

		if (uvdom.events) {
			Object.keys(uvdom.events).forEach(function (eventName) {
				node.setAttribute('on' + eventName, uvdom.events[eventName]);
			});
		}

		if (uvdom.attrs) {
			Object.keys(uvdom.attrs).forEach(function (attr) {
				if (attr === 'style') {
					return;
				} else if (attr === 'cssText') {
					return node.setAttribute('style', uvdom.attrs[attr]);
				}
				node.setAttribute((0, _libUtilsParser.UvdomAttrToHtmlAttr)(attr), uvdom.attrs[attr]);
			});
		}

		['key', 'ref'].forEach(function (prop) {
			prop in uvdom && node.setAttribute(prop, uvdom[prop]);
		});

		return node;
	}
	return uvdom;
}

function processTextNode(node) {
	if (typeof node === 'string') {
		return createTextNode(node);
	}
	return node;
}

function createNode() {
	var name = arguments.length <= 0 || arguments[0] === undefined ? 'span' : arguments[0];

	return document.createElement(name);
}

function createTextNode() {
	var text = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

	return document.createTextNode(text);
}
module.exports = exports['default'];

},{"../lib/utils":53,"../lib/utils/parser":57}],65:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _virtualDomDiff = require('virtual-dom/diff');

var _virtualDomDiff2 = _interopRequireDefault(_virtualDomDiff);

var _virtualDomPatch = require('virtual-dom/patch');

var _virtualDomPatch2 = _interopRequireDefault(_virtualDomPatch);

var _virtualDomCreateElement = require('virtual-dom/create-element');

var _virtualDomCreateElement2 = _interopRequireDefault(_virtualDomCreateElement);

var _skatejsSrcMutationObserver = require('skatejs/src/mutation-observer');

var _skatejsSrcMutationObserver2 = _interopRequireDefault(_skatejsSrcMutationObserver);

var _virtualDomVnodeVnode = require('virtual-dom/vnode/vnode');

var _virtualDomVnodeVnode2 = _interopRequireDefault(_virtualDomVnodeVnode);

var _virtualDomVnodeVtext = require('virtual-dom/vnode/vtext');

var _virtualDomVnodeVtext2 = _interopRequireDefault(_virtualDomVnodeVtext);

var _libUtilsDom = require('../lib/utils/dom');

var _libUtilsParser = require('../lib/utils/parser');

var _componentSpecification = require('../component/specification');

var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
var UID_PROP_NAME = 'vdom_uid';

var uid = 0;

var CustomElement = (function () {
	function CustomElement(vdom) {
		_classCallCheck(this, CustomElement);

		this.type = 'Widget';
		this.vdom = vdom;
		this.key = vdom.key;
		this.vdom.properties[UID_PROP_NAME] = this.uid = ++uid;
	}

	_createClass(CustomElement, [{
		key: 'init',
		value: function init() {
			return (0, _virtualDomCreateElement2['default'])(this.vdom);
		}
	}, {
		key: 'update',
		value: function update(previous, domNode) {
			// Так как для кастомных элементов мы делаем дифование в ручном режиме, то нам необходимо
			// убедится в том что мы собираемся обрабатывать DOM элемент сгенерированный текущим
			// виртуальным узлом.
			// Это соответсвие проверяется по свойству `uid`. Если `uid` у `domNode` и `previous`
			// виртуальной ноды отличается, то это обозначает, что произошло изменение в сиблингах
			// и мы должно отдать дифование на усмотрение библиотеки виртуального дома.
			// Так же необходимо убедиться, что `domNode` закончил свой апгрейд до кастомного элемента
			// иначе дифование в ручном режиме не имеет смысла.
			if ('_instance' in domNode && domNode[UID_PROP_NAME] === previous.uid) {
				this.updateModel(previous, domNode);
				this.updateAttrs(previous, domNode);
				domNode[UID_PROP_NAME] = this.uid;

				// Обрабатываем редкий кейс, когда во время высчитывания обновления для компонента
				// выясняется, что по состоянию его жизненного цикла он еще не находится в DOM.
				// Это вызвано плохой работой полифила для MutationOserver (привет IE11).
				// Для исправления ситуации форсировано актуализируем состояние компонента.
				if (!domNode._attached) {
					domNode.checkComponentAndActualizeLifecycleIfNeeded();
				}
			} else {
				(0, _virtualDomPatch2['default'])(domNode, (0, _virtualDomDiff2['default'])(previous.vdom, this.vdom));
			}
		}
	}, {
		key: 'updateAttrs',
		value: function updateAttrs(previous, domNode) {
			var attrs = this.vdom.properties.attributes;
			var prevAttrs = previous.vdom.properties.attributes;
			var changes = [];

			// Высчитываем удаленные атрибуты.
			Object.keys(prevAttrs).forEach(function (name) {
				if (!(name in attrs)) {
					changes.push({
						name: name,
						newValue: null,
						oldValue: prevAttrs[name]
					});
				}
			});

			// Высчитываем добавленные/измененные атрибуты.
			Object.keys(attrs).forEach(function (name) {
				var newValue = attrs[name];
				var oldValue = prevAttrs[name] != null ? prevAttrs[name] : null;

				if (newValue !== oldValue) {
					changes.push({ name: name, newValue: newValue, oldValue: oldValue });
				}
			});

			// Применяем обновления к компоненту.
			this.flushAttrChanges(domNode, changes);
		}
	}, {
		key: 'flushAttrChanges',
		value: function flushAttrChanges(domNode, changes) {
			var attributes = domNode._attributes;

			changes.forEach(function (change) {
				var name = change.name;
				var newValue = change.newValue;

				if (newValue == null) {
					domNode.removeAttribute(name);
				} else {
					domNode.setAttribute(name, newValue);
				}

				// Полифил для IE11 не всегда может отловить изменения в атрибутах, поэтому делаем
				// гарантированный вызов обработчика.
				if (_skatejsSrcMutationObserver2['default'].isFixingIe && typeof attributes[name] === 'function') {
					attributes[name](domNode, change);
				}
			});
		}
	}, {
		key: 'updateModel',
		value: function updateModel(previous, domNode) {
			this.vdom.children.filter(function (vnode) {
				return vnode.tagName === 'content';
			}).forEach(function (vnode) {
				var name = vnode.properties.attributes.name;

				var target = domNode.modelNode.get(name);

				for (var i = 0, _length = domNode.childNodes.length; i < _length; i++) {
					var child = domNode.childNodes[i];
					if (child.nodeName.toLowerCase() === 'content' && child.getAttribute('name') === name) {
						target = child;
						break;
					}
				}

				if (target) {
					var node = (0, _virtualDomCreateElement2['default'])(vnode);

					if (node.innerHTML != target.innerHTML) {
						target.parentNode.replaceChild(node, target);
					}
				}
			});
		}
	}]);

	return CustomElement;
})();

exports['default'] = function (uvdomTree) {
	if (uvdomTree) {
		return convert(uvdomTree);
	}
};

var attrsAsProps = {
	input: {
		value: 'value',
		checked: 'checked'
	}
};

function convert(node, namespace) {
	if (node == null) {
		return;
	}

	var out;

	if (typeof node === 'string') {
		out = new _virtualDomVnodeVtext2['default'](node);
	} else {
		var _ret = (function () {
			var type = node.tag || node.component;
			var attrs = {};
			var props = {
				attributes: attrs
			};
			var key = node.key;
			var attrsToPropsList = attrsAsProps[type];

			if (node.attrs) {
				Object.keys(node.attrs).forEach(function (name) {
					if (name === 'cssText') {
						return attrs.style = node.attrs[name];
					}

					if (name === _componentSpecification.inactiveComponentRefDataAttr) {
						return type = node.attrs[name];
					}

					var domAttrName = (0, _libUtilsParser.UvdomAttrToHtmlAttr)(name);
					var value = node.attrs[name];

					// Атрибуты могут быть только строками.
					if (typeof value !== 'string') {
						value = JSON.stringify(value);
					}

					attrs[domAttrName] = value;

					// Кастомная обработка инпутов. Некоторые атрибуты нужно задавать, как свойства
					// иначе не будет никакого эффекта.
					if (attrsToPropsList && attrsToPropsList[domAttrName]) {
						props[attrsToPropsList[domAttrName]] = value;
					}
				});
			}

			// Для оптимизации добавляем в качестве сайд-эффекта кастомную отрисовку стилей. Так как
			// у них есть уникальный хеш их контента, то достаточно иметь лишь один инстанс стилей
			// на странице.
			if (type === 'style') {
				renderStyles(node);
				return {
					v: out = new _virtualDomVnodeVtext2['default']('')
				};
			}

			// Чтоб svg отрисовывался корректно ему необходимо добавить namespace.
			if (type === 'svg') {
				namespace = SVG_NAMESPACE;
			}

			var children = [].concat(node.children || []).reduce(function (collection, child) {
				return collection.concat(child);
			}, []) // Список потомков делаем плоским.
			.map(function (child) {
				// Числа обязательно должны быть строками иначе они могут быть отфильтрованы.
				if (typeof child === 'number') {
					return child.toString();
				}
				return child;
			}).filter(function (child) {
				// Отфильтровывем не допустимые типы нод.
				return typeof child === 'string' || child && (child.component || child.tag);
			});

			out = new _virtualDomVnodeVnode2['default'](type, props, children.map(function (child) {
				return convert(child, namespace);
			}), key, namespace);

			// Для кастомных элементов берем отрисовку под свой контроль так как механизм дифования
			// после инициализации компонентов перестает учитывать их внутренюю структуру что привод
			// к поломке верстки при патче изменений.
			if ((0, _libUtilsDom.isCustomElement)(type)) {
				out = new CustomElement(out);
			}
		})();

		if (typeof _ret === 'object') return _ret.v;
	}

	return out;
}

var stylesCache = {};

function renderStyles(node) {
	if (!stylesCache[node.attrs['data-shadow-styles-id']]) {
		var style = stylesCache[node.attrs['data-shadow-styles-id']] = document.createElement('style');

		style.textContent = node.children;
		document.body.appendChild(style);
	}
}
module.exports = exports['default'];

},{"../component/specification":50,"../lib/utils/dom":54,"../lib/utils/parser":57,"skatejs/src/mutation-observer":20,"virtual-dom/create-element":25,"virtual-dom/diff":26,"virtual-dom/patch":30,"virtual-dom/vnode/vnode":44,"virtual-dom/vnode/vtext":46}],66:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rendererDefault = require('./renderer/default');

var _rendererDefault2 = _interopRequireDefault(_rendererDefault);

var _libUtils = require('./lib/utils');

var renderer = _rendererDefault2['default'];

var render = function render(target) {
	return function (uvdom, done) {
		return renderer(target, uvdom, done);
	};
};

exports['default'] = (0, _libUtils.assign)(render, {
	'default': _rendererDefault2['default'],

	register: function register(customRenderer) {
		if (typeof customRenderer === 'function') {
			renderer = customRenderer;
		}
		return this;
	}
});
module.exports = exports['default'];

},{"./lib/utils":53,"./renderer/default":67}],67:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _fastdom = require('fastdom');

var _fastdom2 = _interopRequireDefault(_fastdom);

var _virtualDomDiff = require('virtual-dom/diff');

var _virtualDomDiff2 = _interopRequireDefault(_virtualDomDiff);

var _virtualDomPatch = require('virtual-dom/patch');

var _virtualDomPatch2 = _interopRequireDefault(_virtualDomPatch);

var _virtualDomCreateElement = require('virtual-dom/create-element');

var _virtualDomCreateElement2 = _interopRequireDefault(_virtualDomCreateElement);

var _virtualDomVnodeVnode = require('virtual-dom/vnode/vnode');

var _virtualDomVnodeVnode2 = _interopRequireDefault(_virtualDomVnodeVnode);

var _parsersUvdomToHyperscript = require('../parsers/uvdom-to-hyperscript');

var _parsersUvdomToHyperscript2 = _interopRequireDefault(_parsersUvdomToHyperscript);

var incId = 0;
var vdomNodesCache = {};

var VDOM_ROOT_ID = 'data-vdom-id';
var VDOM_RENDER_ROOT = 'data-vdom-root';

exports['default'] = function (target, uvdomTree, done) {
	render(target, uvdomTree, done);
};

function render(target, uvdomTree, done) {
	var cacheId = target.getAttribute(VDOM_ROOT_ID);

	if (cacheId == null) {
		target.setAttribute(VDOM_ROOT_ID, cacheId = ++incId);
	}

	if (!vdomNodesCache[cacheId]) {
		(function () {
			var vdomTree = wrapRootNode((0, _parsersUvdomToHyperscript2['default'])(uvdomTree));
			var rootNode = (0, _virtualDomCreateElement2['default'])(vdomTree);
			var record = {
				batchId: null,
				tree: vdomTree,
				node: rootNode
			};

			vdomNodesCache[cacheId] = record;

			_fastdom2['default'].write(function () {
				target.innerHTML = '';
				target.appendChild(rootNode);
				done();
			});
		})();
	} else {
		(function () {
			var record = vdomNodesCache[cacheId];
			var newVdomTree = wrapRootNode((0, _parsersUvdomToHyperscript2['default'])(uvdomTree));
			var patchRecord = (0, _virtualDomDiff2['default'])(record.tree, newVdomTree);

			record.batchId && _fastdom2['default'].clear(record.batchId);
			record.batchId = _fastdom2['default'].write(function () {
				(0, _virtualDomPatch2['default'])(record.node, patchRecord);
				record.tree = newVdomTree;
				done();
			});
		})();
	}
}

// Оборачиваем дерево отрисовки для того чтоб не поломался мехнизм дифования если содержимое вью
// при обновлении полностью измениться. Иначе перерисовываться будет нода, которой уже давно нет
// в DOM дереве.
function wrapRootNode(node) {
	return new _virtualDomVnodeVnode2['default']('span', {
		attributes: _defineProperty({}, VDOM_RENDER_ROOT, '')
	}, [node]);
}
module.exports = exports['default'];

},{"../parsers/uvdom-to-hyperscript":65,"fastdom":14,"virtual-dom/create-element":25,"virtual-dom/diff":26,"virtual-dom/patch":30,"virtual-dom/vnode/vnode":44}],68:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _libPromise = require('./lib/promise');

var _libPromise2 = _interopRequireDefault(_libPromise);

var _libUtilsParser = require('./lib/utils/parser');

var _config = require('./config');

var cache = {};
var queue = {};

var TemplateWorker = (function () {
	function TemplateWorker(template) {
		_classCallCheck(this, TemplateWorker);

		this._rejectWorker;
		this._template = template;
		this._workerPath = (0, _config.get)().workersUrl + '/template.js';

		var templateHash = (0, _libUtilsParser.hash)(JSON.stringify(template));

		if (!cache[templateHash]) {
			cache[templateHash] = {};
		}

		this._cachedResults = cache[templateHash];
	}

	_createClass(TemplateWorker, [{
		key: 'template',
		value: function template(model) {
			var _this = this;

			var modelHash = (0, _libUtilsParser.hash)(JSON.stringify(model));

			// Процесс шаблонизации идемпотентен, поэтому если модель не менялась нет смысла делать
			// шаблонизацию в очередной раз.
			if (this._cachedResults[modelHash]) {
				return _libPromise2['default'].resolve(this._cachedResults[modelHash]);
			}

			if (this._rejectWorker) {
				this._rejectWorker('Terminated by next template request');
				this._rejectWorker = void 0;
			}

			if (!queue[modelHash]) {
				(function () {
					var worker = new Worker(_this._workerPath);

					queue[modelHash] = new _libPromise2['default'](function (resolve) {
						worker.postMessage([_this._template, model]);
						worker.onmessage = function (event) {
							return resolve(event.data);
						};
					}).then(function (result) {
						_this._cachedResults[modelHash] = result;
						queue[modelHash] = void 0;
						return result;
					});
				})();
			}

			return new _libPromise2['default'](function (resolve, reject) {
				_this._rejectWorker = reject;
				queue[modelHash].then(resolve);
			});
		}
	}]);

	return TemplateWorker;
})();

exports.TemplateWorker = TemplateWorker;

},{"./config":51,"./lib/promise":52,"./lib/utils/parser":57}],"WebComponents":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _component = require('./component');

var _component2 = _interopRequireDefault(_component);

var _renderer = require('./renderer');

var _renderer2 = _interopRequireDefault(_renderer);

var _list = require('./list');

var _list2 = _interopRequireDefault(_list);

var _libUtils = require('./lib/utils');

var _config = require('./config');

exports['default'] = function (config) {
	var proxy = function proxy() {
		return _component2['default'].apply(undefined, arguments);
	};

	(0, _config.extend)(config);

	return (0, _libUtils.assign)(proxy, {
		render: _renderer2['default'],
		components: _list2['default']
	});
};

module.exports = exports['default'];

},{"./component":49,"./config":51,"./lib/utils":53,"./list":60,"./renderer":66}]},{},[]);
;

	try {
		return require('WebComponents')(module.config());
	} catch(e) {}
});