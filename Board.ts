function copyPiece(piece: Piece) : Piece {
    let copyPiece = new Piece(piece.pieceType)
    return copyPiece
}

export type BoardPosition = { x: number, y: number }

export class PieceType {
    public image: HTMLImageElement
    public getValidMoves:(piece: Piece, board: Board) => BoardPosition[] 

    constructor(image: HTMLImageElement, getValidMoves: (piece: Piece, board: Board) => BoardPosition[]) {
        this.image = image
        this.getValidMoves = getValidMoves
    }
}

export class Piece {
    public pieceType: PieceType

    constructor(pieceType: PieceType) {
        this.pieceType = pieceType
    }
}

export class Color {
    public r: number;
    public g: number;
    public b: number;
    public a: number;

    constructor(r: number, g: number, b: number, a:number) {
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }

    combine(color: Color): Color {
        let r = Math.min(this.r + color.r, 255)
        let g = Math.min(this.g + color.g, 255)
        let b = Math.min(this.b + color.b, 255)
        let a = Math.min(this.a + color.a, 255)

        return new Color(r,g,b,a)
    }

    getString(): string {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`
    }
}

export class Board {
    public resolution: number
    public squareSize: number
    public ctx: CanvasRenderingContext2D

    private posToPieceMap: Map<string, Piece> = new Map<string, Piece>()
    private color1: Color
    private color2: Color

    private normalizedPieceSize: number

    //===================================================================== Board construction
    constructor(resolution, size, ctx) {
        this.ctx = ctx
        this.color1 = new Color(118,150,86,1)
        this.color2 = new Color(238,238,210,1)
        this.resolution = resolution
        this.squareSize = (size / resolution)
        this.normalizedPieceSize = 0.5
    }

    public copy(): Board {
        let copyBoard = new Board(this.resolution, this.squareSize, this.ctx)
        copyBoard.color1 = this.color1
        copyBoard.color2 = this.color2
        copyBoard.squareSize = this.squareSize

        let copyPosToPieceMap = new Map<string, Piece>()

        this.posToPieceMap.forEach((piece, stringPos) => {
            let newPiece = copyPiece(piece)
            copyPosToPieceMap.set(stringPos, newPiece)
        })
        
        copyBoard.posToPieceMap = copyPosToPieceMap

        return copyBoard
    }

    //===================================================================== Draw

    public setNormalizedPieceSize(pieceSize: number): void {
        this.normalizedPieceSize = clamp(pieceSize, 0, 1)
        console.log('set number:', this.normalizedPieceSize)
    }

    public drawBoard(): void {
        for (let y = 0; y < this.resolution; y++) {
            for (let x = 0; x < this.resolution; x++) {
                this.drawBlockWithColor(x, y, this.GetColorForBlock({x, y}))
            }
        }

        this.posToPieceMap.forEach((piece, stringPos) => {
            this.drawPiece(piece, stringPos)
        })
    }

    public drawBlockWithColor(x: number, y: number, color: Color): void {
        if (this.isValidBlock(x, y)) {
            this.ctx.fillStyle = color.getString()
            this.ctx.fillRect(this.squareSize * x, this.squareSize * y, this.squareSize, this.squareSize)
        }
        else {
            throw Error('block is not valid' + x + ' ' + y)
        }
    }

    public drawblocksWithColor(blocks: BoardPosition[], color: Color): void {
        blocks.forEach(x => {
            this.drawBlockWithColor(x.x, x.y, color)
        })
    }

    public applyColorToBlock(block: BoardPosition, color: Color): void {
        let blockColor = this.GetColorForBlock(block)
        color = color.combine(blockColor)

        this.drawBlockWithColor(block.x, block.y, color)
    }

    public applyColorToBlocks(blocks: BoardPosition[], color: Color): void {
        blocks.forEach((pos) => {
            this.applyColorToBlock(pos, color)
        })
    }

    public setColors(oddColor: Color, evenColor: Color): void {
        this.color1 = oddColor
        this.color2 = evenColor
    }

    public highlightAttackingPositions(piece: Piece, color: Color = null): void {
        if(color == null) {
            color = new Color(80, -30, -30, 0)
        }

        let attackingPositions = this.getAttackingPositions(piece)
        this.applyColorToBlocks(attackingPositions, color)
    }

    public highlightValidMoves(piece: Piece, color: Color = null): void {
        if(color == null) {
            color = new Color(40, 10, -50, 0)
        }

        let validMoves = piece.pieceType.getValidMoves(piece, this)
        this.applyColorToBlocks(validMoves, color)
    }

    //===================================================================== Board and pieces
    public getEmptyPositions(): BoardPosition[] {
        let emptyBoardPositions: BoardPosition[] = []

        for(let x = 0; x < this.resolution; x++) {
            for(let y = 0; y < this.resolution; y++) {
                let pos = {x: x, y: y}
                let stringPos = JSON.stringify(pos)
                if(!this.posToPieceMap.has(stringPos)) {
                    emptyBoardPositions.push(pos)
                }
            }
        }
        return emptyBoardPositions
    }

    public addPiece(pieceType: PieceType, pos: BoardPosition): Piece {
        let stringPos = JSON.stringify(pos)
        if(this.posToPieceMap.has(stringPos)) {
            throw new Error("piece already placed at position. Cannot add piece.");
        }
        let piece = new Piece(pieceType)
        this.posToPieceMap.set(stringPos, piece)

        return piece;
    }

    public movePiece(piece: Piece, pos: BoardPosition): boolean {
        let isEmptySpace = this.getPieceAtPos(pos) == null 
        let piecePos = this.getPiecePos(piece)

        if(isEmptySpace) {
            this.posToPieceMap.delete(JSON.stringify(piecePos))

            this.posToPieceMap.set(JSON.stringify(pos), piece)
            return true
        }
        return false
    }

    public getPieceAtPos(pos: BoardPosition): Piece {
        let stringPos = JSON.stringify(pos)
        return this.posToPieceMap.get(stringPos)
    }

    public getPiecePos(piece: Piece): BoardPosition {
        let boardPos = null;
        this.posToPieceMap.forEach((currentPiece, currentStringPos) => {
            if(currentPiece == piece) {
                boardPos = JSON.parse(currentStringPos)
            }
        })
        return boardPos;
    }

    public getValidMoves(piece: Piece) {
        piece.pieceType.getValidMoves(piece, this)
    }

    public getAttackingPieces(piece: Piece): Piece[] {
        let validMoves: BoardPosition[] = piece.pieceType.getValidMoves(piece, this)
        let attackingPieces: Piece[] = []
        
        validMoves.forEach(movePos => {
            let stringPos = JSON.stringify(movePos)
            if(this.posToPieceMap.has(stringPos)) {
                attackingPieces.push(this.posToPieceMap.get(stringPos))
            }
        })

        return attackingPieces;
    }

    public getAttackingPositions(piece: Piece): BoardPosition[] {
        let validMoves: BoardPosition[] = piece.pieceType.getValidMoves(piece, this)
        let attackingPositions: BoardPosition[] = []

        validMoves.forEach(movePos => {
            let stringPos = JSON.stringify(movePos)

            if(this.posToPieceMap.has(stringPos)){
                attackingPositions.push(movePos)
            }
        })

        return attackingPositions;
    }

    public getPosToPieceMap(): Map<string, Piece> {
        return this.posToPieceMap;
    }

    public getPieces(): Piece[] {
        let pieces = []
        this.posToPieceMap.forEach(piece => {
            pieces.push(piece)
        })

        return pieces
    }

    private isValidBlock(x: number, y: number): boolean {
        return (x > -1 && x < this.resolution && y > -1 && y < this.resolution)
    }

    private GetColorForBlock(pos: BoardPosition): Color {
        let color: Color;

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

    private drawPiece(piece: Piece, stringPos: string){
        let pos: BoardPosition = JSON.parse(stringPos)
        let scale = this.squareSize * this.normalizedPieceSize

        this.ctx.drawImage(piece.pieceType.image,
            this.squareSize * pos.x + scale / 2,
            this.squareSize * pos.y + scale / 2,
            scale,
            scale)
    }
}

export function getTowerMoves(piece: Piece, board: Board): BoardPosition[] {
    
    let validMoves: BoardPosition[] = [];

    let pos = board.getPiecePos(piece)
    let boardSize = board.resolution
    let boardPosToPieces = board.getPosToPieceMap()

    // add top
    for (let i = pos.y - 1; i >= 0; i--) {
        const currentPos = { x: pos.x, y: i };

        if (boardPosToPieces.has(JSON.stringify(currentPos))){
            validMoves.push(currentPos)
            break;
        }

        validMoves.push(currentPos)
    }

    // add bottom
    for (let i = pos.y + 1; i < boardSize; i++) {
        const currentPos = { x: pos.x, y: i };

        if (boardPosToPieces.has(JSON.stringify(currentPos))){
            validMoves.push(currentPos)
            break;
        }

        validMoves.push(currentPos)
    }

    // add left
    for (let i = pos.x - 1; i >= 0; i--) {
        const currentPos = { x: i, y: pos.y };

        if (boardPosToPieces.has(JSON.stringify(currentPos))){
            validMoves.push(currentPos)
            break;
        }

        validMoves.push(currentPos)
    }

    // add right
    for (let i = pos.x + 1; i < boardSize; i++) {
        const currentPos = { x: i, y: pos.y };

        if (boardPosToPieces.has(JSON.stringify(currentPos))) {
            validMoves.push(currentPos)
            break;
        }

        validMoves.push(currentPos)
    }

    return validMoves
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}