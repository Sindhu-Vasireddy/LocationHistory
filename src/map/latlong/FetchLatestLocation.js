import {myfetchFunction} from '../../utilities/CustomFetch';

const QueryEngine = require('@comunica/query-sparql').QueryEngine;
/**
 * Fetches Latest Location from the container.
 * @param {String} friendContainer Container location for the friend.
 * @return {String[]} String array of location data.
 */
export async function fetchLatestLocation(friendContainer) {
  const myEngine = new QueryEngine();
  // Fetch the latest timestamp
  let bindingsStream;
  try {
    bindingsStream= await myEngine.queryBindings(`
      SELECT (STRAFTER(?fileName, "/YourLocationHistory/Data/") AS ?tmstmp) 
      WHERE {
        ?s <http://www.w3.org/ns/ldp#contains> ?name .
        BIND (STR(?name) AS ?fileName)
      }
      ORDER BY DESC(?tmstmp)`, {
      sources: [`${friendContainer}`],
      fetch: myfetchFunction,
      httpIncludeCredentials: true,
    });
    myEngine.invalidateHttpCache();


    // Consume results as an array (easier)
    const bindings = await bindingsStream.toArray();
    const tmstmp=bindings[0].get('tmstmp').value;
    // Fetch the lat-long from the file corresponding to the latest timestamp
    const bindingsStream1 = await myEngine.queryBindings(`
    SELECT ?lat ?long WHERE {
    ?s <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat ;
       <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?long
    }`, {
      sources: [`${friendContainer}${bindings[0].get('tmstmp').value}`],
      fetch: myfetchFunction,
      httpIncludeCredentials: true,
    });

    const bindings1 = await bindingsStream1.toArray();

    // Return the latest Latitude and Longitude:
    const latLongList=[bindings1[0].get('lat').value,
      bindings1[0].get('long').value];
    const locArray=[latLongList, tmstmp];
    return (locArray);
  } catch (error) {
    // console.log("This is the error on container:",friendContainer);
  }
}
