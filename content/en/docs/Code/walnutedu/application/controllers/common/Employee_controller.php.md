+++
categories = ["Documentation"]
title = "Employee_controller.php"
+++

## File Summary

- **File Path:** application\controllers\common\Employee_controller.php
- **LOC:** 873
- **Last Modified:** Git logs not found
- **Number of Commits (Total / Last 6 Months / Last Month):** Git logs not found
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** Git logs not found
- **Top Contributors:** Git logs not found

{{< details "File source code " >}}
```php
<?php
    require_once(APPPATH.'controllers/system/Walmiki_interface_controller.php');
    class Employee_controller extends Walmiki_interface_controller
    {
        public function __construct()
        {
            parent::__construct();
            @session_start();
            date_default_timezone_set('Asia/Kolkata');
            $this -> load ->library('Google_login');
            $this->load->model('common/School_model');
            $this->load->model('common/Employee_model');
            $this->load->model('system/Walmiki_interface_model');
            $this ->load-> model('common/Staff_report_model');
            $this->google_login->check_token_expiration();
            $this->load->library('Google_classroom');
        }

        function index(){ //default load for employee view list
            $data['page_data']['page_date'] = date("d M Y");
            $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
            $access_token = $this-> google_classroom ->get_access_token($client);
            $customer_id = 'my_customer';
            $retrive_all_user_info = NULL;

            //Getting orgnization(OrgUnitInfo) from google API
            $retrive_org_info = $this->google_login ->RetriveOrgUnitInfo($access_token,$customer_id);
            $orgunittypeinfo = json_decode($retrive_org_info);
            $organizationunits = $orgunittypeinfo->organizationUnits;
            $orgnizationname = array();
            foreach ($organizationunits as $key => $value) {
                array_push($orgnizationname, $value->name);
            }
            //End of orgunitinfo//
            $data['flag_permission'] = 1;
            $user_all_info = array();
            $page_token = NULL;
            $all_user_info = array();
            do{
                $ret_retrive_all_user_info = $this->google_login ->RetriveAllUserInfo($access_token,$page_token);
                $retrive_all_user_info = json_decode($ret_retrive_all_user_info);
                if (!$ret_retrive_all_user_info) {
                    $data['flag_permission'] = 0;
                }
                array_push($all_user_info,$retrive_all_user_info);
                $page_token = $retrive_all_user_info->nextPageToken;
            }while($page_token != NULL);

            $school_data = $this -> School_model -> get_login_school_data();
            if ($school_data != NULL) {
                $data['school_n_ho_data'] = $school_data;
            } else {
                $data['school_n_ho_data'] = NULL;
            }
            $ho_and_school_array = $data['school_n_ho_data']->result_array();
            $ho_array = array(
                                'school_id' => 0,
                                'school_name' =>'Head Office'
                            );
            array_push($ho_and_school_array, $ho_array);

            $school_d_headofc = array();
            for ($k=0; $k < count($ho_and_school_array); $k++) { 
                array_push($school_d_headofc, $ho_and_school_array[$k]['school_name']);
            }
            
            $user_info = NULL;
            $staff_info = array();
            $ret_staff_role = "";

            for($i=0; $i< count($all_user_info);$i++)
            {
                $retrive_all_user_data = $all_user_info[$i];
                foreach ($retrive_all_user_data -> users as $key => $data_value)
                {
                    $unitpath = $data_value->orgUnitPath;
                    $roll_name = ' - ';
                    $staff_info = $this-> Employee_model -> get_extra_staff_info($data_value->primaryEmail); // Get status from MGR system
                    $ret_staff_role = $this-> Employee_model -> get_employee_selected_role($staff_info[0]['role']); // Get role name
                    if ($ret_staff_role != "") 
                    {
                        $roll_name = $ret_staff_role->result_array()[0]['role_name'];
                    }
                    if(($data_value->suspended == NULL)||($data_value->suspended == ""))
                    {
                        $ret_retrive_user_group_info = $this->google_login ->RetriveUserGroupInfo($access_token, $data_value->primaryEmail);
                        $ret_retrive_user_group_info = json_decode($ret_retrive_user_group_info);
                        $ret_retrieve_group = $ret_retrive_user_group_info->groups;
                        $group_name_array= array();
                        for($p=0; $p < count($ret_retrieve_group); $p++ ){
                            $group_name = $ret_retrieve_group[$p]->name;
                            array_push($group_name_array,$group_name);
                        }
                        $ret_group_name = implode(",",$group_name_array);
                        $user_info = array(
                                        'email_id'=>$data_value->primaryEmail,
                                        'first_name'=>$data_value->name->givenName,
                                        'last_name'=>$data_value->name->familyName,
                                        'full_name'=>$data_value->name->fullName,
                                        'orgunitpath'=>$data_value->orgUnitPath,
                                        'phones'=>isset($data_value->phones['0']->value)?$data_value->phones['0']->value:'',
                                        'status'=>isset($staff_info[0]['isactive'])?$staff_info[0]['isactive']:' - ',
                                        'role'=>$roll_name,
                                        'group_name'=> $ret_group_name
                                    );
                        array_push($user_all_info, $user_info);  
                    }
                }
            }
            $users_of_org = array();
            for ($i=0; $i < count($user_all_info); $i++) { 
                // $orgunit_exploed = explode('/', $user_all_info[$i]['orgunitpath']);
                // if (in_array($orgunit_exploed[1],$school_d_headofc)) {
                    array_push($users_of_org, $user_all_info[$i]); 
                // }
            }
            $data['school_d_headofc'] = $school_d_headofc;
            $data['users_of_org'] = $users_of_org;
            $data['main_content'] = array('common/employee/view_employee_list');
            $data['page_data']['page_title'] = 'Employee Information';
            $this -> load -> view('bootstrap_templates/main_template', $data);
        }
        
        function check_username_exist(){ //check user exist in walnutedu domain or not
            $email_id = $_POST['email_id'];
            // $check_system_entry = $this -> Employee_model -> check_user_exist($email_id); //check in query database

            $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
            $access_token = $this-> google_classroom ->get_access_token($client);
            $selected_user_info = $this-> google_login ->RetriveUserInfo($access_token,$email_id); //check email present at @walnutedu.in domain
            $selected_user_info_array = json_decode($selected_user_info);
            if ($selected_user_info_array->primaryEmail != '') {
                echo TRUE;return;
            }else{
                echo FALSE;return;
            }
        }
        
        function crud(){//open model for create and edit

            $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
            $access_token = $this-> google_classroom ->get_access_token($client);
            //School and Head Office Info
            $school_data = $this -> School_model -> get_login_school_data();
            if ($school_data != NULL) {
                $data['school_n_ho_data'] = $school_data;
            } else {
                $data['school_n_ho_data'] = NULL;
            }
            $ho_and_school_array = $data['school_n_ho_data']->result_array();
            $ho_array = array('school_id' => 0,'school_name' =>'Head Office');
            array_push($ho_and_school_array, $ho_array);
            $data['school_d_headofc'] = $ho_and_school_array;
            //School and Head Office Info END

            //Department Master
            $dept_data = $this -> Employee_model -> get_employee_department();
            if ($dept_data != NULL) {
                $data['department_data'] = $dept_data;
            } else {
                $data['department_data'] = NULL;
            }
            //Department Master END

            //Fetch Google group Data
            $ret_retrive_all_group_info = $this->google_login ->RetriveAllGroupInfo($access_token);
            $ret_retrive_all_group_info = json_decode($ret_retrive_all_group_info);
            $group_info= $ret_retrive_all_group_info ->groups;
            $group_name_array = array();
            for($j=0; $j< count($group_info); $j++){
                $data['group_name']= $group_info[$j]->name;
                array_push($group_name_array,$data['group_name']);
                $data['group_name']= $group_name_array;
            }
            // Google Group Data End

            //Walnut Role Master
            $ret_user_role = $this -> Employee_model -> get_employee_role();
            if ($ret_user_role != NULL) {
                $data['user_role'] = $ret_user_role;
            } else {
                $data['user_role'] = NULL;
            }
            //Walnut Role Master END
            
            $create_or_update = $_POST['emp_operation'];
            switch ($create_or_update) {
                case 'create_emp':
                    $data['page_title'] = 'Add Employee';
                    $this -> load -> view('common/employee/add_employee', $data);
                    break;
                case 'update_emp':
                    $email_id = $_POST['emp_id'];
                    //Getting from Google API
                    $selected_user_info = $this->google_login ->RetriveUserInfo($access_token,$email_id);
                    $selected_user_info_array = json_decode($selected_user_info);
                    $data['selected_user_info_array'] = $selected_user_info_array;//must remove
                    $data['user_email'] = $selected_user_info_array->primaryEmail;

                    $data['first_name'] = $selected_user_info_array->name->givenName;
                    $data['last_name'] = $selected_user_info_array->name->familyName;
                    
                    $data['mobile'] = isset($selected_user_info_array->phones[0]->value)?$selected_user_info_array->phones[0]->value:'';
                    $data['orgunitpath'] = $selected_user_info_array->orgUnitPath;
                    //Getting from database

                    $ret_user_info = $this -> Employee_model -> get_employee_details($email_id);
                    if ($ret_user_info != NULL) {
                        $data['user_info'] = $ret_user_info->result_array();
                    } else {
                        echo '';return;
                    }
                    
                    $data['google_user_data']= $data['user_info'][0]['google_group'];
                    $data['group_array_update']= explode(",",$data['google_user_data']);
                    $ret_retrive_user_group_info = $this->google_login ->RetriveUserGroupInfo($access_token, $data['user_email']);
                    $ret_retrive_user_group_info = json_decode($ret_retrive_user_group_info);
                    $ret_retrieve_group = $ret_retrive_user_group_info->groups;
                    $data['group_name_array']= array();
                    for($p=0; $p < count($ret_retrieve_group); $p++ ){
                        $group_name = $ret_retrieve_group[$p]->name;
                        array_push($data['group_name_array'],$group_name);
                    }
                    $data['page_title'] = 'Update Employee';
                    $this -> load -> view('common/employee/update_employee', $data);
                    break;
                case 'delete_emp':
                    $data['page_title'] = 'Add Employee';
                    $this -> load -> view('common/employee/add_employee', $data);
                    break;
            }
        }

        /**
         * INSERT INTO DATABASE AND GOOGLE       
         * 
         * @return void
         */
        function insert_employee(){ //Insert Employee in database and google

            $data['emp_id'] = $_POST['emp_id'];
            $data['first_name'] = $_POST['first_name'];
            $data['last_name'] = $_POST['last_name'];
            $data['school_or_ofc'] = $_POST['school_or_ofc'];
            $data['department'] = $_POST['department'];
            $data['user_role'] = $_POST['user_role'];
            $data['group_name'] = implode(",",$_POST['google_groups']); //group_name inserted only to database
            $data['group_name_array']= explode(",",$data['group_name']);
            $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
            $access_token = $this-> google_classroom ->get_access_token($client);

            $ret_user_role_selected = $this -> Employee_model -> get_employee_selected_role($data['user_role']);
            if ($ret_user_role_selected != "") {
                $data['role_name'] = $ret_user_role_selected->result_array()[0]['role_name'];
            }
            $data['mobile'] = $_POST['mobile'];
            
            if(isset($_POST['teacher']))
            {  
                $teacher = $_POST['teacher'];
            }else{
                $teacher = 0;
            }
            $data['teacher'] = $teacher;

            if(isset($_POST['ex_emp']))
            {  
                $ex_emp = $_POST['ex_emp'];
            }else{
                $ex_emp = 1;
            }
            $data['ex_emp'] = $ex_emp;

            //School/HO Fetch
            $school_data = $this -> School_model -> get_login_school_data();
            if ($school_data != NULL) {
                $school_n_ho_data = $school_data;
            } else {
                $school_n_ho_data = NULL;
            }

            // User Role array for Org Unit Path
            $school_role_array = array(3,4,5,6,10);
            $school_admin_array = array(11,96);
            $ho_admin_array = array(7,8,10,11,96,101);
            $ho_content_array = array(94,97);
            $ho_and_school_array = $school_n_ho_data->result_array();
            $ho_array = array('school_id' => 0,'school_name' =>'Head Office');
            array_push($ho_and_school_array, $ho_array);
            for ($i=0; $i < count($ho_and_school_array); $i++)
             { 
                if ($ho_and_school_array[$i]['school_id'] == $data['school_or_ofc']) 
                {
                    $data['school_or_ho'] = $ho_and_school_array[$i]['school_name'];
                    if ($data['user_role'] == 1 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Accounts";
                    }elseif ($data['user_role'] == 2 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Academics/Teachers";
                    }elseif ($data['user_role'] == 12 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Students";
                    }elseif ($data['user_role'] == 98 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Academics/Co-Ordinators";
                    }elseif (in_array($data['user_role'], $school_role_array) && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Administration and Legal";
                    }elseif (in_array($data['user_role'], $school_admin_array) && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = "Other";
                    }elseif (in_array($data['user_role'], $ho_admin_array) && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Admin";
                    }elseif ($data['user_role'] == 9 && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Accounts";
                    } elseif (in_array($data['user_role'], $ho_content_array) && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Content Team";
                    }elseif ($data['user_role'] == 95 && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Design Team";
                    }else{
                        echo "2";return;
                    }
                }
            }
            $ret_create_user = $this->google_login ->CreateUserInfo($access_token,$data);
            // Fetch Google Group_Name Data 
            $ret_retrive_all_group_info = $this->google_login ->RetriveAllGroupInfo($access_token);
            $ret_retrive_all_group_info = json_decode($ret_retrive_all_group_info);
            $group_info= $ret_retrive_all_group_info ->groups;
            for($j=0; $j< count($data['group_name_array']);$j++){
               for($i=0; $i< count($group_info); $i++){
                    $group_name = $group_info[$i]->name;
                    if($data['group_name_array'][$j] == $group_name){
                        $group_id = $group_info[$i]->id;
                        //Add User to google group
                        $ret_create_user_group = $this->google_login->CreateGroupMember($access_token,$group_id,$data['emp_id']);
                    }
                }
            }
            if ($ret_create_user == TRUE) 
            {
                $result = $this -> Employee_model -> add_employee($data);
                if ($data['user_role'] == 2) {
                    $post_data = array(
                            "emp_id" => $data['emp_id'],
                            "name" => $data['first_name'],
                            "first_name" => $data['first_name'],
                            "last_name" => $data['last_name'],
                            "email" => $data['emp_id'],
                            "description" => "Desciption test",
                            "nickname" => "nickname test",
                            "roles" => "teacher",
                            "password" => "12345",
                            'school_id' => $data['school_or_ofc'],
                            'operation' => 'add'
                        );
                    $url = APP_WEB_URL.'/indexCI.php/walmiki/add_update_teacher';
                    $curl_result = $this->add_update_teacher($url, $post_data);
                    return;                
                }
            }else{
                echo $ret_create_user;return;
            }
        }

       /**
        * UPDATE INTO DATABASE AND GOOGLE 
        * 
        */
        function update_employee(){ //Update Employee in database and google
            $data['emp_prime_id'] = $_POST['employee_prime_id'];
            $data['emp_id'] = $_POST['emp_id'];
            $data['first_name'] = $_POST['first_name'];
            $data['last_name'] = $_POST['last_name'];
            $data['school_or_ofc'] = $_POST['school_or_ofc'];
            $data['department'] = $_POST['department'];
            $data['user_role'] = $_POST['user_role'];
            $data['group_name'] = implode(",",$_POST['google_group']); // updated group_name only to Database
            $data['group_name_array']= explode(",",$data['group_name']);
            $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
            $access_token = $this-> google_classroom ->get_access_token($client);
            if (isset($_POST['employee'])) {
                $data['selected_employee'] = $_POST['employee'];
            } else {
                $data['selected_employee'] = '';
            }
            
            $ret_user_role_selected = $this -> Employee_model -> get_employee_selected_role($data['user_role']);
            if ($ret_user_role_selected != "") {
                $data['role_name'] = $ret_user_role_selected->result_array()[0]['role_name'];
            }
            $data['mobile'] = $_POST['mobile'];
            
            if(isset($_POST['teacher']))
            {  
                $teacher = $_POST['teacher'];
            }else{
                $teacher = 0;
            }
            $data['teacher'] = $teacher;

            if(isset($_POST['ex_emp']))
            {  
                $ex_emp = $_POST['ex_emp'];
            }else{
                $ex_emp = 1;
            }
            $data['ex_emp'] = $ex_emp;
            //School/Office Fetch
            $school_data = $this -> School_model -> get_login_school_data();
            if ($school_data != NULL) {
                $school_n_ho_data = $school_data;
            } else {
                $school_n_ho_data = NULL;
            }

            $school_role_array = array(3,4,5,6,10);
            $school_admin_array = array(11,96);
            $ho_admin_array = array(7,8,10,11,96,101);
            $ho_content_array = array(94,97);
            $ho_and_school_array = $school_n_ho_data->result_array();
            $ho_array = array('school_id' => 0,'school_name' =>'Head Office');
            array_push($ho_and_school_array, $ho_array);
            for ($i=0; $i < count($ho_and_school_array); $i++) { 
                if ($ho_and_school_array[$i]['school_id'] == $data['school_or_ofc']) {
                    $data['school_or_ho'] = $ho_and_school_array[$i]['school_name'];
                    if ($data['user_role'] == 1 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Accounts";
                    }elseif ($data['user_role'] == 2 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Academics/Teachers";
                    }elseif ($data['user_role'] == 12 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Students";
                    }elseif ($data['user_role'] == 98 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Academics/Co-Ordinators";
                    }elseif (in_array($data['user_role'], $school_role_array) && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Administration and Legal";
                    }elseif (in_array($data['user_role'], $school_admin_array) && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = "Other";
                    }elseif (in_array($data['user_role'], $ho_admin_array) && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Admin";
                    }elseif ($data['user_role'] == 9 && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Accounts";
                    }elseif (in_array($data['user_role'], $ho_content_array) && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Content Team";
                    }elseif ($data['user_role'] == 95 && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Design Team";
                    }else{
                        echo "Selecetd School/Head Office is not valid for Role";return;
                    }
                }
            }
            
            if($_POST['password'] != '' && $_POST['password'] != NULL){
                $data['password'] = $_POST['password'];
            }
            $ret_update_user = $this->google_login ->UpdateUserInfo($access_token,$data);
            if ($ret_update_user == TRUE) {
                $ret_staff_data = $this -> Employee_model -> get_group_name($data['emp_id']);
                if($ret_staff_data != NULL){
                    $data['old_group_name']= $ret_staff_data;
                }
                if($data['old_group_name'] !=  $data['group_name_array'])
                {
                    //fetch database data of staff info
                    $ret_staff_data = $this -> Employee_model -> get_group_name($data['emp_id']);

                    $ret_delete_google_group_names = array_diff($data['old_group_name'],$data['group_name_array']);
                    $ret_add_google_group = array_diff($data['group_name_array'],$ret_staff_data);

                    $ret_delete_google_group_array = explode(",",$ret_delete_google_group_names[0]['google_group']);
                    
                    // Fetch Google Group_Name Data 
                    $ret_retrive_all_group_info = $this->google_login ->RetriveAllGroupInfo($access_token);
                    $ret_retrive_all_group_info = json_decode($ret_retrive_all_group_info);
                    $group_info= $ret_retrive_all_group_info ->groups;
                    
                    // To delete group_member
                    if($ret_delete_google_group != NULL){
                        for($j=0; $j< count($ret_delete_google_group_array);$j++){
                            for($p=0; $p< count($group_info); $p++){
                              $group_name = $group_info[$p]->name;
                                if($ret_delete_google_group[$j]['google_group'] == $group_name){
                                    $group_id = $group_info[$p]->id;
                                    $ret_delete_user_group = $this->google_login->DeleteGroupName($access_token,$group_id,$data['emp_id']);
                                }
                            }    
                        }
                    }
                    //to add user in group
                    if($ret_add_google_group != NULL){
                        for($q=0; $q< count($ret_add_google_group);$q++){
                            for($i=0; $i< count($group_info); $i++){
                                $group_name = $group_info[$i]->name;
                                if($ret_add_google_group[$q] == $group_name){
                                    $group_id = $group_info[$i]->id;
                                    $ret_create_user_group = $this->google_login->CreateGroupMember($access_token,$group_id,$data['emp_id']);
                                }
                            }
                        }
                    }
                }

                $result = $this -> Employee_model -> update_employee($data);
                // CURL call for Update Employee 
                if ($data['user_role'] == 2) {
                    $curl_fields = array();

                    $url = APP_WEB_URL.'/indexCI.php/walmiki/add_update_teacher';

                    if ($ex_emp != 1) {
                        $post_data = array(
                            'emp_id' => $data['emp_id'],
                            'reassign' => $data['selected_employee'],
                            'school_id' => $data['school_or_ofc'],
                            'operation' => 'delete'
                        );
                    }else{
                        $post_data = array(
                            "emp_id" => $data['emp_id'],
                            "name" => $data['first_name'],
                            "first_name" => $data['first_name'],
                            "last_name" => $data['last_name'],
                            "email" => $data['emp_id'],
                            "url" => "url",
                            "description" => "Desciption test",
                            "locale" => "en_US",
                            "nickname" => "nickname test",
                            "slug" => "slug",
                            "roles" => $data['user_role'],
                            "password" => "12345",
                            "school_id" => $data['school_or_ofc'],
                            'operation' => 'update'
                        );
                    }
                    $result = $this->add_update_teacher($url, $post_data);
                    return;
                } 
            }else{
                echo $ret_update_user;return;
            }
        }

        function ajax_employee_list(){
            $data['employee_data'] = $this -> Employee_model -> get_all_employees();
            $this->load->view('common/employee/ajax_employee_list',$data);
        }

        //If token is expired redirect to login
        // function check_token_expiration(){
        //     if(time() > $_SESSION['access_token_expiry']) {
        //         $_SESSION['validation_error'] = 'Access Session Expire. Please login again.';
        //         redirect('login');
        //     }
        // }
        //NEW MODULE
        //Staff details report
        function staff_report()
        { 
            $data['page_data']['page_date'] = date("d M Y");
            $data['page_data']['page_title'] = 'Staff Report';
            $staff_array = array();  
            //Fech staff details
            $emp_info = $this-> Staff_report_model ->get_employee_report();
            for ($i=0; $i < count($emp_info) ; $i++) 
            { 
                $staff_array[$i][0] = $emp_info[$i];

                //Fetch school name
                $school_id   = $staff_array[$i][0]['school_id'];
                $school_name = $this -> School_model -> get_school_location($school_id);

                if ($school_name == '') 
                {
                    $staff_array[$i][0]['school_name'] = 'Head Office';
                }else{
                    $staff_array[$i][0]['school_name'] = $school_name;  
                }

                //Fetch subject details
                $subject_query = $this-> Staff_report_model ->get_subject($emp_info[$i]['id']);  
                $staff_array[$i][1] = $subject_query;
                  
                for ($j=0; $j < count($staff_array[$i][1]); $j++) 
                { 
                    //Subject Name
                    $subject_name = $this -> Staff_report_model ->get_subject_name($staff_array[$i][1][$j]['subject_id']); 
                    $staff_array[$i][1][$j]['sub_name'] = $subject_name;

                    //Fetch class from subject id
                    $class_query = $this-> Staff_report_model ->get_class_info($staff_array[$i][1][$j]['subject_id']);
                    $staff_array[$i][2][$j] = $class_query;
                   
                    for ($k=0; $k < count($staff_array[$i][2]); $k++)
                    { 
                        //class name
                        $class_id   = $staff_array[$i][2][$k][0]['class_id'];
                        $class_name = $this -> Staff_report_model -> get_class_name($class_id);
                        $staff_array[$i][2][$k][0]['class_name'] = $class_name;
                    }
                }
            }
            
            $temp_array = $staff_array;
            if($_SESSION['school_id'] != 0)
            {
                $temp_array = array();
                for ($x=0; $x < count($staff_array); $x++) 
                { 
                   if($staff_array[$x][0]['school_id'] == $_SESSION['school_id'])
                   {
                        array_push($temp_array,$staff_array[$x]);
                   }
                }
            }
            $data['page_data']['staff_array'] = $temp_array;
            $data['main_content'] = array('common/employee/view_staff_report');
            $this -> load -> view('bootstrap_templates/main_template', $data);
        }

        function inactive_employee()
        {
            $data['page_data']['page_date'] = date("d M Y");
            $data['page_data']['page_title'] = 'Inactive Employee Data';
            
            $inactive_staff_data = $this-> Employee_model-> get_inactivate_employee_details();
            $data['inactive_employee'] = $inactive_staff_data->result();
            
            $data['main_content'] = array('common/employee/view_inactive_employee');
            $this -> load -> view('bootstrap_templates/main_template', $data);
        }

        //for active employee
        function active_employee()
        {
            $data['emp_id']        = $this->input->post('emp_id');
            $data['ref_school_id'] = $this->input->post('ref_school_id');

            $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
            $access_token             = $this-> google_classroom ->get_access_token($client);
            $selected_user_info       = $this-> google_login ->RetriveUserInfo($access_token, $data['emp_id']);
            $selected_user_info_array = json_decode($selected_user_info);
            if ($selected_user_info_array->primaryEmail != '')
            {
                $active_data = $this-> Employee_model->update_inactive_employee($data['emp_id'],$data['ref_school_id']);
                if ($active_data) 
                {
                    $emp_result = $this-> Employee_model->update_walnut_user($data['emp_id'], 1);
                    $selected_inactive_emp_info = $this-> google_login ->ActiveEmployeeInfo($access_token, $data['emp_id']);
                    echo TRUE;return;
                }
            }else
            {
                echo "No data";return;
            }
        }
        // for fetch single employee user data 
        public function show_user()
        {
            $data['page_data']['page_date'] = date("d M Y");
            $data['flag_permission'] = 1;
            if(isset($_POST['sel_username']) &&  $_POST['sel_username'] != NULL){
                $data['userkey'] = $_POST['sel_username']; 
                $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
                $access_token = $this-> google_classroom ->get_access_token($client);
                $customer_id = 'my_customer';
                $retrive_all_user_info = NULL;

                //Getting orgnization(OrgUnitInfo) from google API
                $retrive_org_info = $this->google_login ->RetriveOrgUnitInfo($access_token,$customer_id);
                $orgunittypeinfo = json_decode($retrive_org_info);
                $organizationunits = $orgunittypeinfo->organizationUnits;
                $orgnizationname = array();
                foreach ($organizationunits as $key => $value) {
                    array_push($orgnizationname, $value->name);
                }
                //End of orgunitinfo//
                $user_all_info = array();
                $page_token = NULL;
                $all_user_info = array();
                do{
                    $ret_retrive_all_user_info = $this->google_login ->RetriveSingleUserInfo($access_token,$data['userkey'],$page_token);
                    $retrive_all_user_info = json_decode($ret_retrive_all_user_info);
                    array_push($all_user_info,$retrive_all_user_info);
                    $page_token = $retrive_all_user_info->nextPageToken;
                }while($page_token != NULL);

                $school_data = $this -> School_model -> get_login_school_data();
                if ($school_data != NULL) {
                    $data['school_n_ho_data'] = $school_data;
                } else {
                    $data['school_n_ho_data'] = NULL;
                }
                $ho_and_school_array = $data['school_n_ho_data']->result_array();
                $ho_array = array(
                                    'school_id' => 0,
                                    'school_name' =>'Head Office'
                                );
                array_push($ho_and_school_array, $ho_array);

                $school_d_headofc = array();
                for ($k=0; $k < count($ho_and_school_array); $k++) { 
                    array_push($school_d_headofc,$ho_and_school_array[$k]['school_name']);
                }

                $user_info = NULL;
                $staff_info = array();
                $ret_staff_role = "";
                $user_all_info = array();

                for($i=0; $i< count($all_user_info);$i++)
                {
                    $retrive_all_user_data = $all_user_info[$i];
                    foreach ($retrive_all_user_data as $key => $data_value)
                    {
                        foreach ($data_value as $user_key => $user_data_value)
                        {
                            if($user_data_value->externalIds[0]->value == '12345')
                            {
                                $unitpath = $user_data_value->orgUnitPath;
                                $roll_name = ' - ';
                                $staff_info = $this-> Employee_model -> get_extra_staff_info($user_data_value->primaryEmail); // Get status from MGR system
                                $ret_staff_role = $this-> Employee_model -> get_employee_selected_role($staff_info[0]['role']); // Get role name
                                
                                if ($ret_staff_role != "") 
                                {
                                    $roll_name = $ret_staff_role->result_array()[0]['role_name'];
                                }
                                if(($user_data_value->suspended == NULL)||($user_data_value->suspended == ""))
                                {
                                    $ret_retrive_user_group_info = $this->google_login ->RetriveUserGroupInfo($access_token, $user_data_value->primaryEmail);
                                    $ret_retrive_user_group_info = json_decode($ret_retrive_user_group_info);
                                    $ret_retrieve_group = $ret_retrive_user_group_info->groups;

                                    $group_name_array= array();
                                    for($p=0; $p < count($ret_retrieve_group); $p++ ){
                                        $group_name = $ret_retrieve_group[$p]->name;
                                        array_push($group_name_array,$group_name);
                                    }
                                    $ret_group_name = implode(",",$group_name_array);

                                    $user_info = array(
                                        'email_id'=>$user_data_value->primaryEmail,
                                        'first_name'=>$user_data_value->name->givenName,
                                        'last_name'=>$user_data_value->name->familyName,
                                        'full_name'=>$user_data_value->name->fullName,
                                        'orgunitpath'=>$user_data_value->orgUnitPath,
                                        'phones'=>isset($user_data_value->phones['0']->value)?$user_data_value->phones['0']->value:'',
                                        'status'=>isset($staff_info[0]['isactive'])?$staff_info[0]['isactive']:' - ',
                                        'role'=>$roll_name,
                                        'group_name'=> $ret_group_name
                                    );
                                    array_push($user_all_info, $user_info);
                                }
                            }
                        }
                    }
                }
                $users_of_org = array();
                for ($i=0; $i < count($user_all_info); $i++) { 
                    // $orgunit_exploed = explode('/', $user_all_info[$i]['orgunitpath']);
                    // if (in_array($orgunit_exploed[1],$school_d_headofc)) {
                        array_push($users_of_org, $user_all_info[$i]); 
                    // }
                }
                $data['school_d_headofc'] = $school_d_headofc;
                $data['users_of_org'] = $users_of_org;

            }
            $data['main_content'] = array('common/employee/view_employee_list');
            $data['page_data']['page_title'] = 'Employee Information';
            $this -> load -> view('bootstrap_templates/main_template', $data);
        }
        
        //active to inactive employee
        function google_inactive_employee()
        {
            $uploaddir  = $_SESSION['url'] . '/application/uploads/csv/';
            $file_name  = basename($_FILES["classroom_csv"]["name"]);
            $uploadfile = $uploaddir.$file_name;
            $ext_header = pathinfo($file_name, PATHINFO_EXTENSION);
            ini_set("max_execution_time", "10000");

            if ($ext_header != "csv") {
                $_SESSION['msg'] = 'Error! Only CSV files can be uploaded.';
                redirect("employee");
            }else{
                if (move_uploaded_file($_FILES['classroom_csv']['tmp_name'], $uploadfile)) {
                  
                    $csvfile = $uploadfile;
                    $file    = fopen($csvfile, "r") or die("Problem in opening file");
                    $size    = filesize($csvfile);
                    if (!$size) {
                        $_SESSION['msg'] = 'File is empty! Please check.';
                        redirect("employee");
                    }
                    $csvcontent = fread($file, $size);
                    fclose($file);

                    $fieldseparator = ",";
                    $lineseparator  = "\n";
                    $lines          = 0;
                    $formdata       = array();
                    $row            = 0;
                    $csv_column_array = array();
                    $csv_data_array = array();
                    foreach (explode($lineseparator, $csvcontent) as $line) {
                        $lines++;
                        $line = trim($line, " \t");
                        $line = str_replace("\r", "", $line);
                        $formdata = str_getcsv($line, $fieldseparator, "\"");

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
                        if (count($formdata) >= 1) {
                            
                            for ($i = 0; $i < count($formdata); $i++ ) { 
                                $csv_data_array[$i][$m] = $formdata[$i];
                                
                            }
                        }
                        $m++;
                        $row++; 
                    }
                    for ($i = 0 ; $i < count($csv_data_array[0]) ;$i++)
                    {
                        $data['employee_mail'] = $csv_data_array[0][$i];
                        $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
                        $access_token = $this-> google_classroom ->get_access_token($client);
                        $selected_inactive_user_info = $this-> google_login ->InActiveEmployee($access_token,$data['employee_mail']);
                        
                        if($selected_inactive_user_info)
                        {
                            $result= $this-> Employee_model->update_active_employee($data['employee_mail']);

                            $emp_result= $this-> Employee_model->update_walnut_user($data['employee_mail'],0);
                            // if($result)
                            // {
                            //     echo "updated sucessfully";return;
                            // }
                        }  
                    }

                    echo "sucess";return;
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
The `Walmiki_interface_controller` is a system controller that handles the interface between the Walmiki system and other components. It provides functions for managing user interfaces, handling user input, and interacting with the Walmiki system.

### Refactoring
1. Extract common functionality into helper functions.
2. Improve error handling and logging.
3. Use dependency injection to improve testability.
4. Remove unused code and dependencies.

{{< details "source code " >}}
```php
require_once(APPPATH.'controllers/system/Walmiki_interface_controller.php');
```
{{< /details >}}

## __construct
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This is the constructor function for a class. It initializes the parent class, starts a session, sets the default timezone, loads a Google login library, and loads several models and libraries. It also checks the expiration of a Google login token and loads a Google Classroom library.

{{< details "source code " >}}
```php
public function __construct()
        {
            parent::__construct();
            @session_start();
            date_default_timezone_set('Asia/Kolkata');
            $this -> load ->library('Google_login');
            $this->load->model('common/School_model');
            $this->load->model('common/Employee_model');
            $this->load->model('system/Walmiki_interface_model');
            $this ->load-> model('common/Staff_report_model');
            $this->google_login->check_token_expiration();
            $this->load->library('Google_classroom');
        }
```
{{< /details >}}

## index
{{< complexityLabel "Moderate" >}}{{< /complexityLabel >}}
### Overview
This function is the default load for the employee view list. It retrieves information about the organization, retrieves all user information, retrieves staff information, and generates a list of users for display.

### User Acceptance Criteria
```gherkin
Feature: Employee View List
Scenario: Default Load
Given The user is logged in
When The employee view list is loaded
Then The organization information is retrieved
And All user information is retrieved
And Staff information is retrieved
And The list of users is generated
```

### Refactoring
1. Extract the code for retrieving organization information into a separate function.
2. Extract the code for retrieving all user information into a separate function.
3. Extract the code for retrieving staff information into a separate function.
4. Extract the code for generating the list of users into a separate function.
5. Use dependency injection to inject the necessary dependencies instead of directly accessing them.
6. Use a more descriptive variable name instead of $retrive_all_user_info.

{{< details "source code " >}}
```php
function index(){ //default load for employee view list
            $data['page_data']['page_date'] = date("d M Y");
            $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
            $access_token = $this-> google_classroom ->get_access_token($client);
            $customer_id = 'my_customer';
            $retrive_all_user_info = NULL;

            //Getting orgnization(OrgUnitInfo) from google API
            $retrive_org_info = $this->google_login ->RetriveOrgUnitInfo($access_token,$customer_id);
            $orgunittypeinfo = json_decode($retrive_org_info);
            $organizationunits = $orgunittypeinfo->organizationUnits;
            $orgnizationname = array();
            foreach ($organizationunits as $key => $value) {
                array_push($orgnizationname, $value->name);
            }
            //End of orgunitinfo//
            $data['flag_permission'] = 1;
            $user_all_info = array();
            $page_token = NULL;
            $all_user_info = array();
            do{
                $ret_retrive_all_user_info = $this->google_login ->RetriveAllUserInfo($access_token,$page_token);
                $retrive_all_user_info = json_decode($ret_retrive_all_user_info);
                if (!$ret_retrive_all_user_info) {
                    $data['flag_permission'] = 0;
                }
                array_push($all_user_info,$retrive_all_user_info);
                $page_token = $retrive_all_user_info->nextPageToken;
            }while($page_token != NULL);

            $school_data = $this -> School_model -> get_login_school_data();
            if ($school_data != NULL) {
                $data['school_n_ho_data'] = $school_data;
            } else {
                $data['school_n_ho_data'] = NULL;
            }
            $ho_and_school_array = $data['school_n_ho_data']->result_array();
            $ho_array = array(
                                'school_id' => 0,
                                'school_name' =>'Head Office'
                            );
            array_push($ho_and_school_array, $ho_array);

            $school_d_headofc = array();
            for ($k=0; $k < count($ho_and_school_array); $k++) { 
                array_push($school_d_headofc, $ho_and_school_array[$k]['school_name']);
            }
            
            $user_info = NULL;
            $staff_info = array();
            $ret_staff_role = "";

            for($i=0; $i< count($all_user_info);$i++)
            {
                $retrive_all_user_data = $all_user_info[$i];
                foreach ($retrive_all_user_data -> users as $key => $data_value)
                {
                    $unitpath = $data_value->orgUnitPath;
                    $roll_name = ' - ';
                    $staff_info = $this-> Employee_model -> get_extra_staff_info($data_value->primaryEmail); // Get status from MGR system
                    $ret_staff_role = $this-> Employee_model -> get_employee_selected_role($staff_info[0]['role']); // Get role name
                    if ($ret_staff_role != "") 
                    {
                        $roll_name = $ret_staff_role->result_array()[0]['role_name'];
                    }
                    if(($data_value->suspended == NULL)||($data_value->suspended == ""))
                    {
                        $ret_retrive_user_group_info = $this->google_login ->RetriveUserGroupInfo($access_token, $data_value->primaryEmail);
                        $ret_retrive_user_group_info = json_decode($ret_retrive_user_group_info);
                        $ret_retrieve_group = $ret_retrive_user_group_info->groups;
                        $group_name_array= array();
                        for($p=0; $p < count($ret_retrieve_group); $p++ ){
                            $group_name = $ret_retrieve_group[$p]->name;
                            array_push($group_name_array,$group_name);
                        }
                        $ret_group_name = implode(",",$group_name_array);
                        $user_info = array(
                                        'email_id'=>$data_value->primaryEmail,
                                        'first_name'=>$data_value->name->givenName,
                                        'last_name'=>$data_value->name->familyName,
                                        'full_name'=>$data_value->name->fullName,
                                        'orgunitpath'=>$data_value->orgUnitPath,
                                        'phones'=>isset($data_value->phones['0']->value)?$data_value->phones['0']->value:'',
                                        'status'=>isset($staff_info[0]['isactive'])?$staff_info[0]['isactive']:' - ',
                                        'role'=>$roll_name,
                                        'group_name'=> $ret_group_name
                                    );
                        array_push($user_all_info, $user_info);  
                    }
                }
            }
            $users_of_org = array();
            for ($i=0; $i < count($user_all_info); $i++) { 
                // $orgunit_exploed = explode('/', $user_all_info[$i]['orgunitpath']);
                // if (in_array($orgunit_exploed[1],$school_d_headofc)) {
                    array_push($users_of_org, $user_all_info[$i]); 
                // }
            }
            $data['school_d_headofc'] = $school_d_headofc;
            $data['users_of_org'] = $users_of_org;
            $data['main_content'] = array('common/employee/view_employee_list');
            $data['page_data']['page_title'] = 'Employee Information';
            $this -> load -> view('bootstrap_templates/main_template', $data);
        }
```
{{< /details >}}

## check_username_exist
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to check if a username exists in the walnutedu domain. It takes the email ID as input and checks if the user exists in the walnutedu domain by querying the database and using the Google Classroom and Google Login APIs.

### User Acceptance Criteria
```gherkin
Feature: Check Username Exist
Scenario: User exists in walnutedu domain
Given The email ID is 'test@walnutedu.in'
When I call the 'check_username_exist' function
Then The function should return TRUE

Scenario: User does not exist in walnutedu domain
Given The email ID is 'test@domain.com'
When I call the 'check_username_exist' function
Then The function should return FALSE
```

### Refactoring
1. Extract the code for checking if a user exists in the walnutedu domain into a separate function.
2. Use dependency injection to pass the necessary dependencies to the function instead of accessing them directly.
3. Add error handling and logging to handle any exceptions that may occur during the API calls.

{{< details "source code " >}}
```php
function check_username_exist(){ //check user exist in walnutedu domain or not
            $email_id = $_POST['email_id'];
            // $check_system_entry = $this -> Employee_model -> check_user_exist($email_id); //check in query database

            $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
            $access_token = $this-> google_classroom ->get_access_token($client);
            $selected_user_info = $this-> google_login ->RetriveUserInfo($access_token,$email_id); //check email present at @walnutedu.in domain
            $selected_user_info_array = json_decode($selected_user_info);
            if ($selected_user_info_array->primaryEmail != '') {
                echo TRUE;return;
            }else{
                echo FALSE;return;
            }
        }
```
{{< /details >}}

## crud
{{< complexityLabel "Moderate" >}}{{< /complexityLabel >}}
### Overview
This function is responsible for handling the CRUD operations for employees. It retrieves data from the Google Classroom API, the School_model, and the Employee_model. It also fetches data from the Google group and Walnut Role Master. Based on the operation specified in the `$_POST['emp_operation']` variable, it either adds a new employee, updates an existing employee, or deletes an employee. The function then loads the appropriate view based on the operation.

### User Acceptance Criteria
```gherkin
Feature: CRUD Operations for Employees

Scenario: Add Employee
Given The user wants to add a new employee
When The user selects the 'create_emp' operation
Then The 'Add Employee' view is loaded

Scenario: Update Employee
Given The user wants to update an existing employee
When The user selects the 'update_emp' operation
Then The 'Update Employee' view is loaded

Scenario: Delete Employee
Given The user wants to delete an employee
When The user selects the 'delete_emp' operation
Then The 'Add Employee' view is loaded
```

### Refactoring
1. Extract the code for retrieving school and head office info into a separate function.
2. Extract the code for retrieving department data into a separate function.
3. Extract the code for fetching Google group data into a separate function.
4. Extract the code for retrieving Walnut Role Master data into a separate function.
5. Refactor the switch statement to use a more readable and maintainable approach, such as using a map of operations to functions.
6. Consider using dependency injection to decouple the function from the Google Classroom API, School_model, and Employee_model.

{{< details "source code " >}}
```php
function crud(){//open model for create and edit

            $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
            $access_token = $this-> google_classroom ->get_access_token($client);
            //School and Head Office Info
            $school_data = $this -> School_model -> get_login_school_data();
            if ($school_data != NULL) {
                $data['school_n_ho_data'] = $school_data;
            } else {
                $data['school_n_ho_data'] = NULL;
            }
            $ho_and_school_array = $data['school_n_ho_data']->result_array();
            $ho_array = array('school_id' => 0,'school_name' =>'Head Office');
            array_push($ho_and_school_array, $ho_array);
            $data['school_d_headofc'] = $ho_and_school_array;
            //School and Head Office Info END

            //Department Master
            $dept_data = $this -> Employee_model -> get_employee_department();
            if ($dept_data != NULL) {
                $data['department_data'] = $dept_data;
            } else {
                $data['department_data'] = NULL;
            }
            //Department Master END

            //Fetch Google group Data
            $ret_retrive_all_group_info = $this->google_login ->RetriveAllGroupInfo($access_token);
            $ret_retrive_all_group_info = json_decode($ret_retrive_all_group_info);
            $group_info= $ret_retrive_all_group_info ->groups;
            $group_name_array = array();
            for($j=0; $j< count($group_info); $j++){
                $data['group_name']= $group_info[$j]->name;
                array_push($group_name_array,$data['group_name']);
                $data['group_name']= $group_name_array;
            }
            // Google Group Data End

            //Walnut Role Master
            $ret_user_role = $this -> Employee_model -> get_employee_role();
            if ($ret_user_role != NULL) {
                $data['user_role'] = $ret_user_role;
            } else {
                $data['user_role'] = NULL;
            }
            //Walnut Role Master END
            
            $create_or_update = $_POST['emp_operation'];
            switch ($create_or_update) {
                case 'create_emp':
                    $data['page_title'] = 'Add Employee';
                    $this -> load -> view('common/employee/add_employee', $data);
                    break;
                case 'update_emp':
                    $email_id = $_POST['emp_id'];
                    //Getting from Google API
                    $selected_user_info = $this->google_login ->RetriveUserInfo($access_token,$email_id);
                    $selected_user_info_array = json_decode($selected_user_info);
                    $data['selected_user_info_array'] = $selected_user_info_array;//must remove
                    $data['user_email'] = $selected_user_info_array->primaryEmail;

                    $data['first_name'] = $selected_user_info_array->name->givenName;
                    $data['last_name'] = $selected_user_info_array->name->familyName;
                    
                    $data['mobile'] = isset($selected_user_info_array->phones[0]->value)?$selected_user_info_array->phones[0]->value:'';
                    $data['orgunitpath'] = $selected_user_info_array->orgUnitPath;
                    //Getting from database

                    $ret_user_info = $this -> Employee_model -> get_employee_details($email_id);
                    if ($ret_user_info != NULL) {
                        $data['user_info'] = $ret_user_info->result_array();
                    } else {
                        echo '';return;
                    }
                    
                    $data['google_user_data']= $data['user_info'][0]['google_group'];
                    $data['group_array_update']= explode(",",$data['google_user_data']);
                    $ret_retrive_user_group_info = $this->google_login ->RetriveUserGroupInfo($access_token, $data['user_email']);
                    $ret_retrive_user_group_info = json_decode($ret_retrive_user_group_info);
                    $ret_retrieve_group = $ret_retrive_user_group_info->groups;
                    $data['group_name_array']= array();
                    for($p=0; $p < count($ret_retrieve_group); $p++ ){
                        $group_name = $ret_retrieve_group[$p]->name;
                        array_push($data['group_name_array'],$group_name);
                    }
                    $data['page_title'] = 'Update Employee';
                    $this -> load -> view('common/employee/update_employee', $data);
                    break;
                case 'delete_emp':
                    $data['page_title'] = 'Add Employee';
                    $this -> load -> view('common/employee/add_employee', $data);
                    break;
            }
        }
```
{{< /details >}}

## insert_employee
{{< complexityLabel "Moderate" >}}{{< /complexityLabel >}}
### Overview
This function is used to insert an employee into the database and Google. It takes the employee details from the POST request and performs the following steps:

1. Retrieves the employee details from the POST request.
2. Retrieves the user role selected by the employee.
3. Retrieves the school data.
4. Determines the organization unit path based on the user role and school data.
5. Creates a user in Google using the retrieved access token and employee data.
6. Retrieves all the Google group names.
7. Adds the user to the Google groups based on the selected group names.
8. Adds the employee to the database.
9. If the user role is 2 (teacher), sends a request to another API to add or update the teacher.

If any error occurs during the process, it returns the error message.

### User Acceptance Criteria
```gherkin
Feature: Insert Employee

Scenario: Insert employee into the database and Google
Given The employee details are provided
When The insert_employee function is called
Then The employee is inserted into the database and Google
```

### Refactoring
1. Extract the retrieval of employee details from the POST request into a separate function.
2. Extract the retrieval of user role selected by the employee into a separate function.
3. Extract the retrieval of school data into a separate function.
4. Extract the determination of organization unit path into a separate function.
5. Extract the creation of a user in Google into a separate function.
6. Extract the retrieval of Google group names into a separate function.
7. Extract the addition of the user to Google groups into a separate function.
8. Extract the addition of the employee to the database into a separate function.
9. Extract the request to add or update the teacher into a separate function.

{{< details "source code " >}}
```php
function insert_employee(){ //Insert Employee in database and google

            $data['emp_id'] = $_POST['emp_id'];
            $data['first_name'] = $_POST['first_name'];
            $data['last_name'] = $_POST['last_name'];
            $data['school_or_ofc'] = $_POST['school_or_ofc'];
            $data['department'] = $_POST['department'];
            $data['user_role'] = $_POST['user_role'];
            $data['group_name'] = implode(",",$_POST['google_groups']); //group_name inserted only to database
            $data['group_name_array']= explode(",",$data['group_name']);
            $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
            $access_token = $this-> google_classroom ->get_access_token($client);

            $ret_user_role_selected = $this -> Employee_model -> get_employee_selected_role($data['user_role']);
            if ($ret_user_role_selected != "") {
                $data['role_name'] = $ret_user_role_selected->result_array()[0]['role_name'];
            }
            $data['mobile'] = $_POST['mobile'];
            
            if(isset($_POST['teacher']))
            {  
                $teacher = $_POST['teacher'];
            }else{
                $teacher = 0;
            }
            $data['teacher'] = $teacher;

            if(isset($_POST['ex_emp']))
            {  
                $ex_emp = $_POST['ex_emp'];
            }else{
                $ex_emp = 1;
            }
            $data['ex_emp'] = $ex_emp;

            //School/HO Fetch
            $school_data = $this -> School_model -> get_login_school_data();
            if ($school_data != NULL) {
                $school_n_ho_data = $school_data;
            } else {
                $school_n_ho_data = NULL;
            }

            // User Role array for Org Unit Path
            $school_role_array = array(3,4,5,6,10);
            $school_admin_array = array(11,96);
            $ho_admin_array = array(7,8,10,11,96,101);
            $ho_content_array = array(94,97);
            $ho_and_school_array = $school_n_ho_data->result_array();
            $ho_array = array('school_id' => 0,'school_name' =>'Head Office');
            array_push($ho_and_school_array, $ho_array);
            for ($i=0; $i < count($ho_and_school_array); $i++)
             { 
                if ($ho_and_school_array[$i]['school_id'] == $data['school_or_ofc']) 
                {
                    $data['school_or_ho'] = $ho_and_school_array[$i]['school_name'];
                    if ($data['user_role'] == 1 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Accounts";
                    }elseif ($data['user_role'] == 2 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Academics/Teachers";
                    }elseif ($data['user_role'] == 12 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Students";
                    }elseif ($data['user_role'] == 98 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Academics/Co-Ordinators";
                    }elseif (in_array($data['user_role'], $school_role_array) && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Administration and Legal";
                    }elseif (in_array($data['user_role'], $school_admin_array) && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = "Other";
                    }elseif (in_array($data['user_role'], $ho_admin_array) && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Admin";
                    }elseif ($data['user_role'] == 9 && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Accounts";
                    } elseif (in_array($data['user_role'], $ho_content_array) && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Content Team";
                    }elseif ($data['user_role'] == 95 && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Design Team";
                    }else{
                        echo "2";return;
                    }
                }
            }
            $ret_create_user = $this->google_login ->CreateUserInfo($access_token,$data);
            // Fetch Google Group_Name Data 
            $ret_retrive_all_group_info = $this->google_login ->RetriveAllGroupInfo($access_token);
            $ret_retrive_all_group_info = json_decode($ret_retrive_all_group_info);
            $group_info= $ret_retrive_all_group_info ->groups;
            for($j=0; $j< count($data['group_name_array']);$j++){
               for($i=0; $i< count($group_info); $i++){
                    $group_name = $group_info[$i]->name;
                    if($data['group_name_array'][$j] == $group_name){
                        $group_id = $group_info[$i]->id;
                        //Add User to google group
                        $ret_create_user_group = $this->google_login->CreateGroupMember($access_token,$group_id,$data['emp_id']);
                    }
                }
            }
            if ($ret_create_user == TRUE) 
            {
                $result = $this -> Employee_model -> add_employee($data);
                if ($data['user_role'] == 2) {
                    $post_data = array(
                            "emp_id" => $data['emp_id'],
                            "name" => $data['first_name'],
                            "first_name" => $data['first_name'],
                            "last_name" => $data['last_name'],
                            "email" => $data['emp_id'],
                            "description" => "Desciption test",
                            "nickname" => "nickname test",
                            "roles" => "teacher",
                            "password" => "12345",
                            'school_id' => $data['school_or_ofc'],
                            'operation' => 'add'
                        );
                    $url = APP_WEB_URL.'/indexCI.php/walmiki/add_update_teacher';
                    $curl_result = $this->add_update_teacher($url, $post_data);
                    return;                
                }
            }else{
                echo $ret_create_user;return;
            }
        }
```
{{< /details >}}

## update_employee
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
This function is used to update an employee in the database and Google. It retrieves the employee data from the form inputs and performs the necessary updates in the database and Google. It also handles updating the employee's group membership in Google.

### User Acceptance Criteria
```gherkin
Feature: Update Employee
Scenario: Update employee details
Given The employee details are entered in the form
When The update_employee function is called
Then The employee details are updated in the database and Google
```

### Refactoring
1. Extract the code for retrieving the employee data from the form inputs into a separate function.
2. Move the code for updating the employee's group membership in Google into a separate function.
3. Use a more descriptive variable name instead of $data for the employee data.
4. Use a switch statement instead of multiple if-else statements for setting the org_unit_path based on the user_role.
5. Use a constant or configuration file for the Google service account credentials instead of hardcoding them.
6. Use prepared statements or parameterized queries to prevent SQL injection.

{{< details "source code " >}}
```php
function update_employee(){ //Update Employee in database and google
            $data['emp_prime_id'] = $_POST['employee_prime_id'];
            $data['emp_id'] = $_POST['emp_id'];
            $data['first_name'] = $_POST['first_name'];
            $data['last_name'] = $_POST['last_name'];
            $data['school_or_ofc'] = $_POST['school_or_ofc'];
            $data['department'] = $_POST['department'];
            $data['user_role'] = $_POST['user_role'];
            $data['group_name'] = implode(",",$_POST['google_group']); // updated group_name only to Database
            $data['group_name_array']= explode(",",$data['group_name']);
            $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
            $access_token = $this-> google_classroom ->get_access_token($client);
            if (isset($_POST['employee'])) {
                $data['selected_employee'] = $_POST['employee'];
            } else {
                $data['selected_employee'] = '';
            }
            
            $ret_user_role_selected = $this -> Employee_model -> get_employee_selected_role($data['user_role']);
            if ($ret_user_role_selected != "") {
                $data['role_name'] = $ret_user_role_selected->result_array()[0]['role_name'];
            }
            $data['mobile'] = $_POST['mobile'];
            
            if(isset($_POST['teacher']))
            {  
                $teacher = $_POST['teacher'];
            }else{
                $teacher = 0;
            }
            $data['teacher'] = $teacher;

            if(isset($_POST['ex_emp']))
            {  
                $ex_emp = $_POST['ex_emp'];
            }else{
                $ex_emp = 1;
            }
            $data['ex_emp'] = $ex_emp;
            //School/Office Fetch
            $school_data = $this -> School_model -> get_login_school_data();
            if ($school_data != NULL) {
                $school_n_ho_data = $school_data;
            } else {
                $school_n_ho_data = NULL;
            }

            $school_role_array = array(3,4,5,6,10);
            $school_admin_array = array(11,96);
            $ho_admin_array = array(7,8,10,11,96,101);
            $ho_content_array = array(94,97);
            $ho_and_school_array = $school_n_ho_data->result_array();
            $ho_array = array('school_id' => 0,'school_name' =>'Head Office');
            array_push($ho_and_school_array, $ho_array);
            for ($i=0; $i < count($ho_and_school_array); $i++) { 
                if ($ho_and_school_array[$i]['school_id'] == $data['school_or_ofc']) {
                    $data['school_or_ho'] = $ho_and_school_array[$i]['school_name'];
                    if ($data['user_role'] == 1 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Accounts";
                    }elseif ($data['user_role'] == 2 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Academics/Teachers";
                    }elseif ($data['user_role'] == 12 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Students";
                    }elseif ($data['user_role'] == 98 && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Academics/Co-Ordinators";
                    }elseif (in_array($data['user_role'], $school_role_array) && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Administration and Legal";
                    }elseif (in_array($data['user_role'], $school_admin_array) && $ho_and_school_array[$i]['school_id'] != 0)
                    {
                        $data['org_unit_path'] = "Other";
                    }elseif (in_array($data['user_role'], $ho_admin_array) && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Admin";
                    }elseif ($data['user_role'] == 9 && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Accounts";
                    }elseif (in_array($data['user_role'], $ho_content_array) && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Content Team";
                    }elseif ($data['user_role'] == 95 && $ho_and_school_array[$i]['school_id'] == 0)
                    {
                        $data['org_unit_path'] = $data['school_or_ho']."/Design Team";
                    }else{
                        echo "Selecetd School/Head Office is not valid for Role";return;
                    }
                }
            }
            
            if($_POST['password'] != '' && $_POST['password'] != NULL){
                $data['password'] = $_POST['password'];
            }
            $ret_update_user = $this->google_login ->UpdateUserInfo($access_token,$data);
            if ($ret_update_user == TRUE) {
                $ret_staff_data = $this -> Employee_model -> get_group_name($data['emp_id']);
                if($ret_staff_data != NULL){
                    $data['old_group_name']= $ret_staff_data;
                }
                if($data['old_group_name'] !=  $data['group_name_array'])
                {
                    //fetch database data of staff info
                    $ret_staff_data = $this -> Employee_model -> get_group_name($data['emp_id']);

                    $ret_delete_google_group_names = array_diff($data['old_group_name'],$data['group_name_array']);
                    $ret_add_google_group = array_diff($data['group_name_array'],$ret_staff_data);

                    $ret_delete_google_group_array = explode(",",$ret_delete_google_group_names[0]['google_group']);
                    
                    // Fetch Google Group_Name Data 
                    $ret_retrive_all_group_info = $this->google_login ->RetriveAllGroupInfo($access_token);
                    $ret_retrive_all_group_info = json_decode($ret_retrive_all_group_info);
                    $group_info= $ret_retrive_all_group_info ->groups;
                    
                    // To delete group_member
                    if($ret_delete_google_group != NULL){
                        for($j=0; $j< count($ret_delete_google_group_array);$j++){
                            for($p=0; $p< count($group_info); $p++){
                              $group_name = $group_info[$p]->name;
                                if($ret_delete_google_group[$j]['google_group'] == $group_name){
                                    $group_id = $group_info[$p]->id;
                                    $ret_delete_user_group = $this->google_login->DeleteGroupName($access_token,$group_id,$data['emp_id']);
                                }
                            }    
                        }
                    }
                    //to add user in group
                    if($ret_add_google_group != NULL){
                        for($q=0; $q< count($ret_add_google_group);$q++){
                            for($i=0; $i< count($group_info); $i++){
                                $group_name = $group_info[$i]->name;
                                if($ret_add_google_group[$q] == $group_name){
                                    $group_id = $group_info[$i]->id;
                                    $ret_create_user_group = $this->google_login->CreateGroupMember($access_token,$group_id,$data['emp_id']);
                                }
                            }
                        }
                    }
                }

                $result = $this -> Employee_model -> update_employee($data);
                // CURL call for Update Employee 
                if ($data['user_role'] == 2) {
                    $curl_fields = array();

                    $url = APP_WEB_URL.'/indexCI.php/walmiki/add_update_teacher';

                    if ($ex_emp != 1) {
                        $post_data = array(
                            'emp_id' => $data['emp_id'],
                            'reassign' => $data['selected_employee'],
                            'school_id' => $data['school_or_ofc'],
                            'operation' => 'delete'
                        );
                    }else{
                        $post_data = array(
                            "emp_id" => $data['emp_id'],
                            "name" => $data['first_name'],
                            "first_name" => $data['first_name'],
                            "last_name" => $data['last_name'],
                            "email" => $data['emp_id'],
                            "url" => "url",
                            "description" => "Desciption test",
                            "locale" => "en_US",
                            "nickname" => "nickname test",
                            "slug" => "slug",
                            "roles" => $data['user_role'],
                            "password" => "12345",
                            "school_id" => $data['school_or_ofc'],
                            'operation' => 'update'
                        );
                    }
                    $result = $this->add_update_teacher($url, $post_data);
                    return;
                } 
            }else{
                echo $ret_update_user;return;
            }
        }
```
{{< /details >}}

## ajax_employee_list
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is responsible for retrieving all employee data from the database and displaying it in a view. It first calls the `get_all_employees` method of the `Employee_model` class to fetch the employee data. Then, it passes the retrieved data to the `ajax_employee_list` view for rendering.

### Refactoring
1. Move the database query logic to a separate method in the `Employee_model` class for better separation of concerns.
2. Use dependency injection to inject the `Employee_model` instance into the function instead of directly accessing it.
3. Use a template engine to render the view instead of directly loading it.

{{< details "source code " >}}
```php
function ajax_employee_list(){
            $data['employee_data'] = $this -> Employee_model -> get_all_employees();
            $this->load->view('common/employee/ajax_employee_list',$data);
        }
```
{{< /details >}}

## staff_report
{{< complexityLabel "Moderate" >}}{{< /complexityLabel >}}
### Overview
The `staff_report` function generates a staff report. It retrieves staff details from the `Staff_report_model` and school details from the `School_model`. It also fetches subject details and class information from the `Staff_report_model`. The function then organizes the retrieved data into an array and passes it to the view for display.

### User Acceptance Criteria
```gherkin
Feature: Staff Report
Scenario: Generate Staff Report
Given The staff report function is called
When The function retrieves staff details
And The function retrieves school details
And The function retrieves subject details
And The function retrieves class information
Then The function organizes the data into an array
And The array is passed to the view for display
```

### Refactoring
1. Extract the retrieval of staff details, school details, subject details, and class information into separate functions for better modularity.
2. Use dependency injection to inject the `Staff_report_model` and `School_model` into the function instead of directly accessing them.
3. Use a more descriptive variable name instead of `$data` to improve code readability.

{{< details "source code " >}}
```php
function staff_report()
        { 
            $data['page_data']['page_date'] = date("d M Y");
            $data['page_data']['page_title'] = 'Staff Report';
            $staff_array = array();  
            //Fech staff details
            $emp_info = $this-> Staff_report_model ->get_employee_report();
            for ($i=0; $i < count($emp_info) ; $i++) 
            { 
                $staff_array[$i][0] = $emp_info[$i];

                //Fetch school name
                $school_id   = $staff_array[$i][0]['school_id'];
                $school_name = $this -> School_model -> get_school_location($school_id);

                if ($school_name == '') 
                {
                    $staff_array[$i][0]['school_name'] = 'Head Office';
                }else{
                    $staff_array[$i][0]['school_name'] = $school_name;  
                }

                //Fetch subject details
                $subject_query = $this-> Staff_report_model ->get_subject($emp_info[$i]['id']);  
                $staff_array[$i][1] = $subject_query;
                  
                for ($j=0; $j < count($staff_array[$i][1]); $j++) 
                { 
                    //Subject Name
                    $subject_name = $this -> Staff_report_model ->get_subject_name($staff_array[$i][1][$j]['subject_id']); 
                    $staff_array[$i][1][$j]['sub_name'] = $subject_name;

                    //Fetch class from subject id
                    $class_query = $this-> Staff_report_model ->get_class_info($staff_array[$i][1][$j]['subject_id']);
                    $staff_array[$i][2][$j] = $class_query;
                   
                    for ($k=0; $k < count($staff_array[$i][2]); $k++)
                    { 
                        //class name
                        $class_id   = $staff_array[$i][2][$k][0]['class_id'];
                        $class_name = $this -> Staff_report_model -> get_class_name($class_id);
                        $staff_array[$i][2][$k][0]['class_name'] = $class_name;
                    }
                }
            }
            
            $temp_array = $staff_array;
            if($_SESSION['school_id'] != 0)
            {
                $temp_array = array();
                for ($x=0; $x < count($staff_array); $x++) 
                { 
                   if($staff_array[$x][0]['school_id'] == $_SESSION['school_id'])
                   {
                        array_push($temp_array,$staff_array[$x]);
                   }
                }
            }
            $data['page_data']['staff_array'] = $temp_array;
            $data['main_content'] = array('common/employee/view_staff_report');
            $this -> load -> view('bootstrap_templates/main_template', $data);
        }
```
{{< /details >}}

## inactive_employee
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to display the details of inactive employees. It sets the page data for the date and title, retrieves the inactive employee details from the Employee_model, and loads the view to display the data.

### Refactoring
1. Move the logic for setting the page data to a separate function.
2. Use dependency injection to inject the Employee_model instead of directly accessing it.
3. Separate the view loading logic into a separate function.
4. Consider using a template engine for loading views.

{{< details "source code " >}}
```php
function inactive_employee()
        {
            $data['page_data']['page_date'] = date("d M Y");
            $data['page_data']['page_title'] = 'Inactive Employee Data';
            
            $inactive_staff_data = $this-> Employee_model-> get_inactivate_employee_details();
            $data['inactive_employee'] = $inactive_staff_data->result();
            
            $data['main_content'] = array('common/employee/view_inactive_employee');
            $this -> load -> view('bootstrap_templates/main_template', $data);
        }
```
{{< /details >}}

## active_employee
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to activate an employee. It retrieves the employee ID and school ID from the input, then uses the Google Classroom API to authenticate and get an access token. It then retrieves the selected user's information using the access token. If the user's primary email is not empty, it updates the employee's status to active in the database and updates the Walnut user. Finally, it retrieves the information of the activated employee and returns true. If the user's primary email is empty, it returns 'No data'.

### User Acceptance Criteria
```gherkin
Feature: Activate Employee

Scenario: Employee with valid ID and school ID
  Given The employee ID is '123' and the school ID is '456'
  When The active_employee function is called
  Then The employee is activated and true is returned

Scenario: Employee with invalid ID or school ID
  Given The employee ID is '789' and the school ID is '012'
  When The active_employee function is called
  Then 'No data' is returned
```

### Refactoring
1. Extract the code for getting the employee ID and school ID into a separate function.
2. Extract the code for authenticating and getting the access token into a separate function.
3. Extract the code for updating the employee's status and Walnut user into a separate function.
4. Use dependency injection to inject the Google Classroom and Google Login dependencies.
5. Use proper error handling and logging.

{{< details "source code " >}}
```php
function active_employee()
        {
            $data['emp_id']        = $this->input->post('emp_id');
            $data['ref_school_id'] = $this->input->post('ref_school_id');

            $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
            $access_token             = $this-> google_classroom ->get_access_token($client);
            $selected_user_info       = $this-> google_login ->RetriveUserInfo($access_token, $data['emp_id']);
            $selected_user_info_array = json_decode($selected_user_info);
            if ($selected_user_info_array->primaryEmail != '')
            {
                $active_data = $this-> Employee_model->update_inactive_employee($data['emp_id'],$data['ref_school_id']);
                if ($active_data) 
                {
                    $emp_result = $this-> Employee_model->update_walnut_user($data['emp_id'], 1);
                    $selected_inactive_emp_info = $this-> google_login ->ActiveEmployeeInfo($access_token, $data['emp_id']);
                    echo TRUE;return;
                }
            }else
            {
                echo "No data";return;
            }
        }
```
{{< /details >}}

## show_user
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
The `show_user` function is responsible for displaying user information. It retrieves user data from the Google Classroom API and the MGR system, and then displays the information on the page. The function also retrieves organization unit information from the Google API and filters the user data based on the organization units. The function handles suspended users and retrieves group information for each user. Finally, the function loads the view template and passes the data to be displayed on the page.

### User Acceptance Criteria
```gherkin
Feature: Show User
Scenario: Display user information
Given The user has selected a username
When The user clicks on the 'Show User' button
Then The user information is displayed on the page
```

### Refactoring
1. Extract the code for retrieving organization unit information into a separate function.
2. Extract the code for retrieving user data from the Google Classroom API into a separate function.
3. Extract the code for retrieving user data from the MGR system into a separate function.
4. Extract the code for filtering user data based on organization units into a separate function.
5. Extract the code for retrieving group information for each user into a separate function.
6. Use dependency injection to inject the Google Classroom API and MGR system dependencies into the function.
7. Use a data mapper to map the retrieved data to the appropriate data structures.
8. Use a template engine to load and render the view template.

{{< details "source code " >}}
```php
public function show_user()
        {
            $data['page_data']['page_date'] = date("d M Y");
            $data['flag_permission'] = 1;
            if(isset($_POST['sel_username']) &&  $_POST['sel_username'] != NULL){
                $data['userkey'] = $_POST['sel_username']; 
                $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
                $access_token = $this-> google_classroom ->get_access_token($client);
                $customer_id = 'my_customer';
                $retrive_all_user_info = NULL;

                //Getting orgnization(OrgUnitInfo) from google API
                $retrive_org_info = $this->google_login ->RetriveOrgUnitInfo($access_token,$customer_id);
                $orgunittypeinfo = json_decode($retrive_org_info);
                $organizationunits = $orgunittypeinfo->organizationUnits;
                $orgnizationname = array();
                foreach ($organizationunits as $key => $value) {
                    array_push($orgnizationname, $value->name);
                }
                //End of orgunitinfo//
                $user_all_info = array();
                $page_token = NULL;
                $all_user_info = array();
                do{
                    $ret_retrive_all_user_info = $this->google_login ->RetriveSingleUserInfo($access_token,$data['userkey'],$page_token);
                    $retrive_all_user_info = json_decode($ret_retrive_all_user_info);
                    array_push($all_user_info,$retrive_all_user_info);
                    $page_token = $retrive_all_user_info->nextPageToken;
                }while($page_token != NULL);

                $school_data = $this -> School_model -> get_login_school_data();
                if ($school_data != NULL) {
                    $data['school_n_ho_data'] = $school_data;
                } else {
                    $data['school_n_ho_data'] = NULL;
                }
                $ho_and_school_array = $data['school_n_ho_data']->result_array();
                $ho_array = array(
                                    'school_id' => 0,
                                    'school_name' =>'Head Office'
                                );
                array_push($ho_and_school_array, $ho_array);

                $school_d_headofc = array();
                for ($k=0; $k < count($ho_and_school_array); $k++) { 
                    array_push($school_d_headofc,$ho_and_school_array[$k]['school_name']);
                }

                $user_info = NULL;
                $staff_info = array();
                $ret_staff_role = "";
                $user_all_info = array();

                for($i=0; $i< count($all_user_info);$i++)
                {
                    $retrive_all_user_data = $all_user_info[$i];
                    foreach ($retrive_all_user_data as $key => $data_value)
                    {
                        foreach ($data_value as $user_key => $user_data_value)
                        {
                            if($user_data_value->externalIds[0]->value == '12345')
                            {
                                $unitpath = $user_data_value->orgUnitPath;
                                $roll_name = ' - ';
                                $staff_info = $this-> Employee_model -> get_extra_staff_info($user_data_value->primaryEmail); // Get status from MGR system
                                $ret_staff_role = $this-> Employee_model -> get_employee_selected_role($staff_info[0]['role']); // Get role name
                                
                                if ($ret_staff_role != "") 
                                {
                                    $roll_name = $ret_staff_role->result_array()[0]['role_name'];
                                }
                                if(($user_data_value->suspended == NULL)||($user_data_value->suspended == ""))
                                {
                                    $ret_retrive_user_group_info = $this->google_login ->RetriveUserGroupInfo($access_token, $user_data_value->primaryEmail);
                                    $ret_retrive_user_group_info = json_decode($ret_retrive_user_group_info);
                                    $ret_retrieve_group = $ret_retrive_user_group_info->groups;

                                    $group_name_array= array();
                                    for($p=0; $p < count($ret_retrieve_group); $p++ ){
                                        $group_name = $ret_retrieve_group[$p]->name;
                                        array_push($group_name_array,$group_name);
                                    }
                                    $ret_group_name = implode(",",$group_name_array);

                                    $user_info = array(
                                        'email_id'=>$user_data_value->primaryEmail,
                                        'first_name'=>$user_data_value->name->givenName,
                                        'last_name'=>$user_data_value->name->familyName,
                                        'full_name'=>$user_data_value->name->fullName,
                                        'orgunitpath'=>$user_data_value->orgUnitPath,
                                        'phones'=>isset($user_data_value->phones['0']->value)?$user_data_value->phones['0']->value:'',
                                        'status'=>isset($staff_info[0]['isactive'])?$staff_info[0]['isactive']:' - ',
                                        'role'=>$roll_name,
                                        'group_name'=> $ret_group_name
                                    );
                                    array_push($user_all_info, $user_info);
                                }
                            }
                        }
                    }
                }
                $users_of_org = array();
                for ($i=0; $i < count($user_all_info); $i++) { 
                    // $orgunit_exploed = explode('/', $user_all_info[$i]['orgunitpath']);
                    // if (in_array($orgunit_exploed[1],$school_d_headofc)) {
                        array_push($users_of_org, $user_all_info[$i]); 
                    // }
                }
                $data['school_d_headofc'] = $school_d_headofc;
                $data['users_of_org'] = $users_of_org;

            }
            $data['main_content'] = array('common/employee/view_employee_list');
            $data['page_data']['page_title'] = 'Employee Information';
            $this -> load -> view('bootstrap_templates/main_template', $data);
        }
```
{{< /details >}}

## google_inactive_employee
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
This function is used to process a CSV file containing employee data and update the status of inactive employees in the database. It first checks if the uploaded file is a CSV file. If it is, the function reads the file and extracts the data. It then iterates over each row of data and checks if the employee is inactive. If the employee is inactive, it updates the status of the employee in the database and also updates the corresponding Walnut user. Finally, it returns a success message.

### User Acceptance Criteria
```gherkin
Feature: Update inactive employees

Scenario: Process CSV file and update inactive employees
Given An uploaded CSV file
When The function google_inactive_employee is called
Then The status of inactive employees in the database should be updated
```

### Refactoring
1. Extract the file upload logic into a separate function for reusability.
2. Move the database update logic into a separate function for better separation of concerns.
3. Use a library or built-in function to handle CSV file parsing instead of manually parsing the file.
4. Implement error handling and validation for the uploaded file.

{{< details "source code " >}}
```php
function google_inactive_employee()
        {
            $uploaddir  = $_SESSION['url'] . '/application/uploads/csv/';
            $file_name  = basename($_FILES["classroom_csv"]["name"]);
            $uploadfile = $uploaddir.$file_name;
            $ext_header = pathinfo($file_name, PATHINFO_EXTENSION);
            ini_set("max_execution_time", "10000");

            if ($ext_header != "csv") {
                $_SESSION['msg'] = 'Error! Only CSV files can be uploaded.';
                redirect("employee");
            }else{
                if (move_uploaded_file($_FILES['classroom_csv']['tmp_name'], $uploadfile)) {
                  
                    $csvfile = $uploadfile;
                    $file    = fopen($csvfile, "r") or die("Problem in opening file");
                    $size    = filesize($csvfile);
                    if (!$size) {
                        $_SESSION['msg'] = 'File is empty! Please check.';
                        redirect("employee");
                    }
                    $csvcontent = fread($file, $size);
                    fclose($file);

                    $fieldseparator = ",";
                    $lineseparator  = "\n";
                    $lines          = 0;
                    $formdata       = array();
                    $row            = 0;
                    $csv_column_array = array();
                    $csv_data_array = array();
                    foreach (explode($lineseparator, $csvcontent) as $line) {
                        $lines++;
                        $line = trim($line, " \t");
                        $line = str_replace("\r", "", $line);
                        $formdata = str_getcsv($line, $fieldseparator, "\"");

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
                        if (count($formdata) >= 1) {
                            
                            for ($i = 0; $i < count($formdata); $i++ ) { 
                                $csv_data_array[$i][$m] = $formdata[$i];
                                
                            }
                        }
                        $m++;
                        $row++; 
                    }
                    for ($i = 0 ; $i < count($csv_data_array[0]) ;$i++)
                    {
                        $data['employee_mail'] = $csv_data_array[0][$i];
                        $client = $this-> google_classroom -> get_classroom_auth(CLASSROOM_SA_ID, CLASSROOM_SA_EMAIL, CLASSROOM_SA_P12, 'testing@walnutedu.in');
                        $access_token = $this-> google_classroom ->get_access_token($client);
                        $selected_inactive_user_info = $this-> google_login ->InActiveEmployee($access_token,$data['employee_mail']);
                        
                        if($selected_inactive_user_info)
                        {
                            $result= $this-> Employee_model->update_active_employee($data['employee_mail']);

                            $emp_result= $this-> Employee_model->update_walnut_user($data['employee_mail'],0);
                            // if($result)
                            // {
                            //     echo "updated sucessfully";return;
                            // }
                        }  
                    }

                    echo "sucess";return;
                }
            }
        }
```
{{< /details >}}

## Risks & Security Issues
**Code block 1**: 1. Potential security vulnerabilities in user input handling.
2. Lack of error handling and logging may lead to issues going unnoticed.
3. Potential performance issues due to inefficient code or database queries.

**__construct**: 

**index**: 1. The function may fail if the Google Classroom API is not accessible.
2. The function may fail if the necessary credentials are not provided.
3. The function may fail if there is an issue with the database connection.
4. The function may fail if there are errors in the retrieved data.

**check_username_exist**: 1. The function assumes that the Google Classroom and Google Login APIs are properly configured and accessible.
2. There may be potential security risks if the email ID is not properly validated before making API calls.
3. The function does not handle any errors or exceptions that may occur during the API calls.

**crud**: 1. The function assumes that the `$_POST['emp_operation']` variable is always set and contains a valid operation. If this assumption is incorrect, it could lead to unexpected behavior or errors.
2. The function does not handle errors or exceptions that may occur during the retrieval of data from the Google Classroom API, School_model, and Employee_model. This could result in a poor user experience if something goes wrong.
3. The function directly accesses the `$_POST` superglobal, which can be a security risk if not properly sanitized and validated.

**insert_employee**: 1. The function does not handle errors properly and simply returns the error message.
2. The function does not have proper input validation and sanitization, which can lead to security vulnerabilities.
3. The function has a high cyclomatic complexity due to the nested if-else statements, which makes it difficult to understand and maintain.
4. The function has a long list of dependencies, which makes it tightly coupled and difficult to test.
5. The function does not have proper error handling and logging, which makes it difficult to troubleshoot issues.

**update_employee**: 1. The function does not handle errors or exceptions that may occur during the update process.
2. The function does not validate the form inputs before updating the employee data.
3. The function does not provide any feedback or error messages to the user after the update is completed.

**ajax_employee_list**: 

**staff_report**: 1. The function does not handle any error scenarios, such as database connection errors or missing data.
2. The function relies on session data (`$_SESSION['school_id']`) without any validation or error handling.
3. The function directly accesses the models instead of using a service layer, which can lead to tight coupling and difficulties in testing.

**inactive_employee**: 

**active_employee**: 1. The function assumes that the input values for employee ID and school ID are always present.
2. The function does not handle any errors that may occur during the authentication process or when retrieving the user's information.
3. The function does not handle any errors that may occur when updating the employee's status or Walnut user.
4. The function does not provide any feedback or error messages to the caller.

**show_user**: 1. The function does not handle errors or exceptions that may occur during the retrieval of user data.
2. The function does not handle errors or exceptions that may occur during the retrieval of organization unit information.
3. The function does not handle errors or exceptions that may occur during the retrieval of group information for each user.
4. The function does not handle errors or exceptions that may occur during the loading of the view template.
5. The function does not handle errors or exceptions that may occur during the rendering of the view template.
6. The function does not handle errors or exceptions that may occur during the mapping of the retrieved data to the appropriate data structures.

**google_inactive_employee**: 1. The function assumes that the uploaded file is a CSV file without performing proper validation.
2. There is no error handling or validation for the file upload process.
3. The function directly updates the database without any transaction management, which can lead to inconsistent data in case of errors.
4. The function does not handle any exceptions or errors that may occur during the process.

