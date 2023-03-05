const { getClasses, getProperties, getItems, updateDB } = require('./queries.js');

const express = require('express');
const SparqlClient = require('sparql-http-client/ParsingClient');


const app = express();
app.use(express.json())
const port = 3010;

app.get('/classes', async (req, res) => {
    const endpointUrl =  req.body.endpointUrl;

    const client = new SparqlClient({ endpointUrl });
    const classes = await getClasses(client);

    res.json(classes);
});

app.get('/properties', async (req, res) => {
    const endpointUrl =  req.body.endpointUrl;
    const classURI = req.body.classURI;

    const client = new SparqlClient({ endpointUrl });
    const properties = await getProperties(client, classURI);

    res.json(properties);
});

app.get('/csv', async (req, res) => { //getCSV
    const endpointUrl = req.body.endpointUrl;
    const classURI = req.body.classURI;
    const properties = req.body.properties;

    const client = new SparqlClient({ endpointUrl });
    const items = await getItems(client, classURI, properties);

    res.json(items);

    // can use res.download for actual CSV
});

//CSV is currently parsed on the frontend. 
//This allows us to let the user know if there are any issues before they send to DB 
app.post('/update', async (req, res) => { 
    //const classURI = req.body.classURI; //we technically don't need the classURI. It's just for checking? 
    const endpointUrl = req.body.endpointUrl;
    const updateUrl = req.body.updateUrl;
    const propertyWeUpdated = req.body.propertyWeUpdated; 
    const instanceURIs = req.body.instanceURIs; //! assuming subjects are not blank nodes //these are the instances we will be updating
    const propertyValues = req.body.propertyValues; //these are the p 

    //!error checking? 
     
    //express now catches errors on its own https://expressjs.com/en/guide/error-handling.html
   
    try {
        console.log(propertyWeUpdated, instanceURIs, propertyValues);
        if (instanceURIs.length !== propertyValues.length ) {
        //throw some error
            throw new Error("instanceURIs and propertyValues must have the same length")
        }

        const client = new SparqlClient({ endpointUrl, updateUrl });    
        const updateRes = await updateDB(client, propertyWeUpdated, instanceURIs, propertyValues);

        res.json(updateRes);        
    } catch (error) {
        throw new Error(error)         
    }

    // can use res.download for actual CSV
});

app.listen(port, () => {
  console.log(`EXCELsior listening on port ${port}`)
});