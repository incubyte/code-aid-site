+++
categories = ["Documentation"]
title = "Account_controller.php"
+++

## File Summary

- **File Path:** application\controllers\account\Account_controller.php
- **LOC:** 3597
- **Last Modified:** Git logs not found
- **Number of Commits (Total / Last 6 Months / Last Month):** Git logs not found
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** Git logs not found
- **Top Contributors:** Git logs not found

{{< details "File source code " >}}
```php
<?php
/**
 * Collection - Controller
 *
 * Handles collection of deposits & fees
 * 1. View - REFNO & details
 * 2. View - Transaction Details
 * 3. View - Payment Details/Receipt History/Duplicate Receipt
 * 4. View - Original Receipt
 * Save Transaction
 * Receipt PDF generation
 * Mail receipt
 *
 * @author Rupali
 */
require_once(APPPATH.'controllers/account/Defaulter_check_controller.php');
class Account_controller extends Defaulter_check_controller
{
	public function __construct()
	{
        parent::__construct();
		@session_start();
		Check_Access_helper::is_logged_in();
    	date_default_timezone_set('Asia/Kolkata');
		$this->load->model('common/System_model');
    	$this->load->model('common/School_model');
		$this->load->model('common/Student_model');
        $this->load->model('common/Class_division_model');
		$this->load->model('account/Fee_model');
        $this->load->model('system/rollover/Academic_rollover_model');
        $this->load->model('student/Continuity_form_model');
        $this->load->model('student/Generic_specific_model');
        $this->load->library('Google_login');
        $this->load->library('Google_classroom');
        $this->load->model('school_cmap/Classroom_model');
        $this->load->model('mobile/Student_app_model');
        $this->load->model('student/Student_welcome_email_model');
	}

	/***
        $collection_type => 'fee' || 'deposit'
        [Default] => $collection_type => fee
    ***/

    /**
     * UI
     * 
     * @return void
     */
	function index(){

		$data['page_data']['page_name'] = 'Student Account';
        $data['page_data']['page_icon'] = 'fa fa-rupee';
        $data['page_data']['page_title'] =  'Student Account';
		$data['page_data']['page_date'] = date("d M Y");
        $data['page_data']['page_description'] = 'This module manages all incoming & outgoing credits & debits on the Student Account.';
        $data['page_data']['breadcrumb'] = '<li>Administrator</li><li class="active">Manage Student Account</li>';

        // All Financial years
        $financial_year = $this -> System_model -> get_financial_year();
        $year_array = array(
                            'previous_year' => $this -> System_model -> get_previous_financial_year(),
                            'financial_year' => $financial_year,
                            'next_year' => $this -> System_model -> get_next_financial_year()
                        );
        $data['all_financial_years'] = $year_array;
        $data['financial_year'] = $financial_year;  // Here default year is selected
        $data['academic_year'] = $this -> System_model -> get_academic_year();

        $data['main_content'] = array('account/student_account/account_landing_view');
	    $this -> load -> view('bootstrap_templates/main_template', $data);
	}

    /**
     * Ajax - Student details view based on refno
     * Financial Year
     * 
     * @return view
     */
	function fetch_student_account(){
        $data['combined_data'] = array();
		$school_id = $_SESSION['school_id'];
        // All Financial years
        $financial_year = $this -> System_model -> get_financial_year();
        $year_array = array(
                            'previous_year' => $this -> System_model -> get_previous_financial_year(),
                            'financial_year' => $financial_year,
                            'next_year' => $this -> System_model -> get_next_financial_year()
                        );
        $data['all_financial_years'] = $year_array;
        $data['financial_year'] = $financial_year;  // Here default year is selected
        $data['academic_year'] = $this -> System_model -> get_academic_year();
        $data['session_school_id'] = $school_id;
        $data['collection_type'] = 'fee';
        $data['transaction_data'] = '';
        
        $data['ref_no'] = strtoupper($this->input->post('ref_no'));
        $sel_financial_year = $this->input->post('financial_year');

        $data['defaulter_check'] = '';
        $student_admission_year =  $this-> Student_model ->fetch_student_specific_info($data['ref_no'], $data['session_school_id'], 'academic_year');
        $student_status =  $this-> Student_model ->fetch_student_specific_info($data['ref_no'], $data['session_school_id'], 'status');

        $data_due['current_academic_year'] = $this -> System_model -> get_academic_year();
        $data_due['next_academic_year'] = $this -> System_model -> get_next_academic_year();
        $data_due['previous_academic_year'] = $this -> System_model -> get_previous_academic_year();
        $data_due['selected_financial_year'] = $selected_financial_year;

        if($sel_financial_year == $year_array['next_year'])
        {
            $student_confirm_next_year =  $this-> Student_model ->fetch_student_specific_info($data['ref_no'], $data['session_school_id'], 'confirm_next_year');
            if($student_confirm_next_year == 0)
            {
                $data['defaulter_check'] = 'Admission is not confirmed for the year '.$sel_financial_year;
            }
        }else if ($student_status == 3 || $student_status == 4) 
        {
            $data['defaulter_check'] = 'Student is cancelled or not attending';
        }else if ($student_admission_year > $sel_financial_year && $student_admission_year >= $data['academic_year']) 
        {
            $data['defaulter_check'] = 'Not Applicable';
        }else
        {
            $defaulter_check = $this->check_student_defaulter($data);
            if($defaulter_check != 0)
            {
                $res_fee_check = explode("~",$defaulter_check);
                if($res_fee_check[1] < $sel_financial_year)
                {
                    $query_installment  = $this-> Fee_model -> fetch_installment($res_fee_check[0],$data['session_school_id']);
                    if ($query_installment != "" || $query_installment != NULL) 
                    {
                        foreach ($query_installment as $rowupdate_installment)
                        {
                            $installment_name  = $rowupdate_installment['name_of_installment'];
                        }
                    }
                    $data['defaulter_check'] = 'Fee is unpaid for '.$installment_name.'  '.$res_fee_check[1];
                }
            }
        }
        if ($sel_financial_year != '' || $sel_financial_year == NULL) {
            $selected_financial_year = $sel_financial_year;
        }else{
            $selected_financial_year = '';
        }
        $data['selected_financial_year'] = $selected_financial_year;
        $data['full_name']  = $this-> Student_model ->get_refno_fullname($data['ref_no'], $school_id);
        $admission_current_class  = $this-> Fee_model ->get_admission_class($data['ref_no'], $school_id); //9

        $admission_class_id = $admission_current_class[0]['class_admitted_to']; //9
        $current_class_id   = $admission_current_class[0]['admission_to']; // 14

        if ($sel_financial_year == '' || $sel_financial_year == null) {
            // ALL years
            // calculate financial years from admission    
            $calculate_gap = $current_class_id - $admission_class_id;
            $get_aca_year = substr($data['financial_year'], 0, 4);
            $calculate_admission_year = $get_aca_year - $calculate_gap;
            $calculate_next_year = $calculate_admission_year + 1;
            $cal_year = $calculate_admission_year."-".$calculate_next_year;
            $data['custom_plan'] = 0;

            for ($i=$admission_class_id; $i <= $current_class_id; $i++) {
                // Payplan according to selected fin year & computed class
                $data['payplan'] = $this-> Fee_model ->get_refno_payplan_details($data['ref_no'], $i, $cal_year,'fee', $school_id);
                if($data['payplan'] == 0)
                {
                    echo "Fee Setup Not Done For Selected Year!";
                    return;
                }

                $refno_fee_custom_plan = $this-> Fee_model -> fetch_default_custom_payplan_refno($data['ref_no'], $cal_year, $i, $school_id, 'fee'); 
                if($refno_fee_custom_plan)
                {
                    $data['custom_plan'] = $refno_fee_custom_plan;
                }

                $data['profile_fee_data'] = $this-> Fee_model ->fetch_fees_profile_details_all($data['ref_no'], $school_id, $i, $cal_year,$data['payplan']);
                if($data['profile_fee_data'] == NULL)
                {
                    $data['fee_data'] = $data['fee_data'] = $this-> Fee_model ->fetch_fees_details_all($data['ref_no'], $school_id, $i, $cal_year, $data['payplan'],$data_due);
                    if($data['fee_data'] == NULL)
                    {
                        echo "Fee Setup Not Done For Selected Year!";
                        return;
                    }
                }

                // concession
                $data['concession_data'] = $this-> Fee_model ->concession_data_all($data['ref_no'], $school_id, $i, $cal_year);
                if($data['concession_data'] != NULL){
                    $data['combined_data'] = array_merge($data['combined_data'], $data['concession_data']);
                }

                $data['paid_data'] = $this-> Fee_model ->fetch_transaction_history_all($data['ref_no'], $school_id, $i, $cal_year);
                if($data['paid_data'] != NULL){
                    $data['combined_data'] = array_merge($data['combined_data'], $data['paid_data']);
                }

                $loop_aca_year = substr($cal_year, 0, 4) + 1;
                $loop_aca_year_sec = substr($cal_year, 5, 10) + 1;

                $cal_year = $loop_aca_year.'-'.$loop_aca_year_sec;
            }

        }else{ // For selected year
                // Student class according to Financial Year selected
                $continuity_array = $this-> Fee_model ->get_computed_continuity_class($data['ref_no'], $selected_financial_year, $data['academic_year'], NULL, $school_id);
                $computed_class_id = $continuity_array['computed_class'];

                // Payplan according to selected fin year & computed class
                $data['payplan'] = $this-> Fee_model ->get_refno_payplan_details($data['ref_no'], $computed_class_id, $selected_financial_year,'fee', $school_id);
                if($data['payplan'] == 0)
                {
                    echo "Fee Setup Not Done For Selected Year!";
                    return;
                }

                $refno_fee_custom_plan = $this-> Fee_model -> fetch_default_custom_payplan_refno($data['ref_no'], $selected_financial_year, $computed_class_id, $school_id, 'fee'); 
                if($refno_fee_custom_plan)
                {
                    $data['custom_plan'] = $refno_fee_custom_plan;
                }

                $data['school_id'] = $school_id;
                $data['class_id'] = $computed_class_id;
                
                $data['partial_fee_data'] = $this-> Fee_model ->fetch_partial_fees_details_all($data['ref_no'], $school_id, $computed_class_id, $selected_financial_year, $data['payplan'],$data_due);
                
                $data['profile_fee_data'] = $this-> Fee_model ->fetch_fees_profile_details_all($data['ref_no'], $school_id, $computed_class_id, $selected_financial_year,$data['payplan']);
                if($data['profile_fee_data'] == NULL){
                    $data['fee_data'] = $this-> Fee_model ->fetch_fees_details_all($data['ref_no'], $school_id, $computed_class_id, $selected_financial_year, $data['payplan'],$data_due);
                    if($data['fee_data'] == NULL)
                    {                       
                        echo "Fee Setup Not Done For Selected Year!";
                        return;
                    }
                }

                // concession
                $data['concession_data'] = $this-> Fee_model ->concession_data_all($data['ref_no'], $school_id, $computed_class_id, $selected_financial_year);
                if($data['concession_data'] != NULL){
                    $data['combined_data'] = array_merge($data['combined_data'], $data['concession_data']);
                }

                // Late Fee
                $data['late_fee_data'] = $this-> Fee_model ->late_fee_data_all($data['ref_no'], $school_id, $computed_class_id, $selected_financial_year);
                if($data['late_fee_data'] != NULL){
                    $data['combined_data'] = array_merge($data['combined_data'], $data['late_fee_data']);
                }
               
                $data['paid_data'] = $this-> Fee_model ->fetch_transaction_history_all($data['ref_no'], $school_id, $computed_class_id, $selected_financial_year);
                if($data['paid_data'] != NULL){
                    $data['combined_data'] = array_merge($data['combined_data'], $data['paid_data']);
                }
        }
        $partial_id_array = array();
        $min_due_date = array();
        $first_payment = 0;
        if($data['profile_fee_data'] != NULL)
        {
            $profile_all_array = array();
            foreach ($data['profile_fee_data'] as $profile_key => $profile_value) 
            {
                $profile_data['school_id'] = $profile_value['school_id'];
                $profile_data['school_name'] = $profile_value['school_name'];
                $profile_data['Instt_id'] = $profile_value['Instt_id'];
                $profile_data['instt_name'] = $profile_value['instt_name'];
                $profile_data['fee_sch_id'] = $profile_value['fee_sch_id'];
                $profile_data['institude_id'] = $profile_value['institude_id'];
                $profile_data['class_id'] = $profile_value['class_id'];
                $profile_data['financial_year'] = $profile_value['financial_year'];
                $profile_data['payplan_id'] = $profile_value['payplan_id'];
                $profile_data['is_paid'] = $profile_value['is_paid'];
                $profile_data['paid_data'] = $profile_value['paid_data'];
                $profile_data['recp_id1'] = $profile_value['recp_id1'];
                $profile_data['credit'] = $profile_value['credit'];
                $profile_data['FeeorDep'] = $profile_value['FeeorDep'];
                $profile_data['remark'] = $profile_value['remark'];
                $profile_data['class_name'] = $profile_value['class_name'];

                $payment_info = json_decode($profile_value['payment_info']);
                foreach ($payment_info as $pay_key => $pay_value) 
                {
                    $profile_data['instl_no'] = $pay_value->install_id;
                    $profile_data['name_of_installment'] = $pay_value->name_of_installment;
                    $profile_data['installment_number'] = $pay_value->installment_number;
                    if($profile_data['financial_year'] == $data_due['current_academic_year'])
                    {
                        $profile_data['due_date'] = $pay_value->due_date;
                    }else if($profile_data['financial_year'] == $data_due['next_academic_year']){
                        $profile_data['due_date'] = $pay_value->next_year_due_date;
                    }else if($profile_data['financial_year'] == $data_due['previous_academic_year']){
                        $profile_data['due_date'] = $pay_value->previous_year_due_date;
                    }
                    foreach ($pay_value->head_data as $head_key => $head_value) 
                    {
                        $profile_data['fee_head_id'] = $head_value->fee_head_id;
                        $profile_data['chq_amt'] = $head_value->install_amt;
                        $profile_data['fee_head_name'] = $head_value->fee_head_name;
                        $profile_data['custom_plan'] = $head_value->custom_plan;
                        array_push($profile_all_array,$profile_data);
                    }
                }
            }
        }else{
            $profile_all_array = array();
            if($data['partial_fee_data'] == NULL)
            {   
                foreach ($data['fee_data'] as $fee_key => $fee_value) 
                {
                    $profile_data['school_id'] = $fee_value['school_id'];
                    $profile_data['school_name'] = $fee_value['school_name'];
                    $profile_data['Instt_id'] = $fee_value['Instt_id'];
                    $profile_data['instt_name'] = $fee_value['instt_name'];
                    $profile_data['fee_sch_id'] = $fee_value['fee_sch_id'];
                    $profile_data['institude_id'] = $fee_value['institude_id'];
                    $profile_data['class_id'] = $fee_value['class_id'];
                    $profile_data['financial_year'] = $fee_value['financial_year'];
                    $profile_data['payplan_id'] = $fee_value['payplan_id'];
                    $profile_data['is_paid'] = $fee_value['is_paid'];
                    $profile_data['paid_data'] = $fee_value['paid_data'];
                    $profile_data['recp_id1'] = $fee_value['recp_id1'];
                    $profile_data['credit'] = $fee_value['credit'];
                    $profile_data['FeeorDep'] = $fee_value['FeeorDep'];
                    $profile_data['remark'] = $fee_value['remark'];
                    $profile_data['class_name'] = $fee_value['class_name'];
                    $profile_data['instl_no'] = $fee_value['instl_no'];
                    $profile_data['name_of_installment'] = $fee_value['name_of_installment'];
                    $profile_data['installment_number'] = $fee_value['installment_number'];
                    $profile_data['due_date'] = $fee_value['due_date'];
                    $profile_data['fee_head_id'] = $fee_value['fee_head_id'];
                    $profile_data['chq_amt'] = $fee_value['chq_amt'];
                    $profile_data['fee_head_name'] = $fee_value['fee_head_name'];
                    $profile_data['custom_plan'] = $data['custom_plan'];
                    array_push($profile_all_array,$profile_data);
                }
            }else{
                foreach ($data['partial_fee_data'] as $partial_key => $partial_value) 
                {
                    $profile_data['school_id'] = $partial_value['school_id'];
                    $profile_data['school_name'] = $partial_value['school_name'];
                    $profile_data['Instt_id'] = $partial_value['Instt_id'];
                    $profile_data['instt_name'] = $partial_value['instt_name'];
                    $profile_data['fee_sch_id'] = $partial_value['fee_sch_id'];
                    $profile_data['institude_id'] = $partial_value['institude_id'];
                    $profile_data['class_id'] = $partial_value['class_id'];
                    $profile_data['financial_year'] = $partial_value['financial_year'];
                    $profile_data['payplan_id'] = $partial_value['payplan_id'];
                    $profile_data['is_paid'] = $partial_value['is_paid'];
                    $profile_data['paid_data'] = $partial_value['paid_data'];
                    $profile_data['recp_id1'] = $partial_value['recp_id1'];
                    $profile_data['credit'] = $partial_value['credit'];
                    $profile_data['FeeorDep'] = $partial_value['FeeorDep'];
                    $profile_data['remark'] = $partial_value['remark'];
                    $profile_data['class_name'] = $partial_value['class_name'];
                    $profile_data['instl_no'] = $partial_value['instl_no'];
                    $profile_data['name_of_installment'] = $partial_value['name_of_installment'];
                    $profile_data['installment_number'] = $partial_value['installment_number'];
                    $profile_data['due_date'] = $partial_value['due_date'];
                    $profile_data['fee_head_id'] = $partial_value['fee_head_id'];
                    $profile_data['chq_amt'] = $partial_value['chq_amt'];
                    $profile_data['fee_head_name'] = $partial_value['fee_head_name'];
                    $profile_data['custom_plan'] = $data['custom_plan'];
                    array_push($profile_all_array,$profile_data);
                }
            }
            // $profile_all_array = $data['fee_data'];
        }
        $data['combined_data'] = array_merge($data['combined_data'], $profile_all_array);

        if($data['partial_fee_data'] != NULL)
        {
            $highest_install_amt = 0;
            foreach ($data['partial_fee_data'] as $key => $data_value)
            {
                $today = date('Y-m-d');
                $due_date = date('Y-m-d', strtotime($data_value['due_date']));
                $today_time = strtotime($today);
                $due_date_time = strtotime($due_date);
                if (($due_date_time - $today_time) < 30*24*60*60) 
                {
                    if($data_value['is_paid'] == 0 && $data_value['approve_flag'] == 1)
                    {
                        array_push($min_due_date,$due_date_time);
                    }
                }
            }
            $first_payment = min($min_due_date);
            foreach ($data['partial_fee_data'] as $key => $data_value) 
            {
                $due_date = date('Y-m-d', strtotime($data_value['due_date']));
                $due_date_time = strtotime($due_date);
                if($due_date_time == $first_payment)
                {
                    array_push($partial_id_array,$data_value['partial_id']);
                }
            }
            $partial_id_array = array_values($partial_id_array);
            $data['partial_id_array'] = implode(',', $partial_id_array);
        }
       
        //Remaining Fee calculations
        $total_expected_amount = 0;
        $installment_id_array = array();
        $expected_school_fee = 0;
        $expected_institute_fee = 0;
        if ($profile_all_array != NULL) 
        {
            foreach ($profile_all_array as $key => $data_value)
            {
                $today = date('Y-m-d');
                $due_date = date('Y-m-d', strtotime($data_value['due_date']));
                $today_time = strtotime($today);
                $due_date_time = strtotime($due_date);
                if (($due_date_time - $today_time) < 30*24*60*60) 
                {
                    array_push($installment_id_array, $data_value['instl_no']);
                }
            }
        }

        if(count($installment_id_array) > 0)
        {
            $data['installment_id']= implode(',', $installment_id_array);
            $insatllment_details = array();
            $data['insatllment_details'] = '';

            // Separate Rethink and School Fee
            foreach ($profile_all_array as $key => $expected_value)
            {
                if($expected_value['custom_plan'] == 0 && in_array($expected_value['instl_no'],$installment_id_array))
                {
                    $insatllment_details[$key]['payplan_install_amt']= $expected_value['chq_amt'];
                    $insatllment_details[$key]['class_id']= $expected_value['class_id'];
                    $insatllment_details[$key]['payplan_inst_id']= $expected_value['institude_id'];
                    $insatllment_details[$key]['payplan_sch_id']= $expected_value['fee_sch_id'];
                    $insatllment_details[$key]['school_name'] = $expected_value['school_name'];
                    $insatllment_details[$key]['instt_name'] = $expected_value['instt_name'];
                    $insatllment_details[$key]['payplan_head_id']= $expected_value['fee_head_id'];
                    $insatllment_details[$key]['school_id']= $expected_value['school_id'];
                    $insatllment_details[$key]['academic_year']= $expected_value['financial_year'];
                    $insatllment_details[$key]['install_id']= $expected_value['instl_no'];
                    $insatllment_details[$key]['install_name']= $expected_value['name_of_installment'];
                    $insatllment_details[$key]['payplan_head_name']= $expected_value['fee_head_name'];
                    $insatllment_details[$key]['payplan_id']= $data['payplan'];
                    $insatllment_details[$key]['user_name']= $data['full_name'];
                    $insatllment_details[$key]['custom_plan']= $expected_value['custom_plan'];
                    $insatllment_details[$key]['approve_flag']= '';

                    $data_due['financial_year'] = $expected_value['financial_year'];
                    $data_due['current_academic_year'] = $this -> System_model -> get_academic_year();
                    $data_due['next_academic_year'] = $this -> System_model -> get_next_academic_year();
                    $data_due['previous_academic_year'] = $this -> System_model -> get_previous_academic_year();
                    $data_due['school_id'] = $expected_value['school_id'];
                    $data_due['payplan_id'] = $data['payplan'];
                    $data_due['installment_id'] = $expected_value['instl_no'];

                    $insatllment_details[$key]['due_date']= $expected_value['due_date'];
                    if ($expected_value['fee_sch_id'] != 0 && $expected_value['institude_id'] == 0) 
                    {
                        $data['expected_school_fee'] = $data['expected_school_fee'] + $expected_value['chq_amt'];
                    }
                    if ($expected_value['fee_sch_id'] == 0 && $expected_value['institude_id'] != 0) 
                    {
                        $data['expected_institute_fee'] = $data['expected_institute_fee'] + $expected_value['chq_amt'];
                    }
                }else
                {
                    $due_date = date('Y-m-d', strtotime($expected_value['due_date']));
                    $due_date_time = strtotime($due_date);
                    if($due_date_time == $first_payment)
                    {
                        $insatllment_details[$key]['payplan_install_amt']= $expected_value['chq_amt'];
                        $insatllment_details[$key]['class_id']= $expected_value['class_id'];
                        $insatllment_details[$key]['payplan_inst_id']= $expected_value['institude_id'];
                        $insatllment_details[$key]['payplan_sch_id']= $expected_value['fee_sch_id'];
                        $insatllment_details[$key]['school_name'] = $expected_value['school_name'];
                        $insatllment_details[$key]['instt_name'] = $expected_value['instt_name'];
                        $insatllment_details[$key]['payplan_head_id']= $expected_value['fee_head_id'];
                        $insatllment_details[$key]['school_id']= $expected_value['school_id'];
                        $insatllment_details[$key]['academic_year']= $expected_value['financial_year'];
                        $insatllment_details[$key]['install_id']= $expected_value['instl_no'];
                        $insatllment_details[$key]['install_name']= $expected_value['name_of_installment'];
                        $insatllment_details[$key]['payplan_head_name']= $expected_value['fee_head_name'];
                        $insatllment_details[$key]['payplan_id']= $data['payplan'];
                        $insatllment_details[$key]['custom_plan']= $expected_value['custom_plan'];
                        $insatllment_details[$key]['user_name']= $data['full_name'];
                        $insatllment_details[$key]['approve_flag']= 1;

                        $data_due['financial_year'] = $expected_value['financial_year'];
                        $data_due['current_academic_year'] = $this -> System_model -> get_academic_year();
                        $data_due['next_academic_year'] = $this -> System_model -> get_next_academic_year();
                        $data_due['previous_academic_year'] = $this -> System_model -> get_previous_academic_year();
                        $data_due['school_id'] = $expected_value['school_id'];
                        $data_due['payplan_id'] = $data['payplan'];
                        $data_due['installment_id'] = $expected_value['instl_no'];

                        
                        $insatllment_details[$key]['due_date']= $expected_value['due_date'];

                        if ($expected_value['fee_sch_id'] != 0 && $expected_value['institude_id'] == 0) 
                        {
                            $data['expected_school_fee'] = $data['expected_school_fee'] + $expected_value['chq_amt'];
                        }
                        if ($expected_value['fee_sch_id'] == 0 && $expected_value['institude_id'] != 0) 
                        {
                            $data['expected_institute_fee'] = $data['expected_institute_fee'] + $expected_value['chq_amt'];
                        }
                    }
                }
            }
            
            $total_expected_amount = $data['expected_school_fee'] + $data['expected_institute_fee'];
            $data['insatllment_details'] = array_values($insatllment_details);

            $total_paid_amt = 0;
            foreach($data['insatllment_details'] as $inst_value)
            {
                $ret_trahistory_status = $this -> Fee_model -> check_student_transaction_history_partial($school_id, $selected_financial_year, $computed_class_id, $data['ref_no'], $fee_flag = 'fee', $inst_value['install_id']);
                if ($ret_trahistory_status != NULL) 
                {
                    foreach($ret_trahistory_status as $student_fee_transaction)
                    {
                        if($inst_value['install_id'] == $student_fee_transaction->installment_id && $inst_value['custom_plan'] == 0 && $inst_value['payplan_inst_id'] == $student_fee_transaction->institude_id && $inst_value['payplan_head_id'] == $student_fee_transaction->fee_head_id )
                        {
                            $total_paid_amt = $total_paid_amt + $student_fee_transaction->chq_amt;
                        }
                    }
                    // $expected_school_fee = $data['expected_school_fee'] + $expected_value['chq_amt'];
                    
                } else {
                    $installment_id_diff = explode(',', $data['installment_id']);
                    $data['unpaid_amount'] = $total_expected_amount;
                }
            }
            if($total_paid_amt == $total_expected_amount)
            {
                $paid_installment = array($student_fee_transaction->installment_id);
            }

            if ($total_paid_amt >= $total_expected_amount)
            {
                // return "1";
            } else {
                if ($total_paid_amt == '' || $total_paid_amt == NULL) 
                {
                    $total_paid_amt = 0;
                }
                $data['unpaid_amount'] = $total_expected_amount - $total_paid_amt;
            }
            

            // Removed paid fees from installment array
            foreach ($data['paid_data'] as $paid_key => $paid_value) 
            { 
                foreach ($insatllment_details as $in_key => $in_value) 
                {                            
                    if($in_value['custom_plan'] == 0)
                    {
                        $exculsive_check = FALSE;
                        $total_fee_head_amount = 0;
                        $total_concession_amount = 0;
                        if(($in_value['payplan_sch_id'] == $paid_value['school_id']) && ($in_value['payplan_inst_id'] == $paid_value['institude_id']) &&($in_value['payplan_head_id'] == $paid_value['fee_head_id']) && ($in_value['academic_year'] == $paid_value['fees_paid_year']) && ($in_value['install_id'] == $paid_value['installment_id'])) 
                        {
                            $exculsive_check = TRUE;
                        }

                        if($exculsive_check) {
                            if($paid_value['fee_head_id'] == $in_value['payplan_head_id']) 
                            {
                                $total_fee_head_amount = $in_value['payplan_install_amt'] - $paid_value['chq_amt'];
                                $concession_amount = $total_fee_head_amount;
                            }

                            foreach ($data['concession_data'] as $conces_key => $conc_row) 
                            {
                                if(($in_value['payplan_sch_id'] == $conc_row['school_id']) && ($in_value['payplan_inst_id'] == $conc_row['institude_id']) &&($in_value['payplan_head_id'] == $conc_row['fee_head_id']) && ($in_value['academic_year'] == $conc_row['academic_year']) && ($in_value['install_id'] == $conc_row['student_installment_no'])) 
                                {
                                    $total_concession_amount = $total_concession_amount + $conc_row['chq_amt']; 
                                    if($total_concession_amount == $concession_amount)
                                    {
                                        unset($insatllment_details[$in_key]);
                                    }
                                    // unset($insatllment_details[$in_key]);
                                }
                            }
                            if($total_fee_head_amount == 0)
                            {
                                unset($insatllment_details[$in_key]);
                            }
                        }  
                    } 
                }
            }
            
            // Removed concession fees from installment array
            foreach ($data['concession_data'] as $conces_key => $conc_row) 
            {
                foreach ($insatllment_details as $in_key => $in_value) 
                {
                    if($in_value['install_id'] == $conc_row['student_installment_no'] && $in_value['custom_plan'] == 0)
                    {
                        $exculsive_check = FALSE;
                        $total_fee_head_amount = 0;
                        if(($in_value['payplan_sch_id'] == $conc_row['school_id']) && ($in_value['payplan_inst_id'] == $conc_row['institude_id']) &&($in_value['payplan_head_id'] == $conc_row['fee_head_id']) && ($in_value['academic_year'] == $conc_row['academic_year']) && ($in_value['install_id'] == $conc_row['student_installment_no'])) 
                        {
                            $exculsive_check = TRUE;
                        }

                        if($exculsive_check) {
                            if($conc_row['fee_head_id'] == $in_value['payplan_head_id']) 
                            {
                                $total_fee_head_amount = $in_value['payplan_install_amt'] - $conc_row['chq_amt'];
                            }
                            if($total_fee_head_amount == 0)
                            {
                                // unset($insatllment_details[$in_key]);
                            }
                            
                        }
                    }
                }
            }
            
            $data['insatllment_details'] = array_values($insatllment_details);
            $highest_install = 0;
            $highest_install_amt = 0;
            $second_highest_install = 0;
            for ($i = 0; $i < count($data['insatllment_details']); $i++) 
            {
                if($i == 0) 
                {
                    $second_highest_install = $data['insatllment_details'][$i]['install_id'];
                }
                if($data['insatllment_details'][$i]['install_id'] > $highest_install) {
                    $highest_install = $data['insatllment_details'][$i]['install_id'];
                }
                
                if($highest_install > $data['insatllment_details'][$i]['install_id'] && $data['insatllment_details'][$i]['install_id'] > $second_highest_install) {
                    $second_highest_install = $data['insatllment_details'][$i]['install_id'];
                }
            }
            // Already paid transactions
            $data['transaction_history'] = $this-> Fee_model ->fetch_transaction_history($data['ref_no'], $selected_financial_year, $data['payplan'], $second_highest_install, $school_id, 0, 0, $data['collection_type'] = 'fee');
            if($data['transaction_history'] != NULL)
            {
                foreach ($data['insatllment_details'] as $inst_key => $inst_value) 
                {
                    if ($highest_install == $inst_value['install_id']) 
                    {
                        $highest_install_amt = $highest_install_amt + $inst_value['payplan_install_amt'];
                    }
                }

            }
        }

        if ($data['defaulter_check'] == '') 
        {
            $data['transaction_data'] = $data['combined_data'];
        }else{
            $data['transaction_data'] = '';
        }

        foreach ($data['transaction_data'] as $key => $part) {
           $i_sort[$key] = strtotime($part['insert_date']);
        }
        array_multisort($i_sort, SORT_ASC, $data['transaction_data']);
        foreach ($data['transaction_data'] as $key => $part) {
            if(isset($part['due_date']))
            {
               $sort[$key] = strtotime($part['due_date']);
            }
        }
        array_multisort($sort, SORT_ASC, $data['transaction_data']);
        // Undertaking form acceptance
        $data['school_id'] = $school_id;
        $continuity_result = $this-> Continuity_form_model -> fetch_undertaking_link_data($data['ref_no'],$data,$sel_financial_year);
        if ($continuity_result != NULL) 
        {
            $data['confirm_status']     = $continuity_result->link_status;
            $data['dep_confirm_status'] = $continuity_result->dep_link_status;
        }else{
            $data['confirm_status'] = 0;
            $data['dep_confirm_status'] = 0;
        }

        $data['stud_parent_data'] = $this-> Student_model -> get_student_parent_data($data['session_school_id'],$data['ref_no']);
        $data['status']        = $data['stud_parent_data'][0]->status;
        if ($data['status'] == 6 || $data['status'] == 7) 
        {
            $data['status'] = '6,7';
        }
        $data['stud_class_id'] = $data['stud_parent_data'][0]->admission_to;
        $class_name            = $data['stud_parent_data'][0]->class_name;
        $ret_school_name       = $this-> School_model ->get_school_location($data['school_id']); 
        $school_name           = substr($ret_school_name, strrpos($ret_school_name, ' ') + 1);

        $data['academic_year'] = $sel_financial_year;
        $temp_class_id         = $data['stud_class_id'];

        $next_financial_year = $this-> System_model ->get_next_financial_year();
        if ($data['academic_year'] == $next_financial_year) 
        {
            if ($data['status'] == 1) 
            {
                $data['class_id'] = $temp_class_id;
            }else
            {
                if ($temp_class_id == 19) 
                {
                    $data['class_id'] = $temp_class_id + 4;
                }else{
                    $data['class_id'] = $temp_class_id + 1;
                }
            } 
        }else{
            $data['class_id'] = $temp_class_id;
        }
        $present_file_data     = $this -> Continuity_form_model-> fetch_undertaking_file_data($data);
        $file_id               = $present_file_data[0]->file_id; 
        $data['target_path']   = "https://drive.google.com/file/d/".$file_id;
        $data['fee_flag']      = $present_file_data[0]->fee_flag; 

        $data['payment_modes'] = $this-> Fee_model ->fetch_payment_modes('all');
        $data['bank_details'] = $this-> Fee_model ->fetch_banks();
        $data['highest_inst_amt'] = $highest_install_amt;
        $this-> load -> view('account/student_account/student_account_view', $data);
	}
    
    public function check_concession($refno, $class_id, $current_year, $total_expected_amount, $total_fee_amount_paid,$installment_id, $expected_school_fee, $expected_institute_fee, $school_id)
    {
        $ret_check_concession = $this-> Fee_model -> check_student_concession_fee($refno, $current_year, $approve = 1, $school_id, $installment_id);
        if ($ret_check_concession != NULL)
        {
            $result_concession = $ret_check_concession[0];
            $concession_given =  floatval($result_concession->total_concession);
        }else{
            $concession_given = 0;
        } 
        // else { //RTE CHECK
        //     $ret_check_concession = $this-> Fee_model -> check_student_concession_rte($refno, $school_id, $stud_rte = 1, $installment_id);
            
        //     if ($ret_check_concession != null || $ret_check_concession != '') { //RTE Student
        //         if (floatval($expected_institute_fee) == $total_fee_amount_paid) { // Check only rethink fees for RTE
        //             $concession_given = $total_fee_amount_paid;
        //         } else {
        //             $concession_given = floatval($expected_institute_fee); // Check expected if not match with paid
        //         }
        //     } else { // Regular Student
        //         $concession_given = floatval($total_expected_amount);
        //     }
        // }
        // if($total_expected_amount - ($total_fee_amount_paid + $concession_given) <= 0){
        //     $pending_fees_total  = $total_expected_amount - ($total_fee_amount_paid);
        //     // return  "1";
        // }else{
            // Defaulter - Refund logic (Only called from student info)
            // 
            $pending_fees_total  = $total_expected_amount - ($total_fee_amount_paid + $concession_given);
        // }
        return $pending_fees_total;

    }

    /**
     * Ajax - Installment List
     * 
     * 
     * @return view
     */
	function fetch_installment_details($view_flag = 'yes'){
		$school_id = $_SESSION['school_id'];
		$academic_year = $this -> System_model -> get_academic_year();

		$collection_type = $this->input->post('collection_type');
		$ref_no = strtoupper($this->input->post('ref_no'));
		$selected_financial_year = $this->input->post('selected_financial_year');

		// Student class according to Financial Year selected
		$continuity_array = $this-> Fee_model ->get_computed_continuity_class($ref_no, $selected_financial_year, $academic_year, NULL, $school_id);
		$computed_class_id = $continuity_array['computed_class'];

		// Payplan according to selected fin year & computed class
		$data['payplan'] = $this-> Fee_model ->get_refno_payplan_details($ref_no, $computed_class_id, $selected_financial_year,$collection_type, $school_id);
		$data['school_id'] = $school_id;
		$data['class_id'] = $computed_class_id;

		if($view_flag === 'yes'){
	        //Fetch installment data
            $data['installment_info'] = $this-> Fee_model ->fetch_payplanwise_installment($data);
            $this -> load -> view('account/common/ajax_installment', $data);
	    }else if($view_flag === 'payplan'){
            //Fetch payplan data
            $data['payplan_details'] = $this-> Fee_model ->check_pay_plan($school_id, $data['payplan']);
            if ($data['payplan_details'] != NULL) 
            {
                $data['payplan_name'] = $data['payplan_details'][0]['payment_plan'];
            }
            echo $data['payplan_name'];return;
        } else {
	    	$class_data = $this-> Class_division_model ->get_class_name($data);
	    	if($class_data != NULL){
	    		echo $class_data->row()->class_name.'~'.$data['class_id'].'~'.$data['payplan'];return;
	    	} else {
	    		echo '-';return;
	    	}
	    }
	}

    /**
     * ******** Save Payment Transaction ********
     * 
     * @return
     */
	function save_transaction(){
        $inst_split_array = unserialize(base64_decode($_POST['split_array']));
        $payment_details = unserialize(base64_decode($_POST['payment_details']));
        $installment_id = $_POST['installment_id'];
        $installment_id_array = explode(',',$installment_id);
        $partial_id_array = $_POST['partial_id_array'];
        // $custom_plan      = $_POST['custom_plan'];
        $partial_ids = explode(',',$partial_id_array);
        $install_id = '';
        $final_trans_details = array();
        $school_array = array();
        $institute_array = array();
        foreach ($inst_split_array as $inst_key => $inst_value) 
        {
            $head_data = [];
            $head_inst_data = [];
            $ret_data = '';
            $discount = 0;
            foreach ($inst_value as $trans_inst_key => $trans_inst_value) 
            {
                if ($inst_key == $trans_inst_value['install_id']) 
                {
                    if($trans_inst_value['payplan_sch_id'] == $trans_inst_value['school_id'])
                    {
                        $payment_sch_data = array();
                        foreach($payment_details as $pay_key => $pay_val)
                        {
                            if($trans_inst_value['payplan_sch_id'] == $pay_val->sch_id && $trans_inst_value['payplan_inst_id'] == $pay_val->inst_id)
                            {
                                array_push($payment_sch_data,(object)$pay_val);
                            }
                        }
                        $other_discount = $_POST['concession_spilt_other'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $discount = $_POST['concession_spilt'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $discount_type = $_POST['concession_type'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $referral_discount = $_POST['referral_discount'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $payplan_discount = $_POST['payplan_discount'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $late_fee = $_POST['late_fee_value'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $ret_data = array(
                                    'head_id' => $trans_inst_value['payplan_head_id'], 
                                    'head_amount' => $trans_inst_value['payplan_install_amt']-$discount+$late_fee,
                                    'head_amount_main' => $trans_inst_value['payplan_install_amt'],
                                    'discount' => $other_discount,
                                    'late_fee' => $late_fee,
                                    'referral_discount' => $referral_discount,
                                    'payplan_discount' => $payplan_discount,
                                    'discount_type' => $discount_type);
                        array_push($head_data,(object)$ret_data);

                        $data_ret['ref_no']                  = strtoupper($trans_inst_value['ref_no']);
                        $data_ret['collection_type']          = 'fee';//$trans_inst_value['collection_type'];
                        $data_ret['payment_class_id']         = $trans_inst_value['class_id'];
                        $data_ret['selected_installment_id']  = $trans_inst_value['install_id'];
                        $data_ret['selected_financial_year']  = $trans_inst_value['academic_year'];
                        $data_ret['payplan_id']               = (int)$trans_inst_value['payplan_id'];
                        $data_ret['head_data']                = $head_data;
                        $data_ret['yearly_setup_id']          = $trans_inst_value['yearly_setup_id'];
                        $data_ret['ref_school_id']            = (int)$trans_inst_value['payplan_sch_id'];
                        $data_ret['ref_institute_id']         = (int)$trans_inst_value['payplan_inst_id'];
                        $data_ret['session_school_id']        = (int)$trans_inst_value['school_id'];
                        $data_ret['user_name']                = $trans_inst_value['user_name'];
                        $data_ret['install_name']                = $trans_inst_value['installment_name'];
                        $data_ret['payment_details']          = array_values($payment_sch_data);
                        $data_ret['custom_plan']                = $trans_inst_value['custom_plan'];
                    }else{
                        $payment_inst_data = array();
                        foreach($payment_details as $pay_key => $pay_val)
                        {
                            if($trans_inst_value['payplan_sch_id'] == $pay_val->sch_id && $trans_inst_value['payplan_inst_id'] == $pay_val->inst_id)
                            {
                                array_push($payment_inst_data,(object)$pay_val);
                            }
                        }
                        $other_discount = $_POST['concession_spilt_other'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $discount = $_POST['concession_spilt'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $discount_type = $_POST['concession_type'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $referral_discount = $_POST['referral_discount'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $payplan_discount = $_POST['payplan_discount'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $late_fee = $_POST['late_fee_value'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $ret_data = array(
                                    'head_id' => $trans_inst_value['payplan_head_id'], 
                                    'head_amount' => $trans_inst_value['payplan_install_amt']-$discount+$late_fee,
                                    'head_amount_main' => $trans_inst_value['payplan_install_amt'],
                                    'discount' => $other_discount,
                                    'late_fee' => $late_fee,
                                    'referral_discount' => $referral_discount,
                                    'payplan_discount' => $payplan_discount,
                                    'discount_type' => $discount_type);
                        array_push($head_inst_data,(object)$ret_data);

                        $data_inst_ret['ref_no']                  = strtoupper($trans_inst_value['ref_no']);
                        $data_inst_ret['collection_type']          = 'fee';//$trans_inst_value['collection_type'];
                        $data_inst_ret['payment_class_id']         = $trans_inst_value['class_id'];
                        $data_inst_ret['selected_installment_id']  = $trans_inst_value['install_id'];
                        $data_inst_ret['selected_financial_year']  = $trans_inst_value['academic_year'];
                        $data_inst_ret['payplan_id']               = (int)$trans_inst_value['payplan_id'];
                        $data_inst_ret['head_data']                = $head_inst_data;
                        $data_inst_ret['yearly_setup_id']          = $trans_inst_value['yearly_setup_id'];
                        $data_inst_ret['ref_school_id']            = (int)$trans_inst_value['payplan_sch_id'];
                        $data_inst_ret['ref_institute_id']         = (int)$trans_inst_value['payplan_inst_id'];
                        $data_inst_ret['session_school_id']        = (int)$trans_inst_value['school_id'];
                        $data_inst_ret['user_name']                = $trans_inst_value['user_name'];
                        $data_inst_ret['install_name']             = $trans_inst_value['installment_name'];
                        $data_inst_ret['payment_details']          = array_values($payment_inst_data);
                        $data_inst_ret['custom_plan']              = $trans_inst_value['custom_plan'];
                    }
                }
            }
            array_push($school_array, $data_ret);
            array_push($institute_array,$data_inst_ret);
        }
        $final_trans_details = array_filter(array_merge($school_array,$institute_array));
        $final_trans_details = array_values($final_trans_details);
        
        foreach ($final_trans_details as $save_key => $payment_data) 
        {
            $ref_no                   = strtoupper($payment_data['ref_no']);
            $collection_type          = $payment_data['collection_type'];
            $payment_class_id         = $payment_data['payment_class_id'];
            $selected_installment_id  = $payment_data['selected_installment_id'];
            $selected_financial_year  = $payment_data['selected_financial_year'];
            $payplan_id               = (int)$payment_data['payplan_id'];
            $head_data                = $payment_data['head_data'];
            $yearly_setup_id          = $payment_data['yearly_setup_id'];
            $ref_school_id            = (int)$payment_data['ref_school_id'];
            $ref_institute_id         = (int)$payment_data['ref_institute_id'];
            $session_school_id        = (int)$payment_data['session_school_id'];
            $user_name                = $payment_data['user_name'];
            $payment_details          = $payment_data['payment_details'];
            $accept_status            = $this->input->post('accept_status');
            $parent_otp               = $this->input->post('parent_otp');
            $current_class_id         = $this->input->post('current_class_id');
            $install_name             = $payment_data['install_name'];
            $custom_plan              = $payment_data['custom_plan'];

            $late_payment_data = NULL; // Todo - Late fee  flag & late fee amount (will come from UI)

            $academic_year = $this -> System_model -> get_academic_year();
            $transaction_id = 0;

            // Get actual deposit refunt amount for refund calculation
            $ret_refund_data = $this-> Fee_model->get_refund_data($payment_class_id,$selected_financial_year,$head_data[0]->head_id,$session_school_id);
            $refund_amt = $ret_refund_data[0]->refund_amount;
            
            if($custom_plan == 0)
            {
                // Already Paid Check
                $paid_status = $this-> Fee_model ->check_paid_unpaid($ref_no, $selected_financial_year, $payplan_id, $selected_installment_id, $session_school_id, $ref_school_id, $ref_institute_id,$collection_type);
            }else{
                $paid_status = NULL;
            }
            
            if($paid_status != NULL) {
                echo -3;return;
            } else {
                $this->load->model('account/Receipt_model');
                // echo $payment_details;return;
                $transaction_id = $this-> Receipt_model ->save_transaction($session_school_id, $academic_year, $selected_financial_year, $user_name, $selected_installment_id, $payplan_id, $head_data, $yearly_setup_id, $ref_school_id, $ref_institute_id,$collection_type, $late_payment_data, $ref_no, $payment_class_id, $payment_details[0],$refund_amt);

                //Errors
                if ($transaction_id === 0) { // Failure
                    echo 0;return;
                }
                if ($transaction_id === -1) { // Transaction failure
                    echo -1;return;
                }
                if ($transaction_id === -2) { // Amount mismatch
                    echo -2;return;
                }
            }
            //update partial id paid status
            if(count($partial_id_array) > 0)
            {
                $paid_status_update = $this -> Fee_model -> update_student_partial_paid_status($partial_ids,$ref_no,$session_school_id);
            }
            // To save undertaking form accept data
            if ($accept_status == 2) 
            {
                $data['school_id']          = $session_school_id;
                $data['refno']              = $ref_no;
                $data['class_id']           = $payment_class_id;
                $data['academic_year']      = $selected_financial_year;
                $data['link_status']        = $accept_status;
                $data['parent_otp']         = $parent_otp;
                $data['link_response']      = 'YES';
                $data['link_reason']        = 'Accepted while paying fees in school';
                $data['submitted_date']     = date("Y-m-d h:i:s");
                if ($_SERVER['HTTP_HOST'] == 'localhost') 
                {
                    $data['user_ip'] = '192.168.1.2'; // TODO remove temp IP address - - Locally it returns ::1    
                } else 
                {
                    $data['user_ip']   = $_SERVER['REMOTE_ADDR']; // Client IP address 
                }
                $data['useragent']     = $_SERVER['HTTP_USER_AGENT'];
                $data['dep_link_status']    = NULL;
                $data['dep_useragent']      = NULL;
                $data['dep_link_response']  = NULL;
                $data['dep_user_ip']        = NULL;
                $data['dep_link_reason']    = NULL;
                $data['dep_otp']            = NULL;
                $data['dep_submitted_date'] = NULL;

                $continuity_result = $this-> Continuity_form_model -> fetch_undertaking_link_data($ref_no,$data,$selected_financial_year);
                if ($continuity_result != NULL) 
                {
                    $data['dep_link_status']    = $continuity_result->dep_link_status;
                    $data['dep_useragent']      = $continuity_result->dep_user_name;
                    $data['dep_link_response']  = $continuity_result->dep_link_response;
                    $data['dep_user_ip']        = $continuity_result->dep_ip_address;
                    $data['dep_link_reason']    = $continuity_result->dep_link_reason;
                    $data['dep_otp']            = $continuity_result->dep_parent_otp;
                    $data['dep_submitted_date'] = $continuity_result->dep_submitted_date;

                    $result = $this-> Continuity_form_model ->update_continuity_info($data);
                }else{
                    $result = $this-> Continuity_form_model ->save_continuity_data($data);
                }
                if ($continuity_result->link_status != 2) 
                {
                    $this->send_undertaking_form($ref_no, $session_school_id,$selected_financial_year,$collection_type);
                }
            }
            $student_status = $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'status');

            if($collection_type != 'exam' && ($student_status == 6 || $student_status == 7))
            {
                // Student status change
                $this->convert_student_status($ref_no, $selected_financial_year, $payplan_id, $selected_installment_id, $collection_type, $session_school_id);
            }

            // Send data to show receipts
            $receipt_json = json_encode(
                                        array(
                                            'transaction_id'     => $transaction_id,
                                            'collection_type'    => $collection_type,
                                            'ref_no'             => $ref_no,
                                            'payment_class_id'   => $payment_class_id,
                                            'payplan_id'         => $payplan_id,
                                            'installment_id'     => $selected_installment_id,
                                            'financial_year'     => $selected_financial_year,
                                            'academic_year'      => $academic_year,
                                            'ref_school_id'      => $ref_school_id,
                                            'ref_institute_id'   => $ref_institute_id,
                                            'session_school_id'  => $session_school_id,
                                            'receipt_letterhead' => $payment_details[0]->receipt_letterhead,
                                            'is_duplicate'       => FALSE,
                                            'is_mail'            => TRUE,
                                            'is_mobile'          => $is_mobile,
                                            'head_data'          => $head_data,
                                            'install_name'       => $install_name,
                                            'custom_plan'        => $custom_plan
                                        )
                                    );
            echo $this->generate_receipt(0, 0, $receipt_json);
        }
	}  

    /**
     * Receipt Generation
     * Fee & Deposits
     * Arguments => 1. is it api call(pay) , 2. return or echo , 3. passed receipt json
     * Invocations => 1. Normal Receipt(Arg), 2. Duplicate Receipt(API), 3. Payment Gateway(API)
     * @return string
     */
    public function generate_receipt($api_call = 0, $return = 0, $receipt_json = NULL)
    { 
        // Converting to booleans
        if($api_call == 0 || $api_call == '0'){
            $api_call = FALSE;
        } else {
            $api_call = TRUE;
        }
        if($return == 0 || $return == '0'){
            $return = FALSE;
        } else {
            $return = TRUE;
        }

    	if($receipt_json != NULL) {
            $receipt_array = json_decode($receipt_json);
            $is_mobile     = $receipt_array->is_mobile;
    	}else if($api_call) {
            $json_response = json_decode(file_get_contents('php://input'), TRUE);
            $receipt_array = (object)$json_response['receipt_json'];
            $is_mobile     = $receipt_array->is_mobile;
        } else {
            $receipt_array = json_decode($this->input->post('receipt_json'));
            $data['concession_data'] = $this-> Fee_model ->concession_data_all($receipt_array->ref_no, $receipt_array->session_school_id, $receipt_array->payment_class_id, $receipt_array->financial_year);
            $fee_head_details = $this-> Fee_model ->fetch_head_details($receipt_array->session_school_id, $receipt_array->ref_no, $receipt_array->transaction_id,$receipt_array->ref_school_id, $receipt_array->ref_institute_id,$receipt_array->financial_year,$receipt_array->installment_id,$receipt_array->payplan_id);
            $head_data_array = array();
            foreach ($fee_head_details as $head_key => $head_value) 
            {
                $discount = 0;
                $total_discount = 0;
                $referral_discount = 0;
                $payplan_discount = 0;
                $late_fee = 0;
                $discount_type = '';
                if($receipt_array->custom_plan == 0)
                {
                    foreach ($data['concession_data'] as $cons_key => $cons_value) 
                    {
                        if($cons_value['fee_head_id'] == $head_value['fee_head_id'] && $cons_value['student_installment_no'] == $receipt_array->installment_id)
                        {
                            if($cons_value['discount_id_fk'] != 0) 
                            {
                                $discount_type  = $this-> Fee_model ->fetch_discount_type($cons_value['discount_id_fk']); 
                                if($discount_type  == 'referral')
                                {
                                    $referral_discount = $referral_discount + $cons_value['chq_amt'];
                                }else if($discount_type  == 'payplan'){
                                    $payplan_discount = $payplan_discount + $cons_value['chq_amt'];
                                }else{
                                    $discount = $discount + $cons_value['chq_amt'];
                                }
                                $total_discount = $total_discount + $cons_value['chq_amt'];
                            }else{
                                $discount_type = '';
                                $total_discount = $total_discount + $cons_value['chq_amt'];
                                $discount = $discount + $cons_value['chq_amt']; 
                            }
                        }
                    }

                    // Late Fee
                    $data['late_fee_data'] = $this-> Fee_model ->late_fee_data_all($receipt_array->ref_no,$receipt_array->session_school_id, $receipt_array->payment_class_id, $receipt_array->financial_year);
                    if($data['late_fee_data'] != NULL)
                    {
                        foreach ($data['late_fee_data'] as $late_key => $late_value) 
                        {
                            if($late_value['fee_head_id'] == $head_value['fee_head_id'] && $late_value['student_installment_no'] == $receipt_array->installment_id)
                            {
                                $late_fee = $late_fee + $late_value['chq_amt'];
                            }
                           
                        }
                    }
                }
                $ret_data = array(
                                        'head_id' => $head_value['fee_head_id'], 
                                        'head_amount' => $head_value['chq_amt'],
                                        'head_amount_main' => $head_value['chq_amt']+$total_discount-$late_fee,
                                        'discount' => $discount,
                                        'referral_discount' => $referral_discount,
                                        'payplan_discount' => $payplan_discount,
                                        'late_fee' => $late_fee,
                                        'discount_type' => $discount_type);
                array_push($head_data_array, (object)$ret_data);
            }
            $receipt_array->head_data = $head_data_array;
            $is_mobile     = $receipt_array->is_mobile;
    	}
        $transaction_id     = $receipt_array->transaction_id;
        $collection_type    = $receipt_array->collection_type;
        $ref_no             = $receipt_array->ref_no;
        $payment_class_id   = (int)$receipt_array->payment_class_id;
        $payplan_id         = (int)$receipt_array->payplan_id;
        $installment_id     = (int)$receipt_array->installment_id;
        $financial_year     = $receipt_array->financial_year;
        $academic_year      = $receipt_array->academic_year;
        $ref_school_id      = (int)$receipt_array->ref_school_id;
        $ref_institute_id   = (int)$receipt_array->ref_institute_id;
        $session_school_id  = (int)$receipt_array->session_school_id;
        $receipt_letterhead = $receipt_array->receipt_letterhead;
        $is_duplicate       = $receipt_array->is_duplicate;
        $head_data          = $receipt_array->head_data;
        $install_name       = $receipt_array->install_name;

        $is_mgr_call        = FALSE;
        if ($is_duplicate && !$api_call) 
        {
            $is_mgr_call    = TRUE;
        }
        
        $is_mail            = $receipt_array->is_mail;

        $school_code_header = $this-> School_model ->get_school_code($session_school_id);

        if($receipt_array->custom_plan == 0)
        {
            // Getting Information about transaction history
            $transaction_data = $this-> Fee_model ->fetch_transaction_history($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id, $collection_type);
        }else{
            // Getting Information about transaction history
            $transaction_data = $this-> Fee_model ->fetch_partial_transaction_history($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id, $collection_type,$transaction_id);
        }
        
        if ($transaction_data != "" || $transaction_data != NULL) {
            if($receipt_array->custom_plan == 0)
            {
               $payment_data = $this-> Fee_model ->fetch_payment_mode_refno($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id,$collection_type);
            }else{
                $payment_data = $this-> Fee_model ->fetch_partial_payment_mode_refno($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id,$collection_type,$transaction_id);
            }
            
            if ($payment_data != "" || $payment_data != NULL) {
                $transaction_history = array(
                                                'ref_no'            => $ref_no,
                                                'payment_class_id'  => $payment_class_id,
                                                'ref_institute_id'  => $ref_institute_id,
                                                'ref_school_id'     => $ref_school_id,
                                                'school_code'       => $school_code_header,
                                                'transaction_data'  => $transaction_data,
                                                'payment_data'      => $payment_data,
                                                'install_name'      => $install_name
                                            );
                // Total Amount
                $total_amount = 0;
                $total_discount = 0;
                $total_main_discount = 0;
                $total_late_fee = 0;
                $count = count($transaction_history['transaction_data']);
                // Fee Heads
                for ($i=0; $i < $count; $i++) { 
                    if($head_data[$i]->discount != 0)
                    {
                        $total_discount = $total_discount + $head_data[$i]->discount;
                    }
                    $total_late_fee = $total_late_fee + $head_data[$i]->late_fee;
                    if ($is_duplicate && !$api_call) 
                    {
                        $total_amount = $total_amount + $transaction_history['transaction_data'][$i]['chq_amt'];
                    }else{
                        $total_amount = $total_amount + $head_data[$i]->head_amount_main - $head_data[$i]->discount+$head_data[$i]->late_fee;
                        $total_amount = $total_amount - $head_data[$i]->referral_discount;
                        $total_amount = $total_amount - $head_data[$i]->payplan_discount;
                    }
                }

                // Convenience Amount
                $total_convenience_amt = 0;
                $count = count($transaction_history['payment_data']);
                for ($i=0; $i < $count; $i++) { 
                    $total_convenience_amt = $total_convenience_amt + $transaction_history['payment_data'][$i]['conven_amt'];
                }

                $total_amount = $total_amount + $total_convenience_amt;

                $deposit_refund_year = 0;
                if($ref_institute_id == 1) {
                    $ret_refund_year_month = $this-> Deposit_refund_model ->get_date_of_refund($financial_year, $payment_class_id, $installment_id, $session_school_id);
                    $deposit_refund_year = $ret_refund_year_month[0]->june_year;
                }

                $receipt_pdf_name = $this->receipt_pdf($ref_no, $transaction_history, $total_amount, $ref_institute_id, $ref_school_id, $session_school_id, $collection_type, $receipt_letterhead, $is_duplicate, $is_mail, $financial_year, $deposit_refund_year, $is_mobile, $is_mgr_call, $payment_class_id,$total_discount,$head_data,$total_late_fee);
                $invoice_path = APP_WEB_URL.'/application/uploads/collection_receipts/'.$receipt_pdf_name;
                if($return){
                	echo $receipt_pdf_name;
                } else {
                	echo $receipt_pdf_name;
                }
            }
        }
        return '-';
    }

    /**
     * PDF Generation
     * Fee PDF && Deposit PDF
     * @return string
     */
    public function receipt_pdf($ref_no, $transaction_history, $total_amount, $ref_institute_id, $ref_school_id, $session_school_id, $collection_type, $receipt_letterhead, $is_duplicate, $is_mail, $financial_year, $deposit_refund_year, $is_mobile, $is_mgr_call, $payment_class_id,$total_discount,$head_data,$total_late_fee)
    {
        $header_img = $this -> School_model -> fetch_header_data($ref_institute_id,$ref_school_id);
        $data = array (
                        'total_amount'        => $total_amount,
                        'transaction_history' => $transaction_history,
                        'receipt_letterhead'  => $receipt_letterhead,
                        'is_duplicate'        => $is_duplicate,
                        'deposit_refund_year' => $deposit_refund_year,
                        'mobile'              => $is_mobile,
                        'is_mgr_call'         => $is_mgr_call,
                        'total_discount'      => $total_discount,
                        'total_late_fee'      => $total_late_fee,
                        'head_data'           => $head_data,
                        'install_name'        => $install_name,
                        'header_img'          => $header_img
                    );

        if ($ref_institute_id == 1) {  // Deposit
            $receipt_html = $this -> load -> view('account/collection/receipt/deposit_pdf', $data, TRUE);  
        } else {  // Fee
            $receipt_html = $this -> load -> view('account/collection/receipt/fee_pdf', $data, TRUE);
        }
        $ret_receipt_array = array();
        // if ($is_duplicate == TRUE  && $is_mgr_call){
            $ret_receipt_array = $this->receipt_attachment($ref_no, $session_school_id, $receipt_html);
        // }

        // Mail
        if($is_mail){ // Receipt history handle
            $this->mail_receipt($ref_no, $session_school_id, $ref_school_id, $ref_institute_id, $collection_type, $total_amount, $receipt_html, $is_duplicate, $ret_receipt_array, $payment_class_id);
        }

        // Return PDF Name
        if ($is_duplicate && $is_mgr_call) {
            return $ret_receipt_array['return_path'];
        } else {
            return $receipt_html;    
        }
    }

    /**
     * Mail Receipt
     * Mails PDF receipt to parents
     * @return null
     */
    function mail_receipt($ref_no, $session_school_id, $ref_school_id, $ref_institute_id, $collection_type, $total_amount, $output, $is_duplicate, $attachment_array, $payment_class_id) {
        // Fetching parent emails
        $email_parent_array = array();
        $parent_emails = $this-> Student_model ->get_parent_emails($session_school_id, $ref_no);
        if ($parent_emails != NULL) {
            $ret_parent_emails = $parent_emails->result();
            foreach ($ret_parent_emails as $key => $value) {
                if (isset($value->father_email_id) && $value->father_email_id != null) 
                {
                     $father_email = array(
                                'email' => trim($value->father_email_id),
                                'name'  => $value->father_f_name,
                                'type'  => 'to',
                            );
                    array_push($email_parent_array, $father_email);
                }
                if (isset($value->mother_email_id) && $value->mother_email_id != null){
                     $mother_email = array(
                                'email' => trim($value->mother_email_id),
                                'name'  => $value->mother_f_name,
                                'type'  => 'to',
                            );
                    array_push($email_parent_array, $mother_email);
                }
            }
        }

        // Mail
        $filename = ucfirst($collection_type)."-Receipt.pdf";
        $output_attach = '<br><br><hr>'.$output.'<hr>';
        $attachments = array();
        // if ($is_duplicate) {
        //     $output_attach = '';
            $attachments = $attachment_array['attachemt_array'];
        // }

        $subject_content = 'Receipt from Walnut School';

        $email_sender_info = array('module_code' => 'FEE_DEPO', 'school_id' => $session_school_id, 'ref_sch_id' => $ref_school_id, 'ref_inst_id' => $ref_institute_id);
        $email_sender = Send_mail_helper::get_sender_data($email_sender_info);
        $sender_name = 'Walnut School';
        if ($ref_institute_id != 1 && $ref_institute_id != 0 && $ref_school_id == 0) 
        {
            $sender_name = substr($email_sender['sender_name'],0,7);
        }
        
        $regards = "Regards,<br>The ".$sender_name." Administration Team";
        $preview_content = 'Dear Sir/Madam,<br><br> Please find the receipt for the '.ucwords($collection_type).' amounting to Rs. '.number_format($total_amount).' attached with this mail. Kindly keep this mail for your reference. Please do not reply to this mail address - as this mail has been sent from an automated system.<br><br>'.$output_attach;

        $email_sender_array = array( 
                                        'sender_name' => isset($email_sender['sender_name'])?$email_sender['sender_name']:'',
                                        'from_email'  => isset($email_sender['from_email'])?$email_sender['from_email']:'',
                                        'school_id'   => $session_school_id,
                                        'bcc_email'   => TRUE
                                    );

        if(!empty($email_parent_array)){
            Send_mail_helper::send_mail($email_parent_array, $preview_content, $subject_content, $attachments, $email_sender_array);
        }

        if ($ref_institute_id == 1 && !$is_duplicate) 
        {
            // Send welcome emails
            $this->welcome_email_service($email_parent_array, $session_school_id, $ref_school_id, $ref_institute_id, $ref_no, $payment_class_id);
        }
    }

    /**
     * Student STATUS Convert - Todo - Rethink the logic year wise
     * Convert status from Defaulter to New || Current
     * @return boolean
     */
    public function convert_student_status($ref_no, $selected_financial_year, $payplan_id, $selected_installment_id, $collection_type, $session_school_id)
    {
        $student_status = $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'status');
        if($student_status == 6) {
            $new_status = 1;
        } else if ($student_status == 7) {
            $new_status = 2;
        } 
        $academic_year = $this -> System_model -> get_academic_year();

        $student_admission_year =  $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'academic_year');
        if ($student_admission_year != $academic_year) 
        {
           //If earlier year fee is not paid and paid next year fee we can not change status current or new
            $previous_year = $this-> System_model ->calculate_previous_year($selected_financial_year);
            // Student class according to Financial Year selected
            $continuity_array = $this-> Fee_model ->get_computed_continuity_class($ref_no, $previous_year, $academic_year, NULL, $session_school_id);
            $computed_class_id = $continuity_array['computed_class'];

            // Payplan according to selected fin year & computed class
            $data['payplan'] = $this-> Fee_model ->get_refno_payplan_details($ref_no, $computed_class_id, $previous_year, $collection_type, $session_school_id);
            $data['school_id'] = $session_school_id;
            $data['class_id'] = $computed_class_id;
            $prviouse_change_status_flag = FALSE;
            // Fetch installment data
            $installment_info = $this-> Fee_model ->fetch_payplanwise_installment($data);
            foreach ($installment_info as $key => $value) {
                $previous_installment_id = $value->install_id;   
            }
            $previous_yearly_heads = $this -> Fee_model -> fetch_fees_details($ref_no, $session_school_id, $previous_year, $collection_type, $previous_installment_id,$data['payplan']);

            $pre_passed_due_flag = 0;
            foreach ($previous_yearly_heads as $yearly_key => $yearly_value) { 
                $paid_row = $this-> Fee_model -> check_paid_unpaid($ref_no, $yearly_value->financial_year, $yearly_value->payplan_id, $yearly_value->instl_no, $session_school_id, $yearly_value->fee_ref_school_id, $yearly_value->fee_ref_inst_id,$collection_type);
                if($paid_row == NULL) {
                    // Concessions & RTE
                    $concession_details = $this-> Fee_model ->refno_installment_concession_details($ref_no, $session_school_id, $collection_type, $previous_year, $yearly_value->instl_no,'collection');
                    if($concession_details != NULL){
                        foreach ($concession_details as $conces_key => $conc_row) {
                            // RTE Check
                            // if($conc_row->stud_rte == 1 && $yearly_value->fee_ref_school_id != 0 && $yearly_value->fee_ref_inst_id != 2) { // RTE and concession is applied and pay for only rethink fee
                            //     $pre_passed_due_flag++;
                            //     break;
                            // } else {
                                // Normal student concession check
                                if(($yearly_value->fee_ref_school_id == $conc_row->fee_ref_school_id) && ($yearly_value->fee_ref_inst_id == $conc_row->fee_ref_inst_id) && ($yearly_value->fee_head_id == $conc_row->fee_head_id) && ($yearly_value->financial_year == $conc_row->academic_year)) {
                                    $pre_passed_due_flag++;
                                    break;
                                }
                            // }
                        }
                    }
                } else {
                    $pre_passed_due_flag++; // Already paid
                }
            }
            if(count($previous_yearly_heads) == $pre_passed_due_flag) {
                $prviouse_change_status_flag = TRUE;
            }
        }else{
            $prviouse_change_status_flag = TRUE;
        }
        

        // For complete yearly installments, check previous due installments using today's date
        // Eg: P2 plan => APR , OCT
        // Case 1: Today = June 5, then previous due installment will be APR
        // Case 2: Today = Nov 5, then previous due installments will be APR && OCT
        // Case 3: If installment paid before due date => don't do previous installment check

        $change_status_flag = FALSE;
        // 1. Due Dates not passed (Yearly Heads for current installment only)
        $yearly_heads = $this -> Fee_model -> fetch_fees_details($ref_no, $session_school_id, $selected_financial_year,$collection_type, $selected_installment_id, $payplan_id);
        

        $passed_due_flag = 0;
        foreach ($yearly_heads as $yearly_key => $yearly_value) { // For case 1 & 2
            $paid_row = $this-> Fee_model -> check_paid_unpaid($ref_no, $yearly_value->financial_year, $payplan_id, $yearly_value->instl_no, $session_school_id, $yearly_value->fee_ref_school_id, $yearly_value->fee_ref_inst_id,$collection_type);
            if($paid_row == NULL) {
                // Concessions & RTE
                $concession_details = $this-> Fee_model ->refno_installment_concession_details($ref_no, $session_school_id, $collection_type, $selected_financial_year, $yearly_value->instl_no,'collection');
                if($concession_details != NULL){
                    foreach ($concession_details as $conces_key => $conc_row) {
                        // RTE Check
                        // if($conc_row->stud_rte == 1 && $yearly_value->fee_ref_school_id != 0 && $yearly_value->fee_ref_inst_id != 2) { // RTE and concession is applied and pay for only rethink fee
                        //     $passed_due_flag++;
                        //     break;
                        // } else {
                            // Normal student concession check
                            if(($yearly_value->fee_ref_school_id == $conc_row->fee_ref_school_id) && ($yearly_value->fee_ref_inst_id == $conc_row->fee_ref_inst_id) && ($yearly_value->fee_head_id == $conc_row->fee_head_id) && ($yearly_value->financial_year == $conc_row->academic_year)) {
                                $passed_due_flag++;
                                break;
                            }
                        // }
                    }
                }
            } else {
                $passed_due_flag++; // Already paid
            }
        }
        if(count($yearly_heads) == $passed_due_flag) {
            $change_status_flag = TRUE;
        }

        // 2. Already passed Due Dates (Yearly Heads for already passed installments)
        $yearly_heads = $this -> Fee_model -> fetch_fees_details_status_change($ref_no, $session_school_id, $selected_financial_year, $collection_type, $payplan_id);
       

        $passed_due_flag = 0;
        foreach ($yearly_heads as $yearly_key => $yearly_value) { // For case 1 & 2
            $paid_row = $this-> Fee_model ->check_paid_unpaid_status_change($ref_no, $yearly_value->financial_year, $payplan_id, $yearly_value->install_id, $session_school_id, $yearly_value->fee_ref_school_id, $yearly_value->fee_ref_inst_id, $yearly_value->fee_head_id,$collection_type);
            if($paid_row == NULL) {
                // Concessions & RTE
                $concession_details = $this-> Fee_model ->refno_installment_concession_details_status_change($ref_no, $session_school_id, $collection_type, $selected_financial_year, $yearly_value->install_id, $yearly_value->fee_head_id);
                if($concession_details != NULL){
                    foreach ($concession_details as $conces_key => $conc_row) {
                        // RTE Check
                        // if($conc_row->stud_rte == 1 && $yearly_value->fee_ref_school_id != 0 && $yearly_value->fee_ref_inst_id != 2) { // RTE and concession is applied and pay for only rethink fee
                        //     $passed_due_flag++;
                        //     break;
                        // } else {
                            // Normal student concession check
                            if(($yearly_value->fee_ref_school_id == $conc_row->fee_ref_school_id) && ($yearly_value->fee_ref_inst_id == $conc_row->fee_ref_inst_id) && ($yearly_value->fee_head_id == $conc_row->fee_head_id) && ($yearly_value->financial_year == $conc_row->academic_year)) {
                                $passed_due_flag++;
                                break;
                            }
                       // }
                    }
                }
            } else {
                $passed_due_flag++; // Already paid
            }
        }
        if(count($yearly_heads) == $passed_due_flag) {
            $change_status_flag = TRUE;
        }

        // Change Google State of student login from 'Suspended' to 'Active' and Add student to all the different subject Classrooms for his Class
        // Change status
        if($change_status_flag && $prviouse_change_status_flag)
        {
            if($this-> Student_model ->update_student_specific_info($ref_no, $session_school_id, 'status', $new_status))
            {
                $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12,'testing@walnutedu.in');
                $access_token = $this-> google_classroom ->get_access_token($client);
                $student_email = $this-> Student_model ->get_student_email($ref_no,$session_school_id);
                $data['emp_id']= $student_email[0]->user_email;
                $ret_update_student = $this->google_login ->UpdateStudentInfo($access_token,$data);
                $class_id = $this-> Student_model ->get_refno_classid($ref_no, $session_school_id);
                $classroom_array = array();
                $classroom_array = $this-> Classroom_model ->get_classroom_ids($class_id);
                for ($c = 0; $c < count($classroom_array); $c++) 
                {
                    $submissions_json = $this-> google_classroom ->addStudentToClassroom($access_token, $classroom_array[$c]->classroom_id, $data['emp_id']);
                }
                // return 1;
            } 
        } 
    }

    public function receipt_attachment($ref_no, $session_school_id, $output)
    {
        require_once APP_ROOT_PATH.'/library/dompdf/autoload.inc.php';
        $options = new Dompdf\Options();
        $options->set('isRemoteEnabled', TRUE);
        $dompdf = new Dompdf\Dompdf($options);
        $dompdf->load_html($output);
        $dompdf->render();
        $main_output = $dompdf->output();

        $random_num = rand(0, 5000);
        $file_name = 'Collection-Receipt-'.$ref_no.'-'.$random_num;
        file_put_contents('./application/uploads/collection_receipts/Collection-Receipt-'.$ref_no.'-'.$random_num.'.pdf', $main_output);
        $attachment_encoded = base64_encode($main_output);
        $return_duplicate_array = array();
        return $return_duplicate_array = array(
                                            "return_path" => base_url().'application/uploads/collection_receipts/Collection-Receipt-'.$ref_no.'-'.$random_num.'.pdf',
                                            "attachemt_array" => array(
                                                                        array(
                                                                            'content' => $attachment_encoded,
                                                                            'type' => "application/pdf",
                                                                            'name' => $file_name,
                                                                        )
                                                                    )
                                        );
    }

    public function welcome_email_service($email_parent_array, $session_school_id, $ref_school_id, $ref_institute_id, $ref_no, $payment_class_id)
    {
        $attachments_welcome = array();

        $subject_content_welcome = 'Welcome to the Walnut Family!';
        
        // $preview_content_welcome = $this->get_walcome_email_content($session_school_id, $ref_no, $payment_class_id);
        $preview_content = $this-> Student_welcome_email_model->check_welcome_email_data($session_school_id);
        if($preview_content!= NULL){
            $data['email_content']= $preview_content;
           }
        $preview_content_welcome = $data['email_content'][0]->email_content;

        $data['ref_no']      = $ref_no;
        $ret_student_account = $this-> Student_model ->get_student_account_details($ref_no,$session_school_id);

        $data['user_email']    = strtolower($ret_student_account[0]->user_email);
        $data['user_password'] = $ret_student_account[0]->user_password;
     
        $data['student_first_name']   = $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'first_name');
        $data['student_app_password'] = $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'web_password');
        $data['student_web_password'] = $this -> School_model -> get_walmiki_password($session_school_id);

        if (strpos($preview_content_welcome, '$$first_name$$') !== false) 
        {
            $stude_f_name = strtoupper($data['student_first_name']);
            $preview_content_welcome = str_replace('$$first_name$$', $stude_f_name, $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$refno$$') !== false) 
        {
            $refno = strtoupper($data['ref_no']);
            $preview_content_welcome = str_replace('$$refno$$', $refno, $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$user_email$$') !== false) 
        {
            $user_email = $data['user_email'];
            $preview_content_welcome = str_replace('$$user_email$$', $user_email, $preview_content_welcome);
        }

       if (strpos($preview_content_welcome, '$$user_password$$') !== false) 
        {
            $user_password = $data['student_web_password'];
            $preview_content_welcome = str_replace('$$user_password$$', $user_password, $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$user_app_password$$') !== false) 
        {
            $user_app_password = $data['user_password'];
            $preview_content_welcome = str_replace('$$user_app_password$$', $user_app_password, $preview_content_welcome);
        }

        $email_sender_info_welcome = array('module_code' => 'FEE_DEPO', 'school_id' => $session_school_id, 'ref_sch_id' => $ref_school_id, 'ref_inst_id' => $ref_institute_id);
        $email_sender_welcome = Send_mail_helper::get_sender_data($email_sender_info_welcome);
        $email_sender_array_welcome = array( 
                                        'sender_name' => isset($email_sender_welcome['sender_name'])?$email_sender_welcome['sender_name']:'',
                                        'from_email'  => isset($email_sender_welcome['from_email'])?$email_sender_welcome['from_email']:'',
                                        'school_id'   => $session_school_id,
                                        'bcc_mail_ids'=> 'pallavi.r@walnutedu.in', // Ketaki request to put to check walmiki user create or not 04/02/19
                                        'bcc_email'   => TRUE
                                    );

        if(!empty($email_parent_array)){
            $mail_sent = Send_mail_helper::send_mail($email_parent_array, $preview_content_welcome, $subject_content_welcome, $attachments_welcome, $email_sender_array_welcome);
            $email_result = $this-> Fee_model-> insert_walcome_email_content($ref_no, $session_school_id,$mail_sent);
            $send_content_to_app_result = $this -> save_in_student_app($ref_no, $payment_class_id, $preview_content_welcome, $session_school_id);
            return $mail_sent;
        }
    }

    // public function get_walcome_email_content($session_school_id, $ref_no, $admission_to)
    // {
    //     $data['ref_no']               = $ref_no;
    //     $ret_student_account = $this-> Student_model ->get_student_account_details($ref_no,$session_school_id);

    //     $data['user_email']    = strtolower($ret_student_account[0]->user_email);
    //     $data['user_password'] = $ret_student_account[0]->user_password;

    //     $data['student_first_name']   = $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'first_name');
    //     $data['student_app_password'] = $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'web_password');

    //     $ret_welcome_email_data = $this-> Student_welcome_email_model ->check_welcome_email_data($session_school_id);
    //     if ($ret_welcome_email_data != NULL) 
    //     {

    //         $data['principal_name']  = $this-> Employee_model->get_staff_name_info($ret_welcome_email_data[0]->principal);
    //         $data['admin_in_charge'] = $this-> Employee_model->get_staff_name_info($ret_welcome_email_data[0]->admin_in_charge);
    //         $contact_person = NULL;
    //         if ($ret_welcome_email_data[0]->contact_person != NULL) {
    //             $contact_person          = $this-> Employee_model->get_staff_name_info($ret_welcome_email_data[0]->contact_person);    
    //         }
            
    //         $data['school_email_id']            = $ret_welcome_email_data[0]->school_email_id;
    //         $data['school_phone_number']        = $ret_welcome_email_data[0]->school_phone_number;
    //         $transport_provider_data            = $ret_welcome_email_data[0]->transport_provider;

    //         $transport_number_data              = $ret_welcome_email_data[0]->transport_number;
    //         $data['transport_provider']         = $transport_provider_data." (".$transport_number_data.")";

    //         $canteen_provider                   = $ret_welcome_email_data[0]->canteen_provider;
    //         if ($canteen_provider != NULL) {
    //             $data['is_canteen']                       = "and canteen";
    //             $data['canteen_provider']                 = "Canteen provider : ".$canteen_provider." (".$ret_welcome_email_data[0]->canteen_number.")";
    //         } else {
    //             $data['is_canteen']                       = "";
    //             $data['canteen_provider']                 = "";
    //         }
            
    //         // if ($ret_welcome_email_data[0]->vice_principal != NULL) {
    //         //     $vice_or_co_ordinator       = $this-> Employee_model->get_staff_name_info($ret_welcome_email_data[0]->vice_principal);
    //         //     $data['vice_principal_or_coordinator']    = "Vice Principal is <b>".$vice_or_co_ordinator."</b>"; 
    //         // } else {
    //             $vice_or_co_ordinator       = $this-> Employee_model->get_staff_name_info($ret_welcome_email_data[0]->coordinator);
    //             if ($vice_or_co_ordinator == '' ||  $vice_or_co_ordinator == NULL) 
    //             {
    //                 $data['vice_principal_or_coordinator']    = "";  
    //             }else{
    //                 $data['vice_principal_or_coordinator']    = "and the Co-ordinator is <b>".$vice_or_co_ordinator."</b>";
    //             }  
    //         //}

    //         $data['things_from_school'] = ($admission_to > 11)?'Folder (This is all that the students have to carry! Why? You guessed it right – no school bag needed!)':'You guessed it right – no school bag needed!';

    //         $data['student_web_password'] = $this -> School_model -> get_walmiki_password($session_school_id);
    //         $data['admin_query']          = " in case of any administration related queries.";
    //         $data['appointment']          = "If you wish to get an appointment with any of the above mentioned people, you would need to talk to <b>".$contact_person."</b>";
    //         return $this -> load -> view('account/collection/welcome_email_content', $data, TRUE);
    //     }
    // }

    public function fetch_transaction_details()
    {  
        $payment_data = json_decode($this->input->post('payment_data_json'));
        $unpaid_array = unserialize(base64_decode($payment_data->unpaid_array));
        $data['payment_details'] = $payment_data->payment_details;
        $data['installment_id'] = $payment_data->installment_id;
        $data['partial_id_array'] = $payment_data->partial_id_array;
        // $data['custom_plan'] = $payment_data->custom_plan;
        $flag = $this->input->post('flag');
        $financial_year = $this -> System_model -> get_financial_year();
        $data['school_id'] = $_SESSION['school_id'];
        $data['accept_status'] = $this->input->post('accept_status');
        $data['parent_otp']    = $this->input->post('parent_otp');
        $trans_details = array();
        $admission_current_class  = $this-> Fee_model ->get_admission_class($payment_data->ref_no, $payment_data->session_school_id); 
        $current_class_id   = $admission_current_class[0]['admission_to'];
        $data['current_class_id'] = $current_class_id;
        // concession
        $data['concession_data'] = $this-> Fee_model ->concession_data_all($payment_data->ref_no, $payment_data->session_school_id, $current_class_id, $payment_data->financial_year);
        //Late fee
        $data['late_fee_data'] = $this-> Fee_model ->late_fee_data_all($payment_data->ref_no, $payment_data->session_school_id, $current_class_id, $payment_data->financial_year);
        foreach ($unpaid_array as $key => $value) 
        {
            // $query_fee_head  = $this-> Fee_model -> fetch_fee_head($value['payplan_head_id']);
            // if ($query_fee_head != "" || $query_fee_head != NULL) 
            // {
            //     foreach ($query_fee_head as $rowupdate_fee_head)
            //     {
                    $data_trans['fee_head_name']  = $value['payplan_head_name'];
            //     }
            // }

            // $query_installment  = $this-> Fee_model -> fetch_installment($value['install_id'],$value['school_id']);
            // if ($query_installment != "" || $query_installment != NULL) 
            // {
            //     foreach ($query_installment as $rowupdate_installment)
            //     {
                    $data_trans['installment_name']  = $value['install_name'];
            //     }
            // }
            $data_trans['yearly_setup_id'] =$value['yearly_setup_id'];
            $data_trans['payplan_install_amt'] = $value['payplan_install_amt'];
            $data_trans['payplan_inst_id'] = $value['payplan_inst_id'];
            $data_trans['payplan_sch_name'] = '';
            $data_trans['payplan_inst_name'] = '';
            if($value['payplan_sch_id'] != 0)
            {
                $school_data = $this-> School_model ->get_exclusive_school_data($value['payplan_sch_id']);
                if($school_data != NULL || $school_data != '')
                {
                  $data_trans['payplan_sch_name'] = $school_data[0]->school_name;
                }
            }else{
                $unique_institute_data = $this-> School_model ->get_institute_data($value['payplan_inst_id']);
                if ($unique_institute_data != '' || $unique_institute_data != null) {
                    $data_trans['payplan_inst_name'] = $unique_institute_data[0]->Instt_Name;
                }
            }
            
            $data_trans['payplan_sch_id'] = $value['payplan_sch_id'];
            $data_trans['academic_year'] = $value['academic_year'];
            $data_trans['payplan_head_id'] = $value['payplan_head_id'];
            $data_trans['install_id'] = $value['install_id'];
            $data_trans['class_id'] = $value['class_id'];
            $data_trans['school_id'] = $value['school_id'];
            $data_trans['payplan_id'] = $value['payplan_id'];
            $data_trans['user_name'] = $value['user_name'];
            $data_trans['due_date'] = $value['due_date'];
            $data_trans['custom_plan'] = $value['custom_plan'];
            array_push($trans_details, $data_trans);
        }
        
        foreach ($data['concession_data'] as $cons_key => $cons_value) 
        {        
            foreach ($trans_details as $key => $tran_value) 
            {
                if($tran_value['install_id'] == $cons_value['student_installment_no'] && $tran_value['custom_plan'] == 0)
                {
                    $exculsive_check = FALSE;
                    $total_fee_head_amount = 0;
                    if(($tran_value['payplan_sch_id'] == $cons_value['school_id']) && ($tran_value['payplan_inst_id'] == $cons_value['institude_id']) &&($tran_value['payplan_head_id'] == $cons_value['fee_head_id']) && ($tran_value['academic_year'] == $cons_value['academic_year']) && ($tran_value['install_id'] == $cons_value['student_installment_no'])) 
                    {
                        $exculsive_check = TRUE;
                    }

                    if($exculsive_check) {
                        if($cons_value['fee_head_id'] == $tran_value['payplan_head_id']) 
                        {
                            $total_fee_head_amount = $tran_value['payplan_install_amt'] - $cons_value['chq_amt'];
                        }
                        if($total_fee_head_amount == 0)
                        {
                            // unset($data['concession_data'][$cons_key]);
                            unset($trans_details[$key]);
                        }
                    }
                }
                // else{
                //     unset($data['concession_data'][$cons_key]);
                // }
            }
        }
       
        ////For partial discount
        // foreach ($data['concession_data'] as $cons_key => $cons_value) 
        // {
        //     if($cons_value['fee_head_id'] != NULL && $cons_value['student_installment_no'] != NULL && $cons_value['discount_id_fk'] == 0) 
        //         {
        //             unset($data['concession_data'][$cons_key]);
        //         }
        // }
        foreach ($data['concession_data'] as $cons_key => $cons_value) 
        {
            if($cons_value['discount_id_fk'] != 0) 
            {
                $discount_type  = $this-> Fee_model ->fetch_discount_type($cons_value['discount_id_fk']); 
                $data['concession_data'][$cons_key]['type'] = $discount_type;
            }else{
                $data['concession_data'][$cons_key]['type'] = ''; 
            }
        }
        // echo "<pre>";
        // print_r($data['concession_data']);return;
        $trans_details =  array_values($trans_details);
        
        $trans_install_array = array();
        foreach ($trans_details as $key => $trans_value) 
        {
            if(in_array($trans_value['install_id'],$trans_install_array))
            {   
                $trans_install_array[$trans_value['install_id']][] = array (
                                    'ref_no' => $payment_data->ref_no,
                                    'yearly_setup_id'        => $trans_value['yearly_setup_id'], 
                                    'payplan_install_amt'        => $trans_value['payplan_install_amt'], 
                                    'class_id'         => $trans_value['class_id'], 
                                    'payplan_inst_id'   => $trans_value['payplan_inst_id'], 
                                    'payplan_sch_id'   => $trans_value['payplan_sch_id'],
                                    'payplan_inst_name'   => $trans_value['payplan_inst_name'], 
                                    'payplan_sch_name'   => $trans_value['payplan_sch_name'], 
                                    'payplan_head_id'   => $trans_value['payplan_head_id'], 
                                    'school_id'   => $trans_value['school_id'], 
                                    'academic_year'   => $trans_value['academic_year'], 
                                    'install_id'   => $trans_value['install_id'],
                                    'installment_name'=> $trans_value['installment_name'],
                                    'fee_head_name'=> $trans_value['fee_head_name'],
                                    'payplan_id' => $trans_value['payplan_id'],
                                    'user_name' => $trans_value['user_name'],
                                    'due_date' =>  $trans_value['due_date'],
                                    'custom_plan' =>  $trans_value['custom_plan']
                                );

            }else{
                $trans_install_array[$trans_value['install_id']][] = array (
                                    'ref_no' => $payment_data->ref_no,
                                    'yearly_setup_id'        => $trans_value['yearly_setup_id'],
                                    'payplan_install_amt'        => $trans_value['payplan_install_amt'], 
                                    'class_id'         => $trans_value['class_id'], 
                                    'payplan_inst_id'   => $trans_value['payplan_inst_id'], 
                                    'payplan_sch_id'   => $trans_value['payplan_sch_id'],
                                    'payplan_inst_name'   => $trans_value['payplan_inst_name'], 
                                    'payplan_sch_name'   => $trans_value['payplan_sch_name'],  
                                    'payplan_head_id'   => $trans_value['payplan_head_id'], 
                                    'school_id'   => $trans_value['school_id'], 
                                    'academic_year'   => $trans_value['academic_year'], 
                                    'install_id'   => $trans_value['install_id'],
                                    'installment_name'=> $trans_value['installment_name'],
                                    'fee_head_name'=> $trans_value['fee_head_name'],
                                    'payplan_id' => $trans_value['payplan_id'],
                                    'user_name' => $trans_value['user_name'],
                                    'due_date' =>  $trans_value['due_date'],
                                    'custom_plan' =>  $trans_value['custom_plan']
                                );
            }
        }
        foreach ($trans_install_array as $key => $part) {
            if(isset($part['due_date']))
            {
               $sort[$key] = strtotime($part['due_date']);
            }
        }
        array_multisort($sort, SORT_ASC, $trans_install_array);
        if($flag == 'actual'){
            $data['trans_install_array'] = $trans_install_array;
            $this-> load -> view('account/student_account/student_fee_details', $data);
        }else if($flag == 'partial'){
            $max_trans_install_array = max(array_keys($trans_install_array));
            $data['trans_install_array'][$max_trans_install_array] = $trans_install_array[$max_trans_install_array];
            $this-> load -> view('account/student_account/student_partial_fee', $data);
        }else{
            // Class Info
            $ret_class_data = $this -> Student_model -> fetch_class_info($data['school_id']);
            if ($ret_class_data != null || $ret_class_data != '') {
                $data['class_info'] = $ret_class_data;
            } else {
                $data['class_info'] = NULL;
            }

            // Payplan Info
            $ret_payplan_data = $this -> Fee_model -> fetch_all_payplan($data['school_id']);
            if ($ret_payplan_data != null || $ret_payplan_data != '') {
                $data['payplan_info'] = $ret_payplan_data;
            } else {
                $data['payplan_info'] = NULL;
            }

            // Fee or Dep Selection
            $data['fee_or_dep'] = array(
                                'fee' => 'Fee',
                                'dep' => 'Deposit',
                                'exam'=>'Exam Fee'
                            );
            $data['current_academic_year'] = $this -> System_model -> get_academic_year();
            $data['next_academic_year'] = $this -> System_model -> get_next_academic_year();
            $data['previous_academic_year'] = $this -> System_model -> get_previous_academic_year();
            $data['selected_financial_year'] = $payment_data->financial_year;
            $data['refno'] = $payment_data->ref_no;
            $data['class_id'] = $payment_data->class_id;
            $data['payplan_id'] = $payment_data->payplan_id;
            $data['feeordep'] = 'fee';//$this->input->post('feeordep');
            $data['financial_year'] = $payment_data->financial_year;  // Here year selected is changed from default to whatever is UI selected
            $data['installment_id'] = $data['installment_id'];
            
            // Installments
            $ret_installment_data = $this -> Fee_model -> fetch_all_installment($data);
            if ($ret_installment_data != null || $ret_installment_data != '') {
                $data['installment_info'] = $ret_installment_data;
            } else {
                $data['installment_info'] = NULL;
            }

            $class_selected_flag = TRUE; // Default -> CLASS is selected
            if ($data['refno'] != null || $data['refno'] != '') {
                $data['class_id'] = $this -> Student_model -> get_refno_classid($data['refno'], $data['school_id']);
                $class_selected_flag = FALSE; // REFNO is selected
            }

            $data['student_payment_details'] = NULL;
           
            $student_payment_details = $this->fetch_elligible_students($data, $class_selected_flag);
            $data['student_payment_details']= $student_payment_details;
            $this-> load -> view('account/student_account/student_payment_link_details', $data);
        }
    }

     /**
     * Compute student pending fees/deposits based on UI selections
     * 
     * @return array
     */
    public function fetch_elligible_students($data, $class_selected_flag)
    {
        $academic_year = $this -> System_model -> get_academic_year(); // Running academic year
        $next_year      = $this -> System_model -> get_next_financial_year();

        if ($data['feeordep'] == 'dep') {
            $fee_selected_flag = 'dep';
        }else if($data['feeordep'] == 'exam'){
            $fee_selected_flag = 'exam';
        } else {
            $fee_selected_flag = 'fee';
        }
        // Check Refnos for their pending fees/deposits
        $payment_details_array = array();
        $defaulter_flag = '';
        $data['ref_no'] = $data['refno'];
        $data['session_school_id'] = $data['school_id'];
        $data['collection_type'] = $data['feeordep'];
        $data['selected_financial_year'] = $data['financial_year'];

         // Computed Class
        $computed_class_id = $this -> Fee_model -> get_computed_continuity_class($data['refno'], $data['financial_year'], $academic_year, NULL, $data['school_id']);
        
        $yearly_heads_array = array();
        $data['partial_fee_data'] = $this-> Fee_model ->fetch_partial_fees_details_all($data['refno'], $data['school_id'], $computed_class_id['computed_class'],$data['financial_year'], $data['payplan_id'],$data);
        if($data['partial_fee_data'] != NULL)
        {
            $data['unpaid_amount'] = 0;
            $highest_install_amt = 0;
            $min_due_date = array();
            foreach ($data['partial_fee_data'] as $key => $data_value)
            {
                $today = date('Y-m-d');
                $due_date = date('Y-m-d', strtotime($data_value['due_date']));
                $today_time = strtotime($today);
                $due_date_time = strtotime($due_date);
                if (($due_date_time - $today_time) < 30*24*60*60) 
                {
                    if($data_value['is_paid'] == 0)
                    {
                        array_push($min_due_date,$due_date_time);
                        // $data['unpaid_amount'] = $data['unpaid_amount']+$data_value['chq_amt'];
                    }
                }
            }
            $first_payment = min($min_due_date);
            foreach ($data['partial_fee_data'] as $key => $data_value)
            {
                $due_date = date('Y-m-d', strtotime($data_value['due_date']));
                $due_date_time = strtotime($due_date);
                if($due_date_time == $first_payment)
                {
                    $data['unpaid_amount'] = $data['unpaid_amount']+$data_value['chq_amt'];
                }
            }
            $partial_id_array = array();
            $installment_id_array = explode(',',$data['installment_id']);
            $installment_id_array = array_unique(array_values($installment_id_array));
            foreach ($installment_id_array as $inst_key => $inst_value) 
            {
                $total_fee_head_amount = 0; // IMP to check refno total fee & deposit
                $refno_yearly_payment_array = array();
                foreach ($data['partial_fee_data'] as $key => $data_value) 
                {
                    $due_date = date('Y-m-d', strtotime($data_value['due_date']));
                    $due_date_time = strtotime($due_date);
                    if($due_date_time == $first_payment && $inst_value == $data_value['Instt_id'])
                    {
                        $total_fee_head_amount = $data_value['chq_amt']+$total_fee_head_amount;
                        $student_fee_details_array = array(
                                                                    'year_head_data' => $data_value,
                                                                    'refno'          => $data['refno'],
                                                                );
                        array_push($refno_yearly_payment_array, $student_fee_details_array);
                        array_push($partial_id_array,$data_value['partial_id']);
                    }
                }
                if ($total_fee_head_amount > 0) 
                {
                    $payment_details_array[$data['refno']][$inst_key] = $refno_yearly_payment_array;
                    $payment_details_array[$data['refno']][$inst_key]['total'] = $total_fee_head_amount;
                    $payment_details_array[$data['refno']][$inst_key]['payplan'] = $data['payplan_id'];
                    $payment_details_array[$data['refno']][$inst_key]['current_class'] = $data['class_id'];
                    $payment_details_array[$data['refno']][$inst_key]['payment_class_id'] = $computed_class_id;
                    $payment_details_array[$data['refno']][$inst_key]['installment'] = $inst_value;
                    // $payment_details_array[$refno_value['refno']][$inst_value]['defaulter_flag'] = $defaulter_flag;

                }
            }
            $partial_id_array = array_values($partial_id_array);
            $data['partial_id_array'] = implode(',', $partial_id_array);
        }else{
            // Yearly Fee Heads
            $yearly_heads = $this -> Fee_model -> fetch_fees_details_all($data['refno'], $data['school_id'], $computed_class_id['computed_class'],$data['financial_year'], $data['payplan_id'],$data);

            foreach ($yearly_heads as $head_key => $head_value) 
            {
                if(in_array($head_value['instl_no'],$yearly_heads_array))
                { 
                    $yearly_heads_array[$head_value['instl_no']][] = $head_value;
                }else{
                    $yearly_heads_array[$head_value['instl_no']][] = $head_value;
                }
            }
            // Student Computed Payplan
            $computed_payplan_id = $this -> Fee_model -> get_refno_payplan_details($data['refno'], $computed_class_id['computed_class'], $data['financial_year'], $fee_selected_flag, $data['school_id']);

            if ($computed_payplan_id == $data['payplan_id']) // Only filter UI selected payplan refnos
            {
                // FOR EACH FEE HEADS
                $installment_id_array = explode(',',$data['installment_id']);
                foreach ($installment_id_array as $inst_key => $inst_value) 
                {
                    $total_fee_head_amount = 0; // IMP to check refno total fee & deposit
                    $refno_yearly_payment_array = array();
                    foreach ($yearly_heads_array[$inst_value] as $key => $year_head_value) 
                    {
                        // CHECK FEE PAID OR UNPAID
                        $check_paid_refno = $this -> Fee_model -> check_paid_unpaid($data['refno'], $data['financial_year'], $data['payplan_id'], $inst_value, $data['school_id'], $year_head_value['school_id'], $year_head_value['institude_id'],$data['feeordep']);

                        // CHECK PAID OR UNPAID
                        if ($check_paid_refno == NULL) {
                            $concession_details = $this-> Fee_model -> refno_installment_concession_details($data['refno'], $data['school_id'], $data['feeordep'], $data['financial_year'], $inst_value,'link');

                            if($concession_details != NULL)
                            {
                                $amount = 0;
                                $concession_array = array ();
                                foreach ($concession_details as $conces_key => $conc_row) {
                                    if($inst_value == $conc_row->student_installment_no)
                                    {
                                        // RTE and concession is applied and show for only rethink fee
                                        if($conc_row->stud_rte == 1 && $year_head_value->fee_ref_school_id != 0 && $year_head_value->fee_ref_inst_id != 2) {
                                            if(($year_head_value['fee_head_id'] == $conc_row->fee_head_id)){
                                                $concession_array = array();
                                                $amount = $amount + $conc_row->student_concession_amt; 
                                                $concession[$inst_value] = array (
                                                                            'amount'        => $amount,
                                                                            'fee_head_id'   => $conc_row->fee_head_id,
                                                                            'is_rte'        => $conc_row->stud_rte,
                                                                        );
                                                array_push($concession_array, $concession);
                                            }
                                                // break;
                                        } else {
                                            // Check if concession matches
                                            $exculsive_check = FALSE;
                                            if($data['feeordep'] == 'fee' || $data['feeordep'] == 'exam') {
                                                if(($year_head_value['school_id'] == $conc_row->fee_ref_school_id) && ($year_head_value['institude_id'] == $conc_row->fee_ref_inst_id) && ($year_head_value['fee_head_id'] == $conc_row->fee_head_id) && ($year_head_value['financial_year'] == $conc_row->academic_year) ) {
                                                    $exculsive_check = TRUE;
                                                }
                                            } else if(($year_head_value['institude_id'] == $conc_row->fee_ref_inst_id)) {
                                                $exculsive_check = TRUE; // Deposit entry present in concession then mark PAID (as paid only once throughout)
                                            }
                                            if($exculsive_check) {
                                                $concession_array = array();
                                                $amount = $amount + $conc_row->student_concession_amt; 
                                                $concession[$inst_value] = array (
                                                                            'amount'        => $amount, // Conc amount needs to be deducted
                                                                            'fee_head_id'   => $conc_row->fee_head_id,
                                                                            'is_rte'        => $conc_row->stud_rte,
                                                                        );
                                            array_push($concession_array, $concession);
                                            } 
                                            // else {
                                            //     $concession_array = array ();
                                            // }
                                        }
                                    }
                                }
                            if(count($concession_array) != 0)
                            {
                                foreach ($concession_array as $key => $concession_value) 
                                {
                                    // Concession Amount
                                    if(count($concession_value[$inst_value]) != 0) {
                                        // Amount with concession
                                        if($concession_value[$inst_value]['fee_head_id'] == $year_head_value['fee_head_id']) {
                                            $total_fee_head_amount = $total_fee_head_amount + $year_head_value['chq_amt'] - $concession_value[$inst_value]['amount'];
                                        }
                                            // RTE concession_value carried forward
                                            // if($concession_value[$inst_value]['is_rte'] == 1) {
                                            //     $total_fee_head_amount = 0;
                                            // }
                                        // Else full concession applied - Amount 0 so loops out
                                    }
                                }
                            }else{
                                $total_fee_head_amount = $total_fee_head_amount + $year_head_value['chq_amt'];
                            }
                        } else {
                            // Normal amount
                            $total_fee_head_amount = $total_fee_head_amount + $year_head_value['chq_amt'];
                        }
                        //Late Fee
                        $total_late_fee = 0;
                        $late_fee_details = $this-> Fee_model -> refno_installment_late_fee_details($data['refno'], $data['school_id'], $data['feeordep'], $data['financial_year'], $inst_value,'link');
                        if($late_fee_details != NULL)
                        {
                            foreach ($late_fee_details as $late_key => $late_row) 
                            {
                                if($inst_value == $late_row->student_installment_no)
                                {
                                    if($data['feeordep'] == 'fee' || $data['feeordep'] == 'exam') 
                                    {
                                        if(($year_head_value['school_id'] == $late_row->fee_ref_school_id) && ($year_head_value['institude_id'] == $late_row->fee_ref_inst_id) && ($year_head_value['fee_head_id'] == $late_row->fee_head_id) && ($year_head_value['financial_year'] == $late_row->academic_year) ) 
                                        {
                                            $total_late_fee = $total_late_fee + $late_row->student_late_fee_amt;
                                        }
                                    }
                                }
                            }
                        }
                        $total_fee_head_amount = $total_fee_head_amount + $total_late_fee;
                            // Create a stud array with all details
                            $student_fee_details_array = array(
                                                                'year_head_data' => $year_head_value,
                                                                'refno'          => $data['refno'],
                                                            );
                            array_push($refno_yearly_payment_array, $student_fee_details_array);
                        }
                    }
                    if ($total_fee_head_amount > 0) {
                        $payment_details_array[$data['refno']][$inst_key] = $refno_yearly_payment_array;
                        $payment_details_array[$data['refno']][$inst_key]['total'] = $total_fee_head_amount;
                        $payment_details_array[$data['refno']][$inst_key]['payplan'] = $data['payplan_id'];
                        $payment_details_array[$data['refno']][$inst_key]['current_class'] = $data['class_id'];
                        $payment_details_array[$data['refno']][$inst_key]['payment_class_id'] = $computed_class_id;
                        $payment_details_array[$data['refno']][$inst_key]['installment'] = $inst_value;
                        // $payment_details_array[$refno_value['refno']][$inst_value]['defaulter_flag'] = $defaulter_flag;

                    }
                }
            }
        }
        if ($payment_details_array != null || $payment_details_array != '') {
            return $payment_details_array;
        } else {
            return NULL;
        }
    }

    public function fetch_discount_details()
    {
        $data['school_id']               = $_SESSION['school_id'];
        $data['academic_year']           = $this -> System_model -> get_academic_year();
        $data['flag'] = 'account';

        $payment_data = json_decode($this->input->post('payment_data_json'));
        $unpaid_array = unserialize(base64_decode($payment_data->unpaid_array));
        $data['payment_details'] = $payment_data->payment_details;
        $data['installment_id'] = explode(',', $payment_data->installment_id);
        $data['ref_no'] = $payment_data->ref_no;
        $trans_details = array();
        $admission_current_class  = $this-> Fee_model ->get_admission_class($payment_data->ref_no, $payment_data->session_school_id); 
        $current_class_id   = $admission_current_class[0]['admission_to'];
        // concession
        $data['concession_data'] = $this-> Fee_model ->concession_data_all($payment_data->ref_no, $payment_data->session_school_id, $current_class_id, $payment_data->financial_year);
        
        foreach ($unpaid_array as $key => $value) 
        {
            $query_fee_head  = $this-> Fee_model -> fetch_fee_head($value['payplan_head_id']);
            if ($query_fee_head != "" || $query_fee_head != NULL) 
            {
                foreach ($query_fee_head as $rowupdate_fee_head)
                {
                    $data_trans['fee_head_name']  = $rowupdate_fee_head['fee_head_name'];
                }
            }

            $query_installment  = $this-> Fee_model -> fetch_installment($value['install_id'],$value['school_id']);
            if ($query_installment != "" || $query_installment != NULL) 
            {
                foreach ($query_installment as $rowupdate_installment)
                {
                    $data_trans['installment_name']  = $rowupdate_installment['name_of_installment'];
                }
            }
            $data_trans['yearly_setup_id'] =$value['yearly_setup_id'];
            $data_trans['payplan_install_amt'] = $value['payplan_install_amt'];
            $data_trans['payplan_inst_id'] = $value['payplan_inst_id'];
            $data_trans['payplan_sch_id'] = $value['payplan_sch_id'];
            $data_trans['academic_year'] = $value['academic_year'];
            $data_trans['payplan_head_id'] = $value['payplan_head_id'];
            $data_trans['install_id'] = $value['install_id'];
            $data_trans['class_id'] = $value['class_id'];
            $data_trans['school_id'] = $value['school_id'];
            $data_trans['payplan_id'] = $value['payplan_id'];
            $data_trans['user_name'] = $value['user_name'];
            array_push($trans_details, $data_trans);
        }

        $student_concession              = array();
        $student_fee_details             = array();
        for ($k=0; $k < count($trans_details); $k++) 
        { 
            $array_paid_data                 = array();
            
            $data['student_name']            = $trans_details[$k]['user_name'];
            $data['fee_or_dep']              = 'fee';//$this->input->post('fee_or_dep');
            $data['class_id']                = $trans_details[$k]['class_id'];
            // $data['ref_no']                  = strtoupper($this->input->post('ref_no'));
            $data['selected_financial_year'] = $trans_details[$k]['academic_year'];
            $data['selected_installment_id'] = $trans_details[$k]['install_id'];
            $data['payplan_id']              = $trans_details[$k]['payplan_id'];
            $data['fee_head_name1']          = $trans_details[$k]['fee_head_name'];
            $data['installment_name1']       = $trans_details[$k]['installment_name'];
            $rte_flag                        = 0;
            $data['check_setup']             = 0;
            $data['prev_count']              = 0;
            $data['prev_row_concession']     = "";
            $data['manage_photo']            = "";
            $data['app_photo']               = "";
            $data['discounted_amt']          = 0;
            $data['discount_amt_check_db']   = "";
            $data['newcom']                  = "";
            $data['approve_status']          = 0;
            $data['Inst']                    = '';
            $data['final_dis_amt']           = 0;
            $data['student_concession_data'] = "";
            $photo_path                      = "";
            $data['dep_applicable']          = '';

            $payplan_data = $this -> Fee_model -> get_payplan_data();
            if ($payplan_data != NULL && $payplan_data != '') {
                $data['payplan_data'] = $payplan_data;
            }else{
                $data['payplan_data'] = NULL;
            }
            
            $student_admission_year =  $this-> Student_model ->fetch_student_specific_info($data['ref_no'], $data['school_id'], 'academic_year');
            if ($data['fee_or_dep'] =='dep') 
            {
                if ($student_admission_year != $data['selected_financial_year']) 
                {
                    $data['dep_applicable'] = 'Discount Not applicable';
                }
            }
            
            // Student class according to Financial Year selected
            $continuity_array = $this-> Fee_model ->get_computed_continuity_class($data['ref_no'], $data['selected_financial_year'], $data['academic_year'], NULL, $data['school_id']);
            $computed_class_id      = $continuity_array['computed_class'];
            $is_next_class          = $continuity_array['is_next_class'];

            $data['school_code']    = $this -> School_model -> get_school_code($data['school_id']);

            // get paid inst fee_head_id for given selectn
            $data['fee_head_id'] = $this -> Fee_model -> get_paid_head_id($data['fee_or_dep'],$data['selected_financial_year'],$data['ref_no'],$data['selected_installment_id'],$data['school_id']);
            $paid_dep_academic_year = $data['selected_financial_year'];
            if($data['fee_head_id'] != "" || $data['fee_head_id'] != NULL)
            {
                if ($data['fee_or_dep'] == 'dep') { //for DEP to check deposite paid year
                    $paid_dep_academic_year = $data['fee_head_id'][0]->acadamic_year;
                }
                foreach ($data['fee_head_id'] as $value)
                {
                    $fee_head_id = $value->fee_head_id;
                    array_push($array_paid_data,$fee_head_id);
                }
            }

            //discount config
            $discount_config = $this-> Fee_model -> discount_config_list($data['school_id'],$computed_class_id);
            if ($discount_config != NULL || $discount_config != '')
            {
                $data['discount_config_list'] = $discount_config;
            }

            //RTE concession query
            $rte_flag_data = $this-> Fee_model ->rte_concession($data['fee_or_dep'],$data['selected_financial_year'],$data['ref_no'],$data['selected_installment_id'],$data['school_id']);
            if ($rte_flag_data != "" || $rte_flag_data != NULL) 
            {
                foreach ($rte_flag_data as $value)
                {
                   if($value->stud_rte == 1)
                   {
                        $rte_flag = 1;
                   }
                }
            }

            //Check Fee Setup Is Set OR Not
            $check_fee_setup = $this-> Fee_model ->check_fee_setup($data['fee_or_dep'],$data['selected_financial_year'],$data['selected_installment_id'],$data['school_id'],$computed_class_id);
            if ($check_fee_setup != "" || $check_fee_setup != NULL) 
            {
                $data['check_setup'] = $check_fee_setup;
            }
            //previous concession
            $prev_concession_data = $this-> Fee_model -> prev_concession($data['selected_financial_year'],$data['ref_no'],$data['selected_installment_id'],$data['school_id']);
            if ($prev_concession_data != "" || $prev_concession_data != NULL) 
            {
                $data['prev_count'] = 1;
                $data['prev_row_concession'] = $prev_concession_data;
            }

            $student_concession_data = $this-> Fee_model -> student_concession_data($rte_flag,$data['fee_or_dep'],$paid_dep_academic_year,$data['ref_no'],$data['selected_installment_id'],$data['school_id'],$data['fee_head_name1'],$data['installment_name1'],$computed_class_id);

            $data['mysql_num_rows'] = count($student_concession_data);

            if ($student_concession_data != "" || $student_concession_data != NULL) 
            {
                $data['fee_flag'] = 0;
                foreach ($student_concession_data as $rowist)
                {               
                    if (!in_array($rowist['fee_head_id'], $array_paid_data))
                    {
                        if($rowist['school_name'] == '')
                        {
                            $data_ret['Inst'] = $rowist['instt_name'];
                        }else{
                            $data_ret['Inst'] = $rowist['school_name'];
                        }
                        $data_ret['final_dis_amt'] = $rowist['fee_head_amt'];
                        $query_select_con = $this-> Fee_model -> concession_data($data['ref_no'],$rowist['fee_head_id'],$data['selected_financial_year'],$data['selected_installment_id'],$data['school_id']);
                        if ($query_select_con != "" || $query_select_con != NULL) 
                        {
                            $i = 0;
                            foreach ($query_select_con as $row_con)
                            {
                                $data_ret['discounted_amt']         = $row_con['student_concession_amt'];
                                $data_ret['discount_amt_check_db']  = $row_con['student_concession_amt'];
                                $data_ret['newcom']                 = $row_con['comment'];
                                $data_ret['discount_id_fk']         = $row_con['discount_id_fk'];
                                $data_ret['manage_photo']           = $row_con['manage_photo'];
                                $data_ret['app_photo']              = $row_con['app_photo'];

                                if ($row_con['approve'] == 1)
                                {
                                    $data_ret['approve_status'] = 1;
                                }else{
                                    $data_ret['approve_status'] = 0;
                                }
                                if($i == 0)
                                {
                                    $data_ret[$i]['final_dis_amt'] = floatval($rowist['fee_head_amt']) - floatval($data_ret['discounted_amt']);
                                }else{
                                    $data_ret[$i]['final_dis_amt'] = floatval($data_ret[$i-1]['final_dis_amt']) - floatval($data_ret['discounted_amt']);
                                }
                                $data_ret['final_dis_amt']      = $data_ret[$i]['final_dis_amt'];
                                $data_ret['fee_ref_school_id']  = $rowist['fee_ref_school_id'];
                                $data_ret['fee_ref_inst_id']    = $rowist['fee_ref_inst_id'];
                                $data_ret['fee_head_name']      = $rowist['fee_head_name'];
                                $data_ret['fee_head_amt']       = $rowist['fee_head_amt'];
                                $data_ret['instl_name']         = $rowist['instl_name'];
                                array_push($student_concession, $data_ret);
                                $i++;
                            }
                        }
                        $data_ret_des['final_dis_amt'] = $data_ret['final_dis_amt'];
                        $data_ret_des['Inst'] =  $data_ret['Inst'];
                        $data_ret_des['discounted_amt']          = 0;
                        $data_ret_des['discount_amt_check_db']   = "";
                        $data_ret_des['newcom']                  = "";
                        $data_ret_des['approve_status']          = 0;
                        $data_ret_des['manage_photo']            = "";
                        $data_ret_des['app_photo']               = "";
                        $data_ret_des['fee_ref_school_id']  = $rowist['fee_ref_school_id'];
                        $data_ret_des['fee_ref_inst_id']    = $rowist['fee_ref_inst_id'];
                        $data_ret_des['fee_head_id']        = $rowist['fee_head_id'];
                        $data_ret_des['fee_head_name']      = $rowist['fee_head_name'];
                        $data_ret_des['fee_head_amt']       = $rowist['fee_head_amt'];
                        $data_ret_des['instl_name']         = $rowist['instl_name'];
                        $data_ret_des['computed_class_id']  = $computed_class_id;
                        array_push($student_fee_details, $data_ret_des);
                        $data['fee_flag']++;
                    }
                }
            }
        }
        $result_student_fee_details = array_map("unserialize", array_unique(array_map("serialize", $student_fee_details)));
        $result_student_concession_data = array_map("unserialize", array_unique(array_map("serialize", $student_concession)));
        $data['student_concession_data'] = $result_student_concession_data;
        $data['student_fee_details']     = $result_student_fee_details;
        //Check RTE Student
        $query_rte_stud = $this-> Student_model -> fetch_student_specific_info($data['ref_no'], $data['school_id'],'stud_rte');
        if ($query_rte_stud != "" || $query_rte_stud != NULL) 
        {
            $data['stud_rte'] = $query_rte_stud;
        }
        $this-> load -> view('account/discount/view_student_discount', $data);
    }

    /**
     * ******** Save Payment Transaction ********
     * 
     * @return
     */
    function save_partial_transaction(){
        $inst_split_array = unserialize(base64_decode($_POST['split_array']));
        $payment_details = unserialize(base64_decode($_POST['payment_details']));
        $installment_id = $_POST['installment_id'];
        $installment_id_array = explode(',',$installment_id);
        $install_id = '';
        $final_trans_details = array();
        $school_array = array();
        $institute_array = array();
        foreach ($inst_split_array as $inst_key => $inst_value) 
        {
            $head_data = [];
            $head_inst_data = [];
            $ret_data = '';
            $discount = 0;
            foreach ($inst_value as $trans_inst_key => $trans_inst_value) 
            {
                if ($inst_key == $trans_inst_value['install_id']) 
                {
                    if($trans_inst_value['payplan_sch_id'] == $trans_inst_value['school_id'])
                    {
                        $discount = $_POST['concession_spilt'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $discount_type = $_POST['concession_type'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $partial_amt = $_POST['partial_amt_spilt'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $ret_data = array(
                                    'head_id' => $trans_inst_value['payplan_head_id'], 
                                    'head_amount' => $partial_amt-$discount,
                                    'discount' => $discount,
                                    'discount_type' => $discount_type);
                        array_push($head_data,(object)$ret_data);

                        $data_ret['ref_no']                  = strtoupper($trans_inst_value['ref_no']);
                        $data_ret['collection_type']          = 'fee';//$trans_inst_value['collection_type'];
                        $data_ret['payment_class_id']         = $trans_inst_value['class_id'];
                        $data_ret['selected_installment_id']  = $trans_inst_value['install_id'];
                        $data_ret['selected_financial_year']  = $trans_inst_value['academic_year'];
                        $data_ret['payplan_id']               = (int)$trans_inst_value['payplan_id'];
                        $data_ret['head_data']                = $head_data;
                        $data_ret['yearly_setup_id']          = $trans_inst_value['yearly_setup_id'];
                        $data_ret['ref_school_id']            = (int)$trans_inst_value['payplan_sch_id'];
                        $data_ret['ref_institute_id']         = (int)$trans_inst_value['payplan_inst_id'];
                        $data_ret['session_school_id']        = (int)$trans_inst_value['school_id'];
                        $data_ret['user_name']                = $trans_inst_value['user_name'];
                        $data_ret['payment_details']          = $payment_details;
                    }else{
                        $discount = $_POST['concession_spilt'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $discount_type = $_POST['concession_type'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $partial_amt = $_POST['partial_amt_spilt'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $ret_data = array(
                                    'head_id' => $trans_inst_value['payplan_head_id'], 
                                    'head_amount' => $partial_amt-$discount,
                                    'discount' => $discount,
                                    'discount_type' => $discount_type);
                        array_push($head_inst_data,(object)$ret_data);

                        $data_inst_ret['ref_no']                  = strtoupper($trans_inst_value['ref_no']);
                        $data_inst_ret['collection_type']          = 'fee';//$trans_inst_value['collection_type'];
                        $data_inst_ret['payment_class_id']         = $trans_inst_value['class_id'];
                        $data_inst_ret['selected_installment_id']  = $trans_inst_value['install_id'];
                        $data_inst_ret['selected_financial_year']  = $trans_inst_value['academic_year'];
                        $data_inst_ret['payplan_id']               = (int)$trans_inst_value['payplan_id'];
                        $data_inst_ret['head_data']                = $head_inst_data;
                        $data_inst_ret['yearly_setup_id']          = $trans_inst_value['yearly_setup_id'];
                        $data_inst_ret['ref_school_id']            = (int)$trans_inst_value['payplan_sch_id'];
                        $data_inst_ret['ref_institute_id']         = (int)$trans_inst_value['payplan_inst_id'];
                        $data_inst_ret['session_school_id']        = (int)$trans_inst_value['school_id'];
                        $data_inst_ret['user_name']                = $trans_inst_value['user_name'];
                        $data_inst_ret['payment_details']          = $payment_details;
                    }
                }
            }
            array_push($school_array, $data_ret);
            array_push($institute_array,$data_inst_ret);
        }
        $final_trans_details = array_filter(array_merge($school_array,$institute_array));
        $final_trans_details = array_values($final_trans_details);

        foreach ($final_trans_details as $save_key => $payment_data) 
        {
            $ref_no                   = strtoupper($payment_data['ref_no']);
            $collection_type          = $payment_data['collection_type'];
            $payment_class_id         = $payment_data['payment_class_id'];
            $selected_installment_id  = $payment_data['selected_installment_id'];
            $selected_financial_year  = $payment_data['selected_financial_year'];
            $payplan_id               = (int)$payment_data['payplan_id'];
            $head_data                = $payment_data['head_data'];
            $yearly_setup_id          = $payment_data['yearly_setup_id'];
            $ref_school_id            = (int)$payment_data['ref_school_id'];
            $ref_institute_id         = (int)$payment_data['ref_institute_id'];
            $session_school_id        = (int)$payment_data['session_school_id'];
            $user_name                = $payment_data['user_name'];
            $payment_details          = $payment_data['payment_details'];

            $late_payment_data = NULL; // Todo - Late fee  flag & late fee amount (will come from UI)

            $academic_year = $this -> System_model -> get_academic_year();
            $transaction_id = 0;

            // Get actual deposit refunt amount for refund calculation
            $ret_refund_data = $this-> Fee_model->get_refund_data($payment_class_id,$selected_financial_year,$head_data[0]->head_id,$session_school_id);
            $refund_amt = $ret_refund_data[0]->refund_amount;

            // Already Paid Check
            // $paid_status = $this-> Fee_model ->check_paid_unpaid($ref_no, $selected_financial_year, $payplan_id, $selected_installment_id, $session_school_id, $ref_school_id, $ref_institute_id,$collection_type);
            // if($paid_status != NULL) {
            //     echo -3;return;
            // } else {
                $this->load->model('account/Receipt_model');
                // echo $payment_details;return;
                $transaction_id = $this-> Receipt_model ->save_transaction($session_school_id, $academic_year, $selected_financial_year, $user_name, $selected_installment_id, $payplan_id, $head_data, $yearly_setup_id, $ref_school_id, $ref_institute_id,$collection_type, $late_payment_data, $ref_no, $payment_class_id, $payment_details,$refund_amt);

                //Errors
                if ($transaction_id === 0) { // Failure
                    echo 0;return;
                }
                if ($transaction_id === -1) { // Transaction failure
                    echo -1;return;
                }
                if ($transaction_id === -2) { // Amount mismatch
                    echo -2;return;
                }
            // }

            // if($collection_type != 'exam')
            // {
            //     // Student status change
            //     $this->convert_student_status($ref_no, $selected_financial_year, $payplan_id, $selected_installment_id, $collection_type, $session_school_id);
            // }

            // Send data to show receipts
            $receipt_json = json_encode(
                                        array(
                                            'transaction_id'     => $transaction_id,
                                            'collection_type'    => $collection_type,
                                            'ref_no'             => $ref_no,
                                            'payment_class_id'   => $payment_class_id,
                                            'payplan_id'         => $payplan_id,
                                            'installment_id'     => $selected_installment_id,
                                            'financial_year'     => $selected_financial_year,
                                            'academic_year'      => $academic_year,
                                            'ref_school_id'      => $ref_school_id,
                                            'ref_institute_id'   => $ref_institute_id,
                                            'session_school_id'  => $session_school_id,
                                            'receipt_letterhead' => $payment_details->receipt_letterhead,
                                            'is_duplicate'       => FALSE,
                                            'is_mail'            => TRUE,
                                            'is_mobile'          => $is_mobile,
                                            'head_data'          => $head_data
                                        )
                                    );
            echo $this->generate_receipt(0, 0, $receipt_json);
        }
    }

    /**
     * Send & Insert Link Data
     * 
     * @return view
     */
    public function insert_link_data()
    {
        $data['school_id'] = $_SESSION['school_id'];
        $data['academic_year'] = $this -> System_model -> get_academic_year();

        $data['class_id'] = $this->input->post('current_class_id');
        $payment_class_id_list = explode(',', $this->input->post('payment_class_id'));
        $data['refno'] = $this->input->post('selected_refno');
        $data['financial_year'] = $this->input->post('sel_year_financial');
        $data['feeordep'] = $this->input->post('sel_feeordep');
        $data['installment_id'] = explode(',', $this->input->post('sel_installment_id'));
        $data['payplan_id'] = $this->input->post('sel_payplan_id');
        $data['ref_no'] = $data['refno'];
        $data['session_school_id']= $data['school_id'];
        $data['collection_type'] = $data['feeordep'];
        $data['installment_id'] = array_unique(array_values($data['installment_id']));
        
        $success_ref_array = array();
        $defaulter_check_valid = '';
        foreach ($data['installment_id'] as $key => $inst_val) 
        {
            $defaulter_check = $this->check_student_defaulter($data);
            if($defaulter_check != 0)
            {
                $res_fee_check = explode("~",$defaulter_check);
                if($res_fee_check[0] != $inst_val || $res_fee_check[1] != $data['financial_year'])
                {
                    $query_installment  = $this-> Fee_model -> fetch_installment($res_fee_check[0],$data['session_school_id']);
                    if ($query_installment != "" || $query_installment != NULL) 
                    {
                        foreach ($query_installment as $rowupdate_installment)
                        {
                            $installment_name  = $rowupdate_installment['name_of_installment'];
                        }
                    }
                    $defaulter_check_valid = 'Fee is unpaid for '.$installment_name.'  '.$res_fee_check[1];
                    echo $defaulter_check_valid;return;
                }
            }

            $data['installment_id'] = $inst_val;
            $present_record_fees = $this -> Fee_model -> fetch_student_payment_link($data['refno'], $data);
            if ($present_record_fees != NULL) {
                $this -> send_payment_link($data['refno'], $data);
                array_push($success_ref_array, $inst_val);
            } else {
                if ($this -> generate_payment_link($data['refno'], $data, $payment_class_id_list[$key])) {
                    $this -> send_payment_link($data['refno'], $data);
                    array_push($success_ref_array, $inst_val);
                }
            }
        }
        
        if (count($data['installment_id']) == count($success_ref_array)) {
            echo TRUE;return;
        }else{
            echo explode(',', $success_ref_array);return;
        }
    }

    /**
     * GUID Generator
     * return a unique 48-char GUID code for student
     * [REFNO][payplan][installment][year][school_id][fee-dep]
     * @return string
     */
    private function generate_unique_refno_key($ref_no, $payplan, $installment, $financial_year, $school_id, $feeordep) {
        $unix_timestamp = time(); // unix - time in millisec

        $string = $ref_no.$payplan.$installment.$financial_year.$school_id.$unix_timestamp.$feeordep.'P';
        $length = 48 - strlen($string);

        $bytes = random_bytes($length/2); // as hex conversion doubles the char count
        return strtoupper($string.bin2hex($bytes));
    }

    /**
     * Short Link
     * 
     * 
     * @return string
     */
    private function generate_short_payment_link($link){
        //return 'mgr-bitfly';
        // Todo - Use Bitfly to generate short link
        $ch = curl_init();  
        $timeout = 5;  
        curl_setopt($ch,CURLOPT_URL,'http://tinyurl.com/api-create.php?url='.$link);  
        curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);  
        curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,$timeout);  
        $data = curl_exec($ch);  
        curl_close($ch);  
        return $data;  
    }

    /**
     * Long Link
     * 
     * 
     * @return string
     */
    private function generate_payment_link($refno, $ref_fees_data, $payment_class_id){
        
        $unique_refno_key = $this->generate_unique_refno_key($refno, $ref_fees_data['payplan_id'], $ref_fees_data['installment_id'], $ref_fees_data['financial_year'], $ref_fees_data['school_id'], $ref_fees_data['feeordep']);

        // Long Link
        $long_link = $ref_fees_data['school_id'] .'/'. $unique_refno_key;   // Only pass link info (site,controller,method info passed later)

        return $this -> Fee_model -> save_payment_link_details($refno, $ref_fees_data, $unique_refno_key, $long_link, $payment_class_id);
    }

    /**
     * Fetch Long Payment Link
     * 
     * @return string
     */
    private function fetch_payment_link($refno, $data)
    {
        $get_payment_link_data = $this -> Fee_model -> fetch_student_payment_link($refno, $data);
        if($get_payment_link_data != NULL){
            if($get_payment_link_data[0]->link != NULL){
                $long_link = APP_PAY_URL."/".RZP_CONTR_NAME."/".RZP_CONTR_METHOD."/".$get_payment_link_data[0]->link;
                $short_link = $this->generate_short_payment_link($long_link); //$long_link;
                return  array (
                            'long_link'  => $long_link,
                            'short_link' => $short_link
                        );

            } else {
                return NULL;
            }
        } else {
            return NULL;
        }
    }

    /**
     * Send E-Mail and SMS
     * 
     * @return view
     */
    private function send_payment_link($refno, $data)
    {
        $query_installment = $this-> Fee_model ->fetch_installment($data['installment_id'],$data['school_id']);
        if ($query_installment != "" || $query_installment != NULL) 
        {
            foreach ($query_installment as $rowupdate_installment)
            {
                $installment_name  = $rowupdate_installment['name_of_installment'];
            }
        }

        $installment_count = $this-> Fee_model ->fetch_no_of_installment($data['payplan_id'],$data['school_id']);

        $pay_link_array = $this->fetch_payment_link($refno, $data);
        if($pay_link_array == NULL){
            return false;
        }

        $selected_financial_year = $data['financial_year'];
        $data['current_academic_year'] = $this -> System_model -> get_academic_year();
        $data['next_academic_year'] = $this -> System_model -> get_next_academic_year();
        $data['previous_academic_year'] = $this -> System_model -> get_previous_academic_year();

        //Get Due date
        $due_date_array = NULL;
        $due_date_array = date('dS F Y', strtotime($this -> Fee_model -> fetch_due_date($data)));
        // Get all links
        $long_link = $pay_link_array['long_link'];
        $short_link = $pay_link_array['short_link']; // Todo - Change later

        $ref_stud_info = $this -> Student_model -> get_student_parent_data($data['school_id'], $refno);

        // Parent Emails
        $email_parent_array = array();
        if (isset($ref_stud_info[0]->father_email_id) && $ref_stud_info[0]->father_email_id != null) {
            $father_email = array(
                        'email' => trim($ref_stud_info[0]->father_email_id),
                        'name'  => $ref_stud_info[0]->father_f_name,
                        'type'  => 'to',
                    );
            array_push($email_parent_array, $father_email);
        }
        if (isset($ref_stud_info[0]->mother_email_id) && $ref_stud_info[0]->mother_email_id != null){
            $mother_email = array(
                        'email' => trim($ref_stud_info[0]->mother_email_id),
                        'name'  => $ref_stud_info[0]->mother_f_name,
                        'type'  => 'to',
                    );
            array_push($email_parent_array, $mother_email);
        }

        // Parent Numbers
        // $parent_mobile_number = array();
        // if (isset($ref_stud_info[0]->father_mobile_no) && $ref_stud_info[0]->father_mobile_no != null) {
        //     array_push($parent_mobile_number, $ref_stud_info[0]->father_mobile_no);
        // }

        // if (isset($ref_stud_info[0]->mother_mobile_no) && $ref_stud_info[0]->mother_mobile_no != null) {
        //     array_push($parent_mobile_number, $ref_stud_info[0]->mother_mobile_no);
        // }
        if($email_parent_array != NULL){
            // Subject & Content & Attachments
            $subject_content = 'Walnut School - Payment Link';
            $attachments = array();
            // $regards = "Regards,<br>The Walnut School Administration Team";
            $regards = "";

            $class_id = $ref_stud_info[0]->admission_to;
            $status   = $ref_stud_info[0]->status;

            if ($status == 6 || $status == 7) 
            {
                $status = '6,7';
            }

            $preview_content_test = $this-> Generic_specific_model -> get_specific_templates($selected_financial_year,$class_id,$status,$data['school_id']);
            if ($preview_content_test == NULL || $preview_content_test == '') 
            {
                echo "Not Present";return;
            }else{
                $preview_content =  $preview_content_test[0]['text'];
                if (strpos($preview_content, '$$refno$$') !== false) 
                {
                    $refno = strtoupper($ref_stud_info[0]->refno);
                    $preview_content = str_replace('$$refno$$', $refno, $preview_content);
                }

                if (strpos($preview_content, '$$first_name$$') !== false) 
                {
                    $stude_f_name = strtoupper($ref_stud_info[0]->first_name);
                    $preview_content = str_replace('$$first_name$$', $stude_f_name, $preview_content);
                }

                if (strpos($preview_content, '$$last_name$$') !== false) 
                {
                    $stude_l_name = strtoupper($ref_stud_info[0]->last_name);
                    $preview_content = str_replace('$$last_name$$', $stude_l_name, $preview_content);
                }

                $main_link = "<a href=".$long_link.">Link</a>";
                if (strpos($preview_content, '$$link$$') !== false)
                {
                    $preview_content = str_replace('$$link$$', $main_link, $preview_content);
                }

                if (strpos($preview_content, '$$templink$$') !== false)
                {
                    $preview_content = str_replace('$$templink$$', $long_link, $preview_content);
                }

                if (strpos($preview_content, '$$inst_count$$') !== false)
                {
                    $preview_content = str_replace('$$inst_count$$', $installment_count, $preview_content);
                }
                
                // Sender Mails
                $email_sender_info = array(
                                            'module_code' => 'FEE_DEPO', 
                                            'school_id' => $_SESSION['school_id'], 
                                            'ref_sch_id' => '0', 
                                            'ref_inst_id' => '0'
                                        );
                $email_sender  = Send_mail_helper::get_sender_data($email_sender_info);
                $email_sender_array = array(
                                            'sender_name'   => isset($email_sender['sender_name'])?$email_sender['sender_name']:'',
                                            'from_email'    => isset($email_sender['from_email'])?$email_sender['from_email']:'',
                                            'school_id'     => $_SESSION['school_id'],
                                            'bcc_email'     => TRUE
                                        );

                // Send E-Mail
                Send_mail_helper::send_mail($email_parent_array, $preview_content, $subject_content, $attachments, $email_sender_array);
            }
        }

        // if($parent_mobile_number != NULL) {
        //     $mobile_number = implode(',',$parent_mobile_number);
        //     if ($mobile_number != NULL && $mobile_number != "") {
        //         $preview_msg_content = 'Pay Walnut Fees using the link : '.$short_link.'##1007162004383038228##**WLTSCL**';
        //         Send_sms_helper::send_sms($mobile_number, $preview_msg_content, array());
        //     }
        // }
    }

    /**
     * UI for pay planwise
     * 
     * @return void
     */
    public function view_payplan()
    {
        $data['page_data']['page_name'] = 'Student Payplan';
        $data['page_data']['page_icon'] = 'fa fa-exchange';
        $data['page_data']['page_title'] = 'Student Payplan';
        $data['page_data']['page_date'] = date("d M Y");
        $year_array     = array(
                            'previous_year' => $this -> System_model -> get_previous_financial_year(),
                            'financial_year' => $this -> System_model -> get_financial_year(),
                            'next_year' => $this -> System_model -> get_next_financial_year()
                        );
        // $data['financial_year']      = $financial_year;  // Here default year is selected
        $data['main_content'] = array('account/setup/student_pay_plan');
        $this -> load -> view('bootstrap_templates/main_template', $data);
    }

    /**
     * insert
     * 
     * @return void
     */
    function insert_student_payplan(){
        // All Financial years
        $financial_year = $this -> System_model -> get_financial_year();
        $data['all_financial_years'] = array();
        $year_array = array(
                            'previous_year' => $this -> System_model -> get_previous_financial_year(),
                            'financial_year' => $financial_year,
                            'next_year' => $this -> System_model -> get_next_financial_year()
                        );
        // array_push($data['all_financial_years'], $year_array['previous_year']);
        array_push($data['all_financial_years'], $year_array['financial_year']);
        // array_push($data['all_financial_years'], $year_array['next_year']);
        // $data['all_financial_years'] = $year_array;
        $data['financial_year'] = $financial_year;  // Here default year is selected
        $data['academic_year'] = $this -> System_model -> get_academic_year();

        $school_id                       = $_SESSION['school_id'];
        $ref_data_array = array();
        $stud_info_data          = $this-> Student_model -> fetch_statuswise_student_data($school_id);

        foreach ($stud_info_data as $ref_key => $ref_value) 
        {
            foreach ($data['all_financial_years'] as $year_key => $year_value) 
            {
                $refno = $ref_value->refno;
                $continuity_array = $this-> Fee_model ->get_computed_continuity_class($refno, $year_value, $data['academic_year'], NULL, $school_id);
                $class_id = $continuity_array['computed_class'];

                $data['payplan'] = $this-> Fee_model ->get_refno_payplan_details($refno, $class_id, $year_value,'fee', $school_id);
                if($data['payplan'] == 0)
                {
                    echo "Fee Setup not done for" .$year_value;
                }

                $installment_id_array = array();
                $ret_payplan_installment_setup =  $this-> Fee_model ->refno_payplan_installment_details($refno, $year_value, $feeordep = 'fee', $class_id,$school_id);
                if ($ret_payplan_installment_setup != NULL) 
                {
                    foreach ($ret_payplan_installment_setup as $key => $data_value)
                    {
                        $installment_id = array(
                                                'install_id'   => $data_value->install_id,
                                                // 'name_of_installment'    => $data_value->name_of_installment,
                                                'due_date'     => $data_value->due_date,
                                            );
                        array_push($installment_id_array, $installment_id);
                    }
                }else{
                    echo "Installment Setup not done for" .$year_value;
                }
                $data_array = array(
                                    'refno'   => $refno,
                                    'class_id'     => $class_id,
                                    'financial_year' => $year_value,
                                    'payplan_id' => $data['payplan'],
                                    'installment_id_array' => $installment_id_array,
                                    'school_id'=>  $school_id
                                );
                array_push($ref_data_array,$data_array);
            }
        }
            
        $count_info = 0;
        foreach ($ref_data_array as $inst_key => $inst_value) 
        {
           foreach ($inst_value['installment_id_array'] as $key => $value) 
           {
                $data = array(
                    "refno" => $inst_value['refno'],
                    "class_id" => $inst_value['class_id'],
                    "payplan_id" => $inst_value['payplan_id'],
                    "financial_year" => $inst_value['financial_year'],
                    "installment_id"=> $value['install_id'],
                    "due_date"=> $value['due_date'],
                    "school_id" => $inst_value['school_id'],
                    "academic_year" => $data['academic_year']
                   );
                $insert_stud_payplan =  $this -> Fee_model -> insert_student_payment_paln( $data);
                if($insert_stud_payplan)
                {
                    $count_info--;
                }
           }
            $count_info++;
        }
        if($count_info == count($ref_data_array))
        {
            return TRUE;
        }
    }

    /**
     * UI
     * 
     * @return void
     */
    function student_payplan(){
        $data['page_data']['page_name'] = 'Student Payplan';
        $data['page_data']['page_icon'] = 'fa fa-rupee';
        $data['page_data']['page_title'] =  'Student Payplan';
        $data['page_data']['page_date'] = date("d M Y");
        $data['page_data']['page_description'] = 'This module manages all incoming & outgoing credits & debits on the Student Account.';
        $data['page_data']['breadcrumb'] = '<li>Administrator</li><li class="active">Manage Student Account</li>';

        // All Financial years
        $financial_year = $this -> System_model -> get_financial_year();
        $year_array = array(
                            'previous_year' => $this -> System_model -> get_previous_financial_year(),
                            'financial_year' => $financial_year,
                            'next_year' => $this -> System_model -> get_next_financial_year()
                        );
        $data['all_financial_years'] = $year_array;
        $data['financial_year'] = $financial_year;  // Here default year is selected
        $data['academic_year'] = $this -> System_model -> get_academic_year();
        $data['ref_no'] = strtoupper($this->input->post('ref_no'));
        $sel_financial_year = $this->input->post('financial_year');

        $school_id                       = $_SESSION['school_id'];
        $ref_data_array = array();
        $query_student_data = $this-> Student_model -> get_refno_data($data['ref_no']);
        if ($query_student_data != "" || $query_student_data != NULL) 
        {
            foreach ($query_student_data as $ref_value)
            {
                $refno = $ref_value->refno;
                $student_name = $ref_value->first_name." ".$ref_value->last_name;
                $continuity_array = $this-> Fee_model ->get_computed_continuity_class($refno, $sel_financial_year, $data['academic_year'], NULL, $school_id);
                $class_id = $continuity_array['computed_class'];

                $ret_payplan_setup =  $this-> Fee_model ->fetch_student_overall_payplan($refno, $sel_financial_year,$class_id,$school_id);
                if ($ret_payplan_setup != NULL) 
                {
                    foreach ($ret_payplan_setup as $key => $data_value)
                    {
                        $data['class_id'] = $data_value['payment_class_id'];
                        $class_data = $this-> Class_division_model ->get_class_name($data);
                        if($class_data != NULL){
                            $class_name = $class_data->row()->class_name;
                        }

                        $data['payplan_details'] = $this-> Fee_model ->check_pay_plan($data_value['school_id'], $data_value['payplan_id']);
                        if ($data['payplan_details'] != NULL) 
                        {
                            $data['payplan_name'] = $data['payplan_details'][0]['payment_plan'];
                        }

                        $query_installment = $this-> Fee_model ->fetch_installment($data_value['installment_id'],$data_value['school_id']);
                        if ($query_installment != "" || $query_installment != NULL) 
                        {
                            foreach ($query_installment as $rowupdate_installment)
                            {
                                $installment_name  = $rowupdate_installment['name_of_installment'];
                            }
                        }

                        $data_array = array(
                                                'refno'   => $data_value['refno'],
                                                'student_name'    => $student_name,
                                                'class_name'     => $class_name,
                                                'payplan_name' => $data['payplan_name'],
                                                'installment_name' => $installment_name,
                                                'due_date' => $data_value['due_date']
                                            );
                        array_push($ref_data_array,  $data_array);
                    }
                }
            }
        }
        $data['student_payplan_data'] = $ref_data_array;
        $this-> load -> view('account/setup/student_payplan_details', $data);
    }

    public function generate_student_otp()
    {
        $generated_otp = NULL;
        $this->load->library('user_agent');
        if ($this->agent->is_mobile()){
            $web_flag = 0;
        } else {
            $web_flag = 1;
        }
        
        $student_info = array(
            "refNo"      => $this->input->post('ref_no'),
            "school_id"  => $this->input->post('school_id'),
            "deviceId"   => $_SERVER['REMOTE_ADDR'],
            "deviceType" => $_SERVER['HTTP_USER_AGENT'],
            "update_data" => NULL,
        );

        $generated_otp = Generate_otp_helper::generate_otp($student_info, $web_flag);
        if($generated_otp != NULL) 
        {
            $ret_refno_check = $this-> Student_model -> get_refno_data($student_info['refNo']); // valid refno

            if ($ret_refno_check != NULL) 
            {
                $ref_no = $student_info['refNo'];
                $stud_parent_data = $this -> Student_model -> get_student_parent_data($student_info['school_id'], $ref_no);
                if ($stud_parent_data != NULL) 
                {
                    // Send SMS
                    $mail_or_sms_no  = $stud_parent_data[0]->student_sms_no;
                    $preview_content = "OTP is ".$generated_otp." for your interaction with Walnut School. Please do not share this OTP with anyone.##1007164154644010534##**WLTSCL**";

                    $sms_sender_array = array();
                    if ($mail_or_sms_no != NULL) {
                        $sms_status = Send_sms_helper::send_sms($mail_or_sms_no, $preview_content, $sms_sender_array);
                    } else {
                        $sms_status = NULL;
                    }
                    // Send EMAIL
                    $all_email_id = array();
                    if (isset($stud_parent_data[0]->father_email_id) && $stud_parent_data[0]->father_email_id!= '') {
                        $email_idf = array('email' => trim($stud_parent_data[0]->father_email_id),
                            'name'                     => $stud_parent_data[0]->father_f_name,
                            'type'                     => 'to',
                        );
                        array_push($all_email_id, $email_idf);
                    }
                    if (isset($stud_parent_data[0]->mother_email_id) && $stud_parent_data[0]->mother_email_id!= '') {
                        $email_idm = array('email' => trim($stud_parent_data[0]->mother_email_id),
                            'name'                     => $stud_parent_data[0]->mother_f_name,
                            'type'                     => 'to',
                        );
                        array_push($all_email_id, $email_idm);
                    }

                    $preview_content ="Your OTP is ".$generated_otp." for your interaction with Walnut School. Please do not share this OTP with anyone.";
                    $subject         = "OTP for Walnut School";
                    $attachments     = array();

                    $email_sender_array = array();

                    if ($all_email_id != NULL && count($all_email_id) > 0) {
                        $email_status = Send_mail_helper::send_mail($all_email_id, $preview_content, $subject, $attachments, $email_sender_array);
                    } else {
                        $email_status = NULL;
                    }

                    if ($sms_status != FALSE && $email_status != FALSE) {
                        echo '0'.'~'.'OTP Sent to your registered Email ID/SMS number!';
                        return;
                    } else {
                       echo '1'.'~'.'OTP Generation Failed!';
                       return;
                    }
                } else {
                    echo '2'.'~'.'OTP Generation Failed!';
                    return;
                }
            } else {
                echo '3'.'~'.'Reference number is invalid';
                return;
            }
        } else {
            echo '4'.'~'.'Something went wrong! Try again.';
            return;
        }
    }

    public function validate_parent_otp()
    {
        $valid_otp = Generate_otp_helper::valid_otp($_POST['ref_no'], $_POST['school_id'],$_POST['parent_otp']);
        if ($valid_otp === FALSE)
        {
            echo "Entered OTP is invalid.";
            return;
        }else{
            echo "1";return;
        }
    }

    // Send Undertaking form accepted copy to Parents
    public function send_undertaking_form($refno, $school_id,$stud_year,$collection_type)
    {
        $data['stud_parent_data'] = $this-> Student_model -> get_student_parent_data($school_id,$refno);
        if ($data['stud_parent_data'] != NULL) 
        {
            // Send EMAIL
            $all_email_id = array();
            if (isset($data['stud_parent_data'][0]->father_email_id) && $data['stud_parent_data'][0]->father_email_id != null) {
                $father_email = array(
                            'email' => trim($data['stud_parent_data'][0]->father_email_id),
                            'name'  => $data['stud_parent_data'][0]->father_f_name,
                            'type'  => 'to',
                        );
                array_push($all_email_id, $father_email);
            }
            if (isset($data['stud_parent_data'][0]->mother_email_id) && $data['stud_parent_data'][0]->mother_email_id != null){
                $mother_email = array(
                            'email' => trim($data['stud_parent_data'][0]->mother_email_id),
                            'name'  => $data['stud_parent_data'][0]->mother_f_name,
                            'type'  => 'to',
                        );
                array_push($all_email_id, $mother_email);
            }

            $email_sender_array = array(
                    'sender_name'  => '',
                    'from_email'   => '',
                    'school_id'    => $school_id,
                    'bcc_email'    => TRUE
                );

            $data['school_id']  = $school_id;
            $data['student_continuity_data'] = $this-> Continuity_form_model -> fetch_undertaking_link_data($refno,$data,$stud_year);
            $temp_class_id      = $data['stud_parent_data'][0]->admission_to;
            $data['status']     = $data['stud_parent_data'][0]->status;
            if ($data['status'] == 6 || $data['status'] == 7) 
            {
                $data['status'] = '6,7';
            }

            $data['academic_year'] = $stud_year;
            $next_financial_year = $this-> System_model ->get_next_financial_year();
            if ($data['academic_year'] == $next_financial_year) 
            {
                if ($data['status'] == 1) 
                {
                    $data['class_id'] = $temp_class_id;
                }else
                {
                    if ($temp_class_id == 19) 
                    {
                        $data['class_id'] = $temp_class_id + 4;
                    }else{
                        $data['class_id'] = $temp_class_id + 1;
                    }
                } 
            }else{
                $data['class_id'] = $temp_class_id;
            }
            $present_file_data     = $this -> Continuity_form_model-> fetch_undertaking_file_data($data);
            $file_id               = $present_file_data[0]->file_id; 
            $data['target_path']   = "https://drive.google.com/uc?id=".$file_id."&export=download";
            $data['collection_type'] = $collection_type;

            $preview_content = $this-> load -> view('student/continuity_form/undertaking_email_content', $data,TRUE);
            $subject         = "Thanks for accepting rules & regulations";
            $attachments     = array();

            if ($all_email_id != NULL && count($all_email_id) > 0) 
            {
                $email_status = Send_mail_helper::send_mail($all_email_id, $preview_content, $subject, $attachments, $email_sender_array);
            } 
        }
    }

     /*
     *@return boolean
     *Save welcome email content to student app
     */
    public function save_in_student_app($refno,$class_id,$original_preview_content,$school_id)
    {
        $db_name = $this-> School_model ->fetch_school_db($school_id);

        $data['ref_no']           = $refno;
        $data['class_id']         = $class_id;
        $data['division_id']      = NULL;
        $data['subject_id']       = 'Any Subject';
        $data['unit_id']          = 'Any Unit';
        $data['type']             = 'Notification';
        $data['title']            = 'Welcome to the Walnut Family!';
        $data['desc_area']        = 'Tap to see details';
        $data['issued_by']        = 'Walnut School';
        $data['priority']         = 'Medium';
        $data['starred']          = 'Yes';
        $data['detail_text_area'] = str_replace('"',"'",$original_preview_content);
        $data['detail_link']      = '';
        $data['school_db']        = $db_name;
        $data['created_date']     = date("Y-m-d H:i:s");
        $data['modified_date']    = date("Y-m-d H:i:s");
        $data['msg_tags']         = '';
        $returned_app_data = $this -> Student_app_model -> insert_data($data);
        if ($returned_app_data) 
        {
            return TRUE;
        } else {
            return FALSE;
        }
    }

    /**
     * Due date Change
     * 
     * @return view
     */
    public function bulk_date_change()
    {
        $data['page_data']['page_name'] = 'Bulk Due Date Change';
        $data['page_data']['page_icon'] = 'fa fa-envelope';
        $data['page_data']['page_title'] = 'Bulk Due Date Change';
        $data['page_data']['page_date'] = date("d M Y");
        $data['page_data']['page_description'] = 'student profile chnages';
        $data['page_data']['breadcrumb'] = '<li>Administrator</li>  <li class="active">Bulk Due Date Change</li>';
        $data['csv_column_array'] = array();
        $data['main_content'] = array('account/student_account/view_date_change.php');
        $this -> load -> view('bootstrap_templates/main_template', $data);
    }

    /**
     * Import CSV
     * Save Due date
     * @return msg
     */
    public function import_bulk_date_csv()
    {
        $data['page_data']['page_name'] = 'Bulk Due Date Change';
        $data['page_data']['page_icon'] = 'fa fa-envelope';
        $data['page_data']['page_title'] = 'Bulk Due Date Change';
        $data['page_data']['page_date'] = date("d M Y");
        $data['page_data']['page_description'] = 'Student info upload by CSV.';
        $data['page_data']['breadcrumb'] = '<li>Administrator</li>  <li class="active">Bulk Due Date Change</li>';
        $school_id  = $_SESSION['school_id'];
        $uploaddir  = $_SESSION['url'] . '/application/uploads/csv/';
        $file_name  = basename($_FILES["bulk_date_creation_csv"]["name"]);
        $uploadfile = $uploaddir . $file_name;
        $ext_header = pathinfo($file_name, PATHINFO_EXTENSION);
        ini_set("max_execution_time", "10000");       

        if ($ext_header != "csv") {
            $this->session->set_userdata('msg', "Error! Only CSV files can be uploaded.");
            redirect("student_account/bulk_date_change");
        } else 
        {
            if (move_uploaded_file($_FILES['bulk_date_creation_csv']['tmp_name'], $uploadfile)) 
            {
                $csvfile = $uploadfile;
                $file    = fopen($csvfile, "r") or die("Problem in opening file");
                $size    = filesize($csvfile);
                if (!$size) {
                    $this->session->set_userdata('msg', "File is empty! Please check.");
                    redirect("bulk_upload/bulk_cancel");
                }
                $csvcontent = fread($file, $size);
                fclose($file);
                $fieldseparator = ",";
                $lineseparator  = "\n";
                $lines          = 0;
                $formdata       = array();
                $csv_column_array = array();
                $csv_data_array = array();
                $row            = 0;
                foreach (explode($lineseparator, $csvcontent) as $line) 
                {
                    $line = trim($line, " \t");
                    $line = str_replace("\r", "", $line);
                    $formdata = str_getcsv($line, $fieldseparator, "\"");

                    // Fetch CSV Columns
                    if ($row == 0) {
                        $m = 0; // Only if row is 0
                        for ($i = 0; $i < count($formdata); $i++){
                            $temp = array();
                            array_push($csv_column_array, $formdata[$i]);
                            array_push($csv_data_array, $temp);
                        }
                        $row++;
                        continue;
                    }
                    // Fetch CSV Data
                    if (count($formdata) > 1) {
                        for ($i = 0; $i < count($formdata); $i++ ) { 
                            $csv_data_array[$i][$m] = $formdata[$i];
                        }
                    }
                    $m++;
                    $row++;
                }
                $struct_data = array();
                for ($j=0; $j < count($csv_data_array[0]); $j++) 
                { 
                    $refno = '';
                    $installment = '';
                    $due_date = '';
                    $academic_year ='';
                    //Refno
                    if($csv_data_array[0][$j] != NULL)
                    {
                        $refno = $csv_data_array[0][$j];
                    }
                    //insatllment
                    if($csv_data_array[1][$j] != NULL)
                    {
                        $installment = $csv_data_array[1][$j];
                    }
                    //due date
                    if($csv_data_array[2][$j] != NULL)
                    {
                        $due_date = $csv_data_array[2][$j];
                    }
                    //academic year
                    if($csv_data_array[3][$j] != NULL)
                    {
                        $academic_year = $csv_data_array[3][$j];
                    }

                    if ($refno == '' || $refno == NULL)
                    {
                        $this->session->set_userdata('msg', "Refno is empty! Please check.");
                        redirect("student_account/bulk_date_change");
                    }
                    if ($installment == '' || $installment == NULL)
                    {
                        $this->session->set_userdata('msg', "Insatllment Name is empty! Please check.");
                        redirect("student_account/bulk_date_change");    
                    }
                    if ($due_date == '' || $due_date == NULL)
                    {
                        $this->session->set_userdata('msg', "Due Date is empty! Please check.");
                        redirect("student_account/bulk_date_change");    
                    }
                    if ($academic_year == '' || $academic_year == NULL)
                    {
                        $this->session->set_userdata('msg', "Academic year is empty! Please check.");
                        redirect("student_account/bulk_date_change");    
                    }
                   
                    array_push($struct_data,
                        array(
                            'refno'   => $refno,
                            'installment'  => $installment,
                            'due_date'   => $due_date,
                            'academic_year'  => $academic_year,
                        )
                    ); 
                }
                if(count($struct_data) > 0)
                {
                    $refno_array = array();
                    for ($i=0; $i < count($struct_data) ; $i++) 
                    { 
                        $data_due['current_academic_year'] = $this -> System_model -> get_academic_year();
                        $data_due['next_academic_year'] = $this -> System_model -> get_next_academic_year();
                        $data_due['previous_academic_year'] = $this -> System_model -> get_previous_academic_year();
                        // Student class according to Financial Year selected
                        $continuity_array = $this-> Fee_model ->get_computed_continuity_class($struct_data[$i]['refno'], $struct_data[$i]['academic_year'], $data_due['current_academic_year'], NULL, $school_id);
                        $computed_class_id = $continuity_array['computed_class'];

                        // Payplan according to selected fin year & computed class
                        $data['payplan'] = $this-> Fee_model ->get_refno_payplan_details($struct_data[$i]['refno'], $computed_class_id, $struct_data[$i]['academic_year'],'fee', $school_id);
                        if($data['payplan'] == 0)
                        {
                            $this->session->set_userdata('msg', "Fee Setup Not Done For Selected Year!");
                        }

                        $data['profile_fee_data'] = $this-> Fee_model ->fetch_fees_profile_details_all($struct_data[$i]['refno'], $school_id,$computed_class_id,$struct_data[$i]['academic_year'],$data['payplan']);
                        if($data['profile_fee_data'] != NULL)
                        {
                            foreach ($data['profile_fee_data'] as $profile_key => $profile_value) 
                            {
                                $data['school_id'] = $profile_value['school_id'];
                                $data['refno'] = $struct_data[$i]['refno'];
                                $data['payplan'] = $profile_value['payplan_id'];
                                $data['class_id'] = $profile_value['class_id'];
                                $data['selected_academic_year'] = $profile_value['financial_year'];
                                $data['selected_school_id'] = $profile_value['fee_sch_id'];
                                $data['selected_inst_id'] = $profile_value['institude_id'];
                                $new_payment_info = array();
                                $profile_data['financial_year'] = $profile_value['financial_year'];
                                $payment_info = json_decode($profile_value['payment_info']);
                                foreach ($payment_info as $pay_key => $pay_value) 
                                {
                                    if($pay_value->name_of_installment == $struct_data[$i]['installment'])
                                    {
                                        if($profile_data['financial_year'] == $data_due['current_academic_year'])
                                        {
                                            $pay_value->due_date = date('Y-m-d H:i:s', strtotime($struct_data[$i]['due_date']));
                                        }else if($profile_data['financial_year'] == $data_due['next_academic_year']){
                                            $pay_value->next_year_due_date = date('Y-m-d H:i:s', strtotime($struct_data[$i]['due_date']));
                                        }else if($profile_data['financial_year'] == $data_due['previous_academic_year']){
                                            $pay_value->previous_year_due_date = date('Y-m-d H:i:s', strtotime($struct_data[$i]['due_date']));
                                        }
                                    }
                                    array_push($new_payment_info,$pay_value);
                                }
                                $data['transfer_info'] = json_encode($new_payment_info);
                                //update fee profile
                                $profile_query = $this-> Fee_model -> update_student_fee_profile($data);
                            }
                        }else{
                            array_push($refno_array,$struct_data[$i]['refno']);
                        }
                    }
                    if(count($refno_array) > 0)
                    {
                        $comma_refno = implode(',', $refno_array);
                        $this->session->set_userdata('msg', "Profile not created for ".$comma_refno);
                        redirect("student_account/bulk_date_change");
                    }
                    $this->session->set_userdata('msg', "File imported successfuly.");
                    redirect("student_account/bulk_date_change");
                }else{
                    $this->session->set_userdata('msg', "Error! Imported data not saved.");
                    redirect("student_account/bulk_date_change");
                }
            }else{
                $this->session->set_userdata('msg', "Cannot upload file!.");
                redirect("student_account/bulk_date_change");    
            }  
        }
        $data['main_content'] = array('student/bulk_upload/view_bulk_cancel.php');
        $this -> load -> view('bootstrap_templates/main_template', $data);
    }

     /*
     * Update student profile due date after rollover
     *@return boolean
     */
    public function update_profile_due_date()
    {
        $school_id = $_SESSION['school_id'];
        $ref_no_list = $this-> Student_model ->get_refno_list($school_id);
        $financial_year = $this -> System_model -> get_financial_year();

        for ($i=0; $i < count($ref_no_list) ; $i++) 
        { 
            $data_due['current_academic_year'] = $this -> System_model -> get_academic_year();
            $data_due['next_academic_year'] = $this -> System_model -> get_next_academic_year();
            $data_due['previous_academic_year'] = $this -> System_model -> get_previous_academic_year();
            // Student class according to Financial Year selected
            $continuity_array = $this-> Fee_model ->get_computed_continuity_class($ref_no_list[$i]['refno'], $financial_year, $data_due['current_academic_year'], NULL, $school_id);
            $computed_class_id = $continuity_array['computed_class'];

            // Payplan according to selected fin year & computed class
            $data['payplan'] = $this-> Fee_model ->get_refno_payplan_details($ref_no_list[$i]['refno'], $computed_class_id, $financial_year,'fee', $school_id);
            if($data['payplan'] == 0)
            {
                echo "Fee Setup Not Done For Selected Year!";return;
            }

            $data['profile_fee_data'] = $this-> Fee_model ->fetch_fees_profile_details_all($ref_no_list[$i]['refno'], $school_id,$computed_class_id,$financial_year,$data['payplan']);
            if($data['profile_fee_data'] != NULL)
            {
                foreach ($data['profile_fee_data'] as $profile_key => $profile_value) 
                {
                    $data['school_id'] = $profile_value['school_id'];
                    $data['refno'] = $ref_no_list[$i]['refno'];
                    $data['payplan'] = $profile_value['payplan_id'];
                    $data['class_id'] = $profile_value['class_id'];
                    $data['selected_academic_year'] = $profile_value['financial_year'];
                    $data['selected_school_id'] = $profile_value['fee_sch_id'];
                    $data['selected_inst_id'] = $profile_value['institude_id'];
                    $new_payment_info = array();
                    $profile_data['financial_year'] = $profile_value['financial_year'];
                    $payment_info = json_decode($profile_value['payment_info']);
                    foreach ($payment_info as $pay_key => $pay_value) 
                    {
                        $query_installment  = $this-> Fee_model -> fetch_installment($pay_value->install_id,$school_id);
                        if ($query_installment != "" || $query_installment != NULL) 
                        {
                            foreach ($query_installment as $rowupdate_installment)
                            {
                                $data['insatllment_name'] = $rowupdate_installment['name_of_installment'];
                                $data['number_instll'] = $rowupdate_installment['installment_number'];
                                $data['due_date'] = $rowupdate_installment['due_date'];
                                $data['previous_year_due_date'] = $rowupdate_installment['previous_year_due_date'];
                                $data['next_year_due_date'] = $rowupdate_installment['next_year_due_date'];
                                $data['no_of_def_days'] = $rowupdate_installment['no_of_def_days'];
                            }
                        }
                        $pay_value->due_date = date('Y-m-d H:i:s', strtotime($data['due_date']));
                        $pay_value->next_year_due_date = date('Y-m-d H:i:s', strtotime($data['next_year_due_date']));
                        $pay_value->previous_year_due_date = date('Y-m-d H:i:s', strtotime($data['previous_year_due_date']));
                        array_push($new_payment_info,$pay_value);
                    }
                    $data['transfer_info'] = json_encode($new_payment_info);
                    //update fee profile
                    $profile_query = $this-> Fee_model -> update_student_fee_profile($data);
                }
            }
        }
    }
}
?>
```
{{< /details >}}



## Code block 1
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `Defaulter_check_controller` class is responsible for checking if a user is a defaulter or not. It contains various methods to perform this check.

### Refactoring
1. Extract common code into reusable functions.
2. Improve error handling and reporting.
3. Use dependency injection to improve testability.
4. Consider using a database or external service for storing and retrieving defaulter information.

{{< details "source code " >}}
```php
require_once(APPPATH.'controllers/account/Defaulter_check_controller.php');
```
{{< /details >}}

## __construct
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This is the constructor function of a class. It initializes various models and libraries that are required for the class.

{{< details "source code " >}}
```php
public function __construct()
	{
        parent::__construct();
		@session_start();
		Check_Access_helper::is_logged_in();
    	date_default_timezone_set('Asia/Kolkata');
		$this->load->model('common/System_model');
    	$this->load->model('common/School_model');
		$this->load->model('common/Student_model');
        $this->load->model('common/Class_division_model');
		$this->load->model('account/Fee_model');
        $this->load->model('system/rollover/Academic_rollover_model');
        $this->load->model('student/Continuity_form_model');
        $this->load->model('student/Generic_specific_model');
        $this->load->library('Google_login');
        $this->load->library('Google_classroom');
        $this->load->model('school_cmap/Classroom_model');
        $this->load->model('mobile/Student_app_model');
        $this->load->model('student/Student_welcome_email_model');
	}
```
{{< /details >}}

## index
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is the index function for the Student Account module. It sets up the data needed for the view and loads the main template.

### Refactoring
1. Extract the code for setting up the page_data array into a separate function for better code organization.
2. Move the code for getting financial years and academic year into a separate function for reusability.
3. Use a constant or configuration file for the page_name, page_icon, and page_title values to make them easier to change.
4. Consider using a template engine to generate the HTML instead of concatenating strings.

{{< details "source code " >}}
```php
function index(){

		$data['page_data']['page_name'] = 'Student Account';
        $data['page_data']['page_icon'] = 'fa fa-rupee';
        $data['page_data']['page_title'] =  'Student Account';
		$data['page_data']['page_date'] = date("d M Y");
        $data['page_data']['page_description'] = 'This module manages all incoming & outgoing credits & debits on the Student Account.';
        $data['page_data']['breadcrumb'] = '<li>Administrator</li><li class="active">Manage Student Account</li>';

        // All Financial years
        $financial_year = $this -> System_model -> get_financial_year();
        $year_array = array(
                            'previous_year' => $this -> System_model -> get_previous_financial_year(),
                            'financial_year' => $financial_year,
                            'next_year' => $this -> System_model -> get_next_financial_year()
                        );
        $data['all_financial_years'] = $year_array;
        $data['financial_year'] = $financial_year;  // Here default year is selected
        $data['academic_year'] = $this -> System_model -> get_academic_year();

        $data['main_content'] = array('account/student_account/account_landing_view');
	    $this -> load -> view('bootstrap_templates/main_template', $data);
	}
```
{{< /details >}}

## fetch_student_account
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
The `fetch_student_account` function is used to fetch the student account details including financial years, academic years, transaction data, defaulter check, and remaining fee calculations. It also handles the payment modes and bank details for the student.

### Refactoring
1. Extract the code for fetching financial years and academic years into separate functions.
2. Extract the code for fetching transaction data into a separate function.
3. Extract the code for calculating remaining fee into a separate function.
4. Extract the code for handling payment modes and bank details into a separate function.

{{< details "source code " >}}
```php
function fetch_student_account(){
        $data['combined_data'] = array();
		$school_id = $_SESSION['school_id'];
        // All Financial years
        $financial_year = $this -> System_model -> get_financial_year();
        $year_array = array(
                            'previous_year' => $this -> System_model -> get_previous_financial_year(),
                            'financial_year' => $financial_year,
                            'next_year' => $this -> System_model -> get_next_financial_year()
                        );
        $data['all_financial_years'] = $year_array;
        $data['financial_year'] = $financial_year;  // Here default year is selected
        $data['academic_year'] = $this -> System_model -> get_academic_year();
        $data['session_school_id'] = $school_id;
        $data['collection_type'] = 'fee';
        $data['transaction_data'] = '';
        
        $data['ref_no'] = strtoupper($this->input->post('ref_no'));
        $sel_financial_year = $this->input->post('financial_year');

        $data['defaulter_check'] = '';
        $student_admission_year =  $this-> Student_model ->fetch_student_specific_info($data['ref_no'], $data['session_school_id'], 'academic_year');
        $student_status =  $this-> Student_model ->fetch_student_specific_info($data['ref_no'], $data['session_school_id'], 'status');

        $data_due['current_academic_year'] = $this -> System_model -> get_academic_year();
        $data_due['next_academic_year'] = $this -> System_model -> get_next_academic_year();
        $data_due['previous_academic_year'] = $this -> System_model -> get_previous_academic_year();
        $data_due['selected_financial_year'] = $selected_financial_year;

        if($sel_financial_year == $year_array['next_year'])
        {
            $student_confirm_next_year =  $this-> Student_model ->fetch_student_specific_info($data['ref_no'], $data['session_school_id'], 'confirm_next_year');
            if($student_confirm_next_year == 0)
            {
                $data['defaulter_check'] = 'Admission is not confirmed for the year '.$sel_financial_year;
            }
        }else if ($student_status == 3 || $student_status == 4) 
        {
            $data['defaulter_check'] = 'Student is cancelled or not attending';
        }else if ($student_admission_year > $sel_financial_year && $student_admission_year >= $data['academic_year']) 
        {
            $data['defaulter_check'] = 'Not Applicable';
        }else
        {
            $defaulter_check = $this->check_student_defaulter($data);
            if($defaulter_check != 0)
            {
                $res_fee_check = explode("~",$defaulter_check);
                if($res_fee_check[1] < $sel_financial_year)
                {
                    $query_installment  = $this-> Fee_model -> fetch_installment($res_fee_check[0],$data['session_school_id']);
                    if ($query_installment != "" || $query_installment != NULL) 
                    {
                        foreach ($query_installment as $rowupdate_installment)
                        {
                            $installment_name  = $rowupdate_installment['name_of_installment'];
                        }
                    }
                    $data['defaulter_check'] = 'Fee is unpaid for '.$installment_name.'  '.$res_fee_check[1];
                }
            }
        }
        if ($sel_financial_year != '' || $sel_financial_year == NULL) {
            $selected_financial_year = $sel_financial_year;
        }else{
            $selected_financial_year = '';
        }
        $data['selected_financial_year'] = $selected_financial_year;
        $data['full_name']  = $this-> Student_model ->get_refno_fullname($data['ref_no'], $school_id);
        $admission_current_class  = $this-> Fee_model ->get_admission_class($data['ref_no'], $school_id); //9

        $admission_class_id = $admission_current_class[0]['class_admitted_to']; //9
        $current_class_id   = $admission_current_class[0]['admission_to']; // 14

        if ($sel_financial_year == '' || $sel_financial_year == null) {
            // ALL years
            // calculate financial years from admission    
            $calculate_gap = $current_class_id - $admission_class_id;
            $get_aca_year = substr($data['financial_year'], 0, 4);
            $calculate_admission_year = $get_aca_year - $calculate_gap;
            $calculate_next_year = $calculate_admission_year + 1;
            $cal_year = $calculate_admission_year."-".$calculate_next_year;
            $data['custom_plan'] = 0;

            for ($i=$admission_class_id; $i <= $current_class_id; $i++) {
                // Payplan according to selected fin year & computed class
                $data['payplan'] = $this-> Fee_model ->get_refno_payplan_details($data['ref_no'], $i, $cal_year,'fee', $school_id);
                if($data['payplan'] == 0)
                {
                    echo "Fee Setup Not Done For Selected Year!";
                    return;
                }

                $refno_fee_custom_plan = $this-> Fee_model -> fetch_default_custom_payplan_refno($data['ref_no'], $cal_year, $i, $school_id, 'fee'); 
                if($refno_fee_custom_plan)
                {
                    $data['custom_plan'] = $refno_fee_custom_plan;
                }

                $data['profile_fee_data'] = $this-> Fee_model ->fetch_fees_profile_details_all($data['ref_no'], $school_id, $i, $cal_year,$data['payplan']);
                if($data['profile_fee_data'] == NULL)
                {
                    $data['fee_data'] = $data['fee_data'] = $this-> Fee_model ->fetch_fees_details_all($data['ref_no'], $school_id, $i, $cal_year, $data['payplan'],$data_due);
                    if($data['fee_data'] == NULL)
                    {
                        echo "Fee Setup Not Done For Selected Year!";
                        return;
                    }
                }

                // concession
                $data['concession_data'] = $this-> Fee_model ->concession_data_all($data['ref_no'], $school_id, $i, $cal_year);
                if($data['concession_data'] != NULL){
                    $data['combined_data'] = array_merge($data['combined_data'], $data['concession_data']);
                }

                $data['paid_data'] = $this-> Fee_model ->fetch_transaction_history_all($data['ref_no'], $school_id, $i, $cal_year);
                if($data['paid_data'] != NULL){
                    $data['combined_data'] = array_merge($data['combined_data'], $data['paid_data']);
                }

                $loop_aca_year = substr($cal_year, 0, 4) + 1;
                $loop_aca_year_sec = substr($cal_year, 5, 10) + 1;

                $cal_year = $loop_aca_year.'-'.$loop_aca_year_sec;
            }

        }else{ // For selected year
                // Student class according to Financial Year selected
                $continuity_array = $this-> Fee_model ->get_computed_continuity_class($data['ref_no'], $selected_financial_year, $data['academic_year'], NULL, $school_id);
                $computed_class_id = $continuity_array['computed_class'];

                // Payplan according to selected fin year & computed class
                $data['payplan'] = $this-> Fee_model ->get_refno_payplan_details($data['ref_no'], $computed_class_id, $selected_financial_year,'fee', $school_id);
                if($data['payplan'] == 0)
                {
                    echo "Fee Setup Not Done For Selected Year!";
                    return;
                }

                $refno_fee_custom_plan = $this-> Fee_model -> fetch_default_custom_payplan_refno($data['ref_no'], $selected_financial_year, $computed_class_id, $school_id, 'fee'); 
                if($refno_fee_custom_plan)
                {
                    $data['custom_plan'] = $refno_fee_custom_plan;
                }

                $data['school_id'] = $school_id;
                $data['class_id'] = $computed_class_id;
                
                $data['partial_fee_data'] = $this-> Fee_model ->fetch_partial_fees_details_all($data['ref_no'], $school_id, $computed_class_id, $selected_financial_year, $data['payplan'],$data_due);
                
                $data['profile_fee_data'] = $this-> Fee_model ->fetch_fees_profile_details_all($data['ref_no'], $school_id, $computed_class_id, $selected_financial_year,$data['payplan']);
                if($data['profile_fee_data'] == NULL){
                    $data['fee_data'] = $this-> Fee_model ->fetch_fees_details_all($data['ref_no'], $school_id, $computed_class_id, $selected_financial_year, $data['payplan'],$data_due);
                    if($data['fee_data'] == NULL)
                    {                       
                        echo "Fee Setup Not Done For Selected Year!";
                        return;
                    }
                }

                // concession
                $data['concession_data'] = $this-> Fee_model ->concession_data_all($data['ref_no'], $school_id, $computed_class_id, $selected_financial_year);
                if($data['concession_data'] != NULL){
                    $data['combined_data'] = array_merge($data['combined_data'], $data['concession_data']);
                }

                // Late Fee
                $data['late_fee_data'] = $this-> Fee_model ->late_fee_data_all($data['ref_no'], $school_id, $computed_class_id, $selected_financial_year);
                if($data['late_fee_data'] != NULL){
                    $data['combined_data'] = array_merge($data['combined_data'], $data['late_fee_data']);
                }
               
                $data['paid_data'] = $this-> Fee_model ->fetch_transaction_history_all($data['ref_no'], $school_id, $computed_class_id, $selected_financial_year);
                if($data['paid_data'] != NULL){
                    $data['combined_data'] = array_merge($data['combined_data'], $data['paid_data']);
                }
        }
        $partial_id_array = array();
        $min_due_date = array();
        $first_payment = 0;
        if($data['profile_fee_data'] != NULL)
        {
            $profile_all_array = array();
            foreach ($data['profile_fee_data'] as $profile_key => $profile_value) 
            {
                $profile_data['school_id'] = $profile_value['school_id'];
                $profile_data['school_name'] = $profile_value['school_name'];
                $profile_data['Instt_id'] = $profile_value['Instt_id'];
                $profile_data['instt_name'] = $profile_value['instt_name'];
                $profile_data['fee_sch_id'] = $profile_value['fee_sch_id'];
                $profile_data['institude_id'] = $profile_value['institude_id'];
                $profile_data['class_id'] = $profile_value['class_id'];
                $profile_data['financial_year'] = $profile_value['financial_year'];
                $profile_data['payplan_id'] = $profile_value['payplan_id'];
                $profile_data['is_paid'] = $profile_value['is_paid'];
                $profile_data['paid_data'] = $profile_value['paid_data'];
                $profile_data['recp_id1'] = $profile_value['recp_id1'];
                $profile_data['credit'] = $profile_value['credit'];
                $profile_data['FeeorDep'] = $profile_value['FeeorDep'];
                $profile_data['remark'] = $profile_value['remark'];
                $profile_data['class_name'] = $profile_value['class_name'];

                $payment_info = json_decode($profile_value['payment_info']);
                foreach ($payment_info as $pay_key => $pay_value) 
                {
                    $profile_data['instl_no'] = $pay_value->install_id;
                    $profile_data['name_of_installment'] = $pay_value->name_of_installment;
                    $profile_data['installment_number'] = $pay_value->installment_number;
                    if($profile_data['financial_year'] == $data_due['current_academic_year'])
                    {
                        $profile_data['due_date'] = $pay_value->due_date;
                    }else if($profile_data['financial_year'] == $data_due['next_academic_year']){
                        $profile_data['due_date'] = $pay_value->next_year_due_date;
                    }else if($profile_data['financial_year'] == $data_due['previous_academic_year']){
                        $profile_data['due_date'] = $pay_value->previous_year_due_date;
                    }
                    foreach ($pay_value->head_data as $head_key => $head_value) 
                    {
                        $profile_data['fee_head_id'] = $head_value->fee_head_id;
                        $profile_data['chq_amt'] = $head_value->install_amt;
                        $profile_data['fee_head_name'] = $head_value->fee_head_name;
                        $profile_data['custom_plan'] = $head_value->custom_plan;
                        array_push($profile_all_array,$profile_data);
                    }
                }
            }
        }else{
            $profile_all_array = array();
            if($data['partial_fee_data'] == NULL)
            {   
                foreach ($data['fee_data'] as $fee_key => $fee_value) 
                {
                    $profile_data['school_id'] = $fee_value['school_id'];
                    $profile_data['school_name'] = $fee_value['school_name'];
                    $profile_data['Instt_id'] = $fee_value['Instt_id'];
                    $profile_data['instt_name'] = $fee_value['instt_name'];
                    $profile_data['fee_sch_id'] = $fee_value['fee_sch_id'];
                    $profile_data['institude_id'] = $fee_value['institude_id'];
                    $profile_data['class_id'] = $fee_value['class_id'];
                    $profile_data['financial_year'] = $fee_value['financial_year'];
                    $profile_data['payplan_id'] = $fee_value['payplan_id'];
                    $profile_data['is_paid'] = $fee_value['is_paid'];
                    $profile_data['paid_data'] = $fee_value['paid_data'];
                    $profile_data['recp_id1'] = $fee_value['recp_id1'];
                    $profile_data['credit'] = $fee_value['credit'];
                    $profile_data['FeeorDep'] = $fee_value['FeeorDep'];
                    $profile_data['remark'] = $fee_value['remark'];
                    $profile_data['class_name'] = $fee_value['class_name'];
                    $profile_data['instl_no'] = $fee_value['instl_no'];
                    $profile_data['name_of_installment'] = $fee_value['name_of_installment'];
                    $profile_data['installment_number'] = $fee_value['installment_number'];
                    $profile_data['due_date'] = $fee_value['due_date'];
                    $profile_data['fee_head_id'] = $fee_value['fee_head_id'];
                    $profile_data['chq_amt'] = $fee_value['chq_amt'];
                    $profile_data['fee_head_name'] = $fee_value['fee_head_name'];
                    $profile_data['custom_plan'] = $data['custom_plan'];
                    array_push($profile_all_array,$profile_data);
                }
            }else{
                foreach ($data['partial_fee_data'] as $partial_key => $partial_value) 
                {
                    $profile_data['school_id'] = $partial_value['school_id'];
                    $profile_data['school_name'] = $partial_value['school_name'];
                    $profile_data['Instt_id'] = $partial_value['Instt_id'];
                    $profile_data['instt_name'] = $partial_value['instt_name'];
                    $profile_data['fee_sch_id'] = $partial_value['fee_sch_id'];
                    $profile_data['institude_id'] = $partial_value['institude_id'];
                    $profile_data['class_id'] = $partial_value['class_id'];
                    $profile_data['financial_year'] = $partial_value['financial_year'];
                    $profile_data['payplan_id'] = $partial_value['payplan_id'];
                    $profile_data['is_paid'] = $partial_value['is_paid'];
                    $profile_data['paid_data'] = $partial_value['paid_data'];
                    $profile_data['recp_id1'] = $partial_value['recp_id1'];
                    $profile_data['credit'] = $partial_value['credit'];
                    $profile_data['FeeorDep'] = $partial_value['FeeorDep'];
                    $profile_data['remark'] = $partial_value['remark'];
                    $profile_data['class_name'] = $partial_value['class_name'];
                    $profile_data['instl_no'] = $partial_value['instl_no'];
                    $profile_data['name_of_installment'] = $partial_value['name_of_installment'];
                    $profile_data['installment_number'] = $partial_value['installment_number'];
                    $profile_data['due_date'] = $partial_value['due_date'];
                    $profile_data['fee_head_id'] = $partial_value['fee_head_id'];
                    $profile_data['chq_amt'] = $partial_value['chq_amt'];
                    $profile_data['fee_head_name'] = $partial_value['fee_head_name'];
                    $profile_data['custom_plan'] = $data['custom_plan'];
                    array_push($profile_all_array,$profile_data);
                }
            }
            // $profile_all_array = $data['fee_data'];
        }
        $data['combined_data'] = array_merge($data['combined_data'], $profile_all_array);

        if($data['partial_fee_data'] != NULL)
        {
            $highest_install_amt = 0;
            foreach ($data['partial_fee_data'] as $key => $data_value)
            {
                $today = date('Y-m-d');
                $due_date = date('Y-m-d', strtotime($data_value['due_date']));
                $today_time = strtotime($today);
                $due_date_time = strtotime($due_date);
                if (($due_date_time - $today_time) < 30*24*60*60) 
                {
                    if($data_value['is_paid'] == 0 && $data_value['approve_flag'] == 1)
                    {
                        array_push($min_due_date,$due_date_time);
                    }
                }
            }
            $first_payment = min($min_due_date);
            foreach ($data['partial_fee_data'] as $key => $data_value) 
            {
                $due_date = date('Y-m-d', strtotime($data_value['due_date']));
                $due_date_time = strtotime($due_date);
                if($due_date_time == $first_payment)
                {
                    array_push($partial_id_array,$data_value['partial_id']);
                }
            }
            $partial_id_array = array_values($partial_id_array);
            $data['partial_id_array'] = implode(',', $partial_id_array);
        }
       
        //Remaining Fee calculations
        $total_expected_amount = 0;
        $installment_id_array = array();
        $expected_school_fee = 0;
        $expected_institute_fee = 0;
        if ($profile_all_array != NULL) 
        {
            foreach ($profile_all_array as $key => $data_value)
            {
                $today = date('Y-m-d');
                $due_date = date('Y-m-d', strtotime($data_value['due_date']));
                $today_time = strtotime($today);
                $due_date_time = strtotime($due_date);
                if (($due_date_time - $today_time) < 30*24*60*60) 
                {
                    array_push($installment_id_array, $data_value['instl_no']);
                }
            }
        }

        if(count($installment_id_array) > 0)
        {
            $data['installment_id']= implode(',', $installment_id_array);
            $insatllment_details = array();
            $data['insatllment_details'] = '';

            // Separate Rethink and School Fee
            foreach ($profile_all_array as $key => $expected_value)
            {
                if($expected_value['custom_plan'] == 0 && in_array($expected_value['instl_no'],$installment_id_array))
                {
                    $insatllment_details[$key]['payplan_install_amt']= $expected_value['chq_amt'];
                    $insatllment_details[$key]['class_id']= $expected_value['class_id'];
                    $insatllment_details[$key]['payplan_inst_id']= $expected_value['institude_id'];
                    $insatllment_details[$key]['payplan_sch_id']= $expected_value['fee_sch_id'];
                    $insatllment_details[$key]['school_name'] = $expected_value['school_name'];
                    $insatllment_details[$key]['instt_name'] = $expected_value['instt_name'];
                    $insatllment_details[$key]['payplan_head_id']= $expected_value['fee_head_id'];
                    $insatllment_details[$key]['school_id']= $expected_value['school_id'];
                    $insatllment_details[$key]['academic_year']= $expected_value['financial_year'];
                    $insatllment_details[$key]['install_id']= $expected_value['instl_no'];
                    $insatllment_details[$key]['install_name']= $expected_value['name_of_installment'];
                    $insatllment_details[$key]['payplan_head_name']= $expected_value['fee_head_name'];
                    $insatllment_details[$key]['payplan_id']= $data['payplan'];
                    $insatllment_details[$key]['user_name']= $data['full_name'];
                    $insatllment_details[$key]['custom_plan']= $expected_value['custom_plan'];
                    $insatllment_details[$key]['approve_flag']= '';

                    $data_due['financial_year'] = $expected_value['financial_year'];
                    $data_due['current_academic_year'] = $this -> System_model -> get_academic_year();
                    $data_due['next_academic_year'] = $this -> System_model -> get_next_academic_year();
                    $data_due['previous_academic_year'] = $this -> System_model -> get_previous_academic_year();
                    $data_due['school_id'] = $expected_value['school_id'];
                    $data_due['payplan_id'] = $data['payplan'];
                    $data_due['installment_id'] = $expected_value['instl_no'];

                    $insatllment_details[$key]['due_date']= $expected_value['due_date'];
                    if ($expected_value['fee_sch_id'] != 0 && $expected_value['institude_id'] == 0) 
                    {
                        $data['expected_school_fee'] = $data['expected_school_fee'] + $expected_value['chq_amt'];
                    }
                    if ($expected_value['fee_sch_id'] == 0 && $expected_value['institude_id'] != 0) 
                    {
                        $data['expected_institute_fee'] = $data['expected_institute_fee'] + $expected_value['chq_amt'];
                    }
                }else
                {
                    $due_date = date('Y-m-d', strtotime($expected_value['due_date']));
                    $due_date_time = strtotime($due_date);
                    if($due_date_time == $first_payment)
                    {
                        $insatllment_details[$key]['payplan_install_amt']= $expected_value['chq_amt'];
                        $insatllment_details[$key]['class_id']= $expected_value['class_id'];
                        $insatllment_details[$key]['payplan_inst_id']= $expected_value['institude_id'];
                        $insatllment_details[$key]['payplan_sch_id']= $expected_value['fee_sch_id'];
                        $insatllment_details[$key]['school_name'] = $expected_value['school_name'];
                        $insatllment_details[$key]['instt_name'] = $expected_value['instt_name'];
                        $insatllment_details[$key]['payplan_head_id']= $expected_value['fee_head_id'];
                        $insatllment_details[$key]['school_id']= $expected_value['school_id'];
                        $insatllment_details[$key]['academic_year']= $expected_value['financial_year'];
                        $insatllment_details[$key]['install_id']= $expected_value['instl_no'];
                        $insatllment_details[$key]['install_name']= $expected_value['name_of_installment'];
                        $insatllment_details[$key]['payplan_head_name']= $expected_value['fee_head_name'];
                        $insatllment_details[$key]['payplan_id']= $data['payplan'];
                        $insatllment_details[$key]['custom_plan']= $expected_value['custom_plan'];
                        $insatllment_details[$key]['user_name']= $data['full_name'];
                        $insatllment_details[$key]['approve_flag']= 1;

                        $data_due['financial_year'] = $expected_value['financial_year'];
                        $data_due['current_academic_year'] = $this -> System_model -> get_academic_year();
                        $data_due['next_academic_year'] = $this -> System_model -> get_next_academic_year();
                        $data_due['previous_academic_year'] = $this -> System_model -> get_previous_academic_year();
                        $data_due['school_id'] = $expected_value['school_id'];
                        $data_due['payplan_id'] = $data['payplan'];
                        $data_due['installment_id'] = $expected_value['instl_no'];

                        
                        $insatllment_details[$key]['due_date']= $expected_value['due_date'];

                        if ($expected_value['fee_sch_id'] != 0 && $expected_value['institude_id'] == 0) 
                        {
                            $data['expected_school_fee'] = $data['expected_school_fee'] + $expected_value['chq_amt'];
                        }
                        if ($expected_value['fee_sch_id'] == 0 && $expected_value['institude_id'] != 0) 
                        {
                            $data['expected_institute_fee'] = $data['expected_institute_fee'] + $expected_value['chq_amt'];
                        }
                    }
                }
            }
            
            $total_expected_amount = $data['expected_school_fee'] + $data['expected_institute_fee'];
            $data['insatllment_details'] = array_values($insatllment_details);

            $total_paid_amt = 0;
            foreach($data['insatllment_details'] as $inst_value)
            {
                $ret_trahistory_status = $this -> Fee_model -> check_student_transaction_history_partial($school_id, $selected_financial_year, $computed_class_id, $data['ref_no'], $fee_flag = 'fee', $inst_value['install_id']);
                if ($ret_trahistory_status != NULL) 
                {
                    foreach($ret_trahistory_status as $student_fee_transaction)
                    {
                        if($inst_value['install_id'] == $student_fee_transaction->installment_id && $inst_value['custom_plan'] == 0 && $inst_value['payplan_inst_id'] == $student_fee_transaction->institude_id && $inst_value['payplan_head_id'] == $student_fee_transaction->fee_head_id )
                        {
                            $total_paid_amt = $total_paid_amt + $student_fee_transaction->chq_amt;
                        }
                    }
                    // $expected_school_fee = $data['expected_school_fee'] + $expected_value['chq_amt'];
                    
                } else {
                    $installment_id_diff = explode(',', $data['installment_id']);
                    $data['unpaid_amount'] = $total_expected_amount;
                }
            }
            if($total_paid_amt == $total_expected_amount)
            {
                $paid_installment = array($student_fee_transaction->installment_id);
            }

            if ($total_paid_amt >= $total_expected_amount)
            {
                // return "1";
            } else {
                if ($total_paid_amt == '' || $total_paid_amt == NULL) 
                {
                    $total_paid_amt = 0;
                }
                $data['unpaid_amount'] = $total_expected_amount - $total_paid_amt;
            }
            

            // Removed paid fees from installment array
            foreach ($data['paid_data'] as $paid_key => $paid_value) 
            { 
                foreach ($insatllment_details as $in_key => $in_value) 
                {                            
                    if($in_value['custom_plan'] == 0)
                    {
                        $exculsive_check = FALSE;
                        $total_fee_head_amount = 0;
                        $total_concession_amount = 0;
                        if(($in_value['payplan_sch_id'] == $paid_value['school_id']) && ($in_value['payplan_inst_id'] == $paid_value['institude_id']) &&($in_value['payplan_head_id'] == $paid_value['fee_head_id']) && ($in_value['academic_year'] == $paid_value['fees_paid_year']) && ($in_value['install_id'] == $paid_value['installment_id'])) 
                        {
                            $exculsive_check = TRUE;
                        }

                        if($exculsive_check) {
                            if($paid_value['fee_head_id'] == $in_value['payplan_head_id']) 
                            {
                                $total_fee_head_amount = $in_value['payplan_install_amt'] - $paid_value['chq_amt'];
                                $concession_amount = $total_fee_head_amount;
                            }

                            foreach ($data['concession_data'] as $conces_key => $conc_row) 
                            {
                                if(($in_value['payplan_sch_id'] == $conc_row['school_id']) && ($in_value['payplan_inst_id'] == $conc_row['institude_id']) &&($in_value['payplan_head_id'] == $conc_row['fee_head_id']) && ($in_value['academic_year'] == $conc_row['academic_year']) && ($in_value['install_id'] == $conc_row['student_installment_no'])) 
                                {
                                    $total_concession_amount = $total_concession_amount + $conc_row['chq_amt']; 
                                    if($total_concession_amount == $concession_amount)
                                    {
                                        unset($insatllment_details[$in_key]);
                                    }
                                    // unset($insatllment_details[$in_key]);
                                }
                            }
                            if($total_fee_head_amount == 0)
                            {
                                unset($insatllment_details[$in_key]);
                            }
                        }  
                    } 
                }
            }
            
            // Removed concession fees from installment array
            foreach ($data['concession_data'] as $conces_key => $conc_row) 
            {
                foreach ($insatllment_details as $in_key => $in_value) 
                {
                    if($in_value['install_id'] == $conc_row['student_installment_no'] && $in_value['custom_plan'] == 0)
                    {
                        $exculsive_check = FALSE;
                        $total_fee_head_amount = 0;
                        if(($in_value['payplan_sch_id'] == $conc_row['school_id']) && ($in_value['payplan_inst_id'] == $conc_row['institude_id']) &&($in_value['payplan_head_id'] == $conc_row['fee_head_id']) && ($in_value['academic_year'] == $conc_row['academic_year']) && ($in_value['install_id'] == $conc_row['student_installment_no'])) 
                        {
                            $exculsive_check = TRUE;
                        }

                        if($exculsive_check) {
                            if($conc_row['fee_head_id'] == $in_value['payplan_head_id']) 
                            {
                                $total_fee_head_amount = $in_value['payplan_install_amt'] - $conc_row['chq_amt'];
                            }
                            if($total_fee_head_amount == 0)
                            {
                                // unset($insatllment_details[$in_key]);
                            }
                            
                        }
                    }
                }
            }
            
            $data['insatllment_details'] = array_values($insatllment_details);
            $highest_install = 0;
            $highest_install_amt = 0;
            $second_highest_install = 0;
            for ($i = 0; $i < count($data['insatllment_details']); $i++) 
            {
                if($i == 0) 
                {
                    $second_highest_install = $data['insatllment_details'][$i]['install_id'];
                }
                if($data['insatllment_details'][$i]['install_id'] > $highest_install) {
                    $highest_install = $data['insatllment_details'][$i]['install_id'];
                }
                
                if($highest_install > $data['insatllment_details'][$i]['install_id'] && $data['insatllment_details'][$i]['install_id'] > $second_highest_install) {
                    $second_highest_install = $data['insatllment_details'][$i]['install_id'];
                }
            }
            // Already paid transactions
            $data['transaction_history'] = $this-> Fee_model ->fetch_transaction_history($data['ref_no'], $selected_financial_year, $data['payplan'], $second_highest_install, $school_id, 0, 0, $data['collection_type'] = 'fee');
            if($data['transaction_history'] != NULL)
            {
                foreach ($data['insatllment_details'] as $inst_key => $inst_value) 
                {
                    if ($highest_install == $inst_value['install_id']) 
                    {
                        $highest_install_amt = $highest_install_amt + $inst_value['payplan_install_amt'];
                    }
                }

            }
        }

        if ($data['defaulter_check'] == '') 
        {
            $data['transaction_data'] = $data['combined_data'];
        }else{
            $data['transaction_data'] = '';
        }

        foreach ($data['transaction_data'] as $key => $part) {
           $i_sort[$key] = strtotime($part['insert_date']);
        }
        array_multisort($i_sort, SORT_ASC, $data['transaction_data']);
        foreach ($data['transaction_data'] as $key => $part) {
            if(isset($part['due_date']))
            {
               $sort[$key] = strtotime($part['due_date']);
            }
        }
        array_multisort($sort, SORT_ASC, $data['transaction_data']);
        // Undertaking form acceptance
        $data['school_id'] = $school_id;
        $continuity_result = $this-> Continuity_form_model -> fetch_undertaking_link_data($data['ref_no'],$data,$sel_financial_year);
        if ($continuity_result != NULL) 
        {
            $data['confirm_status']     = $continuity_result->link_status;
            $data['dep_confirm_status'] = $continuity_result->dep_link_status;
        }else{
            $data['confirm_status'] = 0;
            $data['dep_confirm_status'] = 0;
        }

        $data['stud_parent_data'] = $this-> Student_model -> get_student_parent_data($data['session_school_id'],$data['ref_no']);
        $data['status']        = $data['stud_parent_data'][0]->status;
        if ($data['status'] == 6 || $data['status'] == 7) 
        {
            $data['status'] = '6,7';
        }
        $data['stud_class_id'] = $data['stud_parent_data'][0]->admission_to;
        $class_name            = $data['stud_parent_data'][0]->class_name;
        $ret_school_name       = $this-> School_model ->get_school_location($data['school_id']); 
        $school_name           = substr($ret_school_name, strrpos($ret_school_name, ' ') + 1);

        $data['academic_year'] = $sel_financial_year;
        $temp_class_id         = $data['stud_class_id'];

        $next_financial_year = $this-> System_model ->get_next_financial_year();
        if ($data['academic_year'] == $next_financial_year) 
        {
            if ($data['status'] == 1) 
            {
                $data['class_id'] = $temp_class_id;
            }else
            {
                if ($temp_class_id == 19) 
                {
                    $data['class_id'] = $temp_class_id + 4;
                }else{
                    $data['class_id'] = $temp_class_id + 1;
                }
            } 
        }else{
            $data['class_id'] = $temp_class_id;
        }
        $present_file_data     = $this -> Continuity_form_model-> fetch_undertaking_file_data($data);
        $file_id               = $present_file_data[0]->file_id; 
        $data['target_path']   = "https://drive.google.com/file/d/".$file_id;
        $data['fee_flag']      = $present_file_data[0]->fee_flag; 

        $data['payment_modes'] = $this-> Fee_model ->fetch_payment_modes('all');
        $data['bank_details'] = $this-> Fee_model ->fetch_banks();
        $data['highest_inst_amt'] = $highest_install_amt;
        $this-> load -> view('account/student_account/student_account_view', $data);
	}
```
{{< /details >}}

## check_concession
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to calculate the pending fees total for a student. It takes several parameters including the student's reference number, class ID, current year, total expected amount, total fee amount paid, installment ID, expected school fee, expected institute fee, and school ID. It first checks if there is any concession given to the student by calling the `check_student_concession_fee` function. If a concession is found, it is added to the `concession_given` variable. If no concession is found, `concession_given` is set to 0. Then, the function calculates the pending fees total by subtracting the total fee amount paid and the concession given from the total expected amount. Finally, it returns the pending fees total.

{{< details "source code " >}}
```php
public function check_concession($refno, $class_id, $current_year, $total_expected_amount, $total_fee_amount_paid,$installment_id, $expected_school_fee, $expected_institute_fee, $school_id)
    {
        $ret_check_concession = $this-> Fee_model -> check_student_concession_fee($refno, $current_year, $approve = 1, $school_id, $installment_id);
        if ($ret_check_concession != NULL)
        {
            $result_concession = $ret_check_concession[0];
            $concession_given =  floatval($result_concession->total_concession);
        }else{
            $concession_given = 0;
        } 
        // else { //RTE CHECK
        //     $ret_check_concession = $this-> Fee_model -> check_student_concession_rte($refno, $school_id, $stud_rte = 1, $installment_id);
            
        //     if ($ret_check_concession != null || $ret_check_concession != '') { //RTE Student
        //         if (floatval($expected_institute_fee) == $total_fee_amount_paid) { // Check only rethink fees for RTE
        //             $concession_given = $total_fee_amount_paid;
        //         } else {
        //             $concession_given = floatval($expected_institute_fee); // Check expected if not match with paid
        //         }
        //     } else { // Regular Student
        //         $concession_given = floatval($total_expected_amount);
        //     }
        // }
        // if($total_expected_amount - ($total_fee_amount_paid + $concession_given) <= 0){
        //     $pending_fees_total  = $total_expected_amount - ($total_fee_amount_paid);
        //     // return  "1";
        // }else{
            // Defaulter - Refund logic (Only called from student info)
            // 
            $pending_fees_total  = $total_expected_amount - ($total_fee_amount_paid + $concession_given);
        // }
        return $pending_fees_total;

    }
```
{{< /details >}}

## fetch_installment_details
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to fetch installment details based on the given parameters. It retrieves the school ID from the session, the academic year from the System_model, and the collection type, reference number, and selected financial year from the input. It then calls the Fee_model to get the computed continuity class and payplan details based on the reference number, selected financial year, academic year, and school ID. If the view flag is 'yes', it fetches the installment information and loads the 'ajax_installment' view. If the view flag is 'payplan', it fetches the payplan details and returns the payplan name. Otherwise, it gets the class name from the Class_division_model and returns the class name, class ID, and payplan.

### User Acceptance Criteria
```gherkin
Feature: Fetch Installment Details

Scenario: Fetch installment details
Given The user is logged in
When The user fetches installment details
Then The installment details are retrieved
```

### Refactoring
1. Extract the code for fetching the computed continuity class and payplan details into separate functions.
2. Use dependency injection to pass the System_model, Fee_model, and Class_division_model as dependencies instead of directly calling them.
3. Use a switch statement instead of if-else statements to handle different view flags.
4. Use a data transfer object (DTO) to pass the data to the views instead of directly passing the data array.
5. Use a constant or enum for the view flags instead of using string literals.

{{< details "source code " >}}
```php
function fetch_installment_details($view_flag = 'yes'){
		$school_id = $_SESSION['school_id'];
		$academic_year = $this -> System_model -> get_academic_year();

		$collection_type = $this->input->post('collection_type');
		$ref_no = strtoupper($this->input->post('ref_no'));
		$selected_financial_year = $this->input->post('selected_financial_year');

		// Student class according to Financial Year selected
		$continuity_array = $this-> Fee_model ->get_computed_continuity_class($ref_no, $selected_financial_year, $academic_year, NULL, $school_id);
		$computed_class_id = $continuity_array['computed_class'];

		// Payplan according to selected fin year & computed class
		$data['payplan'] = $this-> Fee_model ->get_refno_payplan_details($ref_no, $computed_class_id, $selected_financial_year,$collection_type, $school_id);
		$data['school_id'] = $school_id;
		$data['class_id'] = $computed_class_id;

		if($view_flag === 'yes'){
	        //Fetch installment data
            $data['installment_info'] = $this-> Fee_model ->fetch_payplanwise_installment($data);
            $this -> load -> view('account/common/ajax_installment', $data);
	    }else if($view_flag === 'payplan'){
            //Fetch payplan data
            $data['payplan_details'] = $this-> Fee_model ->check_pay_plan($school_id, $data['payplan']);
            if ($data['payplan_details'] != NULL) 
            {
                $data['payplan_name'] = $data['payplan_details'][0]['payment_plan'];
            }
            echo $data['payplan_name'];return;
        } else {
	    	$class_data = $this-> Class_division_model ->get_class_name($data);
	    	if($class_data != NULL){
	    		echo $class_data->row()->class_name.'~'.$data['class_id'].'~'.$data['payplan'];return;
	    	} else {
	    		echo '-';return;
	    	}
	    }
	}
```
{{< /details >}}

## save_transaction
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
{{< details "source code " >}}
```php
function save_transaction(){
        $inst_split_array = unserialize(base64_decode($_POST['split_array']));
        $payment_details = unserialize(base64_decode($_POST['payment_details']));
        $installment_id = $_POST['installment_id'];
        $installment_id_array = explode(',',$installment_id);
        $partial_id_array = $_POST['partial_id_array'];
        // $custom_plan      = $_POST['custom_plan'];
        $partial_ids = explode(',',$partial_id_array);
        $install_id = '';
        $final_trans_details = array();
        $school_array = array();
        $institute_array = array();
        foreach ($inst_split_array as $inst_key => $inst_value) 
        {
            $head_data = [];
            $head_inst_data = [];
            $ret_data = '';
            $discount = 0;
            foreach ($inst_value as $trans_inst_key => $trans_inst_value) 
            {
                if ($inst_key == $trans_inst_value['install_id']) 
                {
                    if($trans_inst_value['payplan_sch_id'] == $trans_inst_value['school_id'])
                    {
                        $payment_sch_data = array();
                        foreach($payment_details as $pay_key => $pay_val)
                        {
                            if($trans_inst_value['payplan_sch_id'] == $pay_val->sch_id && $trans_inst_value['payplan_inst_id'] == $pay_val->inst_id)
                            {
                                array_push($payment_sch_data,(object)$pay_val);
                            }
                        }
                        $other_discount = $_POST['concession_spilt_other'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $discount = $_POST['concession_spilt'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $discount_type = $_POST['concession_type'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $referral_discount = $_POST['referral_discount'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $payplan_discount = $_POST['payplan_discount'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $late_fee = $_POST['late_fee_value'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $ret_data = array(
                                    'head_id' => $trans_inst_value['payplan_head_id'], 
                                    'head_amount' => $trans_inst_value['payplan_install_amt']-$discount+$late_fee,
                                    'head_amount_main' => $trans_inst_value['payplan_install_amt'],
                                    'discount' => $other_discount,
                                    'late_fee' => $late_fee,
                                    'referral_discount' => $referral_discount,
                                    'payplan_discount' => $payplan_discount,
                                    'discount_type' => $discount_type);
                        array_push($head_data,(object)$ret_data);

                        $data_ret['ref_no']                  = strtoupper($trans_inst_value['ref_no']);
                        $data_ret['collection_type']          = 'fee';//$trans_inst_value['collection_type'];
                        $data_ret['payment_class_id']         = $trans_inst_value['class_id'];
                        $data_ret['selected_installment_id']  = $trans_inst_value['install_id'];
                        $data_ret['selected_financial_year']  = $trans_inst_value['academic_year'];
                        $data_ret['payplan_id']               = (int)$trans_inst_value['payplan_id'];
                        $data_ret['head_data']                = $head_data;
                        $data_ret['yearly_setup_id']          = $trans_inst_value['yearly_setup_id'];
                        $data_ret['ref_school_id']            = (int)$trans_inst_value['payplan_sch_id'];
                        $data_ret['ref_institute_id']         = (int)$trans_inst_value['payplan_inst_id'];
                        $data_ret['session_school_id']        = (int)$trans_inst_value['school_id'];
                        $data_ret['user_name']                = $trans_inst_value['user_name'];
                        $data_ret['install_name']                = $trans_inst_value['installment_name'];
                        $data_ret['payment_details']          = array_values($payment_sch_data);
                        $data_ret['custom_plan']                = $trans_inst_value['custom_plan'];
                    }else{
                        $payment_inst_data = array();
                        foreach($payment_details as $pay_key => $pay_val)
                        {
                            if($trans_inst_value['payplan_sch_id'] == $pay_val->sch_id && $trans_inst_value['payplan_inst_id'] == $pay_val->inst_id)
                            {
                                array_push($payment_inst_data,(object)$pay_val);
                            }
                        }
                        $other_discount = $_POST['concession_spilt_other'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $discount = $_POST['concession_spilt'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $discount_type = $_POST['concession_type'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $referral_discount = $_POST['referral_discount'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $payplan_discount = $_POST['payplan_discount'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $late_fee = $_POST['late_fee_value'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $ret_data = array(
                                    'head_id' => $trans_inst_value['payplan_head_id'], 
                                    'head_amount' => $trans_inst_value['payplan_install_amt']-$discount+$late_fee,
                                    'head_amount_main' => $trans_inst_value['payplan_install_amt'],
                                    'discount' => $other_discount,
                                    'late_fee' => $late_fee,
                                    'referral_discount' => $referral_discount,
                                    'payplan_discount' => $payplan_discount,
                                    'discount_type' => $discount_type);
                        array_push($head_inst_data,(object)$ret_data);

                        $data_inst_ret['ref_no']                  = strtoupper($trans_inst_value['ref_no']);
                        $data_inst_ret['collection_type']          = 'fee';//$trans_inst_value['collection_type'];
                        $data_inst_ret['payment_class_id']         = $trans_inst_value['class_id'];
                        $data_inst_ret['selected_installment_id']  = $trans_inst_value['install_id'];
                        $data_inst_ret['selected_financial_year']  = $trans_inst_value['academic_year'];
                        $data_inst_ret['payplan_id']               = (int)$trans_inst_value['payplan_id'];
                        $data_inst_ret['head_data']                = $head_inst_data;
                        $data_inst_ret['yearly_setup_id']          = $trans_inst_value['yearly_setup_id'];
                        $data_inst_ret['ref_school_id']            = (int)$trans_inst_value['payplan_sch_id'];
                        $data_inst_ret['ref_institute_id']         = (int)$trans_inst_value['payplan_inst_id'];
                        $data_inst_ret['session_school_id']        = (int)$trans_inst_value['school_id'];
                        $data_inst_ret['user_name']                = $trans_inst_value['user_name'];
                        $data_inst_ret['install_name']             = $trans_inst_value['installment_name'];
                        $data_inst_ret['payment_details']          = array_values($payment_inst_data);
                        $data_inst_ret['custom_plan']              = $trans_inst_value['custom_plan'];
                    }
                }
            }
            array_push($school_array, $data_ret);
            array_push($institute_array,$data_inst_ret);
        }
        $final_trans_details = array_filter(array_merge($school_array,$institute_array));
        $final_trans_details = array_values($final_trans_details);
        
        foreach ($final_trans_details as $save_key => $payment_data) 
        {
            $ref_no                   = strtoupper($payment_data['ref_no']);
            $collection_type          = $payment_data['collection_type'];
            $payment_class_id         = $payment_data['payment_class_id'];
            $selected_installment_id  = $payment_data['selected_installment_id'];
            $selected_financial_year  = $payment_data['selected_financial_year'];
            $payplan_id               = (int)$payment_data['payplan_id'];
            $head_data                = $payment_data['head_data'];
            $yearly_setup_id          = $payment_data['yearly_setup_id'];
            $ref_school_id            = (int)$payment_data['ref_school_id'];
            $ref_institute_id         = (int)$payment_data['ref_institute_id'];
            $session_school_id        = (int)$payment_data['session_school_id'];
            $user_name                = $payment_data['user_name'];
            $payment_details          = $payment_data['payment_details'];
            $accept_status            = $this->input->post('accept_status');
            $parent_otp               = $this->input->post('parent_otp');
            $current_class_id         = $this->input->post('current_class_id');
            $install_name             = $payment_data['install_name'];
            $custom_plan              = $payment_data['custom_plan'];

            $late_payment_data = NULL; // Todo - Late fee  flag & late fee amount (will come from UI)

            $academic_year = $this -> System_model -> get_academic_year();
            $transaction_id = 0;

            // Get actual deposit refunt amount for refund calculation
            $ret_refund_data = $this-> Fee_model->get_refund_data($payment_class_id,$selected_financial_year,$head_data[0]->head_id,$session_school_id);
            $refund_amt = $ret_refund_data[0]->refund_amount;
            
            if($custom_plan == 0)
            {
                // Already Paid Check
                $paid_status = $this-> Fee_model ->check_paid_unpaid($ref_no, $selected_financial_year, $payplan_id, $selected_installment_id, $session_school_id, $ref_school_id, $ref_institute_id,$collection_type);
            }else{
                $paid_status = NULL;
            }
            
            if($paid_status != NULL) {
                echo -3;return;
            } else {
                $this->load->model('account/Receipt_model');
                // echo $payment_details;return;
                $transaction_id = $this-> Receipt_model ->save_transaction($session_school_id, $academic_year, $selected_financial_year, $user_name, $selected_installment_id, $payplan_id, $head_data, $yearly_setup_id, $ref_school_id, $ref_institute_id,$collection_type, $late_payment_data, $ref_no, $payment_class_id, $payment_details[0],$refund_amt);

                //Errors
                if ($transaction_id === 0) { // Failure
                    echo 0;return;
                }
                if ($transaction_id === -1) { // Transaction failure
                    echo -1;return;
                }
                if ($transaction_id === -2) { // Amount mismatch
                    echo -2;return;
                }
            }
            //update partial id paid status
            if(count($partial_id_array) > 0)
            {
                $paid_status_update = $this -> Fee_model -> update_student_partial_paid_status($partial_ids,$ref_no,$session_school_id);
            }
            // To save undertaking form accept data
            if ($accept_status == 2) 
            {
                $data['school_id']          = $session_school_id;
                $data['refno']              = $ref_no;
                $data['class_id']           = $payment_class_id;
                $data['academic_year']      = $selected_financial_year;
                $data['link_status']        = $accept_status;
                $data['parent_otp']         = $parent_otp;
                $data['link_response']      = 'YES';
                $data['link_reason']        = 'Accepted while paying fees in school';
                $data['submitted_date']     = date("Y-m-d h:i:s");
                if ($_SERVER['HTTP_HOST'] == 'localhost') 
                {
                    $data['user_ip'] = '192.168.1.2'; // TODO remove temp IP address - - Locally it returns ::1    
                } else 
                {
                    $data['user_ip']   = $_SERVER['REMOTE_ADDR']; // Client IP address 
                }
                $data['useragent']     = $_SERVER['HTTP_USER_AGENT'];
                $data['dep_link_status']    = NULL;
                $data['dep_useragent']      = NULL;
                $data['dep_link_response']  = NULL;
                $data['dep_user_ip']        = NULL;
                $data['dep_link_reason']    = NULL;
                $data['dep_otp']            = NULL;
                $data['dep_submitted_date'] = NULL;

                $continuity_result = $this-> Continuity_form_model -> fetch_undertaking_link_data($ref_no,$data,$selected_financial_year);
                if ($continuity_result != NULL) 
                {
                    $data['dep_link_status']    = $continuity_result->dep_link_status;
                    $data['dep_useragent']      = $continuity_result->dep_user_name;
                    $data['dep_link_response']  = $continuity_result->dep_link_response;
                    $data['dep_user_ip']        = $continuity_result->dep_ip_address;
                    $data['dep_link_reason']    = $continuity_result->dep_link_reason;
                    $data['dep_otp']            = $continuity_result->dep_parent_otp;
                    $data['dep_submitted_date'] = $continuity_result->dep_submitted_date;

                    $result = $this-> Continuity_form_model ->update_continuity_info($data);
                }else{
                    $result = $this-> Continuity_form_model ->save_continuity_data($data);
                }
                if ($continuity_result->link_status != 2) 
                {
                    $this->send_undertaking_form($ref_no, $session_school_id,$selected_financial_year,$collection_type);
                }
            }
            $student_status = $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'status');

            if($collection_type != 'exam' && ($student_status == 6 || $student_status == 7))
            {
                // Student status change
                $this->convert_student_status($ref_no, $selected_financial_year, $payplan_id, $selected_installment_id, $collection_type, $session_school_id);
            }

            // Send data to show receipts
            $receipt_json = json_encode(
                                        array(
                                            'transaction_id'     => $transaction_id,
                                            'collection_type'    => $collection_type,
                                            'ref_no'             => $ref_no,
                                            'payment_class_id'   => $payment_class_id,
                                            'payplan_id'         => $payplan_id,
                                            'installment_id'     => $selected_installment_id,
                                            'financial_year'     => $selected_financial_year,
                                            'academic_year'      => $academic_year,
                                            'ref_school_id'      => $ref_school_id,
                                            'ref_institute_id'   => $ref_institute_id,
                                            'session_school_id'  => $session_school_id,
                                            'receipt_letterhead' => $payment_details[0]->receipt_letterhead,
                                            'is_duplicate'       => FALSE,
                                            'is_mail'            => TRUE,
                                            'is_mobile'          => $is_mobile,
                                            'head_data'          => $head_data,
                                            'install_name'       => $install_name,
                                            'custom_plan'        => $custom_plan
                                        )
                                    );
            echo $this->generate_receipt(0, 0, $receipt_json);
        }
	}
```
{{< /details >}}

## generate_receipt
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
This function generates a receipt for a transaction. It takes in various parameters such as the API call flag, return flag, receipt JSON, and other transaction details. It converts the API call and return flags to booleans and then processes the receipt JSON to extract the necessary information. It then fetches transaction and payment data from the database based on the provided details. It calculates the total amount, convenience amount, and deposit refund year. Finally, it generates a PDF receipt and returns the file name.

### User Acceptance Criteria
```gherkin
Feature: Generate Receipt
Scenario: Generate receipt for a transaction
Given The API call flag is 0
And The return flag is 0
And The receipt JSON is null
When The generate_receipt function is called
Then The function should return '-'
```

### Refactoring
1. Extract the logic for converting flags to booleans into a separate function.
2. Extract the logic for processing the receipt JSON into a separate function.
3. Extract the logic for fetching transaction and payment data into a separate function.
4. Extract the logic for calculating the total amount, convenience amount, and deposit refund year into a separate function.
5. Extract the logic for generating the PDF receipt into a separate function.

{{< details "source code " >}}
```php
public function generate_receipt($api_call = 0, $return = 0, $receipt_json = NULL)
    { 
        // Converting to booleans
        if($api_call == 0 || $api_call == '0'){
            $api_call = FALSE;
        } else {
            $api_call = TRUE;
        }
        if($return == 0 || $return == '0'){
            $return = FALSE;
        } else {
            $return = TRUE;
        }

    	if($receipt_json != NULL) {
            $receipt_array = json_decode($receipt_json);
            $is_mobile     = $receipt_array->is_mobile;
    	}else if($api_call) {
            $json_response = json_decode(file_get_contents('php://input'), TRUE);
            $receipt_array = (object)$json_response['receipt_json'];
            $is_mobile     = $receipt_array->is_mobile;
        } else {
            $receipt_array = json_decode($this->input->post('receipt_json'));
            $data['concession_data'] = $this-> Fee_model ->concession_data_all($receipt_array->ref_no, $receipt_array->session_school_id, $receipt_array->payment_class_id, $receipt_array->financial_year);
            $fee_head_details = $this-> Fee_model ->fetch_head_details($receipt_array->session_school_id, $receipt_array->ref_no, $receipt_array->transaction_id,$receipt_array->ref_school_id, $receipt_array->ref_institute_id,$receipt_array->financial_year,$receipt_array->installment_id,$receipt_array->payplan_id);
            $head_data_array = array();
            foreach ($fee_head_details as $head_key => $head_value) 
            {
                $discount = 0;
                $total_discount = 0;
                $referral_discount = 0;
                $payplan_discount = 0;
                $late_fee = 0;
                $discount_type = '';
                if($receipt_array->custom_plan == 0)
                {
                    foreach ($data['concession_data'] as $cons_key => $cons_value) 
                    {
                        if($cons_value['fee_head_id'] == $head_value['fee_head_id'] && $cons_value['student_installment_no'] == $receipt_array->installment_id)
                        {
                            if($cons_value['discount_id_fk'] != 0) 
                            {
                                $discount_type  = $this-> Fee_model ->fetch_discount_type($cons_value['discount_id_fk']); 
                                if($discount_type  == 'referral')
                                {
                                    $referral_discount = $referral_discount + $cons_value['chq_amt'];
                                }else if($discount_type  == 'payplan'){
                                    $payplan_discount = $payplan_discount + $cons_value['chq_amt'];
                                }else{
                                    $discount = $discount + $cons_value['chq_amt'];
                                }
                                $total_discount = $total_discount + $cons_value['chq_amt'];
                            }else{
                                $discount_type = '';
                                $total_discount = $total_discount + $cons_value['chq_amt'];
                                $discount = $discount + $cons_value['chq_amt']; 
                            }
                        }
                    }

                    // Late Fee
                    $data['late_fee_data'] = $this-> Fee_model ->late_fee_data_all($receipt_array->ref_no,$receipt_array->session_school_id, $receipt_array->payment_class_id, $receipt_array->financial_year);
                    if($data['late_fee_data'] != NULL)
                    {
                        foreach ($data['late_fee_data'] as $late_key => $late_value) 
                        {
                            if($late_value['fee_head_id'] == $head_value['fee_head_id'] && $late_value['student_installment_no'] == $receipt_array->installment_id)
                            {
                                $late_fee = $late_fee + $late_value['chq_amt'];
                            }
                           
                        }
                    }
                }
                $ret_data = array(
                                        'head_id' => $head_value['fee_head_id'], 
                                        'head_amount' => $head_value['chq_amt'],
                                        'head_amount_main' => $head_value['chq_amt']+$total_discount-$late_fee,
                                        'discount' => $discount,
                                        'referral_discount' => $referral_discount,
                                        'payplan_discount' => $payplan_discount,
                                        'late_fee' => $late_fee,
                                        'discount_type' => $discount_type);
                array_push($head_data_array, (object)$ret_data);
            }
            $receipt_array->head_data = $head_data_array;
            $is_mobile     = $receipt_array->is_mobile;
    	}
        $transaction_id     = $receipt_array->transaction_id;
        $collection_type    = $receipt_array->collection_type;
        $ref_no             = $receipt_array->ref_no;
        $payment_class_id   = (int)$receipt_array->payment_class_id;
        $payplan_id         = (int)$receipt_array->payplan_id;
        $installment_id     = (int)$receipt_array->installment_id;
        $financial_year     = $receipt_array->financial_year;
        $academic_year      = $receipt_array->academic_year;
        $ref_school_id      = (int)$receipt_array->ref_school_id;
        $ref_institute_id   = (int)$receipt_array->ref_institute_id;
        $session_school_id  = (int)$receipt_array->session_school_id;
        $receipt_letterhead = $receipt_array->receipt_letterhead;
        $is_duplicate       = $receipt_array->is_duplicate;
        $head_data          = $receipt_array->head_data;
        $install_name       = $receipt_array->install_name;

        $is_mgr_call        = FALSE;
        if ($is_duplicate && !$api_call) 
        {
            $is_mgr_call    = TRUE;
        }
        
        $is_mail            = $receipt_array->is_mail;

        $school_code_header = $this-> School_model ->get_school_code($session_school_id);

        if($receipt_array->custom_plan == 0)
        {
            // Getting Information about transaction history
            $transaction_data = $this-> Fee_model ->fetch_transaction_history($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id, $collection_type);
        }else{
            // Getting Information about transaction history
            $transaction_data = $this-> Fee_model ->fetch_partial_transaction_history($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id, $collection_type,$transaction_id);
        }
        
        if ($transaction_data != "" || $transaction_data != NULL) {
            if($receipt_array->custom_plan == 0)
            {
               $payment_data = $this-> Fee_model ->fetch_payment_mode_refno($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id,$collection_type);
            }else{
                $payment_data = $this-> Fee_model ->fetch_partial_payment_mode_refno($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id,$collection_type,$transaction_id);
            }
            
            if ($payment_data != "" || $payment_data != NULL) {
                $transaction_history = array(
                                                'ref_no'            => $ref_no,
                                                'payment_class_id'  => $payment_class_id,
                                                'ref_institute_id'  => $ref_institute_id,
                                                'ref_school_id'     => $ref_school_id,
                                                'school_code'       => $school_code_header,
                                                'transaction_data'  => $transaction_data,
                                                'payment_data'      => $payment_data,
                                                'install_name'      => $install_name
                                            );
                // Total Amount
                $total_amount = 0;
                $total_discount = 0;
                $total_main_discount = 0;
                $total_late_fee = 0;
                $count = count($transaction_history['transaction_data']);
                // Fee Heads
                for ($i=0; $i < $count; $i++) { 
                    if($head_data[$i]->discount != 0)
                    {
                        $total_discount = $total_discount + $head_data[$i]->discount;
                    }
                    $total_late_fee = $total_late_fee + $head_data[$i]->late_fee;
                    if ($is_duplicate && !$api_call) 
                    {
                        $total_amount = $total_amount + $transaction_history['transaction_data'][$i]['chq_amt'];
                    }else{
                        $total_amount = $total_amount + $head_data[$i]->head_amount_main - $head_data[$i]->discount+$head_data[$i]->late_fee;
                        $total_amount = $total_amount - $head_data[$i]->referral_discount;
                        $total_amount = $total_amount - $head_data[$i]->payplan_discount;
                    }
                }

                // Convenience Amount
                $total_convenience_amt = 0;
                $count = count($transaction_history['payment_data']);
                for ($i=0; $i < $count; $i++) { 
                    $total_convenience_amt = $total_convenience_amt + $transaction_history['payment_data'][$i]['conven_amt'];
                }

                $total_amount = $total_amount + $total_convenience_amt;

                $deposit_refund_year = 0;
                if($ref_institute_id == 1) {
                    $ret_refund_year_month = $this-> Deposit_refund_model ->get_date_of_refund($financial_year, $payment_class_id, $installment_id, $session_school_id);
                    $deposit_refund_year = $ret_refund_year_month[0]->june_year;
                }

                $receipt_pdf_name = $this->receipt_pdf($ref_no, $transaction_history, $total_amount, $ref_institute_id, $ref_school_id, $session_school_id, $collection_type, $receipt_letterhead, $is_duplicate, $is_mail, $financial_year, $deposit_refund_year, $is_mobile, $is_mgr_call, $payment_class_id,$total_discount,$head_data,$total_late_fee);
                $invoice_path = APP_WEB_URL.'/application/uploads/collection_receipts/'.$receipt_pdf_name;
                if($return){
                	echo $receipt_pdf_name;
                } else {
                	echo $receipt_pdf_name;
                }
            }
        }
        return '-';
    }
```
{{< /details >}}

## receipt_pdf
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function generates a PDF receipt for a transaction. It takes various parameters such as reference number, transaction history, total amount, institute ID, school ID, session school ID, collection type, receipt letterhead, duplicate flag, mail flag, financial year, deposit refund year, mobile flag, manager call flag, payment class ID, total discount, head data, and total late fee. It then fetches the header image data from the School_model, creates an array of data to be passed to the view, and loads the appropriate view based on the institute ID. If the duplicate flag is true and the manager call flag is true, it calls the receipt_attachment function and stores the return value in the ret_receipt_array. If the mail flag is true, it calls the mail_receipt function. Finally, it returns either the return path from the ret_receipt_array or the receipt HTML depending on the duplicate and manager call flags.

### User Acceptance Criteria
```gherkin
Feature: Generate Receipt PDF

Scenario: Generate PDF receipt
Given The reference number is "12345"
And The transaction history is "[{"date":"2022-01-01","description":"Payment for tuition","amount":100}]"
And The total amount is 100
And The institute ID is 1
And The school ID is 1
And The session school ID is 1
And The collection type is "Fee"
And The receipt letterhead is "Letterhead"
And The duplicate flag is false
And The mail flag is true
And The financial year is "2022-2023"
And The deposit refund year is "2022"
And The mobile flag is false
And The manager call flag is false
And The payment class ID is 1
And The total discount is 0
And The head data is "[{"head":"Tuition","amount":100}]"
And The total late fee is 0
When The receipt_pdf function is called
Then The receipt HTML is returned
```

### Refactoring
1. Extract the view loading logic into a separate function to improve readability.
2. Use dependency injection to inject the School_model into the function instead of accessing it directly.
3. Consider using a template engine instead of directly loading views to improve maintainability.

{{< details "source code " >}}
```php
public function receipt_pdf($ref_no, $transaction_history, $total_amount, $ref_institute_id, $ref_school_id, $session_school_id, $collection_type, $receipt_letterhead, $is_duplicate, $is_mail, $financial_year, $deposit_refund_year, $is_mobile, $is_mgr_call, $payment_class_id,$total_discount,$head_data,$total_late_fee)
    {
        $header_img = $this -> School_model -> fetch_header_data($ref_institute_id,$ref_school_id);
        $data = array (
                        'total_amount'        => $total_amount,
                        'transaction_history' => $transaction_history,
                        'receipt_letterhead'  => $receipt_letterhead,
                        'is_duplicate'        => $is_duplicate,
                        'deposit_refund_year' => $deposit_refund_year,
                        'mobile'              => $is_mobile,
                        'is_mgr_call'         => $is_mgr_call,
                        'total_discount'      => $total_discount,
                        'total_late_fee'      => $total_late_fee,
                        'head_data'           => $head_data,
                        'install_name'        => $install_name,
                        'header_img'          => $header_img
                    );

        if ($ref_institute_id == 1) {  // Deposit
            $receipt_html = $this -> load -> view('account/collection/receipt/deposit_pdf', $data, TRUE);  
        } else {  // Fee
            $receipt_html = $this -> load -> view('account/collection/receipt/fee_pdf', $data, TRUE);
        }
        $ret_receipt_array = array();
        // if ($is_duplicate == TRUE  && $is_mgr_call){
            $ret_receipt_array = $this->receipt_attachment($ref_no, $session_school_id, $receipt_html);
        // }

        // Mail
        if($is_mail){ // Receipt history handle
            $this->mail_receipt($ref_no, $session_school_id, $ref_school_id, $ref_institute_id, $collection_type, $total_amount, $receipt_html, $is_duplicate, $ret_receipt_array, $payment_class_id);
        }

        // Return PDF Name
        if ($is_duplicate && $is_mgr_call) {
            return $ret_receipt_array['return_path'];
        } else {
            return $receipt_html;    
        }
    }
```
{{< /details >}}

## mail_receipt
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to send a receipt email to parents. It fetches the parent emails from the database, generates the email content and attachments, and sends the email using the Send_mail_helper class. If the institute ID is 1 and it is not a duplicate receipt, it also sends a welcome email.

### User Acceptance Criteria
```gherkin
Feature: Mail Receipt
Scenario: Send receipt email to parents
Given The parent emails are fetched from the database
When The email content and attachments are generated
And The email is sent using the Send_mail_helper class
Then The receipt email is sent to the parents
And If the institute ID is 1 and it is not a duplicate receipt, a welcome email is also sent
```

### Refactoring
1. Extract the code for fetching parent emails into a separate function.
2. Extract the code for generating email content and attachments into a separate function.
3. Extract the code for sending the email using the Send_mail_helper class into a separate function.
4. Use dependency injection to inject the Send_mail_helper class instead of directly accessing it.
5. Use a configuration file to store the email sender information instead of hardcoding it.
6. Use a template engine to generate the email content instead of concatenating strings.
7. Use a library for generating PDF attachments instead of manually creating them.
8. Use a logging library to log any errors or exceptions that occur during the email sending process.

{{< details "source code " >}}
```php
function mail_receipt($ref_no, $session_school_id, $ref_school_id, $ref_institute_id, $collection_type, $total_amount, $output, $is_duplicate, $attachment_array, $payment_class_id) {
        // Fetching parent emails
        $email_parent_array = array();
        $parent_emails = $this-> Student_model ->get_parent_emails($session_school_id, $ref_no);
        if ($parent_emails != NULL) {
            $ret_parent_emails = $parent_emails->result();
            foreach ($ret_parent_emails as $key => $value) {
                if (isset($value->father_email_id) && $value->father_email_id != null) 
                {
                     $father_email = array(
                                'email' => trim($value->father_email_id),
                                'name'  => $value->father_f_name,
                                'type'  => 'to',
                            );
                    array_push($email_parent_array, $father_email);
                }
                if (isset($value->mother_email_id) && $value->mother_email_id != null){
                     $mother_email = array(
                                'email' => trim($value->mother_email_id),
                                'name'  => $value->mother_f_name,
                                'type'  => 'to',
                            );
                    array_push($email_parent_array, $mother_email);
                }
            }
        }

        // Mail
        $filename = ucfirst($collection_type)."-Receipt.pdf";
        $output_attach = '<br><br><hr>'.$output.'<hr>';
        $attachments = array();
        // if ($is_duplicate) {
        //     $output_attach = '';
            $attachments = $attachment_array['attachemt_array'];
        // }

        $subject_content = 'Receipt from Walnut School';

        $email_sender_info = array('module_code' => 'FEE_DEPO', 'school_id' => $session_school_id, 'ref_sch_id' => $ref_school_id, 'ref_inst_id' => $ref_institute_id);
        $email_sender = Send_mail_helper::get_sender_data($email_sender_info);
        $sender_name = 'Walnut School';
        if ($ref_institute_id != 1 && $ref_institute_id != 0 && $ref_school_id == 0) 
        {
            $sender_name = substr($email_sender['sender_name'],0,7);
        }
        
        $regards = "Regards,<br>The ".$sender_name." Administration Team";
        $preview_content = 'Dear Sir/Madam,<br><br> Please find the receipt for the '.ucwords($collection_type).' amounting to Rs. '.number_format($total_amount).' attached with this mail. Kindly keep this mail for your reference. Please do not reply to this mail address - as this mail has been sent from an automated system.<br><br>'.$output_attach;

        $email_sender_array = array( 
                                        'sender_name' => isset($email_sender['sender_name'])?$email_sender['sender_name']:'',
                                        'from_email'  => isset($email_sender['from_email'])?$email_sender['from_email']:'',
                                        'school_id'   => $session_school_id,
                                        'bcc_email'   => TRUE
                                    );

        if(!empty($email_parent_array)){
            Send_mail_helper::send_mail($email_parent_array, $preview_content, $subject_content, $attachments, $email_sender_array);
        }

        if ($ref_institute_id == 1 && !$is_duplicate) 
        {
            // Send welcome emails
            $this->welcome_email_service($email_parent_array, $session_school_id, $ref_school_id, $ref_institute_id, $ref_no, $payment_class_id);
        }
    }
```
{{< /details >}}

## convert_student_status
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
This function is used to convert the student status based on certain conditions. It fetches the student status from the database and checks if it is equal to 6 or 7. If it is 6, the new status is set to 1. If it is 7, the new status is set to 2. It then checks if the student admission year is different from the current academic year. If it is different, it performs some calculations and checks to determine if the status can be changed. If the status can be changed, it updates the student status in the database and performs some actions related to Google Classroom.

### User Acceptance Criteria
```gherkin
Feature: Convert Student Status
Scenario: Convert student status
Given The student has a reference number
And The selected financial year is valid
And The payplan ID is valid
And The selected installment ID is valid
And The collection type is valid
And The session school ID is valid
When The convert_student_status function is called
Then The student status is converted
And The student is added to the appropriate Google Classroom
```

### Refactoring
1. Extract the code for fetching the student status into a separate function.
2. Extract the code for checking if the student admission year is different into a separate function.
3. Extract the code for checking if the status can be changed into a separate function.
4. Extract the code for updating the student status in the database into a separate function.
5. Extract the code for adding the student to Google Classroom into a separate function.

{{< details "source code " >}}
```php
public function convert_student_status($ref_no, $selected_financial_year, $payplan_id, $selected_installment_id, $collection_type, $session_school_id)
    {
        $student_status = $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'status');
        if($student_status == 6) {
            $new_status = 1;
        } else if ($student_status == 7) {
            $new_status = 2;
        } 
        $academic_year = $this -> System_model -> get_academic_year();

        $student_admission_year =  $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'academic_year');
        if ($student_admission_year != $academic_year) 
        {
           //If earlier year fee is not paid and paid next year fee we can not change status current or new
            $previous_year = $this-> System_model ->calculate_previous_year($selected_financial_year);
            // Student class according to Financial Year selected
            $continuity_array = $this-> Fee_model ->get_computed_continuity_class($ref_no, $previous_year, $academic_year, NULL, $session_school_id);
            $computed_class_id = $continuity_array['computed_class'];

            // Payplan according to selected fin year & computed class
            $data['payplan'] = $this-> Fee_model ->get_refno_payplan_details($ref_no, $computed_class_id, $previous_year, $collection_type, $session_school_id);
            $data['school_id'] = $session_school_id;
            $data['class_id'] = $computed_class_id;
            $prviouse_change_status_flag = FALSE;
            // Fetch installment data
            $installment_info = $this-> Fee_model ->fetch_payplanwise_installment($data);
            foreach ($installment_info as $key => $value) {
                $previous_installment_id = $value->install_id;   
            }
            $previous_yearly_heads = $this -> Fee_model -> fetch_fees_details($ref_no, $session_school_id, $previous_year, $collection_type, $previous_installment_id,$data['payplan']);

            $pre_passed_due_flag = 0;
            foreach ($previous_yearly_heads as $yearly_key => $yearly_value) { 
                $paid_row = $this-> Fee_model -> check_paid_unpaid($ref_no, $yearly_value->financial_year, $yearly_value->payplan_id, $yearly_value->instl_no, $session_school_id, $yearly_value->fee_ref_school_id, $yearly_value->fee_ref_inst_id,$collection_type);
                if($paid_row == NULL) {
                    // Concessions & RTE
                    $concession_details = $this-> Fee_model ->refno_installment_concession_details($ref_no, $session_school_id, $collection_type, $previous_year, $yearly_value->instl_no,'collection');
                    if($concession_details != NULL){
                        foreach ($concession_details as $conces_key => $conc_row) {
                            // RTE Check
                            // if($conc_row->stud_rte == 1 && $yearly_value->fee_ref_school_id != 0 && $yearly_value->fee_ref_inst_id != 2) { // RTE and concession is applied and pay for only rethink fee
                            //     $pre_passed_due_flag++;
                            //     break;
                            // } else {
                                // Normal student concession check
                                if(($yearly_value->fee_ref_school_id == $conc_row->fee_ref_school_id) && ($yearly_value->fee_ref_inst_id == $conc_row->fee_ref_inst_id) && ($yearly_value->fee_head_id == $conc_row->fee_head_id) && ($yearly_value->financial_year == $conc_row->academic_year)) {
                                    $pre_passed_due_flag++;
                                    break;
                                }
                            // }
                        }
                    }
                } else {
                    $pre_passed_due_flag++; // Already paid
                }
            }
            if(count($previous_yearly_heads) == $pre_passed_due_flag) {
                $prviouse_change_status_flag = TRUE;
            }
        }else{
            $prviouse_change_status_flag = TRUE;
        }
        

        // For complete yearly installments, check previous due installments using today's date
        // Eg: P2 plan => APR , OCT
        // Case 1: Today = June 5, then previous due installment will be APR
        // Case 2: Today = Nov 5, then previous due installments will be APR && OCT
        // Case 3: If installment paid before due date => don't do previous installment check

        $change_status_flag = FALSE;
        // 1. Due Dates not passed (Yearly Heads for current installment only)
        $yearly_heads = $this -> Fee_model -> fetch_fees_details($ref_no, $session_school_id, $selected_financial_year,$collection_type, $selected_installment_id, $payplan_id);
        

        $passed_due_flag = 0;
        foreach ($yearly_heads as $yearly_key => $yearly_value) { // For case 1 & 2
            $paid_row = $this-> Fee_model -> check_paid_unpaid($ref_no, $yearly_value->financial_year, $payplan_id, $yearly_value->instl_no, $session_school_id, $yearly_value->fee_ref_school_id, $yearly_value->fee_ref_inst_id,$collection_type);
            if($paid_row == NULL) {
                // Concessions & RTE
                $concession_details = $this-> Fee_model ->refno_installment_concession_details($ref_no, $session_school_id, $collection_type, $selected_financial_year, $yearly_value->instl_no,'collection');
                if($concession_details != NULL){
                    foreach ($concession_details as $conces_key => $conc_row) {
                        // RTE Check
                        // if($conc_row->stud_rte == 1 && $yearly_value->fee_ref_school_id != 0 && $yearly_value->fee_ref_inst_id != 2) { // RTE and concession is applied and pay for only rethink fee
                        //     $passed_due_flag++;
                        //     break;
                        // } else {
                            // Normal student concession check
                            if(($yearly_value->fee_ref_school_id == $conc_row->fee_ref_school_id) && ($yearly_value->fee_ref_inst_id == $conc_row->fee_ref_inst_id) && ($yearly_value->fee_head_id == $conc_row->fee_head_id) && ($yearly_value->financial_year == $conc_row->academic_year)) {
                                $passed_due_flag++;
                                break;
                            }
                        // }
                    }
                }
            } else {
                $passed_due_flag++; // Already paid
            }
        }
        if(count($yearly_heads) == $passed_due_flag) {
            $change_status_flag = TRUE;
        }

        // 2. Already passed Due Dates (Yearly Heads for already passed installments)
        $yearly_heads = $this -> Fee_model -> fetch_fees_details_status_change($ref_no, $session_school_id, $selected_financial_year, $collection_type, $payplan_id);
       

        $passed_due_flag = 0;
        foreach ($yearly_heads as $yearly_key => $yearly_value) { // For case 1 & 2
            $paid_row = $this-> Fee_model ->check_paid_unpaid_status_change($ref_no, $yearly_value->financial_year, $payplan_id, $yearly_value->install_id, $session_school_id, $yearly_value->fee_ref_school_id, $yearly_value->fee_ref_inst_id, $yearly_value->fee_head_id,$collection_type);
            if($paid_row == NULL) {
                // Concessions & RTE
                $concession_details = $this-> Fee_model ->refno_installment_concession_details_status_change($ref_no, $session_school_id, $collection_type, $selected_financial_year, $yearly_value->install_id, $yearly_value->fee_head_id);
                if($concession_details != NULL){
                    foreach ($concession_details as $conces_key => $conc_row) {
                        // RTE Check
                        // if($conc_row->stud_rte == 1 && $yearly_value->fee_ref_school_id != 0 && $yearly_value->fee_ref_inst_id != 2) { // RTE and concession is applied and pay for only rethink fee
                        //     $passed_due_flag++;
                        //     break;
                        // } else {
                            // Normal student concession check
                            if(($yearly_value->fee_ref_school_id == $conc_row->fee_ref_school_id) && ($yearly_value->fee_ref_inst_id == $conc_row->fee_ref_inst_id) && ($yearly_value->fee_head_id == $conc_row->fee_head_id) && ($yearly_value->financial_year == $conc_row->academic_year)) {
                                $passed_due_flag++;
                                break;
                            }
                       // }
                    }
                }
            } else {
                $passed_due_flag++; // Already paid
            }
        }
        if(count($yearly_heads) == $passed_due_flag) {
            $change_status_flag = TRUE;
        }

        // Change Google State of student login from 'Suspended' to 'Active' and Add student to all the different subject Classrooms for his Class
        // Change status
        if($change_status_flag && $prviouse_change_status_flag)
        {
            if($this-> Student_model ->update_student_specific_info($ref_no, $session_school_id, 'status', $new_status))
            {
                $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12,'testing@walnutedu.in');
                $access_token = $this-> google_classroom ->get_access_token($client);
                $student_email = $this-> Student_model ->get_student_email($ref_no,$session_school_id);
                $data['emp_id']= $student_email[0]->user_email;
                $ret_update_student = $this->google_login ->UpdateStudentInfo($access_token,$data);
                $class_id = $this-> Student_model ->get_refno_classid($ref_no, $session_school_id);
                $classroom_array = array();
                $classroom_array = $this-> Classroom_model ->get_classroom_ids($class_id);
                for ($c = 0; $c < count($classroom_array); $c++) 
                {
                    $submissions_json = $this-> google_classroom ->addStudentToClassroom($access_token, $classroom_array[$c]->classroom_id, $data['emp_id']);
                }
                // return 1;
            } 
        } 
    }
```
{{< /details >}}

## receipt_attachment
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function generates a PDF receipt attachment for a given reference number, session school ID, and output. It uses the Dompdf library to convert the HTML output into a PDF file. The PDF file is then saved in the 'collection_receipts' folder in the application's uploads directory. The function returns an array containing the path to the generated PDF file and an attachment array with the encoded PDF content, type, and name.

### Refactoring
1. Move the require_once statement for the Dompdf library to the top of the file to improve code organization.
2. Extract the file name generation logic into a separate function for reusability.
3. Consider using a configuration file or environment variable for the path to the 'collection_receipts' folder.
4. Add error handling and validation for the input parameters.
5. Consider using dependency injection to inject the Dompdf instance instead of creating it directly in the function.

{{< details "source code " >}}
```php
public function receipt_attachment($ref_no, $session_school_id, $output)
    {
        require_once APP_ROOT_PATH.'/library/dompdf/autoload.inc.php';
        $options = new Dompdf\Options();
        $options->set('isRemoteEnabled', TRUE);
        $dompdf = new Dompdf\Dompdf($options);
        $dompdf->load_html($output);
        $dompdf->render();
        $main_output = $dompdf->output();

        $random_num = rand(0, 5000);
        $file_name = 'Collection-Receipt-'.$ref_no.'-'.$random_num;
        file_put_contents('./application/uploads/collection_receipts/Collection-Receipt-'.$ref_no.'-'.$random_num.'.pdf', $main_output);
        $attachment_encoded = base64_encode($main_output);
        $return_duplicate_array = array();
        return $return_duplicate_array = array(
                                            "return_path" => base_url().'application/uploads/collection_receipts/Collection-Receipt-'.$ref_no.'-'.$random_num.'.pdf',
                                            "attachemt_array" => array(
                                                                        array(
                                                                            'content' => $attachment_encoded,
                                                                            'type' => "application/pdf",
                                                                            'name' => $file_name,
                                                                        )
                                                                    )
                                        );
    }
```
{{< /details >}}

## welcome_email_service
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is responsible for sending a welcome email to a student. It retrieves the necessary data from the database, replaces placeholders in the email content with actual values, and sends the email to the parent(s) of the student.

### User Acceptance Criteria
```gherkin
Feature: Welcome Email Service
Scenario: Send welcome email to student
Given The student has a valid email address
When The welcome email service is called
Then The welcome email is sent to the parent(s) of the student
```

### Refactoring
1. Extract the logic for retrieving the email content into a separate function.
2. Move the logic for replacing placeholders in the email content into a separate function.
3. Extract the logic for sending the email into a separate function.
4. Use dependency injection to pass the necessary dependencies to the function instead of accessing them directly.
5. Use a template engine to generate the email content instead of manually replacing placeholders.

{{< details "source code " >}}
```php
public function welcome_email_service($email_parent_array, $session_school_id, $ref_school_id, $ref_institute_id, $ref_no, $payment_class_id)
    {
        $attachments_welcome = array();

        $subject_content_welcome = 'Welcome to the Walnut Family!';
        
        // $preview_content_welcome = $this->get_walcome_email_content($session_school_id, $ref_no, $payment_class_id);
        $preview_content = $this-> Student_welcome_email_model->check_welcome_email_data($session_school_id);
        if($preview_content!= NULL){
            $data['email_content']= $preview_content;
           }
        $preview_content_welcome = $data['email_content'][0]->email_content;

        $data['ref_no']      = $ref_no;
        $ret_student_account = $this-> Student_model ->get_student_account_details($ref_no,$session_school_id);

        $data['user_email']    = strtolower($ret_student_account[0]->user_email);
        $data['user_password'] = $ret_student_account[0]->user_password;
     
        $data['student_first_name']   = $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'first_name');
        $data['student_app_password'] = $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'web_password');
        $data['student_web_password'] = $this -> School_model -> get_walmiki_password($session_school_id);

        if (strpos($preview_content_welcome, '$$first_name$$') !== false) 
        {
            $stude_f_name = strtoupper($data['student_first_name']);
            $preview_content_welcome = str_replace('$$first_name$$', $stude_f_name, $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$refno$$') !== false) 
        {
            $refno = strtoupper($data['ref_no']);
            $preview_content_welcome = str_replace('$$refno$$', $refno, $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$user_email$$') !== false) 
        {
            $user_email = $data['user_email'];
            $preview_content_welcome = str_replace('$$user_email$$', $user_email, $preview_content_welcome);
        }

       if (strpos($preview_content_welcome, '$$user_password$$') !== false) 
        {
            $user_password = $data['student_web_password'];
            $preview_content_welcome = str_replace('$$user_password$$', $user_password, $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$user_app_password$$') !== false) 
        {
            $user_app_password = $data['user_password'];
            $preview_content_welcome = str_replace('$$user_app_password$$', $user_app_password, $preview_content_welcome);
        }

        $email_sender_info_welcome = array('module_code' => 'FEE_DEPO', 'school_id' => $session_school_id, 'ref_sch_id' => $ref_school_id, 'ref_inst_id' => $ref_institute_id);
        $email_sender_welcome = Send_mail_helper::get_sender_data($email_sender_info_welcome);
        $email_sender_array_welcome = array( 
                                        'sender_name' => isset($email_sender_welcome['sender_name'])?$email_sender_welcome['sender_name']:'',
                                        'from_email'  => isset($email_sender_welcome['from_email'])?$email_sender_welcome['from_email']:'',
                                        'school_id'   => $session_school_id,
                                        'bcc_mail_ids'=> 'pallavi.r@walnutedu.in', // Ketaki request to put to check walmiki user create or not 04/02/19
                                        'bcc_email'   => TRUE
                                    );

        if(!empty($email_parent_array)){
            $mail_sent = Send_mail_helper::send_mail($email_parent_array, $preview_content_welcome, $subject_content_welcome, $attachments_welcome, $email_sender_array_welcome);
            $email_result = $this-> Fee_model-> insert_walcome_email_content($ref_no, $session_school_id,$mail_sent);
            $send_content_to_app_result = $this -> save_in_student_app($ref_no, $payment_class_id, $preview_content_welcome, $session_school_id);
            return $mail_sent;
        }
    }
```
{{< /details >}}

## fetch_transaction_details
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
This function fetches transaction details for a payment. It retrieves payment data from the input, including unpaid transactions, payment details, installment ID, and partial ID array. It also retrieves the current class ID and concession and late fee data. It then processes the unpaid transactions and applies any applicable concessions. Finally, it sorts the transactions by due date and returns the transaction details.

### User Acceptance Criteria
```gherkin
Feature: Fetch Transaction Details
Scenario: Fetch transaction details for a payment
Given The payment data is available
When The fetch_transaction_details function is called
Then The transaction details are retrieved and returned
```

### Refactoring
1. Extract the code for fetching concession and late fee data into separate functions for better modularity.
2. Use a more descriptive variable name instead of 'data_trans' for the transaction details array.
3. Consider using a data structure like a dictionary or associative array instead of an indexed array for the 'trans_install_array' variable to improve readability and maintainability.

{{< details "source code " >}}
```php
public function fetch_transaction_details()
    {  
        $payment_data = json_decode($this->input->post('payment_data_json'));
        $unpaid_array = unserialize(base64_decode($payment_data->unpaid_array));
        $data['payment_details'] = $payment_data->payment_details;
        $data['installment_id'] = $payment_data->installment_id;
        $data['partial_id_array'] = $payment_data->partial_id_array;
        // $data['custom_plan'] = $payment_data->custom_plan;
        $flag = $this->input->post('flag');
        $financial_year = $this -> System_model -> get_financial_year();
        $data['school_id'] = $_SESSION['school_id'];
        $data['accept_status'] = $this->input->post('accept_status');
        $data['parent_otp']    = $this->input->post('parent_otp');
        $trans_details = array();
        $admission_current_class  = $this-> Fee_model ->get_admission_class($payment_data->ref_no, $payment_data->session_school_id); 
        $current_class_id   = $admission_current_class[0]['admission_to'];
        $data['current_class_id'] = $current_class_id;
        // concession
        $data['concession_data'] = $this-> Fee_model ->concession_data_all($payment_data->ref_no, $payment_data->session_school_id, $current_class_id, $payment_data->financial_year);
        //Late fee
        $data['late_fee_data'] = $this-> Fee_model ->late_fee_data_all($payment_data->ref_no, $payment_data->session_school_id, $current_class_id, $payment_data->financial_year);
        foreach ($unpaid_array as $key => $value) 
        {
            // $query_fee_head  = $this-> Fee_model -> fetch_fee_head($value['payplan_head_id']);
            // if ($query_fee_head != "" || $query_fee_head != NULL) 
            // {
            //     foreach ($query_fee_head as $rowupdate_fee_head)
            //     {
                    $data_trans['fee_head_name']  = $value['payplan_head_name'];
            //     }
            // }

            // $query_installment  = $this-> Fee_model -> fetch_installment($value['install_id'],$value['school_id']);
            // if ($query_installment != "" || $query_installment != NULL) 
            // {
            //     foreach ($query_installment as $rowupdate_installment)
            //     {
                    $data_trans['installment_name']  = $value['install_name'];
            //     }
            // }
            $data_trans['yearly_setup_id'] =$value['yearly_setup_id'];
            $data_trans['payplan_install_amt'] = $value['payplan_install_amt'];
            $data_trans['payplan_inst_id'] = $value['payplan_inst_id'];
            $data_trans['payplan_sch_name'] = '';
            $data_trans['payplan_inst_name'] = '';
            if($value['payplan_sch_id'] != 0)
            {
                $school_data = $this-> School_model ->get_exclusive_school_data($value['payplan_sch_id']);
                if($school_data != NULL || $school_data != '')
                {
                  $data_trans['payplan_sch_name'] = $school_data[0]->school_name;
                }
            }else{
                $unique_institute_data = $this-> School_model ->get_institute_data($value['payplan_inst_id']);
                if ($unique_institute_data != '' || $unique_institute_data != null) {
                    $data_trans['payplan_inst_name'] = $unique_institute_data[0]->Instt_Name;
                }
            }
            
            $data_trans['payplan_sch_id'] = $value['payplan_sch_id'];
            $data_trans['academic_year'] = $value['academic_year'];
            $data_trans['payplan_head_id'] = $value['payplan_head_id'];
            $data_trans['install_id'] = $value['install_id'];
            $data_trans['class_id'] = $value['class_id'];
            $data_trans['school_id'] = $value['school_id'];
            $data_trans['payplan_id'] = $value['payplan_id'];
            $data_trans['user_name'] = $value['user_name'];
            $data_trans['due_date'] = $value['due_date'];
            $data_trans['custom_plan'] = $value['custom_plan'];
            array_push($trans_details, $data_trans);
        }
        
        foreach ($data['concession_data'] as $cons_key => $cons_value) 
        {        
            foreach ($trans_details as $key => $tran_value) 
            {
                if($tran_value['install_id'] == $cons_value['student_installment_no'] && $tran_value['custom_plan'] == 0)
                {
                    $exculsive_check = FALSE;
                    $total_fee_head_amount = 0;
                    if(($tran_value['payplan_sch_id'] == $cons_value['school_id']) && ($tran_value['payplan_inst_id'] == $cons_value['institude_id']) &&($tran_value['payplan_head_id'] == $cons_value['fee_head_id']) && ($tran_value['academic_year'] == $cons_value['academic_year']) && ($tran_value['install_id'] == $cons_value['student_installment_no'])) 
                    {
                        $exculsive_check = TRUE;
                    }

                    if($exculsive_check) {
                        if($cons_value['fee_head_id'] == $tran_value['payplan_head_id']) 
                        {
                            $total_fee_head_amount = $tran_value['payplan_install_amt'] - $cons_value['chq_amt'];
                        }
                        if($total_fee_head_amount == 0)
                        {
                            // unset($data['concession_data'][$cons_key]);
                            unset($trans_details[$key]);
                        }
                    }
                }
                // else{
                //     unset($data['concession_data'][$cons_key]);
                // }
            }
        }
       
        ////For partial discount
        // foreach ($data['concession_data'] as $cons_key => $cons_value) 
        // {
        //     if($cons_value['fee_head_id'] != NULL && $cons_value['student_installment_no'] != NULL && $cons_value['discount_id_fk'] == 0) 
        //         {
        //             unset($data['concession_data'][$cons_key]);
        //         }
        // }
        foreach ($data['concession_data'] as $cons_key => $cons_value) 
        {
            if($cons_value['discount_id_fk'] != 0) 
            {
                $discount_type  = $this-> Fee_model ->fetch_discount_type($cons_value['discount_id_fk']); 
                $data['concession_data'][$cons_key]['type'] = $discount_type;
            }else{
                $data['concession_data'][$cons_key]['type'] = ''; 
            }
        }
        // echo "<pre>";
        // print_r($data['concession_data']);return;
        $trans_details =  array_values($trans_details);
        
        $trans_install_array = array();
        foreach ($trans_details as $key => $trans_value) 
        {
            if(in_array($trans_value['install_id'],$trans_install_array))
            {   
                $trans_install_array[$trans_value['install_id']][] = array (
                                    'ref_no' => $payment_data->ref_no,
                                    'yearly_setup_id'        => $trans_value['yearly_setup_id'], 
                                    'payplan_install_amt'        => $trans_value['payplan_install_amt'], 
                                    'class_id'         => $trans_value['class_id'], 
                                    'payplan_inst_id'   => $trans_value['payplan_inst_id'], 
                                    'payplan_sch_id'   => $trans_value['payplan_sch_id'],
                                    'payplan_inst_name'   => $trans_value['payplan_inst_name'], 
                                    'payplan_sch_name'   => $trans_value['payplan_sch_name'], 
                                    'payplan_head_id'   => $trans_value['payplan_head_id'], 
                                    'school_id'   => $trans_value['school_id'], 
                                    'academic_year'   => $trans_value['academic_year'], 
                                    'install_id'   => $trans_value['install_id'],
                                    'installment_name'=> $trans_value['installment_name'],
                                    'fee_head_name'=> $trans_value['fee_head_name'],
                                    'payplan_id' => $trans_value['payplan_id'],
                                    'user_name' => $trans_value['user_name'],
                                    'due_date' =>  $trans_value['due_date'],
                                    'custom_plan' =>  $trans_value['custom_plan']
                                );

            }else{
                $trans_install_array[$trans_value['install_id']][] = array (
                                    'ref_no' => $payment_data->ref_no,
                                    'yearly_setup_id'        => $trans_value['yearly_setup_id'],
                                    'payplan_install_amt'        => $trans_value['payplan_install_amt'], 
                                    'class_id'         => $trans_value['class_id'], 
                                    'payplan_inst_id'   => $trans_value['payplan_inst_id'], 
                                    'payplan_sch_id'   => $trans_value['payplan_sch_id'],
                                    'payplan_inst_name'   => $trans_value['payplan_inst_name'], 
                                    'payplan_sch_name'   => $trans_value['payplan_sch_name'],  
                                    'payplan_head_id'   => $trans_value['payplan_head_id'], 
                                    'school_id'   => $trans_value['school_id'], 
                                    'academic_year'   => $trans_value['academic_year'], 
                                    'install_id'   => $trans_value['install_id'],
                                    'installment_name'=> $trans_value['installment_name'],
                                    'fee_head_name'=> $trans_value['fee_head_name'],
                                    'payplan_id' => $trans_value['payplan_id'],
                                    'user_name' => $trans_value['user_name'],
                                    'due_date' =>  $trans_value['due_date'],
                                    'custom_plan' =>  $trans_value['custom_plan']
                                );
            }
        }
        foreach ($trans_install_array as $key => $part) {
            if(isset($part['due_date']))
            {
               $sort[$key] = strtotime($part['due_date']);
            }
        }
        array_multisort($sort, SORT_ASC, $trans_install_array);
        if($flag == 'actual'){
            $data['trans_install_array'] = $trans_install_array;
            $this-> load -> view('account/student_account/student_fee_details', $data);
        }else if($flag == 'partial'){
            $max_trans_install_array = max(array_keys($trans_install_array));
            $data['trans_install_array'][$max_trans_install_array] = $trans_install_array[$max_trans_install_array];
            $this-> load -> view('account/student_account/student_partial_fee', $data);
        }else{
            // Class Info
            $ret_class_data = $this -> Student_model -> fetch_class_info($data['school_id']);
            if ($ret_class_data != null || $ret_class_data != '') {
                $data['class_info'] = $ret_class_data;
            } else {
                $data['class_info'] = NULL;
            }

            // Payplan Info
            $ret_payplan_data = $this -> Fee_model -> fetch_all_payplan($data['school_id']);
            if ($ret_payplan_data != null || $ret_payplan_data != '') {
                $data['payplan_info'] = $ret_payplan_data;
            } else {
                $data['payplan_info'] = NULL;
            }

            // Fee or Dep Selection
            $data['fee_or_dep'] = array(
                                'fee' => 'Fee',
                                'dep' => 'Deposit',
                                'exam'=>'Exam Fee'
                            );
            $data['current_academic_year'] = $this -> System_model -> get_academic_year();
            $data['next_academic_year'] = $this -> System_model -> get_next_academic_year();
            $data['previous_academic_year'] = $this -> System_model -> get_previous_academic_year();
            $data['selected_financial_year'] = $payment_data->financial_year;
            $data['refno'] = $payment_data->ref_no;
            $data['class_id'] = $payment_data->class_id;
            $data['payplan_id'] = $payment_data->payplan_id;
            $data['feeordep'] = 'fee';//$this->input->post('feeordep');
            $data['financial_year'] = $payment_data->financial_year;  // Here year selected is changed from default to whatever is UI selected
            $data['installment_id'] = $data['installment_id'];
            
            // Installments
            $ret_installment_data = $this -> Fee_model -> fetch_all_installment($data);
            if ($ret_installment_data != null || $ret_installment_data != '') {
                $data['installment_info'] = $ret_installment_data;
            } else {
                $data['installment_info'] = NULL;
            }

            $class_selected_flag = TRUE; // Default -> CLASS is selected
            if ($data['refno'] != null || $data['refno'] != '') {
                $data['class_id'] = $this -> Student_model -> get_refno_classid($data['refno'], $data['school_id']);
                $class_selected_flag = FALSE; // REFNO is selected
            }

            $data['student_payment_details'] = NULL;
           
            $student_payment_details = $this->fetch_elligible_students($data, $class_selected_flag);
            $data['student_payment_details']= $student_payment_details;
            $this-> load -> view('account/student_account/student_payment_link_details', $data);
        }
    }
```
{{< /details >}}

## fetch_elligible_students
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
This function fetches eligible students based on the given data and class selected flag. It retrieves the academic year and next year from the System_model. It then checks the fee or deposit selected flag and sets the fee_selected_flag accordingly. It checks the refnos for their pending fees/deposits and stores the payment details in an array. It also computes the class id and fetches partial fee data or yearly fee heads based on the availability. It calculates the unpaid amount, minimum due date, and total fee head amount for each installment. It then creates a payment details array with all the necessary details and returns it.

### User Acceptance Criteria
```gherkin
Feature: Fetch Eligible Students
Scenario: Fetch eligible students based on data and class selected flag
Given The academic year and next year are retrieved
When The fee or deposit selected flag is checked
Then The refnos are checked for pending fees/deposits
And The payment details array is created
And The payment details array is returned
```

### Refactoring
1. Extract the code for checking the fee or deposit selected flag into a separate function.
2. Extract the code for checking the refnos for pending fees/deposits into a separate function.
3. Extract the code for creating the payment details array into a separate function.
4. Extract the code for calculating the unpaid amount, minimum due date, and total fee head amount into separate functions.
5. Extract the code for fetching partial fee data or yearly fee heads into separate functions.
6. Use meaningful variable names to improve code readability.

{{< details "source code " >}}
```php
public function fetch_elligible_students($data, $class_selected_flag)
    {
        $academic_year = $this -> System_model -> get_academic_year(); // Running academic year
        $next_year      = $this -> System_model -> get_next_financial_year();

        if ($data['feeordep'] == 'dep') {
            $fee_selected_flag = 'dep';
        }else if($data['feeordep'] == 'exam'){
            $fee_selected_flag = 'exam';
        } else {
            $fee_selected_flag = 'fee';
        }
        // Check Refnos for their pending fees/deposits
        $payment_details_array = array();
        $defaulter_flag = '';
        $data['ref_no'] = $data['refno'];
        $data['session_school_id'] = $data['school_id'];
        $data['collection_type'] = $data['feeordep'];
        $data['selected_financial_year'] = $data['financial_year'];

         // Computed Class
        $computed_class_id = $this -> Fee_model -> get_computed_continuity_class($data['refno'], $data['financial_year'], $academic_year, NULL, $data['school_id']);
        
        $yearly_heads_array = array();
        $data['partial_fee_data'] = $this-> Fee_model ->fetch_partial_fees_details_all($data['refno'], $data['school_id'], $computed_class_id['computed_class'],$data['financial_year'], $data['payplan_id'],$data);
        if($data['partial_fee_data'] != NULL)
        {
            $data['unpaid_amount'] = 0;
            $highest_install_amt = 0;
            $min_due_date = array();
            foreach ($data['partial_fee_data'] as $key => $data_value)
            {
                $today = date('Y-m-d');
                $due_date = date('Y-m-d', strtotime($data_value['due_date']));
                $today_time = strtotime($today);
                $due_date_time = strtotime($due_date);
                if (($due_date_time - $today_time) < 30*24*60*60) 
                {
                    if($data_value['is_paid'] == 0)
                    {
                        array_push($min_due_date,$due_date_time);
                        // $data['unpaid_amount'] = $data['unpaid_amount']+$data_value['chq_amt'];
                    }
                }
            }
            $first_payment = min($min_due_date);
            foreach ($data['partial_fee_data'] as $key => $data_value)
            {
                $due_date = date('Y-m-d', strtotime($data_value['due_date']));
                $due_date_time = strtotime($due_date);
                if($due_date_time == $first_payment)
                {
                    $data['unpaid_amount'] = $data['unpaid_amount']+$data_value['chq_amt'];
                }
            }
            $partial_id_array = array();
            $installment_id_array = explode(',',$data['installment_id']);
            $installment_id_array = array_unique(array_values($installment_id_array));
            foreach ($installment_id_array as $inst_key => $inst_value) 
            {
                $total_fee_head_amount = 0; // IMP to check refno total fee & deposit
                $refno_yearly_payment_array = array();
                foreach ($data['partial_fee_data'] as $key => $data_value) 
                {
                    $due_date = date('Y-m-d', strtotime($data_value['due_date']));
                    $due_date_time = strtotime($due_date);
                    if($due_date_time == $first_payment && $inst_value == $data_value['Instt_id'])
                    {
                        $total_fee_head_amount = $data_value['chq_amt']+$total_fee_head_amount;
                        $student_fee_details_array = array(
                                                                    'year_head_data' => $data_value,
                                                                    'refno'          => $data['refno'],
                                                                );
                        array_push($refno_yearly_payment_array, $student_fee_details_array);
                        array_push($partial_id_array,$data_value['partial_id']);
                    }
                }
                if ($total_fee_head_amount > 0) 
                {
                    $payment_details_array[$data['refno']][$inst_key] = $refno_yearly_payment_array;
                    $payment_details_array[$data['refno']][$inst_key]['total'] = $total_fee_head_amount;
                    $payment_details_array[$data['refno']][$inst_key]['payplan'] = $data['payplan_id'];
                    $payment_details_array[$data['refno']][$inst_key]['current_class'] = $data['class_id'];
                    $payment_details_array[$data['refno']][$inst_key]['payment_class_id'] = $computed_class_id;
                    $payment_details_array[$data['refno']][$inst_key]['installment'] = $inst_value;
                    // $payment_details_array[$refno_value['refno']][$inst_value]['defaulter_flag'] = $defaulter_flag;

                }
            }
            $partial_id_array = array_values($partial_id_array);
            $data['partial_id_array'] = implode(',', $partial_id_array);
        }else{
            // Yearly Fee Heads
            $yearly_heads = $this -> Fee_model -> fetch_fees_details_all($data['refno'], $data['school_id'], $computed_class_id['computed_class'],$data['financial_year'], $data['payplan_id'],$data);

            foreach ($yearly_heads as $head_key => $head_value) 
            {
                if(in_array($head_value['instl_no'],$yearly_heads_array))
                { 
                    $yearly_heads_array[$head_value['instl_no']][] = $head_value;
                }else{
                    $yearly_heads_array[$head_value['instl_no']][] = $head_value;
                }
            }
            // Student Computed Payplan
            $computed_payplan_id = $this -> Fee_model -> get_refno_payplan_details($data['refno'], $computed_class_id['computed_class'], $data['financial_year'], $fee_selected_flag, $data['school_id']);

            if ($computed_payplan_id == $data['payplan_id']) // Only filter UI selected payplan refnos
            {
                // FOR EACH FEE HEADS
                $installment_id_array = explode(',',$data['installment_id']);
                foreach ($installment_id_array as $inst_key => $inst_value) 
                {
                    $total_fee_head_amount = 0; // IMP to check refno total fee & deposit
                    $refno_yearly_payment_array = array();
                    foreach ($yearly_heads_array[$inst_value] as $key => $year_head_value) 
                    {
                        // CHECK FEE PAID OR UNPAID
                        $check_paid_refno = $this -> Fee_model -> check_paid_unpaid($data['refno'], $data['financial_year'], $data['payplan_id'], $inst_value, $data['school_id'], $year_head_value['school_id'], $year_head_value['institude_id'],$data['feeordep']);

                        // CHECK PAID OR UNPAID
                        if ($check_paid_refno == NULL) {
                            $concession_details = $this-> Fee_model -> refno_installment_concession_details($data['refno'], $data['school_id'], $data['feeordep'], $data['financial_year'], $inst_value,'link');

                            if($concession_details != NULL)
                            {
                                $amount = 0;
                                $concession_array = array ();
                                foreach ($concession_details as $conces_key => $conc_row) {
                                    if($inst_value == $conc_row->student_installment_no)
                                    {
                                        // RTE and concession is applied and show for only rethink fee
                                        if($conc_row->stud_rte == 1 && $year_head_value->fee_ref_school_id != 0 && $year_head_value->fee_ref_inst_id != 2) {
                                            if(($year_head_value['fee_head_id'] == $conc_row->fee_head_id)){
                                                $concession_array = array();
                                                $amount = $amount + $conc_row->student_concession_amt; 
                                                $concession[$inst_value] = array (
                                                                            'amount'        => $amount,
                                                                            'fee_head_id'   => $conc_row->fee_head_id,
                                                                            'is_rte'        => $conc_row->stud_rte,
                                                                        );
                                                array_push($concession_array, $concession);
                                            }
                                                // break;
                                        } else {
                                            // Check if concession matches
                                            $exculsive_check = FALSE;
                                            if($data['feeordep'] == 'fee' || $data['feeordep'] == 'exam') {
                                                if(($year_head_value['school_id'] == $conc_row->fee_ref_school_id) && ($year_head_value['institude_id'] == $conc_row->fee_ref_inst_id) && ($year_head_value['fee_head_id'] == $conc_row->fee_head_id) && ($year_head_value['financial_year'] == $conc_row->academic_year) ) {
                                                    $exculsive_check = TRUE;
                                                }
                                            } else if(($year_head_value['institude_id'] == $conc_row->fee_ref_inst_id)) {
                                                $exculsive_check = TRUE; // Deposit entry present in concession then mark PAID (as paid only once throughout)
                                            }
                                            if($exculsive_check) {
                                                $concession_array = array();
                                                $amount = $amount + $conc_row->student_concession_amt; 
                                                $concession[$inst_value] = array (
                                                                            'amount'        => $amount, // Conc amount needs to be deducted
                                                                            'fee_head_id'   => $conc_row->fee_head_id,
                                                                            'is_rte'        => $conc_row->stud_rte,
                                                                        );
                                            array_push($concession_array, $concession);
                                            } 
                                            // else {
                                            //     $concession_array = array ();
                                            // }
                                        }
                                    }
                                }
                            if(count($concession_array) != 0)
                            {
                                foreach ($concession_array as $key => $concession_value) 
                                {
                                    // Concession Amount
                                    if(count($concession_value[$inst_value]) != 0) {
                                        // Amount with concession
                                        if($concession_value[$inst_value]['fee_head_id'] == $year_head_value['fee_head_id']) {
                                            $total_fee_head_amount = $total_fee_head_amount + $year_head_value['chq_amt'] - $concession_value[$inst_value]['amount'];
                                        }
                                            // RTE concession_value carried forward
                                            // if($concession_value[$inst_value]['is_rte'] == 1) {
                                            //     $total_fee_head_amount = 0;
                                            // }
                                        // Else full concession applied - Amount 0 so loops out
                                    }
                                }
                            }else{
                                $total_fee_head_amount = $total_fee_head_amount + $year_head_value['chq_amt'];
                            }
                        } else {
                            // Normal amount
                            $total_fee_head_amount = $total_fee_head_amount + $year_head_value['chq_amt'];
                        }
                        //Late Fee
                        $total_late_fee = 0;
                        $late_fee_details = $this-> Fee_model -> refno_installment_late_fee_details($data['refno'], $data['school_id'], $data['feeordep'], $data['financial_year'], $inst_value,'link');
                        if($late_fee_details != NULL)
                        {
                            foreach ($late_fee_details as $late_key => $late_row) 
                            {
                                if($inst_value == $late_row->student_installment_no)
                                {
                                    if($data['feeordep'] == 'fee' || $data['feeordep'] == 'exam') 
                                    {
                                        if(($year_head_value['school_id'] == $late_row->fee_ref_school_id) && ($year_head_value['institude_id'] == $late_row->fee_ref_inst_id) && ($year_head_value['fee_head_id'] == $late_row->fee_head_id) && ($year_head_value['financial_year'] == $late_row->academic_year) ) 
                                        {
                                            $total_late_fee = $total_late_fee + $late_row->student_late_fee_amt;
                                        }
                                    }
                                }
                            }
                        }
                        $total_fee_head_amount = $total_fee_head_amount + $total_late_fee;
                            // Create a stud array with all details
                            $student_fee_details_array = array(
                                                                'year_head_data' => $year_head_value,
                                                                'refno'          => $data['refno'],
                                                            );
                            array_push($refno_yearly_payment_array, $student_fee_details_array);
                        }
                    }
                    if ($total_fee_head_amount > 0) {
                        $payment_details_array[$data['refno']][$inst_key] = $refno_yearly_payment_array;
                        $payment_details_array[$data['refno']][$inst_key]['total'] = $total_fee_head_amount;
                        $payment_details_array[$data['refno']][$inst_key]['payplan'] = $data['payplan_id'];
                        $payment_details_array[$data['refno']][$inst_key]['current_class'] = $data['class_id'];
                        $payment_details_array[$data['refno']][$inst_key]['payment_class_id'] = $computed_class_id;
                        $payment_details_array[$data['refno']][$inst_key]['installment'] = $inst_value;
                        // $payment_details_array[$refno_value['refno']][$inst_value]['defaulter_flag'] = $defaulter_flag;

                    }
                }
            }
        }
        if ($payment_details_array != null || $payment_details_array != '') {
            return $payment_details_array;
        } else {
            return NULL;
        }
    }
```
{{< /details >}}

## fetch_discount_details
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
This function fetches discount details for a student. It retrieves various data related to discounts such as concession data, fee head details, installment details, etc.

### User Acceptance Criteria
```gherkin
Feature: Fetch Discount Details
Scenario: Fetch discount details for a student
Given The user is logged in
When The user fetches discount details
Then The discount details for the student are displayed
```

### Refactoring
1. Extract code blocks into separate functions for better modularity.
2. Use meaningful variable names to improve code readability.
3. Remove unnecessary comments and code.
4. Use dependency injection to improve testability.

{{< details "source code " >}}
```php
public function fetch_discount_details()
    {
        $data['school_id']               = $_SESSION['school_id'];
        $data['academic_year']           = $this -> System_model -> get_academic_year();
        $data['flag'] = 'account';

        $payment_data = json_decode($this->input->post('payment_data_json'));
        $unpaid_array = unserialize(base64_decode($payment_data->unpaid_array));
        $data['payment_details'] = $payment_data->payment_details;
        $data['installment_id'] = explode(',', $payment_data->installment_id);
        $data['ref_no'] = $payment_data->ref_no;
        $trans_details = array();
        $admission_current_class  = $this-> Fee_model ->get_admission_class($payment_data->ref_no, $payment_data->session_school_id); 
        $current_class_id   = $admission_current_class[0]['admission_to'];
        // concession
        $data['concession_data'] = $this-> Fee_model ->concession_data_all($payment_data->ref_no, $payment_data->session_school_id, $current_class_id, $payment_data->financial_year);
        
        foreach ($unpaid_array as $key => $value) 
        {
            $query_fee_head  = $this-> Fee_model -> fetch_fee_head($value['payplan_head_id']);
            if ($query_fee_head != "" || $query_fee_head != NULL) 
            {
                foreach ($query_fee_head as $rowupdate_fee_head)
                {
                    $data_trans['fee_head_name']  = $rowupdate_fee_head['fee_head_name'];
                }
            }

            $query_installment  = $this-> Fee_model -> fetch_installment($value['install_id'],$value['school_id']);
            if ($query_installment != "" || $query_installment != NULL) 
            {
                foreach ($query_installment as $rowupdate_installment)
                {
                    $data_trans['installment_name']  = $rowupdate_installment['name_of_installment'];
                }
            }
            $data_trans['yearly_setup_id'] =$value['yearly_setup_id'];
            $data_trans['payplan_install_amt'] = $value['payplan_install_amt'];
            $data_trans['payplan_inst_id'] = $value['payplan_inst_id'];
            $data_trans['payplan_sch_id'] = $value['payplan_sch_id'];
            $data_trans['academic_year'] = $value['academic_year'];
            $data_trans['payplan_head_id'] = $value['payplan_head_id'];
            $data_trans['install_id'] = $value['install_id'];
            $data_trans['class_id'] = $value['class_id'];
            $data_trans['school_id'] = $value['school_id'];
            $data_trans['payplan_id'] = $value['payplan_id'];
            $data_trans['user_name'] = $value['user_name'];
            array_push($trans_details, $data_trans);
        }

        $student_concession              = array();
        $student_fee_details             = array();
        for ($k=0; $k < count($trans_details); $k++) 
        { 
            $array_paid_data                 = array();
            
            $data['student_name']            = $trans_details[$k]['user_name'];
            $data['fee_or_dep']              = 'fee';//$this->input->post('fee_or_dep');
            $data['class_id']                = $trans_details[$k]['class_id'];
            // $data['ref_no']                  = strtoupper($this->input->post('ref_no'));
            $data['selected_financial_year'] = $trans_details[$k]['academic_year'];
            $data['selected_installment_id'] = $trans_details[$k]['install_id'];
            $data['payplan_id']              = $trans_details[$k]['payplan_id'];
            $data['fee_head_name1']          = $trans_details[$k]['fee_head_name'];
            $data['installment_name1']       = $trans_details[$k]['installment_name'];
            $rte_flag                        = 0;
            $data['check_setup']             = 0;
            $data['prev_count']              = 0;
            $data['prev_row_concession']     = "";
            $data['manage_photo']            = "";
            $data['app_photo']               = "";
            $data['discounted_amt']          = 0;
            $data['discount_amt_check_db']   = "";
            $data['newcom']                  = "";
            $data['approve_status']          = 0;
            $data['Inst']                    = '';
            $data['final_dis_amt']           = 0;
            $data['student_concession_data'] = "";
            $photo_path                      = "";
            $data['dep_applicable']          = '';

            $payplan_data = $this -> Fee_model -> get_payplan_data();
            if ($payplan_data != NULL && $payplan_data != '') {
                $data['payplan_data'] = $payplan_data;
            }else{
                $data['payplan_data'] = NULL;
            }
            
            $student_admission_year =  $this-> Student_model ->fetch_student_specific_info($data['ref_no'], $data['school_id'], 'academic_year');
            if ($data['fee_or_dep'] =='dep') 
            {
                if ($student_admission_year != $data['selected_financial_year']) 
                {
                    $data['dep_applicable'] = 'Discount Not applicable';
                }
            }
            
            // Student class according to Financial Year selected
            $continuity_array = $this-> Fee_model ->get_computed_continuity_class($data['ref_no'], $data['selected_financial_year'], $data['academic_year'], NULL, $data['school_id']);
            $computed_class_id      = $continuity_array['computed_class'];
            $is_next_class          = $continuity_array['is_next_class'];

            $data['school_code']    = $this -> School_model -> get_school_code($data['school_id']);

            // get paid inst fee_head_id for given selectn
            $data['fee_head_id'] = $this -> Fee_model -> get_paid_head_id($data['fee_or_dep'],$data['selected_financial_year'],$data['ref_no'],$data['selected_installment_id'],$data['school_id']);
            $paid_dep_academic_year = $data['selected_financial_year'];
            if($data['fee_head_id'] != "" || $data['fee_head_id'] != NULL)
            {
                if ($data['fee_or_dep'] == 'dep') { //for DEP to check deposite paid year
                    $paid_dep_academic_year = $data['fee_head_id'][0]->acadamic_year;
                }
                foreach ($data['fee_head_id'] as $value)
                {
                    $fee_head_id = $value->fee_head_id;
                    array_push($array_paid_data,$fee_head_id);
                }
            }

            //discount config
            $discount_config = $this-> Fee_model -> discount_config_list($data['school_id'],$computed_class_id);
            if ($discount_config != NULL || $discount_config != '')
            {
                $data['discount_config_list'] = $discount_config;
            }

            //RTE concession query
            $rte_flag_data = $this-> Fee_model ->rte_concession($data['fee_or_dep'],$data['selected_financial_year'],$data['ref_no'],$data['selected_installment_id'],$data['school_id']);
            if ($rte_flag_data != "" || $rte_flag_data != NULL) 
            {
                foreach ($rte_flag_data as $value)
                {
                   if($value->stud_rte == 1)
                   {
                        $rte_flag = 1;
                   }
                }
            }

            //Check Fee Setup Is Set OR Not
            $check_fee_setup = $this-> Fee_model ->check_fee_setup($data['fee_or_dep'],$data['selected_financial_year'],$data['selected_installment_id'],$data['school_id'],$computed_class_id);
            if ($check_fee_setup != "" || $check_fee_setup != NULL) 
            {
                $data['check_setup'] = $check_fee_setup;
            }
            //previous concession
            $prev_concession_data = $this-> Fee_model -> prev_concession($data['selected_financial_year'],$data['ref_no'],$data['selected_installment_id'],$data['school_id']);
            if ($prev_concession_data != "" || $prev_concession_data != NULL) 
            {
                $data['prev_count'] = 1;
                $data['prev_row_concession'] = $prev_concession_data;
            }

            $student_concession_data = $this-> Fee_model -> student_concession_data($rte_flag,$data['fee_or_dep'],$paid_dep_academic_year,$data['ref_no'],$data['selected_installment_id'],$data['school_id'],$data['fee_head_name1'],$data['installment_name1'],$computed_class_id);

            $data['mysql_num_rows'] = count($student_concession_data);

            if ($student_concession_data != "" || $student_concession_data != NULL) 
            {
                $data['fee_flag'] = 0;
                foreach ($student_concession_data as $rowist)
                {               
                    if (!in_array($rowist['fee_head_id'], $array_paid_data))
                    {
                        if($rowist['school_name'] == '')
                        {
                            $data_ret['Inst'] = $rowist['instt_name'];
                        }else{
                            $data_ret['Inst'] = $rowist['school_name'];
                        }
                        $data_ret['final_dis_amt'] = $rowist['fee_head_amt'];
                        $query_select_con = $this-> Fee_model -> concession_data($data['ref_no'],$rowist['fee_head_id'],$data['selected_financial_year'],$data['selected_installment_id'],$data['school_id']);
                        if ($query_select_con != "" || $query_select_con != NULL) 
                        {
                            $i = 0;
                            foreach ($query_select_con as $row_con)
                            {
                                $data_ret['discounted_amt']         = $row_con['student_concession_amt'];
                                $data_ret['discount_amt_check_db']  = $row_con['student_concession_amt'];
                                $data_ret['newcom']                 = $row_con['comment'];
                                $data_ret['discount_id_fk']         = $row_con['discount_id_fk'];
                                $data_ret['manage_photo']           = $row_con['manage_photo'];
                                $data_ret['app_photo']              = $row_con['app_photo'];

                                if ($row_con['approve'] == 1)
                                {
                                    $data_ret['approve_status'] = 1;
                                }else{
                                    $data_ret['approve_status'] = 0;
                                }
                                if($i == 0)
                                {
                                    $data_ret[$i]['final_dis_amt'] = floatval($rowist['fee_head_amt']) - floatval($data_ret['discounted_amt']);
                                }else{
                                    $data_ret[$i]['final_dis_amt'] = floatval($data_ret[$i-1]['final_dis_amt']) - floatval($data_ret['discounted_amt']);
                                }
                                $data_ret['final_dis_amt']      = $data_ret[$i]['final_dis_amt'];
                                $data_ret['fee_ref_school_id']  = $rowist['fee_ref_school_id'];
                                $data_ret['fee_ref_inst_id']    = $rowist['fee_ref_inst_id'];
                                $data_ret['fee_head_name']      = $rowist['fee_head_name'];
                                $data_ret['fee_head_amt']       = $rowist['fee_head_amt'];
                                $data_ret['instl_name']         = $rowist['instl_name'];
                                array_push($student_concession, $data_ret);
                                $i++;
                            }
                        }
                        $data_ret_des['final_dis_amt'] = $data_ret['final_dis_amt'];
                        $data_ret_des['Inst'] =  $data_ret['Inst'];
                        $data_ret_des['discounted_amt']          = 0;
                        $data_ret_des['discount_amt_check_db']   = "";
                        $data_ret_des['newcom']                  = "";
                        $data_ret_des['approve_status']          = 0;
                        $data_ret_des['manage_photo']            = "";
                        $data_ret_des['app_photo']               = "";
                        $data_ret_des['fee_ref_school_id']  = $rowist['fee_ref_school_id'];
                        $data_ret_des['fee_ref_inst_id']    = $rowist['fee_ref_inst_id'];
                        $data_ret_des['fee_head_id']        = $rowist['fee_head_id'];
                        $data_ret_des['fee_head_name']      = $rowist['fee_head_name'];
                        $data_ret_des['fee_head_amt']       = $rowist['fee_head_amt'];
                        $data_ret_des['instl_name']         = $rowist['instl_name'];
                        $data_ret_des['computed_class_id']  = $computed_class_id;
                        array_push($student_fee_details, $data_ret_des);
                        $data['fee_flag']++;
                    }
                }
            }
        }
        $result_student_fee_details = array_map("unserialize", array_unique(array_map("serialize", $student_fee_details)));
        $result_student_concession_data = array_map("unserialize", array_unique(array_map("serialize", $student_concession)));
        $data['student_concession_data'] = $result_student_concession_data;
        $data['student_fee_details']     = $result_student_fee_details;
        //Check RTE Student
        $query_rte_stud = $this-> Student_model -> fetch_student_specific_info($data['ref_no'], $data['school_id'],'stud_rte');
        if ($query_rte_stud != "" || $query_rte_stud != NULL) 
        {
            $data['stud_rte'] = $query_rte_stud;
        }
        $this-> load -> view('account/discount/view_student_discount', $data);
    }
```
{{< /details >}}

## save_partial_transaction
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `save_partial_transaction` function is responsible for saving partial transactions. It takes the necessary data from the `$_POST` array, processes it, and saves the transaction in the database. It also generates a receipt for the transaction.

### User Acceptance Criteria
```gherkin
Feature: Save Partial Transaction

Scenario: Saving a partial transaction
Given The split array is provided
When The payment details are provided
And The installment ID is provided
Then The partial transaction is saved
And A receipt is generated
```

### Refactoring
1. Extract the code for saving the transaction into a separate function to improve readability and maintainability.
2. Use a data transfer object (DTO) to pass the payment data instead of using multiple variables.
3. Use dependency injection to inject the necessary models instead of directly accessing them.
4. Use a database transaction to ensure atomicity of the save operation.

{{< details "source code " >}}
```php
function save_partial_transaction(){
        $inst_split_array = unserialize(base64_decode($_POST['split_array']));
        $payment_details = unserialize(base64_decode($_POST['payment_details']));
        $installment_id = $_POST['installment_id'];
        $installment_id_array = explode(',',$installment_id);
        $install_id = '';
        $final_trans_details = array();
        $school_array = array();
        $institute_array = array();
        foreach ($inst_split_array as $inst_key => $inst_value) 
        {
            $head_data = [];
            $head_inst_data = [];
            $ret_data = '';
            $discount = 0;
            foreach ($inst_value as $trans_inst_key => $trans_inst_value) 
            {
                if ($inst_key == $trans_inst_value['install_id']) 
                {
                    if($trans_inst_value['payplan_sch_id'] == $trans_inst_value['school_id'])
                    {
                        $discount = $_POST['concession_spilt'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $discount_type = $_POST['concession_type'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $partial_amt = $_POST['partial_amt_spilt'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $ret_data = array(
                                    'head_id' => $trans_inst_value['payplan_head_id'], 
                                    'head_amount' => $partial_amt-$discount,
                                    'discount' => $discount,
                                    'discount_type' => $discount_type);
                        array_push($head_data,(object)$ret_data);

                        $data_ret['ref_no']                  = strtoupper($trans_inst_value['ref_no']);
                        $data_ret['collection_type']          = 'fee';//$trans_inst_value['collection_type'];
                        $data_ret['payment_class_id']         = $trans_inst_value['class_id'];
                        $data_ret['selected_installment_id']  = $trans_inst_value['install_id'];
                        $data_ret['selected_financial_year']  = $trans_inst_value['academic_year'];
                        $data_ret['payplan_id']               = (int)$trans_inst_value['payplan_id'];
                        $data_ret['head_data']                = $head_data;
                        $data_ret['yearly_setup_id']          = $trans_inst_value['yearly_setup_id'];
                        $data_ret['ref_school_id']            = (int)$trans_inst_value['payplan_sch_id'];
                        $data_ret['ref_institute_id']         = (int)$trans_inst_value['payplan_inst_id'];
                        $data_ret['session_school_id']        = (int)$trans_inst_value['school_id'];
                        $data_ret['user_name']                = $trans_inst_value['user_name'];
                        $data_ret['payment_details']          = $payment_details;
                    }else{
                        $discount = $_POST['concession_spilt'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $discount_type = $_POST['concession_type'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $partial_amt = $_POST['partial_amt_spilt'.$trans_inst_value['payplan_head_id'].$trans_inst_value['install_id']];
                        $ret_data = array(
                                    'head_id' => $trans_inst_value['payplan_head_id'], 
                                    'head_amount' => $partial_amt-$discount,
                                    'discount' => $discount,
                                    'discount_type' => $discount_type);
                        array_push($head_inst_data,(object)$ret_data);

                        $data_inst_ret['ref_no']                  = strtoupper($trans_inst_value['ref_no']);
                        $data_inst_ret['collection_type']          = 'fee';//$trans_inst_value['collection_type'];
                        $data_inst_ret['payment_class_id']         = $trans_inst_value['class_id'];
                        $data_inst_ret['selected_installment_id']  = $trans_inst_value['install_id'];
                        $data_inst_ret['selected_financial_year']  = $trans_inst_value['academic_year'];
                        $data_inst_ret['payplan_id']               = (int)$trans_inst_value['payplan_id'];
                        $data_inst_ret['head_data']                = $head_inst_data;
                        $data_inst_ret['yearly_setup_id']          = $trans_inst_value['yearly_setup_id'];
                        $data_inst_ret['ref_school_id']            = (int)$trans_inst_value['payplan_sch_id'];
                        $data_inst_ret['ref_institute_id']         = (int)$trans_inst_value['payplan_inst_id'];
                        $data_inst_ret['session_school_id']        = (int)$trans_inst_value['school_id'];
                        $data_inst_ret['user_name']                = $trans_inst_value['user_name'];
                        $data_inst_ret['payment_details']          = $payment_details;
                    }
                }
            }
            array_push($school_array, $data_ret);
            array_push($institute_array,$data_inst_ret);
        }
        $final_trans_details = array_filter(array_merge($school_array,$institute_array));
        $final_trans_details = array_values($final_trans_details);

        foreach ($final_trans_details as $save_key => $payment_data) 
        {
            $ref_no                   = strtoupper($payment_data['ref_no']);
            $collection_type          = $payment_data['collection_type'];
            $payment_class_id         = $payment_data['payment_class_id'];
            $selected_installment_id  = $payment_data['selected_installment_id'];
            $selected_financial_year  = $payment_data['selected_financial_year'];
            $payplan_id               = (int)$payment_data['payplan_id'];
            $head_data                = $payment_data['head_data'];
            $yearly_setup_id          = $payment_data['yearly_setup_id'];
            $ref_school_id            = (int)$payment_data['ref_school_id'];
            $ref_institute_id         = (int)$payment_data['ref_institute_id'];
            $session_school_id        = (int)$payment_data['session_school_id'];
            $user_name                = $payment_data['user_name'];
            $payment_details          = $payment_data['payment_details'];

            $late_payment_data = NULL; // Todo - Late fee  flag & late fee amount (will come from UI)

            $academic_year = $this -> System_model -> get_academic_year();
            $transaction_id = 0;

            // Get actual deposit refunt amount for refund calculation
            $ret_refund_data = $this-> Fee_model->get_refund_data($payment_class_id,$selected_financial_year,$head_data[0]->head_id,$session_school_id);
            $refund_amt = $ret_refund_data[0]->refund_amount;

            // Already Paid Check
            // $paid_status = $this-> Fee_model ->check_paid_unpaid($ref_no, $selected_financial_year, $payplan_id, $selected_installment_id, $session_school_id, $ref_school_id, $ref_institute_id,$collection_type);
            // if($paid_status != NULL) {
            //     echo -3;return;
            // } else {
                $this->load->model('account/Receipt_model');
                // echo $payment_details;return;
                $transaction_id = $this-> Receipt_model ->save_transaction($session_school_id, $academic_year, $selected_financial_year, $user_name, $selected_installment_id, $payplan_id, $head_data, $yearly_setup_id, $ref_school_id, $ref_institute_id,$collection_type, $late_payment_data, $ref_no, $payment_class_id, $payment_details,$refund_amt);

                //Errors
                if ($transaction_id === 0) { // Failure
                    echo 0;return;
                }
                if ($transaction_id === -1) { // Transaction failure
                    echo -1;return;
                }
                if ($transaction_id === -2) { // Amount mismatch
                    echo -2;return;
                }
            // }

            // if($collection_type != 'exam')
            // {
            //     // Student status change
            //     $this->convert_student_status($ref_no, $selected_financial_year, $payplan_id, $selected_installment_id, $collection_type, $session_school_id);
            // }

            // Send data to show receipts
            $receipt_json = json_encode(
                                        array(
                                            'transaction_id'     => $transaction_id,
                                            'collection_type'    => $collection_type,
                                            'ref_no'             => $ref_no,
                                            'payment_class_id'   => $payment_class_id,
                                            'payplan_id'         => $payplan_id,
                                            'installment_id'     => $selected_installment_id,
                                            'financial_year'     => $selected_financial_year,
                                            'academic_year'      => $academic_year,
                                            'ref_school_id'      => $ref_school_id,
                                            'ref_institute_id'   => $ref_institute_id,
                                            'session_school_id'  => $session_school_id,
                                            'receipt_letterhead' => $payment_details->receipt_letterhead,
                                            'is_duplicate'       => FALSE,
                                            'is_mail'            => TRUE,
                                            'is_mobile'          => $is_mobile,
                                            'head_data'          => $head_data
                                        )
                                    );
            echo $this->generate_receipt(0, 0, $receipt_json);
        }
    }
```
{{< /details >}}

## insert_link_data
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `insert_link_data` function is responsible for inserting link data into the database. It retrieves the necessary data from the session and input, performs some checks, and then inserts the data into the database. It also sends a payment link if the data is successfully inserted.

### User Acceptance Criteria
```gherkin
Feature: Insert Link Data
Scenario: Insert link data
Given The user is logged in
When The user inserts link data
Then The link data is successfully inserted into the database
```

### Refactoring
1. Extract the code for checking student defaulter into a separate function.
2. Extract the code for fetching installment details into a separate function.
3. Extract the code for sending payment link into a separate function.
4. Extract the code for generating payment link into a separate function.
5. Use meaningful variable names to improve code readability.

{{< details "source code " >}}
```php
public function insert_link_data()
    {
        $data['school_id'] = $_SESSION['school_id'];
        $data['academic_year'] = $this -> System_model -> get_academic_year();

        $data['class_id'] = $this->input->post('current_class_id');
        $payment_class_id_list = explode(',', $this->input->post('payment_class_id'));
        $data['refno'] = $this->input->post('selected_refno');
        $data['financial_year'] = $this->input->post('sel_year_financial');
        $data['feeordep'] = $this->input->post('sel_feeordep');
        $data['installment_id'] = explode(',', $this->input->post('sel_installment_id'));
        $data['payplan_id'] = $this->input->post('sel_payplan_id');
        $data['ref_no'] = $data['refno'];
        $data['session_school_id']= $data['school_id'];
        $data['collection_type'] = $data['feeordep'];
        $data['installment_id'] = array_unique(array_values($data['installment_id']));
        
        $success_ref_array = array();
        $defaulter_check_valid = '';
        foreach ($data['installment_id'] as $key => $inst_val) 
        {
            $defaulter_check = $this->check_student_defaulter($data);
            if($defaulter_check != 0)
            {
                $res_fee_check = explode("~",$defaulter_check);
                if($res_fee_check[0] != $inst_val || $res_fee_check[1] != $data['financial_year'])
                {
                    $query_installment  = $this-> Fee_model -> fetch_installment($res_fee_check[0],$data['session_school_id']);
                    if ($query_installment != "" || $query_installment != NULL) 
                    {
                        foreach ($query_installment as $rowupdate_installment)
                        {
                            $installment_name  = $rowupdate_installment['name_of_installment'];
                        }
                    }
                    $defaulter_check_valid = 'Fee is unpaid for '.$installment_name.'  '.$res_fee_check[1];
                    echo $defaulter_check_valid;return;
                }
            }

            $data['installment_id'] = $inst_val;
            $present_record_fees = $this -> Fee_model -> fetch_student_payment_link($data['refno'], $data);
            if ($present_record_fees != NULL) {
                $this -> send_payment_link($data['refno'], $data);
                array_push($success_ref_array, $inst_val);
            } else {
                if ($this -> generate_payment_link($data['refno'], $data, $payment_class_id_list[$key])) {
                    $this -> send_payment_link($data['refno'], $data);
                    array_push($success_ref_array, $inst_val);
                }
            }
        }
        
        if (count($data['installment_id']) == count($success_ref_array)) {
            echo TRUE;return;
        }else{
            echo explode(',', $success_ref_array);return;
        }
    }
```
{{< /details >}}

## generate_unique_refno_key
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function generates a unique reference number key based on various input parameters. It concatenates the input parameters with a Unix timestamp and a random string of bytes to create the key. The key is then returned as a string.

### Refactoring
1. Extract the logic for generating the random string of bytes into a separate function.
2. Use a more descriptive variable name instead of 'string' for the concatenated string.
3. Consider using a more secure method for generating random bytes.

{{< details "source code " >}}
```php
private function generate_unique_refno_key($ref_no, $payplan, $installment, $financial_year, $school_id, $feeordep) {
        $unix_timestamp = time(); // unix - time in millisec

        $string = $ref_no.$payplan.$installment.$financial_year.$school_id.$unix_timestamp.$feeordep.'P';
        $length = 48 - strlen($string);

        $bytes = random_bytes($length/2); // as hex conversion doubles the char count
        return strtoupper($string.bin2hex($bytes));
    }
```
{{< /details >}}

## generate_short_payment_link
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function generates a short payment link using the Bitfly service. It takes a long link as input and returns a short link.

### User Acceptance Criteria
```gherkin
Feature: Generate Short Payment Link
Scenario: Generate short link
Given a long payment link
When the generate_short_payment_link function is called with the long link
Then it should return a short payment link
```

### Refactoring
1. Extract the API URL into a constant for better maintainability.
2. Add error handling for the curl request.
3. Consider using a different URL shortening service if Bitfly is not reliable.

{{< details "source code " >}}
```php
private function generate_short_payment_link($link){
        //return 'mgr-bitfly';
        // Todo - Use Bitfly to generate short link
        $ch = curl_init();  
        $timeout = 5;  
        curl_setopt($ch,CURLOPT_URL,'http://tinyurl.com/api-create.php?url='.$link);  
        curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);  
        curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,$timeout);  
        $data = curl_exec($ch);  
        curl_close($ch);  
        return $data;  
    }
```
{{< /details >}}

## generate_payment_link
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function generates a payment link for a given reference number, reference fees data, and payment class ID. It first generates a unique reference number key using the `generate_unique_refno_key` function. Then, it creates a long link by concatenating the school ID and the unique reference number key. Finally, it saves the payment link details using the `save_payment_link_details` function in the `Fee_model`.

{{< details "source code " >}}
```php
private function generate_payment_link($refno, $ref_fees_data, $payment_class_id){
        
        $unique_refno_key = $this->generate_unique_refno_key($refno, $ref_fees_data['payplan_id'], $ref_fees_data['installment_id'], $ref_fees_data['financial_year'], $ref_fees_data['school_id'], $ref_fees_data['feeordep']);

        // Long Link
        $long_link = $ref_fees_data['school_id'] .'/'. $unique_refno_key;   // Only pass link info (site,controller,method info passed later)

        return $this -> Fee_model -> save_payment_link_details($refno, $ref_fees_data, $unique_refno_key, $long_link, $payment_class_id);
    }
```
{{< /details >}}

## fetch_payment_link
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is responsible for fetching the payment link for a given reference number and data. It calls the `fetch_student_payment_link` method of the `Fee_model` class to get the payment link data. If the data is not null and the link is not null, it generates a long link and a short link using the `generate_short_payment_link` method. Finally, it returns an array containing the long link and the short link. If the data or the link is null, it returns null.

{{< details "source code " >}}
```php
private function fetch_payment_link($refno, $data)
    {
        $get_payment_link_data = $this -> Fee_model -> fetch_student_payment_link($refno, $data);
        if($get_payment_link_data != NULL){
            if($get_payment_link_data[0]->link != NULL){
                $long_link = APP_PAY_URL."/".RZP_CONTR_NAME."/".RZP_CONTR_METHOD."/".$get_payment_link_data[0]->link;
                $short_link = $this->generate_short_payment_link($long_link); //$long_link;
                return  array (
                            'long_link'  => $long_link,
                            'short_link' => $short_link
                        );

            } else {
                return NULL;
            }
        } else {
            return NULL;
        }
    }
```
{{< /details >}}

## send_payment_link
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
This function is responsible for sending a payment link to the parent of a student. It retrieves the necessary data from the database, constructs the email content, and sends the email to the parent.

### User Acceptance Criteria
```gherkin
Feature: Send Payment Link
Scenario: Successful payment link sent
Given The installment ID and school ID are valid
When The send_payment_link function is called
Then The payment link is fetched
And The email content is constructed
And The email is sent to the parent
```

### Refactoring
1. Extract the code for fetching installment data into a separate function.
2. Extract the code for fetching academic year data into a separate function.
3. Extract the code for constructing the email content into a separate function.
4. Extract the code for sending the email into a separate function.
5. Remove commented out code.
6. Use a constant or configuration file for the email subject content.
7. Use a constant or configuration file for the email sender information.

{{< details "source code " >}}
```php
private function send_payment_link($refno, $data)
    {
        $query_installment = $this-> Fee_model ->fetch_installment($data['installment_id'],$data['school_id']);
        if ($query_installment != "" || $query_installment != NULL) 
        {
            foreach ($query_installment as $rowupdate_installment)
            {
                $installment_name  = $rowupdate_installment['name_of_installment'];
            }
        }

        $installment_count = $this-> Fee_model ->fetch_no_of_installment($data['payplan_id'],$data['school_id']);

        $pay_link_array = $this->fetch_payment_link($refno, $data);
        if($pay_link_array == NULL){
            return false;
        }

        $selected_financial_year = $data['financial_year'];
        $data['current_academic_year'] = $this -> System_model -> get_academic_year();
        $data['next_academic_year'] = $this -> System_model -> get_next_academic_year();
        $data['previous_academic_year'] = $this -> System_model -> get_previous_academic_year();

        //Get Due date
        $due_date_array = NULL;
        $due_date_array = date('dS F Y', strtotime($this -> Fee_model -> fetch_due_date($data)));
        // Get all links
        $long_link = $pay_link_array['long_link'];
        $short_link = $pay_link_array['short_link']; // Todo - Change later

        $ref_stud_info = $this -> Student_model -> get_student_parent_data($data['school_id'], $refno);

        // Parent Emails
        $email_parent_array = array();
        if (isset($ref_stud_info[0]->father_email_id) && $ref_stud_info[0]->father_email_id != null) {
            $father_email = array(
                        'email' => trim($ref_stud_info[0]->father_email_id),
                        'name'  => $ref_stud_info[0]->father_f_name,
                        'type'  => 'to',
                    );
            array_push($email_parent_array, $father_email);
        }
        if (isset($ref_stud_info[0]->mother_email_id) && $ref_stud_info[0]->mother_email_id != null){
            $mother_email = array(
                        'email' => trim($ref_stud_info[0]->mother_email_id),
                        'name'  => $ref_stud_info[0]->mother_f_name,
                        'type'  => 'to',
                    );
            array_push($email_parent_array, $mother_email);
        }

        // Parent Numbers
        // $parent_mobile_number = array();
        // if (isset($ref_stud_info[0]->father_mobile_no) && $ref_stud_info[0]->father_mobile_no != null) {
        //     array_push($parent_mobile_number, $ref_stud_info[0]->father_mobile_no);
        // }

        // if (isset($ref_stud_info[0]->mother_mobile_no) && $ref_stud_info[0]->mother_mobile_no != null) {
        //     array_push($parent_mobile_number, $ref_stud_info[0]->mother_mobile_no);
        // }
        if($email_parent_array != NULL){
            // Subject & Content & Attachments
            $subject_content = 'Walnut School - Payment Link';
            $attachments = array();
            // $regards = "Regards,<br>The Walnut School Administration Team";
            $regards = "";

            $class_id = $ref_stud_info[0]->admission_to;
            $status   = $ref_stud_info[0]->status;

            if ($status == 6 || $status == 7) 
            {
                $status = '6,7';
            }

            $preview_content_test = $this-> Generic_specific_model -> get_specific_templates($selected_financial_year,$class_id,$status,$data['school_id']);
            if ($preview_content_test == NULL || $preview_content_test == '') 
            {
                echo "Not Present";return;
            }else{
                $preview_content =  $preview_content_test[0]['text'];
                if (strpos($preview_content, '$$refno$$') !== false) 
                {
                    $refno = strtoupper($ref_stud_info[0]->refno);
                    $preview_content = str_replace('$$refno$$', $refno, $preview_content);
                }

                if (strpos($preview_content, '$$first_name$$') !== false) 
                {
                    $stude_f_name = strtoupper($ref_stud_info[0]->first_name);
                    $preview_content = str_replace('$$first_name$$', $stude_f_name, $preview_content);
                }

                if (strpos($preview_content, '$$last_name$$') !== false) 
                {
                    $stude_l_name = strtoupper($ref_stud_info[0]->last_name);
                    $preview_content = str_replace('$$last_name$$', $stude_l_name, $preview_content);
                }

                $main_link = "<a href=".$long_link.">Link</a>";
                if (strpos($preview_content, '$$link$$') !== false)
                {
                    $preview_content = str_replace('$$link$$', $main_link, $preview_content);
                }

                if (strpos($preview_content, '$$templink$$') !== false)
                {
                    $preview_content = str_replace('$$templink$$', $long_link, $preview_content);
                }

                if (strpos($preview_content, '$$inst_count$$') !== false)
                {
                    $preview_content = str_replace('$$inst_count$$', $installment_count, $preview_content);
                }
                
                // Sender Mails
                $email_sender_info = array(
                                            'module_code' => 'FEE_DEPO', 
                                            'school_id' => $_SESSION['school_id'], 
                                            'ref_sch_id' => '0', 
                                            'ref_inst_id' => '0'
                                        );
                $email_sender  = Send_mail_helper::get_sender_data($email_sender_info);
                $email_sender_array = array(
                                            'sender_name'   => isset($email_sender['sender_name'])?$email_sender['sender_name']:'',
                                            'from_email'    => isset($email_sender['from_email'])?$email_sender['from_email']:'',
                                            'school_id'     => $_SESSION['school_id'],
                                            'bcc_email'     => TRUE
                                        );

                // Send E-Mail
                Send_mail_helper::send_mail($email_parent_array, $preview_content, $subject_content, $attachments, $email_sender_array);
            }
        }

        // if($parent_mobile_number != NULL) {
        //     $mobile_number = implode(',',$parent_mobile_number);
        //     if ($mobile_number != NULL && $mobile_number != "") {
        //         $preview_msg_content = 'Pay Walnut Fees using the link : '.$short_link.'##1007162004383038228##**WLTSCL**';
        //         Send_sms_helper::send_sms($mobile_number, $preview_msg_content, array());
        //     }
        // }
    }
```
{{< /details >}}

## view_payplan
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is responsible for displaying the student payplan page. It sets up the necessary data for the page and loads the corresponding view.

{{< details "source code " >}}
```php
public function view_payplan()
    {
        $data['page_data']['page_name'] = 'Student Payplan';
        $data['page_data']['page_icon'] = 'fa fa-exchange';
        $data['page_data']['page_title'] = 'Student Payplan';
        $data['page_data']['page_date'] = date("d M Y");
        $year_array     = array(
                            'previous_year' => $this -> System_model -> get_previous_financial_year(),
                            'financial_year' => $this -> System_model -> get_financial_year(),
                            'next_year' => $this -> System_model -> get_next_financial_year()
                        );
        // $data['financial_year']      = $financial_year;  // Here default year is selected
        $data['main_content'] = array('account/setup/student_pay_plan');
        $this -> load -> view('bootstrap_templates/main_template', $data);
    }
```
{{< /details >}}

## insert_student_payplan
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `insert_student_payplan` function is responsible for inserting payment plans for students. It retrieves the financial years, academic year, and student information from the database. Then, for each student and financial year, it retrieves the pay plan details and installment setup details. Finally, it inserts the payment plan for each installment.

### User Acceptance Criteria
```gherkin
Feature: Insert Student Pay Plan
Scenario: Insert payment plan for students
Given The financial years are retrieved
And The academic year is retrieved
And The student information is fetched
When The pay plan details are retrieved for each student and financial year
And The installment setup details are retrieved for each student and financial year
And The payment plan is inserted for each installment
Then The payment plan is successfully inserted for all students and financial years
```

### Refactoring
1. Extract the retrieval of financial years, academic year, and student information into separate functions.
2. Extract the retrieval of pay plan details and installment setup details into separate functions.
3. Extract the insertion of payment plan for each installment into a separate function.
4. Use meaningful variable names instead of generic names like `data`.
5. Use dependency injection to pass dependencies to the function instead of accessing them directly from the global scope.

{{< details "source code " >}}
```php
function insert_student_payplan(){
        // All Financial years
        $financial_year = $this -> System_model -> get_financial_year();
        $data['all_financial_years'] = array();
        $year_array = array(
                            'previous_year' => $this -> System_model -> get_previous_financial_year(),
                            'financial_year' => $financial_year,
                            'next_year' => $this -> System_model -> get_next_financial_year()
                        );
        // array_push($data['all_financial_years'], $year_array['previous_year']);
        array_push($data['all_financial_years'], $year_array['financial_year']);
        // array_push($data['all_financial_years'], $year_array['next_year']);
        // $data['all_financial_years'] = $year_array;
        $data['financial_year'] = $financial_year;  // Here default year is selected
        $data['academic_year'] = $this -> System_model -> get_academic_year();

        $school_id                       = $_SESSION['school_id'];
        $ref_data_array = array();
        $stud_info_data          = $this-> Student_model -> fetch_statuswise_student_data($school_id);

        foreach ($stud_info_data as $ref_key => $ref_value) 
        {
            foreach ($data['all_financial_years'] as $year_key => $year_value) 
            {
                $refno = $ref_value->refno;
                $continuity_array = $this-> Fee_model ->get_computed_continuity_class($refno, $year_value, $data['academic_year'], NULL, $school_id);
                $class_id = $continuity_array['computed_class'];

                $data['payplan'] = $this-> Fee_model ->get_refno_payplan_details($refno, $class_id, $year_value,'fee', $school_id);
                if($data['payplan'] == 0)
                {
                    echo "Fee Setup not done for" .$year_value;
                }

                $installment_id_array = array();
                $ret_payplan_installment_setup =  $this-> Fee_model ->refno_payplan_installment_details($refno, $year_value, $feeordep = 'fee', $class_id,$school_id);
                if ($ret_payplan_installment_setup != NULL) 
                {
                    foreach ($ret_payplan_installment_setup as $key => $data_value)
                    {
                        $installment_id = array(
                                                'install_id'   => $data_value->install_id,
                                                // 'name_of_installment'    => $data_value->name_of_installment,
                                                'due_date'     => $data_value->due_date,
                                            );
                        array_push($installment_id_array, $installment_id);
                    }
                }else{
                    echo "Installment Setup not done for" .$year_value;
                }
                $data_array = array(
                                    'refno'   => $refno,
                                    'class_id'     => $class_id,
                                    'financial_year' => $year_value,
                                    'payplan_id' => $data['payplan'],
                                    'installment_id_array' => $installment_id_array,
                                    'school_id'=>  $school_id
                                );
                array_push($ref_data_array,$data_array);
            }
        }
            
        $count_info = 0;
        foreach ($ref_data_array as $inst_key => $inst_value) 
        {
           foreach ($inst_value['installment_id_array'] as $key => $value) 
           {
                $data = array(
                    "refno" => $inst_value['refno'],
                    "class_id" => $inst_value['class_id'],
                    "payplan_id" => $inst_value['payplan_id'],
                    "financial_year" => $inst_value['financial_year'],
                    "installment_id"=> $value['install_id'],
                    "due_date"=> $value['due_date'],
                    "school_id" => $inst_value['school_id'],
                    "academic_year" => $data['academic_year']
                   );
                $insert_stud_payplan =  $this -> Fee_model -> insert_student_payment_paln( $data);
                if($insert_stud_payplan)
                {
                    $count_info--;
                }
           }
            $count_info++;
        }
        if($count_info == count($ref_data_array))
        {
            return TRUE;
        }
    }
```
{{< /details >}}

## student_payplan
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `student_payplan` function is responsible for managing all incoming and outgoing credits and debits on the Student Account. It retrieves data related to the student's payplan and displays it on the page.

### Refactoring
1. Extract the code for retrieving financial years into a separate function.
2. Extract the code for retrieving academic years into a separate function.
3. Extract the code for retrieving class names into a separate function.
4. Extract the code for retrieving payplan details into a separate function.
5. Extract the code for retrieving installment details into a separate function.
6. Extract the code for building the data array into a separate function.
7. Consider using a template engine to separate the view logic from the controller logic.

{{< details "source code " >}}
```php
function student_payplan(){
        $data['page_data']['page_name'] = 'Student Payplan';
        $data['page_data']['page_icon'] = 'fa fa-rupee';
        $data['page_data']['page_title'] =  'Student Payplan';
        $data['page_data']['page_date'] = date("d M Y");
        $data['page_data']['page_description'] = 'This module manages all incoming & outgoing credits & debits on the Student Account.';
        $data['page_data']['breadcrumb'] = '<li>Administrator</li><li class="active">Manage Student Account</li>';

        // All Financial years
        $financial_year = $this -> System_model -> get_financial_year();
        $year_array = array(
                            'previous_year' => $this -> System_model -> get_previous_financial_year(),
                            'financial_year' => $financial_year,
                            'next_year' => $this -> System_model -> get_next_financial_year()
                        );
        $data['all_financial_years'] = $year_array;
        $data['financial_year'] = $financial_year;  // Here default year is selected
        $data['academic_year'] = $this -> System_model -> get_academic_year();
        $data['ref_no'] = strtoupper($this->input->post('ref_no'));
        $sel_financial_year = $this->input->post('financial_year');

        $school_id                       = $_SESSION['school_id'];
        $ref_data_array = array();
        $query_student_data = $this-> Student_model -> get_refno_data($data['ref_no']);
        if ($query_student_data != "" || $query_student_data != NULL) 
        {
            foreach ($query_student_data as $ref_value)
            {
                $refno = $ref_value->refno;
                $student_name = $ref_value->first_name." ".$ref_value->last_name;
                $continuity_array = $this-> Fee_model ->get_computed_continuity_class($refno, $sel_financial_year, $data['academic_year'], NULL, $school_id);
                $class_id = $continuity_array['computed_class'];

                $ret_payplan_setup =  $this-> Fee_model ->fetch_student_overall_payplan($refno, $sel_financial_year,$class_id,$school_id);
                if ($ret_payplan_setup != NULL) 
                {
                    foreach ($ret_payplan_setup as $key => $data_value)
                    {
                        $data['class_id'] = $data_value['payment_class_id'];
                        $class_data = $this-> Class_division_model ->get_class_name($data);
                        if($class_data != NULL){
                            $class_name = $class_data->row()->class_name;
                        }

                        $data['payplan_details'] = $this-> Fee_model ->check_pay_plan($data_value['school_id'], $data_value['payplan_id']);
                        if ($data['payplan_details'] != NULL) 
                        {
                            $data['payplan_name'] = $data['payplan_details'][0]['payment_plan'];
                        }

                        $query_installment = $this-> Fee_model ->fetch_installment($data_value['installment_id'],$data_value['school_id']);
                        if ($query_installment != "" || $query_installment != NULL) 
                        {
                            foreach ($query_installment as $rowupdate_installment)
                            {
                                $installment_name  = $rowupdate_installment['name_of_installment'];
                            }
                        }

                        $data_array = array(
                                                'refno'   => $data_value['refno'],
                                                'student_name'    => $student_name,
                                                'class_name'     => $class_name,
                                                'payplan_name' => $data['payplan_name'],
                                                'installment_name' => $installment_name,
                                                'due_date' => $data_value['due_date']
                                            );
                        array_push($ref_data_array,  $data_array);
                    }
                }
            }
        }
        $data['student_payplan_data'] = $ref_data_array;
        $this-> load -> view('account/setup/student_payplan_details', $data);
    }
```
{{< /details >}}

## generate_student_otp
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
This function is used to generate an OTP (One-Time Password) for a student. It first checks if the user is accessing the system from a mobile device or a web browser. Then it collects the necessary information from the user input and generates an OTP using the `Generate_otp_helper` class. If the OTP is successfully generated, it checks if the reference number provided by the user is valid. If it is valid, it retrieves the parent data of the student from the database. It then sends the OTP to the parent's mobile number via SMS and to the parent's email address. Finally, it returns a success or failure message based on the status of the SMS and email sending operations.

### User Acceptance Criteria
```gherkin
Feature: Generate Student OTP

Scenario: Generate OTP for a student
Given The user is accessing the system
When The user provides the reference number and school ID
Then An OTP is generated and sent to the parent's mobile number and email address
```

### Refactoring
1. Extract the logic for checking if the user is accessing the system from a mobile device or a web browser into a separate function.
2. Extract the logic for sending the OTP via SMS and email into separate functions.
3. Use dependency injection to inject the `Generate_otp_helper`, `Send_sms_helper`, and `Send_mail_helper` classes instead of directly instantiating them.
4. Use a configuration file to store the SMS and email templates instead of hardcoding them in the function.
5. Use a logging library to log any errors or exceptions that occur during the OTP generation process.

{{< details "source code " >}}
```php
public function generate_student_otp()
    {
        $generated_otp = NULL;
        $this->load->library('user_agent');
        if ($this->agent->is_mobile()){
            $web_flag = 0;
        } else {
            $web_flag = 1;
        }
        
        $student_info = array(
            "refNo"      => $this->input->post('ref_no'),
            "school_id"  => $this->input->post('school_id'),
            "deviceId"   => $_SERVER['REMOTE_ADDR'],
            "deviceType" => $_SERVER['HTTP_USER_AGENT'],
            "update_data" => NULL,
        );

        $generated_otp = Generate_otp_helper::generate_otp($student_info, $web_flag);
        if($generated_otp != NULL) 
        {
            $ret_refno_check = $this-> Student_model -> get_refno_data($student_info['refNo']); // valid refno

            if ($ret_refno_check != NULL) 
            {
                $ref_no = $student_info['refNo'];
                $stud_parent_data = $this -> Student_model -> get_student_parent_data($student_info['school_id'], $ref_no);
                if ($stud_parent_data != NULL) 
                {
                    // Send SMS
                    $mail_or_sms_no  = $stud_parent_data[0]->student_sms_no;
                    $preview_content = "OTP is ".$generated_otp." for your interaction with Walnut School. Please do not share this OTP with anyone.##1007164154644010534##**WLTSCL**";

                    $sms_sender_array = array();
                    if ($mail_or_sms_no != NULL) {
                        $sms_status = Send_sms_helper::send_sms($mail_or_sms_no, $preview_content, $sms_sender_array);
                    } else {
                        $sms_status = NULL;
                    }
                    // Send EMAIL
                    $all_email_id = array();
                    if (isset($stud_parent_data[0]->father_email_id) && $stud_parent_data[0]->father_email_id!= '') {
                        $email_idf = array('email' => trim($stud_parent_data[0]->father_email_id),
                            'name'                     => $stud_parent_data[0]->father_f_name,
                            'type'                     => 'to',
                        );
                        array_push($all_email_id, $email_idf);
                    }
                    if (isset($stud_parent_data[0]->mother_email_id) && $stud_parent_data[0]->mother_email_id!= '') {
                        $email_idm = array('email' => trim($stud_parent_data[0]->mother_email_id),
                            'name'                     => $stud_parent_data[0]->mother_f_name,
                            'type'                     => 'to',
                        );
                        array_push($all_email_id, $email_idm);
                    }

                    $preview_content ="Your OTP is ".$generated_otp." for your interaction with Walnut School. Please do not share this OTP with anyone.";
                    $subject         = "OTP for Walnut School";
                    $attachments     = array();

                    $email_sender_array = array();

                    if ($all_email_id != NULL && count($all_email_id) > 0) {
                        $email_status = Send_mail_helper::send_mail($all_email_id, $preview_content, $subject, $attachments, $email_sender_array);
                    } else {
                        $email_status = NULL;
                    }

                    if ($sms_status != FALSE && $email_status != FALSE) {
                        echo '0'.'~'.'OTP Sent to your registered Email ID/SMS number!';
                        return;
                    } else {
                       echo '1'.'~'.'OTP Generation Failed!';
                       return;
                    }
                } else {
                    echo '2'.'~'.'OTP Generation Failed!';
                    return;
                }
            } else {
                echo '3'.'~'.'Reference number is invalid';
                return;
            }
        } else {
            echo '4'.'~'.'Something went wrong! Try again.';
            return;
        }
    }
```
{{< /details >}}

## validate_parent_otp
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to validate the parent OTP entered by the user. It calls the `valid_otp` function from the `Generate_otp_helper` class to check if the entered OTP is valid. If the OTP is valid, it returns '1'. If the OTP is invalid, it echoes 'Entered OTP is invalid.' and returns.

### User Acceptance Criteria
```gherkin
Feature: Validate Parent OTP

Scenario: Valid OTP
Given The user has entered a valid OTP
When The parent OTP is validated
Then The function should return '1'

Scenario: Invalid OTP
Given The user has entered an invalid OTP
When The parent OTP is validated
Then The function should echo 'Entered OTP is invalid.' and return
```

{{< details "source code " >}}
```php
public function validate_parent_otp()
    {
        $valid_otp = Generate_otp_helper::valid_otp($_POST['ref_no'], $_POST['school_id'],$_POST['parent_otp']);
        if ($valid_otp === FALSE)
        {
            echo "Entered OTP is invalid.";
            return;
        }else{
            echo "1";return;
        }
    }
```
{{< /details >}}

## send_undertaking_form
{{< complexityLabel "Moderate" >}}{{< /complexityLabel >}}
### Overview
This function is responsible for sending an undertaking form to the parents of a student. It retrieves the parent data from the database based on the school ID and reference number. It then sends an email to the parents with the undertaking form attached.

### User Acceptance Criteria
```gherkin
Feature: Send Undertaking Form
Scenario: Send undertaking form to parents
Given The school ID is [school_id]
And The reference number is [refno]
When The send_undertaking_form function is called
Then An email with the undertaking form is sent to the parents
```

### Refactoring
1. Extract the email sending logic into a separate function for reusability.
2. Use a configuration file to store the email sender information instead of hardcoding it.
3. Use a library or helper function to generate the Google Drive download link instead of concatenating the URL manually.

{{< details "source code " >}}
```php
public function send_undertaking_form($refno, $school_id,$stud_year,$collection_type)
    {
        $data['stud_parent_data'] = $this-> Student_model -> get_student_parent_data($school_id,$refno);
        if ($data['stud_parent_data'] != NULL) 
        {
            // Send EMAIL
            $all_email_id = array();
            if (isset($data['stud_parent_data'][0]->father_email_id) && $data['stud_parent_data'][0]->father_email_id != null) {
                $father_email = array(
                            'email' => trim($data['stud_parent_data'][0]->father_email_id),
                            'name'  => $data['stud_parent_data'][0]->father_f_name,
                            'type'  => 'to',
                        );
                array_push($all_email_id, $father_email);
            }
            if (isset($data['stud_parent_data'][0]->mother_email_id) && $data['stud_parent_data'][0]->mother_email_id != null){
                $mother_email = array(
                            'email' => trim($data['stud_parent_data'][0]->mother_email_id),
                            'name'  => $data['stud_parent_data'][0]->mother_f_name,
                            'type'  => 'to',
                        );
                array_push($all_email_id, $mother_email);
            }

            $email_sender_array = array(
                    'sender_name'  => '',
                    'from_email'   => '',
                    'school_id'    => $school_id,
                    'bcc_email'    => TRUE
                );

            $data['school_id']  = $school_id;
            $data['student_continuity_data'] = $this-> Continuity_form_model -> fetch_undertaking_link_data($refno,$data,$stud_year);
            $temp_class_id      = $data['stud_parent_data'][0]->admission_to;
            $data['status']     = $data['stud_parent_data'][0]->status;
            if ($data['status'] == 6 || $data['status'] == 7) 
            {
                $data['status'] = '6,7';
            }

            $data['academic_year'] = $stud_year;
            $next_financial_year = $this-> System_model ->get_next_financial_year();
            if ($data['academic_year'] == $next_financial_year) 
            {
                if ($data['status'] == 1) 
                {
                    $data['class_id'] = $temp_class_id;
                }else
                {
                    if ($temp_class_id == 19) 
                    {
                        $data['class_id'] = $temp_class_id + 4;
                    }else{
                        $data['class_id'] = $temp_class_id + 1;
                    }
                } 
            }else{
                $data['class_id'] = $temp_class_id;
            }
            $present_file_data     = $this -> Continuity_form_model-> fetch_undertaking_file_data($data);
            $file_id               = $present_file_data[0]->file_id; 
            $data['target_path']   = "https://drive.google.com/uc?id=".$file_id."&export=download";
            $data['collection_type'] = $collection_type;

            $preview_content = $this-> load -> view('student/continuity_form/undertaking_email_content', $data,TRUE);
            $subject         = "Thanks for accepting rules & regulations";
            $attachments     = array();

            if ($all_email_id != NULL && count($all_email_id) > 0) 
            {
                $email_status = Send_mail_helper::send_mail($all_email_id, $preview_content, $subject, $attachments, $email_sender_array);
            } 
        }
    }
```
{{< /details >}}

## save_in_student_app
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to save data in the student app. It takes the reference number, class ID, original preview content, and school ID as parameters. It fetches the school database name based on the school ID. Then it creates an array with the necessary data to be saved in the student app. It replaces double quotes with single quotes in the detail text area. Finally, it inserts the data into the student app database and returns true if successful, false otherwise.

### User Acceptance Criteria
```gherkin
Feature: Save Data in Student App
Scenario: Successful save
Given The reference number is '123'
And The class ID is '456'
And The original preview content is 'Lorem ipsum'
And The school ID is '789'
When I save the data in the student app
Then The function should return true
```

### Refactoring
1. Extract the database name fetching logic into a separate function.
2. Use constants or enums for the 'type', 'priority', and 'starred' values instead of hardcoding them.
3. Move the date formatting logic into a separate function.
4. Consider using prepared statements or an ORM for database operations.

{{< details "source code " >}}
```php
public function save_in_student_app($refno,$class_id,$original_preview_content,$school_id)
    {
        $db_name = $this-> School_model ->fetch_school_db($school_id);

        $data['ref_no']           = $refno;
        $data['class_id']         = $class_id;
        $data['division_id']      = NULL;
        $data['subject_id']       = 'Any Subject';
        $data['unit_id']          = 'Any Unit';
        $data['type']             = 'Notification';
        $data['title']            = 'Welcome to the Walnut Family!';
        $data['desc_area']        = 'Tap to see details';
        $data['issued_by']        = 'Walnut School';
        $data['priority']         = 'Medium';
        $data['starred']          = 'Yes';
        $data['detail_text_area'] = str_replace('"',"'",$original_preview_content);
        $data['detail_link']      = '';
        $data['school_db']        = $db_name;
        $data['created_date']     = date("Y-m-d H:i:s");
        $data['modified_date']    = date("Y-m-d H:i:s");
        $data['msg_tags']         = '';
        $returned_app_data = $this -> Student_app_model -> insert_data($data);
        if ($returned_app_data) 
        {
            return TRUE;
        } else {
            return FALSE;
        }
    }
```
{{< /details >}}

## bulk_date_change
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is responsible for displaying the bulk due date change page. It sets up the necessary data for the page and loads the view template.

{{< details "source code " >}}
```php
public function bulk_date_change()
    {
        $data['page_data']['page_name'] = 'Bulk Due Date Change';
        $data['page_data']['page_icon'] = 'fa fa-envelope';
        $data['page_data']['page_title'] = 'Bulk Due Date Change';
        $data['page_data']['page_date'] = date("d M Y");
        $data['page_data']['page_description'] = 'student profile chnages';
        $data['page_data']['breadcrumb'] = '<li>Administrator</li>  <li class="active">Bulk Due Date Change</li>';
        $data['csv_column_array'] = array();
        $data['main_content'] = array('account/student_account/view_date_change.php');
        $this -> load -> view('bootstrap_templates/main_template', $data);
    }
```
{{< /details >}}

## import_bulk_date_csv
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
This function is used to import bulk data from a CSV file. It reads the CSV file, validates the data, and saves it to the database.

### User Acceptance Criteria
```gherkin
Feature: Import Bulk Data
Scenario: Import CSV File
Given The user has a CSV file
When The user uploads the CSV file
Then The data from the CSV file is imported and saved to the database
```

### Refactoring
1. Extract the file upload logic into a separate function for reusability.
2. Use a library or package to handle CSV file parsing instead of manually parsing the file.
3. Separate the validation logic into a separate function for better code organization.

{{< details "source code " >}}
```php
public function import_bulk_date_csv()
    {
        $data['page_data']['page_name'] = 'Bulk Due Date Change';
        $data['page_data']['page_icon'] = 'fa fa-envelope';
        $data['page_data']['page_title'] = 'Bulk Due Date Change';
        $data['page_data']['page_date'] = date("d M Y");
        $data['page_data']['page_description'] = 'Student info upload by CSV.';
        $data['page_data']['breadcrumb'] = '<li>Administrator</li>  <li class="active">Bulk Due Date Change</li>';
        $school_id  = $_SESSION['school_id'];
        $uploaddir  = $_SESSION['url'] . '/application/uploads/csv/';
        $file_name  = basename($_FILES["bulk_date_creation_csv"]["name"]);
        $uploadfile = $uploaddir . $file_name;
        $ext_header = pathinfo($file_name, PATHINFO_EXTENSION);
        ini_set("max_execution_time", "10000");       

        if ($ext_header != "csv") {
            $this->session->set_userdata('msg', "Error! Only CSV files can be uploaded.");
            redirect("student_account/bulk_date_change");
        } else 
        {
            if (move_uploaded_file($_FILES['bulk_date_creation_csv']['tmp_name'], $uploadfile)) 
            {
                $csvfile = $uploadfile;
                $file    = fopen($csvfile, "r") or die("Problem in opening file");
                $size    = filesize($csvfile);
                if (!$size) {
                    $this->session->set_userdata('msg', "File is empty! Please check.");
                    redirect("bulk_upload/bulk_cancel");
                }
                $csvcontent = fread($file, $size);
                fclose($file);
                $fieldseparator = ",";
                $lineseparator  = "\n";
                $lines          = 0;
                $formdata       = array();
                $csv_column_array = array();
                $csv_data_array = array();
                $row            = 0;
                foreach (explode($lineseparator, $csvcontent) as $line) 
                {
                    $line = trim($line, " \t");
                    $line = str_replace("\r", "", $line);
                    $formdata = str_getcsv($line, $fieldseparator, "\"");

                    // Fetch CSV Columns
                    if ($row == 0) {
                        $m = 0; // Only if row is 0
                        for ($i = 0; $i < count($formdata); $i++){
                            $temp = array();
                            array_push($csv_column_array, $formdata[$i]);
                            array_push($csv_data_array, $temp);
                        }
                        $row++;
                        continue;
                    }
                    // Fetch CSV Data
                    if (count($formdata) > 1) {
                        for ($i = 0; $i < count($formdata); $i++ ) { 
                            $csv_data_array[$i][$m] = $formdata[$i];
                        }
                    }
                    $m++;
                    $row++;
                }
                $struct_data = array();
                for ($j=0; $j < count($csv_data_array[0]); $j++) 
                { 
                    $refno = '';
                    $installment = '';
                    $due_date = '';
                    $academic_year ='';
                    //Refno
                    if($csv_data_array[0][$j] != NULL)
                    {
                        $refno = $csv_data_array[0][$j];
                    }
                    //insatllment
                    if($csv_data_array[1][$j] != NULL)
                    {
                        $installment = $csv_data_array[1][$j];
                    }
                    //due date
                    if($csv_data_array[2][$j] != NULL)
                    {
                        $due_date = $csv_data_array[2][$j];
                    }
                    //academic year
                    if($csv_data_array[3][$j] != NULL)
                    {
                        $academic_year = $csv_data_array[3][$j];
                    }

                    if ($refno == '' || $refno == NULL)
                    {
                        $this->session->set_userdata('msg', "Refno is empty! Please check.");
                        redirect("student_account/bulk_date_change");
                    }
                    if ($installment == '' || $installment == NULL)
                    {
                        $this->session->set_userdata('msg', "Insatllment Name is empty! Please check.");
                        redirect("student_account/bulk_date_change");    
                    }
                    if ($due_date == '' || $due_date == NULL)
                    {
                        $this->session->set_userdata('msg', "Due Date is empty! Please check.");
                        redirect("student_account/bulk_date_change");    
                    }
                    if ($academic_year == '' || $academic_year == NULL)
                    {
                        $this->session->set_userdata('msg', "Academic year is empty! Please check.");
                        redirect("student_account/bulk_date_change");    
                    }
                   
                    array_push($struct_data,
                        array(
                            'refno'   => $refno,
                            'installment'  => $installment,
                            'due_date'   => $due_date,
                            'academic_year'  => $academic_year,
                        )
                    ); 
                }
                if(count($struct_data) > 0)
                {
                    $refno_array = array();
                    for ($i=0; $i < count($struct_data) ; $i++) 
                    { 
                        $data_due['current_academic_year'] = $this -> System_model -> get_academic_year();
                        $data_due['next_academic_year'] = $this -> System_model -> get_next_academic_year();
                        $data_due['previous_academic_year'] = $this -> System_model -> get_previous_academic_year();
                        // Student class according to Financial Year selected
                        $continuity_array = $this-> Fee_model ->get_computed_continuity_class($struct_data[$i]['refno'], $struct_data[$i]['academic_year'], $data_due['current_academic_year'], NULL, $school_id);
                        $computed_class_id = $continuity_array['computed_class'];

                        // Payplan according to selected fin year & computed class
                        $data['payplan'] = $this-> Fee_model ->get_refno_payplan_details($struct_data[$i]['refno'], $computed_class_id, $struct_data[$i]['academic_year'],'fee', $school_id);
                        if($data['payplan'] == 0)
                        {
                            $this->session->set_userdata('msg', "Fee Setup Not Done For Selected Year!");
                        }

                        $data['profile_fee_data'] = $this-> Fee_model ->fetch_fees_profile_details_all($struct_data[$i]['refno'], $school_id,$computed_class_id,$struct_data[$i]['academic_year'],$data['payplan']);
                        if($data['profile_fee_data'] != NULL)
                        {
                            foreach ($data['profile_fee_data'] as $profile_key => $profile_value) 
                            {
                                $data['school_id'] = $profile_value['school_id'];
                                $data['refno'] = $struct_data[$i]['refno'];
                                $data['payplan'] = $profile_value['payplan_id'];
                                $data['class_id'] = $profile_value['class_id'];
                                $data['selected_academic_year'] = $profile_value['financial_year'];
                                $data['selected_school_id'] = $profile_value['fee_sch_id'];
                                $data['selected_inst_id'] = $profile_value['institude_id'];
                                $new_payment_info = array();
                                $profile_data['financial_year'] = $profile_value['financial_year'];
                                $payment_info = json_decode($profile_value['payment_info']);
                                foreach ($payment_info as $pay_key => $pay_value) 
                                {
                                    if($pay_value->name_of_installment == $struct_data[$i]['installment'])
                                    {
                                        if($profile_data['financial_year'] == $data_due['current_academic_year'])
                                        {
                                            $pay_value->due_date = date('Y-m-d H:i:s', strtotime($struct_data[$i]['due_date']));
                                        }else if($profile_data['financial_year'] == $data_due['next_academic_year']){
                                            $pay_value->next_year_due_date = date('Y-m-d H:i:s', strtotime($struct_data[$i]['due_date']));
                                        }else if($profile_data['financial_year'] == $data_due['previous_academic_year']){
                                            $pay_value->previous_year_due_date = date('Y-m-d H:i:s', strtotime($struct_data[$i]['due_date']));
                                        }
                                    }
                                    array_push($new_payment_info,$pay_value);
                                }
                                $data['transfer_info'] = json_encode($new_payment_info);
                                //update fee profile
                                $profile_query = $this-> Fee_model -> update_student_fee_profile($data);
                            }
                        }else{
                            array_push($refno_array,$struct_data[$i]['refno']);
                        }
                    }
                    if(count($refno_array) > 0)
                    {
                        $comma_refno = implode(',', $refno_array);
                        $this->session->set_userdata('msg', "Profile not created for ".$comma_refno);
                        redirect("student_account/bulk_date_change");
                    }
                    $this->session->set_userdata('msg', "File imported successfuly.");
                    redirect("student_account/bulk_date_change");
                }else{
                    $this->session->set_userdata('msg', "Error! Imported data not saved.");
                    redirect("student_account/bulk_date_change");
                }
            }else{
                $this->session->set_userdata('msg', "Cannot upload file!.");
                redirect("student_account/bulk_date_change");    
            }  
        }
        $data['main_content'] = array('student/bulk_upload/view_bulk_cancel.php');
        $this -> load -> view('bootstrap_templates/main_template', $data);
    }
```
{{< /details >}}

## update_profile_due_date
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `update_profile_due_date` function is responsible for updating the due dates of fee profiles for all students in a school. It retrieves the list of reference numbers for all students in the school and then iterates over each reference number to update the fee profiles. For each fee profile, it retrieves the current academic year, next academic year, and previous academic year from the system model. It then computes the continuity class for the student based on the selected financial year and current academic year. Next, it retrieves the payplan details for the reference number, computed class, and financial year. If the payplan details are not found, it displays an error message. If the payplan details are found, it fetches the fee profile details for the reference number, school ID, computed class ID, financial year, and payplan. If the fee profile details are not null, it iterates over each fee profile and updates the payment information by modifying the due dates. Finally, it updates the fee profile in the database.

### User Acceptance Criteria
```gherkin
Feature: Update Profile Due Date

Scenario: Update due dates of fee profiles
Given a school ID
When the update_profile_due_date function is called
Then the due dates of fee profiles for all students in the school are updated
```

### Refactoring
1. Extract the code for updating the payment information into a separate function for better modularity.
2. Use dependency injection to inject the `Student_model`, `System_model`, and `Fee_model` dependencies instead of directly accessing them.
3. Use a try-catch block to handle any exceptions that may occur during the database operations.
4. Use meaningful variable names to improve code readability.

{{< details "source code " >}}
```php
public function update_profile_due_date()
    {
        $school_id = $_SESSION['school_id'];
        $ref_no_list = $this-> Student_model ->get_refno_list($school_id);
        $financial_year = $this -> System_model -> get_financial_year();

        for ($i=0; $i < count($ref_no_list) ; $i++) 
        { 
            $data_due['current_academic_year'] = $this -> System_model -> get_academic_year();
            $data_due['next_academic_year'] = $this -> System_model -> get_next_academic_year();
            $data_due['previous_academic_year'] = $this -> System_model -> get_previous_academic_year();
            // Student class according to Financial Year selected
            $continuity_array = $this-> Fee_model ->get_computed_continuity_class($ref_no_list[$i]['refno'], $financial_year, $data_due['current_academic_year'], NULL, $school_id);
            $computed_class_id = $continuity_array['computed_class'];

            // Payplan according to selected fin year & computed class
            $data['payplan'] = $this-> Fee_model ->get_refno_payplan_details($ref_no_list[$i]['refno'], $computed_class_id, $financial_year,'fee', $school_id);
            if($data['payplan'] == 0)
            {
                echo "Fee Setup Not Done For Selected Year!";return;
            }

            $data['profile_fee_data'] = $this-> Fee_model ->fetch_fees_profile_details_all($ref_no_list[$i]['refno'], $school_id,$computed_class_id,$financial_year,$data['payplan']);
            if($data['profile_fee_data'] != NULL)
            {
                foreach ($data['profile_fee_data'] as $profile_key => $profile_value) 
                {
                    $data['school_id'] = $profile_value['school_id'];
                    $data['refno'] = $ref_no_list[$i]['refno'];
                    $data['payplan'] = $profile_value['payplan_id'];
                    $data['class_id'] = $profile_value['class_id'];
                    $data['selected_academic_year'] = $profile_value['financial_year'];
                    $data['selected_school_id'] = $profile_value['fee_sch_id'];
                    $data['selected_inst_id'] = $profile_value['institude_id'];
                    $new_payment_info = array();
                    $profile_data['financial_year'] = $profile_value['financial_year'];
                    $payment_info = json_decode($profile_value['payment_info']);
                    foreach ($payment_info as $pay_key => $pay_value) 
                    {
                        $query_installment  = $this-> Fee_model -> fetch_installment($pay_value->install_id,$school_id);
                        if ($query_installment != "" || $query_installment != NULL) 
                        {
                            foreach ($query_installment as $rowupdate_installment)
                            {
                                $data['insatllment_name'] = $rowupdate_installment['name_of_installment'];
                                $data['number_instll'] = $rowupdate_installment['installment_number'];
                                $data['due_date'] = $rowupdate_installment['due_date'];
                                $data['previous_year_due_date'] = $rowupdate_installment['previous_year_due_date'];
                                $data['next_year_due_date'] = $rowupdate_installment['next_year_due_date'];
                                $data['no_of_def_days'] = $rowupdate_installment['no_of_def_days'];
                            }
                        }
                        $pay_value->due_date = date('Y-m-d H:i:s', strtotime($data['due_date']));
                        $pay_value->next_year_due_date = date('Y-m-d H:i:s', strtotime($data['next_year_due_date']));
                        $pay_value->previous_year_due_date = date('Y-m-d H:i:s', strtotime($data['previous_year_due_date']));
                        array_push($new_payment_info,$pay_value);
                    }
                    $data['transfer_info'] = json_encode($new_payment_info);
                    //update fee profile
                    $profile_query = $this-> Fee_model -> update_student_fee_profile($data);
                }
            }
        }
    }
```
{{< /details >}}

## Risks & Security Issues
**Code block 1**: 1. Potential performance issues if the defaulter check is performed on a large number of users.
2. Incomplete or incorrect defaulter information may lead to incorrect results.

**__construct**: 

**index**: 

**fetch_student_account**: 1. The function is quite long and complex, which makes it difficult to understand and maintain.
2. There are multiple nested if-else statements, which can lead to potential bugs and errors.
3. The function is tightly coupled with the database queries, which makes it difficult to test and modify.

**check_concession**: 

**fetch_installment_details**: 1. The function assumes that the session contains a 'school_id' value.
2. The function assumes that the input contains 'collection_type', 'ref_no', and 'selected_financial_year' values.
3. The function does not handle errors or exceptions that may occur when calling the models.
4. The function does not have any input validation or sanitization for the input values.
5. The function does not have any error handling or logging for the cases where the view flag is not 'yes', 'payplan', or any other value.



**generate_receipt**: 1. The function does not handle any error cases or exceptions.
2. The function has a high cyclomatic complexity due to the nested if-else statements.
3. The function has a long list of parameters, which can make it difficult to understand and maintain.
4. The function directly accesses the database, which can lead to security vulnerabilities and tight coupling with the database implementation.
5. The function does not have any unit tests, making it difficult to verify its correctness.

**receipt_pdf**: 1. The function does not handle errors or exceptions that may occur during the execution of the code.
2. The function does not have proper input validation and sanitization, which may lead to security vulnerabilities.
3. The function has a high cyclomatic complexity due to the nested if statements, which can make it difficult to understand and maintain.
4. The function has a long list of parameters, which can make it hard to use and test.

**mail_receipt**: 1. The function assumes that the Send_mail_helper class is available and functioning correctly.
2. The function assumes that the Student_model class is available and functioning correctly.
3. The function does not handle any errors or exceptions that may occur during the email sending process.
4. The function does not handle any errors or exceptions that may occur during the fetching of parent emails or the generation of email content and attachments.
5. The function does not handle any errors or exceptions that may occur during the welcome email sending process.
6. The function does not provide any feedback or confirmation to the caller about the success or failure of the email sending process.

**convert_student_status**: 1. The function does not handle errors or exceptions that may occur during database operations.
2. The function does not handle errors or exceptions that may occur during Google Classroom operations.
3. The function does not have any input validation or error handling for invalid input parameters.
4. The function does not have any logging or error reporting mechanism.

**receipt_attachment**: 1. The function assumes that the Dompdf library is located in the 'library/dompdf/autoload.inc.php' file relative to the application's root directory. If the library is moved or renamed, the function will break.
2. The function does not handle any errors that may occur during the PDF generation or file saving process. If an error occurs, it will not be caught or reported.

**welcome_email_service**: 1. The function assumes that the email content is stored in the database and retrieves it directly. This can lead to potential SQL injection vulnerabilities.
2. The function does not handle errors or exceptions that may occur during the email sending process.
3. The function sends the email to a hardcoded email address, which may not be the desired behavior in all cases.
4. The function does not provide any feedback or error messages to the caller, making it difficult to determine if the email was sent successfully or not.

**fetch_transaction_details**: 1. There is a risk of incorrect data retrieval if the database queries for fetching concession and late fee data are not properly constructed.
2. There is a bug where the 'concession_data' array is not properly updated when removing transactions with a total fee head amount of 0.

**fetch_elligible_students**: 1. The function is quite long and complex, which increases the risk of introducing bugs.
2. The function has multiple nested loops, which can make it difficult to understand and maintain.
3. The function has a mix of business logic and database queries, which can make it harder to test and debug.
4. The function uses a mix of array and object syntax, which can lead to confusion and errors.
5. The function does not handle error cases or provide proper error messages.

**fetch_discount_details**: 1. The function is tightly coupled with the Fee_model and Student_model, which may cause issues if these models are modified.
2. The function has a large number of nested if statements, which can make the code difficult to understand and maintain.
3. The function does not handle error cases or exceptions, which may lead to unexpected behavior.

**save_partial_transaction**: 1. The function does not handle errors properly and does not provide meaningful error messages to the user.
2. The function directly accesses the `$_POST` array, which can be a security risk.
3. The function does not validate the input data, which can lead to unexpected behavior or SQL injection attacks.
4. The function does not handle exceptions properly and does not provide proper error handling and logging.

**insert_link_data**: 1. The code does not handle exceptions or errors that may occur during database operations.
2. The code does not have proper error handling and logging mechanisms.
3. The code does not have proper input validation and sanitization, which may lead to security vulnerabilities.
4. The code does not have proper error messages or feedback for the user.

**generate_unique_refno_key**: 1. The function does not handle any exceptions that may occur when generating random bytes.
2. The function does not validate the input parameters before generating the key.

**generate_short_payment_link**: 1. The function assumes that the Bitfly service is always available and returns a valid short link. If the service is down or returns an error, the function will not handle it properly.
2. The function does not validate the input link to ensure it is a valid URL.

**generate_payment_link**: 

**fetch_payment_link**: 

**send_payment_link**: 1. The function does not handle cases where the installment or academic year data is not found in the database.
2. The function does not handle cases where the payment link is not found.
3. The function does not handle cases where the parent email is not provided.
4. The function does not handle cases where the email sending fails.

**view_payplan**: 

**insert_student_payplan**: 1. The function does not handle errors or exceptions that may occur during database operations.
2. The function does not provide any feedback or error messages to the user if the payment plan insertion fails.
3. The function does not have any validation or checks for the retrieved data, which may lead to unexpected behavior or errors.
4. The function does not have any logging or debugging mechanisms to track the execution or identify issues.
5. The function does not have any error handling or rollback mechanism in case of partial failures during payment plan insertion.

**student_payplan**: 1. The function does not handle cases where the query for student data returns an empty result.
2. The function does not handle cases where the query for payplan setup returns an empty result.
3. The function does not handle cases where the query for payplan details returns an empty result.
4. The function does not handle cases where the query for installment details returns an empty result.
5. The function does not handle cases where the query for class names returns an empty result.

**generate_student_otp**: 1. The function does not handle any exceptions that may occur during the OTP generation process.
2. The function does not validate the user input for the reference number and school ID.
3. The function does not handle any errors that may occur during the SMS and email sending operations.
4. The function does not provide any error messages or feedback to the user in case of failures.

**validate_parent_otp**: 

**send_undertaking_form**: 1. The function assumes that the parent data exists in the database, which may not always be the case.
2. The function does not handle any errors that may occur during the email sending process.
3. The function does not provide any feedback or confirmation to the caller about the success or failure of the email sending process.

**save_in_student_app**: 1. The function does not handle any exceptions or errors that may occur during database operations.
2. The function does not validate the input parameters.
3. The function does not have any error logging or error reporting mechanism.

**bulk_date_change**: 

**import_bulk_date_csv**: 1. The function does not handle errors or exceptions properly, which can lead to unexpected behavior.
2. The function does not have proper input validation, which can lead to security vulnerabilities.
3. The function does not have proper error handling and reporting, which can make it difficult to debug issues.

**update_profile_due_date**: 1. The function assumes that the session variable `school_id` is set, which may not always be the case.
2. The function does not handle any exceptions that may occur during the database operations, which could lead to unexpected behavior.
3. The function does not provide any feedback or error handling if the update operation fails.

