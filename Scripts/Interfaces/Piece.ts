import { Board, BlockPosition } from "../../Board.js";

export interface IPiece {
    getValidMoves(board: Board) : BlockPosition[]
    draw(board: Board, x: number, y: number): void
}