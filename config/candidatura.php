<?php

return [
    /*
    |--------------------------------------------------------------------------
    | OTP (código de verificação)
    |--------------------------------------------------------------------------
    */
    'otp_expira_minutos' => env('OTP_EXPIRA_MINUTOS', 15),

    /*
    |--------------------------------------------------------------------------
    | Token persistente do candidato (login sem OTP)
    |--------------------------------------------------------------------------
    */
    'token_expira_dias' => env('TOKEN_EXPIRA_DIAS', 14),

    /*
    |--------------------------------------------------------------------------
    | Prazo para agendamento de entrevista após seleção
    |--------------------------------------------------------------------------
    */
    'selecao_expira_dias' => env('SELECAO_EXPIRA_DIAS', 7),

    /*
    |--------------------------------------------------------------------------
    | Quarentena de reprovação (dias até poder tentar novamente)
    |--------------------------------------------------------------------------
    */
    'quarentena_reprovacao_dias' => env('QUARENTENA_REPROVACAO_DIAS', 30),

    /*
    |--------------------------------------------------------------------------
    | Duração padrão da entrevista online (para evento no Meet)
    |--------------------------------------------------------------------------
    */
    'entrevista_duracao_minutos' => env('ENTREVISTA_DURACAO_MINUTOS', 30),
];
