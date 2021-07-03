<?php

require_once __DIR__ . "/../invoke/invoke.php";

class room_slot_control {
    protected $obj;
    protected $obj_dao;

    public function __construct ($obj = null) {
        invoke::call('room_slot');
        $this->obj_dao = new room_slot_dao();
        $this->obj = $obj;
    }

    function registerAll ($data) {
        $response = new response();

        try{
            // consultar para verificar se já foram criados os slots
            $resp = $this->getAll(array("idroom"=>$data[0]->idroom));
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $slots = $resp->getData();
            if (!empty($slots))  throw new Exception("Slots já cadastrados");

            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            
            // sorteando uma posição pro jump
            $rand = rand(0, (count($data)-1));

            $i = 0;
            foreach($data as $key) {
                $this->obj = $key;
                
                $this->obj->jump = (intval($i) === intval($rand)) ? true : false;

                $resp = $this->register();
                if (!$resp->getSuccess()) throw new Exception($resp->getMsg());

                $response = $resp;

                $i++;
            }
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function register () {
        $response = new response();

        try {

            $o = new room_slot();
            if (!empty($this->obj->id)) $o->setId($this->obj->id);
            if (!empty($this->obj->idroom)) $o->setIdroom($this->obj->idroom);
            if (!empty($this->obj->iduser)) $o->setIduser($this->obj->iduser);
            if (!empty($this->obj->color)) $o->setColor($this->obj->color);
            if (!empty($this->obj->jump)) $o->setJump($this->obj->jump);

            $resp = $this->obj_dao->register($o);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());

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

            $o = new room_slot();
            if (!empty($obj->id)) $o->setId($obj->id);
            if (!empty($obj->color)) $o->setColor($obj->color);
            if (!empty($obj->checked)) $o->setChecked($obj->checked);
            if (!empty($obj->jump)) $o->setJump($obj->jump);

            // consultando user por id
            $control_user = new user_control();
            $resp = $control_user->getById($obj->iduser);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $user = $resp->getData();

            $o->setIduser($user->id);

            // consultando players
            // $control_room_user = new room_user_control();
            // $resp = $control_room_user->getAll(array("idroom" => $obj->idroom));
            // if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            // $players = $resp->getData();

            // // setando o jogador que iniciar o jogo
            // $resp = $control_room_user->update(array("id"=>$players[$rand]->id, "move"=>true));
            // if (!$resp->getSuccess()) throw new Exception($resp->getMsg());

            $resp = $this->obj_dao->update($o);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());

            $response = $resp;
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function getAll ($obj) {
        $response = new response();

        try {
            $obj = (object) $obj;

            $o = new room_slot();
            if (!empty($obj->id)) $o->setId($obj->id);
            if (!empty($obj->idroom)) $o->setIdroom($obj->idroom);
            if (!empty($obj->iduser)) $o->setIduser($obj->iduser);
            if (!empty($obj->color)) $o->setColor($obj->color);
            if (!empty($obj->checked)) $o->setChecked($obj->checked);
            if (!empty($obj->jump)) $o->setJump($obj->jump);

            $resp = $this->obj_dao->getAll($o);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());

            $response = $resp;
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

}