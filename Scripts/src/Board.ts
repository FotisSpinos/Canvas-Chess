import { IPiece } from "../Interfaces/Piece.js"

export type BoardPosition = { x: number, y: number }

export class Board {
    private color1: string
    private color2: string

    public resolution: number
    public squareSize: number
    public ctx: CanvasRenderingContext2D

    private pieces: Map<IPiece, string> = new Map<IPiece, string>();

    constructor(color1: string, color2: string) {
        this.color1 = color1;
        this.color2 = color2;
    }

    public drawBoard(ctx: CanvasRenderingContext2D, resolution: number, size: number): void {
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

    public addPeace(piece: IPiece, x: number, y: number): void {
        if (!this.isValidBlock(x, y)) {
            throw Error('invalid block')
        }
        piece.draw(this, x, y);
        this.pieces.set(piece, JSON.stringify({ x, y }));
    }

    public setColor(x: number, y: number, color: string): void {
        if (this.isValidBlock(x, y)) {
            this.ctx.fillStyle = color
            this.ctx.fillRect(this.squareSize * x, this.squareSize * y, this.squareSize, this.squareSize);
        }
        else {
            throw Error('block is not valid' + x + ' ' + y);
        }
    }

    public setColorToBlocks(blocks: BoardPosition[], color: string): void {
        blocks.forEach(x => {
            this.setColorAtPosisition(x, color);
        })
    }

    public setColorAtPosisition(boardPos: BoardPosition, color: string): void {
        this.setColor(boardPos.x, boardPos.y, color);
    }

    public getValidPiecePosition(piece: IPiece): BoardPosition {
        if (this.pieces.get(piece) != null) {
            return JSON.parse(this.pieces.get(piece))
        }
        throw Error('Piece could not be found')
    }

    public getPieceAtPos(boardPosition: BoardPosition): IPiece {

        let piece: IPiece = null

        this.pieces.forEach((value, key) => {
            let currentPiecePos = this.getValidPiecePosition(key);

            if (JSON.stringify(currentPiecePos) == JSON.stringify(boardPosition))
                piece = key;
        })

        return piece;
    }

    public isPawnPosition(boardPosition: BoardPosition): boolean {
        let set = new Set<string>();

        this.pieces.forEach((x, y) => {
            set.add(x)
        });

        let boardPosString = JSON.stringify(boardPosition);

        return set.has(boardPosString);
    }

    private drawBlockWithColor(x: number, y: number, color: string): void {
        this.ctx.fillStyle = color
        this.ctx.fillRect(this.squareSize * x, this.squareSize * y, this.squareSize, this.squareSize);
    }

    private isValidBlock(x: number, y: number): boolean {
        return (x > -1 && x < this.resolution && y > -1 && y < this.resolution)
    }
}