---
title: "Purchasing.vVendorWithContacts"
linkTitle: "Purchasing.vVendorWithContacts"
description: "Purchasing.vVendorWithContacts"
---

# Views

## [Purchasing].[vVendorWithContacts]
### Summary


- **Number of Tables Accessed:** 7
- **Lines of Code:** 28
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| [PERSON].CONTACTTYPE| [ContactTypeID] | sstselect | JOIN |



{{< details "Sql Code" >}}
```sql

CREATE VIEW [Purchasing].[vVendorWithContacts] AS 
SELECT 
    v.[BusinessEntityID]
    ,v.[Name]
    ,ct.[Name] AS [ContactType] 
    ,p.[Title] 
    ,p.[FirstName] 
    ,p.[MiddleName] 
    ,p.[LastName] 
    ,p.[Suffix] 
    ,pp.[PhoneNumber] 
	,pnt.[Name] AS [PhoneNumberType]
    ,ea.[EmailAddress] 
    ,p.[EmailPromotion] 
FROM [Purchasing].[Vendor] v
    INNER JOIN [Person].[BusinessEntityContact] bec 
    ON bec.[BusinessEntityID] = v.[BusinessEntityID]
	INNER JOIN [Person].ContactType ct
	ON ct.[ContactTypeID] = bec.[ContactTypeID]
	INNER JOIN [Person].[Person] p
	ON p.[BusinessEntityID] = bec.[PersonID]
	LEFT OUTER JOIN [Person].[EmailAddress] ea
	ON ea.[BusinessEntityID] = p.[BusinessEntityID]
	LEFT OUTER JOIN [Person].[PersonPhone] pp
	ON pp.[BusinessEntityID] = p.[BusinessEntityID]
	LEFT OUTER JOIN [Person].[PhoneNumberType] pnt
	ON pnt.[PhoneNumberTypeID] = pp.[PhoneNumberTypeID];

```
{{< /details >}}
## Overview
This markdown documentation provides information about the `Purchasing.vVendorWithContacts` view from a database.

## Details
The view `Purchasing.vVendorWithContacts` is created with a SELECT statement that retrieves information about vendors and their contact details. It combines data from multiple tables: `Purchasing.Vendor`, `Person.BusinessEntityContact`, `Person.ContactType`, `Person.Person`, `Person.EmailAddress`, `Person.PersonPhone`, and `Person.PhoneNumberType`.

```sql
CREATE VIEW [Purchasing].[vVendorWithContacts] AS 
...
```

## Information on data

### Key columns:

1. BusinessEntityID: A unique identifier for the vendor and person relations.
2. Name: Name of the vendor or contact type.
3. ContactType: Type of contact.
4. PhoneNumberType: Type of phone number (Home, Work, etc.)

### Other columns:

- Title, FirstName, MiddleName, LastName, Suffix: Contact person name attributes.
- PhoneNumber: Contact phone number.
- EmailAddress: Contact email address.
- EmailPromotion: Promotional flag for sending emails.

## Information on the tables

- [Purchasing].[Vendor]: Stores vendor information.
- [Person].[BusinessEntityContact]: Stores contact information for business entities.
- [Person].ContactType: Stores types of contact.
- [Person].[Person]: Stores personal information.
- [Person].[EmailAddress]: Stores email addresses for contacts.
- [Person].[PersonPhone]: Stores phone numbers for contacts.
- [Person].[PhoneNumberType]: Stores types of phone numbers.

## Possible optimization opportunities
- Indexing: Consider adding indexes on columns used for joining tables to improve query performance.
- Partitioning: Consider partitioning large tables to improve query performance.

## Possible bugs

No possible bugs found in the code.

## Risk

- The view does not have a WHERE clause, which might result in the retrieval of a large volume of data when querying the view.

## Code Complexity

The code complexity is moderate due to the use of multiple JOINs and columns from different tables. Nevertheless, the code is well-structured and readable.

## Refactoring Opportunities

There are no significant refactoring opportunities in the current code.

## User Acceptance Criteria

```gherkin
Feature: vVendorWithContacts
  Scenario: Retrieve a list of vendors with their contact information
    Given a view vVendorWithContacts in the Purchasing schema
    When I query the view
    Then I should get the vendor information and their contacts with relevant details
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstselect | [PURCHASING].[VENDOR].[Name], [PERSON].[PERSON].[Suffix], [PURCHASING].[VENDOR].[BusinessEntityID], [PERSON].[EMAILADDRESS].[EmailAddress], [PERSON].[PERSONPHONE].[PhoneNumber], [PERSON].[PERSON].[LastName], [PERSON].[PERSON].[MiddleName], [PERSON].[PERSON].[FirstName], [PERSON].[PERSON].[EmailPromotion], [PERSON].[PERSON].[Title], [PERSON].CONTACTTYPE.[Name], [PERSON].[PHONENUMBERTYPE].[Name] | NA | NA | [PERSON].[EMAILADDRESS].[BusinessEntityID], [PERSON].[BUSINESSENTITYCONTACT].[BusinessEntityID], [PURCHASING].[VENDOR].[BusinessEntityID], [PERSON].[BUSINESSENTITYCONTACT].[PersonID], [PERSON].[BUSINESSENTITYCONTACT].[ContactTypeID], [PERSON].CONTACTTYPE.[ContactTypeID], [PERSON].[PERSONPHONE].[PhoneNumberTypeID], [PERSON].[PERSON].[BusinessEntityID], [PERSON].[PERSONPHONE].[BusinessEntityID], [PERSON].[PHONENUMBERTYPE].[PhoneNumberTypeID] |  |  |  |  | [Person].ContactType, [Person].[EmailAddress], [Person].[BusinessEntityContact], [Purchasing].[Vendor], [Person].[PhoneNumberType], [Person].[Person], [Person].[PersonPhone] |

