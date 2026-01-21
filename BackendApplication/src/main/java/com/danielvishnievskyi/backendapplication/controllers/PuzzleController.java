package com.danielvishnievskyi.backendapplication.controllers;

import com.danielvishnievskyi.backendapplication.model.entities.PuzzleEntity;
import com.danielvishnievskyi.backendapplication.repositories.PuzzleRepository;
import com.danielvishnievskyi.backendapplication.services.PuzzleCreationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;


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
    creationService.processFinishedGames();
  }
}
