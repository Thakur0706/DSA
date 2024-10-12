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

let shipLengths = [5, 4, 3, 3, 2];  // Added new ship of 5 spaces
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

function canPlaceShip(grid, row, col, length, orientation) {
    if (orientation === "horizontal") {
        if (col + length > gridSize) return false;
        for (let i = 0; i < length; i++) {
            if (grid[row][col + i] !== 0) return false;
        }
    } else {
        if (row + length > gridSize) return false;
        for (let i = 0; i < length; i++) {
            if (grid[row + i][col] !== 0) return false;
        }
    }
    return true;
}

function handleShipPlacement(event, gridArray, player) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (shipLengths.length === 0) {
        alert("All ships placed for this player.");
        return;
    }

    let shipLength = shipLengths[0];

    if (canPlaceShip(gridArray, row, col, shipLength, isHorizontal ? "horizontal" : "vertical")) {
        placeShip(gridArray, row, col, shipLength, player);
        shipLengths.shift();
        instruction.textContent = `Player ${player === "Player1" ? "1" : "2"}, place your next ship. Press 'R' to rotate.`;
    } else {
        alert("Invalid placement! Try again.");
    }

    if (shipLengths.length === 0) {
        alert(`All ships placed! ${player}'s turn is complete.`);
        if (player === "Player1") {
            currentTurn = "Player2";
            turnIndicator.textContent = `${currentTurn}'s Turn`;
            instruction.textContent = "Player 2, place your ships on the grid. Press 'R' to rotate.";
            shipLengths = [5, 4, 3, 3, 2];  // Reset ship lengths for Player 2
            player1GridElement.removeEventListener("click", player1ShipPlacementHandler);
            player2GridElement.classList.remove("disabled");
            player2GridElement.addEventListener("click", player2ShipPlacementHandler);
        } else {
            startGame();
        }
    }
}

function placeShip(gridArray, row, col, length, player) {
    const gridElement = player === "Player1" ? player1GridElement : player2GridElement;
    
    if (isHorizontal) {
        for (let i = 0; i < length; i++) {
            gridArray[row][col + i] = 1;
            gridElement.children[row * gridSize + (col + i)].classList.add("ship");
        }
    } else {
        for (let i = 0; i < length; i++) {
            gridArray[row + i][col] = 1;
            gridElement.children[(row + i) * gridSize + col].classList.add("ship");
        }
    }
}

function player1ShipPlacementHandler(event) {
    handleShipPlacement(event, player1Grid, "Player1");
}

function player2ShipPlacementHandler(event) {
    handleShipPlacement(event, player2Grid, "Player2");
}

function startGame() {
    // Implement game start logic here
    instruction.textContent = "Game started! Click on the opponent's grid to fire.";
    // Add event listeners for shooting
}

// Initialize the game
createGrid(player1GridElement, player1Grid);
createGrid(player2GridElement, player2Grid);

player1GridElement.addEventListener("click", player1ShipPlacementHandler);
player2GridElement.classList.add("disabled");

instruction.textContent = "Player 1, place your ships on the grid. Press 'R' to rotate.";