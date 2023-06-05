+++
categories = ["Documentation"]
title = "GlowAdvancementDisplay.java"
+++


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

## Risks

### Security Issues

1. It doesn't seem to have any security issues or vulnerabilities in this code.

### Bugs

1. The class should override `title()` and `description()` methods to return typed values instead of `null` values.

## Refactoring Opportunities

1. The `encode` function could refactor the bitwise operation and encoding-related tasks to separate methods to improve readability and maintenance. For example, create methods like `encodeFlags()` and `encodeAdvancementData()`.