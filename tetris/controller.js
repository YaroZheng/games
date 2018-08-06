//tBlock.draw();
window.addEventListener("keydown", function(e){
    var keys = {
        13: 'restart',
        37: 'left',
        39: 'right',
        40: 'down',
        38: 'rotate',
        32: 'pause',
        45: 'drop',
    };
    console.log(e.keyCode)
    if ( typeof keys[ e.keyCode ] != 'undefined' ) {
        keyPress( keys[ e.keyCode ] );
    }
});