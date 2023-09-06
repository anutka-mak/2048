export class Score {
    score: number;
    scoreElement: HTMLElement | null;

    constructor() {
        this.score = 0;
        this.scoreElement = document.getElementById('score');
        this.updateDisplay();
    }

    public addScore(points: number): void {
        this.score += points;
        this.updateDisplay();
    }

    public updateDisplay(): void {
        this.scoreElement.textContent = this.score.toString();
    }

    public reset(): void {
        this.score = 0;
        this.updateDisplay();
    }
}
