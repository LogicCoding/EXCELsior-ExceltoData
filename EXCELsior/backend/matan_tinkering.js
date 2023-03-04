//* this file is means for Matan's tinkering, trying to figure out how to update*/

const ParsingClient = require('sparql-http-client/ParsingClient')

// set up sparql client
const SparqlClientOptions = {
    endpointUrl : 'http://127.0.0.1:3030/firesat/sparql' , 
    updateUrl : 'http://127.0.0.1:3030/firesat/sparql'
}
const client = new ParsingClient(SparqlClientOptions);

async function main(){

    const query = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        
        SELECT DISTINCT ?type ?label (COUNT(?obj) AS ?count)
        WHERE{
            ?type a owl:Class .
            ?obj a ?type .
            OPTIONAL{
                ?type rdfs:label ?label
            }
            FILTER( isIRI(?type) )
        }
        GROUP BY ?type ?label
        LIMIT 1
        `;

    const query_insert = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        INSERT DATA
        { 
            rdf:test a owl:Class
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