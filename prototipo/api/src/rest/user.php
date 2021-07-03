<?php

require_once __DIR__ . '/../invoke/invoke.php';
invoke::call('user');

// chamando o metodo
($json->method)();

function register() {
    // injetando a variável do escopo global
    global $json;
    $data = $json->data; // getando os dados do request
    $control = new user_control($data);
    $response = $control->register();

    echo json_encode($response);
}

function login() {
    // injetando a variável do escopo global
    global $json;
    $data = $json->data; // getando os dados do request
    $control = new user_control($data);
    $response = $control->login();

    echo json_encode($response);
}