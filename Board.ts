
export class Board {
    private color1: string
    private color2: string
    private highlightColor: string
    private squareSize: number
    private resolution: number
    private ctx: CanvasRenderingContext2D

    constructor(color1: string, color2: string) {
        this.color1 = color1;
        this.color2 = color2;
    }

    public draw(ctx: CanvasRenderingContext2D, resolution: number, size: number) {
        this.resolution = resolution
        this.squareSize = (size / resolution)
        this.ctx = ctx;
        
        let color = ''

        for (let y = 0; y < resolution; y++) {
            for (let x = 0; x < resolution; x++) {
                if (y % 2 == 0) {
                    if (x % 2 == 0) {
                        color = this.color1
                    }
                    else {
                        color = this.color2
                    }
                }
                else {
                    if (x % 2 == 0) {
                        color = this.color2
                    }
                    else {
                        color = this.color1
                    }
                }

                this.drawBlockWithColor(x, y, color)
            }
        }
    }

    public setColor(x: number, y: number, color: string) {
        if(x < this.resolution && y < this.resolution && x > -1 && y > -1){
            this.ctx.fillStyle = color
            this.ctx.fillRect(this.squareSize * x, this.squareSize * y, this.squareSize, this.squareSize);
        } 
        else{
            throw Error();
        }
    }

    private drawBlockWithColor(x: number, y: number, color: string){
        this.ctx.fillStyle = color
        this.ctx.fillRect(this.squareSize * x, this.squareSize * y, this.squareSize, this.squareSize);
    } 
}