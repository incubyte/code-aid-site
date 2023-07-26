+++
categories = ["Documentation"]
title = "Challan_controller.php"
+++

## File Summary

- **File Path:** application\controllers\account\Challan_controller.php
- **LOC:** 844
- **Last Modified:** Git logs not found
- **Number of Commits (Total / Last 6 Months / Last Month):** Git logs not found
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** Git logs not found
- **Top Contributors:** Git logs not found

{{< details "File source code " >}}
```php
<?php
class Challan_controller extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        @session_start();
        date_default_timezone_set('Asia/Kolkata');
        Check_Access_helper::is_logged_in();
        $this->load->model('account/challan_model');
        $this->load->model('student/Continuity_form_model');
        $this->load->model('common/Class_division_model');
    }

    public function view()
    {
        $data['page_data']['page_name'] = 'Challan';
        $data['page_data']['page_icon'] = 'fa fa-pencil-square-o';
        $data['page_data']['page_title'] = 'Challan';
        $data['page_data']['page_date'] = date("d M Y");
        $data['page_data']['page_description'] = 'This is module that manages movement of Workseets given out as teaching material';
        $data['page_data']['breadcrumb'] = '<li>Administrator</li>  <li class="active">Manage Worksheets</li>';
       
        $returned_class_data = $this->Class_division_model->get_class_data($data);
       
        if ($returned_class_data != NULL) {
            $data['page_data']['class_rows'] = $returned_class_data;
        } else {
            $data['page_data']['class_rows'] = NULL;
        }

        $data['main_content'] = array('account/challan/view_challan');
        $this->load->view('templates/main_template', $data);
    }

   
    public function get_class_id()
    {
        $data['ref_no'] = $_POST['ref_no'];

        //get class information
        $returned_student_class_data = $this -> challan_model -> get_student_info_data($data);
        if($returned_student_class_data != NULL)
        {
            foreach ($returned_student_class_data ->result() as  $student_row) 
            {
                $class_id = $student_row->admission_to;
                $division_id = $student_row->division; 
                $student_academic_year = $student_row->academic_year; 
                $data['class_id'] = $class_id;
                $data['student_division_id'] = $division_id;
            }

            $data['returned_student_class_data'] = $returned_student_class_data; 
        }
        $returned_class_data = $this -> Class_division_model -> get_class_data();
        if ($returned_class_data != NULL)
        {
            $data['class_rows'] = $returned_class_data;
        }
        else
        {
            $data['class_rows'] = NULL;
        }

        //get division and class relation
        // $returned_class_division_relation = $this -> challan_model -> returned_class_division_relation($class_id,$student_academic_year);
        // if($returned_class_division_relation != NULL)
        // {
        //     $data['returned_class_division_relation'] = $returned_class_division_relation; 
        // }
        // else
        // {
        //     $data['returned_class_division_relation'] = NULL; 
        // }

        $returned_division_data = $this->Class_division_model->get_division_data($class_id);
        if ($returned_division_data != NULL)
        {
            $data['division_rows'] = $returned_division_data;
        }else{
            $data['division_rows'] = NULL;
        }


        $this->load->view('account/challan/ajax_get_class_div', $data);
        
    }
    public function get_installment_info()
    {
        $data['student_class_id'] = $_POST['student_class_id'];
        $data['student_academic_year'] = $_POST['student_academic_year'];

        $return_installment_id = $this -> challan_model -> get_installment_id($data);
        if($return_installment_id != NULL)
        {
            $data['return_installment_id'] = $return_installment_id; 
        }
        $this->load->view('account/challan/ajax_get_installment_id', $data);
    }

    public function get_student_fee_info()
    {
        $data['get_fee_head_id'] = NULL;
        $data['temp_sch_id'] = NULL;
        $data['temp_inst_id'] = NULL;
        
        $data['school_id'] = NULL;
        $data['Instt_id'] = NULL;

        $data['class_id'] = $_POST['student_class_id'];
        $data['division_id'] = $_POST['student_division_id'];
        $data['student_installment_id'] = $_POST['student_installment_id'];
        $data['student_academic_year'] = $_POST['student_academic_year'];
        $student_institute_text = $_POST['student_institute_text'];
        $student_institute_value = $_POST['student_institute_value'];

        $ref_no_array = array();
        if($_POST['is_ref_no'] == '1'){
            $data['ref_no'] = $_POST['ref_no'];
            $ref_no_details = $this -> challan_model -> get_student_info_data($data);
            if ($ref_no_details != NULL) {
                $ref_no_array = $ref_no_details;
            }

        }else{
            $ref_no_list = $this -> challan_model -> get_ref_no_data_by_class($data['class_id'], $data['division_id'], $data['student_academic_year']);
            if ($ref_no_list != NULL) {
                $ref_no_array = $ref_no_list;
            }
        }
        $data['ref_no_array'] = $ref_no_array;

        if($student_institute_value == "SCH")
        {
            $data['temp_sch_id'] = $student_institute_text;
            $data['where_clause'] = " walnut_school_master.school_name = '".$data['temp_sch_id']."'";
        }
        else
        {
            $data['temp_inst_id'] = $student_institute_text;
            $data['where_clause'] = "walnut_institute.Instt_Name = '".$data['temp_inst_id']."'";
        }
        $return_student_fee_info = $this -> challan_model -> get_student_fee_info($data);
        if($return_student_fee_info != NULL)
        {
            $data['return_student_fee_info'] = $return_student_fee_info;
            
            //get school id and institute id for bank details
            foreach($return_student_fee_info->result() as $school_id_row)
            {
                if($school_id_row->school_id != NULL)
                {
                    $data['school_id'] = $school_id_row->school_id;
                    $data['Instt_id'] = NULL;
                }
                else
                {
                    $data['Instt_id'] = $school_id_row->Instt_id;
                    $data['school_id'] = NULL;
                }
            }
        }else{
            $data['return_student_fee_info'] = NULL;
        }

        $data['account_name'] = "None";
        $data['account_number'] = "None";
        $data['bank_name'] = "None";
        $data['bank_id'] = "";

        $new_yrwise_stud_array = NULL;
        $paid_fee_head_id_array = NULL;
        $ref_no_list = $ref_no_array->result_array();
        for ($i=0; $i < count($ref_no_list); $i++) { 

            //get studentwise instll data as year and refno combn start
            $get_student_cont_data = $this -> Continuity_form_model -> get_row_continuity($ref_no_list[$i]['refno'], $data['student_academic_year']);
            $computed_class = NULL;
            if($get_student_cont_data != NULL)
            {
                $get_student_cont_row = $get_student_cont_data->result_array();
                for($m = 0; $m<count($get_student_cont_row);$m++)
                {
                    // if($data['student_academic_year'] == $get_student_cont_row[0]['next_academic_year'])
                    // {
                    $computed_class = $get_student_cont_row[0]['next_class'];
                    // }
                    // else
                    // {
                        // $temp_array['ref_no'] = $ref_no_list[$i]['refno'];
                        // $ret_refno_data = $this -> challan_model -> get_student_info_data($temp_array);
                    //     if ($ret_refno_data != NULL) {
                    //         $ret_refno_row = $ret_refno_data->row();
                    //         $curr_admission_to = $ret_refno_row->admission_to; 
                    //     }else{
                    //         $ret_refno_row = NULL;
                    //         $curr_admission_to = NULL;
                    //     }
                    //     $computed_class = $curr_admission_to;
                    // }

                    // //check status start
                    // if($ref_no_list[$i]['status'] == 1)
                    // { 
                    //     $computed_class = $ref_no_list[$i]['admission_to'];
                    // }
                    // else if($ref_no_list[$i]['status'] == 2 && $data['student_academic_year'] != $_SESSION['academic_year']){
                    //     $computed_class = $ref_no_list[$i]['admission_to'] + 1;
                    // }  
                    // //check status end

                    $data['class_id'] = $computed_class;
                    
                    $get_student_current_class_name = $this -> Class_division_model -> get_class_name($data);
                    if($get_student_current_class_name != NULL)
                    {
                        $student_current_class_name = $get_student_current_class_name->result_array();
                        $data['class_name'] = $student_current_class_name[0]['class_name'];
                    }
                    else
                    {
                        $data['class_name'] = NULL;
                    }
                }
            }else{

                $temp_array['ref_no'] = $ref_no_list[$i]['refno'];
                $ret_refno_data = $this -> challan_model -> get_student_info_data($temp_array);
                if ($ret_refno_data != NULL) {
                    $ret_refno_row = $ret_refno_data->row();
                    $computed_class = $ret_refno_row->admission_to; 
                }else{
                    $ret_refno_row = NULL;
                    $computed_class = NULL;
                }

                //check status start
                if($ref_no_list[$i]['status'] == 1)
                { 
                    $computed_class = $ref_no_list[$i]['admission_to'];
                }
                else if($ref_no_list[$i]['status'] == 2 && $data['student_academic_year'] != $_SESSION['academic_year']){
                    $computed_class = $ref_no_list[$i]['admission_to'] + 1;
                }  
                //check status end

                $data['class_id'] = $computed_class;

                $get_student_current_class_name = $this -> Class_division_model -> get_class_name($data);
                if($get_student_current_class_name != NULL)
                {
                    $student_current_class_name = $get_student_current_class_name->result_array();
                    $data['class_name'] = $student_current_class_name[0]['class_name'];
                }
                else
                {
                    $data['class_name'] = NULL;
                }
            }

            $paid_fee_head_id_array_stu = NULL;
            $temp_get_fee_head_id = $this -> challan_model -> get_fee_head_id($data, $ref_no_list[$i]['refno']);
            if($temp_get_fee_head_id != NULL)
            {
                $paid_fee_head_id_array_stu = $temp_get_fee_head_id->result_array();
                
            }





            $where_clause = '';
            if($student_institute_value == "SCH")
            {
                $temp_sch_id = $student_institute_text;
                $where_clause = "and walnut_school_master.school_name = '".$temp_sch_id."'";
            }
            else
            {
                $temp_inst_id = $student_institute_text;
                $where_clause = "and walnut_institute.Instt_Name = '".$temp_inst_id."'";
            }
            
            $student_installment_id = $data['student_installment_id'];
            $ret_return_student_fee_data = NULL;
            $return_student_fee_data = $this -> challan_model -> get_student_fee_info_by_stu($where_clause, $student_installment_id, $computed_class, $data['student_academic_year']);



            if($return_student_fee_data != NULL)
            {
                 $ret_return_student_fee_data = $return_student_fee_data->result_array();
            }

            $new_yrwise_stud_array[$ref_no_list[$i]['refno']] = array('refno'=> $ref_no_list[$i]['refno'], 'calc_class_id'=> $computed_class, 'fee'=> $ret_return_student_fee_data, 'ref_data' => $ref_no_list[$i] , 'is_paid' => $paid_fee_head_id_array_stu);
            //get studentwise instll data as year and refno combn start






            //check paid or not

            $temp_get_fee_head_id = $this -> challan_model -> get_fee_head_id($data, $ref_no_list[$i]['refno']);
            if($temp_get_fee_head_id != NULL)
            {
                $paid_fee_head_id_array[$i] = $temp_get_fee_head_id->result_array();
                
            }

            //get bank details
            $get_bank_details = $this -> challan_model -> get_bank_details($data);
            if($get_bank_details != NULL)
            {
                foreach ($get_bank_details->result() as $bank_row) 
                {
                    if($bank_row->school_id == $_SESSION['school_id'] and $bank_row->Instt_id == '0')
                    {
                        if($data['class_id'] < 12)//for kg 
                        {
                            if($bank_row->account_name == "UESF Walnut School KG")
                            {
                                $data['account_name'] = $bank_row->account_name;
                                $data['account_number'] = $bank_row->account_number;
                                $data['branch_name'] = $bank_row->branch_name;
                                $data['temp_bank_name'] = $bank_row->bank_name;
                                $get_bank_name =  $this -> challan_model -> get_bank_name($data);//get_bank_name
                                if($get_bank_name != NULL)
                                {
                                    foreach($get_bank_name->result() as $bank_value)
                                    {
                                        $data['bank_name'] = $bank_value->Bank;
                                        $data['bank_id'] = $bank_value->cat_id;
                                    }
                                }

                            }
                        }
                        else //for primary
                        {
                            if($bank_row->account_name == "UESF Walnut School")
                            {
                                $data['account_name'] = $bank_row->account_name;
                                $data['account_number'] = $bank_row->account_number;
                                $data['branch_name'] = $bank_row->branch_name;
                                $data['temp_bank_name'] = $bank_row->bank_name;
                                $get_bank_name =  $this -> challan_model -> get_bank_name($data);//get_bank_name
                                if($get_bank_name != NULL)
                                {
                                    foreach($get_bank_name->result() as $bank_value)
                                    {
                                        $data['bank_name'] = $bank_value->Bank;
                                        $data['bank_id'] = $bank_value->cat_id;
                                    }
                                }

                            }
                        }
                        
                    }//end if school id check 
                    if($bank_row->school_id == '0' and $bank_row->Instt_id == '2')
                    {
                        if($bank_row->account_name == "Rethink Educational System Pvt Ltd")
                        {
                            $data['account_name'] = $bank_row->account_name;
                            $data['account_number'] = $bank_row->account_number;
                            $data['branch_name'] = $bank_row->branch_name;
                            $data['temp_bank_name'] = $bank_row->bank_name;
                            $get_bank_name =  $this -> challan_model -> get_bank_name($data);//get_bank_name
                            if($get_bank_name != NULL)
                            {
                                foreach($get_bank_name->result() as $bank_value)
                                {
                                    $data['bank_name'] = $bank_value->Bank;
                                    $data['bank_id'] = $bank_value->cat_id;
                                }
                            }
                        }
                    }// end if institute check

                }//end foreach
            }
        }
        $data['get_fee_head_id'] = $paid_fee_head_id_array;


        $data['new_yrwise_stud_array'] = $new_yrwise_stud_array;
        $data['student_institute_text'] = $student_institute_text;
        $data['student_institute_value'] = $student_institute_value;

        $returned_class_data = $this->Class_division_model->get_class_data($data);
        if ($returned_class_data != NULL) {
            $data['class_rows'] = $returned_class_data;
        } else {
            $data['class_rows'] = NULL;
        }

        $data['page_name'] = 'Challan';
        $data['page_icon'] = 'fa fa-pencil-square-o';
        $data['page_title'] = 'Challan';

        $this->load->view('account/challan/ajax_get_challan_fee_details', $data);

    }

    public function get_school_name()
    {
        $data['return_get_school_name'] = NULL;
        $data['student_class_id'] = $_POST['student_class_id'];
        $data['student_installment_id'] = $_POST['student_installment_id'];
        $data['student_academic_year'] = $_POST['student_academic_year'];

        $return_get_school_name = $this -> challan_model -> get_school_name($data);
        if($return_get_school_name != NULL)
        {
            $data['return_get_school_name'] = $return_get_school_name; 
        }

        $this->load->view('account/challan/ajax_get_school_institute_name', $data);
    }

    public function view_challan_print()
    {
        if (isset($_POST['ajax_ref_no'])) {
            $data['ajax_ref_no'] = $_POST['ajax_ref_no'];
        }else{
            $data['ajax_ref_no'] = array();    
            $this->session->set_userdata('msg', 'No unpaid transactions found for selected combination.');
            redirect("challan/view");
        }

        $data['ajax_class_name'] = $_POST['ajax_class_name'];
        $data['ajax_account_name'] = $_POST['ajax_account_name'];
        $data['ajax_account_number'] = $_POST['ajax_account_number'];
        $data['ajax_total_amount'] = $_POST['ajax_total_amount'];
        $ajax_fee_head_name = $_POST['ajax_fee_head_name'];
        $data['ajax_bank_name'] = $_POST['ajax_bank_name'];
        $data['ajax_bank_id'] = $_POST['ajax_bank_id'];
        $data['ajax_school_id'] = $_POST['ajax_school_id'];
        $data['ajax_institute_id'] = $_POST['ajax_institute_id'];
        $fee_head_amt = $_POST['fee_head_amt'];
        
        $fee_head_id = NULL;
        $data['ajax_fee_head_id'] = NULL;
        $data['ajax_fee_head_amt'] = NULL;
        $data['ajax_fee_head_name'] = NULL;

        if(isset($_POST['fee_head_id']))
        {
            $fee_head_id = $_POST['fee_head_id'];
            $data['ajax_fee_head_id'] = $_POST['fee_head_id'];
            $data['ajax_fee_head_amt'] = $_POST['fee_head_amt'];
            $data['ajax_fee_head_name'] = $_POST['ajax_fee_head_name'];
        }
        $data['student_academic_year'] = $_POST['student_academic_year'];
        $data['student_installment_id'] = $_POST['student_installment_id'];

        
        $ref_no_array = array();

        $refno_list = $data['ajax_ref_no'];
        $ref_no_list = $this -> challan_model -> get_ref_no_list_data($refno_list, $data['student_academic_year']);
        if ($ref_no_list != NULL) {
            $ref_no_array = $ref_no_list->result_array();
        }


        $get_sch_data = $this -> challan_model -> get_all_sch_data();
        if ($get_sch_data != NULL) {
            $ret_get_sch_data = $get_sch_data->result_array();
        }else{
            $ret_get_sch_data = NULL;
        }

        if ($ret_get_sch_data == NULL) {
            echo '<p style="color:red; text-align:center;">School data not found! Please contact Administrator.</p>';
            return;
        }

        $html_page = NULL;
        for ($a=0; $a < count($ref_no_array); $a++) { 
            
            $data['ajax_ref_no'] = $ref_no_array[$a]['refno'];
            $data['ajax_stud_name'] = $ref_no_array[$a]['first_name']." ".$ref_no_array[$a]['last_name'];

            $challan_data_array = array();
            $data['get_payment_mode'] = NULL;
            $is_refno_entry_present = NULL;
            $data['payment_mode'] = NULL;


            //check if refno entry is already present start
            for ($x=0; $x < count($fee_head_id); $x++) { 
                $temp_fee_head_id = $fee_head_id[$x];
                
                if($data['ajax_school_id'] == NULL){
                    $temp_ajax_school_id = '0';
                }else{
                    $temp_ajax_school_id = $data['ajax_school_id'];
                }
                if($data['ajax_institute_id'] == NULL){
                    $temp_ajax_institute_id = '0';
                }else{
                    $temp_ajax_institute_id = $data['ajax_institute_id'];
                }
                $get_refno_entry = $this -> challan_model -> get_refno_entry($data, $temp_fee_head_id, $temp_ajax_school_id, $temp_ajax_institute_id);
                if ($get_refno_entry != NULL) {
                    $temp_array = $get_refno_entry->result_array();
                    array_push($challan_data_array,$temp_array[0]);  
                    $is_refno_entry_present = TRUE;
                }else{
                    $is_refno_entry_present = FALSE;
                }
            }





            $get_student_cont_data = $this -> Continuity_form_model -> get_row_continuity($ref_no_array[$a]['refno'], $data['student_academic_year']);
            $computed_class = NULL;
            if($get_student_cont_data != NULL)
            {
                $get_student_cont_row = $get_student_cont_data->result_array();
                for($m = 0; $m<count($get_student_cont_row);$m++)
                {
                    $computed_class = $get_student_cont_row[0]['next_class'];
                    
                    $data['class_id'] = $computed_class;
                    
                    $get_student_current_class_name = $this -> Class_division_model -> get_class_name($data);
                    if($get_student_current_class_name != NULL)
                    {
                        $student_current_class_name = $get_student_current_class_name->result_array();
                        $data['class_name'] = $student_current_class_name[0]['class_name'];
                    }
                    else
                    {
                        $data['class_name'] = NULL;
                    }
                }
            }else{

                $temp_array['ref_no'] = $ref_no_array[$a]['refno'];
                $ret_refno_data = $this -> challan_model -> get_student_info_data($temp_array);
                if ($ret_refno_data != NULL) {
                    $ret_refno_row = $ret_refno_data->row();
                    $computed_class = $ret_refno_row->admission_to; 
                }else{
                    $ret_refno_row = NULL;
                    $computed_class = NULL;
                }
                
                //check status start
                if($ref_no_array[$a]['status'] == 1)
                { 
                    $computed_class = $ref_no_array[$a]['admission_to'];
                }
                else if($ref_no_array[$a]['status'] == 2 && $data['student_academic_year'] != $_SESSION['academic_year']){
                    $computed_class = $ref_no_array[$a]['admission_to'] + 1;
                }  
                //check status end

                $data['class_id'] = $computed_class;

                $get_student_current_class_name = $this -> Class_division_model -> get_class_name($data);
                if($get_student_current_class_name != NULL)
                {
                    $student_current_class_name = $get_student_current_class_name->result_array();
                    $data['class_name'] = $student_current_class_name[0]['class_name'];
                }
                else
                {
                    $data['class_name'] = NULL;
                }
            }


            $student_institute_text = $_POST['student_institute_text'];
            $student_institute_value = $_POST['student_institute_value'];


            $where_clause = '';
            if($student_institute_value == "SCH")
            {
                $temp_sch_id = $student_institute_text;
                $where_clause = "and walnut_school_master.school_name = '".$temp_sch_id."'";
            }
            else
            {
                $temp_inst_id = $student_institute_text;
                $where_clause = "and walnut_institute.Instt_Name = '".$temp_inst_id."'";
            }
            
            $student_installment_id = $data['student_installment_id'];
            $ret_return_student_fee_data = NULL;
            $return_student_fee_data = $this -> challan_model -> get_student_fee_info_by_stu($where_clause, $student_installment_id, $computed_class, $data['student_academic_year']);


            if($return_student_fee_data != NULL)
            {
                 $ret_return_student_fee_data = $return_student_fee_data->result_array();
            }
            
            $new_yrwise_stud_array = NULL;
            $new_yrwise_stud_array[$ref_no_array[$a]['refno']] = array('refno'=> $ref_no_array[$a]['refno'], 'calc_class_id'=> $computed_class, 'fee'=> $ret_return_student_fee_data);
            
            $data['new_yrwise_stud_array'] = $new_yrwise_stud_array[$ref_no_array[$a]['refno']];

            //get studentwise instll data as year and refno combn start








            //check if refno entry is already present end

            if ($is_refno_entry_present)       //if refno entry is already present
            {                                          
                for ($y=0; $y < count($challan_data_array); $y++) { 
                    $data['challan_no'] = $challan_data_array[$y]["challan_no"];
                    $data['date'] = $challan_data_array[$y]["created_date"];
                }

            }else{
                if($fee_head_id != NULL && $fee_head_id != "")                                              // to check if unpaid are not included
                {
                    $get_last_challan_used_no = $this -> challan_model -> get_last_challan_used_no($data);

                    if($get_last_challan_used_no == NULL)                                                   //if no entry is present insert into last number
                    {
                        $last_used_unique_no = 000;
                        $new_unique_no = $last_used_unique_no + 1;
                        $data['new_unique_no'] = $new_unique_no;

                        if ($data['ajax_school_id'] != 0) {
                            $sch = str_pad($new_unique_no, 3, '0', STR_PAD_LEFT);
                        }
                        if ($data['ajax_institute_id'] != 0) {
                            $ins = str_pad($new_unique_no, 3, '0', STR_PAD_LEFT);
                        }

                        $temp_str_acad_yr1 = substr($data['student_academic_year'],2,2);
                        $temp_str_acad_yr2 = substr($data['student_academic_year'],-2);
                        $acad_yr_prefix = $temp_str_acad_yr1."-".$temp_str_acad_yr2;

                        ////old static code start
                        // if($data['ajax_institute_id'] == NULL and $data['ajax_school_id']=="2")
                        // {
                            
                        //     $data['new_challan_no'] = "CH/WSS/".$acad_yr_prefix."/".$sch;
                        //     $data['ajax_institute_id'] = 0;
                        //     $insert_into_last_challan_used_no = $this -> challan_model -> insert_into_last_challan_used_no($data);
                        //     if($insert_into_last_challan_used_no){
                        //     }else{
                        //         echo 'could not insert';
                        //     }
                        // }
                        // else if($data['ajax_institute_id'] == '2' and $data['ajax_school_id'] == NULL)
                        // {
                        //     $data['new_challan_no'] = "CH/RET/".$acad_yr_prefix."/".$ins;
                        //     $data['ajax_school_id'] = 0;
                        //     $insert_into_last_challan_used_no = $this -> challan_model -> insert_into_last_challan_used_no($data);
                        //     if($insert_into_last_challan_used_no){
                        //     }else{
                        //         echo 'could not insert';
                        //     }
                        // }
                        // else if($data['ajax_institute_id'] == '1' and $data['ajax_school_id'] == NULL)
                        // {
                        //     $data['new_challan_no'] = "CH/U/".$acad_yr_prefix."/".$ins;
                        //     $data['ajax_school_id'] = 0;
                        //     $insert_into_last_challan_used_no = $this -> challan_model -> insert_into_last_challan_used_no($data);
                        //     if($insert_into_last_challan_used_no){
                        //     }else{
                        //         echo 'could not insert';
                        //     }
                        // }
                        ////old static code end

                        $ch_school_prefix = "";
                        for ($xy=0; $xy < count($ret_get_sch_data); $xy++) { 
                            if ($data['ajax_school_id'] == $ret_get_sch_data[$xy]['school_id']) {
                                $ch_school_prefix = $ret_get_sch_data[$xy]['school_prefix'];
                                break;
                            }                            
                        }


                        if($data['ajax_institute_id'] == NULL and $data['ajax_school_id'] == $_SESSION['school_id'])
                        {
                            
                            $data['new_challan_no'] = "CH/".$ch_school_prefix."/".$acad_yr_prefix."/".$sch;
                            $data['ajax_institute_id'] = 0;
                            $insert_into_last_challan_used_no = $this -> challan_model -> insert_into_last_challan_used_no($data);
                            if($insert_into_last_challan_used_no){
                            }else{
                                echo 'could not insert';
                            }
                        }
                        else if($data['ajax_institute_id'] == '2' and $data['ajax_school_id'] == NULL)
                        {
                            $data['new_challan_no'] = "CH/RET/".$acad_yr_prefix."/".$ins;
                            $data['ajax_school_id'] = 0;
                            $insert_into_last_challan_used_no = $this -> challan_model -> insert_into_last_challan_used_no($data);
                            if($insert_into_last_challan_used_no){
                            }else{
                                echo 'could not insert';
                            }
                        }
                        else if($data['ajax_institute_id'] == '1' and $data['ajax_school_id'] == NULL)
                        {
                            $data['new_challan_no'] = "CH/U/".$acad_yr_prefix."/".$ins;
                            $data['ajax_school_id'] = 0;
                            $insert_into_last_challan_used_no = $this -> challan_model -> insert_into_last_challan_used_no($data);
                            if($insert_into_last_challan_used_no){
                            }else{
                                echo 'could not insert';
                            }
                        }

                        $data['date'] = date("Y-m-d H:i:s");
                        for($i=0;$i<count($fee_head_id);$i++)
                        {
                            $data['fee_head_id'] = $fee_head_id[$i];
                            $data['fee_head_name'] = $ajax_fee_head_name[$i];
                            $data['fee_head_amt'] = $fee_head_amt[$i];
                            
                            $insert_into_walnut_challan = $this -> challan_model -> insert_into_walnut_challan($data);
                        }
                   
                    }else{                                                                          //if entry present then update it

                        $temp_new_challan_no = NULL;
                        $temp_new_challan_no = $get_last_challan_used_no->result_array();
                        
                        //update into last no table
                        $last_challan_prim_key = $temp_new_challan_no[0]['last_challan_id'];          //get prim key where it needs to be updated
                        $data['last_challan_id'] = $last_challan_prim_key;
                        
                        $last_used_unique_no = $temp_new_challan_no[0]['last_used_unique_no'];
                        $new_unique_no = $last_used_unique_no + 1;
                        $data['new_unique_no'] = $new_unique_no;

                        if ($data['ajax_school_id'] != 0) {
                            $sch = str_pad($new_unique_no, 3, '0', STR_PAD_LEFT);
                        }
                        if ($data['ajax_institute_id'] != 0) {
                            $ins = str_pad($new_unique_no, 3, '0', STR_PAD_LEFT);
                        }

                        $temp_str_acad_yr1 = substr($data['student_academic_year'],2,2);
                        $temp_str_acad_yr2 = substr($data['student_academic_year'],-2);
                        $acad_yr_prefix = $temp_str_acad_yr1."-".$temp_str_acad_yr2;

                        ////old static code start
                        // if($data['ajax_institute_id'] == NULL and $data['ajax_school_id']=="2")
                        // {
                        //     $data['new_challan_no'] = "CH/WSS/".$acad_yr_prefix."/".$sch;
                        //     $data['ajax_institute_id'] = 0;
                        // }
                        // else if($data['ajax_institute_id'] == "2" && $data['ajax_school_id'] == NULL)
                        // {
                        //     $data['new_challan_no'] = "CH/RET/".$acad_yr_prefix."/".$ins;
                        //     $data['ajax_school_id'] = 0;
                        // }
                        // else if($data['ajax_institute_id'] == "1" && $data['ajax_school_id'] == NULL)
                        // {
                        //     $data['new_challan_no'] = "CH/U/".$acad_yr_prefix."/".$ins;
                        //     $data['ajax_school_id'] = 0;
                        // }
                        ////old static code end

                        $ch_school_prefix = "";
                        for ($xy=0; $xy < count($ret_get_sch_data); $xy++) { 
                            if ($data['ajax_school_id'] == $ret_get_sch_data[$xy]['school_id']) {
                                $ch_school_prefix = $ret_get_sch_data[$xy]['school_prefix'];
                                break;
                            }                            
                        }

                        if($data['ajax_institute_id'] == NULL and $data['ajax_school_id'] == $_SESSION['school_id'])
                        {
                            $data['new_challan_no'] = "CH/".$ch_school_prefix."/".$acad_yr_prefix."/".$sch;
                            $data['ajax_institute_id'] = 0;
                        }
                        else if($data['ajax_institute_id'] == "2" && $data['ajax_school_id'] == NULL)
                        {
                            $data['new_challan_no'] = "CH/RET/".$acad_yr_prefix."/".$ins;
                            $data['ajax_school_id'] = 0;
                        }
                        else if($data['ajax_institute_id'] == "1" && $data['ajax_school_id'] == NULL)
                        {
                            $data['new_challan_no'] = "CH/U/".$acad_yr_prefix."/".$ins;
                            $data['ajax_school_id'] = 0;
                        }

                        $update_last_used_challan_unique_id = $this -> challan_model -> update_last_used_challan_unique_id($data);
                        
                        $data['date'] = date("Y-m-d H:i:s");

                        for($i=0;$i<count($fee_head_id);$i++)
                        {
                            $data['fee_head_id'] = $fee_head_id[$i];
                            $data['fee_head_name'] = $ajax_fee_head_name[$i];
                            $data['fee_head_amt'] = $fee_head_amt[$i];
                            
                            $insert_into_walnut_challan = $this -> challan_model -> insert_into_walnut_challan($data);  //insert into challan table
                        }
                    }
                    $data['challan_no'] = $data['new_challan_no'];

                }//end if fee_head_id null
            }
            $html_page = $html_page.$this->load->view('account/challan/view_print_challan',$data,true);
        }

        $html_page = $html_page."</body></html>";
        // echo $html_page;return;
        require_once APP_ROOT_PATH.'/library/dompdf/autoload.inc.php';
        $old_limit = ini_set("memory_limit", "2048M");
        $dompdf = new Dompdf\Dompdf();
        $dompdf->set_paper('A4',"landscape");    
        
        $dompdf->load_html($html_page);
        $dompdf->render();
        // $dompdf->stream("Challan.pdf");
        // $dompdf->clear();
        $output = $dompdf->output();

        $file_name=rand(0, 5000);
        file_put_contents('./application/uploads/challans/Challan'.$file_name.'.pdf', $output);
        $url=base_url()."application/uploads/challans/Challan".$file_name.".pdf";
        echo anchor($url, '"Download Challan"', array('target' => '_blank'));
    }
  
}
?>
```
{{< /details >}}



## __construct
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This is the constructor function of a class. It initializes the class by performing the following tasks:

1. Calls the parent constructor.
2. Starts a session.
3. Sets the default timezone to 'Asia/Kolkata'.
4. Checks if the user is logged in.
5. Loads the 'challan_model', 'Continuity_form_model', and 'Class_division_model' models.

{{< details "source code " >}}
```php
public function __construct()
    {
        parent::__construct();
        @session_start();
        date_default_timezone_set('Asia/Kolkata');
        Check_Access_helper::is_logged_in();
        $this->load->model('account/challan_model');
        $this->load->model('student/Continuity_form_model');
        $this->load->model('common/Class_division_model');
    }
```
{{< /details >}}

## view
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is responsible for rendering the view for the Challan page. It sets up the necessary data for the view, such as page name, icon, title, date, description, and breadcrumb. It also retrieves class data from the Class_division_model and passes it to the view. Finally, it loads the main template and renders the view.

### Refactoring
1. Extract the setting up of page data into a separate function for better organization and reusability.
2. Move the retrieval of class data to a separate function in the Class_division_model for better separation of concerns.
3. Consider using a template engine to render the view instead of directly loading the main template.

{{< details "source code " >}}
```php
public function view()
    {
        $data['page_data']['page_name'] = 'Challan';
        $data['page_data']['page_icon'] = 'fa fa-pencil-square-o';
        $data['page_data']['page_title'] = 'Challan';
        $data['page_data']['page_date'] = date("d M Y");
        $data['page_data']['page_description'] = 'This is module that manages movement of Workseets given out as teaching material';
        $data['page_data']['breadcrumb'] = '<li>Administrator</li>  <li class="active">Manage Worksheets</li>';
       
        $returned_class_data = $this->Class_division_model->get_class_data($data);
       
        if ($returned_class_data != NULL) {
            $data['page_data']['class_rows'] = $returned_class_data;
        } else {
            $data['page_data']['class_rows'] = NULL;
        }

        $data['main_content'] = array('account/challan/view_challan');
        $this->load->view('templates/main_template', $data);
    }
```
{{< /details >}}

## get_class_id
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to get the class ID based on the reference number provided in the POST data. It retrieves the class information from the database and returns the class ID, division ID, and academic year of the student. It also retrieves the class data and division data from the database and passes it to the view for rendering.

### User Acceptance Criteria
```gherkin
Feature: Get Class ID
Scenario: Retrieve class ID based on reference number
Given A reference number is provided
When The get_class_id function is called
Then The class ID, division ID, and academic year of the student are retrieved
And The class data and division data are retrieved
```

### Refactoring
1. Extract the retrieval of class information into a separate function for better code organization.
2. Use dependency injection to pass the models as dependencies instead of accessing them directly.
3. Use a data transfer object (DTO) to pass the retrieved data to the view instead of directly passing the data array.

{{< details "source code " >}}
```php
public function get_class_id()
    {
        $data['ref_no'] = $_POST['ref_no'];

        //get class information
        $returned_student_class_data = $this -> challan_model -> get_student_info_data($data);
        if($returned_student_class_data != NULL)
        {
            foreach ($returned_student_class_data ->result() as  $student_row) 
            {
                $class_id = $student_row->admission_to;
                $division_id = $student_row->division; 
                $student_academic_year = $student_row->academic_year; 
                $data['class_id'] = $class_id;
                $data['student_division_id'] = $division_id;
            }

            $data['returned_student_class_data'] = $returned_student_class_data; 
        }
        $returned_class_data = $this -> Class_division_model -> get_class_data();
        if ($returned_class_data != NULL)
        {
            $data['class_rows'] = $returned_class_data;
        }
        else
        {
            $data['class_rows'] = NULL;
        }

        //get division and class relation
        // $returned_class_division_relation = $this -> challan_model -> returned_class_division_relation($class_id,$student_academic_year);
        // if($returned_class_division_relation != NULL)
        // {
        //     $data['returned_class_division_relation'] = $returned_class_division_relation; 
        // }
        // else
        // {
        //     $data['returned_class_division_relation'] = NULL; 
        // }

        $returned_division_data = $this->Class_division_model->get_division_data($class_id);
        if ($returned_division_data != NULL)
        {
            $data['division_rows'] = $returned_division_data;
        }else{
            $data['division_rows'] = NULL;
        }


        $this->load->view('account/challan/ajax_get_class_div', $data);
        
    }
```
{{< /details >}}

## get_installment_info
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to get the installment information for a student. It retrieves the student class ID and academic year from the POST data, calls the `get_installment_id` method of the `challan_model` to get the installment ID, and then loads a view to display the installment information.

### User Acceptance Criteria
```gherkin
Feature: Get Installment Info

Scenario: Retrieve installment information for a student
Given The student class ID is provided
And The student academic year is provided
When The get_installment_info function is called
Then The installment ID is retrieved
And The installment information is displayed
```

### Refactoring
1. Use dependency injection to inject the `challan_model` instead of accessing it directly.
2. Move the retrieval of the student class ID and academic year to a separate method for better separation of concerns.
3. Use a more descriptive variable name instead of `data`.
4. Consider using a template engine to load the view instead of directly calling `load->view`.

{{< details "source code " >}}
```php
public function get_installment_info()
    {
        $data['student_class_id'] = $_POST['student_class_id'];
        $data['student_academic_year'] = $_POST['student_academic_year'];

        $return_installment_id = $this -> challan_model -> get_installment_id($data);
        if($return_installment_id != NULL)
        {
            $data['return_installment_id'] = $return_installment_id; 
        }
        $this->load->view('account/challan/ajax_get_installment_id', $data);
    }
```
{{< /details >}}

## get_student_fee_info
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
This function is used to get the fee information of a student. It retrieves the necessary data from the database based on the input parameters and returns the fee details.

### User Acceptance Criteria
```gherkin
Feature: Get Student Fee Info
Scenario: Retrieve fee information for a student
Given The student class ID is provided
And The student division ID is provided
And The student installment ID is provided
And The student academic year is provided
And The student institute text is provided
And The student institute value is provided
When The get_student_fee_info function is called
Then The fee information for the student is retrieved
```

### Refactoring
1. Extract the code for retrieving ref_no_array into a separate function.
2. Extract the code for retrieving bank details into a separate function.
3. Extract the code for retrieving studentwise instll data into a separate function.
4. Extract the code for checking paid or not into a separate function.
5. Extract the code for retrieving class data into a separate function.

{{< details "source code " >}}
```php
public function get_student_fee_info()
    {
        $data['get_fee_head_id'] = NULL;
        $data['temp_sch_id'] = NULL;
        $data['temp_inst_id'] = NULL;
        
        $data['school_id'] = NULL;
        $data['Instt_id'] = NULL;

        $data['class_id'] = $_POST['student_class_id'];
        $data['division_id'] = $_POST['student_division_id'];
        $data['student_installment_id'] = $_POST['student_installment_id'];
        $data['student_academic_year'] = $_POST['student_academic_year'];
        $student_institute_text = $_POST['student_institute_text'];
        $student_institute_value = $_POST['student_institute_value'];

        $ref_no_array = array();
        if($_POST['is_ref_no'] == '1'){
            $data['ref_no'] = $_POST['ref_no'];
            $ref_no_details = $this -> challan_model -> get_student_info_data($data);
            if ($ref_no_details != NULL) {
                $ref_no_array = $ref_no_details;
            }

        }else{
            $ref_no_list = $this -> challan_model -> get_ref_no_data_by_class($data['class_id'], $data['division_id'], $data['student_academic_year']);
            if ($ref_no_list != NULL) {
                $ref_no_array = $ref_no_list;
            }
        }
        $data['ref_no_array'] = $ref_no_array;

        if($student_institute_value == "SCH")
        {
            $data['temp_sch_id'] = $student_institute_text;
            $data['where_clause'] = " walnut_school_master.school_name = '".$data['temp_sch_id']."'";
        }
        else
        {
            $data['temp_inst_id'] = $student_institute_text;
            $data['where_clause'] = "walnut_institute.Instt_Name = '".$data['temp_inst_id']."'";
        }
        $return_student_fee_info = $this -> challan_model -> get_student_fee_info($data);
        if($return_student_fee_info != NULL)
        {
            $data['return_student_fee_info'] = $return_student_fee_info;
            
            //get school id and institute id for bank details
            foreach($return_student_fee_info->result() as $school_id_row)
            {
                if($school_id_row->school_id != NULL)
                {
                    $data['school_id'] = $school_id_row->school_id;
                    $data['Instt_id'] = NULL;
                }
                else
                {
                    $data['Instt_id'] = $school_id_row->Instt_id;
                    $data['school_id'] = NULL;
                }
            }
        }else{
            $data['return_student_fee_info'] = NULL;
        }

        $data['account_name'] = "None";
        $data['account_number'] = "None";
        $data['bank_name'] = "None";
        $data['bank_id'] = "";

        $new_yrwise_stud_array = NULL;
        $paid_fee_head_id_array = NULL;
        $ref_no_list = $ref_no_array->result_array();
        for ($i=0; $i < count($ref_no_list); $i++) { 

            //get studentwise instll data as year and refno combn start
            $get_student_cont_data = $this -> Continuity_form_model -> get_row_continuity($ref_no_list[$i]['refno'], $data['student_academic_year']);
            $computed_class = NULL;
            if($get_student_cont_data != NULL)
            {
                $get_student_cont_row = $get_student_cont_data->result_array();
                for($m = 0; $m<count($get_student_cont_row);$m++)
                {
                    // if($data['student_academic_year'] == $get_student_cont_row[0]['next_academic_year'])
                    // {
                    $computed_class = $get_student_cont_row[0]['next_class'];
                    // }
                    // else
                    // {
                        // $temp_array['ref_no'] = $ref_no_list[$i]['refno'];
                        // $ret_refno_data = $this -> challan_model -> get_student_info_data($temp_array);
                    //     if ($ret_refno_data != NULL) {
                    //         $ret_refno_row = $ret_refno_data->row();
                    //         $curr_admission_to = $ret_refno_row->admission_to; 
                    //     }else{
                    //         $ret_refno_row = NULL;
                    //         $curr_admission_to = NULL;
                    //     }
                    //     $computed_class = $curr_admission_to;
                    // }

                    // //check status start
                    // if($ref_no_list[$i]['status'] == 1)
                    // { 
                    //     $computed_class = $ref_no_list[$i]['admission_to'];
                    // }
                    // else if($ref_no_list[$i]['status'] == 2 && $data['student_academic_year'] != $_SESSION['academic_year']){
                    //     $computed_class = $ref_no_list[$i]['admission_to'] + 1;
                    // }  
                    // //check status end

                    $data['class_id'] = $computed_class;
                    
                    $get_student_current_class_name = $this -> Class_division_model -> get_class_name($data);
                    if($get_student_current_class_name != NULL)
                    {
                        $student_current_class_name = $get_student_current_class_name->result_array();
                        $data['class_name'] = $student_current_class_name[0]['class_name'];
                    }
                    else
                    {
                        $data['class_name'] = NULL;
                    }
                }
            }else{

                $temp_array['ref_no'] = $ref_no_list[$i]['refno'];
                $ret_refno_data = $this -> challan_model -> get_student_info_data($temp_array);
                if ($ret_refno_data != NULL) {
                    $ret_refno_row = $ret_refno_data->row();
                    $computed_class = $ret_refno_row->admission_to; 
                }else{
                    $ret_refno_row = NULL;
                    $computed_class = NULL;
                }

                //check status start
                if($ref_no_list[$i]['status'] == 1)
                { 
                    $computed_class = $ref_no_list[$i]['admission_to'];
                }
                else if($ref_no_list[$i]['status'] == 2 && $data['student_academic_year'] != $_SESSION['academic_year']){
                    $computed_class = $ref_no_list[$i]['admission_to'] + 1;
                }  
                //check status end

                $data['class_id'] = $computed_class;

                $get_student_current_class_name = $this -> Class_division_model -> get_class_name($data);
                if($get_student_current_class_name != NULL)
                {
                    $student_current_class_name = $get_student_current_class_name->result_array();
                    $data['class_name'] = $student_current_class_name[0]['class_name'];
                }
                else
                {
                    $data['class_name'] = NULL;
                }
            }

            $paid_fee_head_id_array_stu = NULL;
            $temp_get_fee_head_id = $this -> challan_model -> get_fee_head_id($data, $ref_no_list[$i]['refno']);
            if($temp_get_fee_head_id != NULL)
            {
                $paid_fee_head_id_array_stu = $temp_get_fee_head_id->result_array();
                
            }





            $where_clause = '';
            if($student_institute_value == "SCH")
            {
                $temp_sch_id = $student_institute_text;
                $where_clause = "and walnut_school_master.school_name = '".$temp_sch_id."'";
            }
            else
            {
                $temp_inst_id = $student_institute_text;
                $where_clause = "and walnut_institute.Instt_Name = '".$temp_inst_id."'";
            }
            
            $student_installment_id = $data['student_installment_id'];
            $ret_return_student_fee_data = NULL;
            $return_student_fee_data = $this -> challan_model -> get_student_fee_info_by_stu($where_clause, $student_installment_id, $computed_class, $data['student_academic_year']);



            if($return_student_fee_data != NULL)
            {
                 $ret_return_student_fee_data = $return_student_fee_data->result_array();
            }

            $new_yrwise_stud_array[$ref_no_list[$i]['refno']] = array('refno'=> $ref_no_list[$i]['refno'], 'calc_class_id'=> $computed_class, 'fee'=> $ret_return_student_fee_data, 'ref_data' => $ref_no_list[$i] , 'is_paid' => $paid_fee_head_id_array_stu);
            //get studentwise instll data as year and refno combn start






            //check paid or not

            $temp_get_fee_head_id = $this -> challan_model -> get_fee_head_id($data, $ref_no_list[$i]['refno']);
            if($temp_get_fee_head_id != NULL)
            {
                $paid_fee_head_id_array[$i] = $temp_get_fee_head_id->result_array();
                
            }

            //get bank details
            $get_bank_details = $this -> challan_model -> get_bank_details($data);
            if($get_bank_details != NULL)
            {
                foreach ($get_bank_details->result() as $bank_row) 
                {
                    if($bank_row->school_id == $_SESSION['school_id'] and $bank_row->Instt_id == '0')
                    {
                        if($data['class_id'] < 12)//for kg 
                        {
                            if($bank_row->account_name == "UESF Walnut School KG")
                            {
                                $data['account_name'] = $bank_row->account_name;
                                $data['account_number'] = $bank_row->account_number;
                                $data['branch_name'] = $bank_row->branch_name;
                                $data['temp_bank_name'] = $bank_row->bank_name;
                                $get_bank_name =  $this -> challan_model -> get_bank_name($data);//get_bank_name
                                if($get_bank_name != NULL)
                                {
                                    foreach($get_bank_name->result() as $bank_value)
                                    {
                                        $data['bank_name'] = $bank_value->Bank;
                                        $data['bank_id'] = $bank_value->cat_id;
                                    }
                                }

                            }
                        }
                        else //for primary
                        {
                            if($bank_row->account_name == "UESF Walnut School")
                            {
                                $data['account_name'] = $bank_row->account_name;
                                $data['account_number'] = $bank_row->account_number;
                                $data['branch_name'] = $bank_row->branch_name;
                                $data['temp_bank_name'] = $bank_row->bank_name;
                                $get_bank_name =  $this -> challan_model -> get_bank_name($data);//get_bank_name
                                if($get_bank_name != NULL)
                                {
                                    foreach($get_bank_name->result() as $bank_value)
                                    {
                                        $data['bank_name'] = $bank_value->Bank;
                                        $data['bank_id'] = $bank_value->cat_id;
                                    }
                                }

                            }
                        }
                        
                    }//end if school id check 
                    if($bank_row->school_id == '0' and $bank_row->Instt_id == '2')
                    {
                        if($bank_row->account_name == "Rethink Educational System Pvt Ltd")
                        {
                            $data['account_name'] = $bank_row->account_name;
                            $data['account_number'] = $bank_row->account_number;
                            $data['branch_name'] = $bank_row->branch_name;
                            $data['temp_bank_name'] = $bank_row->bank_name;
                            $get_bank_name =  $this -> challan_model -> get_bank_name($data);//get_bank_name
                            if($get_bank_name != NULL)
                            {
                                foreach($get_bank_name->result() as $bank_value)
                                {
                                    $data['bank_name'] = $bank_value->Bank;
                                    $data['bank_id'] = $bank_value->cat_id;
                                }
                            }
                        }
                    }// end if institute check

                }//end foreach
            }
        }
        $data['get_fee_head_id'] = $paid_fee_head_id_array;


        $data['new_yrwise_stud_array'] = $new_yrwise_stud_array;
        $data['student_institute_text'] = $student_institute_text;
        $data['student_institute_value'] = $student_institute_value;

        $returned_class_data = $this->Class_division_model->get_class_data($data);
        if ($returned_class_data != NULL) {
            $data['class_rows'] = $returned_class_data;
        } else {
            $data['class_rows'] = NULL;
        }

        $data['page_name'] = 'Challan';
        $data['page_icon'] = 'fa fa-pencil-square-o';
        $data['page_title'] = 'Challan';

        $this->load->view('account/challan/ajax_get_challan_fee_details', $data);

    }
```
{{< /details >}}

## get_school_name
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to get the school name for a given student class, installment, and academic year. It retrieves the school name from the `challan_model`.

### User Acceptance Criteria
```gherkin
Feature: Get School Name
Scenario: Retrieve school name
Given The student class ID is provided
And The student installment ID is provided
And The student academic year is provided
When The get_school_name function is called
Then The school name is returned
```

### Refactoring
There are no specific refactoring opportunities for this function.

{{< details "source code " >}}
```php
public function get_school_name()
    {
        $data['return_get_school_name'] = NULL;
        $data['student_class_id'] = $_POST['student_class_id'];
        $data['student_installment_id'] = $_POST['student_installment_id'];
        $data['student_academic_year'] = $_POST['student_academic_year'];

        $return_get_school_name = $this -> challan_model -> get_school_name($data);
        if($return_get_school_name != NULL)
        {
            $data['return_get_school_name'] = $return_get_school_name; 
        }

        $this->load->view('account/challan/ajax_get_school_institute_name', $data);
    }
```
{{< /details >}}

## view_challan_print
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
This function is used to view and print challan. It retrieves the necessary data from the database and generates a PDF file containing the challan details.

### User Acceptance Criteria
```gherkin
Feature: View and Print Challan
Scenario: User views and prints a challan
Given The user has selected a combination of unpaid transactions
When The user clicks on the view and print challan button
Then The system retrieves the necessary data from the database
And The system generates a PDF file containing the challan details
And The system displays a download link for the PDF file
```

### Refactoring
1. Extract the code for generating the HTML page into a separate function for better code organization.
2. Use a template engine to generate the HTML page instead of concatenating strings.
3. Move the code for generating the PDF file into a separate function for better code organization.
4. Use a library or service for generating the PDF file instead of relying on a specific library.
5. Use a more descriptive variable name instead of 'html_page' to improve code readability.

{{< details "source code " >}}
```php
public function view_challan_print()
    {
        if (isset($_POST['ajax_ref_no'])) {
            $data['ajax_ref_no'] = $_POST['ajax_ref_no'];
        }else{
            $data['ajax_ref_no'] = array();    
            $this->session->set_userdata('msg', 'No unpaid transactions found for selected combination.');
            redirect("challan/view");
        }

        $data['ajax_class_name'] = $_POST['ajax_class_name'];
        $data['ajax_account_name'] = $_POST['ajax_account_name'];
        $data['ajax_account_number'] = $_POST['ajax_account_number'];
        $data['ajax_total_amount'] = $_POST['ajax_total_amount'];
        $ajax_fee_head_name = $_POST['ajax_fee_head_name'];
        $data['ajax_bank_name'] = $_POST['ajax_bank_name'];
        $data['ajax_bank_id'] = $_POST['ajax_bank_id'];
        $data['ajax_school_id'] = $_POST['ajax_school_id'];
        $data['ajax_institute_id'] = $_POST['ajax_institute_id'];
        $fee_head_amt = $_POST['fee_head_amt'];
        
        $fee_head_id = NULL;
        $data['ajax_fee_head_id'] = NULL;
        $data['ajax_fee_head_amt'] = NULL;
        $data['ajax_fee_head_name'] = NULL;

        if(isset($_POST['fee_head_id']))
        {
            $fee_head_id = $_POST['fee_head_id'];
            $data['ajax_fee_head_id'] = $_POST['fee_head_id'];
            $data['ajax_fee_head_amt'] = $_POST['fee_head_amt'];
            $data['ajax_fee_head_name'] = $_POST['ajax_fee_head_name'];
        }
        $data['student_academic_year'] = $_POST['student_academic_year'];
        $data['student_installment_id'] = $_POST['student_installment_id'];

        
        $ref_no_array = array();

        $refno_list = $data['ajax_ref_no'];
        $ref_no_list = $this -> challan_model -> get_ref_no_list_data($refno_list, $data['student_academic_year']);
        if ($ref_no_list != NULL) {
            $ref_no_array = $ref_no_list->result_array();
        }


        $get_sch_data = $this -> challan_model -> get_all_sch_data();
        if ($get_sch_data != NULL) {
            $ret_get_sch_data = $get_sch_data->result_array();
        }else{
            $ret_get_sch_data = NULL;
        }

        if ($ret_get_sch_data == NULL) {
            echo '<p style="color:red; text-align:center;">School data not found! Please contact Administrator.</p>';
            return;
        }

        $html_page = NULL;
        for ($a=0; $a < count($ref_no_array); $a++) { 
            
            $data['ajax_ref_no'] = $ref_no_array[$a]['refno'];
            $data['ajax_stud_name'] = $ref_no_array[$a]['first_name']." ".$ref_no_array[$a]['last_name'];

            $challan_data_array = array();
            $data['get_payment_mode'] = NULL;
            $is_refno_entry_present = NULL;
            $data['payment_mode'] = NULL;


            //check if refno entry is already present start
            for ($x=0; $x < count($fee_head_id); $x++) { 
                $temp_fee_head_id = $fee_head_id[$x];
                
                if($data['ajax_school_id'] == NULL){
                    $temp_ajax_school_id = '0';
                }else{
                    $temp_ajax_school_id = $data['ajax_school_id'];
                }
                if($data['ajax_institute_id'] == NULL){
                    $temp_ajax_institute_id = '0';
                }else{
                    $temp_ajax_institute_id = $data['ajax_institute_id'];
                }
                $get_refno_entry = $this -> challan_model -> get_refno_entry($data, $temp_fee_head_id, $temp_ajax_school_id, $temp_ajax_institute_id);
                if ($get_refno_entry != NULL) {
                    $temp_array = $get_refno_entry->result_array();
                    array_push($challan_data_array,$temp_array[0]);  
                    $is_refno_entry_present = TRUE;
                }else{
                    $is_refno_entry_present = FALSE;
                }
            }





            $get_student_cont_data = $this -> Continuity_form_model -> get_row_continuity($ref_no_array[$a]['refno'], $data['student_academic_year']);
            $computed_class = NULL;
            if($get_student_cont_data != NULL)
            {
                $get_student_cont_row = $get_student_cont_data->result_array();
                for($m = 0; $m<count($get_student_cont_row);$m++)
                {
                    $computed_class = $get_student_cont_row[0]['next_class'];
                    
                    $data['class_id'] = $computed_class;
                    
                    $get_student_current_class_name = $this -> Class_division_model -> get_class_name($data);
                    if($get_student_current_class_name != NULL)
                    {
                        $student_current_class_name = $get_student_current_class_name->result_array();
                        $data['class_name'] = $student_current_class_name[0]['class_name'];
                    }
                    else
                    {
                        $data['class_name'] = NULL;
                    }
                }
            }else{

                $temp_array['ref_no'] = $ref_no_array[$a]['refno'];
                $ret_refno_data = $this -> challan_model -> get_student_info_data($temp_array);
                if ($ret_refno_data != NULL) {
                    $ret_refno_row = $ret_refno_data->row();
                    $computed_class = $ret_refno_row->admission_to; 
                }else{
                    $ret_refno_row = NULL;
                    $computed_class = NULL;
                }
                
                //check status start
                if($ref_no_array[$a]['status'] == 1)
                { 
                    $computed_class = $ref_no_array[$a]['admission_to'];
                }
                else if($ref_no_array[$a]['status'] == 2 && $data['student_academic_year'] != $_SESSION['academic_year']){
                    $computed_class = $ref_no_array[$a]['admission_to'] + 1;
                }  
                //check status end

                $data['class_id'] = $computed_class;

                $get_student_current_class_name = $this -> Class_division_model -> get_class_name($data);
                if($get_student_current_class_name != NULL)
                {
                    $student_current_class_name = $get_student_current_class_name->result_array();
                    $data['class_name'] = $student_current_class_name[0]['class_name'];
                }
                else
                {
                    $data['class_name'] = NULL;
                }
            }


            $student_institute_text = $_POST['student_institute_text'];
            $student_institute_value = $_POST['student_institute_value'];


            $where_clause = '';
            if($student_institute_value == "SCH")
            {
                $temp_sch_id = $student_institute_text;
                $where_clause = "and walnut_school_master.school_name = '".$temp_sch_id."'";
            }
            else
            {
                $temp_inst_id = $student_institute_text;
                $where_clause = "and walnut_institute.Instt_Name = '".$temp_inst_id."'";
            }
            
            $student_installment_id = $data['student_installment_id'];
            $ret_return_student_fee_data = NULL;
            $return_student_fee_data = $this -> challan_model -> get_student_fee_info_by_stu($where_clause, $student_installment_id, $computed_class, $data['student_academic_year']);


            if($return_student_fee_data != NULL)
            {
                 $ret_return_student_fee_data = $return_student_fee_data->result_array();
            }
            
            $new_yrwise_stud_array = NULL;
            $new_yrwise_stud_array[$ref_no_array[$a]['refno']] = array('refno'=> $ref_no_array[$a]['refno'], 'calc_class_id'=> $computed_class, 'fee'=> $ret_return_student_fee_data);
            
            $data['new_yrwise_stud_array'] = $new_yrwise_stud_array[$ref_no_array[$a]['refno']];

            //get studentwise instll data as year and refno combn start








            //check if refno entry is already present end

            if ($is_refno_entry_present)       //if refno entry is already present
            {                                          
                for ($y=0; $y < count($challan_data_array); $y++) { 
                    $data['challan_no'] = $challan_data_array[$y]["challan_no"];
                    $data['date'] = $challan_data_array[$y]["created_date"];
                }

            }else{
                if($fee_head_id != NULL && $fee_head_id != "")                                              // to check if unpaid are not included
                {
                    $get_last_challan_used_no = $this -> challan_model -> get_last_challan_used_no($data);

                    if($get_last_challan_used_no == NULL)                                                   //if no entry is present insert into last number
                    {
                        $last_used_unique_no = 000;
                        $new_unique_no = $last_used_unique_no + 1;
                        $data['new_unique_no'] = $new_unique_no;

                        if ($data['ajax_school_id'] != 0) {
                            $sch = str_pad($new_unique_no, 3, '0', STR_PAD_LEFT);
                        }
                        if ($data['ajax_institute_id'] != 0) {
                            $ins = str_pad($new_unique_no, 3, '0', STR_PAD_LEFT);
                        }

                        $temp_str_acad_yr1 = substr($data['student_academic_year'],2,2);
                        $temp_str_acad_yr2 = substr($data['student_academic_year'],-2);
                        $acad_yr_prefix = $temp_str_acad_yr1."-".$temp_str_acad_yr2;

                        ////old static code start
                        // if($data['ajax_institute_id'] == NULL and $data['ajax_school_id']=="2")
                        // {
                            
                        //     $data['new_challan_no'] = "CH/WSS/".$acad_yr_prefix."/".$sch;
                        //     $data['ajax_institute_id'] = 0;
                        //     $insert_into_last_challan_used_no = $this -> challan_model -> insert_into_last_challan_used_no($data);
                        //     if($insert_into_last_challan_used_no){
                        //     }else{
                        //         echo 'could not insert';
                        //     }
                        // }
                        // else if($data['ajax_institute_id'] == '2' and $data['ajax_school_id'] == NULL)
                        // {
                        //     $data['new_challan_no'] = "CH/RET/".$acad_yr_prefix."/".$ins;
                        //     $data['ajax_school_id'] = 0;
                        //     $insert_into_last_challan_used_no = $this -> challan_model -> insert_into_last_challan_used_no($data);
                        //     if($insert_into_last_challan_used_no){
                        //     }else{
                        //         echo 'could not insert';
                        //     }
                        // }
                        // else if($data['ajax_institute_id'] == '1' and $data['ajax_school_id'] == NULL)
                        // {
                        //     $data['new_challan_no'] = "CH/U/".$acad_yr_prefix."/".$ins;
                        //     $data['ajax_school_id'] = 0;
                        //     $insert_into_last_challan_used_no = $this -> challan_model -> insert_into_last_challan_used_no($data);
                        //     if($insert_into_last_challan_used_no){
                        //     }else{
                        //         echo 'could not insert';
                        //     }
                        // }
                        ////old static code end

                        $ch_school_prefix = "";
                        for ($xy=0; $xy < count($ret_get_sch_data); $xy++) { 
                            if ($data['ajax_school_id'] == $ret_get_sch_data[$xy]['school_id']) {
                                $ch_school_prefix = $ret_get_sch_data[$xy]['school_prefix'];
                                break;
                            }                            
                        }


                        if($data['ajax_institute_id'] == NULL and $data['ajax_school_id'] == $_SESSION['school_id'])
                        {
                            
                            $data['new_challan_no'] = "CH/".$ch_school_prefix."/".$acad_yr_prefix."/".$sch;
                            $data['ajax_institute_id'] = 0;
                            $insert_into_last_challan_used_no = $this -> challan_model -> insert_into_last_challan_used_no($data);
                            if($insert_into_last_challan_used_no){
                            }else{
                                echo 'could not insert';
                            }
                        }
                        else if($data['ajax_institute_id'] == '2' and $data['ajax_school_id'] == NULL)
                        {
                            $data['new_challan_no'] = "CH/RET/".$acad_yr_prefix."/".$ins;
                            $data['ajax_school_id'] = 0;
                            $insert_into_last_challan_used_no = $this -> challan_model -> insert_into_last_challan_used_no($data);
                            if($insert_into_last_challan_used_no){
                            }else{
                                echo 'could not insert';
                            }
                        }
                        else if($data['ajax_institute_id'] == '1' and $data['ajax_school_id'] == NULL)
                        {
                            $data['new_challan_no'] = "CH/U/".$acad_yr_prefix."/".$ins;
                            $data['ajax_school_id'] = 0;
                            $insert_into_last_challan_used_no = $this -> challan_model -> insert_into_last_challan_used_no($data);
                            if($insert_into_last_challan_used_no){
                            }else{
                                echo 'could not insert';
                            }
                        }

                        $data['date'] = date("Y-m-d H:i:s");
                        for($i=0;$i<count($fee_head_id);$i++)
                        {
                            $data['fee_head_id'] = $fee_head_id[$i];
                            $data['fee_head_name'] = $ajax_fee_head_name[$i];
                            $data['fee_head_amt'] = $fee_head_amt[$i];
                            
                            $insert_into_walnut_challan = $this -> challan_model -> insert_into_walnut_challan($data);
                        }
                   
                    }else{                                                                          //if entry present then update it

                        $temp_new_challan_no = NULL;
                        $temp_new_challan_no = $get_last_challan_used_no->result_array();
                        
                        //update into last no table
                        $last_challan_prim_key = $temp_new_challan_no[0]['last_challan_id'];          //get prim key where it needs to be updated
                        $data['last_challan_id'] = $last_challan_prim_key;
                        
                        $last_used_unique_no = $temp_new_challan_no[0]['last_used_unique_no'];
                        $new_unique_no = $last_used_unique_no + 1;
                        $data['new_unique_no'] = $new_unique_no;

                        if ($data['ajax_school_id'] != 0) {
                            $sch = str_pad($new_unique_no, 3, '0', STR_PAD_LEFT);
                        }
                        if ($data['ajax_institute_id'] != 0) {
                            $ins = str_pad($new_unique_no, 3, '0', STR_PAD_LEFT);
                        }

                        $temp_str_acad_yr1 = substr($data['student_academic_year'],2,2);
                        $temp_str_acad_yr2 = substr($data['student_academic_year'],-2);
                        $acad_yr_prefix = $temp_str_acad_yr1."-".$temp_str_acad_yr2;

                        ////old static code start
                        // if($data['ajax_institute_id'] == NULL and $data['ajax_school_id']=="2")
                        // {
                        //     $data['new_challan_no'] = "CH/WSS/".$acad_yr_prefix."/".$sch;
                        //     $data['ajax_institute_id'] = 0;
                        // }
                        // else if($data['ajax_institute_id'] == "2" && $data['ajax_school_id'] == NULL)
                        // {
                        //     $data['new_challan_no'] = "CH/RET/".$acad_yr_prefix."/".$ins;
                        //     $data['ajax_school_id'] = 0;
                        // }
                        // else if($data['ajax_institute_id'] == "1" && $data['ajax_school_id'] == NULL)
                        // {
                        //     $data['new_challan_no'] = "CH/U/".$acad_yr_prefix."/".$ins;
                        //     $data['ajax_school_id'] = 0;
                        // }
                        ////old static code end

                        $ch_school_prefix = "";
                        for ($xy=0; $xy < count($ret_get_sch_data); $xy++) { 
                            if ($data['ajax_school_id'] == $ret_get_sch_data[$xy]['school_id']) {
                                $ch_school_prefix = $ret_get_sch_data[$xy]['school_prefix'];
                                break;
                            }                            
                        }

                        if($data['ajax_institute_id'] == NULL and $data['ajax_school_id'] == $_SESSION['school_id'])
                        {
                            $data['new_challan_no'] = "CH/".$ch_school_prefix."/".$acad_yr_prefix."/".$sch;
                            $data['ajax_institute_id'] = 0;
                        }
                        else if($data['ajax_institute_id'] == "2" && $data['ajax_school_id'] == NULL)
                        {
                            $data['new_challan_no'] = "CH/RET/".$acad_yr_prefix."/".$ins;
                            $data['ajax_school_id'] = 0;
                        }
                        else if($data['ajax_institute_id'] == "1" && $data['ajax_school_id'] == NULL)
                        {
                            $data['new_challan_no'] = "CH/U/".$acad_yr_prefix."/".$ins;
                            $data['ajax_school_id'] = 0;
                        }

                        $update_last_used_challan_unique_id = $this -> challan_model -> update_last_used_challan_unique_id($data);
                        
                        $data['date'] = date("Y-m-d H:i:s");

                        for($i=0;$i<count($fee_head_id);$i++)
                        {
                            $data['fee_head_id'] = $fee_head_id[$i];
                            $data['fee_head_name'] = $ajax_fee_head_name[$i];
                            $data['fee_head_amt'] = $fee_head_amt[$i];
                            
                            $insert_into_walnut_challan = $this -> challan_model -> insert_into_walnut_challan($data);  //insert into challan table
                        }
                    }
                    $data['challan_no'] = $data['new_challan_no'];

                }//end if fee_head_id null
            }
            $html_page = $html_page.$this->load->view('account/challan/view_print_challan',$data,true);
        }

        $html_page = $html_page."</body></html>";
        // echo $html_page;return;
        require_once APP_ROOT_PATH.'/library/dompdf/autoload.inc.php';
        $old_limit = ini_set("memory_limit", "2048M");
        $dompdf = new Dompdf\Dompdf();
        $dompdf->set_paper('A4',"landscape");    
        
        $dompdf->load_html($html_page);
        $dompdf->render();
        // $dompdf->stream("Challan.pdf");
        // $dompdf->clear();
        $output = $dompdf->output();

        $file_name=rand(0, 5000);
        file_put_contents('./application/uploads/challans/Challan'.$file_name.'.pdf', $output);
        $url=base_url()."application/uploads/challans/Challan".$file_name.".pdf";
        echo anchor($url, '"Download Challan"', array('target' => '_blank'));
    }
```
{{< /details >}}

## Risks & Security Issues
**__construct**: 

**view**: 

**get_class_id**: 1. The function assumes that the POST data contains a 'ref_no' key, which may not always be the case.
2. The function does not handle cases where the retrieved data is NULL, which may result in errors when accessing the data in the view.
3. The commented out code for retrieving class division relation is not used and should be removed to avoid confusion.

**get_installment_info**: 1. The function assumes that the `$_POST` array will always contain the `student_class_id` and `student_academic_year` keys, which may not be the case.
2. The function does not handle the case where the `get_installment_id` method returns `NULL`.

**get_student_fee_info**: 1. The function is tightly coupled with the database queries, making it difficult to test and maintain.
2. The function has a large number of nested if-else statements, which can make the code difficult to understand and debug.
3. The function is not handling any error cases or exceptions, which can lead to unexpected behavior if there are any issues with the database queries or input parameters.

**get_school_name**: There are no known risks or bugs in this function.

**view_challan_print**: 1. The function does not handle errors or exceptions that may occur during the retrieval of data from the database.
2. The function does not handle errors or exceptions that may occur during the generation of the PDF file.
3. The function does not handle errors or exceptions that may occur during the file download process.
4. The function does not validate the input data received from the user, which may lead to unexpected behavior or security vulnerabilities.
5. The function does not have proper error handling or error reporting mechanisms, making it difficult to troubleshoot issues.

