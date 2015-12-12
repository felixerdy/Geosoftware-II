"use strict"

var maps = [];

/**
 * @returns the layer object, optional
 */
function createBaseLayer(map) {
  return L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(map);
}

function createGJSONLayer(map, url) {

  $.getJSON(url, function(data) {
    var geojson = L.geoJson(data, {
      onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.name);
      }
    });

    geojson.addTo(map);
    map.fitBounds(geojson.getBounds());
  });

}

$(document).ready(function() {

  var paperid = window.location.pathname;
  paperid = paperid.replace(/^\/([0-9a-z]+)\/.*$/, "$1");

  //replace tags:
  //current tag form "[...] :!:myData.tif [...]"

  var regexp = /:!:([^\s]+)\s/g; //regular expression for current tagForm
  var counter = 0;

  document.body.innerHTML = document.body.innerHTML.replace(regexp, function(match, p1) {
    counter++;

    return "</p><div class='replaceable' style='height: 250px ; width: 60% ' id='replaced" + counter + "' dataid='" + p1 + "'></div><p class='ltx_p'>";
  });

  $('.replaceable').each(function(index, element) {
    var elementID = element.getAttribute('id');
    var dataID = element.getAttribute('dataid');
    if (/^.*\.[t|T][i|I][f|F]$/.test(dataID)) {
      maps.push( L.map(elementID).setView([51.505, -0.09], 3) );
      createBaseLayer( maps[maps.length - 1] );

    } else if (/^.*\.[r|R][d|D][a|A][t|T][a|A]$/.test(dataID)) {


      alert("div found .rdata data");


    } else if (/^.*\.[j|J][s|S][o|O][n|N]$/.test(dataID)) {


      maps.push( L.map(elementID).setView([51.505, -0.09], 3) );
      createBaseLayer( maps[maps.length - 1] );
      createGJSONLayer( maps[maps.length - 1], "../geojson/" +  dataID);

    }
  });
});
