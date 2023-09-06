import { Score } from "./score";
import { Cell } from "./cell";

export class Grid {
    cells: Cell[];
    cellsGroupedByColumn: Record<string, Cell[]>;
    cellsGroupedByReversedColumn: Record<string, Cell[]>;
    cellsGroupedByRow: Record<string, Cell[]>;
    cellsGroupedByReversedRow: Record<string, Cell[]>;
    gridSize: number;
    cellsCount: number;

    constructor(gridElement: HTMLElement, score: Score) {
        this.cells = [];
        this.gridSize = 4;
        this.cellsCount = 16;

        for (let i = 0; i < this.cellsCount; i++) {
            this.cells.push(
                new Cell(gridElement, i % this.gridSize, Math.floor(i / this.gridSize), score)
            );
        }

        this.cellsGroupedByColumn = this.groupCellsByColumn();
        this.cellsGroupedByReversedColumn = {};

        for (const [key, column] of Object.entries(this.cellsGroupedByColumn)) {
            this.cellsGroupedByReversedColumn[key] = [...column].reverse();
        }

        this.cellsGroupedByRow = this.groupCellsByRow();
        this.cellsGroupedByReversedRow = {};

        for (const [key, row] of Object.entries(this.cellsGroupedByRow)) {
            this.cellsGroupedByReversedRow[key] = [...row].reverse();
        }
    }

    public clear(): void {
        this.cells.forEach(cell => {
            cell.removeLinkedTile();
        });
    }

    public getRandomEmptyCell(): Cell | null {
        const emptyCells = this.cells.filter(cell => cell.isEmpty());
        const randomIndex = Math.floor(Math.random() * emptyCells.length);

        return emptyCells[randomIndex];
    }

    public groupCellsByColumn(): Record<string, Cell[]> {
        return this.cells.reduce((groupedCells: Record<string, Cell[]>, cell: Cell) => {
            const key = cell.x.toString();
            groupedCells[key] = groupedCells[key] || [];
            groupedCells[key][cell.y] = cell;

            return groupedCells;
        }, {});
    }

    public groupCellsByRow(): Record<string, Cell[]> {
        return this.cells.reduce((groupedCells: Record<string, Cell[]>, cell: Cell) => {
            const key = cell.y.toString();
            groupedCells[key] = groupedCells[key] || [];
            groupedCells[key][cell.x] = cell;

            return groupedCells;
        }, {});
    }
}


