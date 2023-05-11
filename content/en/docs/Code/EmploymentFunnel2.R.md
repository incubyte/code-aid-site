+++
categories = ["Documentation"]
title = "EmploymentFunnel2.R"
+++


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
```