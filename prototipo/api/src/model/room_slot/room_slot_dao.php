<?php

class room_slot_dao {
    protected $con;

    public function __construct () {
        $this->con = conexao_pdo::getInstance()->getConexao();
    }

    function register (room_slot $obj) {
        $response = new response();

        try {
            $stmt = $this->con->prepare("INSERT INTO room_slot (`id`, `idroom`, `checked`, `jump`) 
            VALUE (:id, :idroom, :checked, :jump)");
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":idroom", $idroom);
            $stmt->bindParam(":checked", $checked);
            $stmt->bindParam(":jump", $jump);

            $id = $obj->getId();
            $idroom = $obj->getIdroom();
            $jump = $obj->getJump();
            $checked = false;

            $stmt->execute();

            $response->setSuccess(true)->setData($id)->setMsg('');
        }catch(PDOException $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function update (room_slot $obj) {
        $response = new response();

        try {
            $stmt = $this->con->prepare("UPDATE room_slot 
            SET `iduser` = :iduser, `color` = :color, `checked` = :checked
            WHERE id = :id");
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":iduser", $iduser);
            $stmt->bindParam(":color", $color);
            $stmt->bindParam(":checked", $checked);

            $id = $obj->getId();
            $iduser = $obj->getIduser();
            $color = $obj->getColor();
            $checked = $obj->getChecked();

            $stmt->execute();

            $response->setSuccess(true)->setData(true)->setMsg('');
        }catch(PDOException $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function getByID (room_slot $obj) {
        $response = new response();

        try {
            $stmt = $this->con->prepare("SELECT *
            FROM room_slot
            WHERE id = :id");
            $stmt->bindParam(':id', $id);

            $id = $obj->getId();

            $stmt->execute();
            $obj = $stmt->fetchObject();
            
            $response->setSuccess(true)->setData($obj)->setMsg('')->setAuthorized(false);

        }catch (PDOException $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage())->setAuthorized(false);
        }

        return $response;
    }

    function getAll (room_slot $obj) {
        $response = new response();

        try {

            $where = "WHERE id > 0";
            if (!empty($obj->getId())) $where .= " AND id = {$obj->getId()}";
            if (!empty($obj->getIdroom())) $where .= " AND idroom = {$obj->getIdroom()}";
            if (!empty($obj->getIduser())) $where .= " AND iduser = {$obj->getIduser()}";
            if (!empty($obj->getColor())) $where .= " AND color = {$obj->getColor()}";
            if (!empty($obj->getChecked())) $where .= " AND checked = {$obj->getChecked()}";

            $stmt = $this->con->prepare("SELECT * 
            FROM room_slot rs 
            $where");

            $stmt->execute();
            $obj = $stmt->fetchAll(PDO::FETCH_CLASS);

            $response->setSuccess(true)->setData($obj)->setMsg('')->setAuthorized(false);

        }catch (PDOException $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage())->setAuthorized(false);
        }

        return $response;
    }
}