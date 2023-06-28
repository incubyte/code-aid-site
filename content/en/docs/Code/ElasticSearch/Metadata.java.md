+++
categories = ["Documentation"]
title = "Metadata.java"
+++

## File Summary

- **File Path:** src\main\Metadata.java
- **LOC:** 2754
- **Last Modified:** 21 hours 30 minutes
- **Number of Commits (Total / Last 6 Months / Last Month):** 1 / 1 / 1
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** 1 / 1 / 1
- **Top Contributors:** visrut (1)

{{< details "File source code " >}}
```java
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

package org.elasticsearch.cluster.metadata;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.lucene.util.CollectionUtil;
import org.elasticsearch.TransportVersion;
import org.elasticsearch.cluster.ClusterState;
import org.elasticsearch.cluster.Diff;
import org.elasticsearch.cluster.Diffable;
import org.elasticsearch.cluster.DiffableUtils;
import org.elasticsearch.cluster.NamedDiffable;
import org.elasticsearch.cluster.NamedDiffableValueSerializer;
import org.elasticsearch.cluster.SimpleDiffable;
import org.elasticsearch.cluster.block.ClusterBlock;
import org.elasticsearch.cluster.block.ClusterBlockLevel;
import org.elasticsearch.cluster.coordination.CoordinationMetadata;
import org.elasticsearch.cluster.coordination.PublicationTransportHandler;
import org.elasticsearch.cluster.metadata.IndexAbstraction.ConcreteIndex;
import org.elasticsearch.cluster.routing.RoutingTable;
import org.elasticsearch.common.Strings;
import org.elasticsearch.common.UUIDs;
import org.elasticsearch.common.collect.ImmutableOpenMap;
import org.elasticsearch.common.collect.Iterators;
import org.elasticsearch.common.io.stream.StreamInput;
import org.elasticsearch.common.io.stream.StreamOutput;
import org.elasticsearch.common.io.stream.VersionedNamedWriteable;
import org.elasticsearch.common.regex.Regex;
import org.elasticsearch.common.settings.Setting;
import org.elasticsearch.common.settings.Setting.Property;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.util.ArrayUtils;
import org.elasticsearch.common.util.Maps;
import org.elasticsearch.common.util.set.Sets;
import org.elasticsearch.common.xcontent.ChunkedToXContent;
import org.elasticsearch.common.xcontent.ChunkedToXContentHelper;
import org.elasticsearch.common.xcontent.XContentHelper;
import org.elasticsearch.common.xcontent.XContentParserUtils;
import org.elasticsearch.core.Nullable;
import org.elasticsearch.gateway.MetadataStateFormat;
import org.elasticsearch.index.Index;
import org.elasticsearch.index.IndexMode;
import org.elasticsearch.index.IndexNotFoundException;
import org.elasticsearch.index.IndexSettings;
import org.elasticsearch.index.IndexVersion;
import org.elasticsearch.plugins.MapperPlugin;
import org.elasticsearch.rest.RestStatus;
import org.elasticsearch.transport.Transports;
import org.elasticsearch.xcontent.NamedObjectNotFoundException;
import org.elasticsearch.xcontent.NamedXContentRegistry;
import org.elasticsearch.xcontent.ToXContent;
import org.elasticsearch.xcontent.XContentBuilder;
import org.elasticsearch.xcontent.XContentParser;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.function.BiPredicate;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.elasticsearch.cluster.metadata.LifecycleExecutionState.ILM_CUSTOM_METADATA_KEY;
import static org.elasticsearch.common.settings.Settings.readSettingsFromStream;
import static org.elasticsearch.index.IndexSettings.PREFER_ILM_SETTING;

/**
 * {@link Metadata} is the part of the {@link ClusterState} which persists across restarts. This persistence is XContent-based, so a
 * round-trip through XContent must be faithful in {@link XContentContext#GATEWAY} context.
 * <p>
 * The details of how this is persisted are covered in {@link org.elasticsearch.gateway.PersistedClusterStateService}.
 * </p>
 */
public class Metadata implements Iterable<IndexMetadata>, Diffable<Metadata>, ChunkedToXContent {

    private static final Logger logger = LogManager.getLogger(Metadata.class);

    public static final Runnable ON_NEXT_INDEX_FIND_MAPPINGS_NOOP = () -> {};
    public static final String ALL = "_all";
    public static final String UNKNOWN_CLUSTER_UUID = "_na_";

    public enum XContentContext {
        /* Custom metadata should be returned as part of API call */
        API,

        /* Custom metadata should be stored as part of the persistent cluster state */
        GATEWAY,

        /* Custom metadata should be stored as part of a snapshot */
        SNAPSHOT
    }

    /**
     * Indicates that this custom metadata will be returned as part of an API call but will not be persisted
     */
    public static EnumSet<XContentContext> API_ONLY = EnumSet.of(XContentContext.API);

    /**
     * Indicates that this custom metadata will be returned as part of an API call and will be persisted between
     * node restarts, but will not be a part of a snapshot global state
     */
    public static EnumSet<XContentContext> API_AND_GATEWAY = EnumSet.of(XContentContext.API, XContentContext.GATEWAY);

    /**
     * Indicates that this custom metadata will be returned as part of an API call and stored as a part of
     * a snapshot global state, but will not be persisted between node restarts
     */
    public static EnumSet<XContentContext> API_AND_SNAPSHOT = EnumSet.of(XContentContext.API, XContentContext.SNAPSHOT);

    /**
     * Indicates that this custom metadata will be returned as part of an API call, stored as a part of
     * a snapshot global state, and will be persisted between node restarts
     */
    public static EnumSet<XContentContext> ALL_CONTEXTS = EnumSet.allOf(XContentContext.class);

    /**
     * Custom metadata that persists (via XContent) across restarts. The deserialization method for each implementation must be registered
     * with the {@link NamedXContentRegistry}.
     */
    public interface Custom extends NamedDiffable<Custom>, ChunkedToXContent {

        EnumSet<XContentContext> context();

        /**
         * @return true if this custom could be restored from snapshot
         */
        default boolean isRestorable() {
            return context().contains(XContentContext.SNAPSHOT);
        }
    }

    public static final Setting<Boolean> SETTING_READ_ONLY_SETTING = Setting.boolSetting(
        "cluster.blocks.read_only",
        false,
        Property.Dynamic,
        Property.NodeScope
    );

    public static final ClusterBlock CLUSTER_READ_ONLY_BLOCK = new ClusterBlock(
        6,
        "cluster read-only (api)",
        false,
        false,
        false,
        RestStatus.FORBIDDEN,
        EnumSet.of(ClusterBlockLevel.WRITE, ClusterBlockLevel.METADATA_WRITE)
    );

    public static final Setting<Boolean> SETTING_READ_ONLY_ALLOW_DELETE_SETTING = Setting.boolSetting(
        "cluster.blocks.read_only_allow_delete",
        false,
        Property.Dynamic,
        Property.NodeScope
    );

    public static final ClusterBlock CLUSTER_READ_ONLY_ALLOW_DELETE_BLOCK = new ClusterBlock(
        13,
        "cluster read-only / allow delete (api)",
        false,
        false,
        true,
        RestStatus.FORBIDDEN,
        EnumSet.of(ClusterBlockLevel.WRITE, ClusterBlockLevel.METADATA_WRITE)
    );

    public static final Metadata EMPTY_METADATA = builder().build();

    public static final String CONTEXT_MODE_PARAM = "context_mode";

    public static final String CONTEXT_MODE_SNAPSHOT = XContentContext.SNAPSHOT.toString();

    public static final String CONTEXT_MODE_GATEWAY = XContentContext.GATEWAY.toString();

    public static final String CONTEXT_MODE_API = XContentContext.API.toString();

    public static final String DEDUPLICATED_MAPPINGS_PARAM = "deduplicated_mappings";
    public static final String GLOBAL_STATE_FILE_PREFIX = "global-";

    private static final NamedDiffableValueSerializer<Custom> CUSTOM_VALUE_SERIALIZER = new NamedDiffableValueSerializer<>(Custom.class);

    private final String clusterUUID;
    private final boolean clusterUUIDCommitted;
    private final long version;

    private final CoordinationMetadata coordinationMetadata;

    private final Settings transientSettings;
    private final Settings persistentSettings;
    private final Settings settings;
    private final DiffableStringMap hashesOfConsistentSettings;
    private final ImmutableOpenMap<String, IndexMetadata> indices;
    private final ImmutableOpenMap<String, Set<Index>> aliasedIndices;
    private final ImmutableOpenMap<String, IndexTemplateMetadata> templates;
    private final ImmutableOpenMap<String, Custom> customs;
    private final Map<String, ReservedStateMetadata> reservedStateMetadata;

    private final transient int totalNumberOfShards; // Transient ? not serializable anyway?
    private final int totalOpenIndexShards;

    private final String[] allIndices;
    private final String[] visibleIndices;
    private final String[] allOpenIndices;
    private final String[] visibleOpenIndices;
    private final String[] allClosedIndices;
    private final String[] visibleClosedIndices;

    private volatile SortedMap<String, IndexAbstraction> indicesLookup;
    private final Map<String, MappingMetadata> mappingsByHash;

    private final IndexVersion oldestIndexVersion;

    private Metadata(
        String clusterUUID,
        boolean clusterUUIDCommitted,
        long version,
        CoordinationMetadata coordinationMetadata,
        Settings transientSettings,
        Settings persistentSettings,
        Settings settings,
        DiffableStringMap hashesOfConsistentSettings,
        int totalNumberOfShards,
        int totalOpenIndexShards,
        ImmutableOpenMap<String, IndexMetadata> indices,
        ImmutableOpenMap<String, Set<Index>> aliasedIndices,
        ImmutableOpenMap<String, IndexTemplateMetadata> templates,
        ImmutableOpenMap<String, Custom> customs,
        String[] allIndices,
        String[] visibleIndices,
        String[] allOpenIndices,
        String[] visibleOpenIndices,
        String[] allClosedIndices,
        String[] visibleClosedIndices,
        SortedMap<String, IndexAbstraction> indicesLookup,
        Map<String, MappingMetadata> mappingsByHash,
        IndexVersion oldestIndexVersion,
        Map<String, ReservedStateMetadata> reservedStateMetadata
    ) {
        this.clusterUUID = clusterUUID;
        this.clusterUUIDCommitted = clusterUUIDCommitted;
        this.version = version;
        this.coordinationMetadata = coordinationMetadata;
        this.transientSettings = transientSettings;
        this.persistentSettings = persistentSettings;
        this.settings = settings;
        this.hashesOfConsistentSettings = hashesOfConsistentSettings;
        this.indices = indices;
        this.aliasedIndices = aliasedIndices;
        this.customs = customs;
        this.templates = templates;
        this.totalNumberOfShards = totalNumberOfShards;
        this.totalOpenIndexShards = totalOpenIndexShards;
        this.allIndices = allIndices;
        this.visibleIndices = visibleIndices;
        this.allOpenIndices = allOpenIndices;
        this.visibleOpenIndices = visibleOpenIndices;
        this.allClosedIndices = allClosedIndices;
        this.visibleClosedIndices = visibleClosedIndices;
        this.indicesLookup = indicesLookup;
        this.mappingsByHash = mappingsByHash;
        this.oldestIndexVersion = oldestIndexVersion;
        this.reservedStateMetadata = reservedStateMetadata;
        assert assertConsistent();
    }

    private boolean assertConsistent() {
        final var lookup = this.indicesLookup;
        final var dsMetadata = custom(DataStreamMetadata.TYPE, DataStreamMetadata.EMPTY);
        assert lookup == null || lookup.equals(Builder.buildIndicesLookup(dsMetadata, indices));
        try {
            Builder.ensureNoNameCollisions(aliasedIndices.keySet(), indices, dsMetadata);
        } catch (Exception e) {
            assert false : e;
        }
        assert Builder.assertDataStreams(indices, dsMetadata);
        assert Set.of(allIndices).equals(indices.keySet());
        final Function<Predicate<IndexMetadata>, Set<String>> indicesByPredicate = predicate -> indices.entrySet()
            .stream()
            .filter(entry -> predicate.test(entry.getValue()))
            .map(Map.Entry::getKey)
            .collect(Collectors.toUnmodifiableSet());
        assert Set.of(allOpenIndices).equals(indicesByPredicate.apply(idx -> idx.getState() == IndexMetadata.State.OPEN));
        assert Set.of(allClosedIndices).equals(indicesByPredicate.apply(idx -> idx.getState() == IndexMetadata.State.CLOSE));
        assert Set.of(visibleIndices).equals(indicesByPredicate.apply(idx -> idx.isHidden() == false));
        assert Set.of(visibleOpenIndices)
            .equals(indicesByPredicate.apply(idx -> idx.isHidden() == false && idx.getState() == IndexMetadata.State.OPEN));
        assert Set.of(visibleClosedIndices)
            .equals(indicesByPredicate.apply(idx -> idx.isHidden() == false && idx.getState() == IndexMetadata.State.CLOSE));
        return true;
    }

    public Metadata withIncrementedVersion() {
        return new Metadata(
            clusterUUID,
            clusterUUIDCommitted,
            version + 1,
            coordinationMetadata,
            transientSettings,
            persistentSettings,
            settings,
            hashesOfConsistentSettings,
            totalNumberOfShards,
            totalOpenIndexShards,
            indices,
            aliasedIndices,
            templates,
            customs,
            allIndices,
            visibleIndices,
            allOpenIndices,
            visibleOpenIndices,
            allClosedIndices,
            visibleClosedIndices,
            indicesLookup,
            mappingsByHash,
            oldestIndexVersion,
            reservedStateMetadata
        );
    }

    /**
     * Given an index and lifecycle state, returns a metadata where the lifecycle state will be
     * associated with the given index.
     *
     * The passed-in index must already be present in the cluster state, this method cannot
     * be used to add an index.
     *
     * @param index A non-null index
     * @param lifecycleState A non-null lifecycle execution state
     * @return a <code>Metadata</code> instance where the index has the provided lifecycle state
     */
    public Metadata withLifecycleState(final Index index, final LifecycleExecutionState lifecycleState) {
        Objects.requireNonNull(index, "index must not be null");
        Objects.requireNonNull(lifecycleState, "lifecycleState must not be null");

        IndexMetadata indexMetadata = getIndexSafe(index);
        if (lifecycleState.equals(indexMetadata.getLifecycleExecutionState())) {
            return this;
        }

        // build a new index metadata with the version incremented and the new lifecycle state
        IndexMetadata.Builder indexMetadataBuilder = IndexMetadata.builder(indexMetadata);
        indexMetadataBuilder.version(indexMetadataBuilder.version() + 1);
        indexMetadataBuilder.putCustom(ILM_CUSTOM_METADATA_KEY, lifecycleState.asMap());

        // drop it into the indices
        final ImmutableOpenMap.Builder<String, IndexMetadata> builder = ImmutableOpenMap.builder(indices);
        builder.put(index.getName(), indexMetadataBuilder.build());

        // construct a new Metadata object directly rather than using Metadata.builder(this).[...].build().
        // the Metadata.Builder validation needs to handle the general case where anything at all could
        // have changed, and hence it is expensive -- since we are changing so little about the metadata
        // (and at a leaf in the object tree), we can bypass that validation for efficiency's sake
        return new Metadata(
            clusterUUID,
            clusterUUIDCommitted,
            version,
            coordinationMetadata,
            transientSettings,
            persistentSettings,
            settings,
            hashesOfConsistentSettings,
            totalNumberOfShards,
            totalOpenIndexShards,
            builder.build(),
            aliasedIndices,
            templates,
            customs,
            allIndices,
            visibleIndices,
            allOpenIndices,
            visibleOpenIndices,
            allClosedIndices,
            visibleClosedIndices,
            indicesLookup,
            mappingsByHash,
            oldestIndexVersion,
            reservedStateMetadata
        );
    }

    public Metadata withIndexSettingsUpdates(final Map<Index, Settings> updates) {
        Objects.requireNonNull(updates, "no indices to update settings for");

        final ImmutableOpenMap.Builder<String, IndexMetadata> builder = ImmutableOpenMap.builder(indices);
        updates.forEach((index, settings) -> {
            IndexMetadata previous = builder.remove(index.getName());
            assert previous != null : index;
            builder.put(
                index.getName(),
                IndexMetadata.builder(previous).settingsVersion(previous.getSettingsVersion() + 1L).settings(settings).build()
            );
        });
        return new Metadata(
            clusterUUID,
            clusterUUIDCommitted,
            version,
            coordinationMetadata,
            transientSettings,
            persistentSettings,
            settings,
            hashesOfConsistentSettings,
            totalNumberOfShards,
            totalOpenIndexShards,
            builder.build(),
            aliasedIndices,
            templates,
            customs,
            allIndices,
            visibleIndices,
            allOpenIndices,
            visibleOpenIndices,
            allClosedIndices,
            visibleClosedIndices,
            indicesLookup,
            mappingsByHash,
            oldestIndexVersion,
            reservedStateMetadata
        );
    }

    public Metadata withCoordinationMetadata(CoordinationMetadata coordinationMetadata) {
        return new Metadata(
            clusterUUID,
            clusterUUIDCommitted,
            version,
            coordinationMetadata,
            transientSettings,
            persistentSettings,
            settings,
            hashesOfConsistentSettings,
            totalNumberOfShards,
            totalOpenIndexShards,
            indices,
            aliasedIndices,
            templates,
            customs,
            allIndices,
            visibleIndices,
            allOpenIndices,
            visibleOpenIndices,
            allClosedIndices,
            visibleClosedIndices,
            indicesLookup,
            mappingsByHash,
            oldestIndexVersion,
            reservedStateMetadata
        );
    }

    public Metadata withLastCommittedValues(
        boolean clusterUUIDCommitted,
        CoordinationMetadata.VotingConfiguration lastCommittedConfiguration
    ) {
        if (clusterUUIDCommitted == this.clusterUUIDCommitted
            && lastCommittedConfiguration.equals(this.coordinationMetadata.getLastCommittedConfiguration())) {
            return this;
        }
        return new Metadata(
            clusterUUID,
            clusterUUIDCommitted,
            version,
            CoordinationMetadata.builder(coordinationMetadata).lastCommittedConfiguration(lastCommittedConfiguration).build(),
            transientSettings,
            persistentSettings,
            settings,
            hashesOfConsistentSettings,
            totalNumberOfShards,
            totalOpenIndexShards,
            indices,
            aliasedIndices,
            templates,
            customs,
            allIndices,
            visibleIndices,
            allOpenIndices,
            visibleOpenIndices,
            allClosedIndices,
            visibleClosedIndices,
            indicesLookup,
            mappingsByHash,
            oldestIndexVersion,
            reservedStateMetadata
        );
    }

    /**
     * Creates a copy of this instance updated with the given {@link IndexMetadata} that must only contain changes to primary terms
     * and in-sync allocation ids relative to the existing entries. This method is only used by
     * {@link org.elasticsearch.cluster.routing.allocation.IndexMetadataUpdater#applyChanges(Metadata, RoutingTable)}.
     * @param updates map of index name to {@link IndexMetadata}.
     * @return updated metadata instance
     */
    public Metadata withAllocationAndTermUpdatesOnly(Map<String, IndexMetadata> updates) {
        if (updates.isEmpty()) {
            return this;
        }
        final var updatedIndicesBuilder = ImmutableOpenMap.builder(indices);
        updatedIndicesBuilder.putAllFromMap(updates);
        return new Metadata(
            clusterUUID,
            clusterUUIDCommitted,
            version,
            coordinationMetadata,
            transientSettings,
            persistentSettings,
            settings,
            hashesOfConsistentSettings,
            totalNumberOfShards,
            totalOpenIndexShards,
            updatedIndicesBuilder.build(),
            aliasedIndices,
            templates,
            customs,
            allIndices,
            visibleIndices,
            allOpenIndices,
            visibleOpenIndices,
            allClosedIndices,
            visibleClosedIndices,
            indicesLookup,
            mappingsByHash,
            oldestIndexVersion,
            reservedStateMetadata
        );
    }

    /**
     * Creates a copy of this instance with the given {@code index} added.
     * @param index index to add
     * @return copy with added index
     */
    public Metadata withAddedIndex(IndexMetadata index) {
        final String indexName = index.getIndex().getName();
        ensureNoNameCollision(indexName);
        final Map<String, AliasMetadata> aliases = index.getAliases();
        final ImmutableOpenMap<String, Set<Index>> updatedAliases = aliasesAfterAddingIndex(index, aliases);
        final String[] updatedVisibleIndices;
        if (index.isHidden()) {
            updatedVisibleIndices = visibleIndices;
        } else {
            updatedVisibleIndices = ArrayUtils.append(visibleIndices, indexName);
        }

        final String[] updatedAllIndices = ArrayUtils.append(allIndices, indexName);
        final String[] updatedOpenIndices;
        final String[] updatedClosedIndices;
        final String[] updatedVisibleOpenIndices;
        final String[] updatedVisibleClosedIndices;
        switch (index.getState()) {
            case OPEN -> {
                updatedOpenIndices = ArrayUtils.append(allOpenIndices, indexName);
                if (index.isHidden() == false) {
                    updatedVisibleOpenIndices = ArrayUtils.append(visibleOpenIndices, indexName);
                } else {
                    updatedVisibleOpenIndices = visibleOpenIndices;
                }
                updatedVisibleClosedIndices = visibleClosedIndices;
                updatedClosedIndices = allClosedIndices;
            }
            case CLOSE -> {
                updatedOpenIndices = allOpenIndices;
                updatedClosedIndices = ArrayUtils.append(allClosedIndices, indexName);
                updatedVisibleOpenIndices = visibleOpenIndices;
                if (index.isHidden() == false) {
                    updatedVisibleClosedIndices = ArrayUtils.append(visibleClosedIndices, indexName);
                } else {
                    updatedVisibleClosedIndices = visibleClosedIndices;
                }
            }
            default -> throw new AssertionError("impossible, index is either open or closed");
        }

        final MappingMetadata mappingMetadata = index.mapping();
        final Map<String, MappingMetadata> updatedMappingsByHash;
        if (mappingMetadata == null) {
            updatedMappingsByHash = mappingsByHash;
        } else {
            final MappingMetadata existingMapping = mappingsByHash.get(mappingMetadata.getSha256());
            if (existingMapping != null) {
                index = index.withMappingMetadata(existingMapping);
                updatedMappingsByHash = mappingsByHash;
            } else {
                updatedMappingsByHash = Maps.copyMapWithAddedEntry(mappingsByHash, mappingMetadata.getSha256(), mappingMetadata);
            }
        }

        final ImmutableOpenMap.Builder<String, IndexMetadata> builder = ImmutableOpenMap.builder(indices);
        builder.put(indexName, index);
        final ImmutableOpenMap<String, IndexMetadata> indicesMap = builder.build();
        for (var entry : updatedAliases.entrySet()) {
            List<IndexMetadata> aliasIndices = entry.getValue().stream().map(idx -> indicesMap.get(idx.getName())).toList();
            Builder.validateAlias(entry.getKey(), aliasIndices);
        }
        return new Metadata(
            clusterUUID,
            clusterUUIDCommitted,
            version,
            coordinationMetadata,
            transientSettings,
            persistentSettings,
            settings,
            hashesOfConsistentSettings,
            totalNumberOfShards + index.getTotalNumberOfShards(),
            totalOpenIndexShards + (index.getState() == IndexMetadata.State.OPEN ? index.getTotalNumberOfShards() : 0),
            indicesMap,
            updatedAliases,
            templates,
            customs,
            updatedAllIndices,
            updatedVisibleIndices,
            updatedOpenIndices,
            updatedVisibleOpenIndices,
            updatedClosedIndices,
            updatedVisibleClosedIndices,
            null,
            updatedMappingsByHash,
            IndexVersion.min(IndexVersion.fromId(index.getCompatibilityVersion().id), oldestIndexVersion),
            reservedStateMetadata
        );
    }

    private ImmutableOpenMap<String, Set<Index>> aliasesAfterAddingIndex(IndexMetadata index, Map<String, AliasMetadata> aliases) {
        if (aliases.isEmpty()) {
            return aliasedIndices;
        }
        final String indexName = index.getIndex().getName();
        final ImmutableOpenMap.Builder<String, Set<Index>> aliasesBuilder = ImmutableOpenMap.builder(aliasedIndices);
        for (String alias : aliases.keySet()) {
            ensureNoNameCollision(alias);
            if (aliasedIndices.containsKey(indexName)) {
                throw new IllegalArgumentException("alias with name [" + indexName + "] already exists");
            }
            final Set<Index> found = aliasesBuilder.get(alias);
            final Set<Index> updated;
            if (found == null) {
                updated = Set.of(index.getIndex());
            } else {
                final Set<Index> tmp = new HashSet<>(found);
                tmp.add(index.getIndex());
                updated = Set.copyOf(tmp);
            }
            aliasesBuilder.put(alias, updated);
        }
        return aliasesBuilder.build();
    }

    private void ensureNoNameCollision(String indexName) {
        if (indices.containsKey(indexName)) {
            throw new IllegalArgumentException("index with name [" + indexName + "] already exists");
        }
        if (dataStreams().containsKey(indexName)) {
            throw new IllegalArgumentException("data stream with name [" + indexName + "] already exists");
        }
        if (dataStreamAliases().containsKey(indexName)) {
            throw new IllegalStateException("data stream alias and indices alias have the same name (" + indexName + ")");
        }
    }

    public long version() {
        return this.version;
    }

    public String clusterUUID() {
        return this.clusterUUID;
    }

    /**
     * Whether the current node with the given cluster state is locked into the cluster with the UUID returned by {@link #clusterUUID()},
     * meaning that it will not accept any cluster state with a different clusterUUID.
     */
    public boolean clusterUUIDCommitted() {
        return this.clusterUUIDCommitted;
    }

    /**
     * Returns the merged transient and persistent settings.
     */
    public Settings settings() {
        return this.settings;
    }

    public Settings transientSettings() {
        return this.transientSettings;
    }

    public Settings persistentSettings() {
        return this.persistentSettings;
    }

    public Map<String, String> hashesOfConsistentSettings() {
        return this.hashesOfConsistentSettings;
    }

    public CoordinationMetadata coordinationMetadata() {
        return this.coordinationMetadata;
    }

    public IndexVersion oldestIndexVersion() {
        return this.oldestIndexVersion;
    }

    public boolean equalsAliases(Metadata other) {
        for (IndexMetadata otherIndex : other.indices().values()) {
            IndexMetadata thisIndex = index(otherIndex.getIndex());
            if (thisIndex == null) {
                return false;
            }
            if (otherIndex.getAliases().equals(thisIndex.getAliases()) == false) {
                return false;
            }
        }

        if (other.dataStreamAliases().size() != dataStreamAliases().size()) {
            return false;
        }
        for (DataStreamAlias otherAlias : other.dataStreamAliases().values()) {
            DataStreamAlias thisAlias = dataStreamAliases().get(otherAlias.getName());
            if (thisAlias == null) {
                return false;
            }
            if (thisAlias.equals(otherAlias) == false) {
                return false;
            }
        }

        return true;
    }

    public boolean indicesLookupInitialized() {
        return indicesLookup != null;
    }

    public SortedMap<String, IndexAbstraction> getIndicesLookup() {
        SortedMap<String, IndexAbstraction> lookup = indicesLookup;
        if (lookup == null) {
            lookup = buildIndicesLookup();
        }
        return lookup;
    }

    private synchronized SortedMap<String, IndexAbstraction> buildIndicesLookup() {
        SortedMap<String, IndexAbstraction> i = indicesLookup;
        if (i != null) {
            return i;
        }
        i = Builder.buildIndicesLookup(custom(DataStreamMetadata.TYPE, DataStreamMetadata.EMPTY), indices);
        indicesLookup = i;
        return i;
    }

    public boolean sameIndicesLookup(Metadata other) {
        return this.indicesLookup == other.indicesLookup;
    }

    /**
     * Finds the specific index aliases that point to the requested concrete indices directly
     * or that match with the indices via wildcards.
     *
     * @param concreteIndices The concrete indices that the aliases must point to in order to be returned.
     * @return A map of index name to the list of aliases metadata. If a concrete index does not have matching
     * aliases then the result will <b>not</b> include the index's key.
     */
    public Map<String, List<AliasMetadata>> findAllAliases(final String[] concreteIndices) {
        return findAliases(Strings.EMPTY_ARRAY, concreteIndices);
    }

    /**
     * Finds the specific index aliases that match with the specified aliases directly or partially via wildcards, and
     * that point to the specified concrete indices (directly or matching indices via wildcards).
     *
     * @param aliases The aliases to look for. Might contain include or exclude wildcards.
     * @param concreteIndices The concrete indices that the aliases must point to in order to be returned
     * @return A map of index name to the list of aliases metadata. If a concrete index does not have matching
     * aliases then the result will <b>not</b> include the index's key.
     */
    public Map<String, List<AliasMetadata>> findAliases(final String[] aliases, final String[] concreteIndices) {
        assert aliases != null;
        assert concreteIndices != null;
        if (concreteIndices.length == 0) {
            return ImmutableOpenMap.of();
        }
        String[] patterns = new String[aliases.length];
        boolean[] include = new boolean[aliases.length];
        for (int i = 0; i < aliases.length; i++) {
            String alias = aliases[i];
            if (alias.charAt(0) == '-') {
                patterns[i] = alias.substring(1);
                include[i] = false;
            } else {
                patterns[i] = alias;
                include[i] = true;
            }
        }
        boolean matchAllAliases = patterns.length == 0;
        ImmutableOpenMap.Builder<String, List<AliasMetadata>> mapBuilder = ImmutableOpenMap.builder();
        for (String index : concreteIndices) {
            IndexMetadata indexMetadata = indices.get(index);
            List<AliasMetadata> filteredValues = new ArrayList<>();
            for (AliasMetadata aliasMetadata : indexMetadata.getAliases().values()) {
                boolean matched = matchAllAliases;
                String alias = aliasMetadata.alias();
                for (int i = 0; i < patterns.length; i++) {
                    if (include[i]) {
                        if (matched == false) {
                            String pattern = patterns[i];
                            matched = ALL.equals(pattern) || Regex.simpleMatch(pattern, alias);
                        }
                    } else if (matched) {
                        matched = Regex.simpleMatch(patterns[i], alias) == false;
                    }
                }
                if (matched) {
                    filteredValues.add(aliasMetadata);
                }
            }
            if (filteredValues.isEmpty() == false) {
                // Make the list order deterministic
                CollectionUtil.timSort(filteredValues, Comparator.comparing(AliasMetadata::alias));
                mapBuilder.put(index, Collections.unmodifiableList(filteredValues));
            }
        }
        return mapBuilder.build();
    }

    /**
     * Finds all mappings for concrete indices. Only fields that match the provided field
     * filter will be returned (default is a predicate that always returns true, which can be
     * overridden via plugins)
     *
     * @see MapperPlugin#getFieldFilter()
     *
     * @param onNextIndex a hook that gets notified for each index that's processed
     */
    public Map<String, MappingMetadata> findMappings(
        String[] concreteIndices,
        Function<String, Predicate<String>> fieldFilter,
        Runnable onNextIndex
    ) {
        assert Transports.assertNotTransportThread("decompressing mappings is too expensive for a transport thread");

        assert concreteIndices != null;
        if (concreteIndices.length == 0) {
            return ImmutableOpenMap.of();
        }

        ImmutableOpenMap.Builder<String, MappingMetadata> indexMapBuilder = ImmutableOpenMap.builder();
        Set<String> indicesKeys = indices.keySet();
        Stream.of(concreteIndices).filter(indicesKeys::contains).forEach(index -> {
            onNextIndex.run();
            IndexMetadata indexMetadata = indices.get(index);
            Predicate<String> fieldPredicate = fieldFilter.apply(index);
            indexMapBuilder.put(index, filterFields(indexMetadata.mapping(), fieldPredicate));
        });
        return indexMapBuilder.build();
    }

    /**
     * Finds the parent data streams, if any, for the specified concrete indices.
     */
    public Map<String, DataStream> findDataStreams(String... concreteIndices) {
        assert concreteIndices != null;
        final ImmutableOpenMap.Builder<String, DataStream> builder = ImmutableOpenMap.builder();
        final SortedMap<String, IndexAbstraction> lookup = getIndicesLookup();
        for (String indexName : concreteIndices) {
            IndexAbstraction index = lookup.get(indexName);
            assert index != null;
            assert index.getType() == IndexAbstraction.Type.CONCRETE_INDEX;
            if (index.getParentDataStream() != null) {
                builder.put(indexName, index.getParentDataStream());
            }
        }
        return builder.build();
    }

    @SuppressWarnings("unchecked")
    private static MappingMetadata filterFields(MappingMetadata mappingMetadata, Predicate<String> fieldPredicate) {
        if (mappingMetadata == null) {
            return MappingMetadata.EMPTY_MAPPINGS;
        }
        if (fieldPredicate == MapperPlugin.NOOP_FIELD_PREDICATE) {
            return mappingMetadata;
        }
        Map<String, Object> sourceAsMap = XContentHelper.convertToMap(mappingMetadata.source().compressedReference(), true).v2();
        Map<String, Object> mapping;
        if (sourceAsMap.size() == 1 && sourceAsMap.containsKey(mappingMetadata.type())) {
            mapping = (Map<String, Object>) sourceAsMap.get(mappingMetadata.type());
        } else {
            mapping = sourceAsMap;
        }

        Map<String, Object> properties = (Map<String, Object>) mapping.get("properties");
        if (properties == null || properties.isEmpty()) {
            return mappingMetadata;
        }

        filterFields("", properties, fieldPredicate);

        return new MappingMetadata(mappingMetadata.type(), sourceAsMap);
    }

    @SuppressWarnings("unchecked")
    private static boolean filterFields(String currentPath, Map<String, Object> fields, Predicate<String> fieldPredicate) {
        assert fieldPredicate != MapperPlugin.NOOP_FIELD_PREDICATE;
        Iterator<Map.Entry<String, Object>> entryIterator = fields.entrySet().iterator();
        while (entryIterator.hasNext()) {
            Map.Entry<String, Object> entry = entryIterator.next();
            String newPath = mergePaths(currentPath, entry.getKey());
            Object value = entry.getValue();
            boolean mayRemove = true;
            boolean isMultiField = false;
            if (value instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) value;
                Map<String, Object> properties = (Map<String, Object>) map.get("properties");
                if (properties != null) {
                    mayRemove = filterFields(newPath, properties, fieldPredicate);
                } else {
                    Map<String, Object> subFields = (Map<String, Object>) map.get("fields");
                    if (subFields != null) {
                        isMultiField = true;
                        if (mayRemove = filterFields(newPath, subFields, fieldPredicate)) {
                            map.remove("fields");
                        }
                    }
                }
            } else {
                throw new IllegalStateException("cannot filter mappings, found unknown element of type [" + value.getClass() + "]");
            }

            // only remove a field if it has no sub-fields left and it has to be excluded
            if (fieldPredicate.test(newPath) == false) {
                if (mayRemove) {
                    entryIterator.remove();
                } else if (isMultiField) {
                    // multi fields that should be excluded but hold subfields that don't have to be excluded are converted to objects
                    Map<String, Object> map = (Map<String, Object>) value;
                    Map<String, Object> subFields = (Map<String, Object>) map.get("fields");
                    assert subFields.size() > 0;
                    map.put("properties", subFields);
                    map.remove("fields");
                    map.remove("type");
                }
            }
        }
        // return true if the ancestor may be removed, as it has no sub-fields left
        return fields.size() == 0;
    }

    private static String mergePaths(String path, String field) {
        if (path.length() == 0) {
            return field;
        }
        return path + "." + field;
    }

    /**
     * Returns all the concrete indices.
     */
    public String[] getConcreteAllIndices() {
        return allIndices;
    }

    /**
     * Returns all the concrete indices that are not hidden.
     */
    public String[] getConcreteVisibleIndices() {
        return visibleIndices;
    }

    /**
     * Returns all of the concrete indices that are open.
     */
    public String[] getConcreteAllOpenIndices() {
        return allOpenIndices;
    }

    /**
     * Returns all of the concrete indices that are open and not hidden.
     */
    public String[] getConcreteVisibleOpenIndices() {
        return visibleOpenIndices;
    }

    /**
     * Returns all of the concrete indices that are closed.
     */
    public String[] getConcreteAllClosedIndices() {
        return allClosedIndices;
    }

    /**
     * Returns all of the concrete indices that are closed and not hidden.
     */
    public String[] getConcreteVisibleClosedIndices() {
        return visibleClosedIndices;
    }

    /**
     * Returns indexing routing for the given <code>aliasOrIndex</code>. Resolves routing from the alias metadata used
     * in the write index.
     */
    public String resolveWriteIndexRouting(@Nullable String routing, String aliasOrIndex) {
        if (aliasOrIndex == null) {
            return routing;
        }

        IndexAbstraction result = getIndicesLookup().get(aliasOrIndex);
        if (result == null || result.getType() != IndexAbstraction.Type.ALIAS) {
            return routing;
        }
        Index writeIndexName = result.getWriteIndex();
        if (writeIndexName == null) {
            throw new IllegalArgumentException("alias [" + aliasOrIndex + "] does not have a write index");
        }
        AliasMetadata writeIndexAliasMetadata = index(writeIndexName).getAliases().get(result.getName());
        if (writeIndexAliasMetadata != null) {
            return resolveRouting(routing, aliasOrIndex, writeIndexAliasMetadata);
        } else {
            return routing;
        }
    }

    /**
     * Returns indexing routing for the given index.
     */
    // TODO: This can be moved to IndexNameExpressionResolver too, but this means that we will support wildcards and other expressions
    // in the index,bulk,update and delete apis.
    public String resolveIndexRouting(@Nullable String routing, String aliasOrIndex) {
        if (aliasOrIndex == null) {
            return routing;
        }

        IndexAbstraction result = getIndicesLookup().get(aliasOrIndex);
        if (result == null || result.getType() != IndexAbstraction.Type.ALIAS) {
            return routing;
        }
        if (result.getIndices().size() > 1) {
            rejectSingleIndexOperation(aliasOrIndex, result);
        }
        return resolveRouting(routing, aliasOrIndex, AliasMetadata.getFirstAliasMetadata(this, result));
    }

    private static String resolveRouting(@Nullable String routing, String aliasOrIndex, AliasMetadata aliasMd) {
        if (aliasMd.indexRouting() != null) {
            if (aliasMd.indexRouting().indexOf(',') != -1) {
                throw new IllegalArgumentException(
                    "index/alias ["
                        + aliasOrIndex
                        + "] provided with routing value ["
                        + aliasMd.getIndexRouting()
                        + "] that resolved to several routing values, rejecting operation"
                );
            }
            if (routing != null) {
                if (routing.equals(aliasMd.indexRouting()) == false) {
                    throw new IllegalArgumentException(
                        "Alias ["
                            + aliasOrIndex
                            + "] has index routing associated with it ["
                            + aliasMd.indexRouting()
                            + "], and was provided with routing value ["
                            + routing
                            + "], rejecting operation"
                    );
                }
            }
            // Alias routing overrides the parent routing (if any).
            return aliasMd.indexRouting();
        }
        return routing;
    }

    private static void rejectSingleIndexOperation(String aliasOrIndex, IndexAbstraction result) {
        String[] indexNames = new String[result.getIndices().size()];
        int i = 0;
        for (Index indexName : result.getIndices()) {
            indexNames[i++] = indexName.getName();
        }
        throw new IllegalArgumentException(
            "Alias ["
                + aliasOrIndex
                + "] has more than one index associated with it ["
                + Arrays.toString(indexNames)
                + "], can't execute a single index op"
        );
    }

    /**
     * Checks whether an index exists (as of this {@link Metadata} with the given name. Does not check aliases or data streams.
     * @param index An index name that may or may not exist in the cluster.
     * @return {@code true} if a concrete index with that name exists, {@code false} otherwise.
     */
    public boolean hasIndex(String index) {
        return indices.containsKey(index);
    }

    /**
     * Checks whether an index exists. Similar to {@link Metadata#hasIndex(String)}, but ensures that the index has the same UUID as
     * the given {@link Index}.
     * @param index An {@link Index} object that may or may not exist in the cluster.
     * @return {@code true} if an index exists with the same name and UUID as the given index object, {@code false} otherwise.
     */
    public boolean hasIndex(Index index) {
        IndexMetadata metadata = index(index.getName());
        return metadata != null && metadata.getIndexUUID().equals(index.getUUID());
    }

    /**
     * Checks whether an index abstraction (that is, index, alias, or data stream) exists (as of this {@link Metadata} with the given name.
     * @param index An index name that may or may not exist in the cluster.
     * @return {@code true} if an index abstraction with that name exists, {@code false} otherwise.
     */
    public boolean hasIndexAbstraction(String index) {
        return getIndicesLookup().containsKey(index);
    }

    public IndexMetadata index(String index) {
        return indices.get(index);
    }

    public IndexMetadata index(Index index) {
        IndexMetadata metadata = index(index.getName());
        if (metadata != null && metadata.getIndexUUID().equals(index.getUUID())) {
            return metadata;
        }
        return null;
    }

    /** Returns true iff existing index has the same {@link IndexMetadata} instance */
    public boolean hasIndexMetadata(final IndexMetadata indexMetadata) {
        return indices.get(indexMetadata.getIndex().getName()) == indexMetadata;
    }

    /**
     * Returns the {@link IndexMetadata} for this index.
     * @throws IndexNotFoundException if no metadata for this index is found
     */
    public IndexMetadata getIndexSafe(Index index) {
        IndexMetadata metadata = index(index.getName());
        if (metadata != null) {
            if (metadata.getIndexUUID().equals(index.getUUID())) {
                return metadata;
            }
            throw new IndexNotFoundException(
                index,
                new IllegalStateException(
                    "index uuid doesn't match expected: [" + index.getUUID() + "] but got: [" + metadata.getIndexUUID() + "]"
                )
            );
        }
        throw new IndexNotFoundException(index);
    }

    public Map<String, IndexMetadata> indices() {
        return this.indices;
    }

    public Map<String, IndexMetadata> getIndices() {
        return indices();
    }

    /**
     * Returns whether an alias exists with provided alias name.
     *
     * @param aliasName The provided alias name
     * @return whether an alias exists with provided alias name
     */
    public boolean hasAlias(String aliasName) {
        return aliasedIndices.containsKey(aliasName) || dataStreamAliases().containsKey(aliasName);
    }

    /**
     * Returns all the indices that the alias with the provided alias name refers to.
     * These are aliased indices. Not that, this only return indices that have been aliased
     * and not indices that are behind a data stream or data stream alias.
     *
     * @param aliasName The provided alias name
     * @return all aliased indices by the alias with the provided alias name
     */
    public Set<Index> aliasedIndices(String aliasName) {
        Objects.requireNonNull(aliasName);
        return aliasedIndices.getOrDefault(aliasName, Set.of());
    }

    /**
     * @return the names of all indices aliases.
     */
    public Set<String> aliasedIndices() {
        return aliasedIndices.keySet();
    }

    public Map<String, IndexTemplateMetadata> templates() {
        return this.templates;
    }

    public Map<String, IndexTemplateMetadata> getTemplates() {
        return templates();
    }

    public Map<String, ComponentTemplate> componentTemplates() {
        return Optional.ofNullable((ComponentTemplateMetadata) this.custom(ComponentTemplateMetadata.TYPE))
            .map(ComponentTemplateMetadata::componentTemplates)
            .orElse(Collections.emptyMap());
    }

    public Map<String, ComposableIndexTemplate> templatesV2() {
        return Optional.ofNullable((ComposableIndexTemplateMetadata) this.custom(ComposableIndexTemplateMetadata.TYPE))
            .map(ComposableIndexTemplateMetadata::indexTemplates)
            .orElse(Collections.emptyMap());
    }

    public boolean isTimeSeriesTemplate(ComposableIndexTemplate indexTemplate) {
        var template = indexTemplate.template();
        if (indexTemplate.getDataStreamTemplate() == null || template == null) {
            return false;
        }

        var settings = MetadataIndexTemplateService.resolveSettings(indexTemplate, componentTemplates());
        // Not using IndexSettings.MODE.get() to avoid validation that may fail at this point.
        var rawIndexMode = settings.get(IndexSettings.MODE.getKey());
        var indexMode = rawIndexMode != null ? Enum.valueOf(IndexMode.class, rawIndexMode.toUpperCase(Locale.ROOT)) : null;
        if (indexMode == IndexMode.TIME_SERIES) {
            // No need to check for the existence of index.routing_path here, because index.mode=time_series can't be specified without it.
            // Setting validation takes care of this.
            // Also no need to validate that the fields defined in index.routing_path are keyword fields with time_series_dimension
            // attribute enabled. This is validated elsewhere (DocumentMapper).
            return true;
        }

        // in a followup change: check the existence of keyword fields of type keyword and time_series_dimension attribute enabled in
        // the template. In this case the index.routing_path setting can be generated from the mapping.

        return false;
    }

    public Map<String, DataStream> dataStreams() {
        return this.custom(DataStreamMetadata.TYPE, DataStreamMetadata.EMPTY).dataStreams();
    }

    public Map<String, DataStreamAlias> dataStreamAliases() {
        return this.custom(DataStreamMetadata.TYPE, DataStreamMetadata.EMPTY).getDataStreamAliases();
    }

    public NodesShutdownMetadata nodeShutdowns() {
        return custom(NodesShutdownMetadata.TYPE, NodesShutdownMetadata.EMPTY);
    }

    /**
     * Indicates if the provided index is managed by ILM. This takes into account if the index is part of
     * data stream that's potentially managed by DLM and the value of the {@link org.elasticsearch.index.IndexSettings#PREFER_ILM_SETTING}
     */
    public boolean isIndexManagedByILM(IndexMetadata indexMetadata) {
        if (Strings.hasText(indexMetadata.getLifecyclePolicyName()) == false) {
            // no ILM policy configured so short circuit this to *not* managed by ILM
            return false;
        }

        IndexAbstraction indexAbstraction = getIndicesLookup().get(indexMetadata.getIndex().getName());
        if (indexAbstraction == null) {
            // index doesn't exist anymore
            return false;
        }

        DataStream parentDataStream = indexAbstraction.getParentDataStream();
        if (parentDataStream != null && parentDataStream.getLifecycle() != null) {
            // index has both ILM and DLM configured so let's check which is preferred
            return PREFER_ILM_SETTING.get(indexMetadata.getSettings());
        }

        return true;
    }

    public Map<String, Custom> customs() {
        return this.customs;
    }

    /**
     * Returns the full {@link ReservedStateMetadata} Map for all
     * reserved state namespaces.
     * @return a map of namespace to {@link ReservedStateMetadata}
     */
    public Map<String, ReservedStateMetadata> reservedStateMetadata() {
        return this.reservedStateMetadata;
    }

    /**
     * The collection of index deletions in the cluster.
     */
    public IndexGraveyard indexGraveyard() {
        return custom(IndexGraveyard.TYPE);
    }

    @SuppressWarnings("unchecked")
    public <T extends Custom> T custom(String type) {
        return (T) customs.get(type);
    }

    @SuppressWarnings("unchecked")
    public <T extends Custom> T custom(String type, T defaultValue) {
        return (T) customs.getOrDefault(type, defaultValue);
    }

    /**
     * Gets the total number of shards from all indices, including replicas and
     * closed indices.
     * @return The total number shards from all indices.
     */
    public int getTotalNumberOfShards() {
        return this.totalNumberOfShards;
    }

    /**
     * Gets the total number of open shards from all indices. Includes
     * replicas, but does not include shards that are part of closed indices.
     * @return The total number of open shards from all indices.
     */
    public int getTotalOpenIndexShards() {
        return this.totalOpenIndexShards;
    }

    @Override
    public Iterator<IndexMetadata> iterator() {
        return indices.values().iterator();
    }

    public Stream<IndexMetadata> stream() {
        return indices.values().stream();
    }

    public int size() {
        return indices.size();
    }

    public static boolean isGlobalStateEquals(Metadata metadata1, Metadata metadata2) {
        if (metadata1.coordinationMetadata.equals(metadata2.coordinationMetadata) == false) {
            return false;
        }
        if (metadata1.persistentSettings.equals(metadata2.persistentSettings) == false) {
            return false;
        }
        if (metadata1.hashesOfConsistentSettings.equals(metadata2.hashesOfConsistentSettings) == false) {
            return false;
        }
        if (metadata1.templates.equals(metadata2.templates()) == false) {
            return false;
        }
        if (metadata1.clusterUUID.equals(metadata2.clusterUUID) == false) {
            return false;
        }
        if (metadata1.clusterUUIDCommitted != metadata2.clusterUUIDCommitted) {
            return false;
        }
        // Check if any persistent metadata needs to be saved
        int customCount1 = 0;
        for (Map.Entry<String, Custom> cursor : metadata1.customs.entrySet()) {
            if (cursor.getValue().context().contains(XContentContext.GATEWAY)) {
                if (cursor.getValue().equals(metadata2.custom(cursor.getKey())) == false) {
                    return false;
                }
                customCount1++;
            }
        }
        int customCount2 = 0;
        for (Custom custom : metadata2.customs.values()) {
            if (custom.context().contains(XContentContext.GATEWAY)) {
                customCount2++;
            }
        }
        if (customCount1 != customCount2) {
            return false;
        }
        if (Objects.equals(metadata1.reservedStateMetadata, metadata2.reservedStateMetadata) == false) {
            return false;
        }
        return true;
    }

    @Override
    public Diff<Metadata> diff(Metadata previousState) {
        return new MetadataDiff(previousState, this);
    }

    public static Diff<Metadata> readDiffFrom(StreamInput in) throws IOException {
        if (in.getTransportVersion().onOrAfter(MetadataDiff.NOOP_METADATA_DIFF_VERSION) && in.readBoolean()) {
            return SimpleDiffable.empty();
        }
        return new MetadataDiff(in);
    }

    public static Metadata fromXContent(XContentParser parser) throws IOException {
        return Builder.fromXContent(parser);
    }

    @Override
    public Iterator<? extends ToXContent> toXContentChunked(ToXContent.Params p) {
        XContentContext context = XContentContext.valueOf(p.param(CONTEXT_MODE_PARAM, CONTEXT_MODE_API));
        final Iterator<? extends ToXContent> start = context == XContentContext.API
            ? ChunkedToXContentHelper.startObject("metadata")
            : Iterators.single((builder, params) -> builder.startObject("meta-data").field("version", version()));

        final Iterator<? extends ToXContent> persistentSettings = context != XContentContext.API && persistentSettings().isEmpty() == false
            ? Iterators.single((builder, params) -> {
                builder.startObject("settings");
                persistentSettings().toXContent(builder, new ToXContent.MapParams(Collections.singletonMap("flat_settings", "true")));
                return builder.endObject();
            })
            : Collections.emptyIterator();

        final Iterator<? extends ToXContent> indices = context == XContentContext.API
            ? ChunkedToXContentHelper.wrapWithObject("indices", indices().values().iterator())
            : Collections.emptyIterator();

        return Iterators.concat(start, Iterators.<ToXContent>single((builder, params) -> {
            builder.field("cluster_uuid", clusterUUID);
            builder.field("cluster_uuid_committed", clusterUUIDCommitted);
            builder.startObject("cluster_coordination");
            coordinationMetadata().toXContent(builder, params);
            return builder.endObject();
        }),
            persistentSettings,
            ChunkedToXContentHelper.wrapWithObject(
                "templates",
                templates().values()
                    .stream()
                    .map(
                        template -> (ToXContent) (builder, params) -> IndexTemplateMetadata.Builder.toXContentWithTypes(
                            template,
                            builder,
                            params
                        )
                    )
                    .iterator()
            ),
            indices,
            Iterators.flatMap(
                customs.entrySet().iterator(),
                entry -> entry.getValue().context().contains(context)
                    ? ChunkedToXContentHelper.wrapWithObject(entry.getKey(), entry.getValue().toXContentChunked(p))
                    : Collections.emptyIterator()
            ),
            ChunkedToXContentHelper.wrapWithObject("reserved_state", reservedStateMetadata().values().iterator()),
            ChunkedToXContentHelper.endObject()
        );
    }

    public Map<String, MappingMetadata> getMappingsByHash() {
        return mappingsByHash;
    }

    private static class MetadataDiff implements Diff<Metadata> {

        private static final TransportVersion NOOP_METADATA_DIFF_VERSION = TransportVersion.V_8_5_0;
        private static final TransportVersion NOOP_METADATA_DIFF_SAFE_VERSION =
            PublicationTransportHandler.INCLUDES_LAST_COMMITTED_DATA_VERSION;

        private final long version;
        private final String clusterUUID;
        private final boolean clusterUUIDCommitted;
        private final CoordinationMetadata coordinationMetadata;
        private final Settings transientSettings;
        private final Settings persistentSettings;
        private final Diff<DiffableStringMap> hashesOfConsistentSettings;
        private final Diff<ImmutableOpenMap<String, IndexMetadata>> indices;
        private final Diff<ImmutableOpenMap<String, IndexTemplateMetadata>> templates;
        private final Diff<ImmutableOpenMap<String, Custom>> customs;
        private final Diff<Map<String, ReservedStateMetadata>> reservedStateMetadata;

        /**
         * true if this diff is a noop because before and after were the same instance
         */
        private final boolean empty;

        MetadataDiff(Metadata before, Metadata after) {
            this.empty = before == after;
            clusterUUID = after.clusterUUID;
            clusterUUIDCommitted = after.clusterUUIDCommitted;
            version = after.version;
            coordinationMetadata = after.coordinationMetadata;
            transientSettings = after.transientSettings;
            persistentSettings = after.persistentSettings;
            if (empty) {
                hashesOfConsistentSettings = DiffableStringMap.DiffableStringMapDiff.EMPTY;
                indices = DiffableUtils.emptyDiff();
                templates = DiffableUtils.emptyDiff();
                customs = DiffableUtils.emptyDiff();
                reservedStateMetadata = DiffableUtils.emptyDiff();
            } else {
                hashesOfConsistentSettings = after.hashesOfConsistentSettings.diff(before.hashesOfConsistentSettings);
                indices = DiffableUtils.diff(before.indices, after.indices, DiffableUtils.getStringKeySerializer());
                templates = DiffableUtils.diff(before.templates, after.templates, DiffableUtils.getStringKeySerializer());
                customs = DiffableUtils.diff(
                    before.customs,
                    after.customs,
                    DiffableUtils.getStringKeySerializer(),
                    CUSTOM_VALUE_SERIALIZER
                );
                reservedStateMetadata = DiffableUtils.diff(
                    before.reservedStateMetadata,
                    after.reservedStateMetadata,
                    DiffableUtils.getStringKeySerializer()
                );
            }
        }

        private static final DiffableUtils.DiffableValueReader<String, IndexMetadata> INDEX_METADATA_DIFF_VALUE_READER =
            new DiffableUtils.DiffableValueReader<>(IndexMetadata::readFrom, IndexMetadata::readDiffFrom);
        private static final DiffableUtils.DiffableValueReader<String, IndexTemplateMetadata> TEMPLATES_DIFF_VALUE_READER =
            new DiffableUtils.DiffableValueReader<>(IndexTemplateMetadata::readFrom, IndexTemplateMetadata::readDiffFrom);
        private static final DiffableUtils.DiffableValueReader<String, ReservedStateMetadata> RESERVED_DIFF_VALUE_READER =
            new DiffableUtils.DiffableValueReader<>(ReservedStateMetadata::readFrom, ReservedStateMetadata::readDiffFrom);

        private MetadataDiff(StreamInput in) throws IOException {
            empty = false;
            clusterUUID = in.readString();
            clusterUUIDCommitted = in.readBoolean();
            version = in.readLong();
            coordinationMetadata = new CoordinationMetadata(in);
            transientSettings = Settings.readSettingsFromStream(in);
            persistentSettings = Settings.readSettingsFromStream(in);
            if (in.getTransportVersion().onOrAfter(TransportVersion.V_7_3_0)) {
                hashesOfConsistentSettings = DiffableStringMap.readDiffFrom(in);
            } else {
                hashesOfConsistentSettings = DiffableStringMap.DiffableStringMapDiff.EMPTY;
            }
            indices = DiffableUtils.readImmutableOpenMapDiff(in, DiffableUtils.getStringKeySerializer(), INDEX_METADATA_DIFF_VALUE_READER);
            templates = DiffableUtils.readImmutableOpenMapDiff(in, DiffableUtils.getStringKeySerializer(), TEMPLATES_DIFF_VALUE_READER);
            customs = DiffableUtils.readImmutableOpenMapDiff(in, DiffableUtils.getStringKeySerializer(), CUSTOM_VALUE_SERIALIZER);
            if (in.getTransportVersion().onOrAfter(TransportVersion.V_8_4_0)) {
                reservedStateMetadata = DiffableUtils.readJdkMapDiff(
                    in,
                    DiffableUtils.getStringKeySerializer(),
                    RESERVED_DIFF_VALUE_READER
                );
            } else {
                reservedStateMetadata = DiffableUtils.emptyDiff();
            }
        }

        @Override
        public void writeTo(StreamOutput out) throws IOException {
            if (out.getTransportVersion().onOrAfter(NOOP_METADATA_DIFF_SAFE_VERSION)) {
                out.writeBoolean(empty);
                if (empty) {
                    // noop diff
                    return;
                }
            } else if (out.getTransportVersion().onOrAfter(NOOP_METADATA_DIFF_VERSION)) {
                // noops are not safe with these versions, see #92259
                out.writeBoolean(false);
            }
            out.writeString(clusterUUID);
            out.writeBoolean(clusterUUIDCommitted);
            out.writeLong(version);
            coordinationMetadata.writeTo(out);
            transientSettings.writeTo(out);
            persistentSettings.writeTo(out);
            if (out.getTransportVersion().onOrAfter(TransportVersion.V_7_3_0)) {
                hashesOfConsistentSettings.writeTo(out);
            }
            indices.writeTo(out);
            templates.writeTo(out);
            customs.writeTo(out);
            if (out.getTransportVersion().onOrAfter(TransportVersion.V_8_4_0)) {
                reservedStateMetadata.writeTo(out);
            }
        }

        @Override
        public Metadata apply(Metadata part) {
            if (empty) {
                return part;
            }
            // create builder from existing mappings hashes so we don't change existing index metadata instances when deduplicating
            // mappings in the builder
            final var updatedIndices = indices.apply(part.indices);
            Builder builder = new Builder(part.mappingsByHash, updatedIndices.size());
            builder.clusterUUID(clusterUUID);
            builder.clusterUUIDCommitted(clusterUUIDCommitted);
            builder.version(version);
            builder.coordinationMetadata(coordinationMetadata);
            builder.transientSettings(transientSettings);
            builder.persistentSettings(persistentSettings);
            builder.hashesOfConsistentSettings(hashesOfConsistentSettings.apply(part.hashesOfConsistentSettings));
            builder.indices(updatedIndices);
            builder.templates(templates.apply(part.templates));
            builder.customs(customs.apply(part.customs));
            builder.put(reservedStateMetadata.apply(part.reservedStateMetadata));
            if (part.indices == updatedIndices
                && builder.dataStreamMetadata() == part.custom(DataStreamMetadata.TYPE, DataStreamMetadata.EMPTY)) {
                builder.previousIndicesLookup = part.indicesLookup;
            }
            return builder.build(true);
        }
    }

    public static final TransportVersion MAPPINGS_AS_HASH_VERSION = TransportVersion.V_8_1_0;

    public static Metadata readFrom(StreamInput in) throws IOException {
        Builder builder = new Builder();
        builder.version = in.readLong();
        builder.clusterUUID = in.readString();
        builder.clusterUUIDCommitted = in.readBoolean();
        builder.coordinationMetadata(new CoordinationMetadata(in));
        builder.transientSettings(readSettingsFromStream(in));
        builder.persistentSettings(readSettingsFromStream(in));
        if (in.getTransportVersion().onOrAfter(TransportVersion.V_7_3_0)) {
            builder.hashesOfConsistentSettings(DiffableStringMap.readFrom(in));
        }
        final Function<String, MappingMetadata> mappingLookup;
        if (in.getTransportVersion().onOrAfter(MAPPINGS_AS_HASH_VERSION)) {
            final Map<String, MappingMetadata> mappingMetadataMap = in.readMapValues(MappingMetadata::new, MappingMetadata::getSha256);
            if (mappingMetadataMap.size() > 0) {
                mappingLookup = mappingMetadataMap::get;
            } else {
                mappingLookup = null;
            }
        } else {
            mappingLookup = null;
        }
        int size = in.readVInt();
        for (int i = 0; i < size; i++) {
            builder.put(IndexMetadata.readFrom(in, mappingLookup), false);
        }
        size = in.readVInt();
        for (int i = 0; i < size; i++) {
            builder.put(IndexTemplateMetadata.readFrom(in));
        }
        int customSize = in.readVInt();
        for (int i = 0; i < customSize; i++) {
            Custom customIndexMetadata = in.readNamedWriteable(Custom.class);
            builder.putCustom(customIndexMetadata.getWriteableName(), customIndexMetadata);
        }
        if (in.getTransportVersion().onOrAfter(TransportVersion.V_8_4_0)) {
            int reservedStateSize = in.readVInt();
            for (int i = 0; i < reservedStateSize; i++) {
                builder.put(ReservedStateMetadata.readFrom(in));
            }
        }
        return builder.build();
    }

    @Override
    public void writeTo(StreamOutput out) throws IOException {
        out.writeLong(version);
        out.writeString(clusterUUID);
        out.writeBoolean(clusterUUIDCommitted);
        coordinationMetadata.writeTo(out);
        transientSettings.writeTo(out);
        persistentSettings.writeTo(out);
        if (out.getTransportVersion().onOrAfter(TransportVersion.V_7_3_0)) {
            hashesOfConsistentSettings.writeTo(out);
        }
        // Starting in #MAPPINGS_AS_HASH_VERSION we write the mapping metadata first and then write the indices without metadata so that
        // we avoid writing duplicate mappings twice
        if (out.getTransportVersion().onOrAfter(MAPPINGS_AS_HASH_VERSION)) {
            out.writeMapValues(mappingsByHash);
        }
        out.writeVInt(indices.size());
        final boolean writeMappingsHash = out.getTransportVersion().onOrAfter(MAPPINGS_AS_HASH_VERSION);
        for (IndexMetadata indexMetadata : this) {
            indexMetadata.writeTo(out, writeMappingsHash);
        }
        out.writeCollection(templates.values());
        VersionedNamedWriteable.writeVersionedWritables(out, customs);
        if (out.getTransportVersion().onOrAfter(TransportVersion.V_8_4_0)) {
            out.writeCollection(reservedStateMetadata.values());
        }
    }

    public static Builder builder() {
        return new Builder();
    }

    public static Builder builder(Metadata metadata) {
        return new Builder(metadata);
    }

    public Metadata copyAndUpdate(Consumer<Builder> updater) {
        var builder = builder(this);
        updater.accept(builder);
        return builder.build();
    }

    public static class Builder {

        private String clusterUUID;
        private boolean clusterUUIDCommitted;
        private long version;

        private CoordinationMetadata coordinationMetadata = CoordinationMetadata.EMPTY_METADATA;
        private Settings transientSettings = Settings.EMPTY;
        private Settings persistentSettings = Settings.EMPTY;
        private DiffableStringMap hashesOfConsistentSettings = DiffableStringMap.EMPTY;

        private final ImmutableOpenMap.Builder<String, IndexMetadata> indices;
        private final ImmutableOpenMap.Builder<String, Set<Index>> aliasedIndices;
        private final ImmutableOpenMap.Builder<String, IndexTemplateMetadata> templates;
        private final ImmutableOpenMap.Builder<String, Custom> customs;

        private SortedMap<String, IndexAbstraction> previousIndicesLookup;

        private final Map<String, ReservedStateMetadata> reservedStateMetadata;

        // If this is set to false we can skip checking #mappingsByHash for unused entries in #build(). Used as an optimization to save
        // the rather expensive logic for removing unused mappings when building from another instance and we know that no mappings can
        // have become unused because no indices were updated or removed from this builder in a way that would cause unused entries in
        // #mappingsByHash.
        private boolean checkForUnusedMappings = true;

        private final Map<String, MappingMetadata> mappingsByHash;

        public Builder() {
            this(Map.of(), 0);
        }

        Builder(Metadata metadata) {
            this.clusterUUID = metadata.clusterUUID;
            this.clusterUUIDCommitted = metadata.clusterUUIDCommitted;
            this.coordinationMetadata = metadata.coordinationMetadata;
            this.transientSettings = metadata.transientSettings;
            this.persistentSettings = metadata.persistentSettings;
            this.hashesOfConsistentSettings = metadata.hashesOfConsistentSettings;
            this.version = metadata.version;
            this.indices = ImmutableOpenMap.builder(metadata.indices);
            this.aliasedIndices = ImmutableOpenMap.builder(metadata.aliasedIndices);
            this.templates = ImmutableOpenMap.builder(metadata.templates);
            this.customs = ImmutableOpenMap.builder(metadata.customs);
            this.previousIndicesLookup = metadata.indicesLookup;
            this.mappingsByHash = new HashMap<>(metadata.mappingsByHash);
            this.checkForUnusedMappings = false;
            this.reservedStateMetadata = new HashMap<>(metadata.reservedStateMetadata);
        }

        private Builder(Map<String, MappingMetadata> mappingsByHash, int indexCountHint) {
            clusterUUID = UNKNOWN_CLUSTER_UUID;
            indices = ImmutableOpenMap.builder(indexCountHint);
            aliasedIndices = ImmutableOpenMap.builder();
            templates = ImmutableOpenMap.builder();
            customs = ImmutableOpenMap.builder();
            reservedStateMetadata = new HashMap<>();
            indexGraveyard(IndexGraveyard.builder().build()); // create new empty index graveyard to initialize
            previousIndicesLookup = null;
            this.mappingsByHash = new HashMap<>(mappingsByHash);
        }

        public Builder put(IndexMetadata.Builder indexMetadataBuilder) {
            // we know its a new one, increment the version and store
            indexMetadataBuilder.version(indexMetadataBuilder.version() + 1);
            dedupeMapping(indexMetadataBuilder);
            IndexMetadata indexMetadata = indexMetadataBuilder.build();
            IndexMetadata previous = indices.put(indexMetadata.getIndex().getName(), indexMetadata);
            updateAliases(previous, indexMetadata);
            if (unsetPreviousIndicesLookup(previous, indexMetadata)) {
                previousIndicesLookup = null;
            }
            maybeSetMappingPurgeFlag(previous, indexMetadata);
            return this;
        }

        public Builder put(IndexMetadata indexMetadata, boolean incrementVersion) {
            final String name = indexMetadata.getIndex().getName();
            indexMetadata = dedupeMapping(indexMetadata);
            IndexMetadata previous;
            if (incrementVersion) {
                if (indices.get(name) == indexMetadata) {
                    return this;
                }
                // if we put a new index metadata, increment its version
                indexMetadata = indexMetadata.withIncrementedVersion();
                previous = indices.put(name, indexMetadata);
            } else {
                previous = indices.put(name, indexMetadata);
                if (previous == indexMetadata) {
                    return this;
                }
            }
            updateAliases(previous, indexMetadata);
            if (unsetPreviousIndicesLookup(previous, indexMetadata)) {
                previousIndicesLookup = null;
            }
            maybeSetMappingPurgeFlag(previous, indexMetadata);
            return this;
        }

        private void maybeSetMappingPurgeFlag(@Nullable IndexMetadata previous, IndexMetadata updated) {
            if (checkForUnusedMappings) {
                return;
            }
            if (previous == null) {
                return;
            }
            final MappingMetadata mapping = previous.mapping();
            if (mapping == null) {
                return;
            }
            final MappingMetadata updatedMapping = updated.mapping();
            if (updatedMapping == null) {
                return;
            }
            if (mapping.getSha256().equals(updatedMapping.getSha256()) == false) {
                checkForUnusedMappings = true;
            }
        }

        private static boolean unsetPreviousIndicesLookup(IndexMetadata previous, IndexMetadata current) {
            if (previous == null) {
                return true;
            }

            if (previous.getAliases().equals(current.getAliases()) == false) {
                return true;
            }

            if (previous.isHidden() != current.isHidden()) {
                return true;
            }

            if (previous.isSystem() != current.isSystem()) {
                return true;
            }

            if (previous.getState() != current.getState()) {
                return true;
            }

            return false;
        }

        public IndexMetadata get(String index) {
            return indices.get(index);
        }

        public IndexMetadata getSafe(Index index) {
            IndexMetadata indexMetadata = get(index.getName());
            if (indexMetadata != null) {
                if (indexMetadata.getIndexUUID().equals(index.getUUID())) {
                    return indexMetadata;
                }
                throw new IndexNotFoundException(
                    index,
                    new IllegalStateException(
                        "index uuid doesn't match expected: [" + index.getUUID() + "] but got: [" + indexMetadata.getIndexUUID() + "]"
                    )
                );
            }
            throw new IndexNotFoundException(index);
        }

        public Builder remove(String index) {
            previousIndicesLookup = null;
            checkForUnusedMappings = true;
            IndexMetadata previous = indices.remove(index);
            updateAliases(previous, null);
            return this;
        }

        public Builder removeAllIndices() {
            previousIndicesLookup = null;
            checkForUnusedMappings = true;

            indices.clear();
            mappingsByHash.clear();
            aliasedIndices.clear();
            return this;
        }

        public Builder indices(Map<String, IndexMetadata> indices) {
            for (var value : indices.values()) {
                put(value, false);
            }
            return this;
        }

        void updateAliases(IndexMetadata previous, IndexMetadata current) {
            if (previous == null && current != null) {
                for (var key : current.getAliases().keySet()) {
                    putAlias(key, current.getIndex());
                }
            } else if (previous != null && current == null) {
                for (var key : previous.getAliases().keySet()) {
                    removeAlias(key, previous.getIndex());
                }
            } else if (previous != null && current != null) {
                if (Objects.equals(previous.getAliases(), current.getAliases())) {
                    return;
                }

                for (var key : current.getAliases().keySet()) {
                    if (previous.getAliases().containsKey(key) == false) {
                        putAlias(key, current.getIndex());
                    }
                }
                for (var key : previous.getAliases().keySet()) {
                    if (current.getAliases().containsKey(key) == false) {
                        removeAlias(key, current.getIndex());
                    }
                }
            }
        }

        private Builder putAlias(String alias, Index index) {
            Objects.requireNonNull(alias);
            Objects.requireNonNull(index);

            Set<Index> indices = new HashSet<>(aliasedIndices.getOrDefault(alias, Set.of()));
            if (indices.add(index) == false) {
                return this; // indices already contained this index
            }
            aliasedIndices.put(alias, Collections.unmodifiableSet(indices));
            return this;
        }

        private Builder removeAlias(String alias, Index index) {
            Objects.requireNonNull(alias);
            Objects.requireNonNull(index);

            Set<Index> indices = aliasedIndices.get(alias);
            if (indices == null || indices.isEmpty()) {
                throw new IllegalStateException("Cannot remove non-existent alias [" + alias + "] for index [" + index.getName() + "]");
            }

            indices = new HashSet<>(indices);
            if (indices.remove(index) == false) {
                throw new IllegalStateException("Cannot remove non-existent alias [" + alias + "] for index [" + index.getName() + "]");
            }

            if (indices.isEmpty()) {
                aliasedIndices.remove(alias); // for consistency, we don't store empty sets, so null it out
            } else {
                aliasedIndices.put(alias, Collections.unmodifiableSet(indices));
            }
            return this;
        }

        public Builder put(IndexTemplateMetadata.Builder template) {
            return put(template.build());
        }

        public Builder put(IndexTemplateMetadata template) {
            templates.put(template.name(), template);
            return this;
        }

        public Builder removeTemplate(String templateName) {
            templates.remove(templateName);
            return this;
        }

        public Builder templates(Map<String, IndexTemplateMetadata> templates) {
            this.templates.putAllFromMap(templates);
            return this;
        }

        public Builder put(String name, ComponentTemplate componentTemplate) {
            Objects.requireNonNull(componentTemplate, "it is invalid to add a null component template: " + name);
            // ಠ_ಠ at ImmutableOpenMap
            Map<String, ComponentTemplate> existingTemplates = Optional.ofNullable(
                (ComponentTemplateMetadata) this.customs.get(ComponentTemplateMetadata.TYPE)
            ).map(ctm -> new HashMap<>(ctm.componentTemplates())).orElse(new HashMap<>());
            existingTemplates.put(name, componentTemplate);
            this.customs.put(ComponentTemplateMetadata.TYPE, new ComponentTemplateMetadata(existingTemplates));
            return this;
        }

        public Builder removeComponentTemplate(String name) {
            // ಠ_ಠ at ImmutableOpenMap
            Map<String, ComponentTemplate> existingTemplates = Optional.ofNullable(
                (ComponentTemplateMetadata) this.customs.get(ComponentTemplateMetadata.TYPE)
            ).map(ctm -> new HashMap<>(ctm.componentTemplates())).orElse(new HashMap<>());
            existingTemplates.remove(name);
            this.customs.put(ComponentTemplateMetadata.TYPE, new ComponentTemplateMetadata(existingTemplates));
            return this;
        }

        public Builder componentTemplates(Map<String, ComponentTemplate> componentTemplates) {
            this.customs.put(ComponentTemplateMetadata.TYPE, new ComponentTemplateMetadata(componentTemplates));
            return this;
        }

        public Builder indexTemplates(Map<String, ComposableIndexTemplate> indexTemplates) {
            this.customs.put(ComposableIndexTemplateMetadata.TYPE, new ComposableIndexTemplateMetadata(indexTemplates));
            return this;
        }

        public Builder put(String name, ComposableIndexTemplate indexTemplate) {
            Objects.requireNonNull(indexTemplate, "it is invalid to add a null index template: " + name);
            // ಠ_ಠ at ImmutableOpenMap
            Map<String, ComposableIndexTemplate> existingTemplates = Optional.ofNullable(
                (ComposableIndexTemplateMetadata) this.customs.get(ComposableIndexTemplateMetadata.TYPE)
            ).map(itmd -> new HashMap<>(itmd.indexTemplates())).orElse(new HashMap<>());
            existingTemplates.put(name, indexTemplate);
            this.customs.put(ComposableIndexTemplateMetadata.TYPE, new ComposableIndexTemplateMetadata(existingTemplates));
            return this;
        }

        public Builder removeIndexTemplate(String name) {
            // ಠ_ಠ at ImmutableOpenMap
            Map<String, ComposableIndexTemplate> existingTemplates = Optional.ofNullable(
                (ComposableIndexTemplateMetadata) this.customs.get(ComposableIndexTemplateMetadata.TYPE)
            ).map(itmd -> new HashMap<>(itmd.indexTemplates())).orElse(new HashMap<>());
            existingTemplates.remove(name);
            this.customs.put(ComposableIndexTemplateMetadata.TYPE, new ComposableIndexTemplateMetadata(existingTemplates));
            return this;
        }

        public DataStream dataStream(String dataStreamName) {
            return dataStreamMetadata().dataStreams().get(dataStreamName);
        }

        public Builder dataStreams(Map<String, DataStream> dataStreams, Map<String, DataStreamAlias> dataStreamAliases) {
            previousIndicesLookup = null;

            // Only perform data stream validation only when data streams are modified in Metadata:
            for (DataStream dataStream : dataStreams.values()) {
                dataStream.validate(indices::get);
            }

            this.customs.put(
                DataStreamMetadata.TYPE,
                new DataStreamMetadata(
                    ImmutableOpenMap.<String, DataStream>builder().putAllFromMap(dataStreams).build(),
                    ImmutableOpenMap.<String, DataStreamAlias>builder().putAllFromMap(dataStreamAliases).build()
                )
            );
            return this;
        }

        public Builder put(DataStream dataStream) {
            previousIndicesLookup = null;
            Objects.requireNonNull(dataStream, "it is invalid to add a null data stream");

            // Every time the backing indices of a data stream is modified a new instance will be created and
            // that instance needs to be added here. So this is a good place to do data stream validation for
            // the data stream and all of its backing indices. Doing this validation in the build() method would
            // trigger this validation on each new Metadata creation, even if there are no changes to data streams.
            dataStream.validate(indices::get);

            this.customs.put(DataStreamMetadata.TYPE, dataStreamMetadata().withAddedDatastream(dataStream));
            return this;
        }

        public DataStreamMetadata dataStreamMetadata() {
            return (DataStreamMetadata) this.customs.getOrDefault(DataStreamMetadata.TYPE, DataStreamMetadata.EMPTY);
        }

        public boolean put(String aliasName, String dataStream, Boolean isWriteDataStream, String filter) {
            previousIndicesLookup = null;
            final DataStreamMetadata existing = dataStreamMetadata();
            final DataStreamMetadata updated = existing.withAlias(aliasName, dataStream, isWriteDataStream, filter);
            if (existing == updated) {
                return false;
            }
            this.customs.put(DataStreamMetadata.TYPE, updated);
            return true;
        }

        public Builder removeDataStream(String name) {
            previousIndicesLookup = null;
            this.customs.put(DataStreamMetadata.TYPE, dataStreamMetadata().withRemovedDataStream(name));
            return this;
        }

        public boolean removeDataStreamAlias(String aliasName, String dataStreamName, boolean mustExist) {
            previousIndicesLookup = null;

            final DataStreamMetadata existing = dataStreamMetadata();
            final DataStreamMetadata updated = existing.withRemovedAlias(aliasName, dataStreamName, mustExist);
            if (existing == updated) {
                return false;
            }
            this.customs.put(DataStreamMetadata.TYPE, updated);
            return true;
        }

        public Custom getCustom(String type) {
            return customs.get(type);
        }

        public Builder putCustom(String type, Custom custom) {
            customs.put(type, Objects.requireNonNull(custom, type));
            return this;
        }

        public Builder removeCustom(String type) {
            customs.remove(type);
            return this;
        }

        public Builder removeCustomIf(BiPredicate<String, Custom> p) {
            customs.removeAll(p);
            return this;
        }

        public Builder customs(Map<String, Custom> customs) {
            customs.forEach((key, value) -> Objects.requireNonNull(value, key));
            this.customs.putAllFromMap(customs);
            return this;
        }

        /**
         * Adds a map of namespace to {@link ReservedStateMetadata} into the metadata builder
         * @param reservedStateMetadata a map of namespace to {@link ReservedStateMetadata}
         * @return {@link Builder}
         */
        public Builder put(Map<String, ReservedStateMetadata> reservedStateMetadata) {
            this.reservedStateMetadata.putAll(reservedStateMetadata);
            return this;
        }

        /**
         * Adds a {@link ReservedStateMetadata} for a given namespace to the metadata builder
         * @param metadata a {@link ReservedStateMetadata}
         * @return {@link Builder}
         */
        public Builder put(ReservedStateMetadata metadata) {
            reservedStateMetadata.put(metadata.namespace(), metadata);
            return this;
        }

        /**
         * Removes a {@link ReservedStateMetadata} for a given namespace
         * @param metadata a {@link ReservedStateMetadata}
         * @return {@link Builder}
         */
        public Builder removeReservedState(ReservedStateMetadata metadata) {
            reservedStateMetadata.remove(metadata.namespace());
            return this;
        }

        public Builder indexGraveyard(final IndexGraveyard indexGraveyard) {
            putCustom(IndexGraveyard.TYPE, indexGraveyard);
            return this;
        }

        public IndexGraveyard indexGraveyard() {
            return (IndexGraveyard) getCustom(IndexGraveyard.TYPE);
        }

        public Builder updateSettings(Settings settings, String... indices) {
            if (indices == null || indices.length == 0) {
                indices = this.indices.keys().toArray(new String[0]);
            }
            for (String index : indices) {
                IndexMetadata indexMetadata = this.indices.get(index);
                if (indexMetadata == null) {
                    throw new IndexNotFoundException(index);
                }
                // Updating version is required when updating settings.
                // Otherwise, settings changes may not be replicated to remote clusters.
                long newVersion = indexMetadata.getSettingsVersion() + 1;
                put(
                    IndexMetadata.builder(indexMetadata)
                        .settings(Settings.builder().put(indexMetadata.getSettings()).put(settings))
                        .settingsVersion(newVersion)
                );
            }
            return this;
        }

        /**
         * Update the number of replicas for the specified indices.
         *
         * @param numberOfReplicas the number of replicas
         * @param indices          the indices to update the number of replicas for
         * @return the builder
         */
        public Builder updateNumberOfReplicas(final int numberOfReplicas, final String[] indices) {
            for (String index : indices) {
                IndexMetadata indexMetadata = this.indices.get(index);
                if (indexMetadata == null) {
                    throw new IndexNotFoundException(index);
                }
                put(IndexMetadata.builder(indexMetadata).numberOfReplicas(numberOfReplicas));
            }
            return this;
        }

        public Builder coordinationMetadata(CoordinationMetadata coordinationMetadata) {
            this.coordinationMetadata = coordinationMetadata;
            return this;
        }

        public Settings transientSettings() {
            return this.transientSettings;
        }

        public Builder transientSettings(Settings settings) {
            this.transientSettings = settings;
            return this;
        }

        public Settings persistentSettings() {
            return this.persistentSettings;
        }

        public Builder persistentSettings(Settings settings) {
            this.persistentSettings = settings;
            return this;
        }

        public Builder hashesOfConsistentSettings(DiffableStringMap hashesOfConsistentSettings) {
            this.hashesOfConsistentSettings = hashesOfConsistentSettings;
            return this;
        }

        public Builder hashesOfConsistentSettings(Map<String, String> hashesOfConsistentSettings) {
            this.hashesOfConsistentSettings = new DiffableStringMap(hashesOfConsistentSettings);
            return this;
        }

        public Builder version(long version) {
            this.version = version;
            return this;
        }

        public Builder clusterUUID(String clusterUUID) {
            this.clusterUUID = clusterUUID;
            return this;
        }

        public Builder clusterUUIDCommitted(boolean clusterUUIDCommitted) {
            this.clusterUUIDCommitted = clusterUUIDCommitted;
            return this;
        }

        public Builder generateClusterUuidIfNeeded() {
            if (clusterUUID.equals(UNKNOWN_CLUSTER_UUID)) {
                clusterUUID = UUIDs.randomBase64UUID();
            }
            return this;
        }

        /**
         * @return a new <code>Metadata</code> instance
         */
        public Metadata build() {
            return build(false);
        }

        public Metadata build(boolean skipNameCollisionChecks) {
            // TODO: We should move these datastructures to IndexNameExpressionResolver, this will give the following benefits:
            // 1) The datastructures will be rebuilt only when needed. Now during serializing we rebuild these datastructures
            // while these datastructures aren't even used.
            // 2) The aliasAndIndexLookup can be updated instead of rebuilding it all the time.
            final List<String> visibleIndices = new ArrayList<>();
            final List<String> allOpenIndices = new ArrayList<>();
            final List<String> visibleOpenIndices = new ArrayList<>();
            final List<String> allClosedIndices = new ArrayList<>();
            final List<String> visibleClosedIndices = new ArrayList<>();
            final ImmutableOpenMap<String, IndexMetadata> indicesMap = indices.build();

            int oldestIndexVersionId = IndexVersion.CURRENT.id();
            int totalNumberOfShards = 0;
            int totalOpenIndexShards = 0;

            final String[] allIndicesArray = new String[indicesMap.size()];
            int i = 0;
            final Set<String> sha256HashesInUse = checkForUnusedMappings ? Sets.newHashSetWithExpectedSize(mappingsByHash.size()) : null;
            for (var entry : indicesMap.entrySet()) {
                allIndicesArray[i++] = entry.getKey();
                final IndexMetadata indexMetadata = entry.getValue();
                totalNumberOfShards += indexMetadata.getTotalNumberOfShards();
                final String name = indexMetadata.getIndex().getName();
                final boolean visible = indexMetadata.isHidden() == false;
                if (visible) {
                    visibleIndices.add(name);
                }
                if (indexMetadata.getState() == IndexMetadata.State.OPEN) {
                    totalOpenIndexShards += indexMetadata.getTotalNumberOfShards();
                    allOpenIndices.add(name);
                    if (visible) {
                        visibleOpenIndices.add(name);
                    }
                } else if (indexMetadata.getState() == IndexMetadata.State.CLOSE) {
                    allClosedIndices.add(name);
                    if (visible) {
                        visibleClosedIndices.add(name);
                    }
                }
                oldestIndexVersionId = Math.min(oldestIndexVersionId, indexMetadata.getCompatibilityVersion().id);
                if (sha256HashesInUse != null) {
                    final var mapping = indexMetadata.mapping();
                    if (mapping != null) {
                        sha256HashesInUse.add(mapping.getSha256());
                    }
                }
            }

            var aliasedIndices = this.aliasedIndices.build();
            for (var entry : aliasedIndices.entrySet()) {
                List<IndexMetadata> aliasIndices = entry.getValue().stream().map(idx -> indicesMap.get(idx.getName())).toList();
                validateAlias(entry.getKey(), aliasIndices);
            }
            SortedMap<String, IndexAbstraction> indicesLookup = null;
            if (previousIndicesLookup != null) {
                // no changes to the names of indices, datastreams, and their aliases so we can reuse the previous lookup
                assert previousIndicesLookup.equals(buildIndicesLookup(dataStreamMetadata(), indicesMap));
                indicesLookup = previousIndicesLookup;
            } else if (skipNameCollisionChecks == false) {
                // we have changes to the the entity names so we ensure we have no naming collisions
                ensureNoNameCollisions(aliasedIndices.keySet(), indicesMap, dataStreamMetadata());
            }
            assert assertDataStreams(indicesMap, dataStreamMetadata());

            if (sha256HashesInUse != null) {
                mappingsByHash.keySet().retainAll(sha256HashesInUse);
            }

            // build all concrete indices arrays:
            // TODO: I think we can remove these arrays. it isn't worth the effort, for operations on all indices.
            // When doing an operation across all indices, most of the time is spent on actually going to all shards and
            // do the required operations, the bottleneck isn't resolving expressions into concrete indices.
            String[] visibleIndicesArray = visibleIndices.toArray(Strings.EMPTY_ARRAY);
            String[] allOpenIndicesArray = allOpenIndices.toArray(Strings.EMPTY_ARRAY);
            String[] visibleOpenIndicesArray = visibleOpenIndices.toArray(Strings.EMPTY_ARRAY);
            String[] allClosedIndicesArray = allClosedIndices.toArray(Strings.EMPTY_ARRAY);
            String[] visibleClosedIndicesArray = visibleClosedIndices.toArray(Strings.EMPTY_ARRAY);

            return new Metadata(
                clusterUUID,
                clusterUUIDCommitted,
                version,
                coordinationMetadata,
                transientSettings,
                persistentSettings,
                Settings.builder().put(persistentSettings).put(transientSettings).build(),
                hashesOfConsistentSettings,
                totalNumberOfShards,
                totalOpenIndexShards,
                indicesMap,
                aliasedIndices,
                templates.build(),
                customs.build(),
                allIndicesArray,
                visibleIndicesArray,
                allOpenIndicesArray,
                visibleOpenIndicesArray,
                allClosedIndicesArray,
                visibleClosedIndicesArray,
                indicesLookup,
                Collections.unmodifiableMap(mappingsByHash),
                IndexVersion.fromId(oldestIndexVersionId),
                Collections.unmodifiableMap(reservedStateMetadata)
            );
        }

        private static void ensureNoNameCollisions(
            Set<String> indexAliases,
            ImmutableOpenMap<String, IndexMetadata> indicesMap,
            DataStreamMetadata dataStreamMetadata
        ) {
            final ArrayList<String> duplicates = new ArrayList<>();
            final Set<String> aliasDuplicatesWithIndices = new HashSet<>();
            final Set<String> aliasDuplicatesWithDataStreams = new HashSet<>();
            final var allDataStreams = dataStreamMetadata.dataStreams();
            // Adding data stream aliases:
            for (String dataStreamAlias : dataStreamMetadata.getDataStreamAliases().keySet()) {
                if (indexAliases.contains(dataStreamAlias)) {
                    duplicates.add("data stream alias and indices alias have the same name (" + dataStreamAlias + ")");
                }
                if (indicesMap.containsKey(dataStreamAlias)) {
                    aliasDuplicatesWithIndices.add(dataStreamAlias);
                }
                if (allDataStreams.containsKey(dataStreamAlias)) {
                    aliasDuplicatesWithDataStreams.add(dataStreamAlias);
                }
            }
            for (String alias : indexAliases) {
                if (allDataStreams.containsKey(alias)) {
                    aliasDuplicatesWithDataStreams.add(alias);
                }
                if (indicesMap.containsKey(alias)) {
                    aliasDuplicatesWithIndices.add(alias);
                }
            }
            allDataStreams.forEach((key, value) -> {
                if (indicesMap.containsKey(key)) {
                    duplicates.add("data stream [" + key + "] conflicts with index");
                }
            });
            if (aliasDuplicatesWithIndices.isEmpty() == false) {
                collectAliasDuplicates(indicesMap, aliasDuplicatesWithIndices, duplicates);
            }
            if (aliasDuplicatesWithDataStreams.isEmpty() == false) {
                collectAliasDuplicates(indicesMap, dataStreamMetadata, aliasDuplicatesWithDataStreams, duplicates);
            }
            if (duplicates.isEmpty() == false) {
                throw new IllegalStateException(
                    "index, alias, and data stream names need to be unique, but the following duplicates "
                        + "were found ["
                        + Strings.collectionToCommaDelimitedString(duplicates)
                        + "]"
                );
            }
        }

        /**
         * Iterates the detected duplicates between datastreams and aliases and collects them into the duplicates list as helpful messages.
         */
        private static void collectAliasDuplicates(
            ImmutableOpenMap<String, IndexMetadata> indicesMap,
            DataStreamMetadata dataStreamMetadata,
            Set<String> aliasDuplicatesWithDataStreams,
            ArrayList<String> duplicates
        ) {
            for (String alias : aliasDuplicatesWithDataStreams) {
                // reported var avoids adding a message twice if an index alias has the same name as a data stream.
                boolean reported = false;
                for (IndexMetadata cursor : indicesMap.values()) {
                    if (cursor.getAliases().containsKey(alias)) {
                        duplicates.add(alias + " (alias of " + cursor.getIndex() + ") conflicts with data stream");
                        reported = true;
                    }
                }
                // This is for adding an error message for when a data steam alias has the same name as a data stream.
                if (reported == false && dataStreamMetadata != null && dataStreamMetadata.dataStreams().containsKey(alias)) {
                    duplicates.add("data stream alias and data stream have the same name (" + alias + ")");
                }
            }
        }

        /**
         * Collect all duplicate names across indices and aliases that were detected into a list of helpful duplicate failure messages.
         */
        private static void collectAliasDuplicates(
            ImmutableOpenMap<String, IndexMetadata> indicesMap,
            Set<String> aliasDuplicatesWithIndices,
            ArrayList<String> duplicates
        ) {
            for (IndexMetadata cursor : indicesMap.values()) {
                for (String alias : aliasDuplicatesWithIndices) {
                    if (cursor.getAliases().containsKey(alias)) {
                        duplicates.add(alias + " (alias of " + cursor.getIndex() + ") conflicts with index");
                    }
                }
            }
        }

        static SortedMap<String, IndexAbstraction> buildIndicesLookup(
            DataStreamMetadata dataStreamMetadata,
            ImmutableOpenMap<String, IndexMetadata> indices
        ) {
            if (indices.isEmpty()) {
                return Collections.emptySortedMap();
            }
            SortedMap<String, IndexAbstraction> indicesLookup = new TreeMap<>();
            Map<String, DataStream> indexToDataStreamLookup = new HashMap<>();
            final var dataStreams = dataStreamMetadata.dataStreams();
            for (DataStreamAlias alias : dataStreamMetadata.getDataStreamAliases().values()) {
                IndexAbstraction existing = indicesLookup.put(alias.getName(), makeDsAliasAbstraction(dataStreams, alias));
                assert existing == null : "duplicate data stream alias for " + alias.getName();
            }
            for (DataStream dataStream : dataStreams.values()) {
                assert dataStream.getIndices().isEmpty() == false;

                IndexAbstraction existing = indicesLookup.put(dataStream.getName(), dataStream);
                assert existing == null : "duplicate data stream for " + dataStream.getName();

                for (Index i : dataStream.getIndices()) {
                    indexToDataStreamLookup.put(i.getName(), dataStream);
                }
            }

            Map<String, List<IndexMetadata>> aliasToIndices = new HashMap<>();
            for (var entry : indices.entrySet()) {
                final String name = entry.getKey();
                final IndexMetadata indexMetadata = entry.getValue();
                final DataStream parent = indexToDataStreamLookup.get(name);
                assert parent == null || parent.getIndices().stream().anyMatch(index -> name.equals(index.getName()))
                    : "Expected data stream [" + parent.getName() + "] to contain index " + indexMetadata.getIndex();
                IndexAbstraction existing = indicesLookup.put(name, new ConcreteIndex(indexMetadata, parent));
                assert existing == null : "duplicate for " + indexMetadata.getIndex();

                for (var aliasMetadata : indexMetadata.getAliases().values()) {
                    List<IndexMetadata> aliasIndices = aliasToIndices.computeIfAbsent(aliasMetadata.getAlias(), k -> new ArrayList<>());
                    aliasIndices.add(indexMetadata);
                }
            }

            for (var entry : aliasToIndices.entrySet()) {
                AliasMetadata alias = entry.getValue().get(0).getAliases().get(entry.getKey());
                IndexAbstraction existing = indicesLookup.put(entry.getKey(), new IndexAbstraction.Alias(alias, entry.getValue()));
                assert existing == null : "duplicate for " + entry.getKey();
            }

            return Collections.unmodifiableSortedMap(indicesLookup);
        }

        private static IndexAbstraction.Alias makeDsAliasAbstraction(Map<String, DataStream> dataStreams, DataStreamAlias alias) {
            Index writeIndexOfWriteDataStream = null;
            if (alias.getWriteDataStream() != null) {
                DataStream writeDataStream = dataStreams.get(alias.getWriteDataStream());
                writeIndexOfWriteDataStream = writeDataStream.getWriteIndex();
            }
            return new IndexAbstraction.Alias(
                alias,
                alias.getDataStreams().stream().flatMap(name -> dataStreams.get(name).getIndices().stream()).toList(),
                writeIndexOfWriteDataStream
            );
        }

        private static boolean isNonEmpty(List<IndexMetadata> idxMetas) {
            return (Objects.isNull(idxMetas) || idxMetas.isEmpty()) == false;
        }

        private static void validateAlias(String aliasName, List<IndexMetadata> indexMetadatas) {
            // Validate write indices
            List<String> writeIndices = indexMetadatas.stream()
                .filter(idxMeta -> Boolean.TRUE.equals(idxMeta.getAliases().get(aliasName).writeIndex()))
                .map(im -> im.getIndex().getName())
                .toList();
            if (writeIndices.size() > 1) {
                throw new IllegalStateException(
                    "alias ["
                        + aliasName
                        + "] has more than one write index ["
                        + Strings.collectionToCommaDelimitedString(writeIndices)
                        + "]"
                );
            }

            // Validate hidden status
            final Map<Boolean, List<IndexMetadata>> groupedByHiddenStatus = indexMetadatas.stream()
                .collect(Collectors.groupingBy(idxMeta -> Boolean.TRUE.equals(idxMeta.getAliases().get(aliasName).isHidden())));
            if (isNonEmpty(groupedByHiddenStatus.get(true)) && isNonEmpty(groupedByHiddenStatus.get(false))) {
                List<String> hiddenOn = groupedByHiddenStatus.get(true).stream().map(idx -> idx.getIndex().getName()).toList();
                List<String> nonHiddenOn = groupedByHiddenStatus.get(false).stream().map(idx -> idx.getIndex().getName()).toList();
                throw new IllegalStateException(
                    "alias ["
                        + aliasName
                        + "] has is_hidden set to true on indices ["
                        + Strings.collectionToCommaDelimitedString(hiddenOn)
                        + "] but does not have is_hidden set to true on indices ["
                        + Strings.collectionToCommaDelimitedString(nonHiddenOn)
                        + "]; alias must have the same is_hidden setting "
                        + "on all indices"
                );
            }

            // Validate system status
            final Map<Boolean, List<IndexMetadata>> groupedBySystemStatus = indexMetadatas.stream()
                .collect(Collectors.groupingBy(IndexMetadata::isSystem));
            // If the alias has either all system or all non-system, then no more validation is required
            if (isNonEmpty(groupedBySystemStatus.get(false)) && isNonEmpty(groupedBySystemStatus.get(true))) {
                final List<String> newVersionSystemIndices = groupedBySystemStatus.get(true)
                    .stream()
                    .filter(i -> i.getCreationVersion().onOrAfter(IndexNameExpressionResolver.SYSTEM_INDEX_ENFORCEMENT_VERSION))
                    .map(i -> i.getIndex().getName())
                    .sorted() // reliable error message for testing
                    .toList();

                if (newVersionSystemIndices.isEmpty() == false) {
                    final List<String> nonSystemIndices = groupedBySystemStatus.get(false)
                        .stream()
                        .map(i -> i.getIndex().getName())
                        .sorted() // reliable error message for testing
                        .toList();
                    throw new IllegalStateException(
                        "alias ["
                            + aliasName
                            + "] refers to both system indices "
                            + newVersionSystemIndices
                            + " and non-system indices: "
                            + nonSystemIndices
                            + ", but aliases must refer to either system or"
                            + " non-system indices, not both"
                    );
                }
            }
        }

        static boolean assertDataStreams(Map<String, IndexMetadata> indices, DataStreamMetadata dsMetadata) {
            // Sanity check, because elsewhere a more user friendly error should have occurred:
            List<String> conflictingAliases = null;

            for (var dataStream : dsMetadata.dataStreams().values()) {
                for (var index : dataStream.getIndices()) {
                    IndexMetadata im = indices.get(index.getName());
                    if (im != null && im.getAliases().isEmpty() == false) {
                        for (var alias : im.getAliases().values()) {
                            if (conflictingAliases == null) {
                                conflictingAliases = new LinkedList<>();
                            }
                            conflictingAliases.add(alias.alias());
                        }
                    }
                }
            }
            if (conflictingAliases != null) {
                throw new AssertionError("aliases " + conflictingAliases + " cannot refer to backing indices of data streams");
            }

            return true;
        }

        public static Metadata fromXContent(XContentParser parser) throws IOException {
            Builder builder = new Builder();

            // we might get here after the meta-data element, or on a fresh parser
            XContentParser.Token token = parser.currentToken();
            String currentFieldName = parser.currentName();
            if ("meta-data".equals(currentFieldName) == false) {
                token = parser.nextToken();
                if (token == XContentParser.Token.START_OBJECT) {
                    // move to the field name (meta-data)
                    XContentParserUtils.ensureExpectedToken(XContentParser.Token.FIELD_NAME, parser.nextToken(), parser);
                    // move to the next object
                    token = parser.nextToken();
                }
                currentFieldName = parser.currentName();
            }

            if ("meta-data".equals(currentFieldName) == false) {
                throw new IllegalArgumentException("Expected [meta-data] as a field name but got " + currentFieldName);
            }
            XContentParserUtils.ensureExpectedToken(XContentParser.Token.START_OBJECT, token, parser);

            while ((token = parser.nextToken()) != XContentParser.Token.END_OBJECT) {
                if (token == XContentParser.Token.FIELD_NAME) {
                    currentFieldName = parser.currentName();
                } else if (token == XContentParser.Token.START_OBJECT) {
                    if ("cluster_coordination".equals(currentFieldName)) {
                        builder.coordinationMetadata(CoordinationMetadata.fromXContent(parser));
                    } else if ("settings".equals(currentFieldName)) {
                        builder.persistentSettings(Settings.fromXContent(parser));
                    } else if ("indices".equals(currentFieldName)) {
                        while ((token = parser.nextToken()) != XContentParser.Token.END_OBJECT) {
                            builder.put(IndexMetadata.Builder.fromXContent(parser), false);
                        }
                    } else if ("hashes_of_consistent_settings".equals(currentFieldName)) {
                        builder.hashesOfConsistentSettings(parser.mapStrings());
                    } else if ("templates".equals(currentFieldName)) {
                        while ((token = parser.nextToken()) != XContentParser.Token.END_OBJECT) {
                            builder.put(IndexTemplateMetadata.Builder.fromXContent(parser, parser.currentName()));
                        }
                    } else if ("reserved_state".equals(currentFieldName)) {
                        while ((token = parser.nextToken()) != XContentParser.Token.END_OBJECT) {
                            builder.put(ReservedStateMetadata.fromXContent(parser));
                        }
                    } else {
                        try {
                            Custom custom = parser.namedObject(Custom.class, currentFieldName, null);
                            builder.putCustom(custom.getWriteableName(), custom);
                        } catch (NamedObjectNotFoundException ex) {
                            logger.warn("Skipping unknown custom object with type {}", currentFieldName);
                            parser.skipChildren();
                        }
                    }
                } else if (token.isValue()) {
                    if ("version".equals(currentFieldName)) {
                        builder.version = parser.longValue();
                    } else if ("cluster_uuid".equals(currentFieldName) || "uuid".equals(currentFieldName)) {
                        builder.clusterUUID = parser.text();
                    } else if ("cluster_uuid_committed".equals(currentFieldName)) {
                        builder.clusterUUIDCommitted = parser.booleanValue();
                    } else {
                        throw new IllegalArgumentException("Unexpected field [" + currentFieldName + "]");
                    }
                } else {
                    throw new IllegalArgumentException("Unexpected token " + token);
                }
            }
            XContentParserUtils.ensureExpectedToken(XContentParser.Token.END_OBJECT, parser.nextToken(), parser);
            return builder.build();
        }

        /**
         * Dedupes {@link MappingMetadata} instance from the provided indexMetadata parameter using the sha256
         * hash from the compressed source of the mapping. If there is a mapping with the same sha256 hash then
         * a new {@link IndexMetadata} is returned with the found {@link MappingMetadata} instance, otherwise
         * the {@link MappingMetadata} instance of the indexMetadata parameter is recorded and the indexMetadata
         * parameter is then returned.
         */
        private IndexMetadata dedupeMapping(IndexMetadata indexMetadata) {
            if (indexMetadata.mapping() == null) {
                return indexMetadata;
            }

            String digest = indexMetadata.mapping().getSha256();
            MappingMetadata entry = mappingsByHash.get(digest);
            if (entry != null) {
                return indexMetadata.withMappingMetadata(entry);
            } else {
                mappingsByHash.put(digest, indexMetadata.mapping());
                return indexMetadata;
            }
        }

        /**
         * Similar to {@link #dedupeMapping(IndexMetadata)}.
         */
        private void dedupeMapping(IndexMetadata.Builder indexMetadataBuilder) {
            if (indexMetadataBuilder.mapping() == null) {
                return;
            }

            String digest = indexMetadataBuilder.mapping().getSha256();
            MappingMetadata entry = mappingsByHash.get(digest);
            if (entry != null) {
                indexMetadataBuilder.putMapping(entry);
            } else {
                mappingsByHash.put(digest, indexMetadataBuilder.mapping());
            }
        }

    }

    private static final ToXContent.Params FORMAT_PARAMS;
    static {
        Map<String, String> params = Maps.newMapWithExpectedSize(2);
        params.put("binary", "true");
        params.put(Metadata.CONTEXT_MODE_PARAM, Metadata.CONTEXT_MODE_GATEWAY);
        FORMAT_PARAMS = new ToXContent.MapParams(params);
    }

    /**
     * State format for {@link Metadata} to write to and load from disk
     */
    public static final MetadataStateFormat<Metadata> FORMAT = new MetadataStateFormat<>(GLOBAL_STATE_FILE_PREFIX) {

        @Override
        public void toXContent(XContentBuilder builder, Metadata state) throws IOException {
            ChunkedToXContent.wrapAsToXContent(state).toXContent(builder, FORMAT_PARAMS);
        }

        @Override
        public Metadata fromXContent(XContentParser parser) throws IOException {
            return Builder.fromXContent(parser);
        }
    };
}
```
{{< /details >}}



## context
#### Code Complexity: 0
### Overview
This line of code signifies a method signature in Java. The method 'context' does not require any parameters to be passed and it returns an EnumSet of type XContentContext. The EnumSet class is a specialized set implementation for use with enum types. Here, XContentContext is an enumerated type (enum) and the method is used to get a set of these enums. The specific functionality of this method, however, will depend on the implementation in the class where it is declared.

### User Acceptance Criteria
```gherkin
Feature: Retrieval of Context Enums
 Scenario: Context EnumSet Retrieval
 Given the system has been initialized and the XContentContext enums are available
 When the context() method is called
 Then the method should return an EnumSet of XContentContext...
```

### Refactoring
Refactoring opportunities for this method are limited without seeing the full class definitions and its usage, as refactoring suggestions largely depend on how and where the method is being used within the larger context of the software. If complexity is contained within the method, it might be worthwhile to consider breaking the method down into subset methods for maintainability. Alternatively, the use of the more generic Set interface might be preferable, to allow for flexibility of the underlying Set implementation.{{< details "Function source code " >}}
```java
EnumSet<XContentContext> context();
```
{{< /details >}}

## isRestorable
#### Code Complexity: 1
### Overview
This Java method `isRestorable` is a public method which returns a boolean value. It checks whether the context contains a specific item which is `XContentContext.SNAPSHOT`. This function is likely used in a class where there's a need to restore state from a snapshot. It's performed by checking the presence of specific 'SNAPSHOT' in the context object.

### User Acceptance Criteria
```gherkin
Feature: Check if context is restorable
Scenario: The context contains item 'SNAPSHOT'
Given the context object
When the 'isRestorable' method is invoked
Then return 'true' if the context contains 'SNAPSHOT'
```

### Refactoring
Without viewing the other parts of the code, this function seems to be simple, concise, and follows the single responsibility principle. No apparent refactoring is necessary for this function in the given context. However, though it seems not necessary here, use of constants for string values like 'SNAPSHOT' can be beneficial in larger systems to avoid erroneous usage.{{< details "Function source code " >}}
```java
default boolean isRestorable() {
            return context().contains(XContentContext.SNAPSHOT);
        }
```
{{< /details >}}

## assertConsistent
#### Code Complexity: 6
### Overview
The `assertConsistent` method is a private boolean method that checks the consistency of the properties in a `DataStreamMetadata` object and returns true if they are consistent. The first assertion checks if `indicesLookup` is equal to the newly built `indicesLookup` object. If there is an exception while ensuring no name collisions, then an assertion failure is thrown. Other assertions verify certain sets of index metadata properties such as states (open, close) and visibility (hidden or visible). The method concludes by returning true, signifying that all assertions have passed and the related properties are consistent.

### User Acceptance Criteria
```gherkin
Since this is a private method, Gherkin user acceptance criteria is not applicable/needed. Gherkin scenarios can only be written for public methods, as those are the ones accessible to the end-users and testers.
```

### Refactoring
This method contains complex code with duplicated patterns and lacks clear separation of concerns/decomposition. A first opportunity for refactoring can be extracting the lambda function `indicesByPredicate` used for filtering and collecting indices by criteria into a separate private method, which would take a predicate parameter and return the filtered set of strings. This way, the code becomes more readable and maintainable. The repeated usage of `assert` can be abstracted into a separate private method, which takes the expected and actual set as parameters and performs the assertion. This would remove the duplicated code and enforce consistency across the assertions.{{< details "Function source code " >}}
```java
private boolean assertConsistent() {
        final var lookup = this.indicesLookup;
        final var dsMetadata = custom(DataStreamMetadata.TYPE, DataStreamMetadata.EMPTY);
        assert lookup == null || lookup.equals(Builder.buildIndicesLookup(dsMetadata, indices));
        try {
            Builder.ensureNoNameCollisions(aliasedIndices.keySet(), indices, dsMetadata);
        } catch (Exception e) {
            assert false : e;
        }
        assert Builder.assertDataStreams(indices, dsMetadata);
        assert Set.of(allIndices).equals(indices.keySet());
        final Function<Predicate<IndexMetadata>, Set<String>> indicesByPredicate = predicate -> indices.entrySet()
            .stream()
            .filter(entry -> predicate.test(entry.getValue()))
            .map(Map.Entry::getKey)
            .collect(Collectors.toUnmodifiableSet());
        assert Set.of(allOpenIndices).equals(indicesByPredicate.apply(idx -> idx.getState() == IndexMetadata.State.OPEN));
        assert Set.of(allClosedIndices).equals(indicesByPredicate.apply(idx -> idx.getState() == IndexMetadata.State.CLOSE));
        assert Set.of(visibleIndices).equals(indicesByPredicate.apply(idx -> idx.isHidden() == false));
        assert Set.of(visibleOpenIndices)
            .equals(indicesByPredicate.apply(idx -> idx.isHidden() == false && idx.getState() == IndexMetadata.State.OPEN));
        assert Set.of(visibleClosedIndices)
            .equals(indicesByPredicate.apply(idx -> idx.isHidden() == false && idx.getState() == IndexMetadata.State.CLOSE));
        return true;
    }
```
{{< /details >}}

## withIncrementedVersion
#### Code Complexity: 2
### Overview
The method 'withIncrementedVersion' is a part of the Metadata class and is responsible for creating a new Metadata object with an incremented version number. Every other property of the new Metadata object (like clusterUUID, transientSettings, indices etc) is identical to the current object's properties. However, the version field on the new Metadata object is incremented by one from the current object's version field.

### User Acceptance Criteria
```gherkin
Feature: Increment Metadata Version
 Scenario: Increment metadata version successfully
 Given the current Metadata object
 When 'withIncrementedVersion' method is invoked
 Then it should return a new Metadata object with the version field incremented by one.
```

### Refactoring
Opportunity 1: Break this method down to avoid creating a completely new object for every version increment operation. Instead, consider modifying only the 'version' field if the other attributes of the Metadata class are not immutable.
 Opportunity 2: Implement null checks and error handling mechanismin this method to avoid runtime exceptions.{{< details "Function source code " >}}
```java
public Metadata withIncrementedVersion() {
        return new Metadata(
            clusterUUID,
            clusterUUIDCommitted,
            version + 1,
            coordinationMetadata,
            transientSettings,
            persistentSettings,
            settings,
            hashesOfConsistentSettings,
            totalNumberOfShards,
            totalOpenIndexShards,
            indices,
            aliasedIndices,
            templates,
            customs,
            allIndices,
            visibleIndices,
            allOpenIndices,
            visibleOpenIndices,
            allClosedIndices,
            visibleClosedIndices,
            indicesLookup,
            mappingsByHash,
            oldestIndexVersion,
            reservedStateMetadata
        );
    }
```
{{< /details >}}

## withLifecycleState
#### Code Complexity: 7
### Overview
The function 'withLifecycleState' is a part of the 'Metadata' class that is responsible for managing the lifecycle state of an index in the Metadata. It takes two parameters: 'index' and 'lifecycleState'. At first, it checks if both parameters are not null. The method then retrieves the metadata of the given index and compares its existing lifecycle state with the new one that is passed as a parameter. If they are equal, the function returns the current object without making any changes. Otherwise, it builds a new IndexMetadata object, increments the version, assigns the new lifecycle state, and builds a new Metadata object with updated index metadata, bypassing Metadata.Builder validation for efficiency, since only a minor part of the metadata is being altered.

### User Acceptance Criteria
```gherkin
Feature: Update lifecycle state of an Index
Scenario: Valid lifecycle state provided
Given the index and lifecycleState are not null
And the lifecycleState for the given index is not identical to the provided lifecycleState
When the 'withLifecycleState' function is invoked with a valid index and lifecycleState
Then the IndexMetadata for index should be updated with the new lifecyleState and incremented version
 And a new Metadata object with updated index metadata is returned.
```

### Refactoring
The 'withLifecycleState' function is quite long and does several different things, creating opportunity to refactor for easier readability and maintainability. Consider extracting the logic of building a new IndexMetadata into a separate helper method, 'buildIndexMetadata'. Additionally, the null checks could be made more robust by including specific error messages in the thrown NullPointerExceptions. This would improve the debugging process by making it easier to identify which argument is null.{{< details "Function source code " >}}
```java
public Metadata withLifecycleState(final Index index, final LifecycleExecutionState lifecycleState) {
        Objects.requireNonNull(index, "index must not be null");
        Objects.requireNonNull(lifecycleState, "lifecycleState must not be null");

        IndexMetadata indexMetadata = getIndexSafe(index);
        if (lifecycleState.equals(indexMetadata.getLifecycleExecutionState())) {
            return this;
        }

        // build a new index metadata with the version incremented and the new lifecycle state
        IndexMetadata.Builder indexMetadataBuilder = IndexMetadata.builder(indexMetadata);
        indexMetadataBuilder.version(indexMetadataBuilder.version() + 1);
        indexMetadataBuilder.putCustom(ILM_CUSTOM_METADATA_KEY, lifecycleState.asMap());

        // drop it into the indices
        final ImmutableOpenMap.Builder<String, IndexMetadata> builder = ImmutableOpenMap.builder(indices);
        builder.put(index.getName(), indexMetadataBuilder.build());

        // construct a new Metadata object directly rather than using Metadata.builder(this).[...].build().
        // the Metadata.Builder validation needs to handle the general case where anything at all could
        // have changed, and hence it is expensive -- since we are changing so little about the metadata
        // (and at a leaf in the object tree), we can bypass that validation for efficiency's sake
        return new Metadata(
            clusterUUID,
            clusterUUIDCommitted,
            version,
            coordinationMetadata,
            transientSettings,
            persistentSettings,
            settings,
            hashesOfConsistentSettings,
            totalNumberOfShards,
            totalOpenIndexShards,
            builder.build(),
            aliasedIndices,
            templates,
            customs,
            allIndices,
            visibleIndices,
            allOpenIndices,
            visibleOpenIndices,
            allClosedIndices,
            visibleClosedIndices,
            indicesLookup,
            mappingsByHash,
            oldestIndexVersion,
            reservedStateMetadata
        );
    }
```
{{< /details >}}

## withIndexSettingsUpdates
#### Code Complexity: 3
### Overview
This method named 'withIndexSettingsUpdates' accepts a Map containing Index and Settings as inputs. The method checks if the map has any null elements and throws an exception if any null element is found. It then creates a map builder with the same content as 'indices'. After this, for each index and settings pair provided in the input map, it removes the corresponding index from the new builder, increments the settings version of the index, and puts the index back into the builder with the updated settings. Finally, a new metadata object is created using various parameters including the updated indices map, and returned.

### User Acceptance Criteria
```gherkin
Feature: Update Index Settings
Scenario: Valid index and settings
Given a non-empty map of indices and their settings
When the 'withIndexSettingsUpdates' method is invoked with the map
Then the settings for the corresponding indices should be updated in the metadata
```

### Refactoring
There are multiple opportunities for refactoring. To start with, the updates can be encapsulated into a separate method for improved readability and maintainability. We could also add null checks for individual indices and settings in the input map to increase the robustness of the code. Increasing the version of settings logic can be abstracted into a separate method which can handle exception scenarios whenever the settings version cannot be incremented further.{{< details "Function source code " >}}
```java
public Metadata withIndexSettingsUpdates(final Map<Index, Settings> updates) {
        Objects.requireNonNull(updates, "no indices to update settings for");

        final ImmutableOpenMap.Builder<String, IndexMetadata> builder = ImmutableOpenMap.builder(indices);
        updates.forEach((index, settings) -> {
            IndexMetadata previous = builder.remove(index.getName());
            assert previous != null : index;
            builder.put(
                index.getName(),
                IndexMetadata.builder(previous).settingsVersion(previous.getSettingsVersion() + 1L).settings(settings).build()
            );
        });
        return new Metadata(
            clusterUUID,
            clusterUUIDCommitted,
            version,
            coordinationMetadata,
            transientSettings,
            persistentSettings,
            settings,
            hashesOfConsistentSettings,
            totalNumberOfShards,
            totalOpenIndexShards,
            builder.build(),
            aliasedIndices,
            templates,
            customs,
            allIndices,
            visibleIndices,
            allOpenIndices,
            visibleOpenIndices,
            allClosedIndices,
            visibleClosedIndices,
            indicesLookup,
            mappingsByHash,
            oldestIndexVersion,
            reservedStateMetadata
        );
    }
```
{{< /details >}}

## withCoordinationMetadata
#### Code Complexity: 2
### Overview
This public method 'withCoordinationMetadata' is part of a 'Metadata' class in Java. It takes a parameter of type 'CoordinationMetadata'. The method creates and returns a new instance of 'Metadata', with the provided 'coordinationMetadata' and other unmodified existing properties of 'Metadata'.

### User Acceptance Criteria
```gherkin
Feature: Setting Coordination Metadata in Metadata object
 Scenario: Set coordination metadata in Metadata instance
 Given a Metadata instance and a CoordinationMetadata object
 When the method 'withCoordinationMetadata' is called with the CoordinationMetadata object
 Then a new Metadata object should be returned with updated CoordinationMetadata and all other properties remaining the same
```

### Refactoring
To better adhere to the Single Responsibility Principle, it could be beneficial to separate the creation of a new Metadata object into a different method or class. This could include creating a MetadataBuilder class or a separate MetadataController. This will make the code more maintainable and manageable, especially if more properties are added to the Metadata class in the future. Additionally, adding null checking and error handling can make the code more robust and prevent runtime errors.{{< details "Function source code " >}}
```java
public Metadata withCoordinationMetadata(CoordinationMetadata coordinationMetadata) {
        return new Metadata(
            clusterUUID,
            clusterUUIDCommitted,
            version,
            coordinationMetadata,
            transientSettings,
            persistentSettings,
            settings,
            hashesOfConsistentSettings,
            totalNumberOfShards,
            totalOpenIndexShards,
            indices,
            aliasedIndices,
            templates,
            customs,
            allIndices,
            visibleIndices,
            allOpenIndices,
            visibleOpenIndices,
            allClosedIndices,
            visibleClosedIndices,
            indicesLookup,
            mappingsByHash,
            oldestIndexVersion,
            reservedStateMetadata
        );
    }
```
{{< /details >}}

## withLastCommittedValues
#### Code Complexity: 7
### Overview
This is a function named `withLastCommittedValues`. It checks whether the input parameters `clusterUUIDCommitted` and `lastCommittedConfiguration` are equal to the current instance's variables. If they are exactly the same, it returns the current instance object; otherwise, it creates a new instance of `Metadata` with the input parameters as the new values.

### User Acceptance Criteria
```gherkin
Feature: Maintain Last Committed Values

Scenario: Identical Last Committed Values
Given that an identical cluster UUID committed status and last committed configuration already exist
When the method withLastCommittedValues is invoked
Then it should return the current instance of Metadata.

Scenario: Different Last Committed Values
Given that different cluster UUID committed status and last committed configuration parameters are provided
When the method withLastCommittedValues is invoked
Then it should return a new instance of Metadata with the provided parameters.
```

### Refactoring
There's an opportunity to refactor code in terms of error handling. Although it's not mandatory, it's considered a best practice to handle potential null values to prevent null pointer exceptions. The function could be refactored to include null-checks for `lastCommittedConfiguration`, beforehand. Also, a defensive copy of `lastCommittedConfiguration` could be made to safeguard against changes to the original reference being reflected in the Metadata instance.{{< details "Function source code " >}}
```java
public Metadata withLastCommittedValues(
        boolean clusterUUIDCommitted,
        CoordinationMetadata.VotingConfiguration lastCommittedConfiguration
    ) {
        if (clusterUUIDCommitted == this.clusterUUIDCommitted
            && lastCommittedConfiguration.equals(this.coordinationMetadata.getLastCommittedConfiguration())) {
            return this;
        }
        return new Metadata(
            clusterUUID,
            clusterUUIDCommitted,
            version,
            CoordinationMetadata.builder(coordinationMetadata).lastCommittedConfiguration(lastCommittedConfiguration).build(),
            transientSettings,
            persistentSettings,
            settings,
            hashesOfConsistentSettings,
            totalNumberOfShards,
            totalOpenIndexShards,
            indices,
            aliasedIndices,
            templates,
            customs,
            allIndices,
            visibleIndices,
            allOpenIndices,
            visibleOpenIndices,
            allClosedIndices,
            visibleClosedIndices,
            indicesLookup,
            mappingsByHash,
            oldestIndexVersion,
            reservedStateMetadata
        );
    }
```
{{< /details >}}

## withAllocationAndTermUpdatesOnly
#### Code Complexity: 6
### Overview
This is a public method within a Metadata class that accepts a map of strings to IndexMetadata objects as input, and returns an updated Metadata object. First, the method checks if the input map, labeled as 'updates', is empty. If it is empty, the method returns the current state of the object. If the 'updates' map is non-empty, the method builds an updated version of the indices map within the Metadata object by merging existing indices with the updates. This new indices map is then used to create a new Metadata object which is returned. The rest of the attributes of the Metadata object remain unchanged.

### User Acceptance Criteria
```gherkin
Feature: Metadata Update
Scenario: Updating Allocation and Terms with Non-empty Updates
Given existing metadata of an index
When a map of updated index metadata is provided
And the updates map is not empty
Then a new metadata is returned with updated indices
But rest of the metadata of the index remains the same.
```

### Refactoring
Suggestion 1: Avoid putting method arguments directly in the constructor, as it does not ensure they are not null.
Suggestion 2: It might be beneficial to not create a new Metadata object every time updates are received. Consider updating the existing object or designing the class to be mutable to improve performance, especially for large datasets.{{< details "Function source code " >}}
```java
public Metadata withAllocationAndTermUpdatesOnly(Map<String, IndexMetadata> updates) {
        if (updates.isEmpty()) {
            return this;
        }
        final var updatedIndicesBuilder = ImmutableOpenMap.builder(indices);
        updatedIndicesBuilder.putAllFromMap(updates);
        return new Metadata(
            clusterUUID,
            clusterUUIDCommitted,
            version,
            coordinationMetadata,
            transientSettings,
            persistentSettings,
            settings,
            hashesOfConsistentSettings,
            totalNumberOfShards,
            totalOpenIndexShards,
            updatedIndicesBuilder.build(),
            aliasedIndices,
            templates,
            customs,
            allIndices,
            visibleIndices,
            allOpenIndices,
            visibleOpenIndices,
            allClosedIndices,
            visibleClosedIndices,
            indicesLookup,
            mappingsByHash,
            oldestIndexVersion,
            reservedStateMetadata
        );
    }
```
{{< /details >}}

## withAddedIndex
#### Code Complexity: 42
### Overview
The function 'withAddedIndex' belongs to the class 'Metadata' and is responsible for managing the indices metadata when a new index is introduced. It validates and calculates the various states of indices such as visible indices, all indices, open indices, and closed indices. It also updates aliases and mappings associated with the new index. If an index with a similar name to the one being added already exists, it prevents a name collision. If the index is in the 'OPEN' or 'CLOSE' state, it manages the appropriate indices arrays. It handles the possible exceptions where the index is neither opened nor closed which is considered unnatural. It also handles the case if mappingMetadata is provided, it checks the existing mapping. Finally, it results in a new Metadata object with the updated values.

### User Acceptance Criteria
```gherkin
Feature: Addition of a new index to metadata
  Scenario: Valid index addition
    Given the new index with its associated properties
    When the method 'withAddedIndex' is invoked with the new index as a parameter
    Then it should ensure no index name collision occurs
    And it should update and manage metadata related to indices and their states
    And it should handle the associated aliases and mappings
    Finally, it should create a new metadata object with updated indices.
```

### Refactoring
The 'withAddedIndex' method has quite complex handling for various index states which leads to code duplication. This could be simplified by extracting methods to handle different index states separately. Also, there could be a separate method to handle the mapping metadata, making the current method cleaner and maintaining the Single Responsibility Principle. The logic for updating indices can be further abstracted to reduce duplication. Utilizing more efficient data structures for indices storage could also be considered for improvement.{{< details "Function source code " >}}
```java
public Metadata withAddedIndex(IndexMetadata index) {
        final String indexName = index.getIndex().getName();
        ensureNoNameCollision(indexName);
        final Map<String, AliasMetadata> aliases = index.getAliases();
        final ImmutableOpenMap<String, Set<Index>> updatedAliases = aliasesAfterAddingIndex(index, aliases);
        final String[] updatedVisibleIndices;
        if (index.isHidden()) {
            updatedVisibleIndices = visibleIndices;
        } else {
            updatedVisibleIndices = ArrayUtils.append(visibleIndices, indexName);
        }

        final String[] updatedAllIndices = ArrayUtils.append(allIndices, indexName);
        final String[] updatedOpenIndices;
        final String[] updatedClosedIndices;
        final String[] updatedVisibleOpenIndices;
        final String[] updatedVisibleClosedIndices;
        switch (index.getState()) {
            case OPEN -> {
                updatedOpenIndices = ArrayUtils.append(allOpenIndices, indexName);
                if (index.isHidden() == false) {
                    updatedVisibleOpenIndices = ArrayUtils.append(visibleOpenIndices, indexName);
                } else {
                    updatedVisibleOpenIndices = visibleOpenIndices;
                }
                updatedVisibleClosedIndices = visibleClosedIndices;
                updatedClosedIndices = allClosedIndices;
            }
            case CLOSE -> {
                updatedOpenIndices = allOpenIndices;
                updatedClosedIndices = ArrayUtils.append(allClosedIndices, indexName);
                updatedVisibleOpenIndices = visibleOpenIndices;
                if (index.isHidden() == false) {
                    updatedVisibleClosedIndices = ArrayUtils.append(visibleClosedIndices, indexName);
                } else {
                    updatedVisibleClosedIndices = visibleClosedIndices;
                }
            }
            default -> throw new AssertionError("impossible, index is either open or closed");
        }

        final MappingMetadata mappingMetadata = index.mapping();
        final Map<String, MappingMetadata> updatedMappingsByHash;
        if (mappingMetadata == null) {
            updatedMappingsByHash = mappingsByHash;
        } else {
            final MappingMetadata existingMapping = mappingsByHash.get(mappingMetadata.getSha256());
            if (existingMapping != null) {
                index = index.withMappingMetadata(existingMapping);
                updatedMappingsByHash = mappingsByHash;
            } else {
                updatedMappingsByHash = Maps.copyMapWithAddedEntry(mappingsByHash, mappingMetadata.getSha256(), mappingMetadata);
            }
        }

        final ImmutableOpenMap.Builder<String, IndexMetadata> builder = ImmutableOpenMap.builder(indices);
        builder.put(indexName, index);
        final ImmutableOpenMap<String, IndexMetadata> indicesMap = builder.build();
        for (var entry : updatedAliases.entrySet()) {
            List<IndexMetadata> aliasIndices = entry.getValue().stream().map(idx -> indicesMap.get(idx.getName())).toList();
            Builder.validateAlias(entry.getKey(), aliasIndices);
        }
        return new Metadata(
            clusterUUID,
            clusterUUIDCommitted,
            version,
            coordinationMetadata,
            transientSettings,
            persistentSettings,
            settings,
            hashesOfConsistentSettings,
            totalNumberOfShards + index.getTotalNumberOfShards(),
            totalOpenIndexShards + (index.getState() == IndexMetadata.State.OPEN ? index.getTotalNumberOfShards() : 0),
            indicesMap,
            updatedAliases,
            templates,
            customs,
            updatedAllIndices,
            updatedVisibleIndices,
            updatedOpenIndices,
            updatedVisibleOpenIndices,
            updatedClosedIndices,
            updatedVisibleClosedIndices,
            null,
            updatedMappingsByHash,
            IndexVersion.min(IndexVersion.fromId(index.getCompatibilityVersion().id), oldestIndexVersion),
            reservedStateMetadata
        );
    }
```
{{< /details >}}

## aliasesAfterAddingIndex
#### Code Complexity: 14
### Overview
This function is named 'aliasesAfterAddingIndex' and it is inside an undefined class. It takes two parameters 'index' which is of type IndexMetadata and 'aliases' which is of type Map. It is used for adding an Index to the set of aliases for each key in the alias Map provided there's no name collision. First, it checks if the passed alias Map is empty. If it's empty, it simply returns the original aliasedIndices map. If not, it gets the name of the index and initiates a Builder of ImmutableOpenMap. Then it iterates over the keys in the aliases map. For each key, it verifies that the index name doesn't collide with any existing aliases. If there's a collision it throws an exception. If there's no collision it checks if the builder already contains the current key. If it does, the index is added to the existing Set. If it doesn't the Set is created with the current index and put into the Map. This operation is done for all keys in alias Map. Finally, it builds and returns the ImmutableOpenMap.

### User Acceptance Criteria
```gherkin
Feature: Adding Index to Aliased Indices
 Scenario: When the aliases map is empty
 Given an existing set of aliased Indices And an empty aliases map
 The original aliased Indices should be returned.
 Scenario: When the aliases map is not empty
 Given an existing set of aliased Indices And a non-empty aliases map
 When the index name does not conflict with any of the existing aliases
 Then the index should be added to each alias in the map
 Scenario: When there is an alias name collision
 Given an existing set of aliased Indices
 When the index name conflicts with any of the existing aliases
 Then an exception will be thrown.
```

### Refactoring
The code can be refactored by moving the adding index to set logic into a separate method. This method would accept a set and an index as parameters, handle the adding operation, and return the updated set. This would increase readability by reducing the complexity of the main function. This function could also benefit from improved error handling, specifically around concurrent modification exceptions. The function also assumes that ensureNoNameCollision won't throw an exception or it's handled elsewhere, it might be the case or not depending on the context. If not, handling it here would make this function more reliable.{{< details "Function source code " >}}
```java
private ImmutableOpenMap<String, Set<Index>> aliasesAfterAddingIndex(IndexMetadata index, Map<String, AliasMetadata> aliases) {
        if (aliases.isEmpty()) {
            return aliasedIndices;
        }
        final String indexName = index.getIndex().getName();
        final ImmutableOpenMap.Builder<String, Set<Index>> aliasesBuilder = ImmutableOpenMap.builder(aliasedIndices);
        for (String alias : aliases.keySet()) {
            ensureNoNameCollision(alias);
            if (aliasedIndices.containsKey(indexName)) {
                throw new IllegalArgumentException("alias with name [" + indexName + "] already exists");
            }
            final Set<Index> found = aliasesBuilder.get(alias);
            final Set<Index> updated;
            if (found == null) {
                updated = Set.of(index.getIndex());
            } else {
                final Set<Index> tmp = new HashSet<>(found);
                tmp.add(index.getIndex());
                updated = Set.copyOf(tmp);
            }
            aliasesBuilder.put(alias, updated);
        }
        return aliasesBuilder.build();
    }
```
{{< /details >}}

## ensureNoNameCollision
#### Code Complexity: 13
### Overview
This is a private helper function named 'ensureNoNameCollision', it takes as input a string 'indexName' and makes sure that there is not already an existing index, data stream, or data stream alias with the same name. If there is, the function will throw an IllegalArgumentException or an IllegalStateException.

### Refactoring
The function currently performs three separate checks for different types of name collisions. We could consider breaking these out into separate helper functions to respect the Single Responsibility Principle.{{< details "Function source code " >}}
```java
private void ensureNoNameCollision(String indexName) {
        if (indices.containsKey(indexName)) {
            throw new IllegalArgumentException("index with name [" + indexName + "] already exists");
        }
        if (dataStreams().containsKey(indexName)) {
            throw new IllegalArgumentException("data stream with name [" + indexName + "] already exists");
        }
        if (dataStreamAliases().containsKey(indexName)) {
            throw new IllegalStateException("data stream alias and indices alias have the same name (" + indexName + ")");
        }
    }
```
{{< /details >}}

## version
#### Code Complexity: 1
### Overview
The presented method is a getter for a 'version' property of a class. It is accessing and returning the value of a private instance variable 'version'. The 'version' is of long data type.

### Refactoring
There is no apparent need for substantial refactoring in this provided function as it is pretty straightforward. The function adheres to single responsibility principle and is quite simple without any complex or duplicate logic.{{< details "Function source code " >}}
```java
public long version() {
        return this.version;
    }
```
{{< /details >}}

## clusterUUID
#### Code Complexity: 1
### Overview
This is a simple getter method named clusterUUID. It is part of a class (not specified here) and returns the 'clusterUUID' property of the class instance. As a getter, its primary function is to provide public access to private class properties.

### Refactoring
No refactoring opportunity is evident from this isolated method. Just ensure the Principle of Least Privilege (only necessary information should be made accessible) is meticulously followed throughout the use of the getter, depending on the sensitivity and essentiality of 'clusterUUID'.{{< details "Function source code " >}}
```java
public String clusterUUID() {
        return this.clusterUUID;
    }
```
{{< /details >}}

## clusterUUIDCommitted
#### Code Complexity: 1
### Overview
This code is a getter method for the 'clusterUUIDCommitted' field in a class. It doesn't perform any calculations or calls other methods. Simply returns the value of 'clusterUUIDCommitted'.

### Refactoring
As it stands, this method seems fine and there don't seem to be any violations of SOLID principles. However, if 'clusterUUIDCommitted' status is calculated in many places, it might be worth refactoring that calculation into a single method.{{< details "Function source code " >}}
```java
public boolean clusterUUIDCommitted() {
        return this.clusterUUIDCommitted;
    }
```
{{< /details >}}

## settings
#### Code Complexity: 1
### Overview
This is a getter method for the 'settings' instance variable. It returns the current value of 'settings'.

### User Acceptance Criteria
```gherkin
Feature: Getting Settings Instance Variable
Scenario: Retrieve Settings Instance Variable
Given a defined Settings instance variable
When the getter method is called
Then the current value of the Settings instance variable should be returned
```

### Refactoring
There doesn't seem to be any refactoring needed for this method as it is simple, adheres to the single responsibility principle (it only gets the value of an instance variable), and there doesn't appear to be any repeated code.{{< details "Function source code " >}}
```java
public Settings settings() {
        return this.settings;
    }
```
{{< /details >}}

## transientSettings
#### Code Complexity: 1
### Overview
This is a simple getter method named 'transientSettings'. The purpose of this function is to return the current settings of an object. The method belongs to the public domain and is meant to allow other parts of the application to read the 'transientSettings' property of a given object. The method does not modify any properties and has no side effects.

### User Acceptance Criteria
```gherkin
Given that this method is simply a getter method, it does not automatically warrant a Gherkin behavioral testing scenario. It inherently does not alter any state or behavior of the system.
```

### Refactoring
As this is a simple getter, there is little opportunity for refactoring. However, it might be worth investigating where and how many times this method is used - if it is overused, it may indicate a violation of the Law of Demeter, also known as 'the principle of least knowledge'.{{< details "Function source code " >}}
```java
public Settings transientSettings() {
        return this.transientSettings;
    }
```
{{< /details >}}

## persistentSettings
#### Code Complexity: 1
### Overview
This is a simple getter method named 'persistentSettings' in a class. The method is public implying it can be accessed from outside this class. It doesn't accept any parameters and its purpose is to return the value of the instance variable 'persistentSettings', which seems to be an object of type 'Settings'.

### User Acceptance Criteria
```gherkin
N/A since this is a getter method
```

### Refactoring
No significant refactorings are necessary as this is simply a getter method. But consider adding the relevant validation or access control mechanisms if the data is sensitive.{{< details "Function source code " >}}
```java
public Settings persistentSettings() {
        return this.persistentSettings;
    }
```
{{< /details >}}

## hashesOfConsistentSettings
#### Code Complexity: 1
### Overview
This function is a public method called hashesOfConsistentSettings(). It is a getter method that returns a Map with String as both key and value. This Map contains the hashes of consistent settings from an object of the class this method is defined in. The method does not take any parameters.

### Refactoring
To mitigate this risk, it is suggested to return an unmodifiable view of the Map. This can be achieved by wrapping the returned Map inside the Collections.unmodifiableMap() method. This way, we can prevent modifications of the Map outside of the class.{{< details "Function source code " >}}
```java
public Map<String, String> hashesOfConsistentSettings() {
        return this.hashesOfConsistentSettings;
    }
```
{{< /details >}}

## coordinationMetadata
#### Code Complexity: 1
### Overview
This function is a getter method for the 'coordinationMetadata' property of the enclosing class instance. It simply returns the present value of 'coordinationMetadata'.

### Refactoring
No refactoring is needed as it is a standard getter method. However, consider applying tighter access control if 'coordinationMetadata' doesn't need to be exposed or consider returning a clone or immutable version if it should be read-only.{{< details "Function source code " >}}
```java
public CoordinationMetadata coordinationMetadata() {
        return this.coordinationMetadata;
    }
```
{{< /details >}}

## oldestIndexVersion
#### Code Complexity: 1
### Overview
This is a getter method for the 'oldestIndexVersion' attribute of the object. It simply returns the value of the 'oldestIndexVersion' attribute when called.

### Refactoring
There's no immediate need for refactoring as this is a standard getter method. If the 'oldestIndexVersion' attribute needs to be protected from direct exposure, consider incorporating additional logic such as access control checks.{{< details "Function source code " >}}
```java
public IndexVersion oldestIndexVersion() {
        return this.oldestIndexVersion;
    }
```
{{< /details >}}

## equalsAliases
#### Code Complexity: 21
### Overview
The 'equalsAliases' function is part of the 'Metadata' class and is responsible for comparing the current Metadata object with another Metadata object provided as parameter. It contains two main sections: index metadata comparison and data stream alias comparison. The function checks if the indices and data stream aliases in the current object are equal to those in the other object. It returns 'false' as soon as it finds a mismatch, whether in the indices or the data stream aliases. If there’s no mismatch, it returns 'true' at the end.

### User Acceptance Criteria
```gherkin
Feature: Alias Equality Checking in Metadata. 
 Scenario: Check if aliases are equal or not. 
 Given a second Metadata object 
 When the 'equalsAliases' function is called with the second Metadata object 
 Then it should return 'true' if all indices and data stream aliases are same in the two objects and 'false' otherwise.
```

### Refactoring
The code includes some duplicated structures that could be refactored to make the function more concise and maintainable. This could be achieved by using a private 'compareCollections' function that abstracts the repeated logic for comparing indices and data stream aliases. Violation of DRY principle (Don't Repeat Yourself) can be observed in the repeated usage of a null check, equality check and returning false operations.{{< details "Function source code " >}}
```java
public boolean equalsAliases(Metadata other) {
        for (IndexMetadata otherIndex : other.indices().values()) {
            IndexMetadata thisIndex = index(otherIndex.getIndex());
            if (thisIndex == null) {
                return false;
            }
            if (otherIndex.getAliases().equals(thisIndex.getAliases()) == false) {
                return false;
            }
        }

        if (other.dataStreamAliases().size() != dataStreamAliases().size()) {
            return false;
        }
        for (DataStreamAlias otherAlias : other.dataStreamAliases().values()) {
            DataStreamAlias thisAlias = dataStreamAliases().get(otherAlias.getName());
            if (thisAlias == null) {
                return false;
            }
            if (thisAlias.equals(otherAlias) == false) {
                return false;
            }
        }

        return true;
    }
```
{{< /details >}}

## indicesLookupInitialized
#### Code Complexity: 1
### Overview
The function 'indicesLookupInitialized' is a simple public method which checks if the object 'indicesLookup' has been initialized or not. It returns a boolean value; 'true' if the 'indicesLookup' has been initialized, 'false' if it is still null.

### User Acceptance Criteria
```gherkin
Feature: IndicesLookup Initialization Check
 Scenario: Check if indicesLookup is initialized
 Given the indicesLookup object is available in the memory
 When the function indicesLookupInitialized is invoked
 Then it should return a boolean value representing if the indicesLookup object has been initialized or not
```

### Refactoring
As part of refactoring, an exception handling mechanism should be introduced to handle scenarios where the 'indicesLookup' object does not exist or is temporarily unreachable. It can then return a more descriptive status. Also, instead of directly exposing object status, a secure way of status enquiry could be devised, such as returning an encoding of initialization statuses.{{< details "Function source code " >}}
```java
public boolean indicesLookupInitialized() {
        return indicesLookup != null;
    }
```
{{< /details >}}

## getIndicesLookup
#### Code Complexity: 5
### Overview
The function 'getIndicesLookup()' is a public method that retrieves a SortedMap representing the indices lookup. If the indices lookup is null, it calls a function 'buildIndicesLookup()' to build it before returning the result.

### User Acceptance Criteria
```gherkin
Feature: Fetching Indices Lookup
 Scenario: Valid Indices Lookup Retrieval
 Given the function 'getIndicesLookup()' is called
 When the indices lookup exists
 Then it should return the existing indices lookup
 But when the indices lookup is null
 Then it should build the lookup using 'buildIndicesLookup()' function and return the result.
```

### Refactoring
The method can be refactored to improve thread-safety. It could use double-checked locking or initialize-on-demand holder idiom to ensure 'buildIndicesLookup()' is called only once. Depending on the use case, these might or might not be suitable, then proper synchronization needs to be considered to prevent possible concurrency issues.{{< details "Function source code " >}}
```java
public SortedMap<String, IndexAbstraction> getIndicesLookup() {
        SortedMap<String, IndexAbstraction> lookup = indicesLookup;
        if (lookup == null) {
            lookup = buildIndicesLookup();
        }
        return lookup;
    }
```
{{< /details >}}

## buildIndicesLookup
#### Code Complexity: 5
### Overview
The function 'buildIndicesLookup' is a private and synchronized method aiming to return a Sorted Map representing indicesLookup, which seems to be a structure keeping track of indices on a data stream. The function first checks if the 'indicesLookup' is already initialized, if it is, it simply returns the previously initialized structure. If it's not initialized yet, the function utilizes a builder to construct the indices structure using 'DataStreamMetadata' with its type and empty data. After building it, the function updates the 'indicesLookup' with the recently built structure and return it.

### Refactoring
At the moment, there seems to be minimal scope for improvement since the function follows a single responsibility principle by just initializing the 'indicesLookup' structure if it's not previously initialized and return it. However, it's important to check whether the synchronization is necessary or not as it might cause a potential bottleneck when it is used in a multi-threaded context. Also, the indexing operation could potentially be isolated in a different method for better readability and testability if it involves any complex calculations or operations.{{< details "Function source code " >}}
```java
private synchronized SortedMap<String, IndexAbstraction> buildIndicesLookup() {
        SortedMap<String, IndexAbstraction> i = indicesLookup;
        if (i != null) {
            return i;
        }
        i = Builder.buildIndicesLookup(custom(DataStreamMetadata.TYPE, DataStreamMetadata.EMPTY), indices);
        indicesLookup = i;
        return i;
    }
```
{{< /details >}}

## sameIndicesLookup
#### Code Complexity: 1
### Overview
The given function 'sameIndicesLookup' takes an object of 'Metadata' class as parameter and checks if the 'indicesLookup' property of the current object is equal to the 'indicesLookup' property of the passed object. It returns a boolean value true if they are equal, false otherwise.

### User Acceptance Criteria
```gherkin
Feature: Metadata Indices Lookup Comparison
 Scenario: Comparing indicesLookup of two Metadata objects
 Given two Metadata objects 
 When the 'sameIndicesLookup' method is invoked on one of them by passing the second object as parameter 
 Then it should return true if both Metadata objects have the same 'indicesLookup', false otherwise.
```

### Refactoring
The function is small, clear, and follows good coding practices, so there is no need for major refactoring. However, there could be an improvement in error handling. Assumptions about the state of the objects can be risky, a defensive programming approach can be introduced to check if the 'indicesLookup' property in 'other' object and the current object have been initialized or not before making the comparison.{{< details "Function source code " >}}
```java
public boolean sameIndicesLookup(Metadata other) {
        return this.indicesLookup == other.indicesLookup;
    }
```
{{< /details >}}

## findAllAliases
#### Code Complexity: 1
### Overview
The method 'findAllAliases' in this given code accepts an array of concrete indices in the form of a string array, and is responsible for returning a map containing all aliases for the provided indices. The function internally calls another function findAliases with an empty array and the given concrete indices as its parameters.

### User Acceptance Criteria
```gherkin
Feature: Alias Extraction
 Scenario: Extract all aliases
 Given an array of concrete indices
 When the method 'findAllAliases' is called
 Then it should return a map containing all aliases related to the provided indices.
```

### Refactoring
Refactoring opportunity lies in exception or error handling. It would be better to add null value checking or error handling to avoid potential Null Point Exceptions. Moreover, extracting the shared logic into a separate, reusable utility method that can be invoked by this and other methods can improve the code maintainability.{{< details "Function source code " >}}
```java
public Map<String, List<AliasMetadata>> findAllAliases(final String[] concreteIndices) {
        return findAliases(Strings.EMPTY_ARRAY, concreteIndices);
    }
```
{{< /details >}}

## findAliases
#### Code Complexity: 59
### Overview
The provided method `findAliases` is from an index service class that is responsible for searching aliases within a given list of concrete indices. The method takes in two arrays - 'aliases' and 'concreteIndices'. The method first checks that neither of these inputs are null and that the 'concreteIndices' array is not empty. If 'concreteIndices' is empty, the method returns an empty ImmutableOpenMap. The method then loops over the 'aliases' array to evaluate include/exclude condition based on certain criteria. This processed array of aliases is used to match against aliases from each concrete indexes. The filtered aliases for each index are kept in an array list which is kept sorted and added to a map against its respective index. Finally, this map is returned as result.

### User Acceptance Criteria
```gherkin
Feature: Alias Matching from indices
Scenario: Searching and Sorting valid Aliases
Given the 'aliases' and 'concreteIndices' arrays are not null
When an attempt is made to find aliases within the provided concreteIndices
Then a map should be returned where each entry corresponds to a concrete index and its matching, sorted aliases not discrepant with the conditions set upon by aliases array.
```

### Refactoring
The function is complex and could be simplified by breaking it down into smaller, more manageable functions. This would also enhance readability and maintainability. A possible violation can be found against the 'Single Responsibility Principle' i.e., 'sorting the aliases' can be a separate function. Additionally, it can be seen there is repeated code for matching patterns that can be isolated as a separate boolean function receiving patterns, aliases, and the corresponding flags for match criteria as parameters providing true or false for matched result.{{< details "Function source code " >}}
```java
public Map<String, List<AliasMetadata>> findAliases(final String[] aliases, final String[] concreteIndices) {
        assert aliases != null;
        assert concreteIndices != null;
        if (concreteIndices.length == 0) {
            return ImmutableOpenMap.of();
        }
        String[] patterns = new String[aliases.length];
        boolean[] include = new boolean[aliases.length];
        for (int i = 0; i < aliases.length; i++) {
            String alias = aliases[i];
            if (alias.charAt(0) == '-') {
                patterns[i] = alias.substring(1);
                include[i] = false;
            } else {
                patterns[i] = alias;
                include[i] = true;
            }
        }
        boolean matchAllAliases = patterns.length == 0;
        ImmutableOpenMap.Builder<String, List<AliasMetadata>> mapBuilder = ImmutableOpenMap.builder();
        for (String index : concreteIndices) {
            IndexMetadata indexMetadata = indices.get(index);
            List<AliasMetadata> filteredValues = new ArrayList<>();
            for (AliasMetadata aliasMetadata : indexMetadata.getAliases().values()) {
                boolean matched = matchAllAliases;
                String alias = aliasMetadata.alias();
                for (int i = 0; i < patterns.length; i++) {
                    if (include[i]) {
                        if (matched == false) {
                            String pattern = patterns[i];
                            matched = ALL.equals(pattern) || Regex.simpleMatch(pattern, alias);
                        }
                    } else if (matched) {
                        matched = Regex.simpleMatch(patterns[i], alias) == false;
                    }
                }
                if (matched) {
                    filteredValues.add(aliasMetadata);
                }
            }
            if (filteredValues.isEmpty() == false) {
                // Make the list order deterministic
                CollectionUtil.timSort(filteredValues, Comparator.comparing(AliasMetadata::alias));
                mapBuilder.put(index, Collections.unmodifiableList(filteredValues));
            }
        }
        return mapBuilder.build();
    }
```
{{< /details >}}

## findMappings
#### Code Complexity: 6
### Overview
The method 'findMappings' is a public method in a class. The task of this method is to find mappings for provided indices in an efficient manner. It takes three parameters: 'concreteIndices' which is an array of index names, a 'fieldFilter' function to apply on each index for getting a predicate to filter fields, and a 'onNextIndex' Runnable that gets executed with each index iteration. For each index present in the 'concreteIndices', it applies the field filter function and puts resultant index-mapping pair to the index map being built. This function asserts if it is being called from a transport thread because decompressing mappings is not recommended for a transport thread. If no indices are provided, an empty immutable map is returned.

### User Acceptance Criteria
```gherkin
Feature: Mapping Find
 Scenario: Finding Mappings for Provided Indices
 Given that the indices data is present
 When the 'findMappings' function is called with some indices
 Then it should return the mappings metadata for those indices if they exist.

 Scenario: Handling Empty Indices Input
 Given that the indices data is available
 When the 'findMappings' function is invoked with no concrete indices
 Then it should return an empty map.
```

### Refactoring
Opportunity 1: Refactoring the function to use try-catch blocks instead of assertions for more robust, reliable error handling. Assertions should not be used to control business logic.
Opportunity 2: The method parameters 'fieldFilter' and 'onNextIndex' should be checked for nullity to avoid potential NullPointerException. We should consider creating default instances of these objects when null is passed.
Opportunity 3: We can also refactor the code to handle the case where 'fieldFilter.apply(index)' returns null to make the function more robust.{{< details "Function source code " >}}
```java
public Map<String, MappingMetadata> findMappings(
        String[] concreteIndices,
        Function<String, Predicate<String>> fieldFilter,
        Runnable onNextIndex
    ) {
        assert Transports.assertNotTransportThread("decompressing mappings is too expensive for a transport thread");

        assert concreteIndices != null;
        if (concreteIndices.length == 0) {
            return ImmutableOpenMap.of();
        }

        ImmutableOpenMap.Builder<String, MappingMetadata> indexMapBuilder = ImmutableOpenMap.builder();
        Set<String> indicesKeys = indices.keySet();
        Stream.of(concreteIndices).filter(indicesKeys::contains).forEach(index -> {
            onNextIndex.run();
            IndexMetadata indexMetadata = indices.get(index);
            Predicate<String> fieldPredicate = fieldFilter.apply(index);
            indexMapBuilder.put(index, filterFields(indexMetadata.mapping(), fieldPredicate));
        });
        return indexMapBuilder.build();
    }
```
{{< /details >}}

## findDataStreams
#### Code Complexity: 6
### Overview
The function 'findDataStreams' is designed to fetch data streams associated with the provided indices. It accepts an array of string indices as argument and returns a map where each index's data stream is mapped. This function works by creating a mutable map, then using the indices look-up to get the data stream for each provided index. If any index has a parent data stream, the index and its parent data stream are stored in the builder map.

### User Acceptance Criteria
```gherkin
Feature: Data Stream Retrieval
 Scenario: Valid Data Stream Exist
 Given indices are provided
 When the 'findDataStreams' function is invoked
 Then it should return a map containing the parent data stream for each index.
```

### Refactoring
Suggestion 1: Instead of assertions, use explicit null checks that throw meaningful exceptions when failed. Suggestion 2: The retrieval of an index and checking of its type is candidate for encapsulation in a separate method. This would improve readability and maintainability. Suggestion 3: If 'indexName' could be null or empty (it is unknown from the given code), it should be checked before it is used - if it is an invalid input, an exception should be thrown.{{< details "Function source code " >}}
```java
public Map<String, DataStream> findDataStreams(String... concreteIndices) {
        assert concreteIndices != null;
        final ImmutableOpenMap.Builder<String, DataStream> builder = ImmutableOpenMap.builder();
        final SortedMap<String, IndexAbstraction> lookup = getIndicesLookup();
        for (String indexName : concreteIndices) {
            IndexAbstraction index = lookup.get(indexName);
            assert index != null;
            assert index.getType() == IndexAbstraction.Type.CONCRETE_INDEX;
            if (index.getParentDataStream() != null) {
                builder.put(indexName, index.getParentDataStream());
            }
        }
        return builder.build();
    }
```
{{< /details >}}

## filterFields
#### Code Complexity: 18
### Overview
The function 'filterFields' is a private static method that takes as input a 'MappingMetadata' object and a 'Predicate<String>' object 'fieldPredicate'. It returns a 'MappingMetadata' object after applying certain conditions and manipulations. At the start it checks if 'mappingMetadata' is null and returns an empty mapping if true. Then it checks if 'fieldPredicate' is a No Operation Field Predicate and returns original 'mappingMetadata' if true. A source map is created from 'mappingMetadata'. Based on certain conditions, either the map of a specific type from 'sourceAsMap' is extracted to 'mapping' or the whole 'sourceAsMap' is assigned to 'mapping'. Properties are then extracted from 'mapping'. Another check is performed to see if properties are either null or empty, and if so, 'mappingMetadata' is returned. Finally, after applying the 'fieldPredicate' to filter fields in properties, a new 'MappingMetadata' instance is returned with the modified 'sourceAsMap'.

### User Acceptance Criteria
```gherkin
Feature: Field Filter Function
Scenario: Field Filtering
Given a Mapping Metadata object and a Predicate
When the Mapping Metadata is not null and Predicate is not NOOP_FIELD_PREDICATE
Then manipulate the Mapping Metadata according to the conditions and Predicate
And return a new, possibly manipulated, Mapping Metadata object.
```

### Refactoring
The code could be refactored for readability, null safety and robustness. Instead of multiple if conditions, optionals could be used to handle null checks more elegantly. Instead of unchecked casting, 'instanceof' check could be added before casting to avoid ClassCastException. Consider processing all objects in 'sourceAsMap' instead of just the first one to ensure that no data is ignored. Additionally, consider early return when 'properties' is null or empty to avoid unnecessary processing.{{< details "Function source code " >}}
```java
@SuppressWarnings("unchecked")
    private static MappingMetadata filterFields(MappingMetadata mappingMetadata, Predicate<String> fieldPredicate) {
        if (mappingMetadata == null) {
            return MappingMetadata.EMPTY_MAPPINGS;
        }
        if (fieldPredicate == MapperPlugin.NOOP_FIELD_PREDICATE) {
            return mappingMetadata;
        }
        Map<String, Object> sourceAsMap = XContentHelper.convertToMap(mappingMetadata.source().compressedReference(), true).v2();
        Map<String, Object> mapping;
        if (sourceAsMap.size() == 1 && sourceAsMap.containsKey(mappingMetadata.type())) {
            mapping = (Map<String, Object>) sourceAsMap.get(mappingMetadata.type());
        } else {
            mapping = sourceAsMap;
        }

        Map<String, Object> properties = (Map<String, Object>) mapping.get("properties");
        if (properties == null || properties.isEmpty()) {
            return mappingMetadata;
        }

        filterFields("", properties, fieldPredicate);

        return new MappingMetadata(mappingMetadata.type(), sourceAsMap);
    }
```
{{< /details >}}

## filterFields
#### Code Complexity: 88
### Overview
The `filterFields` method within an unspecified class takes three parameters: a string called `currentPath`, a map `fields` with string keys and Object values, and a `fieldPredicate` that is a functional interface with a test method to be implemented. The primary tasks of this method are to iterate over entries of the given `fields` map and to apply certain operations based on the provided `fieldPredicate`. If an entry's value is a map, it goes depth-first to filter all properties and subFields. If any field doesn't satisfy the field predicate, it is removed. If a multiField doesn't satisfy the field predicate but has subFields that do, it is converted to an object with its subfields as properties. The process ends when there is no entry left in the 'fields' map.

### User Acceptance Criteria
```gherkin
Feature: Filter Fields in a given map based on a predicate
 Scenario: Apply the fieldPredicate on each field.
 Given the fieldPredicate and a map of fields 
 When the fieldPredicate is applied to the map 
 Then the fields that do not satisfy the predicate are removed 
 And the fields that are multiField and satisfy the predicate are converted to objects with their subfields as properties.
```

### Refactoring
Possible refactoring opportunities include: Improvement 1: The method is doing too much - breaking it down into smaller, more specific functions would improve readability and maintainability. For instance, the logic for handling a normal field and the logic for handling a multiField could be separated into their own methods. Improvement 2: Instead of modifying the input map, create a new map to hold the results. Improvement 3: A generic method could be used for the type casting, checking whether the object to be casted is of the correct type and handling any ClassCastException in a controlled manner. Improvement 4: Additionally, use Optional to prevent potential NullPointerExceptions.{{< details "Function source code " >}}
```java
@SuppressWarnings("unchecked")
    private static boolean filterFields(String currentPath, Map<String, Object> fields, Predicate<String> fieldPredicate) {
        assert fieldPredicate != MapperPlugin.NOOP_FIELD_PREDICATE;
        Iterator<Map.Entry<String, Object>> entryIterator = fields.entrySet().iterator();
        while (entryIterator.hasNext()) {
            Map.Entry<String, Object> entry = entryIterator.next();
            String newPath = mergePaths(currentPath, entry.getKey());
            Object value = entry.getValue();
            boolean mayRemove = true;
            boolean isMultiField = false;
            if (value instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) value;
                Map<String, Object> properties = (Map<String, Object>) map.get("properties");
                if (properties != null) {
                    mayRemove = filterFields(newPath, properties, fieldPredicate);
                } else {
                    Map<String, Object> subFields = (Map<String, Object>) map.get("fields");
                    if (subFields != null) {
                        isMultiField = true;
                        if (mayRemove = filterFields(newPath, subFields, fieldPredicate)) {
                            map.remove("fields");
                        }
                    }
                }
            } else {
                throw new IllegalStateException("cannot filter mappings, found unknown element of type [" + value.getClass() + "]");
            }

            // only remove a field if it has no sub-fields left and it has to be excluded
            if (fieldPredicate.test(newPath) == false) {
                if (mayRemove) {
                    entryIterator.remove();
                } else if (isMultiField) {
                    // multi fields that should be excluded but hold subfields that don't have to be excluded are converted to objects
                    Map<String, Object> map = (Map<String, Object>) value;
                    Map<String, Object> subFields = (Map<String, Object>) map.get("fields");
                    assert subFields.size() > 0;
                    map.put("properties", subFields);
                    map.remove("fields");
                    map.remove("type");
                }
            }
        }
        // return true if the ancestor may be removed, as it has no sub-fields left
        return fields.size() == 0;
    }
```
{{< /details >}}

## mergePaths
#### Code Complexity: 5
### Overview
The function mergePaths is a private, static method that takes two strings as arguments, 'path' and 'field'. If the 'path' string is empty, it returns the 'field' string. If the 'path' string is not empty, it returns a combination of 'path', a period and 'field'. Essentially, this function is responsible for concatenating two string paths using a period as a delimiter.

### Refactoring
Two opportunities for refactoring include 1) Adding null checks at the beginning of the function to handle potential null values and 2) extracting the delimiter (".") into a constant to avoid hard-coding it directly in the function. Suggested refactored method might look like: private static final String DELIMITER = ".";  private static String mergePaths(String path, String field) { if (path == null || field == null) {...} }{{< details "Function source code " >}}
```java
private static String mergePaths(String path, String field) {
        if (path.length() == 0) {
            return field;
        }
        return path + "." + field;
    }
```
{{< /details >}}

## getConcreteAllIndices
#### Code Complexity: 1
### Overview
This method returns an array of Strings named allIndices. The functionality is simplistic, with the responsibility of returning the current state of array without any transformations or operations being performed on it.

### User Acceptance Criteria
```gherkin
Not applicable as this method is a getter.
```

### Refactoring
No refactoring is necessary as this is a simple getter method. However, considering immutability and encapsulation principles, one could consider returning a defensive copy of the array or a read-only view of it to prevent clients from altering the original data.{{< details "Function source code " >}}
```java
public String[] getConcreteAllIndices() {
        return allIndices;
    }
```
{{< /details >}}

## getConcreteVisibleIndices
#### Code Complexity: 1
### Overview
This is a getter method which returns the visibleIndices, an array of Strings. Its aim is to provide access to the 'visibleIndices' state of the object from outside the class.

### Refactoring
In order to reduce the potential risk, consider returning a copy of 'visibleIndices' instead of its reference. This can be achieved by utilizing the Arrays.copyOf or clone method, thus preserving encapsulation.{{< details "Function source code " >}}
```java
public String[] getConcreteVisibleIndices() {
        return visibleIndices;
    }
```
{{< /details >}}

## getConcreteAllOpenIndices
#### Code Complexity: 1
### Overview
This is a getter method named 'getConcreteAllOpenIndices'. It returns 'allOpenIndices' which is an array of Strings. This function does not perform any operations or manipulations on the data, it is a simple getter method intended to return a private instance variable 'allOpenIndices'.

### Refactoring
Providing direct access to mutable fields 'allOpenIndices' makes the class mutable. Therefore, it would be better to return a copy of 'allOpenIndices' array rather than giving away a reference to the actual array, in order to adhere to the principle of data encapsulation.{{< details "Function source code " >}}
```java
public String[] getConcreteAllOpenIndices() {
        return allOpenIndices;
    }
```
{{< /details >}}

## getConcreteVisibleOpenIndices
#### Code Complexity: 1
### Overview
This method is a getter method for the 'visibleOpenIndices' field. It returns the array 'visibleOpenIndices'.

### Refactoring
Opportunity 1: To protect the object's encapsulation, consider returning a copy/clone of the 'visibleOpenIndices' array instead of returning the array directly. Suggestion: Replace 'return visibleOpenIndices;' with 'return visibleOpenIndices.clone();'.{{< details "Function source code " >}}
```java
public String[] getConcreteVisibleOpenIndices() {
        return visibleOpenIndices;
    }
```
{{< /details >}}

## getConcreteVisibleClosedIndices
#### Code Complexity: 1
### Overview
This is a getter function that returns the value of the variable 'visibleClosedIndices'. It is a simple function with no complex behaviors. 'visibleClosedIndices' is an array of Strings.

### Refactoring
To limit the risk of exposing internal state, consider returning a copy of the array instead of the array itself. This would isolate the method from any changes made to the returned array by its caller.{{< details "Function source code " >}}
```java
public String[] getConcreteVisibleClosedIndices() {
        return visibleClosedIndices;
    }
```
{{< /details >}}

## resolveWriteIndexRouting
#### Code Complexity: 18
### Overview
The 'resolveWriteIndexRouting' function checks and returns the routing for a given write index. If the index passed in aliasOrIndex argument does not exist or is not an 'ALIAS' type, it returns the original routing. If it exists and is of type 'ALIAS', it will fetch the write index name. If this retrieval is unsuccessful it throws an IllegalArgumentException. If the write index name is successfully retrieved, it fetches the writeIndexAliasMetadata. If this metadata exists, a routings resolved using it, otherwise the original routing is returned.

### User Acceptance Criteria
```gherkin
Feature: Resolve Write Index Routing
 Scenario: Alias or index has valid routing
 Given an alias or index and routing
 When the alias or index is correctly matched to a write index
 Then return the appropriate routing
 Scenario: Alias or index do not have a write index
 Given an alias or index and routing
 When the alias or index does not match a write index
 Then throw an IllegalArgumentException
```

### Refactoring
One opportunity for refactoring here might be to create separate private methods for each major steps like fetching of write index name and write index alias metadata. This would make the function easier to understand, and would make it more maintainable as well. Additionally, we might want to handle the absence of a write index more gracefully. We could do this by checking if the write index is null, and if so, return a custom error message rather than throwing an exception.{{< details "Function source code " >}}
```java
public String resolveWriteIndexRouting(@Nullable String routing, String aliasOrIndex) {
        if (aliasOrIndex == null) {
            return routing;
        }

        IndexAbstraction result = getIndicesLookup().get(aliasOrIndex);
        if (result == null || result.getType() != IndexAbstraction.Type.ALIAS) {
            return routing;
        }
        Index writeIndexName = result.getWriteIndex();
        if (writeIndexName == null) {
            throw new IllegalArgumentException("alias [" + aliasOrIndex + "] does not have a write index");
        }
        AliasMetadata writeIndexAliasMetadata = index(writeIndexName).getAliases().get(result.getName());
        if (writeIndexAliasMetadata != null) {
            return resolveRouting(routing, aliasOrIndex, writeIndexAliasMetadata);
        } else {
            return routing;
        }
    }
```
{{< /details >}}

## resolveIndexRouting
#### Code Complexity: 13
### Overview
The 'resolveIndexRouting' function is a part of an Elasticsearch component. This function takes a routing and an alias or index as arguments. The function returns the routing needed for index operation. If the provided alias or index is not null and exists in the index lookup as an alias, the function resolves the routing for alias. If the alias is associated with more than one index, an error will be thrown, indicating that the operation can't be performed on a single index. If alias or index is null or does not exist as an alias, the routing provided as an argument is returned unchanged.

### User Acceptance Criteria
```gherkin
Feature: Index Routing Resolution
 Scenario: Resolve Index Routing 
 Given routing and alias or index as input
 When the function resolveIndexRouting is called
 Then the function should validate the provided alias or index
 And if the alias or index resolves to an alias after index lookup, routing is determined based on the alias
 But if the alias is associated with more than one index, an error should be returned
 And if alias or index is null or isn’t an alias, the original routing is returned.
```

### Refactoring
The resolveIndexRouting function has multiple responsibilities which is a violation of the Single Responsibility Principle. It might be more maintainable and scalable if the function were broken down into several, each having a single responsibility such as separately validating and processing the routing. Also, hard-coding the 'ALIAS' type could make the function less scalable. Instead of using a hard-coded value, depending on the complexity of the type system, a flexible solution such as Strategy Pattern could be utilized.{{< details "Function source code " >}}
```java
public String resolveIndexRouting(@Nullable String routing, String aliasOrIndex) {
        if (aliasOrIndex == null) {
            return routing;
        }

        IndexAbstraction result = getIndicesLookup().get(aliasOrIndex);
        if (result == null || result.getType() != IndexAbstraction.Type.ALIAS) {
            return routing;
        }
        if (result.getIndices().size() > 1) {
            rejectSingleIndexOperation(aliasOrIndex, result);
        }
        return resolveRouting(routing, aliasOrIndex, AliasMetadata.getFirstAliasMetadata(this, result));
    }
```
{{< /details >}}

## resolveRouting
#### Code Complexity: 34
### Overview
This function, 'resolveRouting', primarily resolves routing based on the given alias or index and alias metadata. The function performs the following steps:
1. Checks if the index routing value present in the alias metadata is non-null.
2. If the index routing is non-null, it checks if the index routing has multiple associated routing values. If yes, an IllegalArgumentException is thrown.
3. Then, if the routing provided as an argument doesn't match with the index routing of the alias metadata, another IllegalArgumentException is thrown.
4. If these conditions are passed, it means the routing needs to be updated based on the alias metadata index routing. So, it is returned to the caller.
5. If the alias metadata doesn't have an index routing, the original routing is returned.

### User Acceptance Criteria
```gherkin
Feature: Resolve Routing
Scenario: Routing Resolution Based on Alias Metadata and Given Index
Given an alias or index and alias metadata
When index routing is not NULL
Then verify that the index routing does not resolve to multiple values, else reject operation with an IllegalArgumentException
Then also verify if the given routing matches with the index routing, else reject operation with an IllegalArgumentException
Then replace the original routing with the index routing from alias metadata
But when index routing is NULL
Then return the original routing.
```

### Refactoring
Few minor refactoring suggestions:
Opportunity 1: Separate the logic for throwing exceptions into their own methods for better readability. Suggestion: implement a method like 'assertRoutingIsUnique()' for the first validation and 'assertRoutingMatchesGivenRouting()' for the second.
Opportunity 2: This behavior could be encapsulated in an object representing the routing status that could validate its internal state and return the correct routing upon demand rather than performing procedural calculation and decision making in this method.{{< details "Function source code " >}}
```java
private static String resolveRouting(@Nullable String routing, String aliasOrIndex, AliasMetadata aliasMd) {
        if (aliasMd.indexRouting() != null) {
            if (aliasMd.indexRouting().indexOf(',') != -1) {
                throw new IllegalArgumentException(
                    "index/alias ["
                        + aliasOrIndex
                        + "] provided with routing value ["
                        + aliasMd.getIndexRouting()
                        + "] that resolved to several routing values, rejecting operation"
                );
            }
            if (routing != null) {
                if (routing.equals(aliasMd.indexRouting()) == false) {
                    throw new IllegalArgumentException(
                        "Alias ["
                            + aliasOrIndex
                            + "] has index routing associated with it ["
                            + aliasMd.indexRouting()
                            + "], and was provided with routing value ["
                            + routing
                            + "], rejecting operation"
                    );
                }
            }
            // Alias routing overrides the parent routing (if any).
            return aliasMd.indexRouting();
        }
        return routing;
    }
```
{{< /details >}}

## rejectSingleIndexOperation
#### Code Complexity: 2
### Overview
The given function 'rejectSingleIndexOperation' is a private static method in a class. It is designed to throw an IllegalArgumentException in the case when an alias has more than one index associated with it, hence a single index operation can't be executed. The function accepts two parameters: an alias or index as a string and a result of type 'IndexAbstraction'. It first initiates an array of strings 'indexNames', iterates over the indices in 'result' object, filling 'indexNames' with their names. If the alias has more than one associated index, it throws the IllegalArgumentException with a descriptive error message.

### Refactoring
The function makes good use of iteration and error handling mechanisms. However, it can be optimized further. The one thing for the developer to consider is the Java 8 Stream API for more concise and effective transformation of 'indices' into 'indexNames'. Another point could be the introduction of null-safety for the input argument 'IndexAbstraction' to avoid any possible NullPointerException. Furthermore, if the function is expected to be used in a multi-threaded environment, thread safety should be ensured.{{< details "Function source code " >}}
```java
private static void rejectSingleIndexOperation(String aliasOrIndex, IndexAbstraction result) {
        String[] indexNames = new String[result.getIndices().size()];
        int i = 0;
        for (Index indexName : result.getIndices()) {
            indexNames[i++] = indexName.getName();
        }
        throw new IllegalArgumentException(
            "Alias ["
                + aliasOrIndex
                + "] has more than one index associated with it ["
                + Arrays.toString(indexNames)
                + "], can't execute a single index op"
        );
    }
```
{{< /details >}}

## hasIndex
#### Code Complexity: 1
### Overview
This is a simple boolean method which checks if a specific index exists or not within the indices map. It uses the 'containsKey' method of the 'Map' interface to achieve this. The method takes a string 'index' as a parameter and returns true if this 'index' is a key in the 'indices' map, false otherwise.

### User Acceptance Criteria
```gherkin
Feature: Index Presence Check
 Scenario: Check presence of a specific index in the indices map
 Given the indices map is initialized
 When the hasIndex method is invoked with a certain index as parameter
 Then it should return true if the index exists in the map and false otherwise
```

### Refactoring
No particular need of refactoring identified as the function on its own is simple and clean, following the Single Responsibility Principle in SOLID principles. However, exception handling should be considered at a higher level to catch potential null pointers if 'indices' map is not initialized.{{< details "Function source code " >}}
```java
public boolean hasIndex(String index) {
        return indices.containsKey(index);
    }
```
{{< /details >}}

## hasIndex
#### Code Complexity: 1
### Overview
This public method 'hasIndex' checks if an 'Index' object is available or not. The function works by examining if the 'metadata' obtained by calling the 'index' function with the name of the object 'index' is not null and if the UUID of this 'metadata' matches the UUID of the 'index' object. The functionality is used to validate the existence and the authenticity of the specific Index object by matching both name and UUID of an index.

### User Acceptance Criteria
```gherkin
Feature: Validating Existence and Authenticity of Index Object
 Scenario: Valid Index Object
 Given that an Index object is provided
 When the hasIndex method is invoked with the Index object
 Then it verifies whether the corresponding Index's metadata exists, and checks if the UUID of the Index's metadata and the provided Index object are identical.
```

### Refactoring
Refactoring opportunity 1: Implement null checks to prevent exceptions. At the beginning of the function, add checks to return 'false' if the 'index' or 'index.getName()' is null. Opportunity 2: If 'index' operation is slow, considering the caching mechanism for the function results to improve performance. Opportunity 3: Introduce a validation mechanism to ensure the uniqueness of each Index instance UUID.{{< details "Function source code " >}}
```java
public boolean hasIndex(Index index) {
        IndexMetadata metadata = index(index.getName());
        return metadata != null && metadata.getIndexUUID().equals(index.getUUID());
    }
```
{{< /details >}}

## hasIndexAbstraction
#### Code Complexity: 1
### Overview
The 'hasIndexAbstraction' function is a public method that takes a string 'index' as input and checks whether this 'index' exists in the indices lookup. It uses the 'containsKey' method of the indices lookup to perform this check and returns a boolean value indicating the presence or absence of the index.

### User Acceptance Criteria
```gherkin
Feature: Index Abstraction Check
Scenario: Check if the index is present
Given that the indices lookup is available
When the hasIndexAbstraction method is called with a particular 'index'
Then it should return a boolean value indicating whether this 'index' is present or not.
```

### Refactoring
As this method is fairly simple, no significant refactoring opportunities are immediately visible. However, we can consider adding validation for the input 'index' to handle potential null value inputs instead of the function raising a NullPointerException. It would also be advisable to verify that the 'getIndicesLookup()' method is designed and implemented in a manner that ensures the initialization of the indices lookup.{{< details "Function source code " >}}
```java
public boolean hasIndexAbstraction(String index) {
        return getIndicesLookup().containsKey(index);
    }
```
{{< /details >}}

## index
#### Code Complexity: 1
### Overview
This method is part of a class that manages a collection of indexes. It takes an index name as an argument and returns the corresponding IndexMetadata object. The IndexMetadata may contain attributes such as information related to that index.

### User Acceptance Criteria
```gherkin
Feature: Fetch Index Metadata
 Scenario: Valid Index name is given
 Given the index manager is initialized and holds index metadata
 When a request is made to fetch metadata for an index
 Then the correct IndexMetadata should be returned
```

### Refactoring
Instead of potentially returning a null object, it would be better if the function throws an exception when the index does not exist. This way, the system would fail fast, and the error condition would be easier to detect and handle.{{< details "Function source code " >}}
```java
public IndexMetadata index(String index) {
        return indices.get(index);
    }
```
{{< /details >}}

## index
#### Code Complexity: 5
### Overview
This function `index` takes an Index object as a parameter and checks if this exists in the stored metadata. It uses the name of the Index to fetch corresponding `IndexMetadata`. If this metadata exists and its UUID matches with that of the input Index object, it's returned. Otherwise, the function returns null.

### User Acceptance Criteria
```gherkin
Feature: Index Validation
 Scenario: Input Index validation with stored metadata
 Given an Index object
 When the function 'index' is called with the Index object as parameter
 Then it should either return the corresponding metadata if it exists and its UUID matches the given Index's UUID, or it should return null
```

### Refactoring
One good practice would be to add null checks before using methods on objects. There should be null validation for Index as well as IndexMetadata object. Further, the fetching and comparison of UUIDs could be moved to another function to improve readability and maintain SOLID principles, specifically the Single Responsibility Principle.{{< details "Function source code " >}}
```java
public IndexMetadata index(Index index) {
        IndexMetadata metadata = index(index.getName());
        if (metadata != null && metadata.getIndexUUID().equals(index.getUUID())) {
            return metadata;
        }
        return null;
    }
```
{{< /details >}}

## hasIndexMetadata
#### Code Complexity: 1
### Overview
This is a short function defined in the class that manages indices. The function checks to see if a given indexMetadata object exists in the indices map by its name. It returns a boolean value - true if the provided indexMetadata exists in the map and false if it doesn't.

### User Acceptance Criteria
```gherkin
Feature: Index Metadata existence check
 Scenario: Check if certain Index Metadata is in indices
 Given there is an indices map
 When a check is made to see if a given Index Metadata object exists in the map by its name
 Then the method should return true if the Index Metadata exists and false if not
```

### Refactoring
For better maintainability, introduce a null check for the indexMetadata parameter. For improving this method, you could decouple the getting of the name of the index from the map's get method. Instead of directly chaining method calls, fetch the index's name in a separate line, making the code cleaner and easier to debug. Note that if duplications are a problem and they are possible in your case, you might need to reconsider the data structure used here or the equals and hashCode methods of the IndexMetadata.{{< details "Function source code " >}}
```java
public boolean hasIndexMetadata(final IndexMetadata indexMetadata) {
        return indices.get(indexMetadata.getIndex().getName()) == indexMetadata;
    }
```
{{< /details >}}

## getIndexSafe
#### Code Complexity: 13
### Overview
The function getIndexSafe() is a method responsible for fetching metadata for a provided index. It first tries to fetch the metadata using the index name. If the metadata is not null, it checks whether the index's UUID matches the metadata's UUID. If they don't match, it throws an IndexNotFoundException with an error message detailing the mismatch. If metadata could not be found initially, it also throws an IndexNotFoundException.

### User Acceptance Criteria
```gherkin
Feature: Fetch Index Metadata Safely 
 Scenario: Valid Index 
 Given the index exists with a name and UUID 
 When a request is made to fetch metadata using the index 
 Then the system should return the index metadata only if the UUIDs match
 Scenario: Invalid Index 
 Given the index does not exist or UUIDs do not match 
 When a request is made to fetch metadata using the index 
 Then the system should throw an IndexNotFoundException
```

### Refactoring
Refactoring suggestion is to separate the checking and throwing exceptions into separate methods, reducing the responsibility of the getIndexSafe() method. Also, consider incorporating some form of validation or check for the given index data before proceeding with the metadata fetching to improve security.{{< details "Function source code " >}}
```java
public IndexMetadata getIndexSafe(Index index) {
        IndexMetadata metadata = index(index.getName());
        if (metadata != null) {
            if (metadata.getIndexUUID().equals(index.getUUID())) {
                return metadata;
            }
            throw new IndexNotFoundException(
                index,
                new IllegalStateException(
                    "index uuid doesn't match expected: [" + index.getUUID() + "] but got: [" + metadata.getIndexUUID() + "]"
                )
            );
        }
        throw new IndexNotFoundException(index);
    }
```
{{< /details >}}

## indices
#### Code Complexity: 1
### Overview
This is a simple getter method that is part of a class. The method is named 'indices' and it returns a Map which has String as key type and IndexMetadata as value type. It's a public method which suggests this method is likely to be used by other classes to retrieve the indices data stored in this class. This method is simply returning a member variable of the class, which is also named 'indices'.

### Refactoring
Opportunity 1: Implement deep copying in the getter method to prevent modification of the private variable from outside the class. This could enhance data security and integrity. Suggestion: Return a new Map constructed with the original indices Map to prevent the original indices object from being modified.{{< details "Function source code " >}}
```java
public Map<String, IndexMetadata> indices() {
        return this.indices;
    }
```
{{< /details >}}

## getIndices
#### Code Complexity: 1
### Overview
This is a getter method named 'getIndices'. It returns a map where the key is a string (most likely the name of the index), and the value is an object of IndexMetadata (which contains metadata information about the particular index). The getter method does not accept any arguments and only returns the value obtained from calling the indices() method. Being a getter method, it does not modify any state but only retrieves the state.

### Refactoring
There are no explicit refactoring opportunities within this method itself, as it is a simple getter method. Refactoring opportunities might exist on the larger class or in the method that this one calls (indices()), but those are beyond the scope of this particular method.{{< details "Function source code " >}}
```java
public Map<String, IndexMetadata> getIndices() {
        return indices();
    }
```
{{< /details >}}

## hasAlias
#### Code Complexity: 1
### Overview
This function, named 'hasAlias', accepts a string input 'aliasName'. It checks whether this aliasName is either a key in the 'aliasedIndices' map or a key in the map returned by the 'dataStreamAliases' function, and returns a boolean value accordingly. If the aliasName is found in any of the maps, it returns true, otherwise false.

### User Acceptance Criteria
```gherkin
Feature: Alias Check
 Scenario: Check if alias exists in either map
 Given the maps 'aliasedIndices' and the map returned by 'dataStreamAliases' function
 When function 'hasAlias' is called with an 'aliasName' as input
 Then it should return true if the 'aliasName' is found in any of the mentioned maps, otherwise false.
```

### Refactoring
One suggestion for refactoring would be adding a null check for the 'aliasName', to avoid throwing a NullPointerException. It is also recommended to ensure thread safety. If the 'aliasedIndices' and 'dataStreamAliases' can be accessed and modified by multiple threads, consider making this method thread-safe. Additionally, for better code readability and less complexity, consider refactoring 'dataStreamAliases' to a variable if it does not rely on mutating global state.{{< details "Function source code " >}}
```java
public boolean hasAlias(String aliasName) {
        return aliasedIndices.containsKey(aliasName) || dataStreamAliases().containsKey(aliasName);
    }
```
{{< /details >}}

## aliasedIndices
#### Code Complexity: 1
### Overview
This public method 'aliasedIndices' retrieves a set of indices associated with a given alias name. It's making use of the 'getOrDefault' method from 'java.util.Map' on the 'aliasedIndices' Map variable. If the provided alias name is null, the 'Objects.requireNonNull' method will throw a 'NullPointerException'. If the alias name does not exist in the map, a new, empty set is returned as default.

### User Acceptance Criteria
```gherkin
Feature: Retrieve Aliased Indices
Scenario: Valid Alias name is provided
Given a user provides a non-null alias name
When the 'aliasedIndices' function is called with the alias name
Then it should return the Indices associated with that alias or an empty set if no such alias exists
```

### Refactoring
Opportunity 1: To make the function more robust, you can add nullity check and provide a meaningful error message instead of default 'NullPointerException'. Opportunity 2: If the 'aliasedIndices' map is possibly being accessed and modified by multiple threads, consider wrapping it with Collections.synchronizedMap at the initialization stage to avoid potential concurrency issues.{{< details "Function source code " >}}
```java
public Set<Index> aliasedIndices(String aliasName) {
        Objects.requireNonNull(aliasName);
        return aliasedIndices.getOrDefault(aliasName, Set.of());
    }
```
{{< /details >}}

## aliasedIndices
#### Code Complexity: 1
### Overview
This function belongs to a public method that is responsible for retrieving the keys from a key-value structured (a Map) data called 'aliasedIndices'. The keys, in this case, represent the indices which are aliased. This function returns a set of these index aliases as Strings.

### User Acceptance Criteria
```gherkin
Feature: Retrieve Aliased Indices
 Scenario: Valid Retrieval of Aliased Indices
 Given the aliasedIndices data is available
 When a request is made to fetch aliased indices
 Then the function should return a set of index aliases as Strings.
```

### Refactoring
While the current function is concise and efficient, we could still consider the following opportunities for refactoring:1. Implement null check or optional return to handle situations where 'aliasedIndices' is null. So before returning 'aliasedIndices.keySet()', we should ensure that 'aliasedIndices' is not null.2. For managing multithreading scenarios, we could make a defensive copy of the keyset and return that to the user. This helps to avoid ConcurrentModificationExceptions.{{< details "Function source code " >}}
```java
public Set<String> aliasedIndices() {
        return aliasedIndices.keySet();
    }
```
{{< /details >}}

## templates
#### Code Complexity: 1
### Overview
This is a public getter method for a Java class. It returns a Map object where the keys are Strings and the values are IndexTemplateMetadata objects. The purpose of this method is simply to fetch and return the 'templates' variable of the class.

### User Acceptance Criteria
```gherkin
N/A. Gherkin scenarios are not typically written for simple getter or setter methods as they do not represent user-centric, functional behaviors.
```

### Refactoring
If it's necessary to prevent the returned 'templates' Map from being modified, consider returning an unmodifiable view of the Map using Collections.unmodifiableMap(this.templates) or defensively copying the Map. If the Map often has large data, the latter could be a performance issue. So, it might be useful to implement proper access controls to limit the visibility of this method where necessary depending on the context and usage of the class this method is part of.{{< details "Function source code " >}}
```java
public Map<String, IndexTemplateMetadata> templates() {
        return this.templates;
    }
```
{{< /details >}}

## getTemplates
#### Code Complexity: 1
### Overview
The function getTemplates() is a public getter method in the class returning a Map that contains a mapping between a String (the template key) and an IndexTemplateMetadata object (the template value). This function is used to expose the templates field to other classes and methods outside of its class. It calls the private templates() method to get the data.

### Refactoring
No refactoring opportunities are present in this case. The function follows the best practices for a getter method - it has a clear name, does not change the object state, and correctly retrieves the desired property. However, for enhancing the data security, it would be beneficial to return a read-only or a cloned copy of the templates instead of returning the original map.{{< details "Function source code " >}}
```java
public Map<String, IndexTemplateMetadata> getTemplates() {
        return templates();
    }
```
{{< /details >}}

## componentTemplates
#### Code Complexity: 1
### Overview
The function 'componentTemplates' is meant to retrieve metadata about component templates. It retrieves an instance of ComponentTemplateMetadata, then calls the componentTemplates method on the instance in order to obtain a Map of the component templates. If there is no ComponentTemplateMetadata instance, an empty Map is returned. The return type is Map<String, ComponentTemplate> which maps between the name of the template and its corresponding ComponentTemplate object.

### User Acceptance Criteria
```gherkin
Feature: Fetching Component Templates
 Scenario: ComponentTemplateMetadata instance is present
 Given the custom method returns a ComponentTemplateMetadata instance
 When the componentTemplates function is called
 Then it should return a Map of the component templates
 Scenario: ComponentTemplateMetadata instance is not present
 Given the custom method do not return a ComponentTemplateMetadata instance
 When the componentTemplates function is called
 Then it should return an empty Map
```

### Refactoring
Consider having the method throw a specific exception instead of returning an empty Map when the ComponentTemplateMetadata is not present. This would allow the caller to handle this scenario appropriately. Also, it would be good to add null checks to handle potential NullPointExceptions. Further, appropriate validation checks could be added to ensure the integrity of the returned ComponentTemplate classes.{{< details "Function source code " >}}
```java
public Map<String, ComponentTemplate> componentTemplates() {
        return Optional.ofNullable((ComponentTemplateMetadata) this.custom(ComponentTemplateMetadata.TYPE))
            .map(ComponentTemplateMetadata::componentTemplates)
            .orElse(Collections.emptyMap());
    }
```
{{< /details >}}

## templatesV2
#### Code Complexity: 1
### Overview
This public function 'templatesV2' is responsible for fetching ComposableIndexTemplateMetadata from the custom data about the current cluster state and returning it in the form of a Map. If the custom data is null, it returns an empty map instead. This is achieved using the Optional class in java which is a container object used to contain not-null objects.

### User Acceptance Criteria
```gherkin
Feature: Fetch Templates V2
 Scenario: Fetch Composable Index Template Metadata
 Given the current cluster state is available
 When a request is made to fetch Composable Index Template Metadata
 Then a map of Composable Index Template should be returned
 But when the custom data is null
 Then it should return an empty map
```

### Refactoring
The existing implementation of the function looks optimised and handles null scenarios correctly, ensuring the function won't break and return an empty map instead. However, to make the function even more robust, we could add null checks for TYPE of ComposableIndexTemplateMetadata.{{< details "Function source code " >}}
```java
public Map<String, ComposableIndexTemplate> templatesV2() {
        return Optional.ofNullable((ComposableIndexTemplateMetadata) this.custom(ComposableIndexTemplateMetadata.TYPE))
            .map(ComposableIndexTemplateMetadata::indexTemplates)
            .orElse(Collections.emptyMap());
    }
```
{{< /details >}}

## isTimeSeriesTemplate
#### Code Complexity: 13
### Overview
The `isTimeSeriesTemplate` function checks if a passed `ComposableIndexTemplate` is a Time Series template. It first checks whether the `DataStreamTemplate` of `indexTemplate` and the template itself are not `null`. If either is `null`, then it returns `false` indicating that it is not a Time Series template. It further retrieves settings resolved from the `indexTemplate` and the component templates. Extracting the `IndexMode` ENUM from the settings, it specifically checks if the `IndexMode` is `TIME_SERIES`. If it is `TIME_SERIES`, it returns `true`, indicating that the passed `indexTemplate` is a Time Series template. However, if the `IndexMode` is not `TIME_SERIES`, it eventually returns `false`.

### User Acceptance Criteria
```gherkin
Feature: Validation of Time Series Template
 Scenario: Check if ComposableIndexTemplate is Time Series Template
 Given a ComposableIndexTemplate object
 When the isTimeSeriesTemplate function is called with the ComposableIndexTemplate object as parameter
 Then the function should return true if the template is a time series template and false otherwise
```

### Refactoring
Refactoring Opportunity 1: The method could be simplified by returning the result directly from the conditional checks rather than having multiple exit points. This makes the code easier to understand and maintain. Refactoring Opportunity 2: The piece of logic which calculates indexMode could be moved to a separate function as it can be reused in other parts of the application.{{< details "Function source code " >}}
```java
public boolean isTimeSeriesTemplate(ComposableIndexTemplate indexTemplate) {
        var template = indexTemplate.template();
        if (indexTemplate.getDataStreamTemplate() == null || template == null) {
            return false;
        }

        var settings = MetadataIndexTemplateService.resolveSettings(indexTemplate, componentTemplates());
        // Not using IndexSettings.MODE.get() to avoid validation that may fail at this point.
        var rawIndexMode = settings.get(IndexSettings.MODE.getKey());
        var indexMode = rawIndexMode != null ? Enum.valueOf(IndexMode.class, rawIndexMode.toUpperCase(Locale.ROOT)) : null;
        if (indexMode == IndexMode.TIME_SERIES) {
            // No need to check for the existence of index.routing_path here, because index.mode=time_series can't be specified without it.
            // Setting validation takes care of this.
            // Also no need to validate that the fields defined in index.routing_path are keyword fields with time_series_dimension
            // attribute enabled. This is validated elsewhere (DocumentMapper).
            return true;
        }

        // in a followup change: check the existence of keyword fields of type keyword and time_series_dimension attribute enabled in
        // the template. In this case the index.routing_path setting can be generated from the mapping.

        return false;
    }
```
{{< /details >}}

## dataStreams
#### Code Complexity: 1
### Overview
The function 'dataStreams()' is a public method that fetches Map of String and DataStream objects. This is done by invoking 'custom' method on the instance of the current class with 'DataStreamMetadata.TYPE' and 'DataStreamMetadata.EMPTY' as arguments. The 'custom' function is presumed to return an object that has a 'dataStreams' method that ultimately provides the required Map object.

### User Acceptance Criteria
```gherkin
Feature: Fetch Data Streams
 Scenario: Retrieve Map of String and DataStream objects
 Given an instance of the current class with method 'custom'
 When 'dataStreams' method is invoked
 Then it should return a Map of String and DataStream objects.
```

### Refactoring
Suggestion 1: Add a null check or optional return type for method 'custom' to handle potential null values and avoid NullPointerException.
 Suggestion 2: Incorporate robust error and exception handling to tackle any issues that might arise if the 'custom' method does not return the expected object or if 'dataStreams' method is not present on the returned object.{{< details "Function source code " >}}
```java
public Map<String, DataStream> dataStreams() {
        return this.custom(DataStreamMetadata.TYPE, DataStreamMetadata.EMPTY).dataStreams();
    }
```
{{< /details >}}

## dataStreamAliases
#### Code Complexity: 1
### Overview
This method, named 'dataStreamAliases', is part of an object and is used to retrieve Data Stream Aliases. It does this by calling the 'custom' method with 'DataStreamMetadata.TYPE' and 'DataStreamMetadata.EMPTY' as parameters. The 'custom' method is expected to return an object which has a method 'getDataStreamAliases' that returns the Data Stream Aliases.

### User Acceptance Criteria
```gherkin
Feature: Retrieval of Data Stream Aliases
Scenario: Get Data Stream Aliases
Given the DataStreamMetadata TYPE and EMPTY
When the custom method is called with these parameters
Then the dataStreamAliases method should return the appropriate Data Stream Aliases.
```

### Refactoring
Possible refactoring could include adding null checks to handle potential NullPointerExceptions better. The parameters to the 'custom' method can also be made configurable to handle changes to DataStreamMetadata.TYPE and DataStreamMetadata.EMPTY better, thereby enhancing code maintainability.{{< details "Function source code " >}}
```java
public Map<String, DataStreamAlias> dataStreamAliases() {
        return this.custom(DataStreamMetadata.TYPE, DataStreamMetadata.EMPTY).getDataStreamAliases();
    }
```
{{< /details >}}

## nodeShutdowns
#### Code Complexity: 1
### Overview
This function is a public method named `nodeShutdowns()`. It's part of a class that isn't shown here, but it appears to be a getter method. It returns a `NodesShutdownMetadata` type object. It fetches the `NodesShutdownMetadata` type object from a certain storage or data structure using the `custom()` method. The `custom()` method appears to retrieve elements based on a `TYPE` string and a default `NodesShutdownMetadata` instance, which is `NodesShutdownMetadata.EMPTY` in this case, when there is no matching item found.

### Refactoring
The current code appears to adhere to simple getter principles, which implies it's already quite clean and well-managed. However, without context of the entire class or module, it's difficult to make comprehensive refactoring suggestions. If the `custom()` function is mainly used for getting `NodesShutdownMetadata` instances, it could be renamed to something more descriptive. Additionally, if `TYPE` and `NodesShutdownMetadata.EMPTY` are frequently used together, a dedicated getter could be created.{{< details "Function source code " >}}
```java
public NodesShutdownMetadata nodeShutdowns() {
        return custom(NodesShutdownMetadata.TYPE, NodesShutdownMetadata.EMPTY);
    }
```
{{< /details >}}

## isIndexManagedByILM
#### Code Complexity: 14
### Overview
The isIndexManagedByILM function checks if a certain index is managed by Index Lifecycle Management (ILM). It evaluates some conditions accessing different properties of the index metadata and based on these conditions it returns a boolean value. If the lifecycle policy name of the index metadata is null or empty, then it's not managed by ILM and the function returns false. If there's no index abstraction found for the index's name in the indices lookup, which indicates that the index doesn't exist anymore, the function also returns false. Furthermore, if the index belongs to a parent data stream with a lifecycle, the function checks if ILM is preferred and returns its enabled status (true or false). If none of the above conditions are met, the function concludes that the index is managed by ILM and returns true.

### User Acceptance Criteria
```gherkin
Feature: Check if Index is Managed by ILM
 Scenario: An empty or null lifecycle policy name
 Given the index metadata with a lifecycle policy name
 When the lifecycle policy name is either null or empty
 Then I expect the function to return false

 Scenario: Non-existing index
 Given the index metadata
 When no abstraction is found for the index in the indices lookup
 Then I expect the function to return false

 Scenario: An index belonging to a parent data stream with lifecycle
 Given the index metadata
 When it belongs to a parent data stream that has a lifecycle
 Then I expect the function to check if ILM is preferred and return its status

 Scenario: Other scenarios
 Given the index metadata
 When none of the above conditions are met
 Then I expect the function to return true
```

### Refactoring
One opportunity for refactoring here could be to divide the isIndexManagedByILM function into smaller, more focused functions as per single responsibility principle of SOLID. Each of these smaller functions could be dealing with only one aspect of the check (like lifecycle policy name check, indices lookup, data stream lifecycle check) and then the result of these smaller functions can be combined, if necessary, back in the isIndexManagedByILM function to get the final boolean result. Other than this, class and variable names seem clear and the function code seems concise.{{< details "Function source code " >}}
```java
public boolean isIndexManagedByILM(IndexMetadata indexMetadata) {
        if (Strings.hasText(indexMetadata.getLifecyclePolicyName()) == false) {
            // no ILM policy configured so short circuit this to *not* managed by ILM
            return false;
        }

        IndexAbstraction indexAbstraction = getIndicesLookup().get(indexMetadata.getIndex().getName());
        if (indexAbstraction == null) {
            // index doesn't exist anymore
            return false;
        }

        DataStream parentDataStream = indexAbstraction.getParentDataStream();
        if (parentDataStream != null && parentDataStream.getLifecycle() != null) {
            // index has both ILM and DLM configured so let's check which is preferred
            return PREFER_ILM_SETTING.get(indexMetadata.getSettings());
        }

        return true;
    }
```
{{< /details >}}

## customs
#### Code Complexity: 1
### Overview
This code snippet is a public method called 'customs' which does not take any parameters. The 'customs' method is used to get the value of the variable 'customs', which is of type 'Map<String, Custom>'. The returned value can then be used elsewhere in the program.

### Refactoring
The current design may violate the encapsulation principle. Rather than exposing the whole map, consider providing methods that operate on the map. For example, methods to add, remove, or get a 'custom' by key. This change would make the class easier to use correctly and harder to use incorrectly, reducing the likelihood of bugs and security issues.{{< details "Function source code " >}}
```java
public Map<String, Custom> customs() {
        return this.customs;
    }
```
{{< /details >}}

## reservedStateMetadata
#### Code Complexity: 1
### Overview
This is a simple getter method inside a class, designed to return a Map that is a private property of the class, named 'reservedStateMetadata'. The method has public visibility, indicating that it can be called from any context. The map returned contains keys of type String and values of type ReservedStateMetadata.

### Refactoring
No major refactoring seems necessary in this code snippet. However, if the returned Map object isn't inherently immutable, it's advisable to return an unmodifiable view of the Map to ensure that clients of this class cannot modify it: return Collections.unmodifiableMap(this.reservedStateMetadata);{{< details "Function source code " >}}
```java
public Map<String, ReservedStateMetadata> reservedStateMetadata() {
        return this.reservedStateMetadata;
    }
```
{{< /details >}}

## indexGraveyard
#### Code Complexity: 1
### Overview
This function is a getter method for IndexGraveyard. It retrieves the instance of IndexGraveyard associated with the custom type.

### Refactoring
As a simple getter function, there doesn't seem to be any major refactoring needs here. However, the use of a 'custom' method here might indicate a lack of proper class structuring. It would be best to review the design of the application to ensure it adheres to principles of object-oriented design, such as encapsulation and abstraction.{{< details "Function source code " >}}
```java
public IndexGraveyard indexGraveyard() {
        return custom(IndexGraveyard.TYPE);
    }
```
{{< /details >}}

## custom
#### Code Complexity: 1
### Overview
The 'custom' function is a generic public method in Java. The function is designed to fetch some type of 'Custom' object out of a map based on the input string 'type'. If the desired object is not found in the map, it returns a provided default value instead.

### User Acceptance Criteria
```gherkin
Feature: Fetching Custom Objects
Scenario: Valid key input
Given a custom map is present 
When a key is provided to the 'custom' function
Then it should return the object mapped to the key if present, else the default value should be returned
```

### Refactoring
A possibility for refactoring could be introducing proper error handling to cover potential issues, such as performing null checks before accessing methods on potentially null objects or handling the ClassCastException that could occur during an incompatible type cast. Also, considering the 'customs' attribute is used here, it could be beneficial to ensure encapsulation principles are not violated anywhere within the code.{{< details "Function source code " >}}
```java
@SuppressWarnings("unchecked")
    public <T extends Custom> T custom(String type, T defaultValue) {
        return (T) customs.getOrDefault(type, defaultValue);
    }
```
{{< /details >}}

## getTotalNumberOfShards
#### Code Complexity: 1
### Overview
This function is a getter method for the private member 'totalNumberOfShards'. It returns the current value of this member.

### Refactoring
There is no immediate need for refactoring this function. It adheres to the single responsibility principle, only returning a private member variable without any further computation or operation. However, if 'totalNumberOfShards' is subject to frequent changes and if the getter method is widely used in a multi-threaded environment, a review of the business logic might be required to ensure thread safety.{{< details "Function source code " >}}
```java
public int getTotalNumberOfShards() {
        return this.totalNumberOfShards;
    }
```
{{< /details >}}

## getTotalOpenIndexShards
#### Code Complexity: 1
### Overview
This method gets the total number of open index shards. It doesn't take any parameters and returns an integer value representing the total number of open index shards. This is a simple getter method.

### Refactoring
This simple getter function could be ideal and requires no immediate refactoring. In terms of clean code practices, the method name is descriptive enough and it has a single responsibility i.e., to return the total number of open index shards. In accordance with the principles of encapsulation in object-oriented programming, keeping this functionality inside a getter method is a good practice.{{< details "Function source code " >}}
```java
public int getTotalOpenIndexShards() {
        return this.totalOpenIndexShards;
    }
```
{{< /details >}}

## iterator
#### Code Complexity: 1
### Overview
This function is an implementation of a standard iterator function applicable to the 'indices' hashmap. The function returns an iterator for the values in the 'indices' hashmap, which are of type IndexMetadata. The function is public and thus can be called from outside the class.

### User Acceptance Criteria
```gherkin
Feature: IndexMetadata Iterator 
Scenario: Iterate over IndexMetadata values in indices hashmap 
Given an initialized indices hashmap 
When the iterator function is called 
Then it should return an iterator over the IndexMetadata values to allow sequential access.
```

### Refactoring
The method can be improved by adding null-checks or validations for the 'indices' hashmap before creating the iterator. Though not directly applicable to this single-line function, in a broader scope, considering encapsulation, the function may omit direct exposure of raw data. For multithreading improvement, we could return a copy of the data instead of an iterator over the original data collection.{{< details "Function source code " >}}
```java
@Override
    public Iterator<IndexMetadata> iterator() {
        return indices.values().iterator();
    }
```
{{< /details >}}

## stream
#### Code Complexity: 1
### Overview
This function, named 'stream', is part of a class (not mentioned in the given code). It is responsible for returning a stream of IndexMetadata entities. This is achieved by invoking the 'values()' method on the 'indices' instance, which presumably is a collection of IndexMetadata instances, and then invoking the 'stream()' method on the result. The 'stream()' function does not take any arguments and does not modify any input or object properties, acting as a pure function that just streams the values stored in 'indices'.

### User Acceptance Criteria
```gherkin
Feature: Stream Indices
 Scenario: Get a Stream of Index Metadata
 Given an instance with a collection(Index Metadata)
 When the 'stream' function is called
 Then it should return a Stream of IndexMetadata instances.
```

### Refactoring
There are no clear indications of any solid principles being violated by this function, but without seeing the surrounding code, it is tough to say definitively. As for refactoring opportunities, the function is straightforward and does precisely one thing - generating a stream from 'indices'. Assuming that 'indices' itself is maintained optimally, there doesn't seem to be any immediate necessity for refactoring this function.{{< details "Function source code " >}}
```java
public Stream<IndexMetadata> stream() {
        return indices.values().stream();
    }
```
{{< /details >}}

## size
#### Code Complexity: 1
### Overview
This function is a simple public method that returns the size of an internal data structure represented by 'indices'. 'indices' seems to be a collection type object and its size is fetched using the '.size()' method.

### User Acceptance Criteria
```gherkin
Feature: Get size of internal storage
Scenario: Call size function
Given the internal storage has been initialized
When the size function is called
Then it should return the number of elements stored in 'indices'.
```

### Refactoring
Given the simplicity of the method, there doesn't seem to be any immediate need for refactoring. However, if 'indices' is not encapsulated correctly within the class, it may expose the class to potential data integrity issues. Ensuring proper encapsulation could be a refactoring opportunity.{{< details "Function source code " >}}
```java
public int size() {
        return indices.size();
    }
```
{{< /details >}}

## isGlobalStateEquals
#### Code Complexity: 48
### Overview
This function compares two Metadata objects to determine if their global states are equal. It checks equality on multiple fields, including coordinationMetadata, persistentSettings, hashesOfConsistentSettings, templates, clusterUUID, clusterUUIDCommitted, count of customs context GATEWAY, and reservedStateMetadata. It returns false as soon as it finds any mismatch, otherwise it returns true if all the fields are equal. The function is static and public, and expects two parameters of type Metadata.

### User Acceptance Criteria
```gherkin
Feature: Global State Equality Check of Metadata Objects
Scenario: Equality of two Metadata objects
Given two Metadata objects
When the global state of these objects is compared using the isGlobalStateEquals function
Then the function should return true if all the fields of both objects are equal and false otherwise.
```

### Refactoring
There's a redundancy in the use of '== false' for outcomes of 'equals' method, simplifying this would improve code readability. Duplication in the code presents the opportunity for abstraction or modularization. The repeated if-then-return false structures could be abstracted into a separate private method that takes two parameters and uses the equals method for comparison, thereby reducing redundancy. Also, the for-loop checking equality of custom fields can be refactored to use Java Streams API, this would make code more readable and concise.{{< details "Function source code " >}}
```java
public static boolean isGlobalStateEquals(Metadata metadata1, Metadata metadata2) {
        if (metadata1.coordinationMetadata.equals(metadata2.coordinationMetadata) == false) {
            return false;
        }
        if (metadata1.persistentSettings.equals(metadata2.persistentSettings) == false) {
            return false;
        }
        if (metadata1.hashesOfConsistentSettings.equals(metadata2.hashesOfConsistentSettings) == false) {
            return false;
        }
        if (metadata1.templates.equals(metadata2.templates()) == false) {
            return false;
        }
        if (metadata1.clusterUUID.equals(metadata2.clusterUUID) == false) {
            return false;
        }
        if (metadata1.clusterUUIDCommitted != metadata2.clusterUUIDCommitted) {
            return false;
        }
        // Check if any persistent metadata needs to be saved
        int customCount1 = 0;
        for (Map.Entry<String, Custom> cursor : metadata1.customs.entrySet()) {
            if (cursor.getValue().context().contains(XContentContext.GATEWAY)) {
                if (cursor.getValue().equals(metadata2.custom(cursor.getKey())) == false) {
                    return false;
                }
                customCount1++;
            }
        }
        int customCount2 = 0;
        for (Custom custom : metadata2.customs.values()) {
            if (custom.context().contains(XContentContext.GATEWAY)) {
                customCount2++;
            }
        }
        if (customCount1 != customCount2) {
            return false;
        }
        if (Objects.equals(metadata1.reservedStateMetadata, metadata2.reservedStateMetadata) == false) {
            return false;
        }
        return true;
    }
```
{{< /details >}}

## diff
#### Code Complexity: 1
### Overview
The function 'diff' is a public method in a class, presumably the 'Metadata' class. It accepts an object of the same class as an argument and gives back an object of type 'Diff' which is another class that presumably tracks differences between two 'Metadata' objects. Inside the function, it returns a new 'MetadataDiff' object which is presumably a subclass of 'Diff' with 'previousState' and 'this' as parameters.

### User Acceptance Criteria
```gherkin
Feature: Metadata comparison
Scenario:
Given two existing Metadata states, the current one and the previous one
When a diff operation is invoked
Then a MetadataDiff object is created that represents the differences between the previous state and the current one.
```

### Refactoring
To reduce risks, it may be beneficial to add a null-check for 'previousState' and to validate the type of the received parameter. To make the method more robust, these checks can be added at the beginning of the 'diff' method or in the 'MetadataDiff' class. Additionally, following the Single Responsibility Principle, if calculating the 'diff' is not the core responsibility of this class, it may be wise to move this method into another class.{{< details "Function source code " >}}
```java
@Override
    public Diff<Metadata> diff(Metadata previousState) {
        return new MetadataDiff(previousState, this);
    }
```
{{< /details >}}

## readDiffFrom
#### Code Complexity: 5
### Overview
This function is a static function named 'readDiffFrom' of a public access modifier which takes in a single parameter of type 'StreamInput' and throws an IOException. It is responsible for reading different versions of Metadata from the input stream. The function first checks if the transport version is on or after the 'NOOP_METADATA_DIFF_VERSION' and if the following read value is true. If so, it returns an empty SimpleDiffable. Otherwise, it returns a new instance of MetadataDiff initialized with the input stream.

### User Acceptance Criteria
```gherkin
Feature: Reading MetadataDiff from StreamInput
Scenario: The transport version is on or after 'NOOP_METADATA_DIFF_VERSION'
Given the StreamInput data
When the transport version is on or after 'NOOP_METADATA_DIFF_VERSION' and the next boolean value read is true
Then return an empty SimpleDiffable
Scenario: The transport version is before 'NOOP_METADATA_DIFF_VERSION'
Given the StreamInput data
When the transport version is before 'NOOP_METADATA_DIFF_VERSION'
Then return a new instance of MetadataDiff initialized with the input stream.
```

### Refactoring
To minimize risk, a try-catch block can be included within the function to provide a basic level of error handling and ensure a more controlled program flow. The error message in the catch block can provide more detail about what went wrong, enhancing maintainability. Also, consider implementing a version compatibility mechanism that enables older versions to work smoothly with this function.{{< details "Function source code " >}}
```java
public static Diff<Metadata> readDiffFrom(StreamInput in) throws IOException {
        if (in.getTransportVersion().onOrAfter(MetadataDiff.NOOP_METADATA_DIFF_VERSION) && in.readBoolean()) {
            return SimpleDiffable.empty();
        }
        return new MetadataDiff(in);
    }
```
{{< /details >}}

## fromXContent
#### Code Complexity: 1
### Overview
This is a static method named 'fromXContent' in a class named 'Metadata'. This method takes as input an object of type 'XContentParser' and returns an object of type 'Metadata'. It proceeds to call a static method 'fromXContent' on 'Builder' using the passed 'parser' and returns its results.

### User Acceptance Criteria
```gherkin
Feature: Metadata Extraction from content
 Scenario: Valid Content Provided
 Given a valid XContentParser object is available
 When the 'fromXContent' method is called on the 'Metadata' class with the XContentParser object as a parameter
 Then method should return an object of type 'Metadata'
```

### Refactoring
The method could benefit from exception handling to prevent possible IOExceptions from crashing the program. Implementing null checks for the 'parser' variable can prevent potential NullPointerExceptions. Additionally, it would be good to ensure that 'Builder.fromXContent' method adheres to the single responsibility principle, as its usage could indicate that 'Builder' class is doing more than it should.{{< details "Function source code " >}}
```java
public static Metadata fromXContent(XContentParser parser) throws IOException {
        return Builder.fromXContent(parser);
    }
```
{{< /details >}}

## toXContentChunked
#### Code Complexity: 19
### Overview
The `toXContentChunked` function is a method in the Java language. This method generates an iterator for an object structure that can be converted into XML or JSON content (ToXContent). The method takes an Param object as an argument and gets an XContentContext, with API as its default value. Depending on the value of the XContentContext, different types of iterators will be created and used. It's evident this method is to perform a large amount of data serialization for various scenarios with different contexts (e.g., API or something else). So it starts with a 'metadata' object and depending upon the context adds various objects like 'settings', 'indices', 'cluster_uuid', 'cluster_uuid_committed', 'cluster_coordination', 'templates', 'reserved_state' etc. to this 'metadata' object.

### User Acceptance Criteria
```gherkin
Feature: Serialize data with the toXContentChunked method
Scenario: Valid XContentContext Parameter
Given the XContentContext is available
When toXContentChunked function is invoked with a Param object
Then it should return an Iterator which is able to iterate over different parts of ToXContent data based on the context.
```

### Refactoring
The function is lengthy and complex which can be difficult to understand and maintain. It would be helpful to split it into smaller functions. Observations: there is code duplication when starting different parts of object are written to the ToXContent builder, this could be refactored to use a common code and reduce redundancy. Utilizing a mapper dictionary instead of using multiple ternary operators to decide which iterator should be used could increase code readability and maintainability. Finally, the method might benefit from a Builder pattern or similar to encapsulate the complexity of creating various ToXContent objects.{{< details "Function source code " >}}
```java
@Override
    public Iterator<? extends ToXContent> toXContentChunked(ToXContent.Params p) {
        XContentContext context = XContentContext.valueOf(p.param(CONTEXT_MODE_PARAM, CONTEXT_MODE_API));
        final Iterator<? extends ToXContent> start = context == XContentContext.API
            ? ChunkedToXContentHelper.startObject("metadata")
            : Iterators.single((builder, params) -> builder.startObject("meta-data").field("version", version()));

        final Iterator<? extends ToXContent> persistentSettings = context != XContentContext.API && persistentSettings().isEmpty() == false
            ? Iterators.single((builder, params) -> {
                builder.startObject("settings");
                persistentSettings().toXContent(builder, new ToXContent.MapParams(Collections.singletonMap("flat_settings", "true")));
                return builder.endObject();
            })
            : Collections.emptyIterator();

        final Iterator<? extends ToXContent> indices = context == XContentContext.API
            ? ChunkedToXContentHelper.wrapWithObject("indices", indices().values().iterator())
            : Collections.emptyIterator();

        return Iterators.concat(start, Iterators.<ToXContent>single((builder, params) -> {
            builder.field("cluster_uuid", clusterUUID);
            builder.field("cluster_uuid_committed", clusterUUIDCommitted);
            builder.startObject("cluster_coordination");
            coordinationMetadata().toXContent(builder, params);
            return builder.endObject();
        }),
            persistentSettings,
            ChunkedToXContentHelper.wrapWithObject(
                "templates",
                templates().values()
                    .stream()
                    .map(
                        template -> (ToXContent) (builder, params) -> IndexTemplateMetadata.Builder.toXContentWithTypes(
                            template,
                            builder,
                            params
                        )
                    )
                    .iterator()
            ),
            indices,
            Iterators.flatMap(
                customs.entrySet().iterator(),
                entry -> entry.getValue().context().contains(context)
                    ? ChunkedToXContentHelper.wrapWithObject(entry.getKey(), entry.getValue().toXContentChunked(p))
                    : Collections.emptyIterator()
            ),
            ChunkedToXContentHelper.wrapWithObject("reserved_state", reservedStateMetadata().values().iterator()),
            ChunkedToXContentHelper.endObject()
        );
    }
```
{{< /details >}}

## getMappingsByHash
#### Code Complexity: 1
### Overview
The provided function is a getter method for a private instance variable 'mappingsByHash'. The variable 'mappingsByHash' is of type Map with String as key and MappingMetadata as the value.

### Refactoring
As it stands, this method is quite straightforward and doesn't require refactoring. One thing to consider is the potential risk of exposing internal state. If 'mappingsByHash' should not be modifiable by callers, consider returning an unmodifiable view or a deep copy of the map.{{< details "Function source code " >}}
```java
public Map<String, MappingMetadata> getMappingsByHash() {
        return mappingsByHash;
    }
```
{{< /details >}}

## MetadataDiff.writeTo
#### Code Complexity: 29
### Overview
The method 'writeTo' belongs to a class supporting serialization of data for transport over a network. This particular method writes object data, including metadata and settings, to a provided 'StreamOutput'. It checks for various transport versions and handles different conditions for those versions. For instance, certain versions may not support specific metadata operations, and the method writes data accordingly. Its function is critical for ensuring that correct and compatible data is sent over different versions of the transport layer.

### User Acceptance Criteria
```gherkin
Feature: Data Serialization to StreamOutput
Scenario: Serialize data with different transport versions
Given the transport version supports specific features
And the StreamOutput is initialized
When the 'writeTo' function is triggered
Then the data should be written to the StreamOutput,
And metadata, clusterUUID, and both transient and persistent settings should be correctly serialized.
And the resultant StreamOutput should comply with the given transport version capabilities
```

### Refactoring
Firstly, the use of if-else blocks to handle different transport version compatibilities could be replaced with a Strategy pattern. This will improve the extensibility and readability of the code by encapsulating the version-specific logic into separate classes. Secondly, add appropriate exception handling or checks to prevent potential issues from the 'getTransportVersion' method failing or the transport version not being recognized. Lastly, add null safety to the method, especially when attempting to access properties of objects that could potentially be null.{{< details "Function source code " >}}
```java
@Override
        public void writeTo(StreamOutput out) throws IOException {
            if (out.getTransportVersion().onOrAfter(NOOP_METADATA_DIFF_SAFE_VERSION)) {
                out.writeBoolean(empty);
                if (empty) {
                    // noop diff
                    return;
                }
            } else if (out.getTransportVersion().onOrAfter(NOOP_METADATA_DIFF_VERSION)) {
                // noops are not safe with these versions, see #92259
                out.writeBoolean(false);
            }
            out.writeString(clusterUUID);
            out.writeBoolean(clusterUUIDCommitted);
            out.writeLong(version);
            coordinationMetadata.writeTo(out);
            transientSettings.writeTo(out);
            persistentSettings.writeTo(out);
            if (out.getTransportVersion().onOrAfter(TransportVersion.V_7_3_0)) {
                hashesOfConsistentSettings.writeTo(out);
            }
            indices.writeTo(out);
            templates.writeTo(out);
            customs.writeTo(out);
            if (out.getTransportVersion().onOrAfter(TransportVersion.V_8_4_0)) {
                reservedStateMetadata.writeTo(out);
            }
        }
```
{{< /details >}}

## MetadataDiff.apply
#### Code Complexity: 10
### Overview
The given code defines a 'apply' method in a metadata updating class which is public and returns a Metadata instance. The working of this function is explained step by step herein. It uses the Builder pattern for creating a Metadata instance. Initially, it checks if the 'empty' flag is true, if yes, it returns the input part directly. If not, it proceeds to process part. There is a condition checking if indices of 'part' are equal to 'updatedIndices' and 'dataStreamMetadata' of builder is equal to that of part's custom DataStreamMetadata, then the previousIndicesLookup of builder is set as the indicesLookup of part. Finally, it builds the Metadata instance and returns it, assuring that no duplicate instances are created when deduplicating mappings in the Metadata builder. This is achieved by creating a new Builder from existing mappings hashes. The function is ensuring that no changes occur in the existing metadata while the new Builder is being used.

### User Acceptance Criteria
```gherkin
Feature: Metadata Application
 Scenario: Apply metadata to part
  Given the part of metadata
  When the 'empty' flag is false
  Then it creates a builder from the existing mapping hashes and applies metadata properties
  And if 'empty' flag is true, it should directly return the input part
```

### Refactoring
Opportunity 1: Use Optional to avoid NullPointerExceptions. Opportunity 2: Organize the builder pattern in a separate private method for better readability and maintainability. Opportunity 3: Perform validation on Metadata part before processing it. It is suggested to wrap the main code block inside a try-catch block for error handling and preventing potential exceptions from breaking down the system. And it's good to include corresponding logs.{{< details "Function source code " >}}
```java
@Override
        public Metadata apply(Metadata part) {
            if (empty) {
                return part;
            }
            // create builder from existing mappings hashes so we don't change existing index metadata instances when deduplicating
            // mappings in the builder
            final var updatedIndices = indices.apply(part.indices);
            Builder builder = new Builder(part.mappingsByHash, updatedIndices.size());
            builder.clusterUUID(clusterUUID);
            builder.clusterUUIDCommitted(clusterUUIDCommitted);
            builder.version(version);
            builder.coordinationMetadata(coordinationMetadata);
            builder.transientSettings(transientSettings);
            builder.persistentSettings(persistentSettings);
            builder.hashesOfConsistentSettings(hashesOfConsistentSettings.apply(part.hashesOfConsistentSettings));
            builder.indices(updatedIndices);
            builder.templates(templates.apply(part.templates));
            builder.customs(customs.apply(part.customs));
            builder.put(reservedStateMetadata.apply(part.reservedStateMetadata));
            if (part.indices == updatedIndices
                && builder.dataStreamMetadata() == part.custom(DataStreamMetadata.TYPE, DataStreamMetadata.EMPTY)) {
                builder.previousIndicesLookup = part.indicesLookup;
            }
            return builder.build(true);
        }
```
{{< /details >}}

## readFrom
#### Code Complexity: 41
### Overview
The function 'readFrom' is a static function in the 'Metadata' class. Its purpose is to read metadata from a specific input stream (StreamInput). It reads and processes different types of information from a StreamInput object, including versions, settings, mappings, indices, custom indices, and reserved states. The processed information is then used to build and return a Metadata object.

### User Acceptance Criteria
```gherkin
Feature: Metadata Reading from an Input Stream
Scenario: Valid StreamInput Data Interaction
Given a StreamInput instance which contains metadata information
When the readFrom function is invoked with this StreamInput
Then it should read different types of data from the stream
And it should build and return a valid Metadata object.
```

### Refactoring
The method is quite lengthy and doing multiple things that could potentially be split into smaller, more focused methods. This will improve the readability, maintainability, and testability of the code. Specifically, reading the different types of metadata present in the stream could be handled by individual, private helper methods that are called by the primary readFrom method. This would make each step in the process clearer, and make the function more compliant with the Single Responsibility Principle.{{< details "Function source code " >}}
```java
public static Metadata readFrom(StreamInput in) throws IOException {
        Builder builder = new Builder();
        builder.version = in.readLong();
        builder.clusterUUID = in.readString();
        builder.clusterUUIDCommitted = in.readBoolean();
        builder.coordinationMetadata(new CoordinationMetadata(in));
        builder.transientSettings(readSettingsFromStream(in));
        builder.persistentSettings(readSettingsFromStream(in));
        if (in.getTransportVersion().onOrAfter(TransportVersion.V_7_3_0)) {
            builder.hashesOfConsistentSettings(DiffableStringMap.readFrom(in));
        }
        final Function<String, MappingMetadata> mappingLookup;
        if (in.getTransportVersion().onOrAfter(MAPPINGS_AS_HASH_VERSION)) {
            final Map<String, MappingMetadata> mappingMetadataMap = in.readMapValues(MappingMetadata::new, MappingMetadata::getSha256);
            if (mappingMetadataMap.size() > 0) {
                mappingLookup = mappingMetadataMap::get;
            } else {
                mappingLookup = null;
            }
        } else {
            mappingLookup = null;
        }
        int size = in.readVInt();
        for (int i = 0; i < size; i++) {
            builder.put(IndexMetadata.readFrom(in, mappingLookup), false);
        }
        size = in.readVInt();
        for (int i = 0; i < size; i++) {
            builder.put(IndexTemplateMetadata.readFrom(in));
        }
        int customSize = in.readVInt();
        for (int i = 0; i < customSize; i++) {
            Custom customIndexMetadata = in.readNamedWriteable(Custom.class);
            builder.putCustom(customIndexMetadata.getWriteableName(), customIndexMetadata);
        }
        if (in.getTransportVersion().onOrAfter(TransportVersion.V_8_4_0)) {
            int reservedStateSize = in.readVInt();
            for (int i = 0; i < reservedStateSize; i++) {
                builder.put(ReservedStateMetadata.readFrom(in));
            }
        }
        return builder.build();
    }
```
{{< /details >}}

## writeTo
#### Code Complexity: 14
### Overview
This is a function that writes or serializes the cluster state to an output stream. This function is called 'writeTo'. It takes StreamOutput object 'out' as an argument and writes the cluster's version, UUID, whether UUID is committed, coordination metadata, transient settings, persistent settings, hashes of consistent settings, mappings (depending on the TransportVersion), indices, templates, customs, and reservedStateMetadata values to this stream. It checks the TransportVersion to decide which information should be written, ensuring backward compatibility with previous versions.

### User Acceptance Criteria
```gherkin
Feature: Cluster State Serialization
Scenario: Valid writing of cluster state to an output stream
Given the cluster state
When the 'writeTo' method is called with a StreamOutput object
Then the version, UUID, coordination metadata, settings, hashes and indexes of the cluster state should be written to this output stream
```

### Refactoring
First, it could be beneficial to split this function into several smaller ones. As there is a lot of writing to 'out' happening, and most of it similar, these could be consolidated into private helper methods to reduce code duplication and increase readability. Also we could extract every part that depends on transport version into a separate method. This will reduce complexity and make tests for each part easier to write.{{< details "Function source code " >}}
```java
@Override
    public void writeTo(StreamOutput out) throws IOException {
        out.writeLong(version);
        out.writeString(clusterUUID);
        out.writeBoolean(clusterUUIDCommitted);
        coordinationMetadata.writeTo(out);
        transientSettings.writeTo(out);
        persistentSettings.writeTo(out);
        if (out.getTransportVersion().onOrAfter(TransportVersion.V_7_3_0)) {
            hashesOfConsistentSettings.writeTo(out);
        }
        // Starting in #MAPPINGS_AS_HASH_VERSION we write the mapping metadata first and then write the indices without metadata so that
        // we avoid writing duplicate mappings twice
        if (out.getTransportVersion().onOrAfter(MAPPINGS_AS_HASH_VERSION)) {
            out.writeMapValues(mappingsByHash);
        }
        out.writeVInt(indices.size());
        final boolean writeMappingsHash = out.getTransportVersion().onOrAfter(MAPPINGS_AS_HASH_VERSION);
        for (IndexMetadata indexMetadata : this) {
            indexMetadata.writeTo(out, writeMappingsHash);
        }
        out.writeCollection(templates.values());
        VersionedNamedWriteable.writeVersionedWritables(out, customs);
        if (out.getTransportVersion().onOrAfter(TransportVersion.V_8_4_0)) {
            out.writeCollection(reservedStateMetadata.values());
        }
    }
```
{{< /details >}}

## builder
#### Code Complexity: 1
### Overview
This code represents a static builder method in a parent class. This method, when called, creates and returns an instance of a Builder class that is most likely part of a 'Builder' design pattern implementation. The builder is typically used for constructing complex objects step by step.

### Refactoring
There is no direct refactoring needs for this method as it's a commonly used pattern for object creation. The current usage of Builder pattern appears to provide proper abstraction and clarifies the underlying object construction process.{{< details "Function source code " >}}
```java
public static Builder builder() {
        return new Builder();
    }
```
{{< /details >}}

## builder
#### Code Complexity: 1
### Overview
The provided code snippet is a static method named 'builder' within a class. This method receives an argument of type 'Metadata' and returns a new instance of a 'Builder' class with the 'Metadata' passed into it. Essentially, this method aims to create and return a new 'Builder' object using the given 'Metadata' object.

### User Acceptance Criteria
```gherkin
Feature: Creating Builder instance
Scenario: Valid Metadata object provided
Given a Metadata instance
When the builder method is invoked with the Metadata instance as argument
Then a new instance of Builder is created and returned
```

### Refactoring
No refactoring seems necessary for this code snippet as it follows the 'Single Responsibility Principle' where each method does one thing. Here, it only creates a new instance of 'Builder'. However, full insight would require having the context of the entire codebase at hand.{{< details "Function source code " >}}
```java
public static Builder builder(Metadata metadata) {
        return new Builder(metadata);
    }
```
{{< /details >}}

## copyAndUpdate
#### Code Complexity: 1
### Overview
This function, copyAndUpdate, is part of the Metadata class and it uses the builder pattern. It's used to create a new instance of the same class with potentially updated properties. The function accepts another function as a parameter - Consumer<Builder> updater - which is used to modify the properties of the builder before the new instance is created.

### User Acceptance Criteria
```gherkin
Feature: Update Metadata
Scenario: Update metadata using a consumer updater
Given an existing instance of Metadata
When the 'copyAndUpdate' function is called with a consumer updater
Then a new instance of Metadata is created, based on the existing instance with modifications specified by the consumer updater
```

### Refactoring
Opportunity 1: Add a null check for the 'updater' parameter before using it to prevent NullPointerException. Suggestion: Add the following code at the start of the method: 'Objects.requireNonNull(updater);'. Opportunity 2: It would be beneficial to provide a clearer explanation of the 'updater' parameter in your comments and what kinds of modifications it's intended to make.{{< details "Function source code " >}}
```java
public Metadata copyAndUpdate(Consumer<Builder> updater) {
        var builder = builder(this);
        updater.accept(builder);
        return builder.build();
    }
```
{{< /details >}}

## Builder.put
#### Code Complexity: 6
### Overview
This builder method is part of a larger Builder class, presumably for building an instance of a data structure to represent an indexed metadata object. This method takes an IndexMetadata.Builder object as an argument, increments its version, removes duplicate mappings, and builds a new IndexMetadata object. The new IndexMetadata object replaces any existing object of the same index in the indices map. The method also updates the aliases related to the index, checks if the previous indices lookup needs to be unset based on the new and previous IndexMetadata, and finally sets the mapping purge flag based on whether there's a change between the previous and the new index metadata. The method ends by returning the instance of the Builder object.

### User Acceptance Criteria
```gherkin
Feature: Create or Update IndexMetadata in Builder
Scenario: Updating Existing IndexMetadata
Given an instance of IndexMetadata.Builder
When the 'put' method is called with it
Then it should increase the version of metadata
And it should remove duplicate mappings
And it should replace old IndexMetadata object in indices map if it exists
And it should update the aliases
And it should unset the previous indices lookup if needed
And it should set the mapping purge flag if needed
And it should return the instance of the Builder
```

### Refactoring
Suggested areas for improvement in this code include implementing null-check conditions for passed parameters to prevent potential null pointer exceptions, and refactoring the method to smaller sub-methods to improve the readability and maintenance of the code. The function also seems to perform several operations, violating the Single Responsibility Principle. It might also be beneficial to look into making the Builder class thread-safe if it's meant to be used in a multi-threaded environment.{{< details "Function source code " >}}
```java
public Builder put(IndexMetadata.Builder indexMetadataBuilder) {
            // we know its a new one, increment the version and store
            indexMetadataBuilder.version(indexMetadataBuilder.version() + 1);
            dedupeMapping(indexMetadataBuilder);
            IndexMetadata indexMetadata = indexMetadataBuilder.build();
            IndexMetadata previous = indices.put(indexMetadata.getIndex().getName(), indexMetadata);
            updateAliases(previous, indexMetadata);
            if (unsetPreviousIndicesLookup(previous, indexMetadata)) {
                previousIndicesLookup = null;
            }
            maybeSetMappingPurgeFlag(previous, indexMetadata);
            return this;
        }
```
{{< /details >}}

## Builder.put
#### Code Complexity: 25
### Overview
The 'put' method in the Builder class is used to add or update IndexMetadata in a collection. It accepts two parameters, an instance of IndexMetadata and a boolean expressing whether to increment the version number or not. Key steps include deduplicating mapping, optionally incrementing the version, putting the new IndexMetadata in the collection, updating the aliases, checking the status of previous indices lookup, and possibly setting the mapping purge flag.

### User Acceptance Criteria
```gherkin
Feature: Update IndexMetadata in collection
Scenario: Add new or update existing IndexMetadata
Given an instance of IndexMetadata
And a flag indicating whether to increase version
When the 'put' method is called
Then IndexMetadata should be deduplicated
And the version should be incremented if specified
And the new IndexMetadata should be added or existing one updated in indices
And aliases should be updated
And the status of previous indices lookup should be checked
And mapping purge flag could be set accordingly
```

### Refactoring
Refactoring opportunities include adding null checks for the IndexMetadata object before using it, as well as ensuring the stability of the method in a multithreaded environment by adding necessary synchronization or using concurrent collections. Also, the method can also be split up to adhere the Single Responsibility Principle for easier testing and maintenance.{{< details "Function source code " >}}
```java
public Builder put(IndexMetadata indexMetadata, boolean incrementVersion) {
            final String name = indexMetadata.getIndex().getName();
            indexMetadata = dedupeMapping(indexMetadata);
            IndexMetadata previous;
            if (incrementVersion) {
                if (indices.get(name) == indexMetadata) {
                    return this;
                }
                // if we put a new index metadata, increment its version
                indexMetadata = indexMetadata.withIncrementedVersion();
                previous = indices.put(name, indexMetadata);
            } else {
                previous = indices.put(name, indexMetadata);
                if (previous == indexMetadata) {
                    return this;
                }
            }
            updateAliases(previous, indexMetadata);
            if (unsetPreviousIndicesLookup(previous, indexMetadata)) {
                previousIndicesLookup = null;
            }
            maybeSetMappingPurgeFlag(previous, indexMetadata);
            return this;
        }
```
{{< /details >}}

## Builder.maybeSetMappingPurgeFlag
#### Code Complexity: 21
### Overview
This is a private void method named 'maybeSetMappingPurgeFlag' which is used to check for unused mappings in a given set of data. The method takes two arguments, both instances of IndexMetadata class, named 'previous' and 'updated'. The function begins by checking if the 'checkForUnusedMappings' variable is true. If it is, the function immediately returns. If not, the function proceeds to check if either 'previous' or 'updated', or their mapping, is null. If so, the function again immediately returns. Then function then checks if the 'sha256' values of the mappings of 'previous' and 'updated' are equal. If they are not equal, 'checkForUnusedMappings' is set to true.

### User Acceptance Criteria
```gherkin
This method is private and not public, as such, generating Gherkin scenarios is not appropriate.
```

### Refactoring
Refactoring Opportunity 1: Implement proper null handling. Currently, the function returns immediately if either 'previous', 'updated', 'previous.mapping()', or 'updated.mapping()' is null. This is an opportunity for refactoring as better handling of null objects can be implemented. Suggestion: Include conditional statements to handle null object instances properly. Refactoring Opportunity 2: Add logging or notification. Currently, there is no documentation or log keeping of when an object is null. Suggestion: Add a logging statement which records when one of the objects is null.{{< details "Function source code " >}}
```java
private void maybeSetMappingPurgeFlag(@Nullable IndexMetadata previous, IndexMetadata updated) {
            if (checkForUnusedMappings) {
                return;
            }
            if (previous == null) {
                return;
            }
            final MappingMetadata mapping = previous.mapping();
            if (mapping == null) {
                return;
            }
            final MappingMetadata updatedMapping = updated.mapping();
            if (updatedMapping == null) {
                return;
            }
            if (mapping.getSha256().equals(updatedMapping.getSha256()) == false) {
                checkForUnusedMappings = true;
            }
        }
```
{{< /details >}}

## Builder.unsetPreviousIndicesLookup
#### Code Complexity: 21
### Overview
This method 'unsetPreviousIndicesLookup' is a private static method which checks for change between the attributes of two IndexMetadata objects: 'previous' and 'current'. It compares the alias, the truthiness of being hidden, the truthiness of being a system index, and the state. It returns true if there is any disparity (i.e. if any attribute of the 'previous' object does not match the corresponding attribute in the 'current' object), otherwise it returns false.

### User Acceptance Criteria
```gherkin
It's not applicable to provide Gherkin User Acceptance criteria as the method is a private one, thus not directly accessible by Users.
```

### Refactoring
Instead of multiple 'if' checks, the equality conditions could be combined with logical OR operator. This would make code more compact. However, combining conditions might make debugging slightly harder if it's needed to know specifically which case caused the method to return true. Also, adding null checks for both parameters would enhance the function reliability.{{< details "Function source code " >}}
```java
private static boolean unsetPreviousIndicesLookup(IndexMetadata previous, IndexMetadata current) {
            if (previous == null) {
                return true;
            }

            if (previous.getAliases().equals(current.getAliases()) == false) {
                return true;
            }

            if (previous.isHidden() != current.isHidden()) {
                return true;
            }

            if (previous.isSystem() != current.isSystem()) {
                return true;
            }

            if (previous.getState() != current.getState()) {
                return true;
            }

            return false;
        }
```
{{< /details >}}

## Builder.get
#### Code Complexity: 1
### Overview
This is a simple getter method, get(), in a class (presumed to be some sort of index storage). It receives an index name as a parameter and retrieves the corresponding IndexMetadata object from a collection named indices. This collection is presumably a Map or similar structure that stores IndexMetadata objects indexed by their respective names.

### Refactoring
Given that this is a straightforward getter method, there is little refactoring scope in terms of execution logic. However, as a potential enhancement, the method could potentially be augmented to throw a custom Exception (such as IndexNotFoundException) when no data is found for the given index, thereby making error handling more informative.{{< details "Function source code " >}}
```java
public IndexMetadata get(String index) {
            return indices.get(index);
        }
```
{{< /details >}}

## Builder.getSafe
#### Code Complexity: 13
### Overview
This function is named 'getSafe', which resides in a presumably larger class. The primary purpose of the function is to retrieve the metadata of an index based on the index name. It accepts an object of type 'Index' as an argument. Initially, 'index.getName()' method call is used to fetch the metadata from the index name. If the metadata exists, its UUID is compared with the UUID of the passed index object. If they match, the metadata is returned. If they don't match, it throws an 'IndexNotFoundException' with a detailed message about the mismatch. If the metadata doesn't exist in the first place, the function throws an 'IndexNotFoundException' indicating the index wasn't found.

### User Acceptance Criteria
```gherkin
Feature: Get Index Metadata Safely.
 Scenario: Successful retrieval of index metadata.
 Given an index is available 
 When getSafe method is called with this index
 Then it should return the index metadata if UUIDs match.
 Scenario: Mismatch of index UUID.
 Given an index is available
 When getSafe method is called with this index
 And the UUID of the index metadata does not match with the input index UUID
 Then it should throw an IndexNotFoundException with a detailed mismatch message.
 Scenario: Non-existent index.
 Given an index is available
 When getSafe method is called with this index
 And there is no index metadata available for this index
 Then it should throw an IndexNotFoundException.
```

### Refactoring
Refactoring suggestion includes providing a more descriptive name for the 'getSafe' function. It would be better if it explicitly states its purpose, such as 'getMetadataByIndexSafely'. Additionally, a null check can be added at the start of the function for the index parameter to ensure it is not null. Also, error handling or checks can be added for when 'getName', 'getUUID' or 'getIndexUUID' methods return null values.{{< details "Function source code " >}}
```java
public IndexMetadata getSafe(Index index) {
            IndexMetadata indexMetadata = get(index.getName());
            if (indexMetadata != null) {
                if (indexMetadata.getIndexUUID().equals(index.getUUID())) {
                    return indexMetadata;
                }
                throw new IndexNotFoundException(
                    index,
                    new IllegalStateException(
                        "index uuid doesn't match expected: [" + index.getUUID() + "] but got: [" + indexMetadata.getIndexUUID() + "]"
                    )
                );
            }
            throw new IndexNotFoundException(index);
        }
```
{{< /details >}}

## Builder.remove
#### Code Complexity: 1
### Overview
This function 'remove' is a part of a Builder class, used to remove an index from a collection 'indices'. It first sets the initial value of 'previousIndicesLookup' variable as null and flag 'checkForUnusedMappings' as true, then it removes an index from the 'indices' collection. If an index that matches the provided input is found, it gets removed and its metadata is stored in the variable 'previous'. Then, an update method is called on 'aliases' with parameters as the stored metadata and null. The function returns the current instance of the Builder.

### User Acceptance Criteria
```gherkin
Feature: Removing index from collection
  Scenario: Successfully removing an index
  Given an active Builder instance and a collection of indices
  When the 'remove' method is called with a valid index string
  Then that index with its metadata should be removed from the indices collection and any relevant aliases should be updated
```

### Refactoring
The function could benefit from argument validation--for instance, checking if 'index' is a valid string type before proceeding. It would be beneficial to split the function into multiple smaller functions so that each function performs a single, well-defined task. It could help to increase the readability and maintainability of the code.{{< details "Function source code " >}}
```java
public Builder remove(String index) {
            previousIndicesLookup = null;
            checkForUnusedMappings = true;
            IndexMetadata previous = indices.remove(index);
            updateAliases(previous, null);
            return this;
        }
```
{{< /details >}}

## Builder.removeAllIndices
#### Code Complexity: 2
### Overview
The 'removeAllIndices' function is a part of a 'Builder' class. Its purpose is to clear all existing indices and associated mappings inside the builder. This is achieved by setting the 'previousIndicesLookup' to null, enabling 'checkForUnusedMappings', and explicitly invoking the clear method on 'indices', 'mappingsByHash', and 'aliasedIndices' collections. The function returns the instance of the same Builder object, enabling function chaining.

### User Acceptance Criteria
```gherkin
Feature: Removing All Indices from Builder
 Scenario: Successfully remove all indices
 Given a Builder object with some indices and mappings
 When removeAllIndices method is called on the Builder
 Then all indices, mappings by hash, and aliased indices should be cleared
 And checkForUnusedMappings should be set to true
```

### Refactoring
Refactoring opportunity lies in implementing better encapsulation principles. Instead of directly accessing and manipulating the class instance variables, consider using getter and setter methods to perform these operations. Getter and Setter methods can provide additional control or validation over the data mutation, ensuring the data remains in a valid state. Also, synchronization mechanisms can be introduced to ensure thread-safety.{{< details "Function source code " >}}
```java
public Builder removeAllIndices() {
            previousIndicesLookup = null;
            checkForUnusedMappings = true;

            indices.clear();
            mappingsByHash.clear();
            aliasedIndices.clear();
            return this;
        }
```
{{< /details >}}

## Builder.indices
#### Code Complexity: 1
### Overview
This method is part of the Builder class and it's tasked with manipulating builder's indices. It accepts a Map object whose values are of type 'IndexMetadata'. For each 'IndexMetadata' value, it calls the 'put' method. Finally, it returns 'this', referring to the current instance of the Builder, allowing for method chaining.

### User Acceptance Criteria
```gherkin
Feature: Indices Updation in Builder
Scenario: Updating indices
Given a map with indices metadata
When the indices method is invoked
Then it should update each index in the builder using the put method
```

### Refactoring
To improve the method, Opportunity 1: Implement appropriate null checks or Optional API use to handle potential null values. Opportunity 2: Implement thread-safety for the 'put' method if it isn't already in place to ensure consistency in a multithreaded environment.{{< details "Function source code " >}}
```java
public Builder indices(Map<String, IndexMetadata> indices) {
            for (var value : indices.values()) {
                put(value, false);
            }
            return this;
        }
```
{{< /details >}}

## Builder.updateAliases
#### Code Complexity: 65
### Overview
The function 'updateAliases' is responsible for updating aliases for the provided index metadata. The function distinguishes three main scenarios: the previous index metadata doesn't exist and the current one does, the current index metadata doesn't exist and the previous one does, and both the previous and current index metadata exist. In case the previous index metadata doesn't exist, all aliases from the current index metadata are added. If the current index metadata doesn't exist, all aliases from the previous index metadata are removed. If both index metadata exist, the function checks if the aliases are equal. If not, for each alias in the current metadata, the function checks if it exists in the previous one and adds it if doesn't exist. Likewise, for each alias in the previous metadata, it removes the alias if it doesn't exist in the current index metadata.

### User Acceptance Criteria
```gherkin
Feature: Alias Update for Index Metadata
 Scenario: Previous Metadata Missing
 Given there is no previous index metadata
 And the current index metadata exists
 When the 'updateAliases' function is invoked
 Then all aliases from the current metadata should be added
 Scenario: Current Metadata Missing
 Given there is no current index metadata
 And the previous index metadata exists
 When the 'updateAliases' function is invoked
 Then all aliases from the previous metadata should be removed
 Scenario: Both Metadata Exist
 Given both previous and current index metadata exist
 When the 'updateAliases' function is invoked
 Then the aliases that exist in the current but not in the previous metadata should be added
 And the aliases that exist in the previous but not in the current metadata should be removed
```

### Refactoring
Refactoring point 1: There is repeated code for adding and removing aliases which could be abstracted to their own functions to improve readability. Refactoring point 2: The multiple nested conditions could be simplified or broken down for better maintainability. Refactoring point 3: The function could be made more robust by adding checks to handle potential null keys in the alias maps.{{< details "Function source code " >}}
```java
void updateAliases(IndexMetadata previous, IndexMetadata current) {
            if (previous == null && current != null) {
                for (var key : current.getAliases().keySet()) {
                    putAlias(key, current.getIndex());
                }
            } else if (previous != null && current == null) {
                for (var key : previous.getAliases().keySet()) {
                    removeAlias(key, previous.getIndex());
                }
            } else if (previous != null && current != null) {
                if (Objects.equals(previous.getAliases(), current.getAliases())) {
                    return;
                }

                for (var key : current.getAliases().keySet()) {
                    if (previous.getAliases().containsKey(key) == false) {
                        putAlias(key, current.getIndex());
                    }
                }
                for (var key : previous.getAliases().keySet()) {
                    if (current.getAliases().containsKey(key) == false) {
                        removeAlias(key, current.getIndex());
                    }
                }
            }
        }
```
{{< /details >}}

## Builder.putAlias
#### Code Complexity: 6
### Overview
This method is part of a Builder inner class. It takes in two parameters - an alias as a String and an Index object. It first checks that these two parameters are not null. It then retrieves the set of indices associated with the given alias (or an empty set if none exist). It attempts to add the given index to this set. If the set didn't contain the given index (and thus change as a result of the add operation), the method updates the map of 'aliasedIndices' with the updated set of indices, making sure to wrap it with 'Collections.unmodifiableSet()' to prevent further modification. The method finally returns the Builder instance itself, allowing for further chained builder operations.

### User Acceptance Criteria
```gherkin
Feature: Alias Addition to AliasedIndices
Scenario: Add a new alias-Index association
Given an alias and an Index object
When the putAlias method is invoked with these parameters
Then the 'aliasedIndices' map is updated to associate the given alias with the given index, if it wasn't already associated
```

### Refactoring
The method could be refactored to handle null parameters more gracefully, ideally by throwing IllegalArgumentException with a relevant error message rather than NullPointerException. To avoid potentially having large sets of indices stored in memory, consider whether a different data structure could be more memory-efficient.{{< details "Function source code " >}}
```java
private Builder putAlias(String alias, Index index) {
            Objects.requireNonNull(alias);
            Objects.requireNonNull(index);

            Set<Index> indices = new HashSet<>(aliasedIndices.getOrDefault(alias, Set.of()));
            if (indices.add(index) == false) {
                return this; // indices already contained this index
            }
            aliasedIndices.put(alias, Collections.unmodifiableSet(indices));
            return this;
        }
```
{{< /details >}}

## Builder.removeAlias
#### Code Complexity: 14
### Overview
This function 'removeAlias' is part of a Builder class. It is responsible for removing an alias from a collection of aliased indices. It accepts two parameters: 'alias' which is the name of the alias to be removed, and 'index' which is the index object that the alias is associated with. First, it checks whether the alias and index objects are not null. If they are null, then a NullPointerException will be thrown. Next, it retrieves the collection of indexes that are associated with the passed alias. If this collection is empty or null, an IllegalStateException is thrown, saying that the alias does not exist for the index. Then, it tries to remove the index from the retrieved collection. If the index does not exist in the collection, again an IllegalStateException is thrown. Finally, if the collection becomes empty after removing the index, it removes the alias from 'aliasedIndices'. If it is not empty, it overwrites the alias in 'aliasedIndices' with its corresponding unmodifiable set of indices.

### Refactoring
First, using explicit Optional values for the alias and index can be helpful in clearly defining the expected behavior when these parameters are null. Secondly, to avoid attempts of removing non-existing aliases or indices, validate input before manipulating the collections. Lastly, this function can be broken into smaller functions each with a single responsibility: one for validating inputs, one for removing alias, etc to increase understandability and maintainability.{{< details "Function source code " >}}
```java
private Builder removeAlias(String alias, Index index) {
            Objects.requireNonNull(alias);
            Objects.requireNonNull(index);

            Set<Index> indices = aliasedIndices.get(alias);
            if (indices == null || indices.isEmpty()) {
                throw new IllegalStateException("Cannot remove non-existent alias [" + alias + "] for index [" + index.getName() + "]");
            }

            indices = new HashSet<>(indices);
            if (indices.remove(index) == false) {
                throw new IllegalStateException("Cannot remove non-existent alias [" + alias + "] for index [" + index.getName() + "]");
            }

            if (indices.isEmpty()) {
                aliasedIndices.remove(alias); // for consistency, we don't store empty sets, so null it out
            } else {
                aliasedIndices.put(alias, Collections.unmodifiableSet(indices));
            }
            return this;
        }
```
{{< /details >}}

## Builder.put
#### Code Complexity: 1
### Overview
This function, put(), is a method in the Builder class. It takes an argument of type IndexTemplateMetadata.Builder. The function calls the build() method of the passed IndexTemplateMetadata.Builder instance to build an IndexTemplateMetadata object and then sends this object to another overloaded variant of the put() method.

### User Acceptance Criteria
```gherkin
Feature: Addition of Index Template Metadata to Builder
 Scenario: Valid Index Template Metadata Builder Input
    Given an instance of IndexTemplateMetadata.Builder
    When the 'put' method is invoked with this instance as its argument
    Then build method of this instance should be called and result should be passed to the overloaded 'put' method
```

### Refactoring
Opportunity 1: Adding nullability checks or try-catch blocks around the build() method call can handle potential build failures more gracefully. Suggestion: Implement checks on the inputted IndexTemplateMetadata.Builder object to ensure that it is not null and capable of producing a valid IndexTemplateMetadata object when build() is called.{{< details "Function source code " >}}
```java
public Builder put(IndexTemplateMetadata.Builder template) {
            return put(template.build());
        }
```
{{< /details >}}

## Builder.put
#### Code Complexity: 1
### Overview
This function is a part of the Builder pattern and it's responsibility is to add an instance of IndexTemplateMetadata to the Builder. It receives a single parameter which is an instance of IndexTemplateMetadata, and it's used to add this instance to a map stored internally by the builder. The same instance of Builder is returned to facilitate chaining methods.

### User Acceptance Criteria
```gherkin
Feature: Add IndexTemplateMetadata to Builder
 Scenario: Valid IndexTemplateMetadata
 Given a Builder and an instance of IndexTemplateMetadata
 When method put is called with the IndexTemplateMetadata
 Then the IndexTemplateMetadata should be added to the internal map within the Builder.
```

### Refactoring
Opportunity 1: Null checks can be added to the function for better error handling. Opportunity 2: The function could be designed to handle the situation where a template with the same name is already present in the map. This could be done by either updating the existing value, ignoring the new value, or throwing an error.{{< details "Function source code " >}}
```java
public Builder put(IndexTemplateMetadata template) {
            templates.put(template.name(), template);
            return this;
        }
```
{{< /details >}}

## Builder.removeTemplate
#### Code Complexity: 1
### Overview
This method is part of a Builder class, and it is used to remove a specified template from the Builder's templates. The function takes a single parameter which is the name of the template to be removed. After removing the template, it returns the Builder for further usage - adhering to the Fluent Interface pattern common in Builder designs.

### User Acceptance Criteria
```gherkin
Feature: Remove Template from Builder
 Scenario: Successful Removal of Template
 Given a Builder with a list of templates
 When the removeTemplate method is invoked with a valid template name
 Then that template should be removed from the Builder's templates
 And return the Builder instance for further operations
```

### Refactoring
You could add a check to see if the specified template actually exists in the list before trying to remove it. This would prevent any errors if a non-existing template name is passed. Moreover, validating the method's input would also be a suitable approach in order to handle null or empty string scenarios.{{< details "Function source code " >}}
```java
public Builder removeTemplate(String templateName) {
            templates.remove(templateName);
            return this;
        }
```
{{< /details >}}

## Builder.templates
#### Code Complexity: 1
### Overview
This public method in Builder class allows the user to insert a set of key-value pairs from the input map into the templates map owned by the class. It is a somewhat enriched setter method because it doesn't simply replace the current value, but extends it with new entries, preserving the existing ones (unless there are duplicates).

### User Acceptance Criteria
```gherkin
Feature: Templates updating
Scenario: Valid templates insert from a map
Given the Builder instance is in a valid state
When the method 'templates' is invoked with a valid map as a parameter
Then the existing 'templates' map should be extended with entries from the input map, overriding duplicates if any.
```

### Refactoring
Exception handling for null input values should be introduced to increase the robustness of the method. For better thread safety, consider using concurrency-aware collections or introducing synchronization mechanisms. Further, unit tests should verify behavior on null input or the existence of null keys/values.{{< details "Function source code " >}}
```java
public Builder templates(Map<String, IndexTemplateMetadata> templates) {
            this.templates.putAllFromMap(templates);
            return this;
        }
```
{{< /details >}}

## Builder.put
#### Code Complexity: 2
### Overview
The provided code snippet is a part of a builder pattern implementation in Java. Specifically, it is a 'put' method which is used to add a ComponentTemplate object to a map. The method uses the 'name' argument as the key and 'componentTemplate' as the value of the map entry. It checks if a componentTemplate object is null and if so it throws a NullPointerException. If the componentTemplate object is not null, this method adds it as a custom field to the map. It is important to note that it uses ImmutableOpenMap to handle customs.

### User Acceptance Criteria
```gherkin
Feature: Add Component Template to Map
Scenario: Add valid Component Template to map
Given that a not-null ComponentTemplate and a unique name is available
When an add request is made to the map with given name and ComponentTemplate
Then the ComponentTemplate should be successfully added to the map under the given name 
```

### Refactoring
The data retrieval and storage logic can be segregated from the 'put' method thereby following SOLID principles of software design. The method can also be simplified removing the lines where the same data type is being converted multiple times. As HashMaps are mutable, they can be directly manipulated, hence reducing memory usage. Furthermore, for null checking of componentTemplate, using '@NotNull' annotation would be less intrusive and cleaner.{{< details "Function source code " >}}
```java
public Builder put(String name, ComponentTemplate componentTemplate) {
            Objects.requireNonNull(componentTemplate, "it is invalid to add a null component template: " + name);
            // ಠ_ಠ at ImmutableOpenMap
            Map<String, ComponentTemplate> existingTemplates = Optional.ofNullable(
                (ComponentTemplateMetadata) this.customs.get(ComponentTemplateMetadata.TYPE)
            ).map(ctm -> new HashMap<>(ctm.componentTemplates())).orElse(new HashMap<>());
            existingTemplates.put(name, componentTemplate);
            this.customs.put(ComponentTemplateMetadata.TYPE, new ComponentTemplateMetadata(existingTemplates));
            return this;
        }
```
{{< /details >}}

## Builder.removeComponentTemplate
#### Code Complexity: 2
### Overview
The function removeComponentTemplate() is part of a Builder class, which is used to build an object step-by-step. In this case, the builder is for components. The function takes a string name as an input, which represents the name of the component template to be removed. It creates a Map of the existing templates from ComponentTemplateMetadata. If ComponentTemplateMetadata for the current instance is null, it will initialize an empty HashMap. Then, it looks for the supplied template name in the map and removes it. At last, it updates the existing templates in the customs attribute of the builder instance with the updated templates and returns the Builder instance.

### User Acceptance Criteria
```gherkin
Feature: Remove Component Template
  Scenario: Successfully Remove Specified Component Template
    Given the Builder class instance is correctly initialized
    When the function 'removeComponentTemplate' is called with a valid template name
    Then the specified component template should be removed from the existing templates
```

### Refactoring
Instead of creating a whole new HashMap every time the function is called, this map can be created during initialization of the Builder class and reused whenever necessary. This way, we will avoid unnecessary object creation and will have better performance. Also, consider using ConcurrentHashMap or some synchronization mechanism to make the function thread-safe, which would prevent potential concurrent modification issues in a multi-threading environment.{{< details "Function source code " >}}
```java
public Builder removeComponentTemplate(String name) {
            // ಠ_ಠ at ImmutableOpenMap
            Map<String, ComponentTemplate> existingTemplates = Optional.ofNullable(
                (ComponentTemplateMetadata) this.customs.get(ComponentTemplateMetadata.TYPE)
            ).map(ctm -> new HashMap<>(ctm.componentTemplates())).orElse(new HashMap<>());
            existingTemplates.remove(name);
            this.customs.put(ComponentTemplateMetadata.TYPE, new ComponentTemplateMetadata(existingTemplates));
            return this;
        }
```
{{< /details >}}

## Builder.componentTemplates
#### Code Complexity: 1
### Overview
The given snippet is a public method named 'componentTemplates' inside a Builder class. It accepts a map of strings as keys and `ComponentTemplate` instances as values. The method primarily handles the assignment of 'ComponentTemplateMetadata' to an internal `customs` map using 'ComponentTemplateMetadata.TYPE' as the key.

### User Acceptance Criteria
```gherkin
Feature: Set Component Template MetaData in Builder
 Scenario: Valid ComponentTemplates Map Input
 Given the Builder object is initialized
 When the 'componentTemplates' method is called with a valid map of ComponentTemplates
 Then the specific ComponentTemplateMetadata should be set in the internal 'customs' Map
```

### Refactoring
The current Builder design could be improved by validating input parameters, particularly the `componentTemplates` Map instance, prior to their assignment. Appropriate null checks and opt to use immutable instances, if possible, to ensure the consistency of data within the `Builder`.{{< details "Function source code " >}}
```java
public Builder componentTemplates(Map<String, ComponentTemplate> componentTemplates) {
            this.customs.put(ComponentTemplateMetadata.TYPE, new ComponentTemplateMetadata(componentTemplates));
            return this;
        }
```
{{< /details >}}

## Builder.indexTemplates
#### Code Complexity: 1
### Overview
This method is a part of Builder pattern in Java. It sets the index templates to the provided map of String and ComposableIndexTemplate pairs. This method is adding new ComposableIndexTemplateMetadata to the 'customs' Map using 'ComposableIndexTemplateMetadata.TYPE' as the key. After addition, it returns the Builder instance for allowing method chaining according to builder design pattern.

### User Acceptance Criteria
```gherkin
Feature: Set Index Templates to Builder
 Scenario: Valid Index Templates are provided
 Given the Builder instance is available 
 When 'indexTemplates' method is invoked with valid Map<String, ComposableIndexTemplate> 
 Then the customs map of the Builder should get updated with new ComposableIndexTemplateMetadata 
 And the method should return the same Builder instance for further operations
```

### Refactoring
Opportunity 1: The null check for provided 'indexTemplates' Map can be added to avoid NullPointerException. Opportunity 2: A check can be introduced to see if the ComposableIndexTemplateMetadata.TYPE key already exists within 'customs' map to avoid unintentional overwrites. Opportunity 3: Make the method thread safe if applicable by adding synchronization or using concurrent collections.{{< details "Function source code " >}}
```java
public Builder indexTemplates(Map<String, ComposableIndexTemplate> indexTemplates) {
            this.customs.put(ComposableIndexTemplateMetadata.TYPE, new ComposableIndexTemplateMetadata(indexTemplates));
            return this;
        }
```
{{< /details >}}

## Builder.put
#### Code Complexity: 2
### Overview
This method is part of a Builder class and is used to add an entry into a template map. The map stores pairs of template names and corresponding ComposableIndexTemplate objects. Firstly, the method ensures that the ComposableIndexTemplate passed as input is not null. It then retrieves the current entries of the map, creates a new entry (made of the user input), and updates the map. The Builder instance 'this' is returned for method chainingal. The class is performing operations on a customs map, specifically on the entries under the key `ComposableIndexTemplateMetadata.TYPE`. As it seems, the 'customs' field is mutable and shared by other methods of the Builder class as well.

### User Acceptance Criteria
```gherkin
Feature: Addition of ComposableIndexTemplate to the Builder
 Scenario: Valid ComposableIndexTemplate addition
 Given a Builder instance and a valid ComposableIndexTemplate object
 When the user attempts to add the ComposableIndexTemplate object into the Builder
 Then the Builder should add the name and ComposableIndexTemplate pair to its index templates collection without any exception
```

### Refactoring
Refactoring this method would involve improving the overall readability and adding safety mechanisms for concurrent execution. The retrieval, modification, and updating of the customs map could be extracted into distinct utility methods or even a separate class. Furthermore, usage of thread-safe collection types, like ConcurrentHashmap, or adding synchronization mechanisms for 'customs' map mutation would be a prudent move to handle concurrency.{{< details "Function source code " >}}
```java
public Builder put(String name, ComposableIndexTemplate indexTemplate) {
            Objects.requireNonNull(indexTemplate, "it is invalid to add a null index template: " + name);
            // ಠ_ಠ at ImmutableOpenMap
            Map<String, ComposableIndexTemplate> existingTemplates = Optional.ofNullable(
                (ComposableIndexTemplateMetadata) this.customs.get(ComposableIndexTemplateMetadata.TYPE)
            ).map(itmd -> new HashMap<>(itmd.indexTemplates())).orElse(new HashMap<>());
            existingTemplates.put(name, indexTemplate);
            this.customs.put(ComposableIndexTemplateMetadata.TYPE, new ComposableIndexTemplateMetadata(existingTemplates));
            return this;
        }
```
{{< /details >}}

## Builder.removeIndexTemplate
#### Code Complexity: 2
### Overview
The removeIndexTemplate function is part of the larger Builder class and it takes in a name of an index template as an argument. The code first accesses an optional ComposableIndexTemplateMetadata object in customs Map. If the object exists, it creates a new HashMap with the index templates; otherwise, it creates an empty HashMap. Then, it removes the named index template from the HashMap. Finally, it stores the modified HashMap back in the customs Map under the key of ComposableIndexTemplateMetadata.TYPE.

### User Acceptance Criteria
```gherkin
Feature: Removal of Index Template
 Scenario: To delete an existing index template
 Given the builder object has a customs map
 When removeIndexTemplate method is called with a valid template name
 Then the index template is removed from the customs map
```

### Refactoring
Refactoring opportunity presents in simplifying the method by wrapping the customs map functionality in a helper method. This could improve legibility and maintainability of the function. It is suggested to use checks for nullable and use try-catch block or exceptions handling to avoid runtime errors and improve robustness of the function.{{< details "Function source code " >}}
```java
public Builder removeIndexTemplate(String name) {
            // ಠ_ಠ at ImmutableOpenMap
            Map<String, ComposableIndexTemplate> existingTemplates = Optional.ofNullable(
                (ComposableIndexTemplateMetadata) this.customs.get(ComposableIndexTemplateMetadata.TYPE)
            ).map(itmd -> new HashMap<>(itmd.indexTemplates())).orElse(new HashMap<>());
            existingTemplates.remove(name);
            this.customs.put(ComposableIndexTemplateMetadata.TYPE, new ComposableIndexTemplateMetadata(existingTemplates));
            return this;
        }
```
{{< /details >}}

## Builder.dataStream
#### Code Complexity: 1
### Overview
The given function 'dataStream' takes a string 'dataStreamName' as an input parameter. It then returns a DataStream object. The function retrieves data stream metadata and calls the 'dataStreams' method on the metadata, which returns a map of data streams. It then retrieves a specific data stream from this map using the 'dataStreamName' key.

### User Acceptance Criteria
```gherkin
Feature: Data Stream Retrieval
 Scenario: Valid Data Stream Name
 Given the data stream map is available
 When the method is called with a specific data stream name
 Then it should return the corresponding data stream object, or null if the data stream does not exist.
```

### Refactoring
Opportunity 1: The function fails to handle scenarios where the data stream does not exist in the map, causing it to return null. Refining code to return an Optional<DataStream> could allow us to express the potential absence of a data stream more explicitly. Suggestion: refactoring the return type to `Optional<DataStream>` and using the Optional's `ofNullable` method to handle possible nulls can increase this function's robustness.
 Opportunity 2: To align with the Single Responsibility Principle, consider abstracting the data stream retrieval to a separate method. The goal is to keep 'dataStream' method's only responsibility to return the appropriate DataStream, whereas the new method could handle the process of retrieving the data stream from the map.{{< details "Function source code " >}}
```java
public DataStream dataStream(String dataStreamName) {
            return dataStreamMetadata().dataStreams().get(dataStreamName);
        }
```
{{< /details >}}

## Builder.dataStreams
#### Code Complexity: 2
### Overview
The 'dataStreams' function is a builder method that takes two parameters: 'dataStreams' and 'dataStreamAliases', both as Maps. It is responsible for validating the data streams and updating the 'customs' field with 'DataStreamMetadata' that contains these dataStreams and dataStreamAliases as ImmutableOpenMaps.

### User Acceptance Criteria
```gherkin
Feature: Data Stream Builder 
Scenario: Valid Data Stream and Aliases 
Given the dataStreams and dataStreamAliases maps are available
When the builder method is invoked for a new Data Stream Metadata
Then each data stream is validated and the customs field gets updated with Data Stream Metadata that includes data stream and data stream aliases as ImmutableOpenMaps.
```

### Refactoring
Firstly, a null check can be added at the start of function for the dataStreams and dataStreamAliases parameters. Secondly, it might be beneficial to catch any potential exception thrown by 'dataStream.validate(indices::get);', where an adequate response or fallback plan can be implemented. Finally, the naming of 'customs' field could be improved to reflect more information about its content or purpose.{{< details "Function source code " >}}
```java
public Builder dataStreams(Map<String, DataStream> dataStreams, Map<String, DataStreamAlias> dataStreamAliases) {
            previousIndicesLookup = null;

            // Only perform data stream validation only when data streams are modified in Metadata:
            for (DataStream dataStream : dataStreams.values()) {
                dataStream.validate(indices::get);
            }

            this.customs.put(
                DataStreamMetadata.TYPE,
                new DataStreamMetadata(
                    ImmutableOpenMap.<String, DataStream>builder().putAllFromMap(dataStreams).build(),
                    ImmutableOpenMap.<String, DataStreamAlias>builder().putAllFromMap(dataStreamAliases).build()
                )
            );
            return this;
        }
```
{{< /details >}}

## Builder.put
#### Code Complexity: 2
### Overview
This function is part of a Builder class and adds a DataStream to the custom class member. It first checks and handles null data stream instances. It then triggers the validation of the provided DataStream, assuming that every time a backing index of a DataStream is modified a new instance will be created. The validation leverages the indices lookup method. Finally, the DataStream is added to the customs class member via the 'withAddedDatastream' operation.

### User Acceptance Criteria
```gherkin
Feature: Adding DataStream to Builder
 Scenario: Successful Addition of a DataStream
 Given a valid DataStream is provided
 When the put method is called
 Then the DataStream should be added to the customs class member and a previous indices lookup becomes null.
```

### Refactoring
The current implementation assumes that every time the backing indices of a DataStream is modified, a new instance will be created. This could potentially be changed to check if a similar data stream is already present, and update its indices, instead of creating a new instance every time, leading to better memory management.{{< details "Function source code " >}}
```java
public Builder put(DataStream dataStream) {
            previousIndicesLookup = null;
            Objects.requireNonNull(dataStream, "it is invalid to add a null data stream");

            // Every time the backing indices of a data stream is modified a new instance will be created and
            // that instance needs to be added here. So this is a good place to do data stream validation for
            // the data stream and all of its backing indices. Doing this validation in the build() method would
            // trigger this validation on each new Metadata creation, even if there are no changes to data streams.
            dataStream.validate(indices::get);

            this.customs.put(DataStreamMetadata.TYPE, dataStreamMetadata().withAddedDatastream(dataStream));
            return this;
        }
```
{{< /details >}}

## Builder.dataStreamMetadata
#### Code Complexity: 1
### Overview
The function `dataStreamMetadata` returns an object of type DataStreamMetadata. This is retrieved from an internal collection named `customs`, using `DataStreamMetadata.TYPE` as the key. If the key doesn't exist in `customs`, the function returns `DataStreamMetadata.EMPTY`, which is most likely a default or null object of `DataStreamMetadata`.

### User Acceptance Criteria
```gherkin
Feature: Data Stream Metadata Retrieval
 Scenario: Retrieve Metadata Response
 Given a data stream metadata type key
 When the dataStreamMetadata method is invoked
 Then it should return the corresponding data stream metadata object. If the key does not exist, then it should return a default data stream metadata object.
```

### Refactoring
Opportunity 1: Consider handling explicitly the case where the metadata key is not found in `customs`, instead of silently returning a default object. This could help surface issues faster. Suggestion: Refactor the function to throw an exception or log a warning when the key doesn't exist.
Opportunity 2: If `customs` is indeed nullable, refactor the method to handle this and prevent NullPointerExceptions. Suggestion: Use Optional or null checks to handle the situation where `customs` is null.
Opportunity 3: To protect the data integrity of the `customs`, refactor to return a deep copied object or use Immutable collections.{{< details "Function source code " >}}
```java
public DataStreamMetadata dataStreamMetadata() {
            return (DataStreamMetadata) this.customs.getOrDefault(DataStreamMetadata.TYPE, DataStreamMetadata.EMPTY);
        }
```
{{< /details >}}

## Builder.put
#### Code Complexity: 5
### Overview
The 'put' method is part of the 'Metadata' class which is used for handling Elasticsearch metadata. The method is used to update the 'DataStreamMetadata' associated with a given alias name. It first checks if the new 'DataStreamMetadata' is different from the existing one. If they are different, it updates the 'DataStreamMetadata' and returns true. If they are the same, it does not perform any update and returns false.

### User Acceptance Criteria
```gherkin
Feature: DataStreamMetadata Update
 Scenario: Update existing DataStreamMetadata
 Given the alias name and new DataStreamMetadata
 When a 'put' request is made for the alias name
 Then the existing DataStreamMetadata should be updated with the new one and return true 

Scenario: New and existing DataStreamMetadata are the same
 Given the alias name and new DataStreamMetadata
 When a 'put' request is made for the alias name and the new and existing DataStreamMetadata are the same
 Then no update operation should be performed and it should return false.
```

### Refactoring
Consider taking the following steps to improve the method: 1. Add null checks to handle scenarios when parameters are null. 2. Use proper synchronization techniques to handle concurrency issues when modifying the 'DataStreamMetadata'. 3. Instead of returning a boolean, it might be better to throw an exception when the method fails to update the 'DataStreamMetadata'. This would make it easier for the caller of the method to handle failure scenarios.{{< details "Function source code " >}}
```java
public boolean put(String aliasName, String dataStream, Boolean isWriteDataStream, String filter) {
            previousIndicesLookup = null;
            final DataStreamMetadata existing = dataStreamMetadata();
            final DataStreamMetadata updated = existing.withAlias(aliasName, dataStream, isWriteDataStream, filter);
            if (existing == updated) {
                return false;
            }
            this.customs.put(DataStreamMetadata.TYPE, updated);
            return true;
        }
```
{{< /details >}}

## Builder.removeDataStream
#### Code Complexity: 1
### Overview
The 'removeDataStream' function is a public non-static method in the Builder class. It removes a specified DataStream from the DataStreamMetadata of Builder. The method accepts a single parameter 'name', which is expected to be a string - the name of the DataStream to be removed. It sets the 'previousIndicesLookup' attribute to 'null' and updates the 'customs' map by calling the 'withRemovedDataStream' method of the 'dataStreamMetadata()' and passing the 'name' parameter to it.

### User Acceptance Criteria
```gherkin
Feature: Data Stream removal from Builder
 Scenario: Valid Data Stream name input
 Given the Builder has a DataStream with the given name
 When the 'removeDataStream' method is called with this name
 Then the respective DataStream should be removed from the 'customs' map of the builder
```

### Refactoring
To enhance error handling and avoid potential bugs, it could be beneficial to include a check that verifies whether a DataStream with the provided name exists in the customs map before attempting to remove it. If the check fails, an appropriate exception should be thrown. Additionally, it would be advisable to understand and manage the implications of setting 'previousIndicesLookup' to null in every invocation of this function, and to avoid resetting this variable if not necessary.{{< details "Function source code " >}}
```java
public Builder removeDataStream(String name) {
            previousIndicesLookup = null;
            this.customs.put(DataStreamMetadata.TYPE, dataStreamMetadata().withRemovedDataStream(name));
            return this;
        }
```
{{< /details >}}

## Builder.removeDataStreamAlias
#### Code Complexity: 6
### Overview
This function is a part of the DataStreamMetadata component and is used for removing an alias from a specific data stream. An alias in this context represents a symbol or name that signifies a specific data stream. The function accepts three parameters: aliasName (of the alias that needs to be removed), dataStreamName (from which the alias needs to be removed), and mustExist (a boolean variable to check if the alias must exist in the data stream prior to removal). If the aliasName and dataStreamName exist and are successfully removed, the function updates the DataStreamMetadata and returns true. If there's no change in the DataStreamMetadata after attempting to remove the alias, the function returns false.

### User Acceptance Criteria
```gherkin
Feature: Removal of DataStream alias
Scenario: Valid Removal of Alias from a DataStream
Given the alias and datastream are part of the DataStreamMetadata
When the function 'removeDataStreamAlias' is executed with parameters aliasName, dataStreamName, and mustExist
Then it should either remove the alias and return true if successful, or if not successful due to no existing map between aliasName and dataStreamName, should return false.
```

### Refactoring
The '==' operator, which currently compares the existing and updated DataStreamMetadata, could be replaced by a method that compares each relevant attribute of the DataStreamMetadata object individually, thereby providing a more reliable comparison. Moreover, incorporating additional error-handling code could prevent unexpected behavior in the case of exceptions. For instance, we could wrap the call to 'withRemovedAlias()' within a try-catch block and return an appropriate error message if an exception is thrown. Finally, introducing an explicit existence check for the alias and the data stream before trying to delete could make the code more robust.{{< details "Function source code " >}}
```java
public boolean removeDataStreamAlias(String aliasName, String dataStreamName, boolean mustExist) {
            previousIndicesLookup = null;

            final DataStreamMetadata existing = dataStreamMetadata();
            final DataStreamMetadata updated = existing.withRemovedAlias(aliasName, dataStreamName, mustExist);
            if (existing == updated) {
                return false;
            }
            this.customs.put(DataStreamMetadata.TYPE, updated);
            return true;
        }
```
{{< /details >}}

## Builder.getCustom
#### Code Complexity: 1
### Overview
This function is a simple getter method for a class. It accepts a string as an argument, expected to be a 'type' of a custom. It then retrieves a Custom object from a 'customs' collection using the provided 'type' as the key.

### Refactoring
Opportunities to refactor this code could include adding error handling for scenarios where the 'customs' collection is null or the 'type' does not exist in the collection. This could prevent potential runtime exceptions and ensure that the function behaves as expected even during edge cases.{{< details "Function source code " >}}
```java
public Custom getCustom(String type) {
            return customs.get(type);
        }
```
{{< /details >}}

## Builder.putCustom
#### Code Complexity: 1
### Overview
This code is a part of a Builder class and contains the method 'putCustom'. This method accepts two parameters - 'type', which is a string identifier, and 'custom', which is an instance of the 'Custom' class. The method first uses the 'Objects.requireNonNull()' function to validate that the 'custom' object is not null before it's stored in 'customs' map under the key of 'type'. The method then returns 'this', which references the current instance of the Builder, allowing for method chaining.

### User Acceptance Criteria
```gherkin
Feature: Storing customized types.
 Scenario: Add a valid custom object with a specific type.
 Given a builder instance
 When the 'putCustom' method is invoked with a valid type and custom object
 Then the custom object is stored in the 'customs' map against the provided type
 And the method returns the current builder instance.
```

### Refactoring
Opportunity 1: With respect to method-naming standards, rename 'putCustom()' to something more descriptive. For instance, 'addCustomWithType()' might be clearer.
 Opportunity 2: Add a condition to check for duplicate 'type' in 'customs' and possibly throw a Custom Exception or log a warning, to avoid overwriting data.
 Opportunity 3: Rather than throwing a NullPointerException directly, consider implementing a validation process to handle null 'custom' value and throw a more specific, user-friendly exception.{{< details "Function source code " >}}
```java
public Builder putCustom(String type, Custom custom) {
            customs.put(type, Objects.requireNonNull(custom, type));
            return this;
        }
```
{{< /details >}}

## Builder.removeCustom
#### Code Complexity: 1
### Overview
This code is a part of the Builder design pattern, specifically, it's a method inside the Builder class. This method named 'removeCustom' takes a string input 'type' and removes an element of the matched type from 'customs' (presumably a collection of custom elements). After performing the removal operation, the method returns the current Builder object, thus allowing for method chaining.

### User Acceptance Criteria
```gherkin
Feature: Custom Element Removal from Builder.
 Scenario: Valid Removal of Custom Element.
 Given a builder with an existing custom element of certain 'type'
 When the 'removeCustom' method is called with this 'type' as argument
 Then this particular custom element is removed from the builder's collection of custom elements
```

### Refactoring
At first glance, the method seems properly implemented according to the Builder design pattern. However, for better maintainability, the following changes could still be made: 1. Checking the validation of the 'type' argument at the start of the method. 2. Adding appropriate error handling mechanisms to handle cases, such as when 'customs' is null or the 'type' does not match any elements in the collection. 3. If applicable, consider making the 'customs' collection thread-safe.{{< details "Function source code " >}}
```java
public Builder removeCustom(String type) {
            customs.remove(type);
            return this;
        }
```
{{< /details >}}

## Builder.removeCustomIf
#### Code Complexity: 1
### Overview
The function provided is part of a Builder class in Java. It's a public method named removeCustomIf which accepts a BiPredicate parameter, p. It invokes removeAll method for the member variable 'customs', using the provided predicate p as a filter to remove elements. After that, it returns the current instance of the Builder for method chaining.

### User Acceptance Criteria
```gherkin
Feature: Remove Custom Objects from the Builder
 Scenario: BiPredicate is applied to remove selected custom objects
 Given a builder with custom objects
 When the removeCustomIf method is called with a specific BiPredicate
 Then all custom objects that match this predicate are removed from the builder
```

### Refactoring
Opportunity 1: To prevent an occurrence of NullPointerException, an assertion can be added to check if the predicate p is not null before calling removeAll. Suggestion: Incorporate a null check before calling the removeAll method. 
Opportunity 2: It can be refactored to use Iterator.remove() method to safely avoid the ConcurrentModificationException.{{< details "Function source code " >}}
```java
public Builder removeCustomIf(BiPredicate<String, Custom> p) {
            customs.removeAll(p);
            return this;
        }
```
{{< /details >}}

## Builder.customs
#### Code Complexity: 1
### Overview
This method is a part of a Builder in a Builder pattern. It allows adding of custom objects to be associated with the object being built. It takes a map of string keys and 'Custom' object values. For each entry in the map, it checks if the value is non-null using 'Objects.requireNonNull' method, providing the key as the exception message if the value is null. If the value is non-null, it adds the entry to the existing 'customs' map in the Builder. Finally, it returns the Builder itself allowing for fluent API style.

### User Acceptance Criteria
```gherkin
Feature: Builder Pattern for constructing complex object
Scenario: Add custom objects to the building object using Builder
Given an initialized Builder object
When the 'customs' method is invoked with a valid Map of String keys and Custom object values
Then each key-value is added to the existing 'customs' map in the Builder
And the Builder object is returned
```

### Refactoring
Opportunity 1: Null-check for the input map should be added prior to invoking 'forEach' to prevent Null pointer exception. Opportunity 2: You could consider preventing overwrites of existing entries in the 'customs' map, unless that's intended behaviour. You can achieve this by checking if the key already exists in the map before adding. Opportunity 3: Consider breaking this method into smaller methods, each having single responsibility as per SRP (Single Responsibility Principle).{{< details "Function source code " >}}
```java
public Builder customs(Map<String, Custom> customs) {
            customs.forEach((key, value) -> Objects.requireNonNull(value, key));
            this.customs.putAllFromMap(customs);
            return this;
        }
```
{{< /details >}}

## Builder.put
#### Code Complexity: 1
### Overview
The provided code snippet is a part of the Builder design pattern in Java. The Builder class has a `put` method which takes a map of ReservedStateMetadata and adds it to the instance variable `reservedStateMetadata` of the class. The method then returns the current instance (`this`) of Builder.

### User Acceptance Criteria
```gherkin
Feature: Put Method in Builder]
 Scenario: Valid Addition of ReservedStateMetadata Map
 Given a Builder instance with existing ReservedStateMetadata Map
 When a new Map of ReservedStateMetadata is put through 'put' method
 Then the existing map should be updated with new ReservedStateMetadata.
```

### Refactoring
A null-check can be added before the call to `putAll` method to avoid NullPointerException risk. It would be better to use the Map's `putAll` method only after ensuring that the input `reservedStateMetadata` is not null. This would prevent potential application crash scenarios.{{< details "Function source code " >}}
```java
public Builder put(Map<String, ReservedStateMetadata> reservedStateMetadata) {
            this.reservedStateMetadata.putAll(reservedStateMetadata);
            return this;
        }
```
{{< /details >}}

## Builder.put
#### Code Complexity: 1
### Overview
This is a builder pattern method which accepts a 'ReservedStateMetadata' object as an argument. Once invoked, it uses the 'namespace' property of that object as a key to store the 'ReservedStateMetadata' object into a local 'reservedStateMetadata' HashMap. Finally, it returns the same builder object, allowing for chaining of method calls.

### User Acceptance Criteria
```gherkin
Feature: Storing ReservedStateMetadata in the Builder
Scenario: Adding a valid ReservedStateMetadata
Given a ReservedStateMetadata object with a valid namespace value
When the Builder's put() method is invoked with this object
Then the ReservedStateMetadata should be added to the reservedStateMetadata HashMap using its namespace as the key
```

### Refactoring
A few approaches can be adopted to handle issues mentioned. To handle duplicate keys, the program should either disallow such entries or handle them appropriately (may be by holding a list of objects under the same key). As for null namespaces, validating the 'namespace' property before trying to add it to the HashMap would be a good approach. Also, adding appropriate error handling and maybe specific exception classes for different types of errors would make it easier to track issues.{{< details "Function source code " >}}
```java
public Builder put(ReservedStateMetadata metadata) {
            reservedStateMetadata.put(metadata.namespace(), metadata);
            return this;
        }
```
{{< /details >}}

## Builder.removeReservedState
#### Code Complexity: 1
### Overview
The given code snippet is a method named 'removeReservedState' inside a public Builder class. This method takes in a parameter of type ReservedStateMetadata and removes the corresponding 'metadata' from 'reservedStateMetadata' using the 'namespace()' method for identifying the entry. The method then returns the instance of the current Builder (hence, this is a fluent method design).

### User Acceptance Criteria
```gherkin
Feature: Remove reserved state from metadata
Scenario: Valid Removal of ReservedStateMetadata
Given the builder is initialized and a valid ReservedStateMetadata instance is available
When an attempt is made to remove ReservedStateMetadata
Then the corresponding metadata entry should be removed from the 'reservedStateMetadata'
```

### Refactoring
Opportunity 1: We can add null checks to avoid potential NullPointerExceptions. If the application must support multi-threading, we can also consider using 'ConcurrentHashMap' for 'reservedStateMetadata' to ensure thread safety. Opportunity 2: To improve readablility, we can extract the 'metadata.namespace()' expression into a separate variable before the 'remove' operation.{{< details "Function source code " >}}
```java
public Builder removeReservedState(ReservedStateMetadata metadata) {
            reservedStateMetadata.remove(metadata.namespace());
            return this;
        }
```
{{< /details >}}

## Builder.indexGraveyard
#### Code Complexity: 1
### Overview
This function named 'indexGraveyard' is a public method on a Builder class instance. It takes IndexGraveyard instance as parameter and puts it into a map with its type being the key, replacing any previous entry with the same key. The function returns the Builder class instance allowing chaining of method calls.

### User Acceptance Criteria
```gherkin
Feature: Updating IndexGraveyard Collection of Builder Class
 Scenario: Successful Addition of an IndexGraveyard Object
 Given an instance of the Builder class 
When the 'indexGraveyard' method is called with a IndexGraveyard object 
Then it should add the object with its type as a key 
And return the same Builder instance
```

### Refactoring
Suggestion 1: The method could benefit from adding checks for null parameters, as well method level comments for better understanding of its functionality. 
Suggestion 2: For better encapsulation, consider making this method private or protected if it's not intended for use outside the owning class.{{< details "Function source code " >}}
```java
public Builder indexGraveyard(final IndexGraveyard indexGraveyard) {
            putCustom(IndexGraveyard.TYPE, indexGraveyard);
            return this;
        }
```
{{< /details >}}

## Builder.indexGraveyard
#### Code Complexity: 1
### Overview
This public member function, indexGraveyard(), returns an object of the type IndexGraveyard. It is a method used to encapsulate the internal representation of an IndexGraveyard in the class. It demonstrates the technique of casting in Java, where the function getCustom() returns an object and it is then type casted to IndexGraveyard.

### User Acceptance Criteria
```gherkin
Feature: Index Retrieval Function
Scenario: Retrieval of IndexGraveyard
Given an object is available
When the indexGraveyard method is invoked
Then it should return an object of type IndexGraveyard
```

### Refactoring
Opportunity 1: One could add appropriate exception handling to the code to cope with potential ClassCastExceptions. Suggestion: Include a try-catch block to handle ClassCastException, providing a more controlled error handling process.
Opportunity 2: Instead of using type casting directly, use instanceof operator to verify that the object being returned by getCustom(IndexGraveyard.TYPE) is actually of IndexGraveyard type before type casting it.{{< details "Function source code " >}}
```java
public IndexGraveyard indexGraveyard() {
            return (IndexGraveyard) getCustom(IndexGraveyard.TYPE);
        }
```
{{< /details >}}

## Builder.updateSettings
#### Code Complexity: 10
### Overview
This method updates the settings of specified indices. If no indices are specified, it updates the settings for all indices. It retrieves the metadata for each index, and if none exists an IndexNotFoundException is thrown. It then creates a new version for the metadata (since a new version is required when updating settings), and replaces the old metadata with the new one in the collection of indices. The method is part of a Builder design pattern which allows for fluent API.

### User Acceptance Criteria
```gherkin
Feature: Update Index Settings 
Scenario: Update specified indices 
Given valid index settings and indices
When the updateSettings method is invoked
Then the settings of specified indices should be updated, and a new version of index metadata is created 
Scenario: Update all indices 
Given valid index settings and no indices specified
When the updateSettings method is invoked
Then the settings of all indices should be updated, and a new version of index metadata created for each.
```

### Refactoring
Opportunity 1: To make the code more robust, you could add null-checks or use java.util.Optional for both the settings and indices parameters. 
Opportunity 2: Since the method retrieves metadata for each index even if it throws an exception right after, it would be better to first check the existence of each index, and then process those that exist. This could save some unnecessary operations, and improve performance.{{< details "Function source code " >}}
```java
public Builder updateSettings(Settings settings, String... indices) {
            if (indices == null || indices.length == 0) {
                indices = this.indices.keys().toArray(new String[0]);
            }
            for (String index : indices) {
                IndexMetadata indexMetadata = this.indices.get(index);
                if (indexMetadata == null) {
                    throw new IndexNotFoundException(index);
                }
                // Updating version is required when updating settings.
                // Otherwise, settings changes may not be replicated to remote clusters.
                long newVersion = indexMetadata.getSettingsVersion() + 1;
                put(
                    IndexMetadata.builder(indexMetadata)
                        .settings(Settings.builder().put(indexMetadata.getSettings()).put(settings))
                        .settingsVersion(newVersion)
                );
            }
            return this;
        }
```
{{< /details >}}

## Builder.updateNumberOfReplicas
#### Code Complexity: 5
### Overview
This function is part of a Builder class for index metadata, and takes a number (number of replicas) and an array of strings (indices). For each index in the input array, it retrieves the index metadata from the instance's indices Map, and throws an 'IndexNotFoundException' if there's no such key in the Map. It then uses another Builder to recreate the index metadata with the new number of replicas and replaces it in the Map. Lastly, it returns the Builder instance for chaining.

### User Acceptance Criteria
```gherkin
Feature: Update Number of Replicas
 Scenario: Valid Index
 Given an existing index
 When the 'updateNumberOfReplicas' is called with a valid number of replicas and array of indices
 Then the number of replicas for each index in the array should be updated without errors
 Scenario: Invalid Index
 Given a non-existent index
 When the 'updateNumberOfReplicas' is called with any number of replicas and this index
 Then an 'IndexNotFoundException' should be thrown
```

### Refactoring
To make the function more robust, a null check before accessing the value of the passed index from the Map could be added. To make the method thread-safe, consider synchronizing access to the 'indices' Map or using a concurrent collection. This will prevent potential inconsistent state when map is accessed concurrently from multiple threads. Also, try to reduce the complexity and improve readability by extracting some parts of the method into separate smaller methods.{{< details "Function source code " >}}
```java
public Builder updateNumberOfReplicas(final int numberOfReplicas, final String[] indices) {
            for (String index : indices) {
                IndexMetadata indexMetadata = this.indices.get(index);
                if (indexMetadata == null) {
                    throw new IndexNotFoundException(index);
                }
                put(IndexMetadata.builder(indexMetadata).numberOfReplicas(numberOfReplicas));
            }
            return this;
        }
```
{{< /details >}}

## Builder.coordinationMetadata
#### Code Complexity: 1
### Overview
The given code is a method inside a Builder pattern class in Java. It takes an instance of CoordinationMetadata class as an argument and assigns it to the 'coordinationMetadata' attribute of the class. The function then returns the current instance ('this') of the Builder, allowing method chaining for initializing the fields of the object being constructed via the Builder pattern.

### User Acceptance Criteria
```gherkin
This function is a setter method within a Builder pattern and is not directly related to application's functionality or business logic and hence no Gherkin scenarios are required.
```

### Refactoring
One possible refactoring opportunity can be to perform nullity check for the CoordinationMetadata object that is passed as parameter. If the object is null, the method can either throw a user friendly exception or assign a default CoordinationMetadata object to avoid potential NullPointerExceptions in the future.{{< details "Function source code " >}}
```java
public Builder coordinationMetadata(CoordinationMetadata coordinationMetadata) {
            this.coordinationMetadata = coordinationMetadata;
            return this;
        }
```
{{< /details >}}

## Builder.transientSettings
#### Code Complexity: 1
### Overview
The function transientSettings() is a public getter method in its class. It returns the instance's transientSettings of type Settings.

### Refactoring
Given that this is a straightforward getter method, there doesn't appear to be any refactoring opportunities at a cursory glance. However, depending on the overall context and usage of this method, improvements might be possible in the class design.{{< details "Function source code " >}}
```java
public Settings transientSettings() {
            return this.transientSettings;
        }
```
{{< /details >}}

## Builder.transientSettings
#### Code Complexity: 1
### Overview
This method is part of a Builder class pattern in Java and its purpose is to set transient settings for a Builder object. Transient settings are settings that don't persist beyond the lifetime of the object being built. The method takes a 'Settings' object as an input parameter and assigns it to the 'transientSettings' instance variable of the Builder. It then returns the Builder instance itself, making the method call chainable which is typical in builder pattern.

### User Acceptance Criteria
```gherkin
Feature: Set Transient Settings of Builder
Scenario: Valid Settings passed
Given an instance of builder is available
When the method 'transientSettings' is called with a valid 'Settings' object
Then transient settings of the builder object should be set with the provided 'Settings' object
 And the instance of the Builder itself should be returned
```

### Refactoring
Option 1: To avoid the risk of having mutable 'Settings' objects, you can create a defensive copy of the 'Settings' object before assigning it to 'transientSettings'.
Option 2: To avoid Null Pointer Exceptions, add a null check and throw IllegalArgumentException when a null 'settings' object is passed. Both options can make the code more robust and fault tolerant.{{< details "Function source code " >}}
```java
public Builder transientSettings(Settings settings) {
            this.transientSettings = settings;
            return this;
        }
```
{{< /details >}}

## Builder.persistentSettings
#### Code Complexity: 1
### Overview
This is a public getter method named 'persistentSettings' within a class. Its function is to return the value of the 'persistentSettings' variable of 'Settings' data type. It does not take any arguments and does not modify any internal state values.

### Refactoring
The method is clear and concise following the single responsibility principle well. No apparent refactoring opportunity at this level. However, as a general software practice, if 'persistentSettings' is a complex mutable object, consider returning a deep copy of 'persistentSettings', or an immutable wrapper over it, to preserve encapsulation.{{< details "Function source code " >}}
```java
public Settings persistentSettings() {
            return this.persistentSettings;
        }
```
{{< /details >}}

## Builder.persistentSettings
#### Code Complexity: 1
### Overview
This piece of code is a setter method in a Builder class. It sets the value of 'persistentSettings' to the 'Settings' object provided as a parameter. A reference to 'this', or the current Builder object, is returned after the assignment, allowing for function chaining.

### User Acceptance Criteria
```gherkin
This method does not meet the criteria for Gherkin User Acceptance as it is a setter method and does not perform any behaviour.
```

### Refactoring
As of now, this method is a clean and simple setter method, following standard coding practices. If validations or sanitizations are necessary for 'Settings', those could be implemented. Otherwise, no other refactoring seems necessary.{{< details "Function source code " >}}
```java
public Builder persistentSettings(Settings settings) {
            this.persistentSettings = settings;
            return this;
        }
```
{{< /details >}}

## Builder.hashesOfConsistentSettings
#### Code Complexity: 1
### Overview
This code snippet is a builder function in a Builder Pattern. The function is designed to set the value of 'hashesOfConsistentSettings', which is of type 'DiffableStringMap', within the class this builder is constructing. After setting, it returns the builder instance itself, allowing for fluent API style, where multiple builder method calls can be chained together.

### User Acceptance Criteria
```gherkin
Feature: Build with Consistent Settings Hashes
 Scenario: Build with valid DiffableStringMap
 Given a builder instance
 When 'hashesOfConsistentSettings' method is called with a valid DiffableStringMap
 Then the 'hashesOfConsistentSettings' of the builder instance should update to the provided value, allowing further chaining of builder methods.
```

### Refactoring
Consider validating the 'hashesOfConsistentSettings' input parameter before assigning it to the instance. This can prevent consequent invalid operations. Also, if 'DiffableStringMap' is mutable and passed around in other places, consider using immutable types or defensively creating a copy before assigning to prevent potential bugs due to mutability issue.{{< details "Function source code " >}}
```java
public Builder hashesOfConsistentSettings(DiffableStringMap hashesOfConsistentSettings) {
            this.hashesOfConsistentSettings = hashesOfConsistentSettings;
            return this;
        }
```
{{< /details >}}

## Builder.hashesOfConsistentSettings
#### Code Complexity: 1
### Overview
This code is a part of a Builder pattern and represents a setter method used for the 'hashesOfConsistentSettings' property. The method takes a map (hashMap) of string type key-value pairs and creates a new instance of a DiffableStringMap class with the provided hashMap before assigning it to the 'hashesOfConsistentSettings' property.

### User Acceptance Criteria
```gherkin
Feature: Setting Hashes of Consistent Settings
Scenario: Valid string hashmap provided
Given a Builder is already initialized
When the hashesOfConsistentSettings method is called with a valid string hashmap
Then a new instance of DiffableStringMap with the provided hashmap should be assigned to the hashesOfConsistentSettings property
```

### Refactoring
Opportunity 1: Add null check and/or validation method for input hashmap to handle potential exceptions.
Opportunity 2: Instead of directly creating a DiffableStringMap instance inside the method, consider Dependency Injection or Factory Pattern for creating instances of DiffableStringMap. This will improve the testability and loosely coupling of the code.{{< details "Function source code " >}}
```java
public Builder hashesOfConsistentSettings(Map<String, String> hashesOfConsistentSettings) {
            this.hashesOfConsistentSettings = new DiffableStringMap(hashesOfConsistentSettings);
            return this;
        }
```
{{< /details >}}

## Builder.version
#### Code Complexity: 1
### Overview
The function 'version' is a method defined within a Builder class. It accepts a long integer 'version' as an input parameter. The purpose of this function is to set the 'version' property of the Builder instance. After assigning the input 'version' to the instance's 'version', the method returns the instance of the Builder itself to allow for method chaining.

### User Acceptance Criteria
```gherkin
Feature: Set Version in Builder Class
Scenario: Valid Version is Provided
Given an instance of the Builder class
When the 'version' method is invoked with a valid long integer
Then the 'version' attribute of the Builder instance should be set with provided value.
```

### Refactoring
The code is simple and clean, there seem to be no immediate code smells that call for refactoring. However, adding validity checks for the input parameters could be considered a prudent measure if there are known constraints on what 'version' values are considered valid.{{< details "Function source code " >}}
```java
public Builder version(long version) {
            this.version = version;
            return this;
        }
```
{{< /details >}}

## Builder.clusterUUID
#### Code Complexity: 1
### Overview
This is a simple 'Builder' method in the Builder design pattern that sets the 'clusterUUID' field of the object it's building and then returns the builder itself. It helps facilitate fluent API design for object creation and eliminates the need for multiple setter methods.

### Refactoring
Opportunity 1: Add validation check for input 'clusterUUID'. For instance, if 'clusterUUID' should be of a specific format, validate for this format before setting the value. Throw an IllegalArgumentException if the validation fails.{{< details "Function source code " >}}
```java
public Builder clusterUUID(String clusterUUID) {
            this.clusterUUID = clusterUUID;
            return this;
        }
```
{{< /details >}}

## Builder.clusterUUIDCommitted
#### Code Complexity: 1
### Overview
The function 'clusterUUIDCommitted' is a Builder design pattern in Java, where this function is used to set the value of 'clusterUUIDCommitted' field of the Builder object. The function takes a boolean parameter, sets the 'clusterUUIDCommitted' property of the current builder object to that value, and then returns the current builder object. The main purpose of this function is to provide a way to configure the 'clusterUUIDCommitted' property while creating an object using the Builder pattern.

### User Acceptance Criteria
```gherkin
Feature: Set cluster UUID committed status
Scenario: Valid setting of cluster UUID committed status on Builder object
Given a Builder object
When 'clusterUUIDCommitted' function is called with a boolean parameter
Then the 'clusterUUIDCommitted' property of the Builder object should be set to the parameter value and the Builder object should be returned
```

### Refactoring
No code duplication and SOLID principles violation have been observed in this method. However, if this method exists alone without other Builder methods, it may indicate that the Builder pattern is not being fully utilized. Considering the builder pattern's purpose, it would be beneficial if related configurations can also be placed along with this to ensure maintainability and effective readability of the code.{{< details "Function source code " >}}
```java
public Builder clusterUUIDCommitted(boolean clusterUUIDCommitted) {
            this.clusterUUIDCommitted = clusterUUIDCommitted;
            return this;
        }
```
{{< /details >}}

## Builder.generateClusterUuidIfNeeded
#### Code Complexity: 5
### Overview
The 'generateClusterUuidIfNeeded' method is part of a 'Builder' class and its main functionality is generating a cluster UUID only if it has not been generated before. Specifically, if 'clusterUUID' equals 'UNKNOWN_CLUSTER_UUID' initially, it generates a new randomly-generated UUID and assigns it to 'clusterUUID'. Finally, this method returns 'this', which refers to the builder instance, thereby facilitating builder pattern's method chaining.

### User Acceptance Criteria
```gherkin
Feature: Generate Cluster UUID
Scenario: UUID Generation Required
  Given the builder has an attribute 'clusterUUID' with 'UNKNOWN_CLUSTER_UUID' initially
  When 'generateClusterUuidIfNeeded' method is invoked
  Then the builder should generate and assign a random UUID to 'clusterUUID' and return the builder instance.
```

### Refactoring
There's practically no need for refactoring in this small snippet of code. The method's function is simple and clear, adhering to clean code principles. Though, it might be good to add null test for 'clusterUUID' to prevent any potential NullPointerException in future.{{< details "Function source code " >}}
```java
public Builder generateClusterUuidIfNeeded() {
            if (clusterUUID.equals(UNKNOWN_CLUSTER_UUID)) {
                clusterUUID = UUIDs.randomBase64UUID();
            }
            return this;
        }
```
{{< /details >}}

## Builder.build
#### Code Complexity: 1
### Overview
The build() function is a public method that is designed to construct a Metadata object and return it. This particular version of the builder takes no arguments and implicitly passes 'false' to an overloaded version of build().

### User Acceptance Criteria
```gherkin
Feature: Build Metadata Object
 Scenario: Construct Metadata Object
 Given a correctly initialized Builder object
 When this build method is called without any argument
 Then it should return a Metadata object with attributes set according to default or false assumptions.
```

### Refactoring
A refactoring opportunity involves adding inline comments to make it clear that the build() method is hardcoded to pass 'false' as an argument to another method. This would maintain the transparency of its functionality, leading to less confusion for future developers working on the code. Also, considering providing multiple build methods that take explicit parameters can improve the flexibility of your factory or builder code.{{< details "Function source code " >}}
```java
public Metadata build() {
            return build(false);
        }
```
{{< /details >}}

## Builder.build
#### Code Complexity: 65
### Overview
The function 'build' is part of the Metadata class, and is responsible for building metadata related to indices in Elasticsearch. It aggregates metadata related to all indices, open indices, and closed indices. It also validates alias maps, retains mapping hashes in use, checks for name collisions, and asserts the state of data streams. It finally builds 'visible' arrays (arrays for indices that are not hidden), and returns a newly created Metadata instance with all these collected and processed information.

### User Acceptance Criteria
```gherkin
Feature: Metadata Building
 Scenario: Build Metadata with skipNameCollisionChecks Option
 Given the existing metadata and index data of Elasticsearch
 When the 'build' function is requested with the 'skipNameCollisionChecks' option
 Then it should gather metadata of all indices, open indices, and closed indices
 And it validates maps of aliased indices, retains mapping hashes in use, compounds visible indices arrays
 And it should return a new Metadata object with the collected and processed data, while skipping name collision checks if the option is set true.
```

### Refactoring
The function contains several TODO comments indicating areas for improvement. As the comments suggest, moving certain data structures to IndexNameExpressionResolver could reduce the need for rebuilding these structures during serialization and allow for updating instead of rebuilding aliasAndIndexLookup. Additionally, the section of the code that creates array forms of visible indices, open indices, and closed indices could potentially be refactored into a separate function for brevity and readability. It would be beneficial to add error handling, especially for handling potential issues around aliasedIndices and indicesMap.{{< details "Function source code " >}}
```java
public Metadata build(boolean skipNameCollisionChecks) {
            // TODO: We should move these datastructures to IndexNameExpressionResolver, this will give the following benefits:
            // 1) The datastructures will be rebuilt only when needed. Now during serializing we rebuild these datastructures
            // while these datastructures aren't even used.
            // 2) The aliasAndIndexLookup can be updated instead of rebuilding it all the time.
            final List<String> visibleIndices = new ArrayList<>();
            final List<String> allOpenIndices = new ArrayList<>();
            final List<String> visibleOpenIndices = new ArrayList<>();
            final List<String> allClosedIndices = new ArrayList<>();
            final List<String> visibleClosedIndices = new ArrayList<>();
            final ImmutableOpenMap<String, IndexMetadata> indicesMap = indices.build();

            int oldestIndexVersionId = IndexVersion.CURRENT.id();
            int totalNumberOfShards = 0;
            int totalOpenIndexShards = 0;

            final String[] allIndicesArray = new String[indicesMap.size()];
            int i = 0;
            final Set<String> sha256HashesInUse = checkForUnusedMappings ? Sets.newHashSetWithExpectedSize(mappingsByHash.size()) : null;
            for (var entry : indicesMap.entrySet()) {
                allIndicesArray[i++] = entry.getKey();
                final IndexMetadata indexMetadata = entry.getValue();
                totalNumberOfShards += indexMetadata.getTotalNumberOfShards();
                final String name = indexMetadata.getIndex().getName();
                final boolean visible = indexMetadata.isHidden() == false;
                if (visible) {
                    visibleIndices.add(name);
                }
                if (indexMetadata.getState() == IndexMetadata.State.OPEN) {
                    totalOpenIndexShards += indexMetadata.getTotalNumberOfShards();
                    allOpenIndices.add(name);
                    if (visible) {
                        visibleOpenIndices.add(name);
                    }
                } else if (indexMetadata.getState() == IndexMetadata.State.CLOSE) {
                    allClosedIndices.add(name);
                    if (visible) {
                        visibleClosedIndices.add(name);
                    }
                }
                oldestIndexVersionId = Math.min(oldestIndexVersionId, indexMetadata.getCompatibilityVersion().id);
                if (sha256HashesInUse != null) {
                    final var mapping = indexMetadata.mapping();
                    if (mapping != null) {
                        sha256HashesInUse.add(mapping.getSha256());
                    }
                }
            }

            var aliasedIndices = this.aliasedIndices.build();
            for (var entry : aliasedIndices.entrySet()) {
                List<IndexMetadata> aliasIndices = entry.getValue().stream().map(idx -> indicesMap.get(idx.getName())).toList();
                validateAlias(entry.getKey(), aliasIndices);
            }
            SortedMap<String, IndexAbstraction> indicesLookup = null;
            if (previousIndicesLookup != null) {
                // no changes to the names of indices, datastreams, and their aliases so we can reuse the previous lookup
                assert previousIndicesLookup.equals(buildIndicesLookup(dataStreamMetadata(), indicesMap));
                indicesLookup = previousIndicesLookup;
            } else if (skipNameCollisionChecks == false) {
                // we have changes to the the entity names so we ensure we have no naming collisions
                ensureNoNameCollisions(aliasedIndices.keySet(), indicesMap, dataStreamMetadata());
            }
            assert assertDataStreams(indicesMap, dataStreamMetadata());

            if (sha256HashesInUse != null) {
                mappingsByHash.keySet().retainAll(sha256HashesInUse);
            }

            // build all concrete indices arrays:
            // TODO: I think we can remove these arrays. it isn't worth the effort, for operations on all indices.
            // When doing an operation across all indices, most of the time is spent on actually going to all shards and
            // do the required operations, the bottleneck isn't resolving expressions into concrete indices.
            String[] visibleIndicesArray = visibleIndices.toArray(Strings.EMPTY_ARRAY);
            String[] allOpenIndicesArray = allOpenIndices.toArray(Strings.EMPTY_ARRAY);
            String[] visibleOpenIndicesArray = visibleOpenIndices.toArray(Strings.EMPTY_ARRAY);
            String[] allClosedIndicesArray = allClosedIndices.toArray(Strings.EMPTY_ARRAY);
            String[] visibleClosedIndicesArray = visibleClosedIndices.toArray(Strings.EMPTY_ARRAY);

            return new Metadata(
                clusterUUID,
                clusterUUIDCommitted,
                version,
                coordinationMetadata,
                transientSettings,
                persistentSettings,
                Settings.builder().put(persistentSettings).put(transientSettings).build(),
                hashesOfConsistentSettings,
                totalNumberOfShards,
                totalOpenIndexShards,
                indicesMap,
                aliasedIndices,
                templates.build(),
                customs.build(),
                allIndicesArray,
                visibleIndicesArray,
                allOpenIndicesArray,
                visibleOpenIndicesArray,
                allClosedIndicesArray,
                visibleClosedIndicesArray,
                indicesLookup,
                Collections.unmodifiableMap(mappingsByHash),
                IndexVersion.fromId(oldestIndexVersionId),
                Collections.unmodifiableMap(reservedStateMetadata)
            );
        }
```
{{< /details >}}

## Builder.ensureNoNameCollisions
#### Code Complexity: 38
### Overview
The function 'ensureNoNameCollisions' checks for name collisions among indices, indices aliases and data streams aliases within a data stream metadata. It accepts 3 arguments, 'indexAliases' (a set of index alias names), 'indicesMap' (a mapping of index names as keys with their respective metadata as values), and 'dataStreamMetadata' (metadata about the data streams). The function first builds up a list of duplicate names from different sources. Then, it checks for indices or data stream aliases with the same names. If duplicates are found, an exception is thrown. It makes use of helper methods 'collectAliasDuplicates' for collecting duplicate names and validates for ensuring unique names across index, alias, and data stream.

### User Acceptance Criteria
```gherkin
Feature: Ensure No Name Collisions
Scenario: No Name Collision
Given a collection of index aliases, a map of indices and a data stream metadata
When the ensureNoNameCollisions method is invoked
Then it should not find any duplicates

Scenario: Name collision detected
Given a collection of index aliases, a map of indices and a data stream metadata
When the ensureNoNameCollisions method is invoked
Then it should throw an IllegalStateException if same name occurs in any of the provided data structures
```

### Refactoring
The function violates the SOLID principle of Single Responsibility by controlling detection of name collisions across multiple entities. Instead, this could be refactored into separate methods for handling each type of name collision. Furthermore, instead of combining the logic of the duplicate check and the throwing of the exception in the same function, these can be separated for better error handling.{{< details "Function source code " >}}
```java
private static void ensureNoNameCollisions(
            Set<String> indexAliases,
            ImmutableOpenMap<String, IndexMetadata> indicesMap,
            DataStreamMetadata dataStreamMetadata
        ) {
            final ArrayList<String> duplicates = new ArrayList<>();
            final Set<String> aliasDuplicatesWithIndices = new HashSet<>();
            final Set<String> aliasDuplicatesWithDataStreams = new HashSet<>();
            final var allDataStreams = dataStreamMetadata.dataStreams();
            // Adding data stream aliases:
            for (String dataStreamAlias : dataStreamMetadata.getDataStreamAliases().keySet()) {
                if (indexAliases.contains(dataStreamAlias)) {
                    duplicates.add("data stream alias and indices alias have the same name (" + dataStreamAlias + ")");
                }
                if (indicesMap.containsKey(dataStreamAlias)) {
                    aliasDuplicatesWithIndices.add(dataStreamAlias);
                }
                if (allDataStreams.containsKey(dataStreamAlias)) {
                    aliasDuplicatesWithDataStreams.add(dataStreamAlias);
                }
            }
            for (String alias : indexAliases) {
                if (allDataStreams.containsKey(alias)) {
                    aliasDuplicatesWithDataStreams.add(alias);
                }
                if (indicesMap.containsKey(alias)) {
                    aliasDuplicatesWithIndices.add(alias);
                }
            }
            allDataStreams.forEach((key, value) -> {
                if (indicesMap.containsKey(key)) {
                    duplicates.add("data stream [" + key + "] conflicts with index");
                }
            });
            if (aliasDuplicatesWithIndices.isEmpty() == false) {
                collectAliasDuplicates(indicesMap, aliasDuplicatesWithIndices, duplicates);
            }
            if (aliasDuplicatesWithDataStreams.isEmpty() == false) {
                collectAliasDuplicates(indicesMap, dataStreamMetadata, aliasDuplicatesWithDataStreams, duplicates);
            }
            if (duplicates.isEmpty() == false) {
                throw new IllegalStateException(
                    "index, alias, and data stream names need to be unique, but the following duplicates "
                        + "were found ["
                        + Strings.collectionToCommaDelimitedString(duplicates)
                        + "]"
                );
            }
        }
```
{{< /details >}}

## Builder.collectAliasDuplicates
#### Code Complexity: 10
### Overview
This function is intended to check for duplicate aliases between indices and data streams as well as within the data streams themselves in Elasticsearch. Aliases provide a way to abstract the relationship of one or more indices and/or data streams and can be queried as a single entity. However, having duplicate aliases between indices and data streams, or within data streams, can lead to confusion during queries and could cause errors in index or data stream identification. Therefore, the function is designed to detect these duplicates and flag them appropriately.

### User Acceptance Criteria
```gherkin
Feature: Detect Duplicate Aliases
Scenario: Aliases are unique across indices and data streams
Given an Elasticsearch environment with different indices and data streams
When the collectAliasDuplicates function is called
Then it should report any alias that is a duplicate between indices and data streams, as well as any alias that is a duplicate within the data streams themselves.
```

### Refactoring
Refactoring could involve adding exception handling code to ensure that errors do not lead to crashes or invalid results. A hashmap could also be employed to store the aliases and associated indices or data streams, which could provide a more efficient method of finding duplicates. In terms of SOLID principles, the function could be broken down into smaller, single-responsibility methods that could handle different aspects of duplicate detection and reporting.{{< details "Function source code " >}}
```java
private static void collectAliasDuplicates(
            ImmutableOpenMap<String, IndexMetadata> indicesMap,
            DataStreamMetadata dataStreamMetadata,
            Set<String> aliasDuplicatesWithDataStreams,
            ArrayList<String> duplicates
        ) {
            for (String alias : aliasDuplicatesWithDataStreams) {
                // reported var avoids adding a message twice if an index alias has the same name as a data stream.
                boolean reported = false;
                for (IndexMetadata cursor : indicesMap.values()) {
                    if (cursor.getAliases().containsKey(alias)) {
                        duplicates.add(alias + " (alias of " + cursor.getIndex() + ") conflicts with data stream");
                        reported = true;
                    }
                }
                // This is for adding an error message for when a data steam alias has the same name as a data stream.
                if (reported == false && dataStreamMetadata != null && dataStreamMetadata.dataStreams().containsKey(alias)) {
                    duplicates.add("data stream alias and data stream have the same name (" + alias + ")");
                }
            }
        }
```
{{< /details >}}

## Builder.collectAliasDuplicates
#### Code Complexity: 6
### Overview
This function collects all duplicate aliases associated with indices. It iterates over all indices in the provided indicesMap and checks if any of the aliases from aliasDuplicatesWithIndices exists in each index. If a matching alias is found, it is added to the duplicates list with a message stating that the alias conflicts with the index.

### User Acceptance Criteria
```gherkin
Scenario: Duplicate Alias Collection
Given a map of indices, a set of potential duplicate aliases, and an empty list of duplicates
When the collectAliasDuplicates function runs
Then it should check each index's aliases against the potential duplicates
And if a duplicate is found, it should be added to the list with a conflict message.
```

### Refactoring
Opportunity: This code could be optimized by using a Hash-based data structure such as HashSet to check for duplicates, greatly reducing the time complexity. Also, the inclusion of null checks or Optionals could decrease the risk of Null Pointer Exceptions.{{< details "Function source code " >}}
```java
private static void collectAliasDuplicates(
            ImmutableOpenMap<String, IndexMetadata> indicesMap,
            Set<String> aliasDuplicatesWithIndices,
            ArrayList<String> duplicates
        ) {
            for (IndexMetadata cursor : indicesMap.values()) {
                for (String alias : aliasDuplicatesWithIndices) {
                    if (cursor.getAliases().containsKey(alias)) {
                        duplicates.add(alias + " (alias of " + cursor.getIndex() + ") conflicts with index");
                    }
                }
            }
        }
```
{{< /details >}}

## Builder.buildIndicesLookup
#### Code Complexity: 7
### Overview
This function, buildIndicesLookup, is responsible for creating a lookup of Indices against a sorted map. The map will be created using IndexMetadata and DataStreamMetadata provided as parameters. The function first checks if the input is empty. If so, it will return an empty SortedMap. If the input is not empty, it first creates a TreeMap and iterates through all DataStreamAliases. It then adds each DataStream and the indices of each DataStream to the TreeMap. The function repeats this process for each index in the indices lookup. During this iteration, each index's corresponding DataStream is identified, if available. The function also constructs a list of IndexMetadata associated with each alias during this iteration. Once all indices have been processed, the function iterates over the aliasToIndices map, creating an Alias abstraction for every alias and adding this to the indicesLookup map. Finally, the function returns an Unmodifiable SortedMap containing the lookup.

### User Acceptance Criteria
```gherkin
Feature: Building Indices lookup map
Scenario: Create SortedMap of IndexAbstraction
Given valid DataStreamMetadata and ImmutableOpenMap of indices
When the buildIndicesLookup function is invoked
Then a SortedMap of IndexAbstraction should be created linking each index with its corresponding DataStream or Alias.
```

### Refactoring
Some refactoring opportunities include improving error handling and exception management, adding proper logging capabilities, and considering switching to a ConcurrentHashMap for thread safety. The code is currently based on the assumption that the incoming data is correct and consistent, which may not always be the case in a production environment. The addition of proper error handling, boundary case management, and data validation would improve function robustness. Another possible refactoring opportunity would be to consider breaking down this function further into smaller, more manageable functions that align with the Single Responsibility Principle of SOLID principles for better maintainability and understanding of the code.{{< details "Function source code " >}}
```java
static SortedMap<String, IndexAbstraction> buildIndicesLookup(
            DataStreamMetadata dataStreamMetadata,
            ImmutableOpenMap<String, IndexMetadata> indices
        ) {
            if (indices.isEmpty()) {
                return Collections.emptySortedMap();
            }
            SortedMap<String, IndexAbstraction> indicesLookup = new TreeMap<>();
            Map<String, DataStream> indexToDataStreamLookup = new HashMap<>();
            final var dataStreams = dataStreamMetadata.dataStreams();
            for (DataStreamAlias alias : dataStreamMetadata.getDataStreamAliases().values()) {
                IndexAbstraction existing = indicesLookup.put(alias.getName(), makeDsAliasAbstraction(dataStreams, alias));
                assert existing == null : "duplicate data stream alias for " + alias.getName();
            }
            for (DataStream dataStream : dataStreams.values()) {
                assert dataStream.getIndices().isEmpty() == false;

                IndexAbstraction existing = indicesLookup.put(dataStream.getName(), dataStream);
                assert existing == null : "duplicate data stream for " + dataStream.getName();

                for (Index i : dataStream.getIndices()) {
                    indexToDataStreamLookup.put(i.getName(), dataStream);
                }
            }

            Map<String, List<IndexMetadata>> aliasToIndices = new HashMap<>();
            for (var entry : indices.entrySet()) {
                final String name = entry.getKey();
                final IndexMetadata indexMetadata = entry.getValue();
                final DataStream parent = indexToDataStreamLookup.get(name);
                assert parent == null || parent.getIndices().stream().anyMatch(index -> name.equals(index.getName()))
                    : "Expected data stream [" + parent.getName() + "] to contain index " + indexMetadata.getIndex();
                IndexAbstraction existing = indicesLookup.put(name, new ConcreteIndex(indexMetadata, parent));
                assert existing == null : "duplicate for " + indexMetadata.getIndex();

                for (var aliasMetadata : indexMetadata.getAliases().values()) {
                    List<IndexMetadata> aliasIndices = aliasToIndices.computeIfAbsent(aliasMetadata.getAlias(), k -> new ArrayList<>());
                    aliasIndices.add(indexMetadata);
                }
            }

            for (var entry : aliasToIndices.entrySet()) {
                AliasMetadata alias = entry.getValue().get(0).getAliases().get(entry.getKey());
                IndexAbstraction existing = indicesLookup.put(entry.getKey(), new IndexAbstraction.Alias(alias, entry.getValue()));
                assert existing == null : "duplicate for " + entry.getKey();
            }

            return Collections.unmodifiableSortedMap(indicesLookup);
        }
```
{{< /details >}}

## Builder.makeDsAliasAbstraction
#### Code Complexity: 6
### Overview
This Java method is responsible for creating an Alias object, specific to an 'IndexAbstraction' class, from a given DataStreamAlias object. It begins by initializing an Index object as null. If the given alias has a write data stream, it will find the related DataStream from the provided Map, then sets the write index of this DataStream to the previously initialized Index object. Then, it returns a new IndexAbstraction.Alias object instantiated with the provided alias, a list of indices corresponding to the data streams found in the alias, and the write index of the write data stream (if it exists).

### User Acceptance Criteria
```gherkin
Feature: Creation of Alias for Index Abstraction
 Scenario: Construction of Index Abstraction Alias
 Given a map of data streams and a data stream alias
 When the 'makeDsAliasAbstraction' method is called
 Then an IndexAbstraction.Alias object should be created using the alias, indices from the data streams found in the alias, and the write index of write data stream if exist
```

### Refactoring
Potential refactoring opportunities include adding null check for the 'alias' and 'dataStreams' parameters to avoid NullPointerExceptions. Also, to make the code easier to read, we could extract the complex stream operation into a separate method with a meaningful name. Lastly, breaking down this method into smaller methods that perform single granular tasks could adhere better to the Single Responsibility Principle and promote code reusability.{{< details "Function source code " >}}
```java
private static IndexAbstraction.Alias makeDsAliasAbstraction(Map<String, DataStream> dataStreams, DataStreamAlias alias) {
            Index writeIndexOfWriteDataStream = null;
            if (alias.getWriteDataStream() != null) {
                DataStream writeDataStream = dataStreams.get(alias.getWriteDataStream());
                writeIndexOfWriteDataStream = writeDataStream.getWriteIndex();
            }
            return new IndexAbstraction.Alias(
                alias,
                alias.getDataStreams().stream().flatMap(name -> dataStreams.get(name).getIndices().stream()).toList(),
                writeIndexOfWriteDataStream
            );
        }
```
{{< /details >}}

## Builder.isNonEmpty
#### Code Complexity: 1
### Overview
This function named 'isNonEmpty' checks if the 'idxMetas' List<IndexMetadata> object is not null and is not empty. It then returns a boolean value true if the list is non-empty and non-null, and false otherwise.

### User Acceptance Criteria
```gherkin
Feature: Non-empty List Validation
  Scenario: Validate list non-emptiness
  Given a list object
  When the 'isNonEmpty' function is called with the list as parameter
  Then it should return 'true' if list is not null and not empty, and 'false' otherwise
```

### Refactoring
This function is following the single responsibility principle, easy to read and efficient, requiring no immediate refactoring. However, if 'idxMetas' contains null objects and the function should return false in that case, the function could be refactored to also check for null objects inside the list.{{< details "Function source code " >}}
```java
private static boolean isNonEmpty(List<IndexMetadata> idxMetas) {
            return (Objects.isNull(idxMetas) || idxMetas.isEmpty()) == false;
        }
```
{{< /details >}}

## Builder.validateAlias
#### Code Complexity: 26
### Overview
This method is responsible for validating an alias associated with multiple indices. It ensures that the alias does not have more than one write index, that is_hidden setting is consistent across all indices, and that the alias should not refer to both system indices and non-system indices. Each validation may throw an IllegalStateException if there's an error.

### User Acceptance Criteria
```gherkin
Feature: Alias Validation
Scenario: Multiple Write Indices
Given an alias has more than one write index
Then an exception should be thrown
Scenario: Inconsistent Hidden Setting on Indices
Given an alias has inconsistent is_hidden setting on its indices
Then an exception should be thrown
Scenario: Alias Referring to both System and Non-system Indices
Given an alias refers to both system and non-system indices
Then an exception should be thrown
```

### Refactoring
While the current method accomplishes its task, it can be divided into three separate private methods to follow Single Responsibility Principle, each one handling validation of write indices, hidden status and system status respectively. This would improve readability and maintainability of the code. Also, the exception messages could be refactored to remove string concatenation within them and instead take advantage of formatted strings in java. This would make it less prone to errors and easier to modify.{{< details "Function source code " >}}
```java
private static void validateAlias(String aliasName, List<IndexMetadata> indexMetadatas) {
            // Validate write indices
            List<String> writeIndices = indexMetadatas.stream()
                .filter(idxMeta -> Boolean.TRUE.equals(idxMeta.getAliases().get(aliasName).writeIndex()))
                .map(im -> im.getIndex().getName())
                .toList();
            if (writeIndices.size() > 1) {
                throw new IllegalStateException(
                    "alias ["
                        + aliasName
                        + "] has more than one write index ["
                        + Strings.collectionToCommaDelimitedString(writeIndices)
                        + "]"
                );
            }

            // Validate hidden status
            final Map<Boolean, List<IndexMetadata>> groupedByHiddenStatus = indexMetadatas.stream()
                .collect(Collectors.groupingBy(idxMeta -> Boolean.TRUE.equals(idxMeta.getAliases().get(aliasName).isHidden())));
            if (isNonEmpty(groupedByHiddenStatus.get(true)) && isNonEmpty(groupedByHiddenStatus.get(false))) {
                List<String> hiddenOn = groupedByHiddenStatus.get(true).stream().map(idx -> idx.getIndex().getName()).toList();
                List<String> nonHiddenOn = groupedByHiddenStatus.get(false).stream().map(idx -> idx.getIndex().getName()).toList();
                throw new IllegalStateException(
                    "alias ["
                        + aliasName
                        + "] has is_hidden set to true on indices ["
                        + Strings.collectionToCommaDelimitedString(hiddenOn)
                        + "] but does not have is_hidden set to true on indices ["
                        + Strings.collectionToCommaDelimitedString(nonHiddenOn)
                        + "]; alias must have the same is_hidden setting "
                        + "on all indices"
                );
            }

            // Validate system status
            final Map<Boolean, List<IndexMetadata>> groupedBySystemStatus = indexMetadatas.stream()
                .collect(Collectors.groupingBy(IndexMetadata::isSystem));
            // If the alias has either all system or all non-system, then no more validation is required
            if (isNonEmpty(groupedBySystemStatus.get(false)) && isNonEmpty(groupedBySystemStatus.get(true))) {
                final List<String> newVersionSystemIndices = groupedBySystemStatus.get(true)
                    .stream()
                    .filter(i -> i.getCreationVersion().onOrAfter(IndexNameExpressionResolver.SYSTEM_INDEX_ENFORCEMENT_VERSION))
                    .map(i -> i.getIndex().getName())
                    .sorted() // reliable error message for testing
                    .toList();

                if (newVersionSystemIndices.isEmpty() == false) {
                    final List<String> nonSystemIndices = groupedBySystemStatus.get(false)
                        .stream()
                        .map(i -> i.getIndex().getName())
                        .sorted() // reliable error message for testing
                        .toList();
                    throw new IllegalStateException(
                        "alias ["
                            + aliasName
                            + "] refers to both system indices "
                            + newVersionSystemIndices
                            + " and non-system indices: "
                            + nonSystemIndices
                            + ", but aliases must refer to either system or"
                            + " non-system indices, not both"
                    );
                }
            }
        }
```
{{< /details >}}

## Builder.assertDataStreams
#### Code Complexity: 17
### Overview
The `assertDataStreams` function takes in two parameters: Map of Indices metadata and DataStreamMetadata. It is a boolean type function aiming to check on the DataStream Indices. The function retrieves each datastream and its associated indices from the datastream metadata. Then, it checks if an index from a datastream has any aliases. If any index with aliases is found, a new LinkedList named 'conflictingAliases' is created (if it's not already created earlier) and the alias of that Index is added to the LinkedList. Finally, if the 'conflictingAliases' LinkedList isn't null i.e. if there is any conflicting alias, the function throws an AssertionError stating that these aliases cannot refer to backing indices of the data streams. If no such conflict is found, it returns true.

### User Acceptance Criteria
```gherkin
Feature: Assert data streams
 Scenario: Valid Index alias check in Data Stream
 Given a Map of index metadata and datastream metadata
 When each index of a datastream is checked for its aliases
 Then the function should add those aliases into a LinkedList called 'conflictingAliases'
 And if 'conflictingAliases' is not null, an AssertionError is thrown with message detailing conflict
 Otherwise, the function should return true.
```

### Refactoring
Opportunity 1: Null checks should be in place for the provided indices map and datastream metadata to prevent any unexpected exceptions in case of null arguments.
 Opportunity 2: The linked list 'conflictingAliases' could be instantiated at the time of declaration to remove the redundancy in the loops.
 Opportunity 3: Throwing AssertionError for checking data integrity is not a good practice. AssertionErrors are meant for internal invariant checking and state verification that should never happen in production code. A custom checked exception or an IllegalArgumentException would be a better fit in this case.{{< details "Function source code " >}}
```java
static boolean assertDataStreams(Map<String, IndexMetadata> indices, DataStreamMetadata dsMetadata) {
            // Sanity check, because elsewhere a more user friendly error should have occurred:
            List<String> conflictingAliases = null;

            for (var dataStream : dsMetadata.dataStreams().values()) {
                for (var index : dataStream.getIndices()) {
                    IndexMetadata im = indices.get(index.getName());
                    if (im != null && im.getAliases().isEmpty() == false) {
                        for (var alias : im.getAliases().values()) {
                            if (conflictingAliases == null) {
                                conflictingAliases = new LinkedList<>();
                            }
                            conflictingAliases.add(alias.alias());
                        }
                    }
                }
            }
            if (conflictingAliases != null) {
                throw new AssertionError("aliases " + conflictingAliases + " cannot refer to backing indices of data streams");
            }

            return true;
        }
```
{{< /details >}}

## Builder.fromXContent
#### Code Complexity: 358
### Overview
The 'fromXContent' method is a public static function that constructs a Metadata object from XContentParser data. This function goes step-by-step, checking for specific field names and tokens, and applying the corresponding action or method calls. It constructs the Metadata object with the details found in the XContentParser. The function handles various error cases, such as an unexpected field, missing token, or an unknown custom object, additionally ensuring that the data ends with an end object token.

### User Acceptance Criteria
```gherkin
Feature: Create Metadata from XContentParser data
Scenario: Valid XContentParser data is available
Given that an XContentParser data object is provided
When I invoke the function 'fromXContent'
Then it should build a Metadata object using fields and tokens from the XContentParser
And also make sure the end token is an END_OBJECT
But if an unknown custom object is encountered, it should be skipped
Furthermore, unexpected field tokens or missing required field tokens should raise an IllegalArgumentException.
```

### Refactoring
1. The function 'fromXContent' is quite lengthy and complex, which can harm readability and code maintainability.
2. To improve clarity and maintainability, it would be advisable to abstract subparts of the parsing process into separate private static methods that each handle a single, specific scenario.
3. Even though it's a static method, it invokes multiple non-static methods on the 'builder' object. This can be confusing. The builder should not be statically invoked.
4. Redundant checks for 'meta-data' can be improved.
5. As a rule of thumb, 'magic strings' (i.e., hard-coded strings in the code like 'meta-data', 'cluster_coordination') should be avoided. It might be beneficial to define these as constants or even as an Enum.{{< details "Function source code " >}}
```java
public static Metadata fromXContent(XContentParser parser) throws IOException {
            Builder builder = new Builder();

            // we might get here after the meta-data element, or on a fresh parser
            XContentParser.Token token = parser.currentToken();
            String currentFieldName = parser.currentName();
            if ("meta-data".equals(currentFieldName) == false) {
                token = parser.nextToken();
                if (token == XContentParser.Token.START_OBJECT) {
                    // move to the field name (meta-data)
                    XContentParserUtils.ensureExpectedToken(XContentParser.Token.FIELD_NAME, parser.nextToken(), parser);
                    // move to the next object
                    token = parser.nextToken();
                }
                currentFieldName = parser.currentName();
            }

            if ("meta-data".equals(currentFieldName) == false) {
                throw new IllegalArgumentException("Expected [meta-data] as a field name but got " + currentFieldName);
            }
            XContentParserUtils.ensureExpectedToken(XContentParser.Token.START_OBJECT, token, parser);

            while ((token = parser.nextToken()) != XContentParser.Token.END_OBJECT) {
                if (token == XContentParser.Token.FIELD_NAME) {
                    currentFieldName = parser.currentName();
                } else if (token == XContentParser.Token.START_OBJECT) {
                    if ("cluster_coordination".equals(currentFieldName)) {
                        builder.coordinationMetadata(CoordinationMetadata.fromXContent(parser));
                    } else if ("settings".equals(currentFieldName)) {
                        builder.persistentSettings(Settings.fromXContent(parser));
                    } else if ("indices".equals(currentFieldName)) {
                        while ((token = parser.nextToken()) != XContentParser.Token.END_OBJECT) {
                            builder.put(IndexMetadata.Builder.fromXContent(parser), false);
                        }
                    } else if ("hashes_of_consistent_settings".equals(currentFieldName)) {
                        builder.hashesOfConsistentSettings(parser.mapStrings());
                    } else if ("templates".equals(currentFieldName)) {
                        while ((token = parser.nextToken()) != XContentParser.Token.END_OBJECT) {
                            builder.put(IndexTemplateMetadata.Builder.fromXContent(parser, parser.currentName()));
                        }
                    } else if ("reserved_state".equals(currentFieldName)) {
                        while ((token = parser.nextToken()) != XContentParser.Token.END_OBJECT) {
                            builder.put(ReservedStateMetadata.fromXContent(parser));
                        }
                    } else {
                        try {
                            Custom custom = parser.namedObject(Custom.class, currentFieldName, null);
                            builder.putCustom(custom.getWriteableName(), custom);
                        } catch (NamedObjectNotFoundException ex) {
                            logger.warn("Skipping unknown custom object with type {}", currentFieldName);
                            parser.skipChildren();
                        }
                    }
                } else if (token.isValue()) {
                    if ("version".equals(currentFieldName)) {
                        builder.version = parser.longValue();
                    } else if ("cluster_uuid".equals(currentFieldName) || "uuid".equals(currentFieldName)) {
                        builder.clusterUUID = parser.text();
                    } else if ("cluster_uuid_committed".equals(currentFieldName)) {
                        builder.clusterUUIDCommitted = parser.booleanValue();
                    } else {
                        throw new IllegalArgumentException("Unexpected field [" + currentFieldName + "]");
                    }
                } else {
                    throw new IllegalArgumentException("Unexpected token " + token);
                }
            }
            XContentParserUtils.ensureExpectedToken(XContentParser.Token.END_OBJECT, parser.nextToken(), parser);
            return builder.build();
        }
```
{{< /details >}}

## Builder.dedupeMapping
#### Code Complexity: 10
### Overview
The function 'dedupeMapping' takes one parameter of type 'IndexMetadata'. It checks whether the mapping of the indexMetadata object is null; if it is, the function returns the passed indexMetadata object as is. If the mapping isn't null, the function retrieves the SHA256 digest of the mapping and checks if the digest is present in the 'mappingsByHash' hashmap. If present, it assigns the retrieved MappingMetadata entry to the indexMetadata object and returns it. If not present, it adds a new entry in the 'mappingsByHash' hashmap with the digest as key and mapping of the 'indexMetadata' as value, then returns the 'indexMetadata' object.

### User Acceptance Criteria
```gherkin
Feature: Deduplication of mapping in IndexMetadata
 Scenario: Given an IndexMetadata object
 When the function 'dedupeMapping' is called with the object as a parameter
 Then if the object's mapping is null, it should return the object as is, otherwise, hashing of mapping data takes place.
 And if the hash exists in mappingsByHash, the mapping-metadata entry replaces the existing metadata.
 Otherwise, a new hash-mapping entry is added to the mappingsByHash hashmap and the original object is returned.
```

### Refactoring
Opportunities for refactoring include the introduction of synchronization to handle concurrent modification of the 'mappingsByHash' hashmap, implementing a better hash function to handle potential hash collisions, adding an error handling mechanism for handling failures in SHA256 hashing, and extracting hash retrieval, hash existence check, and mapping retrieval into their own respective methods for better code readability and maintainability. As a suggestion, following the Single Responsibility Principle (SRP), creating separate methods for each functionality in 'dedupeMapping' so that each method only has one reason to change.{{< details "Function source code " >}}
```java
private IndexMetadata dedupeMapping(IndexMetadata indexMetadata) {
            if (indexMetadata.mapping() == null) {
                return indexMetadata;
            }

            String digest = indexMetadata.mapping().getSha256();
            MappingMetadata entry = mappingsByHash.get(digest);
            if (entry != null) {
                return indexMetadata.withMappingMetadata(entry);
            } else {
                mappingsByHash.put(digest, indexMetadata.mapping());
                return indexMetadata;
            }
        }
```
{{< /details >}}

## Builder.dedupeMapping
#### Code Complexity: 10
### Overview
The 'dedupeMapping' method is a private utility method associated with an 'IndexMetadata.Builder' class instance. Its purpose is to check the mapping associated with the indexing metadata. If the mapping is not null, it calculates the sha256 hash of the mapping, and checks if an entry matching this hash already exists in a hash map (mappingsByHash). If a matching entry exists, it updates the index metadata's mapping with this existing entry, otherwise it adds the new mapping to the hash map with the sha256 hash as key.

### Refactoring
A potential refactoring opportunity for this method involves addressing the concurrency issue that might arise due to the concurrent access of shared 'mappingsByHash'. One approach is to use thread-safe data structures, like ConcurrentHashMap, to ensure consistency and prevent possible race conditions. Another area for refactoring is to consider the chance of hash collisions and implement a mechanism to handle these rare cases accurately without losing data integrity.{{< details "Function source code " >}}
```java
private void dedupeMapping(IndexMetadata.Builder indexMetadataBuilder) {
            if (indexMetadataBuilder.mapping() == null) {
                return;
            }

            String digest = indexMetadataBuilder.mapping().getSha256();
            MappingMetadata entry = mappingsByHash.get(digest);
            if (entry != null) {
                indexMetadataBuilder.putMapping(entry);
            } else {
                mappingsByHash.put(digest, indexMetadataBuilder.mapping());
            }
        }
```
{{< /details >}}

## toXContent
#### Code Complexity: 1
### Overview
The provided Java code is part of an implementation of the 'toXContent' method. It's responsibility is to turn Metadata state into XContent using XContentBuilder. It wraps the state using the 'wrapAsToXContent' method from the 'ChunkedToXContent' class and then calls the 'toXContent' method which converts the wrapped state into a desired XContent format.

### User Acceptance Criteria
```gherkin
Feature: Conversion To XContent
 Scenario: Valid Metadata state
 Given the Metadata state is valid
 When the toXContent method is invoked
 Then the state should be wrapped using the ChunkedToXContent.wrapAsToXContent function 
 And converted into XContent format.
```

### Refactoring
Opportunity 1: Exception handling can be improved in this method. The method should handle metadata state validity and potential IOExceptions from the 'toXContent' method. Suggestion: Surround the code block with a try-catch to handle possible exceptions. 
 Opportunity 2: Consider the readability and understandability of the code. Extract complex logic to well-named methods that explain what they do.{{< details "Function source code " >}}
```java
@Override
        public void toXContent(XContentBuilder builder, Metadata state) throws IOException {
            ChunkedToXContent.wrapAsToXContent(state).toXContent(builder, FORMAT_PARAMS);
        }
```
{{< /details >}}

## fromXContent
#### Code Complexity: 1
### Overview
This function is responsible for the creation of Metadata objects from given XContentParser input. The input to this function is an instance of XContentParser and it harnesses a builder method (fromXContent()) from the Builder class to generate the desired Metadata object. This operation can throw an IOException if something goes wrong during the execution, such as data corruption or connection loss.

### User Acceptance Criteria
```gherkin
Feature: Construct Metadata from XContentParser input
Scenario: Valid XContentParser input
Given an XContentParser instance is provided
When the 'fromXContent' method is called on the Builder class
Then a Metadata object should be returned.
```

### Refactoring
Opportunity 1: Consider implementing some form of preliminary validation check for the input so as to prevent potentially invalid arguments from resulting in errors. This could simply be a null check or could extend to verifying the data structure of the input. Opportunity 2: Consider using try-catch blocks in critical sections where IOException might be thrown to prevent the potential collapse of the whole program.{{< details "Function source code " >}}
```java
@Override
        public Metadata fromXContent(XContentParser parser) throws IOException {
            return Builder.fromXContent(parser);
        }
```
{{< /details >}}

## Risks & Security Issues
**context**: Potential risks associated with this method may arise from concurrency issues if not properly synchronized. This is especially true if these sets are mutated in any way by multiple threads. Another risk could be related to misusing the EnumSet class. EnumSet is designed specifically for use with enum types, and misuse could lead to unpredictable results. However, as this is just the method signature, it is difficult to ascertain risks without the context of the code in which it is being used.

**isRestorable**: There doesn't seem to be any apparent security risks or bugs in this particular function with regards to the language syntax and semantics. However, remember to always properly handle or sanitize the context object prior to this function calls for avoiding potential risks that come from the ingested context, such as injection attacks.

**assertConsistent**: This function heavily relies on assertions to ensure all conditions are met. However, assertions can be disabled globally in the JVM via the `-da` or `-disableassertions` command line switches. Therefore, if these switches get turned off by mistake or due to unawareness, none of the assertions in this function would work, potentially leading to unreliable outcomes. Moreover, it assumes that the `DataStreamMetadata` object and the indices Map are never null; no null checks have been made before accessing them, risking a NullPointerException.

**withIncrementedVersion**: As this method creates a new Metadata object for version incrementing, in case of large data, it can cause excessive memory utilization. If this method is called frequently without garbage collection of the old Metadata objects, it can lead to Out Of Memory errors. In terms of bugs, there is a risk if any other field apart from 'version' is unintentionally modified. The method does not have any null checks or error handling mechanism which might potentially lead to unexpected Null Pointer Exception.

**withLifecycleState**: The main risk associated with this code snippet relates to how null values are handled. If a null value for 'index' or 'lifecycleState' is passed to the function, it would fail. The function does have null checks in place; however, it could benefit from more robust error handling. The method also directly constructs a new Metadata object instead of using Metadata.builder(this).[...].build(), bypassing validation. This efficiency improvement can lead to issues if inappropriate values are assigned, as there is no enforcement of proper data constraints.

**withIndexSettingsUpdates**: One potential risk in this code is that it blindly increments the 'settingsVersion' for the given index without checking the validity of the settings or the previous value of 'settingsVersion'. If the settings are invalid or if 'settingsVersion' was already at its maximum value, this could lead to unexpected behavior or exceptions. Additionally, the method does not perform null checks for individual indices and their corresponding settings in the input map. Null values could cause NullPointerException during the execution of the method.

**withCoordinationMetadata**: This method doesn't have any visible error handling. If any non-nullability constraints or validations that are expected to be upheld by the other properties of the Metadata instance are violated, this could result in unexpected exceptions at runtime. More specifically, if the 'CoordinationMetadata' parameter is null, or has values that may interfere with other Metadata properties, it can also cause runtime errors.

**withLastCommittedValues**: There aren’t any specific security risks or bugs visible in this function from the provided code. However, it is assumed here that the provided `lastCommittedConfiguration` value is non-null, because null values aren't handled which could potentially lead to null pointer exceptions. Furthermore, there is an assumption that the equals method is correctly overridden in the CoordinationMetadata.VotingConfiguration class.

**withAllocationAndTermUpdatesOnly**: No explicit risks, bugs, or security issues was detected in this method. However, the performance could be an issue if the number of indices or updates map is large, since we are creating a copy of it. Also, there are no null-checks for the provided updates map which may cause null pointer exceptions.

**withAddedIndex**: Possible risks include a scenario where the state of the index is not properly set to either 'OPEN' or 'CLOSE' leading to the AssertionError. Another risk could be data inconsistency if there are any issues during the update of indices or mapping metadata. If the index name has collision with existing indices, it may lead to data integrity issues.

**aliasesAfterAddingIndex**: The function doesn't handle null inputs for the parameters 'index' and 'aliases', it will throw a NullPointerException if either of these is null. There could be a risk associated with the 'ensureNoNameCollision' function, the details of this function are not provided but if it mutates any global state or has side effects, it could introduce bugs. The function is not thread-safe due to usage of non-final variables inside the builder and potential concurrent modifications can result in unexpected behavior.

**ensureNoNameCollision**: The function throws an IllegalArgumentException when it encounters an index or a data stream with the same name as the input. However, when there is a name collision with a data stream alias, an IllegalStateException is thrown. This could lead to unexpected application behavior, as these two types of exceptions have to be caught and handled differently. There is also a risk of null pointer exception if the input string indexName is null.

**version**: There is minimal risk related to this function. It is a simple getter method which does not manipulate data. However, there could be a potential risk if the 'version' variable is not initialized or not properly managed, leading to unpredictable behavior.

**clusterUUID**: Given that it's a simple getter method, there's no substantial risk related to the execution of the method itself. However, extreme caution and consideration should be given around the context in which this method is used. Exposing sensitive and critical data carelessly can lead to severe breaches of security and breakage of data encapsulation principles.

**clusterUUIDCommitted**: Since this is a simple getter method, there is very low risk associated with it. It does not interact with any external systems, perform any calculations, or modify any state. The only potential risk would be if the 'clusterUUIDCommitted' field is not correctly initialized or modified elsewhere in the code.

**settings**: There are no apparent risks, bugs, or security vulnerabilities associated with this code snippet. It's a simple getter method that returns the value of an instance variable.

**transientSettings**: There are limited potential risks or bugs as this is a simple getter method. The main possible risk would be potentially exposing sensitive settings information without appropriate access controls, if the 'transientSettings' contain sensitive information.

**persistentSettings**: No apparent risk is detected as this is simply a getter method and does not manipulate any data, hence no risks of bugs or security issues. However if the 'Settings' object contains sensitive data, then exposing it through a public method could be a potential security risk depending on the usage.

**hashesOfConsistentSettings**: As this method directly exposes the internal state of the object, it introduces the risk of unintended modification. If the returned Map is modified somewhere else, it could affect the object's state and lead to unpredictable behavior.

**coordinationMetadata**: As a getter method, this function has a very low risk profile. It has no side effects and does not manipulate state. However, if the 'coordinationMetadata' is manipulable or mutable, it may inadvertently expose sensitive data or state that could lead to issues in other parts of the application.

**oldestIndexVersion**: As a standard getter method, there is minimal risk associated with this method. However, it exposes the 'oldestIndexVersion' attribute which might lead to security risks if the attribute contains sensitive data.

**equalsAliases**: There seems to be no serious security risks, but lack of exception handling can cause runtime errors if function receives an unexpected input, such as a null value for the 'other' Metadata object. Additionally, the repeated use of 'thisAlias.equals(otherAlias) == false' could potentially lead to incorrect results if there are bugs or overrides in the equals method of DataStreamAlias objects.

**indicesLookupInitialized**: From a security perspective, as the function directly exposes the status of 'indicesLookup', any untrusted or harmful code knowing the state of 'indicesLookup' could misuse the data. On the bug front, this function does not anticipate or handle any exceptions like if the 'indicesLookup' object does not exist or is unreachable at the moment of the check, which can lead to potential runtime errors.

**getIndicesLookup**: The method is not thread-safe, which could potentially lead to inconsistent state if invoked concurrently from multiple threads. In certain concurrency scenarios, it could end up invoking 'buildIndicesLookup()' more than once which might be an expensive operation.

**buildIndicesLookup**: There doesn't appear to be any evident risks, bugs or security issues regarding this function since the operation appears straightforward and doesn't implement any risky procedures such as writing operations towards file system or database, manipulations related to user input, or unawareness of concurrent access. However, the level of risk could be further assessed if the called Builder object along with the called method 'buildIndicesLookup' is provided.

**sameIndicesLookup**: There might be a risk if the objects being compared are not properly initialized. Specifically, if the 'indicesLookup' property of any of the objects is not properly set, this can lead to unexpected behavior. Additionally, this function assumes that the 'indicesLookup' data members of both original and passed 'other' objects are of the same type and would not cause a type mismatch during comparison.

**findAllAliases**: Possible risks might be related to the functioning of the findAliases function that this method calls. If findAliases function does not properly handle empty arrays or if there are aliases not present for certain indices, this might lead to unexpected results. No null value checking or error handling means there is a risk for the Null Point Exception when accessing the values of null map or array.

**findAliases**: The function appears to be risk-averse, with safeguards to prevent null input exceptions. However, it doesn't seem to include any error handling or logging. If an alias doesn't exist or cannot be found, the function will continue without indication of the error. It also assumes that the string based indices input are valid and already existed in `indices` mapping. Furthermore, it fails to catch any possible exceptions thrown by aliases or concrete indices being malformed or Reject/Include rules failing.

**findMappings**: There are several risks and potential issues in this code snippet. Using assertions for controlling functional flow is not recommended because assertions are typically used for testing and can be disabled in the production build leading to potential bugs or inconsistent behavior. The method does not check the nullity of 'fieldFilter' and 'onNextIndex' parameters which may cause NullPointerException during runtime if a null was provided. The method doesn’t handle the case where 'fieldFilter.apply(index)' returns null.

**findDataStreams**: Assertions are used in this function to check if parameters and return values from method calls are not null. However, assertions are generally disabled at runtime unless enabled manually, which means it's not a reliable way to handle null exceptions. Further, there is no error handling for the scenario where the index type is not 'CONCRETE_INDEX'.

**filterFields**: A major risk is that there is no null check for 'mappingMetadata.type()' which might throw a NullPointerException. Also, unchecked casting from 'sourceAsMap.get(mappingMetadata.type())' and 'mapping.get("properties")' to 'Map<String, Object>' might lead to a ClassCastException if the underlying object is not of type 'Map<String, Object>'. If the 'sourceAsMap' contains more than one object, only one is considered for 'mapping'. Rest of the data is ignored. The function seems to process 'MappingMetadata' even when 'properties' is null or empty which might effect the efficiency.

**filterFields**: Potential risks include unhandled NullPointerException for `fields` or `fieldPredicate` if they are null. The code assumes that the 'fields' map will only contain another map as its value, and it throws IllegalStateException when it encounters a different data type. Thus, it may not handle all possible types that `Object` may have. The method also modifies the input map which may lead to unexpected side effects when the modified input is used elsewhere. Unchecked typecasting is done from `Object` to `Map<String, Object>` which could lead to ClassCastException at runtime if an incorrect type of object is provided.

**mergePaths**: There is no validation that checks if either 'path' or 'field' are null. This can cause the function to throw a NullPointerException in case null values are passed as arguments. Additionally, there are no checks for the validity of the strings provided as input.

**getConcreteAllIndices**: This method does not seem to present any immediate risks or security issues, as it simply returns a reference to an existing data structure. However, one must be aware that this could inadvertently expose internal state for modification to outside callers if the array contents are mutable.

**getConcreteVisibleIndices**: There is a potential risk with this method where it directly returns the reference to its private field 'visibleIndices'. This could lead to issues as it allows the state of 'visibleIndices' to be changed from outside the class unintentionally.

**getConcreteAllOpenIndices**: As this function is a simple getter with no logic or manipulations on the data, there is minimal risk associated with it. However, it should be noted that this function gives direct access to the 'allOpenIndices' array. If this array contains sensitive data or is critical for the software's operation, it might be a risk as it can possibly lead to data corruption or unauthorized access.

**getConcreteVisibleOpenIndices**: There is a potential risk in directly returning the internal array 'visibleOpenIndices'. This exposes the internal state of the object and violates the encapsulation principle of object-oriented programming.



**getConcreteVisibleClosedIndices**: There's a potential risk in returning a reference to the original array. It may lead to unintentional modifications of the 'visibleClosedIndices' array by its callers, causing unexpected bugs.

**resolveWriteIndexRouting**: One potential risk involves the 'aliasOrIndex' being null or the absence of a write index. These scenarios could be caused by user input errors or database glitches. As the code currently stands, it would throw an IllegalArgumentException, which might not be the most graceful way to handle such a scenario. It could be better to return a custom error message to the user.

**resolveIndexRouting**: There are no apparent security risks in the code. Bugs could arise from the use of the getIndicesLookup() call if it does not return as expected. There could be potential risks if the 'result.getType()' is not strictly of 'ALIAS' type or if the size check 'result.getIndices().size() > 1' fails incorrectly. Another risk is in the 'rejectSingleIndexOperation' method: if it doesn't handle exceptions correctly, it may cause unwanted program termination.

**resolveRouting**: The function does handle null as input for the routing parameter, but not for the aliasOrIndex or aliasMd parameters. Invoking this function with null for these parameters may result in a NullPointerException. Make sure there are null checks for these inputs or ensure they're never passed as null. Also, there may be potential misses where the routing needs to be decided but is not due to the absence of index routing in alias metadata.

**rejectSingleIndexOperation**: Considering the function is private and static, the risks related to it are likely minimal as it can't be accessed from outside the object or directly without an instance of the class. However, there could be a potential risk if the function is used in a multi-threaded environment. The approach of incrementing the variable 'i' might lead to race conditions and inconsistency if multiple threads are accessing and modifying it simultaneously. Another potential risk can occur if 'IndexAbstraction' argument is null, leading to a NullPointerException.

**hasIndex**: There is no apparent security issue or risk in this function. But one risk regarding the function can be if it is called before initializing the 'indices' map, it may cause a Null Pointer Exception.

**hasIndex**: Possible risks include null references in case 'index' or 'index.getName()' is null, this function will throw a NullPointerException. Another risk is that performance may be decreased if the index function call to retrieve metadata is a slow operation, and it's used in the performance critical section. It also assumes that there's no possibility of having two separate 'Index' instances with the same UUID and name, this assumption if not valid may lead to false verification.

**hasIndexAbstraction**: Although this function seems to be straight forward, risks can arise if the getIndicesLookup() method is not properly implemented, i.e. if it doesn't handle the situation when the indices lookup is not initialized. It also assumes that the index string provided should be not null, and hence null value can raise a NullPointerException.

**index**: There are no apparent security risks or bugs present in the provided code snippet. However, it's worth noting that the method does not handle the case where the given index does not exist in the indices. A null reference might be returned, and it is up to the calling code to check for this null reference which can lead to NullPointerException if not properly checked.

**index**: One potential risk here is null pointer exceptions. If the retrieved metadata is null, the function attempts to retrieve an UUID from it which could lead to a null pointer exception. There is also no validation of the input Index object. If the inputted Index is null, this function will throw a null pointer exception when trying to access its name or UUID.

**hasIndexMetadata**: Risk could be associated with this code if the IndexMetadata parameter passed is null, which would lead to a NullPointerException when calling indexMetadata.getIndex().getName(). Another risk could be the existence of duplicate keys in the map, this function will only consider it as a match if the value to that key is exactly the same object as passed in.

**getIndexSafe**: The function getIndexSafe() can potentially throw an exception if the index is not found or if the UUIDs don't match. This may disrupt the flow of the program if not properly caught and handled. Additionally, it seems to trust that the name and UUID provided in the index are legitimate. If the index data is manipulated or spoofed, it could be a potential security issue.

**indices**: Since the getter method is directly returning the reference of the private member variable, it may lead to data inconsistency and unexpected behavior if the returned Map is modified from outside of the class. There's a risk of breaking encapsulation principle which could lead to system instability and bugs.

**getIndices**: There are no explicit risks, bugs, or security issues within this method itself, as it strictly depends on the behavior of indices() method. If the indices() method has bugs, is slow, does not handle exceptions, or has security issues, then those would implicitly affect this method as well. But from the perspective of this particular method, there are no observable risks.

**hasAlias**: One potential risk is that no null check is performed on the input 'aliasName'. If a null value is provided as input, it would result in a NullPointerException. Another risk is related to thread-safety, this method might give incorrect results if 'aliasedIndices' or 'dataStreamAliases' is being modified concurrently by multiple threads. Moreover, if the 'dataStreamAliases' method has any side-effects or if it changes any global state when called, this could lead to subtle bugs.

**aliasedIndices**: There is a 'NullPointerException' risk if the provided alias name is null. The function currently doesn't handle this exception with a custom error message, making it less informative for the users. Also, if the 'aliasedIndices' map is modified in parallel while this method is being executed, it could potentially lead to non-deterministic behavior.

**aliasedIndices**: Although the function is relatively simple and direct, there could be potential risks if not used appropriately. These include:1. Risk of null pointer exception if the 'aliasedIndices' data is null or uninitialized before this function is called.2. Risks associated with the concurrent modification if the function is being used in a multithreaded context.

**templates**: Since this is a simple getter method, there are very limited risks involved. However, it might expose sensitive data if the 'templates' Map contains confidential or private information. Further, as the method returns a direct reference to the 'templates' object, it may be modified by any client with access to this getter method which could neglect immutability principles if applicable.

**getTemplates**: As this is a direct getter-method without any manipulation or processing of the data, the risk and security issues are low. However, it exposes potentially sensitive data held within the templates, and depending on the overall system, this could pose a data leakage risk if not properly managed. As it is a simple getter, there is virtually zero risk of bugs being present in the method itself, unless the templates() function it calls has bugs.

**componentTemplates**: If the input is unexpected or malformed, or if there are any errors in the ComponentTemplateMetadata, it could possibly throw exceptions which are not currently being caught. No null check on the result of this.custom(ComponentTemplateMetadata.TYPE) could lead to unexpected NullPointExceptions. The method does not check for the validity of the ComponentTemplate classes, therefore delivering potentially corrupted data.

**templatesV2**: Risks in this function majorly involve the handling of null values. As per the existing implementation, if any null value is encountered, it is handled and an empty map is returned. However, there could be a situation where the ComposableIndexTemplateMetadata.TYPE returns a null object, which might lead to NullPointerException error. It would be helpful to include error handling measures for such situations.

**isTimeSeriesTemplate**: One risk in this method is a possible NullPointerException due to the unguarded call to indexTemplate's .template() method before checking for nullity. Another risk is that if there are invalid Enum values for `IndexMode`, it can throw an IllegalArgumentException.

**dataStreams**: The code appears to rely on the 'custom' function that is externally defined. If the function or its returned object does not have the 'dataStreams' method, it potentially leads to an error. There seems to be no exception handling included, so any interruption would result in application failure.

**dataStreamAliases**: There is a potential risk that the 'custom' method may return null or the return object may not have a 'getDataStreamAliases' method resulting in a NullPointerException. The method also assumes that DataStreamMetadata.TYPE and DataStreamMetadata.EMPTY will always fetch the right object, any changes to these may result in incorrect fetch of data stream aliases.

**nodeShutdowns**: The potential risks in this code could be related to null pointer exceptions if the `custom()` method isn't designed to handle null inputs. There could be a risk if the `TYPE` is, unexpectedly, null or not present in the storage. The method always returns an instance of `NodesShutdownMetadata`, but it could be an EMPTY instance, which may not be expected by the calling code, leading to unexpected behaviors or exceptions later on.

**isIndexManagedByILM**: Though the function seems to be well implemented, but there might be risks hiding in the detail. A risk could be that the function checks for null or empty lifecycle policy names but it doesn't explicitly handle null index metadata. If null index metadata were to be provided, this could result in a NullPointerException. Additionally, the assumption that if none of the earlier conditions are met, the index is managed by ILM might not hold true under certain unforeseen scenarios, leading to incorrect boolean values being returned.

**customs**: Since this is purely a getter method, there may not be any immediate security risks or bugs associated with it. But it directly exposes the internal structure (Map<String, Custom> customs). If 'custom' object isn't properly sanitized or validated when put into this map, it can lead to security and data integrity issues.

**reservedStateMetadata**: There are no obvious risks, security issues or bugs in this code snippet. However, directly returning a private object can lead to unforeseen consequences like modification of the object itself unless the object is inherently immutable or the returned value is an unmodifiable view.

**indexGraveyard**: This is a simple getter method, which usually presents no risks or bugs. However, it depends on the implementation of the 'custom' method and the 'IndexGraveyard.TYPE'. If these have any bugs or security vulnerabilities, they would impact this function as well.



**custom**: There seems to be no particular error handling or null checks, which means that the method could potentially throw a NullPointerException if the map is null. Besides, the unchecked cast can lead to a ClassCastException if the object retrieved from the customs map is not type-compatible with the specified generic type T. The SuppressWarnings annotation is used to suppress compiler warnings for unchecked type operations within the method.

**getTotalNumberOfShards**: There are no apparent risks with this function. It does not modify any internal state, making it free from side effects. However, in a multi-threaded environment, incorrect usage could potentially lead to race conditions. A risk might occur if 'totalNumberOfShards' is updated by another thread while this method is being called.

**getTotalOpenIndexShards**: This method does not seem to have any obvious risks, bugs, or security issues. However, without understanding the context of this code, it's hard to provide a comprehensive security analysis. The usage of a getter method is generally considered safe unless the use or amendment of its return value poses a security risk in the larger context of the application.

**iterator**: This iterator() doesn't include any error-handling or exception mechanism if the 'indices' hashmap is not initialized or is empty. Moreover, the direct exposure of raw data through an iterator may lead to potential data manipulation risks. It also can lead to unintended consequences if used in a multi-threaded environment when one thread is modifying the collection while another is iterating over it.

**stream**: As it currently stands, there are no immediately noticeable security issues, risks, or potential bugs with this function. However, without seeing the surrounding implementation or usage of this function, it's impossible to definitively state that this function is risk-free. The risk may arise based on how this function is used. For instance, if 'indices' is not properly populated or suitably thread-safe, this might lead to data inconsistency issues or ConcurrentModificationException respectively.

**size**: Given the simplicity of this function, it appears to have minimal risk. However, if 'indices' hasn't been initialized properly, calling '.size()' on it might result in a NullReferenceException.

**isGlobalStateEquals**: The function does not handle null objects, there might be the risk of a NullPointerException if any of the Metadata objects passed to function is null. It assumes that all the variable parameters (coordinationMetadata, persistentSettings, hashesOfConsistentSettings, etc.) in the Metadata objects are not null. Furthermore, implicit objects comparison using equals without proper null check could also lead to similar NullPointerException.

**diff**: The function assumes that previousState is a genuine Metadata object. An incorrect or malicious object could lead to invalid results or runtime errors. Moreover, if this method is called before any state exists, it can lead to a NullPointerException.

**readDiffFrom**: This function does not have any explicit error handling mechanism, so if any error occurs while reading from the StreamInput, it throws an IOException which needs to be handled by the caller. Not handling such an exception could propagate the error up the call stack and disrupt program flow. Also, there's a risk associated with versioning as any non-compatible older versions might fail to execute the operation successfully.

**fromXContent**: The method throws an IOException but does not handle it, which might cause the program to stop unexpectedly if an IO error occurs. Also, there are no null checks on the passed 'parser' object, so it can throw a NullPointerException if a null 'parser' object is passed.

**toXContentChunked**: The function commits to specific internal state representations (version, cluster_uuid etc.) which might be risky if these state representations change in the future. There is no error handling in the function, which can result in unexpected behavior when the input parameter is of unexpected form or value. The implementation uses numerous hard coded strings, which pose a risk for future code changes, and also might hide potential bugs if the string values are mistyped.

**getMappingsByHash**: The method does not have any specific risks, bugs, or security issues. It is just a simple getter method returning a reference to private instance variable. However, since it directly exposes the reference to the private object, there is a potential risk of external modifications. It is better to return a read-only version of the map or a deep copied version, if the modifications are not desirable.

**MetadataDiff.writeTo**: The method heavily hinges on checking transport versions to serialize data appropriately. But it does not seem to handle situations where the 'StreamOutput' instance's 'getTransportVersion' method fails or if the transport version is not recognized. Also, there's a reliance on the 'NOOP_METADATA_DIFF_SAFE_VERSION' and 'NOOP_METADATA_DIFF_VERSION' constants to determine whether the data should be serialized differently. The method assumes that these constants are always set correctly, and this can lead to risks if they are not. Lastly, there are no null checks for the transported data which may cause null reference exceptions.

**MetadataDiff.apply**: There could be a risk of unexpected behaviour if the updatedIndices are not equal to part.indices yet the function treats them as equal. Additionally, there are no null checks or error handling mechanisms which means that this function may throw NullPointerExceptions at runtime if inputs are not valid. This could potentially lead to system failure in real-time application.

**readFrom**: This code could be a potential source of several types of exceptions including IOException if something goes wrong during the reading from the stream. Sterilization issues may occur if the version of the used classes is not compatible with the serialized data in the stream. Furthermore, referencing the missing data in the stream, such as in instances when map values or custom index metadata are missing or incorrectly formatted could result in null pointer exceptions.

**writeTo**: From the provided code snippet it's not completely clear if there are any potential risks, bugs, or security flaws. If 'out' (StreamOutput) is null, it could throw a NullPointerException. It is also necessary to make sure that the getTransportVersion function is reliable. If it doesn't return the correct version, it can cause versions mix-up, which may lead to malfunction and making settings, hashes and indices not written correctly. Features that depend on TransportVersions could break and cause the system to operate incorrectly or fail completely.

**builder**: This method holds no risk in terms of security vulnerabilities or bugs as the method itself is quite simple. However, there are risks involved in the Builder pattern itself. If not implemented properly, the constructed object may become inconsistent or not fully initialized.

**builder**: There are no apparent security issues, bugs, or risks from the provided code snippet as it only creates and returns new 'Builder' objects.

**copyAndUpdate**: Potential risk could be null values passed in as Lambda function (updater) to the copyAndUpdate method. If a null updater is supplied, a NullPointerException would be thrown when calling updater.accept(builder).

**Builder.put**: Some possible risks associated with this method include the lack of explicit null check conditions that can result in NullPointerException if null values are passed, an unchecked typecast operation in the indices map assignment that may lead to ClassCastException if incompatible types are provided and potential concurrency issues if the Builder class is accessed by multiple threads simultaneously as it does not appear to be thread-safe.

**Builder.put**: There could be potential risks associated with concurrency, as more than one thread might attempt to update the same IndexMetadata concurrently but no locking mechanism are in place. Possible issues could arise if the inputted IndexMetadata object is null. Also, if the indices collection allows null values, adding IndexMetadata with null as the key will lead to NullPointerException.

**Builder.maybeSetMappingPurgeFlag**: This function relies heavily on the condition that if any of 'previous', 'updated', 'previous.mapping()', and 'updated.mapping()' are null, the function should return immediately. If any of these objects are null, the function will effectively do nothing which could lead to issues if the expected behavior is not performed. Additionally, there is no exception or error handling, nor any notification when one of the objects is null which increases the risk of unnoticed malfunction or bugs.

**Builder.unsetPreviousIndicesLookup**: The risk here can be associated with absence of null check for 'current' object. If 'current' is null, it might give Null Pointer Exception while calling 'current.getAliases()', 'current.isHidden()', 'current.isSystem()', 'current.getState()'.

**Builder.get**: There isn't an apparent coding risk with this method, as it is just a simple getter. However, a potential risk could arise if the provided index does not exist within the indices collection. This may result in a null being returned, which could cause NullPointerException if not handled properly within the client code.

**Builder.getSafe**: Potential risks could include null value exceptions if the index object passed to the function is null. In addition to this, if the getIndexName, getUUID, or the getIndexUUID methods are not implemented correctly or return null, the function may encounter NullPointerExceptions.

**Builder.remove**: Potential risks involve the usage of the 'checkForUnusedMappings' flag, which if set incorrectly, might lead to unpredictable results. The function does not have error handling for situations when the provided index doesn't exist in 'indices'. It is not clear if the function handles null or different object types as input for 'index'.

**Builder.removeAllIndices**: The potential risks linked with this function are associated with synchronization and state mutation. It directly manipulates several internal variables of the Builder class. In a multi-threaded environment, this could lead to data inconsistencies and synchronization issues. Another downside is that once this function is called, no index data can be recovered.

**Builder.indices**: Potential risks could include passing a null or improperly constructed map to the method, which could result in a Null Pointer Exception. Also, if the 'put' method is not correctly synchronized in a multithreaded context, it can lead to data inconsistency.

**Builder.updateAliases**: The function does not handle null keys in the alias map which can result in NullPointerExceptions. This could introduce bugs if the function is ever invoked with metadata containing such aliases. Additionally, the function modifies the alias mappings directly, without any synchronization mechanisms, posing risks for potential race conditions.

**Builder.putAlias**: A possible risk here is that the method doesn't handle situations when the parameters are null since it immediately throws NullPointerException. This might be intended but can result in abrupt termination of the program. No checks or sanitization are conducted on the alias string either which can potentially be a security issue.

**Builder.removeAlias**: There are no clear checks on whether the inputs 'alias' and 'index' are valid, other than not being null. This method could raise unexpected exceptions if the index does not exist in the 'aliasedIndices'. There is also potential risk for a 'ConcurrentModificationException' if the 'aliasedIndices' is being modified by other threads while it's being iterated here. Synchronization is missing which could lead to race conditions in multithreaded code.

**Builder.put**: The function assumes that the inputted IndexTemplateMetadata.Builder object is valid and can produce a usable IndexTemplateMetadata object when build() is called. If the build() method of the inputted IndexTemplateMetadata.Builder instance fails or returns a null object, this could cause unexpected errors or application crashes.

**Builder.put**: There are no basic null checks in the code which can result in Null Pointer Exception if a null value is passed as the parameter. The function doesn't handle the situation where a value with the same key already exists in the map which might result in unexpected behavior.

**Builder.removeTemplate**: There is no check to see if the template exists in the list before trying to remove it. This might lead to errors in some cases. Also, it does not handle situations where a null or an empty string is passed as a parameter which could lead to the whole templates being cleared or an IllegalArgumentException being thrown.

**Builder.templates**: Cases when the input map is null or contains null keys/values are not taken into consideration, causing potential null pointer exceptions. In multithreaded environments, there can be issues due to concurrent modifications of the templates map.

**Builder.put**: From what can be seen in the code there are no security issues present. However, the risks that are noticeable include potential memory leaks and high memory usage by the conversion of hashmap every time a component is added. There is a risk that the ComponentTemplateMetadata object being retrieved and the new ComponentTemplateMetadata being stored could be different thereby giving rise to race conditions in multi-threaded environments.

**Builder.removeComponentTemplate**: There are potential issues with null handling and thread safety. Since the function uses Optional.ofNullable(), this suggests that there is a possibility for the given ComponentTemplateMetadata to be null, leading to NullPointerException if not handled properly. The function does not use any synchronization mechanism when accessing and modifying the customs map, so it might lead to unpredictable results when accessed by multiple threads simultaneously.

**Builder.componentTemplates**: There might be a risk of having a null pointer exception if the `componentTemplates` map passed in the argument is null. Also, if instances of 'ComponentTemplate' contained in the map are mutable and are modified externally after being passed to this method, it could lead to inconsistencies.

**Builder.indexTemplates**: There can be an issue if null Map is provided to the method, it should be handled properly. If the ComposableIndexTemplateMetadata.TYPE key is already present in 'customs' Map, it would get overwritten without any warning. Also, the method is assumed to be called from single threaded context, if it is not the case then concurrency issues may arise.

**Builder.put**: The method could contain potential risks due to a lack of thread safety. As the Builder instance's 'customs' field is being manipulated, making it prone to race conditions if the method is called concurrently by multiple threads. Additionally, there is a risk of null pointer exception if the 'customs' map does not contain ComposableIndexTemplateMetadata.TYPE key, which is not being checked.

**Builder.removeIndexTemplate**: The main risk lies in the potential for a null pointer exception as the function assumes that ComposableIndexTemplateMetadata.TYPE is present in the customs map. If it is not present or null, there may be errors. Further, if the name argument is invalid or does not exist in the existing templates, the function could fail.

**Builder.dataStream**: A risk that stands out is, it doesn't have any null-checks or error handling mechanisms. In case the 'dataStreamMetadata' or 'dataStreams' method returns null, it could lead to a NullPointerException when trying to call the 'get' method. This needs to be appropriately handled to avoid program crashes.

**Builder.dataStreams**: One potential risk arises from the validation operation of dataStreams. If the validation fails or if the 'get' method invoked on the indexes throws an exception, it can cause the function to fail. There is no checks or error handling for such cases in this code snippet. Furthermore, no null check is performed on the maps passed into the method, which could potentially lead to NullPointerExceptions.

**Builder.put**: The function does not seem to check the validity of the data stream before adding it to the customs. This can lead to a risk of adding inappropriate, corrupted or malicious data. This function might break in case the provided data stream has an invalid structure or data. Also, if data validation in the 'DataStream.validate()' function is not robust, it may let pass inappropriate data which can cause bugs or security issues later in the system.

**Builder.dataStreamMetadata**: Since the method uses getOrDefault, it might mask problems with missing keys and continue processing with a default or empty metadata. This might result in unexpected behavior or data consistency problems downstream. It is unclear how the method behaves if `customs` is null, so there may be a risk of NullPointerExceptions. Also, as the `customs` map structure is directly exposed, it may possibly lead to unintended modifications, causing data integrity issues.

**Builder.put**: The method does not handle any exception, which could lead to potential unexpected behavior when executing the application. A possible risk is encountering a NullPointerException if one of the parameters of the method is null. Also, it might fail to update the 'DataStreamMetadata' if concurrent threads are modifying and accessing the same 'DataStreamMetadata'.

**Builder.removeDataStream**: There is a potential risk if the name parameter passed does not correspond to an existing DataStream in the customs map, this might lead to incorrect operations or exceptions. Additionally, it may also cause issues if you're not careful about managing the 'previousIndicesLookup' variable, since it's set to null each time this function is invoked.

**Builder.removeDataStreamAlias**: The main risk source in this code comes from the use of the '==' operator to compare DataStreamMetadata objects, as this might not accurately reflect equality in case new properties are added to the DataStreamMetadata class. Another potential source of a bug is lack of error handling. If there's an exception while updating the DataStreamMetadata, the system might behave unexpectedly. Lastly, the function doesn't check if the alias or the data stream exist before attempting to delete.

**Builder.getCustom**: There is a potential risk of a NullPointerException if the 'customs' collection is null. Also, if an invalid 'type' is provided which does not exist in the 'customs' collection, the method will return null, which could possibly lead to unintended behavior.

**Builder.putCustom**: Potential risks include passing null values to the 'putCustom()' method, which will result in a NullPointerException being thrown by the 'requireNonNull()' method. Another risk is a case where the 'type' being passed as a key to the 'customs' map is not unique. In this case, any existing 'custom' object associated with that 'type' would be overwritten without warning. If keys are not well managed, this could lead to data loss.

**Builder.removeCustom**: The potential risks related to this method are mostly around the improper usage of the 'type' parameter. If a null or an invalid 'type' is passed, it may likely cause exceptions or an unsuccessful removal operation. Another possible risk is the 'customs' data structure, if it is not properly initialized or is null when the method is called, this could cause a NullPointerException. Besides, if the 'customs' collection is being accessed by multiple threads simultaneously, race conditions or other thread safety issues may occur.

**Builder.removeCustomIf**: The risk associated with this code is mainly related to handling the BiPredicate p. If a null value is passed as the BiPredicate, calling removeAll might lead to a NullPointerException. Additionally, removing while iterating may also throw a ConcurrentModificationException if the underlying collection of customs doesn't support it well.

**Builder.customs**: There is a potential risk of Null pointer exception if the input map, 'customs', itself is null. This method also doesn't protect against overwriting existing entries in the 'customs' map of the builder with the same keys, which may produce unexpected behaviours.

**Builder.put**: There's a risk of NullPointerException if the input map is null. This method does not handle the scenario where `reservedStateMetadata` would be null. If a null map is passed to this method, it will result in a failure and could result in an application crash.

**Builder.put**: One potential risk involves the handling of duplicate keys. If two metadata objects with the same namespace are added, previous data is overwritten. This could lead to data loss if not properly managed. There doesn't appear to be a mechanism for dealing with null or invalid namespaces. Moreover, there is no error handling code present, which could result in unhandled exceptions.

**Builder.removeReservedState**: Risks associated with this code can include lack of error handling in cases when the input 'metadata' parameter is null, does not exist in the 'reservedStateMetadata' or the 'namespace()' method returns null. These scenarios can potentially lead to NullPointerExceptions. ConcurrentModificationException can happen if multiple threads are modifying 'reservedStateMetadata' simultaneously.

**Builder.indexGraveyard**: There do not appear to be major security issues or bugs in this code. However, as it is a public method, it could potentially be misused by permitting improper access to the map. There are no null checks or error handling in this function, so passing a null argument could result in an error.

**Builder.indexGraveyard**: The method doesn't contain any exception handling mechanism. An unchecked type casting can lead to a ClassCastException if the object returned by getCustom(IndexGraveyard.TYPE) is not of IndexGraveyard type.

**Builder.updateSettings**: The method does not validate the provided settings before using them, which may cause unexpected behavior or errors if the settings are invalid or incompatible. If the method is invoked with null settings, it would override the existing settings of the indices with null, losing the original settings data. The indices array is used directly without null check or protection against alteration from outside, potentially leading to a NullPointException or incorrect functionality.

**Builder.updateNumberOfReplicas**: If the 'indices' field contains a null value, this method will throw a Null Pointer Exception. Also, concurrently modifying the 'indices' Map while this method is running can lead to inconsistent data, as this method is not thread-safe.

**Builder.coordinationMetadata**: There are no apparent security risks or bugs in this function. However, it does not handle or check for null values. Therefore, if a null CoordinationMetadata object is provided as an argument, it might lead to null pointer exceptions in other parts of the code where methods of 'coordinationMetadata' are accessed.

**Builder.transientSettings**: There are no apparent risks with this function. It simply returns the transientSettings object of the current instance, without modifying any state or performing unsafe operations.

**Builder.transientSettings**: There don't seem to be any apparent risks or bugs in the method. However, if the 'Settings' object passed is mutable and is changed afterwards, it can lead to undesired behavior as the 'Settings' object holds a reference to the original object. Similarly, there are no explicit null checks, so if a null is passed as the 'settings' parameter, it may result in Null Pointer Exceptions in the subsequent uses of the 'transientSettings'.

**Builder.persistentSettings**: As a getter method, it has a minimal risk of creating either bugs or security issues. However, if the 'persistentSettings' object is mutable, this could lead to state-related bugs if accessed and modified concurrently by multiple threads. Besides, returning a direct reference to an internal data structure might give unwanted access to class internals.

**Builder.persistentSettings**: There's no risk or security issues are apparent in this method as it's a standard setter method. However, if any validations or sanitizations are required on the 'Settings' object, they are not being done in this method.

**Builder.hashesOfConsistentSettings**: If the 'DiffableStringMap' passed is in an invalid state, there might be potential bugs or crashes during further operations. Additionally, if this method is exposed as public, it could be a possible place where bad data gets introduced into the final object being built, leading to a potentially corrupted object.

**Builder.hashesOfConsistentSettings**: The current code does not validate the input parameter and could potentially throw an exception if null or invalid inputs are passed to the function. Additionally, the function is tightly coupled with the DiffableStringMap class, making it difficult to test or modify independently.

**Builder.version**: There is no exact risk involved with this method as it is a simple setter, it neither interacts with any external systems nor handles any sensitive data. A potential issue, however, might be neglecting to validate the input parameter and blindly setting it, which could lead to inconsistent state of objects if the function is called with invalid data.

**Builder.clusterUUID**: There's little risk in this method, as it is a straightforward, standard setter used in the Builder pattern. However, there's potential for issues if incorrect or invalid values are supplied for 'clusterUUID', as this method does not perform any validation checks.

**Builder.clusterUUIDCommitted**: As it's a setter method implemented in Builder pattern which is used for creating an object in a flexible way, there don't appear to be any specific security risks or bugs tied to this function. However, because this function directly manipulates the 'clusterUUIDCommitted' property, consumers must be aware that this function does mutate the state of the Builder object. Therefore, it's crucial to use this function judiciously to prevent the creation of objects in an undesired state.

**Builder.generateClusterUuidIfNeeded**: There is no risk associated with this code assuming that it's being invoked under proper synchronization in multi-threaded environments. In terms of code quality, this method adheres to the 'Single Responsibility Principle' - it only generates a UUID if needed, nothing else.

**Builder.build**: The build function is currently hard-coded to pass 'false' to an overloaded version of the method, which may not be obvious to other developers who use it. This could lead to unintentional behavior if they are not aware of this design choice.

**Builder.build**: One major risk associated with this function is related to its handling of Aliased Indices. If invalid or inconsistent index metadata is passed, the 'validateAlias' or 'ensureNoNameCollisions' methods could potentially cause runtime exceptions. Additionally, the function doesn't have any explicit error handling or validation for the input variables, making it vulnerable to invalid, null or undefined input. Also, it operates under the assumption that 'indices', 'aliasedIndices' and other data structures are correctly populated which could lead to problems if they aren't.

**Builder.ensureNoNameCollisions**: Since user inputs are directly used for validation, there's a risk of NullPointerException if null data is passed. Also, this function serves multiple purposes (checking duplicates in index aliases vs data stream aliases, indicesMap vs data stream aliases, index aliases vs indicesMap, etc) which increases complexity and debugging difficulties. In case of any bugs or changes, it would impact all these validations.

**Builder.collectAliasDuplicates**: There are potential risks in treating aliases as keys in maps: if two indices or data streams have the same alias, unexpected results may occur, as the function only registers the conflict after encountering the first instance. Additionally, there appears to be no exception handling code, meaning that if an error occurs during processing, the function may crash or produce invalid results.

**Builder.collectAliasDuplicates**: A risk in the current implementation could be performance issues when there are a large number of indices or aliases, as the function uses nested loops to perform the check, resulting in a time complexity of O(n^2). Moreover, there is also potential for Null Pointer Exception if the getAliases() method returns null.

**Builder.buildIndicesLookup**: From the perspective of risks, one major risk could be data inconsistency if multiple threads are trying to modify the indices lookup map due to the TreeMap and HashMap not being thread-safe. The usage of 'assert' statements can cause issues as they are generally used for debugging and may be ignored in production if the JVM does not enable them. Other potential risks could be related to incorrect IndexMetadata or DataStreamMetadata as the function does not have any error handling or logging in place for dealing with incorrect or inconsistent input data.

**Builder.makeDsAliasAbstraction**: Risks and vulnerabilities in this code could include a NullPointerException if the alias or dataStreams map provided are null or if the alias contains a data stream name that does not exist in the dataStreams map. Another potential issue is data integrity if the alias or dataStreams map are modified concurrently by another thread while this method is executing.

**Builder.isNonEmpty**: Though the function is properly checking for null and non-empty conditions, there is a risk if the list 'idxMetas' contains null objects. This function would return true even if there are null elements inside the non-null list, which may cause problems depending on how the output of this function is used elsewhere in the software.

**Builder.validateAlias**: The risks associated with this method include potential misuse of alias due to lack of input sanitization. If the input to the method is not validated elsewhere, alias names could be crafted in a way to trigger unwanted behavior. This can expose a security flaw. There is also a risk of losing information if an alias is incorrectly ascribed to have more than one write index or both types of indices.

**Builder.assertDataStreams**: There exists a risk of Null Pointer Exception if indices map does not contain Index name found in datastream indices. Moreover, the function does not handle the scenario where the passed indices map or datastream metadata is null, which could also lead to Null Pointer Exception. It does not validate the input parameters and directly tries to utilize them.

**Builder.fromXContent**: 1. If the XContentParser data doesn't match the expected format, it could lead to exceptions and program interruption. 
2. Error handling for tokens could be improved by informing the caller exactly which token was expected.
3. No exception handling for errors caused by invoked functions (builder.coordinationMetadata, Settings.fromXContent, IndexMetadata.Builder.fromXContent, etc.), which may lead to unexpected behaviors or errors.
4. JSON injection: If the input to this function is in any way influenced by user input, there is a risk of JSON injection. 
5. Unvalidated inputs can potentially lead to security risks and should be validated.

**Builder.dedupeMapping**: This code handles null checks for the mapping of indexMetadata effectively, reducing risks related to null pointer exceptions. However, there can potentially be risks related to concurrent modification of the 'mappingsByHash' hashmap if the function is accessed by multiple threads simultaneously. There is no error handling mechanism present in the case where the SHA256 hashing fails. Also, the function does not handle the scenario of hash collisions, because it assumes every unique hash corresponds to a unique mapping, which is not always true.

**Builder.dedupeMapping**: One potential risk of this method is the potential for hash collisions. Sha256, although having a very low probability, can still result in hash collisions where two different mappings could result in the same hash value. In such a case, the method could overwrite distinct mappings. Another risk involves concurrent access to the shared 'mappingsByHash' object. If this object is accessed by multiple threads without proper synchronization, race conditions may occur, potentially leading to inconsistent or unexpected behavior.

**toXContent**: If the Metadata state is invalid or null, the toXContent method might cause a NullPointerException. Also, if the 'wrapAsToXContent' method in the 'ChunkedToXContent' class is not implemented properly, it could cause issues with the conversion. Moreover, there are no checks for IOExceptions that may be thrown from the 'toXContent' invocation.

**fromXContent**: The major risks associated with this involves improper input handling and unexpected input. There is a potential for an IOException to be thrown during execution. This could result from various issues, such as a failure in input/output operations, a corrupt XContentParser instance input, or network connection issues. Also, there seems to be no validation check for the input, meaning that invalid arguments can cause the program to behave unexpectedly.

