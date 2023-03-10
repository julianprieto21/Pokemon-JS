const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")

canvas.width = 1024
canvas.height = 576

const battleZonesMap = []
for (let i = 0; i < battleZoneArray.length; i+=64) {
    battleZonesMap.push(battleZoneArray.slice(i, i + 64))
}

const collisionsMap = []
for (let i = 0; i < collisions.length; i+=64) {
    collisionsMap.push(collisions.slice(i, i + 64))
}

const offset = {
    x: -1325,
    y: -570
}

const boundaries = []
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 14759)
        boundaries.push(new Boundary({position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
            }
        }))
    })
})

const battleZones = []
battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 14759)
            battleZones.push(new Boundary({position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }
            }))
    })
})

const playerImgDown = new Image()
playerImgDown.src = "./assets/player/goldDown.png"
const playerImgUp = new Image()
playerImgUp.src = "./assets/player/goldUp.png"
const playerImgLeft = new Image()
playerImgLeft.src = "./assets/player/goldLeft.png"
const playerImgRight = new Image()
playerImgRight.src = "./assets/player/goldRight.png"
const img = new Image()
img.src = "./assets/maps/map.png"
const foregroundImg = new Image()
foregroundImg.src = "./assets/maps/foreground.png"

const player = new Sprite({
    position: {
        x: canvas.width / 2 - 304 / 4 / 2,
        y: canvas.height / 2 - 100 / 3 / 2
    },
    image: playerImgDown,
    frames: {
        max: 4,
        hold: 10
    },
    sprites: {
        down: playerImgDown,
        up: playerImgUp,
        left: playerImgLeft,
        right: playerImgRight
    }
})

const background = new Sprite({position: {
    x: offset.x,
    y: offset.y
    },
    image: img,
})
const foreground = new Sprite({position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImg,
})

const keys = {
    w: {
        pressed: false
    },
    s: {
        pressed: false
    },
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
}

const movables = [background, ...boundaries, foreground, ...battleZones]

function rectCollision({rect1, rect2}) {
    return (rect1.position.x + rect1.width >= rect2.position.x &&
        rect1.position.x <= rect2.position.x + rect2.width &&
        rect1.position.y <= rect2.position.y + rect2.height &&
        rect1.position.y + rect1.height >= rect2.position.y)
}

const battle = {
    initiated: false
}

function animate() {
    const animationId = window.requestAnimationFrame(animate)
    background.draw()
    boundaries.forEach(boundary => {
        boundary.draw()
    })
    battleZones.forEach(battleZone => {
        battleZone.draw()
    })
    player.draw()
    foreground.draw()

    let moving = true
    player.animate = false

    if (battle.initiated) return

    // activate battle
    if (keys.w.pressed || keys.s.pressed || keys.a.pressed || keys.d.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i]
            if (
                rectCollision({
                    rect1: player,
                    rect2: battleZone
                })
                && Math.random() < 0.01 // 0.005
            ) {
                console.log("Activate Battle")
                window.cancelAnimationFrame(animationId)
                battle.initiated = true
                gsap.to("#overlapping-div", {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.3,
                    onComplete() {
                        gsap.to("#overlapping-div", {
                            opacity: 1,
                            duration: 0.3,
                            onComplete() {
                                animateBattle()
                                gsap.to("#overlapping-div", {
                                    opacity: 0,
                                    duration: 0.3
                                })
                            }
                        })
                    }
                })
                break
            }
        }
    }

    if (keys.w.pressed && lastKey === "w") {
        player.animate = true
        player.image = player.sprites.up
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectCollision({
                    rect1: player,
                    rect2: {...boundary, position: {
                        x: boundary.position.x,
                        y: boundary.position.y + 5
                        }
                    }
                })
            ) {
                // console.log("Colliding")
                moving = false
                break
            }
        }
        if (moving)
            movables.forEach((movable) => {
                movable.position.y += 5
            })
    } else if (keys.s.pressed && lastKey === "s") {
        player.animate = true
        player.image = player.sprites.down
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectCollision({
                    rect1: player,
                    rect2: {...boundary, position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 5
                        }
                    }
                })
            ) {
                // console.log("Colliding")
                moving = false
                break
            }
        }
        if (moving)
        movables.forEach((movable) => {
            movable.position.y -= 5
        })
    } else if (keys.a.pressed && lastKey === "a") {
        player.animate = true
        player.image = player.sprites.left
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectCollision({
                    rect1: player,
                    rect2: {...boundary, position: {
                            x: boundary.position.x + 5,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                // console.log("Colliding")
                moving = false
                break
            }
        }
        if (moving)
        movables.forEach((movable) => {
            movable.position.x += 5
        })
    } else if (keys.d.pressed && lastKey === "d") {
        player.animate = true
        player.image = player.sprites.right
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectCollision({
                    rect1: player,
                    rect2: {...boundary, position: {
                            x: boundary.position.x - 5,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                // console.log("Colliding")
                moving = false
                break
            }
        }
        if (moving)
        movables.forEach((movable) => {
            movable.position.x -= 5
        })
    }
}
// animateMovement()

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

    allyImg.src = ally.sprites.back
    allyImg.crossOrigin = "anonymous"
    enemyImg.src = enemy.sprites.front
    enemyImg.crossOrigin = "anonymous"

    nameAlly.textContent = ally.name.toUpperCase()
    levelAlly.textContent = "Lv" + `${ally.level}`
    hpAlly.textContent = `${ally.currentHp}` + "/" + `${ally.stats.hp}`
    nameEnemy.textContent = enemy.name.toUpperCase()
    levelEnemy.textContent = "Lv" + `${enemy.level}`

    att1.textContent = ally.movesNames[0].toUpperCase()
    att2.textContent = ally.movesNames[1].toUpperCase()
    att3.textContent = ally.movesNames[2].toUpperCase()
    att4.textContent = ally.movesNames[3].toUpperCase()
}
const ally = new Pokemon(1)
const enemy = new Pokemon(4)
const nameAlly = document.getElementById("name-ally")
const levelAlly = document.getElementById("lvl-ally")
const hpAlly = document.getElementById("current-hp")
const nameEnemy = document.getElementById("name-enemy")
const levelEnemy = document.getElementById("lvl-enemy")
const att1 = document.getElementById("button1")
const att2 = document.getElementById("button2")
const att3 = document.getElementById("button3")
const att4 = document.getElementById("button4")
const allyImg = new Image()
const enemyImg = new Image()

const allySprite = new Sprite({
    position: {
        x: 100,
        y: 110
    },
    image: allyImg,
    // frames: {
    //     max: 3,
    //     hold: 30
    // }
    animate: false // true si quiero que el sprite del pokemon sea animado (buscar spritesheet))
})
allySprite.image.onload = function () {
    allySprite.resizeImage(400, 400)
}

const enemySprite = new Sprite({
    position: {
        x: 610,
        y: 10
    },
    image: enemyImg,
    // frames: {
    //     max: 3,
    //     hold: 30
    // }
    animate: false // true si quiero que el sprite del pokemon sea animado (buscar spritesheet))
})
enemySprite.image.onload = function () {
    enemySprite.resizeImage(250, 250)
}



function animateBattle() {
    window.requestAnimationFrame(animateBattle)
    console.log("battle")
    battleBackground.draw()
    setData()
    allySprite.draw()
    enemySprite.draw()
}
animateBattle()

let lastKey = ""
window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "w":
            keys.w.pressed = true
            lastKey = "w"
            break
        case "s":
            keys.s.pressed = true
            lastKey = "s"
            break
        case "a":
            keys.a.pressed = true
            lastKey = "a"
            break
        case "d":
            keys.d.pressed = true
            lastKey = "d"
            break
    }
})
window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "w":
            keys.w.pressed = false
            break
        case "s":
            keys.s.pressed = false
            break
        case "a":
            keys.a.pressed = false
            break
        case "d":
            keys.d.pressed = false
            break
    }
})

