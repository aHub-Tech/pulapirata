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
        data.socket_id = socket.id;
        // adicionando ao array de conexões
        user_connections.addData(data);
        
        // emitando o total para o próprio usuário
        socket.emit('users', {
            'users': user_connections.getData()
        });

        // emitindo para todos os demais do lobby
        for(conn of user_connections.getOuthers(socket.id)) {
            if (conn.room_id === 'lobby') {
                socket.to(conn.socket_id).emit('users', {
                    'users': user_connections.getData()
                });
            }
        }
    });

    // create room
    socket.on('create-room', (data) => {
        // const user = user_connections.getDataByUserId(data.user_id)
        const room_id = Date.now()
        user_connections.setUserColor(data.user_id)
        user_connections.setRoomId(data.user_id, room_id)
        user_connections.setRoomOwner(data.user_id, true)
        user_connections.setRoomTimer(data.user_id)
        user_connections.setRoomPass(data.user_id, data.room_pass)
        
        socket.emit('create-room-confirmed', (user_connections.getPublicDataUser(data.user_id)))

        for (conn of user_connections.getData()) {
            socket.to(conn.socket_id).emit('users', {'users': user_connections.getPublicData (data.user_id)})
        }
    });

    socket.on('disconnect', () => {
       user_connections.removeData(socket.id);
    });
});


server.listen(4000, ()=>{
    console.log('aplicação rodando na porta 4000');
});