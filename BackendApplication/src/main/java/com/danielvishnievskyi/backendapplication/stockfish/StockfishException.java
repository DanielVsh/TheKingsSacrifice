package com.danielvishnievskyi.backendapplication.stockfish;

public class StockfishException extends RuntimeException {
  public StockfishException(String message, Throwable cause) {
    super(message, cause);
  }

  public StockfishException(String message) {
    super(message);
  }
}
