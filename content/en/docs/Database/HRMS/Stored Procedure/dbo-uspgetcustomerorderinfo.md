---
title: "dbo.uspGetCustomerOrderInfo"
linkTitle: "dbo.uspGetCustomerOrderInfo"
description: "dbo.uspGetCustomerOrderInfo"
---

# Stored Procedures

## dbo.uspGetCustomerOrderInfo
### Summary


- **Number of Tables Accessed:** 9
- **Lines of Code:** 106
- **Code Complexity:** 4
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| HUMANRESOURCES.EMPLOYEE| BusinessEntityID | sstselect | JOIN |
| SALES.SALESPERSON| BusinessEntityID | sstselect | JOIN |
| SALES.SALESORDERHEADER| SalesPersonID | sstselect | JOIN |
| PRODUCTION.PRODUCT| ProductID | sstselect | JOIN |
| PERSON.PERSON| BusinessEntityID | sstselect | JOIN |
| HUMANRESOURCES.EMPLOYEE| BusinessEntityID | sstselect | WHERE |
| SALES.SALESORDERHEADER| SalesOrderID | sstselect | JOIN |
| #CUSTOMERORDERINFO| SalesOrderId | sstdelete | WHERE |
| SALES.SALESORDERDETAIL| SalesOrderID | sstselect | JOIN |
| SALES.SALESORDERDETAIL| ProductID | sstselect | JOIN |
| SALES.SALESORDERHEADER| OrderDate | sstselect | WHERE |
| SALES.CUSTOMER| CustomerID | sstselect | JOIN |
| SALES.CUSTOMER| CustomerID | sstselect | WHERE |
| SALES.SALESORDERHEADER| CustomerID | sstselect | JOIN |
| #ORDERDETAILS| SalesOrderId | sstselect | JOIN |
| SALES.CUSTOMER| PersonID | sstselect | JOIN |


### Parameters

| Parameter Name | Data Type | Direction |
|---|---|---|
| @CustomerId | INT | IN |
| @SalesPersonId | INT | IN |
| @StartDate | DATETIME | IN |
| @EndDate | DATETIME | IN |
| @MinimumOrderAmount | MONEY | IN |

{{< details "Sql Code" >}}
```sql

CREATE PROCEDURE dbo.uspGetCustomerOrderInfo
    @CustomerId INT = NULL,
    @SalesPersonId INT = NULL,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @MinimumOrderAmount MONEY = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Temporary table for accumulating the results
    CREATE TABLE #CustomerOrderInfo
    (
        CustomerId INT,
        CustomerName NVARCHAR(100),
        SalesOrderId INT,
        OrderDate DATETIME,
        SalesPersonId INT,
        SalesPersonName NVARCHAR(100),
        ProductId INT,
        ProductName NVARCHAR(100),
        OrderQty INT,
        UnitPrice MONEY,
        LineTotal MONEY
    );

    -- Temporary table for storing SalesOrderDetail information
    CREATE TABLE #OrderDetails
    (
        SalesOrderId INT,
        ProductId INT,
        OrderQty INT,
        UnitPrice MONEY,
        LineTotal MONEY
    );

    -- Insert into #OrderDetails
    INSERT INTO #OrderDetails (SalesOrderId, ProductId, OrderQty, UnitPrice, LineTotal)
    SELECT SalesOrderId,
           ProductID,
           OrderQty,
           UnitPrice,
           LineTotal
    FROM Sales.SalesOrderDetail;

    -- Insert data into the #CustomerOrderInfo table
    INSERT INTO #CustomerOrderInfo (
        CustomerId,
        CustomerName,
        SalesOrderId,
        OrderDate,
        SalesPersonId,
        SalesPersonName,
        ProductId,
        ProductName,
        OrderQty,
        UnitPrice,
        LineTotal
    )
    SELECT c.CustomerID AS CustomerId,
           CONCAT(p.FirstName, ' ', p.LastName) AS CustomerName,
           soh.SalesOrderID AS SalesOrderId,
           soh.OrderDate AS OrderDate,
           e.BusinessEntityID AS SalesPersonId,
           CONCAT(e.FirstName, ' ', e.LastName) AS SalesPersonName,
           od.ProductId AS ProductId,
           pr.Name AS ProductName,
           od.OrderQty AS OrderQty,
           od.UnitPrice AS UnitPrice,
           od.LineTotal AS LineTotal
    FROM Sales.Customer AS c
    JOIN Person.Person AS p ON c.PersonID = p.BusinessEntityID
    JOIN Sales.SalesOrderHeader AS soh ON c.CustomerID = soh.CustomerID
    JOIN #OrderDetails AS od ON soh.SalesOrderID = od.SalesOrderId
    JOIN Sales.SalesPerson AS sp ON soh.SalesPersonID = sp.BusinessEntityID
    JOIN HumanResources.Employee AS e ON sp.BusinessEntityID = e.BusinessEntityID
    JOIN Person.Person AS pe ON e.BusinessEntityID = pe.BusinessEntityID
    JOIN Sales.SalesOrderDetail AS sod ON soh.SalesOrderID = sod.SalesOrderID
    JOIN Production.Product AS pr ON sod.ProductID = pr.ProductID
    WHERE (@CustomerId IS NULL OR c.CustomerID = @CustomerId)
          AND (@SalesPersonId IS NULL OR e.BusinessEntityID = @SalesPersonId)
          AND (@StartDate IS NULL OR soh.OrderDate >= @StartDate)
          AND (@EndDate IS NULL OR soh.OrderDate <= @EndDate);

    -- Filter by MinimumOrderAmount if provided
    IF @MinimumOrderAmount IS NOT NULL
    BEGIN
        DELETE FROM #CustomerOrderInfo
        WHERE SalesOrderId IN (
            SELECT SalesOrderId
            FROM #CustomerOrderInfo
            GROUP BY SalesOrderId
            HAVING SUM(LineTotal) < @MinimumOrderAmount
        );
    END;

    -- Return the result
    SELECT *
    FROM #CustomerOrderInfo
    ORDER BY CustomerId, SalesOrderId, ProductId;

    -- Drop temporary tables
    DROP TABLE #CustomerOrderInfo;
    DROP TABLE #OrderDetails;
END;

```
{{< /details >}}
## 1. Overview
The above stored procedure (`dbo.uspGetCustomerOrderInfo`) is designed to retrieve customers' order information based on specific input parameters such as Customer ID, Salesperson ID, Start and End dates of orders, and minimum order amount. 

## 2. Details
The stored procedure relies on the use of temporary tables (`#CustomerOrderInfo` and `#OrderDetails`) to accumulate and process the results. Data is inserted into these temporary tables from various tables such as Sales.SalesOrderDetail, Sales.Customer, Person.Person, Sales.SalesOrderHeader, Sales.SalesPerson, HumanResources.Employee, and Production.Product.

## 3. Information on data
The stored procedure handles a variety of data types, from integers and datetime to nvarchars and money. It uses these to store IDs, names, dates, and order information.

```sql
    ...
    CustomerId INT,
    CustomerName NVARCHAR(100),
    SalesOrderId INT,
    OrderDate DATETIME,
    SalesPersonId INT,
    SalesPersonName NVARCHAR(100),
    ProductId INT,
    ProductName NVARCHAR(100),
    OrderQty INT,
    UnitPrice MONEY,
    LineTotal MONEY
    ...
```

## 4. Information on the tables

The tables used in the stored procedure are:

1. `#CustomerOrderInfo`- a temporary table to accumulate the results.
2. `#OrderDetails` - a temporary table to store SalesOrderDetail information.
3. `Sales.SalesOrderDetail` - source of order detail information.
4. `Sales.Customer` - stores customer related data.
5. `Person.Person` - contains the personal information of the customers and sales people.
6. `Sales.SalesOrderHeader` - used to store order header details.
7. `Sales.SalesPerson` & `HumanResources.Employee` - contains information about the salespeople.
8. `Production.Product` - contains product related information.

## 5. Possible optimization opportunities

An area of potential optimization might be the use of subqueries or JOINs. They can be computationally expensive, especially on larger datasets. Also, careful indexing on the tables involved in these operations could lead to significant performance gains.

## 6. Possible bugs

Given that this stored procedure does not include any transactions, there could be potential risks associated with data integrity should the operation fail at any particular point. For example, if the operation fails after data is inserted into the `#CustomerOrderInfo` table but before it's deleted for not meeting the `@MinimumOrderAmount`, we might have incorrect data.

## 7. Risk

The stored procedure runs without a WHERE clause when inserting into `#OrderDetails` from `Sales.SalesOrderDetail`. This can pose a risk of inserting all data without filters and should be highlighted.

## 8. Code Complexity

The complexity of the code mainly lies in its use of multiple tables, joins, and temporary tables. This includes understanding what each part does and making sure that it appropriately interacts with the others.

## 9. Refactoring Opportunities

The process of inserting data into the `#CustomerOrderInfo` table may be simplified and refactored by splitting it into smaller, more manageable parts to improve readability and maintainability.

## 10. User Acceptance Criteria

```gherkin
Feature: Get Customer Order Info
  Scenario: Successful retrieval of customer order information
    Given the database contains customer order information
    When I execute dbo.uspGetCustomerOrderInfo with valid parameters
    Then I should get a structured data of customer order information based on the provided criteria
    And There should not be any order information which does not meet the provided criteria
```

### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| INSERT | NA | NA | SalesOrderId, ProductId, OrderQty, UnitPrice, LineTotal | NA | NA |  |  |  | #OrderDetails |
| SELECT | SALES.SALESORDERDETAIL.SalesOrderId, SALES.SALESORDERDETAIL.ProductID, SALES.SALESORDERDETAIL.LineTotal, SALES.SALESORDERDETAIL.OrderQty, SALES.SALESORDERDETAIL.UnitPrice | NA | NA |  |  |  |  |  | Sales.SalesOrderDetail |
| INSERT | NA | NA | CustomerId, CustomerName, SalesOrderId, OrderDate, SalesPersonId, SalesPersonName, ProductId, ProductName, OrderQty, UnitPrice, LineTotal | NA | NA |  |  |  | #CustomerOrderInfo |
| SELECT | SALES.CUSTOMER.CustomerID, SALES.SALESORDERHEADER.SalesOrderID, PERSON.PERSON.FirstName, HUMANRESOURCES.EMPLOYEE.BusinessEntityID, PRODUCTION.PRODUCT.Name, #ORDERDETAILS.OrderQty, HUMANRESOURCES.EMPLOYEE.FirstName, #ORDERDETAILS.ProductId, PERSON.PERSON.LastName, #ORDERDETAILS.UnitPrice, SALES.SALESORDERHEADER.OrderDate, HUMANRESOURCES.EMPLOYEE.LastName, #ORDERDETAILS.LineTotal | NA | NA | SALES.SALESORDERDETAIL.SalesOrderID, #ORDERDETAILS.SalesOrderId, SALES.SALESORDERDETAIL.ProductID, SALES.CUSTOMER.CustomerID, SALES.CUSTOMER.PersonID, SALES.SALESORDERHEADER.SalesOrderID, SALES.SALESPERSON.BusinessEntityID, PERSON.PERSON.BusinessEntityID, HUMANRESOURCES.EMPLOYEE.BusinessEntityID, SALES.SALESORDERHEADER.CustomerID, SALES.SALESORDERHEADER.SalesPersonID, PRODUCTION.PRODUCT.ProductID | SALES.CUSTOMER.CustomerID, HUMANRESOURCES.EMPLOYEE.BusinessEntityID, SALES.SALESORDERHEADER.OrderDate |  |  |  | Sales.SalesOrderHeader, HumanResources.Employee, Sales.SalesPerson, Production.Product, Person.Person, #OrderDetails, Sales.SalesOrderDetail, Sales.Customer |
| SELECT | #CUSTOMERORDERINFO.* | NA | NA |  |  | #CUSTOMERORDERINFO.ProductId, #CUSTOMERORDERINFO.CustomerId, #CUSTOMERORDERINFO.SalesOrderId |  |  | #CustomerOrderInfo |

