const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


// this on('connection') func. will fire one time, when client open new connection
// 'socket' is an object, it include all infor about the 'connection'
io.on('connection', (socket) => {
    console.log('New web socket connection');

    //options = { username, room }
    socket.on('join', (options, callback) => {
        
        const { error, user } = addUser({ id:socket.id, ...options })

        if (error) {
            return  callback(error)
        }

        socket.join(user.room)
        
        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined! `))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }        

    })


    

})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`);  
})

/* 
* socket.emit() - send only for who requested the connection first
* io.emit() - send all the users who connected with the connection
* socket.broadcast.emit() - send all the users except who request the connection
* socket.on('disconnect') - sends when a user disconnect with connected connection except who left
* io.to().emit() - emits to everybody in a specific room
* socket.broadcast.to().emit() - emits to everyone in a specific chat room, except for the request client i 
*/


/* SOKCET IO LIFE CYCLE

After a client connected with the server

CLIENT SERVER ACKNOWLEDGEMENT

server (emit) -> client (receive) --acknowledgement --> server
client (emit) -> server (receive) --acknowledgement --> client

So,
* Who is emitting the event should set a callback func. to get the acknowledgement
* Who ever receiving emitted event, should set a callback func. to send the callback message to event emitter

*/
