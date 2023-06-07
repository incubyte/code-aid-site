---
title: "Sales.vStoreWithAddresses"
linkTitle: "Sales.vStoreWithAddresses"
description: "Sales.vStoreWithAddresses"
---

# Views

## [Sales].[vStoreWithAddresses]
### Summary


- **Number of Tables Accessed:** 6
- **Lines of Code:** 23
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|



{{< details "Sql Code" >}}
```sql

CREATE VIEW [Sales].[vStoreWithAddresses] AS 
SELECT 
    s.[BusinessEntityID] 
    ,s.[Name] 
    ,at.[Name] AS [AddressType]
    ,a.[AddressLine1] 
    ,a.[AddressLine2] 
    ,a.[City] 
    ,sp.[Name] AS [StateProvinceName] 
    ,a.[PostalCode] 
    ,cr.[Name] AS [CountryRegionName] 
FROM [Sales].[Store] s
    INNER JOIN [Person].[BusinessEntityAddress] bea 
    ON bea.[BusinessEntityID] = s.[BusinessEntityID] 
    INNER JOIN [Person].[Address] a 
    ON a.[AddressID] = bea.[AddressID]
    INNER JOIN [Person].[StateProvince] sp 
    ON sp.[StateProvinceID] = a.[StateProvinceID]
    INNER JOIN [Person].[CountryRegion] cr 
    ON cr.[CountryRegionCode] = sp.[CountryRegionCode]
    INNER JOIN [Person].[AddressType] at 
    ON at.[AddressTypeID] = bea.[AddressTypeID];

```
{{< /details >}}
## Overview
This document provides markdown documentation of the `Sales.vStoreWithAddresses` view in the database. The information is organized into the following sections:

1. [Details](#Details)
2. [Information on Data](#Information-on-Data)
3. [Information on the Tables](#Information-on-the-Tables)
4. [Possible Optimization Opportunities](#Possible-Optimization-Opportunities)
5. [Possible Bugs](#Possible-Bugs)
6. [Risk](#Risk)
7. [Code Complexity](#Code-Complexity)
8. [Refactoring Opportunities](#Refactoring-Opportunities)
9. [User Acceptance Criteria](#User-Acceptance-Criteria)

## Details
The `Sales.vStoreWithAddresses` view provides information on stores, their addresses, and related geographical information. The view consolidates data from the following tables:

1. Sales.Store
2. Person.BusinessEntityAddress
3. Person.Address
4. Person.StateProvince
5. Person.CountryRegion
6. Person.AddressType

The information provided by the view includes:

- Store Business Entity ID
- Store Name
- Address Type
- Address Line 1
- Address Line 2
- City
- State/Province Name
- Postal Code
- Country/Region Name

```SQL
CREATE VIEW [Sales].[vStoreWithAddresses] AS 
SELECT 
    s.[BusinessEntityID]
    ,s.[Name]
    ,at.[Name] AS [AddressType]
    ,a.[AddressLine1]
    ,a.[AddressLine2]
    ,a.[City]
    ,sp.[Name] AS [StateProvinceName]
    ,a.[PostalCode]
    ,cr.[Name] AS [CountryRegionName]
FROM [Sales].[Store] s
    INNER JOIN [Person].[BusinessEntityAddress] bea 
    ON bea.[BusinessEntityID] = s.[BusinessEntityID]
    INNER JOIN [Person].[Address] a
    ON a.[AddressID] = bea.[AddressID]
    INNER JOIN [Person].[StateProvince] sp
    ON sp.[StateProvinceID] = a.[StateProvinceID]
    INNER JOIN [Person].[CountryRegion] cr
    ON cr.[CountryRegionCode] = sp.[CountryRegionCode]
    INNER JOIN [Person].[AddressType] at
    ON at.[AddressTypeID] = bea.[AddressTypeID];
```

## Information on Data
The data in the view is retrieved from several tables in the Person and Sales schemas. The tables involved are linked together through foreign keys. There are no calculated columns, and all columns are directly mapped from the source tables.

## Information on the Tables
The `Sales.vStoreWithAddresses` view is based on the following tables:

1. **Sales.Store**: Provides information about each store, including their BusinessEntityID and Name.
2. **Person.BusinessEntityAddress**: Links stores with their addresses, along with the type of address.
3. **Person.Address**: Contains address-specific information like Address Line, City, Postal Code, and State/Province ID.
4. **Person.StateProvince**: Holds information about state and province names and relates to CountryRegionCode.
5. **Person.CountryRegion**: Provides country and region names.
6. **Person.AddressType**: Contains information about the type of address (e.g., Billing, Shipping, etc.)

## Possible Optimization Opportunities
Currently, there are no evident optimization opportunities for the view without further understanding the use case and performance requirements.

## Possible Bugs
No potential bugs have been identified in the view definition.

## Risk
There are no risks associated with running this view without a WHERE clause, as it is a read-only operation. However, depending on the size of the underlying tables, retrieval of all records might put a strain on the system's resources. Make sure to use appropriate filtering when querying the view.

## Code Complexity
The code for this view is relatively simple, with a single SELECT statement joining multiple tables using INNER JOINS. The level of complexity should be manageable for most developers familiar with SQL.

## Refactoring Opportunities
Currently, no refactoring opportunities are apparent in the code. The code for the view is concise and straightforward.

## User Acceptance Criteria
```Gherkin
Feature: Store Address Information
  As a Data Analyst
  I want to retrieve comprehensive store address information
  So that I can analyze geographical data related to the stores

  Scenario: Retrieve Store and Address information
    Given the Sales.vStoreWithAddresses view is defined in the database
    When I run a SELECT query on the view
    Then I should be presented with a consolidated list of store and address information including:
      - Store Business Entity ID
      - Store Name
      - Address Type
      - Address Line 1
      - Address Line 2
      - City
      - State/Province Name
      - Postal Code
      - Country/Region Name

  Scenario: Filter results by specific conditions
    Given the Sales.vStoreWithAddresses view is defined in the database
    When I run a SELECT query on the view with specific filters (e.g., WHERE `StateProvinceName` = 'California')
    Then I should be presented with a list of store and address information matching the specified conditions
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstselect | [SALES].[STORE].[Name], [PERSON].[COUNTRYREGION].[Name], [PERSON].[ADDRESSTYPE].[Name], [PERSON].[ADDRESS].[PostalCode], [PERSON].[ADDRESS].[AddressLine1], [SALES].[STORE].[BusinessEntityID], [PERSON].[ADDRESS].[AddressLine2], [PERSON].[STATEPROVINCE].[Name], [PERSON].[ADDRESS].[City] | NA | NA | [PERSON].[ADDRESS].[StateProvinceID], [PERSON].[ADDRESSTYPE].[AddressTypeID], [PERSON].[ADDRESS].[AddressID], [PERSON].[STATEPROVINCE].[StateProvinceID], [PERSON].[COUNTRYREGION].[CountryRegionCode], [PERSON].[BUSINESSENTITYADDRESS].[BusinessEntityID], [PERSON].[STATEPROVINCE].[CountryRegionCode], [PERSON].[BUSINESSENTITYADDRESS].[AddressID], [SALES].[STORE].[BusinessEntityID], [PERSON].[BUSINESSENTITYADDRESS].[AddressTypeID] |  |  |  |  | [Person].[CountryRegion], [Person].[BusinessEntityAddress], [Person].[Address], [Person].[StateProvince], [Person].[AddressType], [Sales].[Store] |

