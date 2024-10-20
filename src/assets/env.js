(function (window) {
  window["env"] = window["env"] || {};

  window["env"]["chatServiceHost"] = 'http://localhost:8080';
  window["env"]["googleAuthUri"] = 'https://accounts.google.com/o/oauth2/v2/auth?scope=profile%20email&access_type=offline&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=http%3A//localhost%3A4200/auth/google&client_id=546043495082-gqlcrbtfcrcfcmk5c5tag33r3gmtd9e3.apps.googleusercontent.com';
  window["env"]["facebookAuthUri"] = 'https://www.facebook.com/v20.0/dialog/oauth?client_id=441766668623384&redirect_uri=http%3A//localhost%3A4200/auth/facebook&state={}';
  window["env"]["microsoftAuthUri"] = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id=6e5ee64a-b7da-42ca-ad8b-ffceac8fe699&response_type=code&redirect_uri=http%3A//localhost%3A4200/auth/microsoft&response_mode=query&scope=https%3A%2F%2Fgraph.microsoft.com%2FUser.Read';
})(this);
