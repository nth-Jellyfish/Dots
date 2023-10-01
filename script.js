// Select the canvas element
import { Vector2, Dot, Board } from './dot.js'


let cnv = document.getElementById('myCanvas')
let ctx = cnv.getContext('2d');
/*
rgb(197, 139, 229)
rgb(168, 192, 238)
rgb(255, 183, 253)
*/
/* */
let height = window.innerHeight
let width = window.innerWidth
let bindRadius = 500
let lineWidth = 0.4
let dotRenderChance = 1.0
let lineChance = 0.3
let dots = 77
let backgroundColor = '126, 109, 224'
let dotColor = '155, 40, 123'
let l1Color = '126, 109, 224'
let l2Color = '126, 109, 224'
let l3Color = '23, 15, 17'
/* */

let background = `rgb(${backgroundColor})`
let dotColorRgb = `rgb(${dotColor})`
let lineColor1 = (alpha) => `rgba(${l1Color}, ${alpha})`
let lineColor2 = (alpha) => `rgba(${l2Color}, ${alpha})`
let lineColor3 = (alpha) => `rgba(${l3Color}, ${alpha})`
// old color: #2E4374
console.log(window.innerHeight)
console.log(window.innerWidth)
cnv.height = height
cnv.width = width
let board = new Board(width, height, background, dotColorRgb, lineColor1, lineColor2, lineColor3, lineWidth, lineChance, bindRadius, dotRenderChance, ctx)
for (let i = 0; i < dots; i++) {
    board.generateDot()
}

function animate() {
    board.frame()
    requestAnimationFrame(animate)
}
animate()


// function resizeCanvas() {
//     const canvas = document.getElementById('myCanvas'); // Make sure to provide your canvas id
//     const dpi = window.devicePixelRatio;

//     // The width and height of the canvas in the page
//     const styleWidth = getComputedStyle(canvas).width;
//     const styleHeight = getComputedStyle(canvas).height;

//     // Set the canvas drawing buffer size to match the rendered size, considering devicePixelRatio
//     canvas.width = parseInt(styleWidth) * dpi;
//     canvas.height = parseInt(styleHeight) * dpi;


//     // Get the 2D rendering context
//     var ctx = canvas.getContext('2d');
//     ctx.fillStyle = '#F39F5A';
//     ctx.fillRect(0, 0, canvas.width-100, canvas.height-100); // x, y, width, height

//     // (Optional) Here you may need to adjust any drawing parameters that depend on canvas size
//     // For example: 
//     // ctx.lineWidth = 5 * dpi; // If you want a line width that scales with DPI
// }

// // Initial resize
// resizeCanvas();

// Handle window resize
// window.addEventListener('resize', resizeCanvas);