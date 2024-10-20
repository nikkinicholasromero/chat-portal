export const environment = {
  production: false,
  // @ts-ignore
  chatServiceHost: window["env"]["chatServiceHost"],
  // @ts-ignore
  googleAuthUri: window["env"]["googleAuthUri"],
  // @ts-ignore
  facebookAuthUri: window["env"]["facebookAuthUri"],
  // @ts-ignore
  microsoftAuthUri: window["env"]["microsoftAuthUri"],
};
