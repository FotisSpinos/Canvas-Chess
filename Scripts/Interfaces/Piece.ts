import { Board, BoardPosition } from "../src/Board.js";

export interface IPiece {
    getValidMoves(board: Board) : BoardPosition[]
    draw(board: Board, pos: BoardPosition): void
}