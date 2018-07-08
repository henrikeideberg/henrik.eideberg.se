<?php
//function debug_to_console( $data ) {
//    $output = $data;
//    if ( is_array( $output ) )
//        $output = implode( ',', $output);
//
//    echo "<script>console.log( 'Debug Objects: " . $output . "' );</script>";
//}
//debug_to_console( "Test" );
  $counter = 0;
  $errors = array();
  $uploadedFiles = array();
  $extension = array("jpeg","JPEG","jpg","JPG","png","PNG","gif","GIF");
  $jsonResponse = array();
  $UploadFolder = "uploadFolder";

  foreach($_FILES["files"]["tmp_name"] as $key=>$tmp_name){
    $temp = $_FILES["files"]["tmp_name"][$key];
    $name = $_FILES["files"]["name"][$key];

    if(empty($temp))
    {
      break;
    }

    $counter++;
    $UploadOk = true;

    //$check = getimagesize($_FILES["files"]["tmp_name"]);
    $check = getimagesize($temp);
    if($check === false) {
      //echo "File is not an image.";
      array_push($errors, $name." is not an image");
      $UploadOk = false;
    }

    $ext = pathinfo($name, PATHINFO_EXTENSION);
    if(in_array($ext, $extension) == false){
      $UploadOk = false;
      array_push($errors, $name." is invalid file type");
    }

    if(file_exists($UploadFolder."/".$name) == true){
      $UploadOk = false;
      array_push($errors, $name." file already exists");
    }

    if($UploadOk == true){
      move_uploaded_file($temp,$UploadFolder."/".$name);
      array_push($uploadedFiles, $name);
    }
  }
  //Improve this so that only one array is sent back
  if($counter>0){
    if(count($errors)>0)
    {
      //echo json_encode($errors);
      foreach($errors as $error)
      {
        array_push($jsonResponse, $error);
      }
    }
    if(count($uploadedFiles)>0){
      //echo json_encode(count($uploadedFiles).
      //  " file(s) are successfully uploaded.");
      array_push($jsonResponse,
                 count($uploadedFiles).
                 " file(s) are successfully uploaded.");
    }
  }
  else{
    array_push($jsonResponse, "Please, select file(s) to upload.");
  }
  echo json_encode($jsonResponse);
?>