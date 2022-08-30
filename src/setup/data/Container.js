/**
 * Sets the container and podURL variables for the app.
 * @return {String[]} Container and Pod URL for the app.
 */
export function settingContainer() {
  const podUrl=window.sessionStorage.getItem('oidcIssuer_later');
  const container=podUrl+'public/YourLocationHistory/Data/';
  return [container, podUrl];
}
