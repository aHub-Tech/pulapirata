class session {
    DATA = null;

    constructor () {
        this.get();
    }

    isValid () {
        return (this.DATA !== null) ? true : false;
    }

    get () {
        this.DATA = JSON.parse(localStorage.getItem('session'));
        return this.DATA;
    }

    set (data) {
        // tratando o owner
        data.owner = (parseInt(data.owner)===0) ? false : true;

        this.DATA = data;
        localStorage.setItem('session', JSON.stringify(this.DATA));
        return this.DATA;
    }

    getUserId () {
        return this.DATA.id;
    }

    getJWT () {
        return this.DATA.jwt;
    }

    getName () {
        return this.DATA.name;
    }

    setRoomID (id_room) {
        this.DATA.idroom = id_room;
        localStorage.setItem('session', JSON.stringify(this.DATA));
        return this.DATA;
    }

    inRoom () {
        if (this.DATA.idroom !==undefined && this.DATA.idroom!=='' && this.DATA.idroom!==null) {
            return this.DATA.idroom;
        }else{
            return false;
        }
    }

    getColor () {
        return this.DATA.color;
    }

    setColor (color) {
        this.DATA.color = color;
        localStorage.setItem('session', JSON.stringify(this.DATA));
        return this.DATA;
    }

    logout () {
        this.remove();
        window.location.replace('./login.html');
    }

    remove () {
        localStorage.removeItem('session');
        return true;
    }
}