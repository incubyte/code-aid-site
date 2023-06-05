+++
categories = ["Documentation"]
title = "GlowChunkSnapshot.java"
+++


# Overview

This code provides an implementation of the `ChunkSnapshot` interface in the form of the `GlowChunkSnapshot` class. This class represents a snapshot of a chunk in the Minecraft world, allowing users to interact with the chunk without risking modification or instability. The class also provides an `EmptySnapshot` subclass, which is an optimization for empty chunks.

## 1. Constructor

The constructor of `GlowChunkSnapshot` initializes a snapshot of a chunk with given coordinates, world, chunk sections, heightmap, biome map, temperature, humidity, and slime chunk flag.

### 1.1 Method: `GlowChunkSnapshot`

```java
public GlowChunkSnapshot(int x, int z, World world, ChunkSection[] sections, byte[] height, byte[] biomes, boolean svTemp, boolean isSlimeChunk) {..}
```

### 1.2 Constructor explanations

 1. Initializes instance variables such as chunk coordinates, world name, and capture full time.
 2. Copies the chunk sections and creates new snapshot instances for each non-null section.
 3. Copies the heightmap and biomes.
 4. If the appropriate flag is set, stores the temperature and humidity data for the chunk at the time of the snapshot.

## 2. Helper methods

### 2.1 Method: `getSection`

Returns the chunk section for the given Y coordinate.

```java
private ChunkSection getSection(int y) {..}
```

### 2.2 Method: `coordToIndex`

Converts 2D chunk coordinates `(x, z)` to the corresponding index in the 1D arrays such as `height`, `temp`, and `humid`.

```java
private int coordToIndex(int x, int z) {..}
```

## 3. Public methods

### 3.1 Method: `getRawHeightmap`

Returns the heightmap of the chunk as an `int[]`.

```java
public int[] getRawHeightmap() {..}
```

### 3.2 Method: `isSectionEmpty`

Checks if the chunk section at the given index is empty or null.

```java
public boolean isSectionEmpty(int sy) {..}
```

### 3.3 Method: `contains`

Currently not supported. Throws `UnsupportedOperationException`.

```java
public boolean contains(@NotNull BlockData blockData) {..}
```

### 3.4 Methods: `getBlockTypeId`, `getBlockType`, `getBlockData`, `getBlockSkyLight`, `getBlockEmittedLight`

These methods provide various details about blocks in the chunk, such as type, data, sky light, and emitted light.

```java
public int getBlockTypeId(int x, int y, int z) {..}
public Material getBlockType(int x, int y, int z) {..}
public BlockData getBlockData(int x, int y, int z) {..}
public int getBlockSkyLight(int x, int y, int z) {..}
public int getBlockEmittedLight(int x, int y, int z) {..}
```

### 3.5 Method: `getHighestBlockYAt`

Returns the highest block Y coordinate at the given `(x, z)`.

```java
public int getHighestBlockYAt(int x, int z) {..}
```

### 3.6 Methods: `getBiome`, `getRawBiomeTemperature`, `getRawBiomeRainfall`

These methods provide information about the biome, temperature, and rainfall at the given chunk coordinates.

```java
public Biome getBiome(int x, int z) {..}
public @NotNull Biome getBiome(int x, int y, int z) {..}
public double getRawBiomeTemperature(int x, int z) {..}
public double getRawBiomeTemperature(int x, int y, int z) {..}
public double getRawBiomeRainfall(int x, int z) {..}
```

## 4. EmptySnapshot Class

A subclass of `GlowChunkSnapshot` used to represent empty chunks. This class overrides relevant methods so that they return default values without needing to access or store unnecessary data.

# Risks

## Security issues

There are no apparent security concerns in the code.

## Bugs

There are no apparent bugs in the code.

# Refactoring opportunities

1. The class could be refactored to implement relevant parts of Minecraft API version 1.16.
2. Currently, `getBiome`, `getRawBiomeTemperature`, and `getRawBiomeRainfall` methods throw an `IndexOutOfBoundsException` for coordinate values out of range. Consider using a default value in these cases.
3. Explore the possibility of further optimizing the `EmptySnapshot` subclass to reduce memory usage and improve performance.