function thenMethodForX(onFulfilled) {
  console.log(this)
}


var a = Object.create(null, {
  then: {
    get: function () {
      return thenMethodForX.bind({a:'123'})
    }
  }
})

a.then()