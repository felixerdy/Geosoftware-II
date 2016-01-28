"use strict"

// publishers googleID of the displayed paper
var paperPublisher = 0;

// loads the HTML file into the iframe
$(document).ready(function() {
  var id = window.location.hash.substring(1);

  // polyfill from http://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
  if (typeof location.origin === 'undefined') location.origin = location.protocol + '//' + location.host;

  $.get(location.origin + '/getPaperById?id=' + id, function(data, textStatus, jqXHR) {
    $('#papertitle').append(data.title);
    var d = new Date(data.publicaton_date);
    $('#paperdate').append(('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear());
    $('#paperauthor').append(data.author);

    var iframeurl = data.htmlCode;
    iframeurl = iframeurl.split("/tex/");

    $('#paperframe')[0].src = id + "/tex/" + iframeurl[1];

    // sets publishers googleID of the displayed paper in paperPublisher
    paperPublisher = data.publisher;
  }, 'json');

  $.get(location.origin + '/getLoggedInUser', function(data, textStatus, jqXHR) {
    if (data.googleID == paperPublisher) {
      // user is the publisher, allow to delete paper
      $('#papereditbutton').removeClass('hidden');
    } else {
      // user is not the publisher
      $('#papereditbutton').addClass('hidden');
      $('#papereditbutton').prop('title', 'You are not authorized to delete this paper');
    }
  });
});

function deletePaper() {
  var id = window.location.hash.substring(1);

  $.get(location.origin + '/deletePaper?id=' + id, function(data, textStatus, jqXHR) {
    window.location = "index.html";
  });


}
