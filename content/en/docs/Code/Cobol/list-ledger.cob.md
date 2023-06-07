+++
categories = ["Documentation"]
title = "list-ledger.cob"
weight = 5
+++


## Overview
The given COBOL code is a ledger listing program that reads and displays transaction records for a specific group, provided with a UUID. The program parses and formats the input data for better readability.

## Function Explanation

### para-main
This is the main procedure, which consists of the following steps:

1. Obtain UUID input.
2. List all transactions for the specified group.
3. Stop the program run.

### para-input
This procedure accepts the group UUID from the command-line argument and calls a function `asdf-parse-uuid` to obtain the corresponding ws-group.

### para-list-all
This procedure lists all transactions by:

1. Formatting the UUID using 'asdf-format-uuid'.
2. Composing the ledger file path.
3. Opening the ledger file.
4. Reading and displaying each transaction record until the end of the file.
5. Closing the ledger file.

### para-list-one
This procedure reads a transaction from the ledger file, checks if it is the end of the file, parses the transaction data, and then displays the transaction information.

### para-parse
This procedure is responsible for reformatting and parsing the transaction data. It performs the following tasks:

1. Format debitor, creditor, and transaction UUIDs.
2. Move transaction data to relevant fields.
3. Replace specific characters in fields.
4. Transfer transaction data to output.

### para-check-ledger-status
This procedure verifies the status of the ledger file and takes the following actions depending on the status:

1. If the status is 00 (successful completion), the program continues.
2. If the status is 35 (file not found), the program assumes an empty ledger and stops running.
3. If the status is any other value, the program terminates with an error code.

{{< details "Cobol Code" >}}
```cobol

        IDENTIFICATION DIVISION.
        PROGRAM-ID. asdf-list-ledger.

        ENVIRONMENT DIVISION.
        INPUT-OUTPUT SECTION.
        FILE-CONTROL.
        SELECT fd-ledger
            ASSIGN DYNAMIC ws-ledger
            ACCESS IS SEQUENTIAL
            ORGANIZATION IS RECORD SEQUENTIAL
            FILE STATUS IS ws-ledger-status.

        DATA DIVISION.
        FILE SECTION.
        FD fd-ledger.
        COPY 'asdf-transaction.cpy' REPLACING ==:X:== BY ==fs==.

        WORKING-STORAGE SECTION.
        01 ws-group                     PIC X(16).
        01 ws-ledger                    PIC X(256).
        01 ws-ledger-status             PIC XX.

        01 ws-transaction.
            02 ws-id                   PIC X(32).
            02 FILLER                  PIC X      VALUE X'09'.
            02 ws-type                 PIC X.
                88 ws-debt             VALUE 'D'.
                88 ws-payment          VALUE 'P'.
            02 FILLER                  PIC X      VALUE X'09'.
            02 ws-timestamp.
                03 ws-year             PIC 9(4).
                03 FILLER              PIC X      VALUE '-'.
                03 ws-month            PIC 9(2).
                03 FILLER              PIC X      VALUE '-'.
                03 ws-day              PIC 9(2).
                03 FILLER              PIC X      VALUE ' '.
                03 ws-hour             PIC 9(2).
                03 FILLER              PIC X      VALUE ':'.
                03 ws-minute           PIC 9(2).
                03 FILLER              PIC X      VALUE ':'.
                03 ws-second           PIC 9(2).
            02 FILLER                  PIC X      VALUE X'09'.
            02 ws-comment              PIC X(200).
            02 FILLER                  PIC X      VALUE X'09'.
            02 ws-debitor              PIC X(32).
            02 FILLER                  PIC X      VALUE X'09'.
            02 ws-creditor             PIC X(32).
            02 FILLER                  PIC X      VALUE X'09'.
            02 ws-amount               PIC 9(10).

        01 ws-eof                       PIC X.
            88 ws-eof-yes               VALUE 'Y'.
            88 ws-eof-no                VALUE 'N'.
        01 ws-uuid-text                 PIC X(32).

        PROCEDURE DIVISION.
        para-main.
            PERFORM para-input
            PERFORM para-list-all
            STOP RUN
            .

        para-input.
            ACCEPT ws-uuid-text FROM ARGUMENT-VALUE
            CALL 'asdf-parse-uuid' USING ws-uuid-text ws-group
            .

        para-list-all.
            CALL 'asdf-format-uuid' USING ws-group ws-uuid-text
            STRING '/var/lib/asdf/group/' ws-uuid-text '/ledger'
                INTO ws-ledger

            OPEN INPUT fd-ledger
            PERFORM para-check-ledger-status
            SET ws-eof-no TO TRUE
            PERFORM para-list-one UNTIL ws-eof-yes
            CLOSE fd-ledger
            .

        para-list-one.
            READ fd-ledger
                AT END
                    SET ws-eof-yes TO TRUE
                NOT AT END
                    PERFORM para-parse
                    DISPLAY ws-transaction
            END-READ
            .

        para-parse.
            CALL 'asdf-format-uuid' USING fs-id ws-id

            MOVE fs-type TO ws-type

            MOVE fs-year   OF fs-timestamp TO ws-year   OF ws-timestamp
            MOVE fs-month  OF fs-timestamp TO ws-month  OF ws-timestamp
            MOVE fs-day    OF fs-timestamp TO ws-day    OF ws-timestamp
            MOVE fs-hour   OF fs-timestamp TO ws-hour   OF ws-timestamp
            MOVE fs-minute OF fs-timestamp TO ws-minute OF ws-timestamp
            MOVE fs-second OF fs-timestamp TO ws-second OF ws-timestamp

            MOVE fs-comment TO ws-comment
            INSPECT ws-comment REPLACING
                ALL X'09' BY ' '
                ALL X'0A' BY ' '

            CALL 'asdf-format-uuid' USING fs-debitor ws-debitor
            CALL 'asdf-format-uuid' USING fs-creditor ws-creditor

            MOVE fs-amount TO ws-amount
            .

        para-check-ledger-status.
            EVALUATE ws-ledger-status

        *    Successful completion.
            WHEN 00
                CONTINUE

        *    File not found. Assume empty ledger.
            WHEN 35
                STOP RUN

        *    On other errors, abend.
            WHEN OTHER
                MOVE 101 TO RETURN-CODE
                STOP RUN

            END-EVALUATE
            .

```
{{< /details >}}

## Code Analysis
The COBOL code seems to follow the SOLID principles; however, some parts of the code are specific to its environment, such as file handling, which might differ when translated to Java. Additionally, the use of GOTO statements can be improved upon in Java by making use of classes, methods, and exception handling to achieve better code readability and maintainability. 

## Data Operations
The code reads data from a file, manipulates the data by parsing and reformatting specific fields, and finally outputs the reformatted transaction records to the console. No direct ETL process, API calls, or transformation takes place.

## Risks

### Security Issues
As this is a COBOL program, it is unlikely to face the modern security risks Java programs face. However, file access and the handling of UUID can be vulnerable points that require validation.

### Bugs
No apparent bugs were identified in the provided code. However, performance bottlenecks and potential issues with file handling need to be taken into consideration.

## Refactoring Opportunities
1. Replace GOTO statements with structured programming techniques using classes, methods, and exception handling in Java.
2. Make use of Java file handling and I/O libraries to manage file access and improve modularity.
3. Implement proper error handling and logging in Java to ensure efficient debugging and error tracing.

## User Acceptance Criteria
```gherkin
Feature: Ledger Listing
  Scenario: List all transactions for a given group
    Given the group UUID is provided
    When the program reads the ledger file
    Then display all transaction records in the respective format

  Scenario: Handle empty ledger or missing ledger file
    Given the group UUID is provided
    When the ledger file is not found or empty
    Then stop the program gracefully and inform the user
```