<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'evolution' => [
        'url'      => env('EVOLUTION_API_URL'),
        'key'      => env('EVOLUTION_API_KEY'),
        'instance' => env('EVOLUTION_INSTANCE'),
    ],

    'feriados_api' => [
        'key' => env('FERIADOS_API_KEY'),
        'uf'  => env('FERIADOS_API_UF', 'SP'),
        'url' => env('FERIADOS_API_URL', 'https://feriadosapi.com/api/v1'),
    ],

    'brasilapi' => [
        'url' => env('BRASILAPI_URL', 'https://brasilapi.com.br/api'),
    ],

    'viacep' => [
        'url' => env('VIACEP_URL', 'https://viacep.com.br/ws'),
    ],

    'portal_atsantos' => [
        'url'          => env('PORTAL_ATSANTOS_URL'),
        'api_key'      => env('PORTAL_ATSANTOS_API_KEY'),
        'sync_enabled' => env('PORTAL_SYNC_ENABLED', true),
    ],

];
