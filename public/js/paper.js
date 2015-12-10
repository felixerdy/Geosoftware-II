"use strict"
$(document).ready(function() {
  var url = window.location.href;
  var id = url.substring(url.lastIndexOf('#') + 1);

    // polyfill from http://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
  if (typeof location.origin === 'undefined') location.origin = location.protocol + '//' + location.host;
  
  $.get(location.origin + '/getPaperById', {'id' : id}, function(data, textStatus, jqXHR) {
    $('#papertitle').append(data.title);
    var d = new Date(data.publicaton_date);
    $('#paperdate').append(('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear());
    $('#paperauthor').append(data.author);

    var iframeurl = data.htmlCode;
    iframeurl = iframeurl.split("/tex/");

    $('#paperframe')[0].src = iframeurl[1];

  }, 'json');
});

