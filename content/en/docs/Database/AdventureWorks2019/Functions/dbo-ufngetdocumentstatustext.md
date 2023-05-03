---
title: "ufnGetAccountingStatusText"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

| Object Type   |       No of Lines      |  Tables Involed |
|----------|:-------------:|------:|
| Function |  5 | None |

## Overview

The `ufnGetDocumentStatusText` is a user-defined scalar function in the database that takes a tinyint status value and returns a corresponding nvarchar(16) status text representation.

## Details

### Input

- @Status: tinyint  (Sales order status value)

### Output

- Returns: nvarchar(16) (Sales order status text representation)

### Code

```sql
CREATE FUNCTION [dbo].[ufnGetDocumentStatusText](@Status [tinyint])
RETURNS [nvarchar](16) 
AS 
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

## Information on data

This function expects sales order status values in the form of a tinyint. It is used to map these values into a human-readable format. The data should be taken from the sales order table in the database.

## Information on the tables

The function is meant to be used when querying data from the sales order table that contains a `Status` column.

## Possible optimization opportunities

There are no apparent optimization opportunities for this function as it is a simple scalar function.

## Possible bugs

There are no apparent bugs in this function.

## Risk

1. If the given sales order status values change or new status values are added, the function may provide incorrect results. It is essential to have this function updated along with any changes made to sales order status values.

## Code complexity

The code complexity is low as it involves a simple CASE statement to convert the integer status value to its corresponding string representation.

## Refactoring opportunities

There are no apparent refactoring opportunities for this function as it is a simple and straightforward scalar function.