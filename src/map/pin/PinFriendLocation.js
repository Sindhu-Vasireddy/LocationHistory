import {getLatLongofFriend} from './PinLocation';
/**
 * Pin the friend Location on map.
 * @param {String} map Leaflet map to pin the location.
 * @param {String} acptrWebid Accepter webID to fetch the location.
 * @param {String} lctnContainer Conatiner location path.
 */
export async function pinFriendLocation(map, acptrWebid, lctnContainer) {
  acptrWebid.forEach(async (element1, index) => {
    const element2 = lctnContainer[index];
    await getLatLongofFriend(map, element1, element2);
  });
}
