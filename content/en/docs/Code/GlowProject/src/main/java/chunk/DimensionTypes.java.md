+++
categories = ["Documentation"]
title = "DimensionTypes.java"
+++

## File Summary

- **File Path:** Glowstone\src\main\java\net\glowstone\chunk\DimensionTypes.java
- **LOC:** 31
- **Last Modified:** 11 months 20 days
- **Number of Commits (Total / Last 6 Months / Last Month):** 1 / 0 / 0
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** 1 / 0 / 0
- **Top Contributors:** kamcio96 (1)

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


{{< details "Code " >}}
```java
package net.glowstone.chunk;

import org.bukkit.NamespacedKey;

import java.util.Optional;
import java.util.OptionalLong;

public class DimensionTypes {

    public static final DimensionType OVERWORLD = new DimensionType(
            false,
            true,
            7,
            0,
            true,
            0.0F,
            OptionalLong.empty(),
            Optional.empty(),
            false,
            true,
            true,
            NamespacedKey.minecraft("overworld"),
            -64,
            384,
            384,
            1.0D,
            false,
            false
    );

}

```
{{< /details >}}



# Risks

## Security Issues

No security issues have been identified in this code snippet.

## Bugs

No bugs have been identified in this code snippet.

# Refactoring Opportunities

As this class currently only defines a single constant, there might not be any immediate refactoring opportunities. However, it might be useful to consider adding additional constants to represent other dimensions in the game (such as the Nether and the End), if they are required for server functionality.