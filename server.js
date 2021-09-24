var http = require("http");

var fs = require("fs");

var path = require("path");

var mime = require("mime");

var cache = {};

var PORT = process.env.PORT || 5000

var chatServer = require('./lib/chat_server');

/**
 * 请求的资源不存在，返回404
 * @param {response} response 
 */
function send404(response){
    response.writeHead(404 ,{'Content-Type': 'text/plain'});
    response.write('error: resource not found');
    response.end();
}
/**
 * 返回文件内容
 * @param {response} response 
 * @param {string} filePath 
 * @param {string} fileContents 
 */
function sendFile(response, filePath, fileContents)
{
    response.writeHead(200,{'content-type': mime.lookup(path.basename(filePath))});
    console.log(fileContents)
    response.end(fileContents);
}
/**
 * 如何缓存中存在文件，则返回缓存文件，否则请求文件并返回
 * @param {response} response 
 * @param {object} cache 
 * @param {string} absPath 
 */
function serveStatic(response, cache, absPath)
{
    if (cache[absPath])
    {
        sendFile(response, absPath, cache[absPath]);
    }else{
        fs.exists(absPath, function(exists){
            if (exists)
            {
                fs.readFile(absPath, function(err, data){
                    if (err){
                        send404();
                    }else{
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                })
            }else{
                send404(response);
            }
        })
    }
}

/**
 * 创建服务
 */
var server = http.createServer(function(request, response){
    var filePath = false

    if (request.url == "/"){
        filePath = "public/index.html"
    }else{
        filePath = "public" + request.url
    }
    var absPath = "./" + filePath
    serveStatic(response, cache, absPath)
})

chatServer.listen(server);

server.listen(PORT,function(){
    console.log("Server listening on port" + PORT)
})
