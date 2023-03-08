
class Move {
    constructor(id) {
        this.id = id
        this.name = null
        this.stats = null
        this.searchMove(this.id)
    }

    searchMove = id => {
        fetch(`https://pokeapi.co/api/v2/move/${id}`)
            .then(response => response.json())
            .then(data => this.setStats(data))
            // .catch(err => console.log("ID incorrecto"))
            .catch(err => alert("ID incorrecto"))
    }

    setStats(data) {
        this.name = data.name
        this.stats = {
            "accuracy": data.accuracy,
            "power": data.power,
            "pp": data.pp,
            "type": data.type.name}
    }

    get getStats() {
        return this.stats
    }
}

searchMoveStats = event => {

    event.preventDefault();
    const { value } = event.target.pokemon;
    console.log(value)
    const move = new Move(value)
    setTimeout(() => {
        const stats = move.getStats;
        console.log(stats);
    }, 1500);
}

