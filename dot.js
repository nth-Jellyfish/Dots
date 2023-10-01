// Declaration
// Should have a depth field perhaps
// Should consider having more granular x and y and velocity
export class Dot {
    constructor(radius, bindRadius, color, x, y, velocityX, velocityY, render) {
      this.radius = radius
      this.bindRadius = bindRadius
      this.color = color
      this.x = x
      this.y = y
      this.velocity = new Vector2(velocityX, velocityY)
      this.render = render
      // memory leak something
      this.attemptedConnections = []
    }
    step() {
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        //return new Vector2(this.x, this.y)
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(Math.round(this.x), Math.round(this.y), this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    // maybe break up this into two functions so I can call proximity lines in between
    // could change the render var to this function so that we can control rendering on a per frame basis
    frame(ctx) {
        if (this.render) {
            this.draw(ctx)
        }
    }
    addAttemptedConnection(dot) {
        this.attemptedConnections.push(dot)
    }
}

class Connection {
    constructor(doti, dotj, colorLambda) {
        this.doti = doti
        this.dotj = dotj
        this.colorLambda = colorLambda
    }
}

// dots need to be removed once they are out of frame!
// should have variable color
export class Board {
    constructor(width, height, color, dotcolor, lineColor1, lineColor2, lineColor3, lineWidth, bindRadius, dotRenderChance, ctx) {
        this.width = width
        this.height = height
        this.color = color
        this.dotcolor = dotcolor
        this.lineColor1 = lineColor1
        this.lineColor2 = lineColor2
        this.lineColor3 = lineColor3
        this.lineWidth = lineWidth
        this.bindRadius = bindRadius
        this.dotRenderChance = dotRenderChance
        this.headRoom = 200
        this.ctx = ctx
        this.dots = []
        this.lines = []
    }
    // These guys might want to fade in
    generateDot() {

        let radius = randPositive(1, 2)
        let x = randPositive(0, this.width)
        let y = randPositive(0, this.height)
        let xVelocity = rand(1.5)
        let yVelocity = rand(1)
        // #E5C3A6
        if (Math.random() > this.dotRenderChance) {
            this.dots.push(new Dot(radius, this.bindRadius, this.dotcolor, x, y, xVelocity, yVelocity, false))
        } else {
            this.dots.push(new Dot(radius, this.bindRadius, this.dotcolor, x, y, xVelocity, yVelocity, true))
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
        this.renderConnections()
        this.dots.forEach(dot => dot.frame(this.ctx))

        this.removeOutliers()
    }
    partialRedraw() {
        console.log("partial redraw")
    }
    addConnections() {
        let lineChance = 0.5
        this.dots.sort((a, b) => a.x - b.x)
        for (let i = 0; i < this.dots.length; i++) {
            for (let j = i+1; j < this.dots.length; j++) {
                let doti = this.dots[i]
                let dotj = this.dots[j]
                if (doti.attemptedConnections.includes(dotj)) {
                    continue
                }
                if (dotj.x - doti.x > doti.bindRadius) {
                    break
                }

                doti.attemptedConnections.push(dotj)
                dotj.attemptedConnections.push(doti)

                if (Math.random() > lineChance) {
                    console.log("miss")
                    continue
                }

                let vectori = new Vector2(doti.x, doti.y)
                let vectorj = new Vector2(dotj.x, dotj.y)
                let diff = vectori.subtract(vectorj)
                let distance = diff.magnitude()
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
            let vectori = new Vector2(doti.x, doti.y)
            let vectorj = new Vector2(dotj.x, dotj.y)
            let diff = vectori.subtract(vectorj)
            let distance = diff.magnitude()
            // will need to change this if we have diff bind radii
            return distance < doti.bindRadius
        })
    }

    renderConnections() {
        for (let i = 0; i < this.lines.length; i++) {
            let doti = this.lines[i].doti
            let dotj = this.lines[i].dotj
            let vectori = new Vector2(doti.x, doti.y)
            let vectorj = new Vector2(dotj.x, dotj.y)
            let diff = vectori.subtract(vectorj)
            let distance = diff.magnitude()
            let strength = Math.round((1 - (distance/doti.bindRadius)) * 100)/100
            let color = this.lines[i].colorLambda(strength)
            this.ctx.strokeStyle = color
            this.ctx.lineWidth = this.lineWidth
            this.ctx.beginPath()
            this.ctx.moveTo(doti.x, doti.y)
            this.ctx.lineTo(dotj.x, dotj.y)
            this.ctx.stroke()
        }
    }
    // Should we go by the greater or lesser bind distance?
    proximityLines() {
        let lineChance = 1.0
        this.dots.sort((a, b) => a.x - b.x)

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
        let clone = this.dots.filter(dot => dot.x > this.width + headRoom || dot.x < 0 - headRoom || dot.y > this.height + headRoom || dot.y < 0 - headRoom)
        this.dots = this.dots.filter(dot => dot.x <= this.width + headRoom && dot.x >= 0 - headRoom && dot.y <= this.height + headRoom && dot.y >= 0 - headRoom)
        if (clone.length + this.dots.length != count) {
            console.log("WTF")
        }

        clone.forEach(removedDot => {
            removedDot.attemptedConnections.forEach(connectedDot => {
                let index = connectedDot.attemptedConnections.indexOf(removedDot)
                connectedDot.attemptedConnections.splice(index, 1)
            })
            this.lines = this.lines.filter((connection) => removedDot != connection.doti && removedDot != connection.dotj)
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
    subtract(other) {
        return new Vector2(this.x - other.x, this.y - other.y)
    }
}

function randPositive(min, multiplier) {
    return Math.random() * multiplier + min
}

function rand(multiplier) {
    return ((Math.random() - 0.5) * 2) * multiplier
}
