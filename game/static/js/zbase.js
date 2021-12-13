class Hyld {
    constructor(id) {
        this.id = id;
        this.$hyld = $('#' + id);
        this.menu = new HyldMenu(this);
        this.playground = new HyldPlayground(this);

        this.start();
    }

    start() {
    }
}
