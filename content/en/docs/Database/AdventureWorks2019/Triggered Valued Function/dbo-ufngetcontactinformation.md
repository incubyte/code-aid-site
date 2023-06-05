---
title: "dbo.ufnGetContactInformation"
linkTitle: "dbo.ufnGetContactInformation"
description: "dbo.ufnGetContactInformation"
---

# Functions

## [dbo].[ufnGetContactInformation]
### Summary


- **Number of Tables Accessed:** 7
- **Lines of Code:** 70
- **Code Complexity:** 5
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| [SALES].[CUSTOMER]| [PersonID] | sstselect | JOIN |
| [PERSON].CONTACTTYPE| [ContactTypeID] | sstselect | JOIN |
| [SALES].[CUSTOMER]| [StoreID] | sstselect | WHERE |


### Parameters

| Parameter Name | Data Type | Direction |
|---|---|---|
| @PersonID | INT | IN |
| RETURN | TABLE | OUT |

{{< details "Sql Code" >}}
```sql

CREATE FUNCTION [dbo].[ufnGetContactInformation](@PersonID int)
RETURNS @retContactInformation TABLE 
(
    -- Columns returned by the function
    [PersonID] int NOT NULL, 
    [FirstName] [nvarchar](50) NULL, 
    [LastName] [nvarchar](50) NULL, 
	[JobTitle] [nvarchar](50) NULL,
    [BusinessEntityType] [nvarchar](50) NULL
)
AS 
-- Returns the first name, last name, job title and business entity type for the specified contact.
-- Since a contact can serve multiple roles, more than one row may be returned.
BEGIN
	IF @PersonID IS NOT NULL 
		BEGIN
		IF EXISTS(SELECT * FROM [HumanResources].[Employee] e 
					WHERE e.[BusinessEntityID] = @PersonID) 
			INSERT INTO @retContactInformation
				SELECT @PersonID, p.FirstName, p.LastName, e.[JobTitle], 'Employee'
				FROM [HumanResources].[Employee] AS e
					INNER JOIN [Person].[Person] p
					ON p.[BusinessEntityID] = e.[BusinessEntityID]
				WHERE e.[BusinessEntityID] = @PersonID;

		IF EXISTS(SELECT * FROM [Purchasing].[Vendor] AS v
					INNER JOIN [Person].[BusinessEntityContact] bec 
					ON bec.[BusinessEntityID] = v.[BusinessEntityID]
					WHERE bec.[PersonID] = @PersonID)
			INSERT INTO @retContactInformation
				SELECT @PersonID, p.FirstName, p.LastName, ct.[Name], 'Vendor Contact' 
				FROM [Purchasing].[Vendor] AS v
					INNER JOIN [Person].[BusinessEntityContact] bec 
					ON bec.[BusinessEntityID] = v.[BusinessEntityID]
					INNER JOIN [Person].ContactType ct
					ON ct.[ContactTypeID] = bec.[ContactTypeID]
					INNER JOIN [Person].[Person] p
					ON p.[BusinessEntityID] = bec.[PersonID]
				WHERE bec.[PersonID] = @PersonID;
		
		IF EXISTS(SELECT * FROM [Sales].[Store] AS s
					INNER JOIN [Person].[BusinessEntityContact] bec 
					ON bec.[BusinessEntityID] = s.[BusinessEntityID]
					WHERE bec.[PersonID] = @PersonID)
			INSERT INTO @retContactInformation
				SELECT @PersonID, p.FirstName, p.LastName, ct.[Name], 'Store Contact' 
				FROM [Sales].[Store] AS s
					INNER JOIN [Person].[BusinessEntityContact] bec 
					ON bec.[BusinessEntityID] = s.[BusinessEntityID]
					INNER JOIN [Person].ContactType ct
					ON ct.[ContactTypeID] = bec.[ContactTypeID]
					INNER JOIN [Person].[Person] p
					ON p.[BusinessEntityID] = bec.[PersonID]
				WHERE bec.[PersonID] = @PersonID;

		IF EXISTS(SELECT * FROM [Person].[Person] AS p
					INNER JOIN [Sales].[Customer] AS c
					ON c.[PersonID] = p.[BusinessEntityID]
					WHERE p.[BusinessEntityID] = @PersonID AND c.[StoreID] IS NULL) 
			INSERT INTO @retContactInformation
				SELECT @PersonID, p.FirstName, p.LastName, NULL, 'Consumer' 
				FROM [Person].[Person] AS p
					INNER JOIN [Sales].[Customer] AS c
					ON c.[PersonID] = p.[BusinessEntityID]
					WHERE p.[BusinessEntityID] = @PersonID AND c.[StoreID] IS NULL; 
		END

	RETURN;
END;

```
{{< /details >}}
## Overview
This is a documentation of the `ufnGetContactInformation` scalar valued function in the `dbo` schema. The function returns contact information for a given PersonID. The contact information includes first name, last name, job title, and business entity type.

## Details
The function has one input parameter:
1. `@PersonID`: integer - The ID of the person for whom contact information must be retrieved.

The function returns a table with the following columns:
1. `PersonID`: integer - The ID of the person.
2. `FirstName`: nvarchar(50) - The first name of the person.
3. `LastName`: nvarchar(50) - The last name of the person.
4. `JobTitle`: nvarchar(50) - The job title of the person (if applicable).
5. `BusinessEntityType`: nvarchar(50) - The type of business entity for the contact.

## Information on data

### Information on the tables
The function references the following tables:

1. `[HumanResources].[Employee]`
2. `[Person].[Person]`
3. `[Purchasing].[Vendor]`
4. `[Person].[BusinessEntityContact]`
5. `[Person].ContactType`
6. `[Sales].[Store]`
7. `[Sales].[Customer]`

### Possible optimization opportunities
N/A

### Possible bugs
N/A

## Risk
There are no queries that run without a WHERE clause.

## Code Complexity
The function has moderate code complexity. It consists of multiple IF EXISTS statements and a series of SELECT queries and INSERT statements. The queries reference several tables and utilize INNER JOINs.

## Refactoring Opportunities
The function could be refactored to use a single SELECT query with UNION ALL to consolidate the results. This would reduce code repetition and simplify the function code.

## User Acceptance Criteria

```
Feature: ufnGetContactInformation
  Scenario: Retrieve contact information for a given PersonID
    Given there is a person with ID 1
    When the ufnGetContactInformation function is called with the PersonID 1
    Then the function should return the contact information for the person with ID 1
    
  Scenario: No contact information for a given PersonID
    Given there is no person with ID 9999
    When the ufnGetContactInformation function is called with the PersonID 9999
    Then the function should return an empty result set
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstselect | [HUMANRESOURCES].[EMPLOYEE].* | NA | NA |  | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID] |  |  |  | [HumanResources].[Employee] |
| sstinsert | NA | NA | All | NA | NA |  |  |  |  |
| sstselect | [HUMANRESOURCES].[EMPLOYEE].[JobTitle], [PERSON].[PERSON].LastName, [PERSON].[PERSON].FirstName | NA | NA | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [PERSON].[PERSON].[BusinessEntityID] | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID] |  |  |  | [HumanResources].[Employee], [Person].[Person] |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstselect | [PERSON].[BUSINESSENTITYCONTACT].* | NA | NA | [PERSON].[BUSINESSENTITYCONTACT].[BusinessEntityID], [PURCHASING].[VENDOR].[BusinessEntityID] | [PERSON].[BUSINESSENTITYCONTACT].[PersonID] |  |  |  | [Person].[BusinessEntityContact], [Purchasing].[Vendor] |
| sstinsert | NA | NA | All | NA | NA |  |  |  |  |
| sstselect | [PERSON].[PERSON].LastName, [PERSON].[PERSON].FirstName, [PERSON].CONTACTTYPE.[Name] | NA | NA | [PERSON].[BUSINESSENTITYCONTACT].[BusinessEntityID], [PURCHASING].[VENDOR].[BusinessEntityID], [PERSON].[BUSINESSENTITYCONTACT].[PersonID], [PERSON].[BUSINESSENTITYCONTACT].[ContactTypeID], [PERSON].CONTACTTYPE.[ContactTypeID], [PERSON].[PERSON].[BusinessEntityID] | [PERSON].[BUSINESSENTITYCONTACT].[PersonID] |  |  |  | [Person].ContactType, [Person].[BusinessEntityContact], [Purchasing].[Vendor], [Person].[Person] |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstselect | [PERSON].[BUSINESSENTITYCONTACT].* | NA | NA | [PERSON].[BUSINESSENTITYCONTACT].[BusinessEntityID], [SALES].[STORE].[BusinessEntityID] | [PERSON].[BUSINESSENTITYCONTACT].[PersonID] |  |  |  | [Sales].[Store], [Person].[BusinessEntityContact] |
| sstinsert | NA | NA | All | NA | NA |  |  |  |  |
| sstselect | [PERSON].[PERSON].LastName, [PERSON].[PERSON].FirstName, [PERSON].CONTACTTYPE.[Name] | NA | NA | [PERSON].[BUSINESSENTITYCONTACT].[BusinessEntityID], [PERSON].[BUSINESSENTITYCONTACT].[PersonID], [PERSON].[BUSINESSENTITYCONTACT].[ContactTypeID], [PERSON].CONTACTTYPE.[ContactTypeID], [SALES].[STORE].[BusinessEntityID], [PERSON].[PERSON].[BusinessEntityID] | [PERSON].[BUSINESSENTITYCONTACT].[PersonID] |  |  |  | [Person].ContactType, [Sales].[Store], [Person].[BusinessEntityContact], [Person].[Person] |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstselect | [SALES].[CUSTOMER].* | NA | NA | [SALES].[CUSTOMER].[PersonID], [PERSON].[PERSON].[BusinessEntityID] | [SALES].[CUSTOMER].[StoreID], [PERSON].[PERSON].[BusinessEntityID] |  |  |  | [Sales].[Customer], [Person].[Person] |
| sstinsert | NA | NA | All | NA | NA |  |  |  |  |
| sstselect | [PERSON].[PERSON].LastName, [PERSON].[PERSON].FirstName | NA | NA | [SALES].[CUSTOMER].[PersonID], [PERSON].[PERSON].[BusinessEntityID] | [SALES].[CUSTOMER].[StoreID], [PERSON].[PERSON].[BusinessEntityID] |  |  |  | [Sales].[Customer], [Person].[Person] |
| sstmssqlreturn |  |  |  |  |  |  |  |  |  |

