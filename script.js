function setup() {
    width = document.getElementById('game-container').offsetWidth;
    containerHeight = window.innerHeight - document.getElementById('game-container').offsetTop - 10;
    height = width * 3 / 4;
    if (width > containerHeight) {
        if (width > 2.5 * containerHeight) {
            height = Math.max(height, containerHeight);
        } else {
            height = Math.min(height, containerHeight);
        }
    }
    else {
        height = Math.max(height, containerHeight);
    }
    canvas = createCanvas(width, height);
    canvas.parent('game-container');

    // button = createButton('Submit move');
    // button.parent('game-container');
    // button.position(width - 150, document.getElementById('game-container').offsetHeight + document.getElementById('game-container').offsetTop - 150);
    // button.attribute('class', 'btn btn-success')
    // button.id('submit-move');
    // button.mousePressed(nextTurn);

    blue = '#0d6efd';
    red = '#f50000';
    green = '#39d353';
}

function windowResized() {
    width = document.getElementById('game-container').offsetWidth;
    containerHeight = window.innerHeight - document.getElementById('game-container').offsetTop - 10;
    height = width * 3 / 4;
    if (width > containerHeight) {
        if (width > 2.5 * containerHeight) {
            height = Math.max(height, containerHeight);
        } else {
            height = Math.min(height, containerHeight);
        }
    }
    else {
        height = Math.max(height, containerHeight);
    }
    button.position(width - 150, document.getElementById('game-container').offsetHeight + document.getElementById('game-container').offsetTop - 150);
    resizeCanvas(width, height);
}

var canvas;
var boardState = [];
var boardColor = [];
var boardSize = -1;
var boardWeight = -1;
var inGame = false;
var done = false;
var numStones;
var turn = 0;
var selectedWeight = -1;
var selectedTile = -1;
var maxDist = 15;
var game;
var message = '';
var extra = 50;
var tipping = false;
var maxTip = 10;
var currTip = 0;
var numberTextSize = 20;
var leftTorque = 0;
var rightTorque = 0;
var direction = 1;

function draw() {
    background('#f5f8fa');
    // gridOutput();
    fill(255);

    if (inGame) {
        strokeWeight(0);
        drawMessage();
        drawStage();
        drawPlayers();
        drawUnusedWeights();
        drawTorque();
        if (!tipping) {
            strokeWeight(0);
            drawTable();
            drawTurn();
            drawTiles();
            strokeWeight(1);
        } else {
            tipBoard();
        }
    }
}

/*
 * Properties is an object containing all necessary information for game.
 *
 * - numberOfWeights: number of weights in the game
 * - boardLength: length of the board
 * - boardWeight: the weight of the board
 * - player1: Gives the name for player 1.
 * - player2: Gives the name for player 2.
 * - time: Amount of time that each player has
 */
function startGame() {
    message = '';
    // if value is empty, set to "Player 1, Player 2"
    player1 = document.getElementById("player-1").value || "One";
    player2 = document.getElementById("player-2").value || "Two";
    numStones = document.getElementById("number-of-weights").value;
    boardSize = document.getElementById("size-of-board").value;
    boardWeight = document.getElementById('weight-of-board').value;

    // check boardWeight is valid:
    if (!boardWeight || boardWeight <= 0) {
        document.getElementById('error-message').innerText = "Invalid board weight! Must be greater than 0.";
        document.getElementById('error-container').style.display = 'block';
        inGame = false;
        return;
    }

    // check board size is valid:
    if (boardSize < 8 || boardSize > 100 || boardSize % 2 != 0) {
        document.getElementById('error-message').innerText = "Invalid board size! Must be an even number between 8 and 100.";
        document.getElementById('error-container').style.display = 'block';
        inGame = false;
        return;
    }
    if (boardSize < 2 * numStones + 2) {
        document.getElementById('error-message').innerText = "Board size is too small. Number of weights must be less than or equal to half length of the board.";
        document.getElementById('error-container').style.display = 'block';
        inGame = false;
        return;
    }

    // check if the number of weights is valid
    if (numStones < 1) {
        document.getElementById('error-message').innerText = "Not enough weights to play! Must be at least 1.";
        document.getElementById('error-container').style.display = 'block';
        inGame = false;
        return;
    }

    // hide error message
    document.getElementById('error-container').style.display = 'none';

    game = new Game({
        player1: player1,
        player2: player2,
        numberOfWeights: numStones,
        boardLength: boardSize,
        boardWeight: boardWeight,
        time: 120
    });

    done = false;
    leftTorque = game.board.leftTorque;
    rightTorque = game.board.rightTorque;
    currTip = 0;
    tipping = false;
    boardState = [];
    boardColor = [];
    selectedTile = -1;
    selectedWeight = -1;
    turn = 0;

    for (var i = 0; i <= boardSize; i++) {
        boardState.push(0);
        boardColor.push(0);
    }

    var defaultBlock = boardSize / 2;
    defaultBlock -= 4;
    boardColor[defaultBlock] = 3;
    boardState[defaultBlock] = 3;

    inGame = true;
}

function drawTable() {

    var start = 60;
    var length = width - 168;
    fill(0);
    stroke(0);
    var step = length / boardSize;
    // draw the board
    rect(start, 3 * height / 4, length, 4);

    // INDICES FOR TICK MARKS
    for (var i = 0; i <= boardSize; ++i) {
        strokeWeight(0);
        var size = 1;
        if (selectedTile == i) {
            stroke(0, 0, 0);
            if (turn == 0) {
                fill(red);
            } else {
                fill(blue);
            }
            size = 3;
        } else {
            stroke(0, 0, 0);
        }

        strokeWeight(1);
        if (selectedTile == i) {
            rect(start + i * step - .75, 3 * height / 4 - 10, size, 20);
            strokeWeight(0);
            textSize(numberTextSize);
            text(i - (boardSize / 2), start + i * step, 3 * height / 4 + 60);
        } else {
            rect(start + i * step, 3 * height / 4 - 10, size, 20);     // strokeWeight affects the green
        }
        textSize(numberTextSize);
        stroke(0);
        if (i % 5 == 0) {
            strokeWeight(1);
            if (selectedTile != i) {
                fill(0);
            }
            text(i - (boardSize / 2), start + i * step, 3 * height / 4 + 60);
            strokeWeight(0);
        }

        // if mouse above the tick mark, draw the tick mark and green box
        if (mouseX > start + i * step - step / 2 && mouseX < start + i * step + step / 2 && mouseY > 3 * height / 4 - 380 && mouseY < 3 * height / 4 + 65) {
            if (turn == 0) {
                fill(red);
            } else {
                fill(blue);
            }
            strokeWeight(1);
            rect(start + i * step, 3 * height / 4 - 10, 3, 20);
            strokeWeight(0);
            text(i - (boardSize / 2), start + i * step, 3 * height / 4 + 60);
        }

    }

    strokeWeight(0);
    fill(color('rgba(130, 121, 113, 0.5)'));
    // left support
    triangle(start + (boardSize / 2 - 3.0) * step + 1.25, 3 * height / 4, start + (boardSize / 2 - 3.125) * step + 1.25, 3 * height / 4 + 40, start + (boardSize / 2 - 2.875) * step + 1.25, 3 * height / 4 + 40);
    rect(start + (boardSize / 2 - 3.125) * step + 1.25, height, step / 4, - (height / 4) + 40);

    // right support
    triangle(start + (boardSize / 2 - 1) * step + 1.25, 3 * height / 4, start + (boardSize / 2 - 1.125) * step + 1.25, 3 * height / 4 + 40, start + (boardSize / 2 - .875) * step + 1.25, 3 * height / 4 + 40);
    rect(start + (boardSize / 2 - 1.125) * step + 1.25, height, step / 4, - (height / 4) + 40);
}

function tipBoard() {
    var start = 60;
    var length = width - 168;
    fill(0);
    stroke(0);
    var step = length / boardSize;
    if (direction < 0) {
        translate(currTip * 20, -currTip * 20);
    } else {
        translate(currTip * 20, 0);
    }
    rotate((PI / 200) * currTip);
    rect(start, 3 * height / 4, length - step, 4);
    currTip += direction;
    if (direction > 0) {
        if (currTip > maxTip) {
            currTip = maxTip;
        }
    } else {
        if (currTip < -maxTip) {
            currTip = -maxTip;
        }
    }
}

function drawTiles() {
    var start = 60;
    var length = width - 168;
    var step = length / boardSize;
    for (var i = 0; i <= boardSize; ++i) {
        if (boardState[i] == 0) continue;
        if (boardColor[i] == 1) {
            fill(red);
            stroke(red);
        } else if (boardColor[i] == 2) {
            fill(blue);
            stroke(blue);
        } else {
            fill(0, 0, 0);
            stroke(0, 0, 0);
        }
        textSize(numberTextSize);
        rect(start + i * step - 10, 3 * height / 4 - 20 - (boardState[i] * 10), 20, boardState[i] * 10, 3);
        text(boardState[i], start + i * step, 3 * height / 4 - 35 - (boardState[i] * 10));
    }
    fill(0, 0, 0);
    stroke(0, 0, 0);
}

function drawPlayers() {
    // Player 1 Text
    textSize(22);
    fill(red);
    stroke(red);
    text("Player 1:", 80, 60);
    text(player1, 200, 60);
    // Player 2 Text
    fill(blue);
    stroke(blue);
    text("Player 2:", (width / 2) + 80, 60);
    text(player2, (width / 2) + 200, 60);

    // draw a green dot indicating the current player
    fill(green);
    stroke(255);
    ellipse(20 + turn * (width / 2), 60, 12, 12);
    text('🟢', 20 + turn * (width / 2), 60);
}

function mouseClicked() {
    var start = 10;
    var length = width - 168;
    var step = length / 10 / 2;
    var right = 0;
    var down = 100;
    var half = maxDist / 2;

    // check if clicked on player 1's blocks
    for (var i = 1; i <= numStones; i++) {
        var x = half + start + right * step; // weight position
        // x += extra;
        var y = down - half;
        var dx = x - mouseX;
        if (dx < 0) dx = 0 - dx;

        var dy = y - mouseY;
        if (dy < 0) dy = 0 - dy;

        if (dx < maxDist && dy < maxDist && turn == 0) {
            selectedWeight = i;
            break;
        }

        right = right + 2;

        if (right >= 10) {
            right = 0;
            down = down + 30;
        }
    }

    start = (width / 2) + 10;
    down = 100;
    right = 0;

    // check if clicked on player 2's blocks
    for (var i = 1; i <= numStones; i++) {
        var x = half + start + right * step;
        // x += extra;
        var y = down - half;
        var dx = x - mouseX;
        if (dx < 0) dx = 0 - dx;

        var dy = y - mouseY;
        if (dy < 0) dy = 0 - dy;

        if (dx < maxDist && dy < maxDist && turn == 1) {
            selectedWeight = i;
            break;
        }
        right = right + 2;
        if (right >= 10) {
            right = 0;
            down = down + 30;
        }
    }

    start = 60;
    step = length / boardSize;

    // check if clicked on the board
    for (var i = 0; i <= boardSize; ++i) {
        var x = half + start + i * step;
        var y = half + 3 * height / 4 - 10;
        var dx = mouseX - x;
        // var dy = mouseY - y + 350; // so that click under the board won't register a selection
        if (dx < 0) dx = 0 - dx;
        if (dy < 0) dy = 0 - dy;

        if (dx < step / 2 - 2 && mouseY - y < 65 && mouseY > height / 4) {
            selectedTile = i;
        }
    }

    if (game.gameState === "Removing Weights") {
        if (selectedTile != -1) {
            nextTurn();
        }
    } else if (selectedTile != -1 && selectedWeight != -1) {
        nextTurn();
    }
}

function keyPressed() {
    if (keyCode === ENTER) {
        nextTurn();
    } else {
        if (keyIsDown(LEFT_ARROW)) {
            selectedTile -= 1;
            if (selectedTile <= 0) {
                selectedTile = 0;
            }
        }
    
        if (keyIsDown(RIGHT_ARROW)) {
            selectedTile += 1;
            if (selectedTile >= boardSize) {
                selectedTile = boardSize;
            }
        }
    
        if (keyIsDown(UP_ARROW)) {
            selectedWeight -= 1;
            if (selectedWeight <= 1) {
                selectedWeight = 1;
            }
        }
    
        if (keyIsDown(DOWN_ARROW)) {
            selectedWeight += 1;
            if (selectedWeight <= 1) {
                selectedWeight = 1;
            }
            if (selectedWeight >= numStones) {
                selectedWeight = numStones;
            }
        }
    }
}

// function keyTyped() {

//     // uncomment to prevent any default behavior
//     // return false;
// }

function drawUnusedWeights() {
    if (game.gameState === "Removing Weights") {
        // drawRemovedWeights();
        return;
    }


    textSize(numberTextSize);
    fill(red);

    var start = 10;
    var length = width - 168;
    var step = length / 10 / 2;
    var right = 0;
    var down = 100;

    var blockWidth = Math.max(step / 4, 15);
    var blockHeight = 20;

    // Player 1
    for (var i = 1; i <= numStones; ++i) {
        var found = false;
        for (var j = 0; j <= boardSize; ++j) {
            if (boardState[j] == i && boardColor[j] == 1) {
                found = true;
            }
        }
        if (!found) {
            if (selectedWeight == i && turn == 0) {
                fill(0, 255, 0);
                stroke(0, 0, 0);
                textSize(numberTextSize + 2);
                strokeWeight(1);

            } else {
                fill(red);
                stroke(red);
                strokeWeight(1);
            }
            text(i, (start + right * step) + extra, down);
            rect(start + right * step, down - 10, blockWidth, blockHeight, 3);
            textSize(numberTextSize);
            strokeWeight(0);
        }
        right = right + 2;
        if (right >= 10) {
            right = 0;
            down = down + 30;
        }
    }

    fill(blue);
    stroke(blue);
    start = (width / 2) + 10;
    down = 100;
    right = 0;

    // Player 2
    for (var i = 1; i <= numStones; ++i) {
        var found = false;
        for (var j = 0; j <= boardSize; ++j) {
            if (boardState[j] == i && boardColor[j] == 2) {
                found = true;
            }
        }
        if (!found) {
            if (selectedWeight == i && turn == 1) {
                fill(0, 255, 0);
                stroke(0, 0, 0);
                textSize(numberTextSize + 2);
                strokeWeight(1);
            } else {
                fill(blue);
                stroke(blue);
            }
            text(i, (start + right * step) + extra, down);
            rect(start + right * step, down - 10, blockWidth, blockHeight, 3);
            textSize(numberTextSize);
            strokeWeight(0);
        }
        right = right + 2;

        if (right >= 10) {
            right = 0;
            down = down + 30;
        }
    }
}

function drawRemovedWeights() {
    textSize(numberTextSize);

    var start = 10;
    var length = width - 168;
    var step = length / 10 / 2;
    var right = 0;
    var down = 100;

    var blockWidth = Math.max(step / 4, 15);
    var blockHeight = 20;

    // Player 1 removedWeights
    for (const block of game.players[0].removedWeights) {
        var weight = block[0];
        var color = block[1];
        // console.log(weight + " " + color);
        if (color == 1) {
            fill(red);
            stroke(red);
        } else if (color == 2) {
            fill(blue);
            stroke(blue);
        } else {
            fill(0);
            stroke(0);
        }
        text(weight, (start + right * step) + extra, down);
        rect(start + right * step, down - 10, blockWidth, blockHeight, 3);
        right = right + 2;
        if (right >= 10) {
            right = 0;
            down = down + 30;
        }
    }

    start = (width / 2) + 10;
    down = 100;
    right = 0;

    // Player 2 removedWeights
    for (const block of game.players[1].removedWeights) {
        var weight = block[0];
        var color = block[1];

        if (color == 1) {
            fill(red);
            stroke(red);
        } else if (color == 2) {
            fill(blue);
            stroke(blue);
        } else {
            fill(0);
            stroke(0);
        }
        text(weight, (start + right * step) + extra, down);
        rect(start + right * step, down - 10, blockWidth, blockHeight, 3);
        right = right + 2;
        if (right >= 10) {
            right = 0;
            down = down + 30;
        }
    }

}

function nextTurn() {
    //logic for next turn
    /* important variables
        turn = current player turn. 0 = player1. 1 = player2
        selectedTile = the current location that the current player will choose to place or remove a weight
        selectedWeight = the current weight that the current player has chosen
        boardColor = array that tells you if a player has placed a weight on a tile. boardColor[i] can be 0,1,2. 0 = tile is empty. 1 = player 1 has placed a weight. 2 = player 2 has placed a weight.
        numStones = number of weights. number of stones.
        boardSate = array  that tells you the current weight placed on the board. boardStae[i] can be 1  to numStones. boardState[0] means there is no weight here, every other value means that there is a stone of weight boardState[i] at index 'i'.
    */

    if (done) return;

    if (game.gameState === 'Placing Weights') {
        if (selectedWeight == -1) {
            message = "⚠️ Please select a weight!";
            return;
        }

        if (selectedTile == -1) {
            message = "⚠️ Please select a position!";
            return;
        }
        message = game.placeWeight(Number(selectedWeight), Number(selectedTile) - Number(game.board.boardLength) / 2);
        boardState[selectedTile] = selectedWeight;
        boardColor[selectedTile] = turn + 1;

        // drawUnusedWeights();
    } else {
        if (selectedTile == -1) {
            message = "⚠️ Please select a position!";
            return;
        }
        var position = Number(selectedTile) - Number(game.board.boardLength) / 2;
        message = game.removeWeight(position);
        game.players[turn].removedWeights.push([boardState[selectedTile], boardColor[selectedTile]]);

        boardState[selectedTile] = 0;

        // drawRemovedWeights();
    }

    leftTorque = game.board.leftTorque;
    rightTorque = game.board.rightTorque;

    if (message.indexOf("Tipping") != -1) { // TIP BOARD
        console.log('Board has tipped');
        tipping = true;
        game.gameOver = true;
    }

    turn ^= 1;
    selectedTile = -1;
    selectedWeight = -1;
    // drawUnusedWeights();
    // game status

    // IN PROD
    if (game.gameOver) {
        gameOver();
        game.gameOver = false;
        done = true;
    }

}

function drawMessage() {
    fill(0, 0, 0);
    stroke(0, 0, 0);
    strokeWeight(1);
    textSize(24);
    textAlign(CENTER, CENTER);

    text(message, width / 2, height / 3);
}

function drawStage() {

    strokeWeight(1);
    textSize(26);
    textAlign(CENTER, CENTER);
    fill(0, 0, 0);
    stroke(0, 0, 0);

    var stage = "Phase: " + game.gameState;


    text(stage, width / 2, 20);

}

function drawTurn() {
    if (done) return;
    strokeWeight(1);
    textSize(26);
    textAlign(CENTER, CENTER);

    if (turn == 0) {
        fill(red);
        stroke(red);
        text("Player 1's Turn", width / 2, height / 4);
        noFill();
        rect(width / 2 - 100, height / 4 - 20, 200, 40, 3);
    } else {
        fill(blue);
        stroke(blue);
        text("Player 2's Turn", width / 2, height / 4);
        noFill();
        rect(width / 2 - 100, height / 4 - 20, 200, 40, 3);
    }

    fill(0, 0, 0);
    stroke(0, 0, 0);
}

function drawTorque() {
    fill(255, 153, 0);
    stroke(255, 153, 0);
    strokeWeight(1);
    textSize(24);

    textAlign(CENTER, CENTER);

    text(leftTorque, (boardSize / 2 - 3) * ((width - 168) / boardSize) + 20, 15 * height / 16);
    text(rightTorque, 120 + (boardSize / 2 - 1) * ((width - 168) / boardSize) - 20, 15 * height / 16);
}

// 'https://cims.nyu.edu/drecco2016/games/NoTipping/saveScore.php'

function gameOver() {
    $.get('https://cims.nyu.edu/~as9913/drecco/games/NoTipping/saveScore.php', {
        score: game.players[turn].name,
        gamename: 'NoTipping',
        playername: game.players[0].name + ' vs ' + game.players[1].name
    }).done(function (data) {
        console.log("Saved success");
        console.log(data);
    }).fail(function (data) {
        console.log("Saved failure");
        console.log(data);
    });
}

/*
 * Object for the board state. Maintains following information:
 *
 * - numberOfWeights: total number of weights
 * - boardLength: the length of the board
 * - boardWeight: the size of the board
 * - leftTorque, rightTorque: the left and right torque's values.
 * - boardState[i]: An array which stores the weight if there is one at index i.
 */
class Board {

    constructor(numberOfWeights, boardLength, boardWeight) {
        if (boardLength <= 3) {
            throw "Board size is too small"
        }

        if (numberOfWeights <= 0) {
            throw "Not enough weights to play"
        }

        this.leftTorque = 0;
        this.rightTorque = 0;

        this.numberOfWeights = numberOfWeights;
        this.boardLength = boardLength;
        this.boardWeight = boardWeight;
        this.boardState = new Array(boardLength * 2 + 1);

        for (let i = -this.boardLength; i <= this.boardLength; ++i) {
            this.boardState[i] = 0;
        }

        this.boardState[-4] = 3;
    }
}

/*
 * Object for the respective player. Contains the following information:
 *
 * - name: Name of the player
 * - timeLeft: Amount of time player has left (unnecessary(?))
 * - numberOfWeights: The total number of weights
 * - containsWeights: An array containing the weights they have available to use
 */
class Player {

    constructor(name, numberOfWeights, timeLeft) {
        this.name = name;
        this.numberOfWeights = numberOfWeights;
        this.timeLeft = timeLeft;

        this.containsWeight = new Array(numberOfWeights + 1);

        // empty array for removed weights
        this.removedWeights = [];

        for (var i = 1; i <= numberOfWeights; ++i) {
            this.containsWeight[i] = true;
        }
    }
}

class Game {

    /*
     * Properties is an object containing all necessary information for game.
     *
     * - numberOfWeights: number of weights in the game
     * - boardLength: length of the board
     * - boardWeight: the weight of the board
     * - player1: Gives the name for player 1.
     * - player2: Gives the name for player 2.
     * - time: Amount of time that each player has
     */
    constructor(properties) {
        this.numberOfWeights = properties.numberOfWeights;
        this.boardLength = properties.boardLength;
        this.boardWeight = properties.boardWeight;
        this.totalTime = properties.time;
        this.gameOver = false;
        this.gameState = 'Placing Weights';
        this.currentTurn = 0;
        this.stonesPlaced = 0;
        this.stonesRemoved = 0;

        this.players = new Array(2);
        this.players[0] = new Player(properties.player1, this.numberOfWeights, this.totalTime);
        this.players[1] = new Player(properties.player2, this.numberOfWeights, this.totalTime);

        this.board = new Board(this.numberOfWeights, this.boardLength, this.boardWeight);

        // Keeps track of who made the move at i-th spot in board
        this.moveState = new Array(this.boardLength * 2 + 1);
        for (let i = -this.boardLength; i <= this.boardLength; ++i) {
            this.moveState[i] = -1;
        }

        this.isGameOver();
    }

    /*
     *  Determines whether the game is over based on left and right torque.
     *
     */
    isGameOver() {
        // initialize with board weight
        this.board.leftTorque = 3 * this.boardWeight;
        this.board.rightTorque = 1 * this.boardWeight;

        for (var i = -this.boardLength; i <= this.boardLength; ++i) {
            this.board.leftTorque += (i + 3) * this.board.boardState[i];
            this.board.rightTorque += (i + 1) * this.board.boardState[i];
        }

        this.board.leftTorque = - this.board.leftTorque;
        this.board.rightTorque = - this.board.rightTorque;

        var gameOver = (this.board.leftTorque > 0) || (this.board.rightTorque < 0);
        if (this.board.leftTorque > 0) {
            direction = -1;
        } else if (this.board.rightTorque < 0) {
            direction = 1;
        }
        return gameOver;
    }

    /*
     * Method to place a weight at a given position. Validates to see first if move
     * is valid and then places weight to see if it results in tipping.
     *
     * @see isValidPlacement
     *
     * returns a message, indicating successful removal or whether tipping has occurred.
     */
    placeWeight(weight, position) {
        message = this.isValidPlacement(weight, position);
        if (message === '') {
            this.board.boardState[position] = weight;
            this.moveState[position] = this.currentTurn;
            this.players[this.currentTurn].containsWeight[weight] = false;

            if (this.isGameOver()) {
                return 'Tipping has occurred by ' + this.players[this.currentTurn].name + '\n\n\n🏆 Winner is ' + this.players[1 - this.currentTurn].name
            } else {
                message = this.players[this.currentTurn].name + ' placed weight ' + weight + ' at position ' + position + '.';
                this.stonesPlaced++;
                if (this.stonesPlaced == 2 * this.numberOfWeights) {
                    this.gameState = 'Removing Weights';
                    message += '\n🔄 Phase change: Now removing weights.'
                }

                this.currentTurn ^= 1;
                return message;
            }
        } else {
            this.gameOver = true;
            return message;
        }
    }

    /*
     * Check before weight placement to see if it is a valid move:
     * - position must be within board length
     * - position at board must be empty for weight to be placed
     * - player must contain the weight that they are placing
     */
    isValidPlacement(weight, position) {
        // instead of throwing error, set game to over...
        if (position < -this.boardLength || position > this.boardLength || this.board.boardState[position] != 0) {
            return '❌ Invalid position from ' + this.players[this.currentTurn].name + '\n\n\n🏆 Winner is ' + this.players[1 - this.currentTurn].name;
        }

        if (!this.players[this.currentTurn].containsWeight[weight]) {
            return '❌ Invalid weight from ' + this.players[this.currentTurn].name + '\n\n\n🏆 Winner is ' + this.players[1 - this.currentTurn].name;
        }

        return '';
    }

    /*
     * Method to remove a weight from a given position. Checks for move validity
     * and then if resulting move results in tipping.
     *
     */
    removeWeight(position) {
        message = this.isValidRemoval(position);
        if (message === '') {
            var weight = this.board.boardState[position];
            this.board.boardState[position] = 0;
            this.stonesRemoved += 1;

            if (this.isGameOver()) {
                return 'Tipping has occurred by ' + this.players[this.currentTurn].name + '\n\n\n🏆 Winner is ' + this.players[1 - this.currentTurn].name;
            } else {
                // send message to client or display.
                message = this.players[this.currentTurn].name + ' removed weight ' + weight + ' at position ' + position + '.';
                this.currentTurn ^= 1;

                if (this.stonesRemoved == 2 * this.numberOfWeights + 1) {
                    message = "Game has ended in a tie";
                    this.gameOver = true;
                }

                return message;
            }
        } else {
            gameOver = true;
            return message;
        }
    }

    /*
     * Check before weight removal to see if it is a valid move:
     * - position selected is within board length
     * - there exists a stone in this position
     */
    isValidRemoval(position) {
        if (position < -this.boardLength || position > this.boardLength || this.board.boardState[position] == 0) {
            return '❌ Invalid position from ' + this.players[this.currentTurn].name + '\n\n\n🏆 Winner is ' + this.players[1 - this.currentTurn].name;
        }

        return '';
    }

    /*
     * Update the player's time based on the amount of time that they took.
     * (May be unnecessary for 2-player games)
     */
    updateTime(turn, time) {
        this.players[this.currentTurn].timeLeft -= time;

        if (this.players[this.currentTurn].timeLeft <= 0) {
            this.gameOver = true;
            return this.players[this.currentTurn].name + ' ran out of time';
        } else {
            return this.players[this.currentTurn].name + ' has ' + this.players[this.currentTurn].timeLeft + ' time left.';
        }
    }
}
