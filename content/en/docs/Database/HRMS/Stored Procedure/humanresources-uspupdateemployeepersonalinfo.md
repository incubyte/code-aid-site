---
title: "HumanResources.uspUpdateEmployeePersonalInfo"
linkTitle: "HumanResources.uspUpdateEmployeePersonalInfo"
description: "HumanResources.uspUpdateEmployeePersonalInfo"
---

# Stored Procedures

## [HumanResources].[uspUpdateEmployeePersonalInfo]
### Summary


- **Number of Tables Accessed:** 1
- **Lines of Code:** 24
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|


### Parameters

| Parameter Name | Data Type | Direction |
|---|---|---|
| @BusinessEntityID | INT | IN |
| @NationalIDNumber | NVARCHAR | IN |
| @BirthDate | DATETIME | IN |
| @MaritalStatus | NCHAR | IN |
| @Gender | NCHAR | IN |

{{< details "Sql Code" >}}
```sql

CREATE PROCEDURE [HumanResources].[uspUpdateEmployeePersonalInfo]
    @BusinessEntityID [int], 
    @NationalIDNumber [nvarchar](15), 
    @BirthDate [datetime], 
    @MaritalStatus [nchar](1), 
    @Gender [nchar](1)
WITH EXECUTE AS CALLER
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        UPDATE [HumanResources].[Employee] 
        SET [NationalIDNumber] = @NationalIDNumber 
            ,[BirthDate] = @BirthDate 
            ,[MaritalStatus] = @MaritalStatus 
            ,[Gender] = @Gender 
        WHERE [BusinessEntityID] = @BusinessEntityID;
    END TRY
    BEGIN CATCH
        EXECUTE [dbo].[uspLogError];
    END CATCH;
END;

```
{{< /details >}}
## Overview
This documentation explains the stored procedure `[HumanResources].[uspUpdateEmployeePersonalInfo]`, which updates the personal information of an employee in the `HumanResources.Employee` table.

## Details
The stored procedure takes the following input parameters:
1. `@BusinessEntityID [int]`: The ID of the employee to update.
2. `@NationalIDNumber [nvarchar](15)`: The updated National ID Number of the employee.
3. `@BirthDate [datetime]`: The updated birth date of the employee.
4. `@MaritalStatus [nchar](1)`: The updated marital status of the employee.
5. `@Gender [nchar](1)`: The updated gender of the employee.

The stored procedure updates the relevant records in the `HumanResources.Employee` table with the provided information.

## Information on Data
The stored procedure deals with the following data elements:

- `HumanResources.Employee`
  - `BusinessEntityID`
  - `NationalIDNumber`
  - `BirthDate`
  - `MaritalStatus`
  - `Gender`

## Information on the Tables
The stored procedure interacts with the following table:

- `HumanResources.Employee`: Contains information about the employees, including their personal data.

## Possible Optimization Opportunities
None.

## Possible Bugs
None.

## Risk
- No risks identified.

## Code Complexity
The code has low complexity as it is just a single `UPDATE` statement enclosed in a `TRY...CATCH` block.

### Refactoring Opportunities
None.

## User Acceptance Criteria

### Gherkin scripts

```
Scenario: Update an employee's personal information
  Given an employee exists with BusinessEntityID "1"
  When I execute uspUpdateEmployeePersonalInfo with the following parameters:
    | Parameter          | Value          |
    | BusinessEntityID   | 1              |
    | NationalIDNumber   | "000-00-0000"  |
    | BirthDate          | "1990-01-01"   |
    | MaritalStatus      | "M"            |
    | Gender             | "F"            |
  Then the employee with BusinessEntityID "1" should have their personal information updated.
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstupdate | NA | [NationalIDNumber], [BirthDate], [MaritalStatus], [Gender] | NA |  | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID] |  |  |  | [HumanResources].[Employee] |
| sstmssqlexec |  |  |  |  |  |  |  |  |  |

