# Configuración de Cloudinary

## Variables de Entorno Requeridas

Para que Cloudinary funcione correctamente, necesitas configurar las siguientes variables de entorno:

### En tu archivo `.env` local:
```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### En Vercel (Dashboard → Settings → Environment Variables):
```
CLOUDINARY_CLOUD_NAME = tu_cloud_name
CLOUDINARY_API_KEY = tu_api_key
CLOUDINARY_API_SECRET = tu_api_secret
```

## Cómo Obtener las Credenciales de Cloudinary

1. Ve a [cloudinary.com](https://cloudinary.com) y crea una cuenta gratuita
2. En el Dashboard, encontrarás:
   - **Cloud Name**: Nombre de tu cloud
   - **API Key**: Tu clave de API
   - **API Secret**: Tu secreto de API

## Características Implementadas

- ✅ Subida de imágenes a Cloudinary
- ✅ Optimización automática de imágenes (500x500px)
- ✅ Compresión automática
- ✅ Detección de caras para recorte inteligente
- ✅ Eliminación automática de imágenes al borrar usuarios
- ✅ Manejo de errores robusto
- ✅ Compatible con Vercel (sin almacenamiento local)

## Límites

- Tamaño máximo de archivo: 5MB
- Formatos soportados: JPG, PNG, GIF, WebP
- Transformaciones automáticas aplicadas
