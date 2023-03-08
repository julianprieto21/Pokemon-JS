class Pokemon {
    constructor(id) {
        this.id = id
        this.name = null
        this.level = 5
        this.baseStats = {}
        this.stats = {}
        this.types = []
        this.sprites = null
        this.searchPokemon(this.id)
    }

    searchPokemon = id => {
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then(response => response.json())
            // .then(data => console.log(data))
            .then(data => this.setInfo(data))
            // .catch(err => console.log("ID incorrecto"))
            .catch(err => alert("ID incorrecto"))
    }

    setInfo(data) {
        this.name = data.name
        this.baseStats = {
            "hp": data.stats[0].base_stat,
            "attack": data.stats[1].base_stat,
            "defense": data.stats[2].base_stat,
            "sp_attack": data.stats[3].base_stat,
            "sp_defense": data.stats[4].base_stat,
            "speed": data.stats[5].base_stat
        }
        this.sprites = {
            "front": data.sprites.front_default,
            "back": data.sprites.back_default
        }
        data.types.forEach(type =>{
            this.types.push(type.type.name)
        })
    }

    calculateStat = (base, iv, ev, nature, isHp) => {
        const a = 2 * base
        const b = ev / 4
        const c = this.level
        const d = iv
        if (isHp) {
            return Math.ceil((((a+d+b)*c)/100)+c+10)
        }
        else
            return Math.ceil(((((a+d+b)*c)/100)+5)*nature)
}

    get getStats() {
        this.stats = {
            "hp": this.calculateStat(1, 1, 1, 1, true),
            "attack": this.calculateStat(1, 1, 1, 1, false),
            "defense": this.calculateStat(1, 1, 1, 1, false),
            "sp_attack": this.calculateStat(1, 1, 1, 1, false),
            "sp_defense": this.calculateStat(1, 1, 1, 1, false),
            "speed": this.calculateStat(1, 1, 1, 1, false),
        }
        return this.stats
    }
}



searchPokemonStats = event => {
    event.preventDefault();
    const { value } = event.target.pokemon;
    console.log(value)
    const pok = new Pokemon(value)
    setTimeout(() => {
        const stats = pok.getStats;
        console.log(stats);
    }, 1500);
}