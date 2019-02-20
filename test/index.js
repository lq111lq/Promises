describe("Promises/A+ Tests", function () {
  // this.timeout(5000)
  require("promises-aplus-tests").mocha(require('./adapter.js'));
})