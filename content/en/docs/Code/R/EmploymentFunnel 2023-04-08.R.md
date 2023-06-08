+++
categories = ["Documentation"]
title = "EmploymentFunnel 2023-04-08.R"
+++

## File Summary

- **File Path:** src\test\resources\test-files\sub-dir\EmploymentFunnel 2023-04-08.R
- **LOC:** 587
- **Last Modified:** Git logs not found
- **Number of Commits (Total / Last 6 Months / Last Month):** Git logs not found
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** Git logs not found
- **Top Contributors:** Git logs not found

# EmploymentFunnel 2023-04-08.R
# Overview

This code reviews the script provided and provides detailed explanations for each section. The main goal of the script is to extract, transform, and load (ETL) data from various sources related to employment funnels, perform several operations on the collected data, and generate various reports such as funnel and Sankey reports, daily volumes report, weekly fail report, and itemized report.

The script mainly consists of the following sections:

1. Update Mixpanel
2. Update Customer.IO
3. Update M1 Data (PostgreSQL)
4. Process Data
5. ETL Operations on Data
6. Create and Update Reports
7. Update Remote File

# 1. Update Mixpanel

This section reads the stored Mixpanel data from a .csv file, gets the Mixpanel data using an API key, updates Mixpanel data with new data fetched, and writes the combined data back into the .csv file.

* Loading packages
* Reading stored data from .csv file
* Calling Mixpanel API for data
* Preprocessing Mixpanel JSON data
* Updating stored data with new data
* Writing combined data back into .csv file

# 2. Update Customer.IO

This section updates various data related to Customer.IO, such as delivered_email, opened_email, clicked_email, message details, customer tokens, and campaigns, using the provided API key.

* Define and set up API key
* Update delivered_email, opened_email, clicked_email, and message details data
* Merge and join datasets with additional information

# 3. Update M1 Data (PostgreSQL)

This section connects to a PostgreSQL database to extract various pieces of data, such as customer tokens, SKUs, invitations, funnel reports, and M1 Plaid data. It defines a series of helper functions to query the data and process it.

* Establish a connection with the PostgreSQL database
* Define helper functions for querying data
* Extract data by executing SQL queries with helper functions

# 4. Process Data

This section processes the data fetched from Mixpanel, Customer.IO, and M1 Data by performing several data cleaning operations and transformations. It combines data from different sources and prepares it for generating various reports.

* Perform data cleaning on Mixpanel data
* Clean up pseudo_id in the data
* Combine Mixpanel and Customer.IO data using helper functions
* Add Plaid data and click time into the data
* Organize and clean data for further analysis

# 5. ETL Operations on Data

This section performs various ETL operations on the data, such as data cleaning, aggregation, and manipulation, to prepare it for generating reports.

* Data cleaning, aggregation, and manipulation
* Exclude unwanted columns from the data
* Computing various statistics and other transformations on the data

# 6. Create and Update Reports

This section generates various reports such as Funnel, Sankey Reports, Daily Volumes Report, Weekly Fail Report, and Itemized Report based on the processed data. 

* Funnel data generation and cleaning
* Sankey data generation
* Daily Volumes report generation
* Weekly Fail report generation
* Itemized Report generation

# 7. Update Remote File

This section uploads the generated reports to AWS S3 for storage and accessibility.

* Set up AWS IAM credentials
* Upload generated reports to AWS S3 as .csv files

# Risks

## Security Issues

- Hard-coded API keys and database credentials should be stored in a secure way, such as environment variables, or a secrets manager for better security.
- The Mixpanel and Customer.IO API keys are visible in the code, which could potentially expose sensitive data if the code is shared or accessed by unauthorized users.

## Bugs

- Upon code review, no major bugs were found.

# Refactoring Opportunities

- Functions and sections can be separated into their own files and called by main script for better code organization and readability.
- Use of environment variables or secure storage for sensitive data such as API keys and database credentials could be implemented to increase security.
- Better error handling and logging can be added to the script, especially during API calls, to better handle edge cases and make the script more maintainable.+++
categories = ["Documentation"]
title = "EmploymentFunnel 2023-04-08.R"
+++


# EmploymentFunnel 2023-04-08.R
# Overview

This script performs several tasks related to retrieving, processing, and analyzing data from various sources, such as Mixpanel, Customer.IO, M1 Data, and Amazon Web Services (AWS). The main outputs include the Employment Funnel data, Sankey data, Monthly data, and Weekly Trend data, as well as several reports.

# Function breakdown

## 1. Initial Setup

The script starts by clearing the R workspace and loading the required libraries using pacman. It sets the working directory and sources the "EmploymentFunnelHelper.r".

## 2. Update Mixpanel

The script retrieves Mixpanel data and processes it to obtain the `DTmx0` data table. It then merges the new data table with the stored data table `DTbas` to update the Mixpanel data.

### 2.1. getDataMx

This function is used to get Mixpanel data based on a specified API key.

### 2.2. mxDTprepJson

This function processes the retrieved Mixpanel data in JSON format and prepares it for further analysis.

### 2.3. mxDTfromJson

This function processes the prepared Mixpanel list to create the `ActOut` data table.

## 3. Update Customer.IO

The script retrieves Customer.IO data and processes it to obtain the delivered email, opened email, and clicked email data tables (`DT_delv`, `DT_open`, and `DT_clik`, respectively). It also gets message data (`DT_msg`), campaign data (`DT_cmp`), and customer data (`DT_tmp`). The script then joins these data tables to update the Customer.IO data.

### 3.1. updateDataCio

This function retrieves data from Customer.IO for the specified event type.

### 3.2. updateDataCioMsg

This function retrieves Customer.IO message data.

### 3.3. fn_customer_raw_export0

This function retrieves customer data from Customer.IO.

### 3.4. fn_customer_msg_export_rec

This function retrieves customer message data from Customer.IO.

## 4. Update M1 Data

The script connects to a PostgreSQL database and retrieves M1 data such as tokens, SKUs, invites, and funnel data from M1 Data.

### 4.1. fnGetPostgresData

This function retrieves data from M1 Data by connecting to a PostgreSQL database and executing SQL queries.

### 4.2. fnGetInvitationDataSQL

This function retrieves invitation data based on a specified start date.

### 4.3. fnGetAllSKUs

This function retrieves all SKUs from M1 Data.

## 5. Process Data

The script processes the retrieved data to create various data tables that are used for further analysis and reporting. It cleans the Mixpanel data, adds funnel data, Plaid data, and click time data to create the final `mgOut` data table.

### 5.1. fnCleanMxp

This function processes the Mixpanel raw data to prepare it for further analysis.

### 5.2. fnCleanUpPseudoId

This function cleans up the Pseudo ID in the Mixpanel data.

### 5.3. fnFunnelClean

This function processes the retrieved data and adds funnel data to the Mixpanel data.

### 5.4. fnAddPlaid

This function adds Plaid data to the Mixpanel data.

### 5.5. fnAddClickTime

This function adds click time data to the Mixpanel data.

## 6. Update Remote File

The script uploads the generated data tables to an Amazon Web Services (AWS) S3 bucket for further analysis and reporting.

## 7. Daily Volumes Report, Weekly Fail Report, and Itemized Report

The script generates various reports from the processed data, including the Daily Volumes Report, Weekly Fail Report, and Itemized Report.

# Risks

## Security Issues

1. User credentials are stored and accessed using Sys.getenv(), which may expose sensitive information.

## Bugs

There are no apparent bugs in the code. 

# Refactoring Opportunities

Potential code refactoring opportunities include:

1. Modularize the code into separate functions to improve code readability and maintainability.

2. Improve the script's performance by reducing redundant data manipulation operations.

3. Use more descriptive variable names and add comments to improve code readability.

4. Implement error handling and input validation to handle unexpected situations gracefully.

# User Acceptance Criteria

```gherkin
Feature: Mixpanel Data Retrieval
  Scenario: Retrieve Mixpanel data and store in a data table
    Given the Mixpanel API key and path to the data file
    When the script retrieves data from Mixpanel
    Then the data should be stored in a data table called "DTmx0"

Feature: Customer.IO Data Retrieval
  Scenario: Retrieve Customer.IO data and store in data tables
    Given the Customer.IO API key and path to the data files
    When the script retrieves data from Customer.IO
    Then the data should be stored in various data tables, including "DT_delv", "DT_open", "DT_clik", "DT_msg", "DT_cmp", and "DT_tmp"

Feature: M1 Data Retrieval
  Scenario: Retrieve M1 data and store in data tables
    Given the PostgreSQL database credentials and M1 Data API key
    When the script retrieves data from M1 Data
    Then the data should be stored in various data tables, including "lsM1"

Feature: Data Processing
  Scenario: Process retrieved data and store in the final data table
    Given the Mixpanel, Customer.IO, and M1 Data
    When the script processes and merges the data from various sources
    Then the final data table "mgOut" should be created

Feature: Generate Reports
  Scenario: Generate Daily Volumes Report, Weekly Fail Report, and Itemized Report
    Given the processed data table "mgOut"
    When the script generates the reports
    Then the Daily Volumes Report, Weekly Fail Report, and Itemized Report should be created and saved as CSV files
```