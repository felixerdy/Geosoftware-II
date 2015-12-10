"use strict"
$(document).ready(function() {
  var url = window.location.href;
  var id = url.substring(url.lastIndexOf('#') + 1);

  $.get('http://localhost:8080/getPaperById', {'id' : id}, function(data, textStatus, jqXHR) {
    $('#papertitle').append(data.title);
    var d = new Date(data.publicaton_date);
    //let y = d.getFullYear();
    //let m = d.getMonth() + 1; // 0 - 11
    //let t = d.getDate();
    $('#paperdate').append(('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth()+1)).slice(-2) + '/' + d.getFullYear());
    $('#paperauthor').append(data.author);
    
    var iframeurl = data.htmlCode;
    iframeurl = iframeurl.split("/tex/");
    
    $('#paperframe').load(function() {

      //replace tags: 
      //current tag form "[...] :!:myData.tif [...]"
      var positions = []; //array for indices of the tags occurrence
      var includedData = []; //array for names of the includedData (e.g.: ::myData.tif)

      var regexp = /:!:([^\s]+)\s/g;	//regular expression for current tagForm 
      var tempHtml = $('#paperframe').contents().find('html').html();
      var tempHtml = $('#paperframe').contents().find('html').html();
      var counter = 0; 
      tempHtml = tempHtml.replace(regexp, function(match, p1){     
        counter++; 
        return "</p><div class='replaceable' style='height: 180px; width: 100px' id='"+ counter + p1 +"'></div><p class='ltx_p'>"; 
         
      });     	
	  
      $('.replaceable').each(function(index, element) {
        var elementID = element.getAttribute('id');
	    	
        if(/^.*\.[t|T][i|I][f|F]$/.test(elementID)){
          var map2 = L.map(elementID).setView([51.505, -0.09], 3);     
          var basemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
              maxZoom: 18,
              attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
              '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
              'Imagery © <a href="http://mapbox.com">Mapbox</a>',
              id: 'mapbox.streets'
              }).addTo(map2); 
			
     
        }		
        else if(/^.*\.[r|R][d|D][a|A][t|T][a|A]$/.test(fileExt)){
			
			
          alert("div found .rdata data"); 
			
			
        }	
        else if(/^.*\.[j|J][s|S][o|O][n|N]$/.test(fileExt)){
			
			
          alert("div found .json data"); 
			
			
        }			
      });
    
		
		
  

      //set content of iframe to new html 
      var iframe = document.getElementById('paperframe');
      var iframedoc = iframe.contentDocument || iframe.contentWindow.document;
      iframedoc.body.innerHTML = tempHtml; 
    });

    $('#paperframe')[0].src = iframeurl[1];

    }, 'json');
	
	
	
});
