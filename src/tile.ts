export class Tile {
    tileElement: HTMLElement;
    value: number;
    x: number;
    y: number;
    linkedTile: Tile | null;

    constructor(gridElement: HTMLElement) {
        this.tileElement = document.createElement("div");
        this.tileElement.classList.add("tile");
        this.setValue(Math.random() > 0.5 ? 2 : 4);
        gridElement.append(this.tileElement);
    }

    public setXY(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.tileElement.style.setProperty("--x", x.toString());
        this.tileElement.style.setProperty("--y", y.toString());
    }

    public setValue(value: number): void {
        this.value = value;
        this.tileElement.textContent = value.toString();
        const bgLightness = 100 - Math.log2(value) * 9; // 2 -> 100 - 1*9 -> 91; 2048 -> 100 - 11*9 -> 1
        this.tileElement.style.setProperty("--bg-lightness", `${bgLightness}%`);
        this.tileElement.style.setProperty("--text-lightness", `${bgLightness < 50 ? 90 : 10}%`);
    }

    public removeFromDOM(): void {
        this.tileElement.remove();
    }

    public waitForTransitionEnd(): Promise<void> {
        return new Promise<void>((resolve: () => void) => {
            this.tileElement.addEventListener(
                "transitionend", resolve, { once: true });
        });
    }

    public waitForAnimationEnd(): Promise<void> {
        return new Promise<void>((resolve: () => void) => {
            this.tileElement.addEventListener(
                "animationend", resolve, { once: true });
        });
    }
}