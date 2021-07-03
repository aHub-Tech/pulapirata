<?php

require_once __DIR__ . "/../invoke/invoke.php";

class user_control {
    protected $obj;
    protected $obj_dao;

    public function __construct ($obj = null) {
        invoke::call('user');
        $this->obj_dao = new user_dao();
        $this->obj = $obj;
    }

    function register () {
        $response = new response();

        try {
            // verificando se o email já está registrado
            $resp = $this->getByEmail($this->obj->email);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $data = $resp->getData();
            
            if (!empty($data)) throw new Exception("O Email já está sendo utilizado!");
            
            $id = date('YmdHis'); // gerando um ID para o usuario

            $o = new user();
            if (!empty($this->obj->name)) $o->setName($this->obj->name);
            if (!empty($this->obj->email)) $o->setEmail($this->obj->email);
            if (!empty($this->obj->pass)) $o->setPass($this->obj->pass);

            $resp = $this->obj_dao->register($o);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $id = $resp->getData();

            $resp = $this->getById(MD5($id));
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $data = $resp->getData();

            if (!empty($data)) {
                $data->id = MD5($data->id);
                $key = jwt::generate(array(
                    "id"=>$data->id,
                    "name"=>$data->name
                ));

                $obj = array(
                    "id" =>$data->id,
                    "idroom"=> null,
                    "name" =>$data->name,
                    "jwt" =>$key
                );

                $resp->setData($obj);
            }

            $response = $resp;
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function login () {
        $response = new response();
        try {
            $o = new user();
            
            if (!empty($this->obj->email)) $o->setEmail($this->obj->email);
            if (!empty($this->obj->pass)) $o->setPass($this->obj->pass);

            $resp = $this->obj_dao->login($o);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $data = $resp->getData();

            if (!$data) throw new Exception("Usuário não localizado!");

            // verificando se o usuário está presente em alguma sala ativa
            $control_room = new room_control();
            $resp = $control_room->getActiveRoomUser($data->id);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $room = $resp->getData();

            // se nenhuma sala for localizada
            if (!$room) {
                $data->idroom = '';
                $data->owner = false;
            }else{
                $data->idroom = $room->id;
                $data->owner = ($room->owner===$data->id) ? true : false;
            }

            if (!empty($data)) {
                $key = jwt::generate(array(
                    "id"=>$data->id,
                    "name"=>$data->name
                ));

                $data->jwt = $key;
                $resp->setData($data);
                
                // consultar se o jogar está em uma sala ativa
            }

            $response = $resp;
        }catch(Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function getById ($id) {
        $response = new response();

        try {
            $o = new user();
            $o->setId($id);
        
            $response = $this->obj_dao->getById($o);
            if (!$response->getData()) throw new Exception("Usuário não localizado!");


        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }
        
        return $response;
    }

    function getByEmail ($email) {
         // verificando se conta do email já existe
         $o = new user();
         $o->setEmail($this->obj->email);
         $response = $this->obj_dao->getByEmail($o);

         return $response;
    }
}