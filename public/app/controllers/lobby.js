class lobby {
    constructor () {
        this.socket = io('/');

        this.SESSION = new session();
        this.SPLASH_SCREEN = new splashScreen();
        this.TBODY = document.querySelector('tbody');
        this.ERROR = new error();
        this.MODAL = new modal();
        this.HEADER = new header();
        this.BOX = document.querySelector('div.box');
        this.ROOMS = {'551222354': [], '554446685' : []};
        this.ROOMS_FILTER = [];
        
        if (!this.SESSION.isValid()) {
            window.location.replace('/login');
            return false;
        }

        // alimentando a header
        this.HEADER.show({
            room: '#LOBBY',
            user: (this.SESSION.getName().split(' ')[0])
        });

        // informando que o usuário chegou ao lobby
        this.socket.emit('connect-lobby', {
            'room_id': 'lobby',
            'user_id': (this.SESSION.getUserId()),
            'user_name': (this.SESSION.getName().split(' ')[0])
        });

        // this.getRooms();
        // setInterval(_ => {this.getRooms();}, 5000);

        this.onSocket();
    }

    filter (e) {
        let input = e.target.value;
        let filter = this.ROOMS.filter(r => {
            console.log(r.owner_name.toString(), input.toString());
            return (r.owner_name.toString().toLowerCase().indexOf(input.toString().toLowerCase())>-1
            || r.id.toString().toLowerCase().indexOf(input.toString().toLowerCase())>-1 );
        });
        this.render(filter);
    }

    getRooms (data) {
        // verificando se está logado
        if (this.SESSION.inRoom()) {
            return window.location.replace(`/room#${this.SESSION.inRoom()}`);
        }

        const rooms = [];
        let countRooms = 0;
        data.users.forEach(e => {
            if (!rooms[e.room_id]) {
                rooms[e.room_id] = {
                    privated: e.privated,
                    status: e.status,
                    owner_name: e.owner_name,
                    players: [e]
                };
            }else{
                rooms[e.room_id].players.push(e);
            }
            if (e.room_id!=='lobby') countRooms++
        })

        console.log(countRooms)

        if (countRooms) {
            this.render(rooms);
        }else{
            let body = `<div class="info">Nenhuma sala encontrada</div>`;
            this.BOX.innerHTML = body;
        }
    }

    render (rooms) {
        let body = '';

        for(const i in rooms) {

            console.log(rooms[i].room_id)
            
            // if (rooms[i].room_id)

            let privated = (rooms[i].privated) ? '<img style="max-width:12px"; src="./../img/lock.svg">' : '';
            
            let players = '';
            rooms[i].players.map(e => {
                players += e.user_name.split(' ')[0] + ' | ';
            });
            players = players.slice(0, -3);
            
            body += `
                <div class="card" title="Entrar na sala #${i}" onclick="LOBBY.enterRoom(${i})">
                    <div class="header">
                        <div class="left">
                            ${privated} 
                            #${i}
                        </div>
                        <div class="right">${rooms[i].status}</div>
                    </div>
                    <div class="content">
                        <div class="owner">OWNER</div>
                        <div class="name_owner">${rooms[i].owner_name}</div>
                    </div>
                    <div class="footer">
                        <div class="top">
                            <div class="left">PLAYERS</div>
                            <div class="right">${rooms[i].players.length}/4</div>
                        </div>
                        <hr>
                        <div class="bottom">
                            ${players}
                        </div>
                    </div>
                </div>
            `;

            this.BOX.innerHTML = body;
        };
    }

    createRoom () {
        this.MODAL.show({
            header:`
                <h3>Nova Sala</h3>
                <small>Crie sua sala e chame seus amigos</small>
            `,
            content: `
            <div class="inline">
                <div class="input-group"">
                    <label>Senha</label>
                    <input type="password" placeholder="Insira apenas se quiser privar a sala" name="pass_room"/>
                </div>
                <button onclick="LOBBY.confirmCreate()">Criar</button>
                <button class="btn-brown" onclick="LOBBY.cancelCreate()">Cancelar</button>
            </div>`
        });
    }

    confirmCreate () {
        const room_pass = document.querySelector('input[name=pass_room]').value;
        if (room_pass !== '') room_pass = CryptoJS.MD5(room_pass).toString();
        
        this.MODAL.close();
        this.SPLASH_SCREEN.showSplash();

        this.SPLASH_SCREEN.closeSplash();

        const data = {user_id: this.SESSION.getUserId(), room_pass: room_pass}

        this.socket.emit('create-room', data);
        this.socket.on('create-room-confirmed', (data) => {
            this.SESSION.setRoomID(data.room_id)
            this.SESSION.setColor(data.user_color)
            this.SESSION.setRoomOwner(data.room_owner)

            window.location.replace(`/room#${this.SESSION.inRoom()}`);
        })
    }

    cancelCreate () {
        this.MODAL.close();
    }

    enterRoom (id_room) {
        this.ROOMS.map(e => {
            if (parseInt(e.id) === parseInt(id_room)) {
                
                // verificando se está cheia
                if(parseInt(e.players)>=4) return this.ERROR.showError("A sala está cheia!");

                if (e.status !== 'REGISTER') return this.ERROR.showError("Não é mais possível participar desta sala!");

                if (parseInt(e.privated)) {
                    this.MODAL.show({
                        header: `
                            <h3>Sala de ${e.owner_name}</h3>
                            <small>Sala privada, entre com a senha para ter acesso</small>
                        `,
                        content:`
                            <div class="inline">
                                <div class="input-group"">
                                    <label>Senha:</label>
                                    <input type="password" placeholder="Insira a senha para acessar a sala" name="pass_room_access"/>
                                </div>
                                <button onclick="LOBBY.confirmEnterRoom(${e.id})">Acessar</button>
                                <button class="btn-brown" onclick="LOBBY.MODAL.close()">Cancelar</button>
                            </div>
                        `
                    });
                }else{
                    let obj = {
                        iduser: this.SESSION.getUserId(),
                        idroom: e.id,
                        pass: ''
                    };
                    this.access(obj);
                }
            }
        });
    }

    confirmEnterRoom (id) {
        let obj = {};
        obj.iduser = this.SESSION.getUserId();
        obj.idroom = id;
        obj.pass = document.querySelector('input[name=pass_room_access').value;
        if (obj.pass==='') return this.ERROR.showError('Insira a senha para acessar a sala!');
        obj.pass = CryptoJS.MD5(obj.pass).toString();

        this.access (obj);
    }

    access (obj) {

        this.MODAL.close();
        this.SPLASH_SCREEN.showSplash();

        fetch('./../../api/src/rest/room_user.php', {
            headers: {
                'Authorized': 'Baerer ' + this.SESSION.getJWT()
            },
            method: 'POST',
            body: JSON.stringify({
                method: 'access',
                data: obj
            })
        })
        .then(r=>r.json())
        .then(json => {
            this.SPLASH_SCREEN.closeSplash();

            if (json.success) {
                this.SESSION.setRoomID(json.data);
                this.MODAL.close();
                // window.location.replace(`./room.html`);
                window.location.replace(`./room.html#${this.SESSION.inRoom()}`);
            }else{
                this.ERROR.showError(json.msg);
            }
        });
    }

    onSocket() {
        this.socket.on('users', (data) => {
            this.getRooms(data)
            // verificar se usuário está em uma sala
        });
    }
}