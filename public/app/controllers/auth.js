class auth {
    constructor () {
        this.ERROR = new error();
        this.SPLASH_SCREEN = new splashScreen();
        this.SESSION = new session()
        this.MODAL = new modal()

        if (this.SESSION.isValid()) return window.location.replace('/game');
    }

    register () {
        // verificando se o uario já está em sessao
        if (this.SESSION.isValid()) {
            window.location.replace('/lobby');
            return false;
        }

        // executado quando o usuário clica em entrar após fornecer um nome
        let obj = {};
        obj.name = document.querySelector('input[name=name]').value;
        obj.email = document.querySelector('input[name=email]').value;
        obj.pass = CryptoJS.MD5(document.querySelector('input[name=pass]').value).toString();

        // testando o validade de email
        if (!/^[a-z0-9.]+@[a-z0-9]+\.[a-z]+\.?([a-z]+)?$/.test(obj.email)) return this.ERROR.showError('Email inválido!');

        // verificando se foi digitado os campos
        if (obj.name.trim() === '' || obj.email.trim() === '' || obj.pass.trim() === '') {
            return this.ERROR.showError('Preencha os dados corretamente!');
        }

        // gerando a cor do jogador de forma randomica
        // let randomColor = Math.floor(Math.random()*16777215).toString(16);
        // this.SESSION = {id: null, name: name, color: ''};

        this.SPLASH_SCREEN.showSplash();

        // enviando registrando no servidor
        fetch('./../../api/src/rest/user.php', {
            method: 'POST',
            body: JSON.stringify({
                method: 'register',
                data: obj
            })
        })
        .then(r=>r.json())
        .then(json => {
            this.SPLASH_SCREEN.closeSplash();
            if (json.success) {
                this.SESSION.set(json.data);
                window.location.replace('./lobby.html');
            }else{
                this.ERROR.showError(json.msg);
            }
        });
    }

    login () {
        // verificando se o uario já está em sessao
        if (this.SESSION.isValid()) {
            window.location.replace('./lobby.html');
            return false;
        }

        let obj = {};
        obj.email = document.querySelector('input[name=email]').value;
        obj.pass = CryptoJS.MD5(document.querySelector('input[name=pass]').value).toString();

        if (obj.email.trim() === '' || obj.pass.trim() === '') {
            return this.ERROR.showError('Preencha os dados corretamente!');
        }

        // splash load
        this.SPLASH_SCREEN.showSplash();

        // enviando registrando no servidor
        fetch('./../../api/src/rest/user.php', {
            method: 'POST',
            body: JSON.stringify({
                method: 'login',
                data: obj
            })
        })
        .then(r=>r.json())
        .then(json => {
            this.SPLASH_SCREEN.closeSplash();
            if (json.success) {

                // salvando a sessão do usuário no navegador
                this.SESSION.set(json.data);
                window.location.replace('/lobby');
            }else{
                this.ERROR.showError(json.msg);
            }
        });
    }

    guest() {
        this.MODAL.show({
            header:`
                <h3>LICENÇA TEMPORÁRIA DE PIRATA!</h3>
                <small>Com a conta temporária seus dados não serão salvos e não haverá progresso no jogo!</small>
            `,
            content: `
            <img src="./../app/img/card3.png" class="mw-120">
            <div class="input-group input-group-fc">
                    <label>Qual seu nome pirata?</label>
                    <input type="text" class="mw-400" placeholder="Insira seu nome de pirata" name="_name" autocomplete="off"/>
                </div>
            <div class="inline inline-jc">
                <button onclick="AUTH.confirmGuest()">Criar</button>
                <button class="btn-brown" onclick="AUTH.cancelGuest()">Cancelar</button>
            </div>`
        });
    }

    confirmGuest() {
        let _name = document.querySelector('input[name=_name]').value;
        
        // removendo html
        let tmp = document.createElement("DIV");
        tmp.innerHTML = _name;
        _name = tmp.textContent || tmp.innerText || "";

        if (_name === '') return this.ERROR.showError('Seu nome de pirata não pode ser vazio!')
        if (_name.length>10) return this.ERROR.showError('Seu nome de pirata não pode ter mais de 10 letras!')
        
        // gerar um nome aleatório
        const data = {
            user_id: (Date.now()),
            // user_name: ('GUEST' + Date.now()),
            user_name: _name,
            room_id:'lobby',
            room_owner: false
        };

        this.SESSION.set(data);
        window.location.replace('/game');
    }

    cancelGuest() {
        this.MODAL.close()
    }
}