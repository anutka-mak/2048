export class TouchScreen {
    constructor(gridElement, swipeCallbacks, updateScoreDisplay) {
        this.gridElement = gridElement;
        this.swipeCallbacks = swipeCallbacks;
        this.updateScoreDisplay = updateScoreDisplay;

        this.isSwiped = false;
        this.initialY = 0;
        this.initialX = 0;
        this.swipeDirection = null;

        this.gridElement.addEventListener("touchstart", this.handleTouchStart);
        this.gridElement.addEventListener("touchmove", this.handleTouchMove);
        this.gridElement.addEventListener("touchend", this.handleTouchEnd);
    }

    handleTouchStart(e) {
        this.isSwiped = true;
        this.initialX = e.touches[0].clientX;
        this.initialY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        if (!this.isSwiped) {
            return;
        }

        const deltaX = e.touches[0].clientX - this.initialX;
        const deltaY = e.touches[0].clientY - this.initialY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            this.swipeDirection = deltaX > 0 ? "right" : "left";
        } else {
            this.swipeDirection = deltaY > 0 ? "down" : "up";
        }

        e.preventDefault();
    }

    handleTouchEnd() {
        if (this.isSwiped && this.swipeCallbacks[this.swipeDirection]) {
            this.swipeCallbacks[this.swipeDirection]();
            this.updateScoreDisplay();
        }

        this.isSwiped = false;
        this.swipeDirection = null;
    }
}