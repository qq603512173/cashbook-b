/**
 * 将数据库时间戳数据转换为yy-MM-dd格式
 */
const getFormatByDBTimes = function (DBTime){
    let date = new Date(DBTime)
    let month = date.getMonth() 
    let newMonth = (month + 1) < 10 ? '0'+(month+1) : month+1
    return `${date.getFullYear()}${newMonth}${date.getDate()}`
}

/****
 * 将数据库返回的数据转换为前台要求的json格式数据
 */

 const standardJSON = function (data){
     let ret = []
     let sumImport=0.00,sumExport=-0.00
     let dateObj = {}
     const weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
    for (let item in data)
    {
        let tDateString = "Y" + getFormatByDBTimes(data[item].BillDate)
        if(dateObj.hasOwnProperty(tDateString))
        {
            dateObj[tDateString].push(data[item])
        }else{
            dateObj[tDateString] = [data[item]]
        }
    }
    for (let dateObjKey in dateObj){
        let oneDayObj = {}
        let dateObjItem = dateObj[dateObjKey]
        let importMoney=0.00,exportMoney=-0.00
        oneDayObj.BillDate = dateObjKey.substring(5,7) + '月' + dateObjKey.substring(7,9) +"号"
        oneDayObj.BillDay = weekDay[new Date(dateObjItem[0].BillDate).getDay()]
        let oneDayDetail = []   
        for (oneDayItem in dateObjItem)
        {
            let oneDayDetailItem = {}
            oneDayDetailItem.BillIcon = dateObjItem[oneDayItem].BillType
            oneDayDetailItem.BillTitle = (dateObjItem[oneDayItem].title).replace(/\s/g,"")
            oneDayDetailItem.BillMoney = (dateObjItem[oneDayItem].BillMoney).replace(/￥/g,"")
            oneDayDetailItem.BillMoney = oneDayDetailItem.BillMoney.replace("$","") 
            oneDayDetailItem.BillMoney = oneDayDetailItem.BillMoney.replace(/,/g,"") 
            oneDayDetailItem.BillId = dateObjItem[oneDayItem].id
            oneDayDetailItem.BillRemark = dateObjItem[oneDayItem].BillRemark.replace(/\s/g,"")
            oneDayDetailItem.BillUser = (dateObjItem[oneDayItem].name === null) ? "无用户" : dateObjItem[oneDayItem].name
            if (parseFloat(oneDayDetailItem.BillMoney) < 0){    
                exportMoney -= parseFloat(oneDayDetailItem.BillMoney)
                sumExport -= parseFloat(oneDayDetailItem.BillMoney)
            }else{
                importMoney += parseFloat(oneDayDetailItem.BillMoney)
                sumImport += parseFloat(oneDayDetailItem.BillMoney)
                oneDayDetailItem.BillMoney = "+" +  oneDayDetailItem.BillMoney
            }
            oneDayDetail.push(oneDayDetailItem)
        }
        oneDayObj.BillImport = importMoney.toFixed(2)
        oneDayObj.BillExport = exportMoney.toFixed(2)
        oneDayObj.Detail = oneDayDetail
        ret.push(oneDayObj)
    }
    return { BillSumImport: sumImport.toFixed(2), BillSumExport: sumExport.toFixed(2), data: ret }
 }


 const compute = function (str){
    let oldSum = 0.00
    let NewNum = ""
    let lastChar = ""
   for (let i=0;i<str.length;i++)
   {   
       if ((str[i]==="+")&&(NewNum != ""))
       {
           NewNum = ""
           lastChar = "+"
       }else if((str[i] === "-")&&(NewNum != ""))
       {
           NewNum = ""
           lastChar = "-"
       }else{
           let lastNum = ""
           if ( NewNum.length > 0)
           {
               lastNum = NewNum
           }
           NewNum += str[i]
          if (lastChar === "+"){
               if (lastNum != "") oldSum -= parseFloat(lastNum)
               oldSum += parseFloat(NewNum)
          }else if(lastChar==="-")
          {
               if (lastNum != "") oldSum += parseFloat(lastNum)
              oldSum -= parseFloat(NewNum)
          }else{
              oldSum = parseFloat(NewNum)
          }
           
       }
   }
   return oldSum
}
/**
 * 
 * @param {int} sum 要生成随机数的位数 
 */
const randomNum = function(sum){
    let rtn = ""
    for (let i=0; i < sum; i++){
        rtn += Math.floor(Math.random()*10)
    }
    return rtn
}

module.exports = {
    getFormatByDBTimes: getFormatByDBTimes,
    standardJSON: standardJSON,
    randomNum: randomNum
}
