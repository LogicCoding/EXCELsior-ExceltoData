import requests
query = {
    'endpointUrl': 'http://127.0.0.1:3030/firesat/query',
    'updateUrl': 'http://127.0.0.1:3030/firesat/update',
    'propertyWeUpdated': ['<http://bipm.org/jcgm/vim4#hasDoubleNumber>'],
    'instanceURIs': [
        '<http://opencaesar.io/examples/firesat/programs/earth-science/projects/firesat/workpackages/06/06/subsystems/eps/masses#BatteryPack1MassLimitConstraint>'
    ],
    'propertyValues': ['123214']
}

x = requests.post("http://localhost:3010/update", json=query)
print(x.json())
