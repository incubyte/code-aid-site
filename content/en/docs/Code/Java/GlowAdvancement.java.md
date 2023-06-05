+++
categories = ["Documentation"]
title = "GlowAdvancement.java"
+++


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