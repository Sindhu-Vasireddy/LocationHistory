import {fetch as solidfetch} from '@inrupt/solid-client-authn-browser';
import {givePublicAccesstotheInbox} from './PublicAccess';
/**
 * Creates an App inbox.
 * @param {String} container Location data container.
 * @param {String} podUrl URL of the solid pod (OIDC Issuer).
 */
export async function createInbox(container, podUrl) {
  const file=container.split('Data')[0]+'inbox.ttl';
  // Send a GET request to check if inbox exists
  const response_ = await solidfetch(file, {
    method: 'GET',
    headers: {'Content-Type': 'text/turtle'},
    credentials: 'include',
  });

  if (300<response_.status&&response_.status<500) {
    console.log('Inbox.ttl didn\'t exist but will now be created');
    const query = ``;
    // Send a PUT request to add inbox
    await solidfetch(file, {
      method: 'PUT',
      headers: {'Content-Type': 'text/turtle'},
      body: query,
      credentials: 'include',
    });
    await givePublicAccesstotheInbox(container, podUrl);
  }
}
