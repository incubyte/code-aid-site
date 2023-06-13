---
title: "dbo.uspGetEmployeeManagers"
linkTitle: "dbo.uspGetEmployeeManagers"
description: "dbo.uspGetEmployeeManagers"
---

# Stored Procedures

## [dbo].[uspGetEmployeeManagers]
### Summary


- **Number of Tables Accessed:** 2
- **Lines of Code:** 34
- **Code Complexity:** 4
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|


### Parameters

| Parameter Name | Data Type | Direction |
|---|---|---|
| @BusinessEntityID | INT | IN |

{{< details "Sql Code" >}}
```sql

CREATE PROCEDURE [dbo].[uspGetEmployeeManagers]
    @BusinessEntityID [int]
AS
BEGIN
    SET NOCOUNT ON;

    -- Use recursive query to list out all Employees required for a particular Manager
    WITH [EMP_cte]([BusinessEntityID], [OrganizationNode], [FirstName], [LastName], [JobTitle], [RecursionLevel]) -- CTE name and columns
    AS (
        SELECT e.[BusinessEntityID], e.[OrganizationNode], p.[FirstName], p.[LastName], e.[JobTitle], 0 -- Get the initial Employee
        FROM [HumanResources].[Employee] e 
			INNER JOIN [Person].[Person] as p
			ON p.[BusinessEntityID] = e.[BusinessEntityID]
        WHERE e.[BusinessEntityID] = @BusinessEntityID
        UNION ALL
        SELECT e.[BusinessEntityID], e.[OrganizationNode], p.[FirstName], p.[LastName], e.[JobTitle], [RecursionLevel] + 1 -- Join recursive member to anchor
        FROM [HumanResources].[Employee] e 
            INNER JOIN [EMP_cte]
            ON e.[OrganizationNode] = [EMP_cte].[OrganizationNode].GetAncestor(1)
            INNER JOIN [Person].[Person] p 
            ON p.[BusinessEntityID] = e.[BusinessEntityID]
    )
    -- Join back to Employee to return the manager name 
    SELECT [EMP_cte].[RecursionLevel], [EMP_cte].[BusinessEntityID], [EMP_cte].[FirstName], [EMP_cte].[LastName], 
        [EMP_cte].[OrganizationNode].ToString() AS [OrganizationNode], p.[FirstName] AS 'ManagerFirstName', p.[LastName] AS 'ManagerLastName'  -- Outer select from the CTE
    FROM [EMP_cte] 
        INNER JOIN [HumanResources].[Employee] e 
        ON [EMP_cte].[OrganizationNode].GetAncestor(1) = e.[OrganizationNode]
        INNER JOIN [Person].[Person] p 
        ON p.[BusinessEntityID] = e.[BusinessEntityID]
    ORDER BY [RecursionLevel], [EMP_cte].[OrganizationNode].ToString()
    OPTION (MAXRECURSION 25) 
END;

```
{{< /details >}}
## Overview
In this section, we will document the stored procedure `uspGetEmployeeManagers` which retrieves the hierarchy of managers for a specific employee in a company.

## Details
The stored procedure `uspGetEmployeeManagers` accepts a single input parameter, `@BusinessEntityID`, which represents the business entity ID of the target employee.

It starts with a common table expression (CTE) named `EMP_cte` which recursively retrieves the hierarchy of managers for the provided employee. The CTE iteratively joins employees with their corresponding managers until the top level of the hierarchy is reached.

Finally, the query retrieves the manager's first name and last name along with some additional information about the employee, such as RecursionLevel, BusinessEntityID, FirstName, LastName, and OrganizationNode.

## Information on data
The stored procedure uses two tables from the database:

1. `[HumanResources].[Employee]`
2. `[Person].[Person]`

## Information on the tables
### 1. `[HumanResources].[Employee]`
The `[HumanResources].[Employee]` table contains information about the employees of the company, such as their business entity ID, organization node, and job title.

### 2. `[Person].[Person]`
The `[Person].[Person]` table contains personal information about the employees, such as their first name and last name.

## Possible optimization opportunities
Currently, there aren't any evident optimization opportunities as the query is precise and clear. However, if performance becomes an issue, consider indexing the OrganizationNode and BusinessEntityID columns.

## Possible bugs
There are no evident bugs in the given stored procedure.

## Risk
There are no risks such as running queries without a WHERE clause in the given stored procedure.

## Code Complexity
The code complexity is manageable as it utilizes a CTE to retrieve the hierarchical data. The structure is clear, and the query is easy to understand.

## Refactoring Opportunities
There are no significant refactoring opportunities in the current code as it is well-structured and easy to understand.

## User Acceptance Criteria
```
Feature: Retrieve employee manager hierarchy
  Scenario: Retrieve the hierarchy of managers for an employee
    Given I have a valid BusinessEntityID
    When I execute the uspGetEmployeeManagers stored procedure with the BusinessEntityID as input
    Then I should get the hierarchy of managers for that employee along with the employee and manager details
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| SELECT | [PERSON].[PERSON].[LastName], [PERSON].[PERSON].[FirstName] | NA | NA | [HUMANRESOURCES].[EMPLOYEE].[OrganizationNode], [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [PERSON].[PERSON].[BusinessEntityID] |  |  |  |  | [HumanResources].[Employee], [Person].[Person] |
| SELECT | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [HUMANRESOURCES].[EMPLOYEE].[OrganizationNode], [PERSON].[PERSON].[LastName], [HUMANRESOURCES].[EMPLOYEE].[JobTitle], [PERSON].[PERSON].[FirstName] | NA | NA |  |  |  |  |  |  |
| SELECT | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [HUMANRESOURCES].[EMPLOYEE].[OrganizationNode], [PERSON].[PERSON].[LastName], [HUMANRESOURCES].[EMPLOYEE].[JobTitle], [PERSON].[PERSON].[FirstName] | NA | NA | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [PERSON].[PERSON].[BusinessEntityID] | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID] |  |  |  | [HumanResources].[Employee], [Person].[Person] |
| SELECT | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [HUMANRESOURCES].[EMPLOYEE].[OrganizationNode], [PERSON].[PERSON].[LastName], [HUMANRESOURCES].[EMPLOYEE].[JobTitle], [PERSON].[PERSON].[FirstName] | NA | NA | [HUMANRESOURCES].[EMPLOYEE].[OrganizationNode], [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [PERSON].[PERSON].[BusinessEntityID] |  |  |  |  | [HumanResources].[Employee], [Person].[Person] |

