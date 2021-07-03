<?php

class room_user_dao {
    protected $con;

    public function __construct () {
        $this->con = conexao_pdo::getInstance()->getConexao();
    }

    function register (room_user $obj) {
        $response = new response();

        try {
            $stmt = $this->con->prepare("INSERT INTO room_user (`id`, `iduser`, `idroom`, `color`, `move`) 
            VALUE (:id, :iduser, :idroom, :color, :move)");
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":iduser", $iduser);
            $stmt->bindParam(":idroom", $idroom);
            $stmt->bindParam(":color", $color);
            $stmt->bindParam(":move", $move);

            $id = (new DateTime())->getTimestamp();
            $iduser = $obj->getIduser();
            $idroom = $obj->getIdroom();
            $color = $obj->getColor();
            $move = $obj->getMove();

            $stmt->execute();

            $response->setSuccess(true)->setData($id)->setMsg('');
            
        }catch(PDOException $e) {
            $response->setSuccess(false)->setData('')->setMsg("ROOM_USER_DAO => {$e->getMessage()}");
        }

        return $response;
    }

    function update (room_user $obj) {
        $response = new response();

        try {
            $fields = "";
            if (!empty($obj->getIduser())) {
                if (strlen($fields)>0) {$fields .= ", ";}
                $fields .= "iduser = :iduser";
            }
            if (!empty($obj->getIdroom())) {
                if (strlen($fields)>0) {$fields .= ", ";}
                $fields .= "idroom = :idroom";
            }
            if (!empty($obj->getPoints())) {
                if (strlen($fields)>0) {$fields .= ", ";}
                $fields .= "points = :points";
            }
            if (!empty($obj->getColor())) {
                if (strlen($fields)>0) {$fields .= ", ";}
                $fields .= "color = :color";
            }
            if ($obj->getMove() !== '') {
                if (strlen($fields)>0) {$fields .= ", ";}
                $fields .= "move = :move";
            }

            $stmt = $this->con->prepare("UPDATE room_user 
            SET {$fields}
            WHERE id = :id");

            $stmt->bindParam(":id", $id);
            if (!empty($obj->getIduser())) $stmt->bindParam(":iduser", $iduser);
            if (!empty($obj->getIdroom())) $stmt->bindParam(":idroom", $idroom);
            if (!empty($obj->getPoints())) $stmt->bindParam(":points", $points);
            if (!empty($obj->getColor())) $stmt->bindParam(":color", $color);
            if ($obj->getMove() !== '') $stmt->bindParam(":move", $move);

            $id = $obj->getId();
            $iduser = $obj->getIduser();
            $idroom = $obj->getIdroom();
            $points = $obj->getPoints();
            $color = $obj->getColor();
            $move = $obj->getMove();

            $stmt->execute();

            $response->setSuccess(true)->setData(true)->setMsg('');
        }catch(PDOException $e) {
            $response->setSuccess(false)->setData('')->setMsg("ROOM_USER_DAO::UPDATE => {$e->getMessage()}");
        }

        return $response;
    }

    function getByID (room_user $obj) {
        $response = new response();

        try {
            $stmt = $this->con->prepare("SELECT *
            FROM room_user
            WHERE MD5(id) = :id");
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

    function getAll (room_user $obj) {
        try {
            $response = new response();

            $where = "WHERE id > 0";
            if (!empty($obj->getId())) $where .= " AND id = " . $obj->getId();
            if (!empty($obj->getIduser())) $where .= " AND MD5(iduser) = '{$obj->getIduser()}'";
            if (!empty($obj->getIdroom())) $where .= " AND idroom = " . $obj->getIdroom();

            $stmt = $this->con->prepare("SELECT r.*, MD5(r.iduser) as iduser
            FROM room_user r
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