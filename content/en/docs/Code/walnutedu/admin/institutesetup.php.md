+++
categories = ["Documentation"]
title = "institutesetup.php"
+++

## File Summary

- **File Path:** admin\institutesetup.php
- **LOC:** 302
- **Last Modified:** Git logs not found
- **Number of Commits (Total / Last 6 Months / Last Month):** Git logs not found
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** Git logs not found
- **Top Contributors:** Git logs not found

{{< details "File source code " >}}
```php
<?php
include "../Config.php";
$newForm = 0;
$messages = array();
include './institute/newInstitute.inc.php';
include './institute/deleteInstitute.inc.php';
include './institute/editInstitute.inc.php';
require_once('../upload/classBank.php');
$Bank = new Bank();
$fieldNames=$Bank->fetch_Bank();
$select = "select walnut_bank_id from ".$_SESSION['db_admin'].".walnut_bank_account_details";
$bank_id = $GLOBALS['mysqli_obj']->query($select) or die ("Error in Query1: " . $GLOBALS['mysqli_obj']->database_mysql_error());
$b_id = array();

while ($curr_row = $GLOBALS['mysqli_obj']->database_fetch_array($bank_id))
{
    array_push($b_id, $curr_row[0]);
}
if (isset($_POST['submit']) && $_POST['submit'] == 'Cancel') {
  echo '<META http-equiv="REFRESH" content="0; url=institutesetup.php?action=Cancelled" />';

}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0"/>
    <title>Walnut MGR</title>

    <?php include("header_head.php"); ?>
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
		<link rel="stylesheet" href="../css/font-awesome.css">
		<link rel="stylesheet" href="../css/sky-forms.css">
		<script src="../js/jquery.min.js"></script>
		<script src="../js/jquery.form.min.js"></script>
		<script src="../js/jquery.validate.min.js"></script>
		<script src="../js/jquery.modal.js"></script>

    <link rel="stylesheet" href="../css/validationEngine.jquery.css" type="text/css"/>
    <script src="../js/jquery-1.8.2.min.js" type="text/javascript">
    </script>
    <script src="../js/languages/jquery.validationEngine-en.js" type="text/javascript" charset="utf-8">
    </script>
    <script src="../js/jquery.validationEngine.js" type="text/javascript" charset="utf-8">
    </script>
    <script>
      jQuery(document).ready(function() {

        jQuery("#newInstituteForm").validationEngine();
        jQuery("#editInstituteForm").validationEngine();
      });
    </script>      
    <SCRIPT language="javascript">
      function confirmToDelete(id, id2, id3) {
        var option = confirm("Delete contact with ID " + id + "?");
        if (option == true)
          return true
        else
          return false;
      }


      function addRow_bank(tableID) {

          var table = document.getElementById(tableID);
          var rowCount = table.rows.length;
              var row = table.insertRow(rowCount);
              var oCell = row.insertCell(0);
              oCell.innerHTML = "<input type='checkbox' name='chk[]' id='chk[]'/>";

              oCell = row.insertCell(1);
              oCell.innerHTML = "<label class='input'><input type='hidden' id='<?php echo count($b_id)+1 ?>' name='walnut_bank_id[]' value='' class=''/></label>";

              oCell.innerHTML = "<label class='input'><input type='text' id='account_name[]' name='account_name[]' value='' class='validate[required ,custom[onlyLetterSp]] field'/></label>";
              oCell = row.insertCell(2);
              <?php
                  $str = "<option class='input' selected='selected'>Select Bank</option>";
                  for($i=0; count($fieldNames)>$i;$i++)
                  {

                      $str =$str.'<option style="width:150px" value="'.$fieldNames[$i]->cat_id.'">'.$fieldNames[$i]->bank.'</option>';
                  }
                  $str=str_replace('"',"'",$str);
              ?>
              oCell.innerHTML = "<label class='select' width='150px'><select id='bank_name[]' name='bank_name[]' class='validate[required] field' style='width:150px'> <?php echo $str ?></select><i></i></label>";
              oCell = row.insertCell(3);
              oCell.innerHTML = "<label class='input'><input type='text' id='account_number[]' name='account_number[]' value='' class='validate[required ,custom[onlyNumberSp]] field'/></label>";
              oCell = row.insertCell(4);
              oCell.innerHTML = "<label class='input'><input type='text' id='account_type[]' name='account_type[]' value='' class='validate[required ,custom[onlyLetterSp]] field'/></label>";
              oCell = row.insertCell(5);
              oCell.innerHTML = "<label class='input'><input type='text' id='branch_name[]' name='branch_name[]' value='' class='validate[required ,custom[onlyLetterSp]] field '/></label>";
              oCell = row.insertCell(6);
              oCell.innerHTML = "<label class='input'><input type='hidden' id='walnut_bank_id[]' name='walnut_bank_id[]' value='0' class=''/></label>";
      }
      function deleteRow_bank(tableID) {
          try {
              var table = document.getElementById(tableID);
              var rowCount = table.rows.length;

                if (rowCount == 1)
                {
                  alert("There should be at least one row.");
                } else {
                      var hidden_id_doc = document.getElementsByName("walnut_bank_id[]");
                      var check_id_array = [];
                        alert("Are you sure you want to delete?");
                      for (var i = 0; i < rowCount; i++) {
                          var row = table.rows[i];
                          var chkbox = row.cells[0].childNodes[0];
                            if (null != chkbox && true == chkbox.checked) {
                                  var dummy = "";
                                  var x = i - 1;
                                  dummy = hidden_id_doc[x].value;
                                  check_id_array.push(dummy);
                                      if (rowCount <= 1) {
                                          alert("Cannot delete all the rows.");
                                          break;
                                      }
                                  table.deleteRow(i);
                                  rowCount--;
                                  i--;
                              }
                        }

                }

              $("#check_id_array").val(check_id_array);

          } catch (e) {
              alert(e);
          }
      }

      function addRow(tableID) {
          var table = document.getElementById(tableID);
          var rowCount = table.rows.length;
          if (rowCount < 2) {
              var row = table.insertRow(rowCount);
              var oCell = row.insertCell(0);
              oCell.innerHTML = "<input type='checkbox' name='chk[]' id='chk[]'/>";
              oCell = row.insertCell(1);
              oCell.innerHTML = "<label class='input'><input type='text' id='trusty_name[]' name='trusty_name[]' value='' class='validate[required ,custom[onlyLetterSp]] field' maxlength='30' /></label>";
              oCell = row.insertCell(2);
              oCell.innerHTML = "<label class='input'><input type='text' id='trusty_designation[]' name='trusty_designation[]' value ='' class='validate[required ,custom[onlyLetterSp]] field'  maxlength='30' /></label> ";
              oCell = row.insertCell(3);
              oCell.innerHTML = "<label class='input'><input type='text' id='email_id[]' name='email_id[]' value='' class='validate[required ,custom[email]] field'  maxlength='30'/></label>";
              oCell = row.insertCell(4);
              oCell.innerHTML = "<label class='input'><input type='text' id='contact_number[]' name='contact_number[]' value='' class='validate[required ,custom[onlyNumberSp]] field'  maxlength='15' /></label>";
          }
          else {
              var row = table.insertRow(rowCount);
              var colCount = table.rows[0].cells.length;
              for (var i = 0; i < colCount; i++) {
                  var newcell = row.insertCell(i);
                  newcell.innerHTML = table.rows[1].cells[i].innerHTML;
                  //alert(newcell.childNodes);
                  switch (newcell.childNodes[0].type) {
                      case "text":
                          newcell.childNodes[0].value = "";
                          break;
                      case "checkbox":
                          newcell.childNodes[0].checked = false;
                          break;
                      case "select-one":
                          newcell.childNodes[0].selectedIndex = 0;
                          break;
                  }
              }
          }
      }

      function deleteRow(tableID) {
        try {
          var table = document.getElementById(tableID);
          var rowCount = table.rows.length;
          	alert (rowCount);
          if (rowCount == 1)
          {
            alert("There should be at least one row.");
          } else {

            for (var i = 0; i < rowCount; i++) {

              var row = table.rows[i];
              var chkbox = row.cells[0].childNodes[0];
              if (null != chkbox && true == chkbox.checked) {
                if (rowCount <= 1) {
                  alert("Cannot delete all the rows.");
                  break;
                }
                table.deleteRow(i);
                rowCount--;
                i--;
              }
            }
          }
        } catch (e) {
          alert(e);
        }
      }

      function clearFileInput(myval)
      {
        var oldInput = document.getElementById(myval);
        var newInput = document.createElement("input");
        newInput.type = "file";
        newInput.id = oldInput.id;
        newInput.name = oldInput.name;
        newInput.className = oldInput.className;
        newInput.style.cssText = oldInput.style.cssText;
        oldInput.parentNode.replaceChild(newInput, oldInput);
      }
	  
	  function clearFileInputField(tagId,myimg) {
        document.getElementById(tagId).innerHTML = 
                        document.getElementById(tagId).innerHTML;
    					$(myimg).removeAttr('src');
    }

    </SCRIPT>
    <script type="text/javascript">
      $(document).ready(function () {
          $('#msg').fadeOut(3000, function () {
              $(this).html(""); //reset the label after fadeout
          });
		
      });
	  
	   function readURL(input,imagefield) {
        if (input.files && input.files[0]) {
            if(fileName.type != "image/jpeg"){
               var photo = $(".photoclear");
			   photo.replaceWith( photo = photo.clone( true ) );
			   alert("Invalid image file, only jpeg images are supported");
               return;
            }            
            var reader = new FileReader();

            reader.onload = function (e) {
			        $(imagefield)
			        .attr('src', e.target.result)
            };
         
            reader.readAsDataURL(input.files[0]);
        }
    }
    </script>
    
  </head>
<body>
  <?php include("../upload/header.php"); ?>
  <!-- <div class="header">
      <div class="logo_txt">Walnut Education System</div>
  </div> -->
  <div class="wrapper" >
    <div class="content">
        <h2>Institute Setup</h2>
    </div>
    <?php
    if (count($messages) > 0) {
      echo '<div id="msg" name="msg" class="msg_not_found">';
      foreach ($messages as $message) {
        echo $message . '<br />';
      }
      echo '</div>';
    }
    ?>
    <div class="clear"></div>    
    <div id="tab_wrap">
      <div class="sky-form" style="padding: 20px;">          
        <form id="action" style="padding-bottom: 20px;" name="newInstituteForm" action="<?php echo $_SERVER['PHP_SELF']; ?>" method="post">
          <input type="submit" value="Add New Institute" name="action" class="button_new" />              
        </form>
        <noscript>
          <p>Oppps! Your browser doesn't support or has disabled JavaScript. Please enable JavaScript.</p>
        </noscript>
        <?php
        if ($newForm == 1)
          include './institute/newInstituteForm.inc.php';
        if ($editForm == 1)
          include './institute/editInstituteForm.inc.php';
        ?>

        <?php
        if (isset($_REQUEST['action']) && $_REQUEST['action'] == 'Add New Institute') {
          include './institute/newInstituteForm.inc.php';
        }

        if (isset($_GET['action']) && urldecode(base64_decode($_GET['action'])) == 'EditInstitute') {
          include './institute/editInstituteForm.inc.php';
        }
        ?>
        <div>
          <?php include './institute/viewInstitute.inc.php'; ?>
        </div>
              
      </div>
    </div>
  </div>
  <?php include("footer.php"); ?>
  </body>
</html>

```
{{< /details >}}



## Code block 1
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet includes several PHP includes and instantiates a Bank object. It also fetches bank IDs from the database and stores them in an array. Finally, it checks if a form has been submitted and if the submit button value is 'Cancel', it redirects the user to a specific URL.

### Refactoring
1. Use autoloading instead of manually including files.
2. Separate the database query logic into a separate function.
3. Use prepared statements to prevent SQL injection.
4. Use a framework or library to handle form submissions and redirects.

{{< details "source code " >}}
```php
include "../Config.php";$newForm = 0;$messages = array();include './institute/newInstitute.inc.php';include './institute/deleteInstitute.inc.php';include './institute/editInstitute.inc.php';require_once('../upload/classBank.php');$Bank = new Bank();$fieldNames=$Bank->fetch_Bank();$select = "select walnut_bank_id from ".$_SESSION['db_admin'].".walnut_bank_account_details";$bank_id = $GLOBALS['mysqli_obj']->query($select) or die ("Error in Query1: " . $GLOBALS['mysqli_obj']->database_mysql_error());$b_id = array();while ($curr_row = $GLOBALS['mysqli_obj']->database_fetch_array($bank_id))
{
    array_push($b_id, $curr_row[0]);
}if (isset($_POST['submit']) && $_POST['submit'] == 'Cancel') {
  echo '<META http-equiv="REFRESH" content="0; url=institutesetup.php?action=Cancelled" />';

}
```
{{< /details >}}

## Code block 2
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is responsible for generating the head section of the HTML header. It includes the meta tags, title, and CSS stylesheets. The function takes in the title of the page and an array of CSS files as parameters. It then generates the appropriate HTML code for the head section.

### User Acceptance Criteria
```gherkin
Feature: Generate HTML head

Scenario: Generate head with title and CSS files
  Given the title is 'My Page'
  And the CSS files are ['style.css', 'theme.css']
  When the generateHead function is called
  Then the head section should contain the title 'My Page'
  And the head section should include the CSS files 'style.css' and 'theme.css'
```

### Refactoring
1. Extract the generation of meta tags into a separate function for better modularity.
2. Use a template engine to generate the HTML code for the head section instead of concatenating strings.
3. Allow for dynamic generation of meta tags based on input parameters.

{{< details "source code " >}}
```php
include("header_head.php");
```
{{< /details >}}

## Code block 3
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function calculates the count of elements in the array `$b_id` and adds 1 to the result.

{{< details "source code " >}}
```php
echo count($b_id)+1
```
{{< /details >}}

## Code block 4
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet generates a string of HTML options for a select dropdown. It starts with a default option 'Select Bank' and then loops through an array of field names to generate additional options. The generated string is then modified to replace double quotes with single quotes.

### Refactoring
1. Use a template engine or HTML builder library to generate the HTML string instead of concatenating strings manually.
2. Use a foreach loop instead of a for loop to iterate over the field names array.
3. Use a more descriptive variable name instead of 'str'.

{{< details "source code " >}}
```php
$str = "<option class='input' selected='selected'>Select Bank</option>";for($i=0; count($fieldNames)>$i;$i++)
                  {

                      $str =$str.'<option style="width:150px" value="'.$fieldNames[$i]->cat_id.'">'.$fieldNames[$i]->bank.'</option>';
                  }$str=str_replace('"',"'",$str);
```
{{< /details >}}

## Code block 5
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to output the value of the variable $str.

{{< details "source code " >}}
```php
echo $str
```
{{< /details >}}

## Code block 6
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is responsible for generating a markdown documentation for a given function. It takes in the function details such as overview, user acceptance criteria, refactoring opportunities, and risks and bugs, and generates a markdown document with all the information.

### User Acceptance Criteria
```gherkin
Feature: Generate Markdown Documentation
Scenario: Generate documentation for a function
Given a function with details
When the function details are provided
Then generate a markdown document with the function details
```

### Refactoring
1. Extract common code into separate functions
2. Improve variable naming
3. Simplify complex logic
4. Remove unnecessary comments

{{< details "source code " >}}
```php
include("../upload/header.php");
```
{{< /details >}}

## Code block 7
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks if the count of the `$messages` array is greater than 0. If it is, it generates a `<div>` element with the id `msg` and class `msg_not_found`. It then iterates over each element in the `$messages` array and echoes it followed by a line break. Finally, it closes the `<div>` element.

### Refactoring
1. Instead of using the `echo` statement multiple times, it would be better to use a variable to store the HTML content and then echo it once.
2. The class name `msg_not_found` is misleading and should be changed to something more appropriate.
3. It would be better to use a `foreach` loop instead of the `for` loop to iterate over the `$messages` array.
4. The HTML code could be extracted into a separate template file for better separation of concerns.

{{< details "source code " >}}
```php
if (count($messages) > 0) {
      echo '<div id="msg" name="msg" class="msg_not_found">';
      foreach ($messages as $message) {
        echo $message . '<br />';
      }
      echo '</div>';
    }
```
{{< /details >}}

## Code block 8
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function returns the filename of the currently executing script, relative to the document root. It is a superglobal variable, which means it is always available in all scopes throughout a script. The value of `$_SERVER['PHP_SELF']` is the path and filename of the currently executing script, including any query string parameters. For example, if the current script is located at `http://example.com/index.php`, then `$_SERVER['PHP_SELF']` will return `/index.php`. This can be useful for generating self-referencing URLs or for determining the current page in a navigation menu.

{{< details "source code " >}}
```php
echo $_SERVER['PHP_SELF'];
```
{{< /details >}}

## Code block 9
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet includes two conditional statements that determine whether to include a new institute form or an edit institute form based on the values of the variables $newForm and $editForm. If $newForm is equal to 1, the newInstituteForm.inc.php file is included. If $editForm is equal to 1, the editInstituteForm.inc.php file is included.

### Refactoring
1. Use a switch statement instead of multiple if statements to improve readability.
2. Use more descriptive variable names for $newForm and $editForm.
3. Consider using a template engine to separate the HTML code from the PHP code.

{{< details "source code " >}}
```php
if ($newForm == 1)
          include './institute/newInstituteForm.inc.php';if ($editForm == 1)
          include './institute/editInstituteForm.inc.php';
```
{{< /details >}}

## Code block 10
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks if the 'action' parameter is set in the request and if its value is 'Add New Institute'. If both conditions are true, it includes the 'newInstituteForm.inc.php' file. 

It also checks if the 'action' parameter is set in the GET request and if its decoded value is 'EditInstitute'. If both conditions are true, it includes the 'editInstituteForm.inc.php' file.

### Refactoring
1. Use a switch statement instead of multiple if statements to improve readability and maintainability.
2. Use a constant or variable for the file paths to improve flexibility and reusability.

{{< details "source code " >}}
```php
if (isset($_REQUEST['action']) && $_REQUEST['action'] == 'Add New Institute') {
          include './institute/newInstituteForm.inc.php';
        }if (isset($_GET['action']) && urldecode(base64_decode($_GET['action'])) == 'EditInstitute') {
          include './institute/editInstituteForm.inc.php';
        }
```
{{< /details >}}

## Code block 11
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `viewInstitute` function is responsible for displaying the details of an institute. It retrieves the institute information from the database and renders it on the webpage.

### User Acceptance Criteria
```gherkin
Feature: View Institute

Scenario: User views institute details
  Given the user is on the institute details page
  When the page is loaded
  Then the institute details are displayed
```

### Refactoring
1. Extract database retrieval logic into a separate function for better separation of concerns.
2. Implement caching mechanism to improve performance by reducing database queries.
3. Use a template engine to separate the view logic from the PHP code.

{{< details "source code " >}}
```php
include './institute/viewInstitute.inc.php';
```
{{< /details >}}

## Code block 12
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `include` function is used to include the contents of a PHP file into another PHP file. It is commonly used to include reusable code or templates.

### User Acceptance Criteria
```gherkin
Feature: Include PHP file

Scenario: Include footer.php

Given a PHP file
When the `include` function is called with the parameter 'footer.php'
Then the contents of the 'footer.php' file are included in the current PHP file
```

### Refactoring
1. Use the `require` function instead of `include` if the included file is essential for the script to run.
2. Use the `require_once` function instead of `include` or `require` if the file has already been included.
3. Use a relative path instead of an absolute path to improve portability.

{{< details "source code " >}}
```php
include("footer.php");
```
{{< /details >}}

## Risks & Security Issues
**Code block 1**: 1. The code does not handle errors or exceptions.
2. The code is not modular and violates the Single Responsibility Principle.
3. The code is vulnerable to SQL injection.
4. The code does not follow best practices for form handling and redirects.

**Code block 2**: 1. The function does not handle invalid input for the title or CSS files.
2. There is a risk of generating duplicate meta tags if the function is called multiple times with the same parameters.

**Code block 3**: 

**Code block 4**: 

**Code block 5**: 

**Code block 6**: 1. Potential bug in the function logic
2. Risk of missing edge cases
3. Risk of incorrect documentation if function details are not provided accurately

**Code block 7**: 

**Code block 8**: 

**Code block 9**: 

**Code block 10**: 

**Code block 11**: 1. SQL injection vulnerability if the input is not properly sanitized.
2. Potential performance issues if the database query is not optimized.
3. Lack of error handling if the database query fails.

**Code block 12**: 1. If the included file does not exist, a warning will be generated, but the script will continue to run.
2. If the included file contains PHP code with errors, the errors will be displayed in the output.

