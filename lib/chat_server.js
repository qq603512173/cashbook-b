var socketio = require('socket.io')
var io
var guestNumber = 1
// 当前用户 socket.id : name
var nickNames = {}
// 已经用过的客户名
var namesUsed = []
// 当前房间
var currentRoom = {}
/****
 * 第一次登陆分配客户的名称
 */
function assignGuestName(socket, guestNumber, nickNames, namesUsed){
    var name = "Guest" + guestNumber
    nickNames[socket.id] = name
    socket.emit('nameResult',{
        success:true,
        name:name
    })
    namesUsed.push(name)
    return guestNumber+1
}
/**
 * 加入默认Lobby的聊天室
 * @param {any} socket 
 * @param {any} room 
 */
function joinRoom(socket, room){
    socket.join(room)
    currentRoom[socket.id] = room
    socket.emit('joinResult', {room: room})
    // 通知聊天室其他用户，新用户加入
    socket.broadcast.to(room).emit('message',{
        text: nickNames[socket.id] + '  已经加入  ' + room + '.'
    })
    // 统计当前聊天室的其他用户
    var usersInRoom =  io.sockets.clients(room)
    if (usersInRoom.length > 1){
        var usersInRoomSummary = '当前在 ' + room + ' 人员有:     '
        for (var index in usersInRoom){
            var userSocketId = usersInRoom[index].id
            if (userSocketId != socket.id){
                if (index > 0){
                    usersInRoomSummary += ','
                }
                usersInRoomSummary += nickNames[userSocketId]
            }
        }
        usersInRoomSummary += '.'
        socket.emit('message', { text: usersInRoomSummary})
    }
}
/**
 * 用户改变用户名
 * 
 * @param {any} socket 
 * @param {any} nickNames 
 * @param {any} namesUsed 
 */
function handleNameChangeAttempts(socket, nickNames, namesUsed){
    socket.on('nameAttempt', function(name){
        if (name.indexOf('Guest') == 0 )
        {
            socket.emit('nameResult',{
                success: false,
                message: 'Names cannot begin with "Guest".'
            })
        }else{
            if (namesUsed.indexOf(name) == -1)
            {
                var previousName = nickNames[socket.id]
                var previousNameIndex = namesUsed.indexOf(previousName);
                namesUsed.push(name)
                nickNames[socket.id] = name
                delete namesUsed[previousNameIndex]
                socket.emit('nameResult', {
                    success: true,
                    message: name
                })
                socket.broadcast.to(currentRoom[socket.id]).emit('message', {
                    text: previousName + '  更改为： ' + name + '.'
                })

            }else{
                socket.emit('nameResult', {
                    success: false,
                    message: '当前名称已被占用！.'

                })
            }
        }
    })
}
/**
 * 用户发送信息
 * 
 * @param {any} socket 
 */
function handleMessageBroadcasting(socket){
    socket.on('message', function(message){ 
        socket.broadcast.to(message.room).emit('message',{
            text: nickNames[socket.id] + ":" + '<font style="color:red">'+ message.text + '</font>'
        })
    })
}
/**
 * 用户更改聊天室
 * 
 * @param {any} socket 
 */
function handleRoomJoining(socket){
    socket.on('join', function(room){
        socket.leave(currentRoom[socket.id])
        joinRoom(socket, room.newRoom)
    })
}
/**
 * 用户退出聊天室
 * 
 * @param {any} socket 
 */
function handleClientDisconnection(socket){
    socket.on('disconnect', function(){
        var nameIndex = namesUsed.indexOf(nickNames[socket.id])
        delete namesUsed[nameIndex]
        delete nickNames[socket.id]
    })
}
exports.listen = function(server){
    io = socketio.listen(server)
    io.set('log level', 1)
    io.sockets.on('connection', function(socket){
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        joinRoom(socket, 'SpaceSpy');

        handleMessageBroadcasting(socket, nickNames)
        handleNameChangeAttempts(socket, nickNames, namesUsed)
        handleRoomJoining(socket)
        socket.on('rooms', function(){
            socket.emit('rooms', io.sockets.manager.rooms)
        })
        handleClientDisconnection(socket, nickNames, namesUsed)
    })
}