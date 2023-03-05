import requests
query = {
    'endpointUrl': 'http://127.0.0.1:3030/firesat/query',
    'updateUrl': 'http://127.0.0.1:3030/firesat/update',
    'propertyWeUpdated': ['<http://purl.org/dc/elements/1.1/rights>'],
    'instanceURIs': [
        '<http://imce.jpl.nasa.gov/foundation/project>', '<http://purl.org/dc/elements/1.1>'
    ],
    'propertyValues': ['yoyo1 project', 'yoyo purl']
}

x = requests.post("http://localhost:3010/update", json=query)
print(x.json())
