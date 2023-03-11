class Boundary {
    static width = 64
    static height = 64
    constructor({position}) {
        this.position = position
        this.width = 64 // 16 * 4 (16px el tile y un aumento del %400)
        this.height = 64 // 16 * 4
    }
    draw() {
        c.fillStyle = "rgba(255, 0, 0, .5)"
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

class Sprite {
    constructor({ position, image, frames = {max: 1, hold: 10}, sprites, pokemon, animate, isEnemy = false }) {
        this.position = position
        this.image = image
        this.frames = {...frames, val: 0, elapsed: 0}
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.pokemon = pokemon
        this.animate = animate
        this.sprites = sprites
        this.opacity = 1
        this.isEnemy = isEnemy
        this.currentHp = 20
    }
    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height
        )
        c.restore()
        if (!this.animate) return

        if (this.frames.max > 1) {
            this.frames.elapsed++
        }
        if (this.frames.elapsed % this.frames.hold === 0) {
            if (this.frames.val < this.frames.max - 1) this.frames.val ++
            else this.frames.val = 0
        }
    }

    // Funcion extraida de ChatGPT
    resizeImage(width, height) {
        // Crear un canvas
        const canvas = document.createElement('canvas')
        // Establecer el ancho y alto del canvas
        canvas.width = width
        canvas.height = height
        // Obtener el contexto del canvas
        const ctx = canvas.getContext('2d')
        // Dibujar la imagen en el canvas redimensionándola
        ctx.drawImage(this.image, 0, 0, width, height)
        // Actualizar la imagen con la imagen redimensionada
        this.image = new Image()
        this.image.src = canvas.toDataURL()
        // Actualizar el ancho y alto de la imagen
        this.width = width / this.frames.max
        this.height = height
    }

    attack({move, receiver, renderedSprites}) {
        document.querySelector("#dialogue-box").style.display = "block"
        const dialogue = this.pokemon.name + " usó " + move.name + "!"
        document.querySelector("#dialogue-box-text").innerHTML = dialogue.toUpperCase()
        let movementDistance = 20
        let healthBar = "#enemy-hp"
        if (this.isEnemy) {
            movementDistance = -20
            healthBar = "#ally-hp"
        }

        let damage = getDamage(this.pokemon, move, receiver.pokemon)
        receiver.currentHp -= damage
        if (receiver.currentHp <= 0) receiver.currentHp = 0

        switch (move.name) {
            case "razor-leaf":
                const grassProjectileImg = new Image()
                grassProjectileImg.src = "assets/animations/grassAnimation.png"
                const grassProjectile = new Sprite({
                    position: {
                        x: this.position.x + this.image.width / 2,
                        y: this.position.y + this.image.height / 2
                    },
                    image: grassProjectileImg,
                    frames: {
                        max: 4,
                        hold: 5
                    },
                    animate: true
                })
                renderedSprites.splice(1, 0, grassProjectile)
                gsap.to(grassProjectile.position, {
                    x: receiver.position.x + receiver.image.width / 2,
                    y: receiver.position.y + receiver.image.height / 2,
                    onComplete: () => {
                        gsap.to(healthBar, {
                            width: receiver.currentHp * 100 / receiver.pokemon.stats.hp + "%"
                        })
                        gsap.to(receiver.position, {
                            x: receiver.position.x + 10,
                            yoyo: true,
                            repeat: 3,
                            duration: 0.09
                        })
                        gsap.to(receiver, {
                            opacity: 0.4,
                            yoyo: true,
                            repeat: 3,
                            duration: 0.09
                        })
                        renderedSprites.splice(1, 1)
                    }
                })
                break;
            case "tackle":
                const tl = gsap.timeline()
                tl.to(this.position, {
                    x: this.position.x - movementDistance
                }).to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: 0.1,
                    onComplete() {
                        gsap.to(healthBar, {
                            width: receiver.currentHp * 100 / receiver.pokemon.stats.hp + "%"
                        })
                        gsap.to(receiver.position, {
                            x: receiver.position.x + 10,
                            yoyo: true,
                            repeat: 3,
                            duration: 0.09
                        })
                        gsap.to(receiver, {
                            opacity: 0.4,
                            yoyo: true,
                            repeat: 3,
                            duration: 0.09
                        })
                    }
                }).to(this.position, {
                    x: this.position.x
                })
                break;
        }
    }
    faint() {
        const dialogue = this.pokemon.name + " se debilitó!"
        document.querySelector("#dialogue-box-text").innerHTML = dialogue.toUpperCase()
        gsap.to(this.position, {
            y: this.position.y + 20
        })
        gsap.to(this, {
            opacity: 0
        })
        console.log("fainted")
    }
}