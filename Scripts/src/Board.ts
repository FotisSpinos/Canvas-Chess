export type BoardPosition = { x: number, y: number }

export class PieceType {
    public imgPath: string
    public getValidMoves:(piece: Piece, board: Board) => BoardPosition[] 

    constructor(imgPath: string, getValidMoves: (piece: Piece, board: Board) => BoardPosition[]) {
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

    public drawBoard() {
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
                this.ctx.drawImage(image, this.squareSize * pos.x, this.squareSize * pos.y, this.squareSize, this.squareSize)
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

    public getAttackingPieces(piece: Piece): Piece[] {
        let validMoves: BoardPosition[] = piece.pieceType.getValidMoves(piece, this)
        let attackingPieces: Piece[] = []
        
        validMoves.forEach(movePos => {
            let stringPos = JSON.stringify(movePos)
            if(this.pieces.has(stringPos)){
                attackingPieces.push(this.pieces.get(stringPos))
            }
        })

        return attackingPieces;
    }

    public getAttackingPositions(piece: Piece): BoardPosition[] {
        let validMoves: BoardPosition[] = piece.pieceType.getValidMoves(piece, this)
        let attackingPositions: BoardPosition[] = []

        validMoves.forEach(movePos => {
            let stringPos = JSON.stringify(movePos)

            if(this.pieces.has(stringPos)){
                attackingPositions.push(movePos)
            }
        })

        return attackingPositions;
    }

    public highlightAttackingPositions(piece: Piece, color: string): void {
        let attackingPositions = this.getAttackingPositions(piece)
        this.drawblocksWithColor(attackingPositions, color)
    }

    public highlightValidMoves(piece: Piece, color: string) {
        let validMoves = piece.pieceType.getValidMoves(piece, this)
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

export function getTowerMoves(piece: Piece, board: Board): BoardPosition[] {
    
    let validMoves: BoardPosition[] = [];

    let pos = board.getPiecePos(piece)
    let boardSize = board.resolution

    // add top
    for (let i = pos.y - 1; i >= 0; i--) {
        const currentPos = { x: pos.x, y: i };

        if (board.pieces.has(JSON.stringify(currentPos))){
            validMoves.push(currentPos)
            break;
        }

        validMoves.push(currentPos)
    }

    // add bottom
    for (let i = pos.y + 1; i < boardSize; i++) {
        const currentPos = { x: pos.x, y: i };

        if (board.pieces.has(JSON.stringify(currentPos))){
            validMoves.push(currentPos)
            break;
        }

        validMoves.push(currentPos)
    }

    // add left
    for (let i = pos.x - 1; i >= 0; i--) {
        const currentPos = { x: i, y: pos.y };

        if (board.pieces.has(JSON.stringify(currentPos))){
            validMoves.push(currentPos)
            break;
        }

        validMoves.push(currentPos)
    }

    // add right
    for (let i = pos.x + 1; i < boardSize; i++) {
        const currentPos = { x: i, y: pos.y };

        if (board.pieces.has(JSON.stringify(currentPos))){
            validMoves.push(currentPos)
            break;
        }

        validMoves.push(currentPos)
    }

    return validMoves
}