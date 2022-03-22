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
    data: [],
    modelRoom: {
        room_id: '',
        room_owner: '',
        room_pass: '',
        room_privated: false,
        room_status: 0, // 0: ABERTO / 1: CHEIO /  2: GAME 
        room_date_time: Date.now(),
        room_time_turn: 0,
        players: [],
        slots: []
    },
    modelUser: {
        user_id: '',
        user_name: '',
        user_color: '',
        user_status: 0, // 0: ONLINE / 1: OFFLINE
        user_socket_id: ''
    },
    createRoom (data) {
        let room = this.data.find(e => e.room_id === data.room_id)
        if (room) return room
        
        room = this.modelRoom
        room.room_id = data.room_id
        room.room_owner = (data.room_owner) ? data.user_name : ''
        room.room_pass = (data.room_pass) ? data.room_pass : ''
        room.room_privated = (data.room_pass) ? true : false
        return room
    },
    createUser (data) {
        // let room = this.data.find(e => e.room_id === data.room_id)
        
        const user = this.modelUser
        user.user_id = data.user_id,
        user.user_name = data.user_name
        user.user_color = (data.user_color) ? data.user_color : ''
        user.user_socket_id = data.user_socket_id
        return user

    },
    getDataByUserId(user_id) {
        return this.data.find(d => d.user_id === user_id)
    },
    getDataBySocketId(socket_id) {
        return this.data.find(d => d.socket_id === socket_id)
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

        const index = this.data.findIndex(e => {
            return e.room_id === data.room_id
        })
        if (index===-1) {
            this.data.push(data) 
        }else{
            this.data[index] = data
        }

        console.log(this.data)
    },
    updateUser(user) {
        const i = this.data.findIndex(d => d.user_id == user.user_id)
        this.data[i] = user
        return this.data
    },
    getOuthers(socket_id) {
        return this.data.filter(d => d.socket_id !== socket_id)
    },
    removeData(socket_id) {
        this.setData(this.data.filter(d => d.socket_id !== socket_id))
        return this.getData()
    },
    setUserColor (user_id) {
        const i = this.data.findIndex(d => d.user_id == user_id)
        this.data[i].user_color = this.colors.find(c => this.data.find(u => u.color!=c && u.room_id==this.data[i].room_id))
        return this.data[i]
    },
    setRoomId (user_id, room_id) {
        const i = this.data.findIndex(d => d.user_id == user_id)
        this.data[i].room_id = room_id
        return this.data[i]
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
        const i = this.data.findIndex(d => d.user_id == user_id)
        this.data[i].room_pass = room_pass
        this.data[i].room_privated = (room_pass !== '') ? true : false
        return this.data[i]
    },
    getRoomPlayers (room_id) {
        return this.data.filter(d => d.room_id === room_id);
    },
    getPublicDataUser (user_id) {
        const i = this.data.findIndex(d => d.user_id == user_id)

        const data = {
            user_id:  this.data[i].user_id,
            user_name:  this.data[i].user_name,
            user_color: this.data[i].user_color,
            room_id:  this.data[i].room_id,
            room_privated:  this.data[i].room_privated,
            room_owner: this.data[i].room_owner
        }
        return data
    },
    getPublicData () {
        // const u = this.data.find(d => d.user_id == user_id)
        const publicData = []
        this.data.forEach(d => {
            // if (d.room_id == u.room_id) {
                publicData.push({
                    user_id:  d.user_id,
                    user_name:  d.user_name,
                    user_color: d.user_color,
                    room_id:  d.room_id,
                    room_privated:  d.room_privated,
                    room_owner: d.room_owner
                })
            // }
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