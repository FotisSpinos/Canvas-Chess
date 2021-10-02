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

    public getPieces(): IPiece[]
    {
        let pieces : IPiece[] = [];

        this.pieces.forEach((pos, piece) => {
            pieces.push(piece);
        });

        return pieces;
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

    public drawPeaces() {
        this.pieces.forEach((value, key) => {
            let piece: IPiece = key
            let piecePos: BoardPosition = JSON.parse(value);
            piece.draw(this, piecePos);
        })
    }

    public addPeace(piece: IPiece, pos: BoardPosition): void {
        if (!this.isValidBoardPosition(pos)) {
            throw Error('invalid block')
        }
        this.pieces.set(piece, JSON.stringify(pos));
    }

    public setColor(pos: BoardPosition, color: string): void {
        if (this.isValidBoardPosition(pos)) {
            this.ctx.fillStyle = color
            this.ctx.fillRect(this.squareSize * pos.x, this.squareSize * pos.y, this.squareSize, this.squareSize);
        }
        else {
            throw Error('block is not valid' + pos.x + ' ' + pos.y);
        }
    }

    public setColorToBlocks(blocks: BoardPosition[], color: string): void {
        blocks.forEach(x => {
            this.setColorAtPosisition(x, color);
        })
    }

    public setColorAtPosisition(pos: BoardPosition, color: string): void {
        this.setColor(pos, color);
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

    public deepCopy(): Board {
        let board = new Board(this.color1, this.color2);
        board.color1 = this.color1;
        board.color2 = this.color2;
        board.ctx = this.ctx;
        board.resolution = this.resolution;
        board.squareSize = this.squareSize;

        // copy pieces
        let pieces = new Map<IPiece, string>();
        this.pieces.forEach((value, key) => {
            pieces.set(key, value);
        })
        board.pieces = pieces

        return board;
    }

    public movePieceAtEmptyBoardPos(piece: IPiece, boardPosition: BoardPosition): boolean {
        let isValidPos = this.isValidBoardPosition(boardPosition);
        let pieceExistsAtPos = this.isPawnPosition(boardPosition);
        let canMove = isValidPos && pieceExistsAtPos;


        if (canMove) {
            let isAdded = this.pieces.has(piece);

            if (!isAdded) {
                this.addPeace(piece, boardPosition);
            }
            else {
                this.pieces.delete(piece);
                this.addPeace(piece, boardPosition)
            }
        }

        return canMove;
    }

    private drawBlockWithColor(x: number, y: number, color: string): void {
        this.ctx.fillStyle = color
        this.ctx.fillRect(this.squareSize * x, this.squareSize * y, this.squareSize, this.squareSize);
    }

    private isValidBoardPosition(pos: BoardPosition): boolean {
        return (pos.x > -1 && pos.x < this.resolution && pos.y > -1 && pos.y < this.resolution)
    }
}