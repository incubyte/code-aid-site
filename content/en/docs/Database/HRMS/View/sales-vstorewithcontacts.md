---
title: "Sales.vStoreWithContacts"
linkTitle: "Sales.vStoreWithContacts"
description: "Sales.vStoreWithContacts"
---

# Views

## [Sales].[vStoreWithContacts]
### Summary


- **Number of Tables Accessed:** 7
- **Lines of Code:** 28
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|



{{< details "Sql Code" >}}
```sql

CREATE VIEW [Sales].[vStoreWithContacts] AS 
SELECT 
    s.[BusinessEntityID] 
    ,s.[Name] 
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
FROM [Sales].[Store] s
    INNER JOIN [Person].[BusinessEntityContact] bec 
    ON bec.[BusinessEntityID] = s.[BusinessEntityID]
	INNER JOIN [Person].[ContactType] ct
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
## 1. Overview
The given SQL code creates a view called `Sales.vStoreWithContacts` which provides information about stores along with their associated contact details such as contact type, name, phone number, and email address.

## 2. Details
To create the view, the code performs the following operations:

1. Select required columns from the `Sales.Store`, `Person.BusinessEntityContact`, `Person.ContactType`, `Person.Person`, `Person.EmailAddress`, `Person.PersonPhone`, and `Person.PhoneNumberType` tables.
2. Join these tables using inner and left outer joins based on the relationships between the tables' primary key and foreign key.

## 3. Information on Data
Here's a brief explanation of the tables used in creating the view:

1. Sales.Store: Holds information about the stores.
2. Person.BusinessEntityContact: Holds information about the business entity and contact type mapping.
3. Person.ContactType: Contains the types of business contacts.
4. Person.Person: Contains information about the people associated with the business entities.
5. Person.EmailAddress: Holds email addresses of people associated with business entities.
6. Person.PersonPhone: Contains phone numbers of people associated with business entities.
7. Person.PhoneNumberType: Specifies the type of phone number, such as work or home number.

## 4. Information on the Tables
Here are the relationships between the tables:

- Sales.Store is linked to Person.BusinessEntityContact using BusinessEntityID.
- Person.BusinessEntityContact is linked to Person.ContactType using ContactTypeID.
- Person.BusinessEntityContact is connected to Person.Person using PersonID.
- Person.Person is connected to Person.EmailAddress and Person.PersonPhone using BusinessEntityID.
- Person.PersonPhone is linked to Person.PhoneNumberType using PhoneNumberTypeID.

## 5. Possible Optimization Opportunities
No additional optimization opportunities are identified from the given code.

## 6. Possible Bugs
No bugs are detected in the given code.

## 7. Risk
As the query uses both INNER JOIN and LEFT OUTER JOIN operations, there's a possibility that partial data may be returned. The LEFT OUTER JOIN operations used in email and phone number retrieval ensure that a store's contact information is still returned even if email or phone numbers are not assigned.

No query runs without a WHERE clause, so there's no risk to be highlighted in this context.

## 8. Code Complexity
The given code is quite straightforward, utilizing simple join operations to retrieve store contact details. No additional complexity is present.

## 9. Refactoring Opportunities
No refactoring opportunities are identified from the given code.

## 10. User Acceptance Criteria
These are the gherkin scripts for each behavior of the code:

```
Feature: Sales.vStoreWithContacts View
    The view should provide a list of stores with their respective contact details

    Scenario: Retrieve store contacts
        Given Store information is available in the Sales.Store table
        And Contact types are available in the Person.ContactType table
        And Contact details are available in the Person.Person, Person.EmailAddress, Person.PersonPhone, and Person.PhoneNumberType tables
        When The view Sales.vStoreWithContacts is queried
        Then It should return store contact information including contact type, name, phone number, and email address
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| SELECT | [PERSON].[PERSON].[Suffix], [SALES].[STORE].[Name], [PERSON].[EMAILADDRESS].[EmailAddress], [PERSON].[PERSONPHONE].[PhoneNumber], [PERSON].[PERSON].[LastName], [PERSON].[PERSON].[MiddleName], [PERSON].[PERSON].[FirstName], [PERSON].[PERSON].[EmailPromotion], [PERSON].[PERSON].[Title], [PERSON].[CONTACTTYPE].[Name], [SALES].[STORE].[BusinessEntityID], [PERSON].[PHONENUMBERTYPE].[Name] | NA | NA | [PERSON].[EMAILADDRESS].[BusinessEntityID], [PERSON].[BUSINESSENTITYCONTACT].[BusinessEntityID], [PERSON].[CONTACTTYPE].[ContactTypeID], [PERSON].[BUSINESSENTITYCONTACT].[PersonID], [PERSON].[BUSINESSENTITYCONTACT].[ContactTypeID], [PERSON].[PERSONPHONE].[PhoneNumberTypeID], [SALES].[STORE].[BusinessEntityID], [PERSON].[PERSON].[BusinessEntityID], [PERSON].[PERSONPHONE].[BusinessEntityID], [PERSON].[PHONENUMBERTYPE].[PhoneNumberTypeID] |  |  |  |  | [Person].[ContactType], [Person].[EmailAddress], [Sales].[Store], [Person].[BusinessEntityContact], [Person].[PhoneNumberType], [Person].[Person], [Person].[PersonPhone] |

