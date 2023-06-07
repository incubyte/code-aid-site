---
title: "Sales.vSalesPerson"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---


| Object Type   |       No of Lines      |  Tables Involved |
|----------|:-------------:|------:|
| View |  39 | SalesPerson, Employee, Person, BusinessEntityAddress, Address, StateProvince, CountryRegion, SalesTerritory, EmailAddress, PersonPhone, PhoneNumberType |


## 1. Overview
The `Sales.vSalesPerson` view provides a detailed view of the SalesPerson's personal and sales information by joining various tables.


## 2. Details
The view combines data from the following tables:

- Sales.SalesPerson
- HumanResources.Employee
- Person.Person
- Person.BusinessEntityAddress
- Person.Address
- Person.StateProvince
- Person.CountryRegion
- Sales.SalesTerritory
- Person.EmailAddress
- Person.PersonPhone
- Person.PhoneNumberType


## 3. Information on data
The view retrieves the following columns:

- BusinessEntityID
- Title
- FirstName
- MiddleName
- LastName
- Suffix
- JobTitle
- PhoneNumber
- PhoneNumberType
- EmailAddress
- EmailPromotion
- AddressLine1
- AddressLine2
- City
- StateProvinceName
- PostalCode
- CountryRegionName
- TerritoryName
- TerritoryGroup
- SalesQuota
- SalesYTD
- SalesLastYear

## 4. Information on the tables
The view involves 11 tables, which are joined using INNER JOIN, LEFT OUTER JOIN, and OUTER APPLY operators.

## 5. Possible optimization opportunities
There are no optimization opportunities detected, as it's a clean and efficient view.

## 6. Possible bugs
No bugs detected in the view, since all JOINs are performed correctly.

## 7. Risks
There are no risks detected in the view, as no WHERE clause is omitted nor other problems found.

## 8. Code Complexity
The code complexity is moderate due to the number of tables and columns involved.

## 9. Refactoring Opportunities
There are no refactoring opportunities detected, as the view is already clean and efficient.
