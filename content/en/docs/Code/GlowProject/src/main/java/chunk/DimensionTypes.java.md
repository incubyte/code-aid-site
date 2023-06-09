+++
categories = ["Documentation"]
title = "DimensionTypes.java"
+++

## File Summary

- **File Path:** /home/chad/dev/Incubyte/Glowstone/src/main/java/net/glowstone/chunk/DimensionTypes.java
- **LOC:** 31
- **Last Modified:** 11 months 21 days
- **Number of Commits (Total / Last 6 Months / Last Month):** 1 / 0 / 0
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** 1 / 0 / 0
- **Top Contributors:** kamcio96 (1)

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



# Overview

This Java code snippet defines a class, `DimensionTypes`, belonging to the package `net.glowstone.chunk`. This class consists of a single public constant, `OVERWORLD`, which is of type `DimensionType`. The `DimensionTypes` class is used to define various properties related to dimensions (or worlds) in the game Minecraft.

# Explanation

## Class: DimensionTypes

### Section 1: Import statements

1. `import org.bukkit.NamespacedKey;` - Import the `org.bukkit.NamespacedKey` class to handle namespaced keys for identifying resources.
2. `import java.util.Optional;` - Import the `java.util.Optional` class to handle optional values.
3. `import java.util.OptionalLong;` - Import the `java.util.OptionalLong` class to handle optional long values.

### Section 2: Public constant declaration

1. **Constant: OVERWORLD**

   ```java
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
   ```

    This constant represents the default Overworld dimension in Minecraft. It is a `DimensionType`, which is a class that defines the properties of a dimension such as world height, whether structures like villages or dungeons generate, and if the sky will render. Here, the `DimensionType` is instantiated with the following properties:

   - No dragon fight (false)
   - Generates villages, strongholds, etc. (true)
   - Set sea level to 7
   - Set sky color to 0
   - Has a sky (true)
   - Set fog color to 0.0F
   - No ultra warm temperature (OptionalLong.empty())
   - No height-based motion blocking (Optional.empty())
   - Not a natural dimension (false)
   - Ages entity in loaded chunks (true)
   - Respawns anchor checkpoint (true)
   - Set the dimension key to "minecraft:overworld"
   - Set minimum world height to -64
   - Set maximum height to 384
   - Set height of horizontally generated chunks to 384
   - Set the horizontal scale to 1.0D
   - Do not ignore the risk of a tall object (false)
   - Do not generate void islands (false)

# Risks

## Security Issues

There are no apparent security issues in this code snippet.

## Bugs

There are no apparent bugs in this code snippet.

# Refactoring Opportunities

Since this class has only one constant and no other code, there's no significant refactoring opportunity in this code snippet. However, if more dimensions will be added later, one might consider creating a factory or builder pattern to simplify the creation of `DimensionType` instances.

# User Acceptance Criteria

This class only has a constant with no behavior, so there is no Gherkin script for its behavior.