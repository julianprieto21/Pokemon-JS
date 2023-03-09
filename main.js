const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")

canvas.width = 1024
canvas.height = 576

const collisionsMap = []
for (let i = 0; i < collisions.length; i+=85) {
    collisionsMap.push(collisions.slice(i, i + 85))
}

const offset = {
    x: -2625,
    y: -1750
}

const boundaries = []
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 14779)
        boundaries.push(new Boundary({position: {
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
foregroundImg.src = "./assets/maps/foregroundObjects.png"

const player = new Sprite({
    position: {
        x: canvas.width / 2 - 1008 / 12 / 2,
        y: canvas.height / 2 - 100 / 12 / 2
    },
    image: playerImgDown,
    frames: {
        max: 3
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

const movables = [background, ...boundaries, foreground]

function rectCollision({rect1, rect2}) {
    return (rect1.position.x + rect1.width >= rect2.position.x &&
        rect1.position.x <= rect2.position.x + rect2.width &&
        rect1.position.y <= rect2.position.y + rect2.height &&
        rect1.position.y + rect1.height >= rect2.position.y)
}

function animateMovement() {
    window.requestAnimationFrame(animateMovement)
    background.draw()
    boundaries.forEach(boundary => {
        boundary.draw()
    })
    player.draw()
    foreground.draw()

    let moving = true
    player.moving = false
    if (keys.w.pressed && lastKey === "w") {
        player.moving = true
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
                console.log("Colliding")
                moving = false
                break
            }
        }
        if (moving)
            movables.forEach((movable) => {
                movable.position.y += 5
            })
    } else if (keys.s.pressed && lastKey === "s") {
        player.moving = true
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
                console.log("Colliding")
                moving = false
                break
            }
        }
        if (moving)
        movables.forEach((movable) => {
            movable.position.y -= 5
        })
    } else if (keys.a.pressed && lastKey === "a") {
        player.moving = true
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
                console.log("Colliding")
                moving = false
                break
            }
        }
        if (moving)
        movables.forEach((movable) => {
            movable.position.x += 5
        })
    } else if (keys.d.pressed && lastKey === "d") {
        player.moving = true
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
                console.log("Colliding")
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
animateMovement()
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

const startBattle = (event) => {
    event.preventDefault();
    const { value } = event.target.pokemon;
    const ally = new Pokemon(value);
    const id = Math.ceil(Math.random() * 493)
    const enemy = new Pokemon(id)
    setTimeout(() => {
        const battle = new Battle(ally, enemy);
        console.log(battle.ally);
    }, 1500);
}
