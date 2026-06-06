# 🚨 Sistema de Alerta de Pánico · Condominio

Sistema de botón de pánico para condominio con llamadas telefónicas automáticas via Twilio.

## Estructura

```
panico-condominio/
├── api/
│   ├── alerta.js      → Dispara llamadas a todos los vecinos
│   └── vecinos.js     → Lista pública de parcelas
├── public/
│   ├── index.html     → App PWA para el celular (botón de pánico)
│   └── admin.html     → Panel para gestionar vecinos
├── vercel.json
└── package.json
```

## Deploy en Vercel

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "Sistema alerta condominio"
git remote add origin https://github.com/TU_USUARIO/panico-condominio.git
git push -u origin main
```

### 2. Importar en Vercel
- Ve a vercel.com → New Project → importa el repo

### 3. Variables de entorno en Vercel
En Settings → Environment Variables agrega:

| Variable | Valor |
|----------|-------|
| `TWILIO_ACCOUNT_SID` | Tu Account SID (empieza con AC...) |
| `TWILIO_AUTH_TOKEN` | Tu Auth Token de Twilio |
| `TWILIO_PHONE_NUMBER` | Tu número Twilio (formato +1XXXXXXXXXX) |
| `PANIC_PIN` | PIN de 4 dígitos que elijas |
| `VECINOS` | JSON generado desde admin.html |

### 4. Formato del JSON de vecinos
```json
[
  {"parcela":"70","nombre":"Fabian","telefono":"+56912345678"},
  {"parcela":"15","nombre":"María González","telefono":"+56987654321"}
]
```

## Uso

### App del celular
1. Abre `https://tu-proyecto.vercel.app` en el celular
2. Ingresa tu parcela, nombre y PIN
3. Agrega al homescreen (iPhone: compartir → Agregar a inicio)
4. En emergencia: presiona el botón rojo → ingresa PIN → confirma

### Panel admin
- Abre `https://tu-proyecto.vercel.app/admin.html`
- Agrega/edita vecinos
- Genera el JSON y pégalo en Vercel como variable `VECINOS`
- Redeploy

## Seguridad
- El PIN se verifica en el servidor antes de disparar las llamadas
- Los teléfonos nunca se exponen al frontend
- Cada llamada dice: "Alerta de emergencia. Parcela X necesita ayuda urgente."
