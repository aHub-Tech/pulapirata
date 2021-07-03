<?php

class room_slot implements JsonSerializable {
    private $id;
    private $idroom;
    private $iduser;
    private $color;
    private $jump;
    private $checked;

    public function __construct (
        $id = "",
        $idroom = "",
        $iduser = "",
        $color = "",
        $jump = "",
        $checked = ""
    ) {
        $this->id = $id;
        $this->idroom = strip_tags($idroom);
        $this->iduser = strip_tags($iduser);
        $this->color = strip_tags($color);
        $this->jump = strip_tags($jump);
        $this->checked = $checked;
    }

    public function setId ($id) {
        $this->id = $id;
        return $this;
    }
    public function setIdroom ($idroom) {
        $this->idroom = $idroom;
        return $this;
    }
    public function setIduser ($iduser) {
        $this->iduser = $iduser;
        return $this;
    }
    public function setColor ($color) {
        $this->color = $color;
        return $this;
    }
    public function setJump ($jump) {
        $this->jump = $jump;
        return $this;
    }
    public function setChecked ($checked) {
        $this->checked = $checked;
        return $this;
    }

    public function getId () {
        return $this->id;
    }
    public function getIdroom () {
        return $this->idroom;
    }
    public function getIduser () {
        return $this->iduser;
    }
    public function getColor () {
        return $this->color;
    }
    public function getJump () {
        return $this->jump;
    }
    public function getChecked () {
        return $this->checked;
    }

    public function jsonSerialize () {
        return [
            "id" => $this->id,
            "idroom" => $this->idroom,
            "iduser" => $this->iduser,
            "color" => $this->color,
            "jump" => $this->jump,
            "checked" => $this->checked
        ];
    }
}