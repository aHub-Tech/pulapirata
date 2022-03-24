const express = require('express')
const http = require('http')
const cors = require('cors')

const router_web = require('./src/routes/web')
const user_connections = require('./src/store/user_connections')

const app = express();
const server = http.createServer(app)
const io = require('socket.io')(server)

app.use(express.static('public'));

// app.use('/views', express.static(__dirname + '/public/app/views'));
app.use(cors())
app.use(express.json())

// rotas web
app.use('/', router_web)


io.on('connection', (socket) => {
    // connect lobby
    socket.on('connect-lobby', (data) => {
        // adicionando o socket_id
        data.user_socket_id = socket.id;
        
        const room = user_connections.createUpdateRoom(data)
        const user = user_connections.createUpdateUser(data)

        // emitando o total para o próprio usuário
        socket.emit('data', {
            'data': user_connections.getPublicData()
        });

        // emitindo para todos os demais do lobby
        for(conn of user_connections.getOuthers(socket.id)) {
            if (conn.room_id === 'lobby') {
                socket.to(conn.user_socket_id).emit('data', {
                    'data': user_connections.getPublicData()
                });
            }
        }
    });

    // create room
    socket.on('create-room', (data) => {
        // const user = user_connections.getDataByUserId(data.user_id)
        const room_id = Date.now()
        const user = user_connections.getDataByUserId(data.user_id)

        data.room_id = room_id
        data.room_owner = true
        data.user_name = user.user_name

        user_connections.createUpdateRoom(data)
        
        user_connections.setUserColor(data.user_id)
        user_connections.setRoomId(data.user_id, room_id)

        socket.emit('create-room-confirmed', {
            data: user_connections.getPublicRoomData(room_id)
        })

        // for (conn of user_connections.getRoomPlayers(room_id)) {
        for (conn of user_connections.getOuthers(socket.id)) {
            socket.to(conn.user_socket_id).emit('data', {'data': user_connections.getPublicData ()})
        }
    });

    // map slots
    socket.on('map-slots', (data) => {
        user_connections.createUpdateSlots (data)
    })

    // enter room
    socket.on('enter-room', (data) => {

        const user = user_connections.getDataByUserId(data.user_id)
        const room = user_connections.getRoomById(data.room_id)
        
        if (room.room_pass!==data.room_pass) {
            return socket.emit('not-authorized-room')
        }

        user_connections.setUserColor(data.user_id)
        user_connections.setRoomId(data.user_id, data.room_id)

        socket.emit('enter-room-confirmed', {
            data: user_connections.getPublicRoomData(data.room_id)
        })

        for (conn of user_connections.getOuthers(socket.id)) {
            // players in room
            if(conn.room_id===room.room_id) {
                socket.to(conn.user_socket_id).emit('data-room', {'data': user_connections.getPublicRoomData(data.room_id)})
            // outhers users
            }else{
                socket.to(conn.user_socket_id).emit('data', {'data': user_connections.getPublicData ()})
            }
        }
    })

    // connect room
    socket.on('connect-room', (data) => {
        const user = user_connections.getDataByUserId(data.user_id)
        if (!user) socket.emit('not-connect')
    })

    socket.on('disconnect', () => {
        const user = user_connections.getDataBySocketId(socket.id)
        // if (user) {
        //     user.connected = false
        //     user_connections.updateUser(user)
        // }
        user_connections.removeData(socket.id);
    });
});


server.listen(4000, ()=>{
    console.log('aplicação rodando na porta 4000');
});