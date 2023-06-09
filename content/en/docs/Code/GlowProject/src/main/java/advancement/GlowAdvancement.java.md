+++
categories = ["Documentation"]
title = "GlowAdvancement.java"
+++

## File Summary

- **File Path:** /home/chad/dev/Incubyte/Glowstone/src/main/java/net/glowstone/advancement/GlowAdvancement.java
- **LOC:** 117
- **Last Modified:** 11 months 26 days
- **Number of Commits (Total / Last 6 Months / Last Month):** 10 / 0 / 0
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** 6 / 0 / 0
- **Top Contributors:** mastercoms (4), Chris Hennick (2), Pr0methean (1)

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



## Overview

This code represents a Java implementation of the `GlowAdvancement` class that implements the `Advancement` interface. The main purpose of this class is to handle advancements in a Minecraft game. It stores information such as the advancement key, parent advancement, criteria IDs, requirements, and advancement display.

## Functions

### GlowAdvancement Constructors

There are two constructors for this class:

1. `public GlowAdvancement(NamespacedKey key, GlowAdvancement parent)`: Takes in a NamespacedKey and a parent GlowAdvancement as input. It initializes the key and parent fields with the provided input parameters.

2. `public GlowAdvancement(NamespacedKey key, GlowAdvancement parent, GlowAdvancementDisplay display)`: Takes in a NamespacedKey, a parent GlowAdvancement, and a GlowAdvancementDisplay as input. This constructor initializes the key, parent, and display fields with the provided input parameters.

### addCriterion

This function takes in a string `criterion` and adds it to the `criteriaIds` list if it doesn't already contain the provided criterion.

### addRequirement

This function takes in a list of strings `criteria` and adds it to the `requirements` list.

### getCriteria

This function returns an immutable copy of the `criteriaIds` list.

### getChildren

This function returns `null`. As there is no implementation to retrieve children advancements, it is a violation of the Liskov Substitution Principle (LSP) since it doesn't behave as expected from the implementation of the interface.

### getRoot

This function returns `null`. Similar to `getChildren`, this function violates the LSP because it doesn't behave as expected from the implementation of the interface.

### encode

This function takes in a `ByteBuf` and writes the content of the GlowAdvancement instance into the provided buffer. It returns the same buffer after writing the required data.

### getDisplay

This function returns the `display` field of the GlowAdvancement instance.

## Risks

### Security Issues

No security issues have been identified in this code.

### Bugs

1. Both `getChildren` and `getRoot` functions violate the LSP by returning null instead of providing the expected behavior defined in the Advancement interface.

## Refactoring Opportunities

1. To adhere to the LSP, the implementation for `getChildren` and `getRoot` functions should be updated to provide the expected behavior as per the Advancement interface.

## User Acceptance Criteria

```gherkin
- Feature: GlowAdvancement
  - Scenario: Add a criterion to the GlowAdvancement
    - Given a GlowAdvancement instance
    - When addCriterion() is called with a valid criterion
    - Then the criterion list should be updated with the added criterion
  - Scenario: Add a requirement to the GlowAdvancement
    - Given a GlowAdvancement instance
    - When addRequirement() is called with a valid list of criteria
    - Then the requirements list should be updated with the added requirement
  - Scenario: Write GlowAdvancement data to a byte buffer
    - Given a GlowAdvancement instance
    - When encode() is called with a ByteBuf instance
    - Then the ByteBuf instance should be updated with the GlowAdvancement data
```