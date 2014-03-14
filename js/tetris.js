var COLS = 10, ROWS = 20;
var board = [];
var lose;
var interval;
var pellets = [];
var current, currentX, currentY;
var mode = 'play';
var shapes = [
    [ 1, 1, 1, 1 ],
    [ 1, 1, 1, 0,
      1 ],
    [ 1, 1, 1, 0,
      0, 0, 1 ],
    [ 1, 1, 0, 0,
      1, 1 ],
    [ 1, 1, 0, 0,
      0, 1, 1 ],
    [ 0, 1, 1, 0,
      1, 1 ],
    [ 0, 1, 0, 0,
      1, 1, 1 ]
];
var colors = [
    'cyan', 'orange', 'blue', 'yellow', 'red', 'green', 'purple'
];

function newShape() {
    var id = Math.floor( Math.random() * shapes.length );
    var shape = shapes[ id ];

    current = [];
    for ( var y = 0; y < 4; ++y ) {
        current[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            var i = 4 * y + x;
            if ( typeof shape[ i ] != 'undefined' && shape[ i ] ) {
                current[ y ][ x ] = id + 1;
            }
            else {
                current[ y ][ x ] = 0;
            }
        }
    }
    currentX = 5;
    currentY = 0;
}

function init() {
    for ( var y = 0; y < ROWS; ++y ) {
        board[ y ] = [];
        for ( var x = 0; x < COLS; ++x ) {
            board[ y ][ x ] = 0;
        }
    }
}

function tick() {
    if ( mode == 'play' ) {
        if ( valid( 0, 1 ) ) {
            ++currentY;
        }
        else {
            startFreeze();
            mode = 'freeze';
            if (lose) {
                newGame();
                return false;
            }
        }
    } else if ( mode == 'freeze' ) {
        for ( var i in pellets ) {
            var pellet = pellets[i];
            var nextY = pellet.y + 1;

            if ( (nextY < ROWS) && (board[ nextY ][ pellet.x ] === 0) ) {
                pellet.y = nextY;
            } else {
                board[ pellet.y ][ pellet.x ] = pellet.value;
                pellet.remove = true;
            }
        }

        pellets = pellets.filter(function(p) { return !p.remove; });

        if ( pellets.length == 0 ) {
            clearLines();
            newShape();
            mode = 'play';
        }
    }
}

function startFreeze() {
    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( current[ y ][ x ] ) {
                pellets.unshift({
                    x: x + currentX,
                    y: y + currentY,
                    value: current[ y ][ x ],
                    remove: false
                });
                current[y][x] = 0;
            }
        }
    }
}

function resumePlay() {
    mode = 'play';
}

function rotate( current ) {
    var newCurrent = [];
    for ( var y = 0; y < 4; ++y ) {
        newCurrent[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            newCurrent[ y ][ x ] = current[ 3 - x ][ y ];
        }
    }

    return newCurrent;
}

function clearLines() {
    for ( var y = ROWS - 1; y >= 0; --y ) {
        var row = true;
        for ( var x = 0; x < COLS; ++x ) {
            if ( board[ y ][ x ] == 0 ) {
                row = false;
                break;
            }
        }
        if ( row ) {
            for ( var yy = y; yy > 0; --yy ) {
                for ( var x = 0; x < COLS; ++x ) {
                    board[ yy ][ x ] = board[ yy - 1 ][ x ];
                }
            }
            ++y;
        }
    }
}

function keyPress( key ) {
    switch ( key ) {
        case 'left':
            if ( valid( -1 ) ) {
                --currentX;
            }
            break;
        case 'right':
            if ( valid( 1 ) ) {
                ++currentX;
            }
            break;
        case 'down':
            if ( valid( 0, 1 ) ) {
                ++currentY;
            }
            break;
        case 'rotate':
            var rotated = rotate( current );
            if ( valid( 0, 0, rotated ) ) {
                current = rotated;
            }
            break;
    }
}

function valid( offsetX, offsetY, newCurrent ) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    offsetX = currentX + offsetX;
    offsetY = currentY + offsetY;
    newCurrent = newCurrent || current;



    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( newCurrent[ y ][ x ] ) {
                if ( typeof board[ y + offsetY ] == 'undefined'
                  || typeof board[ y + offsetY ][ x + offsetX ] == 'undefined'
                  || board[ y + offsetY ][ x + offsetX ]
                  || x + offsetX < 0
                  || y + offsetY >= ROWS
                  || x + offsetX >= COLS ) {
                    if (offsetY == 1) lose = true;
                    return false;
                }
            }
        }
    }
    return true;
}

function newGame() {
    clearInterval(interval);
    init();
    newShape();
    lose = false;
    interval = setInterval( tick, 250 );
}

newGame();