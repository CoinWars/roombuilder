var settings = require('./settings.js').settings;
var physics = require('./physics.js');
var Coin = require('./coin.js').Coin;
var Obstacle = require('./obstacle.js').Obstacle;

var coins = {};
var obstacles = {};
var draggedCoinOrObstacle = [];
var isDragging = false;
var draggingFromPanel = false;
var isKing = false;
var dropConflict = false;
var preDraggedX;
var preDraggedY;
var clickOffsetX;
var clickOffsetY;

var dummyCoin = new Coin(23.33, 3, true, false);
function spawnCoinAtopDummy() {
    var newCoin = new Coin(23.33, 3, true, false);
    newCoin.isPanel = true;
    coins[newCoin.id] = newCoin;
}
spawnCoinAtopDummy();

var kingCoin = new Coin(23.33, 5, true, true);
kingCoin.isPanel = true;
coins[kingCoin.id] = kingCoin;

//obstacles
//vars that can be toggled to some extent
//need function of 2 vars that sets these-can just be a lookup table/hardcoded presets
var dummyX = 22;
var dummyY = 8;
var dummyWidth = 3;
var dummyHeight = 2;
var dummyObstacle = new Obstacle(dummyX, dummyY, dummyWidth, dummyHeight);
function spawnObstacleAtopDummy() {
    var newObstacle = new Obstacle(dummyX, dummyY, dummyWidth, dummyHeight);
    newObstacle.isPanel = true;
    obstacles[newObstacle.id] = newObstacle;
}
spawnObstacleAtopDummy();

var trashRect = new Obstacle(22, 11, 3, 2);
var dispose = false;

/*
var o1 = new Obstacle(3,2,3,2);
var o6 = new Obstacle(14,11,3,2);
obstacles[o1.id] = o1;
obstacles[o6.id] = o6;
*/

var drawer = require('./drawer.js').createDrawer(settings, coins, obstacles, draggedCoinOrObstacle, dummyCoin, trashRect, dummyObstacle);

window.addEventListener('resize', function() {drawer.handleResize();} , false);

setInterval(drawer.draw, 16.66*2);

function transformClick(e) {
    var rect = document.getElementById('roomCanvas').getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
   
    x = x/drawer.gridSize;
    y = y/drawer.gridSize;
    return {x: x, y: y};
}

document.getElementById('roomCanvas').onmousedown = function(e) {
    var coords = transformClick(e);
    mouseDown(coords.x, coords.y);
}
document.onmouseup = function(e) {
    var coords = transformClick(e);
    mouseUp(coords.x, coords.y);
}
document.getElementById('roomCanvas').onmousemove = function(e) {
    var coords = transformClick(e);
    mouseMove(coords.x, coords.y);
}

function mouseDown(x, y) {
    var index = -1;
    var isCoin = false;
    draggingFromPanel = false;
    for(var i in coins) {
        if(physics.clickingCoin(x, y, coins[i])) {
            console.log('Clicking coin!');
            draggedCoinOrObstacle.push(coins[i]);
            index = i;
            isCoin = true;
            isDragging = true;
            isKing = coins[i].isKing;
        }
    }
    if(!isDragging) {
        for(var j in obstacles) {
            if(physics.clickingObstacle(x, y, obstacles[j])) {
                console.log('Clicking obstacle!');
                isDragging = true;
                draggedCoinOrObstacle.push(obstacles[j]);
                index = j;
                isCoin = false;
            }
        }
    }
    if(!isDragging) {
        return;
    }
    clickOffsetX = draggedCoinOrObstacle[0].x - x;
    clickOffsetY = draggedCoinOrObstacle[0].y - y;
    if(draggedCoinOrObstacle[0].isPanel) {
        draggingFromPanel = true;
    }
        
    //first store it's position
    preDraggedX = draggedCoinOrObstacle[0].x;
    preDraggedY = draggedCoinOrObstacle[0].y;
    
    //remove from appropriate model list (still stored on draggedC/O)
    var toRemoveFrom = (isCoin)? coins : obstacles;
    delete toRemoveFrom[index];
    
    if(!draggingFromPanel) {
        var mirrorIndex = draggedCoinOrObstacle[0].mirrorId;
        draggedCoinOrObstacle.push(toRemoveFrom[mirrorIndex]);
        delete toRemoveFrom[mirrorIndex];
    } else {
        //need to create a new mirrored coin
        if(isCoin) {
            var newDummyMirroredCoin = new Coin(23.33, 4, !draggedCoinOrObstacle[0].isP1, false);
            var newKingMirroredCoin = new Coin(23.33, 4, !draggedCoinOrObstacle[0].isP1, true);
            var newMirroredCoin = isKing? newKingMirroredCoin : newDummyMirroredCoin;
            newMirroredCoin.x = getMirroredXCoord(draggedCoinOrObstacle[0]);
            linkMirroredCoinsOrObstacles(draggedCoinOrObstacle[0], newMirroredCoin);
            draggedCoinOrObstacle.push(newMirroredCoin);
        } else {
            var dummyMirroredX = getMirroredXCoord(draggedCoinOrObstacle[0]);
            var newDummyMirroredObstacle = new Obstacle(dummyMirroredX, dummyY, dummyWidth, dummyHeight);
            linkMirroredCoinsOrObstacles(draggedCoinOrObstacle[0], newDummyMirroredObstacle);
            draggedCoinOrObstacle.push(newDummyMirroredObstacle);
        }
    }
}

function linkMirroredCoinsOrObstacles(t1, t2) {
    var id1 = t1.id;
    var id2 = t2.id;
    t1.mirrorId = id2;
    t2.mirrorId = id1;
}

function mouseUp(x, y) {
    if(!isDragging) {
        return;
    }
    isDragging = false; 
    clearConflicts();
    moveWithMouse(x, y, draggedCoinOrObstacle[0]);
    var coinOrObstacle = draggedCoinOrObstacle[0];
    var mirroredCoinOrObstacle = draggedCoinOrObstacle[1];
    
    if(coinOrObstacle.type == 'coin') {
        if(!dispose) {
            coins[coinOrObstacle.id] = coinOrObstacle;
            coins[mirroredCoinOrObstacle.id] = mirroredCoinOrObstacle;
            if(!dropConflict && draggingFromPanel) {
                coinOrObstacle.isPanel = false;
                if(!isKing) {
                    spawnCoinAtopDummy();
                }
            }   
        } else {
            if(draggingFromPanel && !isKing) {
                spawnCoinAtopDummy();
            }
        }
    } else {
        if(!dispose) {
            obstacles[coinOrObstacle.id] = coinOrObstacle;
            obstacles[mirroredCoinOrObstacle.id] = mirroredCoinOrObstacle;
            if(!dropConflict && draggingFromPanel) {
                coinOrObstacle.isPanel = false;
                spawnObstacleAtopDummy();
            }
        } else {
            if(draggingFromPanel) {
                spawnObstacleAtopDummy();
            }
        }
    }
    if(dropConflict) {
        coinOrObstacle.x = preDraggedX;
        coinOrObstacle.y = preDraggedY;
        mirroredCoinOrObstacle.x = getMirroredXCoord(coinOrObstacle);
        mirroredCoinOrObstacle.y = preDraggedY;
    }
    
    clearConflicts();
    draggedCoinOrObstacle.splice(0,2);
}

function mouseMove(x, y) {
    if(!isDragging) {
        return;
    }
    clearConflicts();
    moveWithMouse(x, y, draggedCoinOrObstacle[0]);
}

function getMirroredXCoord(coinOrObstacle) {
    if(coinOrObstacle.type == 'coin') {
        return 20 - coinOrObstacle.x;
    } else {
        return 20 - (coinOrObstacle.x + coinOrObstacle.w);
    }
}

function moveWithMouse(mouseX, mouseY, coinOrObstacle) {
    coinOrObstacle.x = mouseX + clickOffsetX;
    coinOrObstacle.y = mouseY + clickOffsetY;
    
    if(coinOrObstacle.type == 'coin') {
        snapCoinToGrid(coinOrObstacle);
    
        draggedCoinOrObstacle[1].x = getMirroredXCoord(coinOrObstacle);
        draggedCoinOrObstacle[1].y = coinOrObstacle.y;
        
        snapCoinToGrid(draggedCoinOrObstacle[1]);
        checkCoinConflicts(coinOrObstacle);
        checkCoinConflicts(draggedCoinOrObstacle[1]);
        checkMirroredCoinConflicts(coinOrObstacle, draggedCoinOrObstacle[1]);
    } else {
        snapObstacleToGrid(coinOrObstacle);
            
        draggedCoinOrObstacle[1].x = getMirroredXCoord(coinOrObstacle);
        draggedCoinOrObstacle[1].y = coinOrObstacle.y;
 
        snapObstacleToGrid(draggedCoinOrObstacle[1]);
        checkObstacleConflicts(coinOrObstacle);
        checkObstacleConflicts(draggedCoinOrObstacle[1]);
        checkMirroredObstacleConflicts(coinOrObstacle, draggedCoinOrObstacle[1]);
    }
}

function checkMirroredCoinConflicts(m1, m2) {
    if(physics.coinHitcoin(m1, m2)) {
        m1.isConflicting = true;
        m2.isConflicting = true;
        dropConflict = true;
    }
}

function checkMirroredObstacleConflicts(m1, m2) {
    if(physics.obstacleHitObstacle(m1, m2)) {
        m1.isConflicting = true;
        m2.isConflicting = true;
        dropConflict = true;
    }
}

function snapCoinToGrid(coin) {
    var rx = coin.x % 0.5;
    coin.x = coin.x - rx;
    
    var ry = coin.y % 0.5;
    coin.y = coin.y - ry;
}

function snapObstacleToGrid(obstacle) {
    var rx = obstacle.x % 1;
    obstacle.x = obstacle.x - rx;
    
    var ry = obstacle.y % 1;
    obstacle.y = obstacle.y - ry;
}

function clearConflicts() {
    for(var i in coins) {
        coins[i].isConflicting = false;
    }
    for(var i in obstacles) {
        obstacles[i].isConflicting = false;
    }
    draggedCoinOrObstacle[0].isConflicting = false;
    draggedCoinOrObstacle[1].isConflicting = false;
    dropConflict = false;
    trashRect.isConflicting = false;
    dispose = false;
}

function checkCoinConflicts(coin) {
    var id = coin.id;
    for(var i in coins) {
        if(i == id) {
            continue;
        }
        if(physics.coinHitcoin(coin, coins[i])) {
            coins[i].isConflicting = true;
            dropConflict = true;
        }
    }
    for(var j in obstacles) {
        if(physics.coinHitObstacle(coin, obstacles[j])) {
            obstacles[j].isConflicting = true;
            dropConflict = true;
        }
    }
    if(coin.x > 19.5 || coin.y > 14.5 || coin.x < 0.5 || coin.y < 0.5) {
        dropConflict = true;
    }
    
    if(physics.coinHitObstacle(coin, trashRect)) {
        trashRect.isConflicting = true;
        if(!isKing) {
            dispose = true;
        }
    }
}

function checkObstacleConflicts(obstacle) {
    var id = obstacle.id;
    for(var i in obstacles) {
        if(i == id) {
            continue;
        }
        if(physics.obstacleHitObstacle(obstacle, obstacles[i])) {
            obstacles[i].isConflicting = true;
            dropConflict = true;
        } 
    }
    for(var j in coins) {
        if(physics.coinHitObstacle(coins[j], obstacle)) {
            coins[j].isConflicting = true;
            dropConflict = true;
        }
    }
    if(obstacle.x + obstacle.w > 20 || obstacle.y + obstacle.h > 15 
        || obstacle.x < 0 || obstacle.y < 0) {
        dropConflict = true;
    }
    
    if(physics.obstacleHitObstacle(obstacle, trashRect)) {
        trashRect.isConflicting = true;
        dispose = true;
    }
}
