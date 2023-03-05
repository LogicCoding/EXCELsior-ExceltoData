const { getClasses, getProperties, getItems } = require('./queries.js');
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
app.listen(port, () => {
  console.log(`EXCELsior listening on port ${port}`)
});