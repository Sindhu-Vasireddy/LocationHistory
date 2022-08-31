const QueryEngine = require('@comunica/query-sparql').QueryEngine;
import {getIssuerFromWebID} from '../../login/LoginUsingWebID';
/**
 * Sets the container and podURL variables for the app.
 * @return {String[]} Container and Pod URL for the app.
 */
export async function settingContainer() {
  const podUrl= await getPodUrl(window.sessionStorage.getItem('webID_later'));
  const container=podUrl+'public/YourLocationHistory/Data/';
  return [container, podUrl];
}

/**
 * Fetches the pod url from webid.
 * @param {String} webid WebID of the user.
 * @return {String} Location of user pod.
 */
export async function getPodUrl(webid) {
  const myEngineGetIssuer = new QueryEngine();
  const bindingsStream = await myEngineGetIssuer.queryBindings(`
    SELECT ?o WHERE {
     ?s <http://www.w3.org/ns/pim/space#storage> ?o.
    }`, {
    sources: [`${webid}`],
  });
  const bindings = await bindingsStream.toArray();
  // console.log(bindings);
  if (bindings.length==0) {
    // When webID doesn't have pim:storage use webID later
    console.log(`Since <http://www.w3.org/ns/pim/space#storage> is not available
    \n <http://www.w3.org/ns/solid/terms#oidcIssuer> is used for Pod url`);
    const podUrl=await getIssuerFromWebID(webid);
    if (podUrl.endsWith('/')) {
      return podUrl;
    } else {
      return (podUrl+'/');
    }
  } else {
    const podUrl =bindings[0].get('o').value;
    if (podUrl.endsWith('/')) {
      return podUrl;
    } else {
      return (podUrl+'/');
    }
  }
}
