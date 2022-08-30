# LocationHistory App

The app [prototype](https://sindhu-vasireddy.github.io/LocationHistory/), let's the user capture their location from browser after logging in with their WebID and store their raw location data as RDF which is validated against a SHACL shape. The Users can also request location from other users using their webID. They can also approve/revoke the requests for sharing location from other users. 

The UML sequence diagrams explaining the app workflow is available along with the data model used to create the rdf location data in UML and vocab folders.

This prototype is developed as part of the SOLIDLAB Research Challenge [#10](https://github.com/SolidLabResearch/Challenges/issues/10). 

## To Run the app locally:
1. Clone the Repository.
2. Install the node dependencies using:
                ```npm ci```
4. Generate the webpack bundle using: 
            ```npm run build```
6. Start the server using: 
            ```npm start```

### Note:- 
A. Enter your webid to login to your pod
e.g. (https://data.knows.idlab.ugent.be/person/SindhuVasireddy/#me) 
B. This is a work in progress, the prototype is being added with additional features continously.
