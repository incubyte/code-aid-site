---
title: "Sales.vSalesPerson"
linkTitle: "Sales.vSalesPerson"
description: "Sales.vSalesPerson"
---

# Views

## [Sales].[vSalesPerson]
### Summary


- **Number of Tables Accessed:** 11
- **Lines of Code:** 47
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| [SALES].[SALESPERSON]| [TerritoryID] | sstselect | JOIN |



{{< details "Sql Code" >}}
```sql

CREATE VIEW [Sales].[vSalesPerson] 
AS 
SELECT 
    s.[BusinessEntityID]
    ,p.[Title]
    ,p.[FirstName]
    ,p.[MiddleName]
    ,p.[LastName]
    ,p.[Suffix]
    ,e.[JobTitle]
    ,pp.[PhoneNumber]
	,pnt.[Name] AS [PhoneNumberType]
    ,ea.[EmailAddress]
    ,p.[EmailPromotion]
    ,a.[AddressLine1]
    ,a.[AddressLine2]
    ,a.[City]
    ,[StateProvinceName] = sp.[Name]
    ,a.[PostalCode]
    ,[CountryRegionName] = cr.[Name]
    ,[TerritoryName] = st.[Name]
    ,[TerritoryGroup] = st.[Group]
    ,s.[SalesQuota]
    ,s.[SalesYTD]
    ,s.[SalesLastYear]
FROM [Sales].[SalesPerson] s
    INNER JOIN [HumanResources].[Employee] e 
    ON e.[BusinessEntityID] = s.[BusinessEntityID]
	INNER JOIN [Person].[Person] p
	ON p.[BusinessEntityID] = s.[BusinessEntityID]
    INNER JOIN [Person].[BusinessEntityAddress] bea 
    ON bea.[BusinessEntityID] = s.[BusinessEntityID] 
    INNER JOIN [Person].[Address] a 
    ON a.[AddressID] = bea.[AddressID]
    INNER JOIN [Person].[StateProvince] sp 
    ON sp.[StateProvinceID] = a.[StateProvinceID]
    INNER JOIN [Person].[CountryRegion] cr 
    ON cr.[CountryRegionCode] = sp.[CountryRegionCode]
    LEFT OUTER JOIN [Sales].[SalesTerritory] st 
    ON st.[TerritoryID] = s.[TerritoryID]
	LEFT OUTER JOIN [Person].[EmailAddress] ea
	ON ea.[BusinessEntityID] = p.[BusinessEntityID]
	LEFT OUTER JOIN [Person].[PersonPhone] pp
	ON pp.[BusinessEntityID] = p.[BusinessEntityID]
	LEFT OUTER JOIN [Person].[PhoneNumberType] pnt
	ON pnt.[PhoneNumberTypeID] = pp.[PhoneNumberTypeID];

```
{{< /details >}}
## 1. Overview
The `Sales.vSalesPerson` view is designed to provide a comprehensive view of salesperson information, including their name, contact details, address, sales territory, and performance metrics such as quotas and sales figures.

## 2. Details

The view is created using the `CREATE VIEW` statement and utilizes multiple joins to connect information from various tables. The tables included in the view are:

- `Sales.SalesPerson`
- `HumanResources.Employee`
- `Person.Person`
- `Person.BusinessEntityAddress`
- `Person.Address`
- `Person.StateProvince`
- `Person.CountryRegion`
- `Sales.SalesTerritory`
- `Person.EmailAddress`
- `Person.PersonPhone`
- `Person.PhoneNumberType`

### 2.1 Code snippet

```sql
CREATE VIEW [Sales].[vSalesPerson] 
...
FROM [Sales].[SalesPerson] s
...
INNER JOIN ...
LEFT OUTER JOIN ...
```

## 3. Information on data

The view retrieves data from several tables, and it presents the following columns:

1. BusinessEntityID
2. Title
3. FirstName
4. MiddleName
5. LastName
6. Suffix
7. JobTitle
8. PhoneNumber
9. PhoneNumberType
10. EmailAddress
11. EmailPromotion
12. AddressLine1
13. AddressLine2
14. City
15. StateProvinceName
16. PostalCode
17. CountryRegionName
18. TerritoryName
19. TerritoryGroup
20. SalesQuota
21. SalesYTD
22. SalesLastYear

## 4. Information on the tables

The view uses content from 11 different tables, which are connected through primary and foreign key relationships. Due to the use of `INNER JOIN` and `LEFT OUTER JOIN`, the query will only return rows when there is a match between the tables with `INNER JOIN`. If no match is found between `LEFT OUTER JOIN` tables, the query will return NULL values for non-matching rows.

## 5. Possible optimization opportunities

- The view will be more efficient if used only to extract necessary columns or to apply additional filtering and sorting for specific purposes.
- If multiple queries are using similar joins, creating a common view for these joins can save time and maintenance when changes are needed.

## 6. Possible bugs

There are no apparent logical bugs in the code, as the joins seem to be correctly implemented, and all necessary columns are included in the view. There may be performance-related bugs in case of extremely large datasets.

## 7. Risk

- The view contains several `LEFT OUTER JOIN` clauses, which may increase the complexity and execution time for large datasets.
- In case a schema change occurs or the primary and foreign key relationships between the tables are altered, the view may return incomplete or incorrect data or throw errors.

## 8. Code Complexity

The code complexity level is moderate because the query utilizes multiple joins with different join types (INNER and LEFT OUTER) and includes 11 tables. However, it is not complex enough to cause issues.

## 9. Refactoring Opportunities

No immediate refactoring is necessary, but code readability can be improved by adding comments to describe the purpose of each table join, and by formatting the code to align with standard SQL formatting practices.

## 10. User Acceptance Criteria

The Gherkin scripts for the behavior of the code:

```gherkin
Feature: SalesPerson view
  Scenario: Retrieve salesperson information
    Given A database containing the Sales.vSalesPerson view
    When A user queries the view
    Then The user should receive salesperson information, including their name, contact details, address, sales territory, and performance metrics

  Scenario: Retrieve filtered salesperson information
    Given A database containing the Sales.vSalesPerson view
    When A user queries the view with specific filters, such as territory or sales figures
    Then The user should receive salesperson information that meets the specified criteria
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| SELECT | [SALES].[SALESPERSON].[BusinessEntityID], [SALES].[SALESPERSON].[SalesYTD], [PERSON].[EMAILADDRESS].[EmailAddress], [PERSON].[PERSONPHONE].[PhoneNumber], [PERSON].[PERSON].[LastName], [HUMANRESOURCES].[EMPLOYEE].[JobTitle], [PERSON].[PERSON].[MiddleName], [PERSON].[ADDRESS].[PostalCode], [PERSON].[PERSON].[Title], [SALES].[SALESTERRITORY].[Name], [PERSON].[ADDRESS].[AddressLine1], [PERSON].[ADDRESS].[AddressLine2], [PERSON].[STATEPROVINCE].[Name], [SALES].[SALESPERSON].[SalesLastYear], [PERSON].[PHONENUMBERTYPE].[Name], [PERSON].[PERSON].[Suffix], [PERSON].[COUNTRYREGION].[Name], [SALES].[SALESPERSON].[SalesQuota], [PERSON].[PERSON].[FirstName], [PERSON].[PERSON].[EmailPromotion], [SALES].[SALESTERRITORY].[Group], [PERSON].[ADDRESS].[City] | NA | NA | [SALES].[SALESPERSON].[BusinessEntityID], [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [PERSON].[ADDRESS].[AddressID], [PERSON].[COUNTRYREGION].[CountryRegionCode], [PERSON].[BUSINESSENTITYADDRESS].[BusinessEntityID], [PERSON].[PERSONPHONE].[PhoneNumberTypeID], [SALES].[SALESTERRITORY].[TerritoryID], [PERSON].[PERSON].[BusinessEntityID], [PERSON].[PHONENUMBERTYPE].[PhoneNumberTypeID], [PERSON].[EMAILADDRESS].[BusinessEntityID], [PERSON].[ADDRESS].[StateProvinceID], [PERSON].[STATEPROVINCE].[StateProvinceID], [PERSON].[STATEPROVINCE].[CountryRegionCode], [SALES].[SALESPERSON].[TerritoryID], [PERSON].[BUSINESSENTITYADDRESS].[AddressID], [PERSON].[PERSONPHONE].[BusinessEntityID] |  |  |  |  | [HumanResources].[Employee], [Sales].[SalesTerritory], [Person].[CountryRegion], [Person].[BusinessEntityAddress], [Sales].[SalesPerson], [Person].[Address], [Person].[StateProvince], [Person].[EmailAddress], [Person].[PhoneNumberType], [Person].[Person], [Person].[PersonPhone] |

