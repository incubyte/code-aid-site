+++
categories = ["Documentation"]
title = "CriterionProgress.java"
+++

## File Summary

- **File Path:** /home/chad/dev/Incubyte/Glowstone/src/main/java/net/glowstone/advancement/CriterionProgress.java
- **LOC:** 13
- **Last Modified:** 1 year 11 months
- **Number of Commits (Total / Last 6 Months / Last Month):** 3 / 0 / 0
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** 2 / 0 / 0
- **Top Contributors:** mastercoms (2), momothereal (1)

{{< details "Code " >}}
```java
package net.glowstone.advancement;

import lombok.Data;

import java.util.Date;

@Data
public class CriterionProgress {

    private final boolean achieved;
    private final Date time;

}

```
{{< /details >}}



# Overview

This code is a simple Java class named `CriterionProgress` which belongs to the `net.glowstone.advancement` package. It's purpose is to represent the progress of an advancement criterion which consists of two fields - `achieved` and `time`. The `achieved` field is a boolean value to indicate whether the criterion has been achieved or not. The `time` field is a Date object representing when the criterion was achieved. The class uses the [Lombok](https://projectlombok.org) library annotation `@Data` to automatically generate getters, setters, and other utility methods.

## Sections

1. Class Declaration and Package
2. Properties
3. Lombok Annotation

### 1. Class Declaration and Package

```java
package net.glowstone.advancement;

public class CriterionProgress {
```

This section defines the package that the class belongs to (`net.glowstone.advancement`) and declares the class `CriterionProgress`.

### 2. Properties

```java
private final boolean achieved;
private final Date time;
```

The class has two properties:

1. `achieved`: A boolean value indicating whether the criterion has been achieved or not.
2. `time`: A `java.util.Date` object representing the time when the criterion was achieved. The `final` keyword indicates that these fields cannot be changed after they are initialized.

### 3. Lombok Annotation

```java
import lombok.Data;
@Data
```

The `@Data` annotation from the Lombok library is used in this class. It automatically generates getters, setters, `equals()`, `hashCode()`, and `toString()` methods for the properties in the class.

##  Risks

### Security Issues

None found.

### Bugs

None found.

## Refactoring Opportunities

As this code is short, simple, and adheres to the SOLID principles, there are no significant refactoring opportunities identified.

## User Acceptance Criteria

### Gherkin Scripts

```gherkin
Feature: CriterionProgress
    Scenario: Create CriterionProgress object
        Given a boolean value representing if the criterion has been achieved
        And a Date object representing the time when the criterion was achieved
        When I create a CriterionProgress object
        Then the object should have the given values for achieved and time
```