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

  function handleHandlers() {
    setTimeout(function () {
      for (let index = 0; index < handlers.length; index++) {
        var handler = handlers[index]
        handle(handler)
      }
      handlers = null
    }, 0)
  }

  function fulfill(result) {
    if (state !== PENDING) return
    state = FULFILLED
    value = result
    handleHandlers()
  }

  function reject(error) {
    if (state !== PENDING) return
    state = REJECTED
    value = error
    handleHandlers()
  }

  function resolve(result) {
    try {
      if (result === self) {
        throw new TypeError('A promise cannot be resolved with itself.')
      }

      var resultType = typeof result
      if (result && (resultType === 'object' || resultType === 'function')) {
        var then = result.then //because x.then could be a getter 下文的 then.call 也是如此
        if (typeof then === 'function') {

          var done = false
          try {
            then.call(result, function (value) {
              if (done) return
              done = true
              resolve(value)
            }, function (reason) {
              if (done) return
              done = true
              reject(reason)
            })
          } catch (ex) {
            if (done) return
            done = true
            reject(ex)
          }
          return
        }
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

  try {
    fn(resolve, reject)
  } catch (reason) {
    reject(reason)
  }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
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

Promise.resolve = function (value) {
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value
  }

  return new Promise(function (resolve) {
    resolve(value)
  })
}

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value)
  })
}

module.exports = Promise
