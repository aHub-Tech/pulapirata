class modal {
    constructor () {
        this.create();
    }

    create () {
        this.EL = document.querySelector('div.modal');
        if (this.EL === null) {
            this.EL = document.createElement('div');
            this.EL.classList.add('modal');
            document.body.appendChild(this.EL);
        }
    }

    show (obj) {
        this.create();

        if (obj.header === undefined && obj.content === undefined && obj.footer === undefined) {
            console.warn('modal.show precisa pelo menos um parametro.');
            return false;
        }

        this.EL.classList.add('modal-show');

        if (obj.header!==undefined) this.createHeader(obj.header);
        if (obj.content!==undefined) this.createContent(obj.content);
        if (obj.footer!==undefined) this.createFooter(obj.footer);
    }

    close () {
        this.EL.remove();
    }

    createHeader (inner) {
        let header = document.createElement('div');
        header.classList.add('modal-header');
        header.innerHTML = inner;
        this.EL.appendChild(header);
    }

    createContent (inner) {
        let content = document.createElement('div');
        content.classList.add('modal-content');
        content.innerHTML = inner;
        this.EL.appendChild(content);
    }

    createFooter (inner) {
        let footer = document.createElement('div');
        footer.classList.add('modal-footer');
        footer.innerHTML = inner;
        this.EL.appendChild(footer);
    }
}