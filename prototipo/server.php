<?php

switch($_SERVER['REQUEST_METHOD']){
    case 'GET': {
        get();
        break;
    }
    case 'POST': {
        post();
        break;
    }
}

function get() {
    $file = new json_file();
    $response = $file->readFile();
    echo json_encode($response);
}

function post () {
    global $json;
    ($json->method)();
}

function setState() {
    global $json;
    $file = new json_file();
    $response = $file->writeFile($json->data);
    echo json_encode($response);
}

function createRoom () {
    $file = new json_file();

    // consultando as states do DB
    $response = $file->writeFile();
    if (!$response) die(json_encode($response));
    if (empty($response->data)) {
        $response->msg = "O limite de salas simultâneas foi atingida";
    }
}

function resetData() {
    $file = new json_file();
    $response = $file->clean();
    echo json_encode($response);
}