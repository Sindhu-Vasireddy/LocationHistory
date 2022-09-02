import {fetch as solidfetch} from '@inrupt/solid-client-authn-browser';
/**
 * Creates a SHACL.ttl in the pod.
 * @param {String} container Path to Data Container
 */
export async function createShacl(container) {
  const file=container.split('Data')[0]+'shacl.ttl';
  // Send a GET request to check if shacl exists
  const response_ = await solidfetch(file, {
    method: 'GET',
    headers: {'Content-Type': 'text/turtle'},
    credentials: 'include',
  });

  if (300<response_.status&&response_.status<500) {
    console.log('shacl.ttl didn\'t exist but will now be created');
    const data = await fetch('./shaclValidator/shapes.ttl')
    const query = await data.text();
    // console.log("This is query",query);

    // Send a PUT to shacl.ttl
    const response = await solidfetch(file, {
        method: 'PUT',
        headers: {'Content-Type': 'text/turtle'},
        body: query,
        credentials: 'include',
    });
  }
}
