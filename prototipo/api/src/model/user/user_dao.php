<?php

class user_dao {
    protected $con;

    public function __construct () {
        $this->con = conexao_pdo::getInstance()->getConexao();
    }

    function register (user $obj) {
        $response = new response();

        try {
            $stmt = $this->con->prepare("INSERT INTO user (`id`, `name`, `email`, `pass`) 
            VALUE (:id, :name, :email, :pass)");
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":pass", $pass);

            $id = (new DateTime())->getTimestamp();
            $name = $obj->getName();
            $email = $obj->getEmail();
            $pass = $obj->getPass();

            $stmt->execute();

            $response->setSuccess(true)->setData($id)->setMsg('');
            
        }catch(PDOException $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function login (user $obj) {
        $response = new response();

        try {
            $stmt = $this->con->prepare(
                "SELECT MD5(u.id) AS 'id', u.name
                FROM user u
                WHERE u.email = :email AND u.pass = :pass"
            );
            
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':pass', $pass);

            $email = $obj->getEmail();
            $pass = $obj->getPass();

            $stmt->execute();
            $obj = $stmt->fetchObject();
            
            $response->setSuccess(true)->setData($obj)->setMsg('');

        }catch (PDOException $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage());
        }

        return $response;
    }

    function getByID (user $obj) {
        $response = new response();

        try {
            $stmt = $this->con->prepare("SELECT *
            FROM user
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

    function getByEmail (user $obj) {
        $response = new response();

        try {
            $stmt = $this->con->prepare("SELECT *
            FROM user
            WHERE email = :email");
            $stmt->bindParam(':email', $email);

            $email = $obj->getEmail();

            $stmt->execute();
            $obj = $stmt->fetchObject();

            $response->setSuccess(true)->setData($obj)->setMsg('')->setAuthorized(false);

        }catch (PDOException $e) {
            $response->setSuccess(false)->setData('')->setMsg($e->getMessage())->setAuthorized(false);
        }

        return $response;
    }
}