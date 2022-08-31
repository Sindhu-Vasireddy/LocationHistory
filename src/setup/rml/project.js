/* eslint-disable no-unused-vars */
import {fetch as solidfetch} from '@inrupt/solid-client-authn-browser';
/**
 * Creates RML Rules.
 * @param {String} container Location Container path.
 */
async function createRmlRules(container) {
  let query;

  // The generated rml files should be placed in the pod.

  const file=container.split('Data')[0]+'rmlRules.rml.ttl';
  // Send a GET request to check if shacl exists
  const response_ = await solidfetch(file, {
    method: 'GET',
    headers: {'Content-Type': 'text/turtle'},
    credentials: 'include',
  });

  if (300<response_.status&&response_.status<500) {
    fetch('src/setup/rml/rmlRules.rml.ttl')
        .then(async (q) => {
          q.text()
              .then(async (data) =>{
                query=data;
                // console.log("This is query",query)
                const response = await solidfetch(file, {
                  method: 'PUT',
                  headers: {'Content-Type': 'text/turtle'},
                  body: query,
                  credentials: 'include',
                });
              });
        });
  }
}


