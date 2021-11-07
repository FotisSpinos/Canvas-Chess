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
        if(resolution < 0){
            throw new Error("Invalid argument, resolution cannot be negative");
        }

        if(size < 0){
            throw new Error("Invalid argument, size cannot be negative");
        }

        if(!ctx){
            throw new Error("Invalid argument, 2D rendering context cannot be undefined");
        }

        this.ctx = ctx
        this.color1 = new Color(118,150,86,1)
        this.color2 = new Color(238,238,210,1)
        this.resolution = resolution
        this.squareSize = (size / resolution)
        this.normalizedPieceSize = 1
    }

    public copy(): Board {
        let copyBoard = new Board(this.resolution, this.squareSize, this.ctx)
        copyBoard.color1 = this.color1
        copyBoard.color2 = this.color2
        copyBoard.squareSize = this.squareSize
        copyBoard.normalizedPieceSize = this.normalizedPieceSize

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
    }

    public drawBoard(): void {
        for (let y = 0; y < this.resolution; y++) {
            for (let x = 0; x < this.resolution; x++) {
                this.drawBlockWithColor({x, y}, this.GetColorForBlock({x, y}))
            }
        }

        this.posToPieceMap.forEach((piece, stringPos) => {
            this.drawPiece(piece, stringPos)
        })
    }

    public drawBlockWithColor(pos: BoardPosition, color: Color = null): void {
        this.throwIfUndefinedColor(color)

        this.throwIfInvalidPos(pos)

        this.ctx.fillStyle = color.getString()
        this.ctx.fillRect(this.squareSize * pos.x, this.squareSize * pos.y, this.squareSize, this.squareSize)
    }

    public drawblocksWithColor(blocks: BoardPosition[], color: Color = null): void {
        blocks.forEach(x => {
            this.drawBlockWithColor(x, color)
        })
    }

    public applyColorToBlock(block: BoardPosition, color: Color): void {

        let blockColor = this.GetColorForBlock(block)
        color = color.combine(blockColor)

        this.drawBlockWithColor(block, color)
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
        if(!color) {
            color = new Color(80, -30, -30, 0)
        }

        let attackingPositions = this.getAttackingPositions(piece)
        this.applyColorToBlocks(attackingPositions, color)
    }

    public highlightValidMoves(piece: Piece, color: Color = null): void {
        if(!color) {
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
        this.throwIfInvalidPos(pos)
        this.throwIfPieceExists(pos)
        
        if(!pieceType) {
            throw new Error("Invalid argument. PieceType should not be undefined");
            
        }

        return this.addPieceUnsafe(pieceType, pos)
    }

    public movePiece(piece: Piece, pos: BoardPosition): void {
        this.throwIfInvalidPos(pos)
        this.throwIfPieceExists(pos)
        let piecePos = this.getPiecePos(piece)

        this.posToPieceMap.delete(JSON.stringify(piecePos))
        this.posToPieceMap.set(JSON.stringify(pos), piece)
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

    public isValidBlock(x: number, y: number): boolean {
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
        let offset = this.squareSize / 2 - scale / 2
        this.ctx.drawImage(piece.pieceType.image,
            this.squareSize * pos.x + offset,
            this.squareSize * pos.y + offset,
            scale,
            scale)
    }

    private addPieceUnsafe(pieceType: PieceType, pos: BoardPosition): Piece {
        let stringPos = JSON.stringify(pos)

        let piece = new Piece(pieceType)
        this.posToPieceMap.set(stringPos, piece)

        return piece
    }

    //===================================================================== Error check functions

    private throwIfInvalidPos(pos: BoardPosition): void {
        if(!pos) {
            throw Error('Invalid position referecen')
        }

        if(!this.isValidBlock(pos.x, pos.y)) {
            throw Error('Invalid board position' + pos.x + ' ' + pos.y)
        }
    }

    private throwIfPieceExists(pos: BoardPosition){
        let stringPos = JSON.stringify(pos)
        if(this.posToPieceMap.has(stringPos)) {
            throw new Error("piece already placed at position. Cannot add piece.");
        }
    }

    private throwIfUndefinedColor(color: Color) {
        if(!color) {
            throw new Error("Invalid argument: color is undefined");
        }
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

export function getBishopMoves(piece: Piece, board: Board): BoardPosition[] {
    let validMoves: BoardPosition[] = [];

    let pos = board.getPiecePos(piece)
    let boardPosToPieces = board.getPosToPieceMap()

    let boardSize = board.resolution - 1
    
    let topLeftCorner = {x: 0, y: 0};
    let topRightCorner = {x: boardSize, y: 0}
    let bottomLeftCorner = {x: 0, y: boardSize}
    let bottomRightCorner = {x: boardSize, y: boardSize}

    let topLeftSteps = Math.min(Math.abs(topLeftCorner.x - pos.x), Math.abs(topLeftCorner.y - pos.y))
    let topRightSteps = Math.min(Math.abs(topRightCorner.x - pos.x), Math.abs(topRightCorner.y - pos.y))
    let bottomLeftSteps = Math.min(Math.abs(bottomLeftCorner.x - pos.x), Math.abs(bottomLeftCorner.y - pos.y))
    let bottomRightSteps = Math.min(Math.abs(bottomRightCorner.x - pos.x), Math.abs(bottomRightCorner.y - pos.y))

    let currentPos = pos;
    // add top left positions
    for(let i = 0; i < topLeftSteps; i++) {
        currentPos = {x: currentPos.x - 1, y: currentPos.y - 1}

        if (boardPosToPieces.has(JSON.stringify(currentPos))) {
            validMoves.push(currentPos)
            break;
        }

        validMoves.push(currentPos)
    }

    currentPos = pos;
    // add top right positions
    for(let i = 0; i < topRightSteps; i++) {
        currentPos = {x: currentPos.x + 1, y: currentPos.y - 1}

        if (boardPosToPieces.has(JSON.stringify(currentPos))) {
            validMoves.push(currentPos)
            break;
        }

        validMoves.push(currentPos)
    }


    currentPos = pos;
    // add bottom left positions
    for(let i = 0; i < bottomLeftSteps; i++) {
        currentPos = {x: currentPos.x - 1, y: currentPos.y + 1}

        if (boardPosToPieces.has(JSON.stringify(currentPos))) {
            validMoves.push(currentPos)
            break;
        }

        validMoves.push(currentPos)
    }

    currentPos = pos;
    // add bottom right positions
    for(let i = 0; i < bottomRightSteps; i++) {
        currentPos = {x: currentPos.x + 1, y: currentPos.y + 1}

        if (boardPosToPieces.has(JSON.stringify(currentPos))) {
            validMoves.push(currentPos)
            break;
        }

        validMoves.push(currentPos)
    }

    return validMoves
}

export function getQueenMoves(piece: Piece, board: Board): BoardPosition[] {
    let validMoves: BoardPosition[] = [];
    return validMoves.concat(getTowerMoves(piece, board), getBishopMoves(piece, board))
}

export function getKnightMoves(piece: Piece, board:Board): BoardPosition[] {
    let pos = board.getPiecePos(piece)

    let leftTopPos = {x: pos.x - 2, y: pos.y - 1}
    let topLeftPos = {x: pos.x - 1, y: pos.y - 2}

    let rightTopPos = {x: pos.x + 2, y: pos.y - 1}
    let topRightPos = {x: pos.x + 1, y: pos.y - 2}

    let leftBottomPos = {x: pos.x - 2, y: pos.y + 1}
    let bottomLeftPos = {x: pos.x - 1, y: pos.y + 2}

    let rightBottomPos = {x: pos.x + 2, y: pos.y + 1}
    let bottomRightPos = {x: pos.x + 1, y: pos.y + 2}

    return getValidPositions(board, 
        [leftTopPos, topLeftPos, rightTopPos, topRightPos, leftBottomPos, bottomLeftPos, rightBottomPos, bottomRightPos])
}

export function getPawnMoves(piece: Piece, board: Board): BoardPosition[] {
    let pos = board.getPiecePos(piece)
    let validMoves: BoardPosition[] = [];
    let boardPosToPieces = board.getPosToPieceMap()

    let upPos = {x: pos.x, y: pos.y - 1}
    let topLeftPos = {x: upPos.x - 1, y: upPos.y} 
    let topRightPos = {x: upPos.x + 1, y: upPos.y}

    if (upPos.y < board.resolution && !boardPosToPieces.has(JSON.stringify(upPos))) {
        validMoves.push(upPos)
    }

    if (boardPosToPieces.has(JSON.stringify(topLeftPos))) {
        validMoves.push(topLeftPos)
    }

    if (boardPosToPieces.has(JSON.stringify(topRightPos))) {
        validMoves.push(topRightPos)
    }

    return validMoves
}

export function getKingMoves(piece: Piece, board: Board): BoardPosition[] {
    let pos = board.getPiecePos(piece)

    let upPos = {x: pos.x, y: pos.y - 1}
    let downPos = {x: pos.x, y: pos.y + 1}
    let rightPos = {x: pos.x + 1, y: pos.y}
    let leftPos = {x: pos.x - 1, y: pos.y}

    let topLeftPos = {x: pos.x - 1, y: pos.y - 1}
    let topRightPos = {x: pos.x + 1, y: pos.y - 1}

    let bottomLeftPos = {x: pos.x - 1, y: pos.y + 1}
    let bottomRightPos = {x: pos.x + 1, y: pos.y + 1}

    return getValidPositions(board, 
        [upPos, downPos, rightPos, leftPos, topLeftPos, topRightPos, bottomLeftPos, bottomRightPos])
}

function getValidPositions(board:Board, positions: BoardPosition[]) :BoardPosition[] {
    let validMoves: BoardPosition[] = [];

    positions.forEach(pos => {
        if(board.isValidBlock(pos.x, pos.y)) {
            validMoves.push(pos)
        }
    });

    return validMoves
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}