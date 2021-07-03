<?php

class conexao_pdo {
    protected $con;
    protected $host = "localhost";
    protected $dbname ="pula_pirata";
    protected $user = "root";
    protected $pass = "";

    protected function __construct () {
        try {
            $this->con = new PDO(
                "mysql:".
                "host={$this->host};".
                "dbname={$this->dbname};",
                $this->user,
                $this->pass
            );
        }catch(PDOException $e) {
            die('Erro de conexão: ' . $e->getMessage());
        }
    }

    public static function getInstance () {
        static $instance = null;
        if (null === $instance) $instance = new static();
        return $instance;
    }

    public function getConexao () {
        try {
            $this->con->exec("set names utf8");
            $this->con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $this->con;
        }catch (PDOException $e) {
            die("Erro de conexão: " . $e->getMessage());
        }
    }

}