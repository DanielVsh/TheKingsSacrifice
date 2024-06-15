package com.danielvishnievskyi.backendapplication.model.entities;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@DiscriminatorValue("anonymous")
public class AnonymousPlayerEntity extends PlayerEntity {
}
