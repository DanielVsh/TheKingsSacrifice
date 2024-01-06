package com.danielvishnievskyi.backendapplication;

import com.danielvishnievskyi.backendapplication.ttt.t1;
import com.danielvishnievskyi.backendapplication.ttt.t1rep;
import com.danielvishnievskyi.backendapplication.ttt.t2;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class BackendApplication {

  public static void main(String[] args) {
    SpringApplication.run(BackendApplication.class, args);
  }

  @Bean
  public CommandLineRunner commandLineRunner (t1rep t1rep) {
    return args -> {
      t1rep.save(
        new t1("hello", List.of(
          new t2("g", "a"),
          new t2("f", "b"))));
    };
  }
}