+++
categories = ["Documentation"]
title = "log-in.cob"
weight = 1
+++


# Overview

The given COBOL code is a simple log-in program that compares the provided email address and password with hard-coded values. If the provided values match, the program displays a static token, otherwise, it returns an error code.

# Function Explanation

There is only a single function in the given COBOL code. The procedure division accepts two input arguments and compares them with hard-coded values. If the values match, it `DISPLAY`s a static token, but if they don't match, it returns an error.

{{< details "Cobol Code" >}}
```cobol

          IDENTIFICATION DIVISION.
          PROGRAM-ID. asdf-log-in.

          DATA DIVISION.
          WORKING-STORAGE SECTION.
          01 ws-email-address             PIC X(254).
          01 ws-password                  PIC X(64).

          PROCEDURE DIVISION.
              ACCEPT ws-email-address FROM ARGUMENT-VALUE
              ACCEPT ws-password FROM ARGUMENT-VALUE

        *    TODO: Implement actual credential verification.
              IF ws-email-address IS EQUAL TO 'asdf@example.com' AND
                ws-password IS EQUAL TO 'asdf' THEN
        *        TODO: Return actual token.
                  DISPLAY '0e97bec6ee8b49fbbabbaa9d1f404c3d'
                      WITH NO ADVANCING
              ELSE
                  MOVE 2 TO RETURN-CODE
              END-IF

              STOP RUN
              .

```
{{< /details >}}

## Procedure Division

### Purpose

The main purpose of the procedure division is to accept user credentials, validate them, and then either return a token or set an error code.

### Inputs

1. `ws-email-address`: A PIC X(254) data field, containing the user-provided email address.
2. `ws-password`: A PIC X(64) data field containing the user-provided password.

### Outputs

1. A static token (`0e97bec6ee8b49fbbabbaa9d1f404c3d`) is displayed if the provided credentials match the hard-coded values.
2. An error code is set (RETURN-CODE = 2) if the provided credentials do not match the hard-coded values.

### Behavior

1. Accept the user-provided email address and password.
2. Compare these values with the hard-coded values.
3. If the values match, display the static token.
4. If the values do not match, set an error code.

# Code Analysis

The given code is quite minimal, and no instances of code duplication or violations of SOLID principles are present. However, due to its simplicity, the code lacks proper credential verification, token generation, and error handling.

# Data Operations

There are no Extraction, Transformation, and Loading (ETL) processes in this code, as it only compares the provided credentials with hard-coded values.

# Risks

## Security Issues

1. The email address and password are hard-coded, which is a clear security risk. Ideally, these values should be stored securely and hashed, making them inaccessible in plaintext.
2. The static token displayed has no expiration, adding a security risk in case the token is compromised. Tokens should be generated dynamically and include an expiration timestamp.

## Bugs

There are no evident bugs in the code; however, the code is simplistic and lacks proper token generation, error handling, and a comprehensive verification process.

# Refactoring Opportunities

1. Replace hard-coded email and password values with secure storage and hashing mechanisms.
2. Implement a proper token generation mechanism, including expiration timestamps.
3. Improve error handling, providing meaningful error messages and codes.
4. Encapsulate the credential verification and token generation processes in separate functions or classes.

# User Acceptance Criteria

```gherkin
Feature: Log-in validation

  Scenario: Successful log-in
    Given valid email and password are provided
    When the program validates provided credentials
    Then a valid token with expiration timestamp should be returned

  Scenario: Unsuccessful log-in with wrong email and password
    Given invalid email and password are provided
    When the program validates the provided credentials
    Then an error message indicating invalid credentials should be returned

  Scenario: Unsuccessful log-in with wrong email
    Given only an invalid email is provided
    When the program validates the provided credentials
    Then an error message indicating invalid credentials should be returned

  Scenario: Unsuccessful log-in with wrong password
    Given only an invalid password is provided
    When the program validates the provided credentials
    Then an error message indicating invalid credentials should be returned
```