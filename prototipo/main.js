/*
    cliclo da aplicação
    1. create -> criar dados de slots
    2. register -> enviar sessao e slots para o server, registrar sessao
    3. logar -> com o resquest logar usuario no client
    4. patch -> atualizar slots no client
    5. onSlot -> quando usuario clica no slot, macar como checked, envia para o server
    6. getSate -> consome informações do servidor enquanto espera a vez de jogar
*/

let session = null; // guarda o estado atual do jogador
let state = null;
function initState () {
    state = {
        slots: [], // slots para espada
        players: [], // jogadores
        player_in: null, // jogador da rodada
        status: 'registro' // registro | pronto | andamento | finalizado,
    };
}
initState();

document.addEventListener('DOMContentLoaded', _ => {
    function create () {
    
        // setTimeout(e => {
            document.querySelector('div.pirata').innerHTML = svg_barril;
    
            let index = 0;
            let areas = Array.from(document.querySelectorAll('rect'));
            
            areas.forEach(e => {
                e.id = `slot_${index}`;
                e.onclick = function () {onSlot(e.id)};
                state.slots.push({id: `slot_${index}`, checked: false, "jump": false});
                index++;
            });
    
            // setTimeout(() => {
                let rand = Math.floor(Math.random()*20);
                state.slots[rand].jump = true;
    
                console.log(state);
        //     }, 500);
    
        // }, 200);
    
    }

    // criando o array de slots
    create();
});

function renderPlayers () {
    let pig = document.querySelector('div.players_in_game');
    let li = '';
    
    state.players.forEach(e => {
        // verificarPlayerIn(e);

        li += `<li>
            ${e.name}
        </li>`;
    });

    pig.innerHTML = `
        <ul>
            ${li}
        </ul>
    `;

    pig.classList.add('show');
}

function  verificarPlayerIn (p) {

    if (session.id === p.id && session.okjogar === false) {
        let modal = document.querySelector('div.modal');
        modal.classList.add('show');
        modal.style = "height:250px";
        let content = modal.querySelector('div.modal-content');
        content.innerHTML = `
            🎳 <b>SUA VEZ DE JOGAR</b>
            <div><button onclick="okJogar(${p.id})">Jogar</button></div>
        `;
    }
}

function okModal() {
    let modal = document.querySelector('div.modal');
    modal.classList.remove('show');
}

function patch (data) {
    let app = document.querySelector('.app');
    app.innerHTML = '';

    state.player_in = data.player_in;
    state.players = data.players;

    // if (Object.keys(data).length === 0) return false;
    if (data.length<=0) return false;

    state.slots = [];

    data.slots.forEach(e => {
        let furo = document.querySelector(`rect#${e.id}`);
        furo.react = e.checked && 'burlywood';

        if (e.checked && e.jump) finish();
    });

    renderPlayers ();

    state.slots = data.slots;
}

function entrar () {
    let name = document.querySelector('input[name=name]').value;
    if (name==='') {
        alert('Entre com um nome válido!');
        return false;
    }
    let randomColor = Math.floor(Math.random()*16777215).toString(16);
    let session = {id: null, name: name, color: randomColor};

    register (session);
}

// quando o slot que faz o pirata pular for cliclado
function finish () {
    let modal = document.querySelector('div.modal');
    modal.classList.add('show');
    
    let content = modal.querySelector('div.modal-content');

    let player = getPlayer();
    content.innerHTML = `
        FIM DE JOGO!
        <span class="loser">${player.name}</span>
        FEZ O PIRATA PULAR!
    `;

    setTimeout(e => {
        reset();
    }, 5000);
}

function reset() {
    // removendo a sessao do jogador
    sessionStorage.removeItem('session');
    session = null;
    initState(); // resetando a state

    // enviando as informações para o server side
    fetch('./server.php', {
        method: 'POST',
        body: JSON.stringify({
            method: 'resetData'
        })
    })
    .then(r=>r.json())
    .then(json => {

        // recarregando a página
        window.location.reload();
    });
}

// quando um slot é cliclado
function onSlot(i) {

    // se não existir uma sessão
    if (session===null) return false;


    // se o jogador não estiver na sua vez de jogar
    if (session.id !== state.player_in) {
        let error = document.querySelector('div.error');
        error.innerHTML = "Não é sua vez de jogar!";
        error.classList.add('show');

        // escondendo a mensagem depois de 3 segundos
        setTimeout(e=>{
            error.classList.remove('show');
        }, 4000);
        return false;
    };

    // capturando o slot clicado
    let slot = state.slots.find(s => i === s.id);
    console.log(state);

    // tornando o slot checado
    slot.checked = true;
    
    // capturando o elemento do slote pelo id
    let furo = document.querySelector('#'+slot.id);
    furo.rect = 'burlywood'; // alterando a cor

    // verificando se esse slot é jump e se está checado
    if (slot.checked && slot.jump) {
        state.status = 'finalizado';
        finish();
    }else{
        // logica para passar a vez para o próximo jogar
        // se não houver um próximo, volta ao primeiro
        let index = null;
        state.players.map(p => {
            if (p.id === state.player_in) index = state.players.indexOf(p);
        });
        index = (state.players[index+1]===undefined) ? 0 : (index+1);
        state.player_in = state.players[index].id;
    }

    setState (state);
};

session = JSON.parse(sessionStorage.getItem('session'));

logado();

function getPlayer () {
    // se o usuário tem sessão
    if (session==null || state.length>0) return false;
    // if (state<=0 || state.players.length<= 0) return false;
    
    let div = document.querySelector('div.jogador_rodada');
    let player = null;
    state.players.forEach(e => {
        if (e.id === state.player_in) {
            player = e;
        }
    });
    div.innerHTML = `Jogador da Rodada: ${player.name}`;
    div.classList.add('show');

    return player;
}

function logado() {
    // se o usuário tem sessão
    if (session==null) return false;

    // adicionando barril a tela e setando ids dos slots
    // setTimeout(e => {
        // document.querySelector('div.pirata').innerHTML = svg_bau;
        // create();
    // }, 500);

    document.querySelector('form') &&
    document.querySelector('form').remove();

    getState();

    setInterval(e => {
        getState();
    }, 1000);
}

function getState () {
    fetch('./server.php', {
        method: 'GET'
    })
    .then(r=>r.json())
    .then(json => {
        if (json.success) {
            patch(json.data);
            getPlayer();
        }
    });
}

function setState (state) {
    fetch('./server.php', {
        method: 'POST',
        body: JSON.stringify({
            method: 'setState',
            data:state
        })
    })
    .then(r=>r.json())
    .then(json => {
        if (!json.success) alert(json.msg);
    });
}

function register (me) {
    // render();

    fetch('./server.php', {
        method: 'POST',
        body: JSON.stringify({
            method: 'registrar',
            data: {
                state: state,
                session: me
            }
        })
    })
    .then(r=>r.json())
    .then(json => {
        if (json.success) {
            session = json.data;
            sessionStorage.setItem('session', JSON.stringify(session));
            logado();
        }else{
            alert(json.msg);
        }
    });
}

function teste (e) {
    // e.target.classList('checked');
    e.target.setAttribute('fill', 'burlywood');
}