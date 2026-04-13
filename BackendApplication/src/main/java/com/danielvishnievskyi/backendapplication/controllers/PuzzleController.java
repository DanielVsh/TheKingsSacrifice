package com.danielvishnievskyi.backendapplication.controllers;

import com.danielvishnievskyi.backendapplication.model.entities.PuzzleEntity;
import com.danielvishnievskyi.backendapplication.repositories.PuzzleRepository;
import com.danielvishnievskyi.backendapplication.services.PuzzleCreationService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/rest/puzzle")
@RequiredArgsConstructor
public class PuzzleController {
  private final PuzzleRepository repository;
  private final PuzzleCreationService creationService;

  @GetMapping("/all")
  public Page<PuzzleEntity> getPuzzles(
    @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
    return repository.findAll(pageable);
  }

  @GetMapping("/{id}")
  public PuzzleEntity getPuzzles(@PathVariable Long id) {
    return repository.findById(id).orElseThrow();
  }

  @PostMapping("/create")
  public void create() {
    ClassPathResource resource = new ClassPathResource("games.pgn");

    try (BufferedReader reader = new BufferedReader(
      new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

      String content = reader.lines().collect(Collectors.joining("\n"));

      // Split PGN games
      String[] games = content.split("(?=\\[Event)");

      for (String game : games) {
        if (!game.trim().isEmpty()) {
          creationService.processPgn(game);
        }
      }

    } catch (Exception e) {
      e.printStackTrace();
    }
  };
}
