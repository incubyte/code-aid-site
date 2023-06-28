+++
categories = ["Documentation"]
title = "GlowAdvancement.java"
+++

## File Summary

- **File Path:** src\main\java\net\glowstone\advancement\GlowAdvancement.java
- **LOC:** 117
- **Last Modified:** 1 year 0 months
- **Number of Commits (Total / Last 6 Months / Last Month):** 10 / 0 / 0
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** 6 / 0 / 0
- **Top Contributors:** mastercoms (4), Chris Hennick (2), Pr0methean (1)

{{< details "File source code " >}}
```java
package net.glowstone.advancement;

import com.flowpowered.network.util.ByteBufUtils;
import com.google.common.collect.ImmutableList;
import io.netty.buffer.ByteBuf;
import io.papermc.paper.advancement.AdvancementDisplay;
import lombok.Data;
import org.bukkit.NamespacedKey;
import org.bukkit.advancement.Advancement;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.jetbrains.annotations.Unmodifiable;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Data
public class GlowAdvancement implements Advancement {

    private final NamespacedKey key;
    private final GlowAdvancement parent;
    private final List<String> criteriaIds = new ArrayList<>();
    private final List<List<String>> requirements = new ArrayList<>();
    private GlowAdvancementDisplay display = null;

    /**
     * Creates an advancement with the default notification.
     *
     * @param key    the namespace and name of the advancement
     * @param parent the prerequisite advancement, or null
     */
    public GlowAdvancement(NamespacedKey key, GlowAdvancement parent) {
        this.key = key;
        this.parent = parent;
    }

    /**
     * Creates an advancement.
     *
     * @param key     the namespace and name of the advancement
     * @param parent  the prerequisite advancement, or null for no prerequisite
     * @param display the parameters for the notification when this advancement is earned, or null
     *                for the default notification
     */
    public GlowAdvancement(NamespacedKey key, GlowAdvancement parent,
                           GlowAdvancementDisplay display) {
        this.key = key;
        this.parent = parent;
        this.display = display;
    }

    /**
     * Adds a criterion.
     *
     * @param criterion TODO: document where this ID comes from
     */
    public void addCriterion(String criterion) {
        if (!criteriaIds.contains(criterion)) {
            criteriaIds.add(criterion);
        }
    }

    public void addRequirement(List<String> criteria) {
        requirements.add(criteria);
    }

    @Override
    public List<String> getCriteria() {
        return ImmutableList.copyOf(criteriaIds);
    }

    @Override
    public @NotNull @Unmodifiable Collection<Advancement> getChildren() {
        return null;
    }

    @Override
    public @NotNull Advancement getRoot() {
        return null;
    }

    /**
     * Writes a notification of earning this advancement to a byte buffer.
     *
     * @param buf a {@link ByteBuf}
     * @return {@code buf} with this advancement written to it
     * @throws IOException if a string is too long
     */
    public ByteBuf encode(ByteBuf buf) throws IOException {
        buf.writeBoolean(parent != null);
        if (parent != null) {
            ByteBufUtils.writeUTF8(buf, parent.getKey().toString());
        }
        buf.writeBoolean(display != null);
        if (display != null) {
            display.encode(buf, true, true, false);
        }
        ByteBufUtils.writeVarInt(buf, criteriaIds.size());
        for (String criteriaId : criteriaIds) {
            ByteBufUtils.writeUTF8(buf, criteriaId);
        }
        ByteBufUtils.writeVarInt(buf, requirements.size());
        for (List<String> requirement : requirements) {
            ByteBufUtils.writeVarInt(buf, requirement.size());
            for (String criterion : requirement) {
                ByteBufUtils.writeUTF8(buf, criterion);
            }
        }
        return buf;
    }

    public @Nullable AdvancementDisplay getDisplay() {
        return display;
    }
}

```
{{< /details >}}



## addCriterion
#### Code Complexity: 5
### Overview
The 'addCriterion' method is an instance method inside a class that is designed to add a certain criterion to a list of criteria. It takes one string argument 'criterion'. The method's job is to check if this criterion is not already in the list named 'criteriaIds' (presumably a list of ids, stored as strings). If the criterion is not in the list, the method will add it to the list to keep track of unique criterion ids.

### User Acceptance Criteria
```gherkin
Feature: Adding Criteria
Scenario: New Criterion Id
Given a new criterion id is available
When the addCriterion method is invoked with this id
Then the criteriaIds list should include this new id

 Scenario: Duplicate Criterion Id
Given a criterion id that already exists in criteriaIds
When the addCriterion method is invoked with this id
Then the criteriaIds list should remain unchanged.
```

### Refactoring
Opportunity 1: To mitigate the aforementioned risk, you might want to consider adding synchronization to the method to make it thread-safe. Opportunity 2: A more modern, functional style of programming might suggest using a set collection instead of list to store criteria id's, effectively eliminating the need to check for duplicates manually. It appears that the ordering of elements is not important here, so a set could be a better choice for this.{{< details "Function source code " >}}
```java
public void addCriterion(String criterion) {
        if (!criteriaIds.contains(criterion)) {
            criteriaIds.add(criterion);
        }
    }
```
{{< /details >}}

## addRequirement
#### Code Complexity: 1
### Overview
The function 'addRequirement' is a public method that accepts a list of strings as an input parameter and adds it to the 'requirements' list. It does not return any value.

### User Acceptance Criteria
```gherkin
Feature: Requirement Addition
Scenario: Valid Criteria Addition
Given a list of valid criteria
When the method 'addRequirement' is called with the criteria as argument
Then the criteria should be added to the 'requirements' list.
```

### Refactoring
1. Validation: add a null validation check before attempting to add the incoming criteria to the 'requirements' list to prevent Null Pointer Exception.
2. Error Handling: implement error handling such as try-catch blocks to handle unexpected scenarios.{{< details "Function source code " >}}
```java
public void addRequirement(List<String> criteria) {
        requirements.add(criteria);
    }
```
{{< /details >}}

## getCriteria
#### Code Complexity: 1
### Overview
This is a simple getter method in Java. The method is named 'getCriteria' and returns a list of strings. The method uses the 'ImmutableList' class from Google Guava library to create an immutable copy of 'criteriaIds'. By returning an immutable list, it ensures that the returned list cannot be modified, enhancing the security and integrity of the data.

### User Acceptance Criteria
```gherkin
Feature: Get Criteria
  Scenario: Fetch criteria
  Given the criteria are available
  When a request is made to fetch criteria
  Then the method should return an immutable list of all criteria
```

### Refactoring
On the refactoring side, this method is simple and follows the single responsibility principle which is a good practice in designing methods. However, it might be better to return an unmodifiable list using the standard Java Collections.unmodifiableList which would reduce the dependency on the external library Google Guava.{{< details "Function source code " >}}
```java
@Override
    public List<String> getCriteria() {
        return ImmutableList.copyOf(criteriaIds);
    }
```
{{< /details >}}

## getChildren
#### Code Complexity: 1
### Overview
This function is a public method named getChildren, part of an interface or superclass that is being overridden. It is designed to return a collection of Advancement objects which are supposed to represent some form of progression or attainment in the system. It is defined as Non-Null and Unmodifiable, implying that the returned Collection can't be null or be changed after it's been returned. However, in this implementation, the function is hardcoded to return null.

### User Acceptance Criteria
```gherkin
Feature: Fetch Children Advancements
 Scenario: Fetching Child Advancements in System
 Given an advancement/object that has child advancements
 When the 'getChildren' method is called on the advancement
 Then it should return a non-null, unmodifiable collection of child advancements
```

### Refactoring
Refactoring needed for this method. Instead of a hardcoded null, it should return an appropriate collection of Advancement objects, even an empty collection if there are no children associated with the particular parent. Using java.util.Collections.unmodifiableCollection() would be helpful to maintain the desired Unmodifiable characteristic if the underlying collection is subject to change, ensuring data integrity and fulfilling the contract of the method. This will also resolve the risks detailed above.{{< details "Function source code " >}}
```java
@Override
    public @NotNull @Unmodifiable Collection<Advancement> getChildren() {
        return null;
    }
```
{{< /details >}}

## getRoot
#### Code Complexity: 1
### Overview
This function, getRoot(), appears to be a method of a class that deals with 'Advancements' in a certain context. It is a public method and therefore can be accessed from any context. The method has been annotated as NotNull, suggesting that it should always return a non-null value. However, in its current implementation, it is always returning null, which is a contradiction to the previous annotation.

### User Acceptance Criteria
```gherkin
Feature: Get Advancement Root
 Scenario: Call to get Advancement Root
 Given the advancement exists
 When a call to the getRoot method is made
 Then it should return the root advancement not a null
```

### Refactoring
First, to adhere to the @NotNull annotation, the getRoot() method should be refactored to ensure it does not return null. If there are cases where there isn't a meaningful 'root' to return, consider throwing an explicit exception or returning an Optional<Advancement>. Remember, the user of this function likely expects a non-null value, and your implementation should respect that contract.{{< details "Function source code " >}}
```java
@Override
    public @NotNull Advancement getRoot() {
        return null;
    }
```
{{< /details >}}

## encode
#### Code Complexity: 10
### Overview
The 'encode' method is responsible for writing several fields into a ByteBuf. These fields are 'parent', 'display', 'criteriaIds' and 'requirements'. If 'parent' is not null, its key is converted into a string format and written into 'buf'. Similarly, if 'display' is not null, it is encoded with certain parameters and written into 'buf'. The count of 'criteriaIds' is first written into 'buf' and then each 'criteriaId' is written. The count of 'requirements' is also written into 'buf', then for each requirement, the count of 'requirement' and each 'criterion' are written.

### User Acceptance Criteria
```gherkin
Feature: Encoding data into ByteBuf
Scenario: All data is present
Given that 'parent', 'display', 'criteriaIds', and 'requirements' are not null
When 'encode' method is called
Then all the parts of each data elements are written into 'buf'.
Scenario: Missing parent
Given that 'parent' is null
When 'encode' method is called
Then the parent part will be missing but the process will continue normally with other elements.
Scenario: Missing display
Given 'display' is null
When 'encode' method is called
Then the display part will be missing but the process will continue normally with other elements.
```

### Refactoring
This function could be refactored to make more efficient use of object-oriented principles. The encoding behavior of each field could be encapsulated within their respective classes. For example, a 'encodeToBuf' method in the 'Parent', 'Display' etc. classes. This would make the code more scalable and easier to maintain. Another suggestion would be to use 'Optional' to avoid potential null pointer exceptions.{{< details "Function source code " >}}
```java
public ByteBuf encode(ByteBuf buf) throws IOException {
        buf.writeBoolean(parent != null);
        if (parent != null) {
            ByteBufUtils.writeUTF8(buf, parent.getKey().toString());
        }
        buf.writeBoolean(display != null);
        if (display != null) {
            display.encode(buf, true, true, false);
        }
        ByteBufUtils.writeVarInt(buf, criteriaIds.size());
        for (String criteriaId : criteriaIds) {
            ByteBufUtils.writeUTF8(buf, criteriaId);
        }
        ByteBufUtils.writeVarInt(buf, requirements.size());
        for (List<String> requirement : requirements) {
            ByteBufUtils.writeVarInt(buf, requirement.size());
            for (String criterion : requirement) {
                ByteBufUtils.writeUTF8(buf, criterion);
            }
        }
        return buf;
    }
```
{{< /details >}}

## getDisplay
#### Code Complexity: 1
### Overview
This function is a simple getter for the instance variable 'display' of type AdvancementDisplay. It returns the current value of the 'display' variable. The method returns null in case the 'display' variable has not been initialized.

### User Acceptance Criteria
```gherkin
As this is a getter method, Gherkin scenarios are not applicable in this context.
```

### Refactoring
There's not much scope for refactoring here as this is a simple getter method. However, you may consider implementing Optional<AdvancementDisplay> in the case display is not initialized to avoid potential NullPointerExceptions.{{< details "Function source code " >}}
```java
public @Nullable AdvancementDisplay getDisplay() {
        return display;
    }
```
{{< /details >}}

## Risks & Security Issues
**addCriterion**: There might be a risk for other parts of system in the case of unsynchronized access to the method in a multithreaded scenario. If two threads simultaneously try to add the same criterion, it's possible that the criterion could be added twice to the list, which may lead to invalid state of the data.

**addRequirement**: The function does not include any validation checks on the input parameter. Therefore, if a null or an invalid list of criteria is passed, it might cause unexpected behaviour or in worst case scenario, the system might crash.

**getCriteria**: There are minimal security risks with this method since it returns an immutable copy of the list, and not the actual list itself to prevent modification of the original data. However, there's a risk if the 'criteriaIds' list is not properly initialized or is null, as it would lead to a NullPointerException.

**getChildren**: This method right now is a potential risk and is actually violating its contract by returning null where it's supposed to provide a NonNull value. This could potentially lead to a NullPointerException at runtime, crashing the application or disrupting the user experience. The method is also hardcoded to return null, which suggests that its full implementation may not have been completed.

**getRoot**: The getRoot() function claims to never return null by the use of the @NotNull annotation, which contradicts with its current implementation. Since it's always returning null, it might lead to NullPointerException in code parts where result of this method is used without null check. This inconsistency may lead to unexpected runtime errors.

**encode**: There's a potential risk of NullPointerException if getKey() is called on a null parent. There are also no null checks on 'criteriaId' and 'criterion' while writing into 'buf'. This could result in NullPointerException if there are null values in 'criteriaIds' or 'requirements'. There is also no exception handling in the case of IOException.

**getDisplay**: As this is a simple getter method, there are minimal risks involved. However, it's worth noting that the method is designed to return null in case 'display' has not been initialized, which could lead to NullPointerExceptions if not properly handled.

