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

        // verificando se o usuário possui uma sessão
        if (!this.SESSION.isValid()) {
            return window.location.replace('/login')
        }

        // verificando se está em uma sala ou no lobby
        const page = this.SESSION.inRoom() ? 'room' : 'lobby'
        this.render(page);

        this.welcome()
    }

    welcome() {
        this.MODAL.show({
            header:`
                <h3>Bem Vindo a Taverna!</h3>
                <small>O encontro dos piratas é aqui, aproveita a estadia!</small>
            `,
            content: `
            <img src="https://i.pinimg.com/originals/1c/32/fa/1c32fa28d4375db1cd0c4cbd40c8e156.gif">
            <div class="inline">
                <button onclick="GAME.confirmWelcome()">Entendi</button>
            </div>`
        });
    }

    playSound (sound, volume) {
        const audio = new Audio()
        audio.src = `./../app/audio/${sound}.mp3`
        audio.volume = 0.1//parseFloat('0.'+volume)
        audio.play()
    }

    confirmWelcome() {
        this.playSound('pirate_music', 2)
        this.MODAL.close()
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
            room: `#${(this.SESSION.inRoom() ? this.SESSION.inRoom() : 'TAVERNA')}`,
            user: (this.SESSION.getName().split(' ')[0])
        });

        if (page=='lobby') {
            this.inLobby()
        }else{
            this.inRoom()
        }

        // this.socket.on('who-are-you', () => {
        //     console.log('o servidor mandou perguntar quem você estranho ?')
        // })
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
            console.log(data)

            this.ROOMS = data.data
            this.renderRooms(data)
        })

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
                            <div class="name_owner">${room.room_owner_name}</div>
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

        const data = {
            user_id: this.SESSION.getUserId(), 
            room_pass: room_pass
        }
        
        this.socket.emit('create-room', data);
        this.socket.on('create-room-confirmed', async (data) => {
        
            const me = data.data.room_players.find(e => e.user_id === this.SESSION.getUserId())

            this.SESSION.setRoomID(me.room_id)
            this.SESSION.setColor(me.user_color)
            // this.SESSION.setRoomOwner(me.room_owner)

            await this.render('room')

            this.socket.emit('map-slots', this.mapSlots(data.data))

            this.showPlayers (data.data)
        })
    }

    cancelCreate () {
        this.MODAL.close();
    }

    // controles na room
    async inRoom() {
        this.PLAYERS = document.querySelector('div.players');
        this.SVG = document.querySelector('svg');

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
        
        // recebendo dados da sala deo utros jogadores
        this.socket.on('data-room', async (data) => {

            console.log(data);

            this.showPlayers(data.data)
            this.setSlots(data.data)
        })

        // tornando novo dono da sala por desistência
        this.socket.on('room_new_owner', async (data) => {
            this.showPlayers(data.data)
            this.ERROR.showError(data.msg)
        })
    }

    cancelRoom (room_id) {
        let obj = {};
        obj.user_id = this.SESSION.getUserId();
        obj.room_id = this.SESSION.getRoomId();

        // this.MODAL.close();
        // this.SPLASH_SCREEN.showSplash();

        this.socket.emit('cancel-room', obj)

        // cancelamento de sala não autorizado
        this.socket.on('cancel-room-not-authorized', (data) => {
            return this.ERROR.showError(data.msg);
        })

        // cacelamento confirmado
        this.socket.on('canceled-room', () => {
            this.SESSION.setRoomID('lobby')
            this.render('lobby')
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
                            <h3>Sala de ${e.room_owner_name}</h3>
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
        // this.SPLASH_SCREEN.showSplash();
        

        this.socket.emit('enter-room', (obj))

        // senha invalida
        this.socket.on('not-authorized-room', () => {
            this.SPLASH_SCREEN.closeSplash();
            return this.ERROR.showError("Acesso não autorizado, tente novamente!");
        })

        // confirma entrada na sala
        this.socket.on('enter-room-confirmed', async (data) => {
        // this.socket.on('data-room', async (data) => {
            
            const me = data.data.room_players.find(e => e.user_id === this.SESSION.getUserId())

            this.SESSION.setRoomID(me.room_id)
            this.SESSION.setColor(me.user_color)

            await this.render('room')
            
            this.showPlayers(data.data)
            this.setSlots(data.data)
        })
    }


    // --- room controller

    showPlayers (data) {

        if (data.room_players.length>=1) {
            let inRoom = false;
            let li = '';
            let ul = this.PLAYERS.querySelector('ul');
            let move = this.PLAYERS.querySelector('span');

            data.room_players.forEach(e => {
                li += `
                <li>
                    <div class="player">
                        <div class="avatar" style="border: 5px solid #${e.user_color};">
                            <!-- 
                                <img src="https://store.playstation.com/store/api/chihiro/00_09_000/container/GB/en/19/EP4312-NPEB00474_00-AVSMOBILET000288/image?w=320&h=320&bg_color=000000&opacity=100&_version=00_09_000">
                            -->
                        </div>
                        <div class="name"> ${e.user_name.split(' ')[0]} </div>
                    </div>
                </li>
                `;

                // verificando jogador da vez
                if (data.room_turn_player === e.user_id) {
                    move.innerHTML = `${e.user_name.split(' ')[0]}`;
                }
            });

            ul.innerHTML = li;
            
            // chamar função para tela de iniciar jogo, se status = REGISTER
            this.ready(data);
        }
    }

    showMyTurn () {
        this.MODAL.show({
            header:`
                <h3>Sua vez de jogar!</h3>
                <small>Vamos lá, pense bem qual slot marcar para não perder o jogo!</small>
            `,
            content: `
            <img style="max-width:400px;" src="https://cdn.dribbble.com/users/2844289/screenshots/7721137/pirate_run-cycle_dribbble_00096.gif">
            <div class="inline">
                <button onclick="GAME.confirmMyTurn()">Ok</button>
            </div>`
        });

        // this.playSound('my_turn', 1)
    }

    confirmMyTurn() {
        this.MODAL.close()
    }

    ready (data) {

        if (data.room_status === 0 && data.room_players.length>1)  {
            console.log('status 0: aberto')

            // verificando se o jogador é o dono da sala
            if (this.SESSION.getUserId() === data.room_owner) {
                this.SPLASH_SCREEN.closeSplash();

                this.MODAL.close();
                this.MODAL.show({
                    header:`
                        <h3>PRONTO PARA INICIAR O JOGO</h3>
                        <small>Você já pode iniciar o jogo ou aguardar mais jogadores</small>
                    `,
                    content: `
                        <button onclick="GAME.start()">Iniciar Jogo</button>
                    `
                });
            }else{
                console.log('nao é o dono')
                this.SPLASH_SCREEN.showSplash('Aguardando o capitão iniciar a partida...');
            }
        }else{
            this.MODAL.close()
            this
            .SPLASH_SCREEN
            .showSplash(`
                <p>Aguardando mais piratas no convés...</p>
                    <center>
                        <button class="btn-red" onclick="GAME.cancelRoom(${data.room_id})">Cancelar Sala</button>
                </center>
            `);
        }
        if (data.room_status === 2) {
            console.log('status 2: game')
            this.MODAL.close()
            this.SPLASH_SCREEN.closeSplash()
            // this.getPositionMouse ()
            
            if (data.room_turn_player===this.SESSION.getUserId()) this.showMyTurn()
        } 
        if (data.room_status === 3) {
            console.log('status 3: finalizado')
            this.SPLASH_SCREEN.closeSplash();
            // this.LOCALSTATUS = this.STATE.room.status;
            
            let player = data.room_players.find(p => p.user_id === data.room_turn_player);

            if (player.user_id === this.SESSION.getUserId()) {
                this.playSound('game_over', 1)
            }else{
                this.playSound('winner', 1)
            }
            
            let td = ``;
            data.room_players.map(p => {
                td += `
                    <tr>
                        <td>${p.user_name}</td>
                        <td>${p.points}</td>
                    </tr>
                `;
            });

            // adicionando animação de salto do pirata
            document.querySelector('.game img').classList.remove('pirateAnimation');
            document.querySelector('.game img').classList.add('jumpAnimationTop');

            setTimeout(_=> {
                this.MODAL.close();
                this.MODAL.show({
                    header:`
                        <h3>OPA!!! PULA PIRATA!!!</h3>
                    `,
                    content: `
                        <div class="finish">
                            <p>
                                <span>${player.user_name.split(' ')[0]}</span>
                                FEZ O PIRATA PULAR!!!
                            </p>
                            <div>
                                <table>
                                    <thead>
                                        <tr>
                                            <td>User</td>
                                            <td>Points</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${td}
                                    </tbody>
                                </table>
                            </div>
                            <div><small>Voltar para a Taverna <a style="color: #a90d5c;cursor:pointer;" title="Ir para a Taverna" onclick="GAME.lobby()">Taverna<a></small></div>
                        </div>
                    `
                });
            }, 3000);
        }
        // tempo da sala expirado
        if (data.room_status === 4) {
            console.log('status 4: expirado')
            this.SPLASH_SCREEN.closeSplash();
            // this.LOCALSTATUS = this.STATE.room.status;
            

            let td = ``;
            data.room_players.map(p => {
                td += `
                    <tr>
                        <td>${p.user_name}</td>
                        <td>${p.points}</td>
                    </tr>
                `;
            });

            this.MODAL.close();
            this.MODAL.show({
                header:`
                    <h3>O TEMPO DA SALA EXPIROU!</h3>
                `,
                content: `
                    <div class="finish">
                        <p>
                            Os piratas demoraram de mais, o tempo da sala acabou!
                        </p>
                        <img style="max-width: 250px;" src="./../app/img/splash.gif">
                        <div><small>Voltar para a <a style="color: #a90d5c;cursor:pointer;" title="Ir para a Taverna" onclick="GAME.lobby()">Taverna<a></small></div>
                    </div>
                `
            });
        }
        if (data.room_status === 5) {
            console.log('status 5: wo')
            this.SPLASH_SCREEN.closeSplash()


            let td = ``;
            data.room_players.map(p => {
                td += `
                    <tr>
                        <td>${p.user_name}</td>
                        <td>${p.points}</td>
                    </tr>
                `;
            });

            this.MODAL.close();
            this.MODAL.show({
                header:`
                    <h3>Todos desistiram!</h3>
                `,
                content: `
                    <div class="finish">
                        <p>
                            Parabéns você é o mais assustador dos sete mares!
                        </p>
                        <img style="max-width: 250px;" src="./../app/img/splash.gif">
                        <div><small>Voltar para a <a style="color: #a90d5c;cursor:pointer;" title="Ir para a Taverna" onclick="GAME.lobby()">Taverna<a></small></div>
                    </div>
                `
            });
        }
    }

    lobby() {
        this.SESSION.setRoomID('lobby')
        this.render('lobby')
        this.MODAL.close()
    }

    mapSlots(data) {
        let rects = this.SVG.querySelectorAll('rect');
        let i = 0;
        const slots = []
        Array.from(rects).forEach(e => {
            e.id = (new Date().getTime()+i);
            e.onclick = ()=>{this.clickSlot(e.id, data)}
            slots.push({id: e.id, idroom:data.room_id, checked: false, color: ''});
            i++;
        });

        return slots
    }

    setSlots (data) {
        // if (data.slots.length>0) {
            let rects = this.SVG.querySelectorAll('rect');
            
            let i = 0;
            Array.from(rects).forEach(e => {
                e.id = data.room_slots[i].slot_id;
                e.onclick = ()=>{this.clickSlot(e.id, data)}
                if (data.room_slots[i].slot_checked) {
                    e.style.fill = '#'+data.room_slots[i].slot_color;
                }
                i++;
            });
        // }else{
        //     this.mapSlots();
        // }
    }

    start () {
        let obj = {};
        obj.user_id = this.SESSION.getUserId();
        
        this.socket.emit('start-game' , obj)
        this.socket.on('start-game-confirmed', (data) => {
            this.showPlayers(data.data)
        })
    }

    // getPositionMouse () {
    //     document.onmousemove = (e) => {

    //         this.socket.emit('show-my-position-cursor', ({
    //             user_id: this.SESSION.getUserId(),
    //             cursor: {
    //                 x: e.x/window.innerWidth, 
    //                 y: e.y
    //             }
    //         }))
    //     }

    //     this.socket.on('show-outher-cursor-position', (data) => {
    //         const body = document.body;
    //         const cursor = document.getElementById(`${data.user_id}`) || document.createElement('div')
    //         cursor.innerHTML = ''

    //         const icon = document.createElement('i')
    //         icon.classList.add(`fa`)
    //         icon.classList.add(`fa-hand-pointer`)
    //         icon.style = `color: #${data.user_color};`

    //         cursor.appendChild(icon)

    //         const label = document.createElement('label')
    //         label.style = `
    //             font-size: 8px;
    //             padding: 5px;
    //         `
    //         label.innerHTML = data.user_name

    //         cursor.appendChild(label)

    //         cursor.style = `
    //             width: 120px;
    //             display: flex;
    //             flex-direction: column;
    //             position: absolute;
    //             pointer-events: none;
    //             left: ${(data.cursor.x*window.innerWidth)}px;
    //             top: ${data.cursor.y}px;
    //             z-index: 1;
    //             align-items: center;

    //         `

    //         cursor.id = data.user_id
            
    //         body.appendChild(cursor)
    //     })
    // }

    clickSlot (slot_id, data) {

        this.socket.emit('click-on-slot', {
            user_id: this.SESSION.getUserId(),
            slot_id: slot_id
        })

        this.socket.on('click-on-slot-error', (data) => {
            this.ERROR.showError(data.error)
        })

        // if (data.room_turn_player === this.SESSION.getUserId()) {
        //     this.playSound('checked_success', 1)
        // }else{
        //     this.playSound('checked_error', 1)
        // }
    }
    

}