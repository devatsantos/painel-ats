# ==========================================
# ESTÁGIO 1: Build do Frontend (Inertia/Vite)
# ==========================================
FROM node:20 AS frontend
WORKDIR /app

# Copia os arquivos de dependência do Node
COPY package*.json ./
RUN npm install

# Copia o resto do código e gera o build do Vite
COPY . .
RUN npm run build


# ==========================================
# ESTÁGIO 2: Imagem Final de Produção
# ==========================================
FROM serversideup/php:8.3-fpm-nginx

# O usuário root é necessário temporariamente para copiar os arquivos
USER root

# Define a pasta padrão de trabalho
WORKDIR /var/www/html

# Copia todo o código do seu repositório para o servidor, garantindo as permissões corretas
COPY --chown=www-data:www-data . /var/www/html

# Traz os arquivos Javascript/CSS compilados no Estágio 1 para dentro da pasta public
COPY --chown=www-data:www-data --from=frontend /app/public/build /var/www/html/public/build

# Volta para o usuário seguro do servidor web (www-data)
USER www-data

# Instala as dependências do Laravel (sem dev)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Otimizações de produção: cache de config, rotas, views e eventos
# Elimina o overhead de parsear PHP a cada requisição
RUN php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache \
 && php artisan event:cache