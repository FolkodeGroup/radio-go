# Guía de Administración - Radio Go

## 🎯 Resumen Ejecutivo

El sistema de administración de Radio Go está **completamente implementado y listo para usar**. Incluye:

- ✅ **Sistema de autenticación** con Supabase
- ✅ **Gestión de banners** publicitarios
- ✅ **Gestión de programación** de radio
- ✅ **Interfaz de usuario** intuitiva y responsive
- ✅ **Seguridad** con Row Level Security (RLS)

## 🚀 Inicio Rápido

### 1. Crear Usuario Administrador

**Opción A: Dashboard de Supabase (Más fácil)**
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Authentication > Users > "Add user"
4. Email: `admin@radio-go.com`
5. Password: `RadioGo2024!` (o la que prefieras)
6. ✅ Confirm email: `true`

**Opción B: Script automatizado**
```bash
# Primero, agrega tu SERVICE_ROLE_KEY al .env
echo "SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aquí" >> .env

# Ejecuta el script
node scripts/create-admin-user.js
```

### 2. Acceder al Sistema

1. Ve a http://localhost:5174
2. Baja hasta el footer
3. Haz clic en "Acceso Admin"
4. Ingresa tus credenciales
5. ¡Listo! Ya puedes administrar banners y programación

## 📊 Funcionalidades Disponibles

### 🖼️ Gestión de Banners
- **Crear banners** con imagen, título, descripción y enlace
- **Editar banners** existentes
- **Eliminar banners** no deseados
- **Activar/desactivar** banners
- **Prioridades** para orden de visualización
- **Vista previa** en tiempo real

### 📻 Gestión de Programación
- **Crear programas** con horarios, días y conductores
- **Editar programación** existente
- **Eliminar programas** no deseados
- **Múltiples días** por programa
- **Detección automática** de programas en vivo
- **Información completa** de cada programa

## 🛠️ Configuración Técnica

### Variables de Entorno Requeridas
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_key (solo para scripts)
```

### Estructura de Base de Datos

**Tabla: banners**
- `id` (UUID) - Identificador único
- `title` (TEXT) - Título del banner
- `description` (TEXT) - Descripción opcional
- `link_url` (TEXT) - URL de destino
- `image_data` (TEXT) - Imagen en base64
- `image_type` (TEXT) - Tipo MIME
- `active` (BOOLEAN) - Si está activo
- `priority` (INTEGER) - Orden de visualización

**Tabla: programs**
- `id` (UUID) - Identificador único
- `name` (TEXT) - Nombre del programa
- `start_time` (TIME) - Hora de inicio
- `end_time` (TIME) - Hora de fin
- `day_of_week` (INTEGER) - Día (1=Lunes, 7=Domingo)
- `description` (TEXT) - Descripción
- `host` (TEXT) - Conductor
- `image_url` (TEXT) - URL de imagen opcional

## 🔒 Seguridad

### Políticas Implementadas
- **Autenticación requerida** para todas las operaciones administrativas
- **Row Level Security (RLS)** habilitado en todas las tablas
- **Validación de formularios** en frontend
- **Manejo de errores** robusto

### Permisos de Usuario
- Solo usuarios **autenticados** pueden gestionar contenido
- Lectura **pública** para mostrar banners y programación
- **No hay roles complejos** - simplicidad es clave

## 🎨 Interfaz de Usuario

### Diseño
- **Responsive** - funciona en móvil y desktop
- **Dark theme** - moderno y profesional
- **Colores de marca** - teal y orange
- **Animaciones** - smooth y profesionales

### Experiencia de Usuario
- **Navegación intuitiva** - todo es autoexplicativo
- **Feedback visual** - confirmaciones y errores claros
- **Carga rápida** - optimizado para performance
- **Accesibilidad** - cumple estándares web

## 📱 Uso del Sistema

### Flujo de Trabajo para Banners
1. **Crear** banner con imagen y datos
2. **Configurar** prioridad y enlaces
3. **Activar** para que aparezca en la web
4. **Verificar** en la página principal
5. **Editar** si es necesario

### Flujo de Trabajo para Programación
1. **Definir** horarios y días
2. **Agregar** información del programa
3. **Incluir** conductor y descripción
4. **Guardar** y verificar en la web
5. **Actualizar** según necesidades

## 🐛 Solución de Problemas

### Problemas Comunes

**No puedo hacer login**
- ✅ Verifica que el usuario exista en Supabase
- ✅ Confirma que el email esté verificado
- ✅ Revisa las variables de entorno

**Error al subir imagen**
- ✅ Máximo 5MB por imagen
- ✅ Formatos soportados: PNG, JPG, GIF
- ✅ Revisa permisos de la tabla banners

**Programa no aparece como "en vivo"**
- ✅ Verifica formato de hora (HH:mm)
- ✅ Confirma día de la semana (1-7)
- ✅ Revisa zona horaria del servidor

### Logs y Debugging
- **Console del navegador** - errores de frontend
- **Dashboard de Supabase** - logs de backend
- **Network tab** - problemas de API

## 🚀 Despliegue en Producción

### Checklist Pre-Despliegue
- [ ] Usuario admin creado
- [ ] Variables de entorno configuradas
- [ ] Políticas RLS verificadas
- [ ] Contenido de prueba creado
- [ ] Dominio configurado
- [ ] SSL habilitado

### Consideraciones de Seguridad
- **Nunca** expongas SERVICE_ROLE_KEY en el cliente
- **Siempre** usa HTTPS en producción
- **Regularmente** revisa usuarios y permisos
- **Mantén** Supabase actualizado

## 📞 Soporte

### Recursos
- **Documentación Supabase:** https://supabase.com/docs
- **React:** https://react.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **Vite:** https://vitejs.dev/

### Contacto
Para soporte técnico o consultas sobre la implementación, contacta al equipo de desarrollo.

---

**🎉 ¡El sistema está listo! Solo crea tu usuario admin y comienza a gestionar tu radio.**
