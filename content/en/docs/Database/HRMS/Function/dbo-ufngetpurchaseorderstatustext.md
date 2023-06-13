---
title: "dbo.ufnGetPurchaseOrderStatusText"
linkTitle: "dbo.ufnGetPurchaseOrderStatusText"
description: "dbo.ufnGetPurchaseOrderStatusText"
---

# Functions

## [dbo].[ufnGetPurchaseOrderStatusText]
### Summary


- **Number of Tables Accessed:** 0
- **Lines of Code:** 19
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|


### Parameters

| Parameter Name | Data Type | Direction |
|---|---|---|
| @Status | TINYINT | IN |
| RETURN | NVARCHAR | OUT |

{{< details "Sql Code" >}}
```sql

CREATE FUNCTION [dbo].[ufnGetPurchaseOrderStatusText](@Status [tinyint])
RETURNS [nvarchar](15) 
AS 
-- Returns the sales order status text representation for the status value.
BEGIN
    DECLARE @ret [nvarchar](15);

    SET @ret = 
        CASE @Status
            WHEN 1 THEN 'Pending'
            WHEN 2 THEN 'Approved'
            WHEN 3 THEN 'Rejected'
            WHEN 4 THEN 'Complete'
            ELSE '** Invalid **'
        END;
    
    RETURN @ret
END;

```
{{< /details >}}
## Overview
This documentation provides an analysis of the `dbo.ufnGetPurchaseOrderStatusText` function. The function takes a status code as input and returns a corresponding status text based on the input value.

## Details

### Input
- @Status [tinyint]: An integer representing the status code.

### Output
- [nvarchar](15): A string representing the status text.

### Information on data
- No data is used or modified in this function.

### Information on the tables
- No tables are involved in this function.

## Possible optimization opportunities
- There are no clear optimization opportunities since this function is straightforward and does not involve any complex operations.

## Possible bugs
- No known bugs in this function.

## Risk
- There are no risks associated with this function, as it only converts a status code to a status text.

## Code Complexity
- The code complexity in this function is low. It uses a simple `CASE` statement to map the status code to a status text.

## Refactoring Opportunities
- No obvious refactoring opportunities exist for this simple function.

## User Acceptance Criteria
### Gherkin
```
Feature: Purchase Order Status Text
  The ufnGetPurchaseOrderStatusText function should return the correct status text for each status code.

  Scenario Outline: Status Code to Status Text conversion
    Given a <status_code>
    When the function ufnGetPurchaseOrderStatusText is called with the status code
    Then it should return the <status_text>

    Examples:
      | status_code | status_text  |
      | 1           | Pending      |
      | 2           | Approved     |
      | 3           | Rejected     |
      | 4           | Complete     |
      | 99          | ** Invalid **|
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|

