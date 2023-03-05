const { getClasses, getProperties, getItems , updateDB} = require('./queries.js');
const { RequestError, errorHandler } = require('./errors');
const { makeErrorMessage } = require('./utils');

const express = require('express');
const SparqlClient = require('sparql-http-client/ParsingClient');


const app = express();
const port = 3010;

// Middleware
app.use(express.json()) // JSON parser

// Routes
app.get('/classes', async (req, res, next) => {
    let errMsg = makeErrorMessage(req, ['endpointUrl']);
    if(errMsg != null){
        next(new RequestError(errMsg));
    }

    const endpointUrl =  req.body.endpointUrl;

    const client = new SparqlClient({ endpointUrl });
    try{
        const classes = await getClasses(client);
        res.status(200).json(classes);
    }
    catch(error){
        next(error);
    }
});

app.get('/properties', async (req, res, next) => {
    let errMsg = makeErrorMessage(req, ['endpointUrl', 'classURI']);
    if(errMsg != null){
        next(new RequestError(errMsg));
    }

    const endpointUrl =  req.body.endpointUrl;
    const classURI = req.body.classURI;

    const client = new SparqlClient({ endpointUrl });
    try{
        const properties = await getProperties(client, classURI);
        res.status(200).json(properties);
    }
    catch(error){
        next(error);
    }
});

app.get('/csv', async (req, res, next) => {
    let errMsg = makeErrorMessage(req, ['endpointUrl', 'classURI', 'properties']);
    if(errMsg != null){
        next(new RequestError(errMsg));
    }

    const endpointUrl = req.body.endpointUrl;
    const classURI = req.body.classURI;
    const properties = req.body.properties;

    const client = new SparqlClient({ endpointUrl });
    try{
        const items = await getItems(client, classURI, properties);
        // can use res.download for actual CSV
        res.json(items);
    }
    catch(error){
        next(error);
    }
});

// Error Handling
app.use(errorHandler);

// Start Server
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