---
title: "Person.iuPerson"
linkTitle: "Person.iuPerson"
description: "Person.iuPerson"
---

# Triggers

## [Person].[iuPerson]
### Summary


- **Number of Tables Accessed:** 2
- **Lines of Code:** 35
- **Code Complexity:** 3
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|


### Trigger Details

- **Trigger Type**: AFTER
- **Trigger Table**: [Person].[Person]
- **Trigger Events**: [INSERT, UPDATE]

{{< details "Sql Code" >}}
```sql

CREATE TRIGGER [Person].[iuPerson] ON [Person].[Person] 
AFTER INSERT, UPDATE NOT FOR REPLICATION AS 
BEGIN
    DECLARE @Count int;

    SET @Count = @@ROWCOUNT;
    IF @Count = 0 
        RETURN;

    SET NOCOUNT ON;

    IF UPDATE([BusinessEntityID]) OR UPDATE([Demographics]) 
    BEGIN
        UPDATE [Person].[Person] 
        SET [Person].[Person].[Demographics] = N'<IndividualSurvey xmlns="http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"> 
            <TotalPurchaseYTD>0.00</TotalPurchaseYTD> 
            </IndividualSurvey>' 
        FROM inserted 
        WHERE [Person].[Person].[BusinessEntityID] = inserted.[BusinessEntityID] 
            AND inserted.[Demographics] IS NULL;
        
        UPDATE [Person].[Person] 
        SET [Demographics].modify(N'declare default element namespace "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
            insert <TotalPurchaseYTD>0.00</TotalPurchaseYTD> 
            as first 
            into (/IndividualSurvey)[1]') 
        FROM inserted 
        WHERE [Person].[Person].[BusinessEntityID] = inserted.[BusinessEntityID] 
            AND inserted.[Demographics] IS NOT NULL 
            AND inserted.[Demographics].exist(N'declare default element namespace 
                "http://schemas.microsoft.com/sqlserver/2004/07/adventure-works/IndividualSurvey"; 
                /IndividualSurvey/TotalPurchaseYTD') <> 1;
    END;
END;

```
{{< /details >}}
## Overview
This documentation provides information about the `iuPerson` trigger in the `Person` schema, which is created on the `Person.Person` table. The trigger is designed to update the `Demographics` column in the `Person.Person` table after INSERT and UPDATE statements. The trigger inserts a default record of TotalPurchaseYTD of 0.00 if the `Demographics` column is updated with a NULL value or if it doesn't have a field for TotalPurchaseYTD.

## Details

1. Trigger Name: `Person.iuPerson`
2. Schema: `Person`
3. Table: `Person.Person`
4. Event: AFTER INSERT, UPDATE
5. Action: NOT FOR REPLICATION

## Information on data

1. Columns affected:
   - BusinessEntityID
   - Demographics

## Information on the tables

1. Person.Person
   - Column BusinessEntityID (int, PK)
   - Column Demographics (nvarchar(max), nullable)

## Possible optimization opportunities

1. Using an INSTEAD OF trigger to avoid the double operation of first the INSERT or UPDATE and then having the AFTER trigger make another update.

## Possible bugs

There are no apparent bugs in this trigger.

## Risk

1. No WHERE clause: The trigger may perform unnecessary Updates for Demographics when there is no change in the column value for some affected rows.

## Code Complexity

The trigger code is readable and straightforward.

## Refactoring Opportunities

1. Improve trigger performance by using INSTEAD OF trigger instead of AFTER trigger.

## User Acceptance Criteria

```gherkin
Feature: Maintain Person Demographics data
  As a database user
  I want to update the Person table with correct Demographics data
  So that I can track individual purchases accurately

  Scenario: Insert new Person record with NULL Demographics
    Given I insert a new person record in the Person table with NULL Demographics
    When the trigger iuPerson is executed
    Then the inserted record should have a default TotalPurchaseYTD value of 0.00

  Scenario: Update a Person record with NULL Demographics
    Given I update an existing person record in the Person table setting Demographics to NULL
    When the trigger iuPerson is executed
    Then the updated record should have a default TotalPurchaseYTD value of 0.00

  Scenario: Insert a new Person record with existing Demographics without TotalPurchaseYTD
    Given I insert a new person record with existing Demographics missing TotalPurchaseYTD in the Person table
    When the trigger iuPerson is executed
    Then the inserted record should have a TotalPurchaseYTD value of 0.00 added to the Demographics

  Scenario: Update a Person record with existing Demographics without TotalPurchaseYTD
    Given I update an existing person record with Demographics missing TotalPurchaseYTD in the Person table
    When the trigger iuPerson is executed
    Then the updated record should have a TotalPurchaseYTD value of 0.00 added to the Demographics
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| sstmssqldeclare |  |  |  |  |  |  |  |  |  |
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstmssqlreturn |  |  |  |  |  |  |  |  |  |
| sstmssqlset |  |  |  |  |  |  |  |  |  |
| sstmssqlif |  |  |  |  |  |  |  |  |  |
| sstupdate | NA | [Person].[Person].[Demographics] | NA |  | [PERSON].[PERSON].[Demographics], [PERSON].[PERSON].[BusinessEntityID] |  |  |  | inserted, [Person].[Person] |
| sstupdate | NA |  | NA |  | [PERSON].[PERSON].[Demographics], [PERSON].[PERSON].[BusinessEntityID] |  |  |  | inserted, [Person].[Person] |

