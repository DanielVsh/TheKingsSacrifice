package com.danielvishnievskyi.backendapplication.stockfish;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class StockfishInitializer implements CommandLineRunner {

  private final StockfishEngine engine;

  public StockfishInitializer(StockfishEngine engine) {
    this.engine = engine;
  }

  @Override
  public void run(String... args) {
    engine.initialize();
  }
}
