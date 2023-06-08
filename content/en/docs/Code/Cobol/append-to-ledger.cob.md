+++
categories = ["Documentation"]
title = "append-to-ledger.cob"
weight = 3
+++

## File Summary

- **File Path:** asdf\cobol\src\asdf-append-to-ledger.cob
- **LOC:** 89
- **Last Modified:** 5 years 0 months
- **Number of Commits (Total / Last 6 Months / Last Month):** 2 / 0 / 0
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** 1 / 0 / 0
- **Top Contributors:** rightfold (2)

## Overview

This COBOL program `asdf-append-to-ledger` is responsible for appending transaction records to a ledger file. The program accepts input arguments specifying the transaction details, such as the transaction type, comment, debitor and creditor, and amount. After parsing these input arguments, the program generates a transaction ID and a timestamp before writing the formatted transaction to the ledger file.

## Function Explanation

### 1. para-main

The main procedure of the program performs the following functions in order:

1. para-parse: Parse input arguments and validate transaction details
2. para-generate: Generate transaction ID and timestamp
3. para-append: Append the transaction to a ledger file
4. para-report: Display transaction ID for the added transaction

### 2. para-parse

This procedure parses and validates the input arguments for the transaction details, including:

1. Transaction type (`fs-type`): Must be either 'D' (Debit) or 'P' (Credit)
2. Comment (`fs-comment`): Must not be empty
3. Debitor UUID (`fs-debitor`): Parsed from input argument
4. Creditor UUID (`fs-creditor`): Parsed from input argument
5. Amount (`fs-amount`): Must be a numeric value

If any of the conditions are not met, the program displays an error message and terminates execution.

### 3. para-generate

This procedure generates a transaction ID (`fs-id`) and the current timestamp (`fs-timestamp`) for the transaction.

### 4. para-append

This procedure first constructs the path to the ledger file by concatenating the group UUID with the fixed directory path. It then opens the ledger file in "extend" mode, writes the transaction, and closes the file.

### 5. para-report

This procedure formats the transaction ID (`fs-id`) and displays it as a confirmation of the added transaction.

{{< details "Cobol Code" >}}
```cobol

      IDENTIFICATION DIVISION.
      PROGRAM-ID. asdf-append-to-ledger.

      ENVIRONMENT DIVISION.
      INPUT-OUTPUT SECTION.
      FILE-CONTROL.
      SELECT OPTIONAL fd-ledger
          ASSIGN DYNAMIC ws-ledger
          ACCESS IS SEQUENTIAL
          ORGANIZATION IS RECORD SEQUENTIAL.

      DATA DIVISION.
      FILE SECTION.
      FD fd-ledger.
      COPY 'asdf-transaction.cpy' REPLACING ==:X:== BY ==fs==.

      WORKING-STORAGE SECTION.
      01 ws-group                     PIC X(16).
      01 ws-ledger                    PIC X(256).

      01 ws-amount                    PIC X(10).
      01 ws-uuid-text                 PIC X(32).


      PROCEDURE DIVISION.
      para-main.
      *    TODO: Perform authorization, and validate that the debitor
      *          and creditor accounts actually exist.
          PERFORM para-parse
          PERFORM para-generate
          PERFORM para-append
          PERFORM para-report
          STOP RUN
          .

      para-parse.
          ACCEPT ws-uuid-text FROM ARGUMENT-VALUE
          CALL 'asdf-parse-uuid' USING ws-uuid-text ws-group

          ACCEPT fs-type FROM ARGUMENT-VALUE
          IF fs-type IS NOT EQUAL TO 'D' AND 'P' THEN
              DISPLAY 'Invalid type' WITH NO ADVANCING
              GO TO para-invalid-parse
          END-IF

          ACCEPT fs-comment FROM ARGUMENT-VALUE
          IF fs-comment IS EQUAL TO ALL SPACES THEN
              DISPLAY 'Empty comment' WITH NO ADVANCING
              GO TO para-invalid-parse
          END-IF

          ACCEPT ws-uuid-text FROM ARGUMENT-VALUE
          CALL 'asdf-parse-uuid' USING ws-uuid-text fs-debitor

          ACCEPT ws-uuid-text FROM ARGUMENT-VALUE
          CALL 'asdf-parse-uuid' USING ws-uuid-text fs-creditor

          ACCEPT ws-amount FROM ARGUMENT-VALUE
          IF FUNCTION TRIM(ws-amount) IS NUMERIC THEN
              MOVE FUNCTION TRIM(ws-amount) TO fs-amount
          ELSE
              DISPLAY 'Non-numeric amount' WITH NO ADVANCING
              GO TO para-invalid-parse
          END-IF
          .

      para-invalid-parse.
          MOVE 1 TO RETURN-CODE
          STOP RUN
          .

      para-generate.
          CALL 'asdf-generate-uuid' USING fs-id
          MOVE FUNCTION CURRENT-DATE TO fs-timestamp
          .

      para-append.
          CALL 'asdf-format-uuid' USING ws-group ws-uuid-text
          STRING '/var/lib/asdf/group/' ws-uuid-text '/ledger'
              INTO ws-ledger
          OPEN EXTEND fd-ledger
          WRITE fs-transaction
          CLOSE fd-ledger
          .

      para-report.
          CALL 'asdf-format-uuid' USING fs-id ws-uuid-text
          DISPLAY ws-uuid-text WITH NO ADVANCING
          .

```
{{< /details >}}

## Code Analysis

There are no noticeable instances of code duplication or violations of SOLID principles in this COBOL code. However, some parts of the code can be improved, as mentioned in the refactoring opportunities section below.

## Data Operations

This program does not involve any Extraction, Transformation, and Loading (ETL) processes. The only noteworthy data operation is the writing of the transaction to the ledger file in the `para-append` procedure.

## Risks

**Security Issues:**

1. TODO comment in `para-main`: The code mentions that authorization and validation should be performed to verify that debitor and creditor accounts exist. This is a potential security risk as it currently doesn't enforce those checks.

**Bugs:**

No apparent bugs were detected in the code.

## Refactoring Opportunities

1. Error handling could be improved by creating a separate error handling procedure to centralize the display and management of errors. This would help reduce the duplication of error message display code in `para-parse`.
2. Code readability can be enhanced by splitting longer procedures, such as `para-parse`, into smaller sub-procedures targeting specific parsing and validation tasks.

## User Acceptance Criteria

```gherkin
Feature: Append Transaction to Ledger
  In order to manage transactions
  As a financial application user
  I want to append transactions to the ledger

Scenario: Append valid transaction to ledger
  Given the transaction details are valid
  When I append the transaction to the ledger
  Then the transaction ID is displayed as confirmation
  And the ledger contains the appended transaction

Scenario: Append invalid transaction type to ledger
  Given the transaction details are invalid with an invalid transaction type
  When I append the transaction to the ledger
  Then the error message "Invalid type" is displayed
  And the transaction is not appended to the ledger

Scenario: Append empty comment transaction to ledger
  Given the transaction details are invalid with an empty comment
  When I append the transaction to the ledger
  Then the error message "Empty comment" is displayed
  And the transaction is not appended to the ledger

Scenario: Append non-numeric amount transaction to ledger
  Given the transaction details are invalid with a non-numeric amount
  When I append the transaction to the ledger
  Then the error message "Non-numeric amount" is displayed
  And the transaction is not appended to the ledger
```