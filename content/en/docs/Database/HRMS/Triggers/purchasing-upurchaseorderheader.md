---
title: "Purchasing.uPurchaseOrderHeader"
author: GPT
date: 2022-05-01
categories:
  - Technology
  - Programming
---

| Object Type   |       No of Lines      |  Tables Involed |
|----------|:-------------:|------:|
| Trigger |  22 | Purchasing.PurchaseOrderHeader |

## Overview
This documentation covers the `Purchasing.uPurchaseOrderHeader` trigger in the `Purchasing.PurchaseOrderHeader` table. The trigger is invoked after an `UPDATE` operation on the table.

## Details
The trigger is designed to update the `RevisionNumber` after any field except the `Status` is modified in the `Purchasing.PurchaseOrderHeader` table.

## Information on data
The trigger depends on the data in the following table:
1. **Purchasing.PurchaseOrderHeader** - The table containing purchase order header records.

## Information on the tables
### Purchasing.PurchaseOrderHeader
| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| PurchaseOrderID | int | Unique identifier for the purchase order header. |
| RevisionNumber | tinyint | Incremented any time a field except the `Status` is modified.|
| Status | tinyint | Purchase order status. |

## Possible optimization opportunities
None identified.

## Possible bugs
None identified.

## Risk
- **UPDATE without WHERE clause**: The trigger has an UPDATE statement that could cause performance issues or unexpected updates if the trigger is invoked without a proper WHERE clause. This risk is mitigated by the fact that the trigger only updates rows affected by the original update operation.

```sql
UPDATE [Purchasing].[PurchaseOrderHeader]
SET [Purchasing].[PurchaseOrderHeader].[RevisionNumber] = 
    [Purchasing].[PurchaseOrderHeader].[RevisionNumber] + 1
WHERE [Purchasing].[PurchaseOrderHeader].[PurchaseOrderID] IN 
    (SELECT inserted.[PurchaseOrderID] FROM inserted);
```

## Code Complexity
The code is moderately complex, containing error handling, conditional statements, and the use of the `@@ROWCOUNT` and `@@TRANCOUNT` system functions.

## Refactoring Opportunities
- Improve error handling: Error handling could be refactored to handle specific error cases and provide more informative error messages to developers.
- Simplify the code: The trigger could be simplified by using an `IF EXISTS` clause instead of assigning the `@@ROWCOUNT` to a variable, which could improve readability.