import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
} from '@inrupt/solid-client-authn-browser';
import {toHide, stepstoExecute} from '../UI/Frontend';
import {giveAccessoftheContainertoOwner} from '../setup/data/OwnerAccess';
import {settingContainer} from '../setup/data/Container';
import {createInbox} from '../setup/inbox/Container';
import { createShacl } from '../setup/shacl/Create';
//  Legacy RML implementation
// import { createRmlRules } from "../setup/rml/project";

const QueryEngine = require('@comunica/query-sparql').QueryEngine;
/**
 * Login wrapper function
 * @param {String} Issuer OIDC Issuer.
 */
export async function Login(Issuer) {
  if (Issuer) {
    if (!getDefaultSession().info.isLoggedIn) {
      await login({
        oidcIssuer: Issuer,
        redirectUrl: window.location.href,
        clientName: 'LocationHistory',
      });
    }
  } else {
    console.error(` 'solid:oidcIssuer' is not found in the provided WebID 
    kindly check and try again. \n "<webID> <solid:oidcISsuer> <podurl>." 
    is the standard expected triple`);
  }
}
/**
 * Handles Incoming Redirect Wrapper and performs initial setup.
 * @param {String} map Leaflet map to add the location in UI.
 * @param {String} marker Leaflet marker to add the location in UI.
 */
export async function handleRedirectAfterLogin(map, marker) {
  await handleIncomingRedirect();
  if (getDefaultSession().info.isLoggedIn) {
    await toHide();
    document.getElementById('output').textContent='Session logged in!';
    const [container, podUrl] = settingContainer();
    await createInbox(container, podUrl);
    await giveAccessoftheContainertoOwner(container);
    await createShacl(container);
    //  await createRmlRules(container); //  Legacy RML implementation
    await stepstoExecute(map, marker, container);
  }
}

/**
 * Get OIDC Issuer from WebID.
 * @param {String} webid WebID to fetch data from.
 * @return {String} OIDC Issuer value .
 */
export async function getIssuerFromWebID(webid) {
  const myEngineGetIssuer = new QueryEngine();
  const bindingsStream = await myEngineGetIssuer.queryBindings(`
    SELECT ?o WHERE {
     ?s <http://www.w3.org/ns/solid/terms#oidcIssuer> ?o.
    }`, {
    sources: [`${webid}`],
  });
  const bindings = await bindingsStream.toArray();
  return (bindings[0].get('o').value);
}
