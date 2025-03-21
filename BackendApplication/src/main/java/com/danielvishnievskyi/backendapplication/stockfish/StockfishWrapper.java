package com.danielvishnievskyi.backendapplication.stockfish;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.*;

@Component
public class StockfishWrapper implements AutoCloseable {
  private Process stockfishProcess;
  private BufferedReader reader;
  private BufferedWriter writer;

  public StockfishWrapper() throws IOException {
    startEngine(new ClassPathResource("/stockfish").getFile().getAbsolutePath());
  }

  private void startEngine(String stockfishPath) throws IOException {
    stockfishProcess = new ProcessBuilder(stockfishPath).redirectErrorStream(true).start();
    reader = new BufferedReader(new InputStreamReader(stockfishProcess.getInputStream()));
    writer = new BufferedWriter(new OutputStreamWriter(stockfishProcess.getOutputStream()));

    if (!isRunning()) {
      throw new StockfishException("Failed to start Stockfish engine.");
    }
  }

  public boolean isRunning() {
    try {
      writeCommand("uci");
      String response;
      while ((response = reader.readLine()) != null) {
        if (response.contains("uciok")) {
          return true;
        }
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
    return false;
  }

  public void writeCommand(String command) throws IOException {
    writer.write(command + "\n");
    writer.flush();
  }

  public String readResponse() {
    StringBuilder response = new StringBuilder();
    String line;
    try {


      while ((line = reader.readLine()) != null) {
        response.append(line).append("\n");
        if (line.equals("readyok") || line.startsWith("bestmove")) {
          break;
        }
      }
      return response.toString();
    } catch (Exception _) {
      throw new RuntimeException();
    }
  }

  public String sendCommand(String command) {
    try {
      writeCommand(command);
      return readResponse();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  public String getBestMove(String fen, int timeInMillis) {
    try {
      writeCommand("position fen " + fen);
      writeCommand("go movetime " + timeInMillis);
      return readResponse();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  public void stopEngine() {
    try {
      if (stockfishProcess != null) {
        writeCommand("quit");
        stockfishProcess.destroy();
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @Override
  public void close() {
    stopEngine();
  }

  public String getAlternativeMove(String fen, String bestMove) {
    sendCommand("position fen " + fen);
    sendCommand("go movetime 200"); // Adjust the time based on your needs

    String response = readResponse();
    String alternativeMove = extractMoveFromResponse(response);

    if (alternativeMove != null && !alternativeMove.equals(bestMove)) {
      return alternativeMove; // Return the alternative move
    } else {
      return "No alternative move found";
    }
  }

  private String extractMoveFromResponse(String response) {
    // Extract the move from the response (e.g., "bestmove e2e4")
    String[] lines = response.split("\n");
    for (String line : lines) {
      if (line.startsWith("bestmove")) {
        return line.split(" ")[1]; // Extract the move
      }
    }
    return null;
  }
}
