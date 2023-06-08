+++
categories = ["Documentation"]
title = "Fee_model.php"
+++

## File Summary

- **File Path:** walnut codes\Fee_model.php
- **LOC:** 6056
- **Last Modified:** Git logs not found
- **Number of Commits (Total / Last 6 Months / Last Month):** Git logs not found
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** Git logs not found
- **Top Contributors:** Git logs not found


## Overview
This script is a PHP class model named "Fee_Model" which handles all data related to fees within the session database. It's functions are designed to manage the fees, handle and validate interactions with the Tally database, and manage various installments for financial years.

Below is an explanation of the key functions of this model, along with any noteworthy data read/write operations and possible risks.

## Fee_Model#__construct

This function constructs the base class and initializes the database connection.

```php
public function __construct()
{
    parent::__construct();
    $this-> load ->database();
}
```

## Fee_Model#set_sch_db

This function sets `$current_sch_db` with the given `$session_school_id` by calling `School_model`'s `fetch_school_db` method. This method accepts a single parameter:
    
- `$session_school_id`: The ID of the session's school.

```php
public function set_sch_db($session_school_id)
{
    $CI =& get_instance();
    $CI->load->model('common/School_model');
    $this->current_sch_db = $CI-> School_model ->fetch_school_db($session_school_id);
}
```

## Fee_Model#get_computed_continuity_class

This function is responsible for computing the continuity class for a student and returns an array containing the `computed_class` and a `next_class_flag`. The method accepts the following parameters:

- `$ref_no`: The reference number of the student.
- `$selected_year`: The selected academic year.
- `$actual_running_year`: The actual running year.
- `$env_db_name`: The database name of the environment.
- `$session_school_id`: The ID of the session's school.

### Risks

1. **Bugs**: This function is quite long and complex, which increases the risk of potential bugs in its logic.
2. **Code Duplication**: There's a significant level of code duplication present within the function, especially when dealing with nested conditions, which could be reduced by creating smaller helper functions.

## Fee_Model#save_tally

This function saves transaction details to the Tally database.

It accepts three parameters:

- `$data_type`: The data type of the Tally transaction.
- `$tally_data`: An array containing the Tally data to be saved.
- `$xml_string`: The XML string of the Tally transaction.
- `$session_school_id`: The school ID associated with the session.

## Fee_Model#fetch_tally_xml

This function fetches transaction details from the Tally database.

It accepts six parameters:

- `$data_type`: The data type of the Tally transaction.
- `$last_received_token`: The last received token of the transaction.
- `$download_from_last`: Specifies whether to download from last token or not.
- `$class_category`: The class category for the transaction.
- `$school_id`: The school ID associated with the transaction.
- `$institute_id`: The institute ID associated with the transaction.
- `$session_school_id`: The school ID associated with the session.

## Fee_Model#get_yearly_heads

This function returns the full year fees for specific financial year for a given student.

It takes four parameters:

- `$ref_no`: The reference number of the student.
- `$session_school_id`: The school ID associated with the session.
- `$financial_year`: The financial year in question.
- `$fee_flag`: This flag is used to distinguish between FEES and DEPO data.

## Fee_Model#refno_installment_details

This function fetches all installments details for the respective financial year for a student.

It accepts six parameters:

- `$ref_no`: The reference number of the student.
- `$financial_year`: The current financial year.
- `$school_id`: The school ID associated with the transaction.
- `$institute_id`: The institute ID associated with the transaction.
- `$session_sch_id`: The school ID associated with the session.

## Risks

### Security Issues

1. **SQL Injection**: This model uses plain concatenated SQL queries and does not use proper prepared statements or parameterization, which might lead to potential SQL injection attacks.

### Bugs

1. **Lack of input validation**: There is a lack of input validation throughout the script which could potentially cause unexpected behavior or bugs when receiving unexpected input.

## Refactoring Opportunities

1. **Code Duplication**: There are several instances of code duplication throughout the script, mostly due to similar DB queries and conditions in multiple functions. Creating helper functions to handle these common operations can reduce code duplication and improve maintainability.
2. **SOLID Principles**: This model class violates the Single Responsibility Principle by performing too many operations related to both fees and transactions. Splitting these functionalities into separate classes can help maintain the separation of concerns.
3. **Input Validation**: The script could be improved by implementing input validation checks for parameters passed into functions to avoid unexpected behavior and ensure data integrity.
4. **SQL Queries**: The script could benefit from using prepared statements or parameterized queries to minimize the risk of SQL injection attacks.