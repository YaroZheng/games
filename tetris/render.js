var Renderer = (function(){
    

})();
/**
 * 假设我提供一个方格子渲染器
 * 我只是起到渲染的作用
 * 不做任何游戏逻辑的处理
 */
'use strict';
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var canvasWidth = 400, canvasHeight = 800;
var board = [], tetromino = [];
var boardCols = 10, boardRows = 20;
var blockWidth = canvasWidth / boardCols, blockHeight = canvasHeight / boardRows;
var colors = ["Gold", "Olive", "purple", "DeepSkyBlue", "ForestGreen", "brown", "Turquoise"];
var blockColor = "#ffffff";
/**
 * draw a single equare at (x, y)
 * 在坐标 (x, y) 上画一个格子
 * @param {number} x 
 * @param {number} y 
 */
function drawBlock( x, y, c ) {
    ctx.fillStyle = colors[c-1];
    ctx.fillRect( blockWidth * x, blockHeight * y, blockWidth - 1, blockHeight - 1);
}

// clear the board
function init() {
    for ( var y = 0; y < boardRows; y++ ) {
        board[y] = [];
        for ( var x = 0; x < boardCols; x++ ) {
            board[y][x] = 0;
        }
    }
}

function render() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = blockColor;
    for ( var y = 0; y < board.length; y++ ) {
        for ( var x = 0; x < board[y].length; x++ ) {
            if ( board[y][x] ) {
                drawBlock( x, y, board[y][x] );
            }
        }
    }

    tetromino.forEach( arr => {
        drawBlock( arr[1], arr[0], arr[2] );
    });
}

init();
setInterval(render, 100);