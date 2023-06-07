---
title: "HumanResources.uspUpdateEmployeeHireInfo"
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
| sstbegintran |  |  |  |  |  |  |
| sstupdate | NA | [JobTitle], [HireDate], [CurrentFlag] | NA |  | [BusinessEntityID],  | [HumanResources].[Employee] |
| sstinsert | NA | NA | [BusinessEntityID], [RateChangeDate], [Rate], [PayFrequency] | NA | NA | [HumanResources].[EmployeePayHistory] |
| sstmssqlcommit |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |
| sstmssqlrollback |  |  |  |  |  |  |
| sstmssqlexec |  |  |  |  |  |  |

## Overview
This document describes the stored procedure `[HumanResources].[uspUpdateEmployeeHireInfo]` in the database. This procedure updates an existing employee's hire information and inserts a new record into the EmployeePayHistory table.

## Details

The procedure takes the following parameters:

1. @BusinessEntityID [int] - Employee's Business Entity ID
2. @JobTitle [nvarchar](50) - Employee's Job Title
3. @HireDate [datetime] - Employee's Hire Date
4. @RateChangeDate [datetime] - Date when the Rate was last changed
5. @Rate [money] - Employee's pay rate
6. @PayFrequency [tinyint] - Employee's pay frequency
7. @CurrentFlag [dbo].[Flag] - Current employee flag

## Information on data

The stored procedure interacts with the following tables:

1. [HumanResources].[Employee]
2. [HumanResources].[EmployeePayHistory]

## Information on the tables

### HumanResources.Employee

This table contains detailed employee information, such as:

- BusinessEntityID (int)
- JobTitle (nvarchar(50))
- HireDate (datetime)
- CurrentFlag (Flag)

### HumanResources.EmployeePayHistory

This table contains the pay history of the employees, such as:

- BusinessEntityID (int)
- RateChangeDate (datetime)
- Rate (money)
- PayFrequency (tinyint)

## Possible optimization opportunities
There are no specific optimization opportunities for the procedure.

## Possible bugs
There are no known bugs in this procedure.

## Risk
Since there is an UPDATE operation without a WHERE clause, it could potentially update all rows in the [HumanResources].[Employee] table. Therefore, users should be cautious while executing this procedure.

## Code Complexity
The procedure has a moderate level of complexity. It consists of a single transaction to ensure data consistency and uses TRY-CATCH blocks for error handling.

## Refactoring Opportunities
There are no specific refactoring opportunities for this procedure.

## User Acceptance Criteria

### Gherkin Scripts

```gherkin
Scenario: Update employee hire information and insert a new record in EmployeePayHistory
Given a BusinessEntityID, JobTitle, HireDate, RateChangeDate, Rate, PayFrequency, and CurrentFlag
When the stored procedure [HumanResources].[uspUpdateEmployeeHireInfo] is executed
Then the employee's hire information should be updated with the provided values
And a new record should be inserted into the EmployeePayHistory table
```

```gherkin
Scenario: Error handling in the stored procedure
Given a BusinessEntityID, JobTitle, HireDate, RateChangeDate, Rate, PayFrequency, and CurrentFlag
And an error occurred during the operation
When the stored procedure [HumanResources].[uspUpdateEmployeeHireInfo] is executed
Then the transaction should be rolled back
And the error information should be logged using [dbo].[uspLogError]
```
