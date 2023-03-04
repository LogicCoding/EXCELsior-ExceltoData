const { getClasses, getProperties, getItems } = require('./queries.js');

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

app.get('/csv', async (req, res) => {
    const endpointUrl = req.body.endpointUrl;
    const classURI = req.body.classURI;
    const properties = req.body.properties;

    const client = new SparqlClient({ endpointUrl });
    const items = await getItems(client, classURI, properties);

    res.json(items);

    // can use res.download for actual CSV
});

app.listen(port, () => {
  console.log(`EXCELsior listening on port ${port}`)
});