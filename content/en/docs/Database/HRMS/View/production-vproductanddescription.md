---
title: "Production.vProductAndDescription"
linkTitle: "Production.vProductAndDescription"
description: "Production.vProductAndDescription"
---

# Views

## [Production].[vProductAndDescription]
### Summary


- **Number of Tables Accessed:** 4
- **Lines of Code:** 18
- **Code Complexity:** 2
### Missing Indexes

| Table Name | Column Name | Statement Type | Condition Type |
|---|---|---|---|
| [PRODUCTION].[PRODUCT]| [ProductModelID] | sstselect | JOIN |



{{< details "Sql Code" >}}
```sql

CREATE VIEW [Production].[vProductAndDescription] 
WITH SCHEMABINDING 
AS 
-- View (indexed or standard) to display products and product descriptions by language.
SELECT 
    p.[ProductID] 
    ,p.[Name] 
    ,pm.[Name] AS [ProductModel] 
    ,pmx.[CultureID] 
    ,pd.[Description] 
FROM [Production].[Product] p 
    INNER JOIN [Production].[ProductModel] pm 
    ON p.[ProductModelID] = pm.[ProductModelID] 
    INNER JOIN [Production].[ProductModelProductDescriptionCulture] pmx 
    ON pm.[ProductModelID] = pmx.[ProductModelID] 
    INNER JOIN [Production].[ProductDescription] pd 
    ON pmx.[ProductDescriptionID] = pd.[ProductDescriptionID];

```
{{< /details >}}
## Overview

This markdown documentation provides information about the `[Production].[vProductAndDescription]` view in the database. The view is created to display products and product descriptions by language.

## Details

The view is created using the `WITH SCHEMABINDING` option, which ensures that the objects referenced in the view are not dropped or altered in a way that would compromise the view definition.

The view is created by joining four tables:

1. `[Production].[Product]`
2. `[Production].[ProductModel]`
3. `[Production].[ProductModelProductDescriptionCulture]`
4. `[Production].[ProductDescription]`

## Information on Data

The view displays the following columns:

1. `ProductID`: The unique identifier for each product.
2. `Name`: The name of the product.
3. `ProductModel`: The name of the product model.
4. `CultureID`: The culture identifier that represents the language of the description.
5. `Description`: The description of the product in a specific language.

## Information on the Tables

The participating tables in this view are:

1. `[Production].[Product]`: This table stores basic information about products, such as the name and model.
2. `[Production].[ProductModel]`: This table stores information about product models, such as the model name.
3. `[Production].[ProductModelProductDescriptionCulture]`: This table stores the relationship between product models, product descriptions, and the languages (cultures) used in the descriptions.
4. `[Production].[ProductDescription]`: This table stores product descriptions in different languages.

## Possible Optimization Opportunities

As the view is created using `INNER JOIN`, it only displays the records with matching data in all the participating tables. 

## Possible Bugs

There are no obvious bugs or issues with the code based on static analysis.

## Risk

Since this query does not have a `WHERE` clause, it may display a large number of rows when queried without any filtering. This can cause performance issues for applications that use this view.

## Code Complexity

The code is relatively simple, utilizing `INNER JOIN` between four tables. There are no complex calculations or conditional statements.

## Refactoring Opportunities

The view code does not require any refactoring as it already provides the necessary data by joining the required tables and is easy to understand.

## User Acceptance Criteria

```gherkin
Scenario: Display products and descriptions by language
  Given A list of products in the Production database
  And Each product has a product model
  And Product descriptions are available in various languages
  When User queries the Production.vProductAndDescription view
  Then User should see a list of products with their descriptions in different languages
```
### Statements

| Statement Type | Select Columns | Set Columns | Insert Columns | Joins Columns | Where Columns | Order By Columns | Group By Columns | Having Columns | Table Name |
|---|---|---|---|---|---|---|---|---|---|
| SELECT | [PRODUCTION].[PRODUCTMODEL].[Name], [PRODUCTION].[PRODUCT].[Name], [PRODUCTION].[PRODUCT].[ProductID], [PRODUCTION].[PRODUCTDESCRIPTION].[Description], [PRODUCTION].[PRODUCTMODELPRODUCTDESCRIPTIONCULTURE].[CultureID] | NA | NA | [PRODUCTION].[PRODUCTDESCRIPTION].[ProductDescriptionID], [PRODUCTION].[PRODUCTMODELPRODUCTDESCRIPTIONCULTURE].[ProductModelID], [PRODUCTION].[PRODUCTMODELPRODUCTDESCRIPTIONCULTURE].[ProductDescriptionID], [PRODUCTION].[PRODUCT].[ProductModelID], [PRODUCTION].[PRODUCTMODEL].[ProductModelID] |  |  |  |  | [Production].[ProductModelProductDescriptionCulture], [Production].[ProductDescription], [Production].[ProductModel], [Production].[Product] |

