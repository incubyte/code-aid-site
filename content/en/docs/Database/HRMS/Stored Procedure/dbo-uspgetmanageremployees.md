---
title: "dbo.uspGetManagerEmployees"
linkTitle: "dbo.uspGetManagerEmployees"
description: "dbo.uspGetManagerEmployees"
---

# Stored Procedures

## [dbo].[uspGetManagerEmployees]
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

CREATE PROCEDURE [dbo].[uspGetManagerEmployees]
    @BusinessEntityID [int]
AS
BEGIN
    SET NOCOUNT ON;

    -- Use recursive query to list out all Employees required for a particular Manager
    WITH [EMP_cte]([BusinessEntityID], [OrganizationNode], [FirstName], [LastName], [RecursionLevel]) -- CTE name and columns
    AS (
        SELECT e.[BusinessEntityID], e.[OrganizationNode], p.[FirstName], p.[LastName], 0 -- Get the initial list of Employees for Manager n
        FROM [HumanResources].[Employee] e 
			INNER JOIN [Person].[Person] p 
			ON p.[BusinessEntityID] = e.[BusinessEntityID]
        WHERE e.[BusinessEntityID] = @BusinessEntityID
        UNION ALL
        SELECT e.[BusinessEntityID], e.[OrganizationNode], p.[FirstName], p.[LastName], [RecursionLevel] + 1 -- Join recursive member to anchor
        FROM [HumanResources].[Employee] e 
            INNER JOIN [EMP_cte]
            ON e.[OrganizationNode].GetAncestor(1) = [EMP_cte].[OrganizationNode]
			INNER JOIN [Person].[Person] p 
			ON p.[BusinessEntityID] = e.[BusinessEntityID]
        )
    -- Join back to Employee to return the manager name 
    SELECT [EMP_cte].[RecursionLevel], [EMP_cte].[OrganizationNode].ToString() as [OrganizationNode], p.[FirstName] AS 'ManagerFirstName', p.[LastName] AS 'ManagerLastName',
        [EMP_cte].[BusinessEntityID], [EMP_cte].[FirstName], [EMP_cte].[LastName] -- Outer select from the CTE
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
The stored procedure `[uspGetManagerEmployees]` returns a list of employees reporting to a particular manager.

## Details

### Input Parameters
1. `@BusinessEntityID` (int) - The ID of the manager whose employees need to be retrieved.

### Tables Involved
1. `[HumanResources].[Employee]`
2. `[Person].[Person]`

### Stored Procedure
```sql
CREATE PROCEDURE [dbo].[uspGetManagerEmployees]
    @BusinessEntityID [int]
AS
BEGIN
    SET NOCOUNT ON;

    -- Use recursive query to list out all Employees required for a particular Manager
    WITH [EMP_cte]([BusinessEntityID], [OrganizationNode], [FirstName], [LastName], [RecursionLevel]) -- CTE name and columns
    AS (
        SELECT e.[BusinessEntityID], e.[OrganizationNode], p.[FirstName], p.[LastName], 0 -- Get the initial list of Employees for Manager n
        FROM [HumanResources].[Employee] e 
            INNER JOIN [Person].[Person] p 
            ON p.[BusinessEntityID] = e.[BusinessEntityID]
        WHERE e.[BusinessEntityID] = @BusinessEntityID
        UNION ALL
        SELECT e.[BusinessEntityID], e.[OrganizationNode], p.[FirstName], p.[LastName], [RecursionLevel] + 1 -- Join recursive member to anchor
        FROM [HumanResources].[Employee] e 
            INNER JOIN [EMP_cte]
            ON e.[OrganizationNode].GetAncestor(1) = [EMP_cte].[OrganizationNode]
            INNER JOIN [Person].[Person] p 
            ON p.[BusinessEntityID] = e.[BusinessEntityID]
        )
    -- Join back to Employee to return the manager name 
    SELECT [EMP_cte].[RecursionLevel], [EMP_cte].[OrganizationNode].ToString() as [OrganizationNode], p.[FirstName] AS 'ManagerFirstName', p.[LastName] AS 'ManagerLastName',
        [EMP_cte].[BusinessEntityID], [EMP_cte].[FirstName], [EMP_cte].[LastName] -- Outer select from the CTE
    FROM [EMP_cte] 
        INNER JOIN [HumanResources].[Employee] e 
        ON [EMP_cte].[OrganizationNode].GetAncestor(1) = e.[OrganizationNode]
        INNER JOIN [Person].[Person] p 
        ON p.[BusinessEntityID] = e.[BusinessEntityID]
    ORDER BY [RecursionLevel], [EMP_cte].[OrganizationNode].ToString()
    OPTION (MAXRECURSION 25) 
END;
```

## Information on data
### HumanResources.Employee
Columns used:
- `BusinessEntityID`
- `OrganizationNode`

### Person.Person
Columns used:
- `BusinessEntityID`
- `FirstName`
- `LastName`

## Information on the tables
1. `[HumanResources].[Employee]` - Contains the employee records where each row represents an employee with the `BusinessEntityID` and a hierarchy of organization nodes (`OrganizationNode`).
2. `[Person].[Person]` - Contains the person records where each row represents a person with their `BusinessEntityID`, `FirstName`, and `LastName`.

## Possible optimization opportunities
There are no apparent optimization opportunities at this time.

## Possible bugs
There are no apparent bugs at this time.

## Risk
There are no risks associated with running this stored procedure without a `WHERE` clause as it requires an input parameter, `@BusinessEntityID`, to filter the results.

## Code Complexity
The code complexity is relatively low as it utilizes a recursive CTE to retrieve the employees and their managers.

## Refactoring Opportunities
There are no apparent refactoring opportunities at this time.

## User Acceptance Criteria
```gherkin
Feature: Retrieve Manager Employees
    Scenario: Successfully retrieve employees under a manager
        Given a Manager with BusinessEntityID = 2
        When the stored procedure uspGetManagerEmployees is executed with the given BusinessEntityID
        Then the result should list all employees reporting to the given manager

    Scenario: Return empty result when the given BusinessEntityID has no employees under them
        Given a Manager with BusinessEntityID = 45 who has no employees under them
        When the stored procedure uspGetManagerEmployees is executed with the given BusinessEntityID
        Then the result should be empty
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| SELECT | [PERSON].[PERSON].[LastName], [PERSON].[PERSON].[FirstName] | NA | NA | [HUMANRESOURCES].[EMPLOYEE].[OrganizationNode], [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [PERSON].[PERSON].[BusinessEntityID] |  |  |  |  | [HumanResources].[Employee], [Person].[Person] |
| SELECT | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [HUMANRESOURCES].[EMPLOYEE].[OrganizationNode], [PERSON].[PERSON].[LastName], [PERSON].[PERSON].[FirstName] | NA | NA |  |  |  |  |  |  |
| SELECT | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [HUMANRESOURCES].[EMPLOYEE].[OrganizationNode], [PERSON].[PERSON].[LastName], [PERSON].[PERSON].[FirstName] | NA | NA | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [PERSON].[PERSON].[BusinessEntityID] | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID] |  |  |  | [HumanResources].[Employee], [Person].[Person] |
| SELECT | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [HUMANRESOURCES].[EMPLOYEE].[OrganizationNode], [PERSON].[PERSON].[LastName], [PERSON].[PERSON].[FirstName] | NA | NA | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [PERSON].[PERSON].[BusinessEntityID] |  |  |  |  | [HumanResources].[Employee], [Person].[Person] |

