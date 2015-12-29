"use strict"

var maps = [];
var plots = [];

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

function createTiffLayer(map, dataID, paper) {
  // get the related ID to the filename
  var id = "";
  for(var dID = 0; dID < paper.geoTiff_names.length; dID++) {
    if(paper.geoTiff_names[dID] === dataID) {
      id = paper.geoTiff_ids[dID];
    }
  }
  
  if(id === "") {
    alert("Error: Geotiff data not found: " + dataID);
    return;
  }
  
   $.get(location.origin + '/getTiffById?id=' + id, function(tiffdbe, textStatus, jqXHR) {
     //TODO: More than one layer...
     var imageUrl = "../geotiff/" + tiffdbe.pngpaths[0];
     var imageBounds = [
                         [ tiffdbe.coordinates[0], tiffdbe.coordinates[1] ],
                         [ tiffdbe.coordinates[2], tiffdbe.coordinates[3] ]
                       ];
     var overlay = L.imageOverlay(imageUrl, imageBounds).addTo(map);
   }).error(function() {console.log("Tiff entry not found!") });
  
}

function createGJSONLayer(map, url) {

  $.getJSON(url, function(data) {
    var geojson = L.geoJson(data, {
      onEachFeature: function(feature, layer) {
        var temp = '';
        var propertiesJSON = feature.properties;
        $.each(propertiesJSON, function(k, v) {
          temp += k + ': ' + v;
        });
        layer.bindPopup(temp);
      }
    });

    geojson.addTo(map);
    map.fitBounds(geojson.getBounds());
  }).error(function() {console.log("JSON file not found, maybe rdata was load with unsupported object type") });
 

}

$(document).ready(function() {

  var paperid = window.location.pathname;
  paperid = paperid.replace(/^\/([0-9a-z]+)\/.*$/, "$1");

  // get further paper informations

  //replace tags:
  //current tag form "[...] :!:myData.tif [...]"

  var regexp = /:!:([^\s]+)\s/g; //regular expression for current tagForm
  var counter = 0;

  document.body.innerHTML = document.body.innerHTML.replace(regexp, function(match, p1) {
    counter++;

    return "</p><div class='replaceable' style='height: 250px ; width: 60% ' id='replaced" + counter + "' dataid='" + p1 + "'></div><p class='ltx_p'>";
  });

    
  $.get(location.origin + '/getPaperById?id=' + paperid, function(paper, textStatus, jqXHR) {


    $('.replaceable').each(function(index, element) {  
      
      var elementID = element.getAttribute('id');
      var dataID = element.getAttribute('dataid');

      if (/^.*\.[t|T][i|I][f|F]$/.test(dataID)) {
        maps.push(L.map(elementID).setView([51.505, -0.09], 3));
        createBaseLayer(maps[maps.length - 1]);
        createTiffLayer(maps[maps.length - 1], dataID, paper);

      } else if (/^.*\.[r|R][d|D][a|A][t|T][a|A]$/.test(dataID)) {
        var regEx = new RegExp('.[r|R][d|D][a|A][t|T][a|A]');
        var csvFound = false; 
        $.ajax({
          url: "../rdata/" + dataID.replace(regEx, '.csv'), 
          type: 'GET',
          success: function(data) {
          csvFound = true; 
          var csv = data;
          var lines = csv.split("\n");
          var result = [];
          var headers = lines[0].split(",");
          for (var i = 1; i < lines.length; i++) {
            var obj = {};
            var currentline = lines[i].split(",");
            for (var j = 0; j < headers.length; j++) {
              obj[headers[j]] = currentline[j];
            }
            result.push(obj);
          }
          var flotData = [];

          for (var i = 1; i < headers.length; i++) {

            var flotGraph = [];
            $.each(result, function(index, value) {
              flotGraph.push([parseFloat(value[headers[0]].replace(/['"]+/g, '')), parseFloat(value[headers[i]])]);
            });
            var tempFlotSchema = {
              'label': headers[i].replace(/['"]+/g, ''),
              'data': flotGraph
            };
            flotData.push(tempFlotSchema);
          }

          $.plot('#' + elementID, flotData, {
            zoom: {
              interactive: true
            },
            pan: {
              interactive: true
            },
            series: {
              lines: {
                show: true
              },
              points: {
                show: true
              }
            }
          });
          
        }
      });
      
        // if csv not found, json is only left supported format. error handling in createGJSONLayer $getJSON
        if(csvFound == false){
          jsonToMap("../rdata/" + dataID.replace(regEx, '.json'));
        } 
          
    
      } else if (/^.*\.[j|J][s|S][o|O][n|N]$/.test(dataID)) {


        jsonToMap("../geojson/" + dataID); 

      }
      
      function jsonToMap(jsonPath){
        maps.push(L.map(elementID).setView([51.505, -0.09], 3));
        createBaseLayer(maps[maps.length - 1]);
        createGJSONLayer(maps[maps.length - 1], jsonPath);    
      }
    });

  }, 'json');  

});
