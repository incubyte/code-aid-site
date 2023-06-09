+++
categories = ["Documentation"]
title = "GlowAdvancementDisplay.java"
+++

## File Summary

- **File Path:** /home/chad/dev/Incubyte/Glowstone/src/main/java/net/glowstone/advancement/GlowAdvancementDisplay.java
- **LOC:** 119
- **Last Modified:** 11 months 26 days
- **Number of Commits (Total / Last 6 Months / Last Month):** 9 / 0 / 0
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** 6 / 0 / 0
- **Top Contributors:** mastercoms (4), Aram Peres (1), momothereal (1)

{{< details "Code " >}}
```java
package net.glowstone.advancement;

import com.flowpowered.network.util.ByteBufUtils;
import io.netty.buffer.ByteBuf;
import io.papermc.paper.advancement.AdvancementDisplay;
import lombok.Data;
import net.glowstone.net.GlowBufUtils;
import net.glowstone.util.TextMessage;
import net.kyori.adventure.text.Component;
import org.bukkit.NamespacedKey;
import org.bukkit.inventory.ItemStack;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.io.IOException;
import java.util.Objects;


@Data
public class GlowAdvancementDisplay implements AdvancementDisplay {
    private static final int HAS_BACKGROUND_TEXTURE = 0x1;
    private static final int SHOW_TOAST = 0x2;
    private static final int HIDDEN = 0x4;
    /**
     * The title for this advancement
     */
    private final TextMessage title;
    /**
     * The description for this advancement
     */
    private final TextMessage description;
    /**
     * The icon to represent this advancement
     */
    private final ItemStack icon;
    /**
     * The type of frame for the icon
     */
    private final AdvancementDisplay.Frame type;
    /**
     * The optional directory for the background to use in this advancement tab (used only for the root advancement)
     */
    private final NamespacedKey background;
    /**
     * The x coordinate of the advancement
     */
    private final float x;
    /**
     * The y coordinate of the advancement
     */
    private final float y;

    /**
     * Writes this notification to the given {@link ByteBuf}.
     *
     * @param buf                  the buffer to write to
     * @param hasBackgroundTexture Whether the advancement notification has a background texture
     * @param showToast            Whether or not to show the toast pop up after completing this advancement
     * @param hidden               Whether or not to hide this advancement and all its children from the advancement screen until this advancement have been completed
     * @return {@code buf}, with this notification written to it
     * @throws IOException if a string is too long
     */
    public ByteBuf encode(ByteBuf buf, boolean hasBackgroundTexture, boolean showToast,
                          boolean hidden) throws IOException {
        int flags = (hasBackgroundTexture ? HAS_BACKGROUND_TEXTURE : 0)
            | (showToast ? SHOW_TOAST : 0)
            | (hidden ? HIDDEN : 0);

        GlowBufUtils.writeChat(buf, title);
        GlowBufUtils.writeChat(buf, description);
        GlowBufUtils.writeSlot(buf, icon);
        ByteBufUtils.writeVarInt(buf, type.ordinal());
        buf.writeInt(flags);
        ByteBufUtils.writeUTF8(buf, Objects.toString(background, null));
        buf.writeFloat(x);
        buf.writeFloat(y);
        return buf;
    }

    @Override
    public @NotNull Frame frame() {
        return type;
    }

    @Override
    public @NotNull Component title() {
        return null;
    }

    @Override
    public @NotNull Component description() {
        return null;
    }

    @Override
    public @NotNull ItemStack icon() {
        return icon;
    }

    @Override
    public boolean doesShowToast() {
        return false;
    }

    @Override
    public boolean doesAnnounceToChat() {
        return false;
    }

    @Override
    public boolean isHidden() {
        return false;
    }

    @Override
    public @Nullable NamespacedKey backgroundPath() {
        return background;
    }
}

```
{{< /details >}}



## Overview

This class handles the display information for a specified Minecraft advancement. Primarily, it stores the title, description, icon, frame type, background, and coordinates. In addition, it provides methods to encode the display information into a ByteBuf object for transmission.

## Function by Function Explanation

### Public Constructor

```java
public GlowAdvancementDisplay(TextMessage title, TextMessage description, ItemStack icon, AdvancementDisplay.Frame type, NamespacedKey background, float x, float y)
```
This constructor initializes the GlowAdvancementDisplay object with the given title, description, icon, frame type, background, and x, y coordinates.

### Encode Method

```java
public ByteBuf encode(ByteBuf buf, boolean hasBackgroundTexture, boolean showToast, boolean hidden) throws IOException
```

This method encodes the advancement display information into a ByteBuf. It takes the existing buffer, background texture, toast flag, and hidden flag as parameters. The method then constructs an integer, `flags`, representing the different flags and writes the information to the given buffer.

1. Write `title` and `description` to the buffer using GlowBufUtils.writeChat
2. Write `icon` to the buffer using GlowBufUtils.writeSlot
3. Write the ordinal value of `type` to the buffer using ByteBufUtils.writeVarInt
4. Write the `flags` integer to the buffer
5. Write the `background` as strings to the buffer using ByteBufUtils.writeUTF8
6. Write the `x` and `y` coordinate values to the buffer

### Overrides

The following overridden methods return specific values for the advancement display:

- frame(): Returns the `type` (Frame).
- title(): Returns null since the title is of type TextMessage and not Component (which is expected in the original method).
- description(): Similar to title, returns null.
- icon(): Returns the `icon` (ItemStack).
- doesShowToast(), doesAnnounceToChat(), and isHidden(): All return false, as they are not part of the GlowAdvancementDisplay implementation.
- backgroundPath(): Returns the `background` (NamespacedKey).

## Risks

### Security Issues

No security issues are found in this class.

### Bugs

No critical bugs are detected in this class.

## Refactoring Opportunities

1. In the overridden methods title() and description(), convert the TextMessage object to the Component type to return the correct value.
2. Implement the missing features in the doesShowToast(), doesAnnounceToChat(), and isHidden() methods, which currently return false by default.

## User Acceptance Criteria

### Gherkin Scripts

```gherkin
Feature: GlowAdvancementDisplay
  Scenario: Create and encode a GlowAdvancementDisplay
    Given a title, description, icon, frame type, background, and x, y coordinates
    When creating a new GlowAdvancementDisplay object
    Then the object should be initialized with the provided data
    And when encoding the object to a ByteBuf
    Then the buffer should contain the advancement display information
```