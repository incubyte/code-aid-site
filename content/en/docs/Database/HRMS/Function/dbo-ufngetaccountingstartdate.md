---
title: "dbo.ufnGetAccountingStartDate"
linkTitle: "dbo.ufnGetAccountingStartDate"
description: "dbo.ufnGetAccountingStartDate"
---

# Functions

## [dbo].[ufnGetAccountingStartDate]
### Summary


- **Number of Tables Accessed:** 0
- **Lines of Code:** 7
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|


### Parameters

| Parameter Name | Data Type | Direction |
|---|---|---|
| RETURN | DATETIME | OUT |

{{< details "Sql Code" >}}
```sql

CREATE FUNCTION [dbo].[ufnGetAccountingStartDate]()
RETURNS [datetime] 
AS 
BEGIN
    RETURN CONVERT(datetime, '20030701', 112);
END;

```
{{< /details >}}
## Overview
This document provides the markdown documentation for the `ufnGetAccountingStartDate` function available in the `dbo` schema. The function returns a fixed datetime value representing the accounting start date.

## Details

### Function Signature
```sql
CREATE FUNCTION [dbo].[ufnGetAccountingStartDate]()
RETURNS [datetime]
AS
BEGIN
    RETURN CONVERT(datetime, '20030701', 112);
END;
```

### Information on Data
Since the function returns a fixed datetime value, it does not depend on any data in the database.

### Information on the Tables
The function does not use any tables as it only returns a fixed datetime value.

### Possible Optimization Opportunities
There seem to be no optimization opportunities because there is no data access or complex calculations performed in this function.

### Possible Bugs
There are no possible bugs in this function as it only returns a fixed datetime value without any conditions or calculations.

### Risk
As the function does not access any data or tables, there are no risks of running the function without the WHERE clause.

### Code Complexity
The function has a very low code complexity due to its simplicity in just returning a fixed datetime value.

### Refactoring Opportunities
The function seems to be quite simple and complete, and no refactoring opportunities seem to be required.

## User Acceptance Criteria (Gherkin Scripts)

### Get Accounting Start Date
```gherkin
Feature: Get Accounting Start Date
  Scenario: The user retrieves the accounting start date using the function
    Given a user wants to retrieve the accounting start date
    When the user executes the ufnGetAccountingStartDate function
    Then the user should get the fixed datetime value "2003-07-01 00:00:00.000"
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|

