var Primus = require('primus.io')
var app = require('express')()
var server = require('http').createServer(app)

var primus = new Primus(server, { transformer: 'websockets', parser: 'JSON' })

primus.on('connection', function (spark) {
  spark.on('data', onData(spark))
})

server.listen(3000)

function onData(spark) {
  return function (data) {
    data = data || {}
    var action = data.action
    var room = data.room
    var type = data.type

    if (action === 'join') {
      spark.join(room, function () {
        spark.write('you joined room ' + room + ' with ID ' + spark.id)
        spark.room(room)
          .except(spark.id)
          .write(spark.id + ' joined room ' + room)
      })
    }

    if (action === 'leave') {
      spark.leave(room, function () {
        spark.write('you left room ' + room)
      })
    }

    if (data.data) {
      spark.room(room).except(spark.id).write(data.data)
    }
  }
}