---
title: "dbo.uspLogError"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins | Where Clause | Table Name |
|---|---|---|---|---|---|---|
| sstmssqlset |  |  |  |  |  |  |
| sstmssqlset |  |  |  |  |  |  |
| sstmssqlblock |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |
| sstmssqlreturn |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |
| sstmssqlprint |  |  |  |  |  |  |
| sstmssqlreturn |  |  |  |  |  |  |
| sstinsert | NA | NA | [UserName], [ErrorNumber], [ErrorSeverity], [ErrorState], [ErrorProcedure], [ErrorLine], [ErrorMessage] | NA | NA | [dbo].[ErrorLog] |
| sstmssqlset |  |  |  |  |  |  |
| sstmssqlprint |  |  |  |  |  |  |
| sstmssqlexec |  |  |  |  |  |  |
| sstmssqlreturn |  |  |  |  |  |  |

## 1. Overview

The `uspLogError` stored procedure logs error information in the `ErrorLog` table about the error that caused execution to jump to the CATCH block of a TRY...CATCH construct. It should be executed from within the scope of a CATCH block; otherwise, it will return without inserting error information.

## 2. Details

### 2.1 Input Parameters

- `@ErrorLogID`: Output parameter (`int`). Contains the ErrorLogID of the row inserted by `uspLogError` in the `ErrorLog` table.

### 2.2 Return Values

- If successful, it returns the ErrorLogID of the row inserted.
- If an error occurs within the stored procedure, it prints an error message and returns `-1`.

## 3. Information on Data

The stored procedure inserts data into the `[dbo].[ErrorLog]` table.

## 4. Information on the Tables

The `[dbo].[ErrorLog]` table has the following columns:

- `ErrorLogID`: Unique identifier for error logs.
- `UserName`: Username of the user who executed the statement.
- `ErrorNumber`: Error number of the error.
- `ErrorSeverity`: Severity level of the error.
- `ErrorState`: State of the error.
- `ErrorProcedure`: Name of the procedure or trigger where the error occurred.
- `ErrorLine`: Line number at which the error occurred.
- `ErrorMessage`: Text of the error message.

## 5. Possible Optimization Opportunities

None identified.

## 6. Possible Bugs

None identified.

## 7. Risk

- If any query runs without a WHERE clause, the risk section will be highlighted.

## 8. Code Complexity

The stored procedure has a moderate level of complexity, with multiple nested TRY...CATCH statements and error checking conditions.

## 9. Refactoring Opportunities

None identified.

## 10. User Acceptance Criteria

```gherkin
Feature: Log and handle errors
  The uspLogError stored procedure should log error information in the ErrorLog table and handle exceptions.

  Scenario: Log error information
    Given a database with dbo.uspLogError procedure and dbo.ErrorLog table
      And an error that causes execution to jump to the CATCH block
    When the stored procedure is called from within the CATCH block
    Then a new record should be inserted in the dbo.ErrorLog table
      And the output parameter should contain the ErrorLogID

  Scenario: Call stored procedure without error information
    Given a database with dbo.uspLogError procedure
      And the stored procedure is called outside a CATCH block
    When the stored procedure is executed
    Then no record should be inserted in the dbo.ErrorLog table
      And the output parameter should be 0

  Scenario: Handle error within stored procedure
    Given a database with dbo.uspLogError procedure and dbo.ErrorLog table
      And an error occurs within the stored procedure
    When the stored procedure is called
    Then an error message should be printed
      And the return value should be -1
```
