// This file includes the logic behind uploading papers and related data.

"use strict"
var myInterval = undefined;

/**
*@desc check conversion status every 2 seconds and redirect to main page if conversion is finished
*@param paperID of paper which conversion status will be checked
*/
function checkConversionStatus(paperID){
  console.log('cCS: ' + paperID);
  $.ajax({
    url: location.origin + '/getPaperById?id=' + paperID,
    type: 'GET',
    dataType: 'JSON',
    timeout: 10000,
    success: function(content, textStatus) {
      if(content.processing_state == 1){
        $('#paperUploadModal').modal('hide');
        $('#uploadButton').removeClass("disabled");
        $('#uploadText').addClass("hide");
        $('#uploadButton').html("Upload");
        $('#loadingWheel').addClass("hide");
        updateTable();
        clearInterval(myInterval);
        toastr.success('upload finished');
      }

      console.log(content.processing_state);
      // close modal if latexml can't convert input
      if(content.processing_state < 0){
        var errorMessage = "unknown";
        if(content.processing_state == -1)
          errorMessage = "latexml conversion to xml failed";
        if(content.processing_state == -2)
          errorMessage = "latexml conversion to html failed";

        alert("Upload failed! Reason: " + errorMessage);
        $('#paperUploadModal').modal('hide');
        $('#uploadButton').removeClass("disabled");
        $('#uploadText').addClass("hide");
        $('#uploadButton').html("Upload");
        $('#loadingWheel').addClass("hide");
		deletePaperById(paperID);
        clearInterval(myInterval);
      }
    },
    error: function(xhr, textStatus, errorThrown) {

    }
  });
}
function deletePaperById(paperID){
	$.get(location.origin + '/deletePaper?id=' + paperID, function(data, textStatus, jqXHR) {
	   console.log("delete corrupted paper: " + textStatus); 
	});
}
$("#uploadButton").click(function() {

  // Prevent multiple form submissions.
  if(! $("#uploadButton").hasClass("disabled")) {

    // Check if form data is complete.
    if ( $('#title').val() == ""
      || $('#author').val() == ""
      || $('#publication_date').val() == ""
      || $('#search_terms').val() == ""
      || $('#texfile').val() == "" ) {
      alert("Data incomplete! Title, author, date, at least one search term and a *.tex file are required.");
      return;
    }

    // Change button and text... They get changed back in error() and success().
    $('#uploadButton').addClass("disabled");
    $('#uploadButton').html("Uploading...");
    $('#uploadText').removeClass("hide");

	var target = $('#loadingWheel');
    target.removeClass('hide');




    // Send data...
    var formData = new FormData($("#paperform")[0]);

    // polyfill from http://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
    if (typeof location.origin === 'undefined') location.origin = location.protocol + '//' + location.host;

    $.ajax({
      url: location.origin + '/addPaper',
      type: 'POST',
      data: formData,
      success: function(data) {
        console.log(data.paperID);
        myInterval = window.setInterval(function() {
          checkConversionStatus(data.paperID);
        }, 5000);

      },
      error: function(jqxhr, textstatus, error) {
        alert("Upload failed! Reason: " + error);
        $('#paperUploadModal').modal('hide');
        $('#uploadButton').removeClass("disabled");
        $('#uploadButton').html("Upload");
	    	$('#uploadText').removeClass("disabled");
      },
      timeout: 15000,
      cache: false,
      contentType: false,
      processData: false
    });
  }
});
