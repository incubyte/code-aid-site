+++
categories = ["Documentation"]
title = "send_mail_helper.php"
+++

## File Summary

- **File Path:** application\helpers\send_mail_helper.php
- **LOC:** 688
- **Last Modified:** Git logs not found
- **Number of Commits (Total / Last 6 Months / Last Month):** Git logs not found
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** Git logs not found
- **Top Contributors:** Git logs not found

{{< details "File source code " >}}
```php
<?php
/**
 * Mail Helper
 *
 * Handles sending of emails
 * Used from CI and CORE
 * BCC Support
 * TEST, DEV, LOCAL, DEFAULT environment emails get redirected automatically to testing emails
 *
 * @author Gulvel
 */
use Mailgun\Mailgun;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
class Send_mail_helper 
{
	/**
     * Email Sender
     * Switches between ENV and sends emails
     * 
     * @return boolean
    */
	public static function send_mail($mail_ids, $content_message, $subject, $attachments, $sender_array)
	{
		$email_vendor_data = self::get_vendorname_data();
		if($email_vendor_data[0]->vendorname  == 'sendgrid'){
			$ret_path = 'sendgrid/sendgrid-php.php';
		}else if($email_vendor_data[0]->vendorname  == 'mailgun'){
			$ret_path = 'mailgun/vendor/autoload.php';
		}else if($email_vendor_data[0]->vendorname  == 'smtp'){
			$ret_path1 = 'PHPMailer/src/Exception.php';
			$ret_path2 = 'PHPMailer/src/PHPMailer.php';
			$ret_path3 = 'PHPMailer/src/SMTP.php';
		}else{
			$ret_path = 'aws/aws-autoloader.php';
		}
		if ($mail_ids != NULL)
		{
			$bcc_email = NULL;
			$cc_email = NULL;

			// ENV Check
	        $server_host_name = $_SERVER['HTTP_HOST'];
	        switch ($server_host_name) {
	            case 'mgr.walnutedu.in':
					if ($email_vendor_data[0]->vendorname  == 'smtp')
	            	{
	            		require_once ("/var/www/mgr.walnutedu.in/library/".$ret_path1);
	            		require_once ("/var/www/mgr.walnutedu.in/library/".$ret_path2);
	            		require_once ("/var/www/mgr.walnutedu.in/library/".$ret_path3);
	            	}else{
	            		require_once ("/var/www/mgr.walnutedu.in/library/".$ret_path);
	            	}
					if (isset($sender_array['bcc_email']) && isset($sender_array['school_id'])) 
					{
						if($sender_array['bcc_email']) 
						{
							$bcc_email = self::fetch_bcc_email($sender_array['school_id']);
							if(isset($sender_array['bcc_mail_ids']))
							{
								if($sender_array['bcc_mail_ids'] != '' || $sender_array['bcc_mail_ids'] != NULL )
								{
									$bcc_email = $bcc_email.','.$sender_array['bcc_mail_ids'];
								}
							}	
						}
					}
					if (isset($sender_array['student_email']) && isset($sender_array['school_id'])) 
					{
						if(isset($sender_array['student_name']) && $sender_array['student_name'] != ''){
							$student_name = $sender_array['student_name'];
						}else{
							$student_name = "Student";
						}
						$student_email = array(	'email' => $sender_array['student_email'],
												'name'  => $student_name,
												'type'  => 'to'
											);
						array_push($mail_ids, $student_email);
					}
	                break;

	            case 'test.walnutedu.in':
					if ($email_vendor_data[0]->vendorname  == 'smtp')
	            	{
	            		require_once ("/var/www/test.walnutedu.in/library/".$ret_path1);
	            		require_once ("/var/www/test.walnutedu.in/library/".$ret_path2);
	            		require_once ("/var/www/test.walnutedu.in/library/".$ret_path3);
	            	}else{
	            		require_once ("/var/www/test.walnutedu.in/library/".$ret_path);
	            	}
					$subject .= " - TEST";
					$mail_ids = array();
					$temp_email = array(	'email' => 'naresh@walnutedu.in',
				                        	'name'   => 'Naresh',
				                        	'type'   => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					$temp_email = array(	'email' => 'rupali@gulvel.com',
				                        	'name'   => 'Rupali',
				                        	'type'   => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					$temp_email = array(	'email' => 'asmita@gulvel.com',
				                        	'name'   => 'Asmita',
				                        	'type'   => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					$temp_email = array(	'email' => 'ashwini.p@walnutedu.in',
				                        	'name'   => 'Ashwini',
				                        	'type'   => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					$temp_email = array(	'email' => 'snehal.j@walnutedu.in',
				                        	'name'  => 'Snehal',
				                        	'type'  => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					$temp_email = array(	'email' => 'chaitanya@walnutedu.in',
				                        	'name'  => 'Chaitanya',
				                        	'type'  => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					$temp_email = array(	'email' => 'manali@gulvel.com',
				                        	'name'  => 'Manali',
				                        	'type'  => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					$temp_email = array(	'email' => 'sandip@gulvel.com',
				                        	'name'  => 'Sandip',
				                        	'type'  => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					if (isset($sender_array['bcc_email']) && isset($sender_array['school_id'])) 
					{
						if($sender_array['bcc_email']) 
						{
							$bcc_email = 'shivane_superadmin@walnutedu.in';
							if(isset($sender_array['bcc_mail_ids']))
							{
								if($sender_array['bcc_mail_ids'] != '' || $sender_array['bcc_mail_ids'] != NULL )
								{
									$bcc_email = $bcc_email.',nikita@walnutedu.in';
								}
							}	
						}
					}

					if (isset($sender_array['cc_email']) && isset($sender_array['school_id'])) {
						if($sender_array['cc_email']) {
							$cc_email = 'pallavi.r@walnutedu.in';
						}
					}
	                break;

	            case 'dev.walnutedu.in':
					if ($email_vendor_data[0]->vendorname  == 'smtp')
	            	{
	            		require_once ("/var/www/dev.walnutedu.in/library/".$ret_path1);
	            		require_once ("/var/www/dev.walnutedu.in/library/".$ret_path2);
	            		require_once ("/var/www/dev.walnutedu.in/library/".$ret_path3);
	            	}else{
	            		require_once ("/var/www/dev.walnutedu.in/library/".$ret_path);
	            	}
					$subject .= " - DEV";  // For testing gateway links
					$mail_ids = array();
					$temp_email = array(	'email' => 'rupali@gulvel.com',
				                        	'name'  => 'Rupali',
				                        	'type'  => 'to'
				                        );
					array_push($mail_ids, $temp_email);
	                break;

	            case 'localhost':
	                require_once ("/Library/WebServer/Documents/test.walnutedu.in/library/aws/aws-autoloader.php");
					$subject .= " - LOCAL";
					$mail_ids = array();
					$temp_email = array(	'email' => 'rupali@gulvel.com',
				                        	'name'  => 'Rupali',
				                        	'type'  => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					if (isset($sender_array['bcc_email']) && isset($sender_array['school_id'])) 
					{
						if($sender_array['bcc_email']) 
						{
							$bcc_email = 'ravikiran@gulvel.com';
							if(isset($sender_array['bcc_mail_ids']))
							{
								if($sender_array['bcc_mail_ids'] != '' || $sender_array['bcc_mail_ids'] != NULL )
								{
									$bcc_email = $bcc_email.',ravikiran@gulvel.com';
								}
							}	
						}
						
					}
					
					if (isset($sender_array['cc_email']) && isset($sender_array['school_id'])) {
						if($sender_array['cc_email']) {
							$cc_email = 'rupali@gulvel.com';
						}
					}
	                break;

	            default:
	                require_once ("/var/www/dev.walnutedu.in/library/".$ret_path);
					$subject .= " - DEF";
					$mail_ids = array();
					$temp_email = array(	'email' => 'pallavi.r@walnutedu.in',
				                        	'name'  => 'Nikita',
				                        	'type'  => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					if (isset($sender_array['bcc_email']) && isset($sender_array['school_id'])) 
					{
						if($sender_array['bcc_email']) 
						{
							$bcc_email = 'snehal.j@walnutedu.in';
							if(isset($sender_array['bcc_mail_ids']))
							{
								if($sender_array['bcc_mail_ids'] != '' || $sender_array['bcc_mail_ids'] != NULL )
								{
									$bcc_email = $bcc_email.',pallavi.r@walnutedu.in';
								}
							}	
						}
					}

					if (isset($sender_array['cc_email']) && isset($sender_array['school_id'])) {
						if($sender_array['cc_email']) {
							$cc_email = 'snehal.j@walnutedu.in';
						}
					}
	                break;
	        }

			// From Email & From Name Sender
			$from_name = "";
			$from_email = "";
			if (count($sender_array) > 0) {
				if ($sender_array['sender_name'] != "") {
					$from_name = $sender_array['sender_name'];
			    }else{
			    	$from_name = 'Arpita Karkarey\'s Walnut School'; 
			    }
			  	if ($sender_array['from_email'] != "") {
			  		$from_email = $sender_array['from_email'];
			  	}else{
			  		$from_email = 'feedback@walnutedu.in';
			  	}
			} else {
				$from_name = 'Arpita Karkarey\'s Walnut School'; 
				$from_email = 'feedback@walnutedu.in';
			}
			
			 //vendor selection for mail
			if($email_vendor_data[0]->vendorname == 'mailgun')
			{
				$header = "";
				$mailid = "";
				$source = "";
				$subject_school_name = "";
				$subject_school_name = ($_SESSION['school_id']!= 0)?"[".substr_replace($_SESSION['school_name'],' ',7,10)."]":NULL; 
				// Name and Email id combination comma seprated
				foreach ($mail_ids as $mail_id_val) {
					if($mail_id_val['email'] != NULL || $mail_id_val['email'] != '')
					{
						$mailid .= $mail_id_val['name']."<".$mail_id_val['email'].">,";
					}
				}
				// Taking into one for \n is present check
				$source = $from_name." <".$from_email.">";
				$footer_content = file_get_contents(APP_ROOT_PATH.'/application/views/system/change_footer/email_template.txt');
				if (!$footer_content) {
					return FALSE;
				}
				$final_content = $content_message."".$footer_content;
            	$mg = Mailgun::create('1d460449b64e074c746f3c56c31689f2-2bab6b06-1dcf8468');
         		$domain = "sandboxefa9c3528c4e45218a0bc9c2039a589f.mailgun.org";
				$params = array(
				'from'    => $from_name."<".$from_email.">",
				'to'      => $mailid,
				'subject' => $subject,
				'html'    => $final_content,
				);
				# Make the call to the client.
				$mg->messages()->send($domain, $params);
				if($mg)
				{
					return TRUE;
				}
			}else if($email_vendor_data[0]->vendorname == 'sendgrid')
			{
				// to call sendgrid
				$email = new \SendGrid\Mail\Mail();
					
				// Null Declaration
				$tos = array();
				$header = "";
				$mailid = "";
				$source = "";
				$subject_school_name = "";
				$subject_school_name = ($_SESSION['school_id']!= 0)?"[".substr_replace($_SESSION['school_name'],' ',7,10)."]":NULL; 
				// Name and Email id combination comma seprated
				foreach ($mail_ids as $mail_id_val) 
				{
					if($mail_id_val['email'] != NULL || $mail_id_val['email'] != '')
					{
						$tos[$mail_id_val['email']]= $mail_id_val['name'];
					}
				}
				// Taking into one for \n is present check
				$source = $from_name." <".$from_email.">";

				$footer_content = file_get_contents(APP_ROOT_PATH.'/application/views/system/change_footer/email_template.txt');
				if (!$footer_content) {
					return FALSE;
				}
				$final_content = $content_message."".$footer_content;
				$email->setFrom($from_email, $from_name);
				$email->setSubject($subject);
				$email->addTos($tos);
				$email->addContent( "text/html",$final_content);
				// $email->addContent("text/p","$footer_content");
				$sendgrid = new \SendGrid('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');
				try {
					$response = $sendgrid->send($email);
					return TRUE;
					print $response->body() . "\n";
					
				} catch (Exception $e) {
					echo 'Caught exception: '. $e->getMessage() ."\n";
				}
			}elseif($email_vendor_data[0]->vendorname == 'smtp')
			{
				$mail = new PHPMailer(true);
				$tos = array();
				$header = "";
				$mailid = "";
				$source = "";
				$subject_school_name = "";
				$subject_school_name = ($_SESSION['school_id']!= 0)?"[".substr_replace($_SESSION['school_name'],' ',7,10)."]":NULL; 
				
				foreach($mail_ids as $mail_id_val){
					$tos[$mail_id_val['email']]= $mail_id_val['name'];
				}
				$footer_content = file_get_contents(APP_ROOT_PATH.'/application/views/system/change_footer/email_template.txt');
				if (!$footer_content) {
					return FALSE;
				}
				$final_content = $content_message."".$footer_content;
				//Server settings
				$mail->CharSet   = "UTF-8";
				$mail->isSMTP();                                            //Send using SMTP
				$mail->Host       = 'smtp.gmail.com';                       //Set the SMTP server to send through
				$mail->SMTPAuth   = true;                                   //Enable SMTP authentication
				$mail->Username   = 'feedback@walnutedu.in';                     //SMTP username
				$mail->Password   = 'wthedqinuijoqoho';                               //SMTP password
				$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
				$mail->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`
				//Recipients
				$from_name = $from_name."<SMTP>";
				$mail->setFrom($from_email, $from_name);
				foreach($tos as $email => $name){
				$mail->addAddress($email, $name);    						//Add a recipient
				}
				$mail->isHTML(true);                       		           //Set email format to HTML
				$mail->Subject = $subject;
				$mail->Body = $final_content;
				try {
				$response = $mail->send();
				return TRUE;
				echo 'Message has been sent';
				} catch (Exception $e) {
				echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
					}
			}
			else
			{
				//Amazon SES Call for walnutschool.in
				$domain_name = $email_vendor_data[0]->domain_name;
				$get_aws_result = self::get_aws_data($domain_name);
				$client = new Aws\Ses\SesClient([
			    'version' => 'latest',
				'region'  => $get_aws_result[0]->aws_region,
			    'credentials' => [
			    	'key' 	 => $get_aws_result[0]->aws_key,
				    'secret' => $get_aws_result[0]->aws_secret
					]
					]);
				$uid = md5(uniqid(time()));
				$header = "";
				$mailid = "";
				$source = "";
				$subject_school_name = "";
				$subject_school_name = ($_SESSION['school_id']!= 0)?"[".substr_replace($_SESSION['school_name'],' ',7,10)."]":NULL; 
				// Name and Email id combination comma seprated
				foreach ($mail_ids as $mail_id_val) {
					if($mail_id_val['email'] != NULL || $mail_id_val['email'] != '')
					{
						$mailid .= $mail_id_val['name']."<".$mail_id_val['email'].">,";
					}
				}
				// Taking into one for \n is present check
				$source = $from_name." <".$from_email.">";
				$footer_content = file_get_contents(APP_ROOT_PATH.'/application/views/system/change_footer/email_template.txt');
				if (!$footer_content) {
					return FALSE;
				}
				$header = "From: ".str_replace("\n"," ", $source)."\r\n";
				$header .= "To: ".$mailid."\r\n";	
				$header .= "Subject:  ".$subject_school_name." ".$subject."\r\n";
				if($bcc_email != NULL) {
					$header .= "BCC: ".$bcc_email."\r\n";
				}
				if($cc_email != NULL) {
					$header .= "CC: ".$cc_email."\r\n";
				}
				$header .= "MIME-Version: 1.0\r\n";
				$header .= "Content-Type: multipart/mixed; boundary=\"".$uid."\"\r\n\r\n";
				$header .= "This is a multi-part message in MIME format.\r\n";
				$header .= "--".$uid."\r\n";
				$header .= "Content-type:text/html; charset=UTF-8\r\n";
				$header .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
				$header .= $content_message."\r\n\r\n";
				$header .= $footer_content."\r\n\r\n";
				$header .= "--".$uid."\r\n";
				// Multiple attachments
				if (is_array($attachments)) {
					foreach ($attachments as $attachment) {
						if (!isset($attachment['content_id'])) {
							$attachment['content_id']      = 'test';
							$attachment['attachment_type'] = 'attachment';
						}
						$header .= "Content-ID: ".$attachment['content_id'].''."\n";
						$header .= "Content-Type: ".$attachment['type']."; name=\"".$attachment['name']."\"\r\n";
						$header .= "Content-Transfer-Encoding: base64\r\n";
						$header .= "Content-Disposition: ".$attachment['attachment_type']."; filename=\"".$attachment['name']."\"\r\n\r\n";
						$header .= $attachment['content']."\r\n\r\n";
						$header .= "--".$uid."\r\n";

					}
				}
				$msg['RawMessage']['Data'] = $header;
				try{
				$userid = isset($_SESSION['emp_id'])?$_SESSION['emp_id']:NULL;
				$username = isset($_SESSION['teacher_name'])?$_SESSION['teacher_name']:NULL;
				$school_name = NULL;
				if (isset($_SESSION['school_name'])) {
					if ($_SESSION["school_name"] == 'Head Office') {
						$school_name = 'HO';
					}else{
						$school_name = substr($_SESSION["school_name"], 17);    
					}
				}
				$filepath = APP_ROOT_PATH.'/audit_log/emails_sent.log'; 
				$handle = fopen($filepath, "a");                        
				fwrite($handle, "\n[".date('Y-m-d H:i:s')."][".$school_name."][".$username."(".$userid.")] Email Sent To:". json_encode($mail_ids));
				//sleep(10);
				$result = $client->sendRawEmail($msg);
				return TRUE;
				} catch (SesException $e) {
				return FALSE;
				}
			}
		}
	}
	/**
     * Fetch Sender Information
     * Swiches between ENV to fetch sender info
     * 
     * @return string
    */
    public static function get_sender_data($sender_info)
    {
    	$db_admin = 'wal_db_admin';
		$server_host_name = $_SERVER['HTTP_HOST'];
        switch ($server_host_name) {
            case 'mgr.walnutedu.in':
                $db_prefix = '';
                break;

            case 'test.walnutedu.in':
                $db_prefix = 'test_';
                break;

            case 'dev.walnutedu.in':
                $db_prefix = 'dev_';
                break;

            case 'localhost':
                $db_prefix = 'test_';
                break;

            default:
                $db_prefix = 'dev_';
                break;
        }

    	if (isset($sender_info['env']) && $sender_info['env'] == 'core') {
    		$mysqli_obj = $sender_info['mysql_obj'];
    		$sql_query = "SELECT sender_name,from_email FROM ".$db_prefix.$db_admin.".email_sms_sender WHERE school_id = ".$sender_info['school_id']." AND module_code = '".$sender_info['module_code']."' AND ref_ins_id = ".$sender_info['ref_inst_id']." AND ref_sch_id = ".$sender_info['ref_sch_id']." AND status = 1";

    		$ret_query = $mysqli_obj->query($sql_query);
   			$sender_data = $mysqli_obj->database_fetch_array($ret_query);
   			if (count($sender_data) > 0){
            	return $sender_data;
	        }else{
	            return '';
	        }
    	} else {
    		$ci =& get_instance();
			$ci->load->database();

	    	$ci->db->select('sender_name,from_email');
	    	$ci->db->where('module_code', $sender_info['module_code']);
	    	$ci->db->where('school_id', $sender_info['school_id']);
	    	$ci->db->where('ref_ins_id', $sender_info['ref_inst_id']);
	    	$ci->db->where('ref_sch_id', $sender_info['ref_sch_id']);
	    	$ci->db->where('status', 1);
    	    $row = $ci->db->get($db_prefix.ADMIN_DB.'.email_sms_sender');
    	    $sender_data = $row->result_array();
    	    if (count($sender_data) > 0){
            	return $sender_data[0];
	        }else{
	            return '';
	        }
    	}
    }

	/**
     * Fetch BCC Information
     * Swiches between schools to fetch BCC email list
     * 
     * @return string
    */
	public static function fetch_bcc_email($school_id)
    {
    	$server_host_name = $_SERVER['HTTP_HOST'];
        switch ($server_host_name) {
            case 'mgr.walnutedu.in':
                $db_prefix = '';
                break;

            case 'test.walnutedu.in':
                $db_prefix = 'test_';
                break;

            case 'dev.walnutedu.in':
                $db_prefix = 'dev_';
                break;

            case 'localhost':
                $db_prefix = 'dev_';
                break;

            default:
                $db_prefix = 'dev_';
                break;
        }

		$ci =& get_instance();
		$ci->load->database();
    	$ci->db->select('admin_email_id');
    	$ci->db->where('school_id', $school_id);
	    $query = $ci->db->get($db_prefix.ADMIN_DB.'.walnut_school_master');
        if ($query -> num_rows() > 0)
        {
            $result = $query->row();
            return $result->admin_email_id;
        }else{
            return NULL;
        }
    }

    public static function get_aws_data($domain)
    {
    	$db_admin = 'wal_db_admin';
    	$server_host_name = $_SERVER['HTTP_HOST'];
        switch ($server_host_name) {
            case 'mgr.walnutedu.in':
                $db_prefix = '';
                break;

            case 'test.walnutedu.in':
                $db_prefix = 'test_';
                break;

            case 'dev.walnutedu.in':
                $db_prefix = 'dev_';
                break;

            case 'localhost':
                $db_prefix = 'dev_';
                break;

            default:
                $db_prefix = 'dev_';
                break;
        }
        if (CI_VERSION > 0)
        {
        	$ci =& get_instance();
			$ci->load->database();
	    	$ci->db->select('*');
	    	$ci->db->where('domain_name', $domain);
		    $query = $ci->db->get($db_prefix.ADMIN_DB.'.aws_key_secret_master');
	        if ($query -> num_rows() > 0)
	        {
	           return  $query->result();
	        }else{
	            return NULL;
	        }
        }else{
      		$mysqli_obj = $GLOBALS['mysqli_obj'];
    		$sql_query = "SELECT * FROM ".$db_prefix.$db_admin.".aws_key_secret_master where domain_name = '".$domain."'";
    		$ret_query = $mysqli_obj->query($sql_query);
   			$res_array[0] = $GLOBALS['mysqli_obj']->database_fetch_object($ret_query);
   			if (count($res_array) > 0){
            	return $res_array;
	        }else{
	            return NULL;
	        }
        }
    }

	public static function get_vendorname_data()
    {
    	$db_admin = 'wal_db_admin';
    	$server_host_name = $_SERVER['HTTP_HOST'];
        switch ($server_host_name) {
            case 'mgr.walnutedu.in':
                $db_prefix = '';
                break;

            case 'test.walnutedu.in':
                $db_prefix = 'test_';
                break;

            case 'dev.walnutedu.in':
                $db_prefix = 'dev_';
                break;

            case 'localhost':
                $db_prefix = 'dev_';
                break;

            default:
                $db_prefix = 'dev_';
                break;
        }
		if (CI_VERSION > 0)
        {
        	$ci =& get_instance();
			$ci->load->database();
    		$ci->db->select('*');
    		$ci->db->where('flag', 1);
	    	$query = $ci->db->get($db_prefix.ADMIN_DB.'.email_vendor_configuration');
        	if ($query -> num_rows() > 0){
         	  return  $query->result();
	        }else{
	            return NULL;
	        }
		}else{
			$mysqli_obj = $GLOBALS['mysqli_obj'];
    		$sql_query = "SELECT * FROM ".$db_prefix.$db_admin.".email_vendor_configuration where flag = 1";
    		$ret_query = $mysqli_obj->query($sql_query);
    		$temp_array[0] = $GLOBALS['mysqli_obj']->database_fetch_object($ret_query);
    		if (count($temp_array) > 0){
            	return $temp_array;
	        }else{
	            return NULL;
	        }
		}
    }
}
?>

```
{{< /details >}}



## send_mail
{{< complexityLabel "Extreme" >}}{{< /complexityLabel >}}
### Overview
The `send_mail` function is used to send emails to multiple recipients. It supports different email vendors such as SendGrid, Mailgun, SMTP, and AWS SES. The function first checks the email vendor selected and includes the necessary vendor-specific files. It then determines the server host name and includes the appropriate vendor-specific files based on the host name. Next, it checks the mail IDs provided and prepares the BCC and CC email addresses if they are present. It then sets the from name and from email address based on the sender array. Finally, it sends the email using the selected email vendor.

### Refactoring
1. Extract the code for including vendor-specific files into separate functions.
2. Use a switch statement instead of multiple if-else statements to determine the vendor-specific file paths.
3. Extract the code for preparing the BCC and CC email addresses into separate functions.
4. Extract the code for setting the from name and from email address into a separate function.
5. Use a factory pattern to create the appropriate email vendor object based on the selected vendor name.

{{< details "source code " >}}
```php
public static function send_mail($mail_ids, $content_message, $subject, $attachments, $sender_array)
	{
		$email_vendor_data = self::get_vendorname_data();
		if($email_vendor_data[0]->vendorname  == 'sendgrid'){
			$ret_path = 'sendgrid/sendgrid-php.php';
		}else if($email_vendor_data[0]->vendorname  == 'mailgun'){
			$ret_path = 'mailgun/vendor/autoload.php';
		}else if($email_vendor_data[0]->vendorname  == 'smtp'){
			$ret_path1 = 'PHPMailer/src/Exception.php';
			$ret_path2 = 'PHPMailer/src/PHPMailer.php';
			$ret_path3 = 'PHPMailer/src/SMTP.php';
		}else{
			$ret_path = 'aws/aws-autoloader.php';
		}
		if ($mail_ids != NULL)
		{
			$bcc_email = NULL;
			$cc_email = NULL;

			// ENV Check
	        $server_host_name = $_SERVER['HTTP_HOST'];
	        switch ($server_host_name) {
	            case 'mgr.walnutedu.in':
					if ($email_vendor_data[0]->vendorname  == 'smtp')
	            	{
	            		require_once ("/var/www/mgr.walnutedu.in/library/".$ret_path1);
	            		require_once ("/var/www/mgr.walnutedu.in/library/".$ret_path2);
	            		require_once ("/var/www/mgr.walnutedu.in/library/".$ret_path3);
	            	}else{
	            		require_once ("/var/www/mgr.walnutedu.in/library/".$ret_path);
	            	}
					if (isset($sender_array['bcc_email']) && isset($sender_array['school_id'])) 
					{
						if($sender_array['bcc_email']) 
						{
							$bcc_email = self::fetch_bcc_email($sender_array['school_id']);
							if(isset($sender_array['bcc_mail_ids']))
							{
								if($sender_array['bcc_mail_ids'] != '' || $sender_array['bcc_mail_ids'] != NULL )
								{
									$bcc_email = $bcc_email.','.$sender_array['bcc_mail_ids'];
								}
							}	
						}
					}
					if (isset($sender_array['student_email']) && isset($sender_array['school_id'])) 
					{
						if(isset($sender_array['student_name']) && $sender_array['student_name'] != ''){
							$student_name = $sender_array['student_name'];
						}else{
							$student_name = "Student";
						}
						$student_email = array(	'email' => $sender_array['student_email'],
												'name'  => $student_name,
												'type'  => 'to'
											);
						array_push($mail_ids, $student_email);
					}
	                break;

	            case 'test.walnutedu.in':
					if ($email_vendor_data[0]->vendorname  == 'smtp')
	            	{
	            		require_once ("/var/www/test.walnutedu.in/library/".$ret_path1);
	            		require_once ("/var/www/test.walnutedu.in/library/".$ret_path2);
	            		require_once ("/var/www/test.walnutedu.in/library/".$ret_path3);
	            	}else{
	            		require_once ("/var/www/test.walnutedu.in/library/".$ret_path);
	            	}
					$subject .= " - TEST";
					$mail_ids = array();
					$temp_email = array(	'email' => 'naresh@walnutedu.in',
				                        	'name'   => 'Naresh',
				                        	'type'   => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					$temp_email = array(	'email' => 'rupali@gulvel.com',
				                        	'name'   => 'Rupali',
				                        	'type'   => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					$temp_email = array(	'email' => 'asmita@gulvel.com',
				                        	'name'   => 'Asmita',
				                        	'type'   => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					$temp_email = array(	'email' => 'ashwini.p@walnutedu.in',
				                        	'name'   => 'Ashwini',
				                        	'type'   => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					$temp_email = array(	'email' => 'snehal.j@walnutedu.in',
				                        	'name'  => 'Snehal',
				                        	'type'  => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					$temp_email = array(	'email' => 'chaitanya@walnutedu.in',
				                        	'name'  => 'Chaitanya',
				                        	'type'  => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					$temp_email = array(	'email' => 'manali@gulvel.com',
				                        	'name'  => 'Manali',
				                        	'type'  => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					$temp_email = array(	'email' => 'sandip@gulvel.com',
				                        	'name'  => 'Sandip',
				                        	'type'  => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					if (isset($sender_array['bcc_email']) && isset($sender_array['school_id'])) 
					{
						if($sender_array['bcc_email']) 
						{
							$bcc_email = 'shivane_superadmin@walnutedu.in';
							if(isset($sender_array['bcc_mail_ids']))
							{
								if($sender_array['bcc_mail_ids'] != '' || $sender_array['bcc_mail_ids'] != NULL )
								{
									$bcc_email = $bcc_email.',nikita@walnutedu.in';
								}
							}	
						}
					}

					if (isset($sender_array['cc_email']) && isset($sender_array['school_id'])) {
						if($sender_array['cc_email']) {
							$cc_email = 'pallavi.r@walnutedu.in';
						}
					}
	                break;

	            case 'dev.walnutedu.in':
					if ($email_vendor_data[0]->vendorname  == 'smtp')
	            	{
	            		require_once ("/var/www/dev.walnutedu.in/library/".$ret_path1);
	            		require_once ("/var/www/dev.walnutedu.in/library/".$ret_path2);
	            		require_once ("/var/www/dev.walnutedu.in/library/".$ret_path3);
	            	}else{
	            		require_once ("/var/www/dev.walnutedu.in/library/".$ret_path);
	            	}
					$subject .= " - DEV";  // For testing gateway links
					$mail_ids = array();
					$temp_email = array(	'email' => 'rupali@gulvel.com',
				                        	'name'  => 'Rupali',
				                        	'type'  => 'to'
				                        );
					array_push($mail_ids, $temp_email);
	                break;

	            case 'localhost':
	                require_once ("/Library/WebServer/Documents/test.walnutedu.in/library/aws/aws-autoloader.php");
					$subject .= " - LOCAL";
					$mail_ids = array();
					$temp_email = array(	'email' => 'rupali@gulvel.com',
				                        	'name'  => 'Rupali',
				                        	'type'  => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					if (isset($sender_array['bcc_email']) && isset($sender_array['school_id'])) 
					{
						if($sender_array['bcc_email']) 
						{
							$bcc_email = 'ravikiran@gulvel.com';
							if(isset($sender_array['bcc_mail_ids']))
							{
								if($sender_array['bcc_mail_ids'] != '' || $sender_array['bcc_mail_ids'] != NULL )
								{
									$bcc_email = $bcc_email.',ravikiran@gulvel.com';
								}
							}	
						}
						
					}
					
					if (isset($sender_array['cc_email']) && isset($sender_array['school_id'])) {
						if($sender_array['cc_email']) {
							$cc_email = 'rupali@gulvel.com';
						}
					}
	                break;

	            default:
	                require_once ("/var/www/dev.walnutedu.in/library/".$ret_path);
					$subject .= " - DEF";
					$mail_ids = array();
					$temp_email = array(	'email' => 'pallavi.r@walnutedu.in',
				                        	'name'  => 'Nikita',
				                        	'type'  => 'to'
				                        );
					array_push($mail_ids, $temp_email);

					if (isset($sender_array['bcc_email']) && isset($sender_array['school_id'])) 
					{
						if($sender_array['bcc_email']) 
						{
							$bcc_email = 'snehal.j@walnutedu.in';
							if(isset($sender_array['bcc_mail_ids']))
							{
								if($sender_array['bcc_mail_ids'] != '' || $sender_array['bcc_mail_ids'] != NULL )
								{
									$bcc_email = $bcc_email.',pallavi.r@walnutedu.in';
								}
							}	
						}
					}

					if (isset($sender_array['cc_email']) && isset($sender_array['school_id'])) {
						if($sender_array['cc_email']) {
							$cc_email = 'snehal.j@walnutedu.in';
						}
					}
	                break;
	        }

			// From Email & From Name Sender
			$from_name = "";
			$from_email = "";
			if (count($sender_array) > 0) {
				if ($sender_array['sender_name'] != "") {
					$from_name = $sender_array['sender_name'];
			    }else{
			    	$from_name = 'Arpita Karkarey\'s Walnut School'; 
			    }
			  	if ($sender_array['from_email'] != "") {
			  		$from_email = $sender_array['from_email'];
			  	}else{
			  		$from_email = 'feedback@walnutedu.in';
			  	}
			} else {
				$from_name = 'Arpita Karkarey\'s Walnut School'; 
				$from_email = 'feedback@walnutedu.in';
			}
			
			 //vendor selection for mail
			if($email_vendor_data[0]->vendorname == 'mailgun')
			{
				$header = "";
				$mailid = "";
				$source = "";
				$subject_school_name = "";
				$subject_school_name = ($_SESSION['school_id']!= 0)?"[".substr_replace($_SESSION['school_name'],' ',7,10)."]":NULL; 
				// Name and Email id combination comma seprated
				foreach ($mail_ids as $mail_id_val) {
					if($mail_id_val['email'] != NULL || $mail_id_val['email'] != '')
					{
						$mailid .= $mail_id_val['name']."<".$mail_id_val['email'].">,";
					}
				}
				// Taking into one for \n is present check
				$source = $from_name." <".$from_email.">";
				$footer_content = file_get_contents(APP_ROOT_PATH.'/application/views/system/change_footer/email_template.txt');
				if (!$footer_content) {
					return FALSE;
				}
				$final_content = $content_message."".$footer_content;
            	$mg = Mailgun::create('1d460449b64e074c746f3c56c31689f2-2bab6b06-1dcf8468');
         		$domain = "sandboxefa9c3528c4e45218a0bc9c2039a589f.mailgun.org";
				$params = array(
				'from'    => $from_name."<".$from_email.">",
				'to'      => $mailid,
				'subject' => $subject,
				'html'    => $final_content,
				);
				# Make the call to the client.
				$mg->messages()->send($domain, $params);
				if($mg)
				{
					return TRUE;
				}
			}else if($email_vendor_data[0]->vendorname == 'sendgrid')
			{
				// to call sendgrid
				$email = new \SendGrid\Mail\Mail();
					
				// Null Declaration
				$tos = array();
				$header = "";
				$mailid = "";
				$source = "";
				$subject_school_name = "";
				$subject_school_name = ($_SESSION['school_id']!= 0)?"[".substr_replace($_SESSION['school_name'],' ',7,10)."]":NULL; 
				// Name and Email id combination comma seprated
				foreach ($mail_ids as $mail_id_val) 
				{
					if($mail_id_val['email'] != NULL || $mail_id_val['email'] != '')
					{
						$tos[$mail_id_val['email']]= $mail_id_val['name'];
					}
				}
				// Taking into one for \n is present check
				$source = $from_name." <".$from_email.">";

				$footer_content = file_get_contents(APP_ROOT_PATH.'/application/views/system/change_footer/email_template.txt');
				if (!$footer_content) {
					return FALSE;
				}
				$final_content = $content_message."".$footer_content;
				$email->setFrom($from_email, $from_name);
				$email->setSubject($subject);
				$email->addTos($tos);
				$email->addContent( "text/html",$final_content);
				// $email->addContent("text/p","$footer_content");
				$sendgrid = new \SendGrid('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');
				try {
					$response = $sendgrid->send($email);
					return TRUE;
					print $response->body() . "\n";
					
				} catch (Exception $e) {
					echo 'Caught exception: '. $e->getMessage() ."\n";
				}
			}elseif($email_vendor_data[0]->vendorname == 'smtp')
			{
				$mail = new PHPMailer(true);
				$tos = array();
				$header = "";
				$mailid = "";
				$source = "";
				$subject_school_name = "";
				$subject_school_name = ($_SESSION['school_id']!= 0)?"[".substr_replace($_SESSION['school_name'],' ',7,10)."]":NULL; 
				
				foreach($mail_ids as $mail_id_val){
					$tos[$mail_id_val['email']]= $mail_id_val['name'];
				}
				$footer_content = file_get_contents(APP_ROOT_PATH.'/application/views/system/change_footer/email_template.txt');
				if (!$footer_content) {
					return FALSE;
				}
				$final_content = $content_message."".$footer_content;
				//Server settings
				$mail->CharSet   = "UTF-8";
				$mail->isSMTP();                                            //Send using SMTP
				$mail->Host       = 'smtp.gmail.com';                       //Set the SMTP server to send through
				$mail->SMTPAuth   = true;                                   //Enable SMTP authentication
				$mail->Username   = 'feedback@walnutedu.in';                     //SMTP username
				$mail->Password   = 'wthedqinuijoqoho';                               //SMTP password
				$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
				$mail->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`
				//Recipients
				$from_name = $from_name."<SMTP>";
				$mail->setFrom($from_email, $from_name);
				foreach($tos as $email => $name){
				$mail->addAddress($email, $name);    						//Add a recipient
				}
				$mail->isHTML(true);                       		           //Set email format to HTML
				$mail->Subject = $subject;
				$mail->Body = $final_content;
				try {
				$response = $mail->send();
				return TRUE;
				echo 'Message has been sent';
				} catch (Exception $e) {
				echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
					}
			}
			else
			{
				//Amazon SES Call for walnutschool.in
				$domain_name = $email_vendor_data[0]->domain_name;
				$get_aws_result = self::get_aws_data($domain_name);
				$client = new Aws\Ses\SesClient([
			    'version' => 'latest',
				'region'  => $get_aws_result[0]->aws_region,
			    'credentials' => [
			    	'key' 	 => $get_aws_result[0]->aws_key,
				    'secret' => $get_aws_result[0]->aws_secret
					]
					]);
				$uid = md5(uniqid(time()));
				$header = "";
				$mailid = "";
				$source = "";
				$subject_school_name = "";
				$subject_school_name = ($_SESSION['school_id']!= 0)?"[".substr_replace($_SESSION['school_name'],' ',7,10)."]":NULL; 
				// Name and Email id combination comma seprated
				foreach ($mail_ids as $mail_id_val) {
					if($mail_id_val['email'] != NULL || $mail_id_val['email'] != '')
					{
						$mailid .= $mail_id_val['name']."<".$mail_id_val['email'].">,";
					}
				}
				// Taking into one for \n is present check
				$source = $from_name." <".$from_email.">";
				$footer_content = file_get_contents(APP_ROOT_PATH.'/application/views/system/change_footer/email_template.txt');
				if (!$footer_content) {
					return FALSE;
				}
				$header = "From: ".str_replace("\n"," ", $source)."\r\n";
				$header .= "To: ".$mailid."\r\n";	
				$header .= "Subject:  ".$subject_school_name." ".$subject."\r\n";
				if($bcc_email != NULL) {
					$header .= "BCC: ".$bcc_email."\r\n";
				}
				if($cc_email != NULL) {
					$header .= "CC: ".$cc_email."\r\n";
				}
				$header .= "MIME-Version: 1.0\r\n";
				$header .= "Content-Type: multipart/mixed; boundary=\"".$uid."\"\r\n\r\n";
				$header .= "This is a multi-part message in MIME format.\r\n";
				$header .= "--".$uid."\r\n";
				$header .= "Content-type:text/html; charset=UTF-8\r\n";
				$header .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
				$header .= $content_message."\r\n\r\n";
				$header .= $footer_content."\r\n\r\n";
				$header .= "--".$uid."\r\n";
				// Multiple attachments
				if (is_array($attachments)) {
					foreach ($attachments as $attachment) {
						if (!isset($attachment['content_id'])) {
							$attachment['content_id']      = 'test';
							$attachment['attachment_type'] = 'attachment';
						}
						$header .= "Content-ID: ".$attachment['content_id'].''."\n";
						$header .= "Content-Type: ".$attachment['type']."; name=\"".$attachment['name']."\"\r\n";
						$header .= "Content-Transfer-Encoding: base64\r\n";
						$header .= "Content-Disposition: ".$attachment['attachment_type']."; filename=\"".$attachment['name']."\"\r\n\r\n";
						$header .= $attachment['content']."\r\n\r\n";
						$header .= "--".$uid."\r\n";

					}
				}
				$msg['RawMessage']['Data'] = $header;
				try{
				$userid = isset($_SESSION['emp_id'])?$_SESSION['emp_id']:NULL;
				$username = isset($_SESSION['teacher_name'])?$_SESSION['teacher_name']:NULL;
				$school_name = NULL;
				if (isset($_SESSION['school_name'])) {
					if ($_SESSION["school_name"] == 'Head Office') {
						$school_name = 'HO';
					}else{
						$school_name = substr($_SESSION["school_name"], 17);    
					}
				}
				$filepath = APP_ROOT_PATH.'/audit_log/emails_sent.log'; 
				$handle = fopen($filepath, "a");                        
				fwrite($handle, "\n[".date('Y-m-d H:i:s')."][".$school_name."][".$username."(".$userid.")] Email Sent To:". json_encode($mail_ids));
				//sleep(10);
				$result = $client->sendRawEmail($msg);
				return TRUE;
				} catch (SesException $e) {
				return FALSE;
				}
			}
		}
	}
```
{{< /details >}}

## get_sender_data
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to get the sender data from the database based on the provided sender information. It first checks the environment and then retrieves the sender data from the appropriate database table.

### User Acceptance Criteria
```gherkin
Feature: Get Sender Data
Scenario: Retrieve sender data from database
Given The sender information is provided
When The function get_sender_data is called
Then The sender data is retrieved from the database
```

### Refactoring
1. Extract the switch statement into a separate function to improve readability.
2. Use a configuration file to store the server host names and corresponding database prefixes instead of hardcoding them.
3. Use dependency injection to pass the database object instead of accessing it globally.

{{< details "source code " >}}
```php
public static function get_sender_data($sender_info)
    {
    	$db_admin = 'wal_db_admin';
		$server_host_name = $_SERVER['HTTP_HOST'];
        switch ($server_host_name) {
            case 'mgr.walnutedu.in':
                $db_prefix = '';
                break;

            case 'test.walnutedu.in':
                $db_prefix = 'test_';
                break;

            case 'dev.walnutedu.in':
                $db_prefix = 'dev_';
                break;

            case 'localhost':
                $db_prefix = 'test_';
                break;

            default:
                $db_prefix = 'dev_';
                break;
        }

    	if (isset($sender_info['env']) && $sender_info['env'] == 'core') {
    		$mysqli_obj = $sender_info['mysql_obj'];
    		$sql_query = "SELECT sender_name,from_email FROM ".$db_prefix.$db_admin.".email_sms_sender WHERE school_id = ".$sender_info['school_id']." AND module_code = '".$sender_info['module_code']."' AND ref_ins_id = ".$sender_info['ref_inst_id']." AND ref_sch_id = ".$sender_info['ref_sch_id']." AND status = 1";

    		$ret_query = $mysqli_obj->query($sql_query);
   			$sender_data = $mysqli_obj->database_fetch_array($ret_query);
   			if (count($sender_data) > 0){
            	return $sender_data;
	        }else{
	            return '';
	        }
    	} else {
    		$ci =& get_instance();
			$ci->load->database();

	    	$ci->db->select('sender_name,from_email');
	    	$ci->db->where('module_code', $sender_info['module_code']);
	    	$ci->db->where('school_id', $sender_info['school_id']);
	    	$ci->db->where('ref_ins_id', $sender_info['ref_inst_id']);
	    	$ci->db->where('ref_sch_id', $sender_info['ref_sch_id']);
	    	$ci->db->where('status', 1);
    	    $row = $ci->db->get($db_prefix.ADMIN_DB.'.email_sms_sender');
    	    $sender_data = $row->result_array();
    	    if (count($sender_data) > 0){
            	return $sender_data[0];
	        }else{
	            return '';
	        }
    	}
    }
```
{{< /details >}}

## fetch_bcc_email
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to fetch the BCC email address for a given school ID. It first determines the server host name and based on that, it sets the database prefix. Then, it loads the CodeIgniter database library and selects the admin_email_id from the walnut_school_master table for the given school ID. If a result is found, it returns the admin_email_id. Otherwise, it returns NULL.

### User Acceptance Criteria
```gherkin
Feature: Fetch BCC Email
Scenario: Fetch BCC Email for a School
Given a school ID
When the fetch_bcc_email function is called with the school ID
Then it should return the admin email ID for the school
```

### Refactoring
1. Extract the switch statement into a separate function to improve readability.
2. Use a configuration file to store the server host names and their corresponding database prefixes.
3. Use dependency injection to load the database library instead of using the global get_instance() function.

{{< details "source code " >}}
```php
public static function fetch_bcc_email($school_id)
    {
    	$server_host_name = $_SERVER['HTTP_HOST'];
        switch ($server_host_name) {
            case 'mgr.walnutedu.in':
                $db_prefix = '';
                break;

            case 'test.walnutedu.in':
                $db_prefix = 'test_';
                break;

            case 'dev.walnutedu.in':
                $db_prefix = 'dev_';
                break;

            case 'localhost':
                $db_prefix = 'dev_';
                break;

            default:
                $db_prefix = 'dev_';
                break;
        }

		$ci =& get_instance();
		$ci->load->database();
    	$ci->db->select('admin_email_id');
    	$ci->db->where('school_id', $school_id);
	    $query = $ci->db->get($db_prefix.ADMIN_DB.'.walnut_school_master');
        if ($query -> num_rows() > 0)
        {
            $result = $query->row();
            return $result->admin_email_id;
        }else{
            return NULL;
        }
    }
```
{{< /details >}}

## get_aws_data
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to get AWS data for a given domain. It first determines the database prefix based on the server host name. Then, it checks the CI_VERSION constant to determine if CodeIgniter is being used. If CodeIgniter is being used, it loads the database library, selects all columns from the 'aws_key_secret_master' table where the 'domain_name' column matches the given domain, and returns the result. If CodeIgniter is not being used, it executes a SQL query to select all columns from the 'aws_key_secret_master' table where the 'domain_name' column matches the given domain, and returns the result.

### User Acceptance Criteria
```gherkin
Feature: Get AWS Data
Scenario: Get AWS data for a domain
Given The server host name is 'mgr.walnutedu.in'
When I call the 'get_aws_data' function with the domain 'example.com'
Then The function should return the AWS data for the domain
```

### Refactoring
1. Extract the database prefix determination logic into a separate function.
2. Use dependency injection to pass the database object to the function instead of relying on global variables.
3. Use a query builder or ORM library to build the SQL query instead of concatenating strings.
4. Use a consistent naming convention for variables and functions.

{{< details "source code " >}}
```php
public static function get_aws_data($domain)
    {
    	$db_admin = 'wal_db_admin';
    	$server_host_name = $_SERVER['HTTP_HOST'];
        switch ($server_host_name) {
            case 'mgr.walnutedu.in':
                $db_prefix = '';
                break;

            case 'test.walnutedu.in':
                $db_prefix = 'test_';
                break;

            case 'dev.walnutedu.in':
                $db_prefix = 'dev_';
                break;

            case 'localhost':
                $db_prefix = 'dev_';
                break;

            default:
                $db_prefix = 'dev_';
                break;
        }
        if (CI_VERSION > 0)
        {
        	$ci =& get_instance();
			$ci->load->database();
	    	$ci->db->select('*');
	    	$ci->db->where('domain_name', $domain);
		    $query = $ci->db->get($db_prefix.ADMIN_DB.'.aws_key_secret_master');
	        if ($query -> num_rows() > 0)
	        {
	           return  $query->result();
	        }else{
	            return NULL;
	        }
        }else{
      		$mysqli_obj = $GLOBALS['mysqli_obj'];
    		$sql_query = "SELECT * FROM ".$db_prefix.$db_admin.".aws_key_secret_master where domain_name = '".$domain."'";
    		$ret_query = $mysqli_obj->query($sql_query);
   			$res_array[0] = $GLOBALS['mysqli_obj']->database_fetch_object($ret_query);
   			if (count($res_array) > 0){
            	return $res_array;
	        }else{
	            return NULL;
	        }
        }
    }
```
{{< /details >}}

## get_vendorname_data
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to get vendor name data from the database based on the server host name. It first determines the database prefix based on the server host name. Then, it checks the CI_VERSION constant to determine if CodeIgniter is being used. If CodeIgniter is being used, it loads the database library, selects all columns from the email_vendor_configuration table where the flag is 1, and returns the result. If CodeIgniter is not being used, it executes a SQL query using the mysqli extension and returns the result.

### Refactoring
1. Extract the logic for determining the database prefix into a separate function.
2. Use dependency injection to pass the database object instead of using global variables.
3. Use a query builder library to build the SQL query instead of concatenating strings.
4. Use a try-catch block to handle any exceptions that may occur when executing the SQL query.

{{< details "source code " >}}
```php
public static function get_vendorname_data()
    {
    	$db_admin = 'wal_db_admin';
    	$server_host_name = $_SERVER['HTTP_HOST'];
        switch ($server_host_name) {
            case 'mgr.walnutedu.in':
                $db_prefix = '';
                break;

            case 'test.walnutedu.in':
                $db_prefix = 'test_';
                break;

            case 'dev.walnutedu.in':
                $db_prefix = 'dev_';
                break;

            case 'localhost':
                $db_prefix = 'dev_';
                break;

            default:
                $db_prefix = 'dev_';
                break;
        }
		if (CI_VERSION > 0)
        {
        	$ci =& get_instance();
			$ci->load->database();
    		$ci->db->select('*');
    		$ci->db->where('flag', 1);
	    	$query = $ci->db->get($db_prefix.ADMIN_DB.'.email_vendor_configuration');
        	if ($query -> num_rows() > 0){
         	  return  $query->result();
	        }else{
	            return NULL;
	        }
		}else{
			$mysqli_obj = $GLOBALS['mysqli_obj'];
    		$sql_query = "SELECT * FROM ".$db_prefix.$db_admin.".email_vendor_configuration where flag = 1";
    		$ret_query = $mysqli_obj->query($sql_query);
    		$temp_array[0] = $GLOBALS['mysqli_obj']->database_fetch_object($ret_query);
    		if (count($temp_array) > 0){
            	return $temp_array;
	        }else{
	            return NULL;
	        }
		}
    }
```
{{< /details >}}

## Risks & Security Issues
**send_mail**: 1. The function does not handle errors or exceptions that may occur during the email sending process.
2. The function does not validate the input parameters, such as the mail IDs and sender array.
3. The function does not provide any feedback or status updates on the email sending process.
4. The function does not handle cases where the selected email vendor is not supported or the necessary vendor-specific files are not available.

**get_sender_data**: 1. The function does not handle errors or exceptions that may occur during database operations.
2. The function returns an empty string if no sender data is found, which may lead to unexpected behavior in the calling code.

**fetch_bcc_email**: 1. The function assumes that the server host name will always be one of the specified cases. If a new server host name is added, the function will default to 'dev_' as the database prefix.
2. The function does not handle any errors that may occur during the database query.

**get_aws_data**: 1. The function assumes that the 'aws_key_secret_master' table exists in the database.
2. The function does not handle errors or exceptions that may occur during database operations.
3. The function does not validate the input domain parameter.
4. The function does not provide any error messages or logging to help with debugging.

**get_vendorname_data**: 1. The function assumes that the database table name and column names are hardcoded.
2. The function does not handle errors or exceptions that may occur when executing the SQL query.
3. The function does not have any input validation or sanitization, which could lead to SQL injection vulnerabilities.

