+++
categories = ["Documentation"]
title = "Itemized_Report.R"
+++


# Itemized_Report.R
## Overview

This script is designed to retrieve individual records by their IDs using a MeasureOne API. It supports fetching records in batch by passing a vector of IDs. The main components of the script are as follows:

1. `fnGetbyid` function: Retrieves records for a given individual ID.
2. `fnCk` function: A helper function to handle null values in the retrieved records.
3. `fnGetByIdS` function: Retrieves records for a vector of IDs by sending requests in batch.

## Function by Function Explanation

### 1. `fnGetbyid(ind_id)`

This function retrieves a record by a given individual ID `ind_id`. The main steps in the function are as follows:

1. Build the raw body for the request with the input `ind_id`.
2. Define and set the content type to "application/json".
3. Create the POST request to the API endpoint with the required headers and body.
4. Check for a successful response (status code 200).
5. If successful, transform the API result into a clean data frame `tmpDf`.
6. If unsuccessful, create an empty data frame `tmpDf` with error status code.
7. Return the resulting data frame `tmpDf`.

### 2. `fnCk(x, idx=1)`

This function is a helper function to handle null/empty values.

1. If `x` is empty, it returns an empty string.
2. Otherwise, it returns the element at index `idx` of `x`.

### 3. `fnGetByIdS(id_vec)`

This function retrieves records for a vector of individual IDs `id_vec`.

1. Apply `fnGetbyid` to each element of the input vector `id_vec`.
2. Bind the results row-wise into a single data frame.
3. Return the resulting data frame.

## Extraction, Transformation, and Loading (ETL)

The script primarily focuses on data extraction from the MeasureOne API. However, it also handles some data transformation.

1. Extraction: The `fnGetbyid` and `fnGetByIdS` functions handle extracting individual records from the API given a list of individual IDs.
2. Transformation: Within the `fnGetbyid` function, null values in the API response are replaced with `NA` and then cleaned using the helper function `fnCk`. The transformed data is stored in the `tmpDf` data.frame.
3. Loading: The script is not specifically designed to load the fetched data into any system, but the fetched, cleaned data table can be used for subsequent processing or analysis.

## Risks

### Security Issues

There are no specific security risks in the script as is. However, be cautious when handling sensitive data. It is recommended to use encrypted credentials and protect sensitive user data that might be accessed through the API.

### Bugs

There are no apparent bugs found in the script.

## Refactoring Opportunities

- Error handling can be improved by raising more explicit errors with error messages.
- Instead of printing out error messages directly within the `fnGetbyid` function, consider logging the errors or passing them back up to the caller.+++
categories = ["Documentation"]
title = "Itemized_Report.R"
+++


# Itemized_Report.R
# Overview

This script consists of three main functions:

1. **fnGetbyid**: Returns a user's details (first name, last name, external id, and email id) by querying an API with the given user id.
2. **fnCk**: Verifies if a list or item is empty/NULL and returns the default value.
3. **fnGetByIdS**: Retrieves user's details for multiple user ids by running the `fnGetbyid` function on each user id in a given vector.

# Function: fnGetbyid

## Description

This function retrieves user details (first name, last name, external id and email id) based on a given individual id (ind_id) using an API query.

## Parameters

- **ind_id**: Individual id string

## Process

1. Construct API URL and set content type
2. Execute POST request to the URL with the required headers
3. If API request is successful (HTTP status code == 200):
    - Extract first name, last name, external id, and email id from the response
    - Create a data table with the retrieved information
4. Else, if the request is unsuccessful,
    - Create a data table with empty values for all fields, except for the status code containing the actual status code received
5. Return the data table

# Function: fnCk

## Description

This function checks if the given list or item is empty or NULL, and returns an empty string if it is. If it is not empty, it returns the value of the item.

## Parameters

- **x**: List or item
- **idx**: Index of the item in the list (Defaults to 1)

## Process

1. Check if the input (x) is an empty list using `identical`
2. If the input is empty, return an empty string
3. Else, return the value at the specified index (idx)

# Function: fnGetByIdS

## Description

This function retrieves user's details for multiple user ids by running the `fnGetbyid` function on each user id in a given vector.

## Parameters

- **id_vec**: A vector of individual id strings

## Process

1. Call `fnGetbyid()` function for each id in the input `id_vec`
2. Combine the results into a single data table using `rbindlist` from the `data.table` package
3. Return the data table containing user's details for all input ids

# Risks

## Security issues

- No security concerns found in the provided code.

## Bugs

- No bugs found in the provided code.

# Refactoring Opportunities

- The `fnCk` function could be simplified using the `purrr` package's `coalesce` function.

# User Acceptance Criteria

## Scenario 1: Successful retrieval of user details

```Gherkin
Given a valid individual id "idv_1xsNWxlswSrB9BsNeUpPOT0ksba"
When the fnGetbyid function is called with the given individual id
Then the function should return a data table containing user details with status code 200
```

## Scenario 2: Unsuccessful retrieval of user details

```Gherkin
Given an invalid individual id "idv_invalid"
When the fnGetbyid function is called with the given individual id
Then the function should return a data table with empty values for all fields and a non-200 status code
```

## Scenario 3: Get details for multiple user ids

```Gherkin
Given multiple individual ids ['idv_1xsNWxlswSrB9BsNeUpPOT0ksba', 'idv_200783qMFWdmnZg5bzkA6dn7Om6', 'idv_1xY4luaErKEM3BQix8YmeaxeqCw']
When the fnGetByIdS function is called with the given individual ids
Then the function should return a data table containing user details for all given individual ids
```