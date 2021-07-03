<?php

require_once __DIR__ . "/../invoke/invoke.php";

class room_user_control {
    protected $obj;
    protected $obj_dao;

    public function __construct ($obj = null) {
        invoke::call('room_user');
        $this->obj_dao = new room_user_dao();
        $this->obj = (object) $obj;
    }

    function access () {
        $response = new response();

        try {

            // verificando se a sala tem senha
            $control_room = new room_control();
            $resp = $control_room->getById($this->obj->idroom);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $room = $resp->getData();
            if (!empty($room->pass) && empty($this->obj->pass)) throw new Exception("A sala é privada e exige uma senha!");
            if ($room->pass !== $this->obj->pass) throw new Exception("A senha da sala está incorreta!");

            // verificando se a sala ainda está em registro
            if ($room->status !== 'REGISTER') throw new Exception("Não é mais possível participar desta sala!");

            // consultando se ainda há slots para acessar a sala
            $resp = $this->getAll(array("idroom" => $this->obj->idroom));
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $players = $resp->getData();
            if (count($players)>=4) throw new Exception("A sala está lotada!");

            // consultando user por id
            $control_user = new user_control();
            $resp = $control_user->getById($this->obj->iduser);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $user = $resp->getData();

            // setando o iduser
            $this->obj->iduser = $user->id;
            $this->obj->move = false;

            // chamando o registro
            $resp = $this->register();
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $id = $resp->getData();

            // consultando a room_user pelo id
            $resp = $this->getById(MD5($id));
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $room_user = $resp->getData();

            $response->setSuccess(true)->setData($room_user->idroom)->setMsg('');
        }catch(Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function register () {
        $response = new response();
        
        try {

            $o = new room_user();

            $o->setIduser($this->obj->iduser);
            $o->setIdroom($this->obj->idroom);
            $o->setMove($this->obj->move);

            $colors =  array(
                "26c3bf", // verde-azul claro
                "58aaf2", // azul claro
                "58f276", // verde claro
                "f2ea58", // amarelo claro
                "c73c3c", // vermelho claro
                "953cc7", // lilas
                "ff5722", // laranja
            );
            
            // gerando cor
            $rand = (rand(0, 6));

            // verificando se a cor já foi usada
            $resp = $this->getAll(array("idroom" => $this->obj->idroom));
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $players = $resp->getData();

            $color = '';
            while ($color === '') {
                $index = array_search($colors[$rand], array_column($players, 'color'));
                if ($index===false) $color = $colors[$rand];
            }

            $o->setColor($color);

            $resp = $this->obj_dao->register($o);
            $id_room = $resp->getData();

            $resp->setData($id_room);

            $response = $resp;
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function update ($obj) {
        $response = new response();
        
        try {
            $obj = (object) $obj;

            $o = new room_user();

            if (!empty($obj->id)) $o->setId($obj->id);
            if (!empty($obj->iduser)) $o->setIduser($obj->iduser);
            if (!empty($obj->idroom)) $o->setIdroom($obj->idroom);
            if (!empty($obj->points)) $o->setPoints($obj->points);
            if (!empty($obj->color)) $o->setColor($obj->color);
            if ($obj->move || !$obj->move) $o->setMove($obj->move);

            $response = $this->obj_dao->update($o);
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function getById ($id) {
        $o = new room_user();
        $o->setId($id);
        
        $response = $this->obj_dao->getById($o);
        
        return $response;
    }

    function getAll ($obj) {
        $response = new response();
        
        try {
            $obj = (object) $obj;

            $o = new room_user();
            if (!empty($obj->id)) $o->setId($obj->id);
            // if (!empty($obj->iduser)) $o->setIduser($obj->iduser);
            if (!empty($obj->idroom)) $o->setIdroom($obj->idroom);

            $resp = $this->obj_dao->getAll($o);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $room_users = $resp->getData();

            // consultando dados de users
            $array = array();
            foreach($room_users as $key) {
                $ru = $key;

                $control_user = new user_control();
                $resp = $control_user->getById($ru->iduser);
                if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
                $user = $resp->getData();

                $ru->user_name = $user->name;

                array_push($array, $ru);
            }

            $response->setSuccess(true)->setData($array)->setMsg('');
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }
}