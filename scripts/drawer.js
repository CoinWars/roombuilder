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