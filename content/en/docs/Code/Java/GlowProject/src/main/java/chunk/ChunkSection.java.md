+++
categories = ["Documentation"]
title = "ChunkSection.java"
+++


# Overview
This code implements the `ChunkSection` class, which represents a 16x16x16 cubic section of a chunk in a game (Glowstone) for managing block data, block light and sky light within a chunk. A chunk, in this case, is a unit of the terrain in the world of the Glowstone game.

## ChunkSection
### Class Variables
1. `ARRAY_SIZE`: Integer constant representing the number of blocks in a chunk section.
2. `EMPTY_BLOCK_LIGHT`: Byte constant representing block light level for empty chunk sections.
3. `EMPTY_SKYLIGHT`: Byte constant representing sky light level for empty chunk sections.
4. `DEFAULT_BLOCK_LIGHT`: Byte constant representing default block light level for chunk sections.
5. `DEFAULT_SKYLIGHT`: Byte constant representing default sky light level for chunk sections.
6. `GLOBAL_PALETTE_BITS_PER_BLOCK`: Integer constant representing the number of bits per block used in the global palette.
7. `palette`: An optional `IntList` representing the block palette. It contains unique block types found in the chunk section. If it's `null`, a global palette is used.
8. `data`: A `VariableValueArray` to store the block data (block types for this section).
9. `skyLight`: A `NibbleArray` to store sky light data for the chunk section.
10. `blockLight`: A `NibbleArray` to store block light data for the chunk section.
11. `count`: An integer variable representing the number of non-air blocks in this chunk section, used to determine if the section is empty.

### Constructors
1. `ChunkSection()`: Constructs an empty `ChunkSection` with an array of size `ARRAY_SIZE` containing zeros.
2. `ChunkSection(int[] types)`: Constructs an unlit `ChunkSection` with the given chunk data.
3. `ChunkSection(int[] types, NibbleArray skyLight, NibbleArray blockLight)`: Constructs a `ChunkSection` with the specified chunk data, sky light data, and block light data.
4. `ChunkSection(VariableValueArray data, @Nullable IntList palette, NibbleArray skyLight, NibbleArray blockLight)`: Constructs a `ChunkSection` with the given block data array, optional palette, sky light data, and block light data.

### Methods
1. `loadTypeArray(int[] types)`: Loads the contents of this chunk section from the given type array, initializing the palette.
2. `fromNbt(CompoundTag sectionTag)`: Creates a new chunk section from the given NBT blob.
3. `index(int x, int y, int z)`: Calculates the index into internal arrays for the given coordinates.
4. `recount()`: Recounts the amount of non-air blocks in the chunk section.
5. `snapshot()`: Takes a snapshot of this section which will not reflect future changes.
6. `getBlockData(int x, int y, int z)`: Returns the `BlockData` object for the specified coordinates.
7. `getType(int x, int y, int z)`: Gets the type at the given coordinates.
8. `setType(int x, int y, int z, int value)`: Sets the type at the given coordinates.
9. `getTypes()`: Returns the block type array.
10. `getBlockLight(int x, int y, int z)`: Gets the block light at the given block.
11. `setBlockLight(int x, int y, int z, byte light)`: Sets the block light at the given block.
12. `getSkyLight(int x, int y, int z)`: Gets the sky light at the given block.
13. `setSkyLight(int x, int y, int z, byte light)`: Sets the sky light at the given block.
14. `isEmpty()`: Checks whether this chunk section is empty, i.e., doesn't need to be sent or saved.
15. `writeToBuf(ByteBuf buf, boolean skylight)`: Writes this chunk section to the given ByteBuf.
16. `writeToNbt(CompoundTag sectionTag)`: Writes this chunk section to a NBT compound.

# Risks
## Security Issues
None identified.

## Bugs
The implementation has the same issue that causes MC-80966. It assumes that a chunk section with only air blocks has no meaningful data. This assumption is incorrect for sections near light sources and can create lighting bugs.

# Refactoring opportunities
1. The function `getSize()` and `writeToNbt()` are deprecated and can be removed or replaced with more appropriate implementations.
2. There is duplicated code when creating empty sections (in some constructors). This can be improved by calling the main constructor with appropriate parameters.