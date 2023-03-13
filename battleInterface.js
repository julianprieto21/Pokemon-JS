// Battle interface

const battleBackgroundImg = new Image()
battleBackgroundImg.src = "assets/background/battleBackground.png"
const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgroundImg
})

const nameAlly = document.getElementById("name-ally")
const levelAlly = document.getElementById("lvl-ally")
const hpAlly = document.getElementById("current-hp")
const xpAlly = document.getElementById("ally-xp")
const nameEnemy = document.getElementById("name-enemy")
const levelEnemy = document.getElementById("lvl-enemy")
const allyImg = new Image()
const enemyImg = new Image()

let enemySprite
let allySprite
let renderedSprites
let battleAnimationId
let queue
async function initBattle(pokemon) {
    // Reestablecer elementos de la interfaz
    document.querySelector("#user-interface").style.display = "block"
    document.querySelector("#dialogue-box").style.display = "none"
    document.querySelector("#ally-hp").style.width = "100%"
    document.querySelector("#enemy-hp").style.width = "100%"
    document.querySelector("#ally-xp").style.width = "0%"
    document.querySelector(".buttons").replaceChildren()
    // Carga los pokemones
    const ally = new Pokemon(pokemon)
    const enemy = new Pokemon(4)
    // Esperar a que se carguen las propiedades de los pokemones
    await ally.searchPokemon(ally.id)
    await enemy.searchPokemon(enemy.id)
    // Carga del sprite enemigo
    enemySprite = new Sprite({
        position: {
            x: 610,
            y: 10
        },
        image: enemyImg,
        // frames: {max: 3,hold: 30}
        animate: false, // true si quiero que el sprite del pokemon sea animado (buscar spritesheet))
        pokemon: enemy,
        isEnemy: true
    })
    enemySprite.image.onload = function () {
        enemySprite.resizeImage(250, 250)
    }
    // Carga del sprite aliado
    allySprite = new Sprite({
        position: {
            x: 100,
            y: 110
        },
        image: allyImg,
        // frames: {max: 3,hold: 30}
        animate: false, // true si quiero que el sprite del pokemon sea animado (buscar spritesheet))
        pokemon: ally
    })
    allySprite.image.onload = function () {
        allySprite.resizeImage(400, 400)
    }

    for (const value in allySprite.pokemon.moves) {
        const move = allySprite.pokemon.moves[value]
        const button = document.createElement("button")
        button.innerHTML = move.name.toUpperCase()
        document.querySelector(".buttons").append(button)
    }
    // mostrar info estatica en pantalla
    allyImg.src = allySprite.pokemon.sprites.back
    allyImg.crossOrigin = "anonymous"
    enemyImg.src = enemySprite.pokemon.sprites.front
    enemyImg.crossOrigin = "anonymous"
    nameAlly.textContent = allySprite.pokemon.name.toUpperCase()
    nameEnemy.textContent = enemySprite.pokemon.name.toUpperCase()
    levelEnemy.textContent = "Lv" + `${enemySprite.pokemon.level}`

    renderedSprites = [allySprite, enemySprite]
    queue = []

//////////////////////////////////////////////////
    // Manejo de botones de ataque
    document.querySelectorAll('button').forEach((button) => {
        button.addEventListener("click", (e) => {
            const selectedAttack = e.currentTarget.innerHTML.toLowerCase()
            const selectedMove = allySprite.pokemon.moves[selectedAttack]  // modificar para que sea por index y no por nombre
            // Ataques de aliado
            selectedMove.currentPP -= 1
            allySprite.attack({
                move: selectedMove,
                receiver: enemySprite,
                renderedSprites
            })
            // Enemigo debilitado
            if (enemySprite.pokemon.currentHp === 0) {
                queue.push(() => {
                    enemySprite.faint()
                })
                // Experiencia
                queue.push(() => {
                    animateExperience()
                })
                // Vuelva a juego
                queue.push(() => {
                    animateFaint()
                })
            }
            // Ataques de enemy
            const randomMove = enemySprite.pokemon.moves["tackle"]//enemySprite.pokemon.moves[Math.floor(Math.random() * enemySprite.pokemon.moves.length)]
            queue.push(() => {
                enemySprite.attack({
                    move: randomMove,
                    receiver: allySprite,
                    renderedSprites
                })
                if (allySprite.pokemon.currentHp <= 0) {
                    queue.push(() => {
                        allySprite.faint()
                    })
                    queue.push(() => {
                        animateFaint()
                    })
                }
            })
        })
        // Info de ataque al pasar el mouse por arriba del boton
        button.addEventListener("mouseenter", (e) =>{
            const targetAttack = allySprite.pokemon.moves[e.currentTarget.innerHTML.toLowerCase()]
            const attackPP = document.querySelector("#attack-pp")
            const attackType = document.querySelector("#attack-type-img")
            // const attackType = document.querySelector("#attack-type-ing")
            attackPP.innerHTML = "PP  " + targetAttack.currentPP + "/" + targetAttack.stats.pp
            attackType.src = typesImg[targetAttack.stats.type]//"assets/interface/secondary/types/grass.png"

        })
        // No mostrar nada cuando el mouse deje de estar por encima del boton
        button.addEventListener("mouseleave", () =>{
            const attackPP = document.querySelector("#attack-pp")
            const attackType = document.querySelector("#attack-type-img")
            attackPP.innerHTML = "PP"
            attackType.src = ""
        })
    })
}

document.querySelector("#dialogue-box").addEventListener("click", (e) =>{
    if (queue.length > 0) {
        queue[0]()
        queue.shift()
    } else e.currentTarget.style.display = "none"
})

const updateData = () => {
    levelAlly.textContent = "Lv" + `${allySprite.pokemon.level}`
    hpAlly.textContent = `${allySprite.pokemon.currentHp}` + "/" + `${allySprite.pokemon.stats.hp}`
}


function animateBattle() {
    battleAnimationId = window.requestAnimationFrame(animateBattle)
    battleBackground.draw()
    levelAlly.textContent = "Lv" + `${allySprite.pokemon.level}`
    hpAlly.textContent = `${allySprite.pokemon.currentHp}` + "/" + `${allySprite.pokemon.stats.hp}`
    updateData()

    renderedSprites.forEach(sprite => {
        sprite.draw()
    })
}

function animateExperience() {
    let xpLeft
    let xpPercentage
    const xp = getExperience(allySprite.pokemon, enemySprite.pokemon)
    allySprite.pokemon.currentXp += xp
    const nextLevelXp = allySprite.pokemon.getNextLevelXP()
    const dialogue = allySprite.pokemon.name + ` ha ganado ${xp} de experiencia!`
    document.querySelector("#dialogue-box-text").innerHTML = dialogue.toUpperCase()
    xpPercentage = allySprite.pokemon.currentXp * 100 / nextLevelXp
    if (xpPercentage >= 100) {
        xpPercentage = 100
        xpLeft = allySprite.pokemon.currentXp - nextLevelXp
    } else xpLeft = allySprite.pokemon.currentXp
    gsap.to("#ally-xp", {
        width: xpPercentage + "%",
        duration: 0.5,
        onComplete: () => {
            if (xpPercentage === 100) {
                allySprite.pokemon.levelUp()
                xpPercentage = xpLeft * 100 / allySprite.pokemon.getNextLevelXP()
                xpAlly.style.width = "0%"
                if (xpPercentage >= 100) {
                    animateExperience()
                } else {
                    gsap.to("#ally-xp", {
                        width: xpPercentage + "%",
                        duration: 0.5
                    })
                }
            }


        }
    })
}

function animateFaint() {
    gsap.to("#overlapping-div", {
        opacity: 1,
        onComplete: () => {
            cancelAnimationFrame(battleAnimationId)
            animate()
            document.querySelector('#user-interface').style.display = "none"
            gsap.to("#overlapping-div", {
                opacity: 0
            })
            battle.initiated = false
        }
    })
}

// console.log(player)
