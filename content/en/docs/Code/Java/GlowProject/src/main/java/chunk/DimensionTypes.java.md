+++
categories = ["Documentation"]
title = "DimensionTypes.java"
+++


# Overview

This code snippet represents a Java class called `DimensionTypes`, which is part of the `net.glowstone.chunk` package. The main objective of this class is to define a constant object called `OVERWORLD` of the `DimensionType` class. The `DimensionType` object represents the properties of the Overworld dimension in a Minecraft server.

## DimensionTypes Class

### OVERWORLD Constant

The `OVERWORLD` constant is an instance of the `DimensionType` class, which is initialized with the following values:

1. `false`: Has skylight
2. `true`: Has ceiling
3. `7`: Ambient light
4. `0`: Logical height
5. `true`: Shrinks height below 64
6. `0.0F`: Coordinate scale
7. `OptionalLong.empty()`: Fixed time
8. `Optional.empty()`: Piglin safe
9. `false`: Beds work
10. `true`: Respawn anchor works
11. `true`: Water evaporates
12. `NamespacedKey.minecraft("overworld")`: Dimension's namespace key
13. `-64`: Minimum Y
14. `384`: Height
15. `384`: Logical height
16. `1.0D`: Ultrawarm
17. `false`: Natural
18. `false`: Shrinks height below 64

These values define the characteristics and behavior of the Overworld dimension in a Minecraft server.

# Risks

## Security Issues

No security issues have been identified in this code snippet.

## Bugs

No bugs have been identified in this code snippet.

# Refactoring Opportunities

As this class currently only defines a single constant, there might not be any immediate refactoring opportunities. However, it might be useful to consider adding additional constants to represent other dimensions in the game (such as the Nether and the End), if they are required for server functionality.