//* this file is means for Matan's tinkering, trying to figure out how to update*/

const ParsingClient = require('sparql-http-client/ParsingClient');
const { isValidURL } = require('./utils');
//const {assert} = require('utils.js')
// set up sparql client
const SparqlClientOptions = {
    endpointUrl : 'http://127.0.0.1:3030/firesat/query' , 
    updateUrl : 'http://127.0.0.1:3030/firesat/update'
}
const client = new ParsingClient(SparqlClientOptions);

async function main(){
    //! notice it was necessery to escape '
    const req = {
        body : {
            class: '<http://www.w3.org/2002/07/owl#NamedIndividual>', 
            attribute: '<http://bipm.org/jcgm/vim4#hasDoubleNumber>',
            instances : [
                '<http://opencaesar.io/examples/firesat/programs/earth-science/projects/firesat/workpackages/06/06/subsystems/eps/masses#BatteryPack1MassLimitConstraint>'
            ],
            newAttrib : [
                '6.9696969'
            ] 
        }
    }

    if (req.body.instances.length !== req.body.newAttrib.length ) {
        //throw some error
        console.log("old and new must have the same length");
    }

    let parsed_and_formatted_values = "";

    for (let i = 0; i < req.body.instances.length; i++) {
        //!check that instances contains only URI
        //!check valid URI 
        parsed_and_formatted_values+=`(${req.body.instances[i]} "${req.body.newAttrib[i]}")\n`        
    }
    //console.log(parsed_and_formatted_values);

    const query_insert = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>

        DELETE { graph ?g { ?instanceName ${req.body.attribute} ?oldAttribValue } } 
        INSERT { graph ?g { ?instanceName ${req.body.attribute} ?literal } }
        WHERE { graph ?g {
            values (?instanceName ?newAttribValue) { 
            ${parsed_and_formatted_values}
            }
            ?instanceName rdf:type ${req.body.class} . 
            ?instanceName ${req.body.attribute} ?oldAttribValue
            BIND(DATATYPE(?oldAttribValue) AS ?dt)
            BIND(STRDT(?newAttribValue, ?dt) AS ?literal)
            }
        }
        `
        console.log(query_insert);
    try {
        const res = await client.query.update(query_insert);// returned undefined... hard to know if operation went through
        console.log(res);
    } catch (error) {
        console.log("ERROR: ", error);
    }
    //const bindings = await client.query.select(query)
    
} 

main();

/**tested with: 
 * 
 * PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT ?sub ?pred ?obj ?t WHERE {
  <http://opencaesar.io/examples/firesat/programs/earth-science/projects/firesat/workpackages/06/06/subsystems/eps/masses#BatteryPack1MassLimitConstraint> <http://bipm.org/jcgm/vim4#hasDoubleNumber> ?obj .
  BIND(DATATYPE(?obj) AS ?t) 
#  ?t rdf:type xsd:double .
} LIMIT 1000


 */