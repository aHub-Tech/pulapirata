<?php

require_once __DIR__ . '/../invoke/invoke.php';
invoke::call('room_slot');

// chamando o metodo
($json->method)();

function registerAll () {
    global $json;
    $data = $json->data;
    
    $control = new room_slot_control();
    $response = $control->registerAll($data);

    echo json_encode($response);
}

function update () {
    global $json;
    $data = $json->data;

    $control = new room_slot_control($data);
    $response = $control->update();

    echo json_encode($response);
}

function getAll() {
    // injetando a variável do escopo global
    global $json;

    $control = new room_slot_control();
    $response = $control->getAll($json);

    echo json_encode($response);
}