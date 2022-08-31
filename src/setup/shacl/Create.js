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
    const query = `@prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#> .
        @prefix sh:    <http://www.w3.org/ns/shacl#> .
        @prefix foaf:  <http://xmlns.com/foaf/0.1/> .
        @prefix ex:    <http://example.com/> .
        @prefix sosa: <http://www.w3.org/ns/sosa/> .
        @prefix wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>.
        
        ex:ObservationShape
            a              sh:NodeShape ;
            sh:targetClass sosa:Observation ;
            sh:property    ex:requiredObservedProperty ;
            sh:property    ex:requiredHasResult ;
            sh:property    ex:requiredHasFeatureOfInterest ;
            sh:property    ex:requiredHasSimpleResult ;
            sh:property    ex:requiredMadeBySensor ;
            sh:property    ex:requiredResultTime.
        
        ex:requiredObservedProperty
            a           sh:PropertyShape ;
            rdfs:label  "Observed Property"@en ;
            sh:path     sosa:observedProperty ;
            sh:nodeKind sh:IRI ;
            sh:minCount 1 .
        
        ex:requiredHasResult
            a           sh:PropertyShape ;
            rdfs:label  "has result"@en ;
            sh:path     sosa:hasResult ;
            sh:node     ex:requiredResult ;
            sh:nodeKind sh:BlankNodeOrIRI ;
            sh:minCount 1 .
        
                ex:requiredResult
                    a              sh:NodeShape ;
                    sh:targetClass sosa:Result ;
                    sh:property    ex:requiredLongitude ;
                    sh:property    ex:requiredLatitude .
        
                    ex:requiredLongitude
                        a           sh:PropertyShape ;
                        rdfs:label  "Longitude"@en ;
                        sh:path     wgs84:lon ;
                        sh:nodeKind sh:Literal ;
                        sh:minCount 1 .     
        
                    ex:requiredLatitude
                        a           sh:PropertyShape ;
                        rdfs:label  "Latitude"@en ;
                        sh:path     wgs84:lat ;
                        sh:nodeKind sh:Literal ;
                        sh:minCount 1 .
        
        ex:requiredHasFeatureOfInterest
            a           sh:PropertyShape ;
            rdfs:label  "has feature of interest"@en ;
            sh:path     sosa:hasFeatureOfInterest ;
            sh:node     ex:requiredFeatureOfInterest ;
            sh:nodeKind sh:BlankNodeOrIRI ;
            sh:minCount 1 .
        
            ex:requiredFeatureOfInterest
                a              sh:NodeShape ;
                sh:targetClass sosa:FeatureOfInterest .
        
        
        ex:requiredHasSimpleResult
            a           sh:PropertyShape ;
            rdfs:label  "has simple result"@en ;
            sh:path     sosa:hasSimpleResult ;
            sh:nodeKind sh:Literal ;
            sh:minCount 1 .
        
        ex:requiredMadeBySensor
            a           sh:PropertyShape ;
            rdfs:label  "made by sensor"@en ;
            sh:path     [sh:inversePath sosa:madeObservation] ;
            sh:nodeKind sh:BlankNodeOrIRI ;
            sh:minCount 1 .
        
                ex:requiredLocationSensor
                    a              sh:NodeShape ;
                    sh:targetClass sosa:Sensor ;
                    sh:property    ex:requiredMadeObservation ;
                    sh:property    ex:requiredObserves ;
                    sh:property    ex:requiredIsHostedBy .
        
                    ex:requiredMadeObservation
                        a           sh:PropertyShape ;
                        rdfs:label  "made observation"@en ;
                        sh:path     sosa:madeObservation ;
                        sh:nodeKind sh:BlankNodeOrIRI ;
                        sh:minCount 1 .     
        
                    ex:requiredObserves
                        a           sh:PropertyShape ;
                        rdfs:label  "observes"@en ;
                        sh:path     sosa:observes ;
                        sh:node     ex:requiredObservableProperty ;
                        sh:nodeKind sh:BlankNodeOrIRI ;
                        sh:minCount 1 .
        
                        ex:requiredObservableProperty
                            a              sh:NodeShape ;
                            sh:targetClass sosa:ObservableProperty ;
                            sh:property    ex:requiredLabel .
        
                            ex:requiredLabel
                                a           sh:PropertyShape ;
                                rdfs:label  "label"@en ;
                                sh:path     rdfs:label ;
                                sh:nodeKind sh:Literal ;
                                sh:minCount 1 .
        
        
                    ex:requiredIsHostedBy
                        a           sh:PropertyShape ;
                        rdfs:label  "is hosted by"@en ;
                        sh:path     [sh:inversePath sosa:hosts] ;            
                        sh:nodeKind sh:BlankNodeOrIRI ;
                        sh:minCount 1 .
        
                        ex:requiredPlatform
                            a              sh:NodeShape ;
                            sh:targetClass sosa:Platform ;
                            sh:property    ex:requiredHosts.
        
                            ex:requiredHosts
                                a           sh:PropertyShape ;
                                rdfs:label  "host"@en ;
                                sh:path     sosa:hosts ;
                                sh:nodeKind sh:BlankNodeOrIRI ;
                                sh:minCount 1 .                       
        
        
        ex:requiredResultTime
            a           sh:PropertyShape ;
            rdfs:label  "result time"@en ;
            sh:path     sosa:resultTime ;
            sh:nodeKind sh:Literal ;
            sh:minCount 1 .
        `;
    // Send a PUT request to add SHACL
    await solidfetch(file, {
      method: 'PUT',
      headers: {'Content-Type': 'text/turtle'},
      body: query,
      credentials: 'include',
    });
  }
}
