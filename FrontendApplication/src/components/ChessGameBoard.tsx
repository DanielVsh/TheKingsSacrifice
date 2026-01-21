import React, {Key, useState} from "react";
import {Piece, PromotionPieceOption, Square} from "react-chessboard/dist/chessboard/types";
import {Chess, Move} from "chess.js";
import {Chessboard} from "react-chessboard";
import {SoundService} from "../services/SoundService.ts";
import {useBoardSize} from "../hooks/useBoardSize.ts";

type SquareOptions = {
  background: string;
  borderRadius: string;
};

type SquareMap = { [squareName: string]: SquareOptions };

interface ChessGameBoardProps {
  game: Chess;
  fen?: string;
  onUserMove: (fen: string) => void;
  boardOrientation: 'white' | 'black'
  canPlayerMove: boolean
  key?: Key
}
export const ChessGameBoard: React.FC<ChessGameBoardProps> = (props) => {
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [moveTo, setMoveTo] = useState<Square | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState<boolean>(false);
  const [rightClickedSquares, setRightClickedSquares] = useState<any>({});
  const [optionSquares, setOptionSquares] = useState<SquareMap>({});

  const onPieceDrop = (sourceSquare: Square, targetSquare: Square, piece: Piece) => {
    if (props.game.turn() !== piece.charAt(0)) return false
    if (!props.canPlayerMove) return false

    if (props.game.moves({square: sourceSquare, verbose: true}).map(value => value.to).includes(targetSquare)) {
      props.game.move({from: sourceSquare, to: targetSquare})
      props.onUserMove(props.game.fen())
      setOptionSquares({})
      return true;
    }

    return false;
  }

  function onSquareClick(square: Square) {
    setRightClickedSquares({});

    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    if (!moveTo) {
      const moves: Move[] = props.game.moves({
        square: moveFrom,
        verbose: true,
      });
      const foundMove: Move | undefined = moves.find(
        (m) => m.from === moveFrom && m.to === square
      );

      if (!foundMove) {
        const hasMoveOptions = getMoveOptions(square);
        setMoveFrom(hasMoveOptions ? square : null);
        return;
      }

      setMoveTo(square);

      if (
        (foundMove.color === "w" &&
          foundMove.piece === "p" &&
          square[1] === "8") ||
        (foundMove.color === "b" &&
          foundMove.piece === "p" &&
          square[1] === "1")
      ) {
        setShowPromotionDialog(true);
        return;
      }

      const move = props.game.move({
        from: moveFrom,
        to: square,
        promotion: "q",
      });

      if (move === null) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) setMoveFrom(square);
        return;
      }

      props.onUserMove(props.game.fen())

      setMoveFrom(null);
      setMoveTo(null);
      setOptionSquares({});

      SoundService.play("move")

      return;
    }
  }

  const onPieceDragBegin = (_piece: Piece, sourceSquare: Square) => {
    getMoveOptions(sourceSquare)

    return true;
  };

  function onSquareRightClick(square: Square) {
    const colour = "rgba(0, 0, 255, 0.4)";
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] &&
        rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : {backgroundColor: colour},
    });
  }

  const getMoveOptions = (square: Square) => {
    if (!props.canPlayerMove) return false
    const moves = props.game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: SquareMap = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          props.game.get(move.to) &&
          props.game.get(move.to)?.color !== props.game.get(square)?.color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });
    newSquares[square] = {
      borderRadius: "",
      background: "rgba(255, 255, 0, 0.4)"
    };
    setOptionSquares(newSquares);
    return true;
  }

  function onPromotionPieceSelect(piece?: PromotionPieceOption) {
    if (piece && moveFrom && moveTo) {
      const promotionPiece = piece[1]?.toLowerCase() ?? "q";

      props.game.move({
        from: moveFrom,
        to: moveTo,
        promotion: promotionPiece,
      });
      props.onUserMove(props.game.fen())
    }
    setMoveFrom(null);
    setMoveTo(null);
    setShowPromotionDialog(false);
    setOptionSquares({});
    return true;
  }

  const boardWidth = useBoardSize();
  return (
    <>
      <div className={'flex justify-center items-center'}>
        <Chessboard id={"GameBoard"}
                    key={props.key}
                    boardOrientation={props.boardOrientation}
                    position={props.fen ?? props.game.fen()}
                    boardWidth={boardWidth}
                    arePremovesAllowed={true}
                    onPieceDrop={onPieceDrop}
                    onPieceDragBegin={onPieceDragBegin}
                    onSquareClick={onSquareClick}
                    onSquareRightClick={onSquareRightClick}
                    onPromotionPieceSelect={onPromotionPieceSelect}
                    customBoardStyle={{
                      borderRadius: "4px",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                    }}
                    customSquareStyles={{
                      ...optionSquares,
                      ...rightClickedSquares,
                    }}
                    promotionToSquare={moveTo}
                    showPromotionDialog={showPromotionDialog}
                    customDarkSquareStyle={{
                      backgroundColor: "#757575"
                    }}
                    customLightSquareStyle={{
                      backgroundColor: "#FCFCFC"
                    }}
        />
      </div>
    </>
  );
};


