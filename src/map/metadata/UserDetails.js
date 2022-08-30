const QueryEngine = require('@comunica/query-sparql').QueryEngine;
/**
 * Get the User Data from WebID.
 * @param {String} webid WebID to fetch data from.
 * @return {String[]} String Data array.
 */
export async function getDataFromWebID(webid) {
  const myEngineGetData = new QueryEngine();
  const bindingsStream = await myEngineGetData.queryBindings(`
        SELECT ?img ?familyName ?givenName WHERE {
        ?s <http://xmlns.com/foaf/0.1/img> ?img;
        <http://xmlns.com/foaf/0.1/familyName> ?familyName;
        <http://xmlns.com/foaf/0.1/givenName> ?givenName.
        }`, {
    sources: [`${webid}`],
  });
  const bindings = await bindingsStream.toArray();
  if (bindings.length==0) {
    // When the foaf:givenName and foaf:FamilyName
    // is absent foaf:name will be checked
    const myEngineGetData2 = new QueryEngine();
    const bindingsStream2 = await myEngineGetData2.queryBindings(`
                SELECT ?img ?name WHERE {
                ?s <http://xmlns.com/foaf/0.1/img> ?img;
                <http://xmlns.com/foaf/0.1/name> ?name.
                }`, {
      sources: [`${webid}`],
    });
    const bindings2 = await bindingsStream2.toArray();
    if (bindings2.length==0) {
      // When the foaf:name and foaf:givenName and foaf:FamilyName
      // are all absent foaf:img alone will be checked
      const myEngineGetData3 = new QueryEngine();
      const bindingsStream3 = await myEngineGetData3.queryBindings(`
                  SELECT ?img WHERE {
                  ?s <http://xmlns.com/foaf/0.1/img> ?img.
                  }`, {
        sources: [`${webid}`],
      });
      const bindings3 = await bindingsStream3.toArray();
      if (bindings3.length==0) {
        // When all predicates are missing,webID alone is shown
        const myEngineGetData4 = new QueryEngine();
        const bindingsStream4 = await myEngineGetData4.queryBindings(`
                  SELECT ?familyName ?givenName WHERE {
                   ?s <http://xmlns.com/foaf/0.1/familyName> ?familyName;
                  <http://xmlns.com/foaf/0.1/givenName> ?givenName.
                  }`, {
          sources: [`${webid}`],
        });
        const bindings4 = await bindingsStream4.toArray();
        if (bindings4.length==0) {
          // When the foaf:givenName and foaf:FamilyName
          // is absent foaf:name will be checked
          const myEngineGetData5 = new QueryEngine();
          const bindingsStream5 = await myEngineGetData5.queryBindings(`
                      SELECT ?name  WHERE {
                       ?s <http://xmlns.com/foaf/0.1/name> ?name.
                      }`, {
            sources: [`${webid}`],
          });
          const bindings5 = await bindingsStream5.toArray();
          if (bindings5.length==0) {
            return ([webid, '', '']);
          } else {
            return ([bindings5[0].get('name').value, '', '']);
          }
        } else {
          return ([bindings4[0].get('givenName').value,
            bindings4[0].get('familyName').value, '']);
        }
      } else {
        // When all predicates are missing, image alone is shown with webID
        return ([webid, '', bindings3[0].get('img').value]);
      }
    } else {
      return ([bindings2[0].get('name').value, '',
        bindings2[0].get('img').value]);
    }
  } else {
    return ([bindings[0].get('givenName').value,
      bindings[0].get('familyName').value, bindings[0].get('img').value]);
  }
}
