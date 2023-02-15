const SparqlClient = require('sparql-http-client');

// set up spaql client
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

// query to get all classes
//
// TODO: return results instead of print
async function getAllClasses(){
    query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT DISTINCT ?type
    WHERE{
        ?s a ?type .
    }
    `;

    const stream = await client.query.select(query);

    printResults(stream);
}

// returns a list of properties given a class name
// properties are strings
async function getProperties( class_name ){
    query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT DISTINCT ?prop
    WHERE{
        ?item a <${class_name}> .
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
        })

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

// gets value of all given properties for all objects
// of given class name
//
// TODO: see if there is someway to get results in
// JSON format or something more useful than
// ID PROP VAL with many rows per ID
//
// TODO: return well formatted results instead of just
// printing
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
    `;

    const stream = await client.query.select(query);

    printResults(stream);
}

// basic testing main function
async function main(){
    getAllClasses();
    className = "http://opencaesar.io/examples/firesat/disciplines/fse/fse#Assembly";
    properties = await getProperties( className );
    //console.log(properties);
    getItems(className, properties)
}

main();
