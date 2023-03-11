// Battle interface
const colorTypes = {
    "normal": "black",
    "grass": "green",
    "fire": "fire",
    "water": "blue"
}

const battleBackgroundImg = new Image()
battleBackgroundImg.src = "assets/background/battleBackground.png"
const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgroundImg
})

const setData = () => {

    allyImg.src = allySprite.pokemon.sprites.back
    allyImg.crossOrigin = "anonymous"
    enemyImg.src = enemySprite.pokemon.sprites.front
    enemyImg.crossOrigin = "anonymous"

    nameAlly.textContent = allySprite.pokemon.name.toUpperCase()
    levelAlly.textContent = "Lv" + `${allySprite.pokemon.level}`
    hpAlly.textContent = `${allySprite.currentHp}` + "/" + `${allySprite.pokemon.stats.hp}`
    nameEnemy.textContent = enemySprite.pokemon.name.toUpperCase()
    levelEnemy.textContent = "Lv" + `${enemySprite.pokemon.level}`
}
const nameAlly = document.getElementById("name-ally")
const levelAlly = document.getElementById("lvl-ally")
const hpAlly = document.getElementById("current-hp")
const nameEnemy = document.getElementById("name-enemy")
const levelEnemy = document.getElementById("lvl-enemy")
const allyImg = new Image()
const enemyImg = new Image()

let enemySprite
let allySprite
let renderedSprites
let battleAnimationId
let queue
function initBattle() {
    document.querySelector("#user-interface").style.display = "block"
    document.querySelector("#dialogue-box").style.display = "none"
    document.querySelector("#ally-hp").style.width = "100%"
    document.querySelector("#enemy-hp").style.width = "100%"
    document.querySelector(".buttons").replaceChildren()

    allySprite = new Sprite({
        position: {
            x: 100,
            y: 110
        },
        image: allyImg,
        // frames: {max: 3,hold: 30}
        animate: false, // true si quiero que el sprite del pokemon sea animado (buscar spritesheet))
        pokemon: new Pokemon(1)
    })
    allySprite.image.onload = function () {
        allySprite.resizeImage(400, 400)
    }
    enemySprite = new Sprite({
        position: {
            x: 610,
            y: 10
        },
        image: enemyImg,
        // frames: {max: 3,hold: 30}
        animate: false, // true si quiero que el sprite del pokemon sea animado (buscar spritesheet))
        pokemon: new Pokemon(4),
        isEnemy: true
    })
    enemySprite.image.onload = function () {
        enemySprite.resizeImage(250, 250)
    }
    renderedSprites = [allySprite, enemySprite]
    queue = []

    allySprite.pokemon.moves.forEach((move) => {
        const button = document.createElement("button")
        button.innerHTML = move.name.toUpperCase()
        document.querySelector(".buttons").append(button)
    })

    document.querySelectorAll('button').forEach((button) => {
        button.addEventListener("click", (e) => {
            const selectedAttack = e.currentTarget.innerHTML.toLowerCase()
            const selectedMove = moves[selectedAttack].move  // modificar para que sea por index y no por nombre

            allySprite.attack({
                move: selectedMove,
                receiver: enemySprite,
                renderedSprites
            })
            if (enemySprite.currentHp === 0) {
                queue.push(() => {
                    enemySprite.faint()
                })
                queue.push(() => {
                    gsap.to("#overlapping-div", {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(battleAnimationId)
                            animate()
                            document.querySelector("#user-interface").style.display = "none"
                            gsap.to("#overlapping-div", {
                                opacity: 0
                            })
                            battle.initiated = false
                        }
                    })
                })
            }
            // enemy attacks
            const randomMove = enemySprite.pokemon.moves[Math.floor(Math.random() * enemySprite.pokemon.moves.length)]
            queue.push(() => {
                enemySprite.attack({
                    move: randomMove,
                    receiver: allySprite,
                    renderedSprites
                })
                if (allySprite.currentHp <= 0) {
                    queue.push(() => {
                        allySprite.faint()
                    })
                    queue.push(() => {
                        // fade back to black
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
                    })
                }
            })
        })

        button.addEventListener("mouseenter", (e) =>{
            const targetAttack = moves[e.currentTarget.innerHTML.toLowerCase()].move
            const attackType = document.querySelector("#attack-type")
            attackType.innerHTML = targetAttack.stats.type.toUpperCase()
            attackType.style.color = colorTypes[attackType.innerHTML.toLowerCase()]
        })
    })
}

function animateBattle() {
    battleAnimationId = window.requestAnimationFrame(animateBattle)
    battleBackground.draw()
    setData()
    renderedSprites.forEach(sprite => {
        sprite.draw()
    })

}
document.querySelector("#dialogue-box").addEventListener("click", (e) =>{
    if (queue.length > 0) {
        queue[0]()
        queue.shift()
    } else e.currentTarget.style.display = "none"
})

animate()

