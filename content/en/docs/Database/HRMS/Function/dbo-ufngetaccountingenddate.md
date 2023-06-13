---
title: "dbo.ufnGetAccountingEndDate"
linkTitle: "dbo.ufnGetAccountingEndDate"
description: "dbo.ufnGetAccountingEndDate"
---

# Functions

## [dbo].[ufnGetAccountingEndDate]
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

CREATE FUNCTION [dbo].[ufnGetAccountingEndDate]()
RETURNS [datetime] 
AS 
BEGIN
    RETURN DATEADD(millisecond, -2, CONVERT(datetime, '20040701', 112));
END;

```
{{< /details >}}
## 2. Overview

This documentation provides information about the scalar-valued user-defined function `[dbo].[ufnGetAccountingEndDate]`.

## 3. Details

The purpose of the function `[dbo].[ufnGetAccountingEndDate]` is to return a specific datetime value. The function calculates the datetime by subtracting 2 milliseconds from the '2004-07-01' date.

## 4. Information on Data

The function does not require any input data or any tables to query.

## 5. Information on the Tables

As the function does not interact with any tables, this section is not applicable.

## 6. Possible Optimization Opportunities

Since the function returns a fixed datetime value without any input parameters, there might be a better way to store this value, such as creating a constant or a configuration table entry.

## 7. Possible Bugs

No bugs have been identified in this code.

## 8. Risk

Since the function does not query from any tables, there are no risks of it running without a WHERE clause.

## 9. Code Complexity

The code has low complexity as it only consists of single RETURN statement.

```sql
CREATE FUNCTION [dbo].[ufnGetAccountingEndDate]()
RETURNS [datetime] 
AS 
BEGIN
    RETURN DATEADD(millisecond, -2, CONVERT(datetime, '20040701', 112));
END;
```

## 10. Refactoring Opportunities

One possible refactor is to store the '2004-07-01' date as a constant value. Another option is to store the accounting end date in a configuration table, which allows for future updates if needed.

## 11. User Acceptance Criteria

### Gherkin Scripts

```gherkin
Feature: GetAccountingEndDate
  Scenario: Returns fixed datetime value of accounting end date
    Given the [dbo].[ufnGetAccountingEndDate] function
    When I execute the function
    Then it should return a datetime value of '2004-06-30 23:59:59.998'
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|

