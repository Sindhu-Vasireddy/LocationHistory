/**
 * Remove Access Granted notification.
 * @param {String} rmRqstrWebid Requester WebID.
 * @param {*} container Location data container path.
 */
export async function removeAccessNotification(rmRqstrWebid, container) {
  const query= `DELETE DATA {<> <http://tobeadded.com/YouGrantedAccessTo> <${rmRqstrWebid}>.}`;
  // Send a PATCH request the pod url to names.ttl
  const response = await fetch(container.split('/Data/')[0]+'/inbox.ttl', {
    method: 'PATCH',
    headers: {'Content-Type': 'application/sparql-update'},
    body: query,
  });
  if (300<response.status&&response.status<600) {
    console.log(`Your friend has not used our app yet or
     the entry could not be deleted!`);
  }
}
