const axios = require("axios");
const qs = require('querystring');
const sf = require("sf");
const fs = require('fs');
const func = require('./mergeData');

const OUTPUTDIR = "output/nonSmoking/Data";
const FILENAME = "nonSmokingHospitalList{0}.txt";

const getHtml = async (Murl, MPageNum) => {
    const requestBody = {
        searchType: 'hpNoSmoking',
        pageNum: MPageNum
    } 
       
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    try {
        return await axios.post(Murl, qs.stringify(requestBody), config);
    } catch (error) {
        console.error('ERR PAGENUM : ' + MPageNum);
    }
};

const getHospitalList = async (CstartPage, ClastPage, callback) => {
    const url = "https://hi.nhis.or.kr/ca/ggpca001/ggpca001_p06.do";
    let hospitalList = [];
    let hospitalData = {};
    for (var pageNum=CstartPage; pageNum<=ClastPage; pageNum++){
        const html = await getHtml(url, pageNum);
        if (typeof html == 'undefined')
            continue;

        if (html.data.totalCount == 0)
            break;
        
        let dataList = html.data.list;         
        dataList.forEach(data => {
            hospitalData = {};
            hospitalData.hospitalName = data.HP_NAME;
            hospitalData.yoyangNum = data.HP_KIHO;
            hospitalData.address = data.HP_ADDR;
            hospitalData.phone = data.HP_TELNO;
            hospitalData.faxNo = data.FAX_NO;
            hospitalData.hosStep = data.CLSFC_CD_DESC;
            hospitalData.businessDay = data.HP_DESC;
            hospitalData.isBest = typeof data.IS_BEST == 'undefined' ? null : data.IS_BEST;            
            hospitalList.push(hospitalData);
        });        
        // console.log(sf('PAGENUM : {0}, LENGTH : {1}', pageNum, dataList.length));
    }    
    console.log(sf('{0} : {1}', CstartPage, hospitalList.length));

    if (hospitalList.length > 0) {
        let resultStr = JSON.stringify(hospitalList);
        fs.writeFile(sf(OUTPUTDIR + FILENAME, CstartPage), resultStr, function (err) { 
            if (err) 
                throw err; 
            console.log(sf('{0}. The "data to writed" was writed to file!', CstartPage)); 
            callback();
        });
    }
    else    
        callback();
};

const pathCheck = () => {
    let dirPath = 'output/nonSmoking/mergeData/';
    let isExists = fs.existsSync( dirPath );
    if( !isExists ) {
        fs.mkdirSync( dirPath, { recursive: true } );
    }
    dirPath = 'output/nonSmoking/Data/';
    isExists = fs.existsSync( dirPath );
    if( !isExists ) {
        fs.mkdirSync( dirPath, { recursive: true } );
    }    
}

const startCrawling = () => {
    pathCheck();

    //병렬 처리할 개수 셋팅
    const parallelCount = 9;    
    let count = parallelCount;
    //하나의 프로세스에서 처리할 페이지 개수
    const pageLength = 100;

    for (var idx = 0; idx < parallelCount; idx++){    
        let AStatpage = (idx * pageLength) + 1;   
        let ALastpage = (idx + 1) * pageLength;
        getHospitalList(AStatpage, ALastpage, function () {
            count--;
            if (count === 0)
                func.mergeData();
        });
    }
}

startCrawling();