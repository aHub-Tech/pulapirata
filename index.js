const express = require('express')
const http = require('http')
const cors = require('cors')

const router_web = require('./src/routes/web')

const app = express();
const server = http.createServer(app)
const io = require('socket.io')(server)

app.use(express.static('public'));

// app.use('/views', express.static(__dirname + '/public/app/views'));
app.use(cors())
app.use(express.json())

// rotas web
app.use('/', router_web)


// socket
let connections = []

io.on('connection', (socket) => {
    // connect lobby
    socket.on('connect-lobby', (data) => {
        // adicionando o socket_id
        data.socket_id = socket.id;
        // adicionando ao array de conexões
        connections.push(data);
        
        // emitando o total para o próprio usuário
        socket.emit('users', {
            'users': connections
        });

        // emitindo para todos os demais do lobby
        for(conn of connections) {
            if (conn.room_id === 'lobby') {
                socket.to(conn.socket_id).emit('users', {
                    'users': connections
                });
            }
        }
    });

    // create room
    socket.on('create-room', (data) => {
        console.log(data);
    });

    socket.on('disconnect', () => {
       connections = connections.filter(c => c.socket_id !== socket.id);
    });
});


server.listen(4000, ()=>{
    console.log('aplicação rodando na porta 4000');
});