+++
categories = ["Documentation"]
title = "GlowAdvancement.java"
+++

## File Summary

- **File Path:** Glowstone\src\main\java\net\glowstone\advancement\GlowAdvancement.java
- **LOC:** 117
- **Last Modified:** 11 months 25 days
- **Number of Commits (Total / Last 6 Months / Last Month):** 10 / 0 / 0
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** 6 / 0 / 0
- **Top Contributors:** mastercoms (4), Chris Hennick (2), Pr0methean (1)

## Overview

The `GlowAdvancement` class is a custom implementation of the `Advancement` interface for a Minecraft server. It's responsible for parsing and storing the information related to an advancement, such as its name, parent advancement (if any), display properties, criteria, and requirements. The class also provides methods to add and manipulate the criteria and requirements of the advancement, as well as encoding the information into a `ByteBuf` when needed.

## Function Explanations

1. `public GlowAdvancement(NamespacedKey key, GlowAdvancement parent)`

   This constructor initializes a new instance of `GlowAdvancement` with a given key, and a parent advancement. The `display` property is set to null, which means the default notification will be used when the advancement is earned.

2. `public GlowAdvancement(NamespacedKey key, GlowAdvancement parent, GlowAdvancementDisplay display)`

   This constructor initializes a new instance of `GlowAdvancement` with a given key, parent advancement, and custom display settings. It allows more control over the notification behavior when the advancement is earned.

3. `public void addCriterion(String criterion)`

   This method adds a new criterion to the list of criteria if it does not already exist.

4. `public void addRequirement(List<String> criteria)`

   This method adds a new requirement to the list of requirements.

5. `public List<String> getCriteria()`

   This method returns an immutable copy of the criteria list.

6. `public @NotNull @Unmodifiable Collection<Advancement> getChildren()`

   This method returns null, as it's not implemented yet. In the future, it should return a collection of child advancements.

7. `public @NotNull Advancement getRoot()`

   This method returns null, as it's also not implemented yet. In the future, it should return the root advancement of the tree this advancement belongs to.

8. `public ByteBuf encode(ByteBuf buf) throws IOException`

   This method encodes the information about the advancement into a `ByteBuf`. It writes various aspects such as the presence of a parent advancement, display settings, criteria, and requirements.

9. `public @Nullable AdvancementDisplay getDisplay()`

   This method returns the display settings of the advancement, or null if the default settings are used.


{{< details "Code " >}}
```java
package net.glowstone.advancement;

import com.flowpowered.network.util.ByteBufUtils;
import com.google.common.collect.ImmutableList;
import io.netty.buffer.ByteBuf;
import io.papermc.paper.advancement.AdvancementDisplay;
import lombok.Data;
import org.bukkit.NamespacedKey;
import org.bukkit.advancement.Advancement;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.jetbrains.annotations.Unmodifiable;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Data
public class GlowAdvancement implements Advancement {

    private final NamespacedKey key;
    private final GlowAdvancement parent;
    private final List<String> criteriaIds = new ArrayList<>();
    private final List<List<String>> requirements = new ArrayList<>();
    private GlowAdvancementDisplay display = null;

    /**
     * Creates an advancement with the default notification.
     *
     * @param key    the namespace and name of the advancement
     * @param parent the prerequisite advancement, or null
     */
    public GlowAdvancement(NamespacedKey key, GlowAdvancement parent) {
        this.key = key;
        this.parent = parent;
    }

    /**
     * Creates an advancement.
     *
     * @param key     the namespace and name of the advancement
     * @param parent  the prerequisite advancement, or null for no prerequisite
     * @param display the parameters for the notification when this advancement is earned, or null
     *                for the default notification
     */
    public GlowAdvancement(NamespacedKey key, GlowAdvancement parent,
                           GlowAdvancementDisplay display) {
        this.key = key;
        this.parent = parent;
        this.display = display;
    }

    /**
     * Adds a criterion.
     *
     * @param criterion TODO: document where this ID comes from
     */
    public void addCriterion(String criterion) {
        if (!criteriaIds.contains(criterion)) {
            criteriaIds.add(criterion);
        }
    }

    public void addRequirement(List<String> criteria) {
        requirements.add(criteria);
    }

    @Override
    public List<String> getCriteria() {
        return ImmutableList.copyOf(criteriaIds);
    }

    @Override
    public @NotNull @Unmodifiable Collection<Advancement> getChildren() {
        return null;
    }

    @Override
    public @NotNull Advancement getRoot() {
        return null;
    }

    /**
     * Writes a notification of earning this advancement to a byte buffer.
     *
     * @param buf a {@link ByteBuf}
     * @return {@code buf} with this advancement written to it
     * @throws IOException if a string is too long
     */
    public ByteBuf encode(ByteBuf buf) throws IOException {
        buf.writeBoolean(parent != null);
        if (parent != null) {
            ByteBufUtils.writeUTF8(buf, parent.getKey().toString());
        }
        buf.writeBoolean(display != null);
        if (display != null) {
            display.encode(buf, true, true, false);
        }
        ByteBufUtils.writeVarInt(buf, criteriaIds.size());
        for (String criteriaId : criteriaIds) {
            ByteBufUtils.writeUTF8(buf, criteriaId);
        }
        ByteBufUtils.writeVarInt(buf, requirements.size());
        for (List<String> requirement : requirements) {
            ByteBufUtils.writeVarInt(buf, requirement.size());
            for (String criterion : requirement) {
                ByteBufUtils.writeUTF8(buf, criterion);
            }
        }
        return buf;
    }

    public @Nullable AdvancementDisplay getDisplay() {
        return display;
    }
}

```
{{< /details >}}



## Risks

### Security Issues

No particular security issues have been detected in the code.

### Bugs

- The method `getChildren` returns null, which can lead to NullPointerExceptions when calling code expects a collection of child advancements. It should return an empty collection or implement the actual functionality to return the child advancements.

- The method `getRoot` also returns null, similar to the `getChildren` method. It should be implemented appropriately, returning the root advancement.

## Refactoring Opportunities

- The methods `getChildren` and `getRoot` should be implemented, or at least return a meaningful value (like an empty collection for `getChildren`), to avoid potential errors caused by null values.

- In the `addCriterion` method, consider using a `Set` instead of a `List` for `criteriaIds` to avoid duplicates and make the code simpler and more efficient.

- To simplify the encoding logic in the `ByteBuf encode(ByteBuf buf)` method, consider creating a helper method to handle the encoding of the individual components like criteria and requirements.