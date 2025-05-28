package com.danielvishnievskyi.backendapplication.model.mappers;

import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayerEntity;
import org.mapstruct.Mapper;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING)
public interface PlayerMapper {

  RegisteredPlayerResponseDTO playerToResponseDTO(RegisteredPlayerEntity playerEntity);
}
