---
title: "dbo.ufnGetDocumentStatusText"
linkTitle: "dbo.ufnGetDocumentStatusText"
description: "dbo.ufnGetDocumentStatusText"
---

# Functions

## [dbo].[ufnGetDocumentStatusText]
### Summary


- **Number of Tables Accessed:** 0
- **Lines of Code:** 18
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

CREATE FUNCTION [dbo].[ufnGetDocumentStatusText](@Status [tinyint])
RETURNS [nvarchar](16) 
AS 
-- Returns the sales order status text representation for the status value.
BEGIN
    DECLARE @ret [nvarchar](16);

    SET @ret = 
        CASE @Status
            WHEN 1 THEN N'Pending approval'
            WHEN 2 THEN N'Approved'
            WHEN 3 THEN N'Obsolete'
            ELSE N'** Invalid **'
        END;
    
    RETURN @ret
END;

```
{{< /details >}}
# Database Objects Documentation

## Overview

The `ufnGetDocumentStatusText` is a user-defined scalar function in the `dbo` schema that takes a status value as input and returns its corresponding text representation. It is used to represent the sales order status in a more human-readable format.

## Details

The function has the following signature:

```sql
CREATE FUNCTION [dbo].[ufnGetDocumentStatusText](@Status [tinyint])
RETURNS [nvarchar](16)
```

### Input Parameter

1. @Status ([tinyint]): The status value of a sales order.

### Output

The function returns the text representation of the sales order status as [nvarchar](16).

## Information on Data

The function uses a simple `CASE` statement to map the input status value to its text representation based on the following business rules:

1. Status 1: Pending approval
2. Status 2: Approved
3. Status 3: Obsolete
4. Other Status: **Invalid**

## Information on the Tables

No tables are involved in this function.

## Possible Optimization Opportunities

Since this function does not interact with any tables and has a straightforward logic, there seems to be no optimization opportunity.

## Possible Bugs

There are no apparent bugs in this function.

## Risk

No risk, as the function does not use any query, and the implementation is not dependent on any external factors.

## Code Complexity

The code complexity is very low, as it uses a simple `CASE` statement to implement the mapping logic.

## Refactoring Opportunities

No refactoring opportunities, as the function is straightforward and concise.

## User Acceptance Criteria

### Gherkin Scripts

```
Feature: Sales Order Status Text Representation
  As a user
  I want to get the text representation of a sales order status
  So that I can easily understand the current status of an order

Scenario: Get Pending Approval Text
  Given I have a sales order status value 1
  When I call the ufnGetDocumentStatusText function with the status value
  Then I should get the text "Pending approval"

Scenario: Get Approved Text
  Given I have a sales order status value 2
  When I call the ufnGetDocumentStatusText function with the status value
  Then I should get the text "Approved"

Scenario: Get Obsolete Text
  Given I have a sales order status value 3
  When I call the ufnGetDocumentStatusText function with the status value
  Then I should get the text "Obsolete"

Scenario: Get Invalid Text
  Given I have a sales order status value other than 1, 2, or 3
  When I call the ufnGetDocumentStatusText function with the status value
  Then I should get the text "** Invalid **"
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|

