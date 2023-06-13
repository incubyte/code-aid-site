---
title: "HumanResources.vEmployeeDepartment"
linkTitle: "HumanResources.vEmployeeDepartment"
description: "HumanResources.vEmployeeDepartment"
---

# Views

## [HumanResources].[vEmployeeDepartment]
### Summary


- **Number of Tables Accessed:** 4
- **Lines of Code:** 22
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| [HUMANRESOURCES].[EMPLOYEEDEPARTMENTHISTORY]| EndDate | sstselect | WHERE |



{{< details "Sql Code" >}}
```sql

CREATE VIEW [HumanResources].[vEmployeeDepartment] 
AS 
SELECT 
    e.[BusinessEntityID] 
    ,p.[Title] 
    ,p.[FirstName] 
    ,p.[MiddleName] 
    ,p.[LastName] 
    ,p.[Suffix] 
    ,e.[JobTitle]
    ,d.[Name] AS [Department] 
    ,d.[GroupName] 
    ,edh.[StartDate] 
FROM [HumanResources].[Employee] e
	INNER JOIN [Person].[Person] p
	ON p.[BusinessEntityID] = e.[BusinessEntityID]
    INNER JOIN [HumanResources].[EmployeeDepartmentHistory] edh 
    ON e.[BusinessEntityID] = edh.[BusinessEntityID] 
    INNER JOIN [HumanResources].[Department] d 
    ON edh.[DepartmentID] = d.[DepartmentID] 
WHERE edh.EndDate IS NULL

```
{{< /details >}}
## Overview
The `HumanResources.vEmployeeDepartment` view displays information about each employee, their job title, and the department they belong to, where the employee's department history has no end date.

## Details

### Information on data

The view fetches data from the following tables:

1. `HumanResources.Employee`
2. `Person.Person`
3. `HumanResources.EmployeeDepartmentHistory`
4. `HumanResources.Department`

### Information on the tables

`HumanResources.Employee`: This table stores the employee information.

`Person.Person`: This table stores the details of each individual person who is associated with the company, including employees.

`HumanResources.EmployeeDepartmentHistory`: This table stores the historical information of employees' department assignments.

`HumanResources.Department`: This table stores the details of each department.

### Possible optimization opportunities

There are not any readily apparent optimization opportunities, as the view uses proper joins and a WHERE clause.

### Possible bugs

No potential bugs can be identified in the view.

### Risk

There is no risk associated with this view, as all tables are being joined properly, and the matched records are filtered using a WHERE clause.

### Code Complexity

The code complexity of this view is minimal. It involves using INNER JOINs to associate four tables and a WHERE clause to filter the relevant records.

### Refactoring Opportunities

No refactoring opportunities are identified in this code.

## User Acceptance Criteria

```gherkin
Feature: Employee Department Information
  As a user
  I want to see the employee department information
  So that I can understand which employees are in which department and their roles

Scenario: View employee department information
  Given I have access to the HumanResources.vEmployeeDepartment view
  When I query the view
  Then I should see the employee's details, job title, and their department information
  And the department history record should have no end date
```

### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| SELECT | [PERSON].[PERSON].[Suffix], [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [PERSON].[PERSON].[LastName], [HUMANRESOURCES].[EMPLOYEE].[JobTitle], [PERSON].[PERSON].[MiddleName], [PERSON].[PERSON].[FirstName], [PERSON].[PERSON].[Title], [HUMANRESOURCES].[DEPARTMENT].[Name], [HUMANRESOURCES].[EMPLOYEEDEPARTMENTHISTORY].[StartDate], [HUMANRESOURCES].[DEPARTMENT].[GroupName] | NA | NA | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [HUMANRESOURCES].[DEPARTMENT].[DepartmentID], [HUMANRESOURCES].[EMPLOYEEDEPARTMENTHISTORY].[DepartmentID], [PERSON].[PERSON].[BusinessEntityID], [HUMANRESOURCES].[EMPLOYEEDEPARTMENTHISTORY].[BusinessEntityID] | [HUMANRESOURCES].[EMPLOYEEDEPARTMENTHISTORY].EndDate |  |  |  | [HumanResources].[Employee], [HumanResources].[Department], [HumanResources].[EmployeeDepartmentHistory], [Person].[Person] |

