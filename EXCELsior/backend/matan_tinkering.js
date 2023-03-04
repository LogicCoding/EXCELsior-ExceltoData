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
            class: '<http://www.w3.org/2002/07/owl#Ontology>', 
            attribute: '<http://purl.org/dc/elements/1.1/rights>',
            instances : [
                '<http://bipm.org/jcgm/vim4>',  '<http://purl.org/dc/elements/1.1>'
            ],
            newAttrib : [
                'Copyright 1995-2019 DCMI (JS\')',  'all rights reserved to GnarlyMshtep! (JS\')'
            ] 
        }
    }

    //let test = 'Copyright 1995-2019 DCMI (JS\')'
    //test.replace("\'", "matan rules!")
    //console.log("TEST", test.replace("'", `\\\\'`), "\n\n");

    if (req.body.instances.length !== req.body.newAttrib.length ) {
        //throw some error
        console.log("old and new must have the same length");
    }
    //!check that instances contains only URI
    //!check valid URI 

    let parsed_and_formatted_values = "";

    for (let i = 0; i < req.body.instances.length; i++) {
        req.body.newAttrib[i] = req.body.newAttrib[i].replace(`'`, `\\'`); // an instance must be an URI and hence will not have any illegal chars
        //if (!(isValidURL(req.body.instances[i]))) {
        //    console.error('got invalid URI', i);
        //}
        //req.body.newAttrib[i] = `'${req.body.newAttrib[i]}'`
                
        parsed_and_formatted_values+=`(${req.body.instances[i]} '${req.body.newAttrib[i]}')\n`        
    }
    console.log(parsed_and_formatted_values);

    const query_insert = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>

        DELETE { graph ?g { ?instanceName ${req.body.attribute} ?oldAttribValue } } 
        INSERT { graph ?g { ?instanceName ${req.body.attribute} ?newAttribValue } }
        WHERE { graph ?g {
            values (?instanceName ?newAttribValue) { 
            ${parsed_and_formatted_values}
            }
            ?instanceName rdf:type ${req.body.class} . 
            ?instanceName ${req.body.attribute} ?oldAttribValue
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