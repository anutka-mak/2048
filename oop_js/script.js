import { Grid } from "./grid.js";
import { Tile } from "./tile.js";
import { Score } from "./score.js";

const gameBoard = document.getElementById("game-board");
const resetButton = document.getElementById("button-reset");
const score = new Score();

const grid = new Grid(gameBoard, score);
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
setupInputOnce();

window.onload = function () {
    checkAndPromptGameProgress();
}

function setupInputOnce() {
    window.addEventListener("keydown", handleInput, { once: true });
}

resetButton.addEventListener("click", () => {
    const confirmation = confirm("Are you sure you want to reset the game?");

    if (confirmation) {
        resetGame();
    }
});

async function handleInput(event) {
    switch (event.key) {
        case "ArrowUp":
            if (!canMoveUp()) {
                setupInputOnce();
                return;
            }
            await moveUp();
            break;
        case "ArrowDown":
            if (!canMoveDown()) {
                setupInputOnce();
                return;
            }
            await moveDown();
            break;
        case "ArrowLeft":
            if (!canMoveLeft()) {
                setupInputOnce();
                return;
            }
            await moveLeft();
            break;
        case "ArrowRight":
            if (!canMoveRight()) {
                setupInputOnce();
                return;
            }
            await moveRight();
            break;
        default:
            setupInputOnce();
            return;
    }

    const newTile = new Tile(gameBoard);
    grid.getRandomEmptyCell().linkTile(newTile);
    saveGameProgress();

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        await newTile.waitForAnimationEnd()
        alert("Game over!")
        localStorage.clear();
        return;
    }

    setupInputOnce();
}

function resetGame() {
    grid.clearGrid();

    score.resetScore();

    grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
    grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
}

async function moveUp() {
    await moveTiles(grid.cellsGroupedByColumn);
}

async function moveDown() {
    await moveTiles(grid.cellsGroupedByReversedColumn);
}

async function moveLeft() {
    await moveTiles(grid.cellsGroupedByRow);
}

async function moveRight() {
    await moveTiles(grid.cellsGroupedByReversedRow);
}

async function moveTiles(groupedCells) {
    const promises = [];

    groupedCells.forEach(group => moveTilesInGroup(group, promises));

    await Promise.all(promises);
    grid.cells.forEach(cell => {
        cell.hasTileForMerge() && cell.mergeTiles()
    });
}

function moveTilesInGroup(group, promises) {
    for (let i = 1; i < group.length; i++) {
        if (group[i].isEmpty()) {
            continue;
        }

        const cellWithTile = group[i];

        let targetCell;
        let j = i - 1;
        while (j >= 0 && group[j].canAccept(cellWithTile.linkedTile)) {
            targetCell = group[j];
            j--;
        }

        if (!targetCell) {
            continue;
        }

        promises.push(cellWithTile.linkedTile.waitForTransitionEnd());

        if (targetCell.isEmpty()) {
            targetCell.linkTile(cellWithTile.linkedTile);
        } else {
            targetCell.linkTileForMerge(cellWithTile.linkedTile);
        }

        cellWithTile.unlinkTile();
    }
}

function canMoveUp() {
    return canMove(grid.cellsGroupedByColumn);
}

function canMoveDown() {
    return canMove(grid.cellsGroupedByReversedColumn);
}

function canMoveLeft() {
    return canMove(grid.cellsGroupedByRow);
}

function canMoveRight() {
    return canMove(grid.cellsGroupedByReversedRow);
}

function canMove(groupedCells) {
    return groupedCells.some(group => canMoveInGroup(group));
}

function canMoveInGroup(group) {
    return group.some((cell, index) => {
        if (index === 0) {
            return false;
        }

        if (cell.isEmpty()) {
            return false;
        }

        const targetCell = group[index - 1];

        return targetCell.canAccept(cell.linkedTile);
    });
}

function saveGameProgress() {
    const savedProgress = grid.cells.map(cell => {
        return {
            x: cell.x,
            y: cell.y,
            value: cell.linkedTile ? cell.linkedTile.value : null
        };
    });

    savedProgress.push({ score: score.score });

    localStorage.setItem('savedProgress', JSON.stringify(savedProgress));
}

function restoreGameProgress() {
    const savedProgressJSON = localStorage.getItem('savedProgress');

    if (savedProgressJSON) {
        const savedProgress = JSON.parse(savedProgressJSON);

        grid.clearGrid();

        grid.cells.forEach(cell => {
            const savedCell = savedProgress.find(savedCell => savedCell.x === cell.x && savedCell.y === cell.y);
            cell.unlinkTile();

            if (savedCell && savedCell.value !== null) {
                const newTile = new Tile(gameBoard);
                newTile.setValue(savedCell.value);
                cell.linkTile(newTile);
            }
        });

        score.score = savedProgress[savedProgress.length - 1].score;
        score.updateScoreDisplay();
    }
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