const SparqlClient = require('sparql-http-client')

const endpointUrl = 'http://127.0.0.1:3030/firesat/sparql'
const query = `PREFIX fse:			<http://opencaesar.io/examples/firesat/disciplines/fse/fse#>
PREFIX base:		<http://imce.jpl.nasa.gov/foundation/base#>
PREFIX analysis: 	<http://imce.jpl.nasa.gov/foundation/analysis#>
PREFIX vim4: 		<http://bipm.org/jcgm/vim4#>
PREFIX mission: 	<http://imce.jpl.nasa.gov/foundation/mission#>

SELECT DISTINCT ?assembly ?id ?mass ?function ?contained_assembly

WHERE {
	?assembly a fse:Assembly ;									# match an assembly
	          base:hasIdentifier ?id ;							# match its id
	          analysis:isCharacterizedBy [						# match its mass
			  	vim4:hasDoubleNumber ?mass
			  ] ;
			  mission:performs ?function .						# match a function it performs
	OPTIONAL { ?assembly base:contains ?contained_assembly }	# match an assembly it contains
}`

const client = new SparqlClient({ endpointUrl });

(async function(){
  const stream = await client.query.select(query)

  stream.on('data', row => {
    Object.entries(row).forEach(([key, value]) => {
      console.log(`${key}: ${value.value} (${value.termType})`)
    })
  })

  stream.on('error', err => {
    console.error(err)
  })
})();