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


async function updateDB(client, propertyWeUpdated, instanceURIs, propertyValues){ 
    let parsed_and_formatted_values = "";

    for (let i = 0; i < instanceURIs.length; i++) {
        //!check that instances contains only URI
        //!check valid URI 
        parsed_and_formatted_values+=`(${instanceURIs[i]} "${propertyValues[i]}")\n`        
    }

    const query_insert = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>

        DELETE { graph ?g { ?instanceName ${propertyWeUpdated} ?oldAttribValue } } 
        INSERT { graph ?g { ?instanceName ${propertyWeUpdated} ?literal } }
        WHERE { graph ?g {
            values (?instanceName ?newAttribValue) { 
            ${parsed_and_formatted_values}
            }
            
            ?instanceName ${propertyWeUpdated} ?oldAttribValue
            BIND(DATATYPE(?oldAttribValue) AS ?dt)
            BIND(STRDT(?newAttribValue, ?dt) AS ?literal)
            }
        }
        `// removed: ?instanceName rdf:type ${req.body.class} .
        
        
    try {//this try catch may be unnecerssery since express catches results 
        const res = await client.query.update(query_insert);// returned undefined... hard to know if operation went through
        console.log(res);
    } catch (error) {
        console.error(error);
        throw new Error(error)
    }
    return {res: "the update went through succesfully."}
}


module.exports = { getClasses, getProperties, getItems, updateDB }