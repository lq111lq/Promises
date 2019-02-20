var Promise = require('../core/Promise')
console.log(Promise)
module.exports = {
  resolved: Promise.resolve.bind(Promise),
  rejected: Promise.reject.bind(Promise),
  deferred: function() {
    var obj = {};
    var prom = new Promise(function(resolve, reject) {
      obj.resolve = resolve;
      obj.reject = reject;
    });
    obj.promise = prom;
    return obj;
  }
}