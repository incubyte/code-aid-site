---
title: "Purchasing.vVendorWithAddresses"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---


| Object Type   |       No of Lines      |  Tables Involed |
|----------|:-------------:|------:|
| View |  9 | Purchasing.Vendor, Person.BusinessEntityAddress, Person.Address, Person.StateProvince, Person.CountryRegion, Person.AddressType |


## Overview
The `Purchasing.vVendorWithAddresses` view is used to show vendor information along with their associated addresses, state, and country details. It's combining data from 6 different tables to present a complete picture of vendor addresses.

## Details
This view is created using the `SELECT` statement with multiple `INNER JOIN` clauses. Data is being fetched from these tables:

1. Purchasing.Vendor
2. Person.BusinessEntityAddress
3. Person.Address
4. Person.StateProvince
5. Person.CountryRegion
6. Person.AddressType

## Information on Data
The data displayed by this view includes the following columns:

1. BusinessEntityID
2. Name (Vendor Name)
3. AddressType
4. AddressLine1
5. AddressLine2
6. City
7. StateProvinceName
8. PostalCode
9. CountryRegionName

## Information on Tables
Here is some information on each table used in the view:

1. **Purchasing.Vendor**: Stores vendor information.
2. **Person.BusinessEntityAddress**: Bridge table handling many-to-many relationships between business entities and addresses.
3. **Person.Address**: Stores address information.
4. **Person.StateProvince**: Stores state/province information.
5. **Person.CountryRegion**: Stores country/region information.
6. **Person.AddressType**: Stores information on different types of addresses.

## Possible Optimization Opportunities
There are no observable issues for optimization opportunities in this view due to its simple and straightforward design.

## Possible Bugs
There are no apparent issues or bugs with this view as it serves its purpose efficiently without including unnecessary columns or improper joins.

## Risk
This view does not contain any query running without a `where` clause, so there are no risks associated with it.

## Code Complexity
The code complexity of this view is low. It is designed with simplicity and can be easily understood and maintained.

## Refactoring Opportunities
As the view is straightforward and not complex, there isn't any immediate need for refactoring. The view serves its purpose effectively by providing complete address information for vendors.
