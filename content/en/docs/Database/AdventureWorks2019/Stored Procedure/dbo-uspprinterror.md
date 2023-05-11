---
title: "dbo.uspPrintError"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins | Where Clause | Table Name |
|---|---|---|---|---|---|---|
| sstmssqlset |  |  |  |  |  |  |
| sstmssqlprint |  |  |  |  |  |  |
| sstmssqlprint |  |  |  |  |  |  |

## Overview
The stored procedure `uspPrintError` is used to print error information when an error occurs in the execution of a SQL script. It should be called within the scope of a CATCH block of a TRY...CATCH construct.

## Details
The procedure is defined as follows:
```sql
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

## Information on data
This procedure does not interact with any specific data or tables.

## Information on the tables
No tables are involved in this procedure.

## Possible optimization opportunities
Since this procedure is just for printing error information, there are no immediate optimization opportunities.

## Possible bugs
No apparent bugs in the procedure.

## Risk
1. If the procedure is called outside of a CATCH block, it will not print any error information. 

## Code Complexity
The code complexity is low, as it comprises only a few lines of code for printing error information.

## Refactoring Opportunities
None identified, as the procedure is simple and serves its purpose of printing error information.

## User Acceptance Criteria
```
Scenario: An error occurs during the execution of a script
  Given a SQL script encounters an error during execution
  When the script enters a CATCH block
  Then uspPrintError should be called
  And the error information should be printed

Scenario: The stored procedure is called outside of a CATCH block
  Given the execution of a SQL script without any errors
  When the uspPrintError procedure is called
  Then it should return without printing any error information
```
