<?php

class room_user implements JsonSerializable {
    private $id;
    private $iduser;
    private $idroom;
    private $points;
    private $color;
    private $move;
    private $date_register;

    public function __construct (
        $id = "",
        $iduser = "",
        $idroom = "",
        $points = "",
        $color = "",
        $move = "",
        $date_register = ""
    ) {
        $this->id = $id;
        $this->iduser = strip_tags($iduser);
        $this->idroom = strip_tags($idroom);
        $this->points = strip_tags($points);
        $this->color = strip_tags($color);
        $this->move = strip_tags($move);
        $this->date_register = $date_register;
    }

    public function setId ($id) {
        $this->id = $id;
        return $this;
    }
    public function setIduser ($iduser) {
        $this->iduser = $iduser;
        return $this;
    }
    public function setIdroom ($idroom) {
        $this->idroom = $idroom;
        return $this;
    }
    public function setPoints ($points) {
        $this->points = $points;
        return $this;
    }
    public function setColor ($color) {
        $this->color = $color;
        return $this;
    }
    public function setMove ($move) {
        $this->move = $move;
        return $this;
    }
    public function setDate_register ($date_register) {
        $this->date_register = $date_register;
        return $this;
    }

    public function getId () {
        return $this->id;
    }
    public function getIduser () {
        return $this->iduser;
    }
    public function getIdroom () {
        return $this->idroom;
    }
    public function getPoints () {
        return $this->points;
    }
    public function getColor () {
        return $this->color;
    }
    public function getMove () {
        return $this->move;
    }
    public function getDate_register () {
        return $this->date_register;
    }

    public function jsonSerialize () {
        return [
            "id" => $this->id,
            "iduser" => $this->iduser,
            "idroom" => $this->idroom,
            "points" => $this->points,
            "color" => $this->color,
            "move" => $this->move,
            "date_register" => $this->date_register
        ];
    }
}