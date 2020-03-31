const fs = require('fs');
var json2xls = require('json2xls');

const OUTPUT = "output/nonSmoking/";
const MERGEDIR = "mergeData/";
const DATA = "Data/";
const FILENAME = "nonSmokingHospitalList.xlsx";

exports.mergeData = function (){
    let fileList = fs.readdirSync(OUTPUT + DATA);
    let DataList = [];

    fileList.forEach(fileName => {
        let str = fs.readFileSync(OUTPUT + DATA + fileName, 'utf8');
        let jsonData = JSON.parse(str);
        jsonData.forEach(data => {
            DataList.push(data);
        });
    });

    if (DataList.length > 0){
        let xls = json2xls(DataList);
        fs.writeFile(OUTPUT + MERGEDIR + FILENAME, xls, 'binary', function(err){
            if (err)
                console.log(err);
            console.log('Merge Success!');
        })
    }
    else
        console.log('EMPTY DATA!');
}