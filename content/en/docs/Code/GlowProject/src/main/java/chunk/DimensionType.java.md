+++
categories = ["Documentation"]
title = "DimensionType.java"
+++

## File Summary

- **File Path:** Glowstone\src\main\java\net\glowstone\chunk\DimensionType.java
- **LOC:** 52
- **Last Modified:** 11 months 20 days
- **Number of Commits (Total / Last 6 Months / Last Month):** 1 / 0 / 0
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** 1 / 0 / 0
- **Top Contributors:** kamcio96 (1)

## Overview

This Java code defines a `DimensionType` class, which represents the various properties of a dimension in the game Minecraft. This class is used in the context of the Glowstone server implementation for Minecraft. 

## DimensionType Class

The `DimensionType` class is a Data class with the following properties:

1. `boolean piglinSafe`
2. `boolean hasRaids`
3. `int monsterSpawnLightLevel`
4. `int monsterSpawnBlockLightLimit`
5. `boolean natural`
6. `float ambientLight`
7. `OptionalLong fixedTime`
8. `Optional<NamespacedKey> infiniburn`
9. `boolean respawnAnchorWorks`
10. `boolean skyLight`
11. `boolean bedWorks`
12. `NamespacedKey effects`
13. `int minY`
14. `int height`
15. `int logicalHeight`
16. `double coordinateScale`
17. `boolean ultraWarm`
18. `boolean hasCeiling`

### Constructor

The class has a constructor with `@AllArgsConstructor` annotation from Lombok library that automatically generates a constructor with all the class properties as parameters.

### Getters

Since it is a `@Data` class, Lombok library will automatically generate getter methods for all the properties.

## Risks

### Security Issues

No security issues can be identified in the code.

### Bugs

No bugs can be identified in the code.

## Refactoring Opportunities

No significant refactoring opportunities can be identified since the code already uses Lombok annotations to generate boilerplate code like constructors and getters.