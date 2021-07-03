<?php

class room_dao {
    protected $con;

    public function __construct () {
        $this->con = conexao_pdo::getInstance()->getConexao();
    }

    function register (room $obj) {
        $response = new response();

        try {
            $stmt = $this->con->prepare("INSERT INTO room (`id`, `owner`, `pass`) 
            VALUE (:id, :owner, :pass)");
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":owner", $owner);
            $stmt->bindParam(":pass", $pass);

            $id = (new DateTime())->getTimestamp();
            $owner = $obj->getOwner();
            $pass = $obj->getPass();

            $stmt->execute();

            $response->setSuccess(true)->setData($id)->setMsg('');
            
        }catch(PDOException $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function update (room $obj) {
        $response = new response();

        try {

            $fields = "";
            if (!empty($obj->getOwner())) {
                if (strlen($fields)>0) {$fields .= ", ";}
                $fields .= "owner = :owner";
            }
            if (!empty($obj->getPass())) {
                if (strlen($fields)>0) {$fields .= ", ";}
                $fields .= "pass = :pass";
            }
            if (!empty($obj->getStatus())) {
                if (strlen($fields)>0) {$fields .= ", ";}
                $fields .= "status = :status";
            }

            $stmt = $this->con->prepare("UPDATE room 
            SET {$fields}
            WHERE id = :id");

            $stmt->bindParam(":id", $id);
            if (!empty($obj->getOwner())) $stmt->bindParam(":owner", $owner);
            if (!empty($obj->getPass())) $stmt->bindParam(":pass", $pass);
            if (!empty($obj->getStatus())) $stmt->bindParam(":status", $status);

            $id = $obj->getId();
            $owner = $obj->getOwner();
            $pass = $obj->getPass();
            $status = $obj->getStatus();

            $stmt->execute();

            $response->setSuccess(true)->setData(true)->setMsg('');
            
        }catch(PDOException $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function getByID (room $obj) {
        $response = new response();

        try {
            $stmt = $this->con->prepare("SELECT r.*, MD5(r.owner) as 'owner'
            FROM room r
            WHERE r.id = :id");
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

    function getActiveRoomUser ($iduser) {
        $response = new response();

        try {
            $stmt = $this->con->prepare("SELECT ru.*, MD5(ru.iduser) AS 'iduser',  MD5(r.owner) AS 'owner'
            FROM room_user ru
            INNER JOIN room r ON r.id = ru.idroom
            WHERE MD5(ru.iduser) = :iduser
            AND (r.`status` = 'REGISTER' OR r.`status` = 'INPROGRESS')");
            $stmt->bindParam(':iduser', $iduser);

            $stmt->execute();
            $obj = $stmt->fetchObject();
            
            $response->setSuccess(true)->setData($obj)->setMsg('')->setAuthorized(false);

        }catch (PDOException $e) {
            $response->setSuccess(false)->setData('')->setMsg("ROOM::GETACTIVETROOMUSER -> " .$e->getMessage())->setAuthorized(false);
        }

        return $response;
    }

    function getAll () {
        $response = new response();

        try {
            $stmt = $this->con->prepare("SELECT r.id, r.status, IF(r.pass != '', true, false) AS 'privated', 
            MD5(r.owner) AS 'owner', u.name AS 'owner_name', r.date_register,
				DATE_ADD(r.date_register, INTERVAL 10 MINUTE) AS 'expiration_date',
            if (DATE_ADD(r.date_register, INTERVAL 10 MINUTE) < NOW(), TRUE, FALSE) AS 'expired'
            FROM room r
            INNER JOIN user u ON u.id = r.owner
            WHERE r.`status` = 'REGISTER' OR r.`status` = 'INPROGRESS'");

            $stmt->execute();
            $obj = $stmt->fetchAll(PDO::FETCH_CLASS);
            
            $response->setSuccess(true)->setData($obj)->setMsg('')->setAuthorized(false);

        }catch (PDOException $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage())->setAuthorized(false);
        }

        return $response;
    }

    function addPoints ($iduser, $idroom) {
        $response = new response();
        
        try {
            $stmt = $this->con->prepare("UPDATE room_user ru
            SET ru.points = ru.points+1
            where ru.idroom = :idroom
            AND MD5(ru.iduser) NOT IN (:iduser)");
            $stmt->bindParam(':idroom', $idroom);
            $stmt->bindParam(':iduser', $iduser);

            $stmt->execute();
            
            $response->setSuccess(true)->setData(true)->setMsg('');
        }catch (PDOException $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function closeExpiredRooms () {
        $response = new response();
        
        try {
            $stmt = $this->con->prepare("UPDATE room r
            SET r.`status` = 'EXPIRED'
            WHERE DATE_ADD(r.date_register, INTERVAL 10 MINUTE) < NOW()");

            $stmt->execute();
            
            $response->setSuccess(true)->setData(true)->setMsg('');
        }catch (PDOException $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }
}