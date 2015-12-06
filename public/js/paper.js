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
	    tempHtml = tempHtml.replace(regexp, "</p><div class='replaceable' id='$1'></div><p class='ltx_p'>"); 		

      //set content of iframe to new html 
      var iframe = document.getElementById('paperframe');
      var iframedoc = iframe.contentDocument || iframe.contentWindow.document;
      iframedoc.body.innerHTML = tempHtml; 
    });

    $('#paperframe')[0].src = iframeurl[1];

	}, 'json');
	
});
