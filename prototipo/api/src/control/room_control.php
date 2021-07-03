<?php

require_once __DIR__ . "/../invoke/invoke.php";

class room_control {
    protected $obj;
    protected $obj_dao;

    public function __construct ($obj = null) {
        invoke::call('room');
        $this->obj_dao = new room_dao();
        $this->obj = $obj;
    }

    function register () {
        $response = new response();
        
        try {
            $o = new room();
            $o->setPass($this->obj->pass_room);

            // consultando user por id
            $control_user = new user_control();
            $resp = $control_user->getById($this->obj->iduser);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $user = $resp->getData();
            $o->setOwner($user->id);

            $resp = $this->obj_dao->register($o);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $id_room = $resp->getData();

            // registrando o user na room
            $room_user_control = new room_user_control(
                array(
                    "iduser" => $user->id,
                    "idroom" => $id_room,
                    "move" => true
                )
            );
            $resp = $room_user_control->register();

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

            $o = new room();
            $o->setId($obj->id);
            $o->setStatus($obj->status);

            $response = $this->obj_dao->update($o);
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function getById ($id) {
        $o = new room();
        $o->setId($id);
        
        $response = $this->obj_dao->getById($o);
        
        return $response;
    }

    // verificando por id de usuário se existe alguma sala ativa
    function getActiveRoomUser ($iduser) {
        $response = new response();

        try {
            $response = $this->obj_dao->getActiveRoomUser($iduser);
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function getAll () {
        $response = new response();
        
        try {
            $resp = $this->obj_dao->getAll();
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $rooms = $resp->getData();

            $control_room_user = new room_user_control();
            $array = array();
            foreach ($rooms as $key) {
                $room = $key;
                $resp = $control_room_user->getAll(array(
                    "idroom" => $room->id
                ));
                if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
                $room->players = $resp->getData();
                array_push($array, $room);
            }

            $response->setSuccess(true)->setData($array)->setMsg('');
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }
        return $response;
    }

    function getState($idroom) {
        $response = new response();

        try {
            
            // getando informações da room
            $resp = $this->getById($idroom);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $room = $resp->getData();
            if (empty($room)) throw new Exception('Sala não encontrada');

            $room = array("id"=>$room->id, "owner"=>$room->owner, "status"=>$room->status);

            // getando slots da room
            $control_room_slot = new room_slot_control();
            $resp = $control_room_slot->getAll(array("idroom"=>$idroom));
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $slots = $resp->getData();

            // getando jogadores da room
            $control_room_user = new room_user_control();
            $resp = $control_room_user->getAll(array("idroom"=>$idroom));
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $players = $resp->getData();
            if (empty($players)) throw new Exception('Sala sem jogadores');

            $state = array("room" => $room, "slots" => $slots, "players" => $players);

            $response->setSuccess(true)->setData($state)->setMsg('');
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    // quando o dono da sala clica em iniciar o jogo
    function start ($obj) {
        $response = new response();

        try {

            // getando informações da room
            $resp = $this->getById($obj->idroom);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $room = $resp->getData();
            if (empty($room)) throw new Exception('Sala não encontrada');

            // verificando se o user é dono
            if ($room->owner!==$obj->iduser) throw new Exception('Você não é o dono da room.');

            // atualizando o status da sala
            $obj = array(
                "id" => $obj->idroom,
                "status" => "INPROGRESS"
            );

            $resp = $this->Update($obj);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());

            $response->setSuccess(true)->setData('true')->setMsg('');
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    // quando o slot do barril é clicado
    function check ($obj) {
        $response = new response();

        try {
            
            // verificando se é a vez do jogador
            $control_room_user = new room_user_control();
            $resp = $control_room_user->getAll(array("idroom" => $obj->idroom));
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $room_users = $resp->getData();

            $index = array_search($obj->iduser, array_column($room_users, "iduser"));

            // verificando se é a vez do jogador
            if (!$room_users[$index]->move) throw new Exception("Não é a sua vez de jogar!");

            // consultando slots
            $control_room_slot = new room_slot_control();
            $resp = $control_room_slot->getAll(array("id"=>$obj->id));
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $slot = $resp->getData()[0];

            if($slot->jump) {
                // adicionando pontos para os participantes
                $resp = $this->addPoints($obj->iduser, $obj->idroom);
                if (!$resp->getSuccess()) throw new Exception($resp->getMsg());

                // atualizar o status da room para finish
                $resp = $this->update(array("id"=>$obj->idroom, "status"=>"FINISH"));
                if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            }else{

                // atualizando slot clicado
                $resp = $control_room_slot->update(array("id"=>$obj->id, "iduser"=>$obj->iduser, "color"=>$obj->color, "checked"=>true));
                if (!$resp->getSuccess()) throw new Exception($resp->getMsg());

                // atualizando o player que jogou
                $resp = $control_room_user->update(array("id"=>$room_users[$index]->id, "move"=>0));
                if (!$resp->getSuccess()) throw new Exception($resp->getMsg());

                // tratando o proximo jogador, caso não exista volta para o primeiro
                $next_player = (empty($room_users[$index+1])) ? $room_users[0] : $room_users[$index+1];

                // atualizando o próximo jogador
                $resp = $control_room_user->update(array("id"=>$next_player->id, "move"=>1));
                if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            }

            $response->setSuccess(true)->setData(true)->setMsg('');
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    } 

    function addPoints ($iduser, $idroom) {
        $response = new response();
        try {
            $response = $this->obj_dao->addPoints($iduser, $idroom);
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function closeExpiredRooms () {
        $response = new response();
        try {
            $resp = $this->obj_dao->closeExpiredRooms();
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $response = $resp->getData();
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function cancel ($obj) {
        $response = new response();

        try {
            $obj = (object) $obj;

            // getando informações da room
            $resp = $this->getById($obj->idroom);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());
            $room = $resp->getData();
            if (empty($room)) throw new Exception('Sala não encontrada');

            // verificando se o user é dono
            if ($room->owner!==$obj->iduser) throw new Exception('Você não é o dono da room.');

            // atualizando o status da sala
            $obj = array(
                "id" => $obj->idroom,
                "status" => "FINISH"
            );

            $resp = $this->Update($obj);
            if (!$resp->getSuccess()) throw new Exception($resp->getMsg());

            $response->setSuccess(true)->setData('true')->setMsg('');
        }catch (Exception $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }
}