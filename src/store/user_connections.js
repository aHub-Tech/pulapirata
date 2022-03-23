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
        room_status: 0, // 0: ABERTO / 1: CHEIO /  2: GAME 
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
    getDataByUserId(user_id) {
        return this.players.find(d => d.user_id === user_id)
    },
    getDataBySocketId(socket_id) {
        return this.players.find(d => d.socket_id === socket_id)
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
    removeData(socket_id) {
        // this.setData(this.data.filter(d => d.socket_id !== socket_id))
        return this.getData()
    },
    setUserColor (user_id) {
        const i = this.players.findIndex(d => d.user_id == user_id)
        this.players[i].user_color = this.colors.find(c => this.players.find(u => u.user_color!=c && u.room_id==this.players[i].room_id))
        return this.players[i]
    },
    getRoomById (room_id) {
        return this.rooms.find(e => e.room_id = room_id)
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
        return status
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