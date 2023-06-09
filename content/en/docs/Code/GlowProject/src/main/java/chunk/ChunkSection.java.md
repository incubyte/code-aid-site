+++
categories = ["Documentation"]
title = "ChunkSection.java"
+++

## File Summary

- **File Path:** /home/chad/dev/Incubyte/Glowstone/src/main/java/net/glowstone/chunk/ChunkSection.java
- **LOC:** 502
- **Last Modified:** 11 months 28 days
- **Number of Commits (Total / Last 6 Months / Last Month):** 24 / 0 / 0
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** 6 / 0 / 0
- **Top Contributors:** mastercoms (11), momothereal (7), Chris Hennick (2)

{{< details "Code " >}}
```java
package net.glowstone.chunk;

import com.flowpowered.network.util.ByteBufUtils;
import io.netty.buffer.ByteBuf;
import it.unimi.dsi.fastutil.ints.IntArrayList;
import it.unimi.dsi.fastutil.ints.IntList;
import it.unimi.dsi.fastutil.ints.IntListIterator;
import lombok.Getter;
import net.glowstone.GlowServer;
import net.glowstone.util.NibbleArray;
import net.glowstone.util.VariableValueArray;
import net.glowstone.util.nbt.CompoundTag;
import org.bukkit.Bukkit;
import org.bukkit.block.data.BlockData;

import javax.annotation.Nullable;

/**
 * A single cubic section of a chunk, with all data.
 */
public final class ChunkSection {

    /**
     * The number of blocks in a chunk section, and thus the number of elements in all arrays used
     * for it.
     */
    public static final int ARRAY_SIZE = GlowChunk.WIDTH * GlowChunk.HEIGHT * GlowChunk.SEC_DEPTH;
    /**
     * Block light level to use for empty chunk sections.
     */
    public static final byte EMPTY_BLOCK_LIGHT = 0;
    /**
     * Sky light level to use for empty chunk sections.
     */
    public static final byte EMPTY_SKYLIGHT = 0;
    /**
     * The default value for block light, used on new chunk sections.
     */
    public static final byte DEFAULT_BLOCK_LIGHT = 0;
    /**
     * The default value for sky light, used on new chunk sections.
     */
    public static final byte DEFAULT_SKYLIGHT = 0xF;
    /**
     * The number of bits per block used in the global palette.
     */
    public static final int GLOBAL_PALETTE_BITS_PER_BLOCK = 15;

    /**
     * The palette.
     */
    @Nullable
    private IntList palette;
    private VariableValueArray data;
    /**
     * The sky light array. This array is always set, even in dimensions without skylight.
     *
     * @return The sky light array. If the dimension of this chunk section's chunk's world is not
     *     the overworld, this array contains only maximum light levels.
     */
    @Getter
    private NibbleArray skyLight;
    /**
     * The block light array.
     */
    @Getter
    private NibbleArray blockLight;
    /**
     * The number of non-air blocks in this section, used to determine whether it is empty.
     */
    private int count;

    /**
     * Create a new, empty ChunkSection.
     */
    public ChunkSection() {
        this(new int[ARRAY_SIZE]);
    }

    /**
     * <p>Create a new, unlit chunk section with the specified chunk data.</p>
     *
     * <p>This ChunkSection assumes ownership of the arrays passed in, and they should not be
     * further modified.</p>
     *
     * @param types An array of block state IDs for this chunk section (containing type and
     *              metadata)
     */
    public ChunkSection(int[] types) {
        this(types, new NibbleArray(ARRAY_SIZE, DEFAULT_SKYLIGHT),
            new NibbleArray(ARRAY_SIZE, DEFAULT_BLOCK_LIGHT));
    }

    /**
     * <p>Create a ChunkSection with the specified chunk data.</p>
     *
     * <p>This ChunkSection assumes ownership of the arrays passed in, and they should not be
     * further modified.</p>
     *
     * @param types      An array of block types for this chunk section.
     * @param skyLight   An array for skylight data for this chunk section.
     * @param blockLight An array for blocklight data for this chunk section.
     */
    @Deprecated
    public ChunkSection(int[] types, NibbleArray skyLight, NibbleArray blockLight) {
        if (types.length != ARRAY_SIZE || skyLight.size() != ARRAY_SIZE
            || blockLight.size() != ARRAY_SIZE) {
            throw new IllegalArgumentException(
                "An array length was not " + ARRAY_SIZE + ": "
                    + types.length + " " + skyLight.size() + " " + blockLight.size());
        }
        this.skyLight = skyLight;
        this.blockLight = blockLight;

        loadTypeArray(types);
    }

    /**
     * <p>Create a ChunkSection with the specified chunk data.</p>
     *
     * <p>This ChunkSection assumes
     * ownership of the arrays passed in, and they should not be further modified.</p>
     *
     * @param data       An array of blocks in this section.
     * @param palette    The palette that is associated with that data. If null, the global
     *                   palette is used.
     * @param skyLight   An array for skylight data for this chunk section.
     * @param blockLight An array for blocklight data for this chunk section.
     */
    @Deprecated
    public ChunkSection(VariableValueArray data, @Nullable IntList palette, NibbleArray skyLight,
                        NibbleArray blockLight) {
        if (data.getCapacity() != ARRAY_SIZE || skyLight.size() != ARRAY_SIZE || blockLight
            .size() != ARRAY_SIZE) {
            throw new IllegalArgumentException("An array length was not " + ARRAY_SIZE + ": " + data
                .getCapacity() + " " + skyLight.size() + " " + blockLight.size());
        }
        if (palette == null) {
            if (data.getBitsPerValue() != GLOBAL_PALETTE_BITS_PER_BLOCK) {
                throw new IllegalArgumentException("Must use " + GLOBAL_PALETTE_BITS_PER_BLOCK
                    + " bits per block when palette is null (using global palette); got "
                    + data.getBitsPerValue());
            }
        } else {
            if (data.getBitsPerValue() < 4 || data.getBitsPerValue() > 8) {
                throw new IllegalArgumentException("Bits per block must be between 4 and 8 "
                    + "(inclusive) when using a section palette; got "
                    + data.getBitsPerValue());
            }
        }
        this.data = data;
        this.palette = palette;
        this.skyLight = skyLight;
        this.blockLight = blockLight;
    }

    /*
    public ChunkSection(VariableValueArray blockStates, BlockStatePalette palette,
                        NibbleArray skyLight, NibbleArray blockLight) {
        // TODO: initialization
    }
    */

    /**
     * Creates a new unlit chunk section containing the given types.
     *
     * @param types An array of block IDs
     * @return A matching chunk section.
     */
    @Deprecated
    public static ChunkSection fromStateArray(int[] types) {
        if (types.length != ARRAY_SIZE) {
            throw new IllegalArgumentException("Types array length was not " + ARRAY_SIZE + ": "
                + types.length);
        }
        return new ChunkSection(types);
    }

    /**
     * Loads the contents of this chunk section from the given type array, initializing the
     * palette.
     *
     * @param types The type array.
     */
    public void loadTypeArray(int[] types) {
        if (types.length != ARRAY_SIZE) {
            throw new IllegalArgumentException("Types array length was not " + ARRAY_SIZE + ": "
                    + types.length);
        }

        // Build the palette, and the count
        this.count = 0;
        this.palette = new IntArrayList();
        for (int type : types) {
            if (type != 0) {
                count++;
            }

            if (!palette.contains(type)) {
                palette.add(type);
            }
        }
        // Now that we've built a palette, build the list
        int bitsPerBlock = VariableValueArray.calculateNeededBits(palette.size());
        if (bitsPerBlock < 4) {
            bitsPerBlock = 4;
        } else if (bitsPerBlock > 8) {
            palette = null;
            bitsPerBlock = GLOBAL_PALETTE_BITS_PER_BLOCK;
        }
        this.data = new VariableValueArray(bitsPerBlock, ARRAY_SIZE);
        for (int i = 0; i < ARRAY_SIZE; i++) {
            if (palette != null) {
                data.set(i, palette.indexOf(types[i]));
            } else {
                data.set(i, types[i]);
            }
        }
    }

    /**
     * Creates a new chunk section from the given NBT blob.
     *
     * @param sectionTag The tag to read from
     * @return The section
     */
    public static ChunkSection fromNbt(CompoundTag sectionTag) {
        int[] types = sectionTag.getIntArray("Blocks");
        NibbleArray blockLight = new NibbleArray(sectionTag.getByteArray("BlockLight"));
        NibbleArray skyLight = new NibbleArray(sectionTag.getByteArray("SkyLight"));

        return new ChunkSection(types, skyLight, blockLight);
    }

    /**
     * Calculate the index into internal arrays for the given coordinates.
     *
     * @param x The x coordinate, for east and west.
     * @param y The y coordinate, for up and down.
     * @param z The z coordinate, for north and south.
     * @return The index.
     */
    public int index(int x, int y, int z) {
        if (x < 0 || z < 0 || x >= GlowChunk.WIDTH || z >= GlowChunk.HEIGHT) {
            throw new IndexOutOfBoundsException(
                "Coords (x=" + x + ",z=" + z + ") out of section bounds");
        }
        return (y & 0xf) << 8 | z << 4 | x;
    }

    /**
     * Recount the amount of non-air blocks in the chunk section.
     */
    public void recount() {
        count = 0;
        for (int i = 0; i < ARRAY_SIZE; i++) {
            int type = data.get(i);
            if (palette != null) {
                type = palette.getInt(type);
            }
            if (type != 0) {
                count++;
            }
        }
    }

    /**
     * Take a snapshot of this section which will not reflect future changes.
     *
     * @return The snapshot for this section.
     */
    public ChunkSection snapshot() {
        return new ChunkSection(data
            .clone(), palette == null ? null : new IntArrayList(palette), skyLight
            .snapshot(), blockLight.snapshot());
    }

    public BlockData getBlockData(int x, int y, int z) {
        int type = getType(x, y, z);
        return ((GlowServer) Bukkit.getServer()).getBlockDataManager().convertToBlockData(type);
    }

    /**
     * Gets the type at the given coordinates.
     *
     * @param x The x coordinate, for east and west.
     * @param y The y coordinate, for up and down.
     * @param z The z coordinate, for north and south.
     * @return A type ID
     */
    public int getType(int x, int y, int z) {
        int value = data.get(index(x, y, z));
        if (palette != null) {
            value = palette.getInt(value);
        }
        return value;
    }

    /**
     * Sets the type at the given coordinates.
     *
     * @param x     The x coordinate, for east and west.
     * @param y     The y coordinate, for up and down.
     * @param z     The z coordinate, for north and south.
     * @param value The new type ID for that coordinate.
     */
    public void setType(int x, int y, int z, int value) {
        int oldType = getType(x, y, z);
        if (oldType != 0) {
            count--;
        }
        if (value != 0) {
            count++;
        }

        int encoded;
        if (palette != null) {
            encoded = palette.indexOf(value);
            if (encoded == -1) {
                encoded = palette.size();
                palette.add(value);
                if (encoded > data.getLargestPossibleValue()) {
                    // This is the situation where it can become expensive:
                    // resize the array
                    if (data.getBitsPerValue() == 8) {
                        data = data.increaseBitsPerValueTo(GLOBAL_PALETTE_BITS_PER_BLOCK);
                        // No longer using the global palette; need to manually
                        // recalculate
                        for (int i = 0; i < ARRAY_SIZE; i++) {
                            int oldValue = data.get(i);
                            int newValue = palette.getInt(oldValue);
                            data.set(i, newValue);
                        }
                        palette = null;
                        encoded = value;
                    } else {
                        // Using the global palette: automatically resize
                        data = data.increaseBitsPerValueTo(data.getBitsPerValue() + 1);
                    }
                }
            }
        } else {
            encoded = value;
        }
        data.set(index(x, y, z), encoded);
    }

    /**
     * Returns the block type array. Do not modify this array.
     *
     * @return The block type array.
     */
    public int[] getTypes() {
        int[] types = new int[ARRAY_SIZE];
        for (int i = 0; i < ARRAY_SIZE; i++) {
            int type = data.get(i);
            if (palette != null) {
                type = palette.getInt(type);
            }
            types[i] = type;
        }
        return types;
    }

    /**
     * Gets the block light at the given block.
     *
     * @param x The x coordinate, for east and west.
     * @param y The y coordinate, for up and down.
     * @param z The z coordinate, for north and south.
     * @return The block light at the given coordinates.
     */
    public byte getBlockLight(int x, int y, int z) {
        return blockLight.get(index(x, y, z));
    }

    /**
     * Sets the block light at the given block.
     *
     * @param x     The x coordinate, for east and west.
     * @param y     The y coordinate, for up and down.
     * @param z     The z coordinate, for north and south.
     * @param light The new light level.
     */
    public void setBlockLight(int x, int y, int z, byte light) {
        blockLight.set(index(x, y, z), light);
    }

    /**
     * Gets the sky light at the given block.
     *
     * @param x The x coordinate, for east and west.
     * @param y The y coordinate, for up and down.
     * @param z The z coordinate, for north and south.
     * @return The sky light at the given coordinates.
     */
    public byte getSkyLight(int x, int y, int z) {
        return skyLight.get(index(x, y, z));
    }

    /**
     * Sets the sky light at the given block.
     *
     * @param x     The x coordinate, for east and west.
     * @param y     The y coordinate, for up and down.
     * @param z     The z coordinate, for north and south.
     * @param light The new light level.
     */
    public void setSkyLight(int x, int y, int z, byte light) {
        skyLight.set(index(x, y, z), light);
    }

    /**
     * <p>Checks whether this chunk section is empty, IE doesn't need to be sent or saved.</p>
     *
     * <p>This implementation has the same issue that causes
     * <a href="https://bugs.mojang.com/browse/MC-80966">MC-80966</a>:</p>
     *
     * <p>It assumes that a chunk section with only air blocks has no meaningful data.
     * This assumption is incorrect for sections near light sources, which can create lighting bugs.
     * However, it is more expensive to send additional sections with just light data.</p>
     *
     * @return True if this chunk section is empty and can be removed.
     */
    public boolean isEmpty() {
        return count == 0;
    }

    /**
     * Writes this chunk section to the given ByteBuf.
     *
     * @param buf      The buffer to write to.
     * @param skylight True if skylight should be included.
     * @throws IllegalStateException If this chunk section {@linkplain #isEmpty() is empty}
     */
    public void writeToBuf(ByteBuf buf, boolean skylight) throws IllegalStateException {
        if (this.isEmpty()) {
            throw new IllegalStateException("Can't write empty sections");
        }

        buf.writeByte(data.getBitsPerValue()); // Bit per value -> varies
        if (palette != null) {
            ByteBufUtils.writeVarInt(buf, palette.size()); // Palette size
            // Foreach loops can't be used due to autoboxing
            IntListIterator itr = palette.iterator();
            while (itr.hasNext()) {
                ByteBufUtils.writeVarInt(buf, itr.nextInt()); // The palette entry
            }
        }
        long[] backing = data.getBacking();
        ByteBufUtils.writeVarInt(buf, backing.length);
        buf.ensureWritable((backing.length << 3) + blockLight.byteSize() + (skylight ? skyLight
            .byteSize() : 0));
        for (long value : backing) {
            buf.writeLong(value);
        }

        // Palette
        ByteBufUtils.writeVarInt(buf, 1); // Palette length
        ByteBufUtils.writeVarInt(buf, 0); // Palette data (AIR)

        // Section data (4096 indices of 4-bit, 64 bit longs -> 256 empty longs)
        ByteBufUtils.writeVarInt(buf, 256); // Data size
        buf.writeBytes(new byte[2048]); // 256 longs is 2048 bytes

        // buf.writeByte(data.getBitsPerValue()); // Bit per value -> varies

        // if (palette == null) {
        //     ByteBufUtils.writeVarInt(buf, 0); // Palette size -> 0 -> Use the global palette
        // } else {
        //     ByteBufUtils.writeVarInt(buf, palette.size()); // Palette size
        //     // Foreach loops can't be used due to autoboxing
        //     IntListIterator itr = palette.iterator();
        //     while (itr.hasNext()) {
        //         ByteBufUtils.writeVarInt(buf, itr.nextInt()); // The palette entry
        //     }
        // }
        // long[] backing = data.getBacking();
        // ByteBufUtils.writeVarInt(buf, backing.length);
        // buf.ensureWritable((backing.length << 3) + blockLight.byteSize() + (skylight ? skyLight
        //         .byteSize() : 0));
        // for (long value : backing) {
        //     buf.writeLong(value);
        // }

        // buf.writeBytes(blockLight.getRawData());
        // if (skylight) {
        //     buf.writeBytes(skyLight.getRawData());
        // }
    }

    /**
     * Writes this chunk section to a NBT compound. Note that the Y coordinate is not written.
     *
     * @param sectionTag The tag to write to
     */
    public void writeToNbt(CompoundTag sectionTag) {
        sectionTag.putIntArray("Blocks", getTypes());
        sectionTag.putByteArray("BlockLight", blockLight.getRawData());
        sectionTag.putByteArray("SkyLight", skyLight.getRawData());
    }
}

```
{{< /details >}}



## Overview
The given script represents a Java implementation of a single cubic section of a chunk, with all the data. A chunk section is a 16x16x16 part of a chunk in the Minecraft world.

## Explanation
1. Import statements and initialization of constants, instance variables, and constructor.
2. ChunkSection constructors and methods for creating ChunkSections using various input parameters.
3. Methods for data handling, like: getting block data, getting and setting types, light levels (block light and sky light), checking if the chunk section is empty, etc.
4. Methods for working with ByteBuf like: writeToBuf for writing chunk section to ByteBuf.
5. Methods for working with NBT tags like: writeToNbt for writing a chunk section to a NBT compound.

### Initializing Constants and Instance Variables
- ARRAY_SIZE: Number of blocks in a chunk section.
- EMPTY_BLOCK_LIGHT: Block light level for empty chunk sections.
- EMPTY_SKYLIGHT: Sky light level for empty chunk sections.
- DEFAULT_BLOCK_LIGHT: Default value for block light, used on new chunk sections.
- DEFAULT_SKYLIGHT: Default value for sky light, used on new chunk sections.
- GLOBAL_PALETTE_BITS_PER_BLOCK: The number of bits per block used in the global palette.

### Constructors
- **ChunkSection()**: Creates an empty ChunkSection.
- **ChunkSection(int[] types)**: Creates a new unlit chunk section using the specified chunk data (block state IDs).
- **ChunkSection(int[] types, NibbleArray skyLight, NibbleArray blockLight)**: Deprecated constructor which creates a ChunkSection with specified chunk data, skylight data, and blocklight data.
- **ChunkSection(VariableValueArray data, IntList palette, NibbleArray skyLight, NibbleArray blockLight)**: Deprecated constructor which creates a ChunkSection with specified parameters.

### Public Methods
- **fromStateArray(int[] types)**: Creates a new unlit chunk section containing the given block types.
- **loadTypeArray(int[] types)**: Loads the contents of this chunk section by initializing the palette and count.
- **fromNbt(CompoundTag sectionTag)**: Creates a new chunk section from the given NBT blob.
- **index(int x, int y, int z)**: Calculate the index into internal arrays for the given coordinates.
- **recount()**: Recount the amount of non-air blocks in the chunk section.
- **snapshot()**: Take a snapshot of this section which will not reflect future changes.
- **getBlockData(int x, int y, int z)**: Get the BlockData object for the block at the given coordinates.
- **getType(int x, int y, int z)**: Gets the type at the given coordinates.
- **setType(int x, int y, int z, int value)**: Sets the type at the given coordinates.
- **getTypes()**: Returns an integer array containing the types within this chunk section.
- **getBlockLight(int x, int y, int z)**: Gets the block light at the given block.
- **setBlockLight(int x, int y, int z, byte light)**: Sets the block light at the given block.
- **getSkyLight(int x, int y, int z)**: Gets the sky light at the given block.
- **setSkyLight(int x, int y, int z, byte light)**: Sets the sky light at the given block.
- **isEmpty()**: Checks whether this chunk section is empty (i.e., doesn't need to be sent or saved).
- **writeToBuf(ByteBuf buf, boolean skylight)**: Writes this chunk section to the given ByteBuf.
- **writeToNbt(CompoundTag sectionTag)**: Writes this chunk section to a NBT compound.

## Risks
### Security Issues
Currently, there are no apparent security issues.

### Bugs
Currently, no bugs have been identified.

## Refactoring Opportunities
There might be opportunities to refactor the code by possibly simplifying or combining the multiple constructors, or removing the deprecated constructors.

## User Acceptance Criteria

```gherkin
Feature: ChunkSection actions

  Scenario: Creating a new empty chunk section
    Given an empty ChunkSection
    When created
    Then the new ChunkSection should be empty

  Scenario: Loading the contents of this chunk section
    Given an initialized palette
    When loadTypeArray is called
    Then the Palette and count should be updated accordingly

  Scenario: Getting and setting block light
    Given a ChunkSection
    When calling getBlockLight with valid coordinates
    Then the block light level should be returned
    And when calling setBlockLight with valid coordinates and a new light level
    The new block light level should be set at the given coordinates

  Scenario: Getting and setting sky light
    Given a ChunkSection
    When calling getSkyLight with valid coordinates
    Then the sky light level should be returned
    And when calling setSkyLight with valid coordinates and a new light level
    The new sky light level should be set at the given coordinates

  Scenario: Calculating the index
    Given a ChunkSection and valid coordinates
    When calling index with the coordinates
    Then the index for the given coordinates should be calculated
```