import {getPodUrl} from '../setup/data/Container';
/**
 * Sends Accepted Request Notifications to friend's inbox.
 * @param {String} rqstrWebid WebID of the requester.
 * @param {String} container Location data container path.
 */
export async function sendRequestAcceptedNotification(rqstrWebid, container) {
  const rqstrIssuer=await getPodUrl(rqstrWebid);
  const query= `INSERT DATA {<${window.sessionStorage.getItem('webID_later')}> <http://tobeadded.com/GrantedAccessToLocation> <${container}>.}`;
  // Send a PATCH request the pod url to inbox.ttl
  const response = await fetch(rqstrIssuer+
    'public/YourLocationHistory/inbox.ttl', {
    method: 'PATCH',
    headers: {'Content-Type': 'application/sparql-update'},
    body: query,
  });
  if (300<response.status&&response.status<600) {
    console.log(` HTTP fetch Error code is 
    ${response.status} Your friend may not have used our app yet!`);
  }
}
/**
 * Adds the approved requests to user inbox.
 * @param {String} apprvdRqstrWebid WebId of the approved requester.
 * @param {String} container Location data container path.
 */
export async function approvedRequestNotification(apprvdRqstrWebid, container) {
  const query= `DELETE DATA {<> <http://tobeadded.com/LocationRequestedBy> <${apprvdRqstrWebid}>.}`;
  // Send a PATCH request the pod url to names.ttl
  const response = await fetch(container.split('/Data/')[0]+'/inbox.ttl', {
    method: 'PATCH',
    headers: {'Content-Type': 'application/sparql-update'},
    body: query,
  });
  if (300<response.status&&response.status<600) {
    console.log(`Your friend has not used our app yet
     or the entry could not be deleted!`);
  } else {
    const query= `INSERT DATA {<> <http://tobeadded.com/YouGrantedAccessTo> <${apprvdRqstrWebid}>.}`;
    // Send a PATCH request the pod url to names.ttl
    const response = await fetch(container.split('/Data/')[0]+'/inbox.ttl', {
      method: 'PATCH',
      headers: {'Content-Type': 'application/sparql-update'},
      body: query,
    });
    if (300<response.status&&response.status<600) {
      console.log(`Your friend has not used our app yet 
      or the entry could not be deleted!`);
    }
  }
}
