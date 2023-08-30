const gameBoard = document.getElementById("game-board");
const resetButton = document.getElementById("button-reset");
const tileElements = document.querySelectorAll(".tile");
const gridSize = 4;
const maxAttempts = 10;
const cellsCount = gridSize * gridSize;
const initialTilesCount = 2;
const cells = [];
const swipeCalls = {
    up: moveTilesUp,
    down: moveTilesDown,
    left: moveTilesLeft,
    right: moveTilesRight,
};

let savedProgress = [];
let isSwiped;
let touchY;
let initialY = 0;
let touchX;
let initialX = 0;
let swipeDirection;
let rectLeft = gameBoard.getBoundingClientRect().left;
let rectTop = gameBoard.getBoundingClientRect().top;
let score = 0;

window.onload = function () {
    checkAndPromptGameProgress();
}

gameBoard.addEventListener("touchstart", handleTouchStart);
gameBoard.addEventListener("touchmove", handleTouchMove);
gameBoard.addEventListener("touchend", handleTouchEnd);

document.addEventListener("keydown", async (event) => {
    if (!isMoveAnyDirection()) {
        for (const tileElement of tileElements) {
            await waitForTransitionEnd(tileElement);
        }

        alert("Game over!");
        resetGame();

        return;
    }

    switch (event.key) {
        case "ArrowUp":
            await moveTilesUp();
            break;
        case "ArrowDown":
            await moveTilesDown();
            break;
        case "ArrowLeft":
            await moveTilesLeft();
            break;
        case "ArrowRight":
            await moveTilesRight();
            break;
        default:
            return;
    }

    saveGameProgress();
});

resetButton.addEventListener("click", () => {
    const confirmation = confirm("Are you sure you want to reset the game?");

    if (confirmation) {
        resetGame();
    }
});

startGame();

function startGame() {
    createGrid(gameBoard, gridSize);
    createInitialTiles();
}

function checkAndPromptGameProgress() {
    const gameProgress = localStorage.getItem('savedProgress');

    if (gameProgress !== null) {
        const response = window.confirm('Restore the game progress?');

        if (response) {
            restoreGameProgress();
        } else {
            localStorage.clear();
        }
    }
}

function restoreGameProgress() {
    const savedProgressJSON = localStorage.getItem('savedProgress');

    if (savedProgressJSON) {
        const savedProgress = JSON.parse(savedProgressJSON);

        clearBoard();

        savedProgress.forEach(savedItem => {
            const cell = cells.find(cell => cell.x === savedItem.x && cell.y === savedItem.y);
            removeNullCells();

            if (cell && savedItem.value !== null) {
                cell.linkedTile = {element: null, value: savedItem.value};
                createTileAtPosition(cell, savedItem.value);
            }
        });

        score = savedProgress[savedProgress.length - 1].score;
        updateScoreDisplay();
    }
}

function createTileAtPosition(cell, value) {
    const tileElement = document.createElement("div");

    tileElement.classList.add("tile");
    setXY(tileElement, cell.x, cell.y);
    setValue(tileElement, value);

    cell.linkedTile = {element: tileElement, value: value};
    cell.element.appendChild(tileElement);
}

function getXY(e) {
    touchX = e.touches[0].pageX - rectLeft;
    touchY = e.touches[0].pageY - rectTop;
}

function handleTouchStart(event) {
    isSwiped = true;
    getXY(event);
    initialX = touchX;
    initialY = touchY;
}

function handleTouchMove(event) {
    if (!isMoveAnyDirection()) {
        alert("Game over!");
        resetGame();
        localStorage.clear();
    } else if (isSwiped) {
        getXY(event);

        const diffX = touchX - initialX;
        const diffY = touchY - initialY;

        swipeDirection = Math.abs(diffY) > Math.abs(diffX) ? (diffY > 0 ? "down" : "up") : (diffX > 0 ? "right" : "left");
    }

    saveGameProgress();
}

function handleTouchEnd() {
    isSwiped = false;
    swipeCalls[swipeDirection]();
    updateScoreDisplay();
}

function saveGameProgress() {
    savedProgress = cells.map((cell) => ({
        x: cell.x,
        y: cell.y,
        value: cell.linkedTile ? cell.linkedTile.value : null
    }));

    savedProgress.push({score: score});
    localStorage.setItem('savedProgress', JSON.stringify(savedProgress));
}

function resetGame() {
    clearBoard();

    cells.forEach(cell => {
        cell.linkedTile = null;
    });
    score = 0;

    updateScoreDisplay();
    createInitialTiles();
}

function clearBoard() {
    const tiles = document.querySelectorAll(".tile");
    tiles.forEach(tile => tile.remove());
}

function createGrid(gridElement, gridSize) {
    for (let i = 0; i < cellsCount; i++) {
        const x = i % gridSize;
        const y = Math.floor(i / gridSize);
        const cell = createCell(x, y);

        cells.push(cell);
        gridElement.appendChild(cell.element);
    }
}

function createCell(x, y) {
    const cellElement = document.createElement("div");

    cellElement.classList.add("cell");

    return {x, y, element: cellElement, linkedTile: null, linkedTileForMerge: null};
}

function createInitialTiles() {
    for (let i = 0; i < initialTilesCount; i++) {
        createTile(gameBoard, maxAttempts);
    }
}

function createTile(gridElement, maxAttempts) {
    const tileElement = document.createElement("div");
    const emptyCell = getRandomEmptyCell();

    tileElement.classList.add("tile");

    if (emptyCell) {
        emptyCell.linkedTile = {element: tileElement, value: Math.random() > 0.5 ? 2 : 4};
        setXY(tileElement, emptyCell.x, emptyCell.y);
        setValue(tileElement, emptyCell.linkedTile.value);
        gridElement.appendChild(tileElement);
    } else if (maxAttempts > 0) {
        createTile(gridElement, maxAttempts - 1);
    }
}

function getRandomEmptyCell() {
    const emptyCells = cells.filter(cell => !cell.linkedTile);
    const randomIndex = Math.floor(Math.random() * emptyCells.length);

    return emptyCells[randomIndex];
}

function setXY(tileElement, x, y) {
    tileElement.style.setProperty("--x", x);
    tileElement.style.setProperty("--y", y);
}

function setValue(tileElement, value) {
    const bgLightness = 100 - Math.log2(value) * 9;

    tileElement.textContent = value;
    tileElement.style.setProperty("--bg-lightness", `${bgLightness}%`);
    tileElement.style.setProperty("--text-lightness", `${bgLightness < 50 ? 90 : 10}%`);
}

function addScore(points) {
    score += points;
    updateScoreDisplay();
}

function updateScoreDisplay() {
    document.getElementById('score').textContent = score;
}

async function moveTilesUp() {
    for (let x = 0; x < gridSize; x++) {
        for (let y = 1; y < gridSize; y++) {
            const currentCell = cells[x + y * gridSize];
            const linkedTile = currentCell.linkedTile;

            if (linkedTile) {
                await moveTileInDirection(currentCell, x, y, -1, 0);
            }
        }
    }

    createTile(gameBoard, maxAttempts);
}

async function moveTilesDown() {
    for (let x = 0; x < gridSize; x++) {
        for (let y = gridSize - 2; y >= 0; y--) {
            const currentCell = cells[x + y * gridSize];
            const linkedTile = currentCell.linkedTile;

            if (linkedTile) {
                await moveTileInDirection(currentCell, x, y, 1, 0);
            }
        }
    }

    createTile(gameBoard, maxAttempts);
}

async function moveTilesLeft() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 1; x < gridSize; x++) {
            const currentCell = cells[x + y * gridSize];
            const linkedTile = currentCell.linkedTile;

            if (linkedTile) {
                await moveTileInDirection(currentCell, x, y, 0, -1);
            }
        }
    }

    createTile(gameBoard, maxAttempts);
}

async function moveTilesRight() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = gridSize - 2; x >= 0; x--) {
            const currentCell = cells[x + y * gridSize];
            const linkedTile = currentCell.linkedTile;

            if (linkedTile) {
                await moveTileInDirection(currentCell, x, y, 0, 1);
            }
        }
    }

    createTile(gameBoard, maxAttempts);
}

async function moveTileInDirection(currentCell, x, y, dirY, dirX) {
    let targetX = x + dirX;
    let targetY = y + dirY;

    while (targetX >= 0 && targetX < gridSize && targetY >= 0 && targetY < gridSize) {
        const targetCell = cells[targetX + targetY * gridSize];

        if (hasNoLinkedTile(targetCell)) {
            await moveTile(currentCell, targetCell);
            currentCell = targetCell;
        } else if (isTilesMerge(targetCell, currentCell)) {
            await mergeTiles(targetCell, currentCell);
            break;
        } else {
            break;
        }

        targetX += dirX;
        targetY += dirY;
    }
}

function moveTile(currentCell, targetCell) {
    targetCell.linkedTile = currentCell.linkedTile;
    currentCell.linkedTile = null;
    setXY(targetCell.linkedTile.element, targetCell.x, targetCell.y);
}

function mergeTiles(tile1, tile2) {
    const newValue = tile2.linkedTile.value * 2;
    tile1.linkedTile.value = newValue;

    setValue(tile1.linkedTile.element, newValue);
    removeNullCells();
    removeTile(tile2);

    addScore(newValue);
}

function removeNullCells() {
    for (const cell of cells) {
        if (cell.linkedTile && cell.linkedTile.value === null) {
            cell.linkedTile.element.remove();
        }
    }
}

function removeTile(tile) {
    tile.linkedTile.element.remove();
    tile.linkedTile = null;
}

function isMoveAnyDirection() {
    return isMoveTilesUp() || isMoveTilesDown() || isMoveTilesLeft() || isMoveTilesRight();
}

function isMoveTilesUp() {
    for (let x = 0; x < gridSize; x++) {
        for (let y = 1; y < gridSize; y++) {
            const currentCell = cells[x + y * gridSize];
            const linkedTitle = currentCell.linkedTile;
            const isTilesMove = isTilesMoveInDirection(currentCell, x, y, -1, 0);

            if (linkedTitle && isTilesMove) {
                return true;
            }
        }
    }

    return false;
}

function isMoveTilesDown() {
    for (let x = 0; x < gridSize; x++) {
        for (let y = gridSize - 2; y >= 0; y--) {
            const currentCell = cells[x + y * gridSize];
            const linkedTitle = currentCell.linkedTile;
            const isTilesMove = isTilesMoveInDirection(currentCell, x, y, 1, 0);

            if (linkedTitle && isTilesMove) {
                return true;
            }
        }
    }

    return false;
}

function isMoveTilesLeft() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 1; x < gridSize; x++) {
            const currentCell = cells[x + y * gridSize];
            const linkedTitle = currentCell.linkedTile;
            const isTilesMove = isTilesMoveInDirection(currentCell, x, y, 0, -1);

            if (linkedTitle && isTilesMove) {
                return true;
            }
        }
    }

    return false;
}

function isMoveTilesRight() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = gridSize - 2; x >= 0; x--) {
            const currentCell = cells[x + y * gridSize];
            const linkedTitle = currentCell.linkedTile;
            const isTilesMove = isTilesMoveInDirection(currentCell, x, y, 0, 1);

            if (linkedTitle && isTilesMove) {
                return true;
            }
        }
    }

    return false;
}

function isTilesMoveInDirection(currentCell, x, y, dirX, dirY) {
    const targetX = x + dirX;
    const targetY = y + dirY;
    const isTargetInBorders = targetX >= 0 && targetX < gridSize && targetY >= 0 && targetY < gridSize

    if (isTargetInBorders) {
        const targetCell = cells[targetX + targetY * gridSize];

        return hasNoLinkedTile(targetCell) || isTilesMerge(targetCell, currentCell);
    }

    return false;
}

function isTilesMerge(targetTile, currentTile) {
    return (
        targetTile.linkedTile
        && currentTile.linkedTile
        && targetTile.linkedTile.value === currentTile.linkedTile.value
        && !targetTile.linkedTileForMerge
    );
}

function hasNoLinkedTile(cell) {
    return !cell.linkedTile;
}

function waitForTransitionEnd(tileElement, callback) {
    tileElement.addEventListener("transitionend", function onTransitionEnd() {
        tileElement.removeEventListener("transitionend", onTransitionEnd);
        callback();
    }, {once: true});
}