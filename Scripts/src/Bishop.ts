import { Board, BoardPosition } from "./Board.js";
import { BasePiece } from "../Abstract/BasePiece.js";

export class Tower extends BasePiece {
    private image: HTMLImageElement

    constructor(src: string) {
        super();
        this.image = new Image()
        this.image.src = src
    }

    draw(board: Board, pos: BoardPosition): void {
        this.drawImage(this.image, board, pos.x, pos.y);
    }

    getValidMoves(board: Board): BoardPosition[] {
        let validMoves: BoardPosition[] = [];

        return validMoves
    }
}