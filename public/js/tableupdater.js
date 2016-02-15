"use strict"


$(document).ready(function() {
  updateTable();
  // Initialize the plugin for the sorted table...
  $(function() {
    // call the tablesorter plugin and apply the uitheme widget
    $("table").tablesorter({
        // this will apply the bootstrap theme if "uitheme" widget is included
        // the widgetOptions.uitheme is no longer required to be set
        theme: "bootstrap",

        widthFixed: false,

        dateFormat : "yyyymmdd", // set the default date format

        headerTemplate: '{content} {icon}', // new in v2.7. Needed to add the bootstrap icon!

        // widget code contained in the jquery.tablesorter.widgets.js file
        // use the zebra stripe widget if you plan on hiding any rows (filter widget)
        widgets: ["uitheme", "filter", "zebra"],

        widgetOptions: {
          // using the default zebra striping class name, so it actually isn't included in the theme variable above
          // this is ONLY needed for bootstrap theming if you are using the filter widget, because rows are hidden
          zebra: ["even", "odd"],

          // reset filters button
          filter_reset: ".reset",

          // extra css class name (string or array) added to the filter element (input or select)
          filter_cssFilter: "form-control",

          // set the uitheme widget to use the bootstrap theme class names
          // this is no longer required, if theme is set
          // ,uitheme : "bootstrap"

        }
      })
      .tablesorterPager({

        // target the pager markup - see the HTML block below
        container: $(".ts-pager"),

        // target the pager page select dropdown - choose a page
        cssGoto: ".pagenum",

        // remove rows from the table to speed up the sort of large tables.
        // setting this to false, only hides the non-visible rows; needed if you plan to add/remove rows with the pager enabled.
        removeRows: false,

        // output string - default is '{page}/{totalPages}';
        // possible variables: {page}, {totalPages}, {filteredPages}, {startRow}, {endRow}, {filteredRows} and {totalRows}
        output: '{startRow} - {endRow} / {filteredRows} ({totalRows})'

      });

  });

  // Initialize the datepicker widget...
  $('.datepicker').datepicker({
    startView: 1,
    todayBtn: true,
    format: 'yyyy/mm/dd'
  });
});

/**
 *  @desc fills the main page table with papers
 *  @param content array of papers
 */
function fillTable(paperArray) {
  $('#paperTable tr').remove();
  for (var publication_index = 0; publication_index < paperArray.length; publication_index++) {
    var d = new Date(paperArray[publication_index].publicaton_date);


	//only show already processed papers
    if(paperArray[publication_index].processing_state == 1) {

		$('#paperTable').prepend('<tr>' +
		  '<td>' + paperArray[publication_index].author + '</td>' +
		  '<td><a href="paperpage.html#' + paperArray[publication_index]._id + '">'  + paperArray[publication_index].title + '</a></td>' +
		  '<td>' + ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth()+1)).slice(-2) + '/' + d.getFullYear() + '</td>' +
		  '<td>' + paperArray[publication_index].search_terms + '</td>' +
		  '</tr>');
	}
  }
  $("#paperTable").trigger("update");
}

/**
 * @desc get papers from server and start fillingTable with recieved content
 * @param user to show published papers of user, leave empty to show all papers
 */
function updateTable(user) {
  $('#username-above-table-container').remove(); // remove caption above table
  if(user) {
    // polyfill from http://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
    if (typeof location.origin === 'undefined') location.origin = location.protocol + '//' + location.host;
    $.ajax({
      url: location.origin + '/getPapersByGoogleID?id=' + user.googleID,
      type: 'GET',
      dataType: 'JSON',
      timeout: 10000,
      success: function(content, textStatus) {
        if(content.length == 0) { //user has no uploaded papers
          toastr.info('Click the "Publish"-Button to upload your first paper!');
        } else {
          // add caption above table
          $('<div class="container" id="username-above-table-container" style="width: 70%; max width: 70%;">' +
            '<div style="text-align:center">' +
              '<h3>Papers of ' + user.name + '</h3>' +
              '<button type="button" class="btn btn-info" onclick="updateTable()">back to all papers</button>' +
            '</div>' +
          '<br>' +
          '</div>').insertAfter('#desc-container');
          fillTable(content);
        }
      },
      error: function(xhr, textStatus, errorThrown) {
        console.log("unable to get database content (" + errorThrown + ")");
      }
    });

  } else { // there is no given user, show all papers
    if (typeof location.origin === 'undefined') location.origin = location.protocol + '//' + location.host;
    $.ajax({
      url: location.origin + '/getPapers',
      type: 'GET',
      dataType: 'JSON',
      timeout: 10000,
      success: function(content, textStatus) {
        fillTable(content);
      },
      error: function(xhr, textStatus, errorThrown) {
        console.log("unable to get database content (" + errorThrown + ")");
      }
    })
  }
}

/**
 * @desc get logged in user and start updating table
 *
 */
function appendUsersPublications() {
  $.ajax({
    url: location.origin + '/getLoggedInUser',
    type: 'GET',
    success: function(content, textStatus) {
      if (content) {
        updateTable(content);
      }
    }
  });
}
