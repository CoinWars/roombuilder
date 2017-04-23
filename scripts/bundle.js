(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var coinCounter = 0;

function Coin(x,y,isP1,isKing) {
    coinCounter++;
    this.id = coinCounter;
    this.x = x;
    this.y = y;
    this.isP1 = isP1;
    this.isKing = isKing;
    
    this.isPanel = false;
    this.isConflicting = false;
    this.type = "coin";
    this.mirrorId = undefined;
}

exports.Coin = Coin;
},{}],2:[function(require,module,exports){
function createDrawer(settings, coins, obstacles, draggedCoinOrObstacle, dummyCoin, trashRect, dummyObstacle) {
    
    var canvas = document.getElementById('roomCanvas');
    var context = canvas.getContext('2d');
    
    function draw() {
        clear();
        drawPanel();
        drawCoin(dummyCoin);
        drawObstacle(dummyObstacle);
        drawTrashRect(trashRect);
        drawGrid();
        if(draggedCoinOrObstacle.length > 0) {
            var drawFunction = (draggedCoinOrObstacle[0].type == 'coin')? drawCoin : drawObstacle;
            drawFunction(draggedCoinOrObstacle[0]);
            drawFunction(draggedCoinOrObstacle[1]);
        }
        for(var i in coins) {
            drawCoin(coins[i]);
        }
        for(var j in obstacles) {
            drawObstacle(obstacles[j]);
        }
    }
    
    function drawTrashRect(trashRect) {
        var x = trashRect.x*drawer.gridSize;
        var y = trashRect.y*drawer.gridSize;
        context.beginPath();
        context.moveTo(x, y);
        var color = settings.trashRectColor;
        color = trashRect.isConflicting? settings.dropConflictColor : color;
        context.fillStyle = color;
        context.rect(x, y, trashRect.w*drawer.gridSize, trashRect.h*drawer.gridSize);
        context.fill();
    }
    
    function drawCoin(coin) {
        var x = (coin.x)*drawer.gridSize;
        var y = (coin.y)*drawer.gridSize;

        var color = coin.isP1? settings.p1CoinColor : settings.p2CoinColor;
        color = coin.isConflicting? settings.dropConflictColor : color;
        var radius = settings.smallCoinRadius*drawer.gridSize;
        
        drawCircle(x, y, radius, color);
        if(coin.isKing) {
            drawCircle(x, y, radius/2, 'red');
        }
        //draw health
        context.moveTo(x, y);
        context.beginPath();
        context.strokeStyle = settings.coinHealthColor;
        context.lineWidth = settings.coinHealthWidth*drawer.gridSize;
        context.arc(x, y, radius + drawer.gridSize/20, 0,  2 * Math.PI, false);
        context.stroke();
    }
    
   
    function drawCircle(x, y, radius, color) {
        context.moveTo(x, y);
        context.beginPath();
        context.fillStyle = color;
        context.arc(x, y, radius, 0,  2 * Math.PI, false);
        context.fill();
    }
    
    function drawGrid() {
        context.beginPath();
        context.strokeStyle = settings.gridColor;
        context.lineWidth = settings.gridLineWidth;
        
        //vertical lines
        for (var i=0; i <= 20; i++) {
            var x = i*drawer.gridSize;
            context.moveTo(x, 0);
            context.lineTo(x, 15*drawer.gridSize);
        }
        
        //horizontal lines
        for (i=0; i <= 15; i++) {
            var y = i*drawer.gridSize;
            context.moveTo(0, y);
            context.lineTo(20*drawer.gridSize, y);
        }
        
        context.stroke();
    }
    
    function drawObstacle(obstacle) {
        var x = obstacle.x*drawer.gridSize;
        var y = obstacle.y*drawer.gridSize;
        context.beginPath();
        context.moveTo(x, y);
        var color = settings.obstacleColor;
        color = obstacle.isConflicting? settings.dropConflictColor : color;
        context.fillStyle = color;
        context.rect(x, y, obstacle.w*drawer.gridSize, obstacle.h*drawer.gridSize);
        context.fill();
    }
    
    function drawPanel() {
        context.beginPath();
        context.moveTo(canvas.width*0.75, 0);
        context.fillStyle = 'lightgreen';
        context.rect(canvas.width*0.75, 0, canvas.width*0.25, canvas.height);
        context.fill();
    }
    
    function handleResize() {
        var container = document.getElementById('container');
    
        var widthToHeight = 16/9;
        
        var newWidth = window.innerWidth;
        var newHeight = window.innerHeight;
        
        var newWidthToHeight = newWidth / newHeight;
        
        if (newWidthToHeight > widthToHeight) {
          // window width is too wide relative to desired game width
          newWidth = newHeight * widthToHeight;
          container.style.height = newHeight + 'px';
          container.style.width = newWidth + 'px';
        } else { // window height is too high relative to desired game height
          newHeight = newWidth / widthToHeight;
          container.style.width = newWidth + 'px';
          container.style.height = newHeight + 'px';
        }
        
        container.style.marginTop = (-newHeight / 2) + 'px';
        container.style.marginLeft = (-newWidth / 2) + 'px';
        
        var gameCanvas = document.getElementById('roomCanvas');
        gameCanvas.width = newWidth;
        gameCanvas.height = newHeight;
        
        var gridSize = newHeight/15;
        drawer.gridSize = gridSize;
        drawer.draw();
    }
    
    function clear() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    var drawer = {
        gridSize: undefined,
        draw: draw,
        drawGrid: drawGrid,
        handleResize: handleResize,
        clear: clear
    };
    
    handleResize();
    
    return drawer;
}

exports.createDrawer = createDrawer;
},{}],3:[function(require,module,exports){
var obstacleCounter = 0;

function Obstacle(x, y, w, h) {
    obstacleCounter++;
    this.id = obstacleCounter;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    
    this.isPanel = false;
    this.isConflicting = false;
    this.type = "obstacle";
    this.mirrorId = undefined;
}

exports.Obstacle = Obstacle;

},{}],4:[function(require,module,exports){
var settings = require('./settings').settings;

function clickingCoin(clickX, clickY, coin) {
    var dx = coin.x - clickX;
    var dy = coin.y - clickY
    var squareDist = dx*dx + dy*dy;
    var radius = settings.smallCoinRadius;
    return squareDist < (radius*radius);
}

function clickingObstacle(clickX, clickY, obstacle) {
    var inColumn = clickX > obstacle.x && clickX < (obstacle.x + obstacle.w);
    var inRow = clickY > obstacle.y && clickY < (obstacle.y + obstacle.h);
    return inColumn && inRow;
}

function coinHitcoin(c1, c2) {
    var r = settings.smallCoinRadius;
    var dx = c2.x - c1.x;
    var dy = c2.y - c1.y;
    return dx*dx + dy*dy < 4*r*r;
}

function coinHitObstacle(c, o) {
    var br = settings.smallCoinRadius;
    var circleDistanceX = Math.abs(c.x - (o.x + o.w/2));
    var circleDistanceY = Math.abs(c.y - (o.y + o.h/2));
    if (circleDistanceX >= (o.w/2 + br)) { return false; }
    if (circleDistanceY >= (o.h/2 + br)) { return false; }
    if (circleDistanceX < (o.w/2)) { return true; } 
    if (circleDistanceY < (o.h/2)) { return true; }
    var cornerDistance_sq = ((circleDistanceX - o.w/2)*(circleDistanceX - o.w/2)) +
                         ((circleDistanceY - o.h/2)*(circleDistanceY - o.h/2));
    return (cornerDistance_sq < (br * br));
}

function obstacleHitObstacle(o1, o2) {
    return !((o1.x + o1.w <= o2.x) || (o2.x + o2.w <= o1.x) 
            || (o1.y + o1.h <= o2.y) || (o2.y + o2.h <= o1.y));
}

exports.clickingCoin = clickingCoin;
exports.clickingObstacle = clickingObstacle;
exports.coinHitcoin = coinHitcoin;
exports.coinHitObstacle = coinHitObstacle;
exports.obstacleHitObstacle = obstacleHitObstacle;
},{"./settings":6}],5:[function(require,module,exports){
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

},{"./coin.js":1,"./drawer.js":2,"./obstacle.js":3,"./physics.js":4,"./settings.js":6}],6:[function(require,module,exports){
var settings = {
   gridColor: 'black',
   gridLineWidth: 1,
   
   p1CoinColor: 'rgb(245,147,157)',
   p2CoinColor: 'rgb(147, 245, 235)',
   
   p1CoinSelectedColor: 'rgb(242,203,207)',
   p2CoinSelectedColor: 'rgb(203,242,238)',
   
   smallCoinRadius: 0.488,
   largeCoinRadius: 0.756,
   
   coinHealthColor: 'rgb(7,105,19)',
   coinHealthWidth: 0.1,
   
   trashRectColor: 'lightblue',
   
   obstacleColor: 'black',
   
   dropConflictColor: 'orange'
};

exports.settings = settings;
},{}]},{},[5]);
