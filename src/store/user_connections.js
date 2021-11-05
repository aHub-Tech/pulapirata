const user_connections = {
    data: [],
    getDataByUserId(user_id) {
        return this.data.find(d => d.user_id === user_id)
    },
    getData() {
        return this.data
    },
    setData(data) {
        this.data = data
        return this.data
    },
    addData(data) {
        this.data.push(data)
    },
    getOuthers(socket_id) {
        return this.data.filter(d => d.socket_id !== socket_id)
    },
    removeData(socket_id) {
        this.setData(this.data.filter(d => d.socket_id !== socket_id))
        return this.getData()
    }
}

module.exports = user_connections