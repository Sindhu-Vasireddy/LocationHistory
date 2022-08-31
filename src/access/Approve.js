import {fetch as solidfetch} from '@inrupt/solid-client-authn-browser';
import {sendRequestAcceptedNotification} from '../notifications/Approve';
/**
 * Adds the approved person to ACL.
 * @param {String} webidRqstr WebID of the requester.
 * @param {String} container Path to data container for the requester.
 */
export async function addApprovedPersontoACL(webidRqstr, container) {
  let responseData;
  const element = document.getElementById(webidRqstr);
  element.parentNode.removeChild(element);
  const queryExtra=`:Read
    a acl:Authorization;
    acl:accessTo D:;
    acl:agent <${webidRqstr}>;
    acl:default D:;
    acl:mode acl:Read.`;
    // Send a GET and PUT request to update the source
  await solidfetch(container+'.acl', {
    method: 'GET',
    headers: {'Content-Type': 'text/turtle'},
  }).then((response_)=>response_.text()).then(async (data)=>{
    responseData=data; if (!responseData.includes(queryExtra)) {
      const query = responseData+'\n'+queryExtra;
      await solidfetch(container+'.acl', {
        method: 'PUT',
        headers: {'Content-Type': 'text/turtle'},
        body: query,
      });
    }
  });
  await sendRequestAcceptedNotification(webidRqstr, container);
}
