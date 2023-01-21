# Project Name: Excel-to-Data Interface

## Group Name: EXCELsior (B4)

### Group Members: Alonzo Murrieta, Bryce Stulman, Jaime Perez, Matan Shtepel, Shriniketh Narayana

Motivation/Concept:
	We have chosen the 6th project (Excel-to-Database Interface) from the proposed list of project ideas provided by our professor, which are relevant to the open-source project openCAESAR. The idea is that Excel, which is used by a lot of people around the world, can be used as a sort of database, albeit a lightweight one. This is because each Excel sheet is essentially a table with rows and columns, which in a way can represent instances and attributes, respectively. The problem that arises (and the reason why an excel-to-database interface is needed) is that users can not really make complex queries on multiple sheets to get information, which necessarily negates Excel as a database. 
	As such, we will create a web application that will allow a user to take an Excel sheet and essentially be able to send it to a Fuseki graph database as a database itself, in order to then be able to query the Excel sheet (now in RDF format) for whatever information they want. The web app will then be able to export an Excel sheet from the database and allow the user to edit it. In general, the idea would be to let the user specify a mapping that matches the dataset schema used by the desired database, but we will be focusing on the RDF format to use Fuseki (our database server) and query the database using SPARQL.
	This is all per the specs given to us by professor Maged Elaasar (below):
  
Excel is arguably the most used tool on the planet. It is used by many users to store all kinds of
information. One of the reasons for that is that Excel can be thought of as a lightweight
database. Each sheet in Excel can be thought of as a table, where the rows represent instances
of a given concept (e.g., Student), and the columns represent attributes (e.g., name, SID, email,
etc.) of that concept. However, one downside of thinking of Excel as a database is that it is not
easy to write complex queries that get information across multiple sheets that are related.
On the other hand, databases are meant to store a lot of information and make it very easy to
query. One type of databases are graph databases which are particularly useful when the
information represented is heavily structured and has many inter relationships. For example,
Fuseki os a popular open-source graph database web server that supports representing
information using the standard RDF format (triples: subject, predicate, object) and querying
them using the standard SPARQL language.
In this project, you will develop a web application that allows a user to specify a mapping
between an Excel spreadsheet and a graph database. This will allow your application to a)
import an Excel spreadsheet as a database to simplify queries on its data, and b) to export an
Excel spreadsheet from a database such that it can be edited by a user and then read back in to
update the database. The specified mapping uses the dataset schema used by the database to
enable the user to be specific about the mapping.
