class session {
    DATA = null;

    /*
        user_id, user_name, room_id, user_color, room_owner
    */

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
        data.room_owner = (parseInt(data.room_owner)===0) ? false : true;

        this.DATA = data;
        localStorage.setItem('session', JSON.stringify(this.DATA));
        return this.DATA;
    }

    getUserId () {
        return this.DATA.user_id;
    }

    getRoomId () {
        return this.DATA.room_id
    }

    getJWT () {
        return this.DATA.jwt;
    }

    getName () {
        return this.DATA.user_name;
    }

    setRoomID (room_id) {
        this.DATA.room_id = room_id;

        localStorage.setItem('session', JSON.stringify(this.DATA));
        return this.DATA;
    }

    inRoom () {
        if (
            this.DATA.room_id !==undefined && 
            this.DATA.room_id!=='' && 
            this.DATA.room_id!==null && 
            this.DATA.room_id!=='lobby') {
            return this.DATA.room_id;
        }else{
            return false;
        }
    }

    getColor () {
        return this.DATA.user_color;
    }

    setColor (color) {
        this.DATA.user_color = color;
        localStorage.setItem('session', JSON.stringify(this.DATA));
        return this.DATA;
    }
    setRoomOwner (bool) {
        this.DATA.room_owner = bool
        localStorage.setItem('session', JSON.stringify(this.DATA))
        return this.DATA
    }

    logout () {
        this.remove();
        window.location.replace('/login');
    }

    remove () {
        localStorage.removeItem('session');
        return true;
    }
}