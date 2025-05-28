package com.danielvishnievskyi.backendapplication.utils;

import com.danielvishnievskyi.backendapplication.model.enums.Color;
import lombok.experimental.UtilityClass;

import java.util.ArrayList;
import java.util.List;

@UtilityClass
public class FenUtils {

  public static Color getActiveColor(String fen) {
    validateFen(fen);
    return fen.split(" ")[1].equals("w") ? Color.WHITE : Color.BLACK;
  }

  public static String getCastlingAvailability(String fen) {
    validateFen(fen);
    return fen.split(" ")[2];
  }

  public static String getEnPassantTargetSquare(String fen) {
    validateFen(fen);
    return fen.split(" ")[3];
  }

  public static int getHalfMoveClock(String fen) {
    validateFen(fen);
    return Integer.parseInt(fen.split(" ")[4]);
  }

  public static int getFullMoveNumber(String fen) {
    validateFen(fen);
    return Integer.parseInt(fen.split(" ")[5]);
  }

  public static List<String> getMoveListFromFenHistory(List<String> fenHistory) {
    List<String> moves = new ArrayList<>();

    if (fenHistory == null || fenHistory.size() < 2) {
      return moves;
    }

    for (int i = 1; i < fenHistory.size(); i++) {
      String move = getCurrentMove(fenHistory.get(i - 1), fenHistory.get(i));
      if (move != null) {
        moves.add(move);
      }
    }

    return moves;
  }

  public static String getCurrentMove(String initialFen, String resultingFen) {
    validateFen(initialFen);
    validateFen(resultingFen);

    String[] initialPosition = initialFen.split(" ")[0].split("/");
    String[] resultingPosition = resultingFen.split(" ")[0].split("/");

    String fromSquare = null;
    String toSquare = null;

    for (int rank = 0; rank < 8; rank++) {
      String initialRank = expandRank(initialPosition[rank]);
      String resultingRank = expandRank(resultingPosition[rank]);

      for (int file = 0; file < 8; file++) {
        char initialPiece = initialRank.charAt(file);
        char resultingPiece = resultingRank.charAt(file);

        if (initialPiece != resultingPiece && initialPiece != '1') {
          fromSquare = getSquare(rank, file);
        }

        if (initialPiece != resultingPiece && resultingPiece != '1') {
          toSquare = getSquare(rank, file);
        }
      }
    }

    return (fromSquare != null && toSquare != null) ? fromSquare + toSquare : null;
  }

  private static void validateFen(String fen) {
    if (fen == null || fen.isEmpty() || fen.split(" ").length != 6) {
      throw new IllegalArgumentException("Invalid FEN format.");
    }
  }

  private static String expandRank(String rank) {
    StringBuilder expanded = new StringBuilder();
    for (char c : rank.toCharArray()) {
      if (Character.isDigit(c)) {
        int emptySquares = Character.getNumericValue(c);
        expanded.append("1".repeat(emptySquares));
      } else {
        expanded.append(c);
      }
    }
    return expanded.toString();
  }

  private static String getSquare(int rank, int file) {
    char fileChar = (char) ('a' + file);
    int rankChar = 8 - rank;
    return fileChar + String.valueOf(rankChar);
  }
}
