+++
categories = ["Documentation"]
title = "Collection_controller.php"
+++

## File Summary

- **File Path:** application\controllers\account\Collection_controller.php
- **LOC:** 1812
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
 * @author Gautam
 */
require_once(APPPATH.'controllers/account/Defaulter_check_controller.php');
class Collection_controller extends Defaulter_check_controller
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
		$this->load->model('account/Deposit_model');
        $this->load->model('account/Deposit_refund_model');
        $this->load->model('common/Employee_model');
        $this->load->model('student/Student_welcome_email_model');
        $this->load->model('school_cmap/Classroom_model');
        $this->load->library('Google_login');
        $this->load->library('Google_classroom');
        $this->load->model('student/Continuity_form_model');
        $this->load->model('mobile/Student_app_model');
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
	function index($collection_type = 'fee'){
        // Main parameter differentiating fees && deposits
        $data['collection_type'] = $collection_type;

		$data['page_data']['page_name'] = ucfirst($collection_type).' Collection';
        $data['page_data']['page_icon'] = 'fa fa-exchange';
        $data['page_data']['page_title'] = ucfirst($collection_type).' Collection';
		$data['page_data']['page_date'] = date("d M Y");
        $data['page_data']['page_description'] = 'This module manages movement of Collection for fees & deposits';
        $data['page_data']['breadcrumb'] = '<li>Administrator</li><li class="active">Manage Collection ('.ucfirst($collection_type).')</li>';

        $data['main_content'] = array('account/collection/landing_view');
	    $this -> load -> view('bootstrap_templates/main_template', $data);
	}

    /**
     * Ajax - Student details view based on refno
     * Financial Year
     * 
     * @return view
     */
	function fetch_student_details(){
		$school_id = $_SESSION['school_id'];

		$data['collection_type'] = $this->input->post('collection_type');
		$data['ref_no'] = strtoupper($this->input->post('ref_no'));

		// Student data
		$data['full_name'] = $this-> Student_model ->get_refno_fullname($data['ref_no'], $school_id);
		$data['class_name'] = $this-> Student_model ->get_refno_classname($data['ref_no'], $school_id);
		$data['div_name'] = $this-> Student_model ->get_refno_divname($data['ref_no']);

		if ($data['full_name'] == '') {
			echo '';return;
		}

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

        // If academic year && financial year do not match => Default is Next Year
        // If academic year && financial year match => Default is Current Year
        if ($data['academic_year'] == $financial_year) {
            $data['default_selected_year'] = $financial_year;
        } else {
            $data['default_selected_year'] = $year_array['next_year'];
        }
        if($data['collection_type'] == 'fee')
        {
            $data['fee_or_dep'] = array(
                            'fee' => 'Fee',
                            'exam'=>'Exam Fee'
                        );
        }else{
            $data['fee_or_dep'] = array(
                            'dep' => 'Deposit'
                        );
        }
        
         // Payplan Info
        $ret_payplan_data = $this -> Fee_model -> fetch_all_payplan($school_id);
        if ($ret_payplan_data != null || $ret_payplan_data != '') {
            $data['payplan_info'] = $ret_payplan_data;
        } else {
            $data['payplan_info'] = NULL;
        }
		$this-> load -> view('account/collection/student_view', $data);
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
        $student_admission_year =  $this-> Student_model ->fetch_student_specific_info($ref_no, $school_id, 'academic_year');
        if($collection_type == 'dep' && $student_admission_year != $selected_financial_year)
        {
           $selected_financial_year = $student_admission_year;
        }

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
            echo $data['payplan_name'].'~'.$student_admission_year;return;
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
     * Entity details view based on refno, year, installment
     * Returns all the entities & its payment structure towards which payment is to be done
     * @return view
     */
	function fetch_entity_details(){
		$data['school_id'] = $_SESSION['school_id'];
		$data['academic_year'] = $this -> System_model -> get_academic_year();

		$data['collection_type'] = $this->input->post('collection_type');
		$data['ref_no'] = strtoupper($this->input->post('ref_no'));
		$data['selected_financial_year'] = $this->input->post('selected_financial_year');
		$data['selected_installment_id'] = $this->input->post('selected_installment_id');
		$data['payplan_id'] = $this->input->post('payplan_id');
        $student_admission_year =  $this-> Student_model ->fetch_student_specific_info($data['ref_no'], $data['school_id'], 'academic_year');
        if ($data['collection_type'] =='dep') 
        {
            $data['yearly_heads'] = $this -> Fee_model -> fetch_fees_details($data['ref_no'], $data['school_id'], $student_admission_year, $data['collection_type'], $data['selected_installment_id'], $data['payplan_id']);
        }else
        {
		  $data['yearly_heads'] = $this -> Fee_model -> fetch_fees_details($data['ref_no'], $data['school_id'], $data['selected_financial_year'], $data['collection_type'], $data['selected_installment_id'], $data['payplan_id']);
        }
		if($data['yearly_heads'] == NULL){
			return FALSE;
		} else {
			$this-> load -> view('account/collection/entity_view', $data);
		}
	}

    /**
     * Transaction details view based selected tab
     * 
     * @return view
     */
	function fetch_transaction_details(){
		$data['session_school_id'] = $_SESSION['school_id'];
        $data['user_name'] = $_SESSION['emp_id'];
		$data['academic_year'] = $this -> System_model -> get_academic_year();
        $data['financial_year'] = $this -> System_model -> get_financial_year();

		$data['collection_type'] = $this->input->post('collection_type');
		$data['ref_no'] = strtoupper($this->input->post('ref_no'));
		$data['selected_financial_year'] = $this->input->post('selected_financial_year');
		$data['selected_installment_id'] = $this->input->post('selected_installment_id');
		$data['payplan_id'] = $this->input->post('payplan_id');
		$data['saved_key'] = json_decode($this->input->post('saved_key'));
		$data['tab_mode'] = $this->input->post('tab_mode'); // For receipt history
        $data['defaulter_check'] = '';
        $student_admission_year =  $this-> Student_model ->fetch_student_specific_info($data['ref_no'], $data['session_school_id'], 'academic_year');

        $data['school_id'] = $data['session_school_id'];
        $continuity_result = $this-> Continuity_form_model -> fetch_undertaking_link_data($data['ref_no'],$data,$data['selected_financial_year']);
        if ($continuity_result != NULL) 
        {
            $data['confirm_status'] = $continuity_result->link_status;
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
        $data['academic_year'] = $data['selected_financial_year'];
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
        $data['dep_flag']      = $present_file_data[0]->dep_flag;

        if ($student_admission_year > $data['selected_financial_year'] && $student_admission_year >= $data['academic_year']) 
        {
            $data['defaulter_check'] = 'Not Applicable';
        }else
        {
            $defaulter_check = $this->check_student_defaulter($data);
            if($defaulter_check != 0)
            {
                $res_fee_check = explode("~",$defaulter_check);
                if($res_fee_check[0] != $data['selected_installment_id'] || $res_fee_check[1] != $data['selected_financial_year'])
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
        
        // Yearly Heads
        if ($data['collection_type'] =='dep')
        {
             // Already paid transactions
            $data['transaction_history'] = $this-> Fee_model ->fetch_transaction_history($data['ref_no'], $student_admission_year, $data['payplan_id'], $data['selected_installment_id'], $data['session_school_id'], 0, 0, $data['collection_type']);

            $data['yearly_heads'] = $this -> Fee_model -> fetch_fees_details($data['ref_no'], $data['session_school_id'], $student_admission_year,$data['collection_type'], $data['selected_installment_id'], $data['payplan_id']);
        }else
        {
            // Already paid transactions
            $data['transaction_history'] = $this-> Fee_model ->fetch_transaction_history($data['ref_no'], $data['selected_financial_year'], $data['payplan_id'], $data['selected_installment_id'], $data['session_school_id'], 0, 0, $data['collection_type']);


            $data['yearly_heads'] = $this -> Fee_model -> fetch_fees_details($data['ref_no'], $data['session_school_id'], $data['selected_financial_year'],$data['collection_type'], $data['selected_installment_id'], $data['payplan_id']);
        }

        if($data['yearly_heads'] == NULL){
            return FALSE;
        }

        // Concession
        $data['concession_details'] = $this-> Fee_model ->refno_installment_concession_details($data['ref_no'], $data['session_school_id'], $data['collection_type'], $data['selected_financial_year'], $data['selected_installment_id'],'collection');

        // Todo - Late Payment

		if($data['tab_mode'] === 'history_tab'){
			$this-> load -> view('account/collection/receipt_history', $data);
		} else if($data['tab_mode'] === 'refund_tab'){
            $data['user_role'] = $_SESSION['user_role'];

            $data['current_class_id'] = $this-> Student_model ->get_refno_classid($data['ref_no'], $data['session_school_id']);
            $data['status'] = $this-> Student_model ->fetch_student_specific_info($data['ref_no'], $data['session_school_id'], 'status');
            $data['refund_data'] = $this-> Deposit_refund_model ->check_refno_present($data['ref_no'], $data['session_school_id']);

            $this-> load -> view('account/collection/refund_view', $data);
        } else {
            // Already paid checks
            if($data['transaction_history'] != NULL && $data['yearly_heads'] != NULL) {
                foreach ($data['yearly_heads'] as $yearly_key => $yearly_value) {
                    foreach ($data['transaction_history'] as $tran_key => $tran_value) {
                        $exculsive_check = FALSE;
                        if($data['collection_type'] == 'fee' || $data['collection_type'] == 'exam') { // Checking for ref ids avoided becoz of historical reasons
                            if($tran_value['fees_paid_year'] == $yearly_value->financial_year && $tran_value['installment_id'] == $yearly_value->instl_no && $tran_value['class_id'] == $yearly_value->class_id && $tran_value['fee_head_id'] == $yearly_value->fee_head_id) //&& $tran_value['chq_amt'] == $yearly_value->fee_head_amt
                            {
                                $exculsive_check = TRUE;
                            }
                        } else 
                        {
                            if ($data['concession_details'] != NULL) 
                            {
                                foreach ($data['concession_details'] as $conces_key => $conc_row) 
                                {
                                    if(($yearly_value->fee_head_id == $conc_row->fee_head_id) && ($tran_value['institude_id'] == $conc_row->fee_ref_inst_id))
                                    {
                                        $exculsive_check = TRUE; 
                                    }else {
                                        if ($tran_value['chq_amt'] == $yearly_value->fee_head_amt) 
                                        {
                                            $exculsive_check = TRUE; 
                                        }
                                    }
                                }
                            } else {
                                if ($tran_value['chq_amt'] == $yearly_value->fee_head_amt) 
                                {
                                    $exculsive_check = TRUE; // Deposit entry present in history then mark PAID (as paid only once throughout)
                                }
                            }
                        }
                        if($exculsive_check) {
                            $yearly_value->is_paid = TRUE; // Set paid as 1 for the index
                            $yearly_value->paid_data = $this-> Fee_model ->fetch_payment_mode_refno($data['ref_no'], $data['selected_financial_year'], $data['payplan_id'], $data['selected_installment_id'], $data['session_school_id'], $yearly_value->fee_ref_school_id, $yearly_value->fee_ref_inst_id,$data['collection_type']);
                        }
                    }
                }
            }

            $data['payment_modes'] = $this-> Fee_model ->fetch_payment_modes('all');
			$data['bank_details'] = $this-> Fee_model ->fetch_banks();
			$this-> load -> view('account/collection/transaction_view', $data);
		}
	}

    /**
     * ******** Save Payment Transaction ********
     * 
     * @return
     */
	function save_transaction($api_call = 0){
        // Converting to booleans
        if($api_call == 0 || $api_call == '0'){
            $api_call = FALSE;
        } else {
            $api_call = TRUE;
        }

        if($api_call) {
            $json_response = json_decode(file_get_contents('php://input'), TRUE);
            $payment_data  = (object)$json_response['payment_data_json'];
            // $partial_id_array = $json_response['partial_id_array'];
            $is_mobile     = $payment_data->is_mobile;
        } else {
            $payment_data = json_decode($this->input->post('payment_data_json'));
            $is_mobile    = $this->is_mobile();
            // $partial_id_array = array();
        }
        
		$ref_no                   = strtoupper($payment_data->ref_no);
		$collection_type          = $payment_data->collection_type;
		$payment_class_id         = $payment_data->payment_class_id;
		$selected_installment_id  = $payment_data->selected_installment_id;
		$selected_financial_year  = $payment_data->selected_financial_year;
		$payplan_id               = (int)$payment_data->payplan_id;
		$head_data                = json_decode($payment_data->head_data);
		$yearly_setup_id          = $payment_data->yearly_setup_id;
		$ref_school_id            = (int)$payment_data->ref_school_id;
		$ref_institute_id         = (int)$payment_data->ref_institute_id;
        $session_school_id        = (int)$payment_data->session_school_id;
        $user_name                = $payment_data->user_name;
		$payment_details          = (object)$payment_data->payment_details;
        $accept_status            = $this->input->post('accept_status');
        $parent_otp               = $this->input->post('parent_otp');
        $stud_class_id            = $this->input->post('stud_class_id');

 		$late_payment_data = NULL; // Todo - Late fee  flag & late fee amount (will come from UI)

        $academic_year = $this -> System_model -> get_academic_year();
        $transaction_id = 0;

        // Get actual deposit refunt amount for refund calculation
        $ret_refund_data = $this-> Fee_model->get_refund_data($payment_class_id,$selected_financial_year,$head_data[0]->head_id,$session_school_id);
        $refund_amt = $ret_refund_data[0]->refund_amount;

 		// Already Paid Check
 		$paid_status = $this-> Fee_model ->check_paid_unpaid($ref_no, $selected_financial_year, $payplan_id, $selected_installment_id, $session_school_id, $ref_school_id, $ref_institute_id,$collection_type);
        if($paid_status != NULL) {
            echo -3;return;
        } else {
            $this->load->model('account/Receipt_model');
    		$transaction_id = $this-> Receipt_model ->save_transaction($session_school_id, $academic_year, $selected_financial_year, $user_name, $selected_installment_id, $payplan_id, $head_data, $yearly_setup_id, $ref_school_id, $ref_institute_id,$collection_type, $late_payment_data, $ref_no, $payment_class_id, $payment_details,$refund_amt);

            // Errors
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
        // if(count($partial_id_array) > 0)
        // {
        //     $paid_status_update = $this -> Fee_model -> update_student_partial_paid_status($partial_id_array,$ref_no,$session_school_id);
        // }

        // To save undertaking form accept data
        if ($collection_type == 'fee') 
        {
            if ($accept_status == 2) 
            {
                $data['school_id']          = $session_school_id;
                $data['refno']              = $ref_no;
                $data['class_id']           = $stud_class_id;
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
        }else{
            if ($accept_status == 2) 
            {
                $data['school_id']          = $session_school_id;
                $data['refno']              = $ref_no;
                $data['class_id']           = $stud_class_id;
                $data['academic_year']      = $selected_financial_year;
                $data['dep_link_status']    = $accept_status;
                $data['dep_otp']            = $parent_otp;
                $data['dep_link_response']  = 'YES';
                $data['dep_link_reason']    = 'Accepted while paying deposit in school';
                $data['dep_submitted_date'] = date("Y-m-d h:i:s");
                if ($_SERVER['HTTP_HOST'] == 'localhost') 
                {
                    $data['dep_user_ip']    = '192.168.1.2'; // TODO remove temp IP address - - Locally it returns ::1    
                } else 
                {
                    $data['dep_user_ip']    = $_SERVER['REMOTE_ADDR']; // Client IP address 
                }
                $data['dep_useragent']      = $_SERVER['HTTP_USER_AGENT'];
                $data['link_response']      = NULL;
                $data['useragent']          = NULL;
                $data['link_status']        = NULL;
                $data['user_ip']            = NULL;
                $data['link_reason']        = NULL;
                $data['parent_otp']                = NULL;
                $data['submitted_date']     = NULL;
                
                $continuity_result = $this-> Continuity_form_model -> fetch_undertaking_link_data($ref_no,$data,$selected_financial_year);
                if ($continuity_result != NULL) 
                {
                    $data['link_response']     = $continuity_result->link_response;
                    $data['useragent']         = $continuity_result->user_name;
                    $data['link_status']       = $continuity_result->link_status;
                    $data['user_ip']           = $continuity_result->ip_address;
                    $data['link_reason']       = $continuity_result->link_reason;
                    $data['parent_otp']        = $continuity_result->parent_otp;
                    $data['submitted_date']    = $continuity_result->submitted_date;
                    $result = $this-> Continuity_form_model ->update_continuity_info($data);
                }else{
                    $result = $this-> Continuity_form_model ->save_continuity_data($data);
                }
                if ($continuity_result->dep_link_status != 2) 
                {
                    $this->send_undertaking_form($ref_no, $session_school_id,$selected_financial_year,$collection_type);
                }
            }
        }
        if($collection_type != 'exam')
        {
            // Student status change
            $this->convert_student_status($ref_no, $selected_financial_year, $payplan_id, $selected_installment_id, $collection_type, $session_school_id);
        }

		// Send data to show receipts
        if($api_call) {
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
        echo $this->generate_receipt_link(0, 0, $receipt_json);return;
        }else{
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
                                        'head_data'          => $head_data[0]->head_id
                                 )
                             );
            echo $this->generate_receipt(0, 0, $receipt_json);return;
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
            $is_mobile     = $this->is_mobile();    
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
        $is_mgr_call        = FALSE;
        $head_data          = $receipt_array->head_data;
        if ($is_duplicate && !$api_call) 
        {
            $is_mgr_call    = TRUE;
        }
        
        $is_mail            = $receipt_array->is_mail;

        $school_code_header = $this-> School_model ->get_school_code($session_school_id);

        // Getting Information about transaction history
        $transaction_data = $this-> Fee_model ->fetch_transaction_history($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id, $collection_type);

        if ($transaction_data != "" || $transaction_data != NULL) {
            $payment_data = $this-> Fee_model ->fetch_payment_mode_refno($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id,$collection_type);
            if ($payment_data != "" || $payment_data != NULL) {
                $transaction_history = array(
                                                'ref_no'            => $ref_no,
                                                'payment_class_id'  => $payment_class_id,
                                                'ref_institute_id'  => $ref_institute_id,
                                                'ref_school_id'     => $ref_school_id,
                                                'school_code'       => $school_code_header,
                                                'transaction_data'  => $transaction_data,
                                                'payment_data'      => $payment_data
                                            );
                // Total Amount
                $total_amount = 0;
                $count = count($transaction_history['transaction_data']);

                // Fee Heads
                for ($i=0; $i < $count; $i++) { 
                    $total_amount = $total_amount + $transaction_history['transaction_data'][$i]['chq_amt'];
                }

                // Convenience Amount
                $total_convenience_amt = 0;
                $count = count($transaction_history['payment_data']);
                for ($i=0; $i < $count; $i++) { 
                    $total_convenience_amt = $total_convenience_amt + $transaction_history['payment_data'][$i]['conven_amt'];
                }

                $total_amount = $total_amount + $total_convenience_amt;

                $ret_refund_data = $this-> Fee_model->get_refund_data($payment_class_id,$financial_year,$head_data,$session_school_id);
                $ret_refund_flag = $ret_refund_data[0]->refund_flag;
                $deposit_refund_year = 0;
                if($ret_refund_flag== 1) {
                    $ret_refund_year_month = $this-> Deposit_refund_model ->get_date_of_refund($financial_year, $payment_class_id, $installment_id, $session_school_id,$head_data);
                    $deposit_refund_year = $ret_refund_year_month[0]->june_year;
                }

                $receipt_pdf_name = $this->receipt_pdf($ref_no, $transaction_history, $total_amount, $ref_institute_id, $ref_school_id, $session_school_id, $collection_type, $receipt_letterhead, $is_duplicate, $is_mail, $financial_year, $deposit_refund_year, $is_mobile, $is_mgr_call, $payment_class_id,$ret_refund_flag);
                $invoice_path = APP_WEB_URL.'/application/uploads/collection_receipts/'.$receipt_pdf_name;
                if($return){
                	echo $receipt_pdf_name;return;
                } else {
                	return $receipt_pdf_name;
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
    public function receipt_pdf($ref_no, $transaction_history, $total_amount, $ref_institute_id, $ref_school_id, $session_school_id, $collection_type, $receipt_letterhead, $is_duplicate, $is_mail, $financial_year, $deposit_refund_year, $is_mobile, $is_mgr_call, $payment_class_id,$ret_refund_flag)
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
                        'header_img'          => $header_img
                    );
        if ($ret_refund_flag == 1) {  // Deposit
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
            // $output_attach = '';
            $attachments = $attachment_array['attachemt_array'];
        // }

        $subject_content = 'Receipt from Walnut School';
        $regards = "Regards,<br>The Walnut School Administration Team";
        $preview_content = 'Dear Sir/Madam,<br><br> Please find the receipt for the '.ucwords($collection_type).' amounting to Rs. '.number_format($total_amount).' attached with this mail. Kindly keep this mail for your reference. Please do not reply to this mail address - as this mail has been sent from an automated system.<br><br>'.$output_attach;

        $email_sender_info = array('module_code' => 'FEE_DEPO', 'school_id' => $session_school_id, 'ref_sch_id' => $ref_school_id, 'ref_inst_id' => $ref_institute_id);
        $email_sender = Send_mail_helper::get_sender_data($email_sender_info);
        $email_sender_array = array( 
                                        'sender_name' => isset($email_sender['sender_name'])?$email_sender['sender_name']:'',
                                        'from_email'  => isset($email_sender['from_email'])?$email_sender['from_email']:'',
                                        'school_id'   => $session_school_id,
                                        'bcc_email'   => TRUE
                                    );

        if(!empty($email_parent_array)){
            Send_mail_helper::send_mail($email_parent_array, $preview_content, $subject_content, $attachments, $email_sender_array);
        }

        if ($collection_type == 'dep' && !$is_duplicate) 
        {
            $email_flag = $this-> Fee_model -> fetch_welcome_email_flag($ref_no, $session_school_id);
            if ($email_flag == NULL) 
            {
                // Send welcome emails
                $this->welcome_email_service($email_parent_array, $session_school_id, $ref_school_id, $ref_institute_id, $ref_no, $payment_class_id);
            }
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
        } else {
            return 0;
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
        if($yearly_heads == NULL){
            return -2;
        }

        $passed_due_flag = 0;
        foreach ($yearly_heads as $yearly_key => $yearly_value) { // For case 1 & 2
            $paid_row = $this-> Fee_model -> check_paid_unpaid($ref_no, $yearly_value->financial_year, $payplan_id, $yearly_value->instl_no, $session_school_id, $yearly_value->fee_ref_school_id, $yearly_value->fee_ref_inst_id,$collection_type);
            if($paid_row == NULL) {
                // Concessions & RTE
                $concession_details = $this-> Fee_model ->refno_installment_concession_details($ref_no, $session_school_id, $collection_type, $selected_financial_year, $yearly_value->instl_no,'collection');
                if($concession_details != NULL){
                    foreach ($concession_details as $conces_key => $conc_row) {
                        // Normal student concession check
                        if(($yearly_value->fee_ref_school_id == $conc_row->fee_ref_school_id) && ($yearly_value->fee_ref_inst_id == $conc_row->fee_ref_inst_id) && ($yearly_value->fee_head_id == $conc_row->fee_head_id) && ($yearly_value->financial_year == $conc_row->academic_year)) {
                            $passed_due_flag++;
                            break;
                        }
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
        if($yearly_heads == NULL){
            return -2;
        }

        $passed_due_flag = 0;
        foreach ($yearly_heads as $yearly_key => $yearly_value) { // For case 1 & 2
            $paid_row = $this-> Fee_model ->check_paid_unpaid_status_change($ref_no, $yearly_value->financial_year, $payplan_id, $yearly_value->install_id, $session_school_id, $yearly_value->fee_ref_school_id, $yearly_value->fee_ref_inst_id, $yearly_value->fee_head_id,$collection_type);
            if($paid_row == NULL) {
                // Concessions & RTE
                $concession_details = $this-> Fee_model ->refno_installment_concession_details_status_change($ref_no, $session_school_id, $collection_type, $selected_financial_year, $yearly_value->install_id, $yearly_value->fee_head_id);
                if($concession_details != NULL){
                    foreach ($concession_details as $conces_key => $conc_row) {
                        // Normal student concession check
                        if(($yearly_value->fee_ref_school_id == $conc_row->fee_ref_school_id) && ($yearly_value->fee_ref_inst_id == $conc_row->fee_ref_inst_id) && ($yearly_value->fee_head_id == $conc_row->fee_head_id) && ($yearly_value->financial_year == $conc_row->academic_year)) {
                            $passed_due_flag++;
                            break;
                        }
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
                return 1;
            } else {
                return -1;
            }
        } else {
            return 0;
        }
    }

    public function is_mobile()
    {
        $useragent = $_SERVER['HTTP_USER_AGENT'];
        if(preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i',$useragent)||preg_match('/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i',substr($useragent,0,4)))
        { 
            $mobile = TRUE;//mobile
        }
        else{
            $mobile = FALSE;//web
        }
        return $mobile;
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
        $ret_welcome_email_data = $this-> Student_welcome_email_model->check_welcome_email_data($session_school_id);

        $preview_content_welcome = $ret_welcome_email_data[0]->email_content;

        $data['ref_no']      = $ref_no;
        $ret_student_account = $this-> Student_model ->get_student_account_details($ref_no,$session_school_id);

        $data['user_email']    = strtolower($ret_student_account[0]->user_email);
        $data['user_password'] = $ret_student_account[0]->user_password;
     
        $data['student_first_name']   = $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'first_name');
        $data['student_app_password'] = $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'web_password');
        $data['student_web_password'] = $this -> School_model -> get_walmiki_password($session_school_id);
        $data['principal_name']       = $this-> Employee_model->get_staff_name_info($ret_welcome_email_data[0]->principal);
        $data['admin_in_charge']      = $this-> Employee_model->get_staff_name_info($ret_welcome_email_data[0]->admin_in_charge);

        $transport_provider_data      = $ret_welcome_email_data[0]->transport_provider;
        $transport_number_data        = $ret_welcome_email_data[0]->transport_number;
        $data['transport_provider']   = $transport_provider_data." (".$transport_number_data.")";

        $canteen_provider             = $ret_welcome_email_data[0]->canteen_provider;
        $data['canteen_provider']     = $canteen_provider." (".$ret_welcome_email_data[0]->canteen_number.")";
        
        $data['vice_principal']       = $this-> Employee_model->get_staff_name_info($ret_welcome_email_data[0]->vice_principal);
        $data['coordinator']          = $this-> Employee_model->get_staff_name_info($ret_welcome_email_data[0]->coordinator);
        
  
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
            $preview_content_welcome = str_replace('$$user_email$$', $data['user_email'], $preview_content_welcome);
        }

       if (strpos($preview_content_welcome, '$$user_password$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$user_password$$', $data['student_web_password'], $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$user_app_password$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$user_app_password$$', $data['user_password'], $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$principal$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$principal$$', $data['principal_name'], $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$admin_in_charge$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$admin_in_charge$$', $data['admin_in_charge'], $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$transport_provider$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$transport_provider$$', $data['transport_provider'], $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$canteen_provider$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$canteen_provider$$', $data['canteen_provider'], $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$vice_principal$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$vice_principal$$', $data['vice_principal'], $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$coordinator$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$coordinator$$', $data['coordinator'], $preview_content_welcome);
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

        if(!empty($email_parent_array))
        {
            $mail_sent = Send_mail_helper::send_mail($email_parent_array, $preview_content_welcome, $subject_content_welcome, $attachments_welcome, $email_sender_array_welcome);
            $email_result = $this-> Fee_model-> insert_walcome_email_content($ref_no, $session_school_id,$mail_sent);
            $send_content_to_app_result = $this -> save_in_student_app($ref_no, $payment_class_id, $preview_content_welcome,$session_school_id);
            $send_welcome_notification_result = $this -> send_welcome_notification($ref_no, $payment_class_id,$session_school_id);
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

    //         $data['student_web_password']  = $this -> School_model -> get_walmiki_password($session_school_id);
    //         $data['admin_query']           = " in case of any administration related queries.";
    //         $data['appointment']           = "If you wish to get an appointment with any of the above mentioned people, you would need to talk to <b>".$contact_person."</b>";

    //         return $this -> load -> view('account/collection/welcome_email_content', $data, TRUE);
    //     }
    // }

    // Added new functinality to resend a welcome email.
    public function fetch_deposit_details()
    {
        $ref_no             = $this->input->post('refno');
        $session_school_id  = $_SESSION['school_id'];
        $email_parent_array = array();
        $parent_emails = $this-> Student_model ->get_parent_emails($session_school_id, $ref_no);
        if ($parent_emails != NULL) 
        {
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

        $result = $this-> Fee_model ->fetch_trahistory_details($ref_no, NULL ,'dep', $session_school_id);
        if ($result != NULL) 
        {
            $ref_institute_id  = $result[0]['institude_id'];
            $ref_school_id     = $result[0]['school_id'];
            $payment_class_id  = $result[0]['class_id'];
            echo $sent_email = $this->welcome_email_service($email_parent_array, $session_school_id, $ref_school_id, $ref_institute_id, $ref_no, $payment_class_id);return;
        }else 
        {
            $concession_details = $this-> Fee_model ->check_concession_present($ref_no,$session_school_id);
            if ($concession_details != NULL) 
            {
                $ref_institute_id  = $concession_details[0]['fee_ref_inst_id'];
                $ref_school_id     = $concession_details[0]['fee_ref_school_id'];
                $payment_class_id  = $concession_details[0]['class_id'];
                echo $sent_email = $this->welcome_email_service($email_parent_array, $session_school_id, $ref_school_id, $ref_institute_id, $ref_no, $payment_class_id);return;
            }
        }
    }

    /**
     * Receipt Generation
     * Fee & Deposits
     * Arguments => 1. is it api call(pay) , 2. return or echo , 3. passed receipt json
     * Invocations => 1. Normal Receipt(Arg), 2. Duplicate Receipt(API), 3. Payment Gateway(API)
     * @return string
     */
    public function generate_receipt_link($api_call = 0, $return = 0, $receipt_json = NULL)
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
            $fee_head_details = $this-> Fee_model ->fetch_head_details($receipt_array->session_school_id, $receipt_array->ref_no, $receipt_array->transaction_id,$receipt_array->ref_school_id, $receipt_array->ref_institute_id,$receipt_array->financial_year,$receipt_array->installment_id,$receipt_array->payplan_id);
            $head_data_array = array();
            foreach ($fee_head_details as $head_key => $head_value) 
            {
                $total_discount = 0;
                $late_fee = 0;
                $discount = 0;
                $discount_type = '';
                $referral_discount = 0;
                $payplan_discount = 0;
                $data['concession_data'] = $this-> Fee_model ->concession_data_all($receipt_array->ref_no, $receipt_array->session_school_id, $receipt_array->payment_class_id, $receipt_array->financial_year);
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
        } else {
            $receipt_array = json_decode($this->input->post('receipt_json'));
            $is_mobile     = $this->is_mobile();    
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
        $is_mgr_call        = FALSE;
        $head_data          = $receipt_array->head_data;
        if ($is_duplicate && !$api_call) 
        {
            $is_mgr_call    = TRUE;
        }
        
        $is_mail            = $receipt_array->is_mail;

        $school_code_header = $this-> School_model ->get_school_code($session_school_id);

        // Getting Information about transaction history
        $transaction_data = $this-> Fee_model ->fetch_transaction_history($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id, $collection_type);

        if ($transaction_data != "" || $transaction_data != NULL) {
            $payment_data = $this-> Fee_model ->fetch_payment_mode_refno($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id,$collection_type);
            if ($payment_data != "" || $payment_data != NULL) {
                $transaction_history = array(
                                                'ref_no'            => $ref_no,
                                                'payment_class_id'  => $payment_class_id,
                                                'ref_institute_id'  => $ref_institute_id,
                                                'ref_school_id'     => $ref_school_id,
                                                'school_code'       => $school_code_header,
                                                'transaction_data'  => $transaction_data,
                                                'payment_data'      => $payment_data
                                            );
                // Total Amount
                $total_amount = 0;
                $total_discount = 0;
                $total_late_fee = 0;
                $count = count($transaction_history['transaction_data']);

                // Fee Heads
                for ($i=0; $i < $count; $i++) { 
                    if($head_data[$i]->discount != 0)
                    {
                        $total_discount = $total_discount + $head_data[$i]->discount;
                    }
                    $total_late_fee = $total_late_fee + $head_data[$i]->late_fee;
                    if ($is_duplicate) 
                    {
                        $total_amount = $total_amount + $transaction_history['transaction_data'][$i]['chq_amt'];
                    }else{
                        $total_amount = $total_amount + $head_data[$i]->head_amount_main - $head_data[$i]->discount + $head_data[$i]->late_fee;
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

                $ret_refund_data = $this-> Fee_model->get_refund_data($payment_class_id,$financial_year,$head_data[0]->head_id,$session_school_id);
                $ret_refund_flag = $ret_refund_data[0]->refund_flag;
                $deposit_refund_year = 0;
                if($ret_refund_flag== 1) {
                    $ret_refund_year_month = $this-> Deposit_refund_model ->get_date_of_refund($financial_year, $payment_class_id, $installment_id, $session_school_id,$head_data[0]->head_id);
                    $deposit_refund_year = $ret_refund_year_month[0]->june_year;
                }

                 $receipt_pdf_name = $this->receipt_pdf_link($ref_no, $transaction_history, $total_amount, $ref_institute_id, $ref_school_id, $session_school_id, $collection_type, $receipt_letterhead, $is_duplicate, $is_mail, $financial_year, $deposit_refund_year, $is_mobile, $is_mgr_call, $payment_class_id,$ret_refund_flag,$total_discount,$head_data,$total_late_fee);
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
    public function receipt_pdf_link($ref_no, $transaction_history, $total_amount, $ref_institute_id, $ref_school_id, $session_school_id, $collection_type, $receipt_letterhead, $is_duplicate, $is_mail, $financial_year, $deposit_refund_year, $is_mobile, $is_mgr_call, $payment_class_id,$ret_refund_flag,$total_discount,$head_data,$total_late_fee)
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
                        'header_img'          => $header_img,
                        'total_discount'      => $total_discount,
                        'total_late_fee'      => $total_late_fee,
                        'head_data'           => $head_data
                    );
        if ($ret_refund_flag == 1) {  // Deposit
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

            $data['school_id']   = $school_id;
            $data['student_continuity_data'] = $this-> Continuity_form_model -> fetch_undertaking_link_data($refno,$data,$stud_year);
            $temp_class_id       = $data['stud_parent_data'][0]->admission_to;
            $data['status']      = $data['stud_parent_data'][0]->status;
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

     /**
     * Pending Transaction list
     *
     * @return view
     */
    public function view_pending_transaction()
    {
        $data['page_data']['page_name'] = 'Student Pending Transactions';
        $data['page_data']['page_icon'] = 'fa fa-rupee';
        $data['page_data']['page_title'] =  'Student Pending Transactions';
        $data['page_data']['page_date'] = date("d M Y");
        $data['page_data']['page_description'] = 'This module manages receipt information for student which payment done but receipt not generated.';
        $data['page_data']['breadcrumb'] = '<li>Administrator</li><li class="active">Student Pending Transaction</li>';
        $payment_link_data = array();
        $ret_payment_row = $this-> Fee_model -> fetch_payment_link();
        if($ret_payment_row != NULL && $ret_payment_row !='')
        {
            foreach ($ret_payment_row as $key => $payment_row) 
            {
                $link_id = $payment_row['link_id'];
                $transaction_row = $this-> Fee_model -> fetch_payment_transaction($link_id);
                if($transaction_row == NULL && $transaction_row =='')
                {
                    $data['full_name'] = $this-> Student_model ->get_refno_fullname($payment_row['ref_no'], $payment_row['school_id']);
                    $data['class_id'] = $payment_row['payment_class_id'];
                    $class_name_data = $this-> Class_division_model->get_class_name($data);
                    $class_name = $class_name_data->result()[0]->class_name;
                    //Fetch payplan data
                    $data['payplan_details'] = $this-> Fee_model ->check_pay_plan($payment_row['school_id'], $payment_row['payplan_id']);
                    if ($data['payplan_details'] != NULL) 
                    {
                        $data['payplan_name'] = $data['payplan_details'][0]['payment_plan'];
                    }

                    $query_installment  = $this-> Fee_model -> fetch_installment($payment_row['installment_id'],$payment_row['school_id']);
                    if ($query_installment != "" || $query_installment != NULL) 
                    {
                        foreach ($query_installment as $rowupdate_installment)
                        {
                            $installment_name  = $rowupdate_installment['name_of_installment'];
                        }
                    }

                    $link_sent_date = date('Y-m-d', strtotime($payment_row['creation_time']));
                    if($payment_row['process_date']!='0000-00-00 00:00:00')
                    { 
                        $process_date = date('Y-m-d H:i:s', strtotime($payment_row['process_date']));
                    }else{
                        $process_date ='';
                    }
                    $ret_data = array(
                                        'ref_no' => $payment_row['ref_no'],
                                        'student_name' => $data['full_name'], 
                                        'payment_class_name' => $class_name,
                                        'collection_type' => $payment_row['collection_type'],
                                        'payplan_name' => $data['payplan_name'],
                                        'installment_name' => $installment_name, 
                                        'financial_year' => $payment_row['financial_year'],
                                        'academic_year' => $payment_row['academic_year'],
                                        'hit_count' => $payment_row['hit_count'],
                                        'link_sent_date' => $link_sent_date,
                                        'process_date' => $process_date,
                                        'order_id' => $payment_row['order_id'],
                                    );
                    array_push($payment_link_data,$ret_data);
                }
            }
        }
        $data['payment_link_data'] = $payment_link_data;
        $data['main_content'] = array('account/payment_link/view_payment_data');
        $this -> load -> view('bootstrap_templates/main_template', $data);
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

    public function send_welcome_notification($refno,$class_id,$school_id)
    {
        $original_preview_content = '<p style="font-size: 14px;">Congratulations! You'."'".'re in! Welcome to the Walnut Family. You have made the right choice by choosing Walnut School to advance your child'."'".'s education and personality. You will shortly get an email and message on the Wal-Sh app giving you details of the next steps.</p>';

        $db_name = $this-> School_model ->fetch_school_db($school_id);

        $data['ref_no']           = $refno;
        $data['class_id']         = $class_id;
        $data['division_id']      = NULL;
        $data['subject_id']       = 'Any Subject';
        $data['unit_id']          = 'Any Unit';
        $data['type']             = 'Notification';
        $data['title']            = 'Congratulations!You'."'".'re in! Welcome to the Walnut Family. Check out the Wal-Sh app for further details.';
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
           $mobile_numbers = $this -> Student_app_model -> search_mobile_registry($refno, $school_id, $class_id); 
            if(count($mobile_numbers) > 0){
                //For SMS, the title is empty, so use content
                $subject_content = $data['title'];
                if($subject_content == null || $subject_content == ''){
                    $subject_content = $data['detail_text_area'];
                }
                Send_push_notification_helper::send_push_notification($mobile_numbers, $subject_content, "{}");
            }
            return TRUE;
        } else {
            return FALSE;
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
		$this->load->model('account/Deposit_model');
        $this->load->model('account/Deposit_refund_model');
        $this->load->model('common/Employee_model');
        $this->load->model('student/Student_welcome_email_model');
        $this->load->model('school_cmap/Classroom_model');
        $this->load->library('Google_login');
        $this->load->library('Google_classroom');
        $this->load->model('student/Continuity_form_model');
        $this->load->model('mobile/Student_app_model');
	}
```
{{< /details >}}

## index
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to display the landing view for managing collection of fees and deposits. It sets up the necessary data for the view, such as the page name, icon, title, date, description, and breadcrumb. It also loads the main template view.

{{< details "source code " >}}
```php
function index($collection_type = 'fee'){
        // Main parameter differentiating fees && deposits
        $data['collection_type'] = $collection_type;

		$data['page_data']['page_name'] = ucfirst($collection_type).' Collection';
        $data['page_data']['page_icon'] = 'fa fa-exchange';
        $data['page_data']['page_title'] = ucfirst($collection_type).' Collection';
		$data['page_data']['page_date'] = date("d M Y");
        $data['page_data']['page_description'] = 'This module manages movement of Collection for fees & deposits';
        $data['page_data']['breadcrumb'] = '<li>Administrator</li><li class="active">Manage Collection ('.ucfirst($collection_type).')</li>';

        $data['main_content'] = array('account/collection/landing_view');
	    $this -> load -> view('bootstrap_templates/main_template', $data);
	}
```
{{< /details >}}

## fetch_student_details
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function fetches the details of a student based on the given reference number. It retrieves the student's full name, class name, and division name from the Student_model. It also retrieves the financial years and academic year from the System_model. It then loads the student_view view with the fetched data.

### User Acceptance Criteria
```gherkin
Feature: Fetch Student Details
Scenario: Fetch student details
Given The user is logged in
When The user enters a collection type and reference number
Then The student's details are fetched and displayed in the student_view
```

### Refactoring
1. Extract the code for fetching the student's full name, class name, and division name into separate functions in the Student_model.
2. Extract the code for fetching the financial years and academic year into separate functions in the System_model.
3. Move the code for fetching the payplan info into a separate function in the Fee_model.
4. Use dependency injection to inject the Student_model, System_model, and Fee_model into the fetch_student_details function.

{{< details "source code " >}}
```php
function fetch_student_details(){
		$school_id = $_SESSION['school_id'];

		$data['collection_type'] = $this->input->post('collection_type');
		$data['ref_no'] = strtoupper($this->input->post('ref_no'));

		// Student data
		$data['full_name'] = $this-> Student_model ->get_refno_fullname($data['ref_no'], $school_id);
		$data['class_name'] = $this-> Student_model ->get_refno_classname($data['ref_no'], $school_id);
		$data['div_name'] = $this-> Student_model ->get_refno_divname($data['ref_no']);

		if ($data['full_name'] == '') {
			echo '';return;
		}

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

        // If academic year && financial year do not match => Default is Next Year
        // If academic year && financial year match => Default is Current Year
        if ($data['academic_year'] == $financial_year) {
            $data['default_selected_year'] = $financial_year;
        } else {
            $data['default_selected_year'] = $year_array['next_year'];
        }
        if($data['collection_type'] == 'fee')
        {
            $data['fee_or_dep'] = array(
                            'fee' => 'Fee',
                            'exam'=>'Exam Fee'
                        );
        }else{
            $data['fee_or_dep'] = array(
                            'dep' => 'Deposit'
                        );
        }
        
         // Payplan Info
        $ret_payplan_data = $this -> Fee_model -> fetch_all_payplan($school_id);
        if ($ret_payplan_data != null || $ret_payplan_data != '') {
            $data['payplan_info'] = $ret_payplan_data;
        } else {
            $data['payplan_info'] = NULL;
        }
		$this-> load -> view('account/collection/student_view', $data);
	}
```
{{< /details >}}

## fetch_installment_details
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to fetch installment details for a specific student. It retrieves the school ID and academic year from the session. It also retrieves the collection type, reference number, and selected financial year from the input. If the collection type is 'dep' and the student's admission year is different from the selected financial year, the function updates the selected financial year to the student's admission year. It then computes the continuity class for the student based on the reference number, selected financial year, academic year, and school ID. It retrieves the payplan details for the reference number, computed class ID, selected financial year, collection type, and school ID. If the view flag is 'yes', the function fetches the installment information and loads the installment view. If the view flag is 'payplan', the function fetches the payplan details and returns the payplan name and student admission year. Otherwise, the function retrieves the class name and returns it along with the computed class ID and payplan.

### User Acceptance Criteria
```gherkin
Feature: Fetch Installment Details

Scenario: Fetch installment details
Given The user is logged in
When The user fetches installment details
Then The installment details are displayed
```

### Refactoring
The function could be refactored to separate the logic for fetching installment details and displaying the view. This would make the function more modular and easier to test.

{{< details "source code " >}}
```php
function fetch_installment_details($view_flag = 'yes'){
		$school_id = $_SESSION['school_id'];
		$academic_year = $this -> System_model -> get_academic_year();

		$collection_type = $this->input->post('collection_type');
		$ref_no = strtoupper($this->input->post('ref_no'));
		$selected_financial_year = $this->input->post('selected_financial_year');
        $student_admission_year =  $this-> Student_model ->fetch_student_specific_info($ref_no, $school_id, 'academic_year');
        if($collection_type == 'dep' && $student_admission_year != $selected_financial_year)
        {
           $selected_financial_year = $student_admission_year;
        }

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
            echo $data['payplan_name'].'~'.$student_admission_year;return;
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

## fetch_entity_details
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to fetch entity details based on the given parameters. It retrieves the school ID and academic year from the session. It also retrieves the collection type, reference number, selected financial year, selected installment ID, and pay plan ID from the input. It then calls the `fetch_student_specific_info` function to get the student admission year. Depending on the collection type, it calls the `fetch_fees_details` function with different parameters. Finally, it checks if the fetched yearly heads are null and either returns false or loads the entity view.

### User Acceptance Criteria
```gherkin
Feature: Fetch Entity Details
Scenario: Fetch entity details
Given The user is logged in
When The user fetches entity details
Then The entity details are retrieved
```

### Refactoring
1. Extract the retrieval of school ID and academic year from the session into a separate function.
2. Extract the retrieval of collection type, reference number, selected financial year, selected installment ID, and pay plan ID from the input into a separate function.
3. Extract the logic for fetching student admission year into a separate function.
4. Extract the logic for fetching yearly heads into a separate function.
5. Use dependency injection to inject the `System_model`, `Student_model`, and `Fee_model` dependencies.
6. Use a more descriptive variable name instead of `data`.

{{< details "source code " >}}
```php
function fetch_entity_details(){
		$data['school_id'] = $_SESSION['school_id'];
		$data['academic_year'] = $this -> System_model -> get_academic_year();

		$data['collection_type'] = $this->input->post('collection_type');
		$data['ref_no'] = strtoupper($this->input->post('ref_no'));
		$data['selected_financial_year'] = $this->input->post('selected_financial_year');
		$data['selected_installment_id'] = $this->input->post('selected_installment_id');
		$data['payplan_id'] = $this->input->post('payplan_id');
        $student_admission_year =  $this-> Student_model ->fetch_student_specific_info($data['ref_no'], $data['school_id'], 'academic_year');
        if ($data['collection_type'] =='dep') 
        {
            $data['yearly_heads'] = $this -> Fee_model -> fetch_fees_details($data['ref_no'], $data['school_id'], $student_admission_year, $data['collection_type'], $data['selected_installment_id'], $data['payplan_id']);
        }else
        {
		  $data['yearly_heads'] = $this -> Fee_model -> fetch_fees_details($data['ref_no'], $data['school_id'], $data['selected_financial_year'], $data['collection_type'], $data['selected_installment_id'], $data['payplan_id']);
        }
		if($data['yearly_heads'] == NULL){
			return FALSE;
		} else {
			$this-> load -> view('account/collection/entity_view', $data);
		}
	}
```
{{< /details >}}

## fetch_transaction_details
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
This function fetches transaction details for a given ref_no and collection type. It retrieves various data such as session_school_id, user_name, academic_year, financial_year, collection_type, ref_no, selected_financial_year, selected_installment_id, payplan_id, saved_key, tab_mode, defaulter_check, stud_parent_data, status, stud_class_id, academic_year, target_path, fee_flag, dep_flag, transaction_history, yearly_heads, concession_details, and payment_modes. It also checks for already paid transactions and sets the is_paid flag accordingly.

### Refactoring
1. Extract repeated code into separate functions to improve readability and maintainability.
2. Use meaningful variable names to improve code readability.
3. Remove unnecessary comments and code.
4. Use consistent indentation and formatting.
5. Split the function into smaller functions to improve testability and reduce complexity.

{{< details "source code " >}}
```php
function fetch_transaction_details(){
		$data['session_school_id'] = $_SESSION['school_id'];
        $data['user_name'] = $_SESSION['emp_id'];
		$data['academic_year'] = $this -> System_model -> get_academic_year();
        $data['financial_year'] = $this -> System_model -> get_financial_year();

		$data['collection_type'] = $this->input->post('collection_type');
		$data['ref_no'] = strtoupper($this->input->post('ref_no'));
		$data['selected_financial_year'] = $this->input->post('selected_financial_year');
		$data['selected_installment_id'] = $this->input->post('selected_installment_id');
		$data['payplan_id'] = $this->input->post('payplan_id');
		$data['saved_key'] = json_decode($this->input->post('saved_key'));
		$data['tab_mode'] = $this->input->post('tab_mode'); // For receipt history
        $data['defaulter_check'] = '';
        $student_admission_year =  $this-> Student_model ->fetch_student_specific_info($data['ref_no'], $data['session_school_id'], 'academic_year');

        $data['school_id'] = $data['session_school_id'];
        $continuity_result = $this-> Continuity_form_model -> fetch_undertaking_link_data($data['ref_no'],$data,$data['selected_financial_year']);
        if ($continuity_result != NULL) 
        {
            $data['confirm_status'] = $continuity_result->link_status;
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
        $data['academic_year'] = $data['selected_financial_year'];
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
        $data['dep_flag']      = $present_file_data[0]->dep_flag;

        if ($student_admission_year > $data['selected_financial_year'] && $student_admission_year >= $data['academic_year']) 
        {
            $data['defaulter_check'] = 'Not Applicable';
        }else
        {
            $defaulter_check = $this->check_student_defaulter($data);
            if($defaulter_check != 0)
            {
                $res_fee_check = explode("~",$defaulter_check);
                if($res_fee_check[0] != $data['selected_installment_id'] || $res_fee_check[1] != $data['selected_financial_year'])
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
        
        // Yearly Heads
        if ($data['collection_type'] =='dep')
        {
             // Already paid transactions
            $data['transaction_history'] = $this-> Fee_model ->fetch_transaction_history($data['ref_no'], $student_admission_year, $data['payplan_id'], $data['selected_installment_id'], $data['session_school_id'], 0, 0, $data['collection_type']);

            $data['yearly_heads'] = $this -> Fee_model -> fetch_fees_details($data['ref_no'], $data['session_school_id'], $student_admission_year,$data['collection_type'], $data['selected_installment_id'], $data['payplan_id']);
        }else
        {
            // Already paid transactions
            $data['transaction_history'] = $this-> Fee_model ->fetch_transaction_history($data['ref_no'], $data['selected_financial_year'], $data['payplan_id'], $data['selected_installment_id'], $data['session_school_id'], 0, 0, $data['collection_type']);


            $data['yearly_heads'] = $this -> Fee_model -> fetch_fees_details($data['ref_no'], $data['session_school_id'], $data['selected_financial_year'],$data['collection_type'], $data['selected_installment_id'], $data['payplan_id']);
        }

        if($data['yearly_heads'] == NULL){
            return FALSE;
        }

        // Concession
        $data['concession_details'] = $this-> Fee_model ->refno_installment_concession_details($data['ref_no'], $data['session_school_id'], $data['collection_type'], $data['selected_financial_year'], $data['selected_installment_id'],'collection');

        // Todo - Late Payment

		if($data['tab_mode'] === 'history_tab'){
			$this-> load -> view('account/collection/receipt_history', $data);
		} else if($data['tab_mode'] === 'refund_tab'){
            $data['user_role'] = $_SESSION['user_role'];

            $data['current_class_id'] = $this-> Student_model ->get_refno_classid($data['ref_no'], $data['session_school_id']);
            $data['status'] = $this-> Student_model ->fetch_student_specific_info($data['ref_no'], $data['session_school_id'], 'status');
            $data['refund_data'] = $this-> Deposit_refund_model ->check_refno_present($data['ref_no'], $data['session_school_id']);

            $this-> load -> view('account/collection/refund_view', $data);
        } else {
            // Already paid checks
            if($data['transaction_history'] != NULL && $data['yearly_heads'] != NULL) {
                foreach ($data['yearly_heads'] as $yearly_key => $yearly_value) {
                    foreach ($data['transaction_history'] as $tran_key => $tran_value) {
                        $exculsive_check = FALSE;
                        if($data['collection_type'] == 'fee' || $data['collection_type'] == 'exam') { // Checking for ref ids avoided becoz of historical reasons
                            if($tran_value['fees_paid_year'] == $yearly_value->financial_year && $tran_value['installment_id'] == $yearly_value->instl_no && $tran_value['class_id'] == $yearly_value->class_id && $tran_value['fee_head_id'] == $yearly_value->fee_head_id) //&& $tran_value['chq_amt'] == $yearly_value->fee_head_amt
                            {
                                $exculsive_check = TRUE;
                            }
                        } else 
                        {
                            if ($data['concession_details'] != NULL) 
                            {
                                foreach ($data['concession_details'] as $conces_key => $conc_row) 
                                {
                                    if(($yearly_value->fee_head_id == $conc_row->fee_head_id) && ($tran_value['institude_id'] == $conc_row->fee_ref_inst_id))
                                    {
                                        $exculsive_check = TRUE; 
                                    }else {
                                        if ($tran_value['chq_amt'] == $yearly_value->fee_head_amt) 
                                        {
                                            $exculsive_check = TRUE; 
                                        }
                                    }
                                }
                            } else {
                                if ($tran_value['chq_amt'] == $yearly_value->fee_head_amt) 
                                {
                                    $exculsive_check = TRUE; // Deposit entry present in history then mark PAID (as paid only once throughout)
                                }
                            }
                        }
                        if($exculsive_check) {
                            $yearly_value->is_paid = TRUE; // Set paid as 1 for the index
                            $yearly_value->paid_data = $this-> Fee_model ->fetch_payment_mode_refno($data['ref_no'], $data['selected_financial_year'], $data['payplan_id'], $data['selected_installment_id'], $data['session_school_id'], $yearly_value->fee_ref_school_id, $yearly_value->fee_ref_inst_id,$data['collection_type']);
                        }
                    }
                }
            }

            $data['payment_modes'] = $this-> Fee_model ->fetch_payment_modes('all');
			$data['bank_details'] = $this-> Fee_model ->fetch_banks();
			$this-> load -> view('account/collection/transaction_view', $data);
		}
	}
```
{{< /details >}}

## save_transaction
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
The `save_transaction` function is responsible for saving a transaction. It takes an optional parameter `api_call` which is used to determine the source of the payment data. If `api_call` is `0` or `'0'`, it is converted to `FALSE`, otherwise it is converted to `TRUE`. The function then retrieves the payment data based on the `api_call` value and performs various operations to save the transaction. It also handles undertaking form accept data and updates the student status. Finally, it generates and returns a receipt.

### User Acceptance Criteria
```gherkin
Feature: Save Transaction
Scenario: Saving a transaction
Given The payment data is provided
When The save_transaction function is called
Then The transaction is saved and a receipt is generated
```

### Refactoring
1. Extract the code for converting `api_call` to a boolean into a separate function.
2. Extract the code for retrieving payment data based on `api_call` into a separate function.
3. Extract the code for saving the transaction into a separate function.
4. Extract the code for handling undertaking form accept data into a separate function.
5. Extract the code for updating the student status into a separate function.
6. Extract the code for generating a receipt into a separate function.

{{< details "source code " >}}
```php
function save_transaction($api_call = 0){
        // Converting to booleans
        if($api_call == 0 || $api_call == '0'){
            $api_call = FALSE;
        } else {
            $api_call = TRUE;
        }

        if($api_call) {
            $json_response = json_decode(file_get_contents('php://input'), TRUE);
            $payment_data  = (object)$json_response['payment_data_json'];
            // $partial_id_array = $json_response['partial_id_array'];
            $is_mobile     = $payment_data->is_mobile;
        } else {
            $payment_data = json_decode($this->input->post('payment_data_json'));
            $is_mobile    = $this->is_mobile();
            // $partial_id_array = array();
        }
        
		$ref_no                   = strtoupper($payment_data->ref_no);
		$collection_type          = $payment_data->collection_type;
		$payment_class_id         = $payment_data->payment_class_id;
		$selected_installment_id  = $payment_data->selected_installment_id;
		$selected_financial_year  = $payment_data->selected_financial_year;
		$payplan_id               = (int)$payment_data->payplan_id;
		$head_data                = json_decode($payment_data->head_data);
		$yearly_setup_id          = $payment_data->yearly_setup_id;
		$ref_school_id            = (int)$payment_data->ref_school_id;
		$ref_institute_id         = (int)$payment_data->ref_institute_id;
        $session_school_id        = (int)$payment_data->session_school_id;
        $user_name                = $payment_data->user_name;
		$payment_details          = (object)$payment_data->payment_details;
        $accept_status            = $this->input->post('accept_status');
        $parent_otp               = $this->input->post('parent_otp');
        $stud_class_id            = $this->input->post('stud_class_id');

 		$late_payment_data = NULL; // Todo - Late fee  flag & late fee amount (will come from UI)

        $academic_year = $this -> System_model -> get_academic_year();
        $transaction_id = 0;

        // Get actual deposit refunt amount for refund calculation
        $ret_refund_data = $this-> Fee_model->get_refund_data($payment_class_id,$selected_financial_year,$head_data[0]->head_id,$session_school_id);
        $refund_amt = $ret_refund_data[0]->refund_amount;

 		// Already Paid Check
 		$paid_status = $this-> Fee_model ->check_paid_unpaid($ref_no, $selected_financial_year, $payplan_id, $selected_installment_id, $session_school_id, $ref_school_id, $ref_institute_id,$collection_type);
        if($paid_status != NULL) {
            echo -3;return;
        } else {
            $this->load->model('account/Receipt_model');
    		$transaction_id = $this-> Receipt_model ->save_transaction($session_school_id, $academic_year, $selected_financial_year, $user_name, $selected_installment_id, $payplan_id, $head_data, $yearly_setup_id, $ref_school_id, $ref_institute_id,$collection_type, $late_payment_data, $ref_no, $payment_class_id, $payment_details,$refund_amt);

            // Errors
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
        // if(count($partial_id_array) > 0)
        // {
        //     $paid_status_update = $this -> Fee_model -> update_student_partial_paid_status($partial_id_array,$ref_no,$session_school_id);
        // }

        // To save undertaking form accept data
        if ($collection_type == 'fee') 
        {
            if ($accept_status == 2) 
            {
                $data['school_id']          = $session_school_id;
                $data['refno']              = $ref_no;
                $data['class_id']           = $stud_class_id;
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
        }else{
            if ($accept_status == 2) 
            {
                $data['school_id']          = $session_school_id;
                $data['refno']              = $ref_no;
                $data['class_id']           = $stud_class_id;
                $data['academic_year']      = $selected_financial_year;
                $data['dep_link_status']    = $accept_status;
                $data['dep_otp']            = $parent_otp;
                $data['dep_link_response']  = 'YES';
                $data['dep_link_reason']    = 'Accepted while paying deposit in school';
                $data['dep_submitted_date'] = date("Y-m-d h:i:s");
                if ($_SERVER['HTTP_HOST'] == 'localhost') 
                {
                    $data['dep_user_ip']    = '192.168.1.2'; // TODO remove temp IP address - - Locally it returns ::1    
                } else 
                {
                    $data['dep_user_ip']    = $_SERVER['REMOTE_ADDR']; // Client IP address 
                }
                $data['dep_useragent']      = $_SERVER['HTTP_USER_AGENT'];
                $data['link_response']      = NULL;
                $data['useragent']          = NULL;
                $data['link_status']        = NULL;
                $data['user_ip']            = NULL;
                $data['link_reason']        = NULL;
                $data['parent_otp']                = NULL;
                $data['submitted_date']     = NULL;
                
                $continuity_result = $this-> Continuity_form_model -> fetch_undertaking_link_data($ref_no,$data,$selected_financial_year);
                if ($continuity_result != NULL) 
                {
                    $data['link_response']     = $continuity_result->link_response;
                    $data['useragent']         = $continuity_result->user_name;
                    $data['link_status']       = $continuity_result->link_status;
                    $data['user_ip']           = $continuity_result->ip_address;
                    $data['link_reason']       = $continuity_result->link_reason;
                    $data['parent_otp']        = $continuity_result->parent_otp;
                    $data['submitted_date']    = $continuity_result->submitted_date;
                    $result = $this-> Continuity_form_model ->update_continuity_info($data);
                }else{
                    $result = $this-> Continuity_form_model ->save_continuity_data($data);
                }
                if ($continuity_result->dep_link_status != 2) 
                {
                    $this->send_undertaking_form($ref_no, $session_school_id,$selected_financial_year,$collection_type);
                }
            }
        }
        if($collection_type != 'exam')
        {
            // Student status change
            $this->convert_student_status($ref_no, $selected_financial_year, $payplan_id, $selected_installment_id, $collection_type, $session_school_id);
        }

		// Send data to show receipts
        if($api_call) {
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
        echo $this->generate_receipt_link(0, 0, $receipt_json);return;
        }else{
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
                                        'head_data'          => $head_data[0]->head_id
                                 )
                             );
            echo $this->generate_receipt(0, 0, $receipt_json);return;
        }
	}
```
{{< /details >}}

## generate_receipt
{{< complexityLabel "Moderate" >}}{{< /complexityLabel >}}
### Overview
The `generate_receipt` function is responsible for generating a receipt for a transaction. It takes in several parameters including `$api_call`, `$return`, and `$receipt_json`. The function first converts the `$api_call` and `$return` parameters to booleans. Then, depending on the value of `$receipt_json`, it either retrieves the receipt data from the input or from the JSON response of an API call. The function then fetches information about the transaction history and payment mode using the `fetch_transaction_history` and `fetch_payment_mode_refno` functions from the `Fee_model` class. It calculates the total amount and convenience amount for the transaction and generates a receipt PDF using the `receipt_pdf` function. Finally, it returns the name of the generated PDF file.

### User Acceptance Criteria
```gherkin
Feature: Generate Receipt

Scenario: Generate receipt for a transaction
Given The API call flag is set to 0
And The return flag is set to 0
And The receipt JSON is provided
When The generate_receipt function is called
Then The receipt PDF is generated
And The name of the PDF file is returned
```

### Refactoring
1. Extract the code for converting `$api_call` and `$return` to booleans into a separate function.
2. Extract the code for fetching transaction history and payment mode into separate functions.
3. Extract the code for calculating the total amount and convenience amount into a separate function.
4. Extract the code for generating the receipt PDF into a separate function.
5. Use dependency injection to inject the `Fee_model` and `Deposit_refund_model` classes into the function.
6. Use type hinting for the function parameters to improve readability and maintainability.

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
            $is_mobile     = $this->is_mobile();    
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
        $is_mgr_call        = FALSE;
        $head_data          = $receipt_array->head_data;
        if ($is_duplicate && !$api_call) 
        {
            $is_mgr_call    = TRUE;
        }
        
        $is_mail            = $receipt_array->is_mail;

        $school_code_header = $this-> School_model ->get_school_code($session_school_id);

        // Getting Information about transaction history
        $transaction_data = $this-> Fee_model ->fetch_transaction_history($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id, $collection_type);

        if ($transaction_data != "" || $transaction_data != NULL) {
            $payment_data = $this-> Fee_model ->fetch_payment_mode_refno($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id,$collection_type);
            if ($payment_data != "" || $payment_data != NULL) {
                $transaction_history = array(
                                                'ref_no'            => $ref_no,
                                                'payment_class_id'  => $payment_class_id,
                                                'ref_institute_id'  => $ref_institute_id,
                                                'ref_school_id'     => $ref_school_id,
                                                'school_code'       => $school_code_header,
                                                'transaction_data'  => $transaction_data,
                                                'payment_data'      => $payment_data
                                            );
                // Total Amount
                $total_amount = 0;
                $count = count($transaction_history['transaction_data']);

                // Fee Heads
                for ($i=0; $i < $count; $i++) { 
                    $total_amount = $total_amount + $transaction_history['transaction_data'][$i]['chq_amt'];
                }

                // Convenience Amount
                $total_convenience_amt = 0;
                $count = count($transaction_history['payment_data']);
                for ($i=0; $i < $count; $i++) { 
                    $total_convenience_amt = $total_convenience_amt + $transaction_history['payment_data'][$i]['conven_amt'];
                }

                $total_amount = $total_amount + $total_convenience_amt;

                $ret_refund_data = $this-> Fee_model->get_refund_data($payment_class_id,$financial_year,$head_data,$session_school_id);
                $ret_refund_flag = $ret_refund_data[0]->refund_flag;
                $deposit_refund_year = 0;
                if($ret_refund_flag== 1) {
                    $ret_refund_year_month = $this-> Deposit_refund_model ->get_date_of_refund($financial_year, $payment_class_id, $installment_id, $session_school_id,$head_data);
                    $deposit_refund_year = $ret_refund_year_month[0]->june_year;
                }

                $receipt_pdf_name = $this->receipt_pdf($ref_no, $transaction_history, $total_amount, $ref_institute_id, $ref_school_id, $session_school_id, $collection_type, $receipt_letterhead, $is_duplicate, $is_mail, $financial_year, $deposit_refund_year, $is_mobile, $is_mgr_call, $payment_class_id,$ret_refund_flag);
                $invoice_path = APP_WEB_URL.'/application/uploads/collection_receipts/'.$receipt_pdf_name;
                if($return){
                	echo $receipt_pdf_name;return;
                } else {
                	return $receipt_pdf_name;
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
This function generates a PDF receipt for a transaction. It takes various parameters such as the reference number, transaction history, total amount, institute and school IDs, session school ID, collection type, receipt letterhead, duplicate flag, mail flag, financial year, deposit refund year, mobile flag, manager call flag, payment class ID, and return refund flag. It fetches the header image data from the School_model. Depending on the return refund flag, it loads the appropriate view file for the receipt. It then generates the receipt HTML using the loaded view and the provided data. If the duplicate flag is true and the manager call flag is true, it calls the receipt_attachment function to generate an attachment for the receipt. If the mail flag is true, it calls the mail_receipt function to send the receipt via email. Finally, it returns either the path of the generated PDF or the receipt HTML.

### User Acceptance Criteria
```gherkin
Feature: Generate Receipt PDF

Scenario: Generate PDF receipt for a transaction
Given The reference number is '123'
And The transaction history is 'Transaction 1, Transaction 2'
And The total amount is '100'
And The institute ID is '1'
And The school ID is '1'
And The session school ID is '1'
And The collection type is 'Cash'
And The receipt letterhead is 'Letterhead 1'
And The duplicate flag is 'false'
And The mail flag is 'true'
And The financial year is '2021'
And The deposit refund year is '2022'
And The mobile flag is 'true'
And The manager call flag is 'true'
And The payment class ID is '1'
And The return refund flag is '0'
When The receipt_pdf function is called
Then The receipt HTML is returned
```

### Refactoring
1. Extract the logic for loading the view and generating the receipt HTML into a separate function.
2. Move the logic for generating the receipt attachment into a separate function.
3. Move the logic for sending the receipt via email into a separate function.
4. Consider using a template engine for generating the receipt HTML instead of directly loading view files.
5. Simplify the conditional statements by using boolean variables instead of comparing with true/false values.

{{< details "source code " >}}
```php
public function receipt_pdf($ref_no, $transaction_history, $total_amount, $ref_institute_id, $ref_school_id, $session_school_id, $collection_type, $receipt_letterhead, $is_duplicate, $is_mail, $financial_year, $deposit_refund_year, $is_mobile, $is_mgr_call, $payment_class_id,$ret_refund_flag)
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
                        'header_img'          => $header_img
                    );
        if ($ret_refund_flag == 1) {  // Deposit
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
This function is used to send a receipt email to parents. It fetches the parent emails from the database, generates the email content, and sends the email using the Send_mail_helper class. If the collection type is 'dep' (deposit) and it is not a duplicate receipt, it also sends a welcome email to the parents.

### User Acceptance Criteria
```gherkin
Feature: Mail Receipt
Scenario: Send receipt email to parents
Given The parent emails are fetched from the database
When The receipt email is generated
Then The receipt email is sent to the parent emails
And If the collection type is 'dep' and it is not a duplicate receipt, a welcome email is sent to the parent emails
```

### Refactoring
1. Extract the code for fetching parent emails into a separate function.
2. Extract the code for generating the email content into a separate function.
3. Extract the code for sending the email into a separate function.
4. Use dependency injection to inject the Send_mail_helper class instead of directly calling it.
5. Use a configuration file to store the email sender information instead of hardcoding it.
6. Use a template engine to generate the email content instead of concatenating strings.
7. Use a logging library to log any errors or exceptions that occur during the email sending process.

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
            // $output_attach = '';
            $attachments = $attachment_array['attachemt_array'];
        // }

        $subject_content = 'Receipt from Walnut School';
        $regards = "Regards,<br>The Walnut School Administration Team";
        $preview_content = 'Dear Sir/Madam,<br><br> Please find the receipt for the '.ucwords($collection_type).' amounting to Rs. '.number_format($total_amount).' attached with this mail. Kindly keep this mail for your reference. Please do not reply to this mail address - as this mail has been sent from an automated system.<br><br>'.$output_attach;

        $email_sender_info = array('module_code' => 'FEE_DEPO', 'school_id' => $session_school_id, 'ref_sch_id' => $ref_school_id, 'ref_inst_id' => $ref_institute_id);
        $email_sender = Send_mail_helper::get_sender_data($email_sender_info);
        $email_sender_array = array( 
                                        'sender_name' => isset($email_sender['sender_name'])?$email_sender['sender_name']:'',
                                        'from_email'  => isset($email_sender['from_email'])?$email_sender['from_email']:'',
                                        'school_id'   => $session_school_id,
                                        'bcc_email'   => TRUE
                                    );

        if(!empty($email_parent_array)){
            Send_mail_helper::send_mail($email_parent_array, $preview_content, $subject_content, $attachments, $email_sender_array);
        }

        if ($collection_type == 'dep' && !$is_duplicate) 
        {
            $email_flag = $this-> Fee_model -> fetch_welcome_email_flag($ref_no, $session_school_id);
            if ($email_flag == NULL) 
            {
                // Send welcome emails
                $this->welcome_email_service($email_parent_array, $session_school_id, $ref_school_id, $ref_institute_id, $ref_no, $payment_class_id);
            }
        }
    }
```
{{< /details >}}

## convert_student_status
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
This function is used to convert the student status based on certain conditions. It fetches the student status from the database and checks if it is equal to 6 or 7. If it is 6, the new status is set to 1. If it is 7, the new status is set to 2. If the student status is neither 6 nor 7, the function returns 0. It then checks if the student admission year is different from the current academic year. If it is different, it performs some calculations and checks to determine if the status can be changed. If the status can be changed, it updates the student status in the database and performs some additional actions related to Google Classroom. Finally, it returns a status code indicating the success or failure of the operation.

### User Acceptance Criteria
```gherkin
Feature: Convert Student Status
Scenario: Convert student status
Given The student reference number is [ref_no]
And The selected financial year is [selected_financial_year]
And The payplan ID is [payplan_id]
And The selected installment ID is [selected_installment_id]
And The collection type is [collection_type]
And The session school ID is [session_school_id]
When The convert_student_status function is called
Then The student status should be updated in the database
And The student should be added to the appropriate Google Classroom
```

### Refactoring
1. Extract the code for checking if the student status is 6 or 7 into a separate function.
2. Extract the code for checking if the student admission year is different from the current academic year into a separate function.
3. Extract the code for updating the student status in the database into a separate function.
4. Extract the code for adding the student to Google Classroom into a separate function.

{{< details "source code " >}}
```php
public function convert_student_status($ref_no, $selected_financial_year, $payplan_id, $selected_installment_id, $collection_type, $session_school_id)
    {
        $student_status = $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'status');
        if($student_status == 6) {
            $new_status = 1;
        } else if ($student_status == 7) {
            $new_status = 2;
        } else {
            return 0;
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
        if($yearly_heads == NULL){
            return -2;
        }

        $passed_due_flag = 0;
        foreach ($yearly_heads as $yearly_key => $yearly_value) { // For case 1 & 2
            $paid_row = $this-> Fee_model -> check_paid_unpaid($ref_no, $yearly_value->financial_year, $payplan_id, $yearly_value->instl_no, $session_school_id, $yearly_value->fee_ref_school_id, $yearly_value->fee_ref_inst_id,$collection_type);
            if($paid_row == NULL) {
                // Concessions & RTE
                $concession_details = $this-> Fee_model ->refno_installment_concession_details($ref_no, $session_school_id, $collection_type, $selected_financial_year, $yearly_value->instl_no,'collection');
                if($concession_details != NULL){
                    foreach ($concession_details as $conces_key => $conc_row) {
                        // Normal student concession check
                        if(($yearly_value->fee_ref_school_id == $conc_row->fee_ref_school_id) && ($yearly_value->fee_ref_inst_id == $conc_row->fee_ref_inst_id) && ($yearly_value->fee_head_id == $conc_row->fee_head_id) && ($yearly_value->financial_year == $conc_row->academic_year)) {
                            $passed_due_flag++;
                            break;
                        }
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
        if($yearly_heads == NULL){
            return -2;
        }

        $passed_due_flag = 0;
        foreach ($yearly_heads as $yearly_key => $yearly_value) { // For case 1 & 2
            $paid_row = $this-> Fee_model ->check_paid_unpaid_status_change($ref_no, $yearly_value->financial_year, $payplan_id, $yearly_value->install_id, $session_school_id, $yearly_value->fee_ref_school_id, $yearly_value->fee_ref_inst_id, $yearly_value->fee_head_id,$collection_type);
            if($paid_row == NULL) {
                // Concessions & RTE
                $concession_details = $this-> Fee_model ->refno_installment_concession_details_status_change($ref_no, $session_school_id, $collection_type, $selected_financial_year, $yearly_value->install_id, $yearly_value->fee_head_id);
                if($concession_details != NULL){
                    foreach ($concession_details as $conces_key => $conc_row) {
                        // Normal student concession check
                        if(($yearly_value->fee_ref_school_id == $conc_row->fee_ref_school_id) && ($yearly_value->fee_ref_inst_id == $conc_row->fee_ref_inst_id) && ($yearly_value->fee_head_id == $conc_row->fee_head_id) && ($yearly_value->financial_year == $conc_row->academic_year)) {
                            $passed_due_flag++;
                            break;
                        }
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
                return 1;
            } else {
                return -1;
            }
        } else {
            return 0;
        }
    }
```
{{< /details >}}

## is_mobile
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the user is accessing the website from a mobile device. It uses the `$_SERVER['HTTP_USER_AGENT']` variable to get the user agent string and then matches it against a regular expression to determine if it is a mobile device or not. If the user agent string matches any of the patterns in the regular expression, the function returns `TRUE` indicating that the user is accessing the website from a mobile device. Otherwise, it returns `FALSE` indicating that the user is accessing the website from a web browser.

### User Acceptance Criteria
```gherkin
Feature: Check if user is accessing from a mobile device

Scenario: User is accessing from a mobile device
  Given the user agent is 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36'
  When the is_mobile function is called
  Then it should return TRUE

Scenario: User is accessing from a web browser
  Given the user agent is 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36'
  When the is_mobile function is called
  Then it should return FALSE
```

{{< details "source code " >}}
```php
public function is_mobile()
    {
        $useragent = $_SERVER['HTTP_USER_AGENT'];
        if(preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i',$useragent)||preg_match('/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i',substr($useragent,0,4)))
        { 
            $mobile = TRUE;//mobile
        }
        else{
            $mobile = FALSE;//web
        }
        return $mobile;
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
{{< complexityLabel "Moderate" >}}{{< /complexityLabel >}}
### Overview
This function is responsible for sending a welcome email to a student. It retrieves the necessary data from the database, replaces placeholders in the email content with actual values, and sends the email to the parent(s) of the student. It also saves the email content in the database and sends a notification to the student's app.

### User Acceptance Criteria
```gherkin
Feature: Welcome Email Service
Scenario: Send Welcome Email
Given The student's email parent array
And The session school ID
And The reference school ID
And The reference institute ID
And The reference number
And The payment class ID
When The welcome email service is called
Then The welcome email is sent to the parent(s) of the student
And The email content is saved in the database
And A notification is sent to the student's app
```

### Refactoring
1. Extract the code for replacing placeholders in the email content into a separate function.
2. Move the logic for retrieving data from the database into a separate function.
3. Use dependency injection to decouple the function from the Student_welcome_email_model, Student_model, Employee_model, and School_model.
4. Use a configuration file to store the email sender information instead of hardcoding it.
5. Use a template engine to generate the email content instead of manually replacing placeholders.

{{< details "source code " >}}
```php
public function welcome_email_service($email_parent_array, $session_school_id, $ref_school_id, $ref_institute_id, $ref_no, $payment_class_id)
    {
        $attachments_welcome = array();

        $subject_content_welcome = 'Welcome to the Walnut Family!';
        $ret_welcome_email_data = $this-> Student_welcome_email_model->check_welcome_email_data($session_school_id);

        $preview_content_welcome = $ret_welcome_email_data[0]->email_content;

        $data['ref_no']      = $ref_no;
        $ret_student_account = $this-> Student_model ->get_student_account_details($ref_no,$session_school_id);

        $data['user_email']    = strtolower($ret_student_account[0]->user_email);
        $data['user_password'] = $ret_student_account[0]->user_password;
     
        $data['student_first_name']   = $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'first_name');
        $data['student_app_password'] = $this-> Student_model ->fetch_student_specific_info($ref_no, $session_school_id, 'web_password');
        $data['student_web_password'] = $this -> School_model -> get_walmiki_password($session_school_id);
        $data['principal_name']       = $this-> Employee_model->get_staff_name_info($ret_welcome_email_data[0]->principal);
        $data['admin_in_charge']      = $this-> Employee_model->get_staff_name_info($ret_welcome_email_data[0]->admin_in_charge);

        $transport_provider_data      = $ret_welcome_email_data[0]->transport_provider;
        $transport_number_data        = $ret_welcome_email_data[0]->transport_number;
        $data['transport_provider']   = $transport_provider_data." (".$transport_number_data.")";

        $canteen_provider             = $ret_welcome_email_data[0]->canteen_provider;
        $data['canteen_provider']     = $canteen_provider." (".$ret_welcome_email_data[0]->canteen_number.")";
        
        $data['vice_principal']       = $this-> Employee_model->get_staff_name_info($ret_welcome_email_data[0]->vice_principal);
        $data['coordinator']          = $this-> Employee_model->get_staff_name_info($ret_welcome_email_data[0]->coordinator);
        
  
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
            $preview_content_welcome = str_replace('$$user_email$$', $data['user_email'], $preview_content_welcome);
        }

       if (strpos($preview_content_welcome, '$$user_password$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$user_password$$', $data['student_web_password'], $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$user_app_password$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$user_app_password$$', $data['user_password'], $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$principal$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$principal$$', $data['principal_name'], $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$admin_in_charge$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$admin_in_charge$$', $data['admin_in_charge'], $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$transport_provider$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$transport_provider$$', $data['transport_provider'], $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$canteen_provider$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$canteen_provider$$', $data['canteen_provider'], $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$vice_principal$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$vice_principal$$', $data['vice_principal'], $preview_content_welcome);
        }

        if (strpos($preview_content_welcome, '$$coordinator$$') !== false) 
        {
            $preview_content_welcome = str_replace('$$coordinator$$', $data['coordinator'], $preview_content_welcome);
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

        if(!empty($email_parent_array))
        {
            $mail_sent = Send_mail_helper::send_mail($email_parent_array, $preview_content_welcome, $subject_content_welcome, $attachments_welcome, $email_sender_array_welcome);
            $email_result = $this-> Fee_model-> insert_walcome_email_content($ref_no, $session_school_id,$mail_sent);
            $send_content_to_app_result = $this -> save_in_student_app($ref_no, $payment_class_id, $preview_content_welcome,$session_school_id);
            $send_welcome_notification_result = $this -> send_welcome_notification($ref_no, $payment_class_id,$session_school_id);
            return $mail_sent;
        }
    }
```
{{< /details >}}

## fetch_deposit_details
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to fetch deposit details based on a reference number. It retrieves the reference number from the input post data and the school ID from the session. It then calls the `get_parent_emails` method of the `Student_model` to get the parent emails associated with the reference number. If parent emails are found, it creates an array of email addresses and names. It then calls the `fetch_trahistory_details` method of the `Fee_model` to fetch transaction history details based on the reference number and school ID. If transaction history details are found, it retrieves the institute ID, school ID, and class ID from the result and calls the `welcome_email_service` method to send a welcome email to the parent emails. If transaction history details are not found, it calls the `check_concession_present` method of the `Fee_model` to check if there is a concession present for the reference number and school ID. If a concession is found, it retrieves the institute ID, school ID, and class ID from the result and calls the `welcome_email_service` method to send a welcome email to the parent emails.

### User Acceptance Criteria
```gherkin
Feature: Fetch Deposit Details

Scenario: Fetch deposit details for a reference number
Given The reference number is '123'
When I fetch the deposit details
Then The deposit details are retrieved successfully
```

### Refactoring
1. Extract the logic for fetching parent emails into a separate method.
2. Extract the logic for sending the welcome email into a separate method.
3. Use dependency injection to inject the `Student_model` and `Fee_model` dependencies instead of directly accessing them.
4. Use a more descriptive variable name instead of `ret_parent_emails`.

{{< details "source code " >}}
```php
public function fetch_deposit_details()
    {
        $ref_no             = $this->input->post('refno');
        $session_school_id  = $_SESSION['school_id'];
        $email_parent_array = array();
        $parent_emails = $this-> Student_model ->get_parent_emails($session_school_id, $ref_no);
        if ($parent_emails != NULL) 
        {
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

        $result = $this-> Fee_model ->fetch_trahistory_details($ref_no, NULL ,'dep', $session_school_id);
        if ($result != NULL) 
        {
            $ref_institute_id  = $result[0]['institude_id'];
            $ref_school_id     = $result[0]['school_id'];
            $payment_class_id  = $result[0]['class_id'];
            echo $sent_email = $this->welcome_email_service($email_parent_array, $session_school_id, $ref_school_id, $ref_institute_id, $ref_no, $payment_class_id);return;
        }else 
        {
            $concession_details = $this-> Fee_model ->check_concession_present($ref_no,$session_school_id);
            if ($concession_details != NULL) 
            {
                $ref_institute_id  = $concession_details[0]['fee_ref_inst_id'];
                $ref_school_id     = $concession_details[0]['fee_ref_school_id'];
                $payment_class_id  = $concession_details[0]['class_id'];
                echo $sent_email = $this->welcome_email_service($email_parent_array, $session_school_id, $ref_school_id, $ref_institute_id, $ref_no, $payment_class_id);return;
            }
        }
    }
```
{{< /details >}}

## generate_receipt_link
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
The `generate_receipt_link` function is used to generate a receipt link for a transaction. It takes in various parameters such as `api_call`, `return`, and `receipt_json` to determine the behavior of the function. The function converts the `api_call` and `return` parameters to booleans and then processes the `receipt_json` parameter to extract necessary information. It then fetches transaction history and payment data based on the provided parameters. The function calculates the total amount, discounts, late fees, and convenience amount for the transaction. It also handles refund data and generates a receipt PDF. Finally, it returns the receipt PDF name or a dash if no data is found.

### User Acceptance Criteria
```gherkin
Feature: Generate Receipt Link

Scenario: Generate receipt link for a transaction
Given The API call parameter is 0
And The Return parameter is 0
And The receipt JSON is null
When The generate_receipt_link function is called
Then The function should return a dash
```

### Refactoring
1. Extract the logic for converting parameters to booleans into a separate function.
2. Extract the logic for processing the receipt JSON into a separate function.
3. Extract the logic for fetching transaction history and payment data into a separate function.
4. Extract the logic for calculating total amount, discounts, late fees, and convenience amount into a separate function.
5. Extract the logic for handling refund data into a separate function.
6. Extract the logic for generating a receipt PDF into a separate function.

{{< details "source code " >}}
```php
public function generate_receipt_link($api_call = 0, $return = 0, $receipt_json = NULL)
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
            $fee_head_details = $this-> Fee_model ->fetch_head_details($receipt_array->session_school_id, $receipt_array->ref_no, $receipt_array->transaction_id,$receipt_array->ref_school_id, $receipt_array->ref_institute_id,$receipt_array->financial_year,$receipt_array->installment_id,$receipt_array->payplan_id);
            $head_data_array = array();
            foreach ($fee_head_details as $head_key => $head_value) 
            {
                $total_discount = 0;
                $late_fee = 0;
                $discount = 0;
                $discount_type = '';
                $referral_discount = 0;
                $payplan_discount = 0;
                $data['concession_data'] = $this-> Fee_model ->concession_data_all($receipt_array->ref_no, $receipt_array->session_school_id, $receipt_array->payment_class_id, $receipt_array->financial_year);
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
        } else {
            $receipt_array = json_decode($this->input->post('receipt_json'));
            $is_mobile     = $this->is_mobile();    
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
        $is_mgr_call        = FALSE;
        $head_data          = $receipt_array->head_data;
        if ($is_duplicate && !$api_call) 
        {
            $is_mgr_call    = TRUE;
        }
        
        $is_mail            = $receipt_array->is_mail;

        $school_code_header = $this-> School_model ->get_school_code($session_school_id);

        // Getting Information about transaction history
        $transaction_data = $this-> Fee_model ->fetch_transaction_history($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id, $collection_type);

        if ($transaction_data != "" || $transaction_data != NULL) {
            $payment_data = $this-> Fee_model ->fetch_payment_mode_refno($ref_no, $financial_year, $payplan_id, $installment_id, $session_school_id, $ref_school_id, $ref_institute_id,$collection_type);
            if ($payment_data != "" || $payment_data != NULL) {
                $transaction_history = array(
                                                'ref_no'            => $ref_no,
                                                'payment_class_id'  => $payment_class_id,
                                                'ref_institute_id'  => $ref_institute_id,
                                                'ref_school_id'     => $ref_school_id,
                                                'school_code'       => $school_code_header,
                                                'transaction_data'  => $transaction_data,
                                                'payment_data'      => $payment_data
                                            );
                // Total Amount
                $total_amount = 0;
                $total_discount = 0;
                $total_late_fee = 0;
                $count = count($transaction_history['transaction_data']);

                // Fee Heads
                for ($i=0; $i < $count; $i++) { 
                    if($head_data[$i]->discount != 0)
                    {
                        $total_discount = $total_discount + $head_data[$i]->discount;
                    }
                    $total_late_fee = $total_late_fee + $head_data[$i]->late_fee;
                    if ($is_duplicate) 
                    {
                        $total_amount = $total_amount + $transaction_history['transaction_data'][$i]['chq_amt'];
                    }else{
                        $total_amount = $total_amount + $head_data[$i]->head_amount_main - $head_data[$i]->discount + $head_data[$i]->late_fee;
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

                $ret_refund_data = $this-> Fee_model->get_refund_data($payment_class_id,$financial_year,$head_data[0]->head_id,$session_school_id);
                $ret_refund_flag = $ret_refund_data[0]->refund_flag;
                $deposit_refund_year = 0;
                if($ret_refund_flag== 1) {
                    $ret_refund_year_month = $this-> Deposit_refund_model ->get_date_of_refund($financial_year, $payment_class_id, $installment_id, $session_school_id,$head_data[0]->head_id);
                    $deposit_refund_year = $ret_refund_year_month[0]->june_year;
                }

                 $receipt_pdf_name = $this->receipt_pdf_link($ref_no, $transaction_history, $total_amount, $ref_institute_id, $ref_school_id, $session_school_id, $collection_type, $receipt_letterhead, $is_duplicate, $is_mail, $financial_year, $deposit_refund_year, $is_mobile, $is_mgr_call, $payment_class_id,$ret_refund_flag,$total_discount,$head_data,$total_late_fee);
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

## receipt_pdf_link
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function generates a PDF receipt for a transaction. It takes various parameters such as reference number, transaction history, total amount, institute ID, school ID, session school ID, collection type, receipt letterhead, duplicate flag, mail flag, financial year, deposit refund year, mobile flag, manager call flag, payment class ID, return refund flag, total discount, head data, and total late fee. It fetches the header image data from the School_model and creates an array of data to be passed to the view. Depending on the return refund flag, it loads the appropriate view file for generating the receipt HTML. If the duplicate flag is true and the manager call flag is true, it calls the receipt_attachment function to generate an attachment for the receipt. If the mail flag is true, it calls the mail_receipt function to send the receipt via email. Finally, it returns either the path of the attachment or the receipt HTML.

### User Acceptance Criteria
```gherkin
Feature: Generate Receipt PDF Link

Scenario: Generate PDF receipt for a transaction
Given The reference number is '123'
And The transaction history is 'Transaction 1, Transaction 2'
And The total amount is '100'
And The institute ID is '1'
And The school ID is '1'
And The session school ID is '1'
And The collection type is 'Cash'
And The receipt letterhead is 'Letterhead 1'
And The duplicate flag is 'false'
And The mail flag is 'true'
And The financial year is '2021'
And The deposit refund year is '2022'
And The mobile flag is 'true'
And The manager call flag is 'true'
And The payment class ID is '1'
And The return refund flag is '0'
And The total discount is '10'
And The head data is 'Head 1, Head 2'
And The total late fee is '5'
When I call the receipt_pdf_link function
Then I should receive the receipt HTML
```

### Refactoring
1. Extract the logic for loading the view and generating the receipt HTML into a separate function.
2. Move the logic for fetching the header image data into a separate function in the School_model.
3. Consider using a template engine for generating the receipt HTML instead of directly loading view files.
4. Refactor the if-else condition for selecting the view file based on the return refund flag to improve readability.

{{< details "source code " >}}
```php
public function receipt_pdf_link($ref_no, $transaction_history, $total_amount, $ref_institute_id, $ref_school_id, $session_school_id, $collection_type, $receipt_letterhead, $is_duplicate, $is_mail, $financial_year, $deposit_refund_year, $is_mobile, $is_mgr_call, $payment_class_id,$ret_refund_flag,$total_discount,$head_data,$total_late_fee)
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
                        'header_img'          => $header_img,
                        'total_discount'      => $total_discount,
                        'total_late_fee'      => $total_late_fee,
                        'head_data'           => $head_data
                    );
        if ($ret_refund_flag == 1) {  // Deposit
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

## send_undertaking_form
{{< complexityLabel "Moderate" >}}{{< /complexityLabel >}}
### Overview
This function is responsible for sending an undertaking form to the parents of a student. It retrieves the parent data from the database based on the school ID and reference number. If the parent data exists, it retrieves the father and mother email addresses and sends an email to both of them. The email contains a link to download the undertaking form. The function also handles different scenarios based on the student's status and academic year.

### User Acceptance Criteria
```gherkin
Feature: Send Undertaking Form
Scenario: Send undertaking form to parents
Given The school ID is [school_id]
And The reference number is [refno]
When The send_undertaking_form function is called
Then An email should be sent to the father and mother email addresses
And The email should contain a link to download the undertaking form
```

### Refactoring
1. Extract the email sending logic into a separate function for reusability.
2. Use a configuration file to store the email sender information instead of hardcoding it.
3. Use dependency injection to inject the Student_model, Continuity_form_model, and System_model dependencies instead of directly accessing them.
4. Use a constant or enum for the status values instead of hardcoding them.
5. Use a constant or enum for the class IDs instead of hardcoding them.
6. Extract the file ID retrieval logic into a separate function for reusability.

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

            $data['school_id']   = $school_id;
            $data['student_continuity_data'] = $this-> Continuity_form_model -> fetch_undertaking_link_data($refno,$data,$stud_year);
            $temp_class_id       = $data['stud_parent_data'][0]->admission_to;
            $data['status']      = $data['stud_parent_data'][0]->status;
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

## view_pending_transaction
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to view pending transactions for students. It fetches the necessary data from the database and passes it to the view for display.

### User Acceptance Criteria
```gherkin
Feature: View Pending Transactions
Scenario: User views pending transactions
Given the user is logged in
When the user navigates to the pending transactions page
Then the pending transactions for students are displayed
```

### Refactoring
1. Extract the database queries into separate functions for better code organization.
2. Use a template engine to generate the HTML view instead of manually building the HTML string.
3. Use a consistent naming convention for variables and functions.
4. Split the function into smaller functions to improve readability and maintainability.

{{< details "source code " >}}
```php
public function view_pending_transaction()
    {
        $data['page_data']['page_name'] = 'Student Pending Transactions';
        $data['page_data']['page_icon'] = 'fa fa-rupee';
        $data['page_data']['page_title'] =  'Student Pending Transactions';
        $data['page_data']['page_date'] = date("d M Y");
        $data['page_data']['page_description'] = 'This module manages receipt information for student which payment done but receipt not generated.';
        $data['page_data']['breadcrumb'] = '<li>Administrator</li><li class="active">Student Pending Transaction</li>';
        $payment_link_data = array();
        $ret_payment_row = $this-> Fee_model -> fetch_payment_link();
        if($ret_payment_row != NULL && $ret_payment_row !='')
        {
            foreach ($ret_payment_row as $key => $payment_row) 
            {
                $link_id = $payment_row['link_id'];
                $transaction_row = $this-> Fee_model -> fetch_payment_transaction($link_id);
                if($transaction_row == NULL && $transaction_row =='')
                {
                    $data['full_name'] = $this-> Student_model ->get_refno_fullname($payment_row['ref_no'], $payment_row['school_id']);
                    $data['class_id'] = $payment_row['payment_class_id'];
                    $class_name_data = $this-> Class_division_model->get_class_name($data);
                    $class_name = $class_name_data->result()[0]->class_name;
                    //Fetch payplan data
                    $data['payplan_details'] = $this-> Fee_model ->check_pay_plan($payment_row['school_id'], $payment_row['payplan_id']);
                    if ($data['payplan_details'] != NULL) 
                    {
                        $data['payplan_name'] = $data['payplan_details'][0]['payment_plan'];
                    }

                    $query_installment  = $this-> Fee_model -> fetch_installment($payment_row['installment_id'],$payment_row['school_id']);
                    if ($query_installment != "" || $query_installment != NULL) 
                    {
                        foreach ($query_installment as $rowupdate_installment)
                        {
                            $installment_name  = $rowupdate_installment['name_of_installment'];
                        }
                    }

                    $link_sent_date = date('Y-m-d', strtotime($payment_row['creation_time']));
                    if($payment_row['process_date']!='0000-00-00 00:00:00')
                    { 
                        $process_date = date('Y-m-d H:i:s', strtotime($payment_row['process_date']));
                    }else{
                        $process_date ='';
                    }
                    $ret_data = array(
                                        'ref_no' => $payment_row['ref_no'],
                                        'student_name' => $data['full_name'], 
                                        'payment_class_name' => $class_name,
                                        'collection_type' => $payment_row['collection_type'],
                                        'payplan_name' => $data['payplan_name'],
                                        'installment_name' => $installment_name, 
                                        'financial_year' => $payment_row['financial_year'],
                                        'academic_year' => $payment_row['academic_year'],
                                        'hit_count' => $payment_row['hit_count'],
                                        'link_sent_date' => $link_sent_date,
                                        'process_date' => $process_date,
                                        'order_id' => $payment_row['order_id'],
                                    );
                    array_push($payment_link_data,$ret_data);
                }
            }
        }
        $data['payment_link_data'] = $payment_link_data;
        $data['main_content'] = array('account/payment_link/view_payment_data');
        $this -> load -> view('bootstrap_templates/main_template', $data);
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

## send_welcome_notification
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is responsible for sending a welcome notification to a student who has been accepted into a school. It retrieves the necessary data from the database, constructs the notification message, and sends it to the student's mobile device using a push notification service. The function also saves the notification data in the database for future reference.

### User Acceptance Criteria
```gherkin
Feature: Send Welcome Notification
Scenario: Successful notification
Given a student with reference number 'refno'
And the student is enrolled in class 'class_id'
And the student's school ID is 'school_id'
When the send_welcome_notification function is called
Then a welcome notification is sent to the student
And the notification data is saved in the database
```

### Refactoring
1. Extract the construction of the notification message into a separate function for better code organization.
2. Move the database retrieval logic to a separate function to improve separation of concerns.
3. Use a dependency injection approach to decouple the function from the Student_app_model and School_model classes.
4. Consider using a template engine or a more structured approach for constructing the notification message to improve readability and maintainability.

{{< details "source code " >}}
```php
public function send_welcome_notification($refno,$class_id,$school_id)
    {
        $original_preview_content = '<p style="font-size: 14px;">Congratulations! You'."'".'re in! Welcome to the Walnut Family. You have made the right choice by choosing Walnut School to advance your child'."'".'s education and personality. You will shortly get an email and message on the Wal-Sh app giving you details of the next steps.</p>';

        $db_name = $this-> School_model ->fetch_school_db($school_id);

        $data['ref_no']           = $refno;
        $data['class_id']         = $class_id;
        $data['division_id']      = NULL;
        $data['subject_id']       = 'Any Subject';
        $data['unit_id']          = 'Any Unit';
        $data['type']             = 'Notification';
        $data['title']            = 'Congratulations!You'."'".'re in! Welcome to the Walnut Family. Check out the Wal-Sh app for further details.';
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
           $mobile_numbers = $this -> Student_app_model -> search_mobile_registry($refno, $school_id, $class_id); 
            if(count($mobile_numbers) > 0){
                //For SMS, the title is empty, so use content
                $subject_content = $data['title'];
                if($subject_content == null || $subject_content == ''){
                    $subject_content = $data['detail_text_area'];
                }
                Send_push_notification_helper::send_push_notification($mobile_numbers, $subject_content, "{}");
            }
            return TRUE;
        } else {
            return FALSE;
        }
    }
```
{{< /details >}}

## Risks & Security Issues
**Code block 1**: 1. Potential performance issues if the defaulter check is performed on a large number of users.
2. Incomplete or incorrect defaulter information may lead to incorrect results.

**__construct**: 

**index**: 

**fetch_student_details**: 1. The function does not handle the case where the reference number is not found in the Student_model.
2. The function does not handle any errors that may occur during the fetching of data from the models.
3. The function does not have any input validation for the collection type and reference number.

**fetch_installment_details**: There is a risk of the function returning incorrect installment details if there are any issues with the data retrieval or computation.

**fetch_entity_details**: 1. The function assumes that the session contains a `school_id` value.
2. The function assumes that the input contains the necessary parameters.
3. The function does not handle any errors that may occur during the retrieval of entity details.
4. The function does not have any error handling or logging mechanisms.

**fetch_transaction_details**: 1. The function is quite long and contains a lot of nested if-else statements, which can make it difficult to understand and maintain.
2. There are several variables that are not properly initialized or used, which can lead to unexpected behavior.
3. The function does not have any error handling or validation for input parameters, which can result in errors or unexpected behavior if invalid data is passed.

**save_transaction**: 1. The function does not handle errors properly and does not provide meaningful error messages.
2. The function has a lot of commented out code which can be confusing.
3. The function has a mix of business logic and database operations, which can make it harder to understand and maintain.
4. The function does not have proper input validation and error handling for the `api_call` parameter.

**generate_receipt**: 1. The function does not handle cases where the transaction data or payment data is empty or null.
2. The function does not handle errors that may occur during the generation of the receipt PDF.
3. The function does not handle cases where the refund data is empty or null.
4. The function does not handle cases where the `$is_mail` parameter is not provided.

**receipt_pdf**: 1. The function is tightly coupled with the School_model, which may make it difficult to test and maintain.
2. The function does not handle any error cases or validation of input parameters.
3. The function does not have any error handling or logging mechanism in case of failures.
4. The function does not have any input validation or sanitization, which may lead to security vulnerabilities.
5. The function does not have any error handling or fallback mechanism in case the receipt generation or email sending fails.

**mail_receipt**: 1. The function assumes that the Send_mail_helper class is available and functioning correctly.
2. The function assumes that the Student_model, Fee_model, and Send_mail_helper classes are properly configured and have the necessary methods.
3. The function does not handle any errors or exceptions that may occur during the email sending process.
4. The function does not handle any errors or exceptions that may occur during the fetching of parent emails or the generation of the email content.
5. The function does not handle any errors or exceptions that may occur during the fetching of the email sender information.
6. The function does not handle any errors or exceptions that may occur during the fetching of the welcome email flag.
7. The function does not handle any errors or exceptions that may occur during the sending of the welcome email.

**convert_student_status**: 1. The function does not handle errors or exceptions that may occur during the database operations.
2. The function does not handle errors or exceptions that may occur during the Google Classroom operations.
3. The function does not handle cases where the required parameters are not provided or are invalid.

**is_mobile**: 

**receipt_attachment**: 1. The function assumes that the Dompdf library is located in the 'library/dompdf/autoload.inc.php' file relative to the application's root directory. If the library is moved or renamed, the function will break.
2. The function does not handle any errors that may occur during the PDF generation or file saving process. If an error occurs, it will not be caught or reported.

**welcome_email_service**: 1. The function assumes that the necessary data exists in the database and does not handle cases where the data is missing.
2. The function sends the email to a hardcoded email address instead of using the parent's email address.
3. The function does not handle errors that may occur during the email sending process.
4. The function does not handle cases where the email content is empty or invalid.
5. The function does not handle cases where the email attachments are missing or invalid.

**fetch_deposit_details**: 1. The function does not handle cases where the `get_parent_emails` method or the `fetch_trahistory_details` method return NULL.
2. The function does not handle cases where the `welcome_email_service` method returns an error or exception.
3. The function does not handle cases where the `check_concession_present` method returns NULL.

**generate_receipt_link**: 1. The function does not handle cases where the `receipt_json` parameter is not provided or is invalid.
2. The function does not handle cases where the fetched transaction history or payment data is empty.
3. The function does not handle cases where the generated receipt PDF is not saved successfully.
4. The function does not handle cases where the generated receipt PDF is not accessible or has incorrect content.

**receipt_pdf_link**: 1. The function does not handle any error cases or validation of input parameters.
2. The function directly accesses the School_model, which may introduce coupling and make testing more difficult.
3. The function does not have any error handling or exception handling mechanisms.
4. The function does not have any logging or debugging mechanisms to aid in troubleshooting issues.

**send_undertaking_form**: 1. The function does not handle cases where the parent data is empty.
2. The function does not handle cases where the email sending fails.
3. The function does not handle cases where the file ID retrieval fails.
4. The function does not handle cases where the email attachment fails.

**generate_student_otp**: 1. The function does not handle any exceptions that may occur during the OTP generation process.
2. The function does not validate the user input for the reference number and school ID.
3. The function does not handle any errors that may occur during the SMS and email sending operations.
4. The function does not provide any error messages or feedback to the user in case of failures.

**validate_parent_otp**: 

**view_pending_transaction**: 1. The function is currently tightly coupled to the Fee_model, Student_model, and Class_division_model. Any changes to these models may require modifications to this function.
2. The function does not handle any error cases or exceptions. If any database queries fail, the function will not display any error messages to the user.

**save_in_student_app**: 1. The function does not handle any exceptions or errors that may occur during database operations.
2. The function does not validate the input parameters.
3. The function does not have any error logging or error reporting mechanism.

**send_welcome_notification**: 1. The function assumes that the Student_app_model and School_model classes are available and correctly implemented.
2. The function does not handle any errors or exceptions that may occur during the database retrieval or push notification sending process.
3. The function does not provide any feedback or error messages to the caller in case of failure to send the notification or save the data in the database.

