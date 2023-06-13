---
title: "Sales.vIndividualCustomer"
linkTitle: "Sales.vIndividualCustomer"
description: "Sales.vIndividualCustomer"
---

# Views

## [Sales].[vIndividualCustomer]
### Summary


- **Number of Tables Accessed:** 10
- **Lines of Code:** 42
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| [SALES].[CUSTOMER]| [PersonID] | sstselect | JOIN |
| [SALES].[CUSTOMER]| StoreID | sstselect | WHERE |



{{< details "Sql Code" >}}
```sql

CREATE VIEW [Sales].[vIndividualCustomer] 
AS 
SELECT 
    p.[BusinessEntityID]
    ,p.[Title]
    ,p.[FirstName]
    ,p.[MiddleName]
    ,p.[LastName]
    ,p.[Suffix]
    ,pp.[PhoneNumber]
	,pnt.[Name] AS [PhoneNumberType]
    ,ea.[EmailAddress]
    ,p.[EmailPromotion]
    ,at.[Name] AS [AddressType]
    ,a.[AddressLine1]
    ,a.[AddressLine2]
    ,a.[City]
    ,[StateProvinceName] = sp.[Name]
    ,a.[PostalCode]
    ,[CountryRegionName] = cr.[Name]
    ,p.[Demographics]
FROM [Person].[Person] p
    INNER JOIN [Person].[BusinessEntityAddress] bea 
    ON bea.[BusinessEntityID] = p.[BusinessEntityID] 
    INNER JOIN [Person].[Address] a 
    ON a.[AddressID] = bea.[AddressID]
    INNER JOIN [Person].[StateProvince] sp 
    ON sp.[StateProvinceID] = a.[StateProvinceID]
    INNER JOIN [Person].[CountryRegion] cr 
    ON cr.[CountryRegionCode] = sp.[CountryRegionCode]
    INNER JOIN [Person].[AddressType] at 
    ON at.[AddressTypeID] = bea.[AddressTypeID]
	INNER JOIN [Sales].[Customer] c
	ON c.[PersonID] = p.[BusinessEntityID]
	LEFT OUTER JOIN [Person].[EmailAddress] ea
	ON ea.[BusinessEntityID] = p.[BusinessEntityID]
	LEFT OUTER JOIN [Person].[PersonPhone] pp
	ON pp.[BusinessEntityID] = p.[BusinessEntityID]
	LEFT OUTER JOIN [Person].[PhoneNumberType] pnt
	ON pnt.[PhoneNumberTypeID] = pp.[PhoneNumberTypeID]
WHERE c.StoreID IS NULL;

```
{{< /details >}}
## Overview

This markdown documentation provides information about the `Sales.vIndividualCustomer` view in the database.

## Details

The `Sales.vIndividualCustomer` view is created using the `CREATE VIEW` statement. It retrieves information about individual customers and their related data such as contact details, address details, and demographics.

## Information on data

The data in this view comes from the following tables:

1. `Person.Person`
2. `Person.BusinessEntityAddress`
3. `Person.Address`
4. `Person.StateProvince`
5. `Person.CountryRegion`
6. `Person.AddressType`
7. `Sales.Customer`
8. `Person.EmailAddress`
9. `Person.PersonPhone`
10. `Person.PhoneNumberType`

## Information on the tables

The tables used in this view are from different schemas in the database. They are related to each other by primary and foreign key relationships, which are used to join the tables in the view.

## Possible optimization opportunities

1. It would be beneficial to add indexes on the columns used in the JOIN conditions to improve the query performance.

## Possible bugs

There are no known bugs in this view at the moment.

## Risk

1. Since the view uses multiple joins, it may have some effect on the performance of the database when returning large datasets.
2. If there's any change in the schema of any of the underlying tables, the view might return incorrect results or throw an error.

## Code Complexity

The code complexity of this view is considered moderate due to the multiple JOIN and WHERE conditions.

## Refactoring Opportunities

1. If there are common filtering conditions on the data, it might help to create separate smaller views for those conditions and then create this view on top of those.
2. Analyze query performance and re-write JOIN conditions or filters to improve performance.

## User Acceptance Criteria

```gherkin
Feature: Sales.vIndividualCustomer View
  Scenario: Retrieve individual customer information
    Given there are individual customers in the Sales.Customer table
    When I query the Sales.vIndividualCustomer view
    Then I should see a list of individual customers with their contact, address and demographic information
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| SELECT | [PERSON].[EMAILADDRESS].[EmailAddress], [PERSON].[PERSONPHONE].[PhoneNumber], [PERSON].[PERSON].[LastName], [PERSON].[PERSON].[MiddleName], [PERSON].[ADDRESS].[PostalCode], [PERSON].[PERSON].[Title], [PERSON].[ADDRESS].[AddressLine1], [PERSON].[ADDRESS].[AddressLine2], [PERSON].[STATEPROVINCE].[Name], [PERSON].[PERSON].[BusinessEntityID], [PERSON].[PHONENUMBERTYPE].[Name], [PERSON].[PERSON].[Suffix], [PERSON].[COUNTRYREGION].[Name], [PERSON].[ADDRESSTYPE].[Name], [PERSON].[PERSON].[FirstName], [PERSON].[PERSON].[EmailPromotion], [PERSON].[PERSON].[Demographics], [PERSON].[ADDRESS].[City] | NA | NA | [SALES].[CUSTOMER].[PersonID], [PERSON].[ADDRESSTYPE].[AddressTypeID], [PERSON].[ADDRESS].[AddressID], [PERSON].[COUNTRYREGION].[CountryRegionCode], [PERSON].[BUSINESSENTITYADDRESS].[BusinessEntityID], [PERSON].[PERSONPHONE].[PhoneNumberTypeID], [PERSON].[PERSON].[BusinessEntityID], [PERSON].[PHONENUMBERTYPE].[PhoneNumberTypeID], [PERSON].[EMAILADDRESS].[BusinessEntityID], [PERSON].[ADDRESS].[StateProvinceID], [PERSON].[STATEPROVINCE].[StateProvinceID], [PERSON].[STATEPROVINCE].[CountryRegionCode], [PERSON].[BUSINESSENTITYADDRESS].[AddressID], [PERSON].[BUSINESSENTITYADDRESS].[AddressTypeID], [PERSON].[PERSONPHONE].[BusinessEntityID] | [SALES].[CUSTOMER].StoreID |  |  |  | [Person].[CountryRegion], [Person].[BusinessEntityAddress], [Person].[Address], [Person].[StateProvince], [Person].[AddressType], [Sales].[Customer], [Person].[EmailAddress], [Person].[PhoneNumberType], [Person].[Person], [Person].[PersonPhone] |

