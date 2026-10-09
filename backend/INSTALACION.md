# Instalar paquetes para inicializar el proyecto y configurar TypeScript y dependencias del backend

```bash
npm init -y
npm install typescript ts-node-dev @types/node --save-dev
npx tsc --init

npm install express typeorm reflect-metadata mysql2
npm install jsonwebtoken bcrypt
npm install --save-dev @types/jsonwebtoken
npm i --save-dev @types/bcrypt
npm install cors
npm i --save-dev @types/cors

npm install --save-dev @types/pdfkit

npm i nodemon -D