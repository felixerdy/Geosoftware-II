$(document).ready(function() {
  /**
   *   @desc checks whether there is a logged in user and modifies UI on main page
   */
  $.ajax({
    url: location.origin + '/getLoggedInUser',
    type: 'GET',
    success: function(content, textStatus) {
      if (content) {
        console.log(content);
        $('#mainPageUploadButton').removeClass('disabled');
        /**
        $('#loginButton').text('Logout');
        $('#loginButton').prop('title', 'Logout');
        */
        $('#loginLogoutDiv').append('<p class="navbar-btn">' +
          '<div class="dropdown">' +
  '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
    content.name +
    '<span class="caret"></span>' +
  '</button>' +
  '<ul class="dropdown-menu" aria-labelledby="dropdownMenu1">' +
    '<li><a href="#">Show own publications</a></li>' +
    '<li role="separator" class="divider"></li>' +
    '<li><a href="#" onclick="loginOrLogout()">Logout</a></li>' +
  '</ul>' +
'</div>' +
'</p>');

      } else {

        $('#mainPageUploadButton').addClass('disabled');
        $('#mainPageUploadButton').prop('title', 'Login to upload a paper');

        $('#loginLogoutDiv').append('<p class="navbar-btn">' +
          '<a class="btn btn-default" id="loginButton" onclick="loginOrLogout()" title="Login with Google">Login</a>' +
        '</p>');
      }
    }
  });
});

/**
 *   @desc checks whether there is a logged in user and starts log-out or logg-in procedure
 */
function loginOrLogout() {
  $.ajax({
    url: location.origin + '/isLoggedIn',
    type: 'GET',
    success: function(content, textStatus) {
      if (content) { // there is a logged in user
        console.log("logging out...");
        $('#mainPageUploadButton').addClass('disabled');
        //$('#loginButton').text('Login');
        //$('#loginButton').prop('title', 'Login with Google');
        window.location.replace(location.origin + '/logout');
      } else {
        console.log("logging in...");
        window.location.replace(location.origin + '/auth/google'); // redirecting to log in
        $('#mainPageUploadButton').removeClass('disabled');
      }
    }
  });
}
