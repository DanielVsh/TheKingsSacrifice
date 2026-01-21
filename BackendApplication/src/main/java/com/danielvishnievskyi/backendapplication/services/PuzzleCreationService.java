package com.danielvishnievskyi.backendapplication.services;

import com.danielvishnievskyi.backendapplication.model.entities.GameEntity;
import com.danielvishnievskyi.backendapplication.model.entities.ProcessedPuzzleGamesEntity;
import com.danielvishnievskyi.backendapplication.model.entities.PuzzleEntity;
import com.danielvishnievskyi.backendapplication.model.enums.PuzzleTheme;
import com.danielvishnievskyi.backendapplication.repositories.PuzzleRepository;
import com.danielvishnievskyi.backendapplication.stockfish.StockfishEngine;
import com.danielvishnievskyi.backendapplication.repositories.GameRepository;
import com.danielvishnievskyi.backendapplication.repositories.ProcessedGamePuzzleRepository;
import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.Piece;
import com.github.bhlangonijr.chesslib.Side;
import com.github.bhlangonijr.chesslib.Square;
import com.github.bhlangonijr.chesslib.move.Move;
import com.github.bhlangonijr.chesslib.move.MoveGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PuzzleCreationService {

  private final StockfishEngine engine;
  private final PuzzleRepository puzzleRepo;
  private final GameRepository gameRepo;
  private final ProcessedGamePuzzleRepository processedRepo;

  private static final int DEPTH = 20;
  private static final double MIN_EVAL_GAP = 2.0;

  public void processFinishedGames() {
    gameRepo.getAllEndedGames().forEach(this::processGame);
  }

  private void processGame(GameEntity game) {
    if (processedRepo.existsByGame(game)) return;

    List<String> history = game.getHistory();
    for (String s : history) {
      tryCreatePuzzle(s);
    }

    processedRepo.save(new ProcessedPuzzleGamesEntity(game));
  }

  private void tryCreatePuzzle(String fen) {
    if (!isValidFen(fen)) return;
    if (puzzleRepo.existsByFen(fen)) return;

    var analysis = engine.analyze(fen, DEPTH);
    if (analysis == null) return;

    if (!isClearlyWinning(analysis)) return;
    if (!hasSingleBestMove(fen, analysis)) return;

    List<String> solution = extractMeaningfulSolution(analysis);
    if (solution.size() < 2 || solution.size() > 6) return;

    PuzzleEntity puzzle = new PuzzleEntity();
    puzzle.setFen(fen);
    puzzle.setSolutionMoves(solution);
    puzzle.setEvaluation(analysis.evaluation);
    puzzle.setSideToMove(sideToMove(fen));
    puzzle.setMovesToSolve(solution.size() / 2);
    puzzle.setTheme(detectTheme(analysis));
    puzzle.setDifficulty(calculateDifficulty(analysis));
    puzzle.setCreatedAt(LocalDateTime.now());

    puzzleRepo.save(puzzle);
  }

  private List<String> extractMeaningfulSolution(StockfishEngine.AnalysisResult analysis) {
    List<String> meaningful = new ArrayList<>();
    Board board = new Board();
    board.loadFromFen(analysis.fen);

    int count = 0;
    for (String uciMove : analysis.principalVariation) {
      if (count >= 6) break;

      Move move = createMoveFromUci(board, uciMove);
      board.doMove(move);

      // decisive moves: mate, capture, promotion
      boolean decisive = board.isMated() || move.getPromotion() != Piece.NONE
        || board.getPiece(move.getTo()) != Piece.NONE
        || (analysis.evaluation != null && Math.abs(analysis.evaluation) >= 1.0);

      if (!decisive) break; // stop at non-meaningful move

      meaningful.add(uciMove);
      count++;
    }
    return meaningful;
  }
  // ===================== LOGIC =====================

  private boolean isClearlyWinning(StockfishEngine.AnalysisResult a) {
    if (a.isMate()) return Math.abs(a.mateIn) <= 3;
    return a.evaluation != null && Math.abs(a.evaluation) >= 4.5;
  }

  private boolean hasSingleBestMove(String fen, StockfishEngine.AnalysisResult best) {
    Board board = new Board();
    board.loadFromFen(fen);

    boolean bestIsMate = best.isMate();
    double bestEval = bestIsMate ? 0.0 : Math.abs(best.evaluation);

    int tested = 0;

    for (Move m : MoveGenerator.generateLegalMoves(board)) {
      if (tested++ >= 3) break;

      String uci = toUci(m);
      if (uci.equals(best.bestMove)) continue;

      board.doMove(m);
      var alt = engine.analyze(board.getFen(), 16);
      board.undoMove();

      if (alt == null) continue;

      // ================= MATE LOGIC =================
      if (bestIsMate) {
        // If alternative also mates nearly as fast → not unique
        if (alt.isMate()) {
          int bestMate = Math.abs(best.mateIn);
          int altMate = Math.abs(alt.mateIn);

          if (altMate <= bestMate + 1) {
            return false;
          }
        }
        continue;
      }

      // ================= EVAL LOGIC =================
      if (alt.evaluation == null) {
        // alternative leads to mate or unclear → acceptable
        continue;
      }

      double altEval = Math.abs(alt.evaluation);

      if (bestEval - altEval < MIN_EVAL_GAP) {
        return false;
      }
    }
    return true;
  }


  private List<String> extractSolution(StockfishEngine.AnalysisResult a) {
    return a.principalVariation.stream()
      .limit(6)
      .toList();
  }

  private PuzzleTheme detectTheme(StockfishEngine.AnalysisResult analysis) {
    // copy the starting position
    Board board = new Board();
    board.loadFromFen(analysis.fen);

    List<String> solution = analysis.principalVariation;
    if (solution.isEmpty()) return PuzzleTheme.ADVANTAGE;

    // Play the first move on a temp board
    Board temp = new Board();
    temp.loadFromFen(board.getFen());

    String firstMove = solution.get(0);
    Move move = createMoveFromUci(temp, firstMove);
    temp.doMove(move);

    // ===================== MATE =====================
    if (analysis.isMate()) {
      int mateIn = Math.abs(analysis.mateIn);
      if (mateIn == 1) return PuzzleTheme.MATE_IN_ONE;
      if (mateIn == 2) return PuzzleTheme.MATE_IN_TWO;
      return PuzzleTheme.MATE_IN_THREE;
    }

    // ===================== PROMOTION =====================
    if (move.getPromotion() != Piece.NONE) return PuzzleTheme.PROMOTION;

    // ===================== FORK =====================
    if (createsFork(temp, temp.getSideToMove().flip())) return PuzzleTheme.FORK;

    // ===================== DISCOVERED ATTACK =====================
    if (createsDiscovered(temp, temp.getSideToMove().flip())) return PuzzleTheme.DISCOVERED_ATTACK;

    // ===================== PIN / SKEWER (simplified) =====================
    if (createsPinOrSkewer(temp, temp.getSideToMove().flip())) {
      return PuzzleTheme.PIN; // you can differentiate pin/skewer later
    }

    return PuzzleTheme.ADVANTAGE;
  }

  private Move createMoveFromUci(Board board, String uci) {
    Square from = Square.fromValue(uci.substring(0, 2).toUpperCase());
    Square to = Square.fromValue(uci.substring(2, 4).toUpperCase());
    Piece promotion = Piece.NONE;
    if (uci.length() == 5) {
      promotion = switch (uci.charAt(4)) {
        case 'q', 'Q' -> Piece.WHITE_QUEEN;
        case 'r', 'R' -> Piece.WHITE_ROOK;
        case 'b', 'B' -> Piece.WHITE_BISHOP;
        case 'n', 'N' -> Piece.WHITE_KNIGHT;
        default -> Piece.NONE;
      };
    }
    return new Move(from, to, promotion);
  }

  // ===================== FORK DETECTION =====================
  private boolean createsFork(Board board, Side defender) {
    int attacked = 0;
    for (Square sq : Square.values()) {
      if (board.getPiece(sq).getPieceSide() == defender) {
        // opponent piece attacked by side to move
        for (Move m : MoveGenerator.generateLegalMoves(board)) {
          if (m.getTo() == sq) attacked++;
          if (attacked >= 2) return true; // fork detected
        }
      }
    }
    return false;
  }

  // ===================== DISCOVERED ATTACK =====================
  private boolean createsDiscovered(Board board, Side defender) {
    // simplified: if any legal move exposes an attack to opponent piece
    for (Move m : MoveGenerator.generateLegalMoves(board)) {
      board.doMove(m);
      if (countAttackedPieces(board, defender) >= 1) {
        board.undoMove();
        return true;
      }
      board.undoMove();
    }
    return false;
  }

  private int countAttackedPieces(Board board, Side side) {
    int count = 0;
    for (Square sq : Square.values()) {
      if (board.getPiece(sq).getPieceSide() == side) {
        for (Move m : MoveGenerator.generateLegalMoves(board)) {
          if (m.getTo() == sq) count++;
        }
      }
    }
    return count;
  }

  // ===================== PIN / SKEWER (simplified) =====================
  private boolean createsPinOrSkewer(Board board, Side defender) {
    // very simplified: if after any move, a high-value piece is attacked along a line
    for (Move m : MoveGenerator.generateLegalMoves(board)) {
      board.doMove(m);
      for (Square sq : Square.values()) {
        Piece p = board.getPiece(sq);
        if (p != Piece.NONE && p.getPieceSide() == defender &&
          (p.getPieceType().getSanSymbol().equals(Piece.WHITE_QUEEN.getFenSymbol()))) {
          // check if attacked
          for (Move attack : MoveGenerator.generateLegalMoves(board)) {
            if (attack.getTo() == sq) {
              board.undoMove();
              return true;
            }
          }
        }
      }
      board.undoMove();
    }
    return false;
  }


  private int calculateDifficulty(StockfishEngine.AnalysisResult a) {
    if (a.isMate()) return Math.min(3, Math.abs(a.mateIn));
    if (Math.abs(a.evaluation) > 10) return 2;
    return 3;
  }

  // ===================== HELPERS =====================

  private boolean isValidFen(String fen) {
    try {
      new Board().loadFromFen(fen);
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  private String sideToMove(String fen) {
    return fen.split(" ")[1].equals("w") ? "white" : "black";
  }

  private String toUci(Move m) {
    String uci = m.getFrom().toString().toLowerCase() + m.getTo().toString().toLowerCase();
    if (m.getPromotion() != Piece.NONE) {
      uci += m.getPromotion().getFenSymbol().toLowerCase();
    }
    return uci;
  }
}
