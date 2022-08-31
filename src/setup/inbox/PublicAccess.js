import {fetch as solidfetch} from '@inrupt/solid-client-authn-browser';
/**
 * Adds Public access to app inbox.
 * @param {String} container Location data container path.
 * @param {*} podUrl URL of the solid pod (OIDC Issuer).
 */
export async function givePublicAccesstotheInbox(container, podUrl) {
  const file=container.split('Data')[0]+'inbox.ttl';
  const query = `<${podUrl}.acl#owner> a <http://www.w3.org/ns/auth/acl#Authorization>;
    <http://www.w3.org/ns/auth/acl#mode> <http://www.w3.org/ns/auth/acl#Read>,<http://www.w3.org/ns/auth/acl#Write>, <http://www.w3.org/ns/auth/acl#Control>;
    <http://www.w3.org/ns/auth/acl#accessTo> <${file}>;
    <http://www.w3.org/ns/auth/acl#default> <${file}>;
    <http://www.w3.org/ns/auth/acl#agentClass> <http://xmlns.com/foaf/0.1/Agent>.`;
  // Send a PUT request to inbox.ttl.acl
  await solidfetch(file+'.acl', {
    method: 'PUT',
    headers: {'Content-Type': 'text/turtle'},
    body: query,
    credentials: 'include',
  });
}
