var map = L.map('map').setView([51.505, -0.09], 3);


var basemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  id: 'mapbox.streets'
}).addTo(map);


var WMSOverlay = L.tileLayer.wms("http://localhost:9000/geoserver/cite/wms", {
  layers: 'cite:sampleUSA',
  format: 'image/png',
  transparent: true,
  attribution: "usa map",
  zIndex: 1.0
}).addTo(map);

var WMSOverlay2 = L.tileLayer.wms("http://localhost:9000/geoserver/nurc/wms", {
  layers: 'nurc:Img_Sample',
  format: 'image/png',
  transparent: true,
  attribution: "sattelite usa map",
  zIndex: 0.0
}).addTo(map);

var baseMaps = {
    "Grayscale": basemap
};

var overlayMaps = {
    "WMSOverlay": WMSOverlay,
    "WMSOverlay2": WMSOverlay2
};

L.control.layers(baseMaps, overlayMaps, {autoZIndex: false}).addTo(map);
