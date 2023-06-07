---
title: "HumanResources.uspUpdateEmployeePersonalInfo"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins | Where Clause | Table Name |
|---|---|---|---|---|---|---|
| sstmssqlset |  |  |  |  |  |  |
| sstmssqlblock |  |  |  |  |  |  |
| sstupdate | NA | [NationalIDNumber], [BirthDate], [MaritalStatus], [Gender] | NA |  | [BusinessEntityID],  | [HumanResources].[Employee] |
| sstmssqlexec |  |  |  |  |  |  |

## 1. Overview

The `[HumanResources].[uspUpdateEmployeePersonalInfo]` stored procedure is used to update an employee's personal information in the `[HumanResources].[Employee]` table.

## 2. Details

**Stored Procedure:** `[HumanResources].[uspUpdateEmployeePersonalInfo]`

**Parameters:**

* `@BusinessEntityID [int]`: The unique identifier of the employee.
* `@NationalIDNumber [nvarchar](15)`: The employee's national identification number.
* `@BirthDate [datetime]`: The employee's date of birth.
* `@MaritalStatus [nchar](1)`: The employee's marital status.
* `@Gender [nchar](1)`: The employee's gender.

## 3. Information on data

This stored procedure updates an employee's personal information using input parameters. The data is stored in the `[HumanResources].[Employee]` table.

## 4. Information on the tables

* `[HumanResources].[Employee]`: This table holds employee records.

## 5. Possible optimization opportunities

* None

## 6. Possible bugs

* Data type mismatch with input parameters

## 7. Risk

* Running the stored procedure without all required input parameters

## 8. Code Complexity

The code is not complex; it is easy to understand as a single `UPDATE` statement.

## 9. Refactoring Opportunities

* None

## 10. User Acceptance Criteria

**Gherkin Scripts:**

```Gherkin
Feature: Update Employee's Personal Information
  Scenario: Update an employee's personal information
    Given an employee with BusinessEntityID 1
    When I update the employee's personal information with new values
    Then the employee's information should be updated in the Employee table
```
