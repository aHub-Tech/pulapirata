class game {
    constructor () {
        this.socket = io('/');

        this.SESSION = new session()
        this.SPLASH_SCREEN = new splashScreen()
        this.MODAL = new modal()
        this.ERROR = new error()
        this.HEADER = new header()
        this.ROOM = document.querySelector('div.room')
        this.USER = document.querySelector('div.user')
        this.RENDER = document.querySelector('div.render')
        this.ROOMS = {}

        // this.PLAYERS = document.querySelector('div.players')
        // this.SVG = document.querySelector('svg');
        // this.LOCALSTATUS = '';
        
        // this.SLOTS = [];
        // this.STATE = {
        //     room: null,
        //     slots: [],
        //     players: []
        // };


        // verificando se o usuário possui uma sessão
        if (!this.SESSION.isValid()) {
            return window.location.replace('/login')
        }

        // verificando se está em uma sala ou no lobby
        const page = this.SESSION.inRoom() ? 'room' : 'lobby'
        this.render(page);

        console.log(this.SESSION)
        
        // consulta toda a state da room
        // this.getState();
        // setInterval(_=> {
        //     if (this.STATE.room.status === 'FINISH') return false;
        //     this.getState();
        // }, 5000);

        // this.socket.emit('connect-room', {
        //     user_id: this.SESSION.getUserId()
        // })
        // this.socket.on('not-connect', () => {
        //     this.SESSION.setRoomID('lobby')
        //     window.location.replace('/lobby')
        // })
        // this.socket.on('connect-room-confirmed', (data) => {
        //     console.log(data)
        // })
    }

    async render (page) {
        const html = await fetch(`./views/${page}.html`)
        .then(r=> r.text())
        .then(r=> r)

        // limpando a splash
        this.SPLASH_SCREEN.closeSplash()

        this.RENDER.innerHTML = html

        // alimentando a header
        this.HEADER.show({
            room: `#${(this.SESSION.inRoom() ? this.SESSION.inRoom() : 'LOBBY')}`,
            user: (this.SESSION.getName().split(' ')[0])
        });

        if (page=='lobby') {
            this.inLobby()
        }else{
            this.inRoom()
        }
    }

    async inLobby() {
        // elementos do lobby
        this.BOX = document.querySelector('div.box')

        // conectando ao lobby
        this.socket.emit('connect-lobby', {
            'room_id': 'lobby',
            'user_id': (this.SESSION.getUserId()),
            'user_name': (this.SESSION.getName().split(' ')[0])
        })

        // recebendo lista de usuários atualizada a cada nova conexão
        this.socket.on('data', (data) => {
            this.ROOMS = data.data
            this.renderRooms(data)
        })

    }

    getRooms(data) {
        // const rooms = [];
        // let countRooms = 0;
        // data.data.forEach(e => {
        //     if (e.room_id!=='lobby') {
        //         if (!rooms[e.room_id]) {
        //             rooms[e.room_id] = {
        //                 privated: e.room_privated,
        //                 status: e.room_status,
        //                 // owner_name: ((e.room_owner) ? e.user_name : ''),
        //                 players: [e]
        //             };
        //         }else{
        //             rooms[e.room_id].players.push(e);
        //         }
        //         rooms[e.room_id].owner_name = ((e.room_owner) ? e.user_name : '')
        //         countRooms++
        //     }
        // })

        // this.ROOMS = rooms

        // if (countRooms) {
        //     this.renderRooms(rooms);
        // }else{
        //     let body = `<div class="info">Nenhuma sala encontrada</div>`;
        //     this.BOX.innerHTML = body;
        // }

        console.log(data)
    }

    renderRooms (data) {
        let body = '';

        for(const room of data.data) {

            if (room.room_id!=='lobby') {
            
                let privated = (room.room_privated) ? '<img style="max-width:12px"; src="./../app/img/lock.svg">' : '';
                
                let players = '';
                room.room_players.map(e => {
                    players += e.user_name.split(' ')[0] + ' | ';
                });
                players = players.slice(0, -3);
                
                body += `
                    <div class="card" title="Entrar na sala #${room.room_id}" onclick="GAME.enterRoom(${room.room_id})">
                        <div class="header">
                            <div class="left">
                                ${privated} 
                                #${room.room_id}
                            </div>
                            <div class="right">${room.room_status_description}</div>
                        </div>
                        <div class="content">
                            <div class="owner">OWNER</div>
                            <div class="name_owner">${room.room_owner}</div>
                        </div>
                        <div class="footer">
                            <div class="top">
                                <div class="left">PLAYERS</div>
                                <div class="right">${room.room_players.length}/4</div>
                            </div>
                            <hr>
                            <div class="bottom">
                                ${players}
                            </div>
                        </div>
                    </div>
                `;
            }

            this.BOX.innerHTML = body
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
                <button onclick="GAME.confirmCreate()">Criar</button>
                <button class="btn-brown" onclick="GAME.cancelCreate()">Cancelar</button>
            </div>`
        });
    }

    confirmCreate () {
        let room_pass = document.querySelector('input[name=pass_room]').value;
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

            console.log(data)

            // window.location.replace(`/room#${this.SESSION.inRoom()}`);

            this.render('room')
        })
    }

    cancelCreate () {
        this.MODAL.close();
    }

    // controles na room
    async inRoom() {
        this
        .SPLASH_SCREEN
        .showSplash(`
            <p>Aguardando mais piratas no convés...</p>
                <center>
                    <button class="btn-red" onclick="GAME.cancelRoom()">Cancelar Sala</button>
               </center>
        `);

        // conectando a room
        this.socket.emit('connect-room', {
            user_id: this.SESSION.getUserId()
        })
        // recebendo sinal de não conectado
        this.socket.on('not-connect', () => {
            this.SESSION.setRoomID('lobby')
            this.render('lobby')
            // window.location.replace('/lobby')
        })
        // recebendo confirmação de conexão com a room
        this.socket.on('connect-room-confirmed', (data) => {
            console.log(data)
        })
    }

    enterRoom (room_id) {

        for (const e of this.ROOMS) {

            if (parseInt(e.room_id) === parseInt(room_id)) {

                // verificando se está cheia
                if(parseInt(e.room_players.length)>=4) return this.ERROR.showError("A sala está cheia!");

                // status 0 = ABERTA / 1 = CHEIA / 2 = EM GAME
                if (e.room_status !== 0) return this.ERROR.showError("Não é mais possível participar desta sala!");

                if (e.room_privated) {
                    this.MODAL.show({
                        header: `
                            <h3>Sala de ${e.room_owner}</h3>
                            <small>Sala privada, entre com a senha para ter acesso</small>
                        `,
                        content:`
                            <div class="inline">
                                <div class="input-group"">
                                    <label>Senha:</label>
                                    <input type="password" placeholder="Insira a senha para acessar a sala" name="pass_room_access"/>
                                </div>
                                <button onclick="GAME.confirmEnterRoom(${e.room_id})">Acessar</button>
                                <button class="btn-brown" onclick="GAME.MODAL.close()">Cancelar</button>
                            </div>
                        `
                    });
                }else{
                    let obj = {
                        user_id: this.SESSION.getUserId(),
                        room_id: e.room_id,
                        room_pass: ''
                    };
                    this.access(obj);
                }
            }
        };
    }

    confirmEnterRoom (id) {
        let obj = {};
        obj.user_id = this.SESSION.getUserId();
        obj.room_id = id;
        obj.room_pass = document.querySelector('input[name=pass_room_access').value;
        if (obj.room_pass==='') return this.ERROR.showError('Insira a senha para acessar a sala!');
        obj.room_pass = CryptoJS.MD5(obj.room_pass).toString();

        this.access (obj);
    }

    access (obj) {

        this.MODAL.close();
        this.SPLASH_SCREEN.showSplash();

        this.socket.emit('enter-room', (obj))

        // senha invalida
        this.socket.on('not-authorized-room', () => {
            this.SPLASH_SCREEN.closeSplash();
            return this.ERROR.showError("Acesso não autorizado, tente novamente!");
        })

        // confirma entrada na sala
        this.socket.on('enter-room-confirmed', (data) => {
            console.log('acesso a room confirmada', data)
        })
    }

    // mapSlots() {
    //     let rects = this.SVG.querySelectorAll('rect');
    //     let i = 0;
    //     Array.from(rects).forEach(e => {
    //         e.id = (new Date().getTime()+i);
    //         e.onclick = ()=>{this.clickSlot(e.id)}
    //         this.STATE.slots.push({id: e.id, idroom:this.SESSION.inRoom(), checked: false, color: ''});
    //         i++;
    //     });

    //     fetch(`./../../api/src/rest/room_slot.php`, {
    //         method: 'POST',
    //         body: JSON.stringify({
    //             method: 'registerAll',
    //             data: this.STATE.slots
    //         })
    //     })
    //     .then(r=>r.json())
    //     .then(json => {
    //         // this.SPLASH_SCREEN.closeSplash();
    //         if (json.success) {
    //             // console.log(json);
    //         }else{
    //             this.ERROR.showError(json.msg);
    //         }
    //     });
    // }

    // getState () {

    //     fetch (`./../../api/src/rest/room.php?method=getState&idroom=${this.SESSION.inRoom()}`, {
    //         mheaders: {
    //             'Authorized': 'Baerer ' + this.SESSION.getJWT()
    //         }
    //     })
    //     .then(r=>r.json())
    //     .then(json => {
    //         if (json.success) {

    //             // comparando os dados para ver se existem atualizações
    //             if (JSON.stringify(this.STATE) !== JSON.stringify(json.data)) {
    //                 this.STATE = json.data;

    //                 // monsta lista de jogadores
    //                 this.showPlayers();
    //                 this.setSlots();
    //             }

    //         }else{
    //             // se houver qualquer erro na getState, enjetamos o jogador pro lobby
    //             this.SESSION.setRoomID(null);
    //             window.location.replace('./lobby.html');
    //         }
    //     });
    // }

    // setSlots () {
    //     if (this.STATE.slots.length>0) {
    //         let rects = this.SVG.querySelectorAll('rect');
            
    //         let i = 0;
    //         Array.from(rects).forEach(e => {
    //             e.id = this.STATE.slots[i].id;
    //             e.onclick = ()=>{this.clickSlot(e.id)}
    //             if (parseInt(this.STATE.slots[i].checked)) {
    //                 e.style.fill = '#'+this.STATE.slots[i].color;
    //             }
    //             i++;
    //         });
    //     }else{
    //         this.mapSlots();
    //     }
    // }

    // clickSlot (id) {
    //     this.STATE.slots.map(e => {
    //         if (e.id === id) {
                
    //             if (parseInt(e.checked)) return this.ERROR.showError("Este slot já foi marcado!");
    //             if (this.STATE.room.status !== 'INPROGRESS') return false;

    //             let obj = {};
    //             obj.id = e.id;
    //             obj.idroom = this.SESSION.inRoom();
    //             obj.iduser = this.SESSION.getUserId();
    //             obj.color = this.SESSION.getColor();
    //             obj.checked = true;

    //             this.SPLASH_SCREEN.showSplash();

    //             fetch(`./../../api/src/rest/room.php`, {
    //                 method: 'POST',
    //                 body: JSON.stringify({
    //                     method: 'check',
    //                     data: obj
    //                 })
    //             })
    //             .then(r=>r.json())
    //             .then(json => {
    //                 this.SPLASH_SCREEN.closeSplash();

    //                 if (json.success) {
    //                     this.SVG.getElementById(e.id).style.fill = '#'+this.SESSION.getColor();
    //                     this.getState();
    //                 }else{
    //                     this.ERROR.showError(json.msg);
    //                 }
    //             });
    //         }
    //     });
    // }

    // showPlayers () {
    //     if (this.STATE.players.length>0) {
    //         let inRoom = false;
    //         let li = '';
    //         let ul = this.PLAYERS.querySelector('ul');
    //         let move = this.PLAYERS.querySelector('span');

    //         this.STATE.players.forEach(e => {
    //             li += `
    //             <li>
    //                 <div class="player">
    //                     <div class="avatar" style="border: 5px solid #${e.color};">
    //                         <!-- 
    //                             <img src="https://store.playstation.com/store/api/chihiro/00_09_000/container/GB/en/19/EP4312-NPEB00474_00-AVSMOBILET000288/image?w=320&h=320&bg_color=000000&opacity=100&_version=00_09_000">
    //                         -->
    //                     </div>
    //                     <div class="name"> ${e.user_name.split(' ')[0]} </div>
    //                 </div>
    //             </li>
    //             `;

    //             // comparando o jogador logado com a lista
    //             if (e.iduser === this.SESSION.getUserId()) {
    //                 this.SESSION.setColor(e.color); // getando a cor
    //                 inRoom = true; // presente na room
    //             }
    //             // verificando jogador da vez
    //             if (parseInt(e.move)) {
    //                 move.innerHTML = `${e.user_name.split(' ')[0]}`;
    //             }
    //         });

    //         // se o jogador não estiver presente entre os jogadores da sala
    //         if (!inRoom) {
    //             this.SESSION.setRoomID(null);
    //             return window.location.replace('./lobby.html');
    //         }

    //         ul.innerHTML = li;

    //         // chamar função para tela de iniciar jogo, se status = REGISTER
    //         this.ready();
    //     }
    // }

    // ready () {

    //     if (this.STATE.room.status === 'REGISTER' && this.STATE.players.length>1)  {

    //         // verificando se o jogador é o dono da sala
    //         if (this.SESSION.getUserId() === this.STATE.room.owner) {
    //             this.SPLASH_SCREEN.closeSplash();

    //             this.MODAL.close();
    //             this.MODAL.show({
    //                 header:`
    //                     <h3>PRONTO PARA INICIAR O JOGO</h3>
    //                     <small>Você já pode iniciar o jogo ou aguardar mais jogadores</small>
    //                 `,
    //                 content: `
    //                     <button onclick="ROOM.start()">Iniciar Jogo</button>
    //                 `
    //             });
    //         }else{
    //             this.SPLASH_SCREEN.showSplash('Aguardando o capitão iniciar a partida...');
    //         }
    //     }
    //     if (this.STATE.room.status === 'INPROGRESS' && this.LOCALSTATUS !== this.STATE.room.status) {
    //         this.SPLASH_SCREEN.closeSplash();
    //         this.LOCALSTATUS = this.STATE.room.status;
    //     } 
    //     if (this.STATE.room.status === 'FINISH' && this.LOCALSTATUS !== this.STATE.room.status) {
    //         this.SPLASH_SCREEN.closeSplash();
    //         this.LOCALSTATUS = this.STATE.room.status;
            

    //         let player = this.STATE.players.filter(e => parseInt(e.move))[0];
            
    //         let td = ``;
    //         this.STATE.players.map(e => {
    //             td += `
    //                 <tr>
    //                     <td>${e.user_name}</td>
    //                     <td>${e.points}</td>
    //                 </tr>
    //             `;
    //         });

    //         // adicionando animação de salto do pirata
    //         document.querySelector('.game img').classList.remove('pirateAnimation');
    //         document.querySelector('.game img').classList.add('jumpAnimationTop');

    //         setTimeout(_=> {
    //             this.MODAL.close();
    //             this.MODAL.show({
    //                 header:`
    //                     <h3>OPA!!! PULA PIRATA!!!</h3>
    //                 `,
    //                 content: `
    //                     <div class="finish">
    //                         <p>
    //                             <span>${player.user_name.split(' ')[0]}</span>
    //                             FEZ O PIRATA PULAR!!!
    //                         </p>
    //                         <div>
    //                             <table>
    //                                 <thead>
    //                                     <tr>
    //                                         <td>User</td>
    //                                         <td>Points</td>
    //                                     </tr>
    //                                 </thead>
    //                                 <tbody>
    //                                     ${td}
    //                                 </tbody>
    //                             </table>
    //                         </div>
    //                         <div><small>Você será enviado para o <a style="color: #a90d5c;cursor:pointer;" title="Ir para o lobby" onclick="ROOM.lobby()">lobby<a> em 10 segundos</small></div>
    //                     </div>
    //                 `
    //             });
    //         }, 3000);

    //         // levar o jogador para o lobby
    //         setTimeout(_=> {
    //             this.SESSION.setRoomID(null);
    //             window.location.replace('./lobby.html');
    //         }, 10000);
    //     }
    //     if (this.STATE.room.status === 'EXPIRED' && this.LOCALSTATUS !== this.STATE.room.status) {
    //         this.SPLASH_SCREEN.closeSplash();
    //         this.LOCALSTATUS = this.STATE.room.status;
            

    //         let td = ``;
    //         this.STATE.players.map(e => {
    //             td += `
    //                 <tr>
    //                     <td>${e.user_name}</td>
    //                     <td>${e.points}</td>
    //                 </tr>
    //             `;
    //         });

    //         this.MODAL.close();
    //         this.MODAL.show({
    //             header:`
    //                 <h3>O TEMPO DA SALA EXPIROU!</h3>
    //             `,
    //             content: `
    //                 <div class="finish">
    //                     <p>
    //                         Os piratas demoraram de mais, o tempo da sala acabou!
    //                     </p>
    //                     <img style="max-width: 250px;" src="./../img/splash.gif">
    //                     <div><small>Você será enviado para o <a style="color: #a90d5c;cursor:pointer;" title="Ir para o lobby" onclick="ROOM.lobby()">lobby<a> em 10 segundos</small></div>
    //                 </div>
    //             `
    //         });

    //         // levar o jogador para o lobby
    //         setTimeout(_=> {
    //             this.SESSION.setRoomID(null);
    //             window.location.replace('./lobby.html');
    //         }, 10000);
    //     }
    // }

    // lobby () {
    //     this.SESSION.setRoomID(null);
    //     window.location.replace('./lobby.html');
    // }

    // start () {
    //     let obj = {};
    //     obj.iduser = this.SESSION.getUserId();
    //     obj.idroom = this.STATE.room.id;

    //     this.MODAL.close();
    //     this.SPLASH_SCREEN.showSplash();

    //     fetch(`./../../api/src/rest/room.php`, {
    //         method: 'POST',
    //         body: JSON.stringify({
    //             method: 'start',
    //             data: obj
    //         })
    //     })
    //     .then(r=>r.json())
    //     .then(json => {
    //         this.SPLASH_SCREEN.closeSplash();
    //         if (json.success) {
    //             // console.log(json);
    //         }else{
    //             this.ERROR.showError(json.msg);
    //         }
    //     });
    // }

    // cancelRoom () {
    //     let obj = {};
    //     obj.iduser = this.SESSION.getUserId();
    //     obj.idroom = this.STATE.room.id;

    //     this.MODAL.close();
    //     this.SPLASH_SCREEN.showSplash();

    //     fetch(`./../../api/src/rest/room.php`, {
    //         method: 'POST',
    //         body: JSON.stringify({
    //             method: 'cancel',
    //             data: obj
    //         })
    //     })
    //     .then(r=>r.json())
    //     .then(json => {
    //         this.SPLASH_SCREEN.closeSplash();
    //         if (json.success) {
    //             this.SESSION.setRoomID(null);
    //             window.location.replace('./lobby.html');
    //         }else{
    //             this.ERROR.showError(json.msg);
    //         }
    //     });
    // }
}