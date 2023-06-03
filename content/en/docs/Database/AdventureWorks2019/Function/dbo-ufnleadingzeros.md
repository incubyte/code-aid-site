---
title: "dbo.ufnLeadingZeros"
linkTitle: "dbo.ufnLeadingZeros"
description: "dbo.ufnLeadingZeros"
---

# Functions

## [dbo].[ufnLeadingZeros]
### Summary


- **Number of Tables Accessed:** 0
- **Lines of Code:** 15
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|


### Parameters

| Parameter Name | Data Type | Direction |
|---|---|---|
| @Value | INT | IN |
| RETURN | VARCHAR | OUT |

{{< details "Sql Code" >}}
```sql

CREATE FUNCTION [dbo].[ufnLeadingZeros](
    @Value int
) 
RETURNS varchar(8) 
WITH SCHEMABINDING 
AS 
BEGIN
    DECLARE @ReturnValue varchar(8);

    SET @ReturnValue = CONVERT(varchar(8), @Value);
    SET @ReturnValue = REPLICATE('0', 8 - DATALENGTH(@ReturnValue)) + @ReturnValue;

    RETURN (@ReturnValue);
END;

```
{{< /details >}}
## Overview
This is the documentation for the `ufnLeadingZeros` function which takes an integer as input and returns a varchar(8) with leading zeros.

## Details

### Function Signature
```sql
CREATE FUNCTION [dbo].[ufnLeadingZeros](
    @Value int
) 
RETURNS varchar(8) 
WITH SCHEMABINDING 
```

### Parameters
1. **@Value**: An integer value for which leading zeros are to be added.

## Information on Data

### Input Data Type
- @Value int

### Output Data Type
- varchar(8)

## Information on Tables
N/A

## Possible Optimization Opportunities
N/A

## Possible Bugs
N/A

## Risk
N/A

## Code Complexity
The code complexity is low as it contains only few lines of code and is easy to understand.

### Code Snippet
```sql
DECLARE @ReturnValue varchar(8);
SET @ReturnValue = CONVERT(varchar(8), @Value);
SET @ReturnValue = REPLICATE('0', 8 - DATALENGTH(@ReturnValue)) + @ReturnValue;
RETURN (@ReturnValue);
```

## Refactoring Opportunities
N/A

## User Acceptance Criteria

### Gherkin Script

```gherkin
Feature: Leading zeros function
  Scenario: Add leading zeros to an integer
    Given I have an integer value
    When I use the ufnLeadingZeros function to add leading zeros
    Then I should get a varchar(8) value with leading zeros
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstmssqldeclare |  |  |  |  |  |  |  |  |  |
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstmssqlreturn |  |  |  |  |  |  |  |  |  |

