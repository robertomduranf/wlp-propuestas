# WLP Propuestas — GitHub + Vercel

Puente público para las demos de WEB LOCAL PRO BUILDER.

## Arquitectura

Cliente -> https://propuesta.robertoduranai.com/TOKEN -> Vercel -> Apps Script demo

Las decisiones del cliente se envían a `/api/decision`. Vercel añade el secreto del puente en servidor y reenvía la solicitud a Apps Script. El secreto no queda expuesto en el navegador.

## 1. Apps Script

Instala `Code_V4_1_DOMINIO.gs` en el proyecto del Builder y ejecuta `setupWLP()` una vez.
En la hoja CONFIG aparecerá `DEMO_BRIDGE_SECRET`.

Publica/actualiza la implementación pública de demos y copia su URL `/exec`.

## 2. Configurar este repo

Abre `vercel.json` y reemplaza:

`REEMPLAZAR_DEPLOYMENT_ID`

por el ID de la implementación pública de Apps Script. No pegues toda la URL, solo la parte entre `/s/` y `/exec`.

Ejemplo:
`https://script.google.com/macros/s/ABC123/exec`
-> ID: `ABC123`

## 3. GitHub

Crea un repositorio, por ejemplo `wlp-propuestas`, y sube todo el contenido de esta carpeta.

## 4. Vercel

Importa el repositorio desde GitHub.
En Settings -> Environment Variables crea:

- `APPS_SCRIPT_DEMO_URL` = URL completa `/exec` de la implementación pública.
- `WLP_BRIDGE_SECRET` = valor `DEMO_BRIDGE_SECRET` de la hoja CONFIG.

Haz Redeploy después de guardar las variables.

## 5. Dominio

En Vercel -> Project -> Settings -> Domains agrega:

`propuesta.robertoduranai.com`

Vercel te indicará el registro DNS que debes crear en Hostinger. Usa exactamente el valor que Vercel muestre en ese momento.

## 6. Builder

En WEB LOCAL PRO BUILDER configura como URL pública:

`https://propuesta.robertoduranai.com`

Las demos quedarán así:

`https://propuesta.robertoduranai.com/XXXXXXXXXXXX`

## Seguridad

- Las páginas llevan `noindex` tanto en HTML como en cabecera HTTP.
- Apps Script sigue ejecutándose como backend.
- `WLP_BRIDGE_SECRET` existe solo en Apps Script y Vercel; no debe subirse a GitHub.
- El enlace de demo contiene un token no secuencial.
