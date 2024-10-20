(function (window) {
  window["env"] = window["env"] || {};

  window["env"]["chatServiceHost"] = "${CHAT_SERVICE_HOST}";
  window["env"]["googleAuthUri"] = "${GOOGLE_AUTH_URI}";
  window["env"]["facebookAuthUri"] = "${FACEBOOK_AUTH_URI}";
  window["env"]["microsoftAuthUri"] = "${MICROSOFT_AUTH_URI}";
})(this);
