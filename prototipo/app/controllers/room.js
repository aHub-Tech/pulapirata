class room {
    constructor () {
        this.SESSION = new session();
        this.SPLASH_SCREEN = new splashScreen();
        this.MODAL = new modal();
        this.ERROR = new error();
        this.HEADER = new header();
        this.ROOM = document.querySelector('div.room');
        this.USER = document.querySelector('div.user');
        this.PLAYERS = document.querySelector('div.players');
        this.SVG = document.querySelector('svg');
        this.LOCALSTATUS = '';
        // this.SLOTS = [];
        this.STATE = {
            room: null,
            slots: [],
            players: []
        };
        this.create();
        
        // consulta toda a state da room
        this.getState();
        setInterval(_=> {
            if (this.STATE.room.status === 'FINISH') return false;
            this.getState();
        }, 5000);
    }

    create () {
        if (!this.SESSION.isValid()) return window.location.replace('./login.html');
        if (!this.SESSION.inRoom()) return window.location.replace('./lobby.html');

        // alimentando a header
        this.HEADER.show({
            room: `#${this.SESSION.inRoom()}`,
            user: (this.SESSION.getName().split(' ')[0])
        });

        // splash enquanto não temos o número suficente de players
        this.SPLASH_SCREEN.showSplash(`<p>Aguardando mais piratas no convés...</p>
        <center><button class="btn-red" onclick="ROOM.cancelRoom()">Cancelar Sala</button></center>
        `);
    }

    mapSlots() {
        let rects = this.SVG.querySelectorAll('rect');
        let i = 0;
        Array.from(rects).forEach(e => {
            e.id = (new Date().getTime()+i);
            e.onclick = ()=>{this.clickSlot(e.id)}
            this.STATE.slots.push({id: e.id, idroom:this.SESSION.inRoom(), checked: false, color: ''});
            i++;
        });

        fetch(`./../../api/src/rest/room_slot.php`, {
            method: 'POST',
            body: JSON.stringify({
                method: 'registerAll',
                data: this.STATE.slots
            })
        })
        .then(r=>r.json())
        .then(json => {
            // this.SPLASH_SCREEN.closeSplash();
            if (json.success) {
                // console.log(json);
            }else{
                this.ERROR.showError(json.msg);
            }
        });
    }

    getState () {

        fetch (`./../../api/src/rest/room.php?method=getState&idroom=${this.SESSION.inRoom()}`, {
            mheaders: {
                'Authorized': 'Baerer ' + this.SESSION.getJWT()
            }
        })
        .then(r=>r.json())
        .then(json => {
            if (json.success) {

                // comparando os dados para ver se existem atualizações
                if (JSON.stringify(this.STATE) !== JSON.stringify(json.data)) {
                    this.STATE = json.data;

                    // monsta lista de jogadores
                    this.showPlayers();
                    this.setSlots();
                }

            }else{
                // se houver qualquer erro na getState, enjetamos o jogador pro lobby
                this.SESSION.setRoomID(null);
                window.location.replace('./lobby.html');
            }
        });
    }

    setSlots () {
        if (this.STATE.slots.length>0) {
            let rects = this.SVG.querySelectorAll('rect');
            
            let i = 0;
            Array.from(rects).forEach(e => {
                e.id = this.STATE.slots[i].id;
                e.onclick = ()=>{this.clickSlot(e.id)}
                if (parseInt(this.STATE.slots[i].checked)) {
                    e.style.fill = '#'+this.STATE.slots[i].color;
                }
                i++;
            });
        }else{
            this.mapSlots();
        }
    }

    clickSlot (id) {
        this.STATE.slots.map(e => {
            if (e.id === id) {
                
                if (parseInt(e.checked)) return this.ERROR.showError("Este slot já foi marcado!");
                if (this.STATE.room.status !== 'INPROGRESS') return false;

                let obj = {};
                obj.id = e.id;
                obj.idroom = this.SESSION.inRoom();
                obj.iduser = this.SESSION.getUserId();
                obj.color = this.SESSION.getColor();
                obj.checked = true;

                this.SPLASH_SCREEN.showSplash();

                fetch(`./../../api/src/rest/room.php`, {
                    method: 'POST',
                    body: JSON.stringify({
                        method: 'check',
                        data: obj
                    })
                })
                .then(r=>r.json())
                .then(json => {
                    this.SPLASH_SCREEN.closeSplash();

                    if (json.success) {
                        this.SVG.getElementById(e.id).style.fill = '#'+this.SESSION.getColor();
                        this.getState();
                    }else{
                        this.ERROR.showError(json.msg);
                    }
                });
            }
        });
    }

    showPlayers () {
        if (this.STATE.players.length>0) {
            let inRoom = false;
            let li = '';
            let ul = this.PLAYERS.querySelector('ul');
            let move = this.PLAYERS.querySelector('span');

            this.STATE.players.forEach(e => {
                li += `
                <li>
                    <div class="player">
                        <div class="avatar" style="border: 5px solid #${e.color};">
                            <!-- 
                                <img src="https://store.playstation.com/store/api/chihiro/00_09_000/container/GB/en/19/EP4312-NPEB00474_00-AVSMOBILET000288/image?w=320&h=320&bg_color=000000&opacity=100&_version=00_09_000">
                            -->
                        </div>
                        <div class="name"> ${e.user_name.split(' ')[0]} </div>
                    </div>
                </li>
                `;

                // comparando o jogador logado com a lista
                if (e.iduser === this.SESSION.getUserId()) {
                    this.SESSION.setColor(e.color); // getando a cor
                    inRoom = true; // presente na room
                }
                // verificando jogador da vez
                if (parseInt(e.move)) {
                    move.innerHTML = `${e.user_name.split(' ')[0]}`;
                }
            });

            // se o jogador não estiver presente entre os jogadores da sala
            if (!inRoom) {
                this.SESSION.setRoomID(null);
                return window.location.replace('./lobby.html');
            }

            ul.innerHTML = li;

            // chamar função para tela de iniciar jogo, se status = REGISTER
            this.ready();
        }
    }

    ready () {

        if (this.STATE.room.status === 'REGISTER' && this.STATE.players.length>1)  {

            // verificando se o jogador é o dono da sala
            if (this.SESSION.getUserId() === this.STATE.room.owner) {
                this.SPLASH_SCREEN.closeSplash();

                this.MODAL.close();
                this.MODAL.show({
                    header:`
                        <h3>PRONTO PARA INICIAR O JOGO</h3>
                        <small>Você já pode iniciar o jogo ou aguardar mais jogadores</small>
                    `,
                    content: `
                        <button onclick="ROOM.start()">Iniciar Jogo</button>
                    `
                });
            }else{
                this.SPLASH_SCREEN.showSplash('Aguardando o capitão iniciar a partida...');
            }
        }
        if (this.STATE.room.status === 'INPROGRESS' && this.LOCALSTATUS !== this.STATE.room.status) {
            this.SPLASH_SCREEN.closeSplash();
            this.LOCALSTATUS = this.STATE.room.status;
        } 
        if (this.STATE.room.status === 'FINISH' && this.LOCALSTATUS !== this.STATE.room.status) {
            this.SPLASH_SCREEN.closeSplash();
            this.LOCALSTATUS = this.STATE.room.status;
            

            let player = this.STATE.players.filter(e => parseInt(e.move))[0];
            
            let td = ``;
            this.STATE.players.map(e => {
                td += `
                    <tr>
                        <td>${e.user_name}</td>
                        <td>${e.points}</td>
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
                            <div><small>Você será enviado para o <a style="color: #a90d5c;cursor:pointer;" title="Ir para o lobby" onclick="ROOM.lobby()">lobby<a> em 10 segundos</small></div>
                        </div>
                    `
                });
            }, 3000);

            // levar o jogador para o lobby
            setTimeout(_=> {
                this.SESSION.setRoomID(null);
                window.location.replace('./lobby.html');
            }, 10000);
        }
        if (this.STATE.room.status === 'EXPIRED' && this.LOCALSTATUS !== this.STATE.room.status) {
            this.SPLASH_SCREEN.closeSplash();
            this.LOCALSTATUS = this.STATE.room.status;
            

            let td = ``;
            this.STATE.players.map(e => {
                td += `
                    <tr>
                        <td>${e.user_name}</td>
                        <td>${e.points}</td>
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
                        <img style="max-width: 250px;" src="./../img/splash.gif">
                        <div><small>Você será enviado para o <a style="color: #a90d5c;cursor:pointer;" title="Ir para o lobby" onclick="ROOM.lobby()">lobby<a> em 10 segundos</small></div>
                    </div>
                `
            });

            // levar o jogador para o lobby
            setTimeout(_=> {
                this.SESSION.setRoomID(null);
                window.location.replace('./lobby.html');
            }, 10000);
        }
    }

    lobby () {
        this.SESSION.setRoomID(null);
        window.location.replace('./lobby.html');
    }

    start () {
        let obj = {};
        obj.iduser = this.SESSION.getUserId();
        obj.idroom = this.STATE.room.id;

        this.MODAL.close();
        this.SPLASH_SCREEN.showSplash();

        fetch(`./../../api/src/rest/room.php`, {
            method: 'POST',
            body: JSON.stringify({
                method: 'start',
                data: obj
            })
        })
        .then(r=>r.json())
        .then(json => {
            this.SPLASH_SCREEN.closeSplash();
            if (json.success) {
                // console.log(json);
            }else{
                this.ERROR.showError(json.msg);
            }
        });
    }

    cancelRoom () {
        let obj = {};
        obj.iduser = this.SESSION.getUserId();
        obj.idroom = this.STATE.room.id;

        this.MODAL.close();
        this.SPLASH_SCREEN.showSplash();

        fetch(`./../../api/src/rest/room.php`, {
            method: 'POST',
            body: JSON.stringify({
                method: 'cancel',
                data: obj
            })
        })
        .then(r=>r.json())
        .then(json => {
            this.SPLASH_SCREEN.closeSplash();
            if (json.success) {
                this.SESSION.setRoomID(null);
                window.location.replace('./lobby.html');
            }else{
                this.ERROR.showError(json.msg);
            }
        });
    }
}