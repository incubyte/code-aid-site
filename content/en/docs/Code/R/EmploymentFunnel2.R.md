+++
categories = ["Documentation"]
title = "EmploymentFunnel2.R"
+++

## File Summary

- **File Path:** src\test\resources\test-files\sub-dir\EmploymentFunnel2.R
- **LOC:** 254
- **Last Modified:** Git logs not found
- **Number of Commits (Total / Last 6 Months / Last Month):** Git logs not found
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** Git logs not found
- **Top Contributors:** Git logs not found

# EmploymentFunnel2.R
# Overview

This script imports necessary libraries and reads in data from various sources such as CSV files, Mixpanel API, and Customer.IO API. The script then processes, cleans, and joins the data and finally writes the output to files. The following sections will explain each part of the code in detail.

## Importing Libraries

The script imports the required libraries as follows:

```R
library(httr)
library(data.table)
library(base64)
library(bit64)
library(jsonlite)
library(data.table)
library(RODBC)
library(googlesheets4)
library(lubridate)
library(zoo)
library(feather)
```

## Reading Data

The script reads data from multiple sources:

1. Sets working directory and loads the helper script:

```R
setwd('~/Engagements/_InternalReporting/Employment Funnel')
source('EmploymentFunnelHelper.r')
```

2. Reads data from the CSV file and preprocesses the data:

```R
filnm <- 'mx_all.csv'
baseDt <- fread(filnm)
...
baseDt <- baseDt[event_time<lubridate::as_date('2021-11-30')]
```

3. Calls the `fn_mixpanel_raw_export` function to get Mixpanel data:

```R
json <- fn_mixpanel_raw_export(
    lubridate::as_date('2021-12-16')
  , lubridate::as_date('2021-12-17')
  , mx_keyBearer
)
dt1 <- mxDTfromJson(json,echo=T)
```

4. Calls the `fn_customer_msg_export_rec` function to get data from Customer.IO API:

```R
ActOut <- fn_customer_msg_export_rec(keyBearer0,'messages',2000)
ActOut2 <- nm_response1(ActOut)
```

## Data Processing and Transformation

1. Cleans and formats the Mixpanel data:

```R
...
clean_format <- paste0 ('[',paste(json_splt, collapse=','),']')
dfMx0 <- fromJSON(clean_format)
...
for (c in dsnm){
  if (length(c)>=-1){print(paste(c, collapse=', '))}
}
```

2. Updates and processes the message data from Customer.IO API:

```R
...
ActOut2 <- nm_response1(ActOut)
...
DTout <- data.table::rbindlist(list(ActOut2,baseDt),fill=TRUE,use.names =T)
```

## Writing Output Data

The script writes output data to files using the `fwrite` function:

```R
...
fwrite(baseDt,filnm)
...
fwrite(DTout,filnm)
```

# Risks

## Security Issues

No explicit security risks are found in the code. However, it is recommended to store API keys and confidential information securely, for example using environment variables or secure storage services.

## Bugs

No bugs are identified in the code. However, it is good practice to validate the data after processing, to ensure that the desired outcome is achieved.

# Refactoring Opportunities

The code can be improved by:

1. Creating functions for repetitive tasks, such as reading and writing data from files.

2. Reducing the use of global variables and passing required variables as function arguments.

3. Adding more comments and descriptions to explain the purpose and functionality of different parts of the script.

4. Removing any unnecessary code or comments to improve readability.

# User Acceptance Criteria

```gherkin
Feature: Data extraction and processing
  As a data analyst
  I want to extract and process data from multiple sources
  So that I can analyze the data and make informed decisions

  Scenario: Data is extracted from the CSV file
    Given I provide the correct file path
    And the CSV file exists
    When the script reads the CSV data
    Then data should successfully be loaded

  Scenario: Data is extracted from Mixpanel API
    Given I provide a valid API key
    And specify correct date range
    When the script reads Mixpanel data
    Then data should successfully be loaded

  Scenario: Data is extracted from Customer.IO API
    Given I provide a valid API key
    And specify correct message type and limit
    When the script reads Customer.IO data
    Then data should successfully be loaded

  Scenario: Data is processed and transformed
    Given I have loaded data from all sources
    When script processes the data
    Then the data should be cleaned and transformed correctly

  Scenario: Data is written to output files
    Given I have processed the data
    When the script writes the data to files
    Then the output files should be created with the correct data
```+++
categories = ["Documentation"]
title = "EmploymentFunnel2.R"
+++


# EmploymentFunnel2.R
## Overview

The given script primarily consists of data extraction, transformation, and loading operations, along with some data filtering and joining operations. This script uses several R packages like httr, data.table, base64, bit64, jsonlite, RODBC, googlesheets4, lubridate, zoo, and feather.

## Section 1: Extraction

1. The script begins with reading the file `mx_all.csv` using the fread() function from the data.table package.
```
filnm <- 'mx_all.csv'
baseDt <- fread(filnm)
```

2. The script then calls the fn_mixpanel_raw_export() function to get the data in the JSON format.
```
json <- fn_mixpanel_raw_export(
    lubridate::as_date('2021-12-16')
  , lubridate::as_date('2021-12-17')
  , mx_keyBearer
)
```

## Section 2: Transformation

1. The script then converts the JSON data into a datatable format and performs some transformation operations using the mxDTfromJson() function.
```
dt1 <- mxDTfromJson(json,echo=T)
```

2. The script further cleans and formats the extracted JSON data.
```
json_splt <- strsplit(json,'\n')[[1]]
json_splt <- json_splt[!grepl('17ce4c5da5289b-0392f8a441f3d8-1c306851-13c680-17ce4c5da531045',json_splt)]
clean_format <- paste0 ('[',paste(json_splt, collapse=','),']')
dfMx0 <- fromJSON(clean_format)
```

3. Some additional transformations like formatting and date operations are also performed on the extracted data.
```
baseDt$mp_processing_time_ms <- as.double(baseDt$mp_processing_time_ms)
baseDt$plaid_timestamp0 <- format(baseDt$plaid_timestamp0,'%Y-%m-%dT%H:%M:%S')
baseDt <- baseDt[event_time<lubridate::as_date('2021-11-30')]
```

## Section 3: Data Filtering and Joining

Several datatable operations like filter and join are performed on the extracted and transformed data, such as joining `DTem5` and `DTmx3` data.tables, or filtering events with specific event names, such as "Clicked on YES, knows payroll processor" and "Clicked on 'NO', does not know payroll processor".

1. The script filters the events based on specific event names.

```R
DTtmp <- DTcmb[ event_name %in% c( "Clicked on YES, knows payroll processor"
                                   ,"Clicked on 'NO', does not know payroll processor")
               , c('pseudo_id','event_name','event_time')]
```

2. The script uses the user-defined function `fnJoin()` to join two data.tables, such as `DTem5` and `DTmx3`, based on a key column.

```R
DTcmb <- fnJoin(DTem5,DTmx3,key_vec = c('pseudo_id'))
```

## Risks

### Security Issues

1. Sensitive information like API keys is hardcoded in the script, which may lead to potential exposure and unauthorized access by unauthorized entities.

```R
# mx_keyBearer <- 'fa657cdd38ae7966977094e3556ef744:' OLD KEY
mx_keyBearer <- '27b46442ab4299479c3dce41998e1b68'
```

### Bugs

No specific bugs/errors were found in this script.

## Refactoring Opportunities

1. The script contains some hard codes, like filenames and API keys, which could be moved to a separate configuration file for better modularity, maintainability, and security.

2. The script can be broken down into smaller functions to avoid lengthy sections and make it more modular and easier to understand.

3. It is recommended to add some error handling and exception handling mechanisms to handle unexpected situations and error messages.

## User Acceptance Criteria

```
Feature: Data Extraction, Transformation, and Loading
  Scenario: Success
    Given a user provides a valid API key
    And a user provides correct source data
    When the user runs the script
    Then the script should extract data from 'mx_all.csv' file
    And convert JSON data to datatable format
    And perform necessary data transformations
    And filter and join required data.tables
    And output the transformed data without errors
```

```
Feature: Data Extraction, Transformation, and Loading
  Scenario: Failed API Key or Incorrect Source Data
    Given a user provides an invalid API key or incorrect source data
    When the user runs the script
    Then the script should display appropriate error messages
```