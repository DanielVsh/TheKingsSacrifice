import React, {Key, useEffect, useState} from "react";
import {Arrow, CustomSquareStyles, Piece, PromotionPieceOption, Square} from "react-chessboard/dist/chessboard/types";
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
  onUserMove: (move: { from: string; to: string; promotion?: string }) => void;
  boardOrientation: 'white' | 'black'
  canPlayerMove: boolean
  key?: Key
  customArrows?: Arrow[]
  customSquareStyles?: CustomSquareStyles
}

export const ChessGameBoard: React.FC<ChessGameBoardProps> = (props) => {
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [moveTo, setMoveTo] = useState<Square | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState<boolean>(false);
  const [rightClickedSquares, setRightClickedSquares] = useState<any>({});
  const [optionSquares, setOptionSquares] = useState<SquareMap>({});

  const [internalGame] = useState(() => {
    const g = new Chess();
    g.loadPgn(props.game.pgn());
    return g;
  });

  // sync when parent game changes
  useEffect(() => {
    internalGame.loadPgn(props.game.pgn());
  }, [props.game]);

  const onPieceDrop = (sourceSquare: Square, targetSquare: Square, piece: Piece) => {
    if (internalGame.turn() !== piece.charAt(0)) return false
    if (!props.canPlayerMove) return false

    const move = internalGame.move({from: sourceSquare, to: targetSquare})
    if (!move) return false

    props.onUserMove({from: sourceSquare, to: targetSquare})
    setOptionSquares({})
    return true;
  }

  function onSquareClick(square: Square) {
    setRightClickedSquares({});

    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    if (!moveTo) {
      const moves: Move[] = internalGame.moves({
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

      const move = internalGame.move({
        from: moveFrom,
        to: square,
      });

      if (move === null) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) setMoveFrom(square);
        return;
      }

      props.onUserMove({from: moveFrom, to: square})

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
    const moves = internalGame.moves({
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
          internalGame.get(move.to) &&
          internalGame.get(move.to)?.color !== internalGame.get(square)?.color
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

      // internalGame.move({
      //   from: moveFrom,
      //   to: moveTo,
      //   promotion: promotionPiece,
      // });
      props.onUserMove({from: moveFrom, to: moveTo, promotion: promotionPiece});
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
                    position={props.fen ?? internalGame.fen()}
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
                    customSquareStyles={
                      {
                        ...rightClickedSquares,
                        ...props.customSquareStyles,
                        ...optionSquares,
                      }
                    }
                    promotionToSquare={moveTo}
                    showPromotionDialog={showPromotionDialog}
                    customDarkSquareStyle={{
                      backgroundColor: "#757575"
                    }}
                    customLightSquareStyle={{
                      backgroundColor: "#FCFCFC"
                    }}
                    customArrows={props.customArrows}
        />
      </div>
    </>
  );
};


