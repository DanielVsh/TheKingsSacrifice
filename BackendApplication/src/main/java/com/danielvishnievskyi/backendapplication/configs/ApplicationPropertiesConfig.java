package com.danielvishnievskyi.backendapplication.configs;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "application.config")
public class ApplicationPropertiesConfig {
    @NestedConfigurationProperty
    private List<String> clients;
}
