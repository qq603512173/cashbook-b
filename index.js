const Koa = require('koa');
const bodyParser = require('koa-bodyparser');   
// 注意require('koa-router')返回的是函数:
const router = require('koa-router')();
const controller = require('./controller');
const cors = require('koa-cors');
const session = require('koa-session');
const app = new Koa();
const isProduction = process.env.NODE_ENV === 'production';
var PORT = process.env.PORT || 5000

app.use(cors({    
    credentials: true
}))

// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    var start = new Date().getTime()
    var execTime = new Date().getTime() - start;
    ctx.set('X-Response-Time', `${execTime}ms`);
    ctx.set("Access-Control-Allow-Credentials", true); //可以带cookies
    ctx.set("Access-Control-Allow-Origin",ctx.request.get("Origin") || '*');
    ctx.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    ctx.set("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    ctx.set("X-Powered-By", '3.2.1')
    await next();
});

let staticFiles = require('./lib/static-files');
app.use(staticFiles('/home', './public'));
app.use(staticFiles('/js',  './public/js'));
app.use(staticFiles('/css', './public/css'));

app.use(bodyParser());

app.keys = ['some secret hurr'];   /*cookie的签名*/
const CONFIG = {
    key: 'koa:sess', /** 默认 */
    maxAge: 2592000000,  /*  cookie的过期时间        【需要修改】  */
    overwrite: true, /** (boolean) can overwrite or not (default true)    没有效果，默认 */
    httpOnly: true, /**  true表示只有服务器端可以获取cookie */
    signed: true, /** 默认 签名 */
    rolling: false, /** 在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false） 【需要修改】 */
    renew: false, /** (boolean) renew session when session is nearly expired      【需要修改】*/
};
app.use(session(CONFIG, app));

// add router middleware:
app.use(controller());

app.listen(PORT);
console.log(`app started at port ${PORT}...`);