+++
categories = ["Documentation"]
title = "Missing_documents_controller.php"
+++

## File Summary

- **File Path:** application\controllers\common\Missing_documents_controller.php
- **LOC:** 312
- **Last Modified:** Git logs not found
- **Number of Commits (Total / Last 6 Months / Last Month):** Git logs not found
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** Git logs not found
- **Top Contributors:** Git logs not found

{{< details "File source code " >}}
```php
<?php
/**
 * Missing document - Controller
 *
 * search student data for missing certificates
 *
 * By Manali
 */
class Missing_documents_controller extends CI_Controller
{
    public function __construct()
	{
        parent::__construct();
        @session_start();
        date_default_timezone_set('Asia/Kolkata');
        Check_Access_helper::is_logged_in();
        $this -> load -> model('common/Student_model');
        $this->load->model('student/Student_find_model');
        $this->load->model('common/Class_division_model');
    }
    public function index()
	{
        $data['page_data']['page_name']        = 'Student List';
		$data['page_data']['page_icon']  	   = '';
		$data['page_data']['page_title']	   = 'Student List';
		$data['page_data']['page_date']  	   = date("d M Y");
		$data['page_data']['page_description'] = 'This is module that manages Student missing documents ';
        $data['page_data']['breadcrumb']    = '<li>Administrator</li>  <li class="active">Student Missing Documents</li>';

        //---- Get all Class data from all database ----//
        $class_data = $this -> Student_find_model -> get_class_data(NULL);
        if($class_data != NULL && $class_data != ''){
            $data['class_data'] = $class_data;
        }else{
            $data['class_data'] = NULL;
        }
        $data['division_rows'] = $this -> Class_division_model -> get_student_all_division_data();

        $document_returned_data = $this-> Student_model->get_all_document_setup_data();
        if($document_returned_data != NULL)
        {
            $data['document_data'] = $document_returned_data->result(); 
        }

        if((isset($_POST['sel_class_id']) && $_POST['sel_class_id'] != NULL))
        {
            $data['class_id']      = $this->input->post('sel_class_id');
            $data['class_id_array'] = explode(",",$data['class_id']);
            $data['class_data_array'] = array();
            for($a=0; $a< count($data ['class_id_array']); $a++){
                foreach ($class_data as $row_class){
                    if ($row_class['class_id'] == $data['class_id_array'][$a]){
                        $data['class_name'] = $row_class ['class_name'];
                        array_push($data['class_data_array'],$data['class_name']);
                    }
                }
            }
            $data['view_class_name'] =implode(",",$data['class_data_array']);
             
            $data['division_id']   = $this->input->post('sel_division_id');
            $data ['div_data']=  explode(",",$data['division_id']);
            
            $data['div_name_array'] = array();
            for($d=0; $d< count($data ['div_data']); $d++){
                foreach ($data['division_rows']->result() as $row_div){
                    if ($row_div -> division_id == $data ['div_data'][$d]){
                        $data['div_name']=  $row_div -> division_name ;
                        array_push($data['div_name_array'],$data['div_name']);
                    }
                }
            }
            $data['view_div_name'] = implode(",",$data['div_name_array']);
            $data['doc_status_array']= array();
            $status_array = array('1'=>'New student','2'=>'Current student','3'=>'Cancelled','4'=>'Not attending','6,7'=>'Defaulter');
            $data['status']        = $this->input->post('sel_status');
            $data ['status_data']=  explode(",",$data['status']);
            foreach ($status_array as $key => $status_val) 
            {
                for($stat=0;$stat< count($data ['status_data']);$stat++){

                    if ($data['status_data'][$stat] == '6')
                    {
                        $data['status_data'][$stat] = '6,7';
                    }
                    if($key == $data['status_data'][$stat]){
                        $doc_status= $status_val;
                        array_push($data['doc_status_array'],$doc_status);
                    }
                } 
            }
            $data['doc_status_name']     =   implode(",",$data['doc_status_array']);

            $data['document_name'] = $this->input->post('sel_doc_name');

            $array_doc_data = explode(",",$data['document_name']);

            //selected documents converted to uppercase
            $temp_name_array = array();
            for($r=0;$r< count($array_doc_data);$r++)
            {
                $name_string = $array_doc_data[$r];
                $temp_doc = str_replace("_", " ",$name_string);
                $uc_name = ucwords($temp_doc);
                array_push($temp_name_array,$uc_name);
            }
            $data['doc_uc_name']= implode(",",$temp_name_array);
            //End

            $doc_array = array();
            for($r=0;$r< count($array_doc_data);$r++)
            {
                $new_string = str_replace("_"," ",$array_doc_data[$r]);
                array_push($doc_array,$new_string);
            }
            $db_doc_name = array();
            for($n=0; $n< count($doc_array);$n++)
            {
                $arr = explode(' ', trim(strtolower($doc_array[$n])));
                $arr_doc = $arr[0];
                array_push($db_doc_name,$arr_doc);
            }
            
            $data['final_doc_array'] = array();
            for($c=0; $c < count($db_doc_name);$c++)
            {
                if($db_doc_name[$c] == "birth"){
                    $data['final_doc_name']= "birth_cert";
                }else if($db_doc_name[$c] == "category"){
                    $data['final_doc_name']= "category_cert";
                }else if($db_doc_name[$c] == "disabilty"){
                    $data['final_doc_name']= "disabilty_cert";
                }else if($db_doc_name[$c] == "court"){
                    $data['final_doc_name']= "court_order_doc";
                }else if($db_doc_name[$c] == "adhar"){
                    $data['final_doc_name']= "adhar_card_cert";
                }else if($db_doc_name[$c] == "student"){
                    $data['final_doc_name']= "student_photo";
                }
                array_push($data['final_doc_array'],$data['final_doc_name']);
            }

            $data['ret_final_stud_doc_info'] = array();
            $data['final_doc_name_data'] = implode(",",$data['final_doc_array']);
            // to match column name with selected document name 
            for($f=0; $f < count($data['final_doc_array']); $f++)
            {
                if($data['final_doc_array'][$f] == "birth_cert"){
                    $temp_birth = array();
                    $data['db_doc_name'] = "Birth Certificate";
                    if($data['division_id'] == NULL || $data['division_id'] == ""){
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_list_missing_docs_all_class($data['class_id_array'],$data['status'],'birth_cert');
                    }else{
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_stud_list_missing_documents($data['class_id'],$data['division_id'],$data['status'],'birth_cert');
                    }
                    array_push($temp_birth,$data['db_doc_name']);
                    for($w=0;$w< count($data['returend_Student_Information']);$w++)
                    {
                        $data['returend_Student_Information'][$w]->certificate = $temp_birth;
                    }
                }
                else if($data['final_doc_array'][$f] == "category_cert"){
                    $temp_category = array();
                    $data['db_doc_name']= "Category Certificate";
                    if($data['division_id'] == NULL || $data['division_id'] == ""){
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_list_missing_docs_all_class($data['class_id_array'],$data['status'],'category_cert');
                    }else{
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_stud_list_missing_documents($data['class_id'],$data['division_id'],$data['status'],'category_cert');
                    }
                    array_push($temp_category,$data['db_doc_name']);
                    for($w=0;$w< count($data['returend_Student_Information']);$w++)
                    {
                        $data['returend_Student_Information'][$w]->certificate = $temp_category;
                    }
                }else if($data['final_doc_array'][$f] == "disabilty_cert"){
                    $temp_disability = array();
                    $data['db_doc_name']= "Disabilty Certificate";
                    if($data['division_id'] == NULL || $data['division_id'] == ""){
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_list_missing_docs_all_class($data['class_id_array'],$data['status'],'disabilty_cert');
                    }else{
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_stud_list_missing_documents($data['class_id'],$data['division_id'],$data['status'],'disabilty_cert');
                    }
                    array_push($temp_disability,$data['db_doc_name']);
                    for($w=0;$w< count($data['returend_Student_Information']);$w++)
                    {
                        $data['returend_Student_Information'][$w]->certificate = $temp_disability;
                    }
                }else if($data['final_doc_array'][$f] == "court_order_doc"){
                    $temp_court_cert = array();
                    $data['db_doc_name']= "Court Order Document";
                    if($data['division_id'] == NULL || $data['division_id'] == ""){
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_list_missing_docs_all_class($data['class_id_array'],$data['status'],'court_order_doc');
                    }else{
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_stud_list_missing_documents($data['class_id'],$data['division_id'],$data['status'],'court_order_doc');
                    }
                    array_push($temp_court_cert,$data['db_doc_name']);
                    for($w=0;$w< count($data['returend_Student_Information']);$w++)
                    {
                        $data['returend_Student_Information'][$w]->certificate = $temp_court_cert;
                    }
                }else if($data['final_doc_array'][$f] == "adhar_card_cert"){
                    $temp_adhar = array();
                    $data['db_doc_name']= "Adhar Card Certificate";
                    if($data['division_id'] == NULL || $data['division_id'] == ""){
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_list_missing_docs_all_class($data['class_id_array'],$data['status'],'adhar_card_cert');
                    }else{
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_stud_list_missing_documents($data['class_id'],$data['division_id'],$data['status'],'adhar_card_cert');
                    }
                    array_push($temp_adhar,$data['db_doc_name']);
                    for($w=0;$w< count($data['returend_Student_Information']);$w++)
                    {
                        $data['returend_Student_Information'][$w]->certificate = $temp_adhar;
                    }
                }else if($data['final_doc_array'][$f] == "student_photo"){
                    $temp_photo = array();
                    $data['db_doc_name']= "Student Photo";
                    if($data['division_id'] == NULL || $data['division_id'] == ""){
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_list_missing_docs_all_class($data['class_id_array'],$data['status'],'student_photo');
                    }else{
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_stud_list_missing_documents($data['class_id'],$data['division_id'],$data['status'],'student_photo');
                    }
                    array_push($temp_photo,$data['db_doc_name']);
                    for($w=0;$w< count($data['returend_Student_Information']);$w++)
                    {
                        $data['returend_Student_Information'][$w]->certificate = $temp_photo;
                    }
                }
                array_push($data['ret_final_stud_doc_info'],$data['returend_Student_Information']);
            }
            
            $doc_array_1 = array();
            $final_document_array = array();
            $data['final_document_data'] = array();
            $data['returned_final_data']= $data['ret_final_stud_doc_info'];
            
            foreach($data['returned_final_data'] as $key =>$value){
                foreach($value as $val_key =>$key_value){
                    array_push($doc_array_1,$key_value);
                }
            }
            for($a=0;$a< count($doc_array_1);$a++){
                $ref_no = $doc_array_1[$a]->refno;
                array_push($final_document_array,array(
                    'ref_no'   =>$doc_array_1[$a]->refno,
                    'admission_to' => $doc_array_1[$a]->admission_to, 
                    'first_name' => $doc_array_1[$a]->first_name, 
                    'last_name' =>  $doc_array_1[$a]->last_name,
                    'division' => $doc_array_1[$a]->division,
                    'certificate' =>$doc_array_1[$a]->certificate[0],
                ));
                $cnt_curr = 0;
                for ($k=0; $k < count($final_document_array); $k++) 
                { 
                    if($final_document_array[$k]['ref_no'] == $ref_no)
                    {
                        $data['final_document_data'][$ref_no][$cnt_curr] = $final_document_array[$k];
                        $cnt_curr++;
                    }
                }
            }
        }
        $data['main_content'] = array('common/document/missing_documents/view_missing_documents');
        $this -> load -> view('bootstrap_templates/main_template', $data);
    }
    
    /**
     * Fetch division list onchange of class
     * @return division select
     *
     */
    public function ajax_division_list()
    {
        $class_id = $this->input->post('class_id');
        $data['division_data'] = $this -> Class_division_model -> get_division_data($class_id);
        $data['class_id'] = $class_id;
        $data['division_id'] = '';
        $this->load->view('common/classdivision/view_ajax_class_division_list',$data);
    }
    /**
     * Fetch document list onchange of class
     * @return document select
     *
     */
    public function document_list()
    {
        $doc_data_array = array();
        $data['array_doc_name'] =array();
        $final_doc_name = array();
        $data['class_id'] = $this->input->post('class_id');

        $data['class_array'] = implode(",",$data['class_id']);
        for($c=0;$c< count($data['class_id']);$c++){
            $data['class_id_data'] = $data['class_id'][$c];
            $data['document_data'] = $this -> Student_model -> get_document_data($data['class_id_data']);
            array_push($doc_data_array,$data['document_data']->result());
        }
        foreach($doc_data_array as $key =>$doc_value){
            for($d=0;$d <count($doc_value);$d++){
                $data['array_doc_name'][]= (object)[
                    "document_name" => $doc_value[$d]->document_name,
                    "class_id" => $doc_value[$d]->class_id,
                ]; 
            }
        }
        for($j=0;$j< count($data['array_doc_name']);$j++)
        {
            $data['doc_names']= ($data['array_doc_name'][$j]->document_name);
            array_push($final_doc_name,$data['doc_names']);
        };
        $data['final_document'] =array_values(array_unique($final_doc_name,SORT_REGULAR));
        $this->load->view('common/document/missing_documents/view_ajax_document_list',$data);
    }
}   

```
{{< /details >}}



## __construct
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This is the constructor function for a class. It initializes the class by performing the following tasks:

1. Calls the parent constructor.
2. Starts a session.
3. Sets the default timezone to 'Asia/Kolkata'.
4. Checks if the user is logged in.
5. Loads the 'Student_model' model.
6. Loads the 'Student_find_model' model.
7. Loads the 'Class_division_model' model.

{{< details "source code " >}}
```php
public function __construct()
	{
        parent::__construct();
        @session_start();
        date_default_timezone_set('Asia/Kolkata');
        Check_Access_helper::is_logged_in();
        $this -> load -> model('common/Student_model');
        $this->load->model('student/Student_find_model');
        $this->load->model('common/Class_division_model');
    }
```
{{< /details >}}

## index
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
This function is the index function of a controller. It is responsible for displaying the student list and managing missing documents. It retrieves data from the database and passes it to the view for rendering. The function also handles form submissions and filters the student list based on the selected class, division, document status, and document name.

### User Acceptance Criteria
```gherkin
Feature: Display Student List
Scenario: User views the student list
Given The user is on the student list page
When The page is loaded
Then The student list is displayed

Feature: Filter Student List
Scenario: User filters the student list
Given The user is on the student list page
When The user selects a class, division, document status, and document name
And The user submits the form
Then The student list is filtered based on the selected filters
```

### Refactoring
1. Extract the database retrieval logic into a separate function to improve code readability and maintainability.
2. Use a more descriptive variable name instead of 'data' to improve code readability.
3. Use a switch statement instead of multiple if-else statements to handle different document names.
4. Use an array to store the document names instead of separate variables.
5. Use a foreach loop instead of a for loop to iterate over the returned student information.
6. Move the document name conversion logic into a separate function to improve code readability.

{{< details "source code " >}}
```php
public function index()
	{
        $data['page_data']['page_name']        = 'Student List';
		$data['page_data']['page_icon']  	   = '';
		$data['page_data']['page_title']	   = 'Student List';
		$data['page_data']['page_date']  	   = date("d M Y");
		$data['page_data']['page_description'] = 'This is module that manages Student missing documents ';
        $data['page_data']['breadcrumb']    = '<li>Administrator</li>  <li class="active">Student Missing Documents</li>';

        //---- Get all Class data from all database ----//
        $class_data = $this -> Student_find_model -> get_class_data(NULL);
        if($class_data != NULL && $class_data != ''){
            $data['class_data'] = $class_data;
        }else{
            $data['class_data'] = NULL;
        }
        $data['division_rows'] = $this -> Class_division_model -> get_student_all_division_data();

        $document_returned_data = $this-> Student_model->get_all_document_setup_data();
        if($document_returned_data != NULL)
        {
            $data['document_data'] = $document_returned_data->result(); 
        }

        if((isset($_POST['sel_class_id']) && $_POST['sel_class_id'] != NULL))
        {
            $data['class_id']      = $this->input->post('sel_class_id');
            $data['class_id_array'] = explode(",",$data['class_id']);
            $data['class_data_array'] = array();
            for($a=0; $a< count($data ['class_id_array']); $a++){
                foreach ($class_data as $row_class){
                    if ($row_class['class_id'] == $data['class_id_array'][$a]){
                        $data['class_name'] = $row_class ['class_name'];
                        array_push($data['class_data_array'],$data['class_name']);
                    }
                }
            }
            $data['view_class_name'] =implode(",",$data['class_data_array']);
             
            $data['division_id']   = $this->input->post('sel_division_id');
            $data ['div_data']=  explode(",",$data['division_id']);
            
            $data['div_name_array'] = array();
            for($d=0; $d< count($data ['div_data']); $d++){
                foreach ($data['division_rows']->result() as $row_div){
                    if ($row_div -> division_id == $data ['div_data'][$d]){
                        $data['div_name']=  $row_div -> division_name ;
                        array_push($data['div_name_array'],$data['div_name']);
                    }
                }
            }
            $data['view_div_name'] = implode(",",$data['div_name_array']);
            $data['doc_status_array']= array();
            $status_array = array('1'=>'New student','2'=>'Current student','3'=>'Cancelled','4'=>'Not attending','6,7'=>'Defaulter');
            $data['status']        = $this->input->post('sel_status');
            $data ['status_data']=  explode(",",$data['status']);
            foreach ($status_array as $key => $status_val) 
            {
                for($stat=0;$stat< count($data ['status_data']);$stat++){

                    if ($data['status_data'][$stat] == '6')
                    {
                        $data['status_data'][$stat] = '6,7';
                    }
                    if($key == $data['status_data'][$stat]){
                        $doc_status= $status_val;
                        array_push($data['doc_status_array'],$doc_status);
                    }
                } 
            }
            $data['doc_status_name']     =   implode(",",$data['doc_status_array']);

            $data['document_name'] = $this->input->post('sel_doc_name');

            $array_doc_data = explode(",",$data['document_name']);

            //selected documents converted to uppercase
            $temp_name_array = array();
            for($r=0;$r< count($array_doc_data);$r++)
            {
                $name_string = $array_doc_data[$r];
                $temp_doc = str_replace("_", " ",$name_string);
                $uc_name = ucwords($temp_doc);
                array_push($temp_name_array,$uc_name);
            }
            $data['doc_uc_name']= implode(",",$temp_name_array);
            //End

            $doc_array = array();
            for($r=0;$r< count($array_doc_data);$r++)
            {
                $new_string = str_replace("_"," ",$array_doc_data[$r]);
                array_push($doc_array,$new_string);
            }
            $db_doc_name = array();
            for($n=0; $n< count($doc_array);$n++)
            {
                $arr = explode(' ', trim(strtolower($doc_array[$n])));
                $arr_doc = $arr[0];
                array_push($db_doc_name,$arr_doc);
            }
            
            $data['final_doc_array'] = array();
            for($c=0; $c < count($db_doc_name);$c++)
            {
                if($db_doc_name[$c] == "birth"){
                    $data['final_doc_name']= "birth_cert";
                }else if($db_doc_name[$c] == "category"){
                    $data['final_doc_name']= "category_cert";
                }else if($db_doc_name[$c] == "disabilty"){
                    $data['final_doc_name']= "disabilty_cert";
                }else if($db_doc_name[$c] == "court"){
                    $data['final_doc_name']= "court_order_doc";
                }else if($db_doc_name[$c] == "adhar"){
                    $data['final_doc_name']= "adhar_card_cert";
                }else if($db_doc_name[$c] == "student"){
                    $data['final_doc_name']= "student_photo";
                }
                array_push($data['final_doc_array'],$data['final_doc_name']);
            }

            $data['ret_final_stud_doc_info'] = array();
            $data['final_doc_name_data'] = implode(",",$data['final_doc_array']);
            // to match column name with selected document name 
            for($f=0; $f < count($data['final_doc_array']); $f++)
            {
                if($data['final_doc_array'][$f] == "birth_cert"){
                    $temp_birth = array();
                    $data['db_doc_name'] = "Birth Certificate";
                    if($data['division_id'] == NULL || $data['division_id'] == ""){
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_list_missing_docs_all_class($data['class_id_array'],$data['status'],'birth_cert');
                    }else{
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_stud_list_missing_documents($data['class_id'],$data['division_id'],$data['status'],'birth_cert');
                    }
                    array_push($temp_birth,$data['db_doc_name']);
                    for($w=0;$w< count($data['returend_Student_Information']);$w++)
                    {
                        $data['returend_Student_Information'][$w]->certificate = $temp_birth;
                    }
                }
                else if($data['final_doc_array'][$f] == "category_cert"){
                    $temp_category = array();
                    $data['db_doc_name']= "Category Certificate";
                    if($data['division_id'] == NULL || $data['division_id'] == ""){
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_list_missing_docs_all_class($data['class_id_array'],$data['status'],'category_cert');
                    }else{
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_stud_list_missing_documents($data['class_id'],$data['division_id'],$data['status'],'category_cert');
                    }
                    array_push($temp_category,$data['db_doc_name']);
                    for($w=0;$w< count($data['returend_Student_Information']);$w++)
                    {
                        $data['returend_Student_Information'][$w]->certificate = $temp_category;
                    }
                }else if($data['final_doc_array'][$f] == "disabilty_cert"){
                    $temp_disability = array();
                    $data['db_doc_name']= "Disabilty Certificate";
                    if($data['division_id'] == NULL || $data['division_id'] == ""){
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_list_missing_docs_all_class($data['class_id_array'],$data['status'],'disabilty_cert');
                    }else{
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_stud_list_missing_documents($data['class_id'],$data['division_id'],$data['status'],'disabilty_cert');
                    }
                    array_push($temp_disability,$data['db_doc_name']);
                    for($w=0;$w< count($data['returend_Student_Information']);$w++)
                    {
                        $data['returend_Student_Information'][$w]->certificate = $temp_disability;
                    }
                }else if($data['final_doc_array'][$f] == "court_order_doc"){
                    $temp_court_cert = array();
                    $data['db_doc_name']= "Court Order Document";
                    if($data['division_id'] == NULL || $data['division_id'] == ""){
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_list_missing_docs_all_class($data['class_id_array'],$data['status'],'court_order_doc');
                    }else{
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_stud_list_missing_documents($data['class_id'],$data['division_id'],$data['status'],'court_order_doc');
                    }
                    array_push($temp_court_cert,$data['db_doc_name']);
                    for($w=0;$w< count($data['returend_Student_Information']);$w++)
                    {
                        $data['returend_Student_Information'][$w]->certificate = $temp_court_cert;
                    }
                }else if($data['final_doc_array'][$f] == "adhar_card_cert"){
                    $temp_adhar = array();
                    $data['db_doc_name']= "Adhar Card Certificate";
                    if($data['division_id'] == NULL || $data['division_id'] == ""){
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_list_missing_docs_all_class($data['class_id_array'],$data['status'],'adhar_card_cert');
                    }else{
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_stud_list_missing_documents($data['class_id'],$data['division_id'],$data['status'],'adhar_card_cert');
                    }
                    array_push($temp_adhar,$data['db_doc_name']);
                    for($w=0;$w< count($data['returend_Student_Information']);$w++)
                    {
                        $data['returend_Student_Information'][$w]->certificate = $temp_adhar;
                    }
                }else if($data['final_doc_array'][$f] == "student_photo"){
                    $temp_photo = array();
                    $data['db_doc_name']= "Student Photo";
                    if($data['division_id'] == NULL || $data['division_id'] == ""){
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_list_missing_docs_all_class($data['class_id_array'],$data['status'],'student_photo');
                    }else{
                        $data['returend_Student_Information'] = $this-> Student_model->fetch_stud_list_missing_documents($data['class_id'],$data['division_id'],$data['status'],'student_photo');
                    }
                    array_push($temp_photo,$data['db_doc_name']);
                    for($w=0;$w< count($data['returend_Student_Information']);$w++)
                    {
                        $data['returend_Student_Information'][$w]->certificate = $temp_photo;
                    }
                }
                array_push($data['ret_final_stud_doc_info'],$data['returend_Student_Information']);
            }
            
            $doc_array_1 = array();
            $final_document_array = array();
            $data['final_document_data'] = array();
            $data['returned_final_data']= $data['ret_final_stud_doc_info'];
            
            foreach($data['returned_final_data'] as $key =>$value){
                foreach($value as $val_key =>$key_value){
                    array_push($doc_array_1,$key_value);
                }
            }
            for($a=0;$a< count($doc_array_1);$a++){
                $ref_no = $doc_array_1[$a]->refno;
                array_push($final_document_array,array(
                    'ref_no'   =>$doc_array_1[$a]->refno,
                    'admission_to' => $doc_array_1[$a]->admission_to, 
                    'first_name' => $doc_array_1[$a]->first_name, 
                    'last_name' =>  $doc_array_1[$a]->last_name,
                    'division' => $doc_array_1[$a]->division,
                    'certificate' =>$doc_array_1[$a]->certificate[0],
                ));
                $cnt_curr = 0;
                for ($k=0; $k < count($final_document_array); $k++) 
                { 
                    if($final_document_array[$k]['ref_no'] == $ref_no)
                    {
                        $data['final_document_data'][$ref_no][$cnt_curr] = $final_document_array[$k];
                        $cnt_curr++;
                    }
                }
            }
        }
        $data['main_content'] = array('common/document/missing_documents/view_missing_documents');
        $this -> load -> view('bootstrap_templates/main_template', $data);
    }
```
{{< /details >}}

## ajax_division_list
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to retrieve the division data based on the class ID provided through an AJAX request. It then loads a view with the retrieved data.

### User Acceptance Criteria
```gherkin
Feature: Retrieve Division List
Scenario: User requests division list for a class
Given A class ID is provided
When The AJAX request is made
Then The division data is retrieved and loaded into the view
```

### Refactoring
1. Move the retrieval of division data to a separate function for better code organization.
2. Use dependency injection to inject the Class_division_model instead of directly accessing it.
3. Use a more descriptive variable name instead of 'data' to improve code readability.

{{< details "source code " >}}
```php
public function ajax_division_list()
    {
        $class_id = $this->input->post('class_id');
        $data['division_data'] = $this -> Class_division_model -> get_division_data($class_id);
        $data['class_id'] = $class_id;
        $data['division_id'] = '';
        $this->load->view('common/classdivision/view_ajax_class_division_list',$data);
    }
```
{{< /details >}}

## document_list
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function retrieves a list of documents based on the class ID provided. It then processes the data and returns a unique list of document names.

### User Acceptance Criteria
```gherkin
Feature: Retrieve Document List
Scenario: Retrieve document list for a class
Given a class ID
When the document list is requested
Then the unique list of document names is returned
```

### Refactoring
1. Use a foreach loop instead of a for loop to iterate over the class IDs.
2. Use array_map() function instead of array_push() to add elements to the array.
3. Move the logic for retrieving document data to a separate function.
4. Use a more descriptive variable name instead of 'data' throughout the function.

{{< details "source code " >}}
```php
public function document_list()
    {
        $doc_data_array = array();
        $data['array_doc_name'] =array();
        $final_doc_name = array();
        $data['class_id'] = $this->input->post('class_id');

        $data['class_array'] = implode(",",$data['class_id']);
        for($c=0;$c< count($data['class_id']);$c++){
            $data['class_id_data'] = $data['class_id'][$c];
            $data['document_data'] = $this -> Student_model -> get_document_data($data['class_id_data']);
            array_push($doc_data_array,$data['document_data']->result());
        }
        foreach($doc_data_array as $key =>$doc_value){
            for($d=0;$d <count($doc_value);$d++){
                $data['array_doc_name'][]= (object)[
                    "document_name" => $doc_value[$d]->document_name,
                    "class_id" => $doc_value[$d]->class_id,
                ]; 
            }
        }
        for($j=0;$j< count($data['array_doc_name']);$j++)
        {
            $data['doc_names']= ($data['array_doc_name'][$j]->document_name);
            array_push($final_doc_name,$data['doc_names']);
        };
        $data['final_document'] =array_values(array_unique($final_doc_name,SORT_REGULAR));
        $this->load->view('common/document/missing_documents/view_ajax_document_list',$data);
    }
```
{{< /details >}}

## Risks & Security Issues
**__construct**: 

**index**: 1. The function is currently handling multiple responsibilities, which can make the code more complex and harder to maintain.
2. The function is directly accessing the database and performing database queries, which can lead to potential security vulnerabilities.
3. The function is using $_POST directly, which can make the code vulnerable to CSRF attacks.
4. The function is not properly validating and sanitizing user input, which can lead to potential security vulnerabilities.
5. The function is not using prepared statements or parameterized queries, which can make the code vulnerable to SQL injection attacks.

**ajax_division_list**: 1. The function assumes that the 'class_id' parameter is always provided in the AJAX request, which may lead to errors if it is missing.
2. There is no error handling in case the division data retrieval fails.
3. The function does not have any input validation for the 'class_id' parameter.

**document_list**: 1. The function assumes that the 'Student_model' class is already loaded.
2. The function does not handle any errors that may occur during the retrieval of document data.
3. The function does not validate the input class ID.

