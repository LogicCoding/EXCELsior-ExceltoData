### Matan's Todo
- make succesful automated JS query 
- consider how to handle number literals and what needs to be manually escaped
- mark things in GitHub tasks

### Matan's Open questions
- which graph do we update to? do we want to let the user choose? update all? 
- can we get output in CSV format with no conversion? 
- why is the following query (from Bryce's API calls) not returning any tripples for me? 
    ```
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT DISTINCT (?prop AS ?URI) ?label (COUNT(?item) AS ?count)
        WHERE{
            ?item a <http://openceaser.io/examples/firesat/disciplines/fse/fse#Assembly> .
            ?item ?prop ?any .
            OPTIONAL{
                ?prop rdfs:label ?label
            }
            FILTER( ?prop not in (rdf:type))
        }
        GROUP BY ?prop ?label
    ```
- **what should we do about blank nodes** https://www.w3.org/TR/rdf11-concepts/#dfn-blank-node 


## Learning Fuseki `UPDATE`

### Inserting to DB and checking DB (and checking)
this query adds an element to the database, to a particular graph **not sure what that means?**
```
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
    
INSERT DATA{
 	GRAPH <http://openceaser.io/examples/firesat/disciplines/fse/fse>{
 	 rdf:test a owl:Class
	}
}
```
fuseki responds
```
Update succeeded
```
Then, with this **Query 1**, we can check and see that the element is in the database 
```
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
    
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?s ?p ?o 
WHERE {
  rdf:test ?p ?o
}
```
Fuski responds with 
```csv
s,p,o
,http://www.w3.org/1999/02/22-rdf-syntax-ns#type,http://www.w3.org/2002/07/owl#Class
```
in CSV formatted response.

### Deleting from DB and checking 
The following query to the `/update` route can be used to delete data. It can be checked with *Query 1*. 

```
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
    
DELETE DATA{
 	GRAPH <http://openceaser.io/examples/firesat/disciplines/fse/fse>{
 	 rdf:test a owl:Class
	}
}
```

### Updating DB and checking 
(This section)[https://www.w3.org/TR/sparql11-update/#deleteInsert] of the SPARQL Update 1.1 query language discusses an atomic delete and then insert (equating to update). It is atomic in the sense that if one of the queries fails, not update to the database should be done

The following example renames our `rdf:test` element to `rdf:tasty`. We check this using *Query 1*.
```
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

WITH <http://openceaser.io/examples/firesat/disciplines/fse/fse>
DELETE {rdf:test ?p ?o}
INSERT {rdf:tasty ?p ?o}
WHERE
  { rdf:test ?p ?o
  } 
``` 

### Building up towards updating a particular attribute of a particular instance of a particular class
- try to update the a particular attribute of a given class
  - try to get a class name
    - use `<http://www.w3.org/2002/07/owl#Ontology>` which has 109 instances. Found with 
        ```
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT DISTINCT ?s ?p ?o
        WHERE{
            ?s rdf:type <http://www.w3.org/2002/07/owl#Ontology>
        }
        ```
  - try to get all of its attributes/properties
    - use `<http://purl.org/dc/elements/1.1/rights>` which got with 
    ```
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT DISTINCT ?p 
    WHERE{
        ?s rdf:type <http://www.w3.org/2002/07/owl#Ontology> . 
        ?s ?p ?o
    }
    ```
    - this means that not eveyr object of type `<http://www.w3.org/2002/07/owl#Ontology>` will have `<http://purl.org/dc/elements/1.1/rights>`, I might need to put it in optional  
  - try to get `instanceOfSelectedClass, rights` pairs 
        ```
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT DISTINCT ?instance ?rights 
        WHERE{
            ?instance rdf:type <http://www.w3.org/2002/07/owl#Ontology> . 
            ?instance <http://purl.org/dc/elements/1.1/rights> ?rights
        }
        ``` 
  - try to update
    - updating the rights of `<http://bipm.org/jcgm/vim4>` which originally had rights `Copyright 2021, by the California...` to `all rights reserved to GnarlyMshtep` works. Notice that we use `graph ?g` to update across all graphs (we don't know which graph things are coming from. I think query automatically queries all graphs)
      ```
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>


      DELETE { graph ?g {<http://bipm.org/jcgm/vim4> <http://purl.org/dc/elements/1.1/rights> ?rights} }
      INSERT { graph ?g {<http://bipm.org/jcgm/vim4> <http://purl.org/dc/elements/1.1/rights> "all rights reserved to GnarlyMshtep!"} }
      WHERE{ 
        graph ?g {
          ?instance rdf:type <http://www.w3.org/2002/07/owl#Ontology> . 
          <http://bipm.org/jcgm/vim4> <http://purl.org/dc/elements/1.1/rights> ?rights
        }
      }
      ```
      - checked via the previous query


### Given `class`, `attribute` where some instances of class have attribute `attribute` update the values of `attribute` to a given list
- one option is to repeat the single item attribute update above. 
- yah, I'll just programatically generate it
- check that multiple updates work
  ```
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>

  DELETE { graph ?g {?instance <http://purl.org/dc/elements/1.1/rights> ?oldValue} } 
  INSERT { graph ?g { ?instance <http://purl.org/dc/elements/1.1/rights> ?newValue } }
  WHERE { graph ?g {
        values (?oldValue ?newValue) { 
        ('Copyright 1995-2019 DCMI.' 'Copyright 1995-2019 DCMI. (or something like that)')
        ('all rights reserved to GnarlyMshtep!' 'all rights reserved to GnarlyMshtep! (cuz\' he\'s cool and stuff)')
        }
      ?instance rdf:type <http://www.w3.org/2002/07/owl#Ontology> . 
      ?subject <http://purl.org/dc/elements/1.1/rights> ?oldValue
    }
  }
  ```
- the above is a better way to do it then I had in mind and is due to (this post)[https://stackoverflow.com/questions/10078966/multiple-sparql-insert-where-queries-in-a-single-request]
- generating this programatically...

### Working with datatype
thsi query can return some datatypes
```
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?sub ?pred ?t WHERE {
  ?sub ?pred ?obj .
  BIND(DATATYPE(?obj) AS ?t) 
#  ?t rdf:type xsd:double .
} LIMIT 1000
```
this query can append datatypes to literals
```
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

DELETE { GRAPH ?g { ?instanceName rdfs:label ?oldAttribValue . } } 
INSERT { GRAPH ?g { ?instanceName rdfs:label ?literal . } }
WHERE { GRAPH ?g {
    values (?instanceName ?newAttribValue) {
      (<http://imce.jpl.nasa.gov/foundation/mission#TraversingElement> "Presenting Element")
      (<http://imce.jpl.nasa.gov/foundation/mission#SpecifiedElement>  "Specified Element")
    }
    ?instanceName rdfs:label ?oldAttribValue .
    BIND(DATATYPE(?oldAttribValue) AS ?dt)
    BIND(STRDT(?newAttribValue, ?dt) AS ?literal)
}}
```
