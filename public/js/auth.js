$(document).ready(function() {
  /**
   *   @desc checks whether there is a logged in user and modifies UI on main page
   */
  $.ajax({
    url: location.origin + '/isLoggedIn',
    type: 'GET',
    success: function(content, textStatus) {
      if (content) {
        $('#mainPageUploadButton').removeClass('disabled');
        $('#loginButton').text('Logout');
        $('#loginButton').prop('title', 'Logout');
      } else {
        $('#mainPageUploadButton').addClass('disabled');
        $('#mainPageUploadButton').prop('title', 'Login to upload a paper');
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
        $('#loginButton').text('Login');
        $('#loginButton').prop('title', 'Login with Google');
        window.location.replace(location.origin + '/logout');
      } else {
        console.log("logging in...");
        window.location.replace(location.origin + '/auth/google'); // redirecting to log in
        $('#mainPageUploadButton').removeClass('disabled');
      }
    }
  });
}
