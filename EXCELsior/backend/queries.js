const { makeClassOrPropertyList, makePropertiesString } = require('./utils.js');

async function getClasses( client ){
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
    const res = await client.query.select(query);
    owlClasses = makeClassOrPropertyList(res);


    return owlClasses;
}

// returns a list of properties given a class name
// properties are strings
async function getProperties( client, classURI ){
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

    const res = await client.query.select(query);
    properties = makeClassOrPropertyList(res);

    return properties;
}

// gets values of all given properties for all objects
// of given class name
async function getItems( client, classURI, propertiesList ){
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
    
    return items;
}

module.exports = { getClasses, getProperties, getItems }