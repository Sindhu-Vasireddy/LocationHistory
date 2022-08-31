import {getPodUrl} from '../setup/data/Container';
/**
 * Deletes the GrantedAccess predicate from inbox.
 * @param {String} rqstrWebid WebID of the requester.
 * @param {String} container Data container path.
 */
export async function deleteRequestAcceptedNotification(rqstrWebid, container) {
  const rqstrIssuer=await getPodUrl(rqstrWebid);
  const query= `DELETE DATA {<${window.sessionStorage.getItem('webID_later')}> <http://tobeadded.com/GrantedAccessToLocation> <${container}>.}`;
  // Send a PATCH request the pod url to inbox.ttl
  const response = await fetch(rqstrIssuer+
    'public/YourLocationHistory/inbox.ttl', {
    method: 'PATCH',
    headers: {'Content-Type': 'application/sparql-update'},
    body: query,
  });
  if (300<response.status&&response.status<600) {
    console.log(` HTTP fetch Error code is ${response.status}`);
  }
}
