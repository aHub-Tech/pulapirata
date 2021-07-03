class splashScreen {
    constructor () {
        this.EL = document.querySelector('div.splash-screen');
    }

    showSplash (msg = null) {
        this.EL.querySelector('div.splash-screen-msg').innerHTML = (msg!== null) ? msg : 'Carregando...';
        this.EL.classList.add('splash-screen-show');
    }

    closeSplash () {
        this.EL.classList.remove('splash-screen-show');
    }
}