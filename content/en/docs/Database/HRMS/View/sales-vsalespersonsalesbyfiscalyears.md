---
title: "Sales.vSalesPersonSalesByFiscalYears"
linkTitle: "Sales.vSalesPersonSalesByFiscalYears"
description: "Sales.vSalesPersonSalesByFiscalYears"
---

# Views

## [Sales].[vSalesPersonSalesByFiscalYears]
### Summary


- **Number of Tables Accessed:** 5
- **Lines of Code:** 34
- **Code Complexity:** 3
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| [SALES].[SALESPERSON]| [TerritoryID] | sstselect | JOIN |



{{< details "Sql Code" >}}
```sql

CREATE VIEW [Sales].[vSalesPersonSalesByFiscalYears] 
AS 
SELECT 
    pvt.[SalesPersonID]
    ,pvt.[FullName]
    ,pvt.[JobTitle]
    ,pvt.[SalesTerritory]
    ,pvt.[2002]
    ,pvt.[2003]
    ,pvt.[2004] 
FROM (SELECT 
        soh.[SalesPersonID]
        ,p.[FirstName] + ' ' + COALESCE(p.[MiddleName], '') + ' ' + p.[LastName] AS [FullName]
        ,e.[JobTitle]
        ,st.[Name] AS [SalesTerritory]
        ,soh.[SubTotal]
        ,YEAR(DATEADD(m, 6, soh.[OrderDate])) AS [FiscalYear] 
    FROM [Sales].[SalesPerson] sp 
        INNER JOIN [Sales].[SalesOrderHeader] soh 
        ON sp.[BusinessEntityID] = soh.[SalesPersonID]
        INNER JOIN [Sales].[SalesTerritory] st 
        ON sp.[TerritoryID] = st.[TerritoryID] 
        INNER JOIN [HumanResources].[Employee] e 
        ON soh.[SalesPersonID] = e.[BusinessEntityID] 
		INNER JOIN [Person].[Person] p
		ON p.[BusinessEntityID] = sp.[BusinessEntityID]
	 ) AS soh 
PIVOT 
(
    SUM([SubTotal]) 
    FOR [FiscalYear] 
    IN ([2002], [2003], [2004])
) AS pvt;

```
{{< /details >}}
## Overview

This is the documentation for the database view `Sales.vSalesPersonSalesByFiscalYears`. This view displays the sales by each salesperson for the fiscal years 2002, 2003, and 2004.

## Details

### Information on Data

The data for this view is extracted from the following tables:
1. Sales.SalesPerson
2. Sales.SalesOrderHeader
3. Sales.SalesTerritory
4. HumanResources.Employee
5. Person.Person

### Information on the Tables

#### 1. Sales.SalesPerson

This table contains details of the salesperson, such as their BusinessEntityID and TerritoryID.

#### 2. Sales.SalesOrderHeader

This table holds the sales order information, such as SalesPersonID, OrderDate, and SubTotal.

#### 3. Sales.SalesTerritory

Contains information about the sales territories.

#### 4. HumanResources.Employee

Contains employee details, including JobTitle and BusinessEntityID.

#### 5. Person.Person

This table stores information on persons, such as FirstName, MiddleName, and LastName.

### Code snippet

The following is the SQL code for this view.

```sql
CREATE VIEW [Sales].[vSalesPersonSalesByFiscalYears] 
AS 
SELECT 
    pvt.[SalesPersonID]
    ,pvt.[FullName]
    ,pvt.[JobTitle]
    ,pvt.[SalesTerritory]
    ,pvt.[2002]
    ,pvt.[2003]
    ,pvt.[2004] 
FROM (SELECT 
        soh.[SalesPersonID]
        ,p.[FirstName] + ' ' + COALESCE(p.[MiddleName], '') + ' ' + p.[LastName] AS [FullName]
        ,e.[JobTitle]
        ,st.[Name] AS [SalesTerritory]
        ,soh.[SubTotal]
        ,YEAR(DATEADD(m, 6, soh.[OrderDate])) AS [FiscalYear] 
    FROM [Sales].[SalesPerson] sp 
        INNER JOIN [Sales].[SalesOrderHeader] soh 
        ON sp.[BusinessEntityID] = soh.[SalesPersonID]
        INNER JOIN [Sales].[SalesTerritory] st 
        ON sp.[TerritoryID] = st.[TerritoryID] 
        INNER JOIN [HumanResources].[Employee] e 
        ON soh.[SalesPersonID] = e.[BusinessEntityID] 
        INNER JOIN [Person].[Person] p
        ON p.[BusinessEntityID] = sp.[BusinessEntityID]
     ) AS soh 
PIVOT 
(
    SUM([SubTotal]) 
    FOR [FiscalYear] 
    IN ([2002], [2003], [2004])
) AS pvt;
```

### Possible Optimization Opportunities

1. _N/A_

### Possible Bugs

1. _N/A_

### Risk

1. The view only supports fiscal years 2002, 2003, and 2004. Any data outside of these years will not be included.

### Code Complexity

- The code includes PIVOT functionality, which may be complex for new SQL users.

### Refactoring Opportunities

1. Making fiscal years dynamic in the view such that it doesn't require hardcoding. 

## User Acceptance Criteria

1. **Scenario:** Verify sales data for the given fiscal years

   - Given the view `Sales.vSalesPersonSalesByFiscalYears`
   - When I execute a query for sales data in the fiscal years 2002, 2003, and 2004
   - Then I should get the correct sales total for each salesperson for the respective years

2. **Scenario:** Verify all details of salespeople are included in view 

   - Given the view `Sales.vSalesPersonSalesByFiscalYears`
   - When I execute a query to fetch salespeople information
   - Then I should get the correct SalesPersonID, FullName, JobTitle, and SalesTerritory for each salesperson in the view

### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| SELECT |  | NA | NA |  |  |  |  |  |  |
| SELECT | [SALES].[SALESORDERHEADER].[SubTotal], [PERSON].[PERSON].[LastName], [HUMANRESOURCES].[EMPLOYEE].[JobTitle], [SALES].[SALESORDERHEADER].[OrderDate], [PERSON].[PERSON].[MiddleName], [PERSON].[PERSON].[FirstName], [SALES].[SALESORDERHEADER].[SalesPersonID], [SALES].[SALESTERRITORY].[Name], m | NA | NA | [SALES].[SALESPERSON].[BusinessEntityID], [HUMANRESOURCES].[EMPLOYEE].[BusinessEntityID], [SALES].[SALESORDERHEADER].[SalesPersonID], [SALES].[SALESPERSON].[TerritoryID], [SALES].[SALESTERRITORY].[TerritoryID], [PERSON].[PERSON].[BusinessEntityID] |  |  |  |  | [HumanResources].[Employee], [Sales].[SalesTerritory], [Sales].[SalesPerson], [Sales].[SalesOrderHeader], [Person].[Person] |

