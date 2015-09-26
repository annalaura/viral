/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        console.log('aaaa');
        this.bindEvents();
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        // document.addEventListener('deviceready', this.onDeviceReady, false);
        // app.receivedEvent('deviceready');
    },

    receivedEvent: function(id, data) {
        var parentElement = document.getElementById(id);

        if (id === 'location') {
            console.log(data.coords.latitude);
            console.log(data.coords.longitude);

            var locationFoundElement = parentElement.querySelector('.locationFound');
            var lat = parentElement.querySelector('.latitude');
            var long = parentElement.querySelector('.longitude');
            var initLat = parentElement.querySelector('.initiallatitude');
            var initLong = parentElement.querySelector('.initiallongitude');
            var dist = parentElement.querySelector('.distance');

            if (!app.initialized) {
                app.initialized = true;
                initLat.innerHTML = data.coords.latitude;
                initLong.innerHTML = data.coords.longitude;
            }

            locationFoundElement.setAttribute('style', 'display:block;color:black');
            lat.innerHTML = data.coords.latitude;
            long.innerHTML = data.coords.longitude;

            var iLat = initLat.innerHTML;
            var iLong = initLong.innerHTML;

            var kmDist = getDistanceFromLatLonInKm(data.coords.latitude,
                data.coords.longitude, iLat, iLong);
            // var latDiff = data.coords.latitude - iLat;
            // var longDiff = data.coords.longitude - iLong;
            // var latFeetDiff = latDiff * (10000/90) * 3280.4;
            // var longFeetDiff = longDiff * (10000/90) * 3280.4;
            var feetDist = 3280.4 * kmDist;
            dist.innerHTML = feetDist;
            // console.log(latFeetDiff);
            // console.log(longFeetDiff);

        } else if (id === 'error') {
            console.log(data.message);
            parentElement.innerHTML = data.message;
        }
    }
};

app.initialize();

// navigator.geolocation.getCurrentPosition(function(location) {
//     app.receivedEvent('location', location);
// }, function(err) {
//     app.receivedEvent('error', err);
// });
var geoLoc = navigator.geolocation;
setInterval(function() {
    geoLoc.getCurrentPosition(showLocation, errorHandler);
}, 1000);

function showLocation(location) {
    console.log('show location');
    app.receivedEvent('location', location);
}

function errorHandler(err) {
    app.receivedEvent('error', err);
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
