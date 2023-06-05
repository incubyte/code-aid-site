+++
categories = ["Documentation"]
title = "CriterionProgress.java"
+++


# Overview

This class is a part of the `net.glowstone.advancement` package and is a simple data class that represents the progress of a Criterion. This class has two properties: one for determining whether the criterion is achieved or not, and another for storing the time of achievement.

## Code Structure

1. Importing relevant packages and libraries
2. CriterionProgress class definition
   1. Properties
   2. Constructor

### 1. Importing Packages and Libraries

This class imports the following packages:

- `lombok.Data`: This annotation automatically generates getters and setters, an `equals`, a `hashCode`, and a `toString` method for the class.
- `java.util.Date`: This class is used to store the date and time when the criterion was completed.

### 2. CriterionProgress Class

This class is responsible for maintaining the information about a criterion's progress.

#### 2.1 Properties

The class has two properties:

1. `achieved (boolean)`: This boolean property is used to determine if the criterion has been achieved or not.
2. `time (Date)`: This field is of type `Date` and stores the time at which the criterion was completed.

#### 2.2 Constructor

Since the class uses the `@Data` annotation from Lombok, the constructor, along with the getters, setters, `equals`, `hashCode`, and `toString` methods are automatically generated.

# Risks

## Security Issues

As this class deals with date and time, there might be some concerns about whether it uses the correct timezone or not. However, this is a simple data class, and there is no code manipulation related to time and dates. Therefore, there are no obvious security concerns related to this class.

## Bugs

There are no apparent bugs in this class:

1. The class is quite simple and only contains two properties.
2. Lombok properly generates the required methods.

# Refactoring Opportunities

Because this class is simple and does not contain any complex code, and since the Lombok library is already managing the getter, setter, equals, hashCode, and toString methods, there are no obvious refactoring opportunities for improving this class.