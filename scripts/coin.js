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