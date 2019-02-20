var PENDING = 0
var FULFILLED = 1
var REJECTED = 2

function Promise(fn) {
  // store state which can be PENDING, FULFILLED or REJECTED
  var self = this
  var state = PENDING

  // store value once FULFILLED or REJECTED
  var value = null

  // store sucess & failure handlers
  var handlers = []

  function fulfill(result) {
    state = FULFILLED
    value = result
    setTimeout(function () {
      for (let index = 0; index < handlers.length; index++) {
        var handler = handlers[index]
        handle(handler)
      }
      handlers = null
    }, 0)
  }

  function reject(error) {
    state = REJECTED
    value = error
    setTimeout(function () {
      for (let index = 0; index < handlers.length; index++) {
        var handler = handlers[index]
        handle(handler)
      }
      handlers = null
    }, 0)
  }

  function resolve(result) {
    try {
      if (result === self) {
        throw new TypeError('A promise cannot be resolved with itself.')
      }
      var then = getThen(result)
      if (then) {
        doResolve(then.bind(result), resolve, reject)
        return
      }
      fulfill(result)
    } catch (e) {
      reject(e)
    }
  }

  function handle(handler) {
    if (state === PENDING) {
      handlers.push(handler)
    } else {
      setTimeout(function () {
        if (state === FULFILLED &&
          typeof handler.onFulfilled === 'function') {
          handler.onFulfilled(value)
        }
        if (state === REJECTED &&
          typeof handler.onRejected === 'function') {
          handler.onRejected(value)
        }
      }, 0)
    }
  }

  this.done = function (onFulfilled, onRejected) {
    handle({
      onFulfilled: onFulfilled,
      onRejected: onRejected
    })
  }

  this.then = function (onFulfilled, onRejected) {
    var self = this
    return new Promise(function (resolve, reject) {
      return self.done(function (result) {
        if (typeof onFulfilled === 'function') {
          try {
            return resolve(onFulfilled(result))
          } catch (ex) {
            return reject(ex)
          }
        } else {
          return resolve(result)
        }
      }, function (error) {
        if (typeof onRejected === 'function') {
          try {
            return resolve(onRejected(error))
          } catch (ex) {
            return reject(ex)
          }
        } else {
          return reject(error)
        }
      })
    })
  }

  doResolve(fn, resolve, reject)
}

/**
 * Check if a value is a Promise and, if it is,
 * return the `then` method of that promise.
 *
 * @param {Promise|Any} value
 * @return {Function|Null}
 */
function getThen(value) {
  var t = typeof value
  if (value && (t === 'object' || t === 'function')) {
    var then = value.then
    if (typeof then === 'function') {
      return then
    }
  }
  return null
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 *
 * @param {Function} fn A resolver function that may not be trusted
 * @param {Function} onFulfilled
 * @param {Function} onRejected
 */
function doResolve(fn, onFulfilled, onRejected) {
  var done = false
  try {
    fn(function (value) {
      if (done) return
      done = true
      onFulfilled(value)
    }, function (reason) {
      if (done) return
      done = true
      onRejected(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}

Promise.resolve = function(value) {
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value
  }

  return new Promise(function(resolve) {
    resolve(value)
  })
}

Promise.reject = function(value) {
  return new Promise(function(resolve, reject) {
    reject(value)
  })
}

module.exports = Promise
