/**
 * Sends inbox notifications to friend.
 * @param {Strinf} fileFrnd Friend's inbox file path.
 */
export async function sendNotifications(fileFrnd) {
  // Storing all participant pod urls in my solid comunity pod.
  const query= `INSERT DATA {<> <http://tobeadded.com/LocationRequestedBy> <${window.sessionStorage.getItem('webID_later')}>.}`;
  // Send a PATCH request the pod url to inbox.ttl
  const response = await fetch(fileFrnd, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/sparql-update'},
    body: query,
  });
  if (300<response.status&&response.status<600) {
    console.log(` Error code is ${response.status} 
    Your friend may not have used our app yet!`);
  }
}
