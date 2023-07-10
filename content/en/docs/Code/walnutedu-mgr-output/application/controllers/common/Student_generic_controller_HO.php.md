+++
categories = ["Documentation"]
title = "Student_generic_controller_HO.php"
+++

## File Summary

- **File Path:** application\controllers\common\Student_generic_controller_HO.php
- **LOC:** 1849
- **Last Modified:** Git logs not found
- **Number of Commits (Total / Last 6 Months / Last Month):** Git logs not found
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** Git logs not found
- **Top Contributors:** Git logs not found

{{< details "File source code " >}}
```php
<?php
class Student_generic_controller_HO extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		@session_start();
		date_default_timezone_set('Asia/Kolkata');
		Check_Access_helper::is_logged_in();
		$this-> load ->model('common/Class_division_model');
		$this-> load ->model('student/Generic_specific_model');
		$this-> load ->model('mobile/Student_app_model');
		$this->load->model('common/Student_model');
		$this -> load -> model('common/Employee_model');
		$this -> load -> model('common/School_model');
		$this->load->model('student/Student_find_model');
		$this -> load -> model('common/Class_division_model');
		$this-> load ->helper('file');
		$this-> load ->library('Amazon_aws');
		$this -> load -> model('common/Generic_model');
	}

	public function index()
	{
		$data['page_data']['page_name'] = 'Generic Module';
		$data['page_data']['page_icon'] = 'fa fa-envelope';
		$data['page_data']['page_title'] = 'Generic Email';
		$data['page_data']['page_date'] = date("d M Y");
		$data['page_data']['page_description'] = 'This is module that manages movement of Generic Email';
		$data['page_data']['breadcrumb'] = '<li>Administrator</li>  <li class="active">Manage Generic Email</li>';

		$data['page_data']['glob_flag'] = '';
		$data['page_data']['template_id'] = '';
		$data['page_data']['all_rows'] = NULL;

		$data['class_id'] = NULL;
		$data['division_id'] = NULL;
		$data['sel_class_id'] = NULL;
		$data['sel_status'] = NULL;

		$school_data = $this -> School_model ->fetch_all_school_data();
        if ($school_data != NULL)
        {
            $data['page_data']['school_data'] = $school_data;
        }else{
            $data['page_data']['school_data'] = NULL;
        }

		$data['main_content'] = array('student/generic_specific/view_generic_email_ho');
		$this -> load -> view('templates/main_template', $data);
	}

	public function show_mail_type(){

		$sel_school_id = $_POST['selected_school_id_post']; 
		$data['page_data']['sel_school_id'] = $sel_school_id;

		$school_data = $this -> School_model ->fetch_all_school_data();
        if ($school_data != NULL)
        {
            $data['page_data']['school_data'] = $school_data;
        }else{
            $data['page_data']['school_data'] = NULL;
        }

		$ui_selection = "Generic Module";

		$data['page_data']['page_name'] = $ui_selection;
		$data['page_data']['page_icon'] = 'fa fa-envelope';
		$data['page_data']['page_title'] = 'Generic Module';
		$data['page_data']['page_date'] = date("d M Y");
		$data['page_data']['template_id'] = '';
		$data['page_data']['glob_flag']= '';
		$data['sel_class_id'] = NULL;
		$data['attachment_path'] = $this -> amazon_aws -> get_attachment_directory();


		if (isset($_POST['selected_module_type'])) {	

			$data['page_data']['selected_type'] = $_POST['selected_module_type'];

				//---- Get all Class data from all database ----
		        $returned_data = $this -> Generic_model -> get_class_data_ho();
		        if ($returned_data != NULL && $returned_data != '') {
		            $data['page_data']['class_rows'] = $returned_data;
		        }else{
		            $data['page_data']['class_rows'] = NULL;
		        }

				$data['page_data']['selected_module_type'] = 'generic';
				$data['main_content'] = array('student/generic_specific/view_generic_email_ho');
				$this -> load -> view('templates/main_template', $data);

			// Neither Generic nor Specific Module Selected
			if ($sel_school_id == '' || $sel_school_id == NULL ) {
				redirect('generic_mail_sms');
			}

		} else {	// Triggers on Generic Refno OR Class-Div-Status selection

			$sel_school_id = $_POST['school_id_ref'];
			$data['page_data']['sel_school_id'] = $sel_school_id; 

			$staff_info = $this -> Generic_model -> get_walnut_user_employee_details_ho($sel_school_id);
			if ($staff_info != NULL && $staff_info != ''){
				$data['page_data']['staff_info'] = $staff_info;
			}else{
				$data['page_data']['staff_info'] = NULL;
			}

			$super_admin_data = $this -> Generic_specific_model -> get_super_admin_data();
			if ($super_admin_data != NULL && $super_admin_data != "") {
				$data['page_data']['super_admin_data'] = $super_admin_data;
			}else
				$data['page_data']['super_admin_data'] = NULL;
				
			$all_template = $this -> Generic_model -> get_all_templates_generic_ho($sel_school_id);
			if ($all_template != NULL && $all_template != '') {
				$data['page_data']['templates'] = $all_template;
			}else{
				$data['page_data']['templates'] = NULL;
			}		

			// Selection by Comma separated REFNOS
			if ( isset($_REQUEST['ref_no']) && $_REQUEST['ref_no'] != NULL)
			{
				$ref_no_array = explode(',', $_POST['ref_no']);
				
				$all_rows = $this -> Generic_model -> get_all_mail_ids_ho($ref_no_array, $sel_school_id);
				if ($all_rows != NULL && $all_rows != '') {
					$data['page_data']['all_rows'] = $all_rows;

					$all_rows_array = $all_rows->result_array();

					$class_array = array();
					$division_array = array();

					for ($i = 0; $i < count($all_rows_array); $i++) { 
						array_push($class_array, $all_rows_array[$i]['admission_to']);
						array_push($division_array, $all_rows_array[$i]['division']);
					}

					$unique_class_array = array_unique($class_array);
					$unique_division_array = array_unique($division_array);

					$data['class_id'] = implode(",",$unique_class_array);
					$data['division_id'] = implode(",",$unique_division_array);
					
					$teacher_data = $this -> Generic_model -> get_teacher_data_ho($data, $sel_school_id);
					
					if ($teacher_data != NULL && $teacher_data != '') {
						$data['page_data']['teacher_data'] = $teacher_data;
					}else{
						$data['page_data']['teacher_data'] = NULL;
					}
				}else{
					$data['page_data']['all_rows'] = NULL;
					$_SESSION['msg'] = "Entered Refnos data not available!";
					redirect('generic_mail_sms');
				}

				$data['page_data']['comma_seperated_refno'] = 'YES';
				$data['page_data']['sel_divsion_id'] = array();
				$data['page_data']['selected_module_type'] = $_POST['selected_type'];
				$data['page_data']['selected_type'] = $_POST['selected_type'];
				$data['page_data']['refnos'] = implode(",", $ref_no_array);

			} else {

				// Selection by Class-Division-Status
				if (isset($_POST['class_id']) )
				{
					$returned_data = $this -> Generic_model -> get_class_data_ho();
					if ($returned_data != NULL && $returned_data != ''){
						$data['page_data']['class_rows'] = $returned_data;
					}else{
						$data['page_data']['class_rows'] = NULL;
					}

					// *************************** All Classes ************************
					if($_POST['class_id'][0] == 0) 
					{	
						$class_array = array();
						$returned_data = $this -> Generic_model -> get_classes_ho();
						if ($returned_data != NULL && $returned_data != '') {
							$class_data_array = $returned_data->result_array();
							for ($i=0; $i < count($class_data_array); $i++) { 
								$class_array[$i] = $class_data_array[$i]['class_id'];
							}
						}else{
							$class_array = array();
						}

						if(isset($_POST['status']) && $_POST['status'][0] != 0){
							$status = implode(',', $_POST['status']);
						}else{
							$status = "";
						}

						$all_rows = $this -> Generic_model -> get_all_only_classes_data_generic($class_array, $status, $sel_school_id);
						if ($all_rows != NULL && $all_rows != '') {
							$data['page_data']['all_rows'] = $all_rows;
						}else{
							$data['page_data']['all_rows'] = NULL;
							$_SESSION['msg'] = "Entered Refnos data not available!";
						}

				        $teacher_data = $this -> Generic_model -> get_all_teacher_ho($sel_school_id);
						if ($teacher_data != NULL && $teacher_data != '') {
							$data['page_data']['teacher_data'] = $teacher_data;
						}else{
							$data['page_data']['teacher_data'] = $teacher_data;
						}

				        $data['page_data']['selected_module_type'] = $_POST['selected_type'];
						$data['page_data']['selected_type'] = $_POST['selected_type'];
			        	$data['page_data']['sel_class_id'] = $_POST['class_id'][0];
			        	$data['page_data']['division_rows'] = null;
			        	$data['page_data']['sel_divsion_id'] = array();
			        	$data['page_data']['sel_status'] = $status;

						$mail_template = read_file('./application/views/student/generic_specific/email_template.txt');
				        if ($mail_template != NULL && $mail_template != '') {
							$data['page_data']['preview_content'] = $mail_template;
						}else{
							$data['page_data']['preview_content'] = NULL;
						}
					}else if($_POST['class_id'][0] == 1)
					{
						// ***********************KG classes **************************
						$class_array = array();
						$returned_data = $this -> Generic_model -> get_classes_ho();
						if ($returned_data != NULL && $returned_data != '') 
						{
							$class_data_array = $returned_data->result_array();
							for ($i=0; $i < count($class_data_array); $i++) 
							{ 
								if ($class_data_array[$i]['class_id'] < 12) 
								{
									$class_array[$i] = $class_data_array[$i]['class_id'];
								}
							}
						}else{
							$class_array = array();
						}

						if(isset($_POST['status']) && $_POST['status'][0] != 0){
							$status = implode(',', $_POST['status']);
						}else{
							$status = "";
						}

						$data['class_id'] = implode(",",$class_array);
						$data['division_id'] = '';

						$all_rows = $this -> Generic_model -> get_all_only_classes_data_generic($class_array, $status, $sel_school_id);
						if ($all_rows != NULL && $all_rows != '') 
						{
								$data['page_data']['all_rows'] = $all_rows;
						}else{
							$data['page_data']['all_rows'] = NULL;
							$_SESSION['msg'] = "Entered Refnos data not available!";
						}

				        $teacher_data = $this -> Generic_model -> get_teacher_data_ho($data, $sel_school_id);
						if ($teacher_data != NULL && $teacher_data != '') {
							$data['page_data']['teacher_data'] = $teacher_data;
						}else{
							$data['page_data']['teacher_data'] = $teacher_data;
						}

				        $data['page_data']['selected_module_type'] = $_POST['selected_type'];
						$data['page_data']['selected_type'] = $_POST['selected_type'];
			        	$data['page_data']['sel_class_id'] = $_POST['class_id'][0];
			        	$data['page_data']['division_rows'] = null;
			        	$data['page_data']['sel_divsion_id'] = array();
			        	$data['page_data']['sel_status'] = $status;

						$mail_template = read_file('./application/views/student/generic_specific/email_template.txt');
				        if ($mail_template != NULL && $mail_template != '') {
							$data['page_data']['preview_content'] = $mail_template;
						}else{
							$data['page_data']['preview_content'] = NULL;
						}
					}else if($_POST['class_id'][0] == 2)
					{
						// *********************** Primary classes **************************
						$class_array = array();
						$returned_data = $this -> Generic_model -> get_classes_ho();
						if ($returned_data != NULL && $returned_data != '') 
						{
							$class_data_array = $returned_data->result_array();
							for ($i=0; $i < count($class_data_array); $i++) 
							{ 
								if(($class_data_array[$i]['class_id']) > 11)
								{
									if(($class_data_array[$i]['class_id'] != 20) && ($class_data_array[$i]['class_id'] != 21) && ($class_data_array[$i]['class_id'] != 22))
									{
										$class_array[$i] = $class_data_array[$i]['class_id'];
									}
								}
							}
						}else{
							$class_array = array();
						}

						if(isset($_POST['status']) && $_POST['status'][0] != 0){
							$status = implode(',', $_POST['status']);
						}else{
							$status = "";
						}
						$data['class_id'] = implode(",",$class_array);
						$data['division_id'] = '';

						$all_rows = $this -> Generic_model -> get_all_only_classes_data_generic(array_values($class_array), $status, $sel_school_id);
						if ($all_rows != NULL && $all_rows != '') 
						{
								$data['page_data']['all_rows'] = $all_rows;
						}else{
							$data['page_data']['all_rows'] = NULL;
							$_SESSION['msg'] = "Entered Refnos data not available!";
						}

				        $teacher_data = $this -> Generic_model -> get_teacher_data_ho($data, $sel_school_id);
						if ($teacher_data != NULL && $teacher_data != '') {
							$data['page_data']['teacher_data'] = $teacher_data;
						}else{
							$data['page_data']['teacher_data'] = $teacher_data;
						}

				        $data['page_data']['selected_module_type'] = $_POST['selected_type'];
						$data['page_data']['selected_type'] = $_POST['selected_type'];
			        	$data['page_data']['sel_class_id'] = $_POST['class_id'][0];
			        	$data['page_data']['division_rows'] = null;
			        	$data['page_data']['sel_divsion_id'] = array();
			        	$data['page_data']['sel_status'] = $status;

						$mail_template = read_file('./application/views/student/generic_specific/email_template.txt');
				        if ($mail_template != NULL && $mail_template != '') {
							$data['page_data']['preview_content'] = $mail_template;
						}else{
							$data['page_data']['preview_content'] = NULL;
						}
					}else if(count($_POST['class_id']) > 1){
						// *********************** Multiple classes **************************
						 $class_array = array();
						foreach ($_POST['class_id'] as $selectedOption)
						{
							 array_push($class_array, $selectedOption);
						}

						$data['class_id'] = implode(",",$class_array);	
						$returned_data = $this -> Generic_model -> get_classes_ho();
						if ($returned_data != NULL && $returned_data != '') 
						{
							 $data['page_data']['class_rows'] = $returned_data; 
						}else{
							$data['page_data']['class_rows'] = NULL;
						}
						
						if(isset($_POST['status']) && $_POST['status'][0] != 0)
						{
							$status = implode(',', $_POST['status']);
						}else{
							$status = "";
						}
						$data['class_id'] = implode(",",$class_array);
						$data['division_id'] = '';

						$all_rows = $this -> Generic_model -> get_all_only_classes_data_generic(array_values($class_array), $status, $sel_school_id);
						if ($all_rows != NULL && $all_rows != '') 
						{
								$data['page_data']['all_rows'] = $all_rows;
						}else{
							$data['page_data']['all_rows'] = NULL;
							$_SESSION['msg'] = "Entered Refnos data not available!";
						}

				        $teacher_data = $this -> Generic_model -> get_teacher_data_ho($data, $sel_school_id);
						if ($teacher_data != NULL && $teacher_data != '') {
							$data['page_data']['teacher_data'] = $teacher_data;
						}else{
							$data['page_data']['teacher_data'] = $teacher_data;
						}

				        $data['page_data']['selected_module_type'] = $_POST['selected_type'];
						$data['page_data']['selected_type'] = $_POST['selected_type'];
			        	$data['page_data']['sel_class_id'] = $_POST['class_id'];
			        	$data['page_data']['division_rows'] = null;
			        	$data['page_data']['sel_divsion_id'] = array();
			        	$data['page_data']['sel_status'] = $status;

						$mail_template = read_file('./application/views/student/generic_specific/email_template.txt');
				        if ($mail_template != NULL && $mail_template != '') {
							$data['page_data']['preview_content'] = $mail_template;
						}else{
							$data['page_data']['preview_content'] = NULL;
						}
					}else {	
						// *********************** Unique Classes-Division **************************
						if (isset($_REQUEST['division_id']))
						{
							$class_id = $_POST['class_id'][0];

							$division_data = $this -> Generic_model -> get_division_data_gen($class_id, $sel_school_id);
							if ($division_data != NULL && $division_data != '') {
								$data['page_data']['division_rows'] = $division_data;
							}else{
								$data['page_data']['division_rows'] = NULL;
							}

							$division_array = array();
							foreach ($_POST['division_id'] as $division){
								array_push($division_array, $division);
							}
							$data['class_id'] = $class_id;
							$data['division_id'] = implode(",",$division_array);

							if(isset($_POST['status']) && $_POST['status'][0] != 0){
								$status = implode(',', $_POST['status']);
							}else{
								$status = "";
							}
							
							$all_rows = $this -> Generic_model -> get_all_data_generic($data, $status, $sel_school_id);

							if ($all_rows != NULL && $all_rows != '') {
								$data['page_data']['all_rows'] = $all_rows;
							}else{
								$data['page_data']['all_rows'] = NULL;
							}

							$teacher_data = $this -> Generic_model -> get_teacher_data_ho($data, $sel_school_id);

							if ($teacher_data != NULL && $teacher_data != '') {
								$data['page_data']['teacher_data'] = $teacher_data;
							}else{
								$data['page_data']['teacher_data'] = NULL;
							}
							
							$data['page_data']['selected_module_type'] = $_POST['selected_type'];
							$data['page_data']['selected_type'] = $_POST['selected_type'];
							$data['page_data']['sel_class_id'] = $_POST['class_id'];
							$data['page_data']['sel_divsion_id'] = $division_array;
							$data['page_data']['sel_status'] = $status;

							$mail_template = read_file('./application/views/student/generic_specific/email_template.txt');
							if ($mail_template != NULL && $mail_template != '') {
								$data['page_data']['preview_content'] = $mail_template;
							}else{
								$data['page_data']['preview_content'] = NULL;
							}
						} else {
							redirect('generic_mail_sms');
						}
					}
				} else {
					$data['page_data']['all_rows'] = NULL;
					$_SESSION['msg'] = "Class not selected!";
					redirect('generic_mail_sms');
				}
				$data['page_data']['comma_seperated_refno'] = 'NO';
			}

			// Get Super admin and admin data of HO 
			$user_role = array(10,11);
			$ho_result = $this -> Employee_model -> get_walnut_user_employee_details(0,$user_role);
			$ho_admin_data = array_map('current', $ho_result);
			$user = $_SESSION['user_id'];
			if(in_array($user, $ho_admin_data))
			{
				$data['valid'] = 1;
			}else{
				$data['valid'] = 0;
			}
			
			$data['main_content'] = array('student/generic_specific/view_generic_email_ho');
			$this -> load -> view('templates/main_template', $data);
		}
	}


    /*
    |--------------------------------------------------------------------------
    | Generic - Test Email
    |--------------------------------------------------------------------------
	|
    | Test Email function for generic module
    |
    */
	public function send_test_email_sms_generic(){

		// Test Email/SMS
		$sel_school_id = $_POST['selected_school_id'];

		if ($_POST['test_email_add'] != NULL || $_POST['test_email_add'] != '') {
			$email_sms_recipient_value = $_POST['test_email_add'];	
		} else {
			$email_sms_recipient_value = NULL;
			echo "Please enter test Email-ID/SMS no.!~FALSE";
			return;
		}

		// Email/SMS Flag
		if (isset($_POST['mail_or_sms'])) {
			if ($_POST['mail_or_sms'] != NULL && $_POST['mail_or_sms'] != '') {
				$mail_or_sms = $_POST['mail_or_sms'];
			}
		}else{
			echo "Please select either E-mail or SMS!~FALSE";
			return;
		}

		// check insert feedback image
		$insert_img_flag = $_POST['feedback_flag'];
		$temp_id = $_POST['temp_id'];
		$sender_id = $_POST['sender_id'];
		$name_template = 'Firstname Lastname';

		$preview_content = read_file('./application/views/student/generic_specific/email_content/generic_email_content_'.$_POST['file_no'].'.txt');
		$preview_content = str_replace('<<name_template>>', $name_template, $preview_content);

		// Mail OR SMS
		if ($mail_or_sms == 'email') {
			$mail_array = array();
			$temp_mail_array =  array(
									'email' => trim($email_sms_recipient_value), 
									'name' => 'TEST',
									'type' => 'to'
								);
			array_push($mail_array, $temp_mail_array);

			$subject_content = read_file('./application/views/student/generic_specific/email_content/generic_subject_content_'.$_POST['file_no'].'.txt');

			if ($insert_img_flag == 1) 
			{	
				// Here For TEST mail we use Random Refno, 1- Feedback id, 0 - Mail format (0 - TEST mail ,1- Sent To ALL)
				$mail_template = $this ->insert_feedback_image($subject_content,$sel_school_id,'ha01',1,0);	
				$preview_content .= $mail_template;
			}

			// Attachment code starts here
			$attachments = array();
			if (isset($_SESSION['attachment_csv_data'])) {

				$csv_data                          = $_SESSION['attachment_csv_data'];
				$send_csv_data                     = array();
				$refnos                            = array_keys($csv_data);
				$send_csv_data['column']           = $csv_data['column'];
				$send_csv_data[$refnos[1]]         = $csv_data[$refnos[1]];
				$send_csv_data['send_to_app_flag'] = FALSE;

				$attachment_result = $this->do_attachment($preview_content, $send_csv_data, $refnos[1]);
				$preview_content = $attachment_result['preview_content'];
				$attachments     = $attachment_result['attachments'];
			}
			// Attachment code ends here
			$email_sender_info = array('module_code' => 'GENERIC_EMAIL', 'school_id' => $sel_school_id, 'ref_sch_id' => '0', 'ref_inst_id' => '0');
			$email_sender = Send_mail_helper::get_sender_data($email_sender_info);

			// BCC Emails
			$email_sender_array = array(
											'sender_name' => $email_sender['sender_name'],
											'from_email'  => $email_sender['from_email'],
							                'school_id'   => $sel_school_id,
							                'bcc_email'   => TRUE
										);
			
			$email_status = Send_mail_helper::send_mail($mail_array, $preview_content, "TEST EMAIL - ".$subject_content, $attachments, $email_sender_array);
			if ($email_status) {
				echo "Test email has been sent to ".$email_sms_recipient_value.". Please check.~TRUE";
			}else{
				echo "Failed! Email not sent.~FALSE";
			}
		}else{
			$preview_content = $preview_content.'##'.$temp_id.'##'.'**'.$sender_id.'**';
			$email_sender_info = array('module_code' => 'GENERIC_EMAIL', 'school_id' => $sel_school_id, 'ref_sch_id' => '0', 'ref_inst_id' => '0');
			$sms_sender = Send_sms_helper::get_sms_sender($email_sender_info);
			$sms_sender_array = array('sms_sender_name' => $sms_sender);

			if ($this->remaining_sms_count() >= 1) {
				$sms_status = Send_sms_helper::send_sms($email_sms_recipient_value, $preview_content,$sms_sender_array);
				if ($sms_status) {
					echo "Test SMS has been sent to ".$email_sms_recipient_value." Please check.~TRUE";
				}else{
					echo "Failed! SMS not sent.~FALSE";
				}
			}else{
				echo "Insufficient SMS balance!~FALSE";
			}
		}
		//Always send test notification to app
		if (true) {
			$push_notification_status = Send_push_notification_helper::send_push_notification(null, "(TEST) ".$subject_content, "{}");
		}		
		return;
	}

    /*
    |--------------------------------------------------------------------------
    | Generic - Refno Validity Check
    |--------------------------------------------------------------------------
	|
    | Checking if refnos are valid
    |
    */
	public function check_ref_no_exist(){
     	$ref_no = explode(',',$_POST['refno']);
     	$sel_school_id = $_POST['selected_school_id'];
     	$ref_no = $this -> Generic_model -> ref_no_exist_ho($ref_no, $sel_school_id);
     	print_r($ref_no);
    }

    /* -----------------------------------------------------------Generic/COMMON Methods Start-------------------------------------------------------------------------- */

    /*
    |--------------------------------------------------------------------------
    | Generic - Send All - Email/SMS
    |--------------------------------------------------------------------------
	|
    | Send to All Selections Email/SMS
    | !Do Not change code in this function!
    |
    */
	public function send_to_all(){

		$sel_school_id = $this->input->post('school_id_mail');

		if (isset($_POST['selected_type'])) {
			if ($_POST['selected_type'] != NULL && $_POST['selected_type'] != "") {
				if($_POST['selected_type'] == 'generic'){
					$ui_selection = "Generic Module";
				}
			}
		} else if (isset($_POST['selected_module_type'])) {
			if ($_POST['selected_module_type'] != NULL && $_POST['selected_module_type'] != "") {
				if($_POST['selected_module_type'] == 'generic'){
					$ui_selection = "Generic Module";
				} 
			}
		}

		$data['page_data']['page_name'] = $ui_selection;
		$data['page_data']['page_icon'] = 'fa fa-envelope';
		$data['page_data']['page_title'] = 'Generic Email';
		$data['page_data']['page_date'] = date("d M Y");
		$data['page_data']['page_description'] = 'This is module that manages movement of Generic Email';
		$data['page_data']['breadcrumb'] = '<li>Administrator</li>  <li class="active">Manage Generic Email</li>';

		// Fetch selected (ticked) refnos POST
		$ref_no_array = array();
		if ($_POST['refno'] != NULL && $_POST['refno'] != '') {

			$attachment_flag = FALSE;
			// If CSV is uploaded for attachment
			if (isset($_SESSION['attachment_csv_data'])) {
				$attachment_flag = TRUE;
				$csv_data = $_SESSION['attachment_csv_data'];
				$refnos = array_keys($csv_data);
				unset($refnos[0]);
				$ref_no_array = array_values($refnos);
			} else {
				$refnos = $_POST['refno'];
				$ref_no_array = explode(',', $refnos);
			}
		}else{
			$_SESSION['msg'] = "Please select recipients";
			redirect('generic_mail_sms');
		}

		// Fetch selected (ticked) teacher POST (If at all)
		$teacher_id_array = NULL ;
		if ($_POST['teacher_id_send'] != NULL && $_POST['teacher_id_send'] != '') {
			$teacher_id_array = str_getcsv($_POST['teacher_id_send']);
		}

		// Fetch selected (ticked) admin POST (If at all)
		$admin_id_array = NULL ;
		if ($_POST['admin_id_send'] != NULL && $_POST['admin_id_send'] != '') {
			$admin_id_array = str_getcsv($_POST['admin_id_send']);
		}

		$msg_type = 'Notification'; // Default value
		if (isset($_POST['message_type'])) {
			$msg_type = $_POST['message_type']; // From UI
		}
		// MAIL/SMS Selection FLAG
		if ($_POST['mail_sms'] != NULL && $_POST['mail_sms'] != '') {
			$mail_or_sms_flag = $_POST['mail_sms'];
		}else{
			$_SESSION['msg'] = "Please select either e-mail or sms";
			redirect('generic_mail_sms');
		}

		$additional_email_sms_array = NULL;
		if ($_POST['additional_email_list'] != NULL && $_POST['additional_email_list'] != '') {
			$additional_email_sms_array = str_getcsv($_POST['additional_email_list']);
		}

		$generic_specific_flag = 0; // Generic (Does send flag)

		if (!isset($_POST['set_flag'])) { // Specific (Does NOT send flag)
			$generic_specific_flag = 1;
		}

		// check send to app checkbox
		$send_to_app_flag = TRUE;
		if ($_POST['send_app'] == '1') {
			$send_to_app_flag = TRUE;
		} else {
			$send_to_app_flag = FALSE;
		}

		// check insert feedback image
		$insert_img_flag = TRUE;
		if ($_POST['email_feedback_check'] == '1') {
			$insert_img_flag = TRUE;
		} else {
			$insert_img_flag = FALSE;
		}
		if ($insert_img_flag == 1)
		{
			if ($mail_or_sms_flag == 'email')
			{ 
				$data['email_subject']      = $_POST['t_name'];
				$data['school_id']          = $sel_school_id;
				$unix_timestamp             = time(); 
				$data['feedback_parameter'] = $unix_timestamp;
				$ret_data = $this -> Generic_specific_model -> insert_feedback_map_data($data);
			}
		}
		$file_no               = $_POST['file_no'];
		$comma_seperated_refno = $_POST['comma_seperated_refno'];
		$class                 = $_POST['sel_class'];
		$division              = $_POST['sel_div'];
		$module_flag           = 0;
		$temp_id               = $_POST['new_temp_id'];
		$sender_id             = $_POST['new_sender_id'];
	
		$this -> send_mail_all($ref_no_array,$teacher_id_array,$admin_id_array,$generic_specific_flag,$file_no,$send_to_app_flag,$comma_seperated_refno,$class,$division,$mail_or_sms_flag,$additional_email_sms_array,$attachment_flag,$csv_data,$module_flag, $sel_school_id,$insert_img_flag,$unix_timestamp,$temp_id,$sender_id);
		// $module_flag = 0 for Send to ALL and $module_flag = 1 for Schedule data
	}

	/*
    |--------------------------------------------------------------------------
    | Generic/Specific - Save Email/SMS in App
    |--------------------------------------------------------------------------
	|
    | Save Email/SMS in App
    |
    */
    public function send_content_to_app($comma_seperated_refno, $refno, $sel_class, $sel_div, $subject_content, $original_preview_content, $msg_type, $sel_school_id){
    	$student_app['ref_no']                    = null;
		$student_app['class_id']                  = null;
		$student_app['division_id']               = null;
		$student_app['subject_id']                = null;
		$student_app['unit_id']                   = null;
		$student_app['subject_content']           = $subject_content;
		$student_app['msg_type']                  = $msg_type;
		$student_app['$original_preview_content'] = $original_preview_content;
		$student_app['sel_school_id'] = $sel_school_id;

	    if ($comma_seperated_refno == 'YES') {
		    $student_app['refno']      = $refno;
	        $student_app['class_id']    = $sel_class;
	        $student_app['division_id'] = $sel_div;
	        $tst = $this->save_in_student_app($student_app);
			if ($tst) {
				return TRUE;
			} else {
				return FALSE;
			}
		}

		// Class-Div selection
	    if ($comma_seperated_refno == 'NO') {

	    	$student_app['refno']      = null;

		    if ($_POST['sel_class'] != '0') {
			    $student_app['class_id']    = $sel_class;
		    	$student_app['division_id'] = str_replace(' ', ',', $sel_div);
		    	if ($this->save_in_student_app($student_app)) {
					return TRUE;
				} else {
					return FALSE;
				}
		    }else{ // Class selected 'All'

		    	$class_div_data = $this-> Generic_model-> get_class_div_data_ho($sel_school_id);
		    	if ($class_div_data) {
		    		$count_of_class_div = count($class_div_data);
		    		$count = 0;
		    		foreach ($class_div_data as $class_div_row) {
		    			$count++;
		    			$student_app['class_id']    = $class_div_row['class_id'];
		    			$student_app['division_id'] = $class_div_row['division_id'];
		    			if ($this->save_in_student_app($student_app)) {
		    				if ($count == $count_of_class_div) {
		    					return TRUE;
		    				}
						} else {
							return FALSE;
						}
			    	}
		    	} else {
		    		return FALSE;
		    	}
		    }
		}
    }

    /*
	 *@return boolean
	 *Save message for student app
     */
    public function save_in_student_app($student_app){

    	$data['ref_no']           = $student_app['refno'];
    	$data['class_id']    	  = $student_app['class_id'];
		$data['division_id'] 	  = $student_app['division_id'];
    	$data['subject_id']       = 'Any Subject';
		$data['unit_id']          = 'Any Unit';
		$data['type']             = $student_app['msg_type'];
		$data['title']            = $student_app['subject_content'];
		$data['desc_area']        = 'Tap to see details';
		$data['issued_by']        = 'Walnut School';
		$data['priority']         = 'Medium';
		$data['starred']          = 'Yes';
		$data['detail_text_area'] = str_replace('"',"'",$student_app['$original_preview_content']);
		$data['detail_link']      = '';

		$data['sel_school_id']    = $student_app['sel_school_id'];


		$data['school_db']        = $_SESSION['database'];

		$data['created_date']     = date("Y-m-d H:i:s");
		$data['modified_date']    = date("Y-m-d H:i:s");
		$returned_app_data = $this -> Student_app_model -> insert_data_ho($data);

		if ($returned_app_data) {
			return TRUE;
		} else {
			return FALSE;
		}
    }

    /* -----------------------------------------------------------Generic/Specific COMMON Methods End-------------------------------------------------------------------------- */


    /* -----------------------------------------------------------Template Handling Methods Start-------------------------------------------------------------------------- */

    /*
    |--------------------------------------------------------------------------
    | Generic - Email Template - Write
    |--------------------------------------------------------------------------
	|
    | Email template write data
    | Mail Content & Mail Subject
    |
    */
	public function write_email_template() {
		$email_content = $_POST['email_content'];
		$mail_type = "generic";
		$template_subject_val = $_POST['template_subject_val'];
		if ($template_subject_val == null && $template_subject_val == "") {
			$template_subject_val = "";
		}
		$random_number = microtime(); // Todo - Use something else which does not have space in between
		// Create and save email ;
		$created_file = fopen('./application/views/student/generic_specific/email_content/'.$mail_type.'_email_content_'.$random_number.'.txt', 'w');
		write_file('./application/views/student/generic_specific/email_content/'.$mail_type.'_email_content_'.$random_number.'.txt', $email_content);

		// Create and save subject content
		$created_file = fopen('./application/views/student/generic_specific/email_content/'.$mail_type.'_subject_content_'.$random_number.'.txt', 'w');
		write_file('./application/views/student/generic_specific/email_content/'.$mail_type.'_subject_content_'.$random_number.'.txt', $template_subject_val);

		echo "Template Saved.~".$random_number;
		return;
	}

    /*
    |--------------------------------------------------------------------------
    | Generic/Specific/Template - Email Template - Save
    |--------------------------------------------------------------------------
	|
    | Email template Save into database
    |
    */
	// public function save_template()
	// {
	// 	$name = $_POST['name'];
	// 	$text = $_POST['text'];
	// 	$school_id = $_POST['school_id'];
	// 	if ($school_id == NULL && $school_id == "") {
	// 		$school_id = 0;
	// 	}
	// 	$subject = $_POST['subject'];
	// 	if ($subject == NULL && $subject == "") {
	// 		$subject = NULL;
	// 	}
	// 	$insert = $this -> Generic_specific_model -> insert_template($name, $subject, $text, $school_id);
	// 	if($insert)echo "Successfully added";
	// }

    /*
    |--------------------------------------------------------------------------
    | Generic Template - Email Template - Write
    |--------------------------------------------------------------------------
	|
    | Email template Update into database
    |
    */
	// public function update_template()
	// {
	// 	$id = $_POST['id'];
	// 	$name = $_POST['name'];
	// 	$text = $_POST['text'];
	// 	$subject = $_POST['subject'];
	// 	$school_id = $_POST['school_id'];
	// 	$update=$this -> Generic_specific_model -> update_template($id, $name, $subject, $text, $school_id);
	// 	if($update)echo ("Updated Successfully");
	// }

    /*
    |--------------------------------------------------------------------------
    | Generic Template - Email Template - Fetch Name
    |--------------------------------------------------------------------------
	|
    | Fetch template name from db
    |
    */
	// public function get_template_name()
	// {
	// 	$id=$_POST['id'];
	// 	$get_template_name = $this -> Generic_specific_model -> get_template_name($id);
	// 	if($get_template_name)echo ($get_template_name[0]['name']);
	// }

	/*
    |--------------------------------------------------------------------------
    | Generic Template - Email Template - Fetch School ID
    |--------------------------------------------------------------------------
	|
    | Fetch School ID from db
    |
    */
	// public function get_school_id()
	// {
	// 	$id=$_POST['id'];
	// 	$get_template_name = $this -> Generic_specific_model -> get_template_name($id);
	// 	if($get_template_name)echo ($get_template_name[0]['school_id']);
	// }

    /*
    |--------------------------------------------------------------------------
    | Generic Template - Email Template - Fetch Content Text
    |--------------------------------------------------------------------------
	|
    | Fetch template content text from db
    |
    */
	// public function get_template_text()
	// {
	// 	$id=$_POST['id'];
	// 	$get_template_text = $this -> Generic_specific_model -> get_template_text($id);
	// 	if($get_template_text)print_r($get_template_text[0]['text']);
	// }

    /*
    |--------------------------------------------------------------------------
    | Generic Template - Email Template - Fetch Content Text
    |--------------------------------------------------------------------------
	|
    | Fetch template content text from db
    |
    */
	// public function get_template_subject()
	// {
	// 	$id=$_POST['id'];
	// 	$get_template_subject = $this -> Generic_specific_model -> get_template_text($id);
	// 	if($get_template_subject){
	// 		print_r($get_template_subject[0]['subject']);
	// 	}else{
	// 		echo "";
	// 	}
	// 	return;
	// }

    /* -----------------------------------------------------------Template Handling Methods End-------------------------------------------------------------------------- */

    /*
    |--------------------------------------------------------------------------
    | Generic/Specific - SMS Balance Check
    |--------------------------------------------------------------------------
	|
    | SMS Service Balance check
    |
    */
	public function remaining_sms_count(){
		$api_url = 'http://www.smssolution.net.in/api/credits.php?workingkey=A40e733b409ffcd4c6a5db2bf054cf6fe';
		$response = file_get_contents($api_url);
		if ($response) {
			$remaining_bal = explode(" ", $response);
			$balance1 = end($remaining_bal);
			$balance2 = rtrim($balance1,'0');
			$balance3 = rtrim($balance2,'.');
			$balance4 = intval($balance3);
			return $balance4;
		}
	}

	public function send_email($email_parameter){
		$attachments = $email_parameter['attachments'];
		$email_sender_info = array(
			'module_code' => $email_parameter['email_code'].'_EMAIL', 
			'school_id'   => $email_parameter['sel_school_id'], 
			'ref_sch_id'  => '0', 
			'ref_inst_id' => '0'
		);
		$email_sender = Send_mail_helper::get_sender_data($email_sender_info);

		$email_sender_array = array(
			'sender_name' => $email_sender['sender_name'],
			'from_email'  => $email_sender['from_email'],
            'school_id'   => $email_parameter['sel_school_id'], 
            'bcc_email'   => TRUE
		);

		$email_status = Send_mail_helper::send_mail($email_parameter['parent_mail_array'], $email_parameter['preview_content'], $email_parameter['subject_content'], $attachments, $email_sender_array);
	}

	/*
    |--------------------------------------------------------------------------
    | Generic/Specific - Upload attachements
    |--------------------------------------------------------------------------
	|
    | @param FILE
    | Mapping of Selected refno and CSV data
    | @return array
    */
	public function upload_attachments(){

		$aws_data = $this-> System_model -> get_aws_data();
		if (isset($_FILES['attachment_file'])) {
			$upload_dir_path = APP_ROOT_PATH.'/application/views/student/generic_specific/email_content/csv/';

			$config['upload_path']          = $upload_dir_path;
	        $config['allowed_types']        = 'csv';

	        $this->load->library('upload', $config);
	        if (!$this->upload->do_upload('attachment_file')) {
	        	echo 'Please upload only CSV file!';
	        	return;
	        } else {
	        	$file_data = array('csv_data' => $this->upload->data());
	        	
	        	$uploaded_file_name = $file_data['csv_data']['raw_name'].$file_data['csv_data']['file_ext'];
	        	$uploaded_file_path = $upload_dir_path.$uploaded_file_name;
	        	chmod ($uploaded_file_path, 0777);
	        	$uploaded_file_data = read_file($uploaded_file_path);

	        	if (!$uploaded_file_data) {
	        		echo 'Error in file uploading!';
	        		return;
	        	}

	        	$csvcontent           = $uploaded_file_data;
				$fieldseparator       = ",";
				$lineseparator        = "\n";
				$row                  = 0;
				$csv_column_array     = array();
				$csv_data_array       = array();

				// selected data from UI
				$selected_refno       = str_getcsv($this->input->post('global_refno_data'), ',');
				$selected_refno_count = count($selected_refno);
				$selected_email_type  = $this->input->post('email_type');
				$attachment_dir_path = $this -> amazon_aws -> get_attachment_directory();
				// get CSV's data
				$formdata               = array();
				$refnos_attachment_data = array();
				$csv_column_count       = 0;

				$csv_row_count = 0;
				foreach (explode($lineseparator, $csvcontent) as $line) {

					$line = trim($line, " \t");
					$line = str_replace("\r", "", $line);
					if ($line == '') {
						continue;
					}
					$formdata = str_getcsv($line, $fieldseparator, "\"");
					for ($i=0; $i < count($formdata); $i++) { 
						$formdata[$i] = trim($formdata[$i]);
					}
					// get CSV's column names
					if ($csv_row_count == 0) {
						$refnos_attachment_data['column'] = $formdata;
						$csv_column_count = count($refnos_attachment_data['column']);

						// Check for minimum 2 column is necessery in CSV
						if ($csv_column_count <= 1) {
							echo 'Inappropriate data. Please check CSV data!';
							return;
						}

						$csv_row_count++;
						continue;
					}

					// Check for CSV column count and CSV data's count is same
					$csv_column_count_per_row = count($formdata);
					if ($csv_column_count != $csv_column_count_per_row) {
						echo 'Data row has less columns. Please check CSV data!';
						return;
					}

					// check whether CSV is uploaded according selected Email Type
					if ($selected_email_type == 'generic') {
						if (!($formdata[0] == 'All')) {
							echo 'Wrong CSV uploaded!';
							return;
						}
					}	

					// For unique attachment(SPECIFIC Email)
					if (in_array($formdata[0], $selected_refno)) {
						for ($i=0; $i < $csv_column_count_per_row; $i++) {
							if ($i != 0) {

								// If any file is not associated with keyword
								if ($formdata[$i] == '-') {
									continue;
								}

								chmod ($uploaded_file_path, 0777);

								// Check whether file name is empty
								if ($formdata[$i] == '') {
									echo 'File name is not mentioned. Please check CSV data!';
									return;
								}

								// Check file extension
								$file_extension = pathinfo($attachment_dir_path.$formdata[$i], PATHINFO_EXTENSION);
								if ($file_extension == '') {
									echo 'File extension is not given. Please check CSV data!';
									return;
								}
								$file_exit = $this -> amazon_aws ->check_file_exist($formdata[$i],$aws_data);
								// Check whether file is exist
								if (!$file_exit) {
									echo 'Attachment not found!: '.$attachment_dir_path.$formdata[$i];
									return;
								}
							}
						}
						$refnos_attachment_data[$formdata[0]] = $formdata;
						$csv_row_count++;
					} else if($formdata[0] == 'All'){ 
						// For common attachment(GENERIC and SPECIFIC Email)
						for ($i=0; $i < $csv_column_count_per_row; $i++) {
							if ($i != 0) {

								// If any file is not associated with keyword
								if ($formdata[$i] == '-') {
									continue;
								}

								chmod($uploaded_file_path, 0777);

								// Check whether file name is empty
								if ($formdata[$i] == '') {
									echo 'File name is not mentioned. Please check CSV data!';
									return;
								}

								// Check file extension
								$file_extension = pathinfo($attachment_dir_path.$formdata[$i], PATHINFO_EXTENSION);
								if ($file_extension == '') {
									echo 'File extension is not given. Please check CSV data!';
									return;
								}
                                $file_exit = $this -> amazon_aws ->check_file_exist($formdata[$i],$aws_data);
								// Check whether file is exist
								if (!$file_exit) {
									echo 'Attachment not found!: '.$attachment_dir_path.$formdata[$i];
									return;
								}
							}
						}

						for ($j=0; $j < $selected_refno_count; $j++) { 
							$refnos_attachment_data[$selected_refno[$j]] = $formdata;
						}
						$_SESSION['attachment_csv_data'] = $refnos_attachment_data;
						unlink($uploaded_file_path);
						echo 'TRUE';
						return;
						// one attachment for all recipients ends here
					}
				}
				if (($csv_row_count-1 ) == $selected_refno_count) {
					$_SESSION['attachment_csv_data'] = $refnos_attachment_data;
					unlink($uploaded_file_path);
					echo 'TRUE';
					return;
				} else {
					echo 'Selected recipients and recipients from CSV is not same!';
					return;
				}
	        }
		} else {
			echo 'File not uploaded!';
			return;
		}
	}

	/*
    |--------------------------------------------------------------------------
    | Generic - Upload attachements
    |--------------------------------------------------------------------------
    | @param string(email content), array(csv data), string(refno)
    | Image id replace with image tag
    | PDF attachement if exist
    | @return array(preview_content, attachments)
    */
	public function do_attachment($preview_content, $csv_data, $refno){	
		$aws_data            = $this-> System_model -> get_aws_data();
		$attachment_dir_path = $this -> amazon_aws -> get_attachment_directory();
		$file_name            = ''; 
		$file_extensions      = array('png','jpg','jpeg','png');
		$attachment_type      = '';
		$mime_type            = '';
		$attachments          = array();
		$i                    = 0;
		$image_data           = '';
		$preview_content_temp = $preview_content;
		// $value variable contains column names(attachment id) of csv file 
		foreach ($csv_data['column'] as $key => $value) {

			// don't consider first column because it is not attachment id, it is refno
			if ($i == 0) {
				$i++;
				continue;
			}
			$file_name = $csv_data[$refno][$i];
			$i++;
			if ($file_name != '-') {
				    $attachment_path = $attachment_dir_path.$file_name;
					$file_extension = pathinfo($attachment_path, PATHINFO_EXTENSION);
					$content_id     = 'content_id_'.$i;
					$file_contents = $this -> amazon_aws -> get_file_contents($file_name,$aws_data);
            		$content = base64_encode($file_contents['Body']);
    				if (!strpos($preview_content, '$$'.$value.'$$') === FALSE)
    				{
    					if ($csv_data['send_to_app_flag']) {
    						$image_data .= $value.','.$file_name.',';
    					}
    					$image           = '<IMG SRC="'.$attachment_path.'" ALT="Image not available">';
    					$preview_content = str_replace('$$'.$value.'$$', $image, $preview_content);
    					$attachment_type = 'inline';
    					continue;
    				} else {
    					$attachment_type = 'attachment';
    					$mime_type = $file_contents['ContentType'];
    				}
    				array_push($attachments, 
    							array(
					                'name'            => $file_name,
					                'type'            => $mime_type,
					                'content'         => $content,
					                'attachment_type' => $attachment_type,
					                'content_id'      => '<'.$content_id.'>'
	                            )
    						);
			}
		}
		$result =  array(
						'preview_content' => $preview_content,
						'attachments'     => $attachments,
						'content_for_app' => rtrim($image_data, ',').'~'.$preview_content_temp
					);
		return $result;
	}

	//Insert Generic_Specific Schedule data 
	public function insert_schedule_data()
	{
		$data['sel_school_id']              = $this->input->post('school_id_mail');

		$data['refnos']                     = $_POST['refno'];
		$data['teacher_id_array']           = $_POST['teacher_id_send'];
		$data['admin_id_array']             = $_POST['admin_id_send'];
		$data['msg_type']                   = $_POST['message_type']; // Default value
		$data['mail_or_sms']                = $_POST['mail_sms'];
		$data['additional_email_sms_array'] = $_POST['additional_email_list'];
		$data['csv_refno']                  = $_POST['comma_seperated_refno'];
		$data['file_no']                    = $_POST['file_no'];
		$generic_specific_flag = 0; // Generic (Does send flag)
		if (!isset($_POST['set_flag'])) 
		{ // Specific (Does NOT send flag)
			$generic_specific_flag = 1;
		}
		$data['set_flag']                   = $generic_specific_flag;
		$data['class']                      = str_replace(' ', ',', $_POST['sel_class']);
		$data['division']                   = str_replace(' ', ',', $_POST['sel_div']);
		$data['status']                     = $_POST['new_status'];
		$data['template']                   = $_POST['t_name'];
		if (isset($_SESSION['attachment_csv_data']))
		{
			$data['attachment_flag']        = 1;
			$csv_data                  		= $_SESSION['attachment_csv_data'];
			$data['attachment']        		= json_encode($csv_data );
		}else{
			$data['attachment_flag']        = 0;
		}
		$data['send_to_app']                = $_POST['send_app'];
		$data['schedule_datetime']          = $_POST['date_time'];
		$data['schedule_type']              = 'Once';
		$data['img_flag']                   = $_POST['email_feedback_check'];
			
		$ret_schedule_data = $this -> Generic_model -> insert_schedule_data_ho($data);
		if ($ret_schedule_data != NULL)
		{
			echo "1";return; 
		}
	}  

	// Schedule Email_SMS data according to Scheduled Date and Time
	public function schedule_email_sms()
	{
		$data['page_data']['page_name']         = 'Schedule data';
        $data['page_data']['page_icon']         = 'fa fa-pencil-square-o';
        $data['page_data']['page_title']        = 'Schedule data';
        $data['page_data']['page_date']         = date("d M Y");
        $data['page_data']['page_description']  = '';
        $schedule_data = $this -> Generic_model -> get_all_schedule_data_ho();

      	if ($schedule_data != "" ||  $schedule_data != NULL) {
            $data['schedule_data'] = $schedule_data;
        } else {
            $data['schedule_data'] = NULL; 
        }
        $data['return_class'] = $this -> Generic_model -> get_classes_ho();
        for ($p=0; $p < count($schedule_data); $p++) {
     		for ($i = 0; $i < count($schedule_data[$p]); $i++) 
	     	{ 
	     		$class_id = $schedule_data[$p][$i]->class;
	     		$school_id = $schedule_data[$p][$i]->school_id;
	     		if ($class_id != null && $class_id != '') 
	     		{
	     			$data['return_div']= $this -> Generic_model -> get_division_data_ho($class_id, $school_id);
	     		}
	     	}
	    } 	
		$data['main_content'] = array('student/generic_specific/view_schedule_email_sms_ho');
		$this -> load -> view('bootstrap_templates/main_template', $data);
	}

	//Delete Schedule Data
	public function delete_schedule_data()
	{
		$sel_school_id = $this->input->post('sel_school_id');
		$data['primary_id']  = $this->input->post('primary_id');
        $ret_schedule_delete_data = $this -> Generic_model -> delete_schedule_details_ho($data['primary_id'], $sel_school_id);
        if ($ret_schedule_delete_data == 1)
        {
            echo "1";return;
        } else {
            echo "Could not Delete.";return;
        }
	}

	// Show Student data which is saved for Schedule data
	public function fetch_student_data()
	{
		$refno = explode(',', $this->input->post('refno'));
		$sel_school_id = $this->input->post('sel_school_id');
		$ret_refno_data =  $this -> Generic_model -> get_student_details_ho($refno, $sel_school_id);
		if ($ret_refno_data != NULL) 
        {
            $data['ret_refno_data'] = $ret_refno_data;
        }else{
            $data['ret_refno_data'] = NULL;
        }
		$this-> load -> view('student/generic_specific/view_student_details', $data);
	}

	// Show Teacher data which is saved for Schedule data
	public function fetch_teacher_data()
	{
		$teacher_id =  $this->input->post('teacher_id');
		$sel_school_id = $this->input->post('sel_school_id');
		$ret_teacher_data =  $this -> Generic_specific_model -> get_teacher_admin_details($teacher_id);
		if ($ret_teacher_data != NULL) 
        {
            $data['ret_teacher_data'] = $ret_teacher_data;
        }else{
            $data['ret_teacher_data'] = NULL;
        }
		$this-> load -> view('student/generic_specific/view_teacher_details', $data);
	}

	// Show Admin data which is saved for Schedule data
	public function fetch_admin_data()
	{
		$admin_id =  $this->input->post('admin_id');
		$ret_admin_data =  $this -> Generic_specific_model -> get_teacher_admin_details($admin_id);
		if ($ret_admin_data != NULL) 
        {
            $data['ret_admin_data'] = $ret_admin_data;
        }else{
            $data['ret_admin_data'] = NULL;
        }
		$this-> load -> view('student/generic_specific/view_admin_details', $data);
	}

	// CRON_JOB function to send schedule data.
	public function send_all_schedule_data()
	{
		$schedule_data = $this -> Generic_specific_model -> get_schedule_data();
		if ($schedule_data != NULL) 
		{
			for ($i=0; $i < count($schedule_data) ; $i++)
			{ 
				$ref_no_array               = explode(',', $schedule_data[$i]->refnos);
				$teacher_id_array           = explode(',', $schedule_data[$i]->teacher_id);
				$admin_id_array             = explode(',',$schedule_data[$i]->admin_id);
				$generic_specific_flag      = $schedule_data[$i]->generic_specific_flag;
				$file_no                    = $schedule_data[$i]->file_no;
				$send_to_app_flag           = $schedule_data[$i]->send_to_app;
				$comma_seperated_refno      = $schedule_data[$i]->csv_refno;
				$class                      = $schedule_data[$i]->class;
				$division                   = $schedule_data[$i]->division;
				$mail_or_sms_flag     	    = $schedule_data[$i]->mail_sms;
				$additional_email_sms_array = NULL;
				$additional_email_sms_array = explode(',',$schedule_data[$i]->addtional_emails);
				$attachment_flag            = $schedule_data[$i]->attachment_flag;
				$csv_data                   = json_decode($schedule_data[$i]->attachment,true);
				$module_flag                = 1;
				$data['school_id']          = $schedule_data[$i]->school_id;
				$insert_img_flag            = $schedule_data[$i]->img_flag;
				$data['email_subject']      = $schedule_data[$i]->template_name;
				$unix_timestamp             = time();
				$data['feedback_parameter'] = $unix_timestamp;
				
				if ($insert_img_flag == 1)
				{
					if ($schedule_data[$i]->mail_sms == 'email') 
					{
						$ret_data = $this -> Generic_specific_model -> insert_feedback_map_data($data);
					}
				}

				$this -> send_mail_all($ref_no_array,$teacher_id_array,$admin_id_array,$generic_specific_flag,$file_no,$send_to_app_flag,$comma_seperated_refno,$class,$division,$mail_or_sms_flag,$additional_email_sms_array,$attachment_flag,$csv_data,$module_flag, $data['school_id'],$insert_img_flag,$unix_timestamp,$temp_id,$sender_id);	
			}
		}else{
			echo "NO schedule_data found";return;
		}
	}

	// Main Email_SMS sending functionality for both Send To All and Schedule Data Module
	public function send_mail_all($ref_no_array,$teacher_id_array,$admin_id_array,$generic_specific_flag,$file_no,$send_to_app_flag,$comma_seperated_refno,$class,$division,$mail_or_sms_flag,$additional_email_sms_array,$attachment_flag,$csv_data,$module_flag, $sel_school_id,$insert_img_flag,$unix_timestamp,$temp_id,$sender_id)
	{
		$send_content_to_app_result = TRUE;	
		$email_type = 'specific';
		$email_code = 'SPECIFIC';
		if ($generic_specific_flag != 1)
		{	
			$original_preview_content = read_file('./application/views/student/generic_specific/email_content/generic_email_content_'.$file_no.'.txt');
			$subject_content = read_file('./application/views/student/generic_specific/email_content/generic_subject_content_'.$file_no.'.txt');
			$email_type = 'generic';
			$email_code = 'GENERIC';
		}
		// if ($generic_specific_flag == 1)
		// { // Specific (Does NOT send flag)
		// 	$field_name = $this -> Generic_specific_model -> get_field_name();
		// 	$class_info = $this -> Class_division_model -> get_classes();
		// 	$division_info = $this -> Class_division_model -> get_division_info();
		// 	$csv_data_array = $_SESSION['csv_data_for_send_to_all'];
		// 	$csv_column_array = $_SESSION['csv_column'];
		// }


		$teacher_and_admin_array = array();
		if(!is_array($teacher_id_array))
		{
			$teacher_and_admin_array = $admin_id_array;
		}
		if (!is_array($admin_id_array)) {
			$teacher_and_admin_array = $teacher_id_array;
		}
		if (is_array($teacher_id_array) && is_array($admin_id_array)) {
			$teacher_and_admin_array = array_merge($teacher_id_array, $admin_id_array);
		}
		$teacher_admin_mail_array = array();
		$teacher_admin_mobile_array = array();
		if($teacher_and_admin_array != NULL) {
			$return_staff_info = $this -> Generic_specific_model -> get_staff_data_from_ids($teacher_and_admin_array);
			if ($return_staff_info != NULL || $return_staff_info != '')
			{
				$return_staff_array = $return_staff_info->result_array();
				for ($a = 0; $a < count($return_staff_array ); $a++)
				{
					if ($return_staff_array[$a]['email'] != NULL && $return_staff_array[$a]['email'] != '')
					{
						$arrayName = array(
										'email' => trim($return_staff_array[$a]['email']),
										'name' => $return_staff_array[$a]['first_name']." ".$return_staff_array[$a]['last_name'],
										'type' => 'to'
									);
						array_push($teacher_admin_mail_array, $arrayName);
					}
					if ($return_staff_array[$a]['mobile_no'] != NULL && $return_staff_array[$a]['mobile_no'] != '')
					{
						array_push($teacher_admin_mobile_array,$return_staff_array[$a]['mobile_no']);
					}
				}
			}
		}

		if (!empty($ref_no_array))
		{
			$returned_refno_data = $this -> Generic_model -> get_all_mail_ids_ho($ref_no_array, $sel_school_id);
			if ($returned_refno_data != NULL && $returned_refno_data != '') 
			{
				$refno_data_array = $returned_refno_data->result_array();

				for ($i = 0; $i < count($refno_data_array); $i++)
				{
					// Code to get email content starts here
					// if ($generic_specific_flag == 1)
					// {
					// 	// For Specific Email
					// 	$preview_content = $this -> generate_specific_preview_content($field_name, $class_info, $division_info, $refno_data_array[$i], $csv_column_array, $_SESSION['csv_data_for_send_to_all'], $mail_or_sms_flag, $file_no);
					// 	$subject_content = read_file('./application/views/student/generic_specific/email_content/specific_subject_content_'.$file_no.'.txt');
					// } else {
						// For Generic Email
						$name_template = $refno_data_array[$i]['first_name'].' '.$refno_data_array[$i]['last_name'];
						$refno_template  = $refno_data_array[$i]['refno'];
						$preview_content = str_replace('<<name_template>>', $name_template, $original_preview_content);
						$preview_content = str_replace('$$refno$$', $refno_template, $preview_content);
					// }

					// Code to get email content ends here

					$send_to_app_content = $preview_content;
					// Attachment code starts here
					$attachments = array();
					if ($attachment_flag) {
						$send_csv_data                     = array();
						$send_refno                        = $refno_data_array[$i]['refno'];
						$send_csv_data['column']           = $csv_data['column'];
						$send_csv_data[$send_refno]        = $csv_data[$send_refno];
						$send_csv_data['send_to_app_flag'] = $send_to_app_flag;

						$attachment_result = $this->do_attachment($preview_content, $send_csv_data, $send_refno);
						$preview_content     = $attachment_result['preview_content'];
						$attachments         = $attachment_result['attachments'];
						$send_to_app_content = $attachment_result['content_for_app'];
					}
					// Attachment code ends here

					// Code for Save Message in Student App starts here
					if ($send_to_app_flag) 
					{
						if ($comma_seperated_refno == 'YES') 
						{
							$send_content_to_app_result = $this -> send_content_to_app($comma_seperated_refno, $refno_data_array[$i]['refno'], $refno_data_array[$i]['admission_to'], $refno_data_array[$i]['division'], $subject_content, $send_to_app_content, $msg_type, $sel_school_id);
						} 
						if ($comma_seperated_refno == 'NO') 
						{
							$send_content_to_app_result = $this -> send_content_to_app($comma_seperated_refno, $refno_data_array[$i]['refno'], $class, $division, $subject_content, $send_to_app_content, $msg_type, $sel_school_id);
							$send_to_app_flag = FALSE;
						}
					}

					// Code for Save Message in Student App ends here
					if ($mail_or_sms_flag == 'email')
					{
						if ($insert_img_flag == 1) 
						{	
							$mail_template = $this ->insert_feedback_image($subject_content,$sel_school_id,$refno_data_array[$i]['refno'],$unix_timestamp,1);
							$preview_content .= $mail_template;
						}
					}

					// Code to send email starts here
					if ($mail_or_sms_flag == 'email')
					{
						$parent_mail_array = array();
						// Additional & Admin & Teacher Emails
						if ($i == 0) {
							$teacher_mail_ids = array();
							// Only Additional Emails
							if ($additional_email_sms_array != NULL && !empty($additional_email_sms_array)) {
								for ($a = 0; $a < count($additional_email_sms_array); $a++){
									$arrayName = array(
													'email' => trim($additional_email_sms_array[$a]),
													'name' => '',
													'type' => 'to'
												);
									array_push($teacher_mail_ids, $arrayName);	
								}
							}
							// Only Admin & Teachers Emails
							if ($teacher_admin_mail_array != NULL && !empty($teacher_admin_mail_array)) {
								for ($a = 0; $a < count($teacher_admin_mail_array); $a++){
									array_push($teacher_mail_ids, $teacher_admin_mail_array[$a]);
								}
							}

							$teacher_mail_limit    				  = array();
							$email_parameter['attachments']       = $attachments;
							$email_parameter['preview_content']   = $preview_content;
							$email_parameter['subject_content']   = $subject_content;
							$email_parameter['email_code'] 		  = $email_code;
							$email_parameter['sel_school_id'] 	  = $sel_school_id;

							for ($k = 0; $k < count($teacher_mail_ids) ; $k++) 
							{ 
								array_push($teacher_mail_limit, $teacher_mail_ids[$k]);
								if($k%48 == 0 && $k!=0) 
								{
									$email_parameter['parent_mail_array'] = $teacher_mail_limit;
									$this->send_email($email_parameter);
									$teacher_mail_limit = array();
								}
							}

							if(count($teacher_mail_limit) != 0)
							{
								$email_parameter['parent_mail_array'] = $teacher_mail_limit;
								$this->send_email($email_parameter);
							}
						}
						// Father Emails
						if ($refno_data_array[$i]['father_email_id'] != NULL && $refno_data_array[$i]['father_email_id'] != "" ) {
							$arrayName = array(
											'email' => trim($refno_data_array[$i]['father_email_id']),
											'name' => $refno_data_array[$i]['father_f_name']." ".$refno_data_array[$i]['father_s_name'],
											'type' => 'to'
										);
							array_push($parent_mail_array, $arrayName);
						}

						// Mother Emails
						if ($refno_data_array[$i]['mother_email_id'] != NULL && $refno_data_array[$i]['mother_email_id'] != "" ) {
							$arrayName = array(
											'email' => trim($refno_data_array[$i]['mother_email_id']),
											'name' => $refno_data_array[$i]['mother_f_name']." ".$refno_data_array[$i]['mother_s_name'],
											'type' => 'to'
										);
							array_push($parent_mail_array, $arrayName);
						}

						// Student Emails

						$student_email = $this-> Student_model ->get_student_account_details($refno_data_array[$i]['refno'],$sel_school_id);
			        	$email_id = strtolower($student_email[0]->user_email);
			        	if ($email_id != NULL && $email_id != '')
			        	{			        		
			        		$temp_array = array(
											'email' => trim($email_id),
											'name'  => $refno_data_array[$i]['first_name'],
											'type' => 'to'
										);
				        	array_push($parent_mail_array, $temp_array);
			        	}

						$email_status = TRUE;
						// Check mail array NULL to avoid mail service fail error in between email loop
						if (!empty($parent_mail_array)) 
						{
							$email_sender_info = array('module_code' => $email_code.'_EMAIL', 'school_id' => $sel_school_id, 'ref_sch_id' => '0', 'ref_inst_id' => '0');
							$email_sender = Send_mail_helper::get_sender_data($email_sender_info);

							$email_sender_array = array(
								'sender_name' => $email_sender['sender_name'],
								'from_email'  => $email_sender['from_email'],
					            'school_id'   => $sel_school_id,
					            'bcc_email'   => TRUE
							);
							$email_status = Send_mail_helper::send_mail($parent_mail_array, $preview_content, $subject_content, $attachments, $email_sender_array);
						}
					} else {	// SMS Loop
						$preview_content = $preview_content.'##'.$temp_id.'##'.'**'.$sender_id.'**';
						$mobile_nos = '';
						// Additional & Admin & Teacher Numbers
						if ($i == 0) {
							if ($additional_email_sms_array != NULL) {
								// Additional numbers
								for ($a = 0; $a < count($additional_email_sms_array); $a++) { 
									$temp = $additional_email_sms_array[$a].",";
									$mobile_nos .= $temp;
								}
							}
							// Admin & Teacher numbers
							if ($teacher_admin_mobile_array != NULL) {
								for ($a = 0; $a < count($teacher_admin_mobile_array); $a++) { 
									$temp = $teacher_admin_mobile_array[$a].",";
									$mobile_nos .= $temp;
								}
							}
						}

						// Student SMS Number
						if ($refno_data_array[$i]['student_sms_no'] != NULL && $refno_data_array[$i]['student_sms_no'] != "" ) {
							$temp = $refno_data_array[$i]['student_sms_no'];
							$mobile_nos .= $temp;
						}
						if ($mobile_nos != "") {
							$email_sender_info = array('module_code' => $email_code.'_EMAIL', 'school_id' => $sel_school_id, 'ref_sch_id' => '0', 'ref_inst_id' => '0');
							$sms_sender = Send_sms_helper::get_sms_sender($email_sender_info);
							$sms_sender_array = array('sms_sender_name' => $sms_sender);

							$sms_status = TRUE;
							$sms_status = Send_sms_helper::send_sms($mobile_nos, $preview_content,$sms_sender_array);
						}
					}
				}
			}else{
				$refno_data_array = NULL;
			}

			if ($module_flag == 0)// For Send To all Function
			{
				$app_result_msg = '';
				if (!$send_content_to_app_result) {
					$app_result_msg = "<br>E-Mail/SMS Content not saved for Student App.";
				}
			
				if ($mail_or_sms_flag == 'email')
				{	
					if (isset($_SESSION['attachment_csv_data'])) 
					{
						unset($_SESSION['attachment_csv_data']);
					}
					echo $_SESSION['detail_msg'] = "All Email's have been sent. Please check.".$app_result_msg;
				} else {
					echo $_SESSION['detail_msg'] = "All SMS's have been sent successfully. Please check.".$app_result_msg;
				}
				unlink('./application/views/student/generic_specific/email_content/'.$email_type.'_email_content_'.$file_no.'.txt');
				unlink('./application/views/student/generic_specific/email_content/'.$email_type.'_subject_content_'.$file_no.'.txt');
				redirect('generic_mail_sms');
			}else
			{ 
				//For Schedule data Function
				if ($mail_or_sms_flag == 'email')
				{
					if($email_status)
					{
	        			$returned_data = $this -> Generic_model -> update_send_email_ho($ref_no_array, $sel_school_id);
	    				return true;
	        		}
	        	}else{
	        		if($sms_status)
					{
        				$returned_data = $this -> Generic_model -> update_send_email_ho($ref_no_array, $sel_school_id);
    					return true;
        			}
	        	}
			}
		} else {
			$_SESSION['msg'] = "Refno are not selected!";
			if ($module_flag == 0)
			{
				redirect('generic_mail_sms');
			}
		}
	}
	public function ajax_division_list_ho()
    {
		$class_id = $this->input->post('class_id');
		$sel_school_id = $this->input->post('selected_school_id');

		$data['division_data'] = $this -> Generic_model -> get_all_division_data_generic($class_id, $sel_school_id);
		$data['class_id'] = $class_id;
		$data['division_id'] = '';
		$this->load->view('common/classdivision/view_ajax_division_list',$data);
    }

    public function insert_feedback_image($subject,$sel_school_id,$refno,$unix_timestamp,$mail_format)
	{
		$data['email_subject']      = $subject;
		$data['school_id']          = $sel_school_id;
		$data['feedback_parameter'] = $unix_timestamp;
		
		$data['yes_link'] = APP_PAY_URL."/".FEEDBACK_CONTR_NAME."/".FEEDBACK_CONTR_METHOD."/".$data['feedback_parameter']."/YES/".$data['school_id']."/".$refno."/".$mail_format;
		$data['maybe_link'] = APP_PAY_URL."/".FEEDBACK_CONTR_NAME."/".FEEDBACK_CONTR_METHOD."/".$data['feedback_parameter']."/MAYBE/".$data['school_id']."/".$refno."/".$mail_format;
		$data['no_link'] = APP_PAY_URL."/".FEEDBACK_CONTR_NAME."/".FEEDBACK_CONTR_METHOD."/".$data['feedback_parameter']."/NO/".$data['school_id']."/".$refno."/".$mail_format;

		$mail_template = $this-> load -> view('common/feedback/feedback_email_content', $data,TRUE);

		return $mail_template;
	}

	public function email_tag_ho()
	{
		$data['page_data']['page_name']         = 'Email Tag';
        $data['page_data']['page_icon']         = 'fa fa-pencil-square-o';
        $data['page_data']['page_title']        = 'Email Tag';
        $data['page_data']['page_date']         = date("d M Y");
		$email_tag_data = $this -> Generic_model -> fetch_email_tag_ho();
        if ($email_tag_data != NULL || $email_tag_data != '')
        {
            $data['email_tag_data'] = $email_tag_data;
        }
		$data['main_content'] = array('student/generic_specific/view_email_tag_ho');
		$this -> load -> view('bootstrap_templates/main_template', $data);
	}
	
	public function add_email_tag()
	{
		$data['tagname'] = ucfirst($_POST['tagname']);
		$validate_tagname_insert  = $this -> Generic_model -> fetch_email_tag_configuration($data);
        if($validate_tagname_insert != NULL && $validate_tagname_insert != '')
        {
            echo "1";return;
        }else{
        	$ret_tag_insert = $this-> Generic_model -> email_tag_insert($data);
        	if ($ret_email_insert) 
        	{
        		echo "2";return;
        	}
        }
    }
	//Update  Tag
	public function ajax_update_tag_row()
    {
        $edit_id        = $this->input->post('edit_id');
        $edit_val       = ucfirst($this->input->post('edit_val'));
        $data['ret_email_update'] = $this -> Generic_model -> update_email_tag_data($edit_id,$edit_val);return;
    }

    // Delete Tag 
    public function tag_config_delete()
    {
        $data['primary_id']  = $this->input->post('primary_id');
        $ret_result = $this-> Generic_model -> tag_auth_config_delete($data);
        if ($ret_result) 
        {
        	echo "1";return;
        }
    }			
}	

```
{{< /details >}}



## __construct
#### Code Complexity: 2
### Overview
This is the constructor function of a class. It initializes the class and sets up necessary configurations and dependencies. It also checks if the user is logged in and sets the default timezone. It loads various models, helpers, libraries, and sets up session. 

### Refactoring
1. Remove unnecessary models, helpers, and libraries that are not being used.
2. Use dependency injection to inject the necessary models and libraries instead of loading them directly in the constructor.
3. Move the logic of checking if the user is logged in to a separate method for better separation of concerns.

{{< details "source code " >}}
```php
public function __construct()
	{
		parent::__construct();
		@session_start();
		date_default_timezone_set('Asia/Kolkata');
		Check_Access_helper::is_logged_in();
		$this-> load ->model('common/Class_division_model');
		$this-> load ->model('student/Generic_specific_model');
		$this-> load ->model('mobile/Student_app_model');
		$this->load->model('common/Student_model');
		$this -> load -> model('common/Employee_model');
		$this -> load -> model('common/School_model');
		$this->load->model('student/Student_find_model');
		$this -> load -> model('common/Class_division_model');
		$this-> load ->helper('file');
		$this-> load ->library('Amazon_aws');
		$this -> load -> model('common/Generic_model');
	}
```
{{< /details >}}

## index
#### Code Complexity: 7
### Overview
This function is the index method of a controller. It is responsible for rendering the view for managing generic emails. It sets up the necessary data for the view, such as page title, description, breadcrumb, and school data. It then loads the main template view with the necessary data.

### Refactoring
1. Extract the setup code into separate functions to improve readability and maintainability.
2. Use a template engine to separate the view logic from the controller code.
3. Move the database query for fetching school data to a separate function in the model.

{{< details "source code " >}}
```php
public function index()
	{
		$data['page_data']['page_name'] = 'Generic Module';
		$data['page_data']['page_icon'] = 'fa fa-envelope';
		$data['page_data']['page_title'] = 'Generic Email';
		$data['page_data']['page_date'] = date("d M Y");
		$data['page_data']['page_description'] = 'This is module that manages movement of Generic Email';
		$data['page_data']['breadcrumb'] = '<li>Administrator</li>  <li class="active">Manage Generic Email</li>';

		$data['page_data']['glob_flag'] = '';
		$data['page_data']['template_id'] = '';
		$data['page_data']['all_rows'] = NULL;

		$data['class_id'] = NULL;
		$data['division_id'] = NULL;
		$data['sel_class_id'] = NULL;
		$data['sel_status'] = NULL;

		$school_data = $this -> School_model ->fetch_all_school_data();
        if ($school_data != NULL)
        {
            $data['page_data']['school_data'] = $school_data;
        }else{
            $data['page_data']['school_data'] = NULL;
        }

		$data['main_content'] = array('student/generic_specific/view_generic_email_ho');
		$this -> load -> view('templates/main_template', $data);
	}
```
{{< /details >}}

## show_mail_type
#### Code Complexity: 949
### Overview
The `show_mail_type` function is responsible for displaying the mail type based on the selected school and module type. It retrieves the necessary data from the database and sets it in the `$data` array. It also handles the selection of class, division, and status for generating the mail.

### User Acceptance Criteria
```gherkin
Feature: Show Mail Type
Scenario: Display mail type
Given The user has selected a school
When The user selects a module type
Then The mail type is displayed
```

### Refactoring
1. Extract the code for fetching school data into a separate function.
2. Extract the code for fetching class data into a separate function.
3. Extract the code for fetching template data into a separate function.
4. Extract the code for fetching teacher data into a separate function.
5. Extract the code for fetching division data into a separate function.
6. Extract the code for fetching all data based on class, division, and status into a separate function.
7. Extract the code for fetching all data based on comma-separated refnos into a separate function.
8. Extract the code for fetching all data based on class and status into a separate function.
9. Extract the code for fetching all data based on class and division into a separate function.
10. Extract the code for fetching all data based on multiple classes into a separate function.

{{< details "source code " >}}
```php
public function show_mail_type(){

		$sel_school_id = $_POST['selected_school_id_post']; 
		$data['page_data']['sel_school_id'] = $sel_school_id;

		$school_data = $this -> School_model ->fetch_all_school_data();
        if ($school_data != NULL)
        {
            $data['page_data']['school_data'] = $school_data;
        }else{
            $data['page_data']['school_data'] = NULL;
        }

		$ui_selection = "Generic Module";

		$data['page_data']['page_name'] = $ui_selection;
		$data['page_data']['page_icon'] = 'fa fa-envelope';
		$data['page_data']['page_title'] = 'Generic Module';
		$data['page_data']['page_date'] = date("d M Y");
		$data['page_data']['template_id'] = '';
		$data['page_data']['glob_flag']= '';
		$data['sel_class_id'] = NULL;
		$data['attachment_path'] = $this -> amazon_aws -> get_attachment_directory();


		if (isset($_POST['selected_module_type'])) {	

			$data['page_data']['selected_type'] = $_POST['selected_module_type'];

				//---- Get all Class data from all database ----
		        $returned_data = $this -> Generic_model -> get_class_data_ho();
		        if ($returned_data != NULL && $returned_data != '') {
		            $data['page_data']['class_rows'] = $returned_data;
		        }else{
		            $data['page_data']['class_rows'] = NULL;
		        }

				$data['page_data']['selected_module_type'] = 'generic';
				$data['main_content'] = array('student/generic_specific/view_generic_email_ho');
				$this -> load -> view('templates/main_template', $data);

			// Neither Generic nor Specific Module Selected
			if ($sel_school_id == '' || $sel_school_id == NULL ) {
				redirect('generic_mail_sms');
			}

		} else {	// Triggers on Generic Refno OR Class-Div-Status selection

			$sel_school_id = $_POST['school_id_ref'];
			$data['page_data']['sel_school_id'] = $sel_school_id; 

			$staff_info = $this -> Generic_model -> get_walnut_user_employee_details_ho($sel_school_id);
			if ($staff_info != NULL && $staff_info != ''){
				$data['page_data']['staff_info'] = $staff_info;
			}else{
				$data['page_data']['staff_info'] = NULL;
			}

			$super_admin_data = $this -> Generic_specific_model -> get_super_admin_data();
			if ($super_admin_data != NULL && $super_admin_data != "") {
				$data['page_data']['super_admin_data'] = $super_admin_data;
			}else
				$data['page_data']['super_admin_data'] = NULL;
				
			$all_template = $this -> Generic_model -> get_all_templates_generic_ho($sel_school_id);
			if ($all_template != NULL && $all_template != '') {
				$data['page_data']['templates'] = $all_template;
			}else{
				$data['page_data']['templates'] = NULL;
			}		

			// Selection by Comma separated REFNOS
			if ( isset($_REQUEST['ref_no']) && $_REQUEST['ref_no'] != NULL)
			{
				$ref_no_array = explode(',', $_POST['ref_no']);
				
				$all_rows = $this -> Generic_model -> get_all_mail_ids_ho($ref_no_array, $sel_school_id);
				if ($all_rows != NULL && $all_rows != '') {
					$data['page_data']['all_rows'] = $all_rows;

					$all_rows_array = $all_rows->result_array();

					$class_array = array();
					$division_array = array();

					for ($i = 0; $i < count($all_rows_array); $i++) { 
						array_push($class_array, $all_rows_array[$i]['admission_to']);
						array_push($division_array, $all_rows_array[$i]['division']);
					}

					$unique_class_array = array_unique($class_array);
					$unique_division_array = array_unique($division_array);

					$data['class_id'] = implode(",",$unique_class_array);
					$data['division_id'] = implode(",",$unique_division_array);
					
					$teacher_data = $this -> Generic_model -> get_teacher_data_ho($data, $sel_school_id);
					
					if ($teacher_data != NULL && $teacher_data != '') {
						$data['page_data']['teacher_data'] = $teacher_data;
					}else{
						$data['page_data']['teacher_data'] = NULL;
					}
				}else{
					$data['page_data']['all_rows'] = NULL;
					$_SESSION['msg'] = "Entered Refnos data not available!";
					redirect('generic_mail_sms');
				}

				$data['page_data']['comma_seperated_refno'] = 'YES';
				$data['page_data']['sel_divsion_id'] = array();
				$data['page_data']['selected_module_type'] = $_POST['selected_type'];
				$data['page_data']['selected_type'] = $_POST['selected_type'];
				$data['page_data']['refnos'] = implode(",", $ref_no_array);

			} else {

				// Selection by Class-Division-Status
				if (isset($_POST['class_id']) )
				{
					$returned_data = $this -> Generic_model -> get_class_data_ho();
					if ($returned_data != NULL && $returned_data != ''){
						$data['page_data']['class_rows'] = $returned_data;
					}else{
						$data['page_data']['class_rows'] = NULL;
					}

					// *************************** All Classes ************************
					if($_POST['class_id'][0] == 0) 
					{	
						$class_array = array();
						$returned_data = $this -> Generic_model -> get_classes_ho();
						if ($returned_data != NULL && $returned_data != '') {
							$class_data_array = $returned_data->result_array();
							for ($i=0; $i < count($class_data_array); $i++) { 
								$class_array[$i] = $class_data_array[$i]['class_id'];
							}
						}else{
							$class_array = array();
						}

						if(isset($_POST['status']) && $_POST['status'][0] != 0){
							$status = implode(',', $_POST['status']);
						}else{
							$status = "";
						}

						$all_rows = $this -> Generic_model -> get_all_only_classes_data_generic($class_array, $status, $sel_school_id);
						if ($all_rows != NULL && $all_rows != '') {
							$data['page_data']['all_rows'] = $all_rows;
						}else{
							$data['page_data']['all_rows'] = NULL;
							$_SESSION['msg'] = "Entered Refnos data not available!";
						}

				        $teacher_data = $this -> Generic_model -> get_all_teacher_ho($sel_school_id);
						if ($teacher_data != NULL && $teacher_data != '') {
							$data['page_data']['teacher_data'] = $teacher_data;
						}else{
							$data['page_data']['teacher_data'] = $teacher_data;
						}

				        $data['page_data']['selected_module_type'] = $_POST['selected_type'];
						$data['page_data']['selected_type'] = $_POST['selected_type'];
			        	$data['page_data']['sel_class_id'] = $_POST['class_id'][0];
			        	$data['page_data']['division_rows'] = null;
			        	$data['page_data']['sel_divsion_id'] = array();
			        	$data['page_data']['sel_status'] = $status;

						$mail_template = read_file('./application/views/student/generic_specific/email_template.txt');
				        if ($mail_template != NULL && $mail_template != '') {
							$data['page_data']['preview_content'] = $mail_template;
						}else{
							$data['page_data']['preview_content'] = NULL;
						}
					}else if($_POST['class_id'][0] == 1)
					{
						// ***********************KG classes **************************
						$class_array = array();
						$returned_data = $this -> Generic_model -> get_classes_ho();
						if ($returned_data != NULL && $returned_data != '') 
						{
							$class_data_array = $returned_data->result_array();
							for ($i=0; $i < count($class_data_array); $i++) 
							{ 
								if ($class_data_array[$i]['class_id'] < 12) 
								{
									$class_array[$i] = $class_data_array[$i]['class_id'];
								}
							}
						}else{
							$class_array = array();
						}

						if(isset($_POST['status']) && $_POST['status'][0] != 0){
							$status = implode(',', $_POST['status']);
						}else{
							$status = "";
						}

						$data['class_id'] = implode(",",$class_array);
						$data['division_id'] = '';

						$all_rows = $this -> Generic_model -> get_all_only_classes_data_generic($class_array, $status, $sel_school_id);
						if ($all_rows != NULL && $all_rows != '') 
						{
								$data['page_data']['all_rows'] = $all_rows;
						}else{
							$data['page_data']['all_rows'] = NULL;
							$_SESSION['msg'] = "Entered Refnos data not available!";
						}

				        $teacher_data = $this -> Generic_model -> get_teacher_data_ho($data, $sel_school_id);
						if ($teacher_data != NULL && $teacher_data != '') {
							$data['page_data']['teacher_data'] = $teacher_data;
						}else{
							$data['page_data']['teacher_data'] = $teacher_data;
						}

				        $data['page_data']['selected_module_type'] = $_POST['selected_type'];
						$data['page_data']['selected_type'] = $_POST['selected_type'];
			        	$data['page_data']['sel_class_id'] = $_POST['class_id'][0];
			        	$data['page_data']['division_rows'] = null;
			        	$data['page_data']['sel_divsion_id'] = array();
			        	$data['page_data']['sel_status'] = $status;

						$mail_template = read_file('./application/views/student/generic_specific/email_template.txt');
				        if ($mail_template != NULL && $mail_template != '') {
							$data['page_data']['preview_content'] = $mail_template;
						}else{
							$data['page_data']['preview_content'] = NULL;
						}
					}else if($_POST['class_id'][0] == 2)
					{
						// *********************** Primary classes **************************
						$class_array = array();
						$returned_data = $this -> Generic_model -> get_classes_ho();
						if ($returned_data != NULL && $returned_data != '') 
						{
							$class_data_array = $returned_data->result_array();
							for ($i=0; $i < count($class_data_array); $i++) 
							{ 
								if(($class_data_array[$i]['class_id']) > 11)
								{
									if(($class_data_array[$i]['class_id'] != 20) && ($class_data_array[$i]['class_id'] != 21) && ($class_data_array[$i]['class_id'] != 22))
									{
										$class_array[$i] = $class_data_array[$i]['class_id'];
									}
								}
							}
						}else{
							$class_array = array();
						}

						if(isset($_POST['status']) && $_POST['status'][0] != 0){
							$status = implode(',', $_POST['status']);
						}else{
							$status = "";
						}
						$data['class_id'] = implode(",",$class_array);
						$data['division_id'] = '';

						$all_rows = $this -> Generic_model -> get_all_only_classes_data_generic(array_values($class_array), $status, $sel_school_id);
						if ($all_rows != NULL && $all_rows != '') 
						{
								$data['page_data']['all_rows'] = $all_rows;
						}else{
							$data['page_data']['all_rows'] = NULL;
							$_SESSION['msg'] = "Entered Refnos data not available!";
						}

				        $teacher_data = $this -> Generic_model -> get_teacher_data_ho($data, $sel_school_id);
						if ($teacher_data != NULL && $teacher_data != '') {
							$data['page_data']['teacher_data'] = $teacher_data;
						}else{
							$data['page_data']['teacher_data'] = $teacher_data;
						}

				        $data['page_data']['selected_module_type'] = $_POST['selected_type'];
						$data['page_data']['selected_type'] = $_POST['selected_type'];
			        	$data['page_data']['sel_class_id'] = $_POST['class_id'][0];
			        	$data['page_data']['division_rows'] = null;
			        	$data['page_data']['sel_divsion_id'] = array();
			        	$data['page_data']['sel_status'] = $status;

						$mail_template = read_file('./application/views/student/generic_specific/email_template.txt');
				        if ($mail_template != NULL && $mail_template != '') {
							$data['page_data']['preview_content'] = $mail_template;
						}else{
							$data['page_data']['preview_content'] = NULL;
						}
					}else if(count($_POST['class_id']) > 1){
						// *********************** Multiple classes **************************
						 $class_array = array();
						foreach ($_POST['class_id'] as $selectedOption)
						{
							 array_push($class_array, $selectedOption);
						}

						$data['class_id'] = implode(",",$class_array);	
						$returned_data = $this -> Generic_model -> get_classes_ho();
						if ($returned_data != NULL && $returned_data != '') 
						{
							 $data['page_data']['class_rows'] = $returned_data; 
						}else{
							$data['page_data']['class_rows'] = NULL;
						}
						
						if(isset($_POST['status']) && $_POST['status'][0] != 0)
						{
							$status = implode(',', $_POST['status']);
						}else{
							$status = "";
						}
						$data['class_id'] = implode(",",$class_array);
						$data['division_id'] = '';

						$all_rows = $this -> Generic_model -> get_all_only_classes_data_generic(array_values($class_array), $status, $sel_school_id);
						if ($all_rows != NULL && $all_rows != '') 
						{
								$data['page_data']['all_rows'] = $all_rows;
						}else{
							$data['page_data']['all_rows'] = NULL;
							$_SESSION['msg'] = "Entered Refnos data not available!";
						}

				        $teacher_data = $this -> Generic_model -> get_teacher_data_ho($data, $sel_school_id);
						if ($teacher_data != NULL && $teacher_data != '') {
							$data['page_data']['teacher_data'] = $teacher_data;
						}else{
							$data['page_data']['teacher_data'] = $teacher_data;
						}

				        $data['page_data']['selected_module_type'] = $_POST['selected_type'];
						$data['page_data']['selected_type'] = $_POST['selected_type'];
			        	$data['page_data']['sel_class_id'] = $_POST['class_id'];
			        	$data['page_data']['division_rows'] = null;
			        	$data['page_data']['sel_divsion_id'] = array();
			        	$data['page_data']['sel_status'] = $status;

						$mail_template = read_file('./application/views/student/generic_specific/email_template.txt');
				        if ($mail_template != NULL && $mail_template != '') {
							$data['page_data']['preview_content'] = $mail_template;
						}else{
							$data['page_data']['preview_content'] = NULL;
						}
					}else {	
						// *********************** Unique Classes-Division **************************
						if (isset($_REQUEST['division_id']))
						{
							$class_id = $_POST['class_id'][0];

							$division_data = $this -> Generic_model -> get_division_data_gen($class_id, $sel_school_id);
							if ($division_data != NULL && $division_data != '') {
								$data['page_data']['division_rows'] = $division_data;
							}else{
								$data['page_data']['division_rows'] = NULL;
							}

							$division_array = array();
							foreach ($_POST['division_id'] as $division){
								array_push($division_array, $division);
							}
							$data['class_id'] = $class_id;
							$data['division_id'] = implode(",",$division_array);

							if(isset($_POST['status']) && $_POST['status'][0] != 0){
								$status = implode(',', $_POST['status']);
							}else{
								$status = "";
							}
							
							$all_rows = $this -> Generic_model -> get_all_data_generic($data, $status, $sel_school_id);

							if ($all_rows != NULL && $all_rows != '') {
								$data['page_data']['all_rows'] = $all_rows;
							}else{
								$data['page_data']['all_rows'] = NULL;
							}

							$teacher_data = $this -> Generic_model -> get_teacher_data_ho($data, $sel_school_id);

							if ($teacher_data != NULL && $teacher_data != '') {
								$data['page_data']['teacher_data'] = $teacher_data;
							}else{
								$data['page_data']['teacher_data'] = NULL;
							}
							
							$data['page_data']['selected_module_type'] = $_POST['selected_type'];
							$data['page_data']['selected_type'] = $_POST['selected_type'];
							$data['page_data']['sel_class_id'] = $_POST['class_id'];
							$data['page_data']['sel_divsion_id'] = $division_array;
							$data['page_data']['sel_status'] = $status;

							$mail_template = read_file('./application/views/student/generic_specific/email_template.txt');
							if ($mail_template != NULL && $mail_template != '') {
								$data['page_data']['preview_content'] = $mail_template;
							}else{
								$data['page_data']['preview_content'] = NULL;
							}
						} else {
							redirect('generic_mail_sms');
						}
					}
				} else {
					$data['page_data']['all_rows'] = NULL;
					$_SESSION['msg'] = "Class not selected!";
					redirect('generic_mail_sms');
				}
				$data['page_data']['comma_seperated_refno'] = 'NO';
			}

			// Get Super admin and admin data of HO 
			$user_role = array(10,11);
			$ho_result = $this -> Employee_model -> get_walnut_user_employee_details(0,$user_role);
			$ho_admin_data = array_map('current', $ho_result);
			$user = $_SESSION['user_id'];
			if(in_array($user, $ho_admin_data))
			{
				$data['valid'] = 1;
			}else{
				$data['valid'] = 0;
			}
			
			$data['main_content'] = array('student/generic_specific/view_generic_email_ho');
			$this -> load -> view('templates/main_template', $data);
		}
	}
```
{{< /details >}}

## check_ref_no_exist
#### Code Complexity: 1
### Overview
This function is used to check if a reference number exists in the database for a selected school. It takes the reference number and the selected school ID from the POST request and calls the `ref_no_exist_ho` method of the `Generic_model` class to check if the reference number exists. The result is then printed.

### User Acceptance Criteria
```gherkin
Feature: Check Reference Number Existence

Scenario: Reference number exists
  Given a reference number '12345'
  And a selected school ID '1'
  When the check_ref_no_exist function is called
  Then the result should be true

Scenario: Reference number does not exist
  Given a reference number '54321'
  And a selected school ID '1'
  When the check_ref_no_exist function is called
  Then the result should be false
```

{{< details "source code " >}}
```php
public function check_ref_no_exist(){
     	$ref_no = explode(',',$_POST['refno']);
     	$sel_school_id = $_POST['selected_school_id'];
     	$ref_no = $this -> Generic_model -> ref_no_exist_ho($ref_no, $sel_school_id);
     	print_r($ref_no);
    }
```
{{< /details >}}

## send_to_all
#### Code Complexity: 112
### Overview
The `send_to_all` function is responsible for sending generic emails or SMS to selected recipients. It retrieves the necessary data from the POST request and calls the `send_mail_all` function to send the emails or SMS.

### User Acceptance Criteria
```gherkin
Feature: Send Generic Email

Scenario: Send generic email to all recipients
Given The user has selected the recipients
When The user clicks on the send button
Then The generic email is sent to all recipients
```

### Refactoring
1. Extract the logic for checking if a value is NULL or empty into a separate function.
2. Use a switch statement instead of multiple if-else statements for checking the selected type or module type.
3. Move the logic for fetching selected teacher and admin IDs into separate functions.
4. Extract the logic for checking the mail or SMS selection into a separate function.
5. Extract the logic for checking the send to app checkbox into a separate function.
6. Extract the logic for checking the insert feedback image checkbox into a separate function.
7. Extract the logic for inserting feedback map data into a separate function.
8. Extract the logic for sending the email or SMS into a separate function.
9. Extract the logic for setting the module flag into a separate function.

{{< details "source code " >}}
```php
public function send_to_all(){

		$sel_school_id = $this->input->post('school_id_mail');

		if (isset($_POST['selected_type'])) {
			if ($_POST['selected_type'] != NULL && $_POST['selected_type'] != "") {
				if($_POST['selected_type'] == 'generic'){
					$ui_selection = "Generic Module";
				}
			}
		} else if (isset($_POST['selected_module_type'])) {
			if ($_POST['selected_module_type'] != NULL && $_POST['selected_module_type'] != "") {
				if($_POST['selected_module_type'] == 'generic'){
					$ui_selection = "Generic Module";
				} 
			}
		}

		$data['page_data']['page_name'] = $ui_selection;
		$data['page_data']['page_icon'] = 'fa fa-envelope';
		$data['page_data']['page_title'] = 'Generic Email';
		$data['page_data']['page_date'] = date("d M Y");
		$data['page_data']['page_description'] = 'This is module that manages movement of Generic Email';
		$data['page_data']['breadcrumb'] = '<li>Administrator</li>  <li class="active">Manage Generic Email</li>';

		// Fetch selected (ticked) refnos POST
		$ref_no_array = array();
		if ($_POST['refno'] != NULL && $_POST['refno'] != '') {

			$attachment_flag = FALSE;
			// If CSV is uploaded for attachment
			if (isset($_SESSION['attachment_csv_data'])) {
				$attachment_flag = TRUE;
				$csv_data = $_SESSION['attachment_csv_data'];
				$refnos = array_keys($csv_data);
				unset($refnos[0]);
				$ref_no_array = array_values($refnos);
			} else {
				$refnos = $_POST['refno'];
				$ref_no_array = explode(',', $refnos);
			}
		}else{
			$_SESSION['msg'] = "Please select recipients";
			redirect('generic_mail_sms');
		}

		// Fetch selected (ticked) teacher POST (If at all)
		$teacher_id_array = NULL ;
		if ($_POST['teacher_id_send'] != NULL && $_POST['teacher_id_send'] != '') {
			$teacher_id_array = str_getcsv($_POST['teacher_id_send']);
		}

		// Fetch selected (ticked) admin POST (If at all)
		$admin_id_array = NULL ;
		if ($_POST['admin_id_send'] != NULL && $_POST['admin_id_send'] != '') {
			$admin_id_array = str_getcsv($_POST['admin_id_send']);
		}

		$msg_type = 'Notification'; // Default value
		if (isset($_POST['message_type'])) {
			$msg_type = $_POST['message_type']; // From UI
		}
		// MAIL/SMS Selection FLAG
		if ($_POST['mail_sms'] != NULL && $_POST['mail_sms'] != '') {
			$mail_or_sms_flag = $_POST['mail_sms'];
		}else{
			$_SESSION['msg'] = "Please select either e-mail or sms";
			redirect('generic_mail_sms');
		}

		$additional_email_sms_array = NULL;
		if ($_POST['additional_email_list'] != NULL && $_POST['additional_email_list'] != '') {
			$additional_email_sms_array = str_getcsv($_POST['additional_email_list']);
		}

		$generic_specific_flag = 0; // Generic (Does send flag)

		if (!isset($_POST['set_flag'])) { // Specific (Does NOT send flag)
			$generic_specific_flag = 1;
		}

		// check send to app checkbox
		$send_to_app_flag = TRUE;
		if ($_POST['send_app'] == '1') {
			$send_to_app_flag = TRUE;
		} else {
			$send_to_app_flag = FALSE;
		}

		// check insert feedback image
		$insert_img_flag = TRUE;
		if ($_POST['email_feedback_check'] == '1') {
			$insert_img_flag = TRUE;
		} else {
			$insert_img_flag = FALSE;
		}
		if ($insert_img_flag == 1)
		{
			if ($mail_or_sms_flag == 'email')
			{ 
				$data['email_subject']      = $_POST['t_name'];
				$data['school_id']          = $sel_school_id;
				$unix_timestamp             = time(); 
				$data['feedback_parameter'] = $unix_timestamp;
				$ret_data = $this -> Generic_specific_model -> insert_feedback_map_data($data);
			}
		}
		$file_no               = $_POST['file_no'];
		$comma_seperated_refno = $_POST['comma_seperated_refno'];
		$class                 = $_POST['sel_class'];
		$division              = $_POST['sel_div'];
		$module_flag           = 0;
		$temp_id               = $_POST['new_temp_id'];
		$sender_id             = $_POST['new_sender_id'];
	
		$this -> send_mail_all($ref_no_array,$teacher_id_array,$admin_id_array,$generic_specific_flag,$file_no,$send_to_app_flag,$comma_seperated_refno,$class,$division,$mail_or_sms_flag,$additional_email_sms_array,$attachment_flag,$csv_data,$module_flag, $sel_school_id,$insert_img_flag,$unix_timestamp,$temp_id,$sender_id);
		// $module_flag = 0 for Send to ALL and $module_flag = 1 for Schedule data
	}
```
{{< /details >}}

## send_content_to_app
#### Code Complexity: 79
### Overview
This function is used to send content to the app. It takes several parameters including comma_separated_refno, refno, sel_class, sel_div, subject_content, original_preview_content, msg_type, and sel_school_id. It first initializes an array called student_app with null values for ref_no, class_id, division_id, subject_id, unit_id, and sel_school_id. It then assigns the values of subject_content, msg_type, and original_preview_content to the corresponding keys in the student_app array. If comma_separated_refno is 'YES', it assigns the values of refno, sel_class, and sel_div to the corresponding keys in the student_app array and calls the save_in_student_app function. If the save_in_student_app function returns true, it returns true, otherwise it returns false. If comma_separated_refno is 'NO', it checks if sel_class is not equal to '0'. If it is not equal to '0', it assigns the values of sel_class and sel_div to the corresponding keys in the student_app array and calls the save_in_student_app function. If the save_in_student_app function returns true, it returns true, otherwise it returns false. If sel_class is equal to '0', it retrieves the class_div_data from the Generic_model and assigns the values of class_id and division_id from each row in the class_div_data to the corresponding keys in the student_app array. It then calls the save_in_student_app function for each row in the class_div_data. If all the save_in_student_app function calls return true, it returns true, otherwise it returns false.

{{< details "source code " >}}
```php
public function send_content_to_app($comma_seperated_refno, $refno, $sel_class, $sel_div, $subject_content, $original_preview_content, $msg_type, $sel_school_id){
    	$student_app['ref_no']                    = null;
		$student_app['class_id']                  = null;
		$student_app['division_id']               = null;
		$student_app['subject_id']                = null;
		$student_app['unit_id']                   = null;
		$student_app['subject_content']           = $subject_content;
		$student_app['msg_type']                  = $msg_type;
		$student_app['$original_preview_content'] = $original_preview_content;
		$student_app['sel_school_id'] = $sel_school_id;

	    if ($comma_seperated_refno == 'YES') {
		    $student_app['refno']      = $refno;
	        $student_app['class_id']    = $sel_class;
	        $student_app['division_id'] = $sel_div;
	        $tst = $this->save_in_student_app($student_app);
			if ($tst) {
				return TRUE;
			} else {
				return FALSE;
			}
		}

		// Class-Div selection
	    if ($comma_seperated_refno == 'NO') {

	    	$student_app['refno']      = null;

		    if ($_POST['sel_class'] != '0') {
			    $student_app['class_id']    = $sel_class;
		    	$student_app['division_id'] = str_replace(' ', ',', $sel_div);
		    	if ($this->save_in_student_app($student_app)) {
					return TRUE;
				} else {
					return FALSE;
				}
		    }else{ // Class selected 'All'

		    	$class_div_data = $this-> Generic_model-> get_class_div_data_ho($sel_school_id);
		    	if ($class_div_data) {
		    		$count_of_class_div = count($class_div_data);
		    		$count = 0;
		    		foreach ($class_div_data as $class_div_row) {
		    			$count++;
		    			$student_app['class_id']    = $class_div_row['class_id'];
		    			$student_app['division_id'] = $class_div_row['division_id'];
		    			if ($this->save_in_student_app($student_app)) {
		    				if ($count == $count_of_class_div) {
		    					return TRUE;
		    				}
						} else {
							return FALSE;
						}
			    	}
		    	} else {
		    		return FALSE;
		    	}
		    }
		}
    }
```
{{< /details >}}

## save_in_student_app
#### Code Complexity: 7
### Overview
This function is used to save a student application in the student app. It takes a student app object as input and extracts the necessary data from it to create a new record in the database. The function sets default values for some fields and also includes the current date and time as the created and modified dates. After inserting the data, it checks if the insertion was successful and returns a boolean value accordingly.

### User Acceptance Criteria
```gherkin
Feature: Save Student App
Scenario: Saving a student app
Given A student app object
When The save_in_student_app function is called with the student app object
Then The student app data should be inserted into the database
And The function should return true if the insertion was successful
```

### Refactoring
1. Extract the default values for some fields into constants or configuration files.
2. Use a more descriptive variable name for the returned app data.
3. Move the database insertion logic to a separate function for better separation of concerns.

{{< details "source code " >}}
```php
public function save_in_student_app($student_app){

    	$data['ref_no']           = $student_app['refno'];
    	$data['class_id']    	  = $student_app['class_id'];
		$data['division_id'] 	  = $student_app['division_id'];
    	$data['subject_id']       = 'Any Subject';
		$data['unit_id']          = 'Any Unit';
		$data['type']             = $student_app['msg_type'];
		$data['title']            = $student_app['subject_content'];
		$data['desc_area']        = 'Tap to see details';
		$data['issued_by']        = 'Walnut School';
		$data['priority']         = 'Medium';
		$data['starred']          = 'Yes';
		$data['detail_text_area'] = str_replace('"',"'",$student_app['$original_preview_content']);
		$data['detail_link']      = '';

		$data['sel_school_id']    = $student_app['sel_school_id'];


		$data['school_db']        = $_SESSION['database'];

		$data['created_date']     = date("Y-m-d H:i:s");
		$data['modified_date']    = date("Y-m-d H:i:s");
		$returned_app_data = $this -> Student_app_model -> insert_data_ho($data);

		if ($returned_app_data) {
			return TRUE;
		} else {
			return FALSE;
		}
    }
```
{{< /details >}}

## write_email_template
#### Code Complexity: 6
### Overview
This function is responsible for writing an email template. It takes the email content and template subject value from the POST request and saves them in separate files. It also generates a random number to be used as part of the file names. Finally, it returns a success message along with the random number.

### User Acceptance Criteria
```gherkin
Feature: Write Email Template
Scenario: Saving email template
Given The email content is provided
And The template subject value is provided
When The write_email_template function is called
Then The email content is saved in a file
And The template subject value is saved in a file
And A success message with the random number is returned
```

### Refactoring
1. Use a more secure method to generate the random number.
2. Use a more descriptive variable name instead of $random_number.
3. Consider using a consistent naming convention for the file paths.
4. Extract the file writing logic into a separate function for reusability.

{{< details "source code " >}}
```php
public function write_email_template() {
		$email_content = $_POST['email_content'];
		$mail_type = "generic";
		$template_subject_val = $_POST['template_subject_val'];
		if ($template_subject_val == null && $template_subject_val == "") {
			$template_subject_val = "";
		}
		$random_number = microtime(); // Todo - Use something else which does not have space in between
		// Create and save email ;
		$created_file = fopen('./application/views/student/generic_specific/email_content/'.$mail_type.'_email_content_'.$random_number.'.txt', 'w');
		write_file('./application/views/student/generic_specific/email_content/'.$mail_type.'_email_content_'.$random_number.'.txt', $email_content);

		// Create and save subject content
		$created_file = fopen('./application/views/student/generic_specific/email_content/'.$mail_type.'_subject_content_'.$random_number.'.txt', 'w');
		write_file('./application/views/student/generic_specific/email_content/'.$mail_type.'_subject_content_'.$random_number.'.txt', $template_subject_val);

		echo "Template Saved.~".$random_number;
		return;
	}
```
{{< /details >}}

## remaining_sms_count
#### Code Complexity: 6
### Overview
This function retrieves the remaining SMS count from an API. It makes a GET request to the API endpoint and parses the response to extract the remaining balance. The balance is then converted to an integer and returned.

### User Acceptance Criteria
```gherkin
Feature: Get Remaining SMS Count
Scenario: Retrieve remaining SMS count
Given the API URL is 'http://www.smssolution.net.in/api/credits.php?workingkey=A40e733b409ffcd4c6a5db2bf054cf6fe'
When I call the 'remaining_sms_count' function
Then the remaining SMS count should be returned
```

### Refactoring
1. Extract the API URL into a configuration file or environment variable for better maintainability.
2. Use a HTTP client library instead of file_get_contents() for more control and error handling.
3. Consider adding caching to reduce the number of API calls.

{{< details "source code " >}}
```php
public function remaining_sms_count(){
		$api_url = 'http://www.smssolution.net.in/api/credits.php?workingkey=A40e733b409ffcd4c6a5db2bf054cf6fe';
		$response = file_get_contents($api_url);
		if ($response) {
			$remaining_bal = explode(" ", $response);
			$balance1 = end($remaining_bal);
			$balance2 = rtrim($balance1,'0');
			$balance3 = rtrim($balance2,'.');
			$balance4 = intval($balance3);
			return $balance4;
		}
	}
```
{{< /details >}}

## send_email
#### Code Complexity: 2
### Overview
This function is used to send an email. It takes an email parameter as input and sends an email using the Send_mail_helper class. The email parameter should contain the attachments, email code, selected school ID, and other necessary information. It retrieves the sender data using the email code and selected school ID. Then it constructs an email sender array with the sender name, from email, school ID, and BCC email flag. Finally, it calls the send_mail function of the Send_mail_helper class to send the email with the parent mail array, preview content, subject content, attachments, and email sender array.

### User Acceptance Criteria
```gherkin
Feature: Send Email
Scenario: Send email with attachments
Given The email parameter contains attachments
When The send_email function is called
Then The email is sent with the attachments
```

### Refactoring
1. Extract the construction of the email_sender_info array into a separate function for better readability and testability.
2. Extract the construction of the email_sender_array into a separate function for better readability and testability.
3. Extract the call to the send_mail function into a separate function for better readability and testability.
4. Use dependency injection to pass the Send_mail_helper class as a parameter instead of directly calling its functions.

{{< details "source code " >}}
```php
public function send_email($email_parameter){
		$attachments = $email_parameter['attachments'];
		$email_sender_info = array(
			'module_code' => $email_parameter['email_code'].'_EMAIL', 
			'school_id'   => $email_parameter['sel_school_id'], 
			'ref_sch_id'  => '0', 
			'ref_inst_id' => '0'
		);
		$email_sender = Send_mail_helper::get_sender_data($email_sender_info);

		$email_sender_array = array(
			'sender_name' => $email_sender['sender_name'],
			'from_email'  => $email_sender['from_email'],
            'school_id'   => $email_parameter['sel_school_id'], 
            'bcc_email'   => TRUE
		);

		$email_status = Send_mail_helper::send_mail($email_parameter['parent_mail_array'], $email_parameter['preview_content'], $email_parameter['subject_content'], $attachments, $email_sender_array);
	}
```
{{< /details >}}

## upload_attachments
#### Code Complexity: 416
### Overview
The `upload_attachments` function is responsible for handling the upload of attachments. It first retrieves AWS data using the `get_aws_data` method from the `System_model` class. Then, it checks if the `attachment_file` is set in the `$_FILES` array. If it is set, it proceeds with the upload process. It sets the upload directory path and allowed file types in the `$config` array. It then loads the `upload` library and attempts to upload the file. If the upload fails, it returns an error message. If the upload is successful, it retrieves the uploaded file data and performs further processing. It reads the file content, parses it as CSV, and stores the data in arrays. It performs various checks and validations on the CSV data, such as checking the number of columns, file names, file extensions, and file existence. Finally, it stores the attachment data in the `$_SESSION['attachment_csv_data']` array and returns a success message.

### User Acceptance Criteria
```gherkin
Feature: Upload Attachments

Scenario: Successful upload of attachments
Given The AWS data is retrieved
When The attachment file is uploaded
Then The file is successfully uploaded and processed

Scenario: Failed upload of attachments
Given The AWS data is retrieved
When The attachment file is uploaded
And The upload fails
Then An error message is returned

Scenario: Invalid CSV data
Given The AWS data is retrieved
When The attachment file is uploaded
And The CSV data is invalid
Then An error message is returned
```

### Refactoring
1. Extract the file upload logic into a separate method to improve code organization and reusability.
2. Use a configuration file to store the upload directory path and allowed file types instead of hardcoding them.
3. Use a file validation library to handle file validation instead of manually checking file extensions and existence.
4. Consider using a CSV parsing library to handle CSV parsing instead of manually parsing the CSV data.
5. Use a logging library to log errors and messages instead of echoing them directly.

{{< details "source code " >}}
```php
public function upload_attachments(){

		$aws_data = $this-> System_model -> get_aws_data();
		if (isset($_FILES['attachment_file'])) {
			$upload_dir_path = APP_ROOT_PATH.'/application/views/student/generic_specific/email_content/csv/';

			$config['upload_path']          = $upload_dir_path;
	        $config['allowed_types']        = 'csv';

	        $this->load->library('upload', $config);
	        if (!$this->upload->do_upload('attachment_file')) {
	        	echo 'Please upload only CSV file!';
	        	return;
	        } else {
	        	$file_data = array('csv_data' => $this->upload->data());
	        	
	        	$uploaded_file_name = $file_data['csv_data']['raw_name'].$file_data['csv_data']['file_ext'];
	        	$uploaded_file_path = $upload_dir_path.$uploaded_file_name;
	        	chmod ($uploaded_file_path, 0777);
	        	$uploaded_file_data = read_file($uploaded_file_path);

	        	if (!$uploaded_file_data) {
	        		echo 'Error in file uploading!';
	        		return;
	        	}

	        	$csvcontent           = $uploaded_file_data;
				$fieldseparator       = ",";
				$lineseparator        = "\n";
				$row                  = 0;
				$csv_column_array     = array();
				$csv_data_array       = array();

				// selected data from UI
				$selected_refno       = str_getcsv($this->input->post('global_refno_data'), ',');
				$selected_refno_count = count($selected_refno);
				$selected_email_type  = $this->input->post('email_type');
				$attachment_dir_path = $this -> amazon_aws -> get_attachment_directory();
				// get CSV's data
				$formdata               = array();
				$refnos_attachment_data = array();
				$csv_column_count       = 0;

				$csv_row_count = 0;
				foreach (explode($lineseparator, $csvcontent) as $line) {

					$line = trim($line, " \t");
					$line = str_replace("\r", "", $line);
					if ($line == '') {
						continue;
					}
					$formdata = str_getcsv($line, $fieldseparator, "\"");
					for ($i=0; $i < count($formdata); $i++) { 
						$formdata[$i] = trim($formdata[$i]);
					}
					// get CSV's column names
					if ($csv_row_count == 0) {
						$refnos_attachment_data['column'] = $formdata;
						$csv_column_count = count($refnos_attachment_data['column']);

						// Check for minimum 2 column is necessery in CSV
						if ($csv_column_count <= 1) {
							echo 'Inappropriate data. Please check CSV data!';
							return;
						}

						$csv_row_count++;
						continue;
					}

					// Check for CSV column count and CSV data's count is same
					$csv_column_count_per_row = count($formdata);
					if ($csv_column_count != $csv_column_count_per_row) {
						echo 'Data row has less columns. Please check CSV data!';
						return;
					}

					// check whether CSV is uploaded according selected Email Type
					if ($selected_email_type == 'generic') {
						if (!($formdata[0] == 'All')) {
							echo 'Wrong CSV uploaded!';
							return;
						}
					}	

					// For unique attachment(SPECIFIC Email)
					if (in_array($formdata[0], $selected_refno)) {
						for ($i=0; $i < $csv_column_count_per_row; $i++) {
							if ($i != 0) {

								// If any file is not associated with keyword
								if ($formdata[$i] == '-') {
									continue;
								}

								chmod ($uploaded_file_path, 0777);

								// Check whether file name is empty
								if ($formdata[$i] == '') {
									echo 'File name is not mentioned. Please check CSV data!';
									return;
								}

								// Check file extension
								$file_extension = pathinfo($attachment_dir_path.$formdata[$i], PATHINFO_EXTENSION);
								if ($file_extension == '') {
									echo 'File extension is not given. Please check CSV data!';
									return;
								}
								$file_exit = $this -> amazon_aws ->check_file_exist($formdata[$i],$aws_data);
								// Check whether file is exist
								if (!$file_exit) {
									echo 'Attachment not found!: '.$attachment_dir_path.$formdata[$i];
									return;
								}
							}
						}
						$refnos_attachment_data[$formdata[0]] = $formdata;
						$csv_row_count++;
					} else if($formdata[0] == 'All'){ 
						// For common attachment(GENERIC and SPECIFIC Email)
						for ($i=0; $i < $csv_column_count_per_row; $i++) {
							if ($i != 0) {

								// If any file is not associated with keyword
								if ($formdata[$i] == '-') {
									continue;
								}

								chmod($uploaded_file_path, 0777);

								// Check whether file name is empty
								if ($formdata[$i] == '') {
									echo 'File name is not mentioned. Please check CSV data!';
									return;
								}

								// Check file extension
								$file_extension = pathinfo($attachment_dir_path.$formdata[$i], PATHINFO_EXTENSION);
								if ($file_extension == '') {
									echo 'File extension is not given. Please check CSV data!';
									return;
								}
                                $file_exit = $this -> amazon_aws ->check_file_exist($formdata[$i],$aws_data);
								// Check whether file is exist
								if (!$file_exit) {
									echo 'Attachment not found!: '.$attachment_dir_path.$formdata[$i];
									return;
								}
							}
						}

						for ($j=0; $j < $selected_refno_count; $j++) { 
							$refnos_attachment_data[$selected_refno[$j]] = $formdata;
						}
						$_SESSION['attachment_csv_data'] = $refnos_attachment_data;
						unlink($uploaded_file_path);
						echo 'TRUE';
						return;
						// one attachment for all recipients ends here
					}
				}
				if (($csv_row_count-1 ) == $selected_refno_count) {
					$_SESSION['attachment_csv_data'] = $refnos_attachment_data;
					unlink($uploaded_file_path);
					echo 'TRUE';
					return;
				} else {
					echo 'Selected recipients and recipients from CSV is not same!';
					return;
				}
	        }
		} else {
			echo 'File not uploaded!';
			return;
		}
	}
```
{{< /details >}}

## do_attachment
#### Code Complexity: 35
### Overview
The `do_attachment` function is responsible for processing attachments in a given CSV data. It retrieves AWS data, gets the attachment directory path, and initializes variables for file name, file extensions, attachment type, mime type, attachments, and image data. It then iterates through the CSV data to process each attachment. For each attachment, it checks if the file name is not empty. If not empty, it gets the attachment path, file extension, content ID, and file contents from AWS. It checks if the attachment ID is present in the preview content. If present, it replaces the attachment ID with the image in the preview content and sets the attachment type to 'inline'. If not present, it sets the attachment type to 'attachment' and gets the mime type from the file contents. It then adds the attachment details to the attachments array. Finally, it returns the updated preview content, attachments array, and image data.

{{< details "source code " >}}
```php
public function do_attachment($preview_content, $csv_data, $refno){	
		$aws_data            = $this-> System_model -> get_aws_data();
		$attachment_dir_path = $this -> amazon_aws -> get_attachment_directory();
		$file_name            = ''; 
		$file_extensions      = array('png','jpg','jpeg','png');
		$attachment_type      = '';
		$mime_type            = '';
		$attachments          = array();
		$i                    = 0;
		$image_data           = '';
		$preview_content_temp = $preview_content;
		// $value variable contains column names(attachment id) of csv file 
		foreach ($csv_data['column'] as $key => $value) {

			// don't consider first column because it is not attachment id, it is refno
			if ($i == 0) {
				$i++;
				continue;
			}
			$file_name = $csv_data[$refno][$i];
			$i++;
			if ($file_name != '-') {
				    $attachment_path = $attachment_dir_path.$file_name;
					$file_extension = pathinfo($attachment_path, PATHINFO_EXTENSION);
					$content_id     = 'content_id_'.$i;
					$file_contents = $this -> amazon_aws -> get_file_contents($file_name,$aws_data);
            		$content = base64_encode($file_contents['Body']);
    				if (!strpos($preview_content, '$$'.$value.'$$') === FALSE)
    				{
    					if ($csv_data['send_to_app_flag']) {
    						$image_data .= $value.','.$file_name.',';
    					}
    					$image           = '<IMG SRC="'.$attachment_path.'" ALT="Image not available">';
    					$preview_content = str_replace('$$'.$value.'$$', $image, $preview_content);
    					$attachment_type = 'inline';
    					continue;
    				} else {
    					$attachment_type = 'attachment';
    					$mime_type = $file_contents['ContentType'];
    				}
    				array_push($attachments, 
    							array(
					                'name'            => $file_name,
					                'type'            => $mime_type,
					                'content'         => $content,
					                'attachment_type' => $attachment_type,
					                'content_id'      => '<'.$content_id.'>'
	                            )
    						);
			}
		}
		$result =  array(
						'preview_content' => $preview_content,
						'attachments'     => $attachments,
						'content_for_app' => rtrim($image_data, ',').'~'.$preview_content_temp
					);
		return $result;
	}
```
{{< /details >}}

## insert_schedule_data
#### Code Complexity: 15
### Overview
This function is used to insert schedule data into the database. It retrieves the necessary data from the POST request and inserts it into the 'schedule_data' table. The function also handles the attachment of CSV data and sets the appropriate flags and values for the schedule data.

### User Acceptance Criteria
```gherkin
Feature: Insert Schedule Data

Scenario: Insert schedule data
Given The user has entered all the required data
When The user submits the form
Then The schedule data is inserted into the database
```

### Refactoring
1. Extract the retrieval of POST data into separate functions for better readability.
2. Use a constant or enum for the 'schedule_type' instead of hardcoding the value 'Once'.
3. Move the logic for handling attachment CSV data into a separate function.
4. Use a more descriptive variable name instead of 'ret_schedule_data'.

{{< details "source code " >}}
```php
public function insert_schedule_data()
	{
		$data['sel_school_id']              = $this->input->post('school_id_mail');

		$data['refnos']                     = $_POST['refno'];
		$data['teacher_id_array']           = $_POST['teacher_id_send'];
		$data['admin_id_array']             = $_POST['admin_id_send'];
		$data['msg_type']                   = $_POST['message_type']; // Default value
		$data['mail_or_sms']                = $_POST['mail_sms'];
		$data['additional_email_sms_array'] = $_POST['additional_email_list'];
		$data['csv_refno']                  = $_POST['comma_seperated_refno'];
		$data['file_no']                    = $_POST['file_no'];
		$generic_specific_flag = 0; // Generic (Does send flag)
		if (!isset($_POST['set_flag'])) 
		{ // Specific (Does NOT send flag)
			$generic_specific_flag = 1;
		}
		$data['set_flag']                   = $generic_specific_flag;
		$data['class']                      = str_replace(' ', ',', $_POST['sel_class']);
		$data['division']                   = str_replace(' ', ',', $_POST['sel_div']);
		$data['status']                     = $_POST['new_status'];
		$data['template']                   = $_POST['t_name'];
		if (isset($_SESSION['attachment_csv_data']))
		{
			$data['attachment_flag']        = 1;
			$csv_data                  		= $_SESSION['attachment_csv_data'];
			$data['attachment']        		= json_encode($csv_data );
		}else{
			$data['attachment_flag']        = 0;
		}
		$data['send_to_app']                = $_POST['send_app'];
		$data['schedule_datetime']          = $_POST['date_time'];
		$data['schedule_type']              = 'Once';
		$data['img_flag']                   = $_POST['email_feedback_check'];
			
		$ret_schedule_data = $this -> Generic_model -> insert_schedule_data_ho($data);
		if ($ret_schedule_data != NULL)
		{
			echo "1";return; 
		}
	}
```
{{< /details >}}

## schedule_email_sms
#### Code Complexity: 29
### Overview
This function is used to schedule email and SMS notifications. It retrieves schedule data from the database and passes it to the view for display. It also retrieves class and division data based on the schedule data.

### User Acceptance Criteria
```gherkin
Feature: Schedule Email and SMS
Scenario: View Schedule Data
Given The schedule data is available
When The user schedules email and SMS notifications
Then The schedule data is displayed
```

### Refactoring
1. Extract the logic for retrieving schedule data into a separate function.
2. Extract the logic for retrieving class and division data into a separate function.
3. Use a more descriptive variable name instead of `$p` in the for loop.
4. Use a more descriptive variable name instead of `$i` in the nested for loop.

{{< details "source code " >}}
```php
public function schedule_email_sms()
	{
		$data['page_data']['page_name']         = 'Schedule data';
        $data['page_data']['page_icon']         = 'fa fa-pencil-square-o';
        $data['page_data']['page_title']        = 'Schedule data';
        $data['page_data']['page_date']         = date("d M Y");
        $data['page_data']['page_description']  = '';
        $schedule_data = $this -> Generic_model -> get_all_schedule_data_ho();

      	if ($schedule_data != "" ||  $schedule_data != NULL) {
            $data['schedule_data'] = $schedule_data;
        } else {
            $data['schedule_data'] = NULL; 
        }
        $data['return_class'] = $this -> Generic_model -> get_classes_ho();
        for ($p=0; $p < count($schedule_data); $p++) {
     		for ($i = 0; $i < count($schedule_data[$p]); $i++) 
	     	{ 
	     		$class_id = $schedule_data[$p][$i]->class;
	     		$school_id = $schedule_data[$p][$i]->school_id;
	     		if ($class_id != null && $class_id != '') 
	     		{
	     			$data['return_div']= $this -> Generic_model -> get_division_data_ho($class_id, $school_id);
	     		}
	     	}
	    } 	
		$data['main_content'] = array('student/generic_specific/view_schedule_email_sms_ho');
		$this -> load -> view('bootstrap_templates/main_template', $data);
	}
```
{{< /details >}}

## delete_schedule_data
#### Code Complexity: 6
### Overview
This function is used to delete schedule data from the database. It takes the selected school ID and the primary ID of the schedule as input. It then calls the `delete_schedule_details_ho` method of the `Generic_model` class to delete the schedule details. If the deletion is successful, it returns '1'. Otherwise, it returns 'Could not Delete.'.

### User Acceptance Criteria
```gherkin
Feature: Delete Schedule Data

Scenario: Successful deletion
Given The user has selected a school
And The user has provided the primary ID of the schedule
When The user deletes the schedule data
Then The schedule data should be deleted successfully

Scenario: Unsuccessful deletion
Given The user has selected a school
And The user has provided the primary ID of the schedule
When The user deletes the schedule data
Then The schedule data should not be deleted
```

### Refactoring
1. Extract the logic of getting the selected school ID and primary ID into separate methods.
2. Use a more descriptive variable name instead of `ret_schedule_delete_data`.
3. Handle the error case more gracefully by throwing an exception or returning an error message instead of echoing 'Could not Delete.'.

{{< details "source code " >}}
```php
public function delete_schedule_data()
	{
		$sel_school_id = $this->input->post('sel_school_id');
		$data['primary_id']  = $this->input->post('primary_id');
        $ret_schedule_delete_data = $this -> Generic_model -> delete_schedule_details_ho($data['primary_id'], $sel_school_id);
        if ($ret_schedule_delete_data == 1)
        {
            echo "1";return;
        } else {
            echo "Could not Delete.";return;
        }
	}
```
{{< /details >}}

## fetch_student_data
#### Code Complexity: 6
### Overview
This function is responsible for fetching student data based on the given reference number and school ID. It first retrieves the reference number and school ID from the input. Then, it calls the `get_student_details_ho` method of the `Generic_model` to get the student details. If the returned data is not empty, it assigns it to the `ret_refno_data` variable. Finally, it loads the `view_student_details` view and passes the `ret_refno_data` to it.

### User Acceptance Criteria
```gherkin
Feature: Fetch Student Data

Scenario: Fetch student data successfully
Given The reference number is '12345'
And The school ID is '1'
When I fetch the student data
Then The student details are returned
```

### Refactoring
1. Extract the logic for retrieving the reference number and school ID into a separate method.
2. Move the logic for fetching the student details into a separate method in the `Generic_model`.
3. Use a more descriptive variable name instead of `ret_refno_data`.

{{< details "source code " >}}
```php
public function fetch_student_data()
	{
		$refno = explode(',', $this->input->post('refno'));
		$sel_school_id = $this->input->post('sel_school_id');
		$ret_refno_data =  $this -> Generic_model -> get_student_details_ho($refno, $sel_school_id);
		if ($ret_refno_data != NULL) 
        {
            $data['ret_refno_data'] = $ret_refno_data;
        }else{
            $data['ret_refno_data'] = NULL;
        }
		$this-> load -> view('student/generic_specific/view_student_details', $data);
	}
```
{{< /details >}}

## fetch_teacher_data
#### Code Complexity: 6
### Overview
This function is responsible for fetching teacher data based on the provided teacher ID and school ID. It retrieves the teacher's details using the `get_teacher_admin_details` method from the `Generic_specific_model` class. If the teacher data is found, it is passed to the view `view_teacher_details` to display the teacher's details. If no teacher data is found, a NULL value is passed to the view.

### User Acceptance Criteria
```gherkin
Feature: Fetch Teacher Data

Scenario: Fetch teacher data successfully
Given The teacher ID is provided
And The school ID is provided
When The fetch_teacher_data function is called
Then The teacher data is retrieved
And The teacher data is passed to the view

Scenario: No teacher data found
Given The teacher ID is provided
And The school ID is provided
And No teacher data is found
When The fetch_teacher_data function is called
Then A NULL value is passed to the view
```

{{< details "source code " >}}
```php
public function fetch_teacher_data()
	{
		$teacher_id =  $this->input->post('teacher_id');
		$sel_school_id = $this->input->post('sel_school_id');
		$ret_teacher_data =  $this -> Generic_specific_model -> get_teacher_admin_details($teacher_id);
		if ($ret_teacher_data != NULL) 
        {
            $data['ret_teacher_data'] = $ret_teacher_data;
        }else{
            $data['ret_teacher_data'] = NULL;
        }
		$this-> load -> view('student/generic_specific/view_teacher_details', $data);
	}
```
{{< /details >}}

## fetch_admin_data
#### Code Complexity: 6
### Overview
This function is responsible for fetching admin data based on the admin ID provided. It retrieves the admin ID from the input post data and then calls the `get_teacher_admin_details` method of the `Generic_specific_model` class to fetch the admin details. If the admin data is found, it is passed to the view `view_admin_details` for display.

### User Acceptance Criteria
```gherkin
Feature: Fetch Admin Data

Scenario: Fetch admin data successfully
Given The admin ID is provided
When The fetch_admin_data function is called
Then The admin data is retrieved and passed to the view

Scenario: Admin data not found
Given The admin ID is provided
When The fetch_admin_data function is called
Then The admin data is not found and NULL is passed to the view
```

### Refactoring
1. Use dependency injection to inject the `Generic_specific_model` class instead of directly accessing it.
2. Move the logic for checking if the admin data is NULL to a separate method for better separation of concerns.
3. Use a more descriptive variable name instead of `ret_admin_data`.

{{< details "source code " >}}
```php
public function fetch_admin_data()
	{
		$admin_id =  $this->input->post('admin_id');
		$ret_admin_data =  $this -> Generic_specific_model -> get_teacher_admin_details($admin_id);
		if ($ret_admin_data != NULL) 
        {
            $data['ret_admin_data'] = $ret_admin_data;
        }else{
            $data['ret_admin_data'] = NULL;
        }
		$this-> load -> view('student/generic_specific/view_admin_details', $data);
	}
```
{{< /details >}}

## send_all_schedule_data
#### Code Complexity: 40
### Overview
This function sends all schedule data to the appropriate recipients. It retrieves the schedule data from the `Generic_specific_model` and loops through each schedule to send the data. It performs various operations on the schedule data such as splitting strings, decoding JSON, and inserting feedback map data. Finally, it calls the `send_mail_all` function to send the email to the recipients.

### Refactoring
1. Extract the code inside the `if ($schedule_data != NULL)` condition into a separate function for better readability and maintainability.
2. Use a foreach loop instead of a for loop to iterate over the schedule data.
3. Extract the code inside the `if ($insert_img_flag == 1)` condition into a separate function for better readability and maintainability.
4. Consider using dependency injection to inject the `Generic_specific_model` and `send_mail_all` functions instead of directly accessing them.
5. Use meaningful variable names to improve code readability.

{{< details "source code " >}}
```php
public function send_all_schedule_data()
	{
		$schedule_data = $this -> Generic_specific_model -> get_schedule_data();
		if ($schedule_data != NULL) 
		{
			for ($i=0; $i < count($schedule_data) ; $i++)
			{ 
				$ref_no_array               = explode(',', $schedule_data[$i]->refnos);
				$teacher_id_array           = explode(',', $schedule_data[$i]->teacher_id);
				$admin_id_array             = explode(',',$schedule_data[$i]->admin_id);
				$generic_specific_flag      = $schedule_data[$i]->generic_specific_flag;
				$file_no                    = $schedule_data[$i]->file_no;
				$send_to_app_flag           = $schedule_data[$i]->send_to_app;
				$comma_seperated_refno      = $schedule_data[$i]->csv_refno;
				$class                      = $schedule_data[$i]->class;
				$division                   = $schedule_data[$i]->division;
				$mail_or_sms_flag     	    = $schedule_data[$i]->mail_sms;
				$additional_email_sms_array = NULL;
				$additional_email_sms_array = explode(',',$schedule_data[$i]->addtional_emails);
				$attachment_flag            = $schedule_data[$i]->attachment_flag;
				$csv_data                   = json_decode($schedule_data[$i]->attachment,true);
				$module_flag                = 1;
				$data['school_id']          = $schedule_data[$i]->school_id;
				$insert_img_flag            = $schedule_data[$i]->img_flag;
				$data['email_subject']      = $schedule_data[$i]->template_name;
				$unix_timestamp             = time();
				$data['feedback_parameter'] = $unix_timestamp;
				
				if ($insert_img_flag == 1)
				{
					if ($schedule_data[$i]->mail_sms == 'email') 
					{
						$ret_data = $this -> Generic_specific_model -> insert_feedback_map_data($data);
					}
				}

				$this -> send_mail_all($ref_no_array,$teacher_id_array,$admin_id_array,$generic_specific_flag,$file_no,$send_to_app_flag,$comma_seperated_refno,$class,$division,$mail_or_sms_flag,$additional_email_sms_array,$attachment_flag,$csv_data,$module_flag, $data['school_id'],$insert_img_flag,$unix_timestamp,$temp_id,$sender_id);	
			}
		}else{
			echo "NO schedule_data found";return;
		}
	}
```
{{< /details >}}

## send_mail_all
#### Code Complexity: 653
### Overview
This function is used to send emails to multiple recipients. It takes in various parameters such as the array of reference numbers, array of teacher IDs, array of admin IDs, flag to determine if the email is generic or specific, file number, flag to determine if the email should be sent to the app, comma-separated reference numbers, class, division, flag to determine if the email is for mail or SMS, array of additional email/SMS recipients, flag to determine if attachments should be included, CSV data, module flag, selected school ID, flag to determine if images should be inserted, UNIX timestamp, template ID, and sender ID.

### User Acceptance Criteria
```gherkin
Feature: Send Mail All
Scenario: Send emails to multiple recipients
Given The reference numbers are [ref_no_array]
And The teacher IDs are [teacher_id_array]
And The admin IDs are [admin_id_array]
And The generic specific flag is [generic_specific_flag]
And The file number is [file_no]
And The send to app flag is [send_to_app_flag]
And The comma-separated reference numbers is [comma_separated_refno]
And The class is [class]
And The division is [division]
And The mail or SMS flag is [mail_or_sms_flag]
And The additional email/SMS array is [additional_email_sms_array]
And The attachment flag is [attachment_flag]
And The CSV data is [csv_data]
And The module flag is [module_flag]
And The selected school ID is [sel_school_id]
And The insert image flag is [insert_img_flag]
And The UNIX timestamp is [unix_timestamp]
And The template ID is [temp_id]
And The sender ID is [sender_id]
When I call the send_mail_all function
Then The emails should be sent to the recipients
```

### Refactoring
1. Extract the code for getting email content into a separate function.
2. Extract the code for sending emails into a separate function.
3. Use a configuration file to store the file paths for email content.
4. Use a configuration file to store the maximum number of emails that can be sent at once.
5. Use a configuration file to store the sender information for emails.
6. Use a configuration file to store the sender information for SMS.
7. Use dependency injection to inject the dependencies for sending emails and SMS.
8. Use a logger to log any errors or exceptions that occur during the sending of emails or SMS.

{{< details "source code " >}}
```php
public function send_mail_all($ref_no_array,$teacher_id_array,$admin_id_array,$generic_specific_flag,$file_no,$send_to_app_flag,$comma_seperated_refno,$class,$division,$mail_or_sms_flag,$additional_email_sms_array,$attachment_flag,$csv_data,$module_flag, $sel_school_id,$insert_img_flag,$unix_timestamp,$temp_id,$sender_id)
	{
		$send_content_to_app_result = TRUE;	
		$email_type = 'specific';
		$email_code = 'SPECIFIC';
		if ($generic_specific_flag != 1)
		{	
			$original_preview_content = read_file('./application/views/student/generic_specific/email_content/generic_email_content_'.$file_no.'.txt');
			$subject_content = read_file('./application/views/student/generic_specific/email_content/generic_subject_content_'.$file_no.'.txt');
			$email_type = 'generic';
			$email_code = 'GENERIC';
		}
		// if ($generic_specific_flag == 1)
		// { // Specific (Does NOT send flag)
		// 	$field_name = $this -> Generic_specific_model -> get_field_name();
		// 	$class_info = $this -> Class_division_model -> get_classes();
		// 	$division_info = $this -> Class_division_model -> get_division_info();
		// 	$csv_data_array = $_SESSION['csv_data_for_send_to_all'];
		// 	$csv_column_array = $_SESSION['csv_column'];
		// }


		$teacher_and_admin_array = array();
		if(!is_array($teacher_id_array))
		{
			$teacher_and_admin_array = $admin_id_array;
		}
		if (!is_array($admin_id_array)) {
			$teacher_and_admin_array = $teacher_id_array;
		}
		if (is_array($teacher_id_array) && is_array($admin_id_array)) {
			$teacher_and_admin_array = array_merge($teacher_id_array, $admin_id_array);
		}
		$teacher_admin_mail_array = array();
		$teacher_admin_mobile_array = array();
		if($teacher_and_admin_array != NULL) {
			$return_staff_info = $this -> Generic_specific_model -> get_staff_data_from_ids($teacher_and_admin_array);
			if ($return_staff_info != NULL || $return_staff_info != '')
			{
				$return_staff_array = $return_staff_info->result_array();
				for ($a = 0; $a < count($return_staff_array ); $a++)
				{
					if ($return_staff_array[$a]['email'] != NULL && $return_staff_array[$a]['email'] != '')
					{
						$arrayName = array(
										'email' => trim($return_staff_array[$a]['email']),
										'name' => $return_staff_array[$a]['first_name']." ".$return_staff_array[$a]['last_name'],
										'type' => 'to'
									);
						array_push($teacher_admin_mail_array, $arrayName);
					}
					if ($return_staff_array[$a]['mobile_no'] != NULL && $return_staff_array[$a]['mobile_no'] != '')
					{
						array_push($teacher_admin_mobile_array,$return_staff_array[$a]['mobile_no']);
					}
				}
			}
		}

		if (!empty($ref_no_array))
		{
			$returned_refno_data = $this -> Generic_model -> get_all_mail_ids_ho($ref_no_array, $sel_school_id);
			if ($returned_refno_data != NULL && $returned_refno_data != '') 
			{
				$refno_data_array = $returned_refno_data->result_array();

				for ($i = 0; $i < count($refno_data_array); $i++)
				{
					// Code to get email content starts here
					// if ($generic_specific_flag == 1)
					// {
					// 	// For Specific Email
					// 	$preview_content = $this -> generate_specific_preview_content($field_name, $class_info, $division_info, $refno_data_array[$i], $csv_column_array, $_SESSION['csv_data_for_send_to_all'], $mail_or_sms_flag, $file_no);
					// 	$subject_content = read_file('./application/views/student/generic_specific/email_content/specific_subject_content_'.$file_no.'.txt');
					// } else {
						// For Generic Email
						$name_template = $refno_data_array[$i]['first_name'].' '.$refno_data_array[$i]['last_name'];
						$refno_template  = $refno_data_array[$i]['refno'];
						$preview_content = str_replace('<<name_template>>', $name_template, $original_preview_content);
						$preview_content = str_replace('$$refno$$', $refno_template, $preview_content);
					// }

					// Code to get email content ends here

					$send_to_app_content = $preview_content;
					// Attachment code starts here
					$attachments = array();
					if ($attachment_flag) {
						$send_csv_data                     = array();
						$send_refno                        = $refno_data_array[$i]['refno'];
						$send_csv_data['column']           = $csv_data['column'];
						$send_csv_data[$send_refno]        = $csv_data[$send_refno];
						$send_csv_data['send_to_app_flag'] = $send_to_app_flag;

						$attachment_result = $this->do_attachment($preview_content, $send_csv_data, $send_refno);
						$preview_content     = $attachment_result['preview_content'];
						$attachments         = $attachment_result['attachments'];
						$send_to_app_content = $attachment_result['content_for_app'];
					}
					// Attachment code ends here

					// Code for Save Message in Student App starts here
					if ($send_to_app_flag) 
					{
						if ($comma_seperated_refno == 'YES') 
						{
							$send_content_to_app_result = $this -> send_content_to_app($comma_seperated_refno, $refno_data_array[$i]['refno'], $refno_data_array[$i]['admission_to'], $refno_data_array[$i]['division'], $subject_content, $send_to_app_content, $msg_type, $sel_school_id);
						} 
						if ($comma_seperated_refno == 'NO') 
						{
							$send_content_to_app_result = $this -> send_content_to_app($comma_seperated_refno, $refno_data_array[$i]['refno'], $class, $division, $subject_content, $send_to_app_content, $msg_type, $sel_school_id);
							$send_to_app_flag = FALSE;
						}
					}

					// Code for Save Message in Student App ends here
					if ($mail_or_sms_flag == 'email')
					{
						if ($insert_img_flag == 1) 
						{	
							$mail_template = $this ->insert_feedback_image($subject_content,$sel_school_id,$refno_data_array[$i]['refno'],$unix_timestamp,1);
							$preview_content .= $mail_template;
						}
					}

					// Code to send email starts here
					if ($mail_or_sms_flag == 'email')
					{
						$parent_mail_array = array();
						// Additional & Admin & Teacher Emails
						if ($i == 0) {
							$teacher_mail_ids = array();
							// Only Additional Emails
							if ($additional_email_sms_array != NULL && !empty($additional_email_sms_array)) {
								for ($a = 0; $a < count($additional_email_sms_array); $a++){
									$arrayName = array(
													'email' => trim($additional_email_sms_array[$a]),
													'name' => '',
													'type' => 'to'
												);
									array_push($teacher_mail_ids, $arrayName);	
								}
							}
							// Only Admin & Teachers Emails
							if ($teacher_admin_mail_array != NULL && !empty($teacher_admin_mail_array)) {
								for ($a = 0; $a < count($teacher_admin_mail_array); $a++){
									array_push($teacher_mail_ids, $teacher_admin_mail_array[$a]);
								}
							}

							$teacher_mail_limit    				  = array();
							$email_parameter['attachments']       = $attachments;
							$email_parameter['preview_content']   = $preview_content;
							$email_parameter['subject_content']   = $subject_content;
							$email_parameter['email_code'] 		  = $email_code;
							$email_parameter['sel_school_id'] 	  = $sel_school_id;

							for ($k = 0; $k < count($teacher_mail_ids) ; $k++) 
							{ 
								array_push($teacher_mail_limit, $teacher_mail_ids[$k]);
								if($k%48 == 0 && $k!=0) 
								{
									$email_parameter['parent_mail_array'] = $teacher_mail_limit;
									$this->send_email($email_parameter);
									$teacher_mail_limit = array();
								}
							}

							if(count($teacher_mail_limit) != 0)
							{
								$email_parameter['parent_mail_array'] = $teacher_mail_limit;
								$this->send_email($email_parameter);
							}
						}
						// Father Emails
						if ($refno_data_array[$i]['father_email_id'] != NULL && $refno_data_array[$i]['father_email_id'] != "" ) {
							$arrayName = array(
											'email' => trim($refno_data_array[$i]['father_email_id']),
											'name' => $refno_data_array[$i]['father_f_name']." ".$refno_data_array[$i]['father_s_name'],
											'type' => 'to'
										);
							array_push($parent_mail_array, $arrayName);
						}

						// Mother Emails
						if ($refno_data_array[$i]['mother_email_id'] != NULL && $refno_data_array[$i]['mother_email_id'] != "" ) {
							$arrayName = array(
											'email' => trim($refno_data_array[$i]['mother_email_id']),
											'name' => $refno_data_array[$i]['mother_f_name']." ".$refno_data_array[$i]['mother_s_name'],
											'type' => 'to'
										);
							array_push($parent_mail_array, $arrayName);
						}

						// Student Emails

						$student_email = $this-> Student_model ->get_student_account_details($refno_data_array[$i]['refno'],$sel_school_id);
			        	$email_id = strtolower($student_email[0]->user_email);
			        	if ($email_id != NULL && $email_id != '')
			        	{			        		
			        		$temp_array = array(
											'email' => trim($email_id),
											'name'  => $refno_data_array[$i]['first_name'],
											'type' => 'to'
										);
				        	array_push($parent_mail_array, $temp_array);
			        	}

						$email_status = TRUE;
						// Check mail array NULL to avoid mail service fail error in between email loop
						if (!empty($parent_mail_array)) 
						{
							$email_sender_info = array('module_code' => $email_code.'_EMAIL', 'school_id' => $sel_school_id, 'ref_sch_id' => '0', 'ref_inst_id' => '0');
							$email_sender = Send_mail_helper::get_sender_data($email_sender_info);

							$email_sender_array = array(
								'sender_name' => $email_sender['sender_name'],
								'from_email'  => $email_sender['from_email'],
					            'school_id'   => $sel_school_id,
					            'bcc_email'   => TRUE
							);
							$email_status = Send_mail_helper::send_mail($parent_mail_array, $preview_content, $subject_content, $attachments, $email_sender_array);
						}
					} else {	// SMS Loop
						$preview_content = $preview_content.'##'.$temp_id.'##'.'**'.$sender_id.'**';
						$mobile_nos = '';
						// Additional & Admin & Teacher Numbers
						if ($i == 0) {
							if ($additional_email_sms_array != NULL) {
								// Additional numbers
								for ($a = 0; $a < count($additional_email_sms_array); $a++) { 
									$temp = $additional_email_sms_array[$a].",";
									$mobile_nos .= $temp;
								}
							}
							// Admin & Teacher numbers
							if ($teacher_admin_mobile_array != NULL) {
								for ($a = 0; $a < count($teacher_admin_mobile_array); $a++) { 
									$temp = $teacher_admin_mobile_array[$a].",";
									$mobile_nos .= $temp;
								}
							}
						}

						// Student SMS Number
						if ($refno_data_array[$i]['student_sms_no'] != NULL && $refno_data_array[$i]['student_sms_no'] != "" ) {
							$temp = $refno_data_array[$i]['student_sms_no'];
							$mobile_nos .= $temp;
						}
						if ($mobile_nos != "") {
							$email_sender_info = array('module_code' => $email_code.'_EMAIL', 'school_id' => $sel_school_id, 'ref_sch_id' => '0', 'ref_inst_id' => '0');
							$sms_sender = Send_sms_helper::get_sms_sender($email_sender_info);
							$sms_sender_array = array('sms_sender_name' => $sms_sender);

							$sms_status = TRUE;
							$sms_status = Send_sms_helper::send_sms($mobile_nos, $preview_content,$sms_sender_array);
						}
					}
				}
			}else{
				$refno_data_array = NULL;
			}

			if ($module_flag == 0)// For Send To all Function
			{
				$app_result_msg = '';
				if (!$send_content_to_app_result) {
					$app_result_msg = "<br>E-Mail/SMS Content not saved for Student App.";
				}
			
				if ($mail_or_sms_flag == 'email')
				{	
					if (isset($_SESSION['attachment_csv_data'])) 
					{
						unset($_SESSION['attachment_csv_data']);
					}
					echo $_SESSION['detail_msg'] = "All Email's have been sent. Please check.".$app_result_msg;
				} else {
					echo $_SESSION['detail_msg'] = "All SMS's have been sent successfully. Please check.".$app_result_msg;
				}
				unlink('./application/views/student/generic_specific/email_content/'.$email_type.'_email_content_'.$file_no.'.txt');
				unlink('./application/views/student/generic_specific/email_content/'.$email_type.'_subject_content_'.$file_no.'.txt');
				redirect('generic_mail_sms');
			}else
			{ 
				//For Schedule data Function
				if ($mail_or_sms_flag == 'email')
				{
					if($email_status)
					{
	        			$returned_data = $this -> Generic_model -> update_send_email_ho($ref_no_array, $sel_school_id);
	    				return true;
	        		}
	        	}else{
	        		if($sms_status)
					{
        				$returned_data = $this -> Generic_model -> update_send_email_ho($ref_no_array, $sel_school_id);
    					return true;
        			}
	        	}
			}
		} else {
			$_SESSION['msg'] = "Refno are not selected!";
			if ($module_flag == 0)
			{
				redirect('generic_mail_sms');
			}
		}
	}
```
{{< /details >}}

## ajax_division_list_ho
#### Code Complexity: 2
### Overview
This function is used to retrieve and display a list of divisions based on the selected class and school. It takes the class ID and selected school ID as input parameters. It then calls the `get_all_division_data_generic` method of the `Generic_model` to retrieve the division data. The retrieved data is then passed to the `view_ajax_division_list` view for rendering.

### User Acceptance Criteria
```gherkin
Feature: Retrieve and display division list

Scenario: User selects a class and school
Given The user has selected a class
And The user has selected a school
When The user requests to view the division list
Then The division list is retrieved and displayed
```

{{< details "source code " >}}
```php
public function ajax_division_list_ho()
    {
		$class_id = $this->input->post('class_id');
		$sel_school_id = $this->input->post('selected_school_id');

		$data['division_data'] = $this -> Generic_model -> get_all_division_data_generic($class_id, $sel_school_id);
		$data['class_id'] = $class_id;
		$data['division_id'] = '';
		$this->load->view('common/classdivision/view_ajax_division_list',$data);
    }
```
{{< /details >}}

## insert_feedback_image
#### Code Complexity: 2
### Overview
This function is used to insert a feedback image into the database. It takes the subject, school ID, reference number, Unix timestamp, and mail format as input parameters. It then generates three links (yes, maybe, and no) based on the input parameters. Finally, it loads a feedback email template and returns it.

{{< details "source code " >}}
```php
public function insert_feedback_image($subject,$sel_school_id,$refno,$unix_timestamp,$mail_format)
	{
		$data['email_subject']      = $subject;
		$data['school_id']          = $sel_school_id;
		$data['feedback_parameter'] = $unix_timestamp;
		
		$data['yes_link'] = APP_PAY_URL."/".FEEDBACK_CONTR_NAME."/".FEEDBACK_CONTR_METHOD."/".$data['feedback_parameter']."/YES/".$data['school_id']."/".$refno."/".$mail_format;
		$data['maybe_link'] = APP_PAY_URL."/".FEEDBACK_CONTR_NAME."/".FEEDBACK_CONTR_METHOD."/".$data['feedback_parameter']."/MAYBE/".$data['school_id']."/".$refno."/".$mail_format;
		$data['no_link'] = APP_PAY_URL."/".FEEDBACK_CONTR_NAME."/".FEEDBACK_CONTR_METHOD."/".$data['feedback_parameter']."/NO/".$data['school_id']."/".$refno."/".$mail_format;

		$mail_template = $this-> load -> view('common/feedback/feedback_email_content', $data,TRUE);

		return $mail_template;
	}
```
{{< /details >}}

## email_tag_ho
#### Code Complexity: 6
### Overview
This function is responsible for displaying the email tag page in the HO (Head Office) section of the application. It sets up the necessary data for the page and loads the view file.

### User Acceptance Criteria
```gherkin
Feature: Display Email Tag Page
Scenario: HO user views email tag page
Given the user is logged in as a HO user
When the user navigates to the email tag page
Then the email tag page is displayed with the necessary data
```

### Refactoring
1. Extract the page setup logic into a separate function for better code organization.
2. Use a constant or configuration file for the page name, icon, and title instead of hardcoding them.
3. Consider using a template engine to load the view file instead of directly calling the `load->view` method.

{{< details "source code " >}}
```php
public function email_tag_ho()
	{
		$data['page_data']['page_name']         = 'Email Tag';
        $data['page_data']['page_icon']         = 'fa fa-pencil-square-o';
        $data['page_data']['page_title']        = 'Email Tag';
        $data['page_data']['page_date']         = date("d M Y");
		$email_tag_data = $this -> Generic_model -> fetch_email_tag_ho();
        if ($email_tag_data != NULL || $email_tag_data != '')
        {
            $data['email_tag_data'] = $email_tag_data;
        }
		$data['main_content'] = array('student/generic_specific/view_email_tag_ho');
		$this -> load -> view('bootstrap_templates/main_template', $data);
	}
```
{{< /details >}}

## add_email_tag
#### Code Complexity: 14
### Overview
This function is used to add an email tag. It takes the tag name from the POST request and inserts it into the database. Before inserting, it checks if the tag name already exists in the database. If it exists, it returns '1'. If the insertion is successful, it returns '2'.

### User Acceptance Criteria
```gherkin
Feature: Add Email Tag
Scenario: Insert new email tag
Given The tag name is 'New Tag'
When I add the email tag
Then The tag is inserted successfully
```

### Refactoring
1. Use a more descriptive variable name instead of 'data'.
2. Use a more specific return value instead of '1' and '2'.
3. Handle database errors and return appropriate error messages.

{{< details "source code " >}}
```php
public function add_email_tag()
	{
		$data['tagname'] = ucfirst($_POST['tagname']);
		$validate_tagname_insert  = $this -> Generic_model -> fetch_email_tag_configuration($data);
        if($validate_tagname_insert != NULL && $validate_tagname_insert != '')
        {
            echo "1";return;
        }else{
        	$ret_tag_insert = $this-> Generic_model -> email_tag_insert($data);
        	if ($ret_email_insert) 
        	{
        		echo "2";return;
        	}
        }
    }
```
{{< /details >}}

## ajax_update_tag_row
#### Code Complexity: 1
### Overview
This function is used to update a tag row in the database using an AJAX request. It retrieves the edit ID and edit value from the AJAX POST request, and then calls the `update_email_tag_data` method of the `Generic_model` to update the tag data in the database. The updated data is then returned as a response.

### User Acceptance Criteria
```gherkin
Feature: Update Tag Row

Scenario: Update tag row with valid data
  Given There is an existing tag row
  When I update the tag row with valid data
  Then The tag row should be updated in the database

Scenario: Update tag row with invalid data
  Given There is an existing tag row
  When I update the tag row with invalid data
  Then An error should be returned
```

### Refactoring
1. Extract the logic of retrieving the edit ID and edit value into a separate method.
2. Move the database update logic into a separate method in the `Generic_model` class.
3. Use dependency injection to inject the `Generic_model` instance into the `ajax_update_tag_row` method.

{{< details "source code " >}}
```php
public function ajax_update_tag_row()
    {
        $edit_id        = $this->input->post('edit_id');
        $edit_val       = ucfirst($this->input->post('edit_val'));
        $data['ret_email_update'] = $this -> Generic_model -> update_email_tag_data($edit_id,$edit_val);return;
    }
```
{{< /details >}}

## tag_config_delete
#### Code Complexity: 6
### Overview
This function is used to delete a tag configuration. It takes the primary ID of the tag as input and calls the `tag_auth_config_delete` method of the `Generic_model` class to delete the tag configuration. If the deletion is successful, it returns '1'.

### User Acceptance Criteria
```gherkin
Feature: Tag Configuration Delete
Scenario: Delete tag configuration
Given A tag with primary ID '123'
When I call the tag_config_delete function
Then The tag configuration with primary ID '123' should be deleted
```

{{< details "source code " >}}
```php
public function tag_config_delete()
    {
        $data['primary_id']  = $this->input->post('primary_id');
        $ret_result = $this-> Generic_model -> tag_auth_config_delete($data);
        if ($ret_result) 
        {
        	echo "1";return;
        }
    }
```
{{< /details >}}

## Risks & Security Issues
**__construct**: 

**index**: 

**show_mail_type**: 1. The function does not handle error cases where the required data is not available.
2. The function does not have proper error handling and error messages.
3. The function has a lot of duplicated code that can lead to maintenance issues.
4. The function does not have proper input validation and sanitization.



**check_ref_no_exist**: 

**send_to_all**: 1. The function does not handle cases where the `refno` or `selected_type`/`selected_module_type` values are not set in the POST request.
2. The function does not handle cases where the `mail_sms` or `send_app` values are not set in the POST request.
3. The function does not handle cases where the `additional_email_list` value is not set in the POST request.
4. The function does not handle cases where the `email_feedback_check` value is not set in the POST request.
5. The function does not handle cases where the `file_no`, `comma_seperated_refno`, `sel_class`, `sel_div`, `new_temp_id`, or `new_sender_id` values are not set in the POST request.
6. The function does not handle cases where the `Generic_specific_model` or `send_mail_all` functions fail to execute successfully.

**send_content_to_app**: 

**save_in_student_app**: 1. The function assumes that the session variable 'database' is set, which may not always be the case.
2. The function does not handle any potential errors or exceptions that may occur during the database insertion process.

**write_email_template**: 1. The current method of generating the random number using microtime may not be secure enough.
2. There is no validation or sanitization of the input values.
3. The file paths are hardcoded and may not be flexible for different environments.

**remaining_sms_count**: 1. The function assumes that the API response will always be in the expected format. If the response format changes, the function may break.
2. There is no error handling for network failures or invalid API responses.

**send_email**: 1. The email_sender_info array may not contain all the necessary information, leading to errors in retrieving the sender data.
2. The email_sender_array may not be constructed correctly, leading to errors in sending the email.
3. The send_mail function may have bugs or limitations that affect the email sending process.

**upload_attachments**: 1. The function does not handle file upload errors gracefully. It simply echoes an error message and returns, which may not provide enough information for troubleshooting.
2. The function does not handle file permission issues when setting the file permissions using `chmod`. This could lead to potential security vulnerabilities.
3. The function does not handle file deletion after processing. This could lead to accumulation of unnecessary files on the server.
4. The function does not handle potential memory issues when reading and processing large CSV files. This could lead to performance problems or crashes.

**do_attachment**: 

**insert_schedule_data**: 1. The function does not handle any validation or sanitization of the input data, which could lead to security vulnerabilities.
2. The function does not have any error handling or logging, making it difficult to debug any issues that may occur during the insertion of schedule data.

**schedule_email_sms**: 1. The condition `if ($schedule_data != "" ||  $schedule_data != NULL)` should use the logical operator `&&` instead of `||`.
2. The condition `if ($class_id != null && $class_id != '')` should use the `!==` operator instead of `!=` to check for both null and empty string.

**delete_schedule_data**: 1. The function does not handle any exceptions that may occur during the deletion process.
2. The function does not validate the input parameters before using them in the deletion process.

**fetch_student_data**: 1. The function does not handle any errors that may occur during the retrieval of student details.
2. The function assumes that the `Generic_model` is available and has a `get_student_details_ho` method.

**fetch_teacher_data**: 

**fetch_admin_data**: 1. The function does not handle any errors that may occur during the fetching of admin data.
2. The function assumes that the `Generic_specific_model` class is available and has a method named `get_teacher_admin_details`.

**send_all_schedule_data**: 1. The function does not handle any errors or exceptions that may occur during the execution of the code.
2. The function does not have any input validation or sanitization, which may lead to security vulnerabilities.
3. The function does not have any error handling or logging mechanism, making it difficult to debug issues.

**send_mail_all**: 1. The function is currently tightly coupled with the file system, making it difficult to test and maintain.
2. The function does not handle errors or exceptions that may occur during the sending of emails or SMS.
3. The function does not have any input validation or error handling for invalid or missing parameters.
4. The function does not have any error handling for failed database queries.
5. The function does not have any error handling for failed file operations.
6. The function does not have any error handling for failed email or SMS sending.
7. The function does not have any error handling for failed API calls to the student app.
8. The function does not have any error handling for failed API calls to the SMS gateway.
9. The function does not have any error handling for failed API calls to the email service provider.
10. The function does not have any error handling for failed API calls to the database.

**ajax_division_list_ho**: 

**insert_feedback_image**: 

**email_tag_ho**: 

**add_email_tag**: 1. The function does not handle database errors, which can lead to unexpected behavior.
2. The function does not validate the input data, which can lead to SQL injection attacks.

**ajax_update_tag_row**: 1. The function does not handle any validation or error checking for the input data.
2. The function does not handle any exceptions that may occur during the database update process.
3. The function does not provide any feedback or error messages to the user in case of errors.

**tag_config_delete**: 

