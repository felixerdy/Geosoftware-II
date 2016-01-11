"use strict"

var maps = [];
var plots = [];

/**
 * @returns the layer object, optional
 */
function createBaseLayer(map) {

  var osmLayer = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var osmLayer2 = new L.tileLayer('http://a.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  });

  var MapQuestOpen_Aerial = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
    type: 'sat',
    ext: 'jpg',
    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency',
    subdomains: '1234'
  });

  var Stamen_Watercolor = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 1,
    maxZoom: 16,
    ext: 'png'
  });

  var Esri_WorldTopoMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
  });

  var baseMaps = {
    "OpenStreetMap": osmLayer,
    "Grey": osmLayer2,
    "Aerial": MapQuestOpen_Aerial,
    "Watercolor": Stamen_Watercolor,
    "Esri WorldTopo": Esri_WorldTopoMap
  };
  L.control.layers(baseMaps).addTo(map);

}

function createTiffLayer(map, dataID, paper) {
  // get the related ID to the filename
  var id = "";
  for (var dID = 0; dID < paper.geoTiff_names.length; dID++) {
    if (paper.geoTiff_names[dID] === dataID) {
      id = paper.geoTiff_ids[dID];
    }
  }

  if (id === "") {
    alert("Error: Geotiff data not found: " + dataID);
    return;
  }

  $.get(location.origin + '/getTiffById?id=' + id, function(tiffdbe, textStatus, jqXHR) {
    //TODO: More than one layer...
    var imageUrl = "../geotiff/" + tiffdbe.pngpaths[0];
    var imageBounds = [
      [tiffdbe.coordinates[0], tiffdbe.coordinates[1]],
      [tiffdbe.coordinates[2], tiffdbe.coordinates[3]]
    ];
    var overlay = L.imageOverlay(imageUrl, imageBounds).addTo(map);
  }).error(function() {
    console.log("Tiff entry not found!")
  });

}

function createGJSONLayer(map, url) {
  var markers = new L.MarkerClusterGroup();

  $.getJSON(url, function(data) {
    var geojson = L.geoJson(data, {
      onEachFeature: function(feature, layer) {
        var temp = '';
        var propertiesJSON = feature.properties;
        $.each(propertiesJSON, function(k, v) {
          temp += k + ': ' + v;
        });
        layer.bindPopup(temp);
        markers.addLayer(layer);
      }
    });

    //geojson.addTo(map);
    map.addLayer(markers);
    map.fitBounds(geojson.getBounds());
  }).error(function() {
    console.log("JSON file not found, maybe rdata was load with unsupported object type")
  });


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
                if (moment(value[headers[0]].replace(/['"]+/g, ''), moment.ISO_8601).isValid()) {
                  flotGraph.push([Date.parse(value[headers[0]].replace(/['"]+/g, '')), parseFloat(value[headers[i]])]);
                } else {
                  flotGraph.push([parseFloat(value[headers[0]].replace(/['"]+/g, '')), parseFloat(value[headers[i]])]);
                }
              });
              var isDate = flotGraph[0][0] instanceof Date;
              var tempFlotSchema = {
                'label': headers[i].replace(/['"]+/g, ''),
                'data': flotGraph
              };
              flotData.push(tempFlotSchema);
            }

            if (isDate) { //set x-axis to time format
              $.plot('#' + elementID, flotData, {
                zoom: {
                  interactive: true
                },
                pan: {
                  interactive: true
                },
                xaxis: {
                  mode: "time"
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
            } else { //working with indices or other formats -> x-axis is not a time format
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

          }
        });

        // if csv not found, json is only left supported format. error handling in createGJSONLayer $getJSON
        if (csvFound == false) {
          jsonToMap("../rdata/" + dataID.replace(regEx, '.json'));
        }


      } else if (/^.*\.[j|J][s|S][o|O][n|N]$/.test(dataID)) {


        jsonToMap("../geojson/" + dataID);

      }

      function jsonToMap(jsonPath) {
        maps.push(L.map(elementID).setView([51.505, -0.09], 3));
        createBaseLayer(maps[maps.length - 1]);
        createGJSONLayer(maps[maps.length - 1], jsonPath);
      }
    });

  }, 'json');

});
