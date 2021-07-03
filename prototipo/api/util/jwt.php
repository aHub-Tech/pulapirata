<?php

class jwt {
    static protected $key = "@123"; // alterar para key única e secreta
    static protected $time = 1200; // tempo em segundos para expiração do token, recomendado 1200s

    public static function generate ($dados) {
        // header token
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256'
        ];

        // configurar com os dados que quiser
        $payload = [
            'exp' => (new DateTime("now"))->getTimestamp(),
            'dados' => $dados
        ];

        // json
        $header = json_encode($header);
        $payload = json_encode($payload);

        // base 64
        $header = base64_encode($header);
        $payload = base64_encode($payload);

        // Sign
        $sign = hash_hmac('sha256', "{$header}.{$payload}", self::$key, true);
        $sign = base64_encode($sign);

        // token
        $token = "{$header}.{$payload}.{$sign}";

        return $token;
    }

    public static function validate() {
        $auth = false;

        $http_header = apache_request_headers();

        if (!empty($http_header['Authorization'])) {
            // explode
            $bearer = explode(' ', $http_header['Authorization']);

            // explode token
            $token = explode('.', $bearer[1]);
            $header = $token[0];
            $payload = $token[1];
            $sign = $token[2];

            // verificando o tempo de validade do token 1200s (20 minutos)
            $payload_decode = json_decode(base64_decode($payload));
            $data_exp = (new DateTime())->setTimestamp($payload_decode->exp)->add(new DateInterval("PT".self::$time."S"))->getTimestamp();//format('Y-m-d H:i:s');
            $now = (new DateTime("now"))->getTimestamp();

            // validando
            $valid = hash_hmac('sha256', "{$header}.{$payload}", self::$key, true);
            $valid = base64_encode($valid);

            // se a chave estiver correta e o tempo não tiver experiado
            if ($sign === $valid && $data_exp > $now) {
                $auth = true;
            }else{
                $auth = false;
            }
        }else{
            $auth = false;
        }

        return $auth;
    }
}