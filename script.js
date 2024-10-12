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
let currentShipLength = 0;

document.addEventListener('keydown', event => {
    if (event.key === 'R' || event.key === 'r') {
        isHorizontal = !isHorizontal;
        instruction.textContent = `Ship placement mode: ${isHorizontal ? 'Horizontal' : 'Vertical'}. Press 'R' to rotate.`;
        updateShipPreview();
    }
});

function createGrid(gridElement, gridArray) {
    gridElement.innerHTML = ''; // Clear existing grid
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

    if (canPlaceShip(gridArray, row, col, shipLength, isHorizontal)) {
        placeShip(gridArray, row, col, shipLength, isHorizontal, player);
        shipLengths.shift();
        currentShipLength = shipLengths[0] || 0;
        instruction.textContent = `Player ${player === "Player1" ? "1" : "2"}, place your next ship. Press 'R' to rotate.`;

        if (shipLengths.length === 0) {
            finishPlayerPlacement(player);
        } else {
            updateShipPreview();
        }
    } else {
        alert("Invalid placement! Try again.");
    }
}

function canPlaceShip(gridArray, row, col, shipLength, isHorizontal) {
    if (isHorizontal) {
        if (col + shipLength > gridSize) return false;
        for (let i = 0; i < shipLength; i++) {
            if (gridArray[row][col + i] !== 0) return false;
        }
    } else {
        if (row + shipLength > gridSize) return false;
        for (let i = 0; i < shipLength; i++) {
            if (gridArray[row + i][col] !== 0) return false;
        }
    }
    return true;
}

function placeShip(gridArray, row, col, shipLength, isHorizontal, player) {
    const gridElement = player === "Player1" ? player1GridElement : player2GridElement;
    for (let i = 0; i < shipLength; i++) {
        if (isHorizontal) {
            gridArray[row][col + i] = 1;
            gridElement.children[row * gridSize + (col + i)].classList.add("ship");
        } else {
            gridArray[row + i][col] = 1;
            gridElement.children[(row + i) * gridSize + col].classList.add("ship");
        }
    }
}

function updateShipPreview() {
    const gridElement = currentTurn === "Player1" ? player1GridElement : player2GridElement;
    const cells = gridElement.getElementsByClassName("cell");

    for (let cell of cells) {
        cell.classList.remove("preview", "invalid");
    }

    if (currentShipLength === 0) return;

    gridElement.addEventListener("mouseover", showShipPreview);
    gridElement.addEventListener("mouseout", hideShipPreview);
}

function showShipPreview(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const gridElement = currentTurn === "Player1" ? player1GridElement : player2GridElement;
    const gridArray = currentTurn === "Player1" ? player1Grid : player2Grid;

    const isValid = canPlaceShip(gridArray, row, col, currentShipLength, isHorizontal);

    for (let i = 0; i < currentShipLength; i++) {
        let cell;
        if (isHorizontal) {
            if (col + i >= gridSize) break;
            cell = gridElement.children[row * gridSize + (col + i)];
        } else {
            if (row + i >= gridSize) break;
            cell = gridElement.children[(row + i) * gridSize + col];
        }
        cell.classList.add(isValid ? "preview" : "invalid");
    }
}

function hideShipPreview() {
    const gridElement = currentTurn === "Player1" ? player1GridElement : player2GridElement;
    const cells = gridElement.getElementsByClassName("cell");

    for (let cell of cells) {
        cell.classList.remove("preview", "invalid");
    }
}

function finishPlayerPlacement(player) {
    if (player === "Player1") {
        currentTurn = "Player2";
        turnIndicator.textContent = `${currentTurn}'s Turn`;
        instruction.textContent = "Player 2, place your ships on the grid. Press 'R' to rotate.";
        shipLengths = [4, 3, 3, 2];
        currentShipLength = 4;
        player1GridElement.removeEventListener("click", player1ShipPlacementHandler);
        player2GridElement.classList.remove("disabled");
        player2GridElement.addEventListener("click", player2ShipPlacementHandler);
        updateShipPreview();
    } else {
        startGame();
    }
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
    player1GridElement.removeEventListener("mouseover", showShipPreview);
    player1GridElement.removeEventListener("mouseout", hideShipPreview);
    player2GridElement.removeEventListener("mouseover", showShipPreview);
    player2GridElement.removeEventListener("mouseout", hideShipPreview);
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
    currentShipLength = 4;
    currentTurn = "Player1";
    isHorizontal = true;
    shotResult.textContent = "";
    instruction.textContent = "Click 'Start Game' to begin a new game.";
    turnIndicator.textContent = "";

    player1GridElement.removeEventListener("click", handleAttack);
    player2GridElement.removeEventListener("click", handleAttack);
    player1GridElement.removeEventListener("mouseover", showShipPreview);
    player1GridElement.removeEventListener("mouseout", hideShipPreview);
    player2GridElement.removeEventListener("mouseover", showShipPreview);
    player2GridElement.removeEventListener("mouseout", hideShipPreview);
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

    instruction.textContent = "Player 1, place your ships. Press 'R' to rotate.";
    turnIndicator.textContent = "Player 1's Turn";

    player1GridElement.classList.remove("disabled");
    player2GridElement.classList.add("disabled");

    player1GridElement.addEventListener("click", player1ShipPlacementHandler);
    currentShipLength = shipLengths[0];
    updateShipPreview();
});