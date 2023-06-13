---
title: "Person.vAdditionalContactInfo"
linkTitle: "Person.vAdditionalContactInfo"
description: "Person.vAdditionalContactInfo"
---

# Views

## [Person].[vAdditionalContactInfo]
### Summary


- **Number of Tables Accessed:** 1
- **Lines of Code:** 48
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|



{{< details "Sql Code" >}}
```sql

CREATE VIEW [Person].[vAdditionalContactInfo] 
AS 
SELECT 
    [BusinessEntityID] 
    ,[FirstName]
    ,[MiddleName]
    ,[LastName]
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:telephoneNumber)[1]/act:number', 'nvarchar(50)') AS [TelephoneNumber] 
    ,LTRIM(RTRIM([ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:telephoneNumber/act:SpecialInstructions/text())[1]', 'nvarchar(max)'))) AS [TelephoneSpecialInstructions] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes";
        (act:homePostalAddress/act:Street)[1]', 'nvarchar(50)') AS [Street] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:homePostalAddress/act:City)[1]', 'nvarchar(50)') AS [City] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:homePostalAddress/act:StateProvince)[1]', 'nvarchar(50)') AS [StateProvince] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:homePostalAddress/act:PostalCode)[1]', 'nvarchar(50)') AS [PostalCode] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:homePostalAddress/act:CountryRegion)[1]', 'nvarchar(50)') AS [CountryRegion] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:homePostalAddress/act:SpecialInstructions/text())[1]', 'nvarchar(max)') AS [HomeAddressSpecialInstructions] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:eMail/act:eMailAddress)[1]', 'nvarchar(128)') AS [EMailAddress] 
    ,LTRIM(RTRIM([ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:eMail/act:SpecialInstructions/text())[1]', 'nvarchar(max)'))) AS [EMailSpecialInstructions] 
    ,[ContactInfo].ref.value(N'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
        declare namespace act="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactTypes"; 
        (act:eMail/act:SpecialInstructions/act:telephoneNumber/act:number)[1]', 'nvarchar(50)') AS [EMailTelephoneNumber] 
    ,[rowguid] 
    ,[ModifiedDate]
FROM [Person].[Person]
OUTER APPLY [AdditionalContactInfo].nodes(
    'declare namespace ci="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/ContactInfo"; 
    /ci:AdditionalContactInfo') AS ContactInfo(ref) 
WHERE [AdditionalContactInfo] IS NOT NULL;

```
{{< /details >}}
## Overview
This view, `Person.vAdditionalContactInfo`, provides an additional contact information of persons along with their basic information, such as first name, middle name, and last name.

## Details

### Information on Data
The primary source of data for this view is the `Person.Person` table which contains the general information of persons. This includes names, additional contact information in XML format, and other metadata.

### Information on the Tables
* `Person.Person`
  * `BusinessEntityID`: Business entity ID.
  * `FirstName`: First name of the person.
  * `MiddleName`: Middle name of the person.
  * `LastName`: Last name of the person.
  * `AdditionalContactInfo`: XML type column containing additional contact information.
  * `rowguid`: Row global unique identifier.
  * `ModifiedDate`: Date and time when the record was last modified.

### Possible Optimization Opportunities
Currently, there are no significant optimization opportunities.

### Possible Bugs
Currently, there are no known bugs.

### Risks
There are no specific risks associated with this view.

### Code Complexity
The code has medium complexity with the use of XML namespaces, and multiple XPath expressions to extract data from the `AdditionalContactInfo` XML column.

### Refactoring Opportunities
There are no significant refactoring opportunities.

## User Acceptance Criteria

### Gherkin Scripts
```gherkin
Feature: Retrieve additional contact information of persons
  The user should be able to retrieve the additional contact information of persons along with their basic information.

  Scenario: Get additional contact information of a person
    Given the Person.vAdditionalContactInfo view exists
    When I retrieve the additional contact information for a specific person with their BusinessEntityID
    Then I should get the additional contact information corresponding to that person

  Scenario: Get additional contact information of all persons
    Given the Person.vAdditionalContactInfo view exists
    When I retrieve the additional contact information for all persons
    Then I should get the additional contact information for all persons with non-null AdditionalContactInfo
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| SELECT | [PERSON].[PERSON].[rowguid], [PERSON].[PERSON].[LastName], [PERSON].[PERSON].[MiddleName], [PERSON].[PERSON].[FirstName], [PERSON].[PERSON].[ModifiedDate], [PERSON].[PERSON].[BusinessEntityID] | NA | NA |  | [PERSON].[PERSON].[AdditionalContactInfo] |  |  |  | [Person].[Person] |

