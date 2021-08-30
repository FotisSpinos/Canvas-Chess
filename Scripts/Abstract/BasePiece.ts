import { Board, BoardPosition } from "../src/Board.js";
import {IPiece} from "./../Interfaces/Piece.js"

export abstract class BasePiece implements IPiece{
    
    abstract getValidMoves(board: Board): BoardPosition[];

    abstract draw(board: Board, x: number, y: number): void;
    
    protected drawImage(image: HTMLImageElement, board: Board, x: number, y: number): void {
        image.onload = () => {
            board.ctx.drawImage(image, board.squareSize * x, board.squareSize * y, board.squareSize, board.squareSize);
        }
    }
}