var canvas = document.getElementById('canvas');
if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
} else {
   alert("该浏览器不支持canvas，建议使用谷歌或火狐浏览器");
}

// 绘制一个小正方块
ctx.fillRect(25,25,100,100);
