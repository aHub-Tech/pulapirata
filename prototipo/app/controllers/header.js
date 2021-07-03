class header {
    constructor () {
        this.SESSION = new session();
        this.create();
        this.logout();
    }

    create () {
        this.HEADER = document.querySelector('header');
        if (this.HEADER === null) {

            this.HEADER = document.createElement('header');
            
            this.ROOM = document.createElement('div');
            this.ROOM.classList.add('room');
            this.ROOM.innerHTML = '#room';
            
            this.TITLE = document.createElement('div');
            this.TITLE.classList.add('title');
            this.TITLE.innerHTML = 'PULA PIRATA';

            this.USER = document.createElement('user');
            this.USER.classList.add('user');

            // text
            let userName = document.createElement('div');
            userName.classList.add('user-name');
            this.USER.append(userName);

            // menu drop
            let menuDrop = document.createElement('div');
            menuDrop.classList.add('menu-drop');
            menuDrop.innerHTML = `
                <ul>
                    <li><a>Perfil</a></li>
                    <li><a class="logout">Sair<a></li>
                </ul>
            `;

            this.USER.append(menuDrop);

            this.setUser();


        }else{
            this.ROOM = this.HEADER.querySelector('div.room');
            this.TITLE = this.HEADER.querySelector('div.title');
            this.USER = this.HEADER.querySelector('div.user');
        }

        this.HEADER.append(this.ROOM);
        this.HEADER.append(this.TITLE);
        this.HEADER.append(this.USER);

        document.querySelector('body').append(this.HEADER);
    }

    show (obj) {
        if (obj === undefined) return console.error('HEADER: Necessário informar pelo menos um dos itens, room, title ou user');

        if (obj.room !== undefined) this.setRoom(obj.room);
        if (obj.title !== undefined) this.setTitle(obj.title);
        if (obj.user !== undefined) this.setUser(obj.user);
    }

    setRoom (text = '') {
        if (text !== '') this.ROOM.innerHTML = text;
        return this;
    }

    setTitle (text = '') {
        if (text !== '') this.TITLE.innerHTML = text;
        return this;
    }

    setUser (text = '') {
        this.USER.querySelector('div.user-name').innerHTML = `<img style="max-width:40px; margin-right:5px;" src="./../img/online.svg"> `;
        this.USER.querySelector('div.user-name').innerHTML += (text !== '') ? text : 'User';
        return this;
    }

    // capturando o botão de logout
    logout () {
        let logout = document.querySelector('a.logout');
        logout.addEventListener('click', e => {
            if (this.SESSION.inRoom()) return alert('Não permitido durante partidas');
            this.SESSION.logout();
        });
    }
}