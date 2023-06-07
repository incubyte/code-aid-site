---
title: "HumanResources.vEmployeeDepartmentHistory"
linkTitle: "HumanResources.vEmployeeDepartmentHistory"
description: "HumanResources.vEmployeeDepartmentHistory"
---

# Views

## [HumanResources].[vEmployeeDepartmentHistory]
### Summary


- **Number of Tables Accessed:** 5
- **Lines of Code:** 24
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|



{{< details "Sql Code" >}}
```sql

CREATE VIEW [HumanResources].[vEmployeeDepartmentHistory] 
AS 
SELECT 
    e.[BusinessEntityID] 
    ,p.[Title] 
    ,p.[FirstName] 
    ,p.[MiddleName] 
    ,p.[LastName] 
    ,p.[Suffix] 
    ,s.[Name] AS [Shift]
    ,d.[Name] AS [Department] 
    ,d.[GroupName] 
    ,edh.[StartDate] 
    ,edh.[EndDate]
FROM [HumanResources].[Employee] e
	INNER JOIN [Person].[Person] p
	ON p.[BusinessEntityID] = e.[BusinessEntityID]
    INNER JOIN [HumanResources].[EmployeeDepartmentHistory] edh 
    ON e.[BusinessEntityID] = edh.[BusinessEntityID] 
    INNER JOIN [HumanResources].[Department] d 
    ON edh.[DepartmentID] = d.[DepartmentID] 
    INNER JOIN [HumanResources].[Shift] s
    ON s.[ShiftID] = edh.[ShiftID];

```
{{< /details >}}
## Overview
The SQL script provided is a query that creates a view named `[HumanResources].[vEmployeeDepartmentHistory]`. This view displays the employee department history in a more user-friendly format, merging relevant information from the Employee, Person, EmployeeDepartmentHistory, Department, and Shift tables.

## Details

1. The view is created under the HumanResources schema with the name `vEmployeeDepartmentHistory`.
2. The columns included in the view are `BusinessEntityID`, `Title`, `FirstName`, `MiddleName`, `LastName`, `Suffix`, `Shift`, `Department`, `GroupName`, `StartDate`, and `EndDate`.
3. There are no WHERE clauses in the query.

## Information on Data

The view combines the data from the following tables:

1. `HumanResources.Employee`
2. `Person.Person`
3. `HumanResources.EmployeeDepartmentHistory`
4. `HumanResources.Department`
5. `HumanResources.Shift`

## Information on the Tables

The tables involved in creating the view are the components that hold information about the employees, their personal details, their department history, and department and shift information.

- `HumanResources.Employee`: This table contains information about the company's employees
- `Person.Person`: This table contains the personal information of various people, including employees
- `HumanResources.EmployeeDepartmentHistory`: This table tracks the work history of employees within their departments
- `HumanResources.Department`: This table includes information about the individual departments within the company
- `HumanResources.Shift`: This table contains information about the various work shifts for employees

## Possible Optimization Opportunities
Since there are no WHERE clauses in the query, the view will return the complete dataset. To optimize the performance of the view, it's possible to include filtering criteria based on specific employee attributes or department information, depending on the application requirements.

## Possible Bugs
There are no evident bugs in the provided query, as it seems to correctly generate a view by joining the necessary tables.

## Risk
There is a risk due to the absence of a WHERE clause in the query. The query will run without any filtering condition, potentially leading to a large result set and affecting performance.

## Code Complexity
The code is relatively simple and easy to understand. The query joins 5 tables and selects specific columns to create a view showcasing employee department history.

## Refactoring Opportunities
The query's code is already straightforward, but possible refactoring to improve query performance could include adding conditional filtering or indexing specific columns if frequent searches or modifications are made in the original tables.

## User Acceptance Criteria

```
Feature: Employee Department History View
  The Employee Department History View displays the department and shift history of employees.

  Scenario: Retrieve employee department history
    Given the view "[HumanResources].[vEmployeeDepartmentHistory]" exists
    When I run a SELECT query on the view
    Then I should get a list of employees' department histories with their shifts

  Scenario: Filter employee department history by department
    Given the view "[HumanResources].[vEmployeeDepartmentHistory]" exists
    When I run a SELECT query on the view with a WHERE clause filtering by department
    Then I should get a list of employees' department histories with their shifts filtered by the chosen department

  Scenario: Filter employee department history by shift
    Given the view "[HumanResources].[vEmployeeDepartmentHistory]" exists
    When I run a SELECT query on the view with a WHERE clause filtering by shift
    Then I should get a list of employees' department histories with their shifts filtered by the chosen shift
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstselect | [PERSON].[PERSON].[Suffix], [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [PERSON].[PERSON].[LastName], [PERSON].[PERSON].[MiddleName], [PERSON].[PERSON].[FirstName], [PERSON].[PERSON].[Title], [HUMANRESOURCES].[DEPARTMENT].[Name], [HUMANRESOURCES].[EMPLOYEEDEPARTMENTHISTORY].[StartDate], [HUMANRESOURCES].[EMPLOYEEDEPARTMENTHISTORY].[EndDate], [HUMANRESOURCES].[SHIFT].[Name], [HUMANRESOURCES].[DEPARTMENT].[GroupName] | NA | NA | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [HUMANRESOURCES].[DEPARTMENT].[DepartmentID], [HUMANRESOURCES].[EMPLOYEEDEPARTMENTHISTORY].[DepartmentID], [HUMANRESOURCES].[SHIFT].[ShiftID], [HUMANRESOURCES].[EMPLOYEEDEPARTMENTHISTORY].[ShiftID], [PERSON].[PERSON].[BusinessEntityID], [HUMANRESOURCES].[EMPLOYEEDEPARTMENTHISTORY].[BusinessEntityID] |  |  |  |  | [HumanResources].[Employee], [HumanResources].[Department], [HumanResources].[Shift], [HumanResources].[EmployeeDepartmentHistory], [Person].[Person] |

