"use strict"

$("#uploadButton").click(function() {

  var myvalue = {
    title: $("#title").val(),
    author: $("#author").val()
  };

  $.ajax({
    type: 'POST',
    data: myvalue,
    url: 'http://localhost:8080/addPaper',
    datatype: 'json',
    success: function() {
      alert("success");
    }
  })
  
});
