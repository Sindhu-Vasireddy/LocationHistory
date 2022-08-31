import {fetch as solidfetch} from '@inrupt/solid-client-authn-browser';
// const {execSync} = require("./child_process");
/**
 * Stores the RDF of location data in Pod.
 * @param {String} query The content of the location data.
 * @param {String} container Solid data container path.
 * @param {String} timestamp filename timestamp.
 */
export async function storeAsRdf(query, container, timestamp) {
  // Legacy RML implementation
  // let query;
  // const file=container.split('Data')[0]+'rmlRules.rml.ttl';
  // const response_ = await solidfetch(file, {
  // method: 'GET',
  // headers: { 'Content-Type': 'text/turtle' },
  // credentials: 'include'
  // }).then(response_=>query=response_.text());
  //
  // var yarrrml2rml = execSync('java -jar ./src/setup/rml/rmlmapper.jar
  // -m ./src/setup/rml/rmlRules.rml.ttl -o ./src/setup/rml/out.ttl -s turtle',
  // (error, stdout, stderr) => {
  //     console.log(stdout);
  //     console.log(stderr);
  //     if (error !== null) {
  //         console.log(`exec error: ${error}`);
  //     }
  // });
  //
  // fetch('src/setup/rml/out.ttl').then( async (q) => {q.text()
  //     .then( async (data) => {
  //         query=data;   })});

  // Send a PUT request to post to the source
  await solidfetch(container+`${timestamp}`, {
    method: 'PUT',
    headers: {'Content-Type': 'text/turtle'},
    body: query,
    credentials: 'include',
  });
}
