+++
categories = ["Documentation"]
title = "EmploymentFunnel2.R"
+++


# EmploymentFunnel2.R
# Overview

This script is primarily utilized for data extraction, transformation and loading for employment funnel data. It relies on multiple libraries to read, manipulate, and process the data. Included libraries: `httr`, `data.table`, `base64`, `bit64`, `jsonlite`, `RODBC`, `googlesheets4`, `lubridate`, `zoo`, and `feather`. The processed data is then written to a CSV file.

## Sections

1. Library Import
2. Mixpanel Data Extraction
3. Data Transformation
4. Data Loading
5. Risks
   1. Security issues
   2. Bugs
6. Refactoring Opportunities

### 1. Library Import

The script begins by importing several libraries:

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

### 2. Mixpanel Data Extraction

The `fn_mixpanel_raw_export` and `mxDTfromJson` functions are used to extract data from Mixpanel, an event tracking and analytics platform. The Mixpanel API is utilized by providing the specific date range and required key value.

```R
mx_keyBearer <- '27b46442ab4299479c3dce41998e1b68'

json <- fn_mixpanel_raw_export(
    lubridate::as_date('2021-12-16')
  , lubridate::as_date('2021-12-17')
  , mx_keyBearer
)

dt1 <- mxDTfromJson(json,echo=T)
```

### 3. Data Transformation

The script performs multiple data transformation tasks, such as:

- Converting data types
- Filtering data based on dates
- Extracting and formatting JSON data
- Removing duplicates from raw data
- Combining data with various techniques

### 4. Data Loading

At the end of the script, processed data is loaded into a CSV file for further analysis and usage.

```R
fwrite(DTout,filnm)
```

### 5. Risks

#### i. Security issues

- The Mixpanel key value (`mx_keyBearer`) is hardcoded in the script. This could potentially expose sensitive authentication information. 

#### ii. Bugs

- The use of hardcoded dates could lead to incorrect analysis or missed data points. It's better to use dynamic dates.

### 6. Refactoring Opportunities

- The script contains some repeating code sections that can be combined into a function to reduce redundancy.
- Error handling can be improved to catch and report issues during the data extraction and transformation process.
- Comments can be improved for better readability and understanding of the code.+++
categories = ["Documentation"]
title = "EmploymentFunnel2.R"
+++


# EmploymentFunnel2.R
## Overview

The script analyzes user engagement with the Employment Funnel by extracting data from different sources, transforming the data, and loading the analyzed data into the output file (csv format). It mainly deals with two data sources: mx_all.csv and Mixpanel raw export data. The script also includes various helper functions sourced from the file 'EmploymentFunnelHelper.r'.

## Library Imports

1. httr
2. data.table
3. base64
4. bit64
5. jsonlite
6. RODBC
7. googlesheets4
8. lubridate
9. zoo
10. feather

## Read Input Data

1. Read 'mx_all.csv' file with baseDt variable.
2. Convert 'mp_processing_time_ms' as double datatype.
3. Convert 'plaid_timestamp0' into a specific date format.

## Mixpanel Data Extraction

1. Define a variable 'mx_keyBearer' which is the API key for Mixpanel.
2. Execute the function 'fn_mixpanel_raw_export' to fetch raw data from Mixpanel API for the given date range.
3. Convert the JSON data into the 'dt1' dataframe using a helper function 'mxDTfromJson`.

## Data Cleaning and Transformation

1. Cleaning and formatting of JSON data.
2. Create 'baseDt' and 'dt1' dataframes with appropriate column names.
3. Exclude the last day's transactions.
4. Extract unique column names.
5. Combine two data sources baseDt and dt1.

## Data Analysis

1. Create a data table DTem5 which includes a subset of columns from DTem4.
2. Create another data table DTmx3 by excluding specific columns from DTmx2.
3. Combine the DTem5 and DTmx3 tables into DTcmb.

## Helper functions

1. fnGetMxStatus: Gets the status of Mixpanel data.
2. fn_customer_msg_export_rec: A function to export the customer messages.
3. nm_response1: A function to transform the extracted messages.

## Data Output

1. Write the final output into a file called 'cio_msgDT.csv'.

## Risks

### Security issues

1. The API keys are hardcoded in the script. It is better to use environment variables or a configuration file to store sensitive information like API keys.

### Bugs

1. Some loops and condition checks in the script might result in errors if the input data is not as expected. It is better to handle exceptions and add error handling mechanisms.

## Refactoring Opportunities

1. Helper functions can be stored in separate files/modules for easier maintenance and testing.
2. Divide the script into smaller functions or parts for better readability.
3. Use functions from the tidyverse package for more efficient data manipulation and analysis.

## User Acceptance Criteria

1. Given input data from mx_all.csv and Mixpanel API, the script should be able to clean the data and combine it into a single data table.
2. Given the combined data table, the script should be able to execute various data analysis operations and create new variables/columns based on the analysis.
3. The output should be stored in a file named 'cio_msgDT.csv' that can be used for further analysis or reporting.