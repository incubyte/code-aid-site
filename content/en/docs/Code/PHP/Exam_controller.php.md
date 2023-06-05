+++
categories = ["Documentation"]
title = "Exam_controller.php"
+++

## Overview

The `Exam_controller` is a class that extends from `CI_Controller` and is responsible for managing Exam Marks and Exam metadata.

## Functions Overview

1. `__construct` - The constructor function initializes the necessary libraries, models, and helpers.
2. `index` - This function displays Exam Marks data based on class, division, and unit ID.
3. `show_metadata` - Displays the exam setup and metadata for the selected class, unit and academic year.
4. `import_primary` - Imports CSV files containing primary exam data into the system.

## Function Details

### 1. Constructor

This method initializes the necessary libraries, models, and helpers required for this controller. It sets the default time zone, checks if the user is logged in and loads the necessary models.

### 2. Index

This function is responsible for displaying and managing Exam Marks based on class, division, and unit ID.

It gets the class data and stores it in the `$returned_class_data` variable. The variable `$fetch_data`, `$refno_enable`, and `$all_data` variables are assigned default values.

The function checks whether the request contains class_id_exam, division_id_exam, and unit_id_exam. If yes, it sets relevant variables and changes the value of `$fetch_data` to `TRUE`.

The function then fetches the class, division, and unit data with the appropriate model functions. It gets exam data, refnos (reference numbers) and marks data using the `Exam_model`. It also checks if there is any null data in the fetched data.

To load the views, it sets the main content array and loads the `view_exam_marks` view. 

### 3. show_metadata

This function is responsible for displaying the exam setup and metadata for the selected class, unit, and the academic year.

It retrieves class, unit, and exam type data from the database and stores them in appropriate variables. The function checks multiple conditions (related to the $_REQUEST variables) to determine how it should fetch and display the data. Depending on the conditions, it fetches metadata for primary, KG, or remarks setup.

The main content array is set with the `view_exam_metadata` view and passed to the main_template view.

### 4. import_primary

This function handles the uploading of CSV files containing primary exam data and imports the data into the system. It first checks the filetype and size of the file to ensure it's a CSV file and not empty. If the file is valid, it reads the contents of the CSV file, line by line, and uses the extracted data to create arrays that will be inserted into the database. If the importing process is successful, a confirmation message is displayed and the user is redirected back to the exam metadata page.

## Risks

### Security Issues

1. Validation of user inputs is not enough. It is essential to include proper validation of user inputs to prevent any unwanted data from being entered into the system.

### Bugs

1. Errors like "Error in inserting/updating data" are directly printed on the screen instead of being logged or handled properly by informing the user with a more meaningful message.

## Refactoring Opportunities

1. Remove code duplication - The same lines of code are repeated multiple times in the same function or across different functions. This can be solved by using helper functions or class methods to encapsulate the repetitive code.

2. Better variable naming - Some variable names are unclear or ambiguous. Better naming should be employed to make the code more readable.

3. Use of constants instead of hard-coded values - Some strings and numbers are used directly in the code, instead of using constants. Using constants will make the code more maintainable.

4. Logging/debugging statements are printed directly - These should be handled better by using logging functions and providing a more user-friendly message.