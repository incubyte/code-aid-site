+++
categories = ["Documentation"]
title = "view_student_info.php"
+++

## File Summary

- **File Path:** application\views\student\student_management\add_student\view_student_info.php
- **LOC:** 4286
- **Last Modified:** Git logs not found
- **Number of Commits (Total / Last 6 Months / Last Month):** Git logs not found
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** Git logs not found
- **Top Contributors:** Git logs not found

{{< details "File source code " >}}
```php
<style type="text/css">
	.imp{
        color:red;
    }

	input[type="text"]:hover,input[type="email"]:hover,select:hover,input[type="checkbox"]:hover {
      border-color: #2da5da !important;
    }

    .disabledTab{
        pointer-events: none !important;
    }

    .nav-tabs>li.active>a, .nav-tabs>li.active>a:hover, .nav-tabs>li.active>a:focus{
        background: #2da5da !important;
        color: #fff !important;
        border:1px solid !important;
        border-top-left-radius: 8px !important;
        border-top-right-radius: 8px !important;
    }

    @media (min-width: 768px)
    {
        .col-sm-25
        {
            width: 20% !important;
            padding-right: 0px;
            padding-left: 0px;
        }
       .col-sm-35
        {
            width: 30% !important;
            padding-right: 30px;
            padding-left: 5px;
        }
    }
    img#loadingimg{
        display : none;
    } 
    img#loadingimg1{
        display : none;
    }
    img#loadingimg2{
        display : none;
    }
    img#loadingimg3{
        display : none;
    }
    img#loadingimg4{
        display : none;
    }
    img#loadingimg5{
        display : none;
    }
    img#loadingimg6{
        display : none;
    } 

    .label_color{
        color: #32CD32 ;
    }

    .img-responsive:hover 
    {
        -ms-transform: scale(1); /* IE 9 */
        -webkit-transform: scale(1); /* Safari 3-8 */
        transform: scale(2); 
    }

</style>
<script type="text/javascript">
    var stud_info_array = [];  //student main array
    var img_rotation = 0;

    function bootbox_alert(alert_message)
    {
        var box = bootbox.alert({ 
            size: "medium",
            buttons: { ok: { label:'<span class="glyphicon glyphicon-ok" style="font-size:11px;">', className: 'btn-success btn-xs'}},
            message: "<b>"+alert_message+"</b>"
        });
        setTimeout(function() {
            // be careful not to call box.hide() here, which will invoke jQuery's hide method
            box.modal('hide');
        }, 1500);
    }

	$(document).ready(function()
    {   
        $('#msg').fadeOut(5000, function() {
            $(this).html("");
        });
        //for API call get division
        if($('#stud_seekadmissionto').val() != '')
        {
            $("#stud_rte_no").val(0);
            $("#stud_rte_no").prop("checked",true);
            $("#online_flag").val('1');
            check_birth_date_eligi($('#stud_seekadmissionto').val(),'',true);
        }else{
            $("#stud_rte_no").prop("checked",false);
            $("#stud_rte_no").val('');
        }

        $('#b_date_icon').on("click",function(){
            $("#stud_birthday").focus();
        });

        //Other nationality
        if($("#stud_nationality").val() == 'Other')
        {
            $("#stud_othernationality").show();
            $("#stud_othernationality").attr("readonly", "true");
            $("#national_div").css('margin-top','10px');
        }else{
            $("#stud_othernationality").hide();
            $("#stud_othernationality").val('');
            $("#stud_othernationality").removeAttr("required", "true");
            $("#national_div").css('margin-top','');
        }

        $("#stud_nationality").change(function() 
        {
            $("#stud_othernationality").hide();
            $("#stud_othernationality").val('');
            $("#stud_othernationality").removeAttr("required", "true");
            $("#national_div").css('margin-top','');
            if($(this).val() == 'Other')
            {
                $("#stud_othernationality").show();
                $("#stud_othernationality").attr("required", "true");
                $("#stud_othernationality").removeAttr("readonly", "true");
                $("#national_div").css('margin-top','10px');
            }
        });

        //Other mother tongue
        if($("#stud_mothertoungue").val() == 'Other')
        {
            $("#stud_othermothertoungue").show();
            $("#stud_othermothertoungue").attr("readonly", "true");
            $("#mothertoungue_div").css('margin-top','10px');
        }else{
            $("#stud_othermothertoungue").hide();
            $("#stud_othermothertoungue").val('');
            $("#stud_othermothertoungue").removeAttr("required", "true");
            $("#mothertoungue_div").css('margin-top','');
        }

        $("#stud_mothertoungue").change(function() 
        {
            $("#stud_othermothertoungue").hide();
            $("#stud_othermothertoungue").val('');
            $("#stud_othermothertoungue").removeAttr("required", "true");
            $("#mothertoungue_div").css('margin-top','');
            if($(this).val() == 'Other')
            {
                $("#stud_othermothertoungue").show();
                $("#stud_othermothertoungue").attr("required", "true");
                $("#stud_othermothertoungue").removeAttr("readonly", "true");
                $("#mothertoungue_div").css('margin-top','10px');
            }
        });

        //Other religion
        if($("#stud_religion").val() == 'Other')
        {
            $("#stud_otherreligion").show();
            $("#stud_otherreligion").attr("readonly", "true");
            $("#rel_div").css('margin-top','10px');
        }else{
            $("#stud_otherreligion").hide();
            $("#stud_otherreligion").val('');
            $("#stud_otherreligion").removeAttr("required", "true");
            $("#rel_div").css('margin-top','');
        }

        $("#stud_religion").change(function() 
        {
            $("#stud_otherreligion").hide();
            $("#stud_otherreligion").val('');
            $("#stud_otherreligion").removeAttr("required", "true");
            $("#rel_div").css('margin-top','');

            if($(this).val() == 'Other')
            {
                $("#stud_otherreligion").show();
                $("#stud_otherreligion").attr("required", "true");
                $("#stud_otherreligion").removeAttr("readonly", "true");
                $("#rel_div").css('margin-top','10px');
            }
        });

        //Other Category
        if($("#stud_category").val() == 'Other')
        {
            $("#stud_othercategory").show();
            $("#stud_othercategory").attr("readonly", "true");
            $("#category_div").css('margin-top','10px');
        }else{
            $("#stud_othercategory").hide();
            $("#stud_othercategory").val('');
            $("#stud_othercategory").removeAttr("required", "true");
            $("#category_div").css('margin-top','');
        }

        $("#stud_category").change(function() 
        {
            $("#stud_othercategory").hide();
            $("#stud_othercategory").val('');
            $("#stud_othercategory").removeAttr("required", "true");
            $("#category_div").css('margin-top','');
            if($(this).val() == 'Other')
            {
                $("#stud_othercategory").show();
                $("#stud_othercategory").attr("required", "true");
                $("#stud_othercategory").removeAttr("readonly", "true");
                $("#category_div").css('margin-top','10px');
            }
        });

        //Other Caste
        if($("#stud_caste").val() == 'Other')
        {
            $("#stud_othercaste").show();
            $("#stud_othercaste").attr("readonly", "true");
            $("#caste_div").css('margin-top','10px');
        }else{
            $("#stud_othercaste").hide();
            $("#stud_othercaste").val('');
            $("#stud_othercaste").removeAttr("required", "true");
            $("#caste_div").css('margin-top','');
        }

        $("#stud_caste").change(function() 
        {
            $("#stud_othercaste").hide();
            $("#stud_othercaste").val('');
            $("#stud_othercaste").removeAttr("required", "true");
            $("#caste_div").css('margin-top','');
            if($(this).val() == 'Other')
            {
                $("#stud_othercaste").show();
                $("#stud_othercaste").attr("required", "true");
                $("#stud_othercaste").removeAttr("readonly", "true");
                $("#caste_div").css('margin-top','10px');
            }
        });

        //Other Subcaste
        if($("#stud_subcaste").val() == 'Other')
        {
            $("#stud_othersubcaste").show();
            $("#stud_othersubcaste").attr("readonly", "true");
            $("#subcaste_div").css('margin-top','10px');
        }else{
            $("#stud_othersubcaste").hide();
            $("#stud_othersubcaste").val('');
            $("#stud_othersubcaste").removeAttr("required", "true");
            $("#subcaste_div").css('margin-top','');
        }

        $("#stud_subcaste").change(function() 
        {
            $("#stud_othersubcaste").hide();
            $("#stud_othersubcaste").val('');
            $("#stud_othersubcaste").removeAttr("required", "true");
            $("#subcaste_div").css('margin-top','');
            if($(this).val() == 'Other')
            {
                $("#stud_othersubcaste").show();
                $("#stud_othersubcaste").attr("required", "true");
                $("#stud_othersubcaste").removeAttr("readonly", "true");
                $("#subcaste_div").css('margin-top','10px');
            }
        });

        //Father Other Degree
        if($("#fath_degree").val() == 'Other')
        {
            $("#fath_otherdegree").show();
            $("#fath_otherdegree").attr("readonly", "true");
            $("#fath_otherdegree_div").css('margin-top','10px');
        }else{
            $("#fath_otherdegree").hide();
            $("#fath_otherdegree").val('');
            $("#fath_otherdegree").removeAttr("required", "true");
            $("#fath_otherdegree_div").css('margin-top','');
        }

        $("#fath_degree").change(function() 
        {
            $("#fath_otherdegree").hide();
            $("#fath_otherdegree").val('');
            $("#fath_otherdegree").removeAttr("required", "true");
            $("#fath_otherdegree_div").css('margin-top','');
            if($(this).val() == 'Other')
            {
                $("#fath_otherdegree").show();
                $("#fath_otherdegree").attr("required", "true");
                $("#fath_otherdegree").removeAttr("readonly", "true");
                $("#fath_otherdegree_div").css('margin-top','10px');
            }
        });

        //Father Other profession
        if($("#fath_profession").val() == 'Other')
        {
            $("#fath_otherprofession").show();
            $("#fath_otherprofession").attr("readonly", "true");
            $("#father_profession_div").css('margin-top','10px');
        }else{
            $("#fath_otherprofession").hide();
            $("#fath_otherprofession").val('');
            $("#fath_otherprofession").removeAttr("required", "true");
            $("#father_profession_div").css('margin-top','');
        }

        $("#fath_profession").change(function() 
        {
            $("#fath_otherprofession").hide();
            $("#fath_otherprofession").val('');
            $("#fath_otherprofession").removeAttr("required", "true");
            $("#father_profession_div").css('margin-top','');
            if($(this).val() == 'Other')
            {
                $("#fath_otherprofession").show();
                $("#fath_otherprofession").attr("required", "true");
                $("#fath_otherprofession").removeAttr("readonly", "true");
                $("#father_profession_div").css('margin-top','10px');
            }
        });

        // Mother Other profession
        if($("#moth_profession").val() == 'Other')
        {
            $("#moth_otherprofession").show();
            $("#moth_otherprofession").attr("readonly", "true");
            $("#moth_otherprofession_div").css('margin-top','10px');
        }else{
            $("#moth_otherprofession").hide();
            $("#moth_otherprofession").val('');
            $("#moth_otherprofession").removeAttr("required", "true");
            $("#moth_otherprofession_div").css('margin-top','');
        }

        $("#moth_profession").change(function() 
        {
            $("#moth_otherprofession").hide();
            $("#moth_otherprofession").val('');
            $("#moth_otherprofession").removeAttr("required", "true");
            $("#moth_otherprofession_div").css('margin-top','');
            if($(this).val() == 'Other')
            {
                $("#moth_otherprofession").show();
                $("#moth_otherprofession").attr("required", "true");
                $("#moth_otherprofession").removeAttr("readonly", "true");
                $("#moth_otherprofession_div").css('margin-top','10px');
            }
        });

        //Mother Other Degree
        if($("#moth_degree").val() == 'Other')
        {
            $("#moth_otherdegree").show();
            $("#moth_otherdegree").attr("readonly", "true");
            $("#moth_otherdegree_div").css('margin-top','10px');
        }else{
            $("#moth_otherdegree").hide();
            $("#moth_otherdegree").val('');
            $("#moth_otherdegree").removeAttr("required", "true");
            $("#moth_otherdegree_div").css('margin-top','');
        }

        $("#moth_degree").change(function() 
        {
            $("#moth_otherdegree").hide();
            $("#moth_otherdegree").val('');
            $("#moth_otherdegree").removeAttr("required", "true");
            $("#moth_otherdegree_div").css('margin-top','');
            if($(this).val() == 'Other')
            {
                $("#moth_otherdegree").show();
                $("#moth_otherdegree").attr("required", "true");
                $("#moth_otherdegree").removeAttr("readonly", "true");
                $("#moth_otherdegree_div").css('margin-top','10px');
            }
        });

        // Guardian Other profession
        if($("#guardian_profession").val() == 'Other')
        {
            $("#guardian_profession_other").show();
            $("#guardian_profession_other").attr("readonly", "true");
            $("#guardian_otherprofession_div").css('margin-top','10px');
        }else{
            $("#guardian_profession_other").hide();
            $("#guardian_profession_other").val('');
            $("#guardian_otherprofession_div").css('margin-top','');
        }

        $("#guardian_profession").change(function() 
        {
            $("#guardian_profession_other").hide();
            $("#guardian_profession_other").val('');
            $("#guardian_otherprofession_div").css('margin-top','');
            if($(this).val() == 'Other')
            {
                $("#guardian_profession_other").show();
                $("#guardian_profession_other").removeAttr("readonly", "true");
                $("#guardian_otherprofession_div").css('margin-top','10px');
            }
        });

        $(".btnNext,.btnPrevious").hover(function(){
            $(this).css("background-color", "black");
          }, function(){
            $(this).css("background-color", "#428bca");
        });

        $('#prev_fath').click(function(){
            $('.nav-tabs > .active').prev('li').find('a').trigger('click');
        });
        
        $('#prev_moth').click(function(){
            if(($("input[name ='parent_status']:checked").val() == 'single_mother')){
                $('.nav-tabs > .active').prev('li').find('a').trigger('click');
                $('[href="#menu1"]').tab('show');
            }else{
                $('.nav-tabs > .active').prev('li').find('a').trigger('click');
            }
        });

        $('#prev_guard').click(function(){
            if(($("input[name ='parent_status']:checked").val() == 'single_mother')){
                $('.nav-tabs > .active').prev('li').find('a').trigger('click');
                $('[href="#menu3"]').tab('show');
            }else if(($("input[name ='parent_status']:checked").val() == 'single_father')){
                $('.nav-tabs > .active').prev('li').find('a').trigger('click');
                $('[href="#menu2"]').tab('show');
            }else{
                $('.nav-tabs > .active').prev('li').find('a').trigger('click');
            }
        });
        
        $('#prev_oth').click(function(){ 
            $('.nav-tabs > .active').prev('li').find('a').trigger('click');
        });

        $("select.search-select").select2();

        // Father Degree
        $("#fath_qualification").on("change",function()
        {
            if($("#fath_qualification").val() != "")
            {   
                $('#fath_degree').siblings().children().children('.select2-chosen').html("Select");
                $("#fath_otherdegree").hide();
                $("#fath_otherdegree").val('');
                $("#fath_otherdegree").removeAttr("required", "true");
                $("#fath_otherdegree_div").css('margin-top','');
                $('#fath_degree').find('option').remove();
                get_education_degrees($("#fath_qualification").val(),$('#fath_degree'));
            }
        })

        // Mother Degree
        $("#moth_qualification").on("change",function()
        {
            if($("#moth_qualification").val()!="")
            {
                $('#moth_degree').siblings().children().children('.select2-chosen').html("Select");
                $("#moth_otherdegree").hide();
                $("#moth_otherdegree").val('');
                $("#moth_otherdegree").removeAttr("required", "true");
                $("#moth_otherdegree_div").css('margin-top','');
                $('#moth_degree').find('option').remove();
                get_education_degrees($("#moth_qualification").val(),$('#moth_degree'));
            }
        })
    
        //Student Details
        $("#update_stud_details").on("submit", function (event) 
        {
            if($("#parent_both").prop("checked") == false && $("#par_single_fath").prop("checked") == false && $("#par_single_moth").prop("checked")== false) {
                alert("Please Choose Parent Status Checkbox!");
                return false;
            }   
            var parent_stat = $("input[name ='parent_status']:checked").val();
            
            if(($("input[name ='parent_status']:checked").val()== 'single_mother')){
                $('#tab_1').hide();
                $('.nav-tabs > .active').next('li').find('a').trigger('click');
                $('#menu2').hide();
            }
            if($("#stud_rte_yes").prop("checked") == false && $("#stud_rte_no").prop("checked") == false){
                alert("Please Choose RTE Student Checkbox!");
                return false;
            }
            if($("#online_flag").val() == 1)
            {
                if($("#stud_rte_no").prop("checked") == true)
                {
                    $.confirm({
                        title: '<span style="color:red" class="blink">Cautions!</span>',
                        content: '<span style="color:black;"><font size="4">RTE Student Checkbox set to "NO".Please Confirm RTE Student Checkbox!</font></span>',
                        buttons: {
                            yes: {
                                text: 'Confirm',
                                btnClass: 'btn btn-danger',
                                action: function(){
                                    $('.nav-tabs > .active').next('li').find('a').trigger('click');
                                    $('#stud_info').removeClass('active');
                                    $('#stud_info').addClass('disabled disabledTab');
                                    $('#student_concession_letter').css('visibility','hidden');
                                    $("#app_photo").removeAttr("required");
                                    $("#manage_photo").removeAttr("required");
                                }
                            },
                            cancel: {
                                text: 'CANCEL',
                                btnClass: 'btn-blue',   
                                keys: ['enter', 'shift'],
                                action: function(){
                                }
                            }
                            
                        }
                    });
                }else{
                    $('.nav-tabs > .active').next('li').find('a').trigger('click');
                    $('#stud_info').removeClass('active');
                    $('#stud_info').addClass('disabled disabledTab');
                    $('#student_concession_letter').css('visibility','');
                    $("#app_photo").attr("required", "true");
                    $("#manage_photo").attr("required", "true");
                }
            }else{
                    $('.nav-tabs > .active').next('li').find('a').trigger('click');
                    $('#stud_info').removeClass('active');
                    $('#stud_info').addClass('disabled disabledTab');
                }
            event.preventDefault();
            if(stud_info_array[0] != '')
            {
                stud_info_array[0] = '';
            }
            var temp_array = {};
            $("#update_stud_details").serializeArray().map(function(item) 
            {
                if (temp_array[item.name] ) 
                {
                    if (typeof(temp_array[item.name]) === "string" ) 
                    {
                        temp_array[item.name] = [temp_array[item.name]];
                    }
                    temp_array[item.name].push(item.value);
                } else {
                    temp_array[item.name] = item.value;
                }
            });

            stud_info_array[0] = {
                                    'stud_info' : temp_array,
                                    'formno'    : $("#formno").val(),
                                    'refno'     : $("#refno").val()
                                };
        });

        //Father Details
            $("#update_father_details").on("submit", function (event) 
            {
                if(($("input[name ='parent_status']:checked").val()== 'single_father')){
                    $('#tab_2').hide();
                    $('.nav-tabs > .active').next('li').find('a').trigger('click');
                    $('#menu3').hide();
                }
                event.preventDefault();
                if(stud_info_array[1] != '')
                {
                    stud_info_array[1] = '';
                }
                $('.nav-tabs > .active').next('li').find('a').trigger('click');
                var temp_array = {};
                $("#update_father_details").serializeArray().map(function(item) 
                {
                    if (temp_array[item.name] ) 
                    {
                        if (typeof(temp_array[item.name]) === "string" ) 
                        {
                            temp_array[item.name] = [temp_array[item.name]];
                        }
                        temp_array[item.name].push(item.value);
                    } else {
                        temp_array[item.name] = item.value;
                    }
                });
                stud_info_array[1] = {'father_info':temp_array};
            });
        //Mother Details
        $("#update_mother_details").on("submit", function (event) 
        {
            event.preventDefault();
            if(stud_info_array[2] != '')
            {
                stud_info_array[2] = '';
            }
            $('.nav-tabs > .active').next('li').find('a').trigger('click');
            var temp_array = {};
            $("#update_mother_details").serializeArray().map(function(item) 
            {
                if (temp_array[item.name] ) 
                {
                    if (typeof(temp_array[item.name]) === "string" ) 
                    {
                        temp_array[item.name] = [temp_array[item.name]];
                    }
                    temp_array[item.name].push(item.value);
                } else {
                    temp_array[item.name] = item.value;
                }
            });
            stud_info_array[2] = {'moth_info':temp_array};
        });

        //Guardian Details
        $("#update_guardian_details").on("submit", function (event) 
        {
            event.preventDefault();
            if(stud_info_array[3] != '')
            {
                stud_info_array[3] = '';
            }
            $('.nav-tabs > .active').next('li').find('a').trigger('click');
            var temp_array = {};
            $("#update_guardian_details").serializeArray().map(function(item) 
            {
                if (temp_array[item.name] ) 
                {
                    if (typeof(temp_array[item.name]) === "string" ) 
                    {
                        temp_array[item.name] = [temp_array[item.name]];
                    }
                    temp_array[item.name].push(item.value);
                } else {
                    temp_array[item.name] = item.value;
                }
            });
            stud_info_array[3] = {'gardian_info':temp_array};
        });

        //Other Details
        $("#update_other_details").on("submit", function (event) 
        {
            var stud_lms_id = $("#temp_lms_id").val();
            var selected_class_id  = $("#stud_seekadmissionto").val();
            var selected_refno     = $("#refno").val();
            var selected_academic_year = $("#academic_year").val();
            var selected_form_type = 2;

            // if (selected_class_id >= 12) 
            // {
            //     $("#birth_certificate").prop('required',false);
            //     $("#adhar_card").prop('required',true);

            // }else{
            //     $("#birth_certificate").prop('required',true);
            //     $("#adhar_card").prop('required',false);
            // }

            event.preventDefault();
            if(stud_info_array[4] != '')
            {
                stud_info_array[4] = '';
            }

            if ($("input[name='info_referral_student']:checked").val() == null || $("input[name='info_referral_student']:checked").val() == "") 
            {
                bootbox_alert("Please select Referral checkbox");
                return false;
            }

            $('.nav-tabs > .active').next('li').find('a').trigger('click');
            var temp_array = {};
            $("#update_other_details").serializeArray().map(function(item) 
            {
                if (temp_array[item.name] ) 
                {
                    if (typeof(temp_array[item.name]) === "string" ) 
                    {
                        temp_array[item.name] = [temp_array[item.name]];
                    }
                    temp_array[item.name].push(item.value);
                } else {
                    temp_array[item.name] = item.value;
                }
            });
            stud_info_array[4] = {'other_info':temp_array};

            var stud_data = JSON.stringify(stud_info_array);
            $("#json_array").val(stud_data);
            var formData = new FormData(document.getElementById("update_other_details"));

            $("#submit").css('display','none');
            $("#otherinfo_loader").css('display','');
            var controller = 'student';
            var base_url = '<?php echo site_url(); ?>'; 
            var url = base_url + '/' + controller + '/' + 'insert_stud_info' ;
            $.ajax
            ({
                'type':'POST',
                'url': url,
                'data':formData,
                'cache':false,
                'contentType': false,
                'processData': false,
                'success' : function(data)
                { 
                    if(data)
                    {
                        bootbox_alert(data);
                        $("#submit").css('display','');
                        $("#otherinfo_loader").css('display','none');
                        return false;
                    }else {
                        var controller = 'student_link';
                        var base_url = '<?php echo site_url(); ?>';
                        var url = base_url + '/' + controller + '/' + 'insert_link_data';
                        $.ajax
                        ({
                            'type':'POST',
                            'url': url,
                            'data' : {'selected_refno' : selected_refno, 'selected_class_id':selected_class_id, 'selected_form_type': selected_form_type },
                            'success' : function(data)
                            {
                                if (data == true) 
                                {
                                    var controller = 'student_lms';
                                    var base_url = '<?php echo site_url(); ?>'; 
                                    var url = base_url + '/' + controller + '/' + 'insert_dep_link_data';
                                    $.ajax
                                    ({
                                        'url' :  url,
                                        'type' : 'POST',
                                        'data' : {'lms_id' : stud_lms_id ,'refno' : selected_refno, 'class_id' : selected_class_id, 'academic_year' :selected_academic_year},
                                        'async' : false,
                                        'success': function (data) 
                                        {
                                            if (data == true) 
                                            {
                                                alert("Student Added successfully.");
                                                location.reload();
                                            } else 
                                            {
                                                if (data != null || data != '') 
                                                {
                                                    bootbox_alert("Student Added successfully");
                                                    setTimeout(function() {
                                                        window.location.href = './indexCI.php/student_lms/view_walsh_data';
                                                    }, 1000);
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                    $("#submit").css('display','');
                    $("#otherinfo_loader").css('display','none'); 
                }
            });
        });

        setInterval(function(){
            $(".blink").fadeOut(500).fadeIn(500)
        }, 1000);

    });


    // //Other Details
    // function confirm_add_student()
    // {
    //     var mother_annual_income  = $('#moth_income').val();
    //     var father_annual_income  = $('#fath_income').val();
    //     var moth_profession_array = $('#moth_profession').val();
    //     var parent_status         = $("input[name ='parent_status']:checked").val();
    //     if( $("input[name ='parent_status']:checked").val() =='both')
    //     {
    //         var controller = 'student';
    //         var base_url = '<?php echo site_url(); ?>'; 
    //         var url = base_url + '/' + controller + '/' + 'check_parent_income_eligibility' ;
    //         $.ajax
    //         ({
    //             'url' :  url,
    //             'type' : 'POST', //the way you want to send data to your URL
    //             'data' : {'mother_annual_income' : mother_annual_income, 'father_annual_income' : father_annual_income ,'moth_profession_array' :moth_profession_array, 'parent_status':parent_status},
    //             'success' : function(data)
    //             {  
    //                 if(data < 500000)
    //                 {
    //                     $.confirm({
    //                         title: '<span style="color:red" class="blink">Caution!</span>',
    //                         content: '<span style="color:black;"><font size="4">NOTE: The Parents total income is less than 5 lacs. Are you sure you want to go ahead with the admission?</font></span>',
    //                         buttons: {
    //                             yes: {
    //                                 text: 'Confirm',
    //                                 btnClass: 'btn btn-danger',
    //                                 action: function(){
    //                                     insert_student_data();
    //                                 }
    //                             },
    //                             cancel: {
    //                                 text: 'CANCEL',
    //                                 btnClass: 'btn-blue',   
    //                                 keys: ['enter', 'shift'],
    //                                 action: function(){
    //                                     $("#submit").attr("disabled", true);
    //                                 }
    //                             }
    //                         }
    //                     });
    //                 }else{
    //                     insert_student_data();
    //                 }
    //             }
    //         })
    //     }else{
    //         insert_student_data();
    //     }
    // }

    // function insert_student_data()
    // {
    //     var stud_lms_id = $("#temp_lms_id").val();
    //     var selected_class_id  = $("#stud_seekadmissionto").val();
    //     var selected_refno     = $("#refno").val();
    //     var selected_academic_year = $("#academic_year").val();
    //     var selected_form_type = 2;

    //     event.preventDefault();
    //     if(stud_info_array[4] != '')
    //     {
    //         stud_info_array[4] = '';
    //     }

    //     if ($("input[name='info_referral_student']:checked").val() == null || $("input[name='info_referral_student']:checked").val() == "") 
    //     {
    //         bootbox_alert("Please select Referral checkbox");
    //         return false;
    //     }

    //     $('.nav-tabs > .active').next('li').find('a').trigger('click');
    //     var temp_array = {};
    //     $("#update_other_details").serializeArray().map(function(item) 
    //     {
    //         if (temp_array[item.name] ) 
    //         {
    //             if (typeof(temp_array[item.name]) === "string" ) 
    //             {
    //                 temp_array[item.name] = [temp_array[item.name]];
    //             }
    //             temp_array[item.name].push(item.value);
    //         } else {
    //             temp_array[item.name] = item.value;
    //         }
    //     });
    //     stud_info_array[4] = {'other_info':temp_array};

    //     var stud_data = JSON.stringify(stud_info_array);
    //     $("#json_array").val(stud_data);
    //     var formData = new FormData(document.getElementById("update_other_details"));

    //     $("#submit").css('display','none');
    //     $("#otherinfo_loader").css('display','');
    //     var controller = 'student';
    //     var base_url = '<?php echo site_url(); ?>'; 
    //     var url = base_url + '/' + controller + '/' + 'insert_stud_info' ;
    //     $.ajax
    //     ({
    //         'type':'POST',
    //         'url': url,
    //         'data':formData,
    //         'cache':false,
    //         'contentType': false,
    //         'processData': false,
    //         'success' : function(data)
    //         { 
    //             if(data)
    //             {
    //                 bootbox_alert(data);
    //                 $("#submit").css('display','');
    //                 $("#otherinfo_loader").css('display','none');
    //                 return false;
    //             }else {
    //                 var controller = 'student_link';
    //                 var base_url = '<?php echo site_url(); ?>';
    //                 var url = base_url + '/' + controller + '/' + 'insert_link_data';
    //                 $.ajax
    //                 ({
    //                     'type':'POST',
    //                     'url': url,
    //                     'data' : {'selected_refno' : selected_refno, 'selected_class_id':selected_class_id, 'selected_form_type': selected_form_type },
    //                     'success' : function(data)
    //                     {
    //                         if (data == true) 
    //                         {
    //                             var controller = 'student_lms';
    //                             var base_url = '<?php echo site_url(); ?>'; 
    //                             var url = base_url + '/' + controller + '/' + 'insert_dep_link_data';
    //                             $.ajax
    //                             ({
    //                                 'url' :  url,
    //                                 'type' : 'POST',
    //                                 'data' : {'lms_id' : stud_lms_id ,'refno' : selected_refno, 'class_id' : selected_class_id, 'academic_year' :selected_academic_year},
    //                                 'async' : false,
    //                                 'success': function (data) 
    //                                 {
    //                                     if (data == true) 
    //                                     {
    //                                         alert("Student Added successfully.");
    //                                         location.reload();
    //                                     } else 
    //                                     {
    //                                         if (data != null || data != '') 
    //                                         {
    //                                             bootbox_alert("Student Added successfully");
    //                                             setTimeout(function() {
    //                                                 window.location.href = './indexCI.php/student_lms/view_walsh_data';
    //                                             }, 1000);
    //                                         }
    //                                     }
    //                                 }
    //                             });
    //                         }
    //                     }
    //                 });
    //             }
    //             $("#submit").css('display','');
    //             $("#otherinfo_loader").css('display','none'); 
    //         }
    //     });
    // }
    

    //Degree List
    function get_education_degrees(qualification,degrees)
    {
        var controller = 'student';
        var base_url = '<?php echo site_url(); ?>'; 
        var url = base_url + '/' + controller + '/' + 'ajax_degrees_list' ;
        $.ajax
        ({
            'url' :  url,
            'type' : 'POST', //the way you want to send data to your URL
            'data' : {'qualification' : qualification },
            'success' : function(data)
            {   
                if(data)
                {
                    degrees.html(data);
                }
            }
        });
    }

    //Division List
    function getdivisionlist(class_id)
    {
        var controller = 'student';
        var base_url = '<?php echo site_url(); ?>'; 
        var url = base_url + '/' + controller + '/' + 'ajax_division_list' ;
        $("#loadingimg1").show();
        $.ajax
        ({
            'url' :  url,
            'type' : 'POST', //the way you want to send data to your URL
            'data' : {'class_id' : class_id },
            'success' : function(data)
            {   
                if(data)
                {
                    $("#loadingimg1").hide();
                    $('#stud_division').html(data);
                    $('#stud_division').siblings().children().children('.select2-chosen').html("Select Division");
                }
            }
        });
    }

    function sel_academic_year() 
    {
        $("#refno").val('');
        $('#stud_seekadmissionto').val('');
        $('#stud_seekadmissionto').siblings().children().children('.select2-chosen').html("Select");
        if($("#online_flag").val() == 1)
        {
            check_birth_date_eligi($('#stud_seekadmissionto').val(),'',true);
        }
    }

    //Validations Start
    function validate_ref() 
    {
        var ref_no        = $("#refno").val();
        if(ref_no == "")
        {
            bootbox_alert('Please Enter Reference Number!');
            return false;
        }else{
            var controller = 'student';
            var base_url = '<?php echo site_url(); ?>'; 
            var url = base_url + '/' + controller + '/' + 'ajax_validate_ref' ;
            $("#loadingimg2").show();
            $.ajax
            ({
                'url' :  url,
                'type' : 'POST', //the way you want to send data to your URL
                'data' : {'refno' : ref_no },
                'success' : function(html)
                {
                    if (html) 
                    {
                       bootbox_alert("Reference Number already in use, please provide different number.");
                        // document.getElementById("refno").value = "";
                    }else {
                        document.getElementById("ame_no").value = ref_no;
                        document.getElementById("refno").value  = ref_no;
                    }
                    $("#loadingimg2").hide();
                }
            });
        }
    }

    function validate_form() 
    {
        var academic_year = $("#academic_year").find('option:selected').val();
        var form_no  = document.getElementById("formno").value;
        if(form_no == "")
        {
            bootbox_alert('Please Enter Form Number!');
            return false;
        }else{
            var controller = 'student';
            var base_url = '<?php echo site_url(); ?>'; 
            var url = base_url + '/' + controller + '/' + 'ajax_validate_frm' ;
            $("#loadingimg3").show();
            $.ajax
            ({
                'url' :  url,
                'type' : 'POST', //the way you want to send data to your URL
                'data' : {'form_no' : form_no, 'academic_year': academic_year},
                'success' : function(html)
                {   
                    if (html) 
                    {
                        bootbox_alert("Form Number already in use, please provide different number.");
                        document.getElementById("formno").value = "";
                    }else{
                        document.getElementById("formno").value = form_no;
                    }
                    $("#loadingimg3").hide();
                }
            });
        }    
    } 

    function validate_adhar() 
    {
        var adhar_no  = document.getElementById("stud_adharcardno").value;
        var controller = 'student';
        var base_url = '<?php echo site_url(); ?>'; 
        var url = base_url + '/' + controller + '/' + 'ajax_validate_adhar' ;
        $("#loadingimg4").show();
        $.ajax
        ({
            'url' :  url,
            'type' : 'POST', //the way you want to send data to your URL
            'data' : {'adhar_no' : adhar_no },
            'success' : function(html)
            {   
                if (html) 
                {
                    bootbox_alert("Aadhar Number already in use, please provide different number.");
                    document.getElementById("stud_adharcardno").value = "";
                }else{
                    document.getElementById("stud_adharcardno").value = adhar_no;
                }
                $("#loadingimg4").hide();
            }
        });
    }

    function validate_email(field) 
    {
        var email = field.value;
        var id = field.id;
        if(email.toLowerCase().indexOf("@walnut") > 0)
        {
            //INVALID
            bootbox_alert("Please do not enter Walnut School email addresses. Enter only personal email addresses.");
            document.getElementById(id).value = "";
            return;
        }
    }

    function validate_amnee() 
    {
        var ame_no  = document.getElementById("ame_no").value;
        if(ame_no == "")
        {
            bootbox_alert('Please Enter Amenities Number!');
            return false;
        }else{
            var controller = 'student';
            var base_url = '<?php echo site_url(); ?>'; 
            var url = base_url + '/' + controller + '/' + 'ajax_validate_amnee' ;
            $("#loadingimg5").show();
            $.ajax
            ({
                'url' :  url,
                'type' : 'POST', //the way you want to send data to your URL
                'data' : {'ame_no' : ame_no },
                'success' : function(html)
                {   
                    if (html) 
                    {
                        bootbox_alert("Amenity Number already in use, please provide different number.");
                        document.getElementById("ame_no").value = "";
                    }else{
                        document.getElementById("ame_no").value = ame_no;
                    }
                    $("#loadingimg5").hide();
                }
            });
        }    
    }

    function validate_certificate(input,imagefield)
    {
        if (input.files && input.files[0]) {
            var fileName = input.files[0];
            if (fileName.type != "image/jpeg") {
                input.value = "";
                bootbox_alert("Invalid image file, only jpeg images are supported");
                return;
            }
        }
        var reader   = new FileReader();
            reader.onload = function (e) 
            {
                $(imagefield)
                    .attr('src', e.target.result)
                   .width(150)
                   .height(100);
            };
            reader.readAsDataURL(input.files[0]);
    }
    //Validations End

    function read_url1(input,imagefield) 
    {
        if (input.files && input.files[0]) 
        {
            var fileName = input.files[0];
            if(fileName.type != "image/jpeg")
            {
               $(imagefield).attr('src', '');
               input.value  = "";
               // var photo    = $(".photoclear1");
               // photo.replaceWith( photo = photo.clone(false));
               bootbox_alert("Invalid image file, only jpeg images are supported");
               return;
            }
            var manage_letter_name = $("#hid_manage_img_name").val();
            if (manage_letter_name == fileName.name) 
            {
                $(imagefield).attr('src', '');
                input.value = "";
                bootbox_alert("Application Letter and Management Letter cannot be same!")
                return false;
            }
            var reader   = new FileReader();

            reader.onload = function (e) 
            {
                $(imagefield)
                    .attr('src', e.target.result)
                   .width(150)
                   .height(100);
            };
            reader.readAsDataURL(input.files[0]);
            $("#hid_app_img_name").val(fileName.name);
            $("#check_click_application").val("1");
        }
    }

    function read_url2(input,imagefield)
    {
        if (input.files && input.files[0]) 
        {
            var fileName = input.files[0];
            if(fileName.type != "image/jpeg")
            {
               $(imagefield).attr('src', '');
               input.value              = "";
               // var photo                = $(".photoclear2");
               // photo.replaceWith( photo = photo.clone(false));
               bootbox_alert("Invalid image file, only jpeg images are supported");
               return;
            }
            var app_letter_name = $("#hid_app_img_name").val();
            if (app_letter_name == fileName.name) 
            {
                $(imagefield).attr('src', '');
                input.value = "";
                bootbox_alert("Application Letter and Management Letter can not be same!")
                return false;
            }
            var reader = new FileReader();
            reader.onload = function (e) 
            {
                $(imagefield)
                    .attr('src', e.target.result)
                   .width(150)
                   .height(100);
            };
            reader.readAsDataURL(input.files[0]);
            $("#hid_manage_img_name").val(fileName.name);
            $("#check_click_manage").val("1");
        }
    }

    function populate_names() 
    {
        var strUsertext = document.getElementById("stud_lname").value;
        document.getElementById("fath_lname").value = strUsertext;
        document.getElementById("moth_lname").value = strUsertext;
    }

    function populate_mname() 
    {
        var strUsertext = document.getElementById("fath_fname").value;
        document.getElementById("moth_mname").value = strUsertext;
    }

    //Check Class and Division Strength
    function check_class_confirm(class_id,rte_flag,class_limit,class_name) 
    {
        $.confirm({
            title: '<span style="color:red" class="blink">Cautions!</span>',
            content: '<span style="color:black;"><font size="4">NOTE: Class strength is beyond the current configuration of Class Limit.Current Configured Class strength limit of Std '+class_name+' is set to '+class_limit+'. Please consider change in number of divisions.',
            buttons: {
                yes: {
                    text: 'Ok',
                    btnClass: 'btn btn-danger',
                    action: function(){
                        getdivisionlist(class_id);
                        get_ref_no(rte_flag);
                        get_student_shift(class_id);
                        $('#strength_flag').val(1);
                    }
                },
                cancel: {
                    text: 'CANCEL',
                    btnClass: 'btn-blue',   
                    keys: ['enter', 'shift'],
                    action: function(){
                        $("#stud_seekadmissionto").val('');
                        $('#stud_seekadmissionto').siblings().children().children('.select2-chosen').html("Select");
                        $("#stud_division").val('');
                        $('#stud_division').siblings().children().children('.select2-chosen').html("Select Division");
                        $('#sr_no').val('');
                        $('#refno').val('');
                        $("#stud_shift").val('');
                        $('#stud_shift').siblings().children().children('.select2-chosen').html("Select");
                        $('#student_shift').css('visibility','hidden');
                        $("#stud_shift").removeAttr("required", "true");
                        $('#student_last_school_name').parent().prev('div').children().children().remove();
                        $("#student_last_school_name").parent().prev('div').children().html(function (i, html) {
                            return html.replace(/&nbsp;/g, '');
                        }); 
                    }
                }
                
            }
        });
    }

    function check_division_confirm(div_limit,div_name) 
    {
        $.confirm({
            title: '<span style="color:red" class="blink">Cautions!</span>',
            content: '<span style="color:black;"><font size="4">NOTE: Division strength is beyond the current configuration of Division Limit.Current Configured Division strength limit of Division '+div_name+' is set to '+div_limit+'. Please consider change in number of divisions.</font></span>',
            buttons: {
                yes: {
                    text: 'Ok',
                    btnClass: 'btn btn-danger',
                    action: function(){
                        $("#stud_division").val('');
                        $('#stud_division').siblings().children().children('.select2-chosen').html("Select Division");  
                    }
                },
            }
        });
        // $.confirm({
        //     title: '<span style="color:red" class="blink">Cautions!</span>',
        //     content: '<span style="color:black;"><font size="4">NOTE: Division strength is beyond the current configuration of Division Limit.Current Configured Division strength limit of Division '+div_name+' is set to '+div_limit+'. Please consider change in number of divisions.</font></span>',
        //     buttons: {
        //         yes: {
        //             text: 'Ok',
        //             btnClass: 'btn btn-danger',
        //             action: function(){
        //                 // SET FLAG TO SEND EMAIL, strength is beyond the limit admission is taken in this class
        //                 // On submit of student info
        //                 $('#strength_flag').val(1);
        //             }
        //         },
        //         cancel: {
        //             text: 'CANCEL',
        //             btnClass: 'btn-blue',   
        //             keys: ['enter', 'shift'],
        //             action: function(){
        //                 $("#stud_division").val('');
        //                 $('#stud_division').siblings().children().children('.select2-chosen').html("Select Division");
        //             }
        //         }
                
        //     }
        // });
    }

    function check_birth_date_eligi(class_id,division_id,flag) 
    {
        var class_id = document.getElementById("stud_seekadmissionto").value;
        if(class_id >= 12){
            $("#stud_adharcardno").prop('required',true);
            $("#adhar_req").show();
            // $("#adhar_card").prop('required',true);
            $("#adhar_cert_req").show();
            // $("#birth_certificate").prop('required',false);
            $("#birth_cert_req").hide();
        }else{
            $("#stud_adharcardno").prop('required',false);
            $("#adhar_req").hide();  
            // $("#adhar_card").prop('required',false);
            $("#adhar_cert_req").hide();
            // $("#birth_certificate").prop('required',true);
            $("#birth_cert_req").show();
        }

        if($("#stud_birthday").val() == null || $("#stud_birthday").val() == '')
        {
           alert("Please Set Date of Birth!");
           sel_academic_year();
           $('#stud_seekadmissionto').siblings().children().children('.select2-chosen').html("Select");
           $('#stud_division').siblings().children().children('.select2-chosen').html("Select Division");
           return false;
        }else{
            check_eligibility(division_id,flag);
        }
    }
     

    function check_strength(class_id,division_id,flag) 
    {
        if($("#stud_rte_yes").prop("checked") == false && $("#stud_rte_no").prop("checked") == false)
        {
           alert("Please Choose RTE Student Checkbox!");
           $('#stud_seekadmissionto').siblings().children().children('.select2-chosen').html("Select");
           $('#stud_division').siblings().children().children('.select2-chosen').html("Select Division");
           $('#student_concession_letter').css('visibility','hidden');
           $("#app_photo").removeAttr("required");
           $("#manage_photo").removeAttr("required");
           return false;
        }
        $('#student_last_school_name').parent().prev('div').children().children().remove();
        $("#student_last_school_name").parent().prev('div').children().html(function (i, html) {
            return html.replace(/&nbsp;/g, '');
        }); 
        if(class_id > 12)
        {
            $("#student_last_school_name").attr("required", "true");
            $('#student_last_school_name').parent().prev('div').children().append('&nbsp;<span class="imp">*</span>');
        }else{
            $("#student_last_school_name").removeAttr("required", "true");
        } 
        var rte_flag = 0;
        if($("#stud_rte_yes").is(':checked'))
        {
                rte_flag = 1;
        }
        $('#strength_flag').val(0);
        var academic_year = $("#academic_year").find('option:selected').val();
        if (class_id == '') 
        {
            var class_id = document.getElementById("stud_seekadmissionto").value;
            if(class_id > 12)
            {
                $("#student_last_school_name").attr("required", "true");
                $('#student_last_school_name').parent().prev('div').children().append('&nbsp;<span class="imp">*</span>');
            }else{
                $("#student_last_school_name").removeAttr("required", "true");
            } 
        }
        var controller = 'student';
        var base_url = '<?php echo site_url(); ?>'; 
        var url = base_url + '/' + controller + '/' + 'ajax_check_student_strength' ;
        $.ajax
        ({
            'url' :  url,
            'type' : 'POST', //the way you want to send data to your URL
            'data' : {'class_id' : class_id,'division_id' : division_id, 'academic_year': academic_year},
            success: function(response_text)
            {
                var response_data = response_text.split("~");
                if (response_data[0] == '-1') 
                {
                    check_class_confirm(class_id,rte_flag,response_data[1],response_data[2]);
                    $('#batch_time').val(response_data[3]);
                } else if (response_data[0] == '-2') 
                {
                    check_division_confirm(response_data[1],response_data[2]);
                    $('#batch_time').val(response_data[3]);
                }else{
                   $('#batch_time').val(response_text);
                }
                if (response_data[0] != '-1' && flag)
                {
                    getdivisionlist(class_id);
                    get_ref_no(rte_flag);
                    get_student_shift(class_id);
                }
                change_drop_bus(0);
            }
        });
    }

    //Auto generated Refno
    function get_ref_no(rte_flag)
    {
        var class_id = document.getElementById("stud_seekadmissionto").value;
        var year = $("#academic_year").find('option:selected').val();

        var controller = 'student';
        var base_url = '<?php echo site_url(); ?>'; 
        var url = base_url + '/' + controller + '/' + 'fetch_next_refno'+'/'+rte_flag+'/'+class_id+'/'+year;
        $.ajax
        ({
            'url' :  url,
            'type' : 'POST', //the way you want to send data to your URL
            'data' : {},
            success: function(response_text)
            {
                if (response_text) 
                {
                    var split_data = response_text.split('~');
                    $('#sr_no').val(split_data[0]);
                    $('#refno').val(split_data[1]);
                    $('#formno').val(split_data[1]);
                    validate_ref();
                }else{
                    $('#refno').val('');
                    bootbox_alert("No data found!");
                }
            }
        });
    }

    //Check student disability 
    function check_disability(disabilty_val)
    {
        if (disabilty_val == 'yes') 
        {
            $("#info_disability").show();
            $("#info_disability_div").css('margin-top','10px');
        }else{
            $("#info_disability").hide();
            $("#info_disability").val('');
            $("#info_disability_div").css('margin-top','');
        }
    }

    //Check student sis bro refno
    function check_brosis_refno(brosis_val)
    {
        if (brosis_val == '1') 
        {
            $("#info_brosisrefno").show();
            $("#info_brosisrefno_div").css('margin-top','10px');
        }else{
            $("#info_brosisrefno").hide();
            $("#info_brosisrefno").val('');
            $("#info_brosisrefno_div").css('margin-top','');
        }
    }

    //Check student existing refno
    function check_exis_refno(exis_refno)
    {
        if (exis_refno == 'yes') 
        {
            $("#exis_refnolabel").show();
            $("#exis_refnolabel_div").css('margin-top','10px');
        }else{
            $("#exis_refnolabel").hide();
            $("#exis_refnolabel").val('');
            $("#exis_refnolabel_div").css('margin-top','');
        }
    }

    //Check student disability 
    function check_parent_status(status_val)
    {
        if (status_val != 'both') 
        {
            $("#info_parent_reason").show();
            $("#parent_reason").show();
            $("#reason_label").show();
            $("#info_divorsed_div").show(); 
            $("#parent_reason").attr("required", "true"); 
            $("#s4").show();        
        }else{
            $("#info_parent_reason").hide();
            $("#parent_reason").hide();
            $("#reason_label").hide();
            $("#info_divorsed_div").hide();    
        }
    }

    function check_allergies(allergies_val)
    {
        if (allergies_val == 'yes') 
        {
            $("#allergies").show();
            $("#info_allergies_div").css('margin-top','10px');
        }else{
            $("#allergies").hide();
            $("#allergies").val('');
            $("#info_allergies_div").css('margin-top','');
        }
    }

    function get_student_shift(class_id) 
    {
        if(class_id < 12)
        {
            var controller = 'student';
            var base_url = '<?php echo site_url(); ?>'; 
            var url = base_url + '/' + controller + '/' + 'ajax_shift_data';
            $.ajax
            ({
                'url' :  url,
                'type' : 'POST', //the way you want to send data to your URL
                'data' : {},
                success: function(response_text)
                {
                    if (response_text) 
                    {
                        $('#student_shift').css('visibility','');
                        $("#stud_shift").attr("required", "true");
                        $('#stud_shift').html(response_text);
                        $('#stud_shift').siblings().children().children('.select2-chosen').html("Select");
                    }else{
                        bootbox_alert("No data found!");
                    }
                }
            });
        }else{
            $('#student_shift').css('visibility','hidden');
            $("#stud_shift").removeAttr("required", "true");
            $('#stud_shift').siblings().children().children('.select2-chosen').html("Select");
            $('#stud_shift').val('');
        }
    }
    function admission_status_table()
    {
        var year = $("#academic_year").find('option:selected').val();
        window.open("<?php echo base_url();?>indexCI.php/student_report/admission_status?academic_year="+year+"");
    }

    function verify_walsh_lead()
    {
        var lms_id = $("#lms_id").val();
        window.open("<?php echo base_url();?>indexCI.php/student_lms/view_walsh_data?lms_id="+lms_id+"");
    }

    function check_rte(rte_status){
        if(rte_status == 'rte_yes'){
            if($("#stud_rte_yes").is(':checked'))
            {
                $("#stud_rte_yes").prop('checked', true);
                $("#stud_rte_no").prop('checked', false);
                $("#stud_rte").val(1);
                $('#student_concession_letter').css('visibility','');
                $("#app_photo").attr("required", "true");
                $("#manage_photo").attr("required", "true");
            }
        }
        if(rte_status == 'rte_no'){    
            if($("#stud_rte_no").is(':checked')) 
            {
                $("#stud_rte_no").prop('checked', true);
                $("#stud_rte_yes").prop('checked', false);
                $("#stud_rte").val(0);
                $('#student_concession_letter').css('visibility','hidden');
                $("#app_photo").removeAttr("required");
                $("#manage_photo").removeAttr("required");
            }
        }    
        sel_academic_year();
    }

    function change_drop_bus(flag)
    {
        $('#drop_bus').siblings().children().children('.select2-chosen').html("Select");
        var class_id        = $('#stud_seekadmissionto').val();
        var division        = $('#stud_division').val();
        var batch_time      = $("#batch_time").val();
        var controller      = 'student';
        var base_url        = '<?php echo site_url(); ?>'; 
        var url             = base_url + '/' + controller + '/' + 'ajax_drop_bus_no_list' ;
        $.ajax
        ({
            'url' :  url,
            'type' : 'POST', //the way you want to send data to your URL
            'data' : {'flag' : flag,'class_id':class_id,'division':division,'batch_time':batch_time },
            'success' : function(data)
            {   
                if(data)
                {
                    $("#drop_bus").html(data); 
                }
            }
        });
    }

    function special_name()
    {
        if($("#special_case").prop('checked') == true)
        {
            $("#stud_lname").removeAttr('required', true);
            $("#fath_lname").removeAttr('required', true); 
            $("#moth_lname").removeAttr('required', true);   
            $("#s1").hide();
            $("#s2").hide();
            $("#s3").hide();
        }
        else
        {
            $("#stud_lname").attr('required', true);
            $("#fath_lname").attr('required', true);
            $("#moth_lname").attr('required', true);
            $("#s1").show();
            $("#s2").show();
            $("#s3").show();
        }
    }
    /*  Method for eligibility check AJAX*/ 
    function check_eligibility(division_id,flag)
    {
        var selected_bday = $('#stud_birthday').val();
        var todays_Date   = new Date().toLocaleDateString('es-CL');
        if(selected_bday  == todays_Date){
            alert("Please Set Valid Date ");
            $('#stud_birthday').val('');
        }
        var class_id = $('#stud_seekadmissionto').val();
        if (class_id == 8 || class_id == 9 || class_id == 10 || class_id == 11 ||class_id == 12 ) 
        {
            var selected_bday = $('#stud_birthday').val();
            var year = $("#academic_year").find('option:selected').val();
            var ref_no        = $('#refno').val();

            var controller = 'student';
            var base_url = '<?php echo site_url(); ?>'; 
            var url = base_url + '/' + controller + '/' + 'check_birthday_eligibility' ;

            $.ajax
            ({
                'url' :  url,
                'type' : 'POST', //the way you want to send data to your URL
                'data' : {'selected_bday' : selected_bday, 'class_id':class_id, 'year': year, 'ref_no' :ref_no },
                'success' : function(data)
                {   
                    if(data)
                    {
                        bootbox.alert({
                            size: "medium",
                            message: data,
                        })
                        sel_academic_year();
                        $('#stud_seekadmissionto').siblings().children().children('.select2-chosen').html("Select");
                        $('#stud_division').siblings().children().children('.select2-chosen').html("Select Division");
                        $('#strength_flag').val(0);
                    }else if(data == '' || data == null){
                        check_strength(class_id,division_id,flag);
                    }
                }
             });
        }else{
            check_strength(class_id,division_id,flag);
        }  
    }

    //Check student referral refno
    function check_referral_refno(exis_refno)
    {
        if (exis_refno == 'yes') 
        {
            $("#referral_student").show();
            $("#stud_referral_info").show();
            $(".referral_student_school").show();
            $("#referral_student").attr("required", "true");
            $("#referral_student_school").attr("required", "true");
            $("#ref_refnolabel_div").css('margin-top','10px');
        }else{
            $("#referral_student").hide();
            $("#stud_referral_info").hide();
            $(".referral_student_school").hide();
            $("#referral_student").removeAttr("required");
            $("#referral_student_school").removeAttr("required");
            $(".referral_student_school").attr("checked", false);
            $("#referral_student").val('');
            $("#ref_refnolabel_div").css('margin-top','');
        }
    }

    function refno_field() 
    {
        $('#referral_student').val('');
        $("#stud_referral_info").hide();
    }

    function validated_refno() 
    {
        var refno = $('#referral_student').val();
        if(refno == "")
        {
            bootbox_alert('Please Enter Referral Ref no.');
            return false;
        }

        if ($("input[name='referral_student_school']:checked").val() == null || $("input[name='referral_student_school']:checked").val() == "") 
        {
            bootbox_alert("Please select Referral School Name checkbox");
            $('#referral_student').val('');
            return false;
        }

        var school_id = $("input[name='referral_student_school']:checked").val();
        var controller = 'student';
        var base_url = '<?php echo site_url(); ?>'; 
        var url = base_url + '/' + controller + '/' + 'validate_refno' ;
        $.ajax
        ({
            'url' :  url,
            'type' : 'POST', //the way you want to send data to your URL
            'data' : {'refno' : refno,'school_id':school_id},
            'success' : function(data)
            {   
                if(data != 1)
                {
                    bootbox_alert(data);
                    $('#referral_student').val('');
                    $("#stud_referral_info").hide();
                    return false;
                }else{
                    $("#stud_referral_info").show();
                }
            }
        });

    }

    function stud_referral_details() 
    {
        var refno = $('#referral_student').val();
        if(refno == "")
        {
            bootbox_alert('Please Enter Referral Ref no.');
            return false;
        }

        if ($("input[name='referral_student_school']:checked").val() == null || $("input[name='referral_student_school']:checked").val() == "") 
        {
            bootbox_alert("Please select Referral School Name checkbox");
            return false;
        }

        var school_id = $("input[name='referral_student_school']:checked").val();
        var controller = 'student';
        var base_url = '<?php echo site_url(); ?>'; 
        var url = base_url + '/' + controller + '/' + 'fetch_referral_details' ;
        $.ajax
        ({
            'url' :  url,
            'type' : 'POST', //the way you want to send data to your URL
            'data' : {'refno' : refno,'school_id':school_id},
            'success' : function(data)
            {   
                if(data)
                {
                    $("#stud_referral_data").modal("show");
                    $("#ref_stud").html(data);
                }else{
                    $("#stud_referral_data").modal("hide");
                    $("#ref_stud").html(data);
                }
            }
        });
    }

    //for not manadatory annual income field for Housewife 
    function check_moth_prof()
    {
        if($("#moth_profession").val() == 'HouseWife'){
            $("#moth_income").prop('required',false);
            $("#moth_incp").hide();
        }else{
            $("#moth_income").prop('required',true);
            $("#moth_incp").show();
        }

        if($("#moth_profession").val() == 'HouseWife'){
            $("#moth_company").prop('required',false);
            $("#moth_compn").hide();
        }else{
            $("#moth_company").prop('required',true);
            $("#moth_compn").show();
        }

        if($("#moth_profession").val() == 'HouseWife'){
            $("#moth_designation").prop('required',false);
            $("#moth_desg").hide();
        }else{
            $("#moth_designation").prop('required',true);
            $("#moth_desg").show();
        }

        if($("#moth_profession").val() == 'HouseWife'){
            $("#moth_officeaddress").prop('required',false);
            $("#moth_offadd").hide();
        }else{
            $("#moth_officeaddress").prop('required',true);
            $("#moth_offadd").show();
        }

        if($("#moth_profession").val() == 'HouseWife'){
            $("#moth_officeno").prop('required',false);
            $("#moth_offcontact").hide();
        }else{
            $("#moth_officeno").prop('required',true);
            $("#moth_offcontact").show();
        }

        if($("#moth_profession").val() == 'HouseWife'){
            $("#moth_officeno").prop('required',false);
            $("#moth_offcontact").hide();
        }else{
            $("#moth_officeno").prop('required',true);
            $("#moth_offcontact").show();
        }
    }

    function verify_mobile_no(id)
    {
        var temp_father_mob = $("#fath_mobile").val();
        var temp_mother_mob = $("#moth_mobile").val();
        if (temp_father_mob == temp_mother_mob) 
        {
            if (id == 'fath_mobile') 
            {
                bootbox_alert("Father and Mother mobile no. can not be same");
                $("#fath_mobile").val('');
            }else{ 
                bootbox_alert("Father and Mother mobile no. can not be same");
                $("#moth_mobile").val('');
            }
        }
    }

    function upload_certificate(input,imagefield)
    {
        $(input).trigger('click');
        $(input).change(function() 
        {

            if (input.files && input.files[0]) 
            {
                var fileName = input.files[0];
                if (fileName.type != "image/jpeg" && fileName.type != "image/jpg" && fileName.type != "image/png") 
                {
                    input.value = "";
                    bootbox_alert("Invalid image file, only jpeg,jpg and png images are supported");
                    return;
                }
            }
            var reader   = new FileReader();
            reader.onload = function (e) 
            {
                if (input.id == 'stud_id_photo') 
                {
                    $(imagefield)
                    .attr('src', e.target.result)
                   .width(100)
                   .height(100);
                }else{
                    $(imagefield)
                    .attr('src', e.target.result)
                   .width(150)
                   .height(100);
                }
            };
            reader.readAsDataURL(input.files[0]);
        });
    }

    function rotate_photo(id)
    {
        img_rotation += 90;
        id.style.transform = 'rotate('+img_rotation+'deg)';
    }
</script>
<div id="add_stud" class="container-fluid bg-grey">
    <span style="float: left;color:black;"><h4><b><i class="fa fa-user-md"></i> <?php echo $page_title; ?></b></h4></span>
    <span style="float: right;color:black;"><h4><b><i class="fa fa-calendar"></i> <?php echo $page_date; ?></b></h4></span>
    <br>
    <hr></hr>
        <?php
            $checked_both = '';
            $disabled = '';
            if($stud_info_array[0] ->parent_status == 'both'){
                $checked_both = 'checked';
                $disabled = 'disabled';
            }
            $checked_father = '';     
            if($stud_info_array[0] ->parent_status == 'single_father'){
                $checked_father = 'checked';
                $disabled = 'disabled';
            }
            $checked_mother = '';
            if($stud_info_array[0] ->parent_status == 'single_mother'){
                $checked_mother = 'checked';
                $disabled = 'disabled';
            }
        ?>
    <!-- Student Info Tab START -->
    <ul class="nav nav-tabs">
        <li id="stud_info" class="active"><a data-toggle="tab" href="#menu1">Step 1 : Student Details</a></li>
        <li id="tab_1" class="disabled disabledTab"><a data-toggle="tab" href="#menu2">Step 2 : Father's Details</a></li>
        <li id="tab_2" class="disabled disabledTab"><a data-toggle="tab" href="#menu3">Step 3 : Mother's Details</a></li>
        <li id="tab_3" class="disabled disabledTab"><a data-toggle="tab" href="#menu4">Step 4 : Guardian's Details</a></li>
        <li id="tab_4" class="disabled disabledTab"><a data-toggle="tab" href="#menu5">Step 5 : Other Details</a></li>
        <!-- <li id="tab_5" class="disabled disabledTab"><a data-toggle="tab" href="#menu6">Step 6 : Documents</a></li> -->
    </ul>
    <!-- Student Info Tab END -->
    <div class="tab-content">
        <!-- Student Details START-->
    	<div id="menu1" class="tab-pane fade in active" style="border:1px solid">
            <form id="update_stud_details" name="update_stud_details" method="POST">
                <input type="hidden" name="strength_flag" id="strength_flag">
                <input type="hidden" name="sr_no" id="sr_no">
                <input type="hidden" name="batch_time" id="batch_time">
                <input type="hidden" name="online_flag" id="online_flag" value ="0">
                <input type="hidden" id="hid_app_img_name" name="hid_app_img_name" value='' />
                <input type="hidden" id="hid_manage_img_name" name="hid_manage_img_name" value='' />
                <input type="hidden" id="lms_id" name="lms_id" value='<?php echo $stud_temp_data->lms_id ?>' />
                <div class="row">
                    <div>
                        <?php
                        if($this->session->flashdata('error_msg') != NULL) {
                        ?>
                            <script type="text/javascript">
                                alert("<?php echo $this->session->flashdata('error_msg'); ?>");
                            </script>
                        <?php
                        }
                        ?>
                    </div>
                	<!-- School details start -->
                    <div class="col-md-6">
                        <div class="row text-center" style="margin-top: -0.6%">
                            <div class="col-sm-5"><h3 class="text-left">School Details</h3>
                                <hr style="margin-top: 10px"></hr>
                            </div>
                            <div class="col-sm-8">&nbsp;</div>
                        </div>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                            	<label>Student Academic Year:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                        		<!-- <select required class="form-control search-select" id="academic_year" name="academic_year" onchange ="sel_academic_year();">
                            		<option value="">Select Academic Year</option>
                                    <?php
                                    $current_selected = 'selected';
                                    if ($admission_startup_status) 
                                    { 
                                        $current_selected = '';
                                        ?>
                                        <option  selected value="<?php echo $next_academic_year?>"><?php echo $next_academic_year;?></option>
                                    <?php
                                    }
                                    ?>
                                    <option <?php echo $current_selected;?> value="<?php echo $academic_year;?>"><?php echo $academic_year;?></option>
                        		</select> -->
                                <select required class="form-control search-select" id="academic_year" name="academic_year">
                                    <option value="">Select Academic Year</option>
                                    <?php

                                    // $current_selected = 'selected';
                                    if ($admission_startup_status) 
                                    { 
                                        if ($sel_academic_year == $next_academic_year) 
                                        {
                                            $next_selected = 'selected';
                                        }
                                        ?>
                                        <option  <?php echo $next_selected?> value="<?php echo $next_academic_year?>"><?php echo $next_academic_year;?></option>
                                    <?php
                                    }
                                        if ($sel_academic_year == $academic_year) 
                                        {
                                            $current_selected = 'selected';
                                        }
                                    ?>
                                    <option <?php echo $current_selected;?> value="<?php echo $academic_year;?>"><?php echo $academic_year;?></option>
                                </select>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>RTE student:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4 text-left">
                                <input type="checkbox" id="stud_rte_yes" name="stud_rte_yes" onChange="check_rte('rte_yes')" > &nbsp;&nbsp;Yes &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </input>
                                <input type="checkbox" id="stud_rte_no" name="stud_rte_no" onChange="check_rte('rte_no')" > No  </input>
                                <input type="hidden" id="stud_rte" name="stud_rte"/>
                            </div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <?php
                                if (isset($stud_temp_data)) 
                                {
                                ?>
                                    <label class="label_color">Seeking Admission To:&nbsp;<span class="imp">*</span></label>
                                <?php } else{ ?>
                                    <label>Seeking Admission To:&nbsp;<span class="imp">*</span></label>
                                <?php } ?>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select required class="form-control search-select" name="stud_seekadmissionto" id="stud_seekadmissionto" onchange="check_birth_date_eligi(this.value,'',true);">
                                    <option value="">Select</option>
                                    <?php
                                    if ($class_rows != NULL) 
                                    {
                                        foreach ($class_rows as $row_class) 
                                        {
                                            $class_selected = '';
                                            if ($stud_temp_data->admission_to == $row_class -> class_id) 
                                            {
                                                $class_selected = 'selected';
                                            }
                                            if (!in_array($row_class -> class_id, array(20,21,22)))
                                            {
                                            ?>
                                                <option <?php echo $class_selected;?> value="<?php echo $row_class -> class_id;  ?>"><?php echo $row_class ->class_name;?></option>
                                            <?php
                                            }
                                        }
                                    }
                                    ?> 
                                </select>       
                            </div>
                        	<div class="col-sm-25 col-sm-2 text-left">
                            	<label>Reference Number:&nbsp;<span class="imp">*</span></label>
                                <img id="loadingimg2" src="./images/loading.gif"/>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                            	<input type="text" class="form-control validate[required,custom[onlyLetterNumber3]]" name="refno" id="refno"  maxlength="10" placeholder="Ref No" required readonly="readonly">
                           	</div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Form Number:&nbsp;<span class="imp">*</span></label>
                                <img id="loadingimg3" src="./images/loading.gif" />
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="formno" name="formno" type="text" placeholder="Form Number"  class="form-control validate[required,custom[onlyLetterNumber3]]" onblur="validate_form();"  required />
                            </div>  
                        	<div class="col-sm-25 col-sm-2 text-left">
                                <?php
                                if (isset($stud_temp_data)) 
                                {
                                ?>
                                    <label class="label_color">Division:&nbsp;<span class="imp">*</span></label>
                                <?php } else{ ?>
                                    <label>Division:&nbsp;<span class="imp">*</span></label>
                                <?php } ?>
                            	<img id="loadingimg1" src="./images/loading.gif"  /> 
                            </div>
                            <div class="col-sm-35 col-sm-4">
                        		<select required class="form-control search-select" id="stud_division" name="stud_division" onchange="check_strength('',this.value,false)">
                            		<option value="">Select Division</option>
                                    <?php
                                    if ($division_rows != NULL && $division_rows -> num_rows() > 0) 
                                    {
                                        foreach ($division_rows->result() as $row_div) 
                                        {
                                            echo "<option value=" . $row_div -> division_id . ">" . $row_div -> division_name . "</option>";
                                        }
                                    }
                                    ?>
                        		</select>
                            </div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Status:&nbsp;<span class="imp">*</span></label>
                                <img id="loadingimg3" src="./images/loading.gif" />
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <!-- <select required class="form-control search-select" id="status" name="status">
                                    <option value="" selected >Select status</option>
                                    <?php 
                                    if ($admission_startup_status) 
                                    { 
                                    ?>
                                        <option value="1"<?php echo isset($student_api_data['student_status']) ? ($student_api_data['student_status'] == "new-student") ? "selected=selected" : "" : ""; ?>>New student</option>
                                    <?php 
                                    } 
                                    ?>
                                    <option value="2"<?php echo isset($student_api_data['student_status']) ? ($student_api_data['student_status'] == "current-student") ? "selected=selected" : "" : ""; ?>>Current student</option>
                                </select> -->
                                <select required class="form-control search-select" id="status" name="status">
                                    <option value="" selected >Select status</option>
                                    <?php 
                                    if ($admission_startup_status) 
                                    { 
                                        if ($sel_academic_year == $next_academic_year) 
                                        {
                                            $new_selected = 'selected';
                                        }
                                    ?>
                                        <option value="1"<?php echo $new_selected; ?>>New student</option>
                                    <?php 
                                    } 
                                        if ($sel_academic_year == $academic_year) 
                                        {
                                            $current_sta_selected = 'selected';
                                        }
                                    ?>
                                    <option value="2"<?php echo $current_sta_selected; ?>>Current student</option>
                                </select>
                            </div>  
				       		<div class="col-sm-25 col-sm-2 text-left">
                                <label>Roll No.:&nbsp;</label>
				            </div>
				            <div class="col-sm-35 col-sm-4">
				               <input  type="text"  id="roll_no" name="roll_no" placeholder="Roll No." class="form-control validate[custom[onlyNumberSp]]" maxlength="10" pattern="\d*" />
				           	</div>
        				</div>
                        <br>
                        <div class="row">  
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Last School Attended:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input type="text" class="form-control" id="student_last_school_name" name="student_last_school_name" value="<?php echo isset($stud_temp_data->student_last_school_name) ? $stud_temp_data->student_last_school_name : NULL; ?>">
                            </div>
                            <div id='student_shift' style="visibility: hidden">
                                <div class="col-sm-25 col-sm-2 text-left">
                                    <?php
                                    if (isset($stud_temp_data)) 
                                    {
                                    ?>
                                        <label class="label_color">KG Shift for 1st Standard:&nbsp;<span class="imp">*</span></label>
                                    <?php } else{ ?>
                                        <label>KG Shift for 1st Standard:&nbsp;<span class="imp">*</span></label>
                                    <?php } ?>
                                </div>
                                <div class="col-sm-35 col-sm-4">
                                    <select id="stud_shift" name="stud_shift" class="form-control search-select">
                                        <option value="">Select</option>
                                    </select>
                                </div>
                            </div>  
                        </div>
                        
                    </div>
                    <!-- School details end -->
                    <!-- Student details start -->
                    <div class="col-md-6">
						<div class="row text-center" style="margin-top: -0.6%">
				            <div class="col-sm-3">
				                <h3 class="text-left">Student Details</h3>
				                <hr style="margin-top: 10px"></hr>
				            </div>
                            <div class="col-sm-1">&nbsp;</div>
                            <div class="col-sm-3">
                                <input style="margin-top: 10px" type="button" id="status_btn" name="status_btn" class="btn btn-primary" value="Admission Status Table" onclick="admission_status_table();">
                            </div>
                            <div class="col-sm-1">&nbsp;</div>
                            <div class="col-sm-3">
                                <input style="margin-top: 10px" type="button" id="lead_btn" name="lead_btn" class="btn btn-primary" value="Verify WALSH Lead" onclick="verify_walsh_lead();">
                            </div>
				       	</div>
				       	<div class="row">
				       		<div class="col-sm-25 col-sm-2 text-left">
				                <label>First Name:&nbsp;<span class="imp">*</span></label>
				            </div>
				            <div class="col-sm-35 col-sm-4">
				               <input id="stud_fname" name="stud_fname" type="text" placeholder="Firstname" class="form-control validate[required]"  value="<?php echo isset($stud_temp_data->stud_f_name) ? $stud_temp_data->stud_f_name : NULL; ?>" maxlength="25" pattern="[A-Za-z_ ]{1,20}" required>
				           	</div>
				           	<div class="col-sm-25 col-sm-2 text-left">
				                <label>Last Name:&nbsp;<span id="s1" style="color: red">*</span></label>
				            </div>
				            <div class="col-sm-35 col-sm-4">
				            	<input id="stud_lname" name="stud_lname" type="text" placeholder="Lastname" class="form-control validate[required] input-medium" value="<?php echo isset($stud_temp_data->stud_l_name) ? $stud_temp_data->stud_l_name : NULL; ?>" onblur="populate_names();" maxlength="25" pattern="[A-Za-z_]{1,20}" required>
				           	</div>
				        </div>
				        <br>
				        <div class="row">
				       		<div class="col-sm-25 col-sm-2 text-left">
				                <label>Aadhaar Card No:&nbsp;<span id="adhar_req" style="color: red">*</span></label>
				                <img id="loadingimg4" src="./images/loading.gif"/>
				            </div>
				            <div class="col-sm-35 col-sm-4">
				            	<input  id="stud_adharcardno" name="stud_adharcardno" type="text" placeholder="Aadhaar Card No" class="form-control validate[custom[onlyNumberSp,minSize[12]]]" value="<?php echo isset($stud_temp_data->adhar_card_no) ? $stud_temp_data->adhar_card_no : NULL; ?>" maxlength="12" pattern="\d*" onchange ="validate_adhar();"/>
				           	</div>
				           	<div class="col-sm-25 col-sm-2 text-left">
				                <label>Gender:&nbsp;<span class="imp">*</span></label>
				            </div>
				            <div class="col-sm-35 col-sm-4">
                                <select required  class="form-control search-select" id="stud_gender" name="stud_gender">
                                    <option value="" selected>Select</option>
                                    <?php 
                                        foreach ($gender as $key => $val_gender) 
                                        {
                                            $gender_selected = '';
                                            if (isset($stud_temp_data->gender) && strtolower($stud_temp_data->gender) == strtolower($key)) 
                                            {
                                                $gender_selected = 'selected';
                                            }
                                            ?>
                                            <option <?php echo $gender_selected;?> value="<?php echo $key;?>"><?php echo $val_gender;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>
				           	</div>
				        </div>
				        <br>
				        <div class="row">
				       		<div class="col-sm-25 col-sm-2 text-left">
				                <label>Nationality:&nbsp;<span class="imp">*</span></label>
				            </div>
				            <div class="col-sm-35 col-sm-4">
                                <select required  class="form-control search-select" id="stud_nationality" name="stud_nationality">
                                    <option value="" selected>Select</option>
                                    <?php 
                                        foreach ($nationality as $key => $national_val) 
                                        {
                                            $nationality_selected = '';
                                            if (isset($stud_temp_data->nationality) && strtolower($stud_temp_data->nationality) == strtolower($key))
                                            {
                                               $nationality_selected = 'selected'; 
                                            }
                                            ?>
                                            <option <?php echo $nationality_selected;?> value="<?php echo $key;?>"><?php echo $national_val;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>
                                <div id="national_div">
                                    <input type="text" class="form-control validate[custom[onlyLetterSp]]" id="stud_othernationality" name="stud_othernationality" placeholder="If other, please specify" value="<?php echo isset($stud_temp_data->other_nationality) ? $stud_temp_data->other_nationality : NULL; ?>" maxlength="15">
                                </div>    
                            </div>
				           	<div class="col-sm-25 col-sm-2 text-left">
				                <label>Mother Tongue:&nbsp;<span class="imp">*</span></label>
				            </div>
				            <div class="col-sm-35 col-sm-4">
                                <select required  class="form-control search-select" id="stud_mothertoungue" name="stud_mothertoungue">
                                    <option value="" selected>Select</option>
                                    <?php 
                                        foreach ($mothertoungue_array as $key => $mothertoungue_val) 
                                        {
                                            $mothertounge_selected = '';
                                            if (isset($stud_temp_data->mother_tongue) && strtolower($stud_temp_data->mother_tongue) == strtolower($key))
                                            {
                                               $mothertounge_selected = 'selected'; 
                                            }
                                            ?>
                                            <option <?php echo $mothertounge_selected;?> value="<?php echo $key;?>"><?php echo $mothertoungue_val;?></option>
                                            <?php

                                        }
                                    ?>                        
                                </select>
                                <div id="mothertoungue_div">
                                    <input type="text" class="form-control validate[custom[onlyLetterSp]]" id="stud_othermothertoungue" name="stud_othermothertoungue" value="<?php echo isset($stud_temp_data->other_mother_tongue) ? $stud_temp_data->other_mother_tongue : NULL; ?>" placeholder="If other, please specify" maxlength="15">
                                </div>    
                            </div>
        				</div> 
        				<br>
				        <div class="row">
				        	<div class="col-sm-25 col-sm-2 text-left">
                                <label>Religion:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select required class="form-control search-select" id="stud_religion" name="stud_religion">
                                    <option value="" selected>Select</option>
                                    <?php
                                        ksort($religion);  
                                        foreach ($religion as $key => $religion_val) 
                                        {
                                            $religion_selected = '';
                                            if(isset($stud_temp_data->religion) && strtolower($stud_temp_data->religion) == strtolower($key))
                                            {
                                                $religion_selected = 'selected';
                                            }
                                            ?>
                                                <option <?php echo $religion_selected ;?>  value="<?php echo $key;?>"><?php echo $religion_val;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>
                                <div id="rel_div">
                                    <input id="stud_otherreligion" name="stud_otherreligion" type="text" placeholder="If other, please specify" value="<?php echo isset($stud_temp_data->other_religion) ? $stud_temp_data->other_religion : NULL; ?>" class="form-control validate[custom[onlyLetterSp]]" maxlength="15"/>
                                </div>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                               <label>Category:&nbsp;</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select class="form-control search-select" id="stud_category" name="stud_category">
                                    <option value="" selected>Select Category</option>
                                    <?php
                                        foreach ($category as $key => $category_val) 
                                        {
                                            $category_selected = '';
                                            $walsh_category = '';
                                            if(isset($stud_temp_data->category))
                                            {
                                                switch ($stud_temp_data->category) 
                                                {
                                                    case 'nta':
                                                        $stud_temp_data->category = 'NT(A)';
                                                        break;
                                                    case 'ntb':
                                                        $stud_temp_data->category = 'NT(B)';
                                                        break;
                                                    case 'ntc':
                                                        $stud_temp_data->category = 'NT(C)';
                                                        break;
                                                    case 'ntd':
                                                        $stud_temp_data->category = 'NT(D)';
                                                        break;
                                                }
                                                $walsh_category = strtolower($stud_temp_data->category);
                                            }

                                            if($walsh_category != '')
                                            {
                                                if(str_replace('-','.', $walsh_category) == strtolower($key))
                                                {
                                                    $category_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $category_selected;?>  value="<?php echo $key;?>"><?php echo $category_val;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>
                                <div id="category_div">
                                    <input id="stud_othercategory" name="stud_othercategory" type="text" placeholder="If other, please specify" value="<?php echo isset($stud_temp_data->other_category) ? $stud_temp_data->other_category : NULL; ?>" class="form-control validate[custom[onlyLetterSp]]" maxlength="15"/>
                                </div>    
                            </div>
				        </div>
				        <br>
				        <div class="row">
				        	<div class="col-sm-25 col-sm-2 text-left">
                                <label>Caste:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select required class="form-control search-select"  id="stud_caste" name="stud_caste">
                                    <option value="" selected>Select Caste</option>
                                    <?php
                                        ksort($caste);  
                                        foreach ($caste as $key => $caste_val) 
                                        {
                                            $caste_selected = '';
                                            $walsh_caste = '';
                                            if(isset($stud_temp_data->caste))
                                            {
                                                if($stud_temp_data->caste == 'marathagomantak')
                                                {
                                                   $stud_temp_data->caste = 'Maratha(Gomantak)'; 
                                                }
                                                $walsh_caste = strtolower($stud_temp_data->caste);
                                            }
                                            if($walsh_caste != '')
                                            {
                                                if(str_replace('-',' ', $walsh_caste) == strtolower($key))
                                                {
                                                    $caste_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $caste_selected;?> value="<?php echo $key;?>"><?php echo $caste_val;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>
                                <div id="caste_div">
                                    <input id="stud_othercaste" name="stud_othercaste" type="text" placeholder="If other, please specify" value="<?php echo isset($stud_temp_data->other_caste) ? $stud_temp_data->other_caste : NULL; ?>" class="form-control validate[custom[onlyLetterSp]]" maxlength="15"/>
                                </div>    
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>SubCaste:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select required class="form-control search-select" id="stud_subcaste" name="stud_subcaste">
                                    <option value="" selected>Select SubCaste</option>
                                    <?php
                                        ksort($subcaste); 
                                        foreach ($subcaste as $key => $subcaste_val) 
                                        {
                                            $subcaste_selected = '';
                                            $walsh_subcaste = '';

                                            if(isset($stud_temp_data->subcaste))
                                            {
                                                $walsh_subcaste = strtolower($stud_temp_data->subcaste);
                                            }
                                           
                                            if($walsh_subcaste != '')
                                            {
                                                if(str_replace('-',' ', $walsh_subcaste) == strtolower($key))
                                                {
                                                    $subcaste_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $subcaste_selected;?> value="<?php echo $key;?>"><?php echo $subcaste_val;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>
                                <div id="subcaste_div">
                                    <input id="stud_othersubcaste" name="stud_othersubcaste" type="text" placeholder="If other, please specify" value="<?php echo isset($stud_temp_data->other_subcaste) ? $stud_temp_data->other_subcaste : NULL; ?>" class="form-control validate[custom[onlyLetterSp]]" maxlength="15"/>
                                </div>        
                            </div>
				        </div>
				        <br>
				        <div class="row">
				        	<div class="col-sm-25 col-sm-2 text-left">
                                <?php
                                if (isset($stud_temp_data)) 
                                {
                                ?>
                                    <label class="label_color">Date Of Birth:&nbsp;<span class="imp">*</span></label>
                                <?php } else{ ?>
                                    <label>Date Of Birth:&nbsp;<span class="imp">*</span></label>
                                <?php } ?>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                            	<div class="input-group date" id="datepicker" data-provide="datepicker"  data-date-format="dd-mm-yyyy" data-date-end-date="0d">
                                    <input required type="text"  class="form-control" id="stud_birthday" name="stud_birthday" value="<?php echo (isset($stud_temp_data->b_date))?date('d-m-Y', strtotime($stud_temp_data->b_date)) : NULL; ?>" onchange="check_eligibility('',true);">
                                    <div class="input-group-addon" id="b_date_icon">
                                        <span class="glyphicon glyphicon-calendar"></span>
                                    </div> 
                                </div>
                            </div>
				        	<div class="col-sm-25 col-sm-2 text-left">
                                <label>Birth Place:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                            	<input id="birthplace" name="birthplace" type="text" placeholder="Birth place (City/Village)"  class="form-control validate[required,custom[onlyLetterSp]] input-medium"  maxlength="50"  value="<?php echo isset($stud_temp_data->b_city) ? $stud_temp_data->b_city : NULL; ?>" required/>
                           	</div> 	
				       	</div>
				       	<br>
				       	<div class="row">
				       		<div class="col-sm-25 col-sm-2 text-left">
                                <label>Mobile / SMS No.:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <?php
                                    if ($stud_temp_data->mother_mobile_no != '') 
                                    {
                                        $stud_mobile_no = $stud_temp_data->mother_mobile_no;
                                    } else{
                                        $stud_mobile_no = $stud_temp_data->father_mobile_no;
                                    }
                                ?>
                            	<input id="info_smsno" name="info_smsno" type="text" required placeholder="Mobile no." class="form-control validate[required,custom[onlyNumberSp]]" min="10" max="10" maxlength="10" pattern="[7-9]{1}[0-9]{9}" title="Enter valid 10 digit Mobile No. for SMS" value="<?php echo isset($stud_mobile_no) ? ltrim($stud_mobile_no, '0') : NULL; ?>"/>
                           	</div>
                           	<div class="col-sm-25 col-sm-2 text-left">
                                <label>Blood Group:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                            	 <select class="form-control search-select" id="stud_bloodgroup" name="stud_bloodgroup" required="required">
                                    <option value="" selected>Select</option>
                                    <?php 
                                        foreach ($blood_group as $key => $stud_bloodgroup_val) 
                                        {
                                            $blood_grp_selected = '';
                                            $walsh_blood_group = '';
                                            if(isset($stud_temp_data->blood_group))
                                            {
                                                switch ($stud_temp_data->blood_group){
                                                    case 'a':
                                                        $stud_temp_data->blood_group = "A+"; 
                                                        break;
                                                    case 'a-2':
                                                        $stud_temp_data->blood_group = "A-";
                                                        break;
                                                    case 'ab':
                                                        $stud_temp_data->blood_group = "AB+";
                                                        break;
                                                    case 'b':
                                                        $stud_temp_data->blood_group = "B+";
                                                        break;
                                                    case 'b-2':
                                                        $stud_temp_data->blood_group = "B-";
                                                        break;
                                                    case 'o':
                                                        $stud_temp_data->blood_group = "O+";
                                                        break;
                                                    case 'o-2':
                                                        $stud_temp_data->blood_group = "O-";
                                                        break;      
                                                }
                                                $walsh_blood_group = strtolower($stud_temp_data->blood_group);
                                            }

                                            if($walsh_blood_group != '')
                                            {
                                                if($walsh_blood_group == strtolower($key))
                                                {
                                                    $blood_grp_selected = 'selected';
                                                }
                                            }
                                            ?>
                                            <option <?php echo $blood_grp_selected;?> value="<?php echo $key;?>"><?php echo $stud_bloodgroup_val;?></option>
                                            <?php
                                        }
                                    
                                    ?>                        
                                </select>
                            </div> 	
				       	</div>
				       	<br>
				       	<div class="row">
				       		<div class="col-sm-25 col-sm-2 text-left">
                                <label>Residential Address 1:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                            	<input id="stud_bldhouse" name="stud_bldhouse" type="text" placeholder="Residential Address 1" class="form-control validate[required,custom[onlyLetterNumberWithSp]]" maxlength="45" value="<?php echo isset($stud_temp_data->bld_house) ? $stud_temp_data->bld_house : NULL; ?>" required/>
                           	</div>
                           	<div class="col-sm-25 col-sm-2 text-left">
                                <label>Residential Address 2:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                            	<input id="stud_subarea" name="stud_subarea" type="text" placeholder="Residential Address 2" class="form-control validate[custom[onlyLetterNumberWithSp]]" value="<?php echo isset($stud_temp_data->sub_area) ? $stud_temp_data->sub_area : NULL; ?>" maxlength="45"/>
                           	</div>
				       	</div>
				       	<br>
				       	<div class="row">
				       		<div class="col-sm-25 col-sm-2 text-left">
                                <label>Residential Address 3:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                            	<input id="stud_servno" name="stud_servno" type="text" placeholder="Residential Address 3" class="form-control validate[custom[onlyLetterNumberWithSp]]"
                                 maxlength="45"/>
                           	</div>
                           	<div class="col-sm-25 col-sm-2 text-left">
                                <label>Pin:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                            	<input id="stud_pin" name="stud_pin" type="text" placeholder="Pin" class="form-control validate[required,custom[onlyNumberSp,minSize[6]]] reqd-validate" maxlength="6" value="<?php echo isset($stud_temp_data->pin) ? $stud_temp_data->pin : NULL; ?>"  pattern="\d*" required/>
                           	</div>
				       	</div>
				       	<br>
				       	<div class="row">
				       		<div class="col-sm-25 col-sm-2 text-left">
                                <label>City:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                            	<input id="stud_city" name="stud_city" type="text" placeholder="City" class="form-control validate[required,custom[onlyLetterSp]] reqd-validate" value="<?php echo isset($stud_temp_data->city) ? $stud_temp_data->city : "Pune"; ?>" maxlength="20" required/>
                           	</div>
                           	<div class="col-sm-25 col-sm-2 text-left">
                                <label>Country:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                            	<input id="stud_country" name="stud_country" type="text" placeholder="Country" class="form-control validate[required,custom[onlyLetterSp]] reqd-validate" maxlength="20" value = "<?php echo isset($stud_temp_data->country) ? (strtoupper($stud_temp_data->country)): NULL; ?>" required/>
                           	</div>
				       	</div>
				       	<br>
				       	<div class="row">
				       		<div class="col-sm-25 col-sm-2 text-left">
                                <label>State:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                            	<input id="stud_state" name="stud_state" type="text" placeholder="State" class="form-control validate[required,custom[onlyLetterSp]] reqd-validate" value="<?php echo isset($stud_temp_data->state) ? $stud_temp_data->state : "Maharashtra"; ?>" maxlength="20" required/>
                           	</div>
                           	<div class="col-sm-25 col-sm-2 text-left">
                                <label>Landmark:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                            	<input id="stud_landmark" name="stud_landmark" type="text" placeholder="Landmark" class="form-control validate[required,custom[onlyLetterNumberWithSp]]" value = "<?php echo isset($stud_temp_data->landmark) ? (strtoupper($stud_temp_data->landmark)): NULL; ?>" maxlength="50" required/>
                           	</div>
				       	</div>
				       	<br>
				       	<div class="row">
				       		<!-- <div class="col-sm-25 col-sm-2 text-left">
                                <label>Landline Number:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                            	<input id="stud_landline" name="stud_landline" type="text" placeholder="Landline No." class="form-control validate[custom[onlyNumberSp]]" maxlength="15" min="15" value="<?php echo isset($student_api_data['student_contact_no']) ? ltrim($student_api_data['student_contact_no'], '0') : NULL; ?>" pattern="\d*"/>
                           	</div> -->
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Special Name:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4 text-left">
                                <?php
                                $checked_spcase = '';
                                if (isset($stud_data->name_validation) && $stud_data->name_validation) 
                                {
                                    $checked_spcase = 'checked';
                                }
                                ?>
                                <input type="checkbox" name="special_case" id="special_case" onchange="special_name();" <?php echo $checked_spcase; ?>>
                            </div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Parent Status:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <?php
                                 if (strtolower($stud_temp_data->parent_status) == 'single_mother') 
                                 {
                                    $checked_mother = 'checked';
                                 }elseif (strtolower($stud_temp_data->parent_status) == 'single_father') 
                                 {
                                     $checked_father = 'checked';
                                 }else{
                                     $checked_both = 'checked';
                                 }
                            ?>
                            <div class="col-sm-35 col-sm-4 text-left">
                                <input type="radio" id="parent_both" name="parent_status" onchange="check_parent_status(this.value);" value= "both"<?php echo $checked_both;?>> &nbsp;&nbsp;Both &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </input>
                                <br>
                                <input type="radio" id="par_single_fath" name="parent_status" onchange="check_parent_status(this.value);" value= "single_father" <?php echo $checked_father;?>> &nbsp;&nbsp;Single Father &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</input>
                                <br>
                                <input type="radio" id="par_single_moth" name="parent_status" onchange="check_parent_status(this.value);" value= "single_mother" <?php echo $checked_mother;?> > &nbsp;&nbsp;Single Mother &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</input>
                                <!-- <input type="hidden" id="parent_status" name="parent_status" value= ""/> -->
                            </div>
                            <?php
                                if (!$checked_both) 
                                {
                            ?>
                                <div id="info_parent_reason">
                                    <div class="col-sm-25 col-sm-2 text-left">
                                        <label id="reason_label">Single Parent Reason:&nbsp;<span class="imp">*</span></label>
                                    </div>
                                    <div class="col-sm-35 col-sm-4">                   
                                        <input id="parent_reason" name="parent_reason" type="text" placeholder="Reason" class="form-control validate[required,custom[onlyLetterNumberWithSp]]" value = "<?php echo isset($stud_temp_data->single_parent_reason) ? (strtoupper($stud_temp_data->single_parent_reason)): NULL; ?>" maxlength="50" required/>
                                    </div>
                                </div>
                            <?php                                   
                                }else{ ?>
                                    <div id="info_parent_reason" style="display: none;">
                                        <div class="col-sm-25 col-sm-2 text-left">
                                            <label id="reason_label">Single Parent Reason:&nbsp; <span id="s4" style="color: red">*</span></label>
                                        </div>
                                        <div class="col-sm-35 col-sm-4">                   
                                            <input id="parent_reason" name="parent_reason" type="text" placeholder="Reason" maxlength="50" />
                                        </div>
                                    </div>
                                <?php
                                }
                            ?>
                        </div>
                        <br>
                        <?php
                        if (!$checked_both) 
                        {?>
                            <div class="row" id="info_divorsed_div">
                              <div class="col-sm-25 col-sm-2 text-left">
                                    <label>Is divorsed? <span class="imp">*</span></label>
                                </div>
                                <div class="col-sm-35 col-sm-4 text-left">
                                    <?php
                                        $checked_is_divorsed_yes = '';
                                        if($stud_temp_data->if_divorced == 'yes')
                                        {
                                            $checked_is_divorsed_yes = 'checked';
                                        }
                                        $checked_is_divorsed_no = '';
                                        if($stud_temp_data->if_divorced == 'no')
                                        {
                                            $checked_is_divorsed_no = 'checked';
                                        }
                                    ?>
                                    <input type="radio" id="yes" name="info_is_divorsed" value="yes" <?php echo $checked_is_divorsed_yes;?> />&nbsp;&nbsp;<span>Yes</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    <input type="radio" id="no" name="info_is_divorsed" value="no"  <?php echo $checked_is_divorsed_no;?>/>&nbsp;&nbsp;<span>No</span>
                                </div>
                            </div>
                        <?php }else{ ?>
                            <div class="row" id="info_divorsed_div" style="display: none;">
                              <div class="col-sm-25 col-sm-2 text-left">
                                    <label>Is divorsed? <span class="imp">*</span> </label>
                                </div>
                                <div class="col-sm-35 col-sm-4 text-left">
                                    <input type="radio" id="yes" name="info_is_divorsed" value="yes" />&nbsp;&nbsp;<span>Yes</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    <input type="radio" id="no" name="info_is_divorsed" value="no" />&nbsp;&nbsp;<span>No</span>
                                </div>
                            </div>
                        <?php }?>
                    </div>

                <!-- Student details end -->	
                </div>
                <div class="row">&nbsp;</div>
                <div class="row">
                <div class="col-sm-10">&nbsp;</div>
                <div class="col-sm-2 text-right">
                    <button  type="submit" class="btn btn-primary btnNext">Forward >></button>
                </div>
            </div>
            </form>
        </div>
        <!-- Student Details END-->
        <!-- Father Details START-->
        <div id="menu2" class="tab-pane fade" style="border:1px solid">
            <form id="update_father_details" name="update_father_details" method="POST">
                <div class="row">
                    <!-- personal details start -->
                    <div class="col-md-6">
                        <div class="row text-center" style="margin-top: -0.6%">
                            <div class="col-sm-5">
                                <h3 class="text-left">Personal Details</h3>
                                <hr style="margin-top: 10px"></hr>
                            </div>
                            <div class="col-sm-7">&nbsp;</div>
                        </div>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Father's first name:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="fath_fname" name="fath_fname" type="text" placeholder="First Name" class="form-control validate[required]" value="<?php echo isset($stud_temp_data->father_f_name) ? $stud_temp_data->father_f_name : NULL; ?>" onblur="populate_mname();" maxlength="20" pattern="[A-Za-z_ ]{1,20}" required/>

                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Father's middle name:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="fath_mname" name="fath_mname" type="text" placeholder="Middle Name" class="form-control validate[required]" value="<?php echo isset($stud_temp_data->father_m_name) ? $stud_temp_data->father_m_name : NULL; ?>" maxlength="20" pattern="[A-Za-z_ ]{1,20}" required/>
                            </div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Father's last name:&nbsp;<span id="s2" style="color: red" >*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="fath_lname" name="fath_lname" type="text" placeholder="Last Name" class="form-control validate[required]" value="<?php echo isset($stud_temp_data->father_s_name) ? $stud_temp_data->father_s_name : NULL; ?>" maxlength="20" pattern="[A-Za-z_]{1,20}" required/>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Father's email ID:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="fath_email" name="fath_email" type="email" placeholder="Email ID" class="form-control validate[required,custom[email]]" value="<?php echo isset($stud_temp_data->father_email) ? $stud_temp_data->father_email : NULL; ?>" maxlength="64" onblur="validate_email(this);" required/>
                            </div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Father's Mobile No.:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="fath_mobile" name="fath_mobile" type="text" placeholder="Mobile Number" class="form-control validate[required,custom[onlyNumberSp],min[10]]" maxlength="10" min="10" pattern="[7-9]{1}[0-9]{9}" onchange="verify_mobile_no(this.id);" value="<?php echo isset($stud_temp_data->father_mobile_no) ? ltrim($stud_temp_data->father_mobile_no, '0') : NULL; ?>" required/>
                            </div>
                            <!-- <div class="col-sm-25 col-sm-2 text-left">
                                <label>Landline Number:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input type="text" name="father_phone_no" id="father_phone_no" placeholder="Landline No." class="form-control validate[custom[onlyNumberSp]]" maxlength="15" min="15" pattern="\d*"/>
                            </div> -->
                        </div>    
                        <br>
                        <!-- <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>ID Type:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select class="form-control search-select" id="fath_IDType" name="fath_IDType">
                                    <option value="" selected>Select</option>
                                    <?php 
                                        foreach ($id_type as $key => $val_fath_IDType) 
                                        {
                                            ?>
                                                <option value="<?php echo $key;?>"><?php echo $val_fath_IDType;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>ID No.:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="fath_ID" name="fath_ID" type="text" placeholder="Enter ID" class="form-control validate[custom[onlyLetterNumber3]]"  maxlength="15"/>
                            </div>
                        </div>
                        <br> -->
                        <!-- <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Blood Group:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select class="form-control search-select" id="father_blood_group" name="father_blood_group" >
                                    <option value="" selected>Select Blood Group</option>
                                    <?php 
                                        foreach ($blood_group as $key => $father_blood_val) 
                                        {
                                            ?>
                                                <option value="<?php echo $key;?>"><?php echo $father_blood_val;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>
                            </div>
                        </div>    
                        <br> -->
                        <div class="row">
                            <div class="col-sm-25 col-sm-3 text-left">
                                <label>Father's Hobbies (Select one or more):</label>
                            </div>
                            <?php
                            $fath_arr = array();
                            if(isset($stud_temp_data->father_hobbies))
                            {
                                $fath_arr = explode(",", $stud_temp_data->father_hobbies);
                            }  
                            ?>
                            <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Drawing" <?php
                                for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Drawing') 
                                    {
                                       echo 'checked';
                                    }
                                }?> 
                                >&nbsp;&nbsp;<span>Drawing</span>
                            </div>
                            <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Painting" <?php
                                for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Painting') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Painting</span>
                            </div>    
                            <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Swimming"  <?php
                                for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Swimming') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Swimming</span>
                            </div>
                            <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Craft"  <?php
                                for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Craft') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Craft</span>
                            </div> 
                             <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Dance"  <?php
                                for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Dance') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Dance</span>
                            </div>
                            <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Photography" <?php
                                for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Photography') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Photography</span>
                            </div>
                            <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Singing"  <?php
                                for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Singing') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Singing</span>
                            </div> 
                             <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Gardening"  <?php
                                for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Gardening') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Gardening</span>
                            </div>
                            <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Teaching"  <?php
                                for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Teaching') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Teaching</span>
                            </div>


                            <!-- <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies" value="Drawing">&nbsp;&nbsp;<span>Drawing</span>
                            </div>
                            <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies" value="Painting">&nbsp;&nbsp;<span>Painting</span>
                            </div>    
                            <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies" value="Swimming">&nbsp;&nbsp;<span>Swimming</span>
                            </div>
                            <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies" value="Craft">&nbsp;&nbsp;<span>Craft</span>
                            </div> 
                             <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies" value="Dance">&nbsp;&nbsp;<span>Dance</span>
                            </div>
                            <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies" value="Photography">&nbsp;&nbsp;<span>Photography</span>
                            </div>
                            <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies" value="Singing">&nbsp;&nbsp;<span>Singing</span>
                            </div> 
                             <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies" value="Gardening">&nbsp;&nbsp;<span>Gardening</span>
                            </div>
                            <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies" value="Teaching">&nbsp;&nbsp;<span>Teaching</span>
                            </div>  -->       
                        </div>    
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                               <label>Father's Hobbies (Other):</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="fath_otherhobbies" name="fath_otherhobbies" type="text" value="<?php echo isset($stud_temp_data->father_other_hobby) ? $stud_temp_data->father_other_hobby : NULL; ?>" placeholder="If other, please specify" class="form-control validate[custom[onlyLetterNumberWithSp]]" maxlength="40"/>
                            </div>
                        </div>                
                    </div>
                    <!-- personal details end -->
                    <!-- Education/office details start -->
                    <div class="col-md-6">
                        <div class="row text-center" style="margin-top: -0.6%">
                            <div class="col-sm-7">
                                <h3 class="text-left">Education/office Details</h3>
                                <hr style="margin-top: 10px"></hr>
                            </div>
                            <div class="col-sm-5">&nbsp;</div>
                        </div>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Father's Educational Qualification:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select required class="form-control search-select" id="fath_qualification" name="fath_qualification">
                                    <option value="" selected>Select</option>
                                    <?php 
                                        foreach ($qualification as $key => $val_fath_qualification) 
                                        {
                                            $fath_qualification_selected = '';
                                            if(isset($stud_temp_data->father_education))
                                            {
                                                $walsh_fath_qualification = strtolower($stud_temp_data->father_education);
                                            }

                                            if($walsh_fath_qualification != '')
                                            {
                                                if($walsh_fath_qualification == strtolower($key))
                                                {
                                                    $fath_qualification_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $fath_qualification_selected;?> value="<?php echo $key;?>"><?php echo $val_fath_qualification;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Father's Profession:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select required class="form-control search-select" id="fath_profession" name="fath_profession">
                                    <option value="">Select</option>
                                    <?php 
                                        foreach ($profession as $key => $father_profession_val) 
                                        {
                                            $fath_profession_selected = '';
                                            $walsh_fath_profession = '';
                                            if(isset($stud_temp_data->father_profession))
                                            {
                                                if($stud_temp_data->father_profession == 'service-provider')
                                                {
                                                    $stud_temp_data->father_profession = str_replace('-',' ', $stud_temp_data->father_profession);
                                                }else{
                                                    $stud_temp_data->father_profession = str_replace('-','/', $stud_temp_data->father_profession);
                                                }
                                                $walsh_fath_profession = strtolower($stud_temp_data->father_profession);
                                            }

                                            if($walsh_fath_profession != '')
                                            {
                                                if($walsh_fath_profession == strtolower($key))
                                                {
                                                    $fath_profession_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $fath_profession_selected;?> value="<?php echo $key;?>"><?php echo $father_profession_val;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>
                                <div id="father_profession_div">
                                    <input type="text" class="form-control" name="fath_otherprofession" id="fath_otherprofession" value="<?php echo isset($stud_temp_data->father_profession_other) ? $stud_temp_data->father_profession_other : NULL; ?>" placeholder="If other, please specify">
                                </div>    
                            </div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Father's Annual Income:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select required class="form-control search-select" id="fath_income" name="fath_income">
                                    <option value="">Select</option>
                                    <?php 
                                        foreach ($annual_income as $key => $fath_income_val) 
                                        {
                                            $fath_income_selected = '';
                                            if(isset($stud_temp_data->father_annual_income))
                                            {
                                                $walsh_fath_income = strtolower($stud_temp_data->father_annual_income);
                                            }

                                            if($walsh_fath_income != '')
                                            {
                                                if($walsh_fath_income == strtolower($key))
                                                {
                                                    $fath_income_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $fath_income_selected;?> value="<?php echo $key;?>"><?php echo $fath_income_val;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Father's Company Name:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="fath_company" name="fath_company" type="text" placeholder="Enter Company Name" class="form-control validate[required,custom[onlyLetterSp]] " value = "<?php echo isset($stud_temp_data->father_company_name) ? (strtoupper($stud_temp_data->father_company_name)): NULL; ?>" maxlength="50" required/>
                            </div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Father's Designation:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="fath_designation" name="fath_designation" type="text" placeholder="Enter Designation" class="form-control validate[required,custom[onlyLetterSp]]" value = "<?php echo isset($stud_temp_data->father_designation) ? (strtoupper($stud_temp_data->father_designation)): NULL; ?>" maxlength="30" required/>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Father's Office Address:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="fath_officeaddress" name="fath_officeaddress" type="text" placeholder="Office Address" class="form-control validate[required,custom[onlyLetterNumberWithSp]]" value = "<?php echo isset($stud_temp_data->father_office_address) ? (strtoupper($stud_temp_data->father_office_address)): NULL; ?>" maxlength="100" required/>
                            </div>
                        </div>
                        <!-- <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Office Phone No.:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="fath_officeno" name="fath_officeno" type="text" placeholder="Office Phone Number" class="form-control validate[required,custom[required,onlyNumberSp]]" maxlength="15" min="15" pattern="\d*" required/>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Office Address2:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="fath_officeaddress2" name="fath_officeaddress2" type="text" placeholder="Office Address" class="form-control validate[custom[onlyLetterNumberWithSp]]" maxlength="100"/>
                            </div>
                        </div>      --> 
                    </div>
                    <!-- Education/office details start -->       
                </div>
                <div class="row">&nbsp;</div>
                <div class="row">
                    <div class="col-sm-2">
                        <a class="btn btn-primary btnPrevious" id="prev_fath"><< Previous</a>
                    </div>
                    <div class="col-sm-8">&nbsp;</div>
                    <div class="col-sm-2">
                        <button type="submit" class="btn btn-primary btnNext">Forward >></butoon>
                    </div>
                </div>   
            </form>
        </div>
        <!-- Father Details END-->
        <!-- Mother Details START-->
        <div id="menu3" class="tab-pane fade" style="border:1px solid">
            <form id="update_mother_details" name="update_mother_details" method="POST">
                <div class="row">
                    <!-- Personal details start -->
                    <div class="col-md-6">
                        <div class="row text-center" style="margin-top: -0.6%">
                            <div class="col-sm-5">
                                <h3 class="text-left">Personal Details</h3>
                                <hr style="margin-top: 10px"></hr>
                            </div>
                            <div class="col-sm-7">&nbsp;</div>
                        </div>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Mother's first name:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="moth_fname" name="moth_fname" type="text" placeholder="First Name" class="form-control validate[required]" value="<?php echo isset($stud_temp_data->mother_f_name) ? $stud_temp_data->mother_f_name : NULL; ?>" maxlength="20" pattern="[A-Za-z_ ]{1,20}" required />
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Mother's middle name:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="moth_mname" name="moth_mname" type="text" placeholder="Middle Name" class="form-control validate[required]" value="<?php echo isset($stud_temp_data->mother_m_name) ? $stud_temp_data->mother_m_name : NULL; ?>" maxlength="20" pattern="[A-Za-z_ ]{1,20}" required/>
                            </div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Mother's last name:&nbsp;<span id="s3" style="color: red">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="moth_lname" name="moth_lname" type="text" placeholder="Last Name" class="form-control validate[required]" value="<?php echo isset($stud_temp_data->mother_s_name) ? $stud_temp_data->mother_s_name : NULL; ?>" maxlength="20"  pattern="[A-Za-z_]{1,20}" required/>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Mother's email ID:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="moth_email" name="moth_email" type="email" placeholder="Email ID" class="form-control validate[required,custom[email]]" value="<?php echo isset($stud_temp_data->mother_email_id) ? $stud_temp_data->mother_email_id : NULL; ?>" maxlength="64" onblur="validate_email(this);" required/>
                            </div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Mother's Mobile No.:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="moth_mobile" name="moth_mobile" type="text" placeholder="Mobile Number" class="form-control validate[required,custom[onlyNumberSp],min[10]]" maxlength="10" min="10" pattern="[7-9]{1}[0-9]{9}" onchange="verify_mobile_no(this.id);" value="<?php echo isset($stud_temp_data->mother_mobile_no) ? ltrim($stud_temp_data->mother_mobile_no, '0') : NULL; ?>" required/>
                            </div>
                            <!-- <div class="col-sm-25 col-sm-2 text-left">
                                <label>Landline Number:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input type="text" name="mother_phone_no" id="mother_phone_no" placeholder="Landline No." class="form-control validate[custom[onlyNumberSp]]" maxlength="15" min="15" pattern="\d*"/>
                            </div> -->
                        </div>    
                        <br>
                       <!--  <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>ID Type:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select class="form-control search-select" id="moth_IDType" name="moth_IDType">
                                    <option value="" selected>Select</option>
                                    <?php 
                                        foreach ($id_type as $key => $val_moth_IDType) 
                                        {
                                        ?>
                                            <option value="<?php echo $key;?>"><?php echo $val_moth_IDType;?></option>
                                        <?php
                                        }
                                    ?>                        
                                </select>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>ID No.:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="moth_ID" name="moth_ID" type="text" placeholder="Enter ID" class="form-control validate[custom[onlyLetterNumber3]]" maxlength="15"/>
                            </div>
                        </div>
                        <br> -->
                       <!--  <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Blood Group:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select class="form-control search-select" id="mother_blood_group" name="mother_blood_group" >
                                    <option value="" selected>Select Blood Group</option>
                                    <?php 
                                        foreach ($blood_group as $key => $mother_blood_group_val) 
                                        {
                                            ?>
                                                <option value="<?php echo $key;?>"><?php echo $mother_blood_group_val;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>
                            </div>
                        </div> -->    
                        <!-- <br> -->
                        <div class="row">
                            <div class="col-sm-25 col-sm-3 text-left">
                                <label>Mother's Hobbies (Select one or more):</label>
                            </div>

                            <?php
                            $fath_arr = array();
                            if(isset($stud_temp_data->mother_hobbies))
                            {
                                $moth_arr = explode(",", $stud_temp_data->mother_hobbies);
                            }  
                            ?>
                            <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Drawing" <?php
                                for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Drawing') 
                                    {
                                       echo 'checked';
                                    }
                                }?> 
                                >&nbsp;&nbsp;<span>Drawing</span>
                            </div>
                            <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Painting" <?php
                                for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Painting') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Painting</span>
                            </div>    
                            <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Swimming"  <?php
                                for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Swimming') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Swimming</span>
                            </div>
                            <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Craft"  <?php
                                for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Craft') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Craft</span>
                            </div> 
                             <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Dance"  <?php
                                for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Dance') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Dance</span>
                            </div>
                            <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Photography" <?php
                                for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Photography') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Photography</span>
                            </div>
                            <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Singing"  <?php
                                for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Singing') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Singing</span>
                            </div> 
                             <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Gardening"  <?php
                                for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Gardening') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Gardening</span>
                            </div>
                            <div class="col-sm-3 text-left">
                                <input type="checkbox" name="fath_hobbies[]" value="Teaching"  <?php
                                for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Teaching') 
                                    {
                                       echo 'checked';
                                    }
                                }?> >&nbsp;&nbsp;<span>Teaching</span>
                            </div>
                            <!-- <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="moth_hobbies" value="Drawing">&nbsp;&nbsp;<span>Drawing</span>
                            </div>
                            <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="moth_hobbies" value="Painting">&nbsp;&nbsp;<span>Painting</span>
                            </div>    
                             <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="moth_hobbies" value="Swimming">&nbsp;&nbsp;<span>Swimming</span>
                            </div>
                            <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="moth_hobbies" value="Craft">&nbsp;&nbsp;<span>Craft</span>
                            </div> 
                             <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="moth_hobbies" value="Dance">&nbsp;&nbsp;<span>Dance</span>
                            </div>
                            <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="moth_hobbies" value="Photography">&nbsp;&nbsp;<span>Photography</span>
                            </div>
                            <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="moth_hobbies" value="Singing">&nbsp;&nbsp;<span>Singing</span>
                            </div> 
                             <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="moth_hobbies" value="Gardening">&nbsp;&nbsp;<span>Gardening</span>
                            </div>
                            <div class="col-sm-25 col-sm-3 text-left">
                                <input type="checkbox" name="moth_hobbies" value="Teaching">&nbsp;&nbsp;<span>Teaching</span>
                            </div> -->        
                        </div>    
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                               <label>Mother's Hobbies (Other):</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="moth_otherhobbies" name="moth_otherhobbies" value="<?php echo isset($stud_temp_data->mother_other_hobbies) ? $stud_temp_data->mother_other_hobbies : NULL; ?>" type="text" placeholder="If other, please specify" class="form-control validate[custom[onlyLetterNumberWithSp]]" maxlength="40"/>
                            </div>
                        </div>  
                    </div>
                    <!-- Personal details end -->
                    <!-- Education/office details start -->
                    <div class="col-md-6">
                        <div class="row text-center" style="margin-top: -0.6%">
                            <div class="col-sm-7">
                                <h3 class="text-left">Education/office Details</h3>
                                <hr style="margin-top: 10px"></hr>
                            </div>
                            <div class="col-sm-5">&nbsp;</div>
                        </div>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Mother's Educational Qualification:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select required class="form-control search-select" id="moth_qualification" name="moth_qualification">
                                    <option value="" selected>Select</option>
                                    <?php 
                                        foreach ($qualification as $key => $val_moth_qualification) 
                                        {
                                            $moth_qualification_selected = '';
                                            if(isset($stud_temp_data->father_education))
                                            {
                                                $walsh_moth_qualification = strtolower($stud_temp_data->father_education);
                                            }

                                            if($walsh_moth_qualification != '')
                                            {
                                                if($walsh_moth_qualification == strtolower($key))
                                                {
                                                    $moth_qualification_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $moth_qualification_selected;?> value="<?php echo $key;?>"><?php echo $val_moth_qualification;?></option>
                                            <?php
                                        }
                                    ?> 
                                    <!-- <?php 
                                        foreach ($qualification as $key => $val_moth_qualification) 
                                        {
                                            ?>
                                                <option value="<?php echo $key;?>"><?php echo $val_moth_qualification;?></option>
                                            <?php
                                        }
                                    ?>  -->                       
                                </select>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Mother's Profession:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select required class="form-control search-select" id="moth_profession" name="moth_profession" onclick='check_moth_prof()'>
                                    <option value="">Select</option>
                                    <?php 
                                        foreach ($moth_profession_array as $key => $moth_profession_val) 
                                        {
                                            $moth_profession_selected = '';
                                            $walsh_moth_profession = '';
                                            if(isset($stud_temp_data->mother_profession))
                                            {
                                                if($stud_temp_data->mother_profession == 'service-provider')
                                                {
                                                    $stud_temp_data->mother_profession = str_replace('-',' ', $stud_temp_data->mother_profession);
                                                }else{
                                                    $stud_temp_data->mother_profession = str_replace('-','/', $stud_temp_data->mother_profession);
                                                }
                                                $walsh_moth_profession = strtolower($stud_temp_data->mother_profession);
                                            }

                                            if($walsh_moth_profession != '')
                                            {
                                                if($walsh_moth_profession == strtolower($key))
                                                {
                                                    $moth_profession_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $moth_profession_selected;?> value="<?php echo $key;?>"><?php echo $moth_profession_val;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>
                                <div id="moth_otherprofession_div">
                                    <input type="text" class="form-control" name="moth_otherprofession" id="moth_otherprofession" value="<?php echo isset($stud_temp_data->mother_profession_other) ? $stud_temp_data->mother_profession_other : NULL; ?>" placeholder="If other, please specify">
                                </div>    
                            </div>
                        </div> 
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Mother's Annual Income:&nbsp;<span id="moth_incp" style="color: red">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select  class="form-control search-select" id="moth_income" name="moth_income">
                                    <option value="">Select</option>
                                   <!--  <?php 
                                        foreach ($annual_income as $key => $moth_income_val) 
                                        {
                                            ?>
                                                <option value="<?php echo $key;?>"><?php echo $moth_income_val;?></option>
                                            <?php
                                        }
                                    ?> --> 

                                    <?php 
                                        foreach ($annual_income as $key => $moth_income_val) 
                                        {
                                            $moth_income_selected = '';
                                            if(isset($stud_temp_data->mother_annual_income))
                                            {
                                                $walsh_moth_income = strtolower($stud_temp_data->mother_annual_income);
                                            }

                                            if($walsh_moth_income != '')
                                            {
                                                if($walsh_moth_income == strtolower($key))
                                                {
                                                    $moth_income_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $moth_income_selected;?> value="<?php echo $key;?>"><?php echo $moth_income_val;?></option>
                                            <?php
                                        }
                                    ?>                       
                                </select>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Mother's Company Name:&nbsp;<span id="moth_compn" style="color: red">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="moth_company" name="moth_company" type="text" placeholder="Enter Company Name" class="form-control validate[required,custom[onlyLetterSp]] " value="<?php echo (isset($stud_temp_data->mother_company_name))?$stud_temp_data->mother_company_name: NULL; ?>" maxlength="50"/>
                            </div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Mother's Designation:&nbsp;<span id="moth_desg" style="color: red">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="moth_designation" name="moth_designation" type="text" placeholder="Enter Designation" class="form-control validate[required,custom[onlyLetterSp]]" value="<?php echo (isset($stud_temp_data->mother_designation))?$stud_temp_data->mother_designation: NULL; ?>" maxlength="30"/>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Mother's Office Address:&nbsp;<span id="moth_offadd" style="color: red">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="moth_officeaddress" name="moth_officeaddress" type="text" placeholder="Office Address" class="form-control validate[required,custom[onlyLetterNumberWithSp]]" value="<?php echo (isset($stud_temp_data->mother_office_address))?$stud_temp_data->mother_office_address: NULL; ?>" maxlength="100" />
                            </div>
                        </div>
                        <!-- <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Office Phone No.:&nbsp;<span id="moth_offcontact" style="color: red">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="moth_officeno" name="moth_officeno" type="text" placeholder="Office Phone Number" class="form-control validate[custom[onlyNumberSp]]" maxlength="15" min="15" pattern="\d*"/>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Office Address2:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="moth_officeaddress2" name="moth_officeaddress2" type="text" placeholder="Office Address" class="form-control validate[custom[onlyLetterNumberWithSp]]" maxlength="100"/>
                            </div>
                        </div>   -->    
                    </div>
                    <!-- Education/office details end -->       
                </div>
                <div class="row">&nbsp;</div>
                <div class="row">
                    <div class="col-sm-2">
                        <a class="btn btn-primary btnPrevious" id="prev_moth"><< Previous</a>
                    </div>
                    <div class="col-sm-8">&nbsp;</div>
                    <div class="col-sm-2">
                        <button type="submit" class="btn btn-primary btnNext">Forward >></butoon>
                    </div>
                </div>  
            </form>      
        </div>
        <!-- Mother Details END-->
        <!-- Guardian Details START-->
        <div id="menu4" class="tab-pane fade" style="border:1px solid">
            <form id="update_guardian_details" name="update_guardian_details" method="POST">
                <input type="hidden" name="guardian_id" id="guardian_id" value="-1">
                <div class="row">
                    <!-- Personal details start -->
                    <div class="col-md-6">
                        <div class="row text-center" style="margin-top: -0.6%">
                            <div class="col-sm-5">
                                <h3 class="text-left">Personal Details</h3>
                                <hr style="margin-top: 10px"></hr>
                            </div>
                            <div class="col-sm-7">&nbsp;</div>
                        </div>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Guardian's first name:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="guardian_f_name" name="guardian_f_name" type="text" placeholder="First Name" class="form-control validate[required]" value="<?php echo isset($stud_temp_data->guardian_f_name) ? $stud_temp_data->guardian_f_name : NULL; ?>" pattern="[A-Za-z_]{1,20}" maxlength="20"/>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Guardian's middle name:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="guardian_m_name" name="guardian_m_name" type="text" placeholder="Middle Name" class="form-control validate[required]" value="<?php echo isset($stud_temp_data->guardian_m_name) ? $stud_temp_data->guardian_m_name : NULL; ?>" pattern="[A-Za-z_]{1,20}" maxlength="20"/>
                            </div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Guardian's last name:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="guardian_s_name" name="guardian_s_name" type="text" placeholder="Last Name" class="form-control validate[required]" value="<?php echo isset($stud_temp_data->guardian_s_name) ? $stud_temp_data->guardian_s_name : NULL; ?>" pattern="[A-Za-z_]{1,20}" maxlength="20"/>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Guardian's email ID:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="guardian_email_id" name="guardian_email_id" type="email" placeholder="Email ID" class="form-control validate[required,custom[email]]" value="<?php echo isset($stud_temp_data->guardian_email_id) ? $stud_temp_data->guardian_email_id : NULL; ?>" onblur="validate_email(this);" maxlength="64"/>
                            </div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Guardian's Mobile No.:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="guardian_mobile_no" name="guardian_mobile_no" type="text" placeholder="Mobile Number" class="form-control" maxlength="10" min="10" pattern="[7-9]{1}[0-9]{9}" value="<?php echo isset($stud_temp_data->guardian_mobile_no) ? ltrim($stud_temp_data->guardian_mobile_no, '0') : NULL; ?>"/>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Guardian's Profession:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <?php
                                // $guardian_profession_array = array('Teaching'=>'Teaching','Engineer'=>'Engineer','Medicine'=>'Medicine','Trade/Vendor'=>'Trade/Vendor','Finance'=>'Finance','Service Provider'=>'Service Provider','Construction'=>'Construction','Film/Tv/Paper'=>'Film/Tv/Paper','Legal'=>'Legal','Agriculture'=>'Agriculture','Artist'=>'Artist','Sports'=>'Sports','Politics'=>'Politics','Scientist'=>'Scientist','Entrepreneur'=>'Entrepreneur','Defense'=>'Defense','Service'=>'Service','HouseWife'=>'HouseWife','Other'=>'Other');
                                 ?>
                                <select class="form-control search-select" id="guardian_profession" name="guardian_profession">
                                    <option value="">Select</option>
                                    <?php 
                                        foreach ($profession as $key => $guardian_profession_val) 
                                        {
                                            $guardian_profession_selected = '';
                                            $walsh_guardian_profession = '';
                                            if(isset($stud_temp_data->guardian_profession))
                                            {
                                                if($stud_temp_data->guardian_profession == 'service-provider')
                                                {
                                                    $stud_temp_data->guardian_profession = str_replace('-',' ', $stud_temp_data->guardian_profession);
                                                }else{
                                                    $stud_temp_data->guardian_profession = str_replace('-','/', $stud_temp_data->guardian_profession);
                                                }
                                                $walsh_guardian_profession = strtolower($stud_temp_data->guardian_profession);
                                            }

                                            if($walsh_guardian_profession != '')
                                            {
                                                if($walsh_guardian_profession == strtolower($key))
                                                {
                                                    $guardian_profession_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $guardian_profession_selected;?> value="<?php echo $key;?>"><?php echo $guardian_profession_val;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>
                                <div id="guardian_otherprofession_div">
                                    <input type="text" class="form-control" name="guardian_profession_other" id="guardian_profession_other" placeholder="If other, please specify">
                                </div>    
                            </div>
                        </div>    
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Guardian's Annual Income:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select class="form-control search-select" id="guardian_income" name="guardian_income">
                                    <option value="">Select</option>
                                  <!--   <?php 
                                        foreach ($annual_income as $key => $guardian_income_val) 
                                        {
                                            ?>
                                                <option value="<?php echo $key;?>"><?php echo $guardian_income_val;?></option>
                                            <?php
                                        }
                                    ?> -->
                                    <?php 
                                        foreach ($annual_income as $key => $guardian_income_val) 
                                        {
                                            $guard_income_selected = '';
                                            if(isset($stud_temp_data->guardian_annual_income))
                                            {
                                                $walsh_guard_income = strtolower($stud_temp_data->guardian_annual_income);
                                            }

                                            if($walsh_guard_income != '')
                                            {
                                                if($walsh_guard_income == strtolower($key))
                                                {
                                                    $guard_income_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $guard_income_selected;?> value="<?php echo $key;?>"><?php echo $guardian_income_val;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>    
                            </div>
                            <!-- <div class="col-sm-25 col-sm-2 text-left">
                                <label>Guardian's Annual Income:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <select class="form-control search-select" id="guardian_income" name="guardian_income">
                                    <option value="">Select</option>
                                    <?php 
                                        foreach ($annual_income as $key => $guardian_income_val) 
                                        {
                                            ?>
                                                <option value="<?php echo $key;?>"><?php echo $guardian_income_val;?></option>
                                            <?php
                                        }
                                    ?>                        
                                </select>
                            </div> -->
                        </div>                  
                    </div>
                    <!-- Personal details end -->
                    <!-- Address details start -->
                    <div class="col-md-6">
                        <div class="row text-center" style="margin-top: -0.6%">
                            <div class="col-sm-5">
                                <h3 class="text-left">Address Details</h3>
                                <hr style="margin-top: 10px"></hr>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Guardian's Address1:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input type="text" class="form-control" name="guardian_bld_house" id="guardian_bld_house" value="<?php echo (isset($stud_temp_data->guardian_add1))?$stud_temp_data->guardian_add1: NULL; ?>" placeholder="Enter house details..." >
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Guardian's Address2:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input type="text" class="form-control" name="guardian_survey_number" id="guardian_survey_number" value="<?php echo (isset($stud_temp_data->guardian_add2))?$stud_temp_data->guardian_add2: NULL; ?>" placeholder="Enter survey no." >
                            </div>
                        </div>
                        <br>
                        <!-- <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Society / Colony:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input type="text" class="form-control" name="guardian_sub_area" id="guardian_sub_area" placeholder="Enter colony name..." >
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Lane / Road:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input type="text" class="form-control" name="guardian_road" id="guardian_road" placeholder="Enter lane name..." >
                            </div>
                        </div>
                        <br> -->
                       <!--  <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Area:</label></div>
                            <div class="col-sm-35 col-sm-4">
                                <input type="text" class="form-control" name="guardian_area" id="guardian_area" value="<?php echo isset($student_api_data['guardian_area']) ? $student_api_data['guardian_area'] : NULL; ?>" placeholder="Enter area name..." >
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Landmark:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input type="text" class="form-control" name="guardian_landmark" id="guardian_landmark" value="<?php echo isset($student_api_data['guardian_landmark']) ? $student_api_data['guardian_landmark'] : NULL; ?>" placeholder="Enter landmark...">
                            </div>
                        </div>
                        <br> -->
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Guardian's City:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input type="text" class="form-control" name="guardian_city" id="guardian_city" value="<?php echo isset($stud_temp_data->guardian_city) ? $stud_temp_data->guardian_city : NULL; ?>" placeholder="Enter city...">
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Guardian's Pin:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input type="text" class="form-control" name="guardian_pin" id="guardian_pin" value="<?php echo isset($stud_temp_data->guardian_pin) ? $stud_temp_data->guardian_pin : NULL; ?>" placeholder="Enter pin code..." maxlength="6" pattern="\d*">
                            </div>
                        </div>
                        <br>
                        <div class="row"> 
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Day Care Contact Info:</label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input type="text" class="form-control" name="day_care_contact" id="day_care_contact" value="<?php echo (isset($stud_temp_data->day_care_contact_info))?$stud_temp_data->day_care_contact_info : NULL; ?>">
                            </div>
                        </div>    
                    </div>
                    <!-- Address details end -->       
                </div>
                <div class="row">&nbsp;</div>
                <div class="row">
                    <div class="col-sm-2">
                        <a class="btn btn-primary btnPrevious" id="prev_guard"><< Previous</a>
                    </div>
                    <div class="col-sm-8">&nbsp;</div>
                    <div class="col-sm-2">
                        <button type="submit" class="btn btn-primary btnNext">Forward >></butoon>
                    </div>
                </div>  
            </form>      
        </div>
        <!-- Guardian Details END-->
        <!-- Other Details START-->
        <div id="menu5" class="tab-pane fade" style="border:1px solid">
            <form id="update_other_details" name="update_other_details" method="POST" enctype="multipart/form-data">
                <input type="hidden" name="json_array" id="json_array">
                <input type="hidden" name="temp_lms_id" id="temp_lms_id" value='<?php echo $stud_temp_data->lms_id ?>'>
                <div class="row">
                    <div class="col-md-6">
                        <div class="row text-center" style="margin-top: -0.6%">
                            <div class="col-sm-5">
                                <h3 class="text-left">Other Details</h3>
                                <hr style="margin-top: 10px"></hr>
                            </div>
                            <div class="col-sm-7">&nbsp;</div>
                        </div>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Want transport service?<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4 text-left">
                                <?php 
                                    $checked_bus_yes = '';
                                    if ($stud_temp_data->bus_service_required == '1') {
                                        $checked_bus_yes = 'checked';
                                    }

                                    $checked_bus_no = '';
                                    if ($stud_temp_data->bus_service_required =='0') 
                                    {
                                        $checked_bus_no = 'checked';
                                    }
                                ?>
                                <input required type="radio" id="yes" name="info_busservice" value="1" <?php echo $checked_bus_yes;?> />&nbsp;&nbsp;<span>Yes</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <input type="radio" id="no" name="info_busservice" value="0"  <?php echo $checked_bus_no;?>/>&nbsp;&nbsp;<span>No</span>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Want catering service?</label>
                            </div>
                            <div class="col-sm-35 col-sm-4 text-left">
                                <?php 
                                    if ($stud_temp_data->catering == '1') 
                                    {
                                        $checked_catering_yes = 'checked';
                                    }

                                    if ($stud_temp_data->catering == '0') 
                                    {
                                         $checked_catering_no = 'checked';
                                    }
                                ?>
                                <input type="radio" id="yes" name="info_catering" value="1" <?php echo $checked_catering_yes;?> />&nbsp;&nbsp;<span>Yes</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <input type="radio" id="no" name="info_catering" value="0"  <?php echo $checked_catering_no;?>/>&nbsp;&nbsp;<span>No</span>
                            </div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Is the child's real brother or sister in this school? :<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4 text-left">
                                <?php 
                                    $checked_sisbroschool_yes = '';
                                    if ($stud_temp_data->student_bro_sis_inschool == '1') {
                                        $checked_sisbroschool_yes = 'checked';
                                    }

                                    $checked_sisbroschool_no = '';
                                    if ($stud_temp_data->student_bro_sis_inschool == '0') {
                                        $checked_sisbroschool_no = 'checked';
                                    }
                                ?>
                                <input required type="radio" name="info_sisbroschool" class ="info_sisbroschool" value="1" <?php echo $checked_sisbroschool_yes;?> onchange="check_brosis_refno(this.value);"/>&nbsp;&nbsp;<span>Yes</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <input type="radio" name="info_sisbroschool" class="info_sisbroschool" value="0" <?php echo $checked_sisbroschool_no;?> onchange="check_brosis_refno(this.value);">&nbsp;&nbsp;<span>No</span>
                                <?php 
                                    if ($stud_temp_data->student_bro_sis_inschool == '1') 
                                    {
                                ?>
                                    <div id="info_brosisrefno_div">
                                        <input type="text" class="form-control" name="info_brosisrefno" id="info_brosisrefno" value="<?php echo isset($stud_temp_data->student_bro_sis_ref_no) ? $stud_temp_data->student_bro_sis_ref_no : NULL; ?>" placeholder="Enter Ref. No">
                                    </div>
                                <?php }else{ ?>
                                    <div id="info_brosisrefno_div">
                                        <input type="text" class="form-control" name="info_brosisrefno" id="info_brosisrefno" placeholder="Enter Ref. No" style="display: none">
                                    </div>
                                <?php } ?>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Is existing student of this school?</label>
                            </div>
                            <div class="col-sm-35 col-sm-4 text-left">
                                <?php 
                                    $checked_exist_student_yes = '';
                                    if ($stud_temp_data->student_isexistingstudent == '1') {
                                        $checked_exist_student_yes = 'checked';
                                    }

                                    $checked_exist_student_no = '';
                                    if ($stud_temp_data->student_isexistingstudent == '0') {
                                        $checked_exist_student_no = 'checked';
                                    }
                                ?>
                                <input type="radio" name="info_exist_student" class="info_exist_student" value="yes" <?php echo $checked_exist_student_yes;?> onchange="check_exis_refno(this.value);"/>&nbsp;&nbsp;<span>Yes</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <input type="radio" name="info_exist_student" class="info_exist_student"  value="no" <?php echo $checked_exist_student_no;?> onchange="check_exis_refno(this.value);"/>&nbsp;&nbsp;<span>No</span>
                                <?php
                                     if ($stud_temp_data->student_isexistingstudent == '1') {
                                ?>
                                    <div id="exis_refnolabel_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="exis_refnolabel" id="exis_refnolabel" value="<?php echo isset($stud_temp_data->student_existing_ref_number) ? $stud_temp_data->student_existing_ref_number : NULL; ?>" placeholder="Ref No" maxlength="10">
                                    </div>
                                <?php }else{ ?>
                                    <div id="exis_refnolabel_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="exis_refnolabel" id="exis_refnolabel" placeholder="Ref No" maxlength="10" style="display: none">
                                    </div>
                                <?php } ?>
                            </div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Mental/Physical Health issues? : </label>
                            </div>
                            <div class="col-sm-35 col-sm-4 text-left">
                                <?php 
                                    $checked_isdisability_yes = '';
                                    if ($stud_temp_data->student_isdisability == 'yes') {
                                        $checked_isdisability_yes = 'checked';
                                    }

                                    $checked_isdisability_no = '';
                                    if ($stud_temp_data->student_isdisability == 'no') {
                                        $checked_isdisability_no = 'checked';
                                    }
                                ?>
                                <input type="radio" name="info_sufferdisability" class="info_sufferdisability"  value="yes" <?php echo $checked_isdisability_yes;?> onchange="check_disability(this.value);"/>&nbsp;&nbsp;<span>Yes</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <input type="radio" name="info_sufferdisability" class="info_sufferdisability" value="no" <?php echo $checked_isdisability_no;?> onchange="check_disability(this.value);"/>&nbsp;&nbsp;<span>No</span>
                                <?php
                                     if ($stud_temp_data->student_isdisability == 'yes') {
                                ?>
                                    <div id="info_disability_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="info_disability" id="info_disability" value="<?php echo isset($stud_temp_data->student_disability_name) ? $stud_temp_data->student_disability_name : NULL; ?>" placeholder="Describe Disability">
                                    </div>
                                <?php }else{ ?>
                                    <div id="info_disability_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="info_disability" id="info_disability" placeholder="Describe Disability" style="display: none">
                                    </div>
                                <?php } ?>
                            </div>
                           <div class="col-sm-25 col-sm-2 text-left">
                                <label>Allergies? </label>
                            </div>
                            <div class="col-sm-35 col-sm-4 text-left">
                                <?php 
                                    $checked_allergies_yes = '';
                                    if ($stud_temp_data->allergies == 'yes') {
                                        $checked_allergies_yes = 'checked';
                                    }

                                    $checked_allergies_no = '';
                                    if ($stud_temp_data->allergies == 'no') {
                                        $checked_allergies_no = 'checked';
                                    }
                                ?>
                                <input type="radio" name="info_isanyallergies" class="info_isanyallergies"  value="yes" <?php echo $checked_allergies_yes;?> onchange="check_allergies(this.value);"/>&nbsp;&nbsp;<span>Yes</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <input type="radio" name="info_isanyallergies" class="info_isanyallergies" value="no" <?php echo $checked_allergies_no;?> onchange="check_allergies(this.value);"/>&nbsp;&nbsp;<span>No</span>
                                <?php
                                     if ($stud_temp_data->allergies == 'yes') {
                                ?>
                                    <div id="info_allergies_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="allergies" id="allergies" value="<?php echo isset($stud_temp_data->other_allergies) ? $stud_temp_data->other_allergies : NULL; ?>" placeholder="Describe Allergies" >
                                    </div>
                                <?php }else{ ?>
                                    <div id="info_allergies_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="allergies" id="allergies" placeholder="Describe Allergies" style="display: none">
                                    </div>
                                <?php } ?>
                            </div>
                        </div>                           
                    </div>
                    <div class="col-md-6">
                       <div class="row text-center" style="margin-top: -0.6%">&nbsp;</div>
                        <div class="row">
                            <!-- <div class="col-sm-25 col-sm-2 text-left">
                                <label>Primary Contact.:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="info_primarycontact" name="info_primarycontact" type="text" value="<?php echo isset($stud_temp_data->student_primary_contact_number) ? ltrim($stud_temp_data->student_primary_contact_number, '0') : NULL; ?>" placeholder="Primary Contact No." class="form-control validate[required,custom[onlyNumberSp]]" min="10" pattern="[7-9]{1}[0-9]{9}" maxlength="10"  required/>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Emergency contact No.:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="info_emergcontactno" name="info_emergcontactno" type="text" value="<?php echo isset($stud_temp_data->student_emergency_contact_no) ? ltrim($stud_temp_data->student_emergency_contact_no, '0') : NULL; ?>" placeholder="Emergency Contact No." class="form-control validate[required,custom[onlyNumberSp]]]" min="10" pattern="[7-9]{1}[0-9]{9}" maxlength="10"  required/>
                            </div> -->
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Amenities No :</label>
                                <img id="loadingimg5" src="./images/loading.gif" />
                            </div>
                            <div class="col-sm-35 col-sm-4">
                                <input id="ame_no" name="ame_no" type="text" placeholder="Amenities No" class="form-control validate[custom[onlyLetterNumberWithSp]]" onblur="validate_amnee();" maxlength="10" />
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Handicap </label>
                            </div>
                            <div class="col-sm-35 col-sm-4 text-left">
                                <select class="form-control search-select" id="stud_handicap" name="stud_handicap">
                                    <option value="" selected>Select</option>
                                    <?php 
                                        foreach ($handicap as $key => $handicap_val) 
                                        {
                                        ?>
                                            <option value="<?php echo $key;?>"><?php echo $handicap_val;?></option>
                                        <?php
                                        }
                                    ?>                        
                                </select>
                            </div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <?php
                                if (isset($stud_temp_data)) 
                                {
                                ?>
                                    <label class="label_color">Referral Student:&nbsp;<span class="imp">*</span></label>
                                <?php } else{ ?>
                                    <label>Referral Student:&nbsp;<span class="imp">*</span></label>
                                <?php } ?>
                            </div>
                            <div class="col-sm-35 col-sm-4 text-left">
                                <?php
                                    $checked_yes = '';
                                    $disabled = '';
                                    if($stud_temp_data->student_referral == 'yes')
                                    {
                                        $checked_yes = 'checked';
                                        $disabled = 'disabled';
                                    }
                                    $checked_no = '';
                                    if($stud_temp_data->student_referral == 'no')
                                    {
                                        $checked_no = 'checked';
                                    }
                                ?>
                               <input type="radio" name="info_referral_student" class="info_referral_student" id="info_referral_student" value="yes" <?php echo $checked_yes;?> onchange="check_referral_refno(this.value);"/>&nbsp;&nbsp;<span>Yes</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <input type="radio" name="info_referral_student" class="info_referral_student"  value="no" <?php echo $checked_no;?> onchange="check_referral_refno(this.value);"/>&nbsp;&nbsp;<span>No</span>
                            </div>
                            <div class="col-sm-2">&nbsp;</div>
                        </div>
                        
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <?php
                                if (isset($stud_temp_data)) 
                                {
                                ?>
                                    <label class="label_color">Referral Student School:&nbsp;<span class="imp">*</span></label>
                                <?php } else{ ?>
                                    <label>Referral Student School:&nbsp;<span class="imp">*</span></label>
                                <?php } ?>
                            </div>
                            <div class="col-sm-35 col-sm-4 text-left">
                               <?php
                                foreach ($ret_school_data as $key => $value) 
                                {
                                    $checked = '';
                                    if($stud_temp_data->referral_school_id == $value['school_id'])
                                    {
                                        $checked = 'checked';
                                    }
                                    ?>
                                     <input type="radio" name="referral_student_school" class="referral_student_school" id="referral_student_school" value="<?php echo $value['school_id'];?>" <?php echo $checked;?> onchange ="refno_field();"/>&nbsp;&nbsp;<span><?php echo $value['school_name'];?></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    <?php
                                }
                                if($stud_temp_data->student_referral == 'yes')
                                {
                                ?>
                                    <div id="ref_refnolabel_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="referral_student" id="referral_student" value="<?php echo isset($stud_temp_data->student_referral_refno) ? $stud_temp_data->student_referral_refno : NULL; ?>" placeholder="Ref No" maxlength="10" onchange ="validated_refno();">
                                        <button id="stud_referral_info" class="btn btn-info" type="button" style="margin-top:10px;display: none;" onclick="stud_referral_details();">Details</button>
                                    </div>
                                <?php } else {?>
                                    <div id="ref_refnolabel_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="referral_student" id="referral_student" placeholder="Ref No" maxlength="10" style="display: none" onchange ="validated_refno();">
                                        <button id="stud_referral_info" class="btn btn-info" type="button" style="margin-top:10px;display: none;" onclick="stud_referral_details();">Details</button>
                                    </div>
                                <?php } ?>
                            </div>
                            <div class="col-sm-2">&nbsp;</div>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Student Photo:&nbsp;<span class="imp">*</span></label>
                            </div>
                            <div  class="col-sm-35 col-sm-4 text-left">
                                <?php
                                    $stuImage = "./student_img/no-photo-available.jpg";
                                    // if ($stud_temp_data->student_photo != NULL) 
                                    // {
                                        $stuImage = "/walsh_upload_images/".$school_code."/student_photo/".$stud_temp_data->lms_id.".JPG";
                                        $stuImageFile = ".".$stuImage;
                                        if (!file_exists($stuImageFile)) {
                                            $stuImage = "./student_img/no-photo-available.jpg";
                                        }else{
                                            $stuImage = $stuImageFile;
                                        }
                                ?>
                                <?php 
                                // } else {
                                    $student_image_path = NULL;
                                ?>
                                    <img src="<?php echo $stuImage; ?>" id='student_photo1' class="img-responsive img-rounded" name='student_photo1' width='100px' height='100px;'>
                                    <span style='display:block;'>&nbsp;&nbsp;</span>
                                    
                                    <div>
                                        <i class="fa fa-rotate-right" style="font-size:22px;" onclick="rotate_photo(student_photo1)" title="Rotate image"></i> &nbsp;&nbsp;
                                        <input type="button" class="btn btn-primary" value="Upload" onclick="upload_certificate(stud_id_photo,student_photo1,null);"/>
                                        <input type="file" id="stud_id_photo"  name="stud_id_photo" style="display: none;">
                                    </div> 
                                <?php 
                                // } 
                                ?>
                            </div>
                            <?php 
                            if ($stud_temp_data->if_divorced == 'yes') 
                            {
                            ?>
                                <div class="col-sm-25 col-sm-8 text-left">
                                    <label>Court Order Doc:&nbsp;<span class="imp">*</span></label>
                                    <img id="loadingimg6" src="./images/loading.gif" />
                                </div>   
                                <div class="col-sm-35 col-sm-4 text-left">
                                    <?php 
                                        $courtImage = "./student_img/no-photo-available.jpg";
                                        $courtImage = "/walsh_upload_images/".$school_code."/court_order_document/".$stud_temp_data->lms_id.".jpg";
                                        $courtImageFile = ".".$courtImage;
                                        if (!file_exists($courtImageFile)) {
                                            $courtImage = "./student_img/no-photo-available.jpg";
                                        }else{
                                            $courtImage = $courtImageFile;
                                        }
                                    ?>
                                    <img src="<?php echo $courtImage; ?>" id='court_order_temp_certificate_photo' class="img-responsive img-rounded" name='court_order_temp_certificate_photo' width='150px' height='100px;'>
                                    <span style='display:block;'>&nbsp;&nbsp;</span>
                                    <div>
                                        <i class="fa fa-rotate-right" style="font-size:22px;" onclick="rotate_photo(court_order_temp_certificate_photo)" title="Rotate image"></i> &nbsp;&nbsp;
                                        <input type="button" class="btn btn-primary" value="Upload" onclick="upload_certificate(court_order,court_order_temp_certificate_photo,null);"/>
                                        <input type="file" id="court_order"  name="court_order" style="display: none;">
                                    </div>
                                </div>
                        <?php } ?>
                        </div>
                        <br>
                        <div class="row">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Birth Certificate:&nbsp;<span id="birth_cert_req" style="color: red">*</span></label>
                                <img id="loadingimg" src="./images/loading.gif" />
                            </div>
                            <div  class="col-sm-35 col-sm-4 text-left">
                                <?php 
                                    $birthImage = "./student_img/no-photo-available.jpg";
                                    $birthImage = "/walsh_upload_images/".$school_code."/birth_certificate/".$stud_temp_data->lms_id.".jpg";
                                    $birthImageFile = ".".$birthImage;
                                    if (!file_exists($birthImageFile)) {
                                        $birthImage = "./student_img/no-photo-available.jpg";
                                    }else{
                                        $birthImage = $birthImageFile;
                                    }
                                ?>
                                <img src="<?php echo $birthImage; ?>" id='birth_certificate_photo' class="img-responsive img-rounded" name='birth_certificate_photo' width='150px' height='100px;'>
                                <span style='display:block;'>&nbsp;&nbsp;</span>
                                <div>
                                    <i class="fa fa-rotate-right" style="font-size:22px;" onclick="rotate_photo(birth_certificate_photo)" title="Rotate image"></i> &nbsp;&nbsp;
                                    <input type="button" class="btn btn-primary" value="Upload" onclick="upload_certificate(birth_certificate,birth_certificate_photo,null);"/>
                                    <input type="file" id="birth_certificate"  name="birth_certificate" style="display: none;">
                                </div>
                            </div>
                            <div class="col-sm-25 col-sm-8 text-left">
                                <label>Adhar Card:&nbsp;<span id="adhar_cert_req" style="color: red">*</span></label>
                                <img id="loadingimg6" src="./images/loading.gif" />
                            </div>   
                            <div class="col-sm-35 col-sm-4 text-left">
                                <?php 
                                    $adharImage = "./student_img/no-photo-available.jpg";
                                    $adharImage = "/walsh_upload_images/".$school_code."/adharcard_certificate/".$stud_temp_data->lms_id.".jpg";
                                    $adharImageFile = ".".$adharImage;
                                    if (!file_exists($adharImageFile)) {
                                        $adharImage = "./student_img/no-photo-available.jpg";
                                    }else{
                                        $adharImage = $adharImageFile;
                                    }
                                ?>
                                <img src="<?php echo $adharImage; ?>" id='adhar_card_photo' class="img-responsive img-rounded" name='adhar_card_photo' width='150px' height='100px;'>
                                <span  style='display:block;'>&nbsp;&nbsp;</span>
                                <div>
                                    <i class="fa fa-rotate-right" style="font-size:22px;" onclick="rotate_photo(adhar_card_photo)" title="Rotate image"></i> &nbsp;&nbsp;
                                    <input type="button" class="btn btn-primary" value="Upload" onclick="upload_certificate(adhar_card,adhar_card_photo,null);"/>
                                    <input type="file" id="adhar_card"  name="adhar_card" style="display: none;">
                                </div>
                            </div>                            
                        </div>
                        <br>
                        <div class="row" id='student_concession_letter' style="visibility: hidden">
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Upload RTE Application Letter:&nbsp;<span class="imp">*</span></label>
                                <img id="loadingimg6" src="./images/loading.gif" />
                            </div>   
                            <div class="col-sm-35 col-sm-4 text-left">
                                <input type="hidden" name="check_click_application" id="check_click_application" class='form-control' value="0">
                                <?php 
                                    $certificate_path = NULL;
                                 ?>
                                <img  src="<?php echo $certificate_path ?> " id='app_photo1' name='app_photo1' width='80px' height='80px;'>
                                <span style='display:block;'>&nbsp;&nbsp;</span>
                                <div>
                                    <input style='text-align: center;width: 80%;' type='file' class='validate[custom[onlyImage]] photoclear1' value='Upload' id='app_photo' name='app_photo' onchange='read_url1(this,app_photo1)'/>
                                </div>
                            </div>
                            <div class="col-sm-25 col-sm-2 text-left">
                                <label>Upload RTE Management Letter:&nbsp;<span class="imp">*</span></label>
                                <img id="loadingimg6" src="./images/loading.gif" />
                            </div>   
                            <div class="col-sm-35 col-sm-4 text-left">
                                <input type="hidden" name="check_click_manage" id="check_click_manage" class='form-control' value="0">
                                <?php 
                                    $certificate_path = NULL;
                                 ?>
                                <img src="<?php echo $certificate_path ?> " id='manage_photo1' name='manage_photo1' width='80px' height='80px;'>
                                <span style='display:block;'>&nbsp;&nbsp;</span>
                                <div>
                                    <input style='text-align: center;width: 80%;' type='file' class='validate[custom[onlyImage]] photoclear1' value='Upload' id='manage_photo' name='manage_photo' onchange='read_url2(this,manage_photo1)'/>
                                </div>
                            </div>
                        </div>    
                    </div>       
                </div>
                <div class="row">&nbsp;</div>
                <div class="row">
                    <div class="col-sm-1">
                        <a class="btn btn-primary btnPrevious" id="prev_oth"><< Previous</a>
                    </div>
                    <div class="col-sm-1">&nbsp;</div>
                    <div class="col-sm-10 text-center">&nbsp;</div>    
                </div>
                <br>
                <div class="row">
                    <button id="submit" class="btn btn-primary" type="submit">Submit</button>
                    <div id="otherinfo_loader" style="display:none;"><img src="./images/loading.gif"> loading...</div>
                </div>
            </form>
        </div>
        <!-- Other Details END-->
   	</div>
</div>   	 	
<div class="modal fade" id="stud_referral_data" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" style="padding-top: 10%;">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close close-modal" aria-hidden="true" data-dismiss="modal">&times;</button>
                <h4 class="modal-title"><b>Student Referred by Details</b></h4>
            </div>
            <div class="modal-body" id="ref_stud">
            </div>
        </div>
    </div>
</div>

```
{{< /details >}}



## Code block 1
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 2
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 3
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 4
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 5
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 6
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 7
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 8
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 9
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 10
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 11
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 12
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 13
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 14
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 15
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 16
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 17
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `base_url()` function is a helper function in CodeIgniter that returns the base URL of the application. The base URL is the URL of the root directory of the CodeIgniter installation. It is typically used to generate URLs for links, assets, and other resources.

{{< details "source code " >}}
```php
echo base_url();
```
{{< /details >}}

## Code block 18
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `base_url()` function is a helper function in CodeIgniter that returns the base URL of the application. The base URL is the URL of the root directory of the CodeIgniter installation. It is typically used to generate URLs for links, assets, and other resources.

{{< details "source code " >}}
```php
echo base_url();
```
{{< /details >}}

## Code block 19
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 20
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 21
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 22
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `site_url()` function returns the URL of the site's homepage. It is a helper function that retrieves the value of the `siteurl` option from the WordPress database and appends any additional path or query parameters specified.

### Refactoring
There are no specific refactoring opportunities for this function as it is a simple helper function.

{{< details "source code " >}}
```php
echo site_url();
```
{{< /details >}}

## Code block 23
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function echoes the value of the variable $page_title.

{{< details "source code " >}}
```php
echo $page_title;
```
{{< /details >}}

## Code block 24
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$page_date` variable is used to display the current date on a web page. It is typically used in PHP templates to dynamically generate the date and display it to the user.

{{< details "source code " >}}
```php
echo $page_date;
```
{{< /details >}}

## Code block 25
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is used to set the values of three variables based on the value of the `parent_status` property of the `stud_info_array[0]` object. If the `parent_status` is 'both', then the `checked_both` variable is set to 'checked' and the `disabled` variable is set to 'disabled'. If the `parent_status` is 'single_father', then the `checked_father` variable is set to 'checked' and the `disabled` variable is set to 'disabled'. If the `parent_status` is 'single_mother', then the `checked_mother` variable is set to 'checked' and the `disabled` variable is set to 'disabled'.

{{< details "source code " >}}
```php
$checked_both = '';$disabled = '';if($stud_info_array[0] ->parent_status == 'both'){
                $checked_both = 'checked';
                $disabled = 'disabled';
            }$checked_father = '';if($stud_info_array[0] ->parent_status == 'single_father'){
                $checked_father = 'checked';
                $disabled = 'disabled';
            }$checked_mother = '';if($stud_info_array[0] ->parent_status == 'single_mother'){
                $checked_mother = 'checked';
                $disabled = 'disabled';
            }
```
{{< /details >}}

## Code block 26
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function retrieves the value of the 'lms_id' property from the 'stud_temp_data' object.

{{< details "source code " >}}
```php
echo $stud_temp_data->lms_id
```
{{< /details >}}

## Code block 27
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks if there is an error message stored in the session flash data. If there is, it displays an alert with the error message.

### Refactoring
1. Instead of using the `!=` operator to check if the error message is not NULL, it would be cleaner to use the `!==` operator to also check for type equality.
2. The code could be refactored to separate the PHP logic from the JavaScript code by using AJAX to display the alert message.

{{< details "source code " >}}
```php
if($this->session->flashdata('error_msg') != NULL) {
                        ?>
                            <script type="text/javascript">
                                alert("<?php echo $this->session->flashdata('error_msg'); ?>");
                            </script>
                        <?php
                        }
```
{{< /details >}}

## Code block 28
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is used to generate an HTML select option with a default selected value based on the value of the variable $admission_startup_status. If $admission_startup_status is true, the default selected value will be $next_academic_year. Otherwise, the default selected value will be empty.

### Refactoring
1. Instead of using the PHP opening and closing tags multiple times, the code can be refactored to use a single set of tags.
2. The code can be refactored to use a ternary operator instead of an if-else statement to set the value of $current_selected.

{{< details "source code " >}}
```php
$current_selected = 'selected';if ($admission_startup_status) 
                                    { 
                                        $current_selected = '';
                                        ?>
                                        <option  selected value="<?php echo $next_academic_year?>"><?php echo $next_academic_year;?></option>
                                    <?php
                                    }
```
{{< /details >}}

## Code block 29
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$current_selected` variable stores the currently selected value. It is used to keep track of the selected value in a dropdown or select input field.

{{< details "source code " >}}
```php
echo $current_selected;
```
{{< /details >}}

## Code block 30
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The variable `academic_year` stores the current academic year. It is used to keep track of the current year in an educational institution. The value of `academic_year` is typically a string representing the year, such as '2021-2022'.

{{< details "source code " >}}
```php
echo $academic_year;
```
{{< /details >}}

## Code block 31
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The variable `academic_year` stores the current academic year. It is used to keep track of the current year in an educational institution. The value of `academic_year` is typically a string representing the year, such as '2021-2022'.

{{< details "source code " >}}
```php
echo $academic_year;
```
{{< /details >}}

## Code block 32
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is used to generate an HTML option element for the academic year. It checks if the admission startup status is true and if the selected academic year is equal to the next academic year. If both conditions are true, it sets the 'next_selected' variable to 'selected'. Then, it generates an option element with the value and text set to the next academic year, and the 'next_selected' variable is used to add the 'selected' attribute to the option element. After that, it checks if the selected academic year is equal to the current academic year. If true, it sets the 'current_selected' variable to 'selected'.

{{< details "source code " >}}
```php
if ($admission_startup_status) 
                                    { 
                                        if ($sel_academic_year == $next_academic_year) 
                                        {
                                            $next_selected = 'selected';
                                        }
                                        ?>
                                        <option  <?php echo $next_selected?> value="<?php echo $next_academic_year?>"><?php echo $next_academic_year;?></option>
                                    <?php
                                    }if ($sel_academic_year == $academic_year) 
                                        {
                                            $current_selected = 'selected';
                                        }
```
{{< /details >}}

## Code block 33
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$current_selected` variable stores the currently selected value. It is used to keep track of the selected value in a dropdown or select input field.

{{< details "source code " >}}
```php
echo $current_selected;
```
{{< /details >}}

## Code block 34
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The variable `academic_year` stores the current academic year. It is used to keep track of the current year in an educational institution. The value of `academic_year` is typically a string representing the year, such as '2021-2022'.

{{< details "source code " >}}
```php
echo $academic_year;
```
{{< /details >}}

## Code block 35
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The variable `academic_year` stores the current academic year. It is used to keep track of the current year in an educational institution. The value of `academic_year` is typically a string representing the year, such as '2021-2022'.

{{< details "source code " >}}
```php
echo $academic_year;
```
{{< /details >}}

## Code block 36
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is checking if the variable `$stud_temp_data` is set. If it is set, it will display a label with the class `label_color` and a span with the class `imp` containing an asterisk. If the variable is not set, it will display a label without any classes and a span with the class `imp` containing an asterisk.

### Refactoring
1. Use a ternary operator instead of an if-else statement to make the code more concise.
2. Consider using a CSS class to style the label instead of adding inline styles.

{{< details "source code " >}}
```php
if (isset($stud_temp_data)) 
                                {
                                ?>
                                    <label class="label_color">Seeking Admission To:&nbsp;<span class="imp">*</span></label>
                                <?php } else{ ?>
                                    <label>Seeking Admission To:&nbsp;<span class="imp">*</span></label>
                                <?php }
```
{{< /details >}}

## Code block 37
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a part of a PHP script that generates a dropdown list of class options. It checks if the variable $class_rows is not NULL and then iterates over each element in the $class_rows array. For each element, it checks if the value of the 'admission_to' property in the $stud_temp_data object is equal to the 'class_id' property in the current $row_class object. If they are equal, it sets the $class_selected variable to 'selected'. It then checks if the 'class_id' property in the current $row_class object is not in the array [20, 21, 22]. If it is not in the array, it generates an HTML option element with the value attribute set to the 'class_id' property and the inner text set to the 'class_name' property in the current $row_class object. Finally, it echoes the generated HTML option element.

### Refactoring
1. Use a more descriptive variable name instead of $row_class. For example, $class.
2. Extract the logic for generating the HTML option element into a separate function for better code organization and reusability.
3. Consider using a template engine or a front-end framework to generate the HTML instead of echoing it directly in the PHP code.

{{< details "source code " >}}
```php
if ($class_rows != NULL) 
                                    {
                                        foreach ($class_rows as $row_class) 
                                        {
                                            $class_selected = '';
                                            if ($stud_temp_data->admission_to == $row_class -> class_id) 
                                            {
                                                $class_selected = 'selected';
                                            }
                                            if (!in_array($row_class -> class_id, array(20,21,22)))
                                            {
                                            ?>
                                                <option <?php echo $class_selected;?> value="<?php echo $row_class -> class_id;  ?>"><?php echo $row_class ->class_name;?></option>
                                            <?php
                                            }
                                        }
                                    }
```
{{< /details >}}

## Code block 38
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is checking if the variable $stud_temp_data is set. If it is set, it will display a label with the text 'Division: *' in a specific color. If it is not set, it will display a label with the text 'Division: *' in the default color.

### Refactoring
1. Use a ternary operator instead of if-else statement to make the code more concise.
2. Extract the label text and color into variables to improve readability and maintainability.

{{< details "source code " >}}
```php
if (isset($stud_temp_data)) 
                                {
                                ?>
                                    <label class="label_color">Division:&nbsp;<span class="imp">*</span></label>
                                <?php } else{ ?>
                                    <label>Division:&nbsp;<span class="imp">*</span></label>
                                <?php }
```
{{< /details >}}

## Code block 39
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks if the variable `$division_rows` is not null and if it has more than 0 rows. If both conditions are true, it iterates over each row in `$division_rows` and prints an HTML `<option>` element with the value and name of each division.

{{< details "source code " >}}
```php
if ($division_rows != NULL && $division_rows -> num_rows() > 0) 
                                    {
                                        foreach ($division_rows->result() as $row_div) 
                                        {
                                            echo "<option value=" . $row_div -> division_id . ">" . $row_div -> division_name . "</option>";
                                        }
                                    }
```
{{< /details >}}

## Code block 40
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is used to generate an HTML option element for a select dropdown. It checks the value of the variable $admission_startup_status and if it is true, it adds the option 'New student' to the dropdown. The selected attribute is added to the option if the value of $student_api_data['student_status'] is 'new-student'.

### Refactoring
1. Use a templating engine like Twig to separate the HTML code from the PHP logic.
2. Use a ternary operator to simplify the code and make it more readable.

{{< details "source code " >}}
```php
if ($admission_startup_status) 
                                    { 
                                    ?>
                                        <option value="1"<?php echo isset($student_api_data['student_status']) ? ($student_api_data['student_status'] == "new-student") ? "selected=selected" : "" : ""; ?>>New student</option>
                                    <?php 
                                    }
```
{{< /details >}}

## Code block 41
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the 'student_status' key exists in the 'student_api_data' array. If it exists, it checks if the value is equal to 'current-student'. If it is, it returns the string 'selected=selected', otherwise it returns an empty string.

### Refactoring
The nested ternary operators can be refactored into a more readable and maintainable code using if-else statements.

{{< details "source code " >}}
```php
echo isset($student_api_data['student_status']) ? ($student_api_data['student_status'] == "current-student") ? "selected=selected" : "" : "";
```
{{< /details >}}

## Code block 42
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks the value of the variable $admission_startup_status. If the value is true, it checks if the value of $sel_academic_year is equal to $next_academic_year. If it is, it sets the variable $new_selected to 'selected'. Then, it checks if the value of $sel_academic_year is equal to $academic_year. If it is, it sets the variable $current_sta_selected to 'selected'. Finally, it generates an HTML option element with the value '1' and the text 'New student', and adds the $new_selected variable to the option element if it is set.

### Refactoring
1. Use a ternary operator instead of if statements to simplify the code.
2. Extract the logic for setting the selected variables into separate functions to improve readability and maintainability.

{{< details "source code " >}}
```php
if ($admission_startup_status) 
                                    { 
                                        if ($sel_academic_year == $next_academic_year) 
                                        {
                                            $new_selected = 'selected';
                                        }
                                    ?>
                                        <option value="1"<?php echo $new_selected; ?>>New student</option>
                                    <?php 
                                    }if ($sel_academic_year == $academic_year) 
                                        {
                                            $current_sta_selected = 'selected';
                                        }
```
{{< /details >}}

## Code block 43
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$current_sta_selected` variable is used to store the currently selected value from a dropdown list or radio button. It is typically used in PHP code to retrieve the selected value and perform further actions based on that value.

{{< details "source code " >}}
```php
echo $current_sta_selected;
```
{{< /details >}}

## Code block 44
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `student_last_school_name` exists in the object `$stud_temp_data`. If it exists, it returns the value of `student_last_school_name`. Otherwise, it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->student_last_school_name) ? $stud_temp_data->student_last_school_name : NULL;
```
{{< /details >}}

## Code block 45
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is used to display a label for the KG Shift for 1st Standard. If the variable $stud_temp_data is set, the label will have a class 'label_color'. Otherwise, the label will not have any class.

### Refactoring
The code can be refactored to use a ternary operator instead of an if-else statement.

{{< details "source code " >}}
```php
if (isset($stud_temp_data)) 
                                    {
                                    ?>
                                        <label class="label_color">KG Shift for 1st Standard:&nbsp;<span class="imp">*</span></label>
                                    <?php } else{ ?>
                                        <label>KG Shift for 1st Standard:&nbsp;<span class="imp">*</span></label>
                                    <?php }
```
{{< /details >}}

## Code block 46
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `stud_f_name` exists in the object `$stud_temp_data`. If it exists, it returns the value of `stud_f_name`, otherwise it returns `NULL`.

### User Acceptance Criteria
```gherkin
Feature: Check if stud_f_name exists

Scenario: Property exists
  Given The object stud_temp_data
  When I check if stud_f_name exists
  Then The value of stud_f_name is returned

Scenario: Property does not exist
  Given The object stud_temp_data
  When I check if stud_f_name exists
  Then NULL is returned
```

{{< details "source code " >}}
```php
echo isset($stud_temp_data->stud_f_name) ? $stud_temp_data->stud_f_name : NULL;
```
{{< /details >}}

## Code block 47
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `stud_l_name` exists in the object `$stud_temp_data`. If it exists, it returns the value of `stud_l_name`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->stud_l_name) ? $stud_temp_data->stud_l_name : NULL;
```
{{< /details >}}

## Code block 48
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `adhar_card_no` exists in the object `$stud_temp_data`. If it exists, it returns the value of `adhar_card_no`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->adhar_card_no) ? $stud_temp_data->adhar_card_no : NULL;
```
{{< /details >}}

## Code block 49
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array of gender options. It checks if the current gender option is selected based on the value stored in the `$stud_temp_data->gender` variable. If the current gender option is selected, it adds the 'selected' attribute to the `<option>` tag. Finally, it outputs the gender option as an HTML `<option>` tag.

### Refactoring
1. Use a more descriptive variable name instead of `$val_gender`.
2. Use a ternary operator instead of an if statement to set the `$gender_selected` variable.
3. Separate the HTML output from the logic by using a template engine or separating the HTML code into a separate file.

{{< details "source code " >}}
```php
foreach ($gender as $key => $val_gender) 
                                        {
                                            $gender_selected = '';
                                            if (isset($stud_temp_data->gender) && strtolower($stud_temp_data->gender) == strtolower($key)) 
                                            {
                                                $gender_selected = 'selected';
                                            }
                                            ?>
                                            <option <?php echo $gender_selected;?> value="<?php echo $key;?>"><?php echo $val_gender;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 50
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function generates a dropdown list of nationalities. It iterates over an array of nationalities and creates an option element for each nationality. If a nationality is selected, it adds the 'selected' attribute to the option element. The function then returns the generated HTML code for the dropdown list.

### Refactoring
1. Use a foreach loop instead of a for loop to iterate over the array.
2. Use a ternary operator instead of an if statement to set the 'selected' attribute.
3. Use template literals instead of concatenation to generate the HTML code.

{{< details "source code " >}}
```php
foreach ($nationality as $key => $national_val) 
                                        {
                                            $nationality_selected = '';
                                            if (isset($stud_temp_data->nationality) && strtolower($stud_temp_data->nationality) == strtolower($key))
                                            {
                                               $nationality_selected = 'selected'; 
                                            }
                                            ?>
                                            <option <?php echo $nationality_selected;?> value="<?php echo $key;?>"><?php echo $national_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 51
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `other_nationality` exists in the object `$stud_temp_data`. If it exists, it returns the value of `other_nationality`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->other_nationality) ? $stud_temp_data->other_nationality : NULL;
```
{{< /details >}}

## Code block 52
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array of mother tongues. For each mother tongue, it checks if it matches the mother tongue stored in the `$stud_temp_data` object. If there is a match, it sets the `$mothertounge_selected` variable to 'selected'. It then generates an HTML `<option>` element with the mother tongue as the value and text. Finally, it echoes the generated HTML.

### Refactoring
1. Use a `foreach` loop with the `as` keyword instead of the `foreach` loop with the arrow syntax.
2. Use the `strtolower` function outside the loop to avoid calling it multiple times.
3. Use the ternary operator instead of the `if` statement to set the `$mothertounge_selected` variable.
4. Use double quotes instead of concatenation to echo the HTML.

{{< details "source code " >}}
```php
foreach ($mothertoungue_array as $key => $mothertoungue_val) 
                                        {
                                            $mothertounge_selected = '';
                                            if (isset($stud_temp_data->mother_tongue) && strtolower($stud_temp_data->mother_tongue) == strtolower($key))
                                            {
                                               $mothertounge_selected = 'selected'; 
                                            }
                                            ?>
                                            <option <?php echo $mothertounge_selected;?> value="<?php echo $key;?>"><?php echo $mothertoungue_val;?></option>
                                            <?php

                                        }
```
{{< /details >}}

## Code block 53
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `other_mother_tongue` exists in the object `$stud_temp_data`. If it exists, it returns the value of `other_mother_tongue`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->other_mother_tongue) ? $stud_temp_data->other_mother_tongue : NULL;
```
{{< /details >}}

## Code block 54
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is used to generate a dropdown list of religions. It iterates over the `$religion` array and for each key-value pair, it checks if the `religion` property of `$stud_temp_data` is equal to the current key. If it is, the `selected` attribute is added to the `<option>` tag. Finally, the key and value are used to generate an `<option>` tag.

{{< details "source code " >}}
```php
ksort($religion);foreach ($religion as $key => $religion_val) 
                                        {
                                            $religion_selected = '';
                                            if(isset($stud_temp_data->religion) && strtolower($stud_temp_data->religion) == strtolower($key))
                                            {
                                                $religion_selected = 'selected';
                                            }
                                            ?>
                                                <option <?php echo $religion_selected ;?>  value="<?php echo $key;?>"><?php echo $religion_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 55
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `other_religion` exists in the object `$stud_temp_data`. If it exists, it returns the value of `other_religion`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->other_religion) ? $stud_temp_data->other_religion : NULL;
```
{{< /details >}}

## Code block 56
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array of categories. For each category, it checks if it matches the selected category in the `$stud_temp_data` object. If there is a match, it sets the `$category_selected` variable to 'selected'. Finally, it generates an HTML `<option>` element with the category key as the value and the category value as the displayed text.

### Refactoring
1. Instead of using a switch statement to convert the category value to a different format, consider using a mapping array.
2. Extract the logic for generating the HTML `<option>` element into a separate function for better code organization and reusability.

{{< details "source code " >}}
```php
foreach ($category as $key => $category_val) 
                                        {
                                            $category_selected = '';
                                            $walsh_category = '';
                                            if(isset($stud_temp_data->category))
                                            {
                                                switch ($stud_temp_data->category) 
                                                {
                                                    case 'nta':
                                                        $stud_temp_data->category = 'NT(A)';
                                                        break;
                                                    case 'ntb':
                                                        $stud_temp_data->category = 'NT(B)';
                                                        break;
                                                    case 'ntc':
                                                        $stud_temp_data->category = 'NT(C)';
                                                        break;
                                                    case 'ntd':
                                                        $stud_temp_data->category = 'NT(D)';
                                                        break;
                                                }
                                                $walsh_category = strtolower($stud_temp_data->category);
                                            }

                                            if($walsh_category != '')
                                            {
                                                if(str_replace('-','.', $walsh_category) == strtolower($key))
                                                {
                                                    $category_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $category_selected;?>  value="<?php echo $key;?>"><?php echo $category_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 57
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `other_category` exists in the object `$stud_temp_data`. If it exists, it returns the value of `other_category`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->other_category) ? $stud_temp_data->other_category : NULL;
```
{{< /details >}}

## Code block 58
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is used to generate a dropdown list of caste options. It iterates over the 'caste' array and for each element, it checks if it matches the selected caste value. If it does, it sets the 'selected' attribute for that option. Finally, it generates the HTML code for the dropdown list.

### Refactoring
1. Use a foreach loop instead of ksort and foreach loop combination.
2. Use a ternary operator instead of nested if statements.
3. Extract the HTML code generation into a separate function for reusability.

{{< details "source code " >}}
```php
ksort($caste);foreach ($caste as $key => $caste_val) 
                                        {
                                            $caste_selected = '';
                                            $walsh_caste = '';
                                            if(isset($stud_temp_data->caste))
                                            {
                                                if($stud_temp_data->caste == 'marathagomantak')
                                                {
                                                   $stud_temp_data->caste = 'Maratha(Gomantak)'; 
                                                }
                                                $walsh_caste = strtolower($stud_temp_data->caste);
                                            }
                                            if($walsh_caste != '')
                                            {
                                                if(str_replace('-',' ', $walsh_caste) == strtolower($key))
                                                {
                                                    $caste_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $caste_selected;?> value="<?php echo $key;?>"><?php echo $caste_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 59
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `other_caste` exists in the object `stud_temp_data`. If it exists, it returns the value of `other_caste`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->other_caste) ? $stud_temp_data->other_caste : NULL;
```
{{< /details >}}

## Code block 60
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is used to generate a dropdown list of subcastes. It iterates over the $subcaste array and for each subcaste, it checks if it matches the selected subcaste stored in $stud_temp_data->subcaste. If there is a match, the option is marked as selected. Finally, it generates an HTML option element for each subcaste.

{{< details "source code " >}}
```php
ksort($subcaste);foreach ($subcaste as $key => $subcaste_val) 
                                        {
                                            $subcaste_selected = '';
                                            $walsh_subcaste = '';

                                            if(isset($stud_temp_data->subcaste))
                                            {
                                                $walsh_subcaste = strtolower($stud_temp_data->subcaste);
                                            }
                                           
                                            if($walsh_subcaste != '')
                                            {
                                                if(str_replace('-',' ', $walsh_subcaste) == strtolower($key))
                                                {
                                                    $subcaste_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $subcaste_selected;?> value="<?php echo $key;?>"><?php echo $subcaste_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 61
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `other_subcaste` exists in the object `$stud_temp_data`. If it exists, it returns the value of `other_subcaste`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->other_subcaste) ? $stud_temp_data->other_subcaste : NULL;
```
{{< /details >}}

## Code block 62
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is checking if the variable `$stud_temp_data` is set. If it is set, it will display a label with the text 'Date Of Birth: *' and a CSS class 'label_color'. If it is not set, it will display a label with the text 'Date Of Birth: *'.

### Refactoring
The code can be refactored to remove the duplicated label code. Instead of having two separate label elements, we can have a single label element and conditionally add the CSS class 'label_color' based on the condition.

{{< details "source code " >}}
```php
if (isset($stud_temp_data)) 
                                {
                                ?>
                                    <label class="label_color">Date Of Birth:&nbsp;<span class="imp">*</span></label>
                                <?php } else{ ?>
                                    <label>Date Of Birth:&nbsp;<span class="imp">*</span></label>
                                <?php }
```
{{< /details >}}

## Code block 63
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the variable `$stud_temp_data->b_date` is set. If it is set, it converts the value to a date format using the `date` function and returns it. If it is not set, it returns `NULL`.

### User Acceptance Criteria
```gherkin
Feature: Convert b_date to date format

Scenario: b_date is set
  Given the variable stud_temp_data->b_date is set
  When the function is called
  Then it should return the date format of b_date

Scenario: b_date is not set
  Given the variable stud_temp_data->b_date is not set
  When the function is called
  Then it should return NULL
```

{{< details "source code " >}}
```php
echo (isset($stud_temp_data->b_date))?date('d-m-Y', strtotime($stud_temp_data->b_date)) : NULL;
```
{{< /details >}}

## Code block 64
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `b_city` exists in the object `$stud_temp_data`. If it exists, it returns the value of `b_city`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->b_city) ? $stud_temp_data->b_city : NULL;
```
{{< /details >}}

## Code block 65
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks if the `mother_mobile_no` property of the `$stud_temp_data` object is not empty. If it is not empty, it assigns the value of `mother_mobile_no` to the `stud_mobile_no` variable. Otherwise, it assigns the value of `father_mobile_no` to the `stud_mobile_no` variable.

{{< details "source code " >}}
```php
if ($stud_temp_data->mother_mobile_no != '') 
                                    {
                                        $stud_mobile_no = $stud_temp_data->mother_mobile_no;
                                    } else{
                                        $stud_mobile_no = $stud_temp_data->father_mobile_no;
                                    }
```
{{< /details >}}

## Code block 66
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks if the variable $stud_mobile_no is set. If it is set, it trims any leading zeros from the value and returns it. If $stud_mobile_no is not set, it returns NULL.

### Refactoring
1. Use the null coalescing operator (??) instead of the ternary operator to simplify the code.
2. Consider using a regular expression to remove leading zeros instead of the ltrim() function.

{{< details "source code " >}}
```php
echo isset($stud_mobile_no) ? ltrim($stud_mobile_no, '0') : NULL;
```
{{< /details >}}

## Code block 67
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array of blood groups and generates HTML options for a select dropdown. It also checks if the current blood group is selected and sets the 'selected' attribute accordingly.

### Refactoring
1. Instead of using a switch statement to convert the blood group values, we can use a mapping array.
2. The code can be refactored to use a ternary operator instead of an if statement to set the 'selected' attribute.
3. The HTML generation can be extracted into a separate function for reusability.

{{< details "source code " >}}
```php
foreach ($blood_group as $key => $stud_bloodgroup_val) 
                                        {
                                            $blood_grp_selected = '';
                                            $walsh_blood_group = '';
                                            if(isset($stud_temp_data->blood_group))
                                            {
                                                switch ($stud_temp_data->blood_group){
                                                    case 'a':
                                                        $stud_temp_data->blood_group = "A+"; 
                                                        break;
                                                    case 'a-2':
                                                        $stud_temp_data->blood_group = "A-";
                                                        break;
                                                    case 'ab':
                                                        $stud_temp_data->blood_group = "AB+";
                                                        break;
                                                    case 'b':
                                                        $stud_temp_data->blood_group = "B+";
                                                        break;
                                                    case 'b-2':
                                                        $stud_temp_data->blood_group = "B-";
                                                        break;
                                                    case 'o':
                                                        $stud_temp_data->blood_group = "O+";
                                                        break;
                                                    case 'o-2':
                                                        $stud_temp_data->blood_group = "O-";
                                                        break;      
                                                }
                                                $walsh_blood_group = strtolower($stud_temp_data->blood_group);
                                            }

                                            if($walsh_blood_group != '')
                                            {
                                                if($walsh_blood_group == strtolower($key))
                                                {
                                                    $blood_grp_selected = 'selected';
                                                }
                                            }
                                            ?>
                                            <option <?php echo $blood_grp_selected;?> value="<?php echo $key;?>"><?php echo $stud_bloodgroup_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 68
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `bld_house` exists in the object `$stud_temp_data`. If it exists, it returns the value of `bld_house`. If it doesn't exist, it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->bld_house) ? $stud_temp_data->bld_house : NULL;
```
{{< /details >}}

## Code block 69
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `sub_area` exists in the object `$stud_temp_data`. If it exists, it returns the value of `sub_area`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->sub_area) ? $stud_temp_data->sub_area : NULL;
```
{{< /details >}}

## Code block 70
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `pin` exists in the object `$stud_temp_data`. If it exists, it returns the value of `pin`. If it doesn't exist, it returns `NULL`.

### Refactoring
The use of the ternary operator can make the code harder to read. It can be refactored to use an `if` statement for better readability.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->pin) ? $stud_temp_data->pin : NULL;
```
{{< /details >}}

## Code block 71
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property 'city' exists in the object 'stud_temp_data'. If it exists, it returns the value of 'city'. If it doesn't exist, it returns the string 'Pune'.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->city) ? $stud_temp_data->city : "Pune";
```
{{< /details >}}

## Code block 72
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `country` exists in the object `$stud_temp_data`. If it exists, it returns the uppercase value of `country`. Otherwise, it returns `NULL`.

### User Acceptance Criteria
```gherkin
Feature: Check if country property exists

Scenario: Country property exists
  Given The object stud_temp_data
  When The country property exists
  Then Return the uppercase value of country

Scenario: Country property does not exist
  Given The object stud_temp_data
  When The country property does not exist
  Then Return NULL
```

### Refactoring
1. Use the null coalescing operator (`??`) instead of the ternary operator (`? :`) to simplify the code.
2. Consider using the `isset()` function directly in the condition of the ternary operator instead of assigning it to a variable.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->country) ? (strtoupper($stud_temp_data->country)): NULL;
```
{{< /details >}}

## Code block 73
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property 'state' exists in the object 'stud_temp_data'. If it exists, it returns the value of 'state'. If it doesn't exist, it returns the string 'Maharashtra'.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->state) ? $stud_temp_data->state : "Maharashtra";
```
{{< /details >}}

## Code block 74
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `landmark` exists in the object `$stud_temp_data`. If it exists, it returns the uppercase value of `landmark`. Otherwise, it returns `NULL`.

### User Acceptance Criteria
```gherkin
Feature: Check if landmark exists

Scenario: Landmark exists
  Given The object stud_temp_data
  When The landmark property exists
  Then Return the uppercase value of landmark

Scenario: Landmark does not exist
  Given The object stud_temp_data
  When The landmark property does not exist
  Then Return NULL
```

### Refactoring
1. Use the null coalescing operator (`??`) instead of the ternary operator (`?:`) to simplify the code.
2. Consider using a helper function to handle the logic of checking if a property exists and returning its uppercase value.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->landmark) ? (strtoupper($stud_temp_data->landmark)): NULL;
```
{{< /details >}}

## Code block 75
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the 'student_contact_no' key exists in the 'student_api_data' array. If it exists, it trims any leading zeros from the value and returns it. If it doesn't exist, it returns NULL.

### User Acceptance Criteria
```gherkin
Feature: Trim leading zeros from student contact number

Scenario: Student contact number has leading zeros
  Given the student API data
  When the student contact number has leading zeros
  Then trim the leading zeros and return the contact number

Scenario: Student contact number does not have leading zeros
  Given the student API data
  When the student contact number does not have leading zeros
  Then return NULL
```

{{< details "source code " >}}
```php
echo isset($student_api_data['student_contact_no']) ? ltrim($student_api_data['student_contact_no'], '0') : NULL;
```
{{< /details >}}

## Code block 76
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks if the `name_validation` property of the `stud_data` object is set and true. If it is true, it sets the `checked_spcase` variable to 'checked'.

### Refactoring
The code can be simplified by using the null coalescing operator. Instead of checking if the property is set and true, we can use the null coalescing operator to assign the value of `stud_data->name_validation` to `checked_spcase` with a default value of '' if it is not set or false.

{{< details "source code " >}}
```php
$checked_spcase = '';if (isset($stud_data->name_validation) && $stud_data->name_validation) 
                                {
                                    $checked_spcase = 'checked';
                                }
```
{{< /details >}}

## Code block 77
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$checked_spcase` variable is used to store the value of a checkbox input field in a PHP script. It is typically used in form processing to determine if the checkbox has been checked or not. The value of `$checked_spcase` will be `true` if the checkbox is checked, and `false` if it is not checked.

{{< details "source code " >}}
```php
echo $checked_spcase;
```
{{< /details >}}

## Code block 78
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks the value of the `parent_status` property of the `$stud_temp_data` object. If the value is 'single_mother', it sets the `$checked_mother` variable to 'checked'. If the value is 'single_father', it sets the `$checked_father` variable to 'checked'. If the value is neither 'single_mother' nor 'single_father', it sets the `$checked_both` variable to 'checked'.

{{< details "source code " >}}
```php
if (strtolower($stud_temp_data->parent_status) == 'single_mother') 
                                 {
                                    $checked_mother = 'checked';
                                 }elseif (strtolower($stud_temp_data->parent_status) == 'single_father') 
                                 {
                                     $checked_father = 'checked';
                                 }else{
                                     $checked_both = 'checked';
                                 }
```
{{< /details >}}

## Code block 79
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The variable `$checked_both` is a boolean variable that indicates whether both conditions have been checked. It is used to track the status of two conditions and determine if both conditions have been met.

{{< details "source code " >}}
```php
echo $checked_both;
```
{{< /details >}}

## Code block 80
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$checked_father` variable is used to store the value of whether the father has been checked or not. It is typically used in a form or checkbox scenario where the user can select or deselect the option for the father. The value of `$checked_father` can be either `true` or `false`.

{{< details "source code " >}}
```php
echo $checked_father;
```
{{< /details >}}

## Code block 81
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$checked_mother` variable is used to store the value of the `mother` checkbox. It is typically used in a form submission process to determine if the `mother` checkbox was checked or not.

{{< details "source code " >}}
```php
echo $checked_mother;
```
{{< /details >}}

## Code block 82
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a conditional statement that checks the value of the variable $checked_both. If $checked_both is false, it displays a form field for the single parent reason. If $checked_both is true, it hides the form field.

### Refactoring
1. Use a ternary operator instead of the if-else statement to make the code more concise.
2. Extract the HTML markup into a separate template file for better separation of concerns.

{{< details "source code " >}}
```php
if (!$checked_both) 
                                {
                            ?>
                                <div id="info_parent_reason">
                                    <div class="col-sm-25 col-sm-2 text-left">
                                        <label id="reason_label">Single Parent Reason:&nbsp;<span class="imp">*</span></label>
                                    </div>
                                    <div class="col-sm-35 col-sm-4">                   
                                        <input id="parent_reason" name="parent_reason" type="text" placeholder="Reason" class="form-control validate[required,custom[onlyLetterNumberWithSp]]" value = "<?php echo isset($stud_temp_data->single_parent_reason) ? (strtoupper($stud_temp_data->single_parent_reason)): NULL; ?>" maxlength="50" required/>
                                    </div>
                                </div>
                            <?php                                   
                                }else{ ?>
                                    <div id="info_parent_reason" style="display: none;">
                                        <div class="col-sm-25 col-sm-2 text-left">
                                            <label id="reason_label">Single Parent Reason:&nbsp; <span id="s4" style="color: red">*</span></label>
                                        </div>
                                        <div class="col-sm-35 col-sm-4">                   
                                            <input id="parent_reason" name="parent_reason" type="text" placeholder="Reason" maxlength="50" />
                                        </div>
                                    </div>
                                <?php
                                }
```
{{< /details >}}

## Code block 83
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a conditional statement written in PHP. It checks the value of the variable $checked_both and displays different HTML elements based on its value. If $checked_both is false, it displays a radio button group for the user to select whether they are divorced or not. If $checked_both is true, it hides the radio button group.

### Refactoring
1. Use a ternary operator instead of the if-else statement to make the code more concise.
2. Extract the HTML elements into separate functions to improve code readability and maintainability.

{{< details "source code " >}}
```php
if (!$checked_both) 
                        {?>
                            <div class="row" id="info_divorsed_div">
                              <div class="col-sm-25 col-sm-2 text-left">
                                    <label>Is divorsed? <span class="imp">*</span></label>
                                </div>
                                <div class="col-sm-35 col-sm-4 text-left">
                                    <?php
                                        $checked_is_divorsed_yes = '';
                                        if($stud_temp_data->if_divorced == 'yes')
                                        {
                                            $checked_is_divorsed_yes = 'checked';
                                        }
                                        $checked_is_divorsed_no = '';
                                        if($stud_temp_data->if_divorced == 'no')
                                        {
                                            $checked_is_divorsed_no = 'checked';
                                        }
                                    ?>
                                    <input type="radio" id="yes" name="info_is_divorsed" value="yes" <?php echo $checked_is_divorsed_yes;?> />&nbsp;&nbsp;<span>Yes</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    <input type="radio" id="no" name="info_is_divorsed" value="no"  <?php echo $checked_is_divorsed_no;?>/>&nbsp;&nbsp;<span>No</span>
                                </div>
                            </div>
                        <?php }else{ ?>
                            <div class="row" id="info_divorsed_div" style="display: none;">
                              <div class="col-sm-25 col-sm-2 text-left">
                                    <label>Is divorsed? <span class="imp">*</span> </label>
                                </div>
                                <div class="col-sm-35 col-sm-4 text-left">
                                    <input type="radio" id="yes" name="info_is_divorsed" value="yes" />&nbsp;&nbsp;<span>Yes</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    <input type="radio" id="no" name="info_is_divorsed" value="no" />&nbsp;&nbsp;<span>No</span>
                                </div>
                            </div>
                        <?php }
```
{{< /details >}}

## Code block 84
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `father_f_name` exists in the object `stud_temp_data`. If it exists, it returns the value of `father_f_name`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->father_f_name) ? $stud_temp_data->father_f_name : NULL;
```
{{< /details >}}

## Code block 85
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `father_m_name` exists in the object `$stud_temp_data`. If it exists, it returns the value of `father_m_name`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->father_m_name) ? $stud_temp_data->father_m_name : NULL;
```
{{< /details >}}

## Code block 86
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `father_s_name` exists in the object `$stud_temp_data`. If it exists, it returns the value of `father_s_name`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->father_s_name) ? $stud_temp_data->father_s_name : NULL;
```
{{< /details >}}

## Code block 87
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `father_email` exists in the object `stud_temp_data`. If it exists, it returns the value of `father_email`. Otherwise, it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->father_email) ? $stud_temp_data->father_email : NULL;
```
{{< /details >}}

## Code block 88
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the variable `$stud_temp_data->father_mobile_no` is set. If it is set, it trims any leading zeros from the value and returns it. If it is not set, it returns `NULL`.

### User Acceptance Criteria
```gherkin
Feature: Check if father mobile number is set

Scenario: Father mobile number is set
  Given The variable stud_temp_data->father_mobile_no is set
  When I call the function
  Then The function should return the father mobile number without leading zeros

Scenario: Father mobile number is not set
  Given The variable stud_temp_data->father_mobile_no is not set
  When I call the function
  Then The function should return NULL
```

### Refactoring
1. Use the null coalescing operator (`??`) instead of the ternary operator (`?`) to simplify the code.
2. Consider using a regular expression to remove leading zeros instead of the `ltrim` function.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->father_mobile_no) ? ltrim($stud_temp_data->father_mobile_no, '0') : NULL;
```
{{< /details >}}

## Code block 89
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array called $id_type. For each element in the array, it assigns the key to the variable $key and the value to the variable $val_fath_IDType. Inside the loop, it generates an HTML option element with the value attribute set to the key and the inner text set to the value. This option element is then echoed out using PHP. This code is typically used to generate a dropdown select list with options populated from an array.

### Refactoring
1. Instead of using the short open tag `<?php`, it is recommended to use the full open tag `<?php` for better compatibility.
2. The code could be refactored to use the `foreach` loop in a more concise way using the `as` keyword.
3. The HTML option element could be generated using string concatenation or a template engine for better readability.

{{< details "source code " >}}
```php
foreach ($id_type as $key => $val_fath_IDType) 
                                        {
                                            ?>
                                                <option value="<?php echo $key;?>"><?php echo $val_fath_IDType;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 90
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array called $blood_group. For each element in the array, it assigns the key to the variable $key and the value to the variable $father_blood_val. Inside the loop, it generates an HTML option element with the value attribute set to the key and the inner text set to the value. This option element is then echoed out using PHP. This code is typically used to generate a dropdown list of options based on the values in the $blood_group array.

### Refactoring
1. Instead of using the short open tags (`<?php`), it is recommended to use the full PHP opening tag (`<?php`).
2. The code could be refactored to use a more descriptive variable name instead of `$father_blood_val`.
3. It would be better to separate the HTML generation logic from the loop and use a templating engine or a separate view file to generate the options.

{{< details "source code " >}}
```php
foreach ($blood_group as $key => $father_blood_val) 
                                        {
                                            ?>
                                                <option value="<?php echo $key;?>"><?php echo $father_blood_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 91
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks if the `father_hobbies` property is set in the `stud_temp_data` object. If it is set, it splits the value by comma and stores the result in the `fath_arr` array.

### User Acceptance Criteria
```gherkin
Feature: Check father hobbies
Scenario: Father hobbies are set
Given The `father_hobbies` property is set in the `stud_temp_data` object
When I split the value by comma
Then I should get an array of hobbies stored in `fath_arr`
```

### Refactoring
The code can be refactored to use a ternary operator instead of an if statement. This can make the code more concise.

{{< details "source code " >}}
```php
$fath_arr = array();if(isset($stud_temp_data->father_hobbies))
                            {
                                $fath_arr = explode(",", $stud_temp_data->father_hobbies);
                            }
```
{{< /details >}}

## Code block 92
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks if the value 'Drawing' exists in the array $fath_arr and prints 'checked' if it does.

### Refactoring
1. Use a foreach loop instead of a for loop to iterate over the array.
2. Use the in_array() function to check if the value exists in the array.
3. Use a ternary operator to print 'checked' if the value exists.

{{< details "source code " >}}
```php
for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Drawing') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 93
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a loop that iterates over an array called `$fath_arr`. It checks each element of the array and if the element is equal to the string 'Painting', it prints 'checked'.

### Refactoring
The code can be refactored to use a foreach loop instead of a for loop. This would make the code more readable and eliminate the need for an index variable. Additionally, the code can be refactored to use the `in_array` function to check if the element exists in the array.

{{< details "source code " >}}
```php
for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Painting') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 94
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a loop that iterates over an array called `$fath_arr`. It checks each element of the array and if the element is equal to the string 'Swimming', it echoes the string 'checked'.

### Refactoring
1. Instead of using a `for` loop, you can use a `foreach` loop to iterate over the array. This can make the code more readable and less error-prone.
2. You can use the `in_array` function to check if the array contains the string 'Swimming'. This can simplify the code and make it more concise.

{{< details "source code " >}}
```php
for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Swimming') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 95
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a loop that iterates over an array called `$fath_arr`. It checks each element of the array and if the element is equal to the string 'Craft', it echoes the string 'checked'.

### Refactoring
1. Use a foreach loop instead of a for loop to iterate over the array.
2. Use the `in_array` function to check if the element exists in the array.
3. Use a ternary operator instead of an if statement to echo 'checked'.

{{< details "source code " >}}
```php
for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Craft') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 96
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a loop that iterates over an array called `$fath_arr`. It checks each element of the array and if the element is equal to the string 'Dance', it echoes the string 'checked'.

### Refactoring
The code can be refactored to use a foreach loop instead of a for loop. This would make the code more readable and eliminate the need for the index variable `$i`. Additionally, the code can be refactored to use the `in_array` function to check if the element exists in the array.

{{< details "source code " >}}
```php
for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Dance') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 97
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a loop that iterates over an array called `$fath_arr`. It checks each element of the array and if the element is equal to the string 'Photography', it echoes the string 'checked'.

### Refactoring
1. Instead of using a `for` loop, consider using a `foreach` loop to iterate over the array. This can make the code more readable and less error-prone.
2. Use a variable to store the value 'Photography' instead of hardcoding it in the loop. This can make the code more flexible and easier to maintain.

{{< details "source code " >}}
```php
for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Photography') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 98
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks if the value 'Singing' exists in the array $fath_arr and prints 'checked' if it does.

### Refactoring
1. Use a foreach loop instead of a for loop to iterate over the array.
2. Use the in_array() function to check if the value exists in the array.
3. Use a ternary operator to print 'checked' if the value exists.

{{< details "source code " >}}
```php
for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Singing') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 99
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a loop that iterates over an array called $fath_arr. It checks each element of the array and if the element is equal to 'Gardening', it prints 'checked'.

### Refactoring
1. Instead of using a for loop, you can use a foreach loop to iterate over the array.
2. You can use the in_array() function to check if 'Gardening' exists in the array.
3. You can use the implode() function to concatenate the 'checked' string for all matching elements and then print the result.

{{< details "source code " >}}
```php
for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Gardening') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 100
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a loop that iterates over an array called `$fath_arr`. It checks each element of the array and if the element is equal to the string 'Teaching', it prints 'checked'.

### Refactoring
1. Instead of using a `for` loop, you can use a `foreach` loop to iterate over the array. This can make the code more readable and less error-prone.
2. You can use the `in_array` function to check if the string 'Teaching' exists in the array. This can simplify the code and make it more concise.

{{< details "source code " >}}
```php
for ($i=0; $i < count($fath_arr); $i++) 
                                { 
                                    if ($fath_arr[$i] == 'Teaching') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 101
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `father_other_hobby` exists in the object `$stud_temp_data`. If it exists, it returns the value of `father_other_hobby`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->father_other_hobby) ? $stud_temp_data->father_other_hobby : NULL;
```
{{< /details >}}

## Code block 102
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array of qualifications. It checks if the father's education qualification is set and compares it with each qualification in the array. If a match is found, the 'selected' attribute is added to the option element. Finally, the option element is echoed with the qualification key as the value and the qualification value as the text.

### Refactoring
1. Use a more descriptive variable name instead of 'val_fath_qualification'.
2. Use a more descriptive variable name instead of 'fath_qualification_selected'.
3. Extract the logic for checking and setting the 'selected' attribute into a separate function.
4. Use a template engine or separate the HTML code from the PHP code for better separation of concerns.

{{< details "source code " >}}
```php
foreach ($qualification as $key => $val_fath_qualification) 
                                        {
                                            $fath_qualification_selected = '';
                                            if(isset($stud_temp_data->father_education))
                                            {
                                                $walsh_fath_qualification = strtolower($stud_temp_data->father_education);
                                            }

                                            if($walsh_fath_qualification != '')
                                            {
                                                if($walsh_fath_qualification == strtolower($key))
                                                {
                                                    $fath_qualification_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $fath_qualification_selected;?> value="<?php echo $key;?>"><?php echo $val_fath_qualification;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 103
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array of professions. For each profession, it checks if the profession matches the value stored in the `$stud_temp_data->father_profession` variable. If there is a match, it sets the `$fath_profession_selected` variable to 'selected'. Finally, it generates an HTML `<option>` element with the profession as the value and the profession name as the displayed text.

### Refactoring
1. Instead of using the `strtolower` function multiple times, it can be called once and the result can be stored in a variable.
2. The code can be refactored to use a ternary operator instead of an if-else statement to set the value of `$stud_temp_data->father_profession`.
3. The HTML generation can be extracted into a separate function for reusability.

{{< details "source code " >}}
```php
foreach ($profession as $key => $father_profession_val) 
                                        {
                                            $fath_profession_selected = '';
                                            $walsh_fath_profession = '';
                                            if(isset($stud_temp_data->father_profession))
                                            {
                                                if($stud_temp_data->father_profession == 'service-provider')
                                                {
                                                    $stud_temp_data->father_profession = str_replace('-',' ', $stud_temp_data->father_profession);
                                                }else{
                                                    $stud_temp_data->father_profession = str_replace('-','/', $stud_temp_data->father_profession);
                                                }
                                                $walsh_fath_profession = strtolower($stud_temp_data->father_profession);
                                            }

                                            if($walsh_fath_profession != '')
                                            {
                                                if($walsh_fath_profession == strtolower($key))
                                                {
                                                    $fath_profession_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $fath_profession_selected;?> value="<?php echo $key;?>"><?php echo $father_profession_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 104
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the variable $stud_temp_data->father_profession_other is set. If it is set, it returns the value of $stud_temp_data->father_profession_other. Otherwise, it returns NULL.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->father_profession_other) ? $stud_temp_data->father_profession_other : NULL;
```
{{< /details >}}

## Code block 105
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array of annual incomes. For each income, it checks if the father's annual income is set in the student's temporary data. If it is set, it converts the father's annual income to lowercase and compares it with the current key in the loop. If they match, it sets the 'selected' attribute for the option element. Finally, it generates an HTML option element with the key as the value and the income value as the text.

### Refactoring
1. Use a more descriptive variable name instead of 'fath_income_val'.
2. Extract the logic for checking and setting the 'selected' attribute into a separate function.
3. Use a template engine or a more structured approach to generate the HTML code.

{{< details "source code " >}}
```php
foreach ($annual_income as $key => $fath_income_val) 
                                        {
                                            $fath_income_selected = '';
                                            if(isset($stud_temp_data->father_annual_income))
                                            {
                                                $walsh_fath_income = strtolower($stud_temp_data->father_annual_income);
                                            }

                                            if($walsh_fath_income != '')
                                            {
                                                if($walsh_fath_income == strtolower($key))
                                                {
                                                    $fath_income_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $fath_income_selected;?> value="<?php echo $key;?>"><?php echo $fath_income_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 106
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `father_company_name` exists in the object `stud_temp_data`. If it exists, it returns the uppercase value of `father_company_name`. Otherwise, it returns `NULL`.

### User Acceptance Criteria
```gherkin
Feature: Check if father_company_name exists

Scenario: Property exists
  Given stud_temp_data is an object
  And stud_temp_data has a property father_company_name
  When the function isset is called with stud_temp_data and father_company_name
  Then it should return the uppercase value of father_company_name

Scenario: Property does not exist
  Given stud_temp_data is an object
  And stud_temp_data does not have a property father_company_name
  When the function isset is called with stud_temp_data and father_company_name
  Then it should return NULL
```

{{< details "source code " >}}
```php
echo isset($stud_temp_data->father_company_name) ? (strtoupper($stud_temp_data->father_company_name)): NULL;
```
{{< /details >}}

## Code block 107
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `father_designation` exists in the object `$stud_temp_data`. If it exists, it returns the uppercase value of `father_designation`. Otherwise, it returns `NULL`.

### User Acceptance Criteria
```gherkin
Feature: Check if father_designation exists

Scenario: Father designation exists
  Given The object stud_temp_data
  When The father_designation property exists
  Then Return the uppercase value of father_designation

Scenario: Father designation does not exist
  Given The object stud_temp_data
  When The father_designation property does not exist
  Then Return NULL
```

{{< details "source code " >}}
```php
echo isset($stud_temp_data->father_designation) ? (strtoupper($stud_temp_data->father_designation)): NULL;
```
{{< /details >}}

## Code block 108
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `father_office_address` exists in the object `$stud_temp_data`. If it exists, it returns the uppercase value of `father_office_address`. Otherwise, it returns `NULL`.

### User Acceptance Criteria
```gherkin
Feature: Check if father office address exists

Scenario: Father office address exists
  Given The object stud_temp_data
  When The father_office_address property exists
  Then Return the uppercase value of father_office_address

Scenario: Father office address does not exist
  Given The object stud_temp_data
  When The father_office_address property does not exist
  Then Return NULL
```

{{< details "source code " >}}
```php
echo isset($stud_temp_data->father_office_address) ? (strtoupper($stud_temp_data->father_office_address)): NULL;
```
{{< /details >}}

## Code block 109
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `mother_f_name` exists in the object `$stud_temp_data`. If it exists, it returns the value of `mother_f_name`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->mother_f_name) ? $stud_temp_data->mother_f_name : NULL;
```
{{< /details >}}

## Code block 110
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `mother_m_name` exists in the object `$stud_temp_data`. If it exists, it returns the value of `mother_m_name`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->mother_m_name) ? $stud_temp_data->mother_m_name : NULL;
```
{{< /details >}}

## Code block 111
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `mother_s_name` exists in the object `$stud_temp_data`. If it exists, it returns the value of `mother_s_name`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->mother_s_name) ? $stud_temp_data->mother_s_name : NULL;
```
{{< /details >}}

## Code block 112
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `mother_email_id` exists in the object `$stud_temp_data`. If it exists, it returns the value of `mother_email_id`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->mother_email_id) ? $stud_temp_data->mother_email_id : NULL;
```
{{< /details >}}

## Code block 113
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the variable `$stud_temp_data->mother_mobile_no` is set. If it is set, it trims any leading zeros from the value and returns it. If it is not set, it returns `NULL`.

### User Acceptance Criteria
```gherkin
Feature: Check if mother mobile number is set

Scenario: Mother mobile number is set
  Given The variable stud_temp_data->mother_mobile_no is set
  When I call the function
  Then The function should return the mother mobile number without leading zeros

Scenario: Mother mobile number is not set
  Given The variable stud_temp_data->mother_mobile_no is not set
  When I call the function
  Then The function should return NULL
```

### Refactoring
1. Use the null coalescing operator (`??`) instead of the ternary operator (`? :`) to simplify the code.
2. Consider using a regular expression to remove leading zeros instead of the `ltrim` function.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->mother_mobile_no) ? ltrim($stud_temp_data->mother_mobile_no, '0') : NULL;
```
{{< /details >}}

## Code block 114
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to generate a dropdown list of options based on the values in the $id_type array. It iterates over each element in the array and creates an <option> element with the key as the value and the value as the displayed text.

### Refactoring
1. Use a foreach loop instead of a for loop to iterate over the array.
2. Use a template string instead of concatenating the HTML code.
3. Extract the HTML code generation into a separate function for reusability.

{{< details "source code " >}}
```php
foreach ($id_type as $key => $val_moth_IDType) 
                                        {
                                        ?>
                                            <option value="<?php echo $key;?>"><?php echo $val_moth_IDType;?></option>
                                        <?php
                                        }
```
{{< /details >}}

## Code block 115
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array called $blood_group. For each iteration, it assigns the current key to the variable $key and the current value to the variable $mother_blood_group_val. Inside the loop, it generates an HTML option element with the value attribute set to the current key and the inner text set to the current value. This option element is then echoed out using PHP. This code is typically used to generate a dropdown list of options based on the values in the $blood_group array.

### Refactoring
There are no specific refactoring opportunities for this code snippet as it is a simple foreach loop that is already quite concise and readable.

{{< details "source code " >}}
```php
foreach ($blood_group as $key => $mother_blood_group_val) 
                                        {
                                            ?>
                                                <option value="<?php echo $key;?>"><?php echo $mother_blood_group_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 116
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet initializes an empty array called `fath_arr`. It then checks if the variable `$stud_temp_data->mother_hobbies` is set. If it is set, it splits the value of `$stud_temp_data->mother_hobbies` using the comma (`,`) as the delimiter and stores the resulting values in an array called `moth_arr`.

{{< details "source code " >}}
```php
$fath_arr = array();if(isset($stud_temp_data->mother_hobbies))
                            {
                                $moth_arr = explode(",", $stud_temp_data->mother_hobbies);
                            }
```
{{< /details >}}

## Code block 117
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a loop that iterates over an array called `moth_arr`. It checks each element of the array and if the element is equal to 'Drawing', it prints 'checked'.

### Refactoring
1. Instead of using a `for` loop, you can use a `foreach` loop to iterate over the elements of the array.
2. You can use the `in_array` function to check if 'Drawing' is present in the array.

{{< details "source code " >}}
```php
for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Drawing') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 118
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet iterates over an array called `moth_arr` and checks if each element is equal to the string 'Painting'. If a match is found, it prints 'checked'.

### Refactoring
1. Use a `foreach` loop instead of a `for` loop to iterate over the array.
2. Use the `in_array` function to check if 'Painting' exists in the array.
3. Extract the logic into a separate function for reusability.

{{< details "source code " >}}
```php
for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Painting') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 119
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a loop that iterates over an array called `moth_arr`. It checks each element of the array and if the element is equal to 'Swimming', it prints 'checked'.

### Refactoring
1. Instead of using a `for` loop, you can use a `foreach` loop to iterate over the elements of the array.
2. You can use the `in_array` function to check if 'Swimming' is present in the array.
3. Instead of printing 'checked', you can store the result in a variable and use it later in your code.

{{< details "source code " >}}
```php
for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Swimming') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 120
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a loop that iterates over an array called `moth_arr`. It checks each element of the array and if the element is equal to 'Craft', it prints 'checked'.

### Refactoring
1. Instead of using a `for` loop, you can use a `foreach` loop to iterate over the elements of the array.
2. You can use the `in_array` function to check if 'Craft' is present in the array.

{{< details "source code " >}}
```php
for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Craft') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 121
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a loop that iterates over an array called `moth_arr`. It checks each element of the array and if the element is equal to the string 'Dance', it prints 'checked'.

### Refactoring
1. Instead of using a `for` loop, you can use a `foreach` loop to iterate over the elements of the array.
2. You can use the `in_array` function to check if the element exists in the array instead of comparing each element individually.
3. You can use the `implode` function to concatenate the elements of the array into a string and then use the `strpos` function to check if the string contains the word 'Dance'.

{{< details "source code " >}}
```php
for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Dance') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 122
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a loop that iterates over an array called `moth_arr`. It checks each element of the array and if the element is equal to the string 'Photography', it prints 'checked'.

### Refactoring
1. Instead of using a `for` loop, you can use a `foreach` loop to iterate over the array. This can make the code more readable and less error-prone.
2. You can use the `in_array` function to check if the element exists in the array instead of comparing each element individually.
3. You can use the `implode` function to concatenate the elements of the array into a string and then use the `strpos` function to check if the string contains the word 'Photography'. This can simplify the code and make it more efficient.

{{< details "source code " >}}
```php
for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Photography') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 123
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet iterates over an array called `moth_arr` and checks if each element is equal to the string 'Singing'. If a match is found, it prints 'checked'.

### Refactoring
1. Use a `foreach` loop instead of a `for` loop to iterate over the array.
2. Use the `in_array` function to check if 'Singing' is present in the array.
3. Use a more descriptive variable name instead of `$moth_arr`.

{{< details "source code " >}}
```php
for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Singing') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 124
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks if the value 'Gardening' exists in the array $moth_arr and if it does, it echoes 'checked'.

### Refactoring
1. Use a foreach loop instead of a for loop to iterate over the array.
2. Use the in_array() function to check if 'Gardening' exists in the array.
3. Use a ternary operator to echo 'checked' if the condition is true.

{{< details "source code " >}}
```php
for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Gardening') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 125
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks if the value 'Teaching' exists in the array $moth_arr and prints 'checked' if it does.

### Refactoring
1. Use a foreach loop instead of a for loop to iterate over the array.
2. Use the in_array() function to check if the value exists in the array.
3. Use a ternary operator to print 'checked' if the value exists.

{{< details "source code " >}}
```php
for ($i=0; $i < count($moth_arr); $i++) 
                                { 
                                    if ($moth_arr[$i] == 'Teaching') 
                                    {
                                       echo 'checked';
                                    }
                                }
```
{{< /details >}}

## Code block 126
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `mother_other_hobbies` exists in the object `$stud_temp_data`. If it exists, it returns the value of `mother_other_hobbies`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->mother_other_hobbies) ? $stud_temp_data->mother_other_hobbies : NULL;
```
{{< /details >}}

## Code block 127
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array of qualifications. For each qualification, it checks if it matches the father's education stored in the `$stud_temp_data` variable. If there is a match, the option is marked as selected in the HTML dropdown list. Finally, the option is displayed in the dropdown list.

### Refactoring
1. Use a more descriptive variable name instead of `$val_moth_qualification`.
2. Extract the logic for checking the selected qualification into a separate function.
3. Use a templating engine to generate the HTML code instead of mixing PHP and HTML.

{{< details "source code " >}}
```php
foreach ($qualification as $key => $val_moth_qualification) 
                                        {
                                            $moth_qualification_selected = '';
                                            if(isset($stud_temp_data->father_education))
                                            {
                                                $walsh_moth_qualification = strtolower($stud_temp_data->father_education);
                                            }

                                            if($walsh_moth_qualification != '')
                                            {
                                                if($walsh_moth_qualification == strtolower($key))
                                                {
                                                    $moth_qualification_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $moth_qualification_selected;?> value="<?php echo $key;?>"><?php echo $val_moth_qualification;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 128
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to generate a dropdown list of qualifications. It iterates over an array of qualifications and creates an option element for each qualification.

### Refactoring
1. Use a foreach loop instead of a for loop to iterate over the qualifications array.
2. Use a template string instead of concatenating the HTML code.
3. Move the HTML code to a separate function for better separation of concerns.

{{< details "source code " >}}
```php
foreach ($qualification as $key => $val_moth_qualification) 
                                        {
                                            ?>
                                                <option value="<?php echo $key;?>"><?php echo $val_moth_qualification;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 129
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array of moth professions. For each profession, it checks if the mother's profession in the student's temporary data matches the current profession. If it does, it sets the 'selected' attribute for the option element. Finally, it generates an HTML option element with the profession as the value and the profession name as the text.

### Refactoring
1. Instead of using the `foreach` loop, consider using the `array_map` function to transform the array of moth professions into an array of option elements. This can make the code more concise and easier to understand.
2. Extract the logic for checking if the mother's profession matches the current profession into a separate function. This can improve code readability and maintainability.
3. Consider using a template engine or a front-end framework to generate the HTML code. This can separate the presentation logic from the business logic and make the code more modular.

{{< details "source code " >}}
```php
foreach ($moth_profession_array as $key => $moth_profession_val) 
                                        {
                                            $moth_profession_selected = '';
                                            $walsh_moth_profession = '';
                                            if(isset($stud_temp_data->mother_profession))
                                            {
                                                if($stud_temp_data->mother_profession == 'service-provider')
                                                {
                                                    $stud_temp_data->mother_profession = str_replace('-',' ', $stud_temp_data->mother_profession);
                                                }else{
                                                    $stud_temp_data->mother_profession = str_replace('-','/', $stud_temp_data->mother_profession);
                                                }
                                                $walsh_moth_profession = strtolower($stud_temp_data->mother_profession);
                                            }

                                            if($walsh_moth_profession != '')
                                            {
                                                if($walsh_moth_profession == strtolower($key))
                                                {
                                                    $moth_profession_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $moth_profession_selected;?> value="<?php echo $key;?>"><?php echo $moth_profession_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 130
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the variable $stud_temp_data->mother_profession_other is set. If it is set, it returns the value of $stud_temp_data->mother_profession_other. Otherwise, it returns NULL.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->mother_profession_other) ? $stud_temp_data->mother_profession_other : NULL;
```
{{< /details >}}

## Code block 131
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array of annual incomes. For each element in the array, it generates an HTML option element with the key as the value and the monthly income value as the displayed text.

### Refactoring
1. Use a more descriptive variable name instead of `$key` and `$moth_income_val`.
2. Consider using a template engine or a separate HTML file for generating the HTML code.
3. Add error handling for cases where the array is empty or not an array.

{{< details "source code " >}}
```php
foreach ($annual_income as $key => $moth_income_val) 
                                        {
                                            ?>
                                                <option value="<?php echo $key;?>"><?php echo $moth_income_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 132
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array of annual incomes. For each income, it checks if the mother's annual income is set and if it matches the current income. If it does, it sets the 'selected' attribute for the option element. Finally, it generates an HTML option element with the income key as the value and the income value as the displayed text.

### Refactoring
1. Use a more descriptive variable name instead of 'moth_income_val'.
2. Use a more descriptive variable name instead of 'key'.
3. Extract the logic for checking and setting the 'selected' attribute into a separate function.
4. Consider using a template engine to generate the HTML code instead of mixing PHP and HTML.
5. Consider using a more structured approach, such as MVC, to separate the logic from the presentation.

{{< details "source code " >}}
```php
foreach ($annual_income as $key => $moth_income_val) 
                                        {
                                            $moth_income_selected = '';
                                            if(isset($stud_temp_data->mother_annual_income))
                                            {
                                                $walsh_moth_income = strtolower($stud_temp_data->mother_annual_income);
                                            }

                                            if($walsh_moth_income != '')
                                            {
                                                if($walsh_moth_income == strtolower($key))
                                                {
                                                    $moth_income_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $moth_income_selected;?> value="<?php echo $key;?>"><?php echo $moth_income_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 133
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `mother_company_name` exists in the object `$stud_temp_data`. If it exists, it returns the value of `mother_company_name`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo (isset($stud_temp_data->mother_company_name))?$stud_temp_data->mother_company_name: NULL;
```
{{< /details >}}

## Code block 134
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the variable `$stud_temp_data->mother_designation` is set. If it is set, it returns the value of `$stud_temp_data->mother_designation`. Otherwise, it returns `NULL`.

{{< details "source code " >}}
```php
echo (isset($stud_temp_data->mother_designation))?$stud_temp_data->mother_designation: NULL;
```
{{< /details >}}

## Code block 135
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `mother_office_address` exists in the object `$stud_temp_data`. If it exists, it returns the value of `mother_office_address`. Otherwise, it returns `NULL`.

### User Acceptance Criteria
```gherkin
Feature: Check if `mother_office_address` exists

Scenario: Property exists
  Given `$stud_temp_data` is an object
  And `mother_office_address` property exists in `$stud_temp_data`
  When the function is called
  Then it should return the value of `mother_office_address`

Scenario: Property does not exist
  Given `$stud_temp_data` is an object
  And `mother_office_address` property does not exist in `$stud_temp_data`
  When the function is called
  Then it should return `NULL`
```

{{< details "source code " >}}
```php
echo (isset($stud_temp_data->mother_office_address))?$stud_temp_data->mother_office_address: NULL;
```
{{< /details >}}

## Code block 136
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `guardian_f_name` exists in the object `$stud_temp_data`. If it exists, it returns the value of `guardian_f_name`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->guardian_f_name) ? $stud_temp_data->guardian_f_name : NULL;
```
{{< /details >}}

## Code block 137
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `guardian_m_name` exists in the object `$stud_temp_data`. If it exists, it returns the value of `guardian_m_name`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->guardian_m_name) ? $stud_temp_data->guardian_m_name : NULL;
```
{{< /details >}}

## Code block 138
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `guardian_s_name` exists in the object `$stud_temp_data`. If it exists, it returns the value of `guardian_s_name`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->guardian_s_name) ? $stud_temp_data->guardian_s_name : NULL;
```
{{< /details >}}

## Code block 139
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the `guardian_email_id` property exists in the `$stud_temp_data` object. If it exists, it returns the value of `guardian_email_id`, otherwise it returns `NULL`.

### User Acceptance Criteria
```gherkin
Feature: Check if guardian email id exists

Scenario: Guardian email id exists
  Given The `$stud_temp_data` object
  When The `guardian_email_id` property exists
  Then Return the value of `guardian_email_id`

Scenario: Guardian email id does not exist
  Given The `$stud_temp_data` object
  When The `guardian_email_id` property does not exist
  Then Return NULL
```

{{< details "source code " >}}
```php
echo isset($stud_temp_data->guardian_email_id) ? $stud_temp_data->guardian_email_id : NULL;
```
{{< /details >}}

## Code block 140
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the `guardian_mobile_no` property of the `$stud_temp_data` object is set. If it is set, it trims any leading zeros from the value and returns it. If it is not set, it returns `NULL`.

### User Acceptance Criteria
```gherkin
Feature: Check if guardian mobile number is set

Scenario: Guardian mobile number is set
  Given The `guardian_mobile_no` property of the `$stud_temp_data` object is set
  When The function `issetGuardianMobileNo` is called
  Then The function should return the trimmed value of `guardian_mobile_no`

Scenario: Guardian mobile number is not set
  Given The `guardian_mobile_no` property of the `$stud_temp_data` object is not set
  When The function `issetGuardianMobileNo` is called
  Then The function should return NULL
```

{{< details "source code " >}}
```php
echo isset($stud_temp_data->guardian_mobile_no) ? ltrim($stud_temp_data->guardian_mobile_no, '0') : NULL;
```
{{< /details >}}

## Code block 141
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array of professions. For each profession, it checks if the guardian profession in the student data matches the current profession. If it does, it sets the `guardian_profession_selected` variable to 'selected'. Finally, it generates an HTML option element with the profession as the value and the profession value as the text.

### Refactoring
1. Use a more descriptive variable name instead of `guardian_profession_selected`.
2. Use a more descriptive variable name instead of `walsh_guardian_profession`.
3. Extract the logic for checking if the guardian profession matches into a separate function.
4. Use a template engine or a more structured approach to generate the HTML option elements.

{{< details "source code " >}}
```php
foreach ($profession as $key => $guardian_profession_val) 
                                        {
                                            $guardian_profession_selected = '';
                                            $walsh_guardian_profession = '';
                                            if(isset($stud_temp_data->guardian_profession))
                                            {
                                                if($stud_temp_data->guardian_profession == 'service-provider')
                                                {
                                                    $stud_temp_data->guardian_profession = str_replace('-',' ', $stud_temp_data->guardian_profession);
                                                }else{
                                                    $stud_temp_data->guardian_profession = str_replace('-','/', $stud_temp_data->guardian_profession);
                                                }
                                                $walsh_guardian_profession = strtolower($stud_temp_data->guardian_profession);
                                            }

                                            if($walsh_guardian_profession != '')
                                            {
                                                if($walsh_guardian_profession == strtolower($key))
                                                {
                                                    $guardian_profession_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $guardian_profession_selected;?> value="<?php echo $key;?>"><?php echo $guardian_profession_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 142
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array called $annual_income. For each element in the array, it assigns the key to the variable $key and the value to the variable $guardian_income_val. Inside the loop, it generates an HTML option element with the value attribute set to the key and the inner text set to the value. This option element is then echoed out to the output. This code is typically used in HTML forms to generate a dropdown list of options based on an array.

### Refactoring
1. Use a more descriptive variable name instead of $annual_income.
2. Consider using a foreach loop with the shorthand syntax instead of the verbose syntax.
3. Extract the HTML generation code into a separate function for reusability.
4. Consider using a templating engine to generate the HTML instead of echoing it out directly.

{{< details "source code " >}}
```php
foreach ($annual_income as $key => $guardian_income_val) 
                                        {
                                            ?>
                                                <option value="<?php echo $key;?>"><?php echo $guardian_income_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 143
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array of annual incomes. For each income, it checks if the guardian's annual income is set and if it matches the current income. If it does, it sets the 'selected' attribute for the option element. Finally, it generates an HTML option element with the income as the value and the corresponding label.

### Refactoring
1. Use a more descriptive variable name instead of 'key' for the key of the array.
2. Extract the logic for checking and setting the 'selected' attribute into a separate function.
3. Consider using a template engine or a more structured approach for generating the HTML code.

{{< details "source code " >}}
```php
foreach ($annual_income as $key => $guardian_income_val) 
                                        {
                                            $guard_income_selected = '';
                                            if(isset($stud_temp_data->guardian_annual_income))
                                            {
                                                $walsh_guard_income = strtolower($stud_temp_data->guardian_annual_income);
                                            }

                                            if($walsh_guard_income != '')
                                            {
                                                if($walsh_guard_income == strtolower($key))
                                                {
                                                    $guard_income_selected = 'selected';
                                                }
                                            }
                                            ?>
                                                <option <?php echo $guard_income_selected;?> value="<?php echo $key;?>"><?php echo $guardian_income_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 144
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array called $annual_income. For each element in the array, it assigns the key to the variable $key and the value to the variable $guardian_income_val. Inside the loop, it generates an HTML option element with the value attribute set to the key and the inner text set to the value. This option element is then echoed out to the output. This code is typically used in HTML forms to generate a dropdown list of options based on an array.

### Refactoring
1. Use a more descriptive variable name instead of $annual_income.
2. Consider using a foreach loop with the shorthand syntax instead of the verbose syntax.
3. Extract the HTML generation code into a separate function for reusability.
4. Consider using a templating engine to generate the HTML instead of echoing it out directly.

{{< details "source code " >}}
```php
foreach ($annual_income as $key => $guardian_income_val) 
                                        {
                                            ?>
                                                <option value="<?php echo $key;?>"><?php echo $guardian_income_val;?></option>
                                            <?php
                                        }
```
{{< /details >}}

## Code block 145
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the variable `$stud_temp_data->guardian_add1` is set. If it is set, it returns the value of `$stud_temp_data->guardian_add1`. Otherwise, it returns `NULL`.

{{< details "source code " >}}
```php
echo (isset($stud_temp_data->guardian_add1))?$stud_temp_data->guardian_add1: NULL;
```
{{< /details >}}

## Code block 146
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the variable `$stud_temp_data->guardian_add2` is set. If it is set, it returns the value of `$stud_temp_data->guardian_add2`. Otherwise, it returns `NULL`.

{{< details "source code " >}}
```php
echo (isset($stud_temp_data->guardian_add2))?$stud_temp_data->guardian_add2: NULL;
```
{{< /details >}}

## Code block 147
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the 'guardian_area' key exists in the 'student_api_data' array. If it exists, it returns the value associated with the key. Otherwise, it returns NULL.

{{< details "source code " >}}
```php
echo isset($student_api_data['guardian_area']) ? $student_api_data['guardian_area'] : NULL;
```
{{< /details >}}

## Code block 148
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the 'guardian_landmark' key exists in the 'student_api_data' array. If it exists, it returns the value associated with the key. Otherwise, it returns NULL.

{{< details "source code " >}}
```php
echo isset($student_api_data['guardian_landmark']) ? $student_api_data['guardian_landmark'] : NULL;
```
{{< /details >}}

## Code block 149
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `guardian_city` exists in the object `stud_temp_data`. If it exists, it returns the value of `guardian_city`. Otherwise, it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->guardian_city) ? $stud_temp_data->guardian_city : NULL;
```
{{< /details >}}

## Code block 150
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the `guardian_pin` property exists in the `$stud_temp_data` object. If it exists, it returns the value of `guardian_pin`, otherwise it returns `NULL`.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->guardian_pin) ? $stud_temp_data->guardian_pin : NULL;
```
{{< /details >}}

## Code block 151
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `day_care_contact_info` exists in the object `$stud_temp_data`. If it exists, it returns the value of `day_care_contact_info`. Otherwise, it returns `NULL`.

{{< details "source code " >}}
```php
echo (isset($stud_temp_data->day_care_contact_info))?$stud_temp_data->day_care_contact_info : NULL;
```
{{< /details >}}

## Code block 152
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function retrieves the value of the 'lms_id' property from the 'stud_temp_data' object.

{{< details "source code " >}}
```php
echo $stud_temp_data->lms_id
```
{{< /details >}}

## Code block 153
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks the value of the `bus_service_required` property of the `stud_temp_data` object and sets the `checked_bus_yes` and `checked_bus_no` variables accordingly. If the `bus_service_required` property is equal to '1', the `checked_bus_yes` variable is set to 'checked'. If the `bus_service_required` property is equal to '0', the `checked_bus_no` variable is set to 'checked'.

{{< details "source code " >}}
```php
$checked_bus_yes = '';if ($stud_temp_data->bus_service_required == '1') {
                                        $checked_bus_yes = 'checked';
                                    }$checked_bus_no = '';if ($stud_temp_data->bus_service_required =='0') 
                                    {
                                        $checked_bus_no = 'checked';
                                    }
```
{{< /details >}}

## Code block 154
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$checked_bus_yes` variable is being echoed. It is assumed that this variable holds a boolean value indicating whether a bus has been checked or not.

{{< details "source code " >}}
```php
echo $checked_bus_yes;
```
{{< /details >}}

## Code block 155
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The variable `$checked_bus_no` is being echoed. It is assumed that this variable holds the value of a checked bus number.

{{< details "source code " >}}
```php
echo $checked_bus_no;
```
{{< /details >}}

## Code block 156
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks the value of the `catering` property of the `$stud_temp_data` object. If the value is '1', it sets the variable `$checked_catering_yes` to 'checked'. If the value is '0', it sets the variable `$checked_catering_no` to 'checked'.

{{< details "source code " >}}
```php
if ($stud_temp_data->catering == '1') 
                                    {
                                        $checked_catering_yes = 'checked';
                                    }if ($stud_temp_data->catering == '0') 
                                    {
                                         $checked_catering_no = 'checked';
                                    }
```
{{< /details >}}

## Code block 157
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The variable `$checked_catering_yes` is being echoed. It is assumed that this variable holds a boolean value indicating whether catering is checked or not.

{{< details "source code " >}}
```php
echo $checked_catering_yes;
```
{{< /details >}}

## Code block 158
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The variable `$checked_catering_no` is being echoed. It is assumed that this variable holds a value that needs to be displayed to the user.

{{< details "source code " >}}
```php
echo $checked_catering_no;
```
{{< /details >}}

## Code block 159
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is used to set the value of two variables based on the value of `$stud_temp_data->student_bro_sis_inschool`. If the value is '1', then `$checked_sisbroschool_yes` is set to 'checked'. If the value is '0', then `$checked_sisbroschool_no` is set to 'checked'.

### Refactoring
1. Use a ternary operator instead of if-else statements.
2. Use a switch statement instead of multiple if-else statements.

{{< details "source code " >}}
```php
$checked_sisbroschool_yes = '';if ($stud_temp_data->student_bro_sis_inschool == '1') {
                                        $checked_sisbroschool_yes = 'checked';
                                    }$checked_sisbroschool_no = '';if ($stud_temp_data->student_bro_sis_inschool == '0') {
                                        $checked_sisbroschool_no = 'checked';
                                    }
```
{{< /details >}}

## Code block 160
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$checked_sisbroschool_yes` variable is being echoed. It is assumed that this variable holds a boolean value indicating whether the user has checked the 'Sisbro School' option. The purpose of echoing this variable is to display the user's selection on the webpage.

{{< details "source code " >}}
```php
echo $checked_sisbroschool_yes;
```
{{< /details >}}

## Code block 161
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$checked_sisbroschool_no` variable is being echoed. It is assumed that this variable has been previously defined and assigned a value.

{{< details "source code " >}}
```php
echo $checked_sisbroschool_no;
```
{{< /details >}}

## Code block 162
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a conditional statement that checks if the value of `$stud_temp_data->student_bro_sis_inschool` is equal to '1'. If it is, then it displays a text input field with the id 'info_brosisrefno_div' and pre-populates it with the value of `$stud_temp_data->student_bro_sis_ref_no` if it is set. If the value of `$stud_temp_data->student_bro_sis_inschool` is not equal to '1', then it hides the text input field.

### Refactoring
1. Use a ternary operator instead of an if-else statement to make the code more concise.
2. Extract the logic into a separate function to improve code reusability and maintainability.

{{< details "source code " >}}
```php
if ($stud_temp_data->student_bro_sis_inschool == '1') 
                                    {
                                ?>
                                    <div id="info_brosisrefno_div">
                                        <input type="text" class="form-control" name="info_brosisrefno" id="info_brosisrefno" value="<?php echo isset($stud_temp_data->student_bro_sis_ref_no) ? $stud_temp_data->student_bro_sis_ref_no : NULL; ?>" placeholder="Enter Ref. No">
                                    </div>
                                <?php }else{ ?>
                                    <div id="info_brosisrefno_div">
                                        <input type="text" class="form-control" name="info_brosisrefno" id="info_brosisrefno" placeholder="Enter Ref. No" style="display: none">
                                    </div>
                                <?php }
```
{{< /details >}}

## Code block 163
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet checks the value of the `student_isexistingstudent` property of the `stud_temp_data` object and sets the `checked_exist_student_yes` and `checked_exist_student_no` variables accordingly. If the value is '1', the `checked_exist_student_yes` variable is set to 'checked'. If the value is '0', the `checked_exist_student_no` variable is set to 'checked'.

### Refactoring
1. Use a ternary operator instead of if-else statements to simplify the code.
2. Consider using a switch statement if there are more than two possible values for `student_isexistingstudent`.

{{< details "source code " >}}
```php
$checked_exist_student_yes = '';if ($stud_temp_data->student_isexistingstudent == '1') {
                                        $checked_exist_student_yes = 'checked';
                                    }$checked_exist_student_no = '';if ($stud_temp_data->student_isexistingstudent == '0') {
                                        $checked_exist_student_no = 'checked';
                                    }
```
{{< /details >}}

## Code block 164
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$checked_exist_student_yes` variable is used to store the result of a check for the existence of a student. It is a boolean variable that indicates whether a student exists or not.

{{< details "source code " >}}
```php
echo $checked_exist_student_yes;
```
{{< /details >}}

## Code block 165
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$checked_exist_student_no` variable is used to store the result of checking whether a student number exists in the system. It is typically used in conditional statements to determine if a student number is valid or not.

{{< details "source code " >}}
```php
echo $checked_exist_student_no;
```
{{< /details >}}

## Code block 166
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a conditional statement that checks if the value of `$stud_temp_data->student_isexistingstudent` is equal to '1'. If it is, then it displays a `<div>` element with an input field for the existing reference number. If it is not, then it displays the same `<div>` element but with the input field hidden.

### Refactoring
1. Instead of using the `<?php echo isset($stud_temp_data->student_existing_ref_number) ? $stud_temp_data->student_existing_ref_number : NULL; ?>` syntax, the code could be refactored to use the null coalescing operator `??` for better readability.
2. The `maxlength` attribute of the input field could be extracted into a constant or variable to improve maintainability.
3. The `style` attribute could be extracted into a CSS class to separate the styling from the HTML markup.

{{< details "source code " >}}
```php
if ($stud_temp_data->student_isexistingstudent == '1') {
                                ?>
                                    <div id="exis_refnolabel_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="exis_refnolabel" id="exis_refnolabel" value="<?php echo isset($stud_temp_data->student_existing_ref_number) ? $stud_temp_data->student_existing_ref_number : NULL; ?>" placeholder="Ref No" maxlength="10">
                                    </div>
                                <?php }else{ ?>
                                    <div id="exis_refnolabel_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="exis_refnolabel" id="exis_refnolabel" placeholder="Ref No" maxlength="10" style="display: none">
                                    </div>
                                <?php }
```
{{< /details >}}

## Code block 167
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is used to set the value of two variables based on the value of `$stud_temp_data->student_isdisability`. If the value is 'yes', then `$checked_isdisability_yes` is set to 'checked'. If the value is 'no', then `$checked_isdisability_no` is set to 'checked'.

### Refactoring
1. Use a ternary operator instead of if-else statements to simplify the code.
2. Consider using a switch statement if there are more than two possible values for `$stud_temp_data->student_isdisability`.

{{< details "source code " >}}
```php
$checked_isdisability_yes = '';if ($stud_temp_data->student_isdisability == 'yes') {
                                        $checked_isdisability_yes = 'checked';
                                    }$checked_isdisability_no = '';if ($stud_temp_data->student_isdisability == 'no') {
                                        $checked_isdisability_no = 'checked';
                                    }
```
{{< /details >}}

## Code block 168
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$checked_isdisability_yes` variable is used to store the value of a checkbox input field that indicates whether a person has a disability. It is typically used in a form submission process to determine if the user has selected the option for having a disability.

{{< details "source code " >}}
```php
echo $checked_isdisability_yes;
```
{{< /details >}}

## Code block 169
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$checked_isdisability_no` variable is used to store the value of the 'Is Disability' checkbox when it is unchecked. It is typically used in conditional statements to determine if the checkbox is unchecked.

{{< details "source code " >}}
```php
echo $checked_isdisability_no;
```
{{< /details >}}

## Code block 170
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a conditional statement that checks if the student has a disability. If the student has a disability, a text input field is displayed where the student can describe their disability. If the student does not have a disability, the text input field is hidden.

### Refactoring
1. Use a ternary operator instead of an if-else statement to make the code more concise.
2. Move the HTML code for the input field into a separate function or template to improve code organization and reusability.

{{< details "source code " >}}
```php
if ($stud_temp_data->student_isdisability == 'yes') {
                                ?>
                                    <div id="info_disability_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="info_disability" id="info_disability" value="<?php echo isset($stud_temp_data->student_disability_name) ? $stud_temp_data->student_disability_name : NULL; ?>" placeholder="Describe Disability">
                                    </div>
                                <?php }else{ ?>
                                    <div id="info_disability_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="info_disability" id="info_disability" placeholder="Describe Disability" style="display: none">
                                    </div>
                                <?php }
```
{{< /details >}}

## Code block 171
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is used to set the values of two variables based on the value of `$stud_temp_data->allergies`. If the value is 'yes', then `$checked_allergies_yes` is set to 'checked'. If the value is 'no', then `$checked_allergies_no` is set to 'checked'.

### Refactoring
1. Use a ternary operator instead of if-else statements to simplify the code.
2. Consider using a switch statement if there are more than two possible values for `$stud_temp_data->allergies`.

{{< details "source code " >}}
```php
$checked_allergies_yes = '';if ($stud_temp_data->allergies == 'yes') {
                                        $checked_allergies_yes = 'checked';
                                    }$checked_allergies_no = '';if ($stud_temp_data->allergies == 'no') {
                                        $checked_allergies_no = 'checked';
                                    }
```
{{< /details >}}

## Code block 172
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The variable `$checked_allergies_yes` is a boolean variable that stores whether all allergies have been checked or not. It is typically used in conditional statements to determine the flow of the program based on whether all allergies have been checked or not.

{{< details "source code " >}}
```php
echo $checked_allergies_yes;
```
{{< /details >}}

## Code block 173
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The variable `$checked_allergies_no` is used to store the value of whether all allergies have been checked or not. It is a boolean variable that can have two possible values: `true` if all allergies have been checked, and `false` if not.

{{< details "source code " >}}
```php
echo $checked_allergies_no;
```
{{< /details >}}

## Code block 174
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a conditional statement that checks if the variable `$stud_temp_data->allergies` is equal to 'yes'. If it is, a `<div>` element with the id `info_allergies_div` is displayed, containing an input field for describing allergies. The value of the input field is set to the value of `$stud_temp_data->other_allergies` if it is set, otherwise it is set to `NULL`. If the variable is not equal to 'yes', the `<div>` element is still displayed, but the input field is hidden.

### Refactoring
1. Instead of using PHP tags to switch between HTML code, consider using a templating engine like Twig or Blade to separate the logic from the presentation.
2. Extract the logic into a separate function to improve readability and maintainability.
3. Use a more descriptive variable name instead of `$stud_temp_data`.

{{< details "source code " >}}
```php
if ($stud_temp_data->allergies == 'yes') {
                                ?>
                                    <div id="info_allergies_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="allergies" id="allergies" value="<?php echo isset($stud_temp_data->other_allergies) ? $stud_temp_data->other_allergies : NULL; ?>" placeholder="Describe Allergies" >
                                    </div>
                                <?php }else{ ?>
                                    <div id="info_allergies_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="allergies" id="allergies" placeholder="Describe Allergies" style="display: none">
                                    </div>
                                <?php }
```
{{< /details >}}

## Code block 175
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the variable `$stud_temp_data->student_primary_contact_number` is set. If it is set, it trims any leading zeros from the value and returns it. If it is not set, it returns `NULL`.

### User Acceptance Criteria
```gherkin
Feature: Trim leading zeros from student primary contact number

Scenario: Primary contact number is set
  Given The variable stud_temp_data->student_primary_contact_number is set
  When The function isset is called
  Then The function ltrim is called with the value of stud_temp_data->student_primary_contact_number and '0' as parameters
  And The trimmed value is returned

Scenario: Primary contact number is not set
  Given The variable stud_temp_data->student_primary_contact_number is not set
  When The function isset is called
  Then NULL is returned
```

### Refactoring
1. Use a more descriptive variable name instead of `$stud_temp_data->student_primary_contact_number`.
2. Consider using a ternary operator instead of the `isset` function to check if the variable is set.
3. Consider using a regular expression to remove leading zeros instead of the `ltrim` function.

{{< details "source code " >}}
```php
echo isset($stud_temp_data->student_primary_contact_number) ? ltrim($stud_temp_data->student_primary_contact_number, '0') : NULL;
```
{{< /details >}}

## Code block 176
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function checks if the property `student_emergency_contact_no` exists in the object `$stud_temp_data`. If it exists, it trims any leading zeros from the value and returns it. If it doesn't exist, it returns `NULL`.

### User Acceptance Criteria
```gherkin
Feature: Check if student emergency contact number exists

Scenario: Property exists
  Given The object has a property named 'student_emergency_contact_no'
  When The function isset is called with the object and property name
  Then The function should return the value of the property with leading zeros trimmed

Scenario: Property does not exist
  Given The object does not have a property named 'student_emergency_contact_no'
  When The function isset is called with the object and property name
  Then The function should return NULL
```

{{< details "source code " >}}
```php
echo isset($stud_temp_data->student_emergency_contact_no) ? ltrim($stud_temp_data->student_emergency_contact_no, '0') : NULL;
```
{{< /details >}}

## Code block 177
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to generate a dropdown list of handicap options. It iterates over an array of handicap values and creates an option element for each value.

### Refactoring
1. Use a foreach loop instead of a for loop to iterate over the array.
2. Use a template string instead of concatenating the key and value in the option element.
3. Consider using a more descriptive variable name for the array.

{{< details "source code " >}}
```php
foreach ($handicap as $key => $handicap_val) 
                                        {
                                        ?>
                                            <option value="<?php echo $key;?>"><?php echo $handicap_val;?></option>
                                        <?php
                                        }
```
{{< /details >}}

## Code block 178
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is checking if the variable `$stud_temp_data` is set. If it is set, it will display a label with the text 'Referral Student: *' and a CSS class 'label_color'. If it is not set, it will display a label with the text 'Referral Student: *'.

### Refactoring
1. Use a ternary operator instead of the if-else statement to make the code more concise.
2. Consider using a CSS class for the label styling instead of inline CSS.

{{< details "source code " >}}
```php
if (isset($stud_temp_data)) 
                                {
                                ?>
                                    <label class="label_color">Referral Student:&nbsp;<span class="imp">*</span></label>
                                <?php } else{ ?>
                                    <label>Referral Student:&nbsp;<span class="imp">*</span></label>
                                <?php }
```
{{< /details >}}

## Code block 179
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is used to set the values of two variables based on the value of `$stud_temp_data->student_referral`. If the value is 'yes', then `$checked_yes` is set to 'checked' and `$disabled` is set to 'disabled'. If the value is 'no', then `$checked_no` is set to 'checked'.

### Refactoring
1. Use a ternary operator instead of if-else statements to make the code more concise.
2. Use meaningful variable names to improve code readability.

{{< details "source code " >}}
```php
$checked_yes = '';$disabled = '';if($stud_temp_data->student_referral == 'yes')
                                    {
                                        $checked_yes = 'checked';
                                        $disabled = 'disabled';
                                    }$checked_no = '';if($stud_temp_data->student_referral == 'no')
                                    {
                                        $checked_no = 'checked';
                                    }
```
{{< /details >}}

## Code block 180
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `echo` function is used to output one or more strings. It takes a variable or a string as an argument and displays it on the screen.

### Refactoring
There are no specific refactoring opportunities for the `echo` function as it is a built-in PHP function.

{{< details "source code " >}}
```php
echo $checked_yes;
```
{{< /details >}}

## Code block 181
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `echo` function is used to output one or more strings. In this case, the variable `$checked_no` is being echoed, which means its value will be displayed on the screen.

{{< details "source code " >}}
```php
echo $checked_no;
```
{{< /details >}}

## Code block 182
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is checking if the variable `$stud_temp_data` is set. If it is set, it will display a label with the text 'Referral Student School: *' and a CSS class 'label_color'. If it is not set, it will display a label with the text 'Referral Student School: *'.

### Refactoring
1. Use a ternary operator instead of the if-else statement to make the code more concise.
2. Consider using a CSS class for the label styling instead of inline styles.

{{< details "source code " >}}
```php
if (isset($stud_temp_data)) 
                                {
                                ?>
                                    <label class="label_color">Referral Student School:&nbsp;<span class="imp">*</span></label>
                                <?php } else{ ?>
                                    <label>Referral Student School:&nbsp;<span class="imp">*</span></label>
                                <?php }
```
{{< /details >}}

## Code block 183
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code snippet is a foreach loop that iterates over an array of school data. For each school, it generates a radio button with the school name and an input field for a referral number. If the referral number matches the one stored in the student's temporary data, the radio button is checked. If the student has a referral, an additional input field for the referral number is displayed. The code also includes a button to view the referral details.

### Refactoring
1. Use a template engine or separate the HTML code from the PHP code for better separation of concerns.
2. Use a more descriptive variable name instead of `$ret_school_data`.
3. Move the HTML code for the radio button and input fields into a separate function for better reusability.
4. Use a ternary operator instead of an if-else statement for displaying the referral input field.

{{< details "source code " >}}
```php
foreach ($ret_school_data as $key => $value) 
                                {
                                    $checked = '';
                                    if($stud_temp_data->referral_school_id == $value['school_id'])
                                    {
                                        $checked = 'checked';
                                    }
                                    ?>
                                     <input type="radio" name="referral_student_school" class="referral_student_school" id="referral_student_school" value="<?php echo $value['school_id'];?>" <?php echo $checked;?> onchange ="refno_field();"/>&nbsp;&nbsp;<span><?php echo $value['school_name'];?></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    <?php
                                }if($stud_temp_data->student_referral == 'yes')
                                {
                                ?>
                                    <div id="ref_refnolabel_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="referral_student" id="referral_student" value="<?php echo isset($stud_temp_data->student_referral_refno) ? $stud_temp_data->student_referral_refno : NULL; ?>" placeholder="Ref No" maxlength="10" onchange ="validated_refno();">
                                        <button id="stud_referral_info" class="btn btn-info" type="button" style="margin-top:10px;display: none;" onclick="stud_referral_details();">Details</button>
                                    </div>
                                <?php } else {?>
                                    <div id="ref_refnolabel_div">
                                        <input type="text" class="form-control validate[custom[onlyLetterNumber3]]" name="referral_student" id="referral_student" placeholder="Ref No" maxlength="10" style="display: none" onchange ="validated_refno();">
                                        <button id="stud_referral_info" class="btn btn-info" type="button" style="margin-top:10px;display: none;" onclick="stud_referral_details();">Details</button>
                                    </div>
                                <?php }
```
{{< /details >}}

## Code block 184
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to determine the path of the student's image file. It first checks if the image file exists in the specified location. If the file does not exist, it sets the image path to a default 'no-photo-available' image. If the file exists, it sets the image path to the actual image file.

### Refactoring
1. Use a more descriptive variable name instead of 'stuImageFile'.
2. Use a constant or configuration file to store the default image path.
3. Consider using a try-catch block to handle any potential errors when checking if the file exists.

{{< details "source code " >}}
```php
$stuImage = "./student_img/no-photo-available.jpg";$stuImage = "/walsh_upload_images/".$school_code."/student_photo/".$stud_temp_data->lms_id.".JPG";$stuImageFile = ".".$stuImage;if (!file_exists($stuImageFile)) {
                                            $stuImage = "./student_img/no-photo-available.jpg";
                                        }else{
                                            $stuImage = $stuImageFile;
                                        }
```
{{< /details >}}

## Code block 185
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to store the path of the student's image file. It takes a path as input and assigns it to the $student_image_path variable.

{{< details "source code " >}}
```php
$student_image_path = NULL;
```
{{< /details >}}

## Code block 186
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `echo` function is used to output the value of a variable or expression. In this case, the variable `$stuImage` is being echoed, which means its value will be displayed on the screen.

{{< details "source code " >}}
```php
echo $stuImage;
```
{{< /details >}}

## Code block 187
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This code block checks if the value of `$stud_temp_data->if_divorced` is 'yes'. If it is, then it displays a section for court order document.

### Refactoring
1. Use a conditional statement instead of PHP tags to improve readability.
2. Use a variable to store the court image path instead of repeating the code.
3. Move the JavaScript code to a separate file for better organization.

{{< details "source code " >}}
```php
if ($stud_temp_data->if_divorced == 'yes') 
                            {
                            ?>
                                <div class="col-sm-25 col-sm-8 text-left">
                                    <label>Court Order Doc:&nbsp;<span class="imp">*</span></label>
                                    <img id="loadingimg6" src="./images/loading.gif" />
                                </div>   
                                <div class="col-sm-35 col-sm-4 text-left">
                                    <?php 
                                        $courtImage = "./student_img/no-photo-available.jpg";
                                        $courtImage = "/walsh_upload_images/".$school_code."/court_order_document/".$stud_temp_data->lms_id.".jpg";
                                        $courtImageFile = ".".$courtImage;
                                        if (!file_exists($courtImageFile)) {
                                            $courtImage = "./student_img/no-photo-available.jpg";
                                        }else{
                                            $courtImage = $courtImageFile;
                                        }
                                    ?>
                                    <img src="<?php echo $courtImage; ?>" id='court_order_temp_certificate_photo' class="img-responsive img-rounded" name='court_order_temp_certificate_photo' width='150px' height='100px;'>
                                    <span style='display:block;'>&nbsp;&nbsp;</span>
                                    <div>
                                        <i class="fa fa-rotate-right" style="font-size:22px;" onclick="rotate_photo(court_order_temp_certificate_photo)" title="Rotate image"></i> &nbsp;&nbsp;
                                        <input type="button" class="btn btn-primary" value="Upload" onclick="upload_certificate(court_order,court_order_temp_certificate_photo,null);"/>
                                        <input type="file" id="court_order"  name="court_order" style="display: none;">
                                    </div>
                                </div>
                        <?php }
```
{{< /details >}}

## Code block 188
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to set the value of the $birthImage variable based on the availability of the birth certificate image file. If the image file exists, the $birthImage variable is set to the path of the image file. If the image file does not exist, the $birthImage variable is set to a default image path.

### Refactoring
1. Use a conditional statement instead of the ternary operator for better readability.
2. Use a constant for the default image path instead of hardcoding it.
3. Move the logic for checking the existence of the image file to a separate function for better modularity.

{{< details "source code " >}}
```php
$birthImage = "./student_img/no-photo-available.jpg";$birthImage = "/walsh_upload_images/".$school_code."/birth_certificate/".$stud_temp_data->lms_id.".jpg";$birthImageFile = ".".$birthImage;if (!file_exists($birthImageFile)) {
                                        $birthImage = "./student_img/no-photo-available.jpg";
                                    }else{
                                        $birthImage = $birthImageFile;
                                    }
```
{{< /details >}}

## Code block 189
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to echo the value of the variable $birthImage.

{{< details "source code " >}}
```php
echo $birthImage;
```
{{< /details >}}

## Code block 190
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function sets the value of the variable `adharImage` based on the availability of the adhar card image file. If the file exists, the variable is set to the path of the image file. If the file does not exist, the variable is set to the path of a default image file.

### Refactoring
1. Use a more descriptive variable name instead of `adharImage`.
2. Use a constant for the path of the default image file.
3. Use a function to check if the file exists instead of using `file_exists` directly.

{{< details "source code " >}}
```php
$adharImage = "./student_img/no-photo-available.jpg";$adharImage = "/walsh_upload_images/".$school_code."/adharcard_certificate/".$stud_temp_data->lms_id.".jpg";$adharImageFile = ".".$adharImage;if (!file_exists($adharImageFile)) {
                                        $adharImage = "./student_img/no-photo-available.jpg";
                                    }else{
                                        $adharImage = $adharImageFile;
                                    }
```
{{< /details >}}

## Code block 191
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
This function is used to echo the value of the variable $adharImage.

{{< details "source code " >}}
```php
echo $adharImage;
```
{{< /details >}}

## Code block 192
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$certificate_path` variable is used to store the path of a certificate file. It is initially set to `NULL`.

{{< details "source code " >}}
```php
$certificate_path = NULL;
```
{{< /details >}}

## Code block 193
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `certificate_path` variable stores the path to a certificate file. It is used in the code to specify the location of the certificate file when it needs to be accessed or used.

{{< details "source code " >}}
```php
echo $certificate_path
```
{{< /details >}}

## Code block 194
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `$certificate_path` variable is used to store the path of a certificate file. It is initially set to `NULL`.

{{< details "source code " >}}
```php
$certificate_path = NULL;
```
{{< /details >}}

## Code block 195
{{< complexityLabel "Good" >}}{{< /complexityLabel >}}
### Overview
The `certificate_path` variable stores the path to a certificate file. It is used in the code to specify the location of the certificate file when it needs to be accessed or used.

{{< details "source code " >}}
```php
echo $certificate_path
```
{{< /details >}}

## Risks & Security Issues
**Code block 1**: There are no known risks or bugs associated with this function.

**Code block 2**: There are no known risks or bugs associated with this function.

**Code block 3**: There are no known risks or bugs associated with this function.

**Code block 4**: There are no known risks or bugs associated with this function.

**Code block 5**: There are no known risks or bugs associated with this function.

**Code block 6**: There are no known risks or bugs associated with this function.

**Code block 7**: There are no known risks or bugs associated with this function.

**Code block 8**: There are no known risks or bugs associated with this function.

**Code block 9**: There are no known risks or bugs associated with this function.

**Code block 10**: There are no known risks or bugs associated with this function.

**Code block 11**: There are no known risks or bugs associated with this function.

**Code block 12**: There are no known risks or bugs associated with this function.

**Code block 13**: There are no known risks or bugs associated with this function.

**Code block 14**: There are no known risks or bugs associated with this function.

**Code block 15**: There are no known risks or bugs associated with this function.

**Code block 16**: There are no known risks or bugs associated with this function.

**Code block 17**: 

**Code block 18**: 

**Code block 19**: There are no known risks or bugs associated with this function.

**Code block 20**: There are no known risks or bugs associated with this function.

**Code block 21**: There are no known risks or bugs associated with this function.

**Code block 22**: There are no known risks or bugs associated with this function.

**Code block 23**: 

**Code block 24**: 

**Code block 25**: 

**Code block 26**: 

**Code block 27**: 1. If the error message is not properly escaped, it could lead to a potential XSS vulnerability.
2. If the error message is too long, it may not fit within the alert box and could cause display issues.

**Code block 28**: There are no apparent risks or bugs in this code snippet.

**Code block 29**: 

**Code block 30**: 

**Code block 31**: 

**Code block 32**: 

**Code block 33**: 

**Code block 34**: 

**Code block 35**: 

**Code block 36**: 

**Code block 37**: 1. The code assumes that the $class_rows array is not NULL. If it is NULL, it will result in a runtime error.
2. The code does not handle the case where the 'admission_to' property in the $stud_temp_data object is not present or is not an integer value. This can lead to unexpected behavior or errors.
3. The code does not handle the case where the 'class_id' property in the $row_class object is not present or is not an integer value. This can also lead to unexpected behavior or errors.

**Code block 38**: 

**Code block 39**: 

**Code block 40**: 

**Code block 41**: 

**Code block 42**: 

**Code block 43**: 

**Code block 44**: 

**Code block 45**: 

**Code block 46**: 

**Code block 47**: 

**Code block 48**: 

**Code block 49**: There are no specific risks or bugs in this code snippet.

**Code block 50**: 

**Code block 51**: 

**Code block 52**: 

**Code block 53**: 

**Code block 54**: 

**Code block 55**: 

**Code block 56**: 

**Code block 57**: 

**Code block 58**: 

**Code block 59**: 

**Code block 60**: 

**Code block 61**: 

**Code block 62**: 

**Code block 63**: 

**Code block 64**: 

**Code block 65**: 

**Code block 66**: 

**Code block 67**: 

**Code block 68**: 

**Code block 69**: 

**Code block 70**: 

**Code block 71**: 

**Code block 72**: 

**Code block 73**: 

**Code block 74**: 

**Code block 75**: 

**Code block 76**: 

**Code block 77**: 

**Code block 78**: 

**Code block 79**: 

**Code block 80**: 

**Code block 81**: 

**Code block 82**: 

**Code block 83**: 

**Code block 84**: 

**Code block 85**: 

**Code block 86**: 

**Code block 87**: 

**Code block 88**: 

**Code block 89**: 

**Code block 90**: 

**Code block 91**: There are no specific risks or bugs in this code snippet.

**Code block 92**: 

**Code block 93**: There are no specific risks or bugs in this code snippet.

**Code block 94**: 

**Code block 95**: 

**Code block 96**: There are no specific risks or bugs in this code snippet.

**Code block 97**: There are no specific risks or bugs in this code snippet.

**Code block 98**: 

**Code block 99**: There are no specific risks or bugs in this code snippet.

**Code block 100**: There are no specific risks or bugs in this code snippet.

**Code block 101**: 

**Code block 102**: 1. The code does not handle the case when the father's education qualification is not set.
2. The code does not handle the case when the 'stud_temp_data' object is not set or does not have the 'father_education' property.

**Code block 103**: 

**Code block 104**: 

**Code block 105**: 1. The code assumes that the 'annual_income' array and the 'stud_temp_data' object are always set and have the expected structure. If they are not, it may result in errors.
2. The code does not handle cases where the 'father_annual_income' value is not found in the 'annual_income' array. It may result in an empty or incorrect option being selected.

**Code block 106**: 

**Code block 107**: 

**Code block 108**: 

**Code block 109**: 

**Code block 110**: 

**Code block 111**: 

**Code block 112**: 

**Code block 113**: 1. If `$stud_temp_data->mother_mobile_no` is not an object or an array, an error will occur.
2. If `$stud_temp_data->mother_mobile_no` is set but is not a string, the `ltrim` function may produce unexpected results.

**Code block 114**: 1. The $id_type array may be empty, resulting in no options being generated.
2. The keys and values in the $id_type array may not be properly escaped, leading to potential security vulnerabilities.

**Code block 115**: There are no specific risks or bugs associated with this code snippet.

**Code block 116**: 

**Code block 117**: 

**Code block 118**: 1. The code assumes that the array contains only string values. If the array contains other data types, it may cause unexpected behavior.
2. The code does not handle cases where the array is empty.

**Code block 119**: 

**Code block 120**: 

**Code block 121**: 

**Code block 122**: There are no specific risks or bugs in this code snippet.

**Code block 123**: 

**Code block 124**: 

**Code block 125**: 

**Code block 126**: 

**Code block 127**: 1. The code assumes that the `$qualification` array and `$stud_temp_data->father_education` variable are properly initialized.
2. There is a risk of introducing HTML injection if the values in the `$qualification` array are not properly sanitized.

**Code block 128**: 

**Code block 129**: 

**Code block 130**: 

**Code block 131**: 

**Code block 132**: 1. The code assumes that the 'annual_income' array and the 'stud_temp_data' object are properly initialized and contain the expected data.
2. The code does not handle cases where the 'annual_income' array or the 'stud_temp_data' object are empty or have missing values.
3. The code does not handle cases where the 'walsh_moth_income' variable is not set or has an unexpected value.
4. The code does not handle cases where the 'key' variable is not set or has an unexpected value.

**Code block 133**: 

**Code block 134**: 

**Code block 135**: 

**Code block 136**: 

**Code block 137**: 

**Code block 138**: 

**Code block 139**: 

**Code block 140**: 

**Code block 141**: 1. The code assumes that the `stud_temp_data` object has a `guardian_profession` property.
2. The code assumes that the `guardian_profession` property is a string.
3. The code assumes that the `guardian_profession` property is either 'service-provider' or a hyphen-separated string.
4. The code assumes that the `profession` array is associative with string keys and string values.

**Code block 142**: 1. If the $annual_income array is not properly initialized or is empty, the loop will not execute.
2. If the $annual_income array contains non-numeric keys, the generated HTML option elements may have unexpected values.

**Code block 143**: 1. The code assumes that the variable $stud_temp_data is defined and has a property 'guardian_annual_income'. If this assumption is not met, it will result in a runtime error.
2. The code does not handle cases where the guardian's annual income is not set or does not match any of the options in the array.

**Code block 144**: 1. If the $annual_income array is not properly initialized or is empty, the loop will not execute.
2. If the $annual_income array contains non-numeric keys, the generated HTML option elements may have unexpected values.

**Code block 145**: 

**Code block 146**: 

**Code block 147**: 

**Code block 148**: 

**Code block 149**: 

**Code block 150**: 

**Code block 151**: 

**Code block 152**: 

**Code block 153**: 

**Code block 154**: 

**Code block 155**: 

**Code block 156**: 

**Code block 157**: 

**Code block 158**: 

**Code block 159**: 

**Code block 160**: 

**Code block 161**: 

**Code block 162**: 

**Code block 163**: 

**Code block 164**: 

**Code block 165**: 

**Code block 166**: 

**Code block 167**: 

**Code block 168**: 

**Code block 169**: 

**Code block 170**: 

**Code block 171**: 

**Code block 172**: 

**Code block 173**: 

**Code block 174**: 

**Code block 175**: 

**Code block 176**: 

**Code block 177**: 

**Code block 178**: 

**Code block 179**: 

**Code block 180**: There are no known risks or bugs associated with the `echo` function.

**Code block 181**: 

**Code block 182**: 

**Code block 183**: 1. The code does not handle any validation or sanitization of user input.
2. The code does not handle any error scenarios or exceptions.
3. The code does not provide any feedback to the user when the referral number is validated or when the referral details button is clicked.

**Code block 184**: 1. The function assumes that the image file is located in the specified path. If the file is located in a different path, the function will not work correctly.
2. The function does not handle any errors that may occur when checking if the file exists.

**Code block 185**: 

**Code block 186**: 

**Code block 187**: 

**Code block 188**: 1. The function assumes that the image file is located in the specified directory structure. If the directory structure changes, the function may not work correctly.
2. The function does not handle any errors that may occur when checking the existence of the image file.

**Code block 189**: 

**Code block 190**: 1. The function assumes that the default image file is always available.
2. The function does not handle errors that may occur when checking if the file exists.

**Code block 191**: 

**Code block 192**: 

**Code block 193**: 

**Code block 194**: 

**Code block 195**: 

