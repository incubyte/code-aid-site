---
title: "dbo.uspGetManagerEmployees"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins | Where Clause | Table Name |
|---|---|---|---|---|---|---|
| sstmssqlset |  |  |  |  |  |  |
| sstselect | [RecursionLevel], [EMP_cte].[OrganizationNode].ToString(), [FirstName], [LastName], [BusinessEntityID], [FirstName], [LastName] | NA | NA | [OrganizationNode], [BusinessEntityID] |  | [EMP_cte], [HumanResources].[Employee], [Person].[Person] |
| sstselect | [BusinessEntityID], [OrganizationNode], [FirstName], [LastName], [RecursionLevel] + 1 | NA | NA |  |  |  |
| sstselect | [BusinessEntityID], [OrganizationNode], [FirstName], [LastName], 0 | NA | NA | [BusinessEntityID] | [BusinessEntityID],  | [HumanResources].[Employee], [Person].[Person] |
| sstselect | [BusinessEntityID], [OrganizationNode], [FirstName], [LastName], [RecursionLevel] + 1 | NA | NA | [OrganizationNode], [BusinessEntityID] |  | [HumanResources].[Employee], [EMP_cte], [Person].[Person] |

## Overview

This is the documentation for the `[dbo].[uspGetManagerEmployees]` stored procedure. The purpose of this stored procedure is to retrieve a given manager's employees and their respective information using a recursive query.

## Details

The stored procedure takes one input parameter:

1. `@BusinessEntityID int`: The Business Entity ID of the manager for whom employees are fetched

The result set of this stored procedure includes the following columns:

1. `RecursionLevel`: The level of management of each employee
2. `OrganizationNode`: The hierarchical node of the employee in the organization
3. `ManagerFirstName`: First Name of the manager of the employee
4. `ManagerLastName`: Last Name of the manager of the employee
5. `BusinessEntityID`: Business Entity ID of the employee
6. `FirstName`: First Name of the employee
7. `LastName`: Last Name of the employee

## Information on data

The stored procedure uses data from two tables:

1. `[Person].[Person]`: Contains information about each person in the company
2. `[HumanResources].[Employee]`: Contains information about each employee in the company

## Information on the tables

### [Person].[Person]

This table contains personal information about each person in the company, such as their name or Business Entity ID.

### [HumanResources].[Employee]

This table contains information about employees in the company, such as their management hierarchy and organization structure.

## Possible optimization opportunities

The current code utilizes a recursive CTE, which can sometimes be inefficient. Future revisions of the code may explore using alternative methods for retrieving the employee hierarchy to improve performance.

## Possible bugs

There are no known bugs in the stored procedure.

## Risk

1. Running without a WHERE clause: Since this is a stored procedure, there is no risk of running it without a WHERE clause in any specific query.

## Code Complexity

The code complexity of this stored procedure is relatively low, as it primarily consists of a single recursive CTE and an outer SELECT statement to retrieve the final result set.

## Refactoring Opportunities

The current code is concise and efficient, but the performance can be improved by employing more efficient methods than a recursive query.

## User Acceptance Criteria

```gherkin
Feature: Employees under Manager retrieval
    Scenario: Get all employees under a manager
        Given the Business Entity ID of a manager
        When the [dbo].[uspGetManagerEmployees] stored procedure is executed
        Then it should return a list of employees under the manager with their information

    Scenario: Invalid manager ID provided
        Given an invalid Business Entity ID
        When the [dbo].[uspGetManagerEmployees] stored procedure is executed
        Then it should return an empty result set
```

