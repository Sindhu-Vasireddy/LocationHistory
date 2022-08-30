/* eslint-disable max-len */
import 'leaflet';
import {getDataFromWebID} from '../map/metadata/UserDetails';
import {main} from '../setup/shacl/Validate';
import {storeAsRdf} from './mapping';
/**
 * To get the location coordinates from the geolocation API.
 * @param {*} map Leaflet map to add the location in UI.
 * @param {*} marker Leaflet marker to add the location in UI.
 * @param {*} container Pod data container location to add the data.
 * @return {String} locator for geolocation API.
 */
export async function getCoordinates(map, marker, container) {
  let locator;
  const optn={
    enableHighAccuracy: true,
    timeout: Infinity,
    maximumAge: 0,
  };
  let result= true;
  if (navigator.geolocation) {
    locator=navigator.geolocation.watchPosition(async function(position) {
      // A Display element earlier had hyperlink to location now
      // modified to indicate on map visually with a the tooltip.
      // var a = document.createElement('a');
      // a.href="https://www.openstreetmap.org/#map=18/"+ position.coords.latitude + "/" + position.coords.longitude;
      // a.textContent=" Latitude:"+ position.coords.latitude+"°,
      // Longitude:"+ position.coords.longitude+"°,
      // Timestamp:"+position.timestamp ;
      // document.getElementById('map-link').appendChild(a);
      // document.getElementById('map-link').
      // appendChild(document.createElement("br"));

      // eslint-disable-next-line max-len
      const tmstmpName=position.timestamp; // So that file name stays the same and doesn't get changed with few ms

      map.setView([position.coords.latitude, position.coords.longitude], 13);
      const attribution= '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      const tileURL='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tiles=L.tileLayer(tileURL, {attribution});
      tiles.addTo(map);

      // To add just the pin for user's current location without tooltip
      // marker.setLatLng([position.coords.latitude,position.coords.longitude]);
      // marker.addTo(map);

      // Getting current user details and adding them on the map
      const dataArray=await getDataFromWebID(window.sessionStorage.getItem('webID_later'));

      map.eachLayer(function(layer) {
        if (layer._content) {
          if (layer._content.split('\r\n')[0]==dataArray[0]+` ${dataArray[1]}`) {
            map.removeLayer(layer);
          }
        }
        if (layer._tooltipHandlersAdded) {
          if (layer._tooltip._content.split('\r\n')[0]==dataArray[0]+` ${dataArray[1]}`) {
            map.removeLayer(layer);
          }
        }
      });
      if (dataArray[2]=='') {// If the user doesn't have the foaf:img triple
        marker.setLatLng([position.coords.latitude, position.coords.longitude]);
      } else {
        const profileImage = L.icon({
          iconUrl: dataArray[2], // Image of the icon
          iconSize: [30, 30], // size of the icon
          // point of the icon which will correspond to marker's location
          iconAnchor: [15, 15],
        });
        marker = L.marker([position.coords.latitude, position.coords.longitude], {icon: profileImage});
      }
      marker.addTo(map);
      marker._icon.classList.add('huechange');
      marker.bindTooltip(dataArray[0]+` ${dataArray[1]}`+`\r\n Latest Location capured \r\n at ${new Date(Number(tmstmpName)).toLocaleString()}`).openTooltip();

      const query = `@prefix sosa: <http://www.w3.org/ns/sosa/>.
            @prefix wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>.
            @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
            @prefix plh: <https://w3id.org/personallocationhistory#> .
            @prefix tm: <https://w3id.org/transportmode#> .
            @prefix geo: <http://www.opengis.net/ont/geosparql#>.
            @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
            <${navigator.platform.split(' ').join('')}> a sosa:Platform;
            sosa:hosts <locationSensor>.
            <locationSensor> a sosa:Sensor;
            sosa:madeObservation <>;
            sosa:observes <location>;
            sosa:isHostedBy <${navigator.platform.split(' ').join('')}>.
            <> a sosa:Observation;
            sosa:observedProperty <location> ;
            sosa:hasResult <_result>;
            sosa:featureOfInterest <${window.sessionStorage.getItem('webID_later')}> ;
            sosa:hasSimpleResult "POINT(${position.coords.longitude} ${position.coords.latitude})"^^geo:wktLiteral ;
            sosa:madeBySensor <locationSensor>;
            sosa:resultTime "${new Date(Number(tmstmpName)).toISOString()}"^^xsd:dateTime.
            <_result> a sosa:Result;
            wgs84:long ${position.coords.longitude};
            wgs84:lat ${position.coords.latitude}.
            <location> a sosa:ObservableProperty;
            rdfs:label "Location"@en .
            <${window.sessionStorage.getItem('webID_later')}> a sosa:FeatureOfInterest.`;

      if (result==true) {
        storeAsRdf(query, container, tmstmpName);
      } else {
        console.error(`The ${container+tmstmpName} file doesn't exist
         or is not as per ${container.split('Data')[0]+'shacl.ttl'} Please 
         check and modify before proceeding`);
      }
      console.log('SHACL validation for:', tmstmpName);
      result = await main(`${container.split('Data')[0]+'shacl.ttl'}`,
          `${container+tmstmpName}`);
    }, async function error() {
      document.querySelector('#status').textContent =
          'This app is unable to retrieve your location from the browser';
    }, optn);
  }
  return locator;
}
