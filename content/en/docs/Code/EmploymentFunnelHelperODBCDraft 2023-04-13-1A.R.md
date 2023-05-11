+++
categories = ["Documentation"]
title = "EmploymentFunnelHelperODBCDraft 2023-04-13-1A.R"
+++


# EmploymentFunnelHelperODBCDraft 2023-04-13-1A.R
# Overview

This script provides functions to:

- Extract and preprocess the data from multiple APIs including Mixpanel and Customer.io.
- Process the extracted data from various endpoints, joining and constructing columns as required.
- Update the dataset with new data from APIs.

The script includes the functions:

1. mxDTfromJson
2. getStoredDataMx
3. getDataMx
4. updateDataMx
5. fnJoinCIO
6. fn_customer_raw_export0
7. fn_customer_raw_export_rec
8. updateDataCio
9. fn_customer_msg_export0
10. fn_customer_msg_export_rec
11. updateDataCioMsg

Now, let us dive deeper into each function.

## 1. mxDTfromJson

This function takes the following inputs:

- `dfMx0`: an initial dataframe
- `pull_time`: a timestamp representing when data is pulled
- `echo` (optional, default `FALSE`): a boolean to print messages for debugging

The function does the following:

1. Extracts specific portions of the main input data frame (`dfMx0`) into separate data frames
2. Updates the main input data frame (`dfMx0`) by removing the extracted portion
3. Performs various operations to join, concatenate, or coalesce columns from extracted portions
4. Constructs a new data table `DTmx0` from the main input data frame with the required columns in the correct format
5. Returns `DTmx0`

## 2. getStoredDataMx

This function takes a file name as input (`filnm`) and checks if the file exists. If it does, it reads the content of the file into a data frame (`baseDt`), processes specific columns and returns the data frame. If the file doesn't exist, it returns NULL.

## 3. getDataMx

This function takes the following inputs:

- `keyBearer`: the API key (authorization key) to access the Mixpanel data
- `baseDt` (optional, default `NULL`): a base dataset
- `now_date` (optional, default `NULL`): the date as a cutoff for data extraction
- `echo` (optional, default `FALSE`): a boolean to print messages for debugging
- `timeout` (optional, default `60`): the API request timeout (in seconds)

The function calls `fn_mixpanel_raw_export` (not defined in the script) to extract Mixpanel data based on the given date range in the parameters, preprocesses the returned JSON data, and returns the processed data.

## 4. updateDataMx

This function takes the following inputs:

- `DTbas`: a base dataset
- `keyBearer`: the API key (authorization key) to access the Mixpanel data
- `echo` (optional, default `FALSE`): a boolean to print messages for debugging
- `timeout` (optional, default `60`): the API request timeout (in seconds)
- `now_date` (optional, default `NULL`): the date as a cutoff for data extraction

The function updates the base dataset `DTbas` with new data retrieved from the Mixpanel API, preprocesses the data, and combines it with the existing data. The modified data frame is then returned.

## 5. fnJoinCIO

This function takes the following inputs:

- `dtIn`: input data table
- `dtCIO`: Customer.io data
- `varname` (optional, default `V1`): a string representing the desired variable/column name
- `timestamp_fl` (optional, default `FALSE`): a boolean indicating whether to include timestamp information in the output dataset

The function joins the Customer.io specific data to the input dataset based on specific conditions and returns a combined dataset.

## 6. fn_customer_raw_export0

This function takes the following inputs:

- `keyBearer`: the API key (authorization key) to access Customer.io data
- `start` (optional, default `NULL`): a start value to fetch data from
- `type` (optional, default `NULL`): an activity type filter
- `timeout_limit` (optional, default `60`): the API request timeout (in seconds)

This function fetches data from the Customer.io API, handles error codes and returning data.

## 7. fn_customer_raw_export_rec

This function takes the following inputs:

- `keyBearer`: the API key (authorization key) to access Customer.io data
- `idx_cap`: index capacity limit
- `start`: a start value to fetch data from
- `idx`: index value
- `stop` (optional, default `NULL`): a stop value to fetch data until
- `type` (optional, default `NULL`): activity type to filter the data
- `timeout_limit` (optional, default `60`): the API request timeout (in seconds)
- `echo` (optional, default `FALSE`): a boolean to print messages for debugging

The function fetches data from the Customer.io APIs recursively based on the given input parameters, processes the resulting data, and returns a dataset with the required information.

## 8. updateDataCio

This function takes the following inputs:

- `type`: an activity type to update
- `keyBearer`: the API key (authorization key) to access Customer.io data
- `start` (optional, default `NULL`): a start value to fetch data from
- `echo` (optional, default `FALSE`): a boolean to print messages for debugging

The function updates Customer.io data based on the given activity and other input parameters. It writes the updated data to a CSV file and returns the updated dataset.

## 9. fn_customer_msg_export0

This function takes the following inputs:

- `keyBearer`: the API key (authorization key) to access Customer.io data
- `source` (optional, default `messages`): a source from which to fetch data
- `start` (optional, default `NULL`): a start value to fetch data from
- `type` (optional, default `NULL`): an activity type to filter the data
- `timeout_limit` (optional, default `60`): the API request timeout (in seconds)
- `echo` (optional, default `FALSE`): a boolean to print messages for debugging

This function fetches data from the Customer.io API, handles API errors and returns the response data.

## 10. fn_customer_msg_export_rec

This function takes the following inputs:

- `keyBearer`: the API key (authorization key) to access Customer.io data
- `source` (optional, default `messages`): a source from which to fetch data
- `idx_cap`: index capacity limit
- `start`: a start value to fetch data from
- `idx`: index value
- `stop` (optional, default `NULL`): a stop value to fetch data until
- `type` (optional, default `NULL`): activity type to filter the data
- `timeout_limit` (optional, default `60`): the API request timeout (in seconds)
- `echo` (optional, default `FALSE`): a boolean to print messages for debugging

The function fetches data from the Customer.io API recursively based on input parameters, processes the resulting data, and returns a dataset with the required information

## 11. updateDataCioMsg

This function takes the following inputs:

- `keyBearer`: the API key (authorization key) to access Customer.io data
- `start` (optional+++
categories = ["Documentation"]
title = "EmploymentFunnelHelperODBCDraft 2023-04-13-1A.R"
+++


# EmploymentFunnelHelperODBCDraft 2023-04-13-1A.R
# Overview

The provided code consists of multiple functions and operations primarily related to data extraction, transformation, and loading. The flow of the code can be broadly divided into the following sections:

1. Functions for extracting data from JSON files
2. Functions for reading and writing data from CSV files
3. Functions for processing and transforming data
4. External API calls for customer events and messages

In the following sections, we will discuss each function in detail.

## Functions

### mxDTfromJson

This function takes a dataframe (dfMx0), a timestamp, and a boolean flag (echo) as input. It extracts several data subsets from `dfMx0` and then performs operations such as coalescing columns and formatting datetime values. 

### getStoredDataMx

This function reads data from a specified CSV file (if it exists) and performs type conversions on certain columns.

### getDataMx

This function takes a keyBearer, a baseDt (data.table), now_date value, and a timeout value (in seconds) as input. It calls the `fn_mixpanel_raw_export` function to get raw data and returns the response.

### updateDataMx

This function is responsible for updating the data from Mixpanel with the latest input data. It takes several input parameters like DTbas, keyBearer, echo, timeout, and now_date. It calls the `getDataMx` and `mxDTfromJson` functions to get the latest data and then combines the latest data with the existing data using `rbindlist`.

### fnJoinCIO

**Purpose:** This function joins the input data table `dtIn` with the provided data table `dtCIO` on the specified columns. It also has an option to perform the join based on a timestamp column.

### fn_customer_raw_export0 & fn_customer_raw_export_rec

These functions are used to fetch raw data by calling the customer.io API recursively to retrieve all the data.

### updateDataCio & updateDataCioMsg

These functions are responsible for updating data related to customer.io API calls. They store the response data into the appropriate CSV files and return the updated data as output.

## Risks

### Security Issues

- API keys are being passed as function parameters, which could lead to unintentional leakage of sensitive information. It is recommended to use environment variables or a configuration file to securely store and access API keys.

### Bugs

- No specific bugs have been identified in the code.

## Refactoring Opportunities

- There are several instances of repeated code, particularly during data extraction and transformation. These can be refactored into utility functions to follow the DRY (Don't Repeat Yourself) principle.
- The use of global variables (such as keyBearer) might lead to issues with code maintenance and potential bugs.

## User Acceptance Criteria

```gherkin
Feature: Data Extraction and Transformation
  As a code reviewer and technical writer, I want to ensure that the provided code is correct and efficient.
  
  Scenario: Successfully extract data from JSON
    Given I have an input JSON file with required format
    When I run the mxDTfromJson function
    Then I should get a data.table with specified columns and transformed data

  Scenario: Successfully read data from a CSV file
    Given I have an existing CSV file with data
    When I run the getStoredDataMx function
    Then I should get a data.table with the data from the CSV file

  Scenario: Successfully update data with Mixpanel data
    Given I have a base data.table and a valid keyBearer
    When I run the updateDataMx function
    Then I should get a data.table with updated data, combined from existing data and the latest data

  Scenario: Successfully update data with data from customer.io API
    Given I have a valid keyBearer and a start value
    When I run the updateDataCio or updateDataCioMsg function
    Then I should get a data.table with updated data based on the customer.io API responses
```