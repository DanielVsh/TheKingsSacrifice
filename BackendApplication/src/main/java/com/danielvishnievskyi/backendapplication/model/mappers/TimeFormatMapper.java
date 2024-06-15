package com.danielvishnievskyi.backendapplication.model.mappers;

import com.danielvishnievskyi.backendapplication.model.TimeFormat;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import static com.danielvishnievskyi.backendapplication.model.TimeFormat.UNLIMITED_TIME_FORMAT;

@Mapper
public interface TimeFormatMapper {

  default TimeFormat mapToTimeFormat(String timeFormat) {
    if (UNLIMITED_TIME_FORMAT.equals(timeFormat)) {
      return new TimeFormat(999999, 999999, true);
    } else {
      String[] split = timeFormat.split("\\+");
      int minutes = Integer.parseInt(split[0]);
      int seconds = Integer.parseInt(split[1]);
      if (minutes == 0 && seconds == 0) {
        throw new IllegalArgumentException("Time range can't be 0 minutes and 0 seconds");
      }
      return new TimeFormat(minutes, seconds, false);
    }
  }

  default String mapToTimeFormat(TimeFormat timeFormat) {
    if (timeFormat.unlimited()) {
      return UNLIMITED_TIME_FORMAT;
    } else {
      return "%d+%d".formatted(timeFormat.minutes(), timeFormat.seconds());
    }
  }
}
