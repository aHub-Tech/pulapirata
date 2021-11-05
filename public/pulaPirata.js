/*
    cliclo da aplicação
    1. create -> criar dados de slots
    2. register -> enviar sessao e slots para o server, registrar sessao
    3. logar -> com o resquest logar usuario no client
    4. patch -> atualizar slots no client
    5. onSlot -> quando usuario clica no slot, macar como checked, envia para o server
    6. getSate -> consome informações do servidor enquanto espera a vez de jogar
*/

class pulaPirata {
    STATE = null;
    SESSION = null;
    PIRATA = null;
    ERROR = null;

    constructor () {
        this.PIRATA = document.querySelector('div.pirata');
        this.ERROR = document.querySelector('div.error');
        this.resetApp();
        this.create();
    }

    // reseta as variáveis para o estado inicial
    resetApp () {
        this.STATE = {
            idroom: null,
            owner: null,
            playerIn: null,
            status: 'register', // register, listen, inprogress, finish
            players: [],
            slots: []
        };
    }

    create () {
        // adicionando o baú a tela, capturando os slots e adicionando os ids
        // this.PIRATA.innerHTML = svg_barril;

        // sorteando o slot com JUMP da rodada
        let rand = Math.floor(Math.random()*20);

        // capturando cada rect do SVG para criar o array de slots
        let areas = Array.from(this.PIRATA.querySelectorAll('rect'));
        areas.forEach((e, index) => {
            e.id = `slot_${index}`;

            // adicionando o slot configurado ao array de slots
            this.STATE.slots.push({
                id: `slot_${index}`, 
                checked: false, 
                // setando o JUMP caso o index seja igual ao sorteado
                "jump": (e.index === rand) ? true : false
            });
        });
    }

    register () {

        // verificando se o uario já está em sessao
        if (this.SESSION !== null) return false;

        // executado quando o usuário clica em entrar após fornecer um nome
        let obj = {};
        obj.name = document.querySelector('input[name=name]').value;
        obj.email = document.querySelector('input[name=email]').value;
        obj.pass = CryptoJS.MD5(document.querySelector('input[name=pass]').value).toString();

        if (obj.name.trim() === '' || obj.email.trim() || obj.pass.trim()) this.showError('Dados inválidos!');

        // gerando a cor do jogador de forma randomica
        let randomColor = Math.floor(Math.random()*16777215).toString(16);
        this.SESSION = {id: null, name: name, color: randomColor};

        // enviando registrando no servidor
        fetch('./api/src/rest/user.php', {
            method: 'POST',
            body: JSON.stringify({
                method: 'register',
                data: obj
            })
        })
        .then(r=>r.json())
        .then(json => {
            if (json.success) {

            }else{
                showError(json.msg);
            }
        });

    }

    showError (msg) {
        this.ERROR.innerHTML = msg;
        this.ERROR.classList.add('show');
        setTimeout(_=> this.ERROR.classList.remove('show'), 5000);
    }
}