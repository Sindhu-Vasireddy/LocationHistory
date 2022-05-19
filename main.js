import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
} from "@inrupt/solid-client-authn-browser";
import {fetch as solidfetch} from "@inrupt/solid-client-authn-browser";

const QueryEngine = require('@comunica/query-sparql').QueryEngine;

import "leaflet";

async function Login(Issuer) {
    if (Issuer) {
       if (!getDefaultSession().info.isLoggedIn) {
  	    	await login({
  	        oidcIssuer:Issuer,
  	        redirectUrl: window.location.href,
            clientName:"LocationHistory"
  	      });
	     }

    }
    //OIDC error message 
    else {
    document.getElementById('output').textContent="OIDC Issuer not found in webid or invalid webID. Try logging in with either solidcommunity username or directly with CSS oidc Issuer";
    document.getElementById('Issuer_SC').classList.add('hidden');
    document.getElementById('Issuer_CSS').classList.add('hidden');
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function toHide(){
            document.getElementById('message').classList.add('hidden');
            document.getElementById('Issuer_SC').classList.add('hidden');
            document.getElementById('Issuer_CSS').classList.add('hidden');
            document.getElementById('webid').classList.add('hidden');
            document.getElementById('webid_Login').classList.add('hidden');

}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function stepstoExecute(){

            document.getElementById('start_posting').classList.remove('hidden');
            document.getElementById('start_posting').addEventListener('click', async () => { GetCoordinates();
            document.getElementById('map').classList.remove('hidden');document.getElementById('start_posting').classList.add('hidden'); 
            document.getElementById('stop').classList.remove('hidden');await getParticipants();fetchLocations();
            });
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function handleRedirectAfterLogin() {
       await handleIncomingRedirect();
              
       if(getDefaultSession().info.isLoggedIn){
          toHide();
          document.getElementById('output').textContent="Session logged in!";
          settingContainer();
          storeParticipants();
          GivePublicAccesstotheContainer();
          stepstoExecute();
        }
}

handleRedirectAfterLogin();
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
var locator;
let container;
let pod_url;

const map= L.map('map');
const marker=L.marker([0,0]);
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function myfetchFunction(url){
  return await fetch(url, {
       method: 'GET',
       headers: { 'Content-Type': 'application/sparql-update','Cache-Control': 'no-cache' },
        });
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function getIssuerFromWebID(webid){
  var myEngine_getIssuer = new QueryEngine();
  const bindingsStream = await myEngine_getIssuer.queryBindings(`
  SELECT ?o WHERE {
   ?s <http://www.w3.org/ns/solid/terms#oidcIssuer> ?o.
  }`, {
    sources: [`${webid}`],
  });
    const bindings = await bindingsStream.toArray();
        // console.log(`${bindings[0].get('o').value}`);
      return(bindings[0].get('o').value); 
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function getDataFromWebID(webid){
  var myEngine_getData = new QueryEngine();
  const bindingsStream = await myEngine_getData.queryBindings(`
  SELECT ?img ?familyName ?givenName WHERE {
   ?s <http://xmlns.com/foaf/0.1/img> ?img;
  <http://xmlns.com/foaf/0.1/familyName> ?familyName;
  <http://xmlns.com/foaf/0.1/givenName> ?givenName.
  }`, {
    sources: [`${webid}`],
  });
  console.log(webid);
    const bindings = await bindingsStream.toArray();
    console.log(bindings);
    console.log("--------------------");
        console.log(`${[bindings[0].get('givenName').value,bindings[0].get('familyName').value,bindings[0].get('img').value]}`);
      return([bindings[0].get('givenName').value,bindings[0].get('familyName').value,bindings[0].get('img').value]); 
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

document.getElementById('Issuer_SC').addEventListener('click', () => { document.getElementById('Issuer_SC_username').classList.remove('hidden');document.getElementById('ok_IssuerSC').classList.remove('hidden');toHide();});
document.getElementById('ok_IssuerSC').addEventListener('click', () => { let Username_SolidCommunity = document.getElementById('Issuer_SC_username').value; window.sessionStorage.setItem('Username_SolidCommunity_Later',Username_SolidCommunity);
document.getElementById('ok_IssuerSC').classList.add('hidden');document.getElementById('Issuer_SC_username').classList.add('hidden');Login('https://solidcommunity.net/');});

document.getElementById('Issuer_CSS').addEventListener('click', () => { document.getElementById('issuer').classList.remove('hidden'); document.getElementById('Issuer_SC').classList.add('hidden'); document.getElementById('Issuer_CSS').classList.add('hidden');document.getElementById('CSS_Login').classList.remove('hidden');});
document.getElementById('CSS_Login').addEventListener('click', () => { let Issuer = document.getElementById('issuer').value; window.sessionStorage.setItem('Issuer_later',Issuer);console.log(Issuer); Login(Issuer)});

document.getElementById('webid_Login').addEventListener('click', async () => { let webID = document.getElementById('webid').value; console.log(webID);let oidcIssuer=await getIssuerFromWebID(webID);window.sessionStorage.setItem('webID_later',webID);window.sessionStorage.setItem('oidcIssuer_later',oidcIssuer);console.log(`This is the oidcIssuer:${oidcIssuer}`); Login(oidcIssuer)});

document.getElementById('message').textContent="Log in using your webid! (The App expects the WebID to have the following predicates solid:oidcIssuer, foaf:givenName, foaf:familyName, and foaf:img in the triples.) e.g.https://data.knows.idlab.ugent.be/person/SindhuVasireddy/#me";
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function settingContainer(){
// console.log(window.sessionStorage);
switch(Object.keys(window.sessionStorage)[0]){

    case "webID_later":
    pod_url=window.sessionStorage.getItem('oidcIssuer_later');
    container=pod_url+'public/YourLocationHistory/';  
    break;

  case "oidcIssuer_later":
    pod_url=window.sessionStorage.getItem('oidcIssuer_later');
    container=pod_url+'public/YourLocationHistory/';  
    break;

  case "Username_SolidCommunity_Later":
    pod_url=`https://${window.sessionStorage.getItem('Username_SolidCommunity_Later')}.solidcommunity.net/`;
    container=pod_url+'public/YourLocationHistory/';  
    break;

  case "Issuer_later":
    pod_url=window.sessionStorage.getItem('Issuer_later');
    if (pod_url.endsWith('/')){
          container=pod_url+'public/YourLocationHistory/';
    }
    else {
          pod_url=pod_url+'/'; container=pod_url+'public/YourLocationHistory/';
    }
}  
}
// const folder=`https://svasired.pod.knows.idlab.ugent.be/public/participants/names.ttl`;
const folder=`https://sindhuvasireddy.solidcommunity.net/public/participants/names.ttl`;
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function storeParticipants(){
  //Storing all participant pod urls in my solid comunity pod.
  const query= `INSERT DATA {<> <http://xmlns.com/foaf/0.1/openid> <${window.sessionStorage.getItem('webID_later')}>}`;

  // Send a PATCH request the pod url to names.ttl 
  const response = await solidfetch(folder, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/sparql-update' },
  body: query,
  credentials: 'include'
  });
}

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
var myEngine_getURLs = new QueryEngine();
let l_o_p=new Array();
async function getParticipants(){     
  const bindingsStream = await myEngine_getURLs.queryBindings(`
  SELECT ?o WHERE {
   ?s ?p ?o.
  }`, {
    sources: [`${folder}`],
  });
  // Consume results as an array (easier)
  const bindings = await bindingsStream.toArray();

  bindings.forEach(element=>l_o_p.push(element.get('o').value));  

}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function fetchLocations(){
  Object.values(l_o_p).forEach( element=> {
    window.setInterval(
      () => {
        console.log('*****************************************************');
        getLatLongofFriend(element);
      }, 5000);
  });  
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function GetCoordinates(){
  var optn={
    enableHighAccuracy: true,
    timeout: Infinity,
    maximumAge: 0
  };
  if (navigator.geolocation) {
      locator=navigator.geolocation.watchPosition(async function(position){
        // console.log(position);
        var a = document.createElement('a');
        a.href="https://www.openstreetmap.org/#map=18/"+ position.coords.latitude + "/" + position.coords.longitude;
        a.textContent=" Latitude:"+ position.coords.latitude+"°, Longitude:"+ position.coords.longitude+"°,Timestamp:"+position.timestamp ;
        document.getElementById('map-link').appendChild(a);
        document.getElementById('map-link').appendChild(document.createElement("br"));


        map.setView([position.coords.latitude,position.coords.longitude], 13);
        const attribution= '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
        const tileURL='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        const tiles=L.tileLayer(tileURL,{attribution});
        tiles.addTo(map);

        marker.setLatLng([position.coords.latitude,position.coords.longitude]);


        const query = `<> <https://schema.org/latitude> "${position.coords.latitude}";<https://schema.org/longitude> "${position.coords.longitude}";<http://purl.org/dc/terms/created> "${position.timestamp}".`

        // Send a PUT request to post to the source
        const response = await solidfetch(container+`${position.timestamp}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/turtle' },
        body: query,
        credentials: 'include'
        });

        },  function error() {
        document.querySelector('#status').textContent = 'Unable to retrieve your location';
      },optn);
  }
};
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
document.querySelector('#stop').addEventListener('click', () => {navigator.geolocation.clearWatch(locator);console.log(locator);console.log("stop button was pressed.");
document.getElementById('start').classList.remove('hidden');document.getElementById('stop').classList.add('hidden');});

document.querySelector('#start').addEventListener('click', () => {GetCoordinates();document.getElementById('stop').classList.remove('hidden');document.getElementById('start').classList.add('hidden');});
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function test(friend_container){
      console.log(friend_container);
      var myEngine = new QueryEngine();
      // Fetch the latest timestamp  
      const bindingsStream = await myEngine.queryBindings(`
      SELECT (STRAFTER(?fileName, "/YourLocationHistory/") AS ?tmstmp) 
      WHERE {
        ?s <http://www.w3.org/ns/ldp#contains> ?name .
        BIND (STR(?name) AS ?fileName)
      }
      ORDER BY DESC(?tmstmp)`, {
        sources: [`${friend_container}`],
        fetch: myfetchFunction
      });
      myEngine.invalidateHttpCache();

      // Consume results as an array (easier)
      const bindings = await bindingsStream.toArray();
      // console.log(bindings[0]);
      const tmstmp=bindings[0].get('tmstmp').value;
//---------------------------------------------------------------------------------------
      //Fetch the lat-long from the file corresponding to the latest timestamp
      const bindingsStream_1 = await myEngine.queryBindings(`
      SELECT ?lat ?long WHERE {
      ?s <https://schema.org/latitude> ?lat ;
         <https://schema.org/longitude> ?long
      }`, {
        sources: [`${friend_container}${bindings[0].get('tmstmp').value}`],
      });


      const bindings_1 = await bindingsStream_1.toArray();

      
      //Return the latest Latitude and Longitude:
      const lat_long_list=[bindings_1[0].get('lat').value,bindings_1[0].get('long').value];
      let loc_array=[lat_long_list,tmstmp]
      // console.log(loc_array);
      return(loc_array);

}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const attribution= '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileURL='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const tiles=L.tileLayer(tileURL,{attribution});
tiles.addTo(map);

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function getLatLongofFriend(friend_webid){
  let friendContainer=await getIssuerFromWebID(friend_webid) + 'public/YourLocationHistory/';
  let data_array=await getDataFromWebID(friend_webid);
  console.log(data_array);
  const loc_array = await test(friendContainer);
  const lat_long_list = loc_array[0];
  const tmstmp_ =loc_array[1];
  console.log(tmstmp_);
  // var tmstmp_1=new Date(tmstmp_);
  // console.log(tmstmp_1);
    if (lat_long_list) {
      // console.log(`This is the Lat-Long inside if condition:${lat_long_list}`)
    //not sure we need to center here -- need to center acording to all friend makers
    // map.setView(lat_long_list, 15);
    map.eachLayer(function (layer) { 
      // console.log(layer);
      if(layer._content){
         if(layer._content.split('\r\n')[0]==data_array[0]+` ${data_array[1]}`){
        // console.log(`removing _tooltip: ${layer}`);
        map.removeLayer(layer);
              }  
      }

      if(layer._tooltipHandlersAdded){
        // console.log(layer._tooltip._content);
        if(layer._tooltip._content.split('\r\n')[0]==data_array[0]+` ${data_array[1]}`){
          // console.log(`removing marker: ${layer}`);
          map.removeLayer(layer);
        }
              }
      }
      );
    var friend_image = L.icon({
    iconUrl: data_array[2],
    iconSize:     [30, 30], // size of the icon
    iconAnchor:   [15, 15] // point of the icon which will correspond to marker's location
});
    let friendMarker = L.marker(lat_long_list,{icon: friend_image});
    // friendMarker.addTo(map);
    friendMarker.addTo(map);
    friendMarker._icon.classList.add("huechange");
    friendMarker.bindTooltip(data_array[0]+` ${data_array[1]}`+`\r\n Last seen at ${new Date(Number(tmstmp_)).toLocaleString()}`).openTooltip();
    // console.log(friendMarker.getTooltip()._content);
  }
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function GivePublicAccesstotheContainer(){

    const query = `<${pod_url}.acl#owner> a <http://www.w3.org/ns/auth/acl#Authorization>;
    <http://www.w3.org/ns/auth/acl#agent> <https://data.knows.idlab.ugent.be/person/SindhuVasireddy/#me>, <mailto:sindhu.vasireddy@ugent.be>;
    <http://www.w3.org/ns/auth/acl#mode> <http://www.w3.org/ns/auth/acl#Read>,<http://www.w3.org/ns/auth/acl#Write>, <http://www.w3.org/ns/auth/acl#Control>;
    <http://www.w3.org/ns/auth/acl#accessTo> <${container}>;
    <http://www.w3.org/ns/auth/acl#default> <${container}>;
    <http://www.w3.org/ns/auth/acl#agentClass> <http://xmlns.com/foaf/0.1/Agent>.`
    // console.log(container);
    console.log(query);
        // Send a PUT request to post to the source
        const response = await solidfetch(container+'.acl', {
        method: 'PUT',
        headers: { 'Content-Type': 'text/turtle' },
        body: query,
        credentials: 'include'
        });
        

}

