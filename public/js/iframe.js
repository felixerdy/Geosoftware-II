"use strict"

var maps = [];
var plots = [];
var thisPaper = undefined;

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
    map.fitBounds(imageBounds);
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
        if (!$.isEmptyObject(layer.feature.properties)) // no popup available when there are no properties
          layer.bindPopup(temp);
        markers.addLayer(layer);
      }
    });

    //geojson.addTo(map);
    map.addLayer(markers, {
      chunkedLoading: true
    });
    map.fitBounds(geojson.getBounds());
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

    thisPaper = paper;

    $('.replaceable').each(function(index, element) {

      var elementID = element.getAttribute('id');
      var dataID = element.getAttribute('dataid');

      if (/^.*\.[t|T][i|I][f|F]$/.test(dataID)) {

        maps.push({
          'map': L.map(elementID).setView([51.505, -0.09], 3),
          'data': dataID
        });
        createBaseLayer(maps[(maps.length - 1)].map);
        createTiffLayer(maps[(maps.length - 1)].map, dataID, paper);
        //addDropdownToMap(maps[(maps.length - 1)].map);



      } else if (/^.*\.[r|R][d|D][a|A][t|T][a|A]$/.test(dataID)) {
        var regEx = new RegExp('.[r|R][d|D][a|A][t|T][a|A]');
        $.ajax({
          url: "../rdata/" + dataID.replace(regEx, '.csv'),
          type: 'GET',
          success: function(data) {
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
                  flotGraph.push([moment(value[headers[0]].replace(/['"]+/g, ''), moment.ISO_8601).toDate(), parseFloat(value[headers[i]])]);
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
                  }
                }
              });
            }

          },
          statusCode: {
            404: function() {
              console.log(dataID.replace(regEx, '.csv') + ' was not found. Looking for ' + dataID.replace(regEx, '.json'))
              jsonToMap("../rdata/" + dataID.replace(regEx, '.json'));
            }
          }
        });

      } else if (/^.*\.[j|J][s|S][o|O][n|N]$/.test(dataID)) {
        jsonToMap("../geojson/" + dataID);
      }

      function jsonToMap(jsonPath) {
        maps.push({
          'map': L.map(elementID).setView([51.505, -0.09], 3),
          'data': jsonPath
        });
        createBaseLayer(maps[(maps.length - 1)].map);
        createGJSONLayer(maps[maps.length - 1].map, jsonPath);
        addDropdownToMap(maps[(maps.length - 1)].map);
      }
    });

  }, 'json');

});

/**
adds the Bootstrap dropdown menu under each geoJson map
there is also a modal added
*/
function addDropdownToMap(displayedMap) {
  $('<br><div class="dropdown">' +
    '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu_' + displayedMap._leaflet_id + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
    'Change Projection' +
    '<span class="caret"></span>' +
    '</button>' +
    '<ul class="dropdown-menu" aria-labelledby="dropdownMenu">' +
    '<li><a style="cursor: pointer" onclick=changeProjection("DEFAULT",' + displayedMap._leaflet_id + ')>Default Leaflet</a></li>' +
    '<li><a style="cursor: pointer" onclick=changeProjection("NORTH",' + displayedMap._leaflet_id + ')>North pole</a></li>' +
    '<li><a style="cursor: pointer" onclick=changeProjection("SOUTH",' + displayedMap._leaflet_id + ')>South pole</a></li>' +
    '<li role="separator" class="divider"></li>' +
    '<li><a style="cursor: pointer" data-toggle="modal" data-target="#myModal_' + displayedMap._leaflet_id + '">Define with Proj4 code</a></li>' +
    '</ul>' +
    '</div><br>' +
    '<div class="modal fade" id="myModal_' + displayedMap._leaflet_id + '" tabindex="-1" role="dialog">' +
    '<div class="modal-dialog">' +
    '<div class="modal-content">' +
    '<div class="modal-header">' +
    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
    '<h4 class="modal-title">Custom CRS ' + displayedMap._leaflet_id + '</h4>' +
    '</div>' +
    '<div class="modal-body">' +
    '<div class="row"><div class="col-md-2"><p>EPSG: </p></div><div class="col-md-10"><input class="form-control" id="epsgInput_' + displayedMap._leaflet_id + '" placeholder="e.g. 4326"></div></div>' +
    '<div class="row"><div class="col-md-2"><p>Proj4: </p></div><div class="col-md-10"><input class="form-control" id="proj4Input_' + displayedMap._leaflet_id + '" placeholder="e.g. +proj=longlat +datum=WGS84 +no_defs"></div></div>' +
    '<div class="row"><div class="col-md-2"><p>TileLayer: </p></div><div class="col-md-10"><input class="form-control" id="tileLayerInput_' + displayedMap._leaflet_id + '" placeholder="e.g. http://{s}.tile.osm.org/{z}/{x}/{y}.png"></div></div>' +
    '<div class="checkbox">' +
    '<label>' +
    '<input type="checkbox" id="tmsCheck_' + displayedMap._leaflet_id + '"> TileLayer is tms' +
    '</label>' +
    '</div>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
    '<button type="button" class="btn btn-primary" data-dismiss="modal" onclick=changeProjection("CUSTOM",' + displayedMap._leaflet_id + ',$("#epsgInput_' + displayedMap._leaflet_id + '").val(),$("#proj4Input_' + displayedMap._leaflet_id + '").val(),$("#tileLayerInput_' + displayedMap._leaflet_id + '").val(),$("#tmsCheck_' + displayedMap._leaflet_id + '").is(":checked"))>Go</button>' +
    '</div>' +
    '</div><!-- /.modal-content -->' +
    '</div><!-- /.modal-dialog -->' +
    '</div><!-- /.modal -->').insertAfter(displayedMap.getContainer());
}

/**
 * changes projection of the map identified by its leafletID
 * @param {string} targetProjection - the target Projection (DEFAULT: default leaflet, NORTH: north pole, SOUTH: south pole, CUSTOM: custom by user)
 * @param {number} leafletID - leaflet id of map
 * @param {number} epsg - epsg code of custom projection               (only necesarry when targetProjection = CUSTOM)
 * @param {string} proj4 - proj4 code of custom projection             (only necesarry when targetProjection = CUSTOM)
 * @param {string} tileLayer - link of desired tileLayer to use in map (only necesarry when targetProjection = CUSTOM)
 */
function changeProjection(targetProjection, leafletID, epsg, proj4, tileLayer, isTMS) {
  var myMap = undefined;
  var myData = undefined;
  var index = 0;
  $.grep(maps, function(e, i) {
    if (e.map._leaflet_id === leafletID) {
      myMap = e.map;
      myData = e.data;
      index = i;
    }
  });

  if (targetProjection == 'DEFAULT') {
    myMap.remove();
    myMap = new L.map(myMap._container.id).setView([51.505, -0.09], 3);
    createBaseLayer(myMap);

  } else if (targetProjection == 'NORTH') {
    myMap.remove();

    // creating instance of polarMap
    myMap = polarMap(myMap._container.id, {
      baseLayer: L.PolarMap.tileLayer("http://{s}.tiles.arcticconnect.org/osm_3571/{z}/{x}/{y}.png"),
      permalink: false
    });
    myMap = myMap.map; //(?) myMap is a polarMap object, myMap.map is a leaflet object

  } else if (targetProjection == 'SOUTH') {
    myMap.remove();
    myMap = L.map(myMap._container.id, {
      crs: new L.Proj.CRS(
        "EPSG:3031",
        "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 " +
        "+ellps=WGS84 +datum=WGS84 +units=m +no_defs", {
          origin: [-4194304, 4194304],
          resolutions: [
            8192.0,
            4096.0,
            2048.0,
            1024.0,
            512.0,
            256.0
          ]
        }
      )
    }).setView([-90, 0], 0);

    myMap.addLayer(L.tileLayer("http://map1.vis.earthdata.nasa.gov/wmts-antarctic/{layer}/default/{tileMatrixSet}/{z}/{y}/{x}.png", {
      layer: "SCAR_Land_Water_Map",
      tileMatrixSet: "EPSG3031_250m",
      format: "image/png",
      tileSize: 512,
      noWrap: true,
      continuousWorld: true,
      attribution: "<a href='https://earthdata.nasa.gov/gibs'>" +
        "NASA EOSDIS GIBS</a>&nbsp;&nbsp;&nbsp;" +
        "<a href='https://github.com/nasa-gibs/web-examples/blob/release/leaflet/js/antarctic-epsg3031.js'>" +
        "View Source" +
        "</a>"
    }));

  } else if (targetProjection == 'CUSTOM') {
    console.log()
    myMap.remove();
    myMap = L.map(myMap._container.id, {
      crs: new L.Proj.CRS(
        "EPSG:" + epsg,
        proj4, {
          resolutions: [
            8192.0,
            4096.0,
            2048.0,
            1024.0,
            512.0,
            256.0,
            128
          ]
        }
      )
    }).setView([0, 0], 0);

    myMap.addLayer(L.tileLayer(tileLayer, {
      noWrap: true,
      continuousWorld: true,
      tms: isTMS
    }));
  }
  createGJSONLayer(myMap, myData);

  myMap._leaflet_id = leafletID;
  maps[index] = {
    'map': myMap,
    'data': myData
  };
}
