const express = require('express')
const http = require('http')
const cors = require('cors')

const router_web = require('./routes/web')
const user_connections = require('./store/user_connections')

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

    // verificando se o socket é conhecido
    // const user = user_connections.getDataBySocketId(socket.id)
    // if (!user) {
    //     socket.emit('who-are-you')
    // }

    // connect lobby
    socket.on('connect-lobby', (data) => {
        // adicionando o socket_id
        data.user_socket_id = socket.id;

        // remove da sala se estiver
        // user_connections.disconnectUser(socket.id)
        const u = user_connections.getDataBySocketId(socket.id)
        // se estava conectado
        if (u) {
            // pega todos os jogadores da sala
            const ps = user_connections.players.filter(e => e.room_id === u.room_id)
            if (ps.length<=1) {
                // se haver apenas ele ou menos, removemos a sala
                user_connections.rooms = user_connections.rooms.filter(e => e.room_id != u.room_id)
            }
        }
        
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
        
        user_connections.setRoomId(data.user_id, room_id)
        user_connections.setUserColor(data.user_id)

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

    // cancel room
    socket.on('cancel-room', (data) => {
        try {
            user_connections.cancelRoom(data)
            socket.emit('canceled-room')
        } catch (err) {
            socket.emit('cancel-room-not-authorized', ({msg: err}))
        }
    })

    // enter room
    socket.on('enter-room', (data) => {

        const user = user_connections.getDataByUserId(data.user_id)
        const room = user_connections.getRoomById(data.room_id)
        
        if (room.room_pass!==data.room_pass) {
            return socket.emit('not-authorized-room')
        }

        user_connections.setRoomId(data.user_id, data.room_id)
        user_connections.setUserColor(data.user_id)
        
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

    socket.on('start-game', (data) => {
        try {
            const roomPlayers = user_connections.startGame(data)

            roomPlayers.forEach(e => {
                // emitindo para o jogador que startou a sala
                if (e.user_id === data.user_id) {
                    socket.emit('start-game-confirmed', {'data': user_connections.getPublicRoomData (e.room_id)})
                // emitindo para os demais jogadores da sala
                }else{
                    socket.to(e.user_socket_id).emit('data-room', {'data': user_connections.getPublicRoomData (e.room_id)})
                }
            })

            // emitindo para jogadores no lobby
            user_connections.players.forEach(e => {
                if (e.room_id === 'lobby') {
                    socket.to(e.user_socket_id).emit('data', {'data': user_connections.getPublicData()})
                }
            })
        } catch (error) {
            socket.emit('start-room-not-authorized', {msg: error})
        }
    })

    socket.on('show-my-position-cursor', (data) => {
        const user = user_connections.getDataByUserId(data.user_id)
        if (!user) return false

        user_connections.getRoomPlayers(user.room_id).forEach(e => {
            if (e.user_id !== data.user_id) {
                socket.to(e.user_socket_id).emit('show-outher-cursor-position', {
                    'user_id': user.user_id,
                    'user_name': user.user_name,
                    'user_color': user.user_color,
                    'cursor': data.cursor
                })
            }
        })
    })

    socket.on('click-on-slot', (data) => {
        try {
            const players = user_connections.clickOnSlot(data)

            socket.emit('data-room', {'data': user_connections.getPublicRoomData(players[0].room_id)})
            
            players.forEach(e => {
                if (e.user_id !== data.user_id) {
                    socket.to(e.user_socket_id).emit('data-room', {'data': user_connections.getPublicRoomData(players[0].room_id)})
                }
            })

        }catch(e) {
            socket.emit('click-on-slot-error', {error: e})
        }
    })

    socket.on('disconnect', () => {
        // const result = user_connections.disconnectUser(socket.id)
        const user = user_connections.getDataBySocketId(socket.id)

        if (!user) return false

        // capturando a sala que o jogador estava
        const room = user_connections.rooms.find(e => e.room_id === user.room_id)

        // verificando se o jogador era o dono da sala
        const owner = (room.room_owner === user.user_id)

        // verificando se era a vez do jogador
        const turn_player = (room.room_turn_player === user.user_id)

        // remover usuário da sala
        user_connections.players = user_connections.players.filter(e => e.user_id != user.user_id)

        // capturando outros jogadores da sala
        const players = user_connections.getPlayersInRoom(room.room_id)

        // passando a titularidade da sala para o proximo jogador
        if (owner) {
            const next_player = players.find(e => e.room_id == room.room_id)
            // se existir um próximo jogador passamos a titulariade
            if (next_player) room.room_owner = next_player.user_id
        }


        // passando a vez para o próximo jogador
        if (turn_player) {
            const next_player = players.find(e => e.room_id == room.room_id)
            // se existir um próximo jogador passamos a titulariade
            if (next_player) room.room_turn_player = next_player.user_id
        }


        // se restar apenas um jogador na sala
        if (players.length==1 && room.room_status==2) {
            // colocamos o status da sala como finalizado
            // um tratamento no front deve ser feito para sinalizar que o jogador venceu por desistência
            room.room_status = 5
            room.room_status_description = user_connections.getStatusRoom(room.room_status)
        }

        // removendo a sala do servidor caso não haja mais nenhum jogador
        if (players.length<=0) {
            user_connections.rooms = user_connections.rooms.filter(e => e.room_id != room.room_id)
        }
        

        user_connections.players.forEach(e => {
            if (user.room_id != 'lobby' && user.room_id === e.room_id) {
                socket.to(e.user_socket_id).emit('data-room', {'data': user_connections.getPublicRoomData(user.room_id)})
            }else{
                socket.to(e.user_socket_id).emit('data', {'data': user_connections.getPublicData()})
            }
        })

        // if (result) {
        //     result.players.forEach(e => {
        //         socket.to(e.user_socket_id).emit(result.signal, {
        //             player_id: result.player_id,
        //             msg: result.msg,
        //             data: result.data
        //         })
        //     });
        // }

    });
});


server.listen(4000, ()=>{
    console.log('aplicação rodando na porta 4000');
});