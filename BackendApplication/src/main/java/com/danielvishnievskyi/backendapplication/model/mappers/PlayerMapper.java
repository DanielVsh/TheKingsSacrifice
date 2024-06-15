package com.danielvishnievskyi.backendapplication.model.mappers;

import com.danielvishnievskyi.backendapplication.model.dto.player.PlayerResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.PlayerEntity;
import org.mapstruct.Mapper;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING)
public interface PlayerMapper {

  PlayerResponseDTO playerToResponseDTO(PlayerEntity playerEntity);
}
