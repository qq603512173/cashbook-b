const db = require('./index.js')

/****
 * 操作数据库，根绝月份查出当月记录。倒叙查询
 */
let selectByMonth = async (fromDate, toDate) =>{
    const  rows  = await db.query( 'select a.id,c.name,a."BillDate",a."BillType",b."title",a."BillMoney",a."BillRemark" from bill a left join "billType" b  on a."BillType" =b.id  left join "SSUser" c on c.id = a."userid"  where  a."BillDate" >=$1 and  a."BillDate"<=$2 order by  a."BillDate"  desc ,a."joined" desc ', [fromDate, toDate])
    return rows
}
/****
 * 插入数据
 */
let insertData = async (BillDate, BillType, BillMoney, BillRemark, BillUser) =>{
    const  ret  = await db.query( 'INSERT INTO public.bill( "BillDate", "BillType", "BillMoney", "BillRemark", "userid") VALUES ( $1, $2, $3, $4, $5)', [BillDate, BillType, BillMoney, BillRemark, BillUser])
    return ret
}

/***
 * 删除数据
 */
let deleteData = async (id) =>{
    const  ret  = await db.query( 'delete from public.bill where id = $1', [id])
    return ret
}
/*****
 * 判断用户是否存在邮箱
 */
const ifExitEmail = async (email) => {
    const  ret  = await db.query( 'select count(*) from public."SSUser" where email=$1', [email])
    return ret
}
/** 
 * 插入用户表数据
*/
let insertUser = async (email, name, password) =>{
    const  ret  = await db.query( 'INSERT INTO public."SSUser"( email, name, password ) VALUES ( $1, $2, $3)', [email, name, password])
    return ret
}
/**
 * 根据email查询密码
 * @param {string} email 
 */
let getPasswordByEmail = async(email) => {
    const ret = await db.query('select id,password from public."SSUser" where email=$1', [email])
    return ret
}

/**
 * 根据用户名查询密码
 * @param {string} NAme 
 */
let getPasswordByName = async(name) => {
    const ret = await db.query('select id,password from public."SSUser" where name=$1', [name])
    return ret
}


module.exports = {
    selectByMonth: selectByMonth,
    insertData: insertData,
    deleteData: deleteData,
    insertUser: insertUser,
    ifExitEmail: ifExitEmail,
    getPasswordByEmail: getPasswordByEmail,
    getPasswordByName: getPasswordByName
}
