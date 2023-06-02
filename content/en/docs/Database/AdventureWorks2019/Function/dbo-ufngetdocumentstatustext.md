---
title: "dbo.ufnGetDocumentStatusText"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins | Where Clause | Table Name |
|---|---|---|---|---|---|---|
| sstmssqldeclare |  |  |  |  |  |  |
| sstmssqlset |  |  |  |  |  |  |
| sstmssqlreturn |  |  |  |  |  |  |

## Overview
This markdown documentation provides information about the `[dbo].[ufnGetDocumentStatusText]` function. This user-defined function takes a `tinyint` parameter representing a sales order status value and returns an `nvarchar(16)` containing the text representation of that sales order status.

## Details
### Function: `[dbo].[ufnGetDocumentStatusText]`
* Input:
    * @Status : tinyint
* Output: nvarchar(16)

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

## Information on data
1. **Status values:**
    1. 1: Pending approval
    2. 2: Approved
    3. 3: Obsolete
    4. Any other value: Invalid

## Information on the tables
There is no information on tables as this function does not interact with any table.

## Possible optimization opportunities
None, since this function is a simple case statement to return the corresponding value.

## Possible bugs
None, as the function handles all possible values for the `@Status` parameter.

## Risk
None, since this function is a simple case statement and does not involve any complex logic or interaction with tables.

## Code Complexity
The code complexity is minimal.

## Refactoring Opportunities
There are no opportunities for refactoring since the function is concise and efficiently handles its intended purpose.

## User Acceptance Criteria
```Gherkin
Scenario: Get the text representation of a status value
    Given a sales order status value as input
    When the function ufnGetDocumentStatusText is called
    Then it returns the corresponding sales order status text
    
    Examples:
        | Input | Output            |
        | 1     | Pending approval  |
        | 2     | Approved          |
        | 3     | Obsolete          |
        | 4     | ** Invalid **     |
```

