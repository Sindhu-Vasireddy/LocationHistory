import {fetch as solidfetch} from '@inrupt/solid-client-authn-browser';
import {deleteRequestAcceptedNotification} from '../notifications/Delete';
/**
 * Revoke location data share access.
 * @param {String} rvkAprvdWebid WebID to revoke access.
 * @param {String} container Data Container location to revoke access for.
 */
export async function revokingPersonAccessfromACL(rvkAprvdWebid, container) {
  let responseData;
  const element = document.getElementById(`r_${rvkAprvdWebid}`);
  element.parentNode.removeChild(element);
  const queryExtra=`:Read
    a acl:Authorization;
    acl:accessTo D:;
    acl:agent <${rvkAprvdWebid}>;
    acl:default D:;
    acl:mode acl:Read.`;
    // Send a GET and PUT request to update the source
  await solidfetch(container+'.acl', {
    method: 'GET',
    headers: {'Content-Type': 'text/turtle'},
  }).then((response_)=>response_.text()).then(async (data)=>{
    responseData=data;
    if (responseData.includes(queryExtra)) {
      const query = responseData.split(queryExtra).join('\n');
      await solidfetch(container+'.acl', {
        method: 'PUT',
        headers: {'Content-Type': 'text/turtle'},
        body: query});
    }
  });
  await deleteRequestAcceptedNotification(rvkAprvdWebid, container);
}
