---
title: "dbo.ufnGetSalesOrderStatusText"
linkTitle: "dbo.ufnGetSalesOrderStatusText"
description: "dbo.ufnGetSalesOrderStatusText"
---

# Functions

## [dbo].[ufnGetSalesOrderStatusText]
### Summary


- **Number of Tables Accessed:** 0
- **Lines of Code:** 21
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

CREATE FUNCTION [dbo].[ufnGetSalesOrderStatusText](@Status [tinyint])
RETURNS [nvarchar](15) 
AS 
-- Returns the sales order status text representation for the status value.
BEGIN
    DECLARE @ret [nvarchar](15);

    SET @ret = 
        CASE @Status
            WHEN 1 THEN 'In process'
            WHEN 2 THEN 'Approved'
            WHEN 3 THEN 'Backordered'
            WHEN 4 THEN 'Rejected'
            WHEN 5 THEN 'Shipped'
            WHEN 6 THEN 'Cancelled'
            ELSE '** Invalid **'
        END;
    
    RETURN @ret
END;

```
{{< /details >}}
## Overview

This document provides the markdown documentation of the ufnGetSalesOrderStatusText function in the database.

## 1. Details

The function `ufnGetSalesOrderStatusText` is used to get the text representation of the sales order status, based on the input status value.

### 1.1 Input Parameters

- @Status [tinyint] - The status code of the sales order

### 1.2 Output

- Returns a [nvarchar](15) - The textual representation of the sales order status.

## 2. Information on Data

This function contains a CASE statement for determining the corresponding textual representation for the input status value.

## 3. Information on the Tables

No tables are involved in this function.

## 4. Possible Optimization Opportunities

As this function is already a single-purpose scalar function, there may be limited optimization opportunities.

## 5. Possible Bugs

There are no identified bugs in this function.

## 6. Risk

- No identified risks.

## 7. Code Complexity

The code complexity is low as it only involves a single CASE statement.

## 8. Refactoring Opportunities

- The function can be converted to an inline table-valued function with a SELECT statement, however, it may increase code complexity.
- A lookup table can be considered to store the mapping of different sales order status codes to their respective text representations, but this may be overkill for this particular scenario.

## User Acceptance Criteria

```gherkin
Feature: Sales Order Status Text Function
  Scenario: Retrieve Sales Order Status Text
    Given A valid sales order status code
    When The ufnGetSalesOrderStatusText function is called with the status code
    Then It returns the corresponding textual representation of the sales order status

  Scenario: Retrieve Invalid Sales Order Status Text
    Given An invalid sales order status code
    When The ufnGetSalesOrderStatusText function is called with the invalid status code
    Then It returns "** Invalid **" as the result
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|

