package com.danielvishnievskyi.backendapplication.model;


public record TimeFormat(
    int minutes,
    int seconds,
    boolean unlimited
) {
  public static final String UNLIMITED_TIME_FORMAT = "unlimited";

}
