var Primus = require('primus.io')

function createServer(options) {
  var app = require('express')()
  var server = require('http').createServer(app)
  var primus = new Primus(server, { transformer: 'websockets', parser: 'JSON' })

  primus.on('connection', function (spark) {
    spark.on('data', onData(spark))
  })

  server.listen(options.port || 3000)
}

function onData(spark) {
  return function (data) {
    data = data || {}
    var action = data.action
    var room = data.room
    var type = data.type

    if (action === 'join') {
      if (spark.room(room).clients().length >= 2) {
        return spark.write('max of clients connected to the room ' + room)
      }
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

exports.create = createServer
