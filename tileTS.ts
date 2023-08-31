export class Tile {
    tileElement: HTMLElement;
    x: number;
    y: number;

    constructor(gridElement: HTMLElement) {
        this.tileElement = document.createElement("div");
        this.tileElement.classList.add("tile");
        this.setValue(Math.random() > 0.5 ? 2 : 4);
        gridElement.append(this.tileElement);
    }

    setXY(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.tileElement.style.setProperty("--x", x.toString());
        this.tileElement.style.setProperty("--y", y.);
    }

    setValue(value) {
        this.value = value;
        this.tileElement.textContent = value;
        const bgLightness = 100 - Math.log2(value) * 9; // 2 -> 100 - 1*9 -> 91; 2048 -> 100 - 11*9 -> 1
        this.tileElement.style.setProperty("--bg-lightness", `${bgLightness}%`);
        this.tileElement.style.setProperty("--text-lightness", `${bgLightness < 50 ? 90 : 10}%`);
    }

    removeFromDOM() {
        this.tileElement.remove();
    }

    waitForTransitionEnd() {
        return new Promise(resolve => {
            this.tileElement.addEventListener(
                "transitionend", resolve, { once: true });
        });
    }

    waitForAnimationEnd() {
        return new Promise(resolve => {
            this.tileElement.addEventListener(
                "animationend", resolve, { once: true });
        });
    }
}