package com.danielvishnievskyi.backendapplication.stockfish;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class StockfishEngine {

  private Process process;
  private BufferedReader reader;
  private BufferedWriter writer;
  private boolean initialized = false;

  public void initialize() {
    try {

      process = new ProcessBuilder(new ClassPathResource("/stockfish").getFile().getAbsolutePath()).start();
      reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
      writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()));

      sendCommand("uci");
      waitForResponse("uciok");
      sendCommand("setoption name Threads value 2");
      sendCommand("isready");
      waitForResponse("readyok");

      initialized = true;
      System.out.println("✓ Stockfish initialized");
    } catch (Exception e) {
      System.err.println("Failed to start Stockfish: " + e.getMessage());
    }
  }

  public void shutdown() {
    try {
      if (process != null) {
        sendCommand("quit");
        process.destroy();
      }
    } catch (Exception e) {
      System.err.println("Error shutting down Stockfish: " + e.getMessage());
    }
  }

  private void sendCommand(String command) throws IOException {
    writer.write(command + "\n");
    writer.flush();
  }

  private String waitForResponse(String marker) throws IOException {
    StringBuilder result = new StringBuilder();
    String line;
    while ((line = reader.readLine()) != null) {
      result.append(line).append("\n");
      if (line.contains(marker)) {
        break;
      }
    }
    return result.toString();
  }

  public AnalysisResult analyze(String fen, int depth) {
    if (!initialized) {
      throw new RuntimeException("Stockfish not initialized");
    }

    try {
      sendCommand("position fen " + fen);
      sendCommand("go depth " + depth);

      String output = waitForResponse("bestmove");
      return parseOutput(output, fen);

    } catch (Exception e) {
      System.err.println("Analysis failed: " + e.getMessage());
      return null;
    }
  }

  private AnalysisResult parseOutput(String output, String fen) {
    AnalysisResult result = new AnalysisResult();
    result.fen = fen;

    String[] lines = output.split("\n");
    String bestInfoLine = "";

    for (String line : lines) {
      if (line.startsWith("info depth") && line.contains("score")) {
        bestInfoLine = line;
      }
      if (line.startsWith("bestmove")) {
        String[] parts = line.split(" ");
        result.bestMove = parts[1];
      }
    }

    if (!bestInfoLine.isEmpty()) {
      // Parse score
      if (bestInfoLine.contains("score cp")) {
        String[] parts = bestInfoLine.split("score cp ");
        if (parts.length > 1) {
          String scoreStr = parts[1].split(" ")[0];
          result.centipawns = Integer.parseInt(scoreStr);
          result.evaluation = result.centipawns / 100.0;
        }
      }

      if (bestInfoLine.contains("score mate")) {
        String[] parts = bestInfoLine.split("score mate ");
        if (parts.length > 1) {
          String mateStr = parts[1].split(" ")[0];
          result.mateIn = Integer.parseInt(mateStr);
        }
      }

      // Parse principal variation (PV)
      if (bestInfoLine.contains(" pv ")) {
        String[] parts = bestInfoLine.split(" pv ");
        if (parts.length > 1) {
          String[] moves = parts[1].trim().split(" ");
          result.principalVariation = new ArrayList<>(Arrays.asList(moves));
        }
      }
    }

    return result;
  }

  public static class AnalysisResult {
    public String fen;
    public String bestMove;
    public Integer centipawns;
    public Double evaluation;
    public Integer mateIn;
    public List<String> principalVariation = new ArrayList<>();

    public boolean isWinning() {
      if (mateIn != null) return true;
      if (evaluation != null) return Math.abs(evaluation) >= 2.0;
      return false;
    }

    public boolean isMate() {
      return mateIn != null;
    }
  }
}
