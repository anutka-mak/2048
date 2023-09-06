import { Grid } from "./grid";
import { Tile } from "./tile";
import { Score } from "./score";
import { Cell } from "./cell";

class Game {
    public grid: Grid;
    public score: Score;
    gameBoard: HTMLElement = document.getElementById("game-board");
    resetButton: HTMLElement  = document.getElementById("button-reset");

    constructor() {
        this.score = new Score();
        this.grid = new Grid(this.gameBoard, this.score);

        this.startGame();
    }

    private startGame(): void {
        this.grid.getRandomEmptyCell()!.linkTile(new Tile(this.gameBoard));
        this.grid.getRandomEmptyCell()!.linkTile(new Tile(this.gameBoard));
        this.setupInputOnce();

        window.onload = () => {
            this.checkAndPromptGameProgress();
        };

        this.resetButton.addEventListener("click", () => {
            const confirmation = confirm("Are you sure you want to reset the game?");

            if (confirmation) {
                this.resetGame();
            }
        });
    }

    private setupInputOnce(): void {
        window.addEventListener("keydown", this.handleInput.bind(this), { once: true });
    }

    private async handleInput(event: KeyboardEvent): Promise<void> {
        switch (event.key) {
            case "ArrowUp":
                if (!this.canMoveUp()) {
                    this.setupInputOnce();
                    return;
                }
                await this.moveUp();
                break;
            case "ArrowDown":
                if (!this.canMoveDown()) {
                    this.setupInputOnce();
                    return;
                }
                await this.moveDown();
                break;
            case "ArrowLeft":
                if (!this.canMoveLeft()) {
                    this.setupInputOnce();
                    return;
                }
                await this.moveLeft();
                break;
            case "ArrowRight":
                if (!this.canMoveRight()) {
                    this.setupInputOnce();
                    return;
                }
                await this.moveRight();
                break;
            default:
                this.setupInputOnce();
                return;
        }

        const newTile = new Tile(this.gameBoard);
        this.grid.getRandomEmptyCell()!.linkTile(newTile);
        this.saveGameProgress();

        if (!this.canMoveUp() && !this.canMoveDown() && !this.canMoveLeft() && !this.canMoveRight()) {
            await newTile.waitForAnimationEnd();
            alert("Game over!");
            localStorage.clear();

            return;
        }

        this.setupInputOnce();
    }

    private resetGame(): void {
        this.grid.clear();
        this.score.reset();
        this.grid.getRandomEmptyCell()!.linkTile(new Tile(this.gameBoard));
        this.grid.getRandomEmptyCell()!.linkTile(new Tile(this.gameBoard));
    }

    private async moveUp() {
        await this.moveTiles(this.grid.cellsGroupedByColumn);
    }

    private async moveDown() {
        await this.moveTiles(this.grid.cellsGroupedByReversedColumn);
    }

    private async moveLeft() {
        await this.moveTiles(this.grid.cellsGroupedByRow);
    }

    private async moveRight() {
        await this.moveTiles(this.grid.cellsGroupedByReversedRow);
    }

    private async moveTiles(groupedCells: Record<number, Cell[]>): Promise<void> {
        const promises: Promise<void>[] = [];
        Object.values(groupedCells).forEach(group => this.moveTilesInGroup(group, promises));

        await Promise.all(promises);
        this.grid.cells.forEach(cell => {
            cell.hasTileForMerge() && cell.mergeTiles();
        });
    }

    private moveTilesInGroup(group: Cell[], promises: Promise<void>[]): void {
        for (let i = 1; i < group.length; i++) {
            if (group[i].isEmpty()) {
                continue;
            }

            const cellWithTile = group[i];

            let targetCell: Cell | undefined;
            let j = i - 1;
            while (j >= 0 && group[j].canAccept(cellWithTile.linkedTile)) {
                targetCell = group[j];
                j--;
            }

            if (!targetCell) {
                continue;
            }

            promises.push(cellWithTile.linkedTile!.waitForTransitionEnd());

            if (targetCell.isEmpty()) {
                targetCell.linkTile(cellWithTile.linkedTile!);
            } else {
                targetCell.linkTileForMerge(cellWithTile.linkedTile!);
            }

            cellWithTile.unlinkTile();
        }
    }

    private canMoveUp(): boolean {
        return this.canMove(this.grid.cellsGroupedByColumn);
    }

    private canMoveDown(): boolean {
        return this.canMove(this.grid.cellsGroupedByReversedColumn);
    }

    private canMoveLeft(): boolean {
        return this.canMove(this.grid.cellsGroupedByRow);
    }

    private canMoveRight(): boolean {
        return this.canMove(this.grid.cellsGroupedByReversedRow);
    }

    private canMove(groupedCells: Record<number, Cell[]>): boolean {
        return Object.values(groupedCells).some(group => this.canMoveInGroup(group));
    }

    private canMoveInGroup(group: Cell[]): boolean {
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

    private saveGameProgress(): void {
        const savedProgress: any[] = [];

        for (const cell of this.grid.cells) {
            const savedCell = {
                x: cell.x,
                y: cell.y,
                value: cell.linkedTile ? cell.linkedTile.value : null
            };
            savedProgress.push(savedCell);
        }

        savedProgress.push({ score: this.score.score });

        localStorage.setItem('savedProgress', JSON.stringify(savedProgress));
    }

    private restoreGameProgress(): void {
        const savedProgressJSON = localStorage.getItem('savedProgress');

        if (savedProgressJSON) {
            const savedProgress = JSON.parse(savedProgressJSON);

            this.grid.clear();

            this.grid.cells.forEach(cell => {
                const savedCell = savedProgress.find((savedCell: any) => savedCell.x === cell.x && savedCell.y === cell.y);
                cell.unlinkTile();

                if (savedCell && savedCell.value !== null) {
                    const newTile = new Tile(this.gameBoard);
                    newTile.setValue(savedCell.value);
                    cell.linkTile(newTile);
                }
            });

            this.score.score = savedProgress[savedProgress.length - 1].score;
            this.score.updateDisplay();
        }
    }

    private checkAndPromptGameProgress(): void {
        const gameProgress = localStorage.getItem('savedProgress');

        if (gameProgress !== null) {
            const response = window.confirm('Restore the game progress?');

            if (response) {
                this.restoreGameProgress();
            } else {
                localStorage.clear();
            }
        }
    }
}

new Game();
