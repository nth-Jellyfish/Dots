// Select the canvas element
import { Vector2, Dot, Board } from './dot.js'
let cnv = document.getElementById('myCanvas');



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


let ctx = cnv.getContext('2d');
ctx.fillStyle = '#2E4374';
ctx.fillRect(0, 0, 1400, 500); // x, y, width, height


let board = new Board(1400, 500, '#2E4374', ctx)

for (let i = 0; i < 50; i++) {
    board.generateDot()
}

function animate() {
    board.frame()
    requestAnimationFrame(animate)
}

animate()

function totalRedraw(ctx) {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.fillStyle = '#2E4374';
    ctx.fillRect(0, 0, 1400, 500); // x, y, width, height
    dots.forEach(dot => dot.frame(ctx))
}

function partialRedraw() {

}