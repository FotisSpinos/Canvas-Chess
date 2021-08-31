import { Board, BoardPosition } from "./Board.js";
import { BasePiece } from "../Abstract/BasePiece.js";
import { IPiece } from "./../Interfaces/Piece.js"

export class Tower extends BasePiece {
    private image: HTMLImageElement

    constructor(src: string) {
        super();
        this.image = new Image()
        this.image.src = src
    }

    public draw(board: Board, x: number, y: number): void {
        this.drawImage(this.image, board, x, y);
    }

    public getAttackingPeace(board: Board): IPiece[] {
        let currentPosition = board.getValidPiecePosition(this);
        let attackingPieces: IPiece[] = []

        // add top
        for (let i = currentPosition.y - 1; i >= 0; i--) {
            const pos = { x: currentPosition.x, y: i };

            if (board.isPawnPosition(pos)) {
                let piece: IPiece = board.getPieceAtPos(pos);
                if (piece != null && piece != this) {
                    attackingPieces.push(piece);
                    break;
                }
            }
        }

        // add bottom
        for (let i = currentPosition.y + 1; i < board.resolution; i++) {
            const pos = { x: currentPosition.x, y: i };

            if (board.isPawnPosition(pos)) {
                let piece: IPiece = board.getPieceAtPos(pos);
                if (piece != null && piece != this) {
                    attackingPieces.push(piece);
                    break;
                }
            }
        }

        // add left
        for (let i = currentPosition.x - 1; i >= 0; i--) {
            const pos = { x: i, y: currentPosition.y };

            if (board.isPawnPosition(pos)) {
                let piece: IPiece = board.getPieceAtPos(pos);
                if (piece != null && piece != this) {
                    attackingPieces.push(piece);
                    break;
                }
            }
        }

        // add right
        for (let i = currentPosition.x + 1; i < board.resolution; i++) {
            const pos = { x: i, y: currentPosition.y };

            if (board.isPawnPosition(pos)) {
                let piece: IPiece = board.getPieceAtPos(pos);
                if (piece != null && piece != this) {
                    attackingPieces.push(piece);
                    break;
                }
            }
        }

        return attackingPieces;
    }

    public getValidMoves(board: Board): BoardPosition[] {
        let validMoves: BoardPosition[] = [];
        let currentPosition = board.getValidPiecePosition(this)

        // add top
        for (let i = currentPosition.y - 1; i >= 0; i--) {
            const pos = { x: currentPosition.x, y: i };

            if (board.isPawnPosition(pos)) {
                validMoves.push(pos)
                break;
            }

            validMoves.push(pos)
        }

        // add bottom
        for (let i = currentPosition.y + 1; i < board.resolution; i++) {
            const pos = { x: currentPosition.x, y: i };

            if (board.isPawnPosition(pos)) {
                validMoves.push(pos)
                break;
            }

            validMoves.push(pos)
        }

        // add left
        for (let i = currentPosition.x - 1; i >= 0; i--) {
            const pos = { x: i, y: currentPosition.y };

            if (board.isPawnPosition(pos)) {
                validMoves.push(pos)
                break;
            }

            validMoves.push(pos)
        }

        // add right
        for (let i = currentPosition.x + 1; i < board.resolution; i++) {
            const pos = { x: i, y: currentPosition.y };

            if (board.isPawnPosition(pos)) {
                validMoves.push(pos)
                break;
            }

            validMoves.push(pos)
        }

        return validMoves
    }
}