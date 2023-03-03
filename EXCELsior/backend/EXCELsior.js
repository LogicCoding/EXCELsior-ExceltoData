const SparqlClient = require('sparql-http-client/ParsingClient')

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


function makeClassOrPropertyList( res ){
    var list = [];

    for(const row of res){
        let URI = row['URI'].value;
        let count = Number(row['count'].value);
        let label = null;
        if('label' in row){
          label = row['label'].value;               
        }

        // check if this class has already been added (in case of multiple labels)
        // i gets -1 if not found
        const i = list.findIndex(e => e['URI'] == URI);

        if( i == -1 ){
            let obj = {};
            obj['URI'] = URI;
            obj['count'] = count;
            obj['labels'] = [];
            if(label != null){
                obj['labels'].push(label);
            }
            
            list.push(obj);
        }
        else {
            list[i]['count'] += count;
            if(label != null){
                list[i]['labels'].push(label);
            }
        }
    }

    return list;
}


async function getAllClasses(){
    // query to get all classes, their labels, and
    // the count of objects in that class
    var query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    
    SELECT DISTINCT (?class AS ?URI) ?label (COUNT(?obj) AS ?count)
    WHERE{
        ?class a owl:Class .
        ?obj a ?class .
        OPTIONAL{
            ?class rdfs:label ?label
        }
        FILTER( isIRI(?class) )
    }
    GROUP BY ?class ?label
    `;

    // setup return object
    var owlClasses = [];

    // execute query
    try{
        const res = await client.query.select(query);
        //console.log(res)
        owlClasses = makeClassOrPropertyList(res);
    }
    catch(error){
        console.log("ERROR: ", error)
    }

    return owlClasses;
}

// returns a list of properties given a class name
// properties are strings
async function getProperties( classURI ){
    var query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT DISTINCT (?prop AS ?URI) ?label (COUNT(?item) AS ?count)
    WHERE{
        ?item a <${classURI}> .
        ?item ?prop ?any .
        OPTIONAL{
            ?prop rdfs:label ?label
        }
        FILTER( ?prop not in (rdf:type))
    }
    GROUP BY ?prop ?label
    `;

    var properties = [];

    try{
        const res = await client.query.select(query);
        // console.log(res)
        properties = makeClassOrPropertyList(res);
    }
    catch(error){
        console.log("ERROR: ", error)
    }

    return properties;

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
async function getItems( classURI, propertiesList ){
    var propertiesStr = makePropertiesString(propertiesList);
    var query =`
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT *
    WHERE{
        ?id a <${classURI}> .
        ?id ?prop ?val
        FILTER( ?prop in (${propertiesStr}))
    }
    `;

    var items = [];

    try{
        const res = await client.query.select(query);
        for(const row of res){
            let id = row['id'].value;
            let prop = row['prop'].value;
            let val = row['val'].value;

            const i = items.findIndex(e => e['id'] == id);

            if(i == -1){
                let item = {};
                item['id'] = id;
                item[prop] = val;

                items.push(item)
            }
            else{
                items[i][prop] = val;
            }
        }
    }
    catch(error){
        console.log("ERROR: ", error)
    }
    
    return items;
}

// basic testing main function
async function main(){
    classes = await getAllClasses();
    //console.log(classes);   
    classURI = classes[1]['URI'];
    //console.log(classURI);
    properties = await getProperties( classURI );
    //console.log(properties);
    propList = [properties[0]['URI'], properties[1]['URI']]
    items = await getItems(classURI, propList);
    console.log(items)
}

main();
