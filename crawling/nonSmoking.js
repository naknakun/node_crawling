const axios = require("axios");
const qs = require('querystring');
const sf = require("sf");
const fs = require('fs');

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
        console.error(error);
    }
};

const getHospitalList = async (MstartPage, MlastPage, MpageDivisionCnt) => {
    const url = "https://hi.nhis.or.kr/ca/ggpca001/ggpca001_p06.do";
    const pageDivisionCnt = MpageDivisionCnt;
    const startPage = MstartPage;
    const lastPage = MlastPage;
    let hospitalList = [];
    let hospitalData = {};
    for (var pageNum=startPage; pageNum<=lastPage; pageNum++){
        const html = await getHtml(url, pageNum);
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
            hospitalData.isBest = data.IS_BEST;    
            
            hospitalList.push(hospitalData);
        });        
        console.log(sf('PAGENUM : {0}, LENGTH : {1}', pageNum, dataList.length));

        let IdxMod = pageNum % pageDivisionCnt;
        let IdxDiv = pageNum / pageDivisionCnt;
        if (IdxMod == 0 || pageNum == lastPage){
            IdxDiv = Math.ceil(IdxDiv);  

            console.log(sf('{0} : {1}', IdxDiv, hospitalList.length));
            let str = JSON.stringify(hospitalList);
            const outputFile = "output/nonSmokingHospitalList{0}.txt";
            fs.writeFile(sf(outputFile, IdxDiv), str, function (err) { 
                if (err) 
                    throw err; 
                console.log(sf('{0}. The "data to writed" was writed to file!', IdxDiv)); 
            });
            hospitalList = [];
        }

    }  
};

const startCrawling = () => {
    const apageDivisionCnt = 10;
    for (var i=1; i<=8; i++){
        getHospitalList(((i-1)*apageDivisionCnt) + 1, i*apageDivisionCnt, apageDivisionCnt);
    }    
} 
startCrawling();
