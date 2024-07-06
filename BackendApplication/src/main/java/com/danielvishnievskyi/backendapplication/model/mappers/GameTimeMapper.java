package com.danielvishnievskyi.backendapplication.model.mappers;

import com.danielvishnievskyi.backendapplication.model.dto.game.GameTimeResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.GameTimeEntity;
import org.mapstruct.Mapper;

@Mapper
public interface GameTimeMapper {

  GameTimeResponseDTO mapToGameTimeResponseDTO(GameTimeEntity gameTimeEntity);
}
