import {getDataFromWebID} from '../metadata/UserDetails';
import {fetchLatestLocation} from '../latlong/FetchLatestLocation';
import 'leaflet';
/**
 * Get the Location of friend to pin on the map.
 * @param {String} map Leaflet map to pin the friend's location.
 * @param {String} friendWebid WebID of the friend.
 * @param {String} friendContainer Pod location data container path.
 */
export async function getLatLongofFriend(map, friendWebid, friendContainer) {
  const dataArray=await getDataFromWebID(friendWebid);
  const locArray = await fetchLatestLocation(friendContainer);
  const latLongList = locArray[0];
  const tmstmp_ =locArray[1];
  if (latLongList) {
    map.eachLayer(function(layer) {
      if (layer._content) {
        if (layer._content.split('\r\n')[0]==dataArray[0]+` ${dataArray[1]}`) {
          // console.log(`removing _tooltip: ${layer}`);
          map.removeLayer(layer);
        }
      }
      if (layer._tooltipHandlersAdded) {
        if (layer._tooltip._content.split('\r\n')[0]==
        dataArray[0]+` ${dataArray[1]}`) {
          // console.log(`removing marker: ${layer}`);
          map.removeLayer(layer);
        }
      }
    });
    let friendMarker;
    if (dataArray[2]=='') {// If the user doesn't have the foaf:img triple
      friendMarker = L.marker(latLongList);
    } else {
      const friendImage = L.icon({
        iconUrl: dataArray[2],
        iconSize: [30, 30], // size of the icon
        iconAnchor: [15, 15], // point of the icon corresponding to marker
      });
      friendMarker = L.marker(latLongList, {icon: friendImage});
    }
    friendMarker.addTo(map);
    friendMarker._icon.classList.add('huechange');
    friendMarker.bindTooltip(dataArray[0]+` ${dataArray[1]}`+`\r\n 
    Last seen at ${new Date(Number(tmstmp_)).toLocaleString()}`).openTooltip();
  }
}
