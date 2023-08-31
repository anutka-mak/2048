export class Score {
    score: number;
    scoreElement: HTMLElement;

    constructor() {
        this.score = 0;
        this.scoreElement = document.getElementById('score');
        this.updateScoreDisplay();
    }

    private addScore(points: number): void {
        this.score += points;
        this.updateScoreDisplay();
    }
    private updateScoreDisplay(): void {
        this.scoreElement.textContent = this.score.toString();
    }

    private resetScore(): void {
        this.score = 0;
        this.updateScoreDisplay();
    }
}