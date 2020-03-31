const axios = require("axios");
const cheerio = require("cheerio");
const sf = require("sf");
const fs = require('fs');
const log = console.log;

// const getHtml = async () => {
//     try {
//         return await axios.get("https://www.khealth.or.kr/ncd/townJoinClinic/tjcList.do?pageNum=1&%C4%A3rowCnt=10&menuId=MENU01084&pageNum=2&rowCnt=10&tjc_sido=&tjc_sido_sub=&schType=0&schText=&upDown=0");
//     } catch (error) {
//         console.error(error);
//     }
// };

// getHtml()
//   .then(html => {
//     let dataList = [];
//     const $ = cheerio.load(html.data);
//     var bodyList = $("table.tstyle_list tbody").children("tr");

//     for( var row = 0; row < bodyList.length; row++ ) {
// 		var cells = bodyList.eq( row ).children( );
// 		var cols = {};

// 		// 열의 갯수만큼 반복문을 실행

// 		for( var column = 0; column < cells.length; column++ ) {
//             if (column == 1){
//                 cols.hospitalName = cells.eq( column ).text( );                    
//             }
//             else if (column == 2){
//                 cols.address = cells.eq( column ).text( );
//             }
//             else if (column == 3){
//                 cols.phone = cells.eq( column ).text( ); 
//             }
// 		}
// 		dataList.push( cols );
//     }
//     const data = dataList.filter(n => n.hospitalName);
//     return data;
//   })
//   .then(res => log(res));


//--------------------------------------------------------


// getBreeds()
//   .then(html => {
//     let dataList = [];
//     const $ = cheerio.load(html.data);
//     var bodyList = $("table.tstyle_list tbody").children("tr");

//     for( var row = 0; row < bodyList.length; row++ ) {
// 		var cells = bodyList.eq( row ).children( );
// 		var cols = {};

// 		// 열의 갯수만큼 반복문을 실행

// 		for( var column = 0; column < cells.length; column++ ) {
//             if (column == 1){
//                 cols.hospitalName = cells.eq( column ).text( );                    
//             }
//             else if (column == 2){
//                 cols.address = cells.eq( column ).text( );
//             }
//             else if (column == 3){
//                 cols.phone = cells.eq( column ).text( ); 
//             }
// 		}
// 		dataList.push( cols );
//     }
//     const data = dataList.filter(n => n.hospitalName);
//     return data;
//   })


const getHtml = async (url) => {
    try {
        return await axios.get(url);
    } catch (error) {
        console.error(error);
    }
};

const pathCheck = () => {
    let dirPath = 'output/chronic/';
    let isExists = fs.existsSync( dirPath );
    if( !isExists ) {
        fs.mkdirSync( dirPath, { recursive: true } );
    }
}

const getHospitalList = async () => {
    pathCheck();
    const url = "https://www.khealth.or.kr/ncd/townJoinClinic/tjcList.do?pageNum={0}";
    let dataList = [];
    for (var i = 48; i <= 48; i++) {
        const html = await getHtml(sf(url, i));        

        const $ = cheerio.load(html.data);
        var bodyList = $("table.tstyle_list tbody").children("tr");

        for(var row = 0; row < bodyList.length; row++) {
            var cells = bodyList.eq(row).children();
            var cols = {};

            for(var column = 0; column < cells.length; column++) {
                if (column == 1){
                    cols.hospitalName = cells.eq(column).text();                    
                }
                else if (column == 2){
                    cols.address = cells.eq(column).text();
                }
                else if (column == 3){
                    cols.phone = cells.eq(column).text(); 
                }
            }
            dataList.push(cols);
        }
        console.log(dataList.length);
        
    }

    const data = dataList.filter(n => n.address);
    var str = JSON.stringify(data);
    const HospitalList = "output/chronic/HospitalList.txt";
    fs.writeFile(HospitalList, str, function (err) { 
        if (err) 
            throw err; 
        console.log('The "data to writed" was writed to file!'); 
    });  
};

getHospitalList();