package com.danielvishnievskyi.backendapplication.security;

import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@AllArgsConstructor
public class SecurityConfiguration {

  private  JwtAuthenticationFilter jwtAuthenticationFilter;
  private  AuthenticationProvider authenticationProvider;
  private  LogoutHandler logoutHandler;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .csrf(AbstractHttpConfigurer::disable)
      .cors(Customizer.withDefaults())
      .authorizeHttpRequests(authManager -> authManager
        .requestMatchers("/rest/auth/**").permitAll()
        .requestMatchers("/rest/player/anonymous/**").permitAll()
        .requestMatchers("/rest/game/**").permitAll()
        .requestMatchers("/ws/**").permitAll()
        .anyRequest().authenticated()
      ).sessionManagement(
        managementConfigurer -> managementConfigurer
          .sessionCreationPolicy(STATELESS)
      ).authenticationProvider(authenticationProvider)
      .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
      .logout(httpSecurityLogoutConfigurer ->
        httpSecurityLogoutConfigurer
          .logoutUrl("/rest/auth/logout")
          .addLogoutHandler(logoutHandler)
          .logoutSuccessHandler((request, response, authentication) ->
            SecurityContextHolder.clearContext())
      );

    return http.build();
  }
}
