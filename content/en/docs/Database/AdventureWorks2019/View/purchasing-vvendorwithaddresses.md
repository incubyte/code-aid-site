---
title: "Purchasing.vVendorWithAddresses"
linkTitle: "Purchasing.vVendorWithAddresses"
description: "Purchasing.vVendorWithAddresses"
---

# Views

## [Purchasing].[vVendorWithAddresses]
### Summary


- **Number of Tables Accessed:** 6
- **Lines of Code:** 23
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|



{{< details "Sql Code" >}}
```sql

CREATE VIEW [Purchasing].[vVendorWithAddresses] AS 
SELECT 
    v.[BusinessEntityID]
    ,v.[Name]
    ,at.[Name] AS [AddressType]
    ,a.[AddressLine1] 
    ,a.[AddressLine2] 
    ,a.[City] 
    ,sp.[Name] AS [StateProvinceName] 
    ,a.[PostalCode] 
    ,cr.[Name] AS [CountryRegionName] 
FROM [Purchasing].[Vendor] v
    INNER JOIN [Person].[BusinessEntityAddress] bea 
    ON bea.[BusinessEntityID] = v.[BusinessEntityID] 
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

This view, `Purchasing.vVendorWithAddresses`, provides information about vendors, their addresses, and other related information like address type, state, and country. This information is retrieved from the tables connected through JOIN operations.

## Details

1. The view is created in the `Purchasing` schema.
2. The main table used is `[Purchasing].[Vendor]`.
3. The related tables used for retrieving information are `[Person].[BusinessEntityAddress]`, `[Person].[Address]`, `[Person].[StateProvince]`, `[Person].[CountryRegion]`, and `[Person].[AddressType]`.

## Information on data

The following columns are included in this view:

1. `BusinessEntityID`: The unique identifier for the vendor.
2. `Name`: The name of the vendor.
3. `AddressType`: The type of the address (e.g., billing, shipping, storage, etc.).
4. `AddressLine1`: The first line of the address.
5. `AddressLine2`: The second line of the address.
6. `City`: The city where the address is located.
7. `StateProvinceName`: The name of the state or province.
8. `PostalCode`: The postal code of the address.
9. `CountryRegionName`: The name of the country or region.

## Information on the tables

The following tables are used in this view:

1. `[Purchasing].[Vendor]`: Contains vendor information.
2. `[Person].[BusinessEntityAddress]`: Maps vendors to their business entity addresses.
3. `[Person].[Address]`: Contains addresses information.
4. `[Person].[StateProvince]`: Contains states and provinces information.
5. `[Person].[CountryRegion]`: Contains countries and regions information.
6. `[Person].[AddressType]`: Contains different address types.

## Possible optimization opportunities

There are no obvious optimization opportunities in this view.

## Possible bugs

There are no obvious bugs in this view.

## Risk

There are no risks in this view as all the tables are connected through inner joins and there are no WHERE clauses involved.

## Code Complexity

The code complexity of this view is low, as it contains straightforward inner joins to retrieve the data.

## Refactoring Opportunities

There are no obvious refactoring opportunities, as the code appears well-structured and efficient.

## User Acceptance Criteria

The following Gherkin scripts represent the expected behavior of the view:

```gherkin
Feature: Retrieve vendor information with addresses
  Scenario: User retrieves vendor information with their respective address details
    Given the view "Purchasing.vVendorWithAddresses" exists
    When the user selects all columns from the view
    Then the user should get vendors information with their correct address details
```

### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstselect | [PURCHASING].[VENDOR].[Name], [PURCHASING].[VENDOR].[BusinessEntityID], [PERSON].[COUNTRYREGION].[Name], [PERSON].[ADDRESSTYPE].[Name], [PERSON].[ADDRESS].[PostalCode], [PERSON].[ADDRESS].[AddressLine1], [PERSON].[ADDRESS].[AddressLine2], [PERSON].[STATEPROVINCE].[Name], [PERSON].[ADDRESS].[City] | NA | NA | [PURCHASING].[VENDOR].[BusinessEntityID], [PERSON].[ADDRESS].[StateProvinceID], [PERSON].[ADDRESSTYPE].[AddressTypeID], [PERSON].[ADDRESS].[AddressID], [PERSON].[STATEPROVINCE].[StateProvinceID], [PERSON].[COUNTRYREGION].[CountryRegionCode], [PERSON].[BUSINESSENTITYADDRESS].[BusinessEntityID], [PERSON].[STATEPROVINCE].[CountryRegionCode], [PERSON].[BUSINESSENTITYADDRESS].[AddressID], [PERSON].[BUSINESSENTITYADDRESS].[AddressTypeID] |  |  |  |  | [Person].[CountryRegion], [Person].[BusinessEntityAddress], [Person].[Address], [Person].[StateProvince], [Person].[AddressType], [Purchasing].[Vendor] |

