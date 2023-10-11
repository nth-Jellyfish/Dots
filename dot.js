// Declaration
// Should have a depth field perhaps
// Should consider having more granular x and y and velocity
export class Dot {
    constructor(radius, bindRadius, color, x, y, velocityX, velocityY, render) {
      this.radius = radius
      this.bindRadius = bindRadius
      this.color = color
      this.mass = radius * 10
      this.position = new Vector2(x, y)
      this.velocity = new Vector2(velocityX, velocityY)
      this.render = render
      // memory leak something
      this.attemptedConnections = []
    }
    step() {

        this.position.x = this.position.x + this.velocity.x
        this.position.y = this.position.y + this.velocity.y
        //return new Vector2(this.x, this.y)
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(Math.round(this.position.x), Math.round(this.position.y), this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    // could change the render var to this function so that we can control rendering on a per frame basis
    frame(ctx) {
        if (this.render) {
            this.draw(ctx)
        }
    }
    addAttemptedConnection(dot) {
        this.attemptedConnections.push(dot)
    }
    reset(radius, bindRadius, color, x, y, velocityX, velocityY, render) {
        this.radius = radius
        this.bindRadius = bindRadius
        this.color = color
        this.position = new Vector2(x, y)
        this.velocity = new Vector2(velocityX, velocityY)
        this.render = render
        // memory leak something
        this.attemptedConnections = []
        return this
    }
    addVelocity(vec) {
        this.velocity = this.velocity.add(vec)

    }
    split() {
        // half volume get normal of vector and -normal apply velocity, add to attempted connections so that they dont bind or force bind?
    }
}

class Connection {
    constructor(doti, dotj, colorLambda) {
        this.doti = doti
        this.dotj = dotj
        this.colorLambda = colorLambda
    }
    // consider not applying force if radius gets too small
    applyForce() {
        const GRAVITATIONAL_CONSTANT = 0.00001
        let vector = this.doti.position.subtract(this.dotj.position)
        let radius = vector.magnitude() * 0.5
        let radiusSquare = radius * radius
        let force = GRAVITATIONAL_CONSTANT * this.doti.mass * this.dotj.mass / radiusSquare
        let normalized = vector.normalize()
        let iForce = normalized.scale(force * -1)
        let jForce = normalized.scale(force)
        this.doti.addVelocity(iForce)
        this.dotj.addVelocity(jForce)
    }
}

// dots need to be removed once they are out of frame!
// should have variable color
export class Board {
    constructor(width, height, color, dots, dotcolor, lineColor1, lineColor2, lineColor3, lineWidth, lineChance, lineForce, bindRadius, dotRenderChance, ctx) {
        this.width = width
        this.height = height
        this.color = color
        this.dotcolor = dotcolor
        this.lineColor1 = lineColor1
        this.lineColor2 = lineColor2
        this.lineColor3 = lineColor3
        this.lineWidth = lineWidth
        this.lineChance = lineChance
        this.lineForce = lineForce
        this.bindRadius = bindRadius
        this.dotRenderChance = dotRenderChance
        this.headRoom = 200
        this.ctx = ctx
        this.dots = []
        this.lines = []
        for (let i = 0; i < dots; i++) {
            this.generateDot()
        }
    }
    // These guys might want to fade in
    generateDot() {

        let radius = randPositive(1, 30)
        let x = randPositive(0, this.width)
        let y = randPositive(0, this.height)
        let xVelocity = rand(1)
        let yVelocity = rand(.5)
        // #E5C3A6
        if (Math.random() > this.dotRenderChance) {
            this.dots.push(new Dot(radius, this.bindRadius, this.dotcolor, x, y, xVelocity, yVelocity, false))
        } else {
            this.dots.push(new Dot(radius, this.bindRadius, this.dotcolor, x, y, xVelocity, yVelocity, true))
        }
    }
    regenerateDot(dot) {
        let radius = randPositive(1, 30)
        let x = randPositive(0, (this.width + this.headRoom * 2)) - this.headRoom
        let y = randPositive(0, (this.height + this.headRoom * 2)) - this.headRoom
        let xVelocity = rand(1.5)
        let yVelocity = rand(1)
        if (Math.random() > this.dotRenderChance) {
            this.dots.push(dot.reset(radius, this.bindRadius, this.dotcolor, x, y, xVelocity, yVelocity, false))
        } else {
            this.dots.push(dot.reset(radius, this.bindRadius, this.dotcolor, x, y, xVelocity, yVelocity, true))
        }
    }
    addDot(dot) {
        this.dots.push(dot)
    }
    frame() {
        this.ctx.clearRect(0, 0, this.width, this.height)
        // old color: 2E4374
        this.ctx.fillStyle = this.color
        this.ctx.fillRect(0, 0, this.width, this.height) // x, y, width, height
        this.dots.forEach(dot => dot.step())
        this.addConnections()
        this.removeConnections()
        this.renderConnections(true)
        this.dots.forEach(dot => dot.frame(this.ctx))

        this.removeOutliers()
    }
    partialRedraw() {
        console.log("partial redraw")
    }

    /* It's not ideal that we go through this list so many times per frame, we should try dependency injection */
    addConnections() {
        this.dots.sort((a, b) => a.position.x - b.position.x)
        for (let i = 0; i < this.dots.length; i++) {
            for (let j = i+1; j < this.dots.length; j++) {
                let doti = this.dots[i]
                let dotj = this.dots[j]
                let vectori = new Vector2(doti.position.x, doti.position.y)
                let vectorj = new Vector2(dotj.position.x, dotj.position.y)
                let diff = vectori.subtract(vectorj)
                let distance = diff.magnitude()
                if (doti.attemptedConnections.includes(dotj)) {
                    continue
                }
                if (dotj.position.x - doti.position.x > doti.bindRadius) {
                    break
                }

                if (distance > doti.bindRadius) {
                    continue
                }

                doti.attemptedConnections.push(dotj)
                dotj.attemptedConnections.push(doti)

                if (Math.random() > this.lineChance) {
                    console.log("miss")
                    continue
                }


                if (distance < doti.bindRadius) {
                    let rng = Math.random()
                    if (rng < 0.33) {
                        this.lines.push(new Connection(doti, dotj, this.lineColor1))
                    } else if(rng <=.66) {
                        this.lines.push(new Connection(doti, dotj, this.lineColor2))
                    } else {
                        this.lines.push(new Connection(doti, dotj, this.lineColor3))
                    }
                }
            }
        }
    }
    removeConnections() {
        this.lines = this.lines.filter(connection => {
            let doti = connection.doti
            let dotj = connection.dotj
            let vectori = new Vector2(doti.position.x, doti.position.y)
            let vectorj = new Vector2(dotj.position.x, dotj.position.y)
            let diff = vectori.subtract(vectorj)
            let distance = diff.magnitude()
            // will need to change this if we have diff bind radii
            return distance < doti.bindRadius
        })
    }

    renderConnections(render) {
        for (let i = 0; i < this.lines.length; i++) {
            if (this.lineForce) {
                this.lines[i].applyForce()
            }
            if (render) {
                let doti = this.lines[i].doti
                let dotj = this.lines[i].dotj
                let vectori = new Vector2(doti.position.x, doti.position.y)
                let vectorj = new Vector2(dotj.position.x, dotj.position.y)
                let diff = vectori.subtract(vectorj)
                let distance = diff.magnitude()
                let strength = Math.round((1 - (distance/doti.bindRadius)) * 100)/100
                let color = this.lines[i].colorLambda(strength)
                this.ctx.strokeStyle = color
                this.ctx.lineWidth = this.lineWidth
                this.ctx.beginPath()
                this.ctx.moveTo(doti.position.x, doti.position.y)
                this.ctx.lineTo(dotj.position.x, dotj.position.y)
                this.ctx.stroke()
            }
            
        }
    }
    // Should we go by the greater or lesser bind distance?
    proximityLines() {
        let lineChance = 1.0
        this.dots.sort((a, b) => a.position.x - b.position.x)

        for (let i = 0; i < this.dots.length; i++) {
            for (let j = i+1; j < this.dots.length; j++) {
                let doti = this.dots[i]
                let dotj = this.dots[j]
                if (dotj.x - doti.x > doti.bindRadius) {
                    break
                }

                let vectori = new Vector2(doti.x, doti.y)
                let vectorj = new Vector2(dotj.x, dotj.y)
                let diff = vectori.subtract(vectorj)
                let distance = diff.magnitude()
                if (distance < doti.bindRadius && Math.random() <= lineChance) {
                    // Somehting is wrong here regarding light weight
                    let strength = Math.round((1 - (distance/doti.bindRadius)) * 100)/100
                    let color = this.lineColor(strength)
                    this.ctx.strokeStyle = color
                    this.ctx.lineWidth = 0.3
                    this.ctx.beginPath()
                    this.ctx.moveTo(doti.x, doti.y)
                    this.ctx.lineTo(dotj.x, dotj.y)
                    this.ctx.stroke()
                }
            }
        }
    }
    // maybe we just reassign that outliers rather than generate new!!
    removeOutliers() {
        let headRoom = this.headRoom
        let count = this.dots.length
        let clone = this.dots.filter(dot => dot.position.x > this.width + headRoom || dot.position.x < 0 - headRoom || dot.position.y > this.height + headRoom || dot.position.y < 0 - headRoom)
        this.dots = this.dots.filter(dot => dot.position.x <= this.width + headRoom && dot.position.x >= 0 - headRoom && dot.position.y <= this.height + headRoom && dot.position.y >= 0 - headRoom)
        if (clone.length + this.dots.length != count) {
            console.log("WTF")
        }

        clone.forEach(removedDot => {
            removedDot.attemptedConnections.forEach(connectedDot => {
                let index = connectedDot.attemptedConnections.indexOf(removedDot)
                connectedDot.attemptedConnections.splice(index, 1)
            })
            this.lines = this.lines.filter((connection) => removedDot != connection.doti && removedDot != connection.dotj)
            this.regenerateDot(removedDot)
        })
        let removed = count - this.dots.length
        for (let i = 0; i < removed; i++) {
            this.generateDot()
        }
    }

}

export class Vector2 {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    normalize() {
        let magnitude = this.magnitude()
        let unitx = this.x / magnitude
        let unity = this.y / magnitude
        return new Vector2(unitx, unity)
    }
    subtract(other) {
        return new Vector2(this.x - other.x, this.y - other.y)
    }
    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y)
    }
    scale(factor) {
        return new Vector2(this.x * factor, this.y * factor)
    }
    invert() {
        return new Vector2(this.x * -1, this.y * -1)
    }
}

function randPositive(min, multiplier) {
    return Math.random() * multiplier + min
}

function rand(multiplier) {
    return ((Math.random() - 0.5) * 2) * multiplier
}
