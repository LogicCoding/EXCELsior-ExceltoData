//* this file is means for Matan's tinkering, trying to figure out how to update*/

const ParsingClient = require('sparql-http-client/ParsingClient')

// set up sparql client
const SparqlClientOptions = {
    endpointUrl : 'http://127.0.0.1:3030/firesat/query' , 
    updateUrl : 'http://127.0.0.1:3030/firesat/update'
}
const client = new ParsingClient(SparqlClientOptions);

async function main(){

    const query_insert = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>

        DELETE { graph ?g {?instance <http://purl.org/dc/elements/1.1/rights> ?oldValue} } 
        INSERT { graph ?g { ?instance <http://purl.org/dc/elements/1.1/rights> ?newValue } }
        WHERE { graph ?g {
            values (?oldValue ?newValue) { 
            ('Copyright 1995-2019 DCMI. (or something like that)' 'Copyright 1995-2019 DCMI.')
            ('all rights reserved to GnarlyMshtep! (cuz\\' he\\'s cool and stuff)' 'all rights reserved to GnarlyMshtep!')
            }
            ?instance rdf:type <http://www.w3.org/2002/07/owl#Ontology> . 
            ?subject <http://purl.org/dc/elements/1.1/rights> ?oldValue
            }
        }
        `
    try {
        const res = await client.query.update(query_insert);
        console.log(res);
    } catch (error) {
        console.log("ERROR: ", error);
    }
    //const bindings = await client.query.select(query)
    
} 

main();