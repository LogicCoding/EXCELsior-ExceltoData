// utility function to process query results for classes and properties
// res: list of objects from ParsingClient query result
function makeClassOrPropertyList( res ){
    var list = [];

    for(const row of res){
        let URI = row['URI'].value;
        let count = Number(row['count'].value);
        let label = null;
        if('label' in row){
          label = row['label'].value;               
        }

        // check if this class has already been added (in case of multiple labels)
        // i gets -1 if not found
        const i = list.findIndex(e => e['URI'] == URI);

        if( i == -1 ){
            let obj = {};
            obj['URI'] = URI;
            obj['count'] = count;
            obj['labels'] = [];
            if(label != null){
                obj['labels'].push(label);
            }
            
            list.push(obj);
        }
        else {
            list[i]['count'] += count;
            if(label != null){
                list[i]['labels'].push(label);
            }
        }
    }

    return list;
}

// utility function to combine properties into a single string formatted to be
// used in a query
// properties:  a list of strings of property names
function makePropertiesString( properties ){
    str = "<" + properties.join(">, <") + ">";

    return str;
}

const assert = function(condition, message) {
    if (!condition)
        throw Error('Assert failed: ' + (message || ''));
};

function isValidURL(string) {
  var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return (res !== null)
};

module.exports = { makeClassOrPropertyList, makePropertiesString};