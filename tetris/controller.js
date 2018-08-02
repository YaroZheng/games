//tBlock.draw();
window.addEventListener("keydown", function(e){
    var keys = {
        37: 'left',
        39: 'right',
        40: 'down',
        38: 'rotate',
        32: 'pause'
    };
    if ( typeof keys[ e.keyCode ] != 'undefined' ) {
        keyPress( keys[ e.keyCode ] );
    }
});