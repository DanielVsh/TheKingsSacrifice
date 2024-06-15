package com.danielvishnievskyi.backendapplication.model.mappers;

import com.danielvishnievskyi.backendapplication.model.dto.game.GameResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.GameEntity;
import org.mapstruct.Mapper;

@Mapper(uses = {PlayerMapper.class, TimeFormatMapper.class})
public interface GameMapper {

  GameResponseDTO mapToResponseDTO(GameEntity gameEntity);
}
