const { getClasses, getProperties, getItems , updateDB} = require('./queries.js');
const { processCSV } = require('./csv.js')
const { jsonToExcel } = require('./csv.js')
const { RequestError, errorHandler } = require('./errors');
const { makeErrorMessage } = require('./utils');

const express = require('express');
const cors = require('cors')
const multer = require('multer');
const SparqlClient = require('sparql-http-client/ParsingClient');

const app = express();
const port = 3010;

// Middleware
app.use(express.json()) // JSON parser
app.use(cors()) // Cross Origin Resource Sharing
const upload = multer({storage: multer.memoryStorage()}); // file upload, only used on /update route

// Routes

/** Given the endpoint url, get all classes associated 
with that endpoint. 
*/
app.get('/classes', async (req, res, next) => {
    //console.log(req.headers)
    //console.log(req.body)
    //console.log(req.params)
    //console.log(req.query)
    // let errMsg = makeErrorMessage(req, ['endpointUrl']);
    // if(errMsg != null){
    //     return next(new RequestError(errMsg));
    // }

    const endpointUrl =  req.query.endpointUrl;
    //console.log(endpointUrl)
    const client = new SparqlClient({ endpointUrl });
    try{
        const classes = await getClasses(client);
        //console.log(classes)
        res.status(200).json(classes);
    }
    catch(error){
        return next(error);
    }
});

/** 
*Given the endpoint url, and a class, get all
*properties associated with that class at that 
*endpoint.
*/ 
app.get('/properties', async (req, res, next) => {
    let errMsg = makeErrorMessage(req, ['endpointUrl', 'classURI']);
    if(errMsg != null){
        return next(new RequestError(errMsg));
    }

    const endpointUrl =  req.body.endpointUrl;
    const classURI = req.body.classURI;

    const client = new SparqlClient({ endpointUrl });
    try{
        const properties = await getProperties(client, classURI);
        res.status(200).json(properties);
    }
    catch(error){
        return next(error);
    }
});


/** 
*Given the endpoint URL of a fuseki server, the class uri
*and a selection of properties, get send a csv file 
*converted from that information as an attachment that can
*be downloaded.
*/  
app.get('/csv', async (req, res, next) => {
    let errMsg = makeErrorMessage(req, ['endpointUrl', 'classURI', 'properties']);
    if(errMsg != null){
        return next(new RequestError(errMsg));
    }

    const endpointUrl = req.body.endpointUrl;
    const classURI = req.body.classURI;
    const properties = req.body.properties;

    const client = new SparqlClient({ endpointUrl });
    try{
        const items = await getItems(client, classURI, properties);
        // can use res.download for actual CSV
        const csvFile = jsonToExcel(items);
        res.set({"Content-Disposition":"attachment; filename=excelsiorData.csv"});
        res.send(csvFile);
        //res.json(items);
        
    }
    catch(error){
        return next(error);
    }
});

//CSV is currently parsed on the frontend. 
//This allows us to let the user know if there are any issues before they send to DB 

/** 
*Given the update url, update with the csv file given.
*/ 
app.post('/update', upload.single("csv_file"), async (req, res, next) => {
    let errMsg = makeErrorMessage(req, ["updateUrl"]);
    if(errMsg != null){
        return next(new RequestError(errMsg));
    }

    if(!(Object.hasOwn(req, "file"))){
        return next(new RequestError("No file uploaded"));
    }
    
    const updateUrl = req.body.updateUrl;

    let propertiesMap = null;
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
       return next(error)         
    }

});

// Error Handling
app.use(errorHandler);

// Start Server
app.listen(port, () => {
  console.log(`EXCELsior listening on port ${port}`)
});