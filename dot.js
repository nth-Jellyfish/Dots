// Declaration
// Should have a depth field perhaps
// Should consider having more granular x and y and velocity
export class Dot {
    constructor(radius, bindRadius, color, x, y, velocityX, velocityY) {
      this.radius = radius
      this.bindRadius = bindRadius
      this.color = color
      this.x = x
      this.y = y
      this.velocity = new Vector2(velocityX, velocityY)
    }
    step() {
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        return new Vector2(this.x, this.y)
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(Math.round(this.x), Math.round(this.y), this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    // maybe break up this into two functions so I can call proximity lines in between
    frame(ctx) {
        //this.draw(ctx)
        this.step()
    }
}

// dots need to be removed once they are out of frame!
// should have variable color
export class Board {
    constructor(width, height, color, dotcolor, lineColor, ctx) {
        this.width = width
        this.height = height
        this.color = color
        this.dotcolor = dotcolor
        this.lineColor = lineColor
        this.ctx = ctx
        this.dots = []
    }
    // These guys might want to fade in
    generateDot() {
        let radius = randPositive(3, 2)
        let x = randPositive(0, 1300)
        let y = randPositive(0, 500)
        let xVelocity = rand(1.5)
        let yVelocity = rand(1)
        // #E5C3A6
        this.dots.push(new Dot(radius, 300, this.dotcolor, x, y, xVelocity, yVelocity))
    }
    addDot(dot) {
        this.dots.push(dot)
    }
    frame() {
        this.ctx.clearRect(0, 0, this.width, this.height)
        // old color: 2E4374
        this.ctx.fillStyle = this.color
        this.ctx.fillRect(0, 0, 1400, 500) // x, y, width, height
        this.dots.forEach(dot => dot.frame(this.ctx))
        this.proximityLines()
        this.removeOutliers()
    }
    partialRedraw() {
        console.log("partial redraw")
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
        let count = this.dots.length
        this.dots = this.dots.filter(dot => dot.x < this.width && dot.x > 0 && dot.y < this.height && dot.y > 0)
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
