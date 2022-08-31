/* eslint-disable new-cap */ // For inrupt login vs app login.
let locator;

import {getIssuerFromWebID, Login} from '../login/LoginUsingWebID';
import {refreshNotifications} from '../notifications/Check';
import {getCoordinates} from '../capture/Coordinates';
import {sendNotifications} from '../notifications/Request';

/**
 * Main Login entry function.
 */
export async function toLogin() {
  document.getElementById('message').textContent='Log in using your webid!';
  document.getElementById('message_eg').textContent='e.g.https://data.knows.idlab.ugent.be/person/SindhuVasireddy/#me';
  document.getElementById('webid_Login').addEventListener('click', async () => {
    const webID = document.getElementById('webid').value;
    try {
      const oidcIssuer=await getIssuerFromWebID(webID);
      window.sessionStorage.setItem('webID_later', webID);
      window.sessionStorage.setItem('oidcIssuer_later', oidcIssuer);
      await Login(oidcIssuer);
    } catch (error) {
      document.getElementById('output').classList.remove('hidden');
      document.getElementById('output').textContent=
      'OIDC Issuer not found in webid or invalid webID.';
    }
  } );
}
/**
 * Hides the Login page UI elements after login.
 */
export async function toHide() {
  document.getElementById('message').classList.add('hidden');
  document.getElementById('message_eg').classList.add('hidden');
  document.getElementById('webid').classList.add('hidden');
  document.getElementById('App_name').classList.add('hidden');
  document.getElementById('webid_Login').classList.add('hidden');
}
/**
 * Main App execution post login.
 * @param {String} map Leaflet map object.
 * @param {String} marker Leaflet marker object.
 * @param {String} container Path to Location data container.
 */
export async function stepstoExecute(map, marker, container) {
  await getCoordinates(map, marker, container).then((l)=>{
    locator=l;
  });
  await refreshNotifications(map, container);
  document.getElementById('appname_login').classList.remove('hidden');
  document.getElementById('map').classList.remove('hidden');
  document.getElementById('stop').classList.remove('hidden');
  document.getElementById('req_frnd').classList.remove('hidden');

  document.getElementById('req_frnd').addEventListener('click', ()=>{
    document.getElementById('friend_webid').classList.remove('hidden');
    document.getElementById('friend_webid_div').classList.remove('hidden');
    document.getElementById('request').classList.remove('hidden');
    document.getElementById('request_div').classList.remove('hidden');
    document.getElementById('req_frnd').classList.add('hidden');
  });
  document.getElementById('request').addEventListener('click', async ()=>{
    const webidFrnd=document.getElementById('friend_webid').value;
    document.getElementById('friend_webid').classList.add('hidden');
    document.getElementById('friend_webid_div').classList.add('hidden');
    document.getElementById('request').classList.add('hidden');
    document.getElementById('request_div').classList.add('hidden');
    document.getElementById('req_frnd').classList.remove('hidden');
    const podUrlFrnd=await getIssuerFromWebID(webidFrnd);
    const file=`${podUrlFrnd}public/YourLocationHistory/inbox.ttl`;
    await sendNotifications(file);
  });

  document.querySelector('#stop').addEventListener('click', () => {
    navigator.geolocation.clearWatch(locator);
    /* console.log(locator);console.log("stop button was pressed.");*/
    document.getElementById('start').classList.remove('hidden');
    document.getElementById('stop').classList.add('hidden');
  });
  document.querySelector('#start').addEventListener('click', () => {
    getCoordinates(map, marker, container);
    document.getElementById('stop').classList.remove('hidden');
    document.getElementById('start').classList.add('hidden');
  });
}


