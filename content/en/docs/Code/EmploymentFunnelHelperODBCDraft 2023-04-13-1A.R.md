+++
categories = ["Documentation"]
title = "EmploymentFunnelHelperODBCDraft 2023-04-13-1A.R"
+++

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
- `start` (optional