const SparqlClient = require('sparql-http-client');

// set up sparql client
const endpointUrl = 'http://127.0.0.1:3030/firesat/sparql';
const client = new SparqlClient({ endpointUrl });

// utility function to print results from stream
function printResults( stream ){
    stream.on('data', row => {
        Object.entries(row).forEach(([key, value]) => {
          console.log(`${key}: ${value.value} (${value.termType})`);
        })
      })
    
      stream.on('error', err => {
        console.error(err);
      })
}

// query to get all classes, their labels, and
// the count of objects in that class
async function getAllClasses(){
    query = `
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
    `;

    const stream = await client.query.select(query);

    const results = new Promise((resolve, reject) => {
        let res = {}

        stream.on('data', row => {
            className = row['type'].value;
            count = row['count'].value;

            if( !(className in res) ){
                res[className] = {};
                res[className]['count'] = count;
            }
            else{
                res[className]['count'] += count;
            }

            if('label' in row){
                if ( !('label' in res[className]) ){
                    res[className]['label'] = [];
                }

                res[className]['label'].push(row['label'].value);               
            }
        });        

        stream.on('end', function (){
            resolve(res);
        });

        stream.on('error', err => {
            reject(err);
        });

    });

    res = await results;

    return res;
}

// returns a list of properties given a class name
// properties are strings
//
// TODO: Make this an object? Split properties based on
// what type of values they have? (literal vs not?)
async function getProperties( className ){
    query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT DISTINCT ?prop
    WHERE{
        ?item a <${className}> .
        ?item ?prop ?any .
        FILTER( ?prop not in (rdf:type))
    }
    `;

    const stream = await client.query.select(query);

    // to get results we need to let the stream listener
    // handle all of the data from the query
    // Promise resolves at end of results, rejects on error
    //
    // TODO: add error handling
    const results = new Promise((resolve, reject) => {
        let res = [];

        stream.on('data', row => {
            Object.entries(row).forEach(([key, value]) => {
                res.push(value.value);
            })
        });

        stream.on('end', function (){
            resolve(res);
        });

        stream.on('error', err => {
            reject(err);
        });
    });
 
    // wait for promise to resolve before returning
    res = await results;
    return res;

}

// utility function to combine properties array
// of strings into a single string formatted to
// be used in a query
function makePropertiesString( properties ){
    str = "<" + properties.join(">, <") + ">";

    return str;
}

// gets values of all given properties for all objects
// of given class name
async function getItems( className, properties ){
    propertiesStr = makePropertiesString(properties);
    query =`
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT *
    WHERE{
        ?id a <${className}> .
        ?id ?prop ?val
        FILTER( ?prop in (${propertiesStr}))
    }

    LIMIT 50
    `;

    const stream = await client.query.select(query);

    const results = new Promise((resolve, reject) =>{
        let res = {};

        stream.on('data', row => {
            id = row["id"].value
            prop = row["prop"].value
            val = row["val"].value
            
            if(!(id in res)){
                res[id] = {}
            }
            
            if(!(prop in res[id])){
                res[id][prop] = [] 
            }
    
            res[id][prop].push(val);
        })

        stream.on('end', function (){
            resolve(res);
        });

        stream.on('error', err => {
            reject(err);
        });
        
    
    });

    res = await results;
    return res;
}

// basic testing main function
async function main(){
    classes = await getAllClasses();
    console.log(classes);
    className = Object.keys(classes)[0]
    properties = await getProperties( className );
    console.log(properties);
    items = await getItems(className, properties)
    console.log(items)
}

main();
