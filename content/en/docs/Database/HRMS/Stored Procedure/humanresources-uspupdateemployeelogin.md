---
title: "HumanResources.uspUpdateEmployeeLogin"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---


| Statement Type | Select Columns | Set Columns | Insert Columns | Joins | Where Clause | Table Name |
|---|---|---|---|---|---|---|
| sstmssqlset |  |  |  |  |  |  |
| sstmssqlblock |  |  |  |  |  |  |
| sstupdate | NA | [OrganizationNode], [LoginID], [JobTitle], [HireDate], [CurrentFlag] | NA |  | [BusinessEntityID],  | [HumanResources].[Employee] |
| sstmssqlexec |  |  |  |  |  |  |

## 1. Overview

The `HumanResources.uspUpdateEmployeeLogin` stored procedure is used to update an employee's organization node, login ID, job title, hire date, and current flag based on the provided business entity ID.

## 2. Details

### Inputs

- `@BusinessEntityID [int]`: The ID of the employee whose information is being updated.
- `@OrganizationNode [hierarchyid]`: The updated organization node of the employee.
- `@LoginID [nvarchar](256)`: The updated login ID of the employee.
- `@JobTitle [nvarchar](50)`: The updated job title of the employee.
- `@HireDate [datetime]`: The updated hire date of the employee.
- `@CurrentFlag [dbo].[Flag]`: The updated current flag of the employee.

### Execution Context

The stored procedure is executed with the caller's permissions.

## 3. Information on data

The procedure updates data in the `HumanResources.Employee` table.

## 4. Information on the tables

The relevant table is `HumanResources.Employee`, which contains the following columns:

- `BusinessEntityID [int]`: The primary key and the unique identifier for the employee.
- `OrganizationNode [hierarchyid]`: The node within the organizational hierarchy.
- `LoginID [nvarchar](256)`: The login ID of the employee.
- `JobTitle [nvarchar](50)`: The employee's job title.
- `HireDate [datetime]`: The date the employee was hired.
- `CurrentFlag [dbo].[Flag]`: A flag indicating if the employee is currently active or not.

## 5. Possible optimization opportunities

None.

## 6. Possible bugs

None.

## 7. Risk

### 7.1. Update without WHERE clause

There are no risks in this procedure related to running an update without a WHERE clause since the update statement contains the necessary WHERE clause.

## 8. Code Complexity

The code complexity for this stored procedure is low, as it only contains a single update statement and error handling with a try-catch block.

## 9. Refactoring Opportunities

None.

## 10. User Acceptance Criteria

### Gherkin Scripts

```gherkin
Feature: Update employee login information
  As a database user
  I want to be able to update employee login information
  So that I can maintain accurate and up-to-date employee data

Scenario: Update employee login information with valid inputs
  Given I have the necessary employee data to update
  When I call the uspUpdateEmployeeLogin stored procedure with valid inputs
  Then the employee's login information should be updated in the HumanResources.Employee table

Scenario: Update employee login information with invalid BusinessEntityID
  Given I have the necessary employee data to update
  When I call the uspUpdateEmployeeLogin stored procedure with an invalid BusinessEntityID
  Then an error should be logged and the employee's login information should not be updated
```

