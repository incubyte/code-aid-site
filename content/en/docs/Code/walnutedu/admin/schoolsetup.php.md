+++
categories = ["Documentation"]
title = "schoolsetup.php"
+++

## File Summary

- **File Path:** admin\schoolsetup.php
- **LOC:** 301
- **Last Modified:** Git logs not found
- **Number of Commits (Total / Last 6 Months / Last Month):** Git logs not found
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** Git logs not found
- **Top Contributors:** Git logs not found

{{< details "File source code " >}}
```php
<?php
include_once("../Config.php");
$newForm = 0;
$messages = array();
include './school/newSchool.inc.php';
include './school/deleteSchool.inc.php';
include './school/editSchool.inc.php';
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

if(isset($_POST['submit']) && $_POST['submit'] == 'Cancel'){
    echo '<META http-equiv="REFRESH" content="0; url=schoolsetup.php?action=Cancelled" />';
}
?>


<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0"/>
<title>Walnut MGR</title>
<?php include("header_head.php"); ?>
<link rel="stylesheet" type="text/css" href="../css/style.css" />
<!--<link rel="stylesheet" href="css/demo.css">-->
		<link rel="stylesheet" href="../css/font-awesome.css">
		<link rel="stylesheet" href="../css/sky-forms.css">
		<!--[if lt IE 9]>
			<link rel="stylesheet" href="css/sky-forms-ie8.css">
		<![endif]-->		
		<script src="../js/jquery.min.js"></script>
		<script src="../js/jquery.form.min.js"></script>
		<script src="../js/jquery.validate.min.js"></script>
		<script src="../js/jquery.modal.js"></script>
    <link rel="stylesheet" href="../css/validationEngine.jquery.css" type="text/css"/>
	<!--<link rel="stylesheet" href="../css/template.css" type="text/css"/> -->
	<script src="../js/jquery-1.8.2.min.js" type="text/javascript">
	</script>
	<script src="../js/languages/jquery.validationEngine-en.js" type="text/javascript" charset="utf-8">
	</script>
	<script src="../js/jquery.validationEngine.js" type="text/javascript" charset="utf-8">
	</script>
	<script>
		jQuery(document).ready(function(){
	
			jQuery("#schoolForm").validationEngine('attach',{
  			onValidationComplete: function(form, status){ 
          if (status == true) {
  					return true;
    			}
  			}
			});
		});
	</script>
    <script>
	function confirmToDelete(id, id2, id3) {
    var option=confirm("Delete School  " + id + "?");
    if (option == true) return true
    else return false;
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
    // copy any other relevant attributes 
     
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
			       $('#loadingimg1').css("display","none");
          });

          $('#save_btn').click(function()
          {
            $('#loadingimg1').css("display","");
            $('#save_btn').css("display","none");
            $('#skipbutton').css("display","none");
          });
      });


	  
	   function readURL(input,imagefield) {
		
		 // alert(imagefield);
        if (input.files && input.files[0]) {
    		// * Issue No.: RQ065 - Walnut School Project - Date Fixed: 04-06-2015 *
            var fileName = input.files[0];
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
                   //.width(150)
                   //.height(150);
            };
         
            reader.readAsDataURL(input.files[0]);
        }
    }
      function addRow_bank(tableID) {

          var table = document.getElementById(tableID);
          var rowCount = table.rows.length;
          var row = table.insertRow(rowCount);
          var oCell = row.insertCell(0);
          oCell.innerHTML = "<input type='checkbox' name='chk[]' id='chk[]'/>";

          oCell = row.insertCell(1);
          oCell.innerHTML = "<label class='input'><input type='hidden' id='<?php echo count($b_id)+1 ?>' name='walnut_bank_id[]' value='' class='' /></label>";

          oCell.innerHTML = "<label class='input'><input type='text' id='account_name[]' name='account_name[]' value='' class='validate[required ,custom[onlyLetterSp]] field'/></label>";
          oCell = row.insertCell(2);
          <?php
              $str = "<option selected='selected'>Select Bank</option>";
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
          oCell.innerHTML = "<label class='input'><input type='hidden' id='walnut_bank_id[]' name='walnut_bank_id[]' value='0' class='' /></label>";
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

      function save_form(){
      alert("asd");
        $('#loadingimg1').show();
        alert("asd");
      }


    </script>
        
 </head>

<body>


<?php include("../upload/header.php");
if(isset($_GET['sch_ins_id']))
$sch_ins_id = (isset($_GET['sch_ins_id'])) ? (trim(urldecode(base64_decode($_GET['sch_ins_id']))) ) : '';
// echo $sch_ins_id;

if(isset($_POST['sch_ins_id']))
$sch_ins_id = (isset($_POST['sch_ins_id'])) ? (trim($_POST['sch_ins_id'])) : '';
?>
<div class="header">	
</div><!--.header end-->

<div class="wrapper">	
      <div class="content">
        <h2>School Setup</h2> 
      </div>  
  <?php
            if (count($messages) > 0) {
              echo '<div id="msg" name="msg" class="msg_not_found" style="height:10px;">';
              foreach ($messages as $message) {
                echo $message . '<br />';
              }
              echo '</div>';
            }
            ?>
  
<div class="clear"></div>
<div id="tab_wrap">
         <div class="sky-form" style="padding: 20px;">
                <section>
                  <form id="action" name="newSchoolForm" action="<?php echo $_SERVER['PHP_SELF']; ?>" method="POST">
                        <input type="hidden" name="sch_ins_id" id="sch_ins_id" value="<?php echo $sch_ins_id; ?>" />
                        <div style="    text-align: center;">
                        <input type="submit" value="Add New School" name="action" class="button_new" style="float:left"/>
						
                        <a href="institutesetup.php" class="button" style="text-decoration: none; margin: 0px;">Back To Institute</a>
						
						</div>
                    </form>
                    <noscript>
                        <p>Oppps! Your browser doesn't support or has disabled JavaScript. Please enable JavaScript.</p>
                    </noscript>
                </section>
                <?php
             /*   if(count($messages) > 0) {
                    echo '<section id="message"><p>';
                    foreach($messages as $message) {
                        echo $message.'<br />';
                    }
                    echo '</p></section>';
                } */
                
              //  if($newForm == 1) include './school/newSchoolForm.inc.php';
              //  if($editForm == 1) include './school/editSchoolForm.inc.php';
                ?>
                
                <?php
              if(isset($_REQUEST['action']) && ( $_REQUEST['action']== 'Add New School' || urldecode(base64_decode($_REQUEST['action']))== 'Add New School')) {
				
                    include './school/newSchoolForm.inc.php';
                }
             //  echo urldecode(base64_decode($_REQUEST['action']));
			   if(isset($_REQUEST['action']) && ( $_REQUEST['action']== 'Edit' || urldecode(base64_decode($_REQUEST['action']))== 'Edit')) {
				
               // if(isset($_REQUEST['action']) && ($_REQUEST['action'] ) == 'Edit' || urldecode(base64_decode($_REQUEST['action']))== 'Edit')) {
				
                    include './school/editSchoolForm.inc.php';
                }
                ?>
                <section>
                    <?php include './school/viewSchool.inc.php';?>
                </section>
            </div>
    
   <!-- <div id="tab_wrap1"><input type="reset" name="reset" id="reset" value="Reset" class="btn1" />&nbsp;&nbsp;<input type="submit" name="submit" id="submit" value="Submit" class="btn1"/> --> 
<!--    <div id="main">
             
    </div>-->
</div>
</div><!--wrapper end-->


</html>

```
{{< /details >}}



## Code block 1
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet includes several PHP statements and functions. It starts by including the 'Config.php' file, setting the value of the variable 'newForm' to 0, and initializing an empty array called 'messages'. Then, it includes three PHP files: 'newSchool.inc.php', 'deleteSchool.inc.php', and 'editSchool.inc.php'. After that, it requires the 'classBank.php' file and creates an instance of the 'Bank' class. It fetches the bank names using the 'fetch_Bank' method of the 'Bank' class and assigns the result to the 'fieldNames' variable. It then executes a SQL query to select the 'walnut_bank_id' from the 'walnut_bank_account_details' table and stores the result in the 'bank_id' variable. Finally, it loops through the 'bank_id' result and adds each value to the 'b_id' array. If the 'submit' POST variable is set and its value is 'Cancel', it redirects the user to the 'schoolsetup.php' page with the 'action' parameter set to 'Cancelled'.

{{< details "source code " >}}
```php
include_once("../Config.php");$newForm = 0;$messages = array();include './school/newSchool.inc.php';include './school/deleteSchool.inc.php';include './school/editSchool.inc.php';require_once('../upload/classBank.php');$Bank = new Bank();$fieldNames=$Bank->fetch_Bank();$select = "select walnut_bank_id from ".$_SESSION['db_admin'].".walnut_bank_account_details";$bank_id = $GLOBALS['mysqli_obj']->query($select) or die ("Error in Query1: " . $GLOBALS['mysqli_obj']->database_mysql_error());$b_id = array();while ($curr_row = $GLOBALS['mysqli_obj']->database_fetch_array($bank_id))
{
    array_push($b_id, $curr_row[0]);
}if(isset($_POST['submit']) && $_POST['submit'] == 'Cancel'){
    echo '<META http-equiv="REFRESH" content="0; url=schoolsetup.php?action=Cancelled" />';
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
This code snippet generates a string of HTML options for a dropdown select element. It starts with a default option 'Select Bank' that is selected by default. Then, it iterates over an array of field names and appends an option element for each field name. The value of each option is set to the corresponding category ID, and the text of each option is set to the bank name. Finally, it replaces any double quotes in the string with single quotes.

### Refactoring
1. Use a template engine or HTML builder library to generate the HTML string instead of concatenating strings manually.
2. Separate the logic for generating the options into a separate function for better modularity and testability.
3. Consider using a more descriptive variable name instead of 'str' to improve code readability.

{{< details "source code " >}}
```php
$str = "<option selected='selected'>Select Bank</option>";for($i=0; count($fieldNames)>$i;$i++)
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
This code snippet checks if the `sch_ins_id` parameter is set in the URL or in the POST data. If it is set, it assigns the value to the `$sch_ins_id` variable. The value is decoded from base64 if it is set in the URL. This code is commonly used in PHP scripts to retrieve and process data from the URL or form submissions.

### Refactoring
1. Use a consistent naming convention for variables.
2. Use a ternary operator to assign the value to the variable in a more concise way.
3. Consider using a framework or library that provides built-in functions for handling URL parameters and form submissions.

{{< details "source code " >}}
```php
include("../upload/header.php");if(isset($_GET['sch_ins_id']))
$sch_ins_id = (isset($_GET['sch_ins_id'])) ? (trim(urldecode(base64_decode($_GET['sch_ins_id']))) ) : '';if(isset($_POST['sch_ins_id']))
$sch_ins_id = (isset($_POST['sch_ins_id'])) ? (trim($_POST['sch_ins_id'])) : '';
```
{{< /details >}}

## Code block 7
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks if the count of the array $messages is greater than 0. If it is, it generates a div element with the id 'msg' and class 'msg_not_found'. It then iterates over each element in the $messages array and echoes it followed by a line break. Finally, it closes the div element.

### Refactoring
1. Instead of using inline styles, it is recommended to use CSS classes for styling.
2. The use of the 'echo' statement inside the loop can be replaced with a more efficient approach, such as using the 'implode' function to concatenate the messages and then echoing the result once.
3. The div element can be generated using HTML templates or a templating engine for better separation of concerns.

{{< details "source code " >}}
```php
if (count($messages) > 0) {
              echo '<div id="msg" name="msg" class="msg_not_found" style="height:10px;">';
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
The variable `$sch_ins_id` is used to store the value of the `sch_ins_id` column from a database table. It is typically used in PHP code to retrieve and manipulate the value of the `sch_ins_id` column.

{{< details "source code " >}}
```php
echo $sch_ins_id;
```
{{< /details >}}

## Code block 10
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks if the 'action' parameter is set in the request and if it is equal to 'Add New School' or the decoded value of 'Add New School'. If the condition is true, it includes the 'newSchoolForm.inc.php' file. Then, it checks if the 'action' parameter is set in the request and if it is equal to 'Edit' or the decoded value of 'Edit'. If the condition is true, it includes the 'editSchoolForm.inc.php' file.

### Refactoring
1. Use a switch statement instead of multiple if statements.
2. Use a constant or variable for the 'action' values instead of hardcoding them multiple times.
3. Separate the logic for 'Add New School' and 'Edit' into separate functions or classes.

{{< details "source code " >}}
```php
if(isset($_REQUEST['action']) && ( $_REQUEST['action']== 'Add New School' || urldecode(base64_decode($_REQUEST['action']))== 'Add New School')) {
				
                    include './school/newSchoolForm.inc.php';
                }if(isset($_REQUEST['action']) && ( $_REQUEST['action']== 'Edit' || urldecode(base64_decode($_REQUEST['action']))== 'Edit')) {
				
               // if(isset($_REQUEST['action']) && ($_REQUEST['action'] ) == 'Edit' || urldecode(base64_decode($_REQUEST['action']))== 'Edit')) {
				
                    include './school/editSchoolForm.inc.php';
                }
```
{{< /details >}}

## Code block 11
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `viewSchool` function is responsible for displaying the details of a school. It retrieves the school information from the database and renders it on the webpage.

### User Acceptance Criteria
```gherkin
Feature: View School

Scenario: User views school details
  Given a school with ID 123
  When the user views the school details
  Then the school information is displayed on the webpage
```

### Refactoring
1. Extract the database retrieval logic into a separate function for reusability.
2. Implement caching mechanism to improve performance.
3. Use a template engine for rendering the school details.

{{< details "source code " >}}
```php
include './school/viewSchool.inc.php';
```
{{< /details >}}

## Risks & Security Issues
**Code block 1**: 

**Code block 2**: 1. The function does not handle invalid input for the title or CSS files.
2. There is a risk of generating duplicate meta tags if the function is called multiple times with the same parameters.

**Code block 3**: 

**Code block 4**: 1. The code assumes that the 'fieldNames' array is defined and contains objects with 'cat_id' and 'bank' properties. If this assumption is not met, the code will throw an error.
2. The code replaces all double quotes in the string with single quotes, which may unintentionally modify other parts of the string that should not be modified.

**Code block 5**: 

**Code block 6**: 1. The code does not validate or sanitize the value of `sch_ins_id`, which could lead to security vulnerabilities such as SQL injection.
2. The code assumes that the `sch_ins_id` parameter is always present in either the URL or the POST data, which may not always be the case.

**Code block 7**: 

**Code block 8**: 

**Code block 9**: 

**Code block 10**: 

**Code block 11**: 1. The function may throw an error if the database connection fails.
2. The function may not handle cases where the school ID is invalid or not found in the database.

