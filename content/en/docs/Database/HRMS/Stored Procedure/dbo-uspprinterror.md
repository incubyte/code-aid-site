---
title: "dbo.uspPrintError"
linkTitle: "dbo.uspPrintError"
description: "dbo.uspPrintError"
---

# Stored Procedures

## [dbo].[uspPrintError]
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

{{< details "Sql Code" >}}
```sql

-- uspPrintError prints error information about the error that caused 
-- execution to jump to the CATCH block of a TRY...CATCH construct. 
-- Should be executed from within the scope of a CATCH block otherwise 
-- it will return without printing any error information.
CREATE PROCEDURE [dbo].[uspPrintError] 
AS
BEGIN
    SET NOCOUNT ON;

    -- Print error information. 
    PRINT 'Error ' + CONVERT(varchar(50), ERROR_NUMBER()) +
          ', Severity ' + CONVERT(varchar(5), ERROR_SEVERITY()) +
          ', State ' + CONVERT(varchar(5), ERROR_STATE()) + 
          ', Procedure ' + ISNULL(ERROR_PROCEDURE(), '-') + 
          ', Line ' + CONVERT(varchar(5), ERROR_LINE());
    PRINT ERROR_MESSAGE();
END;

```
{{< /details >}}
## Overview

The `uspPrintError` is a stored procedure that is used to print error information about an error that caused the execution to jump to the CATCH block of a TRY...CATCH construct. This procedure should be executed within the scope of a CATCH block; otherwise, it will return without printing any error information.

## Details

### Stored Procedure

- Name: `uspPrintError`
- Schema: `dbo`
- Type: User-defined stored procedure

### Parameters

- None.

## Information on Data

No explicit data is involved in this stored procedure. It uses the built-in error functions to extract error information.

## Information on the Tables

- None.

## Possible Optimization Opportunities

- None.

## Possible Bugs

- None.

## Risk

- None.

## Code Complexity

The code of this stored procedure is quite simple and consists of the direct usage of several built-in error functions.

```sql
PRINT 'Error ' + CONVERT(varchar(50), ERROR_NUMBER()) +
      ', Severity ' + CONVERT(varchar(5), ERROR_SEVERITY()) +
      ', State ' + CONVERT(varchar(5), ERROR_STATE()) + 
      ', Procedure ' + ISNULL(ERROR_PROCEDURE(), '-') + 
      ', Line ' + CONVERT(varchar(5), ERROR_LINE());
PRINT ERROR_MESSAGE();
```

## Refactoring Opportunities

- Currently, there are no explicit refactoring opportunities.

## User Acceptance Criteria

```gherkin
Feature: Print error information
  Scenario: An error occurs and triggers a CATCH block
    Given an error occurs and triggers a CATCH block in SQL code
    When the uspPrintError stored procedure is called
    Then it should print error information including number, severity, state, procedure, line, and message

  Scenario: No error occurs
    Given no error occurs in SQL code
    When the uspPrintError stored procedure is called
    Then it should not print any error information
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstmssqlprint |  |  |  |  |  |  |  |  |  |
| sstmssqlprint |  |  |  |  |  |  |  |  |  |

