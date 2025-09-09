# Configuración de Variables de Entorno para Vercel

## Variables Requeridas en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

### 1. Base de Datos MongoDB
```
MONGODB_URI = mongodb+srv://usuario:password@cluster.mongodb.net/nombre-db
```

### 2. Cloudinary (Requerido - para manejo de imágenes)
```
CLOUDINARY_CLOUD_NAME = tu_cloud_name
CLOUDINARY_API_KEY = tu_api_key
CLOUDINARY_API_SECRET = tu_api_secret
```

**Nota**: Si no configuras Cloudinary, verás el warning "⚠️ Cloudinary no está configurado correctamente" pero la aplicación funcionará sin subida de imágenes.

### 3. Entorno
```
NODE_ENV = production
```

## Cómo Obtener MONGODB_URI

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Crea un cluster
3. Ve a "Connect" → "Connect your application"
4. Copia la connection string
5. Reemplaza `<password>` con tu contraseña
6. Reemplaza `<dbname>` con el nombre de tu base de datos

## Ejemplo de MONGODB_URI
```
mongodb+srv://miUsuario:miPassword123@cluster0.abcde.mongodb.net/crud-usuarios?retryWrites=true&w=majority
```

## Verificar Configuración

Después de configurar las variables:
1. Haz un nuevo deploy en Vercel
2. Verifica los logs en Vercel Dashboard → Functions
3. Deberías ver: "✅ MongoDB conectado exitosamente"

## Troubleshooting

Si sigues viendo errores 500:
1. Verifica que todas las variables estén configuradas
2. Asegúrate de que la IP 0.0.0.0/0 esté permitida en MongoDB Atlas
3. Revisa los logs de Vercel para más detalles
