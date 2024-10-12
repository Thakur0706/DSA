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

let shipLengths = [4, 3, 3, 2]; // Ship sizes: One ship of size 4, two ships of size 3, and one of size 2
let isHorizontal = true; // Initial placement direction

// Toggle between horizontal and vertical placement mode
document.addEventListener('keydown', event => {
    if (event.key === 'R' || event.key === 'r') {
        isHorizontal = !isHorizontal;
        instruction.textContent = `Ship placement mode: ${isHorizontal ? 'Horizontal' : 'Vertical'}`;
    }
});

// Initialize grids for both players
function createGrid(gridElement, gridArray) {
    for (let row = 0; row < gridSize; row++) {
        gridArray[row] = [];
        for (let col = 0; col < gridSize; col++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;

            gridArray[row][col] = 0;  // 0 = empty
            gridElement.appendChild(cell);
        }
    }
}

// Handle ship placement logic
function handleShipPlacement(event, gridArray, player) {
    const row = parseInt(event.target.dataset.row); // Convert to number
    const col = parseInt(event.target.dataset.col); // Convert to number

    if (shipLengths.length === 0) {
        alert("All ships placed for this player.");
        return;
    }

    let shipLength = shipLengths[0]; // Get the next ship's length to place

    // Check if the ship can be placed based on the current mode (horizontal/vertical)
    if (isHorizontal) {
        if (canPlaceShip(gridArray, row, col, shipLength, "horizontal")) {
            for (let i = 0; i < shipLength; i++) {
                gridArray[row][col + i] = 1;  // Mark the grid with the ship
                const cell = player === "Player1" ? player1GridElement : player2GridElement;
                cell.children[row * gridSize + (col + i)].classList.add("ship");
            }
            shipLengths.shift();  // Remove the placed ship from the array
            instruction.textContent = `Player ${player === "Player1" ? "1" : "2"}, place your next ship.`;
        } else {
            alert("Invalid placement! Try again.");
        }
    } else {
        if (canPlaceShip(gridArray, row, col, shipLength, "vertical")) {
            for (let i = 0; i < shipLength; i++) {
                gridArray[row + i][col] = 1;  // Mark the grid with the ship
                const cell = player === "Player1" ? player1GridElement : player2GridElement;
                cell.children[(row + i) * gridSize + col].classList.add("ship");
            }
            shipLengths.shift();  // Remove the placed ship from the array
            instruction.textContent = `Player ${player === "Player1" ? "1" : "2"}, place your next ship.`;
        } else {
            alert("Invalid placement! Try again.");
        }
    }

    if (shipLengths.length === 0) {
        alert(`All ships placed! ${player}'s turn is complete.`);
        if (player === "Player1") {
            currentTurn = "Player2"; // Switch to Player 2
            turnIndicator.textContent = `${currentTurn}'s Turn`;
            instruction.textContent = "Player 2, place your ships on the grid.";
            shipLengths = [4, 3, 3, 2]; // Reset the ship lengths for Player 2
            player1GridElement.removeEventListener("click", player1ShipPlacementHandler);
            player2GridElement.classList.remove("disabled"); // Enable Player 2's grid
            player2GridElement.addEventListener("click", player2ShipPlacementHandler);
        } else {
            startGame();  // Both players have placed ships, start the game
        }
    }
}

// Check if a ship can be placed
function canPlaceShip(gridArray, row, col, shipLength, direction) {
    if (direction === "horizontal") {
        if (col + shipLength > gridSize) return false;  // Out of bounds horizontally
        for (let i = 0; i < shipLength; i++) {
            if (gridArray[row][col + i] !== 0) return false;  // Spot already taken
        }
    } else if (direction === "vertical") {
        if (row + shipLength > gridSize) return false;  // Out of bounds vertically
        for (let i = 0; i < shipLength; i++) {
            if (gridArray[row + i][col] !== 0) return false;  // Spot already taken
        }
    }
    return true;
}

// Start the game after both players place ships
function startGame() {
    player2GridElement.classList.add("disabled");
    turnIndicator.textContent = "Player 1's Turn";
    instruction.textContent = "It's Player 1's turn to attack.";
    player1GridElement.removeEventListener("click", player1ShipPlacementHandler);
    player2GridElement.addEventListener("click", (event) => handleShot(event, player1Grid, player2GridElement));
}

// Handle player shooting at the opponent's grid
function handleShot(event, opponentGrid, gridElement) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (gridElement.classList.contains("disabled")) {
        return; // Prevent shooting if the grid is disabled
    }

    if (opponentGrid[row][col] === 1) {
        event.target.classList.add("hit");
        opponentGrid[row][col] = 2; // Mark as hit
        shotResult.textContent = "Hit!";  // Display "Hit!"
    } else if (opponentGrid[row][col] === 0) {
        event.target.classList.add("miss");
        opponentGrid[row][col] = 3; // Mark as miss
        shotResult.textContent = "Miss!";  // Display "Miss!"
    }

    checkWinCondition(opponentGrid);
    switchTurn();
}

// Switch turns between Player 1 and Player 2
function switchTurn() {
    currentTurn = currentTurn === "Player1" ? "Player2" : "Player1";
    turnIndicator.textContent = `${currentTurn}'s Turn`;

    // Disable the inactive player's grid
    if (currentTurn === "Player1") {
        player2GridElement.classList.add("disabled");
        player1GridElement.classList.remove("disabled");
        instruction.textContent = "It's Player 1's turn to attack.";
    } else {
        player1GridElement.classList.add("disabled");
        player2GridElement.classList.remove("disabled");
        instruction.textContent = "It's Player 2's turn to attack.";
    }
}

// Check if the current player has won
function checkWinCondition(grid) {
    let allSunk = true;
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] === 1) {
                allSunk = false;
                break;
            }
        }
    }

    if (allSunk) {
        alert(`${currentTurn} wins!`);
        resetGame(); // Reset game if someone wins
    }
}

// Reset game function
function resetGame() {
    // Reset all game state
    player1GridElement.innerHTML = "";
    player2GridElement.innerHTML = "";
    player1Grid = [];
    player2Grid = [];
    shipLengths.push(4, 3, 3, 2); // Reset ships for a new game
}

// Event listeners
function player1ShipPlacementHandler(event) {
    handleShipPlacement(event, player1Grid, "Player1");
}

function player2ShipPlacementHandler(event) {
    handleShipPlacement(event, player2Grid, "Player2");
}

// Start button listener to begin the game and set up grids
startButton.addEventListener("click", () => {
    player1GridElement.innerHTML = "";
    player2GridElement.innerHTML = "";

    player1Grid = [];
    player2Grid = [];

    createGrid(player1GridElement, player1Grid);
    createGrid(player2GridElement, player2Grid);

    instruction.textContent = "Player 1, place your ships.";
    turnIndicator.textContent = "Player 1's Turn";

    // Enable Player 1's grid and allow Player 1 to place ships
    player1GridElement.classList.remove("disabled");
    player2GridElement.classList.add("disabled");

    player1GridElement.addEventListener("click", player1ShipPlacementHandler);
});
