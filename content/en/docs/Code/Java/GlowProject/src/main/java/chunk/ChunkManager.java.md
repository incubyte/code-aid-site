+++
categories = ["Documentation"]
title = "ChunkManager.java"
+++


## Overview

The ChunkManager class handles management of GlowChunk objects in memory, providing the ability to load and unload chunks as required, as well as generating new chunks, populating them, and storing biome information. This class is used in conjunction with a ChunkIoService to read and write chunks to disk.

## Functions

### ChunkManager Constructor

The constructor initializes a new ChunkManager object with the specified I/O service and world generator.

```java
public ChunkManager(GlowWorld world, ChunkIoService service, ChunkGenerator generator)
```

### getChunk

This function retrieves a chunk object representing the specified coordinates (x, and z), whether or not the chunk is loaded.

```java
public GlowChunk getChunk(int x, int z)
public GlowChunk getChunk(GlowChunk.Key key)
```

### isChunkLoaded

This function checks if the chunk at the specified coordinates (x, and z) is loaded.

```java
public boolean isChunkLoaded(int x, int z)
```

### isChunkInUse

This function checks whether a chunk has locks on it preventing it from being unloaded.

```java
public boolean isChunkInUse(int x, int z)
```

### loadChunk

This function attempts to load a chunk with specified coordinates optionally generating the chunk if needed.

```java
public boolean loadChunk(int x, int z, boolean generate)
public boolean loadChunk(GlowChunk chunk, boolean generate)
```

### unloadOldChunks

This method unloads chunks with no locks on them and removes them from the chunk map and lock set.

```java
public void unloadOldChunks()
```

### populateChunk

This function populates a single chunk if needed using block populators.

```java
private void populateChunk(int x, int z, boolean force)
```

### forcePopulation

This function forces a chunk to be populated by loading the chunks in an area around it.

```java
public void forcePopulation(int x, int z)
```

### generateChunk

This function initializes a single chunk from the chunk generator.

```java
private void generateChunk(GlowChunk chunk, int x, int z)
```

### forceRegeneration

This function forces generation of the specified chunk.

```java
public boolean forceRegeneration(int x, int z)
```

### getLoadedChunks

This function returns an array of currently loaded GlowChunks.

```java
public GlowChunk[] getLoadedChunks()
```

### performSave

This method performs save for a given chunk using the storage provider.

```java
public boolean performSave(GlowChunk chunk)
```

### getBiomeGridAtLowerRes and getBiomeGrid

These functions return biome grid information for a chunk. The first one returns the grid at a lower resolution, while the second one returns the grid at full resolution.

```java
public int[] getBiomeGridAtLowerRes(int x, int z, int sizeX, int sizeZ)
public int[] getBiomeGrid(int x, int z, int sizeX, int sizeZ)
```

### broadcastBlockChange and broadcastBlockChanges

These methods queue block change notifications to all players in a specific chunk.

```java
public void broadcastBlockChange(GlowChunk.Key key, BlockChangeMessage message)
public void broadcastBlockChanges(GlowChunk.Key key, Iterable<BlockChangeMessage> messages)
```

### getBlockChanges

This function returns the list of block updates for a given chunk key.

```java
public List<BlockChangeMessage> getBlockChanges(GlowChunk.Key key)
```

### clearChunkBlockChanges

This method clears the block update map.

```java
public void clearChunkBlockChanges()
```

### ChunkLock inner class

This inner class represents a group of locks on chunks, preventing them from being unloaded while in use. It contains methods for acquiring and releasing locks on chunk keys, and clearing all locks.

## Risks

### Security issues

There are no obvious security issues found in the code.

### Bugs

There are no obvious bugs found in the code.

## Refactoring opportunities

1. Remove duplicated code in the `getChunk` methods by consolidating their functionality.
2. Consolidate the two methods `getBiomeGridAtLowerRes` and `getBiomeGrid` into a single method with a parameter specifying the required resolution.
3. Use a more precise type for the `biomes` field in the BiomeGrid class instead of a byte array, to make it more understandable and less prone to errors.
4. Extract the inner classes (BiomeGrid and ChunkLock) to their own separate files for better readability and maintainability.
5. Replace manual array manipulation in `generateChunk` method with more expressive alternatives, such as Java streams.