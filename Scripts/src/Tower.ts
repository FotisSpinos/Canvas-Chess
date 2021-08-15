import { Board, BlockPosition } from "../../Board.js";
import { BasePiece } from "../Abstract/BasePiece.js";

export class Tower extends BasePiece {
    private image: HTMLImageElement

    constructor(src: string) {
        super();
        this.image = new Image()
        this.image.src = src
    }

    draw(board: Board, x: number, y: number): void {
        this.drawImage(this.image, board, x, y);
    }

    getValidMoves(board: Board): BlockPosition[] {
        let validMoves: BlockPosition[] = [];
        let pawnPositions = board.getPawnPositions();

        console.log(pawnPositions)

        let currentPosition = board.getValidPiecePosition(this);

        // add top
        for (let i = currentPosition.y - 1; i >= 0; i--) {
            const pos = { x: currentPosition.x, y: i };

            if (pawnPositions.has(JSON.stringify(pos)))
                break;

            validMoves.push(pos)
        }

        // add bottom
        for (let i = currentPosition.y + 1; i < board.resolution; i++) {
            const pos = { x: currentPosition.x, y: i };

            if (pawnPositions.has(JSON.stringify(pos)))
                break;

            validMoves.push(pos)
        }

        // add left
        for (let i = currentPosition.x - 1; i >= 0; i--) {
            const pos = { x: i, y: currentPosition.y };

            console.log(pos)

            if (pawnPositions.has(JSON.stringify(pos)))
                break;

            validMoves.push(pos)
        }

        // add right
        for (let i = currentPosition.x + 1; i < board.resolution; i++) {
            const pos = { x: i, y: currentPosition.y };

            if (pawnPositions.has(JSON.stringify(pos)))
                break;

            validMoves.push(pos)
        }

        return validMoves
    }
}