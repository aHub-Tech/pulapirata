<?php

require_once __DIR__ . '/../invoke/invoke.php';
invoke::call('room_user');

// chamando o metodo
($json->method)();

// function register () {
//     global $json;
//     $data = $json->data;
    
//     $control = new room_user_control($data);
//     $response = $control->register();

//     echo json_encode($response);
// }

function access () {
    global $json;
    $data = $json->data;
    
    $control = new room_user_control($data);
    $response = $control->access();

    echo json_encode($response);
}

function getAll() {
    // injetando a variável do escopo global
    global $json;

    $control = new room_user_control();
    $response = $control->getAll($json);

    echo json_encode($response);
}