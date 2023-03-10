//import { Parser } from '@json2csv/plainjs';
const { Parser } = require('json2csv');

//Uses https://www.npmjs.com/package/@json2csv/plainjs

function jsonToExcel(obj) {
    const parser = new Parser({ delimiter: ','})
    const csv = parser.parse(obj)
    console.log(csv)
    return csv
}

// Convert csv file to array of objects
function processCSV( csv_str, propertiesMap = null ){
    // convert all linebreaks to \n
    csv_str = csv_str.replace(/\r?\n|\r/g, '\n');

    const csv_lines = csv_str.trim().split('\n');

    let headers = csv_lines[0].split(',');

    if(propertiesMap != null){
        headers.forEach((header, i) => {
            if(header in propertiesMap){
                headers[i] = propertiesMap[header];
            }
        })
    }

    let items = []
    for(const line of csv_lines.slice(1)){
        let vals = line.split(',');
        let item = {};
        vals.forEach((val, i) => item[headers[i]] = val.trim());
        items.push(item);       
    }

    return items;
}

module.exports = { processCSV, jsonToExcel }