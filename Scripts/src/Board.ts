import { IPiece } from "../Interfaces/Piece.js"

export type BlockPosition = { x: number, y: number }

export class Board {
    private oddColor: string
    private evenColor: string

    public resolution: number
    public squareSize: number
    public ctx: CanvasRenderingContext2D

    private pieces: Map<IPiece, BlockPosition> = new Map<IPiece, BlockPosition>();

    constructor(resolution, size) {
        this.oddColor = 'red'
        this.evenColor = 'blue'
        this.resolution = resolution
        this.squareSize = (size / resolution)
    }

    public setColors(oddColor: string, evenColor: string) {
        this.oddColor = oddColor;
        this.evenColor = evenColor;
    }

    public drawBoard(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;

        for (let y = 0; y < this.resolution; y++) {
            for (let x = 0; x < this.resolution; x++) {
                this.drawBlockWithColor(x, y, this.GetColorForBlock({x, y}))
            }
        }
    }

    public addPiece(piece: IPiece, x: number, y: number) {
        if (!this.isValidBlock(x, y)) {
            throw Error('invalid block')
        }
        piece.draw(this, x, y);
        this.pieces.set(piece, { x, y });
    }

    public drawBlockWithColor(x: number, y: number, color: string) {
        if (this.isValidBlock(x, y)) {
            this.ctx.fillStyle = color
            this.ctx.fillRect(this.squareSize * x, this.squareSize * y, this.squareSize, this.squareSize);
        }
        else {
            throw Error('block is not valid' + x + ' ' + y);
        }
    }

    public drawblocksWithColor(blocks: BlockPosition[], color: string) {
        blocks.forEach(x => {
            this.drawBlockWithColor(x.x, x.y, color);
        })
    }

    public getValidPiecePosition(piece: IPiece): BlockPosition {
        return this.pieces.get(piece);
    }

    public getPawnPositions(): Set<String> {
        let set = new Set<String>();
        this.pieces.forEach(x => set.add(JSON.stringify(x)))

        return set;
    }

    private isValidBlock(x: number, y: number): boolean {
        return (x > -1 && x < this.resolution && y > -1 && y < this.resolution)
    }

    private GetColorForBlock(pos: BlockPosition): string {
        
        let color = ''

        if (pos.y % 2 == 0) {
            if (pos.x % 2 == 0) {
                color = this.evenColor
            }
            else {
                color = this.oddColor
            }
        }
        else {
            if (pos.x % 2 == 0) {
                color = this.oddColor
            }
            else {
                color = this.evenColor
            }
        }
        
        return color;
    }
}