<?php

class response implements JsonSerializable {
    private $success;
    private $data;
    private $msg;
    private $authorized;

    public function __construct (
        $success = false,
        $data = null,
        $msg = "Ocorreu um erro",
        $authorized = false
    ) {
        $this->success = $success;
        $this->data = $data;
        $this->msg = $msg;
        $this->authorized = $authorized;
    }

    public function getSuccess () {
        return $this->success;     
    }
    public function getData () {
        return $this->data;
    }
    public function getMsg () {
        return $this->msg;
    }
    public function getAuthorized () {
        return $this->authorized;
    }
    public function setSuccess ($success) {
        $this->success = $success;
        return $this;
    }
    public function setData ($data) {
        $this->data = $data;
        return $this;
    }
    public function setMsg ($msg) {
        $this->msg = $msg;
        return $this;
    }
    public function setAuthorized ($authorized) {
        $this->authorized = $authorized;
        return $this;
    }

    public function JsonSerialize() {
        return [
            "success" => $this->success,
            "data" => $this->data,
            "msg" => $this->msg,
            "authorized" => $this->authorized
        ];
    }
}