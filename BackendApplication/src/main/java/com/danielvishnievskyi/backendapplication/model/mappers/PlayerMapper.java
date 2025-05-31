package com.danielvishnievskyi.backendapplication.model.mappers;

import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerRequestDTO;
import com.danielvishnievskyi.backendapplication.model.dto.player.RegisteredPlayerResponseDTO;
import com.danielvishnievskyi.backendapplication.model.entities.RegisteredPlayerEntity;
import org.mapstruct.*;

import static org.mapstruct.MappingConstants.ComponentModel.SPRING;

@Mapper(componentModel = SPRING)
public interface PlayerMapper {

  RegisteredPlayerResponseDTO playerToResponseDTO(RegisteredPlayerEntity playerEntity);

  @Mapping(target = "roles", ignore = true)
  @Mapping(target = "uuid", ignore = true)
  @Mapping(target = "creationTime", ignore = true)
  @Mapping(target = "authorities", ignore = true)
  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  void updateEntityFromDto(RegisteredPlayerRequestDTO dto, @MappingTarget RegisteredPlayerEntity entity);
}
