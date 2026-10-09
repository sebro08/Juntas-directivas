# Dump de Base de Datos - Junta Directiva

Este archivo contiene el script de creación (`dump`) de la base de datos del sistema de administración de juntas directivas. Puedes usar este archivo para levantar la base de datos localmente o en un entorno de desarrollo.

## Archivo incluido

- `junta_directiva_dump.sql`: Script SQL con toda la estructura y datos iniciales del sistema.

---

## Requisitos

- MySQL 8.x o compatible
- Tener creada una base de datos vacía con el nombre `junta_directiva`

---

## Cómo restaurar el dump

### 1. Crear la base de datos (si aún no existe)

```bash
mysql -u root -p -e "CREATE DATABASE junta_directiva;"
