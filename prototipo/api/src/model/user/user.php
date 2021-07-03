<?php

class user implements JsonSerializable {
    private $id;
    private $name;
    private $email;
    private $pass;
    private $date_register;

    public function __construct (
        $id = "",
        $name = "",
        $email = "",
        $pass = "",
        $date_register = ""
    ) {
        $this->id = $id;
        $this->name = strip_tags($name);
        $this->email = strip_tags($email);
        $this->pass = strip_tags($pass);
        $this->date_register = $date_register;
    }

    public function setId ($id) {
        $this->id = $id;
        return $this;
    }
    public function setName ($name) {
        $this->name = $name;
        return $this;
    }
    public function setEmail ($email) {
        $this->email = $email;
        return $this;
    }
    public function setPass ($pass) {
        $this->pass = $pass;
        return $this;
    }
    public function setDate_register ($date_register) {
        $this->date_register = $date_register;
        return $this;
    }

    public function getId () {
        return $this->id;
    }
    public function getName () {
        return $this->name;
    }
    public function getEmail () {
        return $this->email;
    }
    public function getPass () {
        return $this->pass;
    }
    public function getDate_register () {
        return $this->date_register;
    }

    public function jsonSerialize () {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "email" => $this->email,
            "pass" => $this->pass,
            "date_register" => $this->date_register
        ];
    }
}