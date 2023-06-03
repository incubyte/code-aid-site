---
title: "HumanResources.uspUpdateEmployeeLogin"
linkTitle: "HumanResources.uspUpdateEmployeeLogin"
description: "HumanResources.uspUpdateEmployeeLogin"
---

# Stored Procedures

## [HumanResources].[uspUpdateEmployeeLogin]
### Summary


- **Number of Tables Accessed:** 1
- **Lines of Code:** 26
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|


### Parameters

| Parameter Name | Data Type | Direction |
|---|---|---|
| @BusinessEntityID | INT | IN |
| @OrganizationNode | [HIERARCHYID] | IN |
| @LoginID | NVARCHAR | IN |
| @JobTitle | NVARCHAR | IN |
| @HireDate | DATETIME | IN |
| @CurrentFlag | [DBO] | IN |

{{< details "Sql Code" >}}
```sql

CREATE PROCEDURE [HumanResources].[uspUpdateEmployeeLogin]
    @BusinessEntityID [int], 
    @OrganizationNode [hierarchyid],
    @LoginID [nvarchar](256),
    @JobTitle [nvarchar](50),
    @HireDate [datetime],
    @CurrentFlag [dbo].[Flag]
WITH EXECUTE AS CALLER
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        UPDATE [HumanResources].[Employee] 
        SET [OrganizationNode] = @OrganizationNode 
            ,[LoginID] = @LoginID 
            ,[JobTitle] = @JobTitle 
            ,[HireDate] = @HireDate 
            ,[CurrentFlag] = @CurrentFlag 
        WHERE [BusinessEntityID] = @BusinessEntityID;
    END TRY
    BEGIN CATCH
        EXECUTE [dbo].[uspLogError];
    END CATCH;
END;

```
{{< /details >}}
## Overview

This markdown documentation provides information about the stored procedure `[HumanResources].[uspUpdateEmployeeLogin]` that is used to update the employee login information in a database.

## Details

Stored Procedure Name: `[HumanResources].[uspUpdateEmployeeLogin]`

Parameters:
1. @BusinessEntityID [int] - The unique identifier for the employee
2. @OrganizationNode [hierarchyid] - The hierarchical position of the employee within the organization
3. @LoginID [nvarchar](256) - The employee's login ID
4. @JobTitle [nvarchar](50) - The employee's job title
5. @HireDate [datetime] - The employee's hire date
6. @CurrentFlag [dbo].[Flag] - A flag indicating if the employee is currently employed

Execution Context: CALLER

## Information on data

The stored procedure updates the record in the `[HumanResources].[Employee]` table with the provided parameter values.

## Information on the tables

Source table: `[HumanResources].[Employee]`

Columns affected:

1. OrganizationNode
2. LoginID
3. JobTitle
4. HireDate
5. CurrentFlag

## Possible optimization opportunities

No optimization opportunities detected in the current code.

## Possible bugs

No apparent bugs detected in the current code.

## Risk

The query updates employee records without a WHERE clause, which may lead to unintended updates to other employee records.

## Code Complexity

The stored procedure's code is simple, involving only an update and error handling. No nested loops or logic structures exist.

## Refactoring Opportunities

No refactoring opportunities detected in the current code.

## User Acceptance Criteria

Feature: Update Employee Login Record

Scenario: Successfully update an employee login record
  Given there exists an employee with BusinessEntityID 1
  When I execute [HumanResources].[uspUpdateEmployeeLogin] @BusinessEntityID = 1, @OrganizationNode = '/2/', @LoginID = 'new.employee', @JobTitle = 'New Title', @HireDate = '2023-01-01', @CurrentFlag = 1
  Then the employee with BusinessEntityID 1 should have their LoginID, JobTitle, HireDate, and CurrentFlag updated

Scenario: Fail to update a non-existent employee
  Given there does not exist an employee with BusinessEntityID 9999
  When I execute [HumanResources].[uspUpdateEmployeeLogin] @BusinessEntityID = 9999, @OrganizationNode = '/2/', @LoginID = 'new.employee', @JobTitle = 'New Title', @HireDate = '2023-01-01', @CurrentFlag = 1
  Then an error should be logged
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstupdate | NA | [OrganizationNode], [HireDate], [LoginID], [JobTitle], [CurrentFlag] | NA |  | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID] |  |  |  | [HumanResources].[Employee] |
| sstmssqlexec |  |  |  |  |  |  |  |  |  |

