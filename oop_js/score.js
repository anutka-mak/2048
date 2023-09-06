export class Score {
    constructor() {
        this.score = 0;
        this.scoreElement = document.getElementById('score');
        this.updateScoreDisplay();
    }

    addScore(points) {
        this.score += points;
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        this.scoreElement.textContent = this.score;
    }

    resetScore() {
        this.score = 0;
        this.updateScoreDisplay();
    }
}