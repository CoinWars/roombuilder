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
