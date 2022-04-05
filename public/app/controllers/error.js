class error {
    constructor () {
        this.EL = document.querySelector('div.error');
    }

    showError (msg) {
        this.EL.innerHTML = msg;
        this.EL.classList.add('show');
        this.timeout = setTimeout(_=> this.EL.classList.remove('show'), 5000);
    }
}