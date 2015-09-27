var socket = io();

socket.emit('set-uuid', Date.now());

socket.on('user-set', function(data) {
  console.log('got user');
  console.log(data);
  console.log(JSON.stringify(data));
});

socket.on('location-set', function(data) {
  console.log('location set');
  console.log(data);
  console.log(JSON.stringify(data));
});

socket.on('virus-updated', function(data) {
  console.log('virus updated');
  console.log(data);
  console.log(JSON.stringify(data));
});

socket.on('error', function(err) {
  console.log('error');
  console.log(err);
});

socket.emit('location-updated', {latitude: 4, longitude: 2, accuracy: 0});
socket.emit('new-virus', {range: 2, duration: 7});
