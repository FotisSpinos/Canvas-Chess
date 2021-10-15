export type BoardPosition = { x: number, y: number }

export class PieceType {
    public imgPath: string
    public getValidMoves:(pos: BoardPosition, boardSize: number, piecePositions: Set<BoardPosition>) => BoardPosition[] 

    constructor(imgPath: string, getValidMoves: (pos: BoardPosition, boardSize: number, piecePositions: Set<BoardPosition>) => BoardPosition[]) {
        this.imgPath = imgPath
        this.getValidMoves = getValidMoves
    }
}

export class Piece {
    public pieceType: PieceType

    constructor(pieceType: PieceType) {
        this.pieceType = pieceType
    }
}

export class Board {
    public resolution: number
    public squareSize: number
    public ctx: CanvasRenderingContext2D
    public pieces: Map<string, Piece> = new Map<string, Piece>()
    
    private color1: string
    private color2: string

    constructor(resolution, size, ctx) {
        this.ctx = ctx
        this.color1 = 'red'
        this.color2 = 'blue'
        this.resolution = resolution
        this.squareSize = (size / resolution)
    }

    public drawBoard(ctx: CanvasRenderingContext2D) {
        for (let y = 0; y < this.resolution; y++) {
            for (let x = 0; x < this.resolution; x++) {
                this.drawBlockWithColor(x, y, this.GetColorForBlock({x, y}))
            }
        }

        this.pieces.forEach((piece, stringPos) => {
            let pos: BoardPosition = JSON.parse(stringPos)
            let image = new Image()
            image.src = piece.pieceType.imgPath

            image.onload = () => {
                ctx.drawImage(image, this.squareSize * pos.x, this.squareSize * pos.y, this.squareSize, this.squareSize)
            }
        })
    }

    public setColors(oddColor: string, evenColor: string) {
        this.color1 = oddColor
        this.color2 = evenColor
    }

    public drawBlockWithColor(x: number, y: number, color: string) {
        if (this.isValidBlock(x, y)) {
            this.ctx.fillStyle = color
            this.ctx.fillRect(this.squareSize * x, this.squareSize * y, this.squareSize, this.squareSize)
        }
        else {
            throw Error('block is not valid' + x + ' ' + y)
        }
    }

    public drawblocksWithColor(blocks: BoardPosition[], color: string) {
        blocks.forEach(x => {
            this.drawBlockWithColor(x.x, x.y, color)
        })
    }

    public addPiece(pieceType: PieceType, pos: BoardPosition): Piece {
        let stringPos = JSON.stringify(pos)
        if(this.pieces.has(stringPos)) {
            throw new Error("piece already placed at position. Cannot add piece.");
        }
        let piece = new Piece(pieceType)
        this.pieces.set(stringPos, piece)

        return piece;
    }

    public movePiece(piece: Piece, pos: BoardPosition): boolean {

        let boardPositions = this.pieces.keys()

        for(let i = 0; i < this.pieces.size; i++) {
            let currentStringPos = boardPositions.next().value
            let currentPiece = this.pieces.get(currentStringPos)

            if(currentPiece == piece) {
                this.pieces.delete(currentStringPos)

                this.pieces.set(JSON.stringify(pos), piece)
                return true
            }
        }
        return false
    }

    public getPieceAtPos(pos: BoardPosition): Piece {
        let stringPos = JSON.stringify(pos)
        return this.pieces.get(stringPos)
    }

    public getPiecePos(piece: Piece): BoardPosition {
        let boardPos = null;
        this.pieces.forEach((currentPiece, currentStringPos) => {
            if(currentPiece == piece){
                boardPos = JSON.parse(currentStringPos)
            }
        })
        return boardPos;
    }

    public highlightValidMoves(piece: Piece, color: string) {
        let piecePos = this.getPiecePos(piece)
        let piecePositions = new Set<BoardPosition>()

        this.pieces.forEach((currentPiece, currentStringPos) => {
            piecePositions.add(JSON.parse(currentStringPos))
        })

        let validMoves = piece.pieceType.getValidMoves(piecePos, this.resolution, piecePositions)

        this.drawblocksWithColor(validMoves, color)
    }

    private isValidBlock(x: number, y: number): boolean {
        return (x > -1 && x < this.resolution && y > -1 && y < this.resolution)
    }

    private GetColorForBlock(pos: BoardPosition): string {
        
        let color = ''

        if (pos.y % 2 == 0) {
            if (pos.x % 2 == 0) {
                color = this.color2
            }
            else {
                color = this.color1
            }
        }
        else {
            if (pos.x % 2 == 0) {
                color = this.color1
            }
            else {
                color = this.color2
            }
        }
        
        return color
    }
}

export function getTowerMoves(pos: BoardPosition, boardSize: number, piecePositions: Set<BoardPosition>): BoardPosition[] {
    
    let validMoves: BoardPosition[] = [];
    let stringPiecePositions = new Set<string>() 

    piecePositions.forEach(pos => {
        stringPiecePositions.add(JSON.stringify(pos))
    })

    // add top
    for (let i = pos.y - 1; i >= 0; i--) {
        const currentPos = { x: pos.x, y: i };

        if (stringPiecePositions.has(JSON.stringify(currentPos)))
            break;

        validMoves.push(currentPos)
    }

    // add bottom
    for (let i = pos.y + 1; i < boardSize; i++) {
        const currentPos = { x: pos.x, y: i };

        if (stringPiecePositions.has(JSON.stringify(currentPos)))
            break;

        validMoves.push(currentPos)
    }

    // add left
    for (let i = pos.x - 1; i >= 0; i--) {
        const currentPos = { x: i, y: pos.y };

        if (stringPiecePositions.has(JSON.stringify(currentPos)))
            break;

        validMoves.push(currentPos)
    }

    // add right
    for (let i = pos.x + 1; i < boardSize; i++) {
        const currentPos = { x: i, y: pos.y };

        if (stringPiecePositions.has(JSON.stringify(currentPos)))
            break;

        validMoves.push(currentPos)
    }

    return validMoves
}