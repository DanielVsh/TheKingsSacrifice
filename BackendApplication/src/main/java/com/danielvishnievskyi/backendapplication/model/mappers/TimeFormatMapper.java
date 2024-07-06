package com.danielvishnievskyi.backendapplication.model.mappers;

import com.danielvishnievskyi.backendapplication.model.TimeFormat;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import static com.danielvishnievskyi.backendapplication.model.TimeFormat.UNLIMITED_TIME_FORMAT;

@Mapper
public interface TimeFormatMapper {

  TimeFormatMapper INSTANCE = Mappers.getMapper(TimeFormatMapper.class);

  default TimeFormat mapToTimeFormat(String timeFormat) {
    if (UNLIMITED_TIME_FORMAT.equals(timeFormat)) {
      return new TimeFormat(0, 0, true);
    } else {
      String[] split = timeFormat.split("\\+");
      int gameTime = Integer.parseInt(split[0]);
      int timePerMove = Integer.parseInt(split[1]);
      if (gameTime == 0 && timePerMove == 0) {
        throw new IllegalArgumentException("Time range can't be gameTime=0 and timePerMove=0");
      }
      return new TimeFormat(gameTime, timePerMove, false);
    }
  }

  default String mapToTimeFormat(TimeFormat timeFormat) {
    if (timeFormat.isUnlimited()) {
      return UNLIMITED_TIME_FORMAT;
    } else {
      return "%d+%d".formatted(timeFormat.getTime(), timeFormat.getTimePerMove());
    }
  }
}
