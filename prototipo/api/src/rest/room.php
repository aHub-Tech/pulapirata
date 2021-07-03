<?php

require_once __DIR__ . '/../invoke/invoke.php';
invoke::call('room');

// chamando o metodo
($json->method)();

function register () {
    global $json;
    $data = $json->data;
    
    $control = new room_control($data);
    $response = $control->register();

    echo json_encode($response);
}

function getAll() {
    // injetando a variável do escopo global
    global $json;

    $control = new room_control();
    $response = $control->getAll();

    echo json_encode($response);
}

function getState () {
    global $json;
    $idroom = $json->idroom;

    $control = new room_control();
    $response = $control->getState($idroom);
    echo json_encode($response);
}

function start () {
    global $json;
    $data = $json->data;

    $control = new room_control();
    $response = $control->start($data);
    echo json_encode($response);
}

function check () {
    global $json;
    $data = $json->data;

    $control = new room_control();
    $response = $control->check($data);
    echo json_encode($response);
}

function closeExpiredRooms () {
    $control = new room_control();
    $response = $control->closeExpiredRooms();
    echo json_encode($response);
}

function cancel () {
    global $json;
    $data = $json->data;

    $control = new room_control();
    $response = $control->cancel($data);
    echo json_encode($response);
}