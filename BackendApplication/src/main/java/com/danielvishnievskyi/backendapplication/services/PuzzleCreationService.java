package com.danielvishnievskyi.backendapplication.services;

import com.danielvishnievskyi.backendapplication.model.entities.GameEntity;
import com.danielvishnievskyi.backendapplication.model.entities.ProcessedPuzzleGamesEntity;
import com.danielvishnievskyi.backendapplication.model.entities.PuzzleEntity;
import com.danielvishnievskyi.backendapplication.model.enums.PuzzleTheme;
import com.danielvishnievskyi.backendapplication.repositories.PuzzleRepository;
import com.danielvishnievskyi.backendapplication.stockfish.StockfishEngine;
import com.danielvishnievskyi.backendapplication.repositories.GameRepository;
import com.danielvishnievskyi.backendapplication.repositories.ProcessedGamePuzzleRepository;
import com.github.bhlangonijr.chesslib.*;
import com.github.bhlangonijr.chesslib.move.Move;
import com.github.bhlangonijr.chesslib.move.MoveGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PuzzleCreationService {

  private final StockfishEngine engine;
  private final PuzzleRepository puzzleRepo;
  private final GameRepository gameRepo;
  private final ProcessedGamePuzzleRepository processedRepo;

  private static final int DEPTH_MAIN = 16;
  private static final int DEPTH_ALT  = 14;

  // After the best move, the position must be this winning (pawns).
  private static final double MIN_EVAL_AFTER_BEST = 5.5;
  // Best move must beat second-best by at least this much.
  private static final double MIN_UNIQUENESS_GAP  = 5.5;
  // How many alternative moves we test.
  private static final int    MAX_ALT_MOVES       = 10;

  // ─────────────────────────────────────────────────────────────────────────

  public void processFinishedGames() {
    log.info("========== STARTING GAME PROCESSING ==========");
    try {
      List<GameEntity> games = gameRepo.getAllEndedGames();
      log.info("Found {} finished games to process", games.size());
      for (int i = 0; i < games.size(); i++) {
        GameEntity game = games.get(i);
        log.info("[{}/{}] Processing game ID: {}", i + 1, games.size(), game.getUuid());
        processGame(game);
      }
      log.info("========== FINISHED ALL GAMES ==========");
    } catch (Exception e) {
      log.error("Critical error in processFinishedGames", e);
    }
  }

  private void processGame(GameEntity game) {
    try {
      if (processedRepo.existsByGame(game)) {
        log.info("Game {} already processed, skipping", game.getUuid());
        return;
      }
      String pgn = game.getPgn();
      if (pgn != null && !pgn.isEmpty()) {
        processPgn(pgn);
      } else {
        List<String> history = game.getHistory();
        if (history != null && !history.isEmpty()) processUciMoves(history);
      }
      processedRepo.save(new ProcessedPuzzleGamesEntity(game));
    } catch (Exception e) {
      log.error("Error processing game {}", game.getUuid(), e);
    }
  }


  public void processPgn(String pgn) {
    String movesSection = pgn
      .replaceAll("\\[.*?\\]\\s*", "")
      .replaceAll("\\{.*?\\}", "")
      .replaceAll("\\(.*?\\)", "")
      .trim();

    Board board = new Board();
    int puzzles = 0;

    for (String token : movesSection.split("\\s+")) {
      if (token.isEmpty()
        || token.matches("\\d+\\.+")
        || token.matches("(1-0|0-1|1/2-1/2|\\*)")) continue;
      try {
        Move move = algebraicToMove(board, token);
        if (move != null && isLegalMove(board, move)) {
          board.doMove(move);
          if (tryCreatePuzzle(board.getFen())) puzzles++;
        }
      } catch (Exception e) {
        log.trace("PGN token error '{}': {}", token, e.getMessage());
      }
    }
    log.info("PGN processing done – {} puzzles created", puzzles);
  }

  private void processUciMoves(List<String> uciMoves) {
    Board board = new Board();
    int puzzles = 0;
    for (String uci : uciMoves) {
      try {
        Move move = createMoveFromUci(board, uci);
        if (move != null && isLegalMove(board, move)) {
          board.doMove(move);
          if (tryCreatePuzzle(board.getFen())) puzzles++;
        }
      } catch (Exception e) {
        log.trace("UCI move error '{}': {}", uci, e.getMessage());
      }
    }
    log.info("UCI processing done – {} puzzles created", puzzles);
  }


  private boolean tryCreatePuzzle(String fen) {
    if (!isValidFen(fen) || puzzleRepo.existsByFen(fen)) return false;

    StockfishEngine.AnalysisResult best = engine.analyze(fen, DEPTH_MAIN);
    if (best == null || best.bestMove == null
      || best.principalVariation == null || best.principalVariation.isEmpty()) return false;

    if (!isWorthyPosition(best)) {
      log.trace("Position not worthy: eval={} mateIn={}", best.evaluation, best.mateIn);
      return false;
    }

    if (!bestMoveIsUnique(fen, best)) {
      log.trace("Best move not unique");
      return false;
    }

    List<String> solution = buildSolution(fen, best);
    if (solution.isEmpty()) {
      log.trace("Empty solution");
      return false;
    }

    Board preBoard = new Board();
    preBoard.loadFromFen(fen);
    PuzzleTheme theme = detectTheme(preBoard, best, solution);

    try {
      PuzzleEntity puzzle = new PuzzleEntity();
      puzzle.setFen(fen);
      puzzle.setSolutionMoves(solution);
      puzzle.setEvaluation(best.evaluation);
      puzzle.setSideToMove(fen.split(" ")[1].equals("w") ? "white" : "black");
      puzzle.setMovesToSolve((solution.size() + 1) / 2);
      puzzle.setTheme(theme);
      puzzle.setDifficulty(calcDifficulty(best, solution));
      puzzle.setCreatedAt(LocalDateTime.now());
      puzzleRepo.save(puzzle);
      log.debug("Puzzle saved – theme={} difficulty={} plies={}", theme, puzzle.getDifficulty(), solution.size());
      return true;
    } catch (Exception e) {
      log.error("Error saving puzzle: {}", e.getMessage(), e);
      return false;
    }
  }


  private boolean isWorthyPosition(StockfishEngine.AnalysisResult a) {
    if (a.isMate()) return Math.abs(a.mateIn) <= 5;
    return a.evaluation != null && Math.abs(a.evaluation) >= MIN_EVAL_AFTER_BEST;
  }

  private boolean bestMoveIsUnique(String fen, StockfishEngine.AnalysisResult best) {
    Board board = new Board();
    board.loadFromFen(fen);

    double bestScore = scoreForAttacker(best);

    int tested = 0;
    for (Move alt : MoveGenerator.generateLegalMoves(board)) {
      if (tested >= MAX_ALT_MOVES) break;
      if (toUci(alt).equals(best.bestMove)) continue;
      tested++;

      board.doMove(alt);
      StockfishEngine.AnalysisResult altResult = engine.analyze(board.getFen(), DEPTH_ALT);
      board.undoMove();

      if (altResult == null) continue;

      // After alt move it's defender's turn, so negate to get attacker's score
      double altScore = -scoreForAttacker(altResult);

      if (bestScore - altScore < MIN_UNIQUENESS_GAP) {
        log.trace("Alt {} scores {:.2f}, best {:.2f}, gap {:.2f} too small",
          toUci(alt), altScore, bestScore, bestScore - altScore);
        return false;
      }
    }
    return true;
  }

  private double scoreForAttacker(StockfishEngine.AnalysisResult r) {
    if (r.isMate()) return r.mateIn > 0 ? 100.0 : -100.0;
    return r.evaluation != null ? r.evaluation : 0.0;
  }

  private List<String> buildSolution(String startFen, StockfishEngine.AnalysisResult analysis) {
    List<String> solution = new ArrayList<>();
    Board board = new Board();
    board.loadFromFen(startFen);

    List<String> pv = analysis.principalVariation;
    int maxPlies = Math.min(9, pv.size());

    for (int i = 0; i < maxPlies; i++) {
      Move move = createMoveFromUci(board, pv.get(i));
      if (move == null || !isLegalMove(board, move)) break;

      board.doMove(move);
      solution.add(pv.get(i));

      if (board.isMated()) break;

      if (i % 2 == 0 && solution.size() >= 2) {
        StockfishEngine.AnalysisResult check = engine.analyze(board.getFen(), DEPTH_ALT);
        if (check != null && !isWorthyPosition(check)) break;
      }
    }

    // Solution must end on attacker's move (odd ply count)
    while (solution.size() % 2 == 0 && !solution.isEmpty()) {
      solution.remove(solution.size() - 1);
      board.undoMove();
    }

    return solution;
  }

  private PuzzleTheme detectTheme(Board pre,
                                  StockfishEngine.AnalysisResult analysis,
                                  List<String> solution) {
    Move first = createMoveFromUci(pre, solution.get(0));
    if (first == null || !isLegalMove(pre, first)) return PuzzleTheme.ADVANTAGE;

    Piece movingPiece  = pre.getPiece(first.getFrom());
    Piece capturedPiece = pre.getPiece(first.getTo());

    if (movingPiece == null || movingPiece == Piece.NONE) return PuzzleTheme.ADVANTAGE;
    Side attackerSide = movingPiece.getPieceSide();
    if (attackerSide == null) return PuzzleTheme.ADVANTAGE;

    Board post = boardAfter(pre, first);

    if (analysis.isMate()) {
      return switch (Math.abs(analysis.mateIn)) {
        case 1  -> PuzzleTheme.MATE_IN_ONE;
        case 2  -> PuzzleTheme.MATE_IN_TWO;
        default -> PuzzleTheme.MATE_IN_THREE;
      };
    }
    if (post != null && post.isMated()) return PuzzleTheme.MATE_IN_ONE;

    if (first.getPromotion() != null && first.getPromotion() != Piece.NONE) {
      return PuzzleTheme.PROMOTION;
    }

    if (movingPiece.getPieceType() == PieceType.PAWN
      && (capturedPiece == null || capturedPiece == Piece.NONE)
      && first.getFrom().getFile() != first.getTo().getFile()) {
      return PuzzleTheme.EN_PASSANT;
    }

    if (post != null && isFork(post, first.getTo(), attackerSide)) {
      return PuzzleTheme.FORK;
    }

    if (post != null && isSkewer(post, first.getTo(), attackerSide)) {
      return PuzzleTheme.SKEWER;
    }

    if (post != null && isPin(post, first.getTo(), attackerSide)) {
      return PuzzleTheme.PIN;
    }

    if (post != null && post.isKingAttacked()) {
      Square enemyKing = post.getKingSquare(attackerSide.flip());
      if (enemyKing != null && !isAttacking(post, first.getTo(), enemyKing)) {
        return PuzzleTheme.DISCOVERED_CHECK;
      }
    }

    if (post != null && post.isMated()) {
      int toRank = first.getTo().getRank().ordinal();
      if (toRank == 0 || toRank == 7) return PuzzleTheme.BACK_RANK;
    }

    if (isRealPiece(capturedPiece) && post != null
      && isDeflection(pre, post, attackerSide)) {
      return PuzzleTheme.DEFLECTION;
    }

    if (isSacrifice(pre, first, movingPiece, capturedPiece, attackerSide)) {
      return PuzzleTheme.SACRIFICE;
    }

    if (isRealPiece(capturedPiece)
      && !isDefendedBy(pre, first.getTo(), capturedPiece.getPieceSide())) {
      return PuzzleTheme.HANGING_PIECE;
    }

    if (isRealPiece(capturedPiece)) {
      return PuzzleTheme.WIN_MATERIAL;
    }

    if (post != null && !post.isKingAttacked()) {
      return PuzzleTheme.QUIET_MOVE;
    }

    return PuzzleTheme.ADVANTAGE;
  }

  private boolean isFork(Board post, Square landing, Side attackerSide) {
    Side defender = attackerSide.flip();
    int attacked = 0;
    for (Square sq : Square.values()) {
      if (sq.equals(landing)) continue;
      Piece p = post.getPiece(sq);
      if (!isPieceSide(p, defender)) continue;
      if (p.getPieceType() == PieceType.PAWN) continue;
      if (isAttacking(post, landing, sq)) {
        if (++attacked >= 2) return true;
      }
    }
    return false;
  }

  private boolean isPin(Board post, Square landing, Side attackerSide) {
    Piece mover = post.getPiece(landing);
    if (!isSlider(mover)) return false;
    Side defender = attackerSide.flip();

    for (Square sq : Square.values()) {
      Piece front = post.getPiece(sq);
      if (!isPieceSide(front, defender) || front.getPieceType() == PieceType.KING) continue;
      if (!isAttacking(post, landing, sq)) continue;

      int[] dir = rayDirection(landing, sq);
      if (dir == null) continue;

      Square behind = stepSquare(sq, dir);
      while (behind != null) {
        Piece backPiece = post.getPiece(behind);
        if (isRealPiece(backPiece)) {
          if (isPieceSide(backPiece, defender) && pieceValue(backPiece) > pieceValue(front))
            return true;
          break;
        }
        behind = stepSquare(behind, dir);
      }
    }
    return false;
  }

  private boolean isSkewer(Board post, Square landing, Side attackerSide) {
    Piece mover = post.getPiece(landing);
    if (!isSlider(mover)) return false;
    Side defender = attackerSide.flip();

    for (Square sq : Square.values()) {
      Piece front = post.getPiece(sq);
      if (!isPieceSide(front, defender)) continue;
      if (front.getPieceType() != PieceType.KING && front.getPieceType() != PieceType.QUEEN) continue;
      if (!isAttacking(post, landing, sq)) continue;

      int[] dir = rayDirection(landing, sq);
      if (dir == null) continue;

      Square behind = stepSquare(sq, dir);
      while (behind != null) {
        Piece backPiece = post.getPiece(behind);
        if (isRealPiece(backPiece)) {
          if (isPieceSide(backPiece, defender)) return true;
          break;
        }
        behind = stepSquare(behind, dir);
      }
    }
    return false;
  }

  private boolean isDeflection(Board pre, Board post, Side attackerSide) {
    Side defender = attackerSide.flip();
    for (Square sq : Square.values()) {
      Piece p = post.getPiece(sq);
      if (!isPieceSide(p, defender) || pieceValue(p) < 3) continue;
      boolean wasSafe   = isDefendedBy(pre, sq, defender);
      boolean nowHanging = !isDefendedBy(post, sq, defender)
        && isAttackedBy(post, sq, attackerSide);
      if (wasSafe && nowHanging) return true;
    }
    return false;
  }

  private boolean isSacrifice(Board pre, Move move, Piece mover, Piece captured, Side attackerSide) {
    if (isRealPiece(captured)) {
      return pieceValue(mover) > pieceValue(captured) + 1;
    }
    // Moving to an attacked square with no capture = positional sacrifice
    return isDefendedBy(pre, move.getTo(), attackerSide.flip());
  }

  private int calcDifficulty(StockfishEngine.AnalysisResult analysis, List<String> solution) {
    if (analysis.isMate()) {
      return Math.abs(analysis.mateIn) <= 1 ? 1 : Math.abs(analysis.mateIn) <= 2 ? 2 : 3;
    }
    double eval = Math.abs(analysis.evaluation != null ? analysis.evaluation : 0);
    int base = eval >= 5.0 ? 1 : eval >= 3.0 ? 2 : 3;
    return Math.min(3, base + (solution.size() >= 5 ? 1 : 0));
  }

  private Board boardAfter(Board board, Move move) {
    try {
      Board copy = new Board();
      copy.loadFromFen(board.getFen());
      copy.doMove(move);
      return copy;
    } catch (Exception e) {
      return null;
    }
  }

  private boolean isAttacking(Board board, Square from, Square target) {
    try {
      for (Move m : MoveGenerator.generateLegalMoves(board))
        if (m.getFrom().equals(from) && m.getTo().equals(target)) return true;
    } catch (Exception ignored) {}
    return false;
  }

  private boolean isAttackedBy(Board board, Square sq, Side side) {
    try {
      for (Move m : MoveGenerator.generateLegalMoves(board)) {
        Piece mover = board.getPiece(m.getFrom());
        if (isPieceSide(mover, side) && m.getTo().equals(sq)) return true;
      }
    } catch (Exception ignored) {}
    return false;
  }

  private boolean isDefendedBy(Board board, Square sq, Side side) {
    try {
      for (Move m : MoveGenerator.generateLegalMoves(board)) {
        Piece mover = board.getPiece(m.getFrom());
        if (isPieceSide(mover, side) && m.getTo().equals(sq)) return true;
      }
    } catch (Exception ignored) {}
    return false;
  }

  private boolean isRealPiece(Piece p) {
    return p != null && p != Piece.NONE && p.getPieceSide() != null;
  }

  private boolean isPieceSide(Piece p, Side side) {
    return isRealPiece(p) && p.getPieceSide() == side;
  }

  private boolean isSlider(Piece p) {
    if (!isRealPiece(p)) return false;
    PieceType pt = p.getPieceType();
    return pt == PieceType.BISHOP || pt == PieceType.ROOK || pt == PieceType.QUEEN;
  }

  private int pieceValue(Piece p) {
    if (!isRealPiece(p)) return 0;
    return switch (p.getPieceType()) {
      case PAWN   -> 1;
      case KNIGHT -> 3;
      case BISHOP -> 3;
      case ROOK   -> 5;
      case QUEEN  -> 9;
      case KING   -> 100;
      default     -> 0;
    };
  }

  private int[] rayDirection(Square a, Square b) {
    int dr = b.getRank().ordinal() - a.getRank().ordinal();
    int df = b.getFile().ordinal() - a.getFile().ordinal();
    if (dr == 0 && df == 0) return null;
    if (dr != 0 && df != 0 && Math.abs(dr) != Math.abs(df)) return null;
    return new int[]{ dr == 0 ? 0 : dr / Math.abs(dr), df == 0 ? 0 : df / Math.abs(df) };
  }

  private Square stepSquare(Square sq, int[] dir) {
    int r = sq.getRank().ordinal() + dir[0];
    int f = sq.getFile().ordinal() + dir[1];
    if (r < 0 || r > 7 || f < 0 || f > 7) return null;
    try {
      return Square.fromValue(String.valueOf((char) ('A' + f)) + (r + 1));
    } catch (Exception e) { return null; }
  }

  private boolean isLegalMove(Board board, Move move) {
    try {
      for (Move m : MoveGenerator.generateLegalMoves(board))
        if (m.getFrom().equals(move.getFrom()) && m.getTo().equals(move.getTo())
          && m.getPromotion() == move.getPromotion()) return true;
    } catch (Exception ignored) {}
    return false;
  }

  private boolean isValidFen(String fen) {
    try { new Board().loadFromFen(fen); return true; }
    catch (Exception e) { return false; }
  }

  private String toUci(Move m) {
    String s = m.getFrom().toString().toLowerCase() + m.getTo().toString().toLowerCase();
    if (m.getPromotion() != null && m.getPromotion() != Piece.NONE)
      s += m.getPromotion().getFenSymbol().toLowerCase();
    return s;
  }

  private Move createMoveFromUci(Board board, String uci) {
    try {
      Square from  = Square.fromValue(uci.substring(0, 2).toUpperCase());
      Square to    = Square.fromValue(uci.substring(2, 4).toUpperCase());
      Piece  promo = Piece.NONE;
      if (uci.length() == 5) {
        boolean white = board.getSideToMove() == Side.WHITE;
        promo = switch (uci.charAt(4)) {
          case 'q','Q' -> white ? Piece.WHITE_QUEEN  : Piece.BLACK_QUEEN;
          case 'r','R' -> white ? Piece.WHITE_ROOK   : Piece.BLACK_ROOK;
          case 'b','B' -> white ? Piece.WHITE_BISHOP : Piece.BLACK_BISHOP;
          case 'n','N' -> white ? Piece.WHITE_KNIGHT : Piece.BLACK_KNIGHT;
          default -> Piece.NONE;
        };
      }
      return new Move(from, to, promo);
    } catch (Exception e) {
      log.trace("UCI parse error '{}': {}", uci, e.getMessage());
      return null;
    }
  }

  private Move algebraicToMove(Board board, String algebraic) {
    try {
      String s = algebraic.replaceAll("[+#!?]", "").trim();
      if (s.isEmpty()) return null;
      if (s.equals("O-O"))   return castlingMove(board, true);
      if (s.equals("O-O-O")) return castlingMove(board, false);
      for (Move m : MoveGenerator.generateLegalMoves(board))
        if (matchesAlgebraic(board, m, s)) return m;
    } catch (Exception ignored) {}
    return null;
  }

  private Move castlingMove(Board board, boolean kingside) {
    Side   side = board.getSideToMove();
    Square from = side == Side.WHITE ? Square.E1 : Square.E8;
    Square to   = kingside ? (side == Side.WHITE ? Square.G1 : Square.G8)
      : (side == Side.WHITE ? Square.C1 : Square.C8);
    for (Move m : MoveGenerator.generateLegalMoves(board))
      if (m.getFrom().equals(from) && m.getTo().equals(to)) return m;
    return null;
  }

  private boolean matchesAlgebraic(Board board, Move move, String alg) {
    try {
      Piece mover    = board.getPiece(move.getFrom());
      Piece captured = board.getPiece(move.getTo());
      if (!isRealPiece(mover)) return false;

      Set<String> cands = new HashSet<>();
      String dest = move.getTo().toString().toLowerCase();

      if (mover.getPieceType() == PieceType.PAWN) {
        String file = move.getFrom().getFile().toString().toLowerCase();
        cands.add(dest);
        if (isRealPiece(captured)) {
          cands.add(file + "x" + dest);
          cands.add(file + dest);
        }
        if (move.getPromotion() != null && move.getPromotion() != Piece.NONE) {
          String sym = move.getPromotion().getPieceType().getSanSymbol();
          cands.add(dest + "=" + sym);
          cands.add(dest + sym);
          if (isRealPiece(captured)) cands.add(file + "x" + dest + "=" + sym);
        }
      } else {
        String pl  = mover.getPieceType().getSanSymbol();
        String src = move.getFrom().toString().toLowerCase();
        cands.add(pl + dest);
        if (isRealPiece(captured)) cands.add(pl + "x" + dest);
        cands.add(pl + src.charAt(0) + dest);
        cands.add(pl + src.charAt(1) + dest);
        cands.add(pl + src + dest);
        if (isRealPiece(captured)) {
          cands.add(pl + src.charAt(0) + "x" + dest);
          cands.add(pl + src.charAt(1) + "x" + dest);
        }
      }
      return cands.contains(alg);
    } catch (Exception e) { return false; }
  }
}