package com.danielvishnievskyi.backendapplication.utils;

import com.danielvishnievskyi.backendapplication.model.enums.Color;
import lombok.experimental.UtilityClass;

@UtilityClass
public class FenUtils {

  public static Color getActiveColor(String fen) {
    return fen.split(" ")[1].equals("w") ? Color.WHITE : Color.BLACK;
  }

  public static String getCastlingAvailability(String fen) {
    return fen.split(" ")[2];
  }

  public static String getEnPassantTargetSquare(String fen) {
    return fen.split(" ")[3];
  }

  public static int getHalfMoveClock(String fen) {
    return Integer.parseInt(fen.split(" ")[4]);
  }

  public static int getFullMoveNumber(String fen) {
    return Integer.parseInt(fen.split(" ")[5]);
  }
}
