"use strict"
$(document).ready(function() {
  var url = window.location.href;
  var id = url.substring(url.lastIndexOf('#') + 1);

  $.get('http://localhost:8080/getPaperById', {'id' : id}, function(data, textStatus, jqXHR) {
    $('#papertitle').append(data.title);
    let d = new Date(data.publicaton_date);
    //let y = d.getFullYear();
    //let m = d.getMonth() + 1; // 0 - 11
    //let t = d.getDate();
    $('#paperdate').append(('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth()+1)).slice(-2) + '/' + d.getFullYear());
    $('#paperauthor').append(data.author);
  },
  'json');
});
