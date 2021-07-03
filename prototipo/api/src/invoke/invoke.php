<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Origin, Cache-Control, Pragma, Authorization, Accept, Accept-Encoding");
header('Content-Type: application/json');

require_once __DIR__ . '/../../util/conexao_pdo.php';
require_once __DIR__ . '/../../util/jwt.php';
require_once __DIR__ . '/../../util/response.php';
require_once __DIR__ . '/../control/room_control.php';

// em cada request verifica as sala com tempo expirado
$control_room = new room_control();
$control_room->closeExpiredRooms();

$json = $_REQUEST;
if (empty($json)) $json = file_get_contents ( "php://input" ); // caso não esteja no request
if (gettype($json) === 'string') $json = json_decode($json); // caso senha string
if (gettype($json) !== 'object') $json = (object) $json; // caso não seja um objeto

class invoke {
    public static function call($class=null, $verificar=null) {
        
        if (!empty($class)) require_once __DIR__ . "/../invoke/{$class}_invoke.php";

        if ($verificar) {
            $valid = jwt::validate();

            if (!$valid) {
                $response->setSuccess(false)->setData('')->setMsg('')->setAuthorized(false);
                die(json_encode($response));
            }
        }
    }
}