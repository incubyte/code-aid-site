---
title: "HumanResources.vEmployee"
linkTitle: "HumanResources.vEmployee"
description: "HumanResources.vEmployee"
---

# Views

## [HumanResources].[vEmployee]
### Summary


- **Number of Tables Accessed:** 9
- **Lines of Code:** 39
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| [PERSON].[PERSONPHONE]| BusinessEntityID | sstselect | JOIN |



{{< details "Sql Code" >}}
```sql

CREATE VIEW [HumanResources].[vEmployee] 
AS 
SELECT 
    e.[BusinessEntityID]
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
    ,sp.[Name] AS [StateProvinceName] 
    ,a.[PostalCode]
    ,cr.[Name] AS [CountryRegionName] 
    ,p.[AdditionalContactInfo]
FROM [HumanResources].[Employee] e
	INNER JOIN [Person].[Person] p
	ON p.[BusinessEntityID] = e.[BusinessEntityID]
    INNER JOIN [Person].[BusinessEntityAddress] bea 
    ON bea.[BusinessEntityID] = e.[BusinessEntityID] 
    INNER JOIN [Person].[Address] a 
    ON a.[AddressID] = bea.[AddressID]
    INNER JOIN [Person].[StateProvince] sp 
    ON sp.[StateProvinceID] = a.[StateProvinceID]
    INNER JOIN [Person].[CountryRegion] cr 
    ON cr.[CountryRegionCode] = sp.[CountryRegionCode]
    LEFT OUTER JOIN [Person].[PersonPhone] pp
    ON pp.BusinessEntityID = p.[BusinessEntityID]
    LEFT OUTER JOIN [Person].[PhoneNumberType] pnt
    ON pp.[PhoneNumberTypeID] = pnt.[PhoneNumberTypeID]
    LEFT OUTER JOIN [Person].[EmailAddress] ea
    ON p.[BusinessEntityID] = ea.[BusinessEntityID];

```
{{< /details >}}
## Overview
The `HumanResources.vEmployee` is a database view that provides employee information such as name, job title, phone numbers, email address, and address details. It fetches this data by joining multiple tables from the `Person` and `HumanResources` schemas.

## Details

### Information on data

The data is fetched from the following tables:

1. `HumanResources.Employee`
2. `Person.Person`
3. `Person.BusinessEntityAddress`
4. `Person.Address`
5. `Person.StateProvince`
6. `Person.CountryRegion`
7. `Person.PersonPhone`
8. `Person.PhoneNumberType`
9. `Person.EmailAddress`

### Information on the tables

1. **`HumanResources.Employee`**: Contains employee data such as BusinessEntityID and JobTitle.
2. **`Person.Person`**: Contains personal information such as name and email promotion preferences.
3. **`Person.BusinessEntityAddress`**: Associates BusinessEntityIDs with AddressIDs.
4. **`Person.Address`**: Contains address information such as city, state, and postal code.
5. **`Person.StateProvince`**: Contains state and province information.
6. **`Person.CountryRegion`**: Contains country and region information.
7. **`Person.PersonPhone`**: Contains phone number data.
8. **`Person.PhoneNumberType`**: Contains phone number type information (e.g. home, work, mobile).
9. **`Person.EmailAddress`**: Contains email address data.

### Possible optimization opportunities
Since the view is performing multiple inner and left outer joins, there might be some room for optimization depending on the data size and query patterns.

### Possible bugs
There are no apparent bugs in the view.

### Risk
The view doesn't have any WHERE clause. However, since it's only retrieving data (using SELECT), the risks are minimal.

### Code Complexity
The code is moderately complex due to multiple joins. But overall, it's quite readable and manageable. 

### Refactoring Opportunities
There are no apparent refactoring opportunities.

## User Acceptance Criteria

```
Feature: Employee Information View
  Scenario: Fetching employee information
    Given the database contains employee information
    When I query the HumanResources.vEmployee view
    Then I should get the employee information including name, job title, phone number, email, and address details

  Scenario: Fetching employee information with a specific job title
    Given the database contains employee information
    When I query the HumanResources.vEmployee view with a specific job title filter
    Then I should get the employee information matching the provided job title

  Scenario: Fetching employees without a phone number
    Given the database contains employee information
    When I query the HumanResources.vEmployee view for employees without a phone number
    Then I should get the employee information with no phone number details
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstselect | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [PERSON].[EMAILADDRESS].[EmailAddress], [PERSON].[PERSONPHONE].[PhoneNumber], [PERSON].[PERSON].[LastName], [HUMANRESOURCES].[EMPLOYEE].[JobTitle], [PERSON].[PERSON].[MiddleName], [PERSON].[ADDRESS].[PostalCode], [PERSON].[PERSON].[Title], [PERSON].[ADDRESS].[AddressLine1], [PERSON].[ADDRESS].[AddressLine2], [PERSON].[STATEPROVINCE].[Name], [PERSON].[PHONENUMBERTYPE].[Name], [PERSON].[PERSON].[Suffix], [PERSON].[COUNTRYREGION].[Name], [PERSON].[PERSON].[FirstName], [PERSON].[PERSON].[EmailPromotion], [PERSON].[ADDRESS].[City], [PERSON].[PERSON].[AdditionalContactInfo] | NA | NA | [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [PERSON].[ADDRESS].[AddressID], [PERSON].[COUNTRYREGION].[CountryRegionCode], [PERSON].[BUSINESSENTITYADDRESS].[BusinessEntityID], [PERSON].[PERSONPHONE].[PhoneNumberTypeID], [PERSON].[PERSON].[BusinessEntityID], [PERSON].[PHONENUMBERTYPE].[PhoneNumberTypeID], [PERSON].[EMAILADDRESS].[BusinessEntityID], [PERSON].[ADDRESS].[StateProvinceID], [PERSON].[PERSONPHONE].BusinessEntityID, [PERSON].[STATEPROVINCE].[StateProvinceID], [PERSON].[STATEPROVINCE].[CountryRegionCode], [PERSON].[BUSINESSENTITYADDRESS].[AddressID] |  |  |  |  | [HumanResources].[Employee], [Person].[CountryRegion], [Person].[BusinessEntityAddress], [Person].[Address], [Person].[StateProvince], [Person].[EmailAddress], [Person].[PhoneNumberType], [Person].[Person], [Person].[PersonPhone] |

