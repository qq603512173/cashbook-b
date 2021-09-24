const { selectByMonth, insertData, deleteData, insertUser, ifExitEmail, getPasswordByEmail,getPasswordByName } = require('../db/handleDB.js')
const { getFormatByDBTimes, standardJSON, randomNum } = require('../lib/util.js')
const sendMail = require('../lib/emailHandler')

/*
 * 重定向
 */
const fn_redirect = async(ctx, next) =>{
    ctx.redirect('/home/index.html');
}
/*
 * 根据月份获取当前账单数据
 */
const fn_getdata = async(ctx, next) =>{
    const curURL = ctx.query
    let n = ctx.session.views || 0;
    const ret= await selectByMonth(curURL.fromDate, curURL.toDate)
    ctx.response.body = standardJSON(ret.rows)

}
/*
 * 插入账单数据
 */
const fn_insert = async(ctx, next) =>{
    let curBody =ctx.request.body
    const ret= await insertData(curBody.BillDate, curBody.BillType, curBody.BillMoney, curBody.BillRemark, curBody.BillUser)
    ctx.response.body = {state:"0",error:""}
}
/*
 * 删除账单数据
 */
const fn_delete = async (ctx, next) => {
    let curBody = ctx.request.body
    const ret= await deleteData(curBody.id)
    ctx.response.body = {state:"0", error:""}

}
/*
 * 添加用户
 */
const fn_adduser = async (ctx, next) => {
    let curBody = ctx.request.body
    const ifCanReg = await getPasswordByEmail(curBody.email)
    if (ifCanReg.rows.length > 0 )
    {
        ctx.response.body = {state:"-1", error:"邮箱已注册"}
        return
    }
    const ifCanReg2 = await getPasswordByName(curBody.name)
    if (ifCanReg2.rows.length > 0 )
    {
        ctx.response.body = {state:"-1", error:"用户名已注册"}
        return
    }
    const ret = await insertUser(curBody.email, curBody.name, curBody.password)
    ctx.response.body = {state:"0", error:""}
}
/*
 * 判断email,验证邮箱。
 */
const fn_ifExitEmail = async (ctx, next) => {
    const curUrl = ctx.query
    const ret = await ifExitEmail(curUrl.email)
    const rtnCount = ret.rows[0].count
    if (rtnCount === '0')
    {
        //向邮箱发送验证码
        const verificationCode = randomNum(5)
        await sendMail(curUrl.email, "欢迎您注册爱琦记" ,"您的验证码: " + verificationCode).then(()=>{
            ctx.response.body = {state:"0", error:""}
        })
    }else{
        ctx.response.body = {state:"-1", error:"邮箱已注册!"}
    }
}
/*
* 登录
*/
const fn_login = async  (ctx, next) => {
    const curBody = ctx.request.body
    let ifCanLogin = await getPasswordByEmail(curBody.email)
    let searchPassword = ifCanLogin.rows
    if (searchPassword.length === 0) 
    {
        ifCanLogin = await getPasswordByName(curBody.email)
        searchPassword = ifCanLogin.rows
    }
    if (searchPassword.length === 0)
    {
        ctx.response.body = {state: "-1", error: "不存在当前用户!"}
    }else{
        if (searchPassword[0].password === curBody.password){
            ctx.session.username = curBody.email
            ctx.session.password = curBody.password
            ctx.session.userId = searchPassword[0].id
            ctx.response.body = {state: "0", error: "",userId:searchPassword[0].id }
        }else{
            ctx.response.body = {state: "-1", error: "用户名或密码不正确!"}
        }
    }

}

const fn_loginInfo = async  (ctx, next) => {
    if (ctx.session.username){
        ctx.response.body = {username:ctx.session.username, password: ctx.session.password,userId:ctx.session.userId}
    }else{
        ctx.response.body = {username:"", password: "",userId: ""}
    }
}

module.exports = {
    'GET /': fn_redirect,
    'GET /getdata': fn_getdata,
    'POST /insert': fn_insert,
    'POST /delete': fn_delete,
    'GET /ifExitEmail': fn_ifExitEmail,
    'POST /login': fn_login,
    'POST /reg': fn_adduser,
    'GET /loginInfo' : fn_loginInfo
};