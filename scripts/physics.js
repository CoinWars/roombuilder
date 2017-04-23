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