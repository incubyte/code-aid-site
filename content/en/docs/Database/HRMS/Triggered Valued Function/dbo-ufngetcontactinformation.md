---
title: "dbo.ufnGetContactInformation"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

## Overview

This documentation covers the `[dbo].[ufnGetContactInformation]` function which is designed to provide contact information for a specified contact person. This function returns multiple rows of contact information as a contact person may serve multiple roles.

## Details

The function takes the following parameter:

- `@PersonID int` - The ID of the person whose contact information is being fetched.

The returned table structure is as follows:

1. `[PersonID] int NOT NULL`
2. `[FirstName] [nvarchar](50) NULL`
3. `[LastName] [nvarchar](50) NULL`
4. `[JobTitle] [nvarchar](50) NULL`
5. `[BusinessEntityType] [nvarchar](50) NULL`

## Information on data

The function fetches data from various tables like `[HumanResources].[Employee]`, `[Purchasing].[Vendor]`, `[Sales].[Store]`, `[Person].[Person]`, `[Sales].[Customer]`, `[Person].[BusinessEntityContact]`, and `[Person].ContactType`. It checks if a person is associated with any role (Employee, Vendor Contact, Store Contact, Consumer) and then returns the relevant contact information.

## Information on the tables

The function uses the following tables to fetch contact information for various roles held by the person:

1. Employee information is fetched from the tables `[HumanResources].[Employee]` and `[Person].[Person]`.
2. Vendor contact information is fetched from the tables `[Purchasing].[Vendor]`, `[Person].[BusinessEntityContact]`, `[Person].ContactType`, and `[Person].[Person]`.
3. Store contact information is fetched from the tables `[Sales].[Store]`, `[Person].[BusinessEntityContact]`, `[Person].ContactType`, and `[Person].[Person]`.
4. Consumer information is fetched from the tables `[Person].[Person]` and `[Sales].[Customer]`.

## Possible optimization opportunities

The function can be optimized in the following ways:

1. Instead of checking for the existence of data in each table separately, a single query with multiple `LEFT JOINs` can be written to fetch the relevant data.

## Possible bugs

The function handles the NULL `@PersonID` input by not executing any query. However, no error message or response is provided to the user, which might not be ideal.

## Risk

1. Running queries without a `WHERE` clause - The function includes `WHERE` clauses for all the queries, so there are no risks in this regard.

## Code Complexity

The code is moderately complex, as it is retrieving data from several tables and using multiple `IF EXISTS` statements to identify the role(s) held by the person.

## Refactoring Opportunities

1. Combine multiple `IF EXISTS` statements into a single query.
2. Handle NULL `@PersonID` input more gracefully by providing an error message or response.

## User Acceptance Criteria

```gherkin
Feature: Fetch contact information of a person
  As a user
  I want to fetch contact information for a specified contact person
  So that I can manage communication effectively

  Scenario: Fetch multiple contact details for a person with multiple roles
    Given a person with ID "1" has multiple roles
    When I fetch contact information for person ID "1"
    Then I should get multiple rows with details of their different roles

  Scenario: Fetch contact information when no roles are associated with a person
    Given a person with ID "2" has no associated roles
    When I fetch contact information for person ID "2"
    Then I should get an empty result

  Scenario: Fetch contact information when provided with a NULL PersonID
    Given a NULL PersonID as input
    When I fetch contact information for the NULL PersonID
    Then I should get an error message or no result
```
