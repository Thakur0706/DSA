const player1GridElement = document.getElementById("player1-grid");
const player2GridElement = document.getElementById("player2-grid");
const startButton = document.getElementById("start-button");
const turnIndicator = document.getElementById("turn-indicator");
const shotResult = document.getElementById("shot-result");
const instruction = document.getElementById("instruction");

const gridSize = 10;
let player1Grid = [];
let player2Grid = [];
let currentTurn = "Player1";

let shipLengths = [4, 3, 3, 2];
let isHorizontal = true;

document.addEventListener('keydown', event => {
    if (event.key === 'R' || event.key === 'r') {
        isHorizontal = !isHorizontal;
        instruction.textContent = `Ship placement mode: ${isHorizontal ? 'Horizontal' : 'Vertical'}`;
    }
});

function createGrid(gridElement, gridArray) {
    for (let row = 0; row < gridSize; row++) {
        gridArray[row] = [];
        for (let col = 0; col < gridSize; col++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;

            gridArray[row][col] = 0;
            gridElement.appendChild(cell);
        }
    }
}

function handleShipPlacement(event, gridArray, player) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (shipLengths.length === 0) {
        alert("All ships placed for this player.");
        return;
    }

    let shipLength = shipLengths[0];

    if (isHorizontal) {
        if (canPlaceShip(gridArray, row, col, shipLength, "horizontal")) {
            for (let i = 0; i < shipLength; i++) {
                gridArray[row][col + i] = 1;
                const cell = player === "Player1" ? player1GridElement : player2GridElement;
                cell.children[row * gridSize + (col + i)].classList.add("ship");
            }
            shipLengths.shift();
            instruction.textContent = `Player ${player === "Player1" ? "1" : "2"}, place your next ship.`;
        } else {
            alert("Invalid placement! Try again.");
        }
    } else {
        if (canPlaceShip(gridArray, row, col, shipLength, "vertical")) {
            for (let i = 0; i < shipLength; i++) {
                gridArray[row + i][col] = 1;
                const cell = player === "Player1" ? player1GridElement : player2GridElement;
                cell.children[(row + i) * gridSize + col].classList.add("ship");
            }
            shipLengths.shift();
            instruction.textContent = `Player ${player === "Player1" ? "1" : "2"}, place your next ship.`;
        } else {
            alert("Invalid placement! Try again.");
        }
    }

    if (shipLengths.length === 0) {
        alert(`All ships placed! ${player}'s turn is complete.`);
        if (player === "Player1") {
            currentTurn = "Player2";
            turnIndicator.textContent = `${currentTurn}'s Turn`;
            instruction.textContent = "Player 2, place your ships on the grid.";
            shipLengths = [4, 3, 3, 2];
            player1GridElement.removeEventListener("click", player1ShipPlacementHandler);
            player2GridElement.classList.remove("disabled");
            player2GridElement.addEventListener("click", player2ShipPlacementHandler);
        } else {
            startGame();
        }
    }
}

function canPlaceShip(gridArray, row, col, shipLength, direction) {
    if (direction === "horizontal") {
        if (col + shipLength > gridSize) return false;
        for (let i = 0; i < shipLength; i++) {
            if (gridArray[row][col + i] !== 0) return false;
        }
    } else if (direction === "vertical") {
        if (row + shipLength > gridSize) return false;
        for (let i = 0; i < shipLength; i++) {
            if (gridArray[row + i][col] !== 0) return false;
        }
    }
    return true;
}

function startGame() {
    hideShips(player1GridElement);
    hideShips(player2GridElement);

    player2GridElement.classList.remove("disabled");
    player1GridElement.classList.add("disabled");
    currentTurn = "Player1";
    updateTurnDisplay();

    player1GridElement.removeEventListener("click", player1ShipPlacementHandler);
    player2GridElement.removeEventListener("click", player2ShipPlacementHandler);
    player2GridElement.addEventListener("click", handleAttack);
    player1GridElement.addEventListener("click", handleAttack);
}

function hideShips(gridElement) {
    const cells = gridElement.getElementsByClassName("cell");
    for (let cell of cells) {
        cell.classList.remove("ship");
    }
}

function handleAttack(event) {
    const targetGrid = currentTurn === "Player1" ? player2Grid : player1Grid;
    const targetGridElement = currentTurn === "Player1" ? player2GridElement : player1GridElement;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (targetGrid[row][col] === 1) {
        event.target.classList.add("hit");
        targetGrid[row][col] = 2;
        shotResult.textContent = "Hit!";
        if (checkWinCondition(targetGrid)) {
            alert(`${currentTurn} wins!`);
            resetGame();
            return;
        }
    } else if (targetGrid[row][col] === 0) {
        event.target.classList.add("miss");
        targetGrid[row][col] = 3;
        shotResult.textContent = "Miss!";
        switchTurn();
    } else {
        shotResult.textContent = "You've already fired at this location!";
        return;
    }

    updateTurnDisplay();
}

function switchTurn() {
    currentTurn = currentTurn === "Player1" ? "Player2" : "Player1";
    player1GridElement.classList.toggle("disabled");
    player2GridElement.classList.toggle("disabled");
}

function updateTurnDisplay() {
    turnIndicator.textContent = `${currentTurn}'s Turn`;
    instruction.textContent = `It's ${currentTurn}'s turn to attack.`;
}

function checkWinCondition(grid) {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] === 1) {
                return false; // There's still an unhit ship
            }
        }
    }
    return true; // All ships have been hit
}

function resetGame() {
    player1GridElement.innerHTML = "";
    player2GridElement.innerHTML = "";
    player1Grid = [];
    player2Grid = [];
    shipLengths = [4, 3, 3, 2];
    currentTurn = "Player1";
    shotResult.textContent = "";
    instruction.textContent = "Click 'Start Game' to begin a new game.";
    turnIndicator.textContent = "";

    player1GridElement.removeEventListener("click", handleAttack);
    player2GridElement.removeEventListener("click", handleAttack);
}

function player1ShipPlacementHandler(event) {
    handleShipPlacement(event, player1Grid, "Player1");
}

function player2ShipPlacementHandler(event) {
    handleShipPlacement(event, player2Grid, "Player2");
}

startButton.addEventListener("click", () => {
    resetGame();
    createGrid(player1GridElement, player1Grid);
    createGrid(player2GridElement, player2Grid);

    instruction.textContent = "Player 1, place your ships.";
    turnIndicator.textContent = "Player 1's Turn";

    player1GridElement.classList.remove("disabled");
    player2GridElement.classList.add("disabled");

    player1GridElement.addEventListener("click", player1ShipPlacementHandler);
});