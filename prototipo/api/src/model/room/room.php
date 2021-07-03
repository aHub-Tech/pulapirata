<?php

class room implements JsonSerializable {
    private $id;
    private $owner;
    private $status;
    private $pass;
    private $date_register;

    public function __construct (
        $id = "",
        $owner = "",
        $status = "",
        $pass = "",
        $date_register = ""
    ) {
        $this->id = $id;
        $this->owner = strip_tags($owner);
        $this->status = strip_tags($status);
        $this->pass = strip_tags($pass);
        $this->date_register = $date_register;
    }

    public function setId ($id) {
        $this->id = $id;
        return $this;
    }
    public function setOwner ($owner) {
        $this->owner = $owner;
        return $this;
    }
    public function setStatus ($status) {
        $this->status = $status;
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
    public function getOwner () {
        return $this->owner;
    }
    public function getStatus () {
        return $this->status;
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
            "owner" => $this->owner,
            "status" => $this->status,
            "pass" => $this->pass,
            "date_register" => $this->date_register
        ];
    }
}