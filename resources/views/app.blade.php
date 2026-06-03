<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Flex:opsz,wght@8..144,100..1000&display=swap" rel="stylesheet" />

    @viteReactRefresh 
    
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    
    @inertiaHead
</head>
<body class="bg-gray-100 font-sans antialiased">
    
    @inertia

</body>
</html>