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
    document.getElementById('output').textContent="OIDC Issuer not found or not supported by this app.";
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function toHide(){
            document.getElementById('message').classList.add('hidden');
            document.getElementById('Issuer_SC').classList.add('hidden');
            document.getElementById('Issuer_CSS').classList.add('hidden');
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function stepstoExecute(){

            document.getElementById('start_posting').classList.remove('hidden');
            document.getElementById('start_posting').addEventListener('click', async () => { GetCoordinates();document.getElementById('submit').classList.remove('hidden');
              document.getElementById('map').classList.remove('hidden');document.getElementById('submit').classList.remove('hidden');
              document.getElementById('latlong').classList.remove('hidden');document.getElementById('start_posting').classList.add('hidden') 
              document.getElementById('stop').classList.remove('hidden');await getParticipants();fetchLocations();//document.getElementById('selectPerson').classList.remove('hidden');
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
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
document.getElementById('Issuer_SC').addEventListener('click', () => { document.getElementById('Issuer_SC_username').classList.remove('hidden');document.getElementById('ok_IssuerSC').classList.remove('hidden');toHide();});
document.getElementById('ok_IssuerSC').addEventListener('click', () => { let Username_SolidCommunity = document.getElementById('Issuer_SC_username').value; window.sessionStorage.setItem('Username_SolidCommunity_Later',Username_SolidCommunity);
document.getElementById('ok_IssuerSC').classList.add('hidden');document.getElementById('Issuer_SC_username').classList.add('hidden');Login('https://solidcommunity.net/');});

document.getElementById('Issuer_CSS').addEventListener('click', () => { document.getElementById('issuer').classList.remove('hidden'); document.getElementById('Issuer_SC').classList.add('hidden'); document.getElementById('Issuer_CSS').classList.add('hidden');document.getElementById('CSS_Login').classList.remove('hidden');});
document.getElementById('CSS_Login').addEventListener('click', () => { let Issuer = document.getElementById('issuer').value; window.sessionStorage.setItem('Issuer_later',Issuer);console.log(Issuer); Login(Issuer)});

//document.getElementById('submit').addEventListener('click', ()=>{ friend_container=document.getElementById("selectPerson").value;friend_container=friend_container+'public/YourLocationHistory/';setInterval(caller,5000);/*sendAMessage();*/});

document.getElementById('message').textContent="Log in using your provider!";
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function myfetchFunction(url){
  return await fetch(url, {
        method: 'GET',
//        headers: { 'Content-Type': 'application/sparql-update','Cache-Control': 'no-cache' },
        });
}
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function settingContainer(){

switch(Object.keys(window.sessionStorage)[0]){

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
const folder=`https://svasired.pod.knows.idlab.ugent.be/public/participants/names.ttl`;
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function storeParticipants(){
  //Storing all participant pod urls in my solid comunity pod.
  const query= `INSERT DATA {<> <http://xmlns.com/foaf/0.1/openid> <${pod_url}>}`;

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
        console.log(element);
        getLatLongofFriend(element + 'public/YourLocationHistory/');
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
        console.log(position);
        var a = document.createElement('a');
        a.href="https://www.openstreetmap.org/#map=18/"+ position.coords.latitude + "/" + position.coords.longitude;
        a.textContent=" Latitude:"+ position.coords.latitude+"°, Longitude:"+ position.coords.longitude+"°,Timestamp:"+position.timestamp ;
        document.getElementById('map-link').appendChild(a);
        document.getElementById('map-link').appendChild(document.createElement("br"));


        map.setView([position.coords.latitude,position.coords.longitude], 12);
        const attribution= '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
        const tileURL='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        const tiles=L.tileLayer(tileURL,{attribution});
        tiles.addTo(map);

        
        marker.addTo(map).setLatLng([position.coords.latitude,position.coords.longitude]);


        const query = `<> <https://schema.org/latitude> "${position.coords.latitude}";<https://schema.org/longitude> "${position.coords.longitude}";<http://purl.org/dc/terms/created> "${position.timestamp}".`

        // Send a POST request to post to the source
        const response = await solidfetch(container, {
        method: 'POST',
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
      var myEngine = new QueryEngine();
      // Fetch the latest timestamp  
      const bindingsStream = await myEngine.queryBindings(`
      SELECT (MAX(?o) AS ?o) WHERE {
        ?s <http://purl.org/dc/terms/modified> ?o.
          }`, {
        sources: [`${friend_container}`],
        fetch:myfetchFunction
      });
      // Consume results as an array (easier)
      const bindings = await bindingsStream.toArray();

      //------------------------------------------------------------------      
      // Fetch the file name corresponding to the latest timestamp
      const bindingsStream_ = await myEngine.queryBindings(`
      SELECT ?s WHERE{
                ?s <http://purl.org/dc/terms/modified> \"${bindings[0].get('o').value}\"^^<${bindings[0].get('o').datatype.value}>.
      }`, {
        sources: [`${friend_container}`],
        fetch:myfetchFunction
      });


      const bindings_ = await bindingsStream_.toArray();

      //-------------------------------------------------------------------
      //Fetch the latitude from the file corresponding to the latest timestamp
      const bindingsStream_1 = await myEngine.queryBindings(`
      SELECT ?lat ?long WHERE {
      ?s <https://schema.org/latitude> ?lat ;
         <https://schema.org/longitude> ?long
      }`, {
        sources: [`${bindings_[bindings_.length-1].get('s').value}`],
      });

      const bindings_1 = await bindingsStream_1.toArray();
      if (bindings_1.length == 0 ){
        console.error('Couldn’t find a long/lat pair at ', friend_container);
        return null;
      }
      //console.log(bindings_1[0].get('lat').value, bindings_1[0].get('long').value, friend_container);
      //Return the latest Latitude and Longitude:
      const lat_long_list=[bindings_1[0].get('lat').value,bindings_1[0].get('long').value];
      return(lat_long_list);

}

const attribution= '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileURL='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const tiles=L.tileLayer(tileURL,{attribution});
tiles.addTo(map);

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function getLatLongofFriend(friendContainer){
  const lat_long_list = await test(friendContainer);
  if (lat_long_list) {
    //not sure we need to center here -- need to center acording to all friend makers
    //map.setView(lat_long_list, 15);
    let friendMarker = L.marker(lat_long_list);
    friendMarker.addTo(map);
    friendMarker._icon.classList.add("huechange");
    friendMarker.bindTooltip(friendContainer).openTooltip();
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

        // Send a PUT request to post to the source
        const response = await solidfetch(container+'.acl', {
        method: 'PUT',
        headers: { 'Content-Type': 'text/turtle' },
        body: query,
        credentials: 'include'
        });
        

}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// async function sendAMessage(){
//       const query = `INSERT DATA {<${friend_container.split('public/')[0]}> <http://www.w3.org/ns/auth/acl#accessTo> <${container}>; <http://www.w3.org/ns/auth/acl#mode> <http://www.w3.org/ns/auth/acl#Read>}`
//         const fileresponse_ = await solidfetch(friend_container+`inbox/personsAccessingYourPod.ttl`, {
//         method: 'GET',
//         headers: { 'Content-Type': 'text/turtle' },
//         });
//         console.log(fileresponse_);
//         if (400<=fileresponse_.status<500){
//         const response_ = await solidfetch(friend_container+`inbox/personsAccessingYourPod.ttl`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'text/turtle' },
//         body: ''
//         });
//         console.log(response_);}
// 
//         // Send a PUT request to post to the source
//         const response = await solidfetch(friend_container+`inbox/personsAccessingYourPod.ttl`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/sparql-update' },
//         body: query,
//         });
// 
//         console.log(query);
//         console.log(response);
// }
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------







