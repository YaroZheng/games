'use strict';
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// 模型矩阵
const Model = [
    [// T-0
        [1, 1, 1],
        [0, 1, 0]
    ],
    [// L-1
        [1, 0],
        [1, 0],
        [1, 1]
    ],
    [// J-2
        [0, 1],
        [0, 1],
        [1, 1]
    ],
    [// Z-3
        [1, 1, 0],
        [0, 1, 1]
    ],
    [// S 4
        [0, 1, 1],
        [1, 1, 0]
    ],
    [// O-5
        [1, 1],
        [1, 1]
    ],
    [// I-6
        [1],
        [1],
        [1],
        [1]
    ]
];
var config = {
    x: 10,  // x坐标长度
    y: 20,  // y坐标长度
    l: 40,  // 方格边长
    r: 39,  // 方块半径
    t: 100  // 积木移动速度 100ms/移动一格
};
/**
 * 得分
 */
var goal = 100;

/**
 * 游戏状态 0-结束 1-正常 2-暂停
 */
var state = 0;

/**
 * 计时器
 */
var timer = {
    main: null,   // 主计时器
}

/**
 * 游戏帧数
 */
var fpsObj = {
    value: 0,           // fps值
    startTime: 0,       // 开始时间
    frameNumber: 0,     // 总帧数
    init: function() {
        this.startTime = new Date().getTime();
        this.frameNumber = 0;
    },
    compute: function() {
        this.value = (this.frameNumber * 1000 / (new Date().getTime() - this.startTime)).toFixed(2)
        // console.log(this.value);
    }
}

/**
 * 面板
 */
var panel = Array();
function initPanel () {
    for(var y=0; y<20; y++) {
        panel[y] = Array();
        for(var x=0; x<10; x++) {
            panel[y][x] = 0;
        }
    }
}
initPanel();

// console.log(panel);
function test() {
    var num = parseInt(Math.random()*6);
    console.log(num)
}
test();

// 积木
var Block = {
    x: 0,
    y: 3,
    radius: config.r,
    color: '#ffffff',
    type: 5,
    derection: 1,
    coordinate: null,
    
    draw: function() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        this.coordinate = getCoordinate(this.x, this.y, this.type, this.derection);
        this.coordinate.forEach(function(arr){
            ctx.fillRect(arr[1]*config.l, arr[0]*config.l, this.radius, this.radius);
        }.bind(this));
        //console.log(this.coordinate)
        ctx.closePath();
    },
}
// Block.draw();
// throw "1111";
initBlock();
function handle() {
    displayData();
    fpsObj.frameNumber ++;
    ctx.clearRect(0,0, canvas.width, canvas.height);
    var coordinate = Block.coordinate;
    if (coordinate !==null && !collisionDetection(coordinate, 2)) {
        for (var i in coordinate) {
            let y = coordinate[i][0], x = coordinate[i][1];
            if (y <= 0) {
                gameOver();
                return false;
            }
            panel[y][x] = 1;
        }
        initBlock();
    } else {
        Block.y ++;
    }
    // 渲染面板
    score();
    renderPanel();
    Block.draw();
    fpsObj.compute();
}

function displayData() {
    let scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = goal;
    }
    let fpsElement = document.getElementById('fps');
    if (fpsElement) {
        fpsElement.textContent = fpsObj.value;
    }
}

/**
 * 渲染面板
 */
function renderPanel() {
    for(var y=0; y<panel.length; y++) {
        for(var x=0; x<panel[y].length; x++) {
            if (panel[y][x] == 1) {
                ctx.fillRect(x*config.l, y*config.l, config.r, config.r);
            }
        }
    }
}

/**
 * 记分
 */
function score() {
    for(var y=0; y<panel.length; y++) {
        // 如果一整行都不为空，则消除并且记分
        if (panel[y].every(value => value === 1)) {
            panel.splice(y, 1);
            panel.unshift(Array(config.x).fill(0));
            goal = goal + 10;
            displayData();
        }
    }
}

function initBlock() {
    Block.y = -1;
    Block.x = 4;
    let type;
    do {
        type = parseInt(Math.random()*Model.length);
    } while (type == Block.type);
    Block.derection = parseInt(Math.random()*4);
    Block.type = type;
}

function start() {
    if (state > 0) {
        fpsObj.init();
        state = 1;
        timer.main = setInterval(handle, config.t)
    }
}
function stop() {
    if (state === 1) {
        state = 2;
        clearInterval(timer.main);
    }
}
function pause() {
    if (state === 1) {
        stop();
    } else if (state === 2) {
        start();
    }
}
function restart() {
    stop();
    initBlock();
    initPanel();
    goal = 0;
    state = 1;
    start();
}
function gameOver() {
    stop();
    state = 0;
    ctx.fillStyle = "#ddd";
    ctx.font = "66px serif";
    ctx.fillText("Game  Over", 1*config.l, 8*config.l);
    ctx.font = "36px serif";
    ctx.fillText("Score: "+goal, 3*config.l, 10*config.l);
}

/**
 * 方块旋转
 */
function change() {
    if (state !== 1) {
        return false;
    }
    var derection = (Block.derection + 1) % 4;
    var coordinate = getCoordinate(Block.x, Block.y, Block.type, derection);
    if (reasonableBlock(coordinate)) {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        Block.derection = derection;
        renderPanel();
        Block.draw();
    }
}

function transform() {
    if (state !== 1) {
        return false;
    }
    ctx.clearRect(0,0, canvas.width, canvas.height);
    var type;
    do {
        type = parseInt(Math.random()*7);
    } while (type == Block.type);
    Block.derection = parseInt(Math.random()*4);
    Block.type = type;
    renderPanel();
    Block.draw();
}

/**
 * 方块移动
 * @param {integer} num right:1 bottom:2 left:3
 */
function move(num) {
    if (state !== 1) {
        return false;
    }
    ctx.clearRect(0,0, canvas.width, canvas.height);
    var coordinate = Block.coordinate;
    if (num === 0) {
        change();
    } else if (num === 1) {
        if (collisionDetection(coordinate, 1)) {
            Block.x ++;
        }
    } else if (num === 2) {
        if (collisionDetection(coordinate, 2)) {
            Block.y ++;
        }
    } else if (num === 3) {
        if (collisionDetection(coordinate, 3)) {
            Block.x --;
        }
    }
    renderPanel();
    Block.draw();
}

/**
 * 获取矩阵的坐标数组
 * @param {*} x 矩阵的最左边
 * @param {*} y 矩阵的最下边 x y 代表矩阵的左下角
 * @param {*} type 矩阵类别
 * @param {*} derection 矩阵方向
 * @requires Model
 * @requires convert
 */
function getCoordinate (x, y ,type , derection) {
    var arr = convert(Model[type], derection);
    var arrL = arr.length;  // 方块的长度
    // 将矩阵转为实际坐标
    var coordinate = Array();
    for(var i=0; i < arrL; i++) {
        for(var j=0; j < arr[i].length; j++) {
            if (arr[i][j] == 1) {
                var x1 = (x+j), y1 = (y-arrL+i+1);
                coordinate.push([y1, x1]);
            }
        }
    }
    return coordinate;
};
 
/**
 * 判断积木的存在是否合理
 * @param {Array} coordinate 积木的二维坐标数组
 * @returns {boolean}
 */
function reasonableBlock(coordinate) {
    if (!Array.isArray(coordinate) || coordinate.length < 1) {
        return false;
    }
    for(var idx in coordinate) {
        // 判断是否为坐标格式的数组 [y, x]
        if (!Array.isArray(coordinate[idx]) || coordinate[idx].length !== 2) {
            return false;
        }
        let y = coordinate[idx][0];
        let x = coordinate[idx][1];
        // 超出左右下边界的不合理
        if (x < 0 || x >= config.x || y >= config.y) {
            return false;
        }
        // 在面板内，位置已经被占用的不合理
        if (y >= 0 && panel[y][x] === 1) {
            return false;
        }
    }
    return true;
}

/**
 * 判断积木能否向某一个方向运动
 * @param {Array} coordinate 积木的二维坐标数组
 * @param {integer} derection 方向  0(top) 1(right) 2(bottom) 3(left)
 * @return {boolean} 判断下一个方向的
 */
function collisionDetection(coordinate, derection) {
    if (!Array.isArray(coordinate) || coordinate.length < 1) {
        return false;
    }
    var best = [true, true, true, true];// top right bottom left
    var x,y;
    
    for(var idx in coordinate) {
        // 判断是否为坐标格式的数组 [y, x]
        if (!Array.isArray(coordinate[idx]) || coordinate[idx].length !== 2) {
            return false;
        }
        y = coordinate[idx][0];
        x = coordinate[idx][1];
        
        // 暂不做判断
        if (best[0] && (!Array.isArray(panel[y-1]) || typeof panel[y-1][x] !== 'number' || panel[y-1][x] === 1)) {
            //best[0] = false;
        }
        // 判断能否向右移动
        // 1.已经判定为 false 的不再判断
        // 2.当下个右位移x+1超出面板时不能移动，即x+1 >= config.x
        // 3.对出现在面板的点做判断，即存在数组 panel[y] 时，下一个右位移x+1不为空时不能移动，即pannel[y][x+1] === 1
        if (best[1] && (x+1 >= config.x || (Array.isArray(panel[y]) &&  panel[y][x+1] === 1))) {
            best[1] = false;
        }
        // 判断能否向下移动
        // 1.已经判定为 false 的不再判断
        // 2.当下个位移 y+1>=0 时，y+1不存在面板内，即不存在数组panel[y+1]时，不能移动
        // 3.如果y+1存在面板内，下一个位移已经存在方块时不能移动，即panel[y+1][x]===1时
        if (best[2] && (y+1 >= 0 && (!Array.isArray(panel[y+1]) || panel[y+1][x] === 1))) {
            best[2] = false;
        }
        // 判断能否向左移动
        // 1.已经判定为 false 的不再判断
        // 2.下个左位移x-1超出面板左边界，即x-1 < 0，不能移动
        // 3.对面板内的点做判断，下个左位移x-1的点不为空时不能移动，即panel[y][x-1] === 1
        if (best[3] && (x-1 < 0 || (Array.isArray(panel[y]) && panel[y][x-1] === 1))) {
            best[3] = false;
        }
    }
    if (typeof best[derection] === 'boolean') {
        return best[derection];
    }
    return false;
}

/**
 * 顺时针转化矩阵/二维数组
 * 
 * @param {Array} arr 
 * @param {integer} time 转换次数，默认转一次
 */
function convert(arr, time) {
    if (typeof time !== 'number') {
        time = 1;
    } else {
        time = Math.abs(parseInt(time));
    }
    if(time == 0) {
        return arr;
    }
    var xl = arr[0].length; // 子数组数
    var yl = arr.length;    // 子数组的元素数
    var rtn = [];
    for(var i=0; i<xl; i++) {
        rtn[i] = [];
        for(var j=0; j<yl; j++) {
            rtn[i][j] = arr[yl-j-1][i];
        }
    }
    return convert(rtn, --time);
}

//tBlock.draw();
window.addEventListener("keydown", function(event){
    var keyCode = event.keyCode;
    // console.log(keyCode);
    switch (keyCode) {
        case 32:
            pause();
            break;
        case 37:
            move(3);
            break;
        case 38:
            change();
            break;
        case 39:
            move(1);
            break;
        case 40:
            move(2);
            break;
        case 13:
            restart();
            break;
        default:
            break;
    }
});