import {fetch as solidfetch} from '@inrupt/solid-client-authn-browser';
/**
 * A custom fetch wrapper for solidfetch.
 * @param {String} url URL to fetch from.
 * @return {*} response Object.
 */
export async function myfetchFunction(url) {
  return await solidfetch(url, {
    method: 'GET',
    headers: {'Content-Type': 'application/sparql-update',
      'Cache-Control': 'no-cache'},
    credentials: 'include',
  });
}
