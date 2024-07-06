package com.danielvishnievskyi.backendapplication.model.mappers;

import com.danielvishnievskyi.backendapplication.model.dto.game.GameResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.GameEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(uses = {
  PlayerMapper.class, TimeFormatMapper.class, GameTimeMapper.class
})
public interface GameMapper {

  @Mapping(target = "playersTime", source = "gameTime")
  GameResponseDTO mapToResponseDTO(GameEntity gameEntity);
}
