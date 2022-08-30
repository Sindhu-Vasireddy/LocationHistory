import {fetch as solidfetch} from '@inrupt/solid-client-authn-browser';
let container;


export async function giveAccessoftheContainertoOwner(container) {
  const response = await solidfetch(container+'.acl', {
    method: 'GET',
    headers: {'Content-Type': 'text/turtle'},
  });
  if (response.status>300) {
    console.log('public/YourLocationHistory/Data/ container didn\'t exist but will now be created with owner access');

    const query = `@prefix : <#>.
      @prefix acl: <http://www.w3.org/ns/auth/acl#>.
      @prefix foaf: <http://xmlns.com/foaf/0.1/>.
      @prefix D: <./>.
      

      :ReadControlWrite
      a acl:Authorization;
      acl:accessTo D:;
      acl:agent <${window.sessionStorage.getItem('webID_later')}>;
      acl:default D:;
      acl:mode acl:Control, acl:Read, acl:Write.`;
    // Send a PUT request to post to the source
    const response = await solidfetch(container+'.acl', {
      method: 'PUT',
      headers: {'Content-Type': 'text/turtle'},
      body: query,
      credentials: 'include',
    });
  }
}
