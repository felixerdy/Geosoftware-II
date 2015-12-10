"use strict"


 $(document).ready(function() {
//function loadPaper() {

  //replace tags:
  //current tag form "[...] :!:myData.tif [...]"

  var regexp = /:!:([^\s]+)\s/g; //regular expression for current tagForm
  var counter = 0;

  document.body.innerHTML = document.body.innerHTML.replace(regexp, function(match, p1) {
    counter++;

    return "</p><div class='replaceable' style='height: 250px ; width: 60% ' id='" + counter + p1 + "'></div><p class='ltx_p'>";
  });

  $('.replaceable').each(function(index, element) {
    var elementID = element.getAttribute('id');
    if (/^.*\.[t|T][i|I][f|F]$/.test(elementID)) {
      var map2 = L.map(elementID).setView([51.505, -0.09], 3);
      var basemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
          '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(map2);


    } else if (/^.*\.[r|R][d|D][a|A][t|T][a|A]$/.test(elementID)) {


      alert("div found .rdata data");


    } else if (/^.*\.[j|J][s|S][o|O][n|N]$/.test(elementID)) {


      alert("div found .json data");


    }
  });
});
