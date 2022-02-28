
import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
  fetch
} from "@inrupt/solid-client-authn-browser";

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
async function handleRedirectAfterLogin() {
       await handleIncomingRedirect();
       if(getDefaultSession().info.isLoggedIn){
            document.getElementById('message').classList.add('hidden');
            document.getElementById('Issuer_1').classList.add('hidden');
            document.getElementById('Issuer_2').classList.add('hidden');
            document.getElementById('Issuer_others').classList.add('hidden');
            document.getElementById('output').textContent="Session logged in!";
            GetCoordinates();
            document.getElementById('stop').classList.remove('hidden');
        }
}
handleRedirectAfterLogin();

document.getElementById('Issuer_1').addEventListener('click', () => { const Issuer = "https://broker.pod.inrupt.com"; Login(Issuer) });
document.getElementById('Issuer_2').addEventListener('click', () => { const Issuer = "https://solidcommunity.net/"; Login(Issuer) });
document.getElementById('Issuer_others').addEventListener('click', () => { document.getElementById('webid').classList.remove('hidden');document.getElementById('Issuer_1').classList.add('hidden'); document.getElementById('Issuer_2').classList.add('hidden'); document.getElementById('Issuer_others').classList.add('hidden');document.getElementById('Others_Login').classList.remove('hidden');});
document.getElementById('Others_Login').addEventListener('click', () => { const Issuer = document.getElementById('webid').value;console.log(Issuer); Login(Issuer)});

document.getElementById('message').textContent="Log in using your provider!";
var locator;
async function GetCoordinates(){
  var optn={
    enableHighAccuracy: true,
    timeout: Infinity,
    maximumAge: 0
  };
  if (navigator.geolocation) {
      locator=navigator.geolocation.watchPosition(function(position){
        console.log(position);
        var a = document.createElement('a');
        a.href="https://www.openstreetmap.org/#map=18/"+ position.coords.latitude + "/" + position.coords.longitude;
        a.textContent=" Latitude:"+ position.coords.latitude+"°, Longitude:"+ position.coords.longitude+"°,Timestamp:"+position.timestamp ;
        document.getElementById('map-link').appendChild(a);
        document.getElementById('map-link').appendChild(document.createElement("br"));
        // var img = new Image();
        // img.src = "https://maps.googleapis.com/maps/api/staticmap?center=" + position.coords.latitude + "," + position.coords.longitude + "&zoom=13&size=800x400&sensor=false";
        // $('#output').html(img);
        },  function error() {
        document.querySelector('#status').textContent = 'Unable to retrieve your location';
      },optn);
  }
};

document.querySelector('#stop').addEventListener('click', () => {navigator.geolocation.clearWatch(locator);console.log(locator);console.log("stop button is pressed.")});
