package com.danielvishnievskyi.backendapplication.model.mappers.game;

import com.danielvishnievskyi.backendapplication.model.dto.game.GameResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.Game;
import com.danielvishnievskyi.backendapplication.model.mappers.player.PlayerMapper;
import org.mapstruct.Mapper;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING, uses = {PlayerMapper.class})
public abstract class GameMapper {

  public abstract GameResponseDTO gameToResponseDTO(Game game);
}
