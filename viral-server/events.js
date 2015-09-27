var sockio = require('socket.io');
var TIMEOUT = 60000;
var connections = {};
var connectionIds = [];
var io;
var db;
var Users;
var Viruses;

function setup() {
  io.on('connection', function(socket) {
    var newId = socket.id;
    connections[newId] = {
      socket: socket,
      uuid: null
    };
    connectionIds.push(newId);
    console.log('user connected');
    console.log(connectionIds.length + ' users connected');

    socket.on('disconnect', function() {
      var i = connectionIds.indexOf(socket.id);
      if (i > -1) {
        connectionIds.splice(i, 1);
      }
      delete connections[newId];
      console.log('user disconnected');
      console.log(connectionIds.length + ' users connected');
    });

    socket.on('set-uuid', function(uuid) {
      connections[socket.id].uuid = uuid;
      Users.findOne({uuid: uuid}, function(err, user) {
        if (err) {
          return socket.emit('error', err);
        }
        if (user) {
          socket.emit('user-set', user);
        } else {
          createUser(uuid, uuid, function(err, result) {
            if (err) {
              return socket.emit('error', err);
            }
            socket.emit('user-set', result.ops[0]);
          });
        }
      });
    });

    socket.on('new-virus', function(data) {
      var uuid = connections[socket.id].uuid;
      Viruses.findOne({virusName: uuid}, function(err, result) {
        if (result) {
          return Viruses.update({virusName: uuid}, {$set: {range: data.range, duration: data.duration}}, function(err, result) {
            if (err) {
              return socket.emit('error', err);
            }
            socket.emit('virus-updated', result);
            console.log('virus updated');
          });
        }

        createVirus(uuid, data.range, data.duration, function(err, response) {
          if (err) {
            return socket.emit('error', err);
          }
          socket.emit('virus-updated', result);
          console.log('new virus');
        });
      });
    });

    socket.on('location-updated', function(data) {
      var uuid = connections[socket.id].uuid;
      var newLoc = {
        lastUpdated: Date.now(),
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy
      };
      Users.update({uuid: uuid}, {$set: {location: newLoc}}, function(err, result) {
        if (err) {
          return socket.emit('error', err);
        }
        socket.emit('location-set', result);
        transmitAndReceiveDiseases(uuid);
      });
    });
  });
}

function createUser(uuid, virusName, cb) {
  var newUser = {
    uuid: uuid,
    location: {},
    virusName: uuid,
    currentViruses: [{virusName: uuid, expiration: Infinity}]
  };
  Users.insert(newUser, function(err, result) {
    cb(err, result);
  });
}

function createVirus(virusName, range, duration, cb) {
  var newVirus = {
    virusName: virusName,
    range: range,
    duration: duration
  };
  Viruses.insert(newVirus, function(err, result) {
    cb(err, result);
  });
}

function transmitAndReceiveDiseases(uuid) {
  for (var i=0; i<connectionIds.length; i++) {
    var connectionId = connectionIds[i];
    var connection = connections[connectionId];
    var otherUuid = connection.uuid;
    if (otherUuid && otherUuid !== uuid) {
      swapDiseases(uuid, otherUuid);
    }
  }
}

function swapDiseases(uuid1, uuid2) {
  var user1Viruses = [];
  var user1VirusNames = [];
  var user2Viruses = [];
  var user2VirusNames = [];
  Users.findOne({uuid: uuid1}, function(err, user1) {
    user1.currentViruses.forEach(function(v) {
      if (v.expiration > Date.now()) {
        user1Viruses.push(v);
        user1VirusNames.push(v.virusName);
      }
    });
    Users.findOne({uuid: uuid2}, function(err, user2) {
      user2.currentViruses.forEach(function(v) {
        if (v.expiration > Date.now()) {
          user2Viruses.push(v);
          user2VirusNames.push(v.virusName);
        }
      });

      var distance = getDistance(user1.location, user2.location);
      if (distance >= 0) {
        Viruses.find({range: {$lt: distance}}, function(err, cursor) {
          cursor.toArray(function(err, virusList) {
            for (var i=0; i<virusList.length; i++) {
              var v = virusList[i];
              if (user1VirusNames.indexOf(v.virusName) >= 0 && user2VirusNames.indexOf(v.virusName) === -1) {
                user2Viruses.push({virusName: v.virusName, expiration: Date.now() + v.duration});
              } else if (user2VirusNames.indexOf(v.virusName) >= 0 && user1VirusNames.indexOf(v.virusName) === -1) {
                user1Viruses.push({virusName: v.virusName, expiration: Date.now() + v.duration});
              }
            }
            console.log('user 1 viruses: ');
            console.log(user1Viruses);
            console.log('user 2 viruses: ' );
            console.log(user2Viruses);

            Users.update({uuid: uuid1}, {$set: {currentViruses: user1Viruses}}, function(err, result) {});
            Users.update({uuid: uuid2}, {$set: {currentViruses: user2Viruses}}, function(err, result) {});
          });
        });
      }
    });
  });
}

function getDistance(location1, location2) {
  return 100;

  var lat1 = location1.latitude;
  var lon1 = location1.longitude;
  var lat2 = location2.latitude;
  var lon2 = location2.longitude;
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return -1;
  }
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  d *= 3280.4; // Distance in feet
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

module.exports = {
  attach: function(http, database) {
    io = sockio(http);
    db = database;
    Users = db.collection('users');
    Viruses = db.collection('viruses');
    setup();
  }
};
