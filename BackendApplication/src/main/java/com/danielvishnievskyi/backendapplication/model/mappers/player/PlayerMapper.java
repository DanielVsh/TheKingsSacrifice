package com.danielvishnievskyi.backendapplication.model.mappers.player;

import com.danielvishnievskyi.backendapplication.model.dto.player.PlayerResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.Player;
import org.mapstruct.Mapper;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING)
public abstract class PlayerMapper {

  public abstract PlayerResponseDTO playerToResponseDTO(Player player);
}
