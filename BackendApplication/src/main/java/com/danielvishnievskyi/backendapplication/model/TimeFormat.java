package com.danielvishnievskyi.backendapplication.model;


import lombok.*;

@Setter
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class TimeFormat {
  /** in seconds */
  private int time;
  /** in seconds */
  private int timePerMove;
  private boolean unlimited;

  public static final String UNLIMITED_TIME_FORMAT = "unlimited";

}
