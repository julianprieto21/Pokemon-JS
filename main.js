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
const boundaries = []
const offset = {
    x: -1325,
    y: -570
}

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
const img = new Image()
img.src = "./assets/maps/map.png"
const foregroundImg = new Image()
foregroundImg.src = "./assets/maps/foreground.png"
const playerImgDown = new Image()
playerImgDown.src = "./assets/player/goldDown.png"
const playerImgUp = new Image()
playerImgUp.src = "./assets/player/goldUp.png"
const playerImgLeft = new Image()
playerImgLeft.src = "./assets/player/goldLeft.png"
const playerImgRight = new Image()
playerImgRight.src = "./assets/player/goldRight.png"

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
const renderables = [background, ...boundaries, ...battleZones, player, foreground]
const battle = {
    initiated: false
}

function rectCollision({rect1, rect2}) {
    return (rect1.position.x + rect1.width >= rect2.position.x &&
        rect1.position.x <= rect2.position.x + rect2.width &&
        rect1.position.y <= rect2.position.y + rect2.height &&
        rect1.position.y + rect1.height >= rect2.position.y)
}


function animate() {
    const animationId = window.requestAnimationFrame(animate)
    renderables.forEach((renderable) => {
        renderable.draw()
    })

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
                                gsap.to("#overlapping-div", {
                                opacity: 0,
                                duration: 0.3
                                })
                                initBattle()
                                animateBattle()
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
            break;
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





