const { Parser } = require('json2csv');

//Uses https://www.npmjs.com/package/@json2csv/plainjs
function jsonToExcel(obj) {
    const parser = new Parser({ delimiter: ','})
    const csv = parser.parse(obj)
    console.log(csv)
    return csv
}
module.exports = { jsonToExcel }