import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
} from "@inrupt/solid-client-authn-browser";
import {fetch as solidfetch} from "@inrupt/solid-client-authn-browser";
import "leaflet";
const QueryEngine = require('@comunica/query-sparql').QueryEngine;
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const map= L.map('map');
const marker=L.marker([0,0]);
var locator;
let container;
let pod_url;
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
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
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function toHide(){
            document.getElementById('message').classList.add('hidden');
            document.getElementById('webid').classList.add('hidden');
            document.getElementById('webid_Login').classList.add('hidden');
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function stepstoExecute(){
            document.getElementById('start_posting').classList.remove('hidden');
            document.getElementById('start_posting').addEventListener('click', async () => { await GetCoordinates(); await fetchLocations();
                                document.getElementById('map').classList.remove('hidden');document.getElementById('start_posting').classList.add('hidden'); 
                                document.getElementById('stop').classList.remove('hidden');document.getElementById('req_frnd').classList.remove('hidden');
                                });
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function handleRedirectAfterLogin() {
       await handleIncomingRedirect();              
       if(getDefaultSession().info.isLoggedIn){
          await toHide();
          document.getElementById('output').textContent="Session logged in!";
          await settingContainer();
          await createInbox();
          await giveAccessoftheContainertoOwner();
          await stepstoExecute();
        }
}

handleRedirectAfterLogin();
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function myfetchFunction(url){
  return await solidfetch(url, {
       method: 'GET',
       headers: { 'Content-Type': 'application/sparql-update','Cache-Control': 'no-cache' },
       credentials: 'include'
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
  return(bindings[0].get('o').value);  
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
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
    const bindings = await bindingsStream.toArray();
     if(bindings.length==0){ //When the foaf:givenName and foaf:FamilyName is absent webid will be shown
        return([webid,'','']) }
     else{
            return([bindings[0].get('givenName').value,bindings[0].get('familyName').value,bindings[0].get('img').value]);
         }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Execute the following on the following button clicks!
document.getElementById('webid_Login').addEventListener('click', async () => { let webID = document.getElementById('webid').value; 
            try{let oidcIssuer=await getIssuerFromWebID(webID);window.sessionStorage.setItem('webID_later',webID);
                window.sessionStorage.setItem('oidcIssuer_later',oidcIssuer); await Login(oidcIssuer);}
            catch(error){
                document.getElementById('output').textContent="OIDC Issuer not found in webid or invalid webID.";
                }} );
document.getElementById('message').textContent="Log in using your webid! \n e.g.https://data.knows.idlab.ugent.be/person/SindhuVasireddy/#me";
document.getElementById('req_frnd').addEventListener('click',()=>{document.getElementById('friend_webid').classList.remove("hidden");document.getElementById('request').classList.remove("hidden");
                                    document.getElementById('req_frnd').classList.add("hidden")});
document.getElementById('request').addEventListener('click',async ()=>{let webid_frnd=document.getElementById('friend_webid').value;document.getElementById('friend_webid').classList.add("hidden");
                                    document.getElementById('request').classList.add("hidden");document.getElementById('req_frnd').classList.remove("hidden");
                                    let podUrl_frnd=await getIssuerFromWebID(webid_frnd);const file=`${podUrl_frnd}public/YourLocationHistory/inbox.ttl`;await sendNotifications(file);});
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
document.querySelector('#stop').addEventListener('click', () => {navigator.geolocation.clearWatch(locator);/*console.log(locator);console.log("stop button was pressed.");*/
document.getElementById('start').classList.remove('hidden');document.getElementById('stop').classList.add('hidden');});
document.querySelector('#start').addEventListener('click', () => {GetCoordinates();document.getElementById('stop').classList.remove('hidden');document.getElementById('start').classList.add('hidden');});
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function settingContainer(){
switch(Object.keys(window.sessionStorage)[0]){

  case "webID_later":
  pod_url=window.sessionStorage.getItem('oidcIssuer_later');
  container=pod_url+'public/YourLocationHistory/Data/';  
  break;

  case "oidcIssuer_later":
    pod_url=window.sessionStorage.getItem('oidcIssuer_later');
    container=pod_url+'public/YourLocationHistory/Data/';  
    break;
    }  
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function GivePublicAccesstotheInbox(){
    const file=container.split('Data')[0]+'inbox.ttl';
    const query = `<${pod_url}.acl#owner> a <http://www.w3.org/ns/auth/acl#Authorization>;
    <http://www.w3.org/ns/auth/acl#mode> <http://www.w3.org/ns/auth/acl#Read>,<http://www.w3.org/ns/auth/acl#Write>, <http://www.w3.org/ns/auth/acl#Control>;
    <http://www.w3.org/ns/auth/acl#accessTo> <${file}>;
    <http://www.w3.org/ns/auth/acl#default> <${file}>;
    <http://www.w3.org/ns/auth/acl#agentClass> <http://xmlns.com/foaf/0.1/Agent>.`
        // Send a PUT request to inbox.ttl.acl
        const response = await solidfetch(file+'.acl', {
        method: 'PUT',
        headers: { 'Content-Type': 'text/turtle' },
        body: query,
        credentials: 'include'
        });
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function createInbox(){
    const file=container.split('Data')[0]+'inbox.ttl';
        // Send a GET request to check if inbox exists
        const response_ = await solidfetch(file, {
        method: 'GET',
        headers: { 'Content-Type': 'text/turtle' },
        credentials: 'include'
        });

        if(300<response_.status&&response_.status<500){
        const query = ``
            // Send a PUT request to add inbox
            const response = await solidfetch(file, {
            method: 'PUT',
            headers: { 'Content-Type': 'text/turtle' },
            body: query,
            credentials: 'include'
            });
            await GivePublicAccesstotheInbox();
          }
}
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function sendNotifications(file_frnd){
  //Storing all participant pod urls in my solid comunity pod.
  const query= `INSERT DATA {<> <http://tobeadded.com/LocationRequestedBy> <${window.sessionStorage.getItem('webID_later')}>.}`;
    // Send a PATCH request the pod url to inbox.ttl 
      const response = await fetch(file_frnd, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/sparql-update' },
      body: query
      });
    if(300<response.status&&response.status<600){
      console.log(` Error code is ${response.status} Your friend may not have used our app yet!`);
    }
} 
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function sendRequestAcceptedNotification(rqstr_webid){
    const rqstr_issuer=await getIssuerFromWebID(rqstr_webid);
    const query= `INSERT DATA {<${window.sessionStorage.getItem('webID_later')}> <http://tobeadded.com/GrantedAccessToLocation> <${container}>.}`;
    // Send a PATCH request the pod url to inbox.ttl 
      const response = await fetch(rqstr_issuer+'public/YourLocationHistory/inbox.ttl', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/sparql-update' },
      body: query
      });
    if(300<response.status&&response.status<600){
      console.log(` HTTP fetch Error code is ${response.status} Your friend may not have used our app yet!`)
    }
} 
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
let response_data;
async function addRequestingPersontoACL(webid_rqstr){
        var element = document.getElementById(webid_rqstr);
        element.parentNode.removeChild(element);
        const query_extra=`:Read
        a acl:Authorization;
        acl:accessTo D:;
        acl:agent <${webid_rqstr}>;
        acl:default D:;
        acl:mode acl:Read.`;
        // Send a GET and PUT request to update the source
        const response = await solidfetch(container+'.acl', {
        method: 'GET',
        headers: { 'Content-Type': 'text/turtle' },
        }).then(response_=>response_.text()).then(async (data)=>{ response_data=data; if(!response_data.includes(query_extra)){const query = response_data+"\n"+query_extra;
        const response_put = await solidfetch(container+'.acl', {
        method: 'PUT',
        headers: { 'Content-Type': 'text/turtle' },
        body: query
        });}
    });
        await sendRequestAcceptedNotification(webid_rqstr);
  }
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
var myEngine_getNots = new QueryEngine();
let rqstr_webid_array=new Array();
async function getRequestNotifications(){   
  const file=container.split('Data')[0]+'inbox.ttl';
  const bindingsStream = await myEngine_getNots.queryBindings(`
  SELECT ?o WHERE {
   ?s <http://tobeadded.com/LocationRequestedBy> ?o.
  }`, {
    sources: [`${file}`],
    fetch: myfetchFunction,
  });
  myEngine_getNots.invalidateHttpCache();
  const bindings = await bindingsStream.toArray();
  bindings.forEach(element=>{
          if(document.getElementById(element.get('o').value)==null){
            document.getElementById("approve_revoke").innerHTML+=` <button type="button" id="${element.get('o').value}" >Approve ${element.get('o').value}</button>`;
            rqstr_webid_array.push(element.get('o').value)
          }
          document.getElementById(element.get('o').value).addEventListener('click',async ()=>{await approvedSentNotification(element.get('o').value);await addRequestingPersontoACL(element.get('o').value);});
  });  
  const bindingsStream_ = await myEngine_getNots.queryBindings(`
  SELECT ?o WHERE {
   ?s <http://tobeadded.com/YouGrantedAccessTo> ?o.
  }`, {
    sources: [`${file}`],
    fetch: myfetchFunction,
  });
  myEngine_getNots.invalidateHttpCache();
  const bindings_ = await bindingsStream_.toArray(); 
  bindings_.forEach((element)=>{   
    if(document.getElementById(`r_${element.get('o').value}`)==null){
            document.getElementById("approve_revoke").innerHTML+=` <button type="button" id="r_${element.get('o').value}" >Revoke ${element.get('o').value}</button>`;
            document.getElementById(`r_${element.get('o').value}`).addEventListener('click',async ()=>{await revokingPersonAccessfromACL(element.get('o').value);await removeAccessNotification(element.get('o').value)});
        }
  })
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  async function revokingPersonAccessfromACL(rvk_aprvd_webid){
        var element = document.getElementById(`r_${rvk_aprvd_webid}`);
            element.parentNode.removeChild(element);
        const query_extra=`:Read
        a acl:Authorization;
        acl:accessTo D:;
        acl:agent <${rvk_aprvd_webid}>;
        acl:default D:;
        acl:mode acl:Read.`;
        // Send a GET and PUT request to update the source
        const response = await solidfetch(container+'.acl', {
        method: 'GET',
        headers: { 'Content-Type': 'text/turtle' },
        }).then(response_=>response_.text()).then(async (data)=>{ response_data=data; 
                    if(response_data.includes(query_extra)){
                        const query = response_data.split(query_extra).join('\n');
                        const response_put = await solidfetch(container+'.acl', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'text/turtle' },
                          body: query});
                      }
          });
   await deleteRequestAcceptedNotification(rvk_aprvd_webid);    
  }
  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  async function deleteRequestAcceptedNotification(rqstr_webid){
    const rqstr_issuer=await getIssuerFromWebID(rqstr_webid);
    const query= `DELETE DATA {<${window.sessionStorage.getItem('webID_later')}> <http://tobeadded.com/GrantedAccessToLocation> <${container}>.}`;
        // Send a PATCH request the pod url to inbox.ttl 
        const response = await fetch(rqstr_issuer+'public/YourLocationHistory/inbox.ttl', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/sparql-update' },
        body: query
        });
    if(300<response.status&&response.status<600){
      console.log(` HTTP fetch Error code is ${response.status}`);
    }
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function approvedSentNotification(apprvd_rqstr_webid){
    const query= `DELETE DATA {<> <http://tobeadded.com/LocationRequestedBy> <${apprvd_rqstr_webid}>.}`;
        // Send a PATCH request the pod url to names.ttl 
        const response = await fetch(container.split("/Data/")[0]+"/inbox.ttl", {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/sparql-update' },
        body: query
        });
    if(300<response.status&&response.status<600){
      console.log("Your friend has not used our app yet or the entry could not be deleted!")
    }
    else{
      const query= `INSERT DATA {<> <http://tobeadded.com/YouGrantedAccessTo> <${apprvd_rqstr_webid}>.}`;
          // Send a PATCH request the pod url to names.ttl 
          const response = await fetch(container.split("/Data/")[0]+"/inbox.ttl", {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/sparql-update' },
          body: query
          });
      if(300<response.status&&response.status<600){
        console.log("Your friend has not used our app yet or the entry could not be deleted!")
      }
    }
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function removeAccessNotification(rm_rqstr_webid){
    const query= `DELETE DATA {<> <http://tobeadded.com/YouGrantedAccessTo> <${rm_rqstr_webid}>.}`;
        // Send a PATCH request the pod url to names.ttl 
        const response = await fetch(container.split("/Data/")[0]+"/inbox.ttl", {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/sparql-update' },
        body: query
        });
    if(300<response.status&&response.status<600){
      console.log("Your friend has not used our app yet or the entry could not be deleted!")
    }
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
var myEngine_getURLs=new QueryEngine();
async function getAccessGrantedNotifications(){     
  let lctn_container=new Array();
  let acptr_webid=new Array();
  const file=container.split('Data')[0]+'inbox.ttl';  
    const bindingsStream = await myEngine_getURLs.queryBindings(`
    SELECT ?acptr_webid ?lctn_container WHERE {
           ?acptr_webid  <http://tobeadded.com/GrantedAccessToLocation> ?lctn_container.
    }`,{
      sources: [`${file}`],
      fetch: myfetchFunction,
    });
    myEngine_getURLs.invalidateHttpCache();
  const bindings = await bindingsStream.toArray();
  bindings.forEach((element1,element2)=>{acptr_webid.push(element1.get('acptr_webid').value),lctn_container.push(element1.get('lctn_container').value)});  
  return {acptr_webid,lctn_container}; 
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function fetchWebid_Container(acptr_webid,lctn_container){
    acptr_webid.forEach(async (element1, index) => {
    const element2 = lctn_container[index];
    await getLatLongofFriend(element1,element2);
    });
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function fetchLocations(){
              window.setInterval(
                      async () => {
                        await getRequestNotifications();
                        const {acptr_webid,lctn_container}=await getAccessGrantedNotifications();
                        await fetchWebid_Container(acptr_webid,lctn_container);
                        }, 5000);
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
        const query = `@prefix sosa: <http://www.w3.org/ns/sosa/>.
        @prefix wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>.
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
        @prefix plh: <https://w3id.org/personallocationhistory#> .
        @prefix tm: <https://w3id.org/transportmode#> .
        @prefix geo: <http://www.opengis.net/ont/geosparql#>.
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.

        <${navigator.platform.split(" ").join('')}> a sosa:Platform;
        sosa:hosts <locationSensor>.

        <locationSensor> a sosa:Sensor;
        sosa:madeObservation <>;
        sosa:observes <location>;
        sosa:isHostedBy <${navigator.platform.split(" ").join('')}>.

        <> a sosa:Observation;
        sosa:observedProperty <location> ;
        sosa:hasResult <_result>;
        sosa:featureOfInterest <${window.sessionStorage.getItem('webID_later')}> ;
        sosa:hasSimpleResult "POINT(${position.coords.longitude} ${position.coords.latitude})"^^geo:wktLiteral ;
        sosa:madeBySensor <locationSensor>;
        sosa:resultTime "${new Date(Number(position.timestamp)).toISOString()}"^^xsd:dateTime.

        <_result> a sosa:Result;
        wgs84:long ${position.coords.longitude};
        wgs84:lat ${position.coords.latitude}.

        <location> a sosa:ObservableProperty;
        rdfs:label "Location"@en .

        <${window.sessionStorage.getItem('webID_later')}> a sosa:FeatureOfInterest.        `
        // const query = `<> <https://schema.org/latitude> "${position.coords.latitude}";<https://schema.org/longitude> "${position.coords.longitude}";<http://purl.org/dc/terms/created> "${position.timestamp}".`

          // Send a PUT request to post to the source
          const response = await solidfetch(container+`${position.timestamp}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'text/turtle' },
          body: query,
          credentials: 'include'
          });

        },  async function error() {
        document.querySelector('#status').textContent = 'Unable to retrieve your location';
      },optn);
  }
};
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function test(friend_container){
      var myEngine = new QueryEngine();
        // Fetch the latest timestamp  
        let bindingsStream;
        try{ bindingsStream= await myEngine.queryBindings(`
        SELECT (STRAFTER(?fileName, "/YourLocationHistory/Data/") AS ?tmstmp) 
        WHERE {
          ?s <http://www.w3.org/ns/ldp#contains> ?name .
          BIND (STR(?name) AS ?fileName)
        }
        ORDER BY DESC(?tmstmp)`, {
          sources: [`${friend_container}`],
          fetch: myfetchFunction,
          httpIncludeCredentials:true
        });
        myEngine.invalidateHttpCache(); 


      // Consume results as an array (easier)
      const bindings = await bindingsStream.toArray();
      const tmstmp=bindings[0].get('tmstmp').value;
//---------------------------------------------------------------------------------------
      //Fetch the lat-long from the file corresponding to the latest timestamp
      const bindingsStream_1 = await myEngine.queryBindings(`
      SELECT ?lat ?long WHERE {
      ?s <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat ;
         <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?long
      }`, {
        sources: [`${friend_container}${bindings[0].get('tmstmp').value}`],
        fetch: myfetchFunction,
        httpIncludeCredentials:true
      });

      const bindings_1 = await bindingsStream_1.toArray();
      
      //Return the latest Latitude and Longitude:
      const lat_long_list=[bindings_1[0].get('lat').value,bindings_1[0].get('long').value];
      let loc_array=[lat_long_list,tmstmp]
      return(loc_array);
      }catch(error){
      //Once the friend revoke's access to the location data container, The Lat Long fetch will stop this is to try catch that
      // console.log("This is the error",error);//All actors rejected their test in urn:comunica:default:rdf-join/mediators#main
      // console.log("This is the error on container:",friend_container);
    }
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//Variables for open-street Map
const attribution= '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileURL='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles=L.tileLayer(tileURL,{attribution});
tiles.addTo(map);
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function getLatLongofFriend(friend_webid,friend_container){
  let data_array=await getDataFromWebID(friend_webid);
  const loc_array = await test(friend_container);
  const lat_long_list = loc_array[0];
  const tmstmp_ =loc_array[1];
    if (lat_long_list) {
      map.eachLayer(function (layer) { 
        if(layer._content){
           if(layer._content.split('\r\n')[0]==data_array[0]+` ${data_array[1]}`){
              // console.log(`removing _tooltip: ${layer}`);
              map.removeLayer(layer);
            }  
        }
        if(layer._tooltipHandlersAdded){
          if(layer._tooltip._content.split('\r\n')[0]==data_array[0]+` ${data_array[1]}`){
            // console.log(`removing marker: ${layer}`);
            map.removeLayer(layer);
          }
        }
      });
    let friendMarker;
    if(data_array[2]==''){//If the user doesn't have the foaf:img triple
      friendMarker = L.marker(lat_long_list);      
    }
    else{
      var friend_image = L.icon({
      iconUrl: data_array[2],
      iconSize:     [30, 30], // size of the icon
      iconAnchor:   [15, 15] // point of the icon which will correspond to marker's location
      });
      friendMarker = L.marker(lat_long_list,{icon: friend_image});                
    }
    friendMarker.addTo(map);
    friendMarker._icon.classList.add("huechange");
    friendMarker.bindTooltip(data_array[0]+` ${data_array[1]}`+`\r\n Last seen at ${new Date(Number(tmstmp_)).toLocaleString()}`).openTooltip();
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function giveAccessoftheContainertoOwner(){
    const response = await solidfetch(container+'.acl', {
        method: 'GET',
        headers: { 'Content-Type': 'text/turtle' },
        });
    if(response.status>300){
      const query = `@prefix : <#>.
      @prefix acl: <http://www.w3.org/ns/auth/acl#>.
      @prefix foaf: <http://xmlns.com/foaf/0.1/>.
      @prefix D: <./>.
      

      :ReadControlWrite
      a acl:Authorization;
      acl:accessTo D:;
      acl:agent <${window.sessionStorage.getItem('webID_later')}>;
      acl:default D:;
      acl:mode acl:Control, acl:Read, acl:Write.`
          // Send a PUT request to post to the source
          const response = await solidfetch(container+'.acl', {
          method: 'PUT',
          headers: { 'Content-Type': 'text/turtle' },
          body: query,
          credentials: 'include'
          });
      }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

 
