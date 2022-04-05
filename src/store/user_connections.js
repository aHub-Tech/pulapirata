const e = require("cors")

const user_connections = {

    /*
        rooms [
            {
                room_id: 'lobby',
                room_owner: 'cafe',
                room_pass: '123',
                room_status: 'ABERTO',
                room_date_time: '',
                room_time_turn: ''
                players: [
                    {
                        user_id: 1,
                        user_name: 'cafe',
                        user_color: '',
                        user_status: 'online'
                    }
                ],
                slots: [
                    {
                        slot_id: 1,
                        slot_checked: false,
                        slot_jump: false
                    }
                ]
            }
        ]
    */

    colors: [
        "26c3bf", // verde-azul claro
        "58aaf2", // azul claro
        "58f276", // verde claro
        "f2ea58", // amarelo claro
        "c73c3c", // vermelho claro
        "953cc7", // lilas
        "ff5722" // laranja
    ],
    rooms: [],
    players: [],
    slots: [],
    modelRoom: {
        room_id: '',
        room_owner: '',
        room_pass: '',
        room_privated: false,
        room_status: 0, // 0: ABERTO / 1: CHEIO /  2: INICIADO / 3: FINALIZADO / 4: EXPIRADO /5: WO
        room_date_time: Date.now(),
        room_time_turn: 0,
        room_turn_player: ''
    },
    modelUser: {
        user_id: '',
        user_name: '',
        user_color: '',
        user_status: 0, // 0: ONLINE / 1: OFFLINE
        user_socket_id: '',
        room_id: ''
    },
    modelSlot: {
        slot_id: '',
        room_id: '',
        slot_checked: false,
        slot_color: '',
        slot_shoot: ''
    },
    createUpdateRoom (data) {
        let room = {}
        const index = this.rooms.findIndex(e => e.room_id === data.room_id)

        if (index===-1) room = Object.assign({}, this.modelRoom)
        else room = this.rooms[index]

        room.room_id = data.room_id
        room.room_owner = (data.room_owner) ? data.user_id : room.room_owner
        room.room_owner_name = (data.room_owner) ? data.user_name : room.room_owner_name
        room.room_pass = (data.room_pass) ? data.room_pass : room.room_pass
        room.room_privated = (data.room_pass) ? true : false
        room.room_turn_player = data.user_id

        if (index===-1) this.rooms.push(room)
        else this.rooms[index] = room

        return room
    },
    createUpdateUser (data) {
        let user = {}

        const index = this.players.findIndex(p => p.user_id === data.user_id)

        if (index===-1) user = Object.assign({}, this.modelUser)
        else user = this.players[index]

        user.user_id = data.user_id,
        user.user_name = data.user_name
        user.user_color = (data.user_color) ? data.user_color : user.user_color
        user.user_status = (data.user_status) ? data.user_status : user.user_status
        user.user_socket_id = data.user_socket_id
        user.room_id = data.room_id

        if (index===-1) this.players.push(user)
        else this.players[index] = user

        return user

    },
    createUpdateSlots (data) {
        // select randomic slot shoot
        const indexShoot = Math.floor(Math.random()*data.length)
        data[indexShoot].shoot = true

        data.forEach(e => {
            let slot = {}

            const index = this.slots.findIndex(s => s.slot_id == e.id && s.room_id)

            if (index===-1) slot = Object.assign({}, this.modelSlot)
            else slot = this.slots[index]

            slot.slot_id = e.id
            slot.room_id = e.idroom
            slot.slot_checked = false
            slot.slot_color = ''
            slot.slot_shoot = (e.shoot) ? true : false

            this.slots.push(slot)
        })
    },
    getDataByUserId(user_id) {
        return this.players.find(d => d.user_id === user_id)
    },
    getDataBySocketId(socket_id) {
        return this.players.find(d => d.user_socket_id === socket_id)
    },
    getData() {
        return this.data
    },
    setData(data) {
        this.data = data
        return this.data
    },
    addData(data) {
        // data.socket_id = socket.id;
        // data.connected = true;

        // const index = this.data.findIndex(e => {
        //     return e.room_id === data.room_id
        // })
        // if (index===-1) {
        //     this.data.push(data) 
        // }else{
        //     this.data[index] = data
        // }
    },
    updateUser(user) {
        const i = this.data.findIndex(d => d.user_id == user.user_id)
        this.data[i] = user
        return this.data
    },
    getOuthers(socket_id) {
        return this.players.filter(p => p.user_socket_id !== socket_id)
    },
    disconnectUser(socket_id) {
        /* Regras para desconexão do jogador

            1. Se for o dono da sala e o status da sala for igual a ABERTO e a sala não estiver vazia
                - Remove o jogador da sala
                - Passa para o próximo jogador a liderança
                - Informa o novo lider
            2. Se sair um jogador de uma sala em jogo e restarem 2 ou mais jogadores
                - R
            3. Se for o jogador da vez e o status da sala for igual a GAME e haver mais de 1 jogador
                - Remove o jogador da sala
                - Passa para o próximo a vez de jogar
                - Informa o próximo a jogar
        */

        // // verificando se o socket é conhecido
        // const user = this.getDataBySocketId(socket_id)
        // // se for conhecido apenas ignoramos
        // if (!user) return false

        // // verificando se o jogador era o dono da sala
        // const owner = this.rooms.find(e => e.room_owner === user.user_id && e.room_id === user.room_id)
        // // verrificando se era o jogador da vez
        // const turn_player = this.rooms.find(e => e.room_turn_player === user.user_id && e.room_id === user.room_id)
        // // pegando a sala
        // const room = this.rooms.find(e => e.room_id === user.room_id)


        // // removendo usuário da lista de jogadores na sala
        // this.players = this.players.filter(e => e.user_id !== user.user_id)


        // if (!room) return false

        // // pegando os demais jogadores da sala
        // const roomPlayers = this.players.filter(e => e.room_id === user.room_id)

        // // o jogador de que saiu era o dono da sala e a sala está com mais pessoas
        // // esperando para iniciar a partida, a liderança passa para o próximo jogador
        // if (owner!=undefined && room.room_status===0 && roomPlayers.length>=1 && room.room_id != 'lobby') {
        //     console.log('desconect 1')
        //      // seta o proximo jogador da lista como dono
        //      const newOwner = roomPlayers[0]
        //      room.room_owner = newOwner.user_id
        //      room.room_owner_name = newOwner.user_name
        //      room.turn_player = newOwner.user_id
             
        //      // retorna um aviso
        //      return {
        //          msg: `${user.user_name} era o dono da sala e saiu agora ${newOwner.user_name} é o novo dono.`,
        //          signal: 'room_new_owner',
        //          player_id: newOwner.user_id,
        //          data: this.getPublicRoomData(room.room_id),
        //          players: roomPlayers
        //      }

        // // quando sair um jogador e o jogo ainda não estiver iniciado e ele não for o dono
        // } else if (!owner && room.room_status===0) {
        //     console.log('desconect 2')
        //         // retorna um aviso
        //         return {
        //             msg: ``,
        //             signal: 'data-room',
        //             player_id: '',
        //             data: this.getPublicRoomData(room.room_id),
        //             players: roomPlayers
        //         }
        // // haviam apenas dois jogadores na sala e outro saiu
        // // então agora o jogador restante se torna o vencedor
        // } else if (room.room_status===2 && roomPlayers.length==1) {
        //     console.log('desconect 3')
        //     // remove a sala
        //     this.rooms = this.rooms.filter(e => e.room_id !== user.room_id)
            
        //     // remove todos os demais jogadores para o looby
        //     roomPlayers.forEach(e => {
        //         this.players.forEach(p => {
        //             if (p.user_id === e.user_id) {
        //                 p.room_id = 'lobby'
        //             }
        //         })
        //     })

        //     // retorna um aviso
        //     return {
        //         msg: `Todos os jogadores desistiram da partida você é o vencedor!.`,
        //         signal: 'room_winner_wo',
        //         players: roomPlayers
        //     }

        // // Haviam 3 ou mais jogadores e a sala estava em jogo
        // // o jogador da vez saiu da partida, então a vez é passada para o próximo jogador
        // } else if (turn_player!=undefined && room.room_status===2 && roomPlayers.length>=2) {
        //     console.log('desconect 4')
        //     // passando a vez de jogar para o próximo jogador da lista
        //     room.room_turn_player = roomPlayers[0].user_id

        //     // retorna um aviso
        //     return {
        //         msg: `${user.user_name} saiu da partida e agora ${roomPlayers[0].user_name} é quem joga`,
        //         signal: 'room_new_turn_player',
        //         player_id: roomPlayers[0].user_id,
        //         players: roomPlayers
        //     }
        // }else{
        //     console.log('desconect default')
        //     // remove a sala
        //     this.rooms = this.rooms.filter(e => e.room_id !== user.room_id)

        //     return false

        // }
    },
    setUserColor (user_id) {
        const player = this.players.find(d => d.user_id == user_id)
        const color = this.colors.find(c => {
            let x = false
            this.getRoomPlayers(player.room_id).find(e => {
                if (c==e.user_color) x = true
            })
            if (!x) return c
        })
            
        player.user_color = color || this.colors[0]
        return player
    },
    getRoomById (room_id) {
        return this.rooms.find(e => e.room_id == room_id)
    },
    setRoomId (user_id, room_id) {
        const i = this.players.findIndex(d => d.user_id == user_id)
        this.players[i].room_id = room_id
        return this.players[i]
    },
    setRoomOwner (user_id, bool) {
        const i = this.data.findIndex(d => d.user_id == user_id)
        this.data[i].room_owner = bool
        return this.data[i]
    },
    setRoomTimer (user_id) {
        const i = this.data.findIndex(d => d.user_id == user_id)
        this.data[i].room_timer = new Date()
        return this.data[i]
    },
    setRoomPass (user_id, room_pass) {
        const i = this.rooms.findIndex(d => d.user_id == user_id)
        this.rooms[i].room_pass = room_pass
        this.rooms[i].room_privated = (room_pass !== '') ? true : false
        return this.rooms[i]
    },
    getRoomPlayers (room_id) {
        return this.players.filter(d => d.room_id === room_id);
    },
    getOuthersRoomPlayers (room_id) {
        return this.players.filter(d => d.room_id === room_id);
    },
    getPublicDataUser (user_id) {
        const i = this.players.findIndex(d => d.user_id == user_id)

        const data = {
            user_id:  this.data[i].user_id,
            user_name:  this.data[i].user_name,
            user_color: this.data[i].user_color,
            room_id:  this.data[i].room_id,
            room_privated:  this.data[i].room_privated,
            room_owner: this.data[i].room_owner,
            room_turn_player: this.data[i].room_turn_player
        }
        return data
    },
    getStatusRoom (room_status) {
        let status = 'ABERTA'
        if (room_status===1) status = 'CHEIA'
        if (room_status===2) status = 'EM GAME'
        if (room_status===3 || room_status===5) status = 'FINALIZADO'
        if (room_status===4) status = 'EXPIRADO'
        return status
    },
    getSlotsPublicData(room_id) {
        const slots = this.slots.filter(e => e.room_id === room_id)
        const publicData = []

        slots.forEach(e => {
            const slot = {
                slot_id: e.slot_id,
                slot_checked: e.slot_checked,
                slot_color: e.slot_color
            }

            publicData.push(slot)
        })

        return publicData
    },
    getPublicRoomData (room_id) {

        const room = this.rooms.find(r => r.room_id === room_id)

        const publicData = {
            room_id: room.room_id,
            room_owner: room.room_owner,
            room_owner_name: room.room_owner_name,
            room_privated: room.room_privated,
            room_status: room.room_status,
            room_status_description: this.getStatusRoom(room.room_status),
            room_players: this.players.filter(p => p.room_id === room.room_id),
            room_slots: this.getSlotsPublicData(room_id),
            room_turn_player: room.room_turn_player
        }

        return publicData
    },
    getPlayersInRoom (room_id) {
        return this.players.filter(e => e.room_id === room_id)
    },
    getPublicData () {
        const publicData = []
        this.rooms.map(room => {
            const r = {
                room_id: room.room_id,
                room_owner: room.room_owner,
                room_owner_name: room.room_owner_name,
                room_privated: room.room_privated,
                room_status: room.room_status,
                room_status_description: this.getStatusRoom(room.room_status),
                room_players: this.players.filter(p => p.room_id === room.room_id),
                room_turn_player: room.room_turn_player
            }

            publicData.push(r)
        })

        return publicData
    },
    cancelRoom (data) {
        const owner = this.rooms.find(r => r.room_owner === data.user_id)

        if (!owner) throw 'Você não tem permissão!'

        this.players.map(e => {
            if (e.room_id === data.room_id) {
                e.room_id = 'lobby'
            }
        })

        this.rooms = this.rooms.filter(e => e.room_id !== data.room_id)
    },
    startGame (data) {
        const owner = this.rooms.find(r => r.room_owner === data.user_id)
        if (!owner) throw 'Você não tem permissão!'

        const room = this.rooms.find(e => e.room_id === owner.room_id)
        room.room_status = 2 // em game

        return this.players.filter(e => e.room_id === owner.room_id)
    },
    clickOnSlot (data) {

        const user = this.getDataByUserId(data.user_id)
        if (!user) throw 'Você não tem permissão!'

        const slot = this.slots.find(e => e.slot_id === data.slot_id)
        if (!slot) throw 'Houve um erro o slot não foi encontrado!'

        const room = this.rooms.find(e => e.room_turn_player === user.user_id && e.room_id === user.room_id)
        if (!room) throw 'Não é sua vez de jogar!'

        if (slot.slot_checked) throw 'Este slot já marcado!'

        const players = user_connections.getRoomPlayers(user.room_id)

        slot.slot_color = user.user_color
        slot.slot_checked = true

        if (slot.slot_shoot) {
            room.room_status = 3
            room.room_status_description = this.getStatusRoom(room.room_status)
        }else{
            const index = players.findIndex(e => e.user_id === user.user_id)
            const next_player = (players[index+1]==undefined) ? players[0] : players[index+1]
            room.room_turn_player = next_player.user_id
        }

        return players

    }

    // getPublicData (user_id) {
    //     const publicData = []
    //     this.data.forEach(d => {
    //         room = publicData.find(r=>r.room_id==d.room_id)
    //         if (!room) {
    //             publicData.push({
    //                 room_id: d.room_id,
    //                 room_privated: d.room_privated,
    //                 room_owner: (d.room_owner ? d.user_name : ''),
    //                 room_players: [d]
    //             })
    //         }else{
    //             room.room_players.push(d)
    //         }
    //     })
    //     return publicData
    // }
}

module.exports = user_connections