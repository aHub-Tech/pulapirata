class auth {
    constructor () {
        this.ERROR = new error();
        this.SPLASH_SCREEN = new splashScreen();
        this.SESSION = new session();

        if (this.SESSION.isValid()) return window.location.replace('./lobby.html');
    }

    register () {
        // verificando se o uario já está em sessao
        if (this.SESSION.isValid()) {
            window.location.replace('./lobby.html');
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
                window.location.replace('./lobby.html');
            }else{
                this.ERROR.showError(json.msg);
            }
        });
    }
}