+++
categories = ["Documentation"]
title = "DimensionType.java"
+++

## File Summary

- **File Path:** /home/chad/dev/Incubyte/Glowstone/src/main/java/net/glowstone/chunk/DimensionType.java
- **LOC:** 52
- **Last Modified:** 11 months 21 days
- **Number of Commits (Total / Last 6 Months / Last Month):** 1 / 0 / 0
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** 1 / 0 / 0
- **Top Contributors:** kamcio96 (1)

{{< details "Code " >}}
```java
package net.glowstone.chunk;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.bukkit.NamespacedKey;

import javax.annotation.Nullable;
import java.util.Optional;
import java.util.OptionalLong;

@Data
@AllArgsConstructor
public final class DimensionType {

    private final boolean piglinSafe;

    private final boolean hasRaids;

    private final int monsterSpawnLightLevel;

    private final int monsterSpawnBlockLightLimit;

    private final boolean natural;

    private final float ambientLight;

    private final OptionalLong fixedTime;

    @Nullable
    private final Optional<NamespacedKey> infiniburn;

    private final boolean respawnAnchorWorks;

    private final boolean skyLight;

    private final boolean bedWorks;

    private final NamespacedKey effects;

    private final int minY;

    private final int height;

    private final int logicalHeight;

    private final double coordinateScale;

    private final boolean ultraWarm;

    private final boolean hasCeiling;

}

```
{{< /details >}}



# Code Review for DimensionType.java

## Overview

This code is the "DimensionType" class of a Minecraft server project called "Glowstone". It represents a specific type of dimension and contains its properties. Dimensions can have different properties such as monster spawn levels, ambient light, and other environmental settings.

## Function Explanation

### 1. Constructor

```java
@AllArgsConstructor
public final class DimensionType {
```

This class is marked with Lombok's `@AllArgsConstructor` annotation, which generates an all-arguments constructor. This constructor accepts all properties as arguments and initializes the corresponding fields with these values.

### 2. Fields

The class has the following fields representing various dimension properties:

- `boolean piglinSafe`: if piglins can safely spawn in this dimension.
- `boolean hasRaids`: if this dimension can have raid events.
- `int monsterSpawnLightLevel`: the light level at which monsters are allowed to spawn.
- `int monsterSpawnBlockLightLimit`: the block light limit for monster spawning.
- `boolean natural`: a natural or human-manmade dimension.
- `float ambientLight`: the ambient light value in this dimension.
- `OptionalLong fixedTime`: an optional fixed time value for this dimension.
- `Optional<NamespacedKey> infiniburn`: an optional "infiniburn" key for this dimension.
- `boolean respawnAnchorWorks`: if a respawn anchor is functional within this dimension.
- `boolean skyLight`: if this dimension has sky light.
- `boolean bedWorks`: if beds are functional within this dimension.
- `NamespacedKey effects`: the effects key for this dimension.
- `int minY`: the minimum Y-coordinate value for this dimension.
- `int height`: the height of this dimension.
- `int logicalHeight`: the logical height used when calculating coordinates.
- `double coordinateScale`: the scale factor used for coordinate translation.
- `boolean ultraWarm`: if this dimension is extremely hot.
- `boolean hasCeiling`: if there is a ceiling in this dimension.

## Data Read/Write Operations

There are no data read/write operations encountered in this class.

## Risks

### Security Issues

There are no security issues found in this class.

### Bugs

There no bugs found in this code.

## Refactoring Opportunities

The existing code is compact and purpose-driven. There is no significant code duplication or violation of SOLID principles.

## User Acceptance Criteria (Gherkin Scripts)

```
Feature: DimensionType
  Scenario: Create a DimensionType instance
    Given I have all dimension variables/properties as required
    When I create a DimensionType instance
    Then the DimensionType object should contain all the provided values
```