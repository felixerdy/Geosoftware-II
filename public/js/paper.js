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
    $('#paperframe')[0].src = iframeurl[1];
    },
    'json');
	
	
  
	//replace tags: 
	
      //current tag form "[...] ::myData.tif [...]"
	  var positions = []; //array for indices of the tags occurrence
	  var includedData = []; //array for names of the includedData (e.g.: ::myData.tif)
      var re = /:{2}/g;	//regular expression for current tagForm 
      var tempHtml = $('#paperframe').contents().find('html').html();
		
	  function GetWordByPos(str, pos) {

        // Perform type conversions.
        str = String(str);
        pos = Number(pos) >>> 0;

        // Search for the word's beginning and end.
        var left = str.slice(0, pos + 1).search(/\S+$/),
        right = str.slice(pos).search(/\s/);

        // The last word in the string is a special case.
        if (right < 0) {
          return str.slice(left);
        }
	    // Accepts word separators: spaces, tabs, and newlines 
        // Return the word, using the located bounds to extract it from the string.
        return str.slice(left, right + pos);

	  };

	
	  while ((match = re.exec(tempHtml)) != null) {
	     positions.push(match.index+2);
	  }
	  for(var i = 0; i < positions.length; ++i){	
	    includedData.push(GetWordByPos(tempHtml, positions[i])); 	  
	  }	
	  
	  //replace includedData with div, id is set to the dataname (e.g.: myData.tif)
	  for (var i = 0; i<includedData.length; ++i){
		var regexp = new RegExp(includedData[i]);
		tempHtml = tempHtml.replace(regexp, "<div id =" + includedData[i].split(":")[2] + "></div>"); 		
      }	
	
	  //set content of iframe to new html 
	  var iframe = document.getElementById('paperframe');
      iframedoc = iframe.contentDocument || iframe.contentWindow.document;
	  iframedoc.body.innerHTML = tempHtml; 
	

    
	
	
});
