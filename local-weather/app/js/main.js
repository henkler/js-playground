/*global $ google:true*/
'use strict';

var apiKey = "MjgzNjgyMDdiOGYwOWQzYTdkZDQ4NDI1OGU0ZjZlNWU=";
var units = "imperial";

function updateWeather() {
  geolocate(function(latitude, longitude) {
    var apiURL = "http://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&units=" + units + "&appid=" + atob(apiKey);

    $.getJSON(apiURL, function(json) {
      var weather = json.weather[0];
      var temperature = Math.round(json.main.temp);
      var iconImageURL = "http://openweathermap.org/img/w/" + weather.icon + ".png";

      $("#weatherIcon").attr("src", iconImageURL);

      $("#weather_conditions").text(weather.description);

      if (units == "imperial") {
        $("#temperature").html(temperature + "&deg F");
      }
      else {
        $("#temperature").html(temperature + "&deg C");
      }
    });
  });
}

function geolocate(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var latitude = position.coords.latitude;
      var longitude = position.coords.longitude;

      // use the Google Maps API to return the location name
      var geocoder = new google.maps.Geocoder();
      var latlng = new google.maps.LatLng(latitude, longitude);

      geocoder.geocode({
        'latLng': latlng
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          $("#location").text("Current conditions in " + results[1].formatted_address);
        }
      });
      callback(latitude, longitude);
    });
  }
}

function toggleUnits() {
  if (units == "imperial") {
    units = "metric";
  }
  else {
    units = "imperial";
  }

  updateWeather();
}

$(document).ready(function() {
  $("#changeUnits").on("click", function() { toggleUnits();});

  updateWeather();
});