---
title: "dbo.uspGetEmployeeManagers"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins | Where Clause | Table Name |
|---|---|---|---|---|---|---|
| sstmssqlset |  |  |  |  |  |  |
| sstselect | [RecursionLevel], [BusinessEntityID], [FirstName], [LastName], [EMP_cte].[OrganizationNode].ToString(), [FirstName], [LastName] | NA | NA | [OrganizationNode], [BusinessEntityID] |  | [EMP_cte], [HumanResources].[Employee], [Person].[Person] |
| sstselect | [BusinessEntityID], [OrganizationNode], [FirstName], [LastName], [JobTitle], [RecursionLevel] + 1 | NA | NA |  |  |  |
| sstselect | [BusinessEntityID], [OrganizationNode], [FirstName], [LastName], [JobTitle], 0 | NA | NA | [BusinessEntityID] | [BusinessEntityID],  | [HumanResources].[Employee], [Person].[Person] |
| sstselect | [BusinessEntityID], [OrganizationNode], [FirstName], [LastName], [JobTitle], [RecursionLevel] + 1 | NA | NA | [OrganizationNode], [BusinessEntityID] |  | [HumanResources].[Employee], [EMP_cte], [Person].[Person] |


## 1. Overview
This documentation contains information for the stored procedure `[dbo].[uspGetEmployeeManagers]`. The stored procedure takes one input parameter, `@BusinessEntityID`, and returns a list of managers above the specified employee in the organizational hierarchy.

## 2. Details
The `[dbo].[uspGetEmployeeManagers]` procedure combines data from the `[HumanResources].[Employee]` and `[Person].[Person]` tables using a recursive common table expression (CTE) to retrieve the manager hierarchy for a specific employee based on their `BusinessEntityID`.

## 3. Information on data
The stored procedure uses data from the following tables:

- `[HumanResources].[Employee]`: Contains employee data such as job titles and organization hierarchy.
- `[Person].[Person]`: Contains personal information about the employees, such as the first and last names.

## 4. Information on the tables
The following tables are used in the stored procedure:

1. `[HumanResources].[Employee]`

- `BusinessEntityID`: Employee identifier
- `OrganizationNode`: Hierarchical node that represents the employee's position in the organization
- `JobTitle`: Position title of the employee

2. `[Person].[Person]`

- `BusinessEntityID`: Person identifier, which is the same as the employee identifier
- `FirstName`: First name of the employee
- `LastName`: Last name of the employee

## 5. Possible optimization opportunities
- Currently, the procedure uses the OPTION (MAXRECURSION 25) hint to limit the recursion depth of the CTE. If the organization has a deeper hierarchy, consider increasing the value or removing the limitation.
- An index on `[HumanResources].[Employee].[OrganizationNode]` and `[Person].[Person].[BusinessEntityID]` might improve the performance of the query.

## 6. Possible bugs
- The procedure may return incorrect data if there are data inconsistencies between the `[HumanResources].[Employee]` and `[Person].[Person]` tables.
- The hierarchy may not be displayed correctly if there are circular dependencies between the employees and their managers.

## 7. Risk
There are no queries running without a `WHERE` clause in this stored procedure.

## 8. Code Complexity
The code complexity is average, a basic understanding of recursive common table expressions is needed.

## 9. Refactoring Opportunities
- Consider adding foreign key constraints on the bindings between `[HumanResources].[Employee]` and `[Person].[Person]` to maintain data consistency.
- Instead of using the `OPTION (MAXRECURSION 25)` hint in the query, you can configure the server for a higher maximum recursion level.

## 10. User Acceptance Criteria

The following Gherkin scripts describe the behavior of the `uspGetEmployeeManagers` stored procedure:

```gherkin
Feature: Retrieve employee manager hierarchy
  Scenario: Get manager hierarchy for a valid employee
    Given a BusinessEntityID exists in HumanResources.Employee and Person.Person tables
    When the uspGetEmployeeManagers is executed with the given BusinessEntityID
    Then it should return the manager hierarchy for the specified employee

  Scenario: Specify an invalid employee
    Given a BusinessEntityID does not exist in HumanResources.Employee or Person.Person tables
    When the uspGetEmployeeManagers is executed with the given BusinessEntityID
    Then it should return an empty result set

  Scenario: Limit recursive depth
    Given the organization has more than 25 levels of hierarchy
    When the uspGetEmployeeManagers is executed
    Then it should return a manager hierarchy up to 25 levels deep
```
