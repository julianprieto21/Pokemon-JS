// Clase Move encargada de recolectar los datos necesarios del movimiento
class Move {
    constructor(name) {
        this.name = name
        this.stats = null
        this.searchMove()
    };

    searchMove = id => {
        fetch(`https://pokeapi.co/api/v2/move/${this.name}`)
            .then(response => response.json())
            .then(data => this.setStats(data))
            // .catch(err => console.log("ID incorrecto"))
            .catch(err => alert("ID incorrecto"))
    };

    setStats(data) {
        this.stats = {
            "accuracy": data.accuracy,
            "power": data.power,
            "pp": data.pp,
            "type": data.type.name
        }
    };

    get getStats() {
        return this.stats
    };
}

// Clase Pokemon encargada de recolectar la informacion necesaria del pokemon
class Pokemon {
    constructor(id) {
        this.id = id
        this.name = null
        this.sprites = null
        this.types = []
        this.level = 5
        this.baseStats = {}
        this.stats = {}
        this.iv = []
        this.growthRate = null
        this.movesNames = []
        this.moves = []
        this.searchPokemon(this.id)
    };

    searchPokemon = id => {
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then(response => response.json())
            // .then(data => console.log(data))
            .then(data => this.setInfo(data))
        // .catch(err => alert("ID incorrecto"))
    };

    setInfo = data => {
        this.name = data.name
        this.baseStats = {
            hp: [data.stats[0].base_stat, data.stats[0].effort],
            attack: [data.stats[1].base_stat, data.stats[1].effort],
            defense: [data.stats[2].base_stat, data.stats[2].effort],
            sp_attack: [data.stats[3].base_stat, data.stats[3].effort],
            sp_defense: [data.stats[4].base_stat, data.stats[4].effort],
            speed: [data.stats[5].base_stat, data.stats[5].effort],
            xp: data.base_experience
        }
        this.sprites = {
            "front": data.sprites.front_default,
            "back": data.sprites.back_default
        }
        data.types.forEach(type => {
            this.types.push(type.type.name)
        })
        data.moves.forEach(move => {
            if (move.version_group_details.length >= 7 && move.version_group_details[6].move_learn_method.name === "level-up") {
                this.movesNames.push(move.move.name)
            }
        })
        this.iv = this.getIvStats()
        this.getNature()
        this.getStats()
        this.getGrowthRate()
        this.getMoves(this.movesNames)
    };

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
    };

    getIvStats = () => {
        let iv = [];
        for (let i = 0; i < 6; i++) {
            iv.push(Math.ceil(Math.random() * 32));
        }
        return iv
    };

    getNature = () => {
        const i = Math.ceil(Math.random() * 25)
        fetch(`https://pokeapi.co/api/v2/nature/${i}`)
            .then(response => response.json())
            // .then(data => console.log(data))
            .then(data => this.setNature(data))
            // .catch(err => console.log("ID incorrecto"))
            .catch(err => alert("ID incorrecto"))
    };

    setNature = (data) => {

    };

    getStats = () => {
        this.stats = {
            hp: this.calculateStat(
                this.baseStats.hp[0], this.iv[0], this.baseStats.hp[1], 0, true),
            attack: this.calculateStat(
                this.baseStats.attack[0], this.iv[1], this.baseStats.attack[1], 1, false),
            defense: this.calculateStat(
                this.baseStats.defense[0], this.iv[2], this.baseStats.defense[1], 1, false),
            sp_attack: this.calculateStat(
                this.baseStats.sp_attack[0], this.iv[3], this.baseStats.sp_attack[1], 1, false),
            sp_defense: this.calculateStat(
                this.baseStats.sp_defense[0], this.iv[4], this.baseStats.sp_defense[1], 1, false),
            speed: this.calculateStat(
                this.baseStats.speed[0], this.iv[5], this.baseStats.speed[1], 1, false),
        }
        return this.stats
    };

    getGrowthRate = () => {
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${this.id}`)
            .then(response => response.json())
            .then(data => this.setGrowthRate(data.growth_rate.name))
    };

    setGrowthRate = (growthRate) => {
        const growthRateDict = {
            "slow": 1,
            "medium": 2,
            "fast": 3,
            "medium-slow": 4,
            "slow-the-very-fast": 5,
            "fast-then-very-slow": 6
        }
        this.growthRate = growthRateDict[growthRate]
    };

    getTotalLevelXP = (lvl) => {
        function p(i) {
            let x = 0;
            if (i === 0) {
                x = 0;
            } else if (i === 1) {
                x = 0.008;
            } else if (i === 2) {
                x = 0.014;
            }
            return x;
        }

        let n = lvl;
        let xp_dict = {
            1: (5 * (n ** 3)) / 4,
            2: n ** 3,
            3: (4 * (n ** 3)) / 5,
            4: (1.2 * (n ** 3)) - (15 * (n ** 2)) + 100 * n - 140,
            5: (n ** 3) * (2 - 0.02 * n) > 0 && n <= 50 ?
                (n ** 3) * (2 - 0.02 * n) :
                (n ** 3) * (1.5 - 0.01 * n) > 0 && n <= 68 ?
                    (n ** 3) * (1.5 - 0.01 * n) :
                    (n ** 3) * (1.274 - 0.02 * (n / 3) - p(n % 3)) > 0 ?
                        (n ** 3) * (1.274 - 0.02 * (n / 3) - p(n % 3)) :
                        (n ** 3) * (1.6 - 0.01 * n),
            6: (n ** 3) * (24 + (n + 1) / 3) / 50 > 0 && n <= 15 ?
                (n ** 3) * (24 + (n + 1) / 3) / 50 :
                (n ** 3) * (14 + n) / 50 > 0 && n <= 35 ?
                    (n ** 3) * (14 + n) / 50 :
                    (n ** 3) * (32 + (n / 2)) / 50
        };
        return Math.floor(xp_dict[this.growthRate] || 0);
    };

    getNextLevelXP = () =>{
        return this.getTotalLevelXP(this.level + 1) - this.getTotalLevelXP(this.level)
    };

    getMoves = () => {
        this.movesNames.forEach(move => {
            this.moves.push(new Move(move))
        })
    }
}

// Clase Battle encargada de menejar la batalla entre dos pokemones
class Battle {
    constructor(ally, enemy) {
        this.ally = ally
        this.enemy = enemy
        this.allyTurn = this.ally.stats.speed >= this.enemy.stats.speed
    }
}