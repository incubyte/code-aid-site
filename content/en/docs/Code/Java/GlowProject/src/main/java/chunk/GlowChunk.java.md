+++
categories = ["Documentation"]
title = "GlowChunk.java"
+++


# Overview

This code defines the GlowChunk class, which represents a chunk of the map in a Minecraft world. It includes the data and operations required to manage a chunk's blocks, entities, and block entities. A chunk is a 16x16x256 area in a Minecraft world.

## Functions and methods

### GlowChunk(GlowWorld world, int x, int z)

Constructor for creating a new chunk with a specified X and Z coordinate in a given world.

### toString()

Returns the string representation of the chunk's location in the format "GlowChunk{world, x, z}".

### getBlock(int x, int y, int z)

Returns a GlowBlock at the specified X, Y, and Z coordinates within the chunk.

### getEntities()

Returns an Entity array of the entities residing in this chunk.

### getRawEntities()

Returns a collection of GlowEntity objects in this chunk.

### getTileEntities(boolean useSnapshot)

Returns a BlockState array containing block entities in the chunk. If `useSnapshot` is true, the method throws an UnsupportedOperationException.

### getTileEntities(@NotNull Predicate<Block> blockPredicate, boolean useSnapshot)

Returns a collection of BlockState objects in the chunk matching the specified block predicate.

### getBlockEntities()

Returns a GlowBlockState array containing the block entities residing in this chunk.

### getRawBlockEntities()

Returns an unmodifiable collection of the BlockEntity objects in this chunk.

### isSlimeChunk()

Returns whether the chunk is a slime chunk or not, based on a formula provided in Minecraft Gamepedia.

### getChunkSnapshot()

Returns a snapshot of the chunk.

### getChunkSnapshot(boolean includeMaxBlockY, boolean includeBiome, boolean includeBiomeTempRain