/* eslint-disable no-array-constructor */
import {approvedRequestNotification} from './Approve';
import {addApprovedPersontoACL} from '../access/Approve';
import {myfetchFunction} from '../utilities/CustomFetch';
import {revokingPersonAccessfromACL} from '../access/Revoke';
import {removeAccessNotification} from './Revoke';
import {pinFriendLocation} from '../map/pin/PinFriendLocation';

const QueryEngine = require('@comunica/query-sparql').QueryEngine;

/**
 * Fetches all the location request notifications in inbox.
 * @param {String} container Location data container path.
 */
export async function getRequestNotifications(container) {
  const rqstrWebidArray=new Array();
  const myEngineGetNots = new QueryEngine();
  const file=container.split('Data')[0]+'inbox.ttl';
  const bindingsStream = await myEngineGetNots.queryBindings(`
    SELECT ?o WHERE {
     ?s <http://tobeadded.com/LocationRequestedBy> ?o.
    }`, {
    sources: [`${file}`],
    fetch: myfetchFunction,
  });
  myEngineGetNots.invalidateHttpCache();
  const bindings = await bindingsStream.toArray();
  bindings.forEach((element)=>{
    if (document.getElementById(element.get('o').value)==null) {
      document.getElementById('approve_revoke').innerHTML+=
      `<br> <button type="button" id="${element.get('o').value}" 
      >Approve ${element.get('o').value}</button>`;
      rqstrWebidArray.push(element.get('o').value);
    }
    document.getElementById(element.get('o').value).
        addEventListener('click', async ()=>{
          await approvedRequestNotification(element.get('o').value, container);
          await addApprovedPersontoACL(element.get('o').value, container);
        });
  });
  const bindingsStream_ = await myEngineGetNots.queryBindings(`
    SELECT ?o WHERE {
     ?s <http://tobeadded.com/YouGrantedAccessTo> ?o.
    }`, {
    sources: [`${file}`],
    fetch: myfetchFunction,
  });
  myEngineGetNots.invalidateHttpCache();
  const bindings_ = await bindingsStream_.toArray();
  bindings_.forEach((element)=>{
    if (document.getElementById(`r_${element.get('o').value}`)==null) {
      document.getElementById('approve_revoke').innerHTML+=
      `<br> <button type="button" id="r_${element.get('o').value}"
       >Revoke ${element.get('o').value}</button>`;
      document.getElementById(`r_${element.get('o').value}`).
          addEventListener('click', async ()=>{
            await revokingPersonAccessfromACL(element.get('o').value,
                container);
            await removeAccessNotification(element.get('o').value, container);
          });
    }
  });
}

/**
 * Fetches the Granted Access to Location predicate from inbox.
 * @param {String} container Pod Location Data container path.
 * @return {String[]} String array of received webID and Data container path.
 */
export async function getAccessGrantedNotifications(container) {
  const myEngineGetURLs=new QueryEngine();
  const lctnContainer=new Array();
  const acptrWebid=new Array();
  const file=container.split('Data')[0]+'inbox.ttl';

  const bindingsStream = await myEngineGetURLs.queryBindings(`
    SELECT ?acptrWebid ?lctnContainer WHERE {
            ?acptrWebid  <http://tobeadded.com/GrantedAccessToLocation> ?lctnContainer.
    }`, {
    sources: [`${file}`],
    fetch: myfetchFunction,
  });
  myEngineGetURLs.invalidateHttpCache();
  const bindings = await bindingsStream.toArray();
  bindings.forEach((element1, element2)=>{
    acptrWebid.push(element1.get('acptrWebid').value),
    lctnContainer.push(element1.get('lctnContainer').value);
  });
  return {acptrWebid, lctnContainer};
}
/**
 * Refreshes every 5 seconds to fetch latest location.
 * @param {String} map Leaflet map object.
 * @param {String} container Location Data container path.
 */
export async function refreshNotifications(map, container) {
  window.setInterval(
      async () => {
        await getRequestNotifications(container);
        const {acptrWebid, lctnContainer}=
        await getAccessGrantedNotifications(container);
        await pinFriendLocation(map, acptrWebid, lctnContainer);
      }, 5000);
}
