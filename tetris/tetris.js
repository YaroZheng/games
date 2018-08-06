var timer = null;
var score = 0;
var shapes = [
    [ // I-0
        [1],
        [1],
        [1],
        [1]
    ],
    [ // J-1
        [0, 1],
        [0, 1],
        [1, 1]
    ],
    [ // L-2
        [1, 0],
        [1, 0],
        [1, 1]
    ],
    [ // O-3
        [1, 1],
        [1, 1]
    ],
    [ // S-4
        [0, 1, 1],
        [1, 1, 0]
    ],
    [ // T-5
        [1, 1, 1],
        [0, 1, 0]
    ],
    [ // Z-6
        [1, 1, 0],
        [0, 1, 1]
    ],
];
var current = {
    x: 0,
    y: -1,
    shape: null,
    nextShape: null,
    freeze: true,
    init: function() {
        // 简单监听器 监听 x, y, shape 的变化
        ['x', 'y', 'shape'].forEach( key => {
            var value = current[key];
            Object.defineProperty( current, key, {
                get: function() {
                    return value;
                },
                set: function(newValue) {
                    value = newValue;
                    current.setTetromino();
                }
            })
        });
        this.createShape();
        this.reset();
    },
    reset: function () {
        this.x = 5;
        this.y = this.aGoodYo();
        this.shape = this.nextShape;
        this.createShape();
        score += 10;
    },
    createShape: function () {
        var randomIndex = parseInt( Math.random() * shapes.length ),
            randomShape = shapes[randomIndex],
            //randomShape = shapes[0],
            randomRotate = parseInt( Math.random() * 4 ),
            nextShape = convert( randomShape, randomRotate );
        // 设置 tetromino 的颜色, +1 是为了避开0
        for ( var y = 0; y < nextShape.length; y++ ) {
            for ( var x = 0; x < nextShape[y].length; x++ ) {
                if ( nextShape[y][x] ) {
                    nextShape[y][x] = randomIndex + 1;
                }
            }
        }
        this.nextShape = nextShape;
    },
    aGoodYo: function() {// 一个好的初始 y 坐标
        var shape = this.nextShape;
        var shapeCenter = getShapeCenter( shape );
        return shapeCenter.y - shape.length;
    },
    setTetromino: function() {
        tetromino = computedCoordinates(this.x, this.y, this.shape);
        // console.log(coordinates)
    }
}
current.init();
var cols = 20,
    rows = 10;

function handler() {
    if ( volid(0, 1) ) {
        current.y ++;
    } else {
        tetrominoToBoard();
    }
}

function tetrominoToBoard() {
    var isOver = false;
    tetromino.forEach( arr => {
        let x = arr[1], y = arr[0];
        if ( y > 0 ) {
            board[y][x] = arr[2];
        } else {
            isOver = true;
        }
    });
    if ( isOver ) {
        gameOver();
    } else {
        current.reset();
        clearLines();
    }
}
function gameOver() {
    clearInterval(timer);
    current.freeze = true;
}
/**
 * 根据 Tetromino 的外形 shape 计算它的重心
 * @param {Array} shape 
 */
function getShapeCenter( shape ) {
    var yCenter = Math.floor( (shape.length - 1) / 2 ) + 1,
        xCenter = Math.floor( (shape[0].length - 1) / 2 ) + 1;
    return {x: xCenter, y: yCenter};
}
function move( direction ) {
    if ( !current.freeze ) {
        return false;
    }
    switch ( direction ) {
        case 'left':
            if ( volid( -1 ) ) {
                current.x--;
            }
            break;
        case 'right':
            if ( volid( 1 ) ) {
                current.x++;
            }
            break;
        case 'down':
            if ( volid( 0, 1 ) ) {
                current.y++;
            }
            break;
        case 'drop':
            while ( volid( 0, 1) ) {
                current.y++;
            }
            break;
    }
}
/**
 * Tetromino 旋转
 */
function rotate() {
    if ( !current.freeze ) {
        return false;
    }
    var shape = convert(current.shape, 1);
    var xo = aGoodRorate(current.x, shape);
    if ( volid( xo - current.x, 0, shape ) ) {
        current.x = xo;
        current.shape = shape;
    }
}
/**
 * 当 Tetromino 贴左右边界移动时，适当的水平偏移以得到更好的旋转
 * @param {number} xo 重心坐标 x
 * @param {Array} shape 
 */
function aGoodRorate(xo, shape) {
    var yo = current.y;
    var shape = convert(current.shape, 1);
    var coordinates = computedCoordinates( xo, yo, shape );
    var x1;
    for ( var i = 0; i < coordinates.length; i++ ) {
        x1 = coordinates[i][1];
        if ( x1 < 0 || x1 >= board[0].length ) {
            return aGoodRorate( xo - x1 / Math.abs(x1), shape );
        }
    }
    return xo;
}

/**
 * check if any lines are filled and clear them.
 */
function clearLines() {
    var lines = 0;
    for( var y = 0; y < board.length; y++ ) {
        if ( board[y].every( value => value > 0 ) ) {
            board.splice( y, 1 );
            board.unshift( Array(board[0].length).fill(0) );
            lines ++;
        }
    }
    // add up score
    var lineScore = [0, 100, 200, 400, 800];
    if ( typeof lineScore[lines] === 'number' ) {
        score += lineScore[lines];
    }
}

/**
 * 获取 shape 的坐标
 * @param {number} xo 重心坐标 x
 * @param {number} yo 重心坐标 y
 * @param {Array} shape 
 */
function computedCoordinates(xo, yo, shape) {
    if ( !Array.isArray( shape ) ) {
        return false;
    }
    var shapeCenter = getShapeCenter( shape );
    var yCenter = shapeCenter.y,
        xCenter = shapeCenter.x,
        coordinatesArr = [],
        x1, y1;

    for ( var y = 0; y < shape.length; y++ ) {
        for ( var x = 0; x < shape[y].length; x++ ) {
            if ( shape[y][x] ) {
                x1 = xo + (x - xCenter);
                y1 = yo + (y - yCenter);
                coordinatesArr.push( [y1, x1, shape[y][x]] );
            }
        }
    }
    return coordinatesArr;
}
/**
 * 判断下一个动作是否有效
 * @param {number} offsetX 水平偏移量
 * @param {number} offsetY 竖直偏移量
 * @param {Array} shape 
 */
function volid( offsetX, offsetY, shape ) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    shape = shape || current.shape;
    var xo = current.x + offsetX, yo = current.y + offsetY;
    var coordinatesArr = computedCoordinates(xo, yo, shape);

    if ( !Array.isArray( shape ) ) {
        return false;
    }
    for ( var i = 0; i < coordinatesArr.length; i++ ) {
        var y = coordinatesArr[i][0], x = coordinatesArr[i][1];
        if ( x < 0 || x >= board[0].length || y >= board.length ) {
            return false;
        }
        if ( y > 0 && board[y][x] ) {
            return false;
        }
    }
    return true;
}

function pause() {
    if ( timer ) {
        clearInterval( timer );
        timer = null;
        current.freeze = false;
    } else {
        start();
    }
    
}
function start() {
    current.freeze = true;
    timer = setInterval(handler, 300);
}
function restart() {
    clearInterval( timer );
    init();
    score = 0;
    current.init();
    start();
}

function keyPress( key ) {
    switch ( key ) {
        case 'left': case 'right': case 'down': case 'drop':    
            move( key );
            break;
        case 'rotate':
            rotate();
            break;
        case 'pause':
            pause();
            break;
        case 'restart':
            restart();
            break;
    }
}
/**
 * 顺时针转化矩阵/二维数组
 * 
 * @param {Array} arr 
 * @param {integer} time 转换次数，默认转一次
 * @returns {Array} 新的二维数组
 */
function convert(arr, time) {
    if (typeof time !== 'number') {
        time = 1;
    } else {
        time = Math.abs(parseInt(time));
    }
    if (time == 0) {
        return arr;
    }
    var xl = arr[0].length;
    var yl = arr.length;
    var rtn = [];
    for (var i = 0; i < xl; i++) {
        rtn[i] = [];
        for (var j = 0; j < yl; j++) {
            rtn[i][j] = arr[yl - j - 1][i];
        }
    }
    return convert(rtn, --time);
}