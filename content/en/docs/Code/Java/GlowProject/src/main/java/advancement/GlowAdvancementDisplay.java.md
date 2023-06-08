+++
categories = ["Documentation"]
title = "GlowAdvancementDisplay.java"
+++

## File Summary

- **File Path:** Glowstone\src\main\java\net\glowstone\advancement\GlowAdvancementDisplay.java
- **LOC:** 119
- **Last Modified:** 11 months 25 days
- **Number of Commits (Total / Last 6 Months / Last Month):** 9 / 0 / 0
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** 6 / 0 / 0
- **Top Contributors:** mastercoms (4), Aram Peres (1), momothereal (1)

## Overview

This code is for `GlowAdvancementDisplay` class in the Glowstone Minecraft server project. This class implements the `AdvancementDisplay` interface, representing the data and behavior associated with the visual representation of an advancement in the game. 

## Functions

### Constructor

The class constructor initializes the following fields:

1. `title`: The title for this advancement.
2. `description`: The description for this advancement.
3. `icon`: The icon to represent this advancement.
4. `type`: The type of frame for the icon.
5. `background`: The optional directory for the background to use in this advancement tab (used only for the root advancement).
6. `x`: The x coordinate of the advancement.
7. `y`: The y coordinate of the advancement.

### encode

The `encode` function writes this notification information to a `ByteBuf`:

1. `buf`: the buffer to write to.
2. `hasBackgroundTexture`: Whether the advancement notification has a background texture.
3. `showToast`: Whether or not to show the toast pop up after completing this advancement.
4. `hidden`: Whether or not to hide this advancement and all its children from the advancement screen until this advancement have been completed.

The function returns the given `buf` after writing the notification to it.

### Accessor Functions

Several accessor functions are implemented for this class, which return the values of certain class fields:

1. `frame()`: Returns `type`, the type of icon frame.
2. `title()`: Returns `title`, the title component of the advancement.
3. `description()`: Returns `description`, the description component of the advancement.
4. `icon()`: Returns `icon`, the ItemStack representation of the icon.
5. `doesShowToast()`: Returns `false`, indicating that a toast is not shown when the advancement is completed.
6. `doesAnnounceToChat()`: Returns `false`, indicating that the advancement completion is not announced in chat.
7. `isHidden()`: Returns `false`, indicating that the advancement is not hidden.
8. `backgroundPath()`: Returns `background`, the NamespacedKey of the background path.

## Noteworthy Data Operations

1. The `encode` function writes various elements of the advancement display to a `ByteBuf`.


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


## Risks

### Security Issues

1. It doesn't seem to have any security issues or vulnerabilities in this code.

### Bugs

1. The class should override `title()` and `description()` methods to return typed values instead of `null` values.

## Refactoring Opportunities

1. The `encode` function could refactor the bitwise operation and encoding-related tasks to separate methods to improve readability and maintenance. For example, create methods like `encodeFlags()` and `encodeAdvancementData()`.