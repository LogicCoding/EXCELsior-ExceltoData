const { getClasses, getProperties, getItems , updateDB} = require('./queries.js');
const { processCSV } = require('./csv.js')
const { RequestError, errorHandler } = require('./errors');
const { makeErrorMessage } = require('./utils');

const express = require('express');
const multer = require('multer');
const SparqlClient = require('sparql-http-client/ParsingClient');

const app = express();
const port = 3010;

// Middleware
app.use(express.json()) // JSON parser
const upload = multer({storage: multer.memoryStorage()}); // file upload, only used on /update route

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

//CSV is currently parsed on the frontend. 
//This allows us to let the user know if there are any issues before they send to DB 
app.post('/update', upload.single("csv_file"), async (req, res, next) => {
    let errMsg = makeErrorMessage(req, ["updateUrl", "file"]);
    if(errMsg != null){
        //next(new RequestError(errMsg));
    }

    const updateUrl = req.body.updateUrl;

    var propertiesMap = null;
    if(Object.hasOwn(req.body, "propertiesMap")){
        propertiesMap = JSON.parse(req.body.propertiesMap);
    }

    const csv_file = req.file;
    const csv_str = csv_file.buffer.toString();
    const items = processCSV(csv_str, propertiesMap);

    try {
        const client = new SparqlClient({ updateUrl });    
        const updateRes = await updateDB(client, items);

        res.status(200).json(updateRes);        
    } catch (error) {
        next(error)         
    }

});

// Error Handling
app.use(errorHandler);

// Start Server
app.listen(port, () => {
  console.log(`EXCELsior listening on port ${port}`)
});