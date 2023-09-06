import { Tile } from "./tile";
import { Score } from "./score";

export class Cell {
    cell: HTMLElement;
    x: number;
    y: number;
    score: Score;
    mergedScore: number;
    linkedTile: Tile | null;
    linkedTileForMerge: Tile | null;

    constructor(gridElement: HTMLElement, x: number, y: number, score: Score) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        gridElement.append(cell);
        this.cell = cell;
        this.x = x;
        this.y = y;
        this.score = score;
        this.mergedScore = 0;
        this.linkedTile = null;
        this.linkedTileForMerge = null;
    }

    public linkTile(tile: Tile): void {
        tile.setXY(this.x, this.y);
        this.linkedTile = tile;
    }

    public unlinkTile(): void {
        this.linkedTile = null;
    }

    public removeLinkedTile(): void {
        if (this.linkedTile) {
            this.linkedTile.removeFromDOM();
            this.linkedTile = null;
        }
    }

    public isEmpty(): boolean {
        return !this.linkedTile;
    }

    public linkTileForMerge(tile: Tile): void {
        tile.setXY(this.x, this.y);
        this.linkedTileForMerge = tile;
    }

    public unlinkTileForMerge(): void {
        this.linkedTileForMerge = null;
    }

    public hasTileForMerge(): boolean {
        return !!this.linkedTileForMerge;
    }

    public canAccept(newTile: Tile): boolean {
        return (
            this.isEmpty() ||
            (!this.hasTileForMerge() && this.linkedTile!.value === newTile.value)
        );
    }

    public mergeTiles(): void {
        const mergedValue = this.linkedTile!.value + this.linkedTileForMerge!.value;
        this.linkedTile!.setValue(mergedValue);
        this.mergedScore = mergedValue;
        this.linkedTileForMerge!.removeFromDOM();
        this.unlinkTileForMerge();

        if (this.mergedScore > 0) {
            this.score.addScore(this.mergedScore);
        }
    }
}
