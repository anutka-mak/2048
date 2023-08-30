export class Cell {
    constructor(gridElement, x, y, score) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        gridElement.append(cell);
        this.cell = cell;
        this.x = x;
        this.y = y;
        this.score = score;
        this.mergedScore = 0;
    }

    linkTile(tile) {
        tile.setXY(this.x, this.y);
        this.linkedTile = tile;
    }

    unlinkTile() {
        this.linkedTile = null;
    }

    removeLinkedTile() {
        if (this.linkedTile) {
            this.linkedTile.removeFromDOM();
            this.linkedTile = null;
        }
    }

    isEmpty() {
        return !this.linkedTile;
    }

    linkTileForMerge(tile) {
        tile.setXY(this.x, this.y);
        this.linkedTileForMerge = tile;
    }

    unlinkTileForMerge() {
        this.linkedTileForMerge = null;
    }

    hasTileForMerge() {
        return !!this.linkedTileForMerge;
    }

    canAccept(newTile) {
        return (
            this.isEmpty() ||
            (!this.hasTileForMerge() && this.linkedTile.value === newTile.value)
        );
    }

    mergeTiles() {
        const mergedValue = this.linkedTile.value + this.linkedTileForMerge.value;
        this.linkedTile.setValue(mergedValue);
        this.mergedScore = mergedValue;
        this.linkedTileForMerge.removeFromDOM();
        this.unlinkTileForMerge();

        if (this.mergedScore > 0) {
            this.score.addScore(this.mergedScore);
        }
    }
}
