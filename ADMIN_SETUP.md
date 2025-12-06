# Documentación del Sistema de Administración - Radio Go

## Resumen

El sistema de administración para Radio Go ya está completamente implementado y funcional. Incluye:

### ✅ Funcionalidades Implementadas:

1. **Sistema de Autenticación**
   - Login con email y contraseña
   - Protección de rutas administrativas
   - Gestión de sesiones con Supabase Auth

2. **Panel de Administración**
   - Interfaz limpia y organizada
   - Acceso a gestión de banners y programación
   - Botón de cerrar sesión

3. **Editor de Banners**
   - Crear, editar y eliminar banners
   - Subida de imágenes en base64
   - Configuración de prioridades y enlaces
   - Vista previa de imágenes

4. **Editor de Programación**
   - Crear, editar y eliminar programas
   - Gestión de horarios y días de la semana
   - Información de conductores y descripciones
   - Detección automática de programas en vivo

## Cómo Crear un Usuario Administrador

### Opción 1: Desde el Dashboard de Supabase (Recomendado)

1. **Accede al Dashboard de Supabase:**
   - Ve a https://supabase.com/dashboard
   - Inicia sesión con tu cuenta
   - Selecciona tu proyecto "radio-go"

2. **Navega a Authentication > Users:**
   - En el menú lateral, haz clic en "Authentication"
   - Luego haz clic en "Users"

3. **Crear un nuevo usuario:**
   - Haz clic en "Add user" o "Invite user"
   - Completa el formulario:
     - **Email:** `admin@radio-go.com` (o el email que prefieras)
     - **Password:** Crea una contraseña segura
     - **Confirm Email:** Marca como true si quieres que esté verificado
   - Haz clic en "Create user"

### Opción 2: Usando el código (Programáticamente)

Si necesitas crear usuarios desde código, puedes usar el cliente de administración de Supabase:

```javascript
// Esto debe ejecutarse desde el servidor con service_role key
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Necesitas esta key del dashboard
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Crear usuario admin
const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email: 'admin@radio-go.com',
  password: 'tu-contraseña-segura',
  email_confirm: true
})
```

## Acceso al Sistema

1. **URL de la aplicación:** http://localhost:5174 (desarrollo)
2. **Acceso al admin:**
   - Ve a la sección "Contacto" en la página principal
   - Haz clic en "Acceso Admin" en el footer
   - Ingresa las credenciales del usuario creado

## Credenciales de Ejemplo

Para pruebas, puedes crear un usuario con estas credenciales:
- **Email:** admin@radio-go.com
- **Contraseña:** RadioGo2024!

## Configuración de Permisos en Supabase

### Políticas RLS (Row Level Security)

Asegúrate de que las tablas `banners` y `programs` tengan las políticas correctas:

```sql
-- Política para banners (solo usuarios autenticados pueden gestionar)
CREATE POLICY "Authenticated users can manage banners" ON banners
FOR ALL USING (auth.role() = 'authenticated');

-- Política para programs (solo usuarios autenticados pueden gestionar)
CREATE POLICY "Authenticated users can manage programs" ON programs
FOR ALL USING (auth.role() = 'authenticated');

-- Permitir lectura pública para mostrar en la web
CREATE POLICY "Anyone can view active banners" ON banners
FOR SELECT USING (active = true);

CREATE POLICY "Anyone can view programs" ON programs
FOR SELECT USING (true);
```

## Estructura de la Base de Datos

### Tabla `banners`
```sql
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  link_url TEXT,
  image_data TEXT NOT NULL,
  image_type TEXT NOT NULL,
  image_size_bytes INTEGER,
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla `programs`
```sql
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  day_of_week INTEGER NOT NULL, -- 1=Lunes, 7=Domingo
  description TEXT,
  host TEXT,
  image_url TEXT,
  live BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Características del Sistema

### Seguridad
- ✅ Autenticación requerida para acceso admin
- ✅ Row Level Security habilitado
- ✅ Validación de formularios
- ✅ Manejo de errores

### Usabilidad
- ✅ Interfaz intuitiva y responsive
- ✅ Confirmaciones para eliminaciones
- ✅ Feedback visual de acciones
- ✅ Carga de imágenes con preview

### Funcionalidades Técnicas
- ✅ Subida de imágenes en base64
- ✅ Gestión de múltiples días por programa
- ✅ Detección automática de programas en vivo
- ✅ Slider automático de banners
- ✅ Ordenamiento y prioridades

## Próximos Pasos Recomendados

1. **Crear el usuario administrador** usando el Dashboard de Supabase
2. **Probar todas las funcionalidades** para asegurar que funcionen correctamente
3. **Configurar backups** de la base de datos
4. **Implementar logs de auditoría** para tracking de cambios
5. **Agregar más validaciones** si es necesario

## Solución de Problemas

### Error de autenticación
- Verifica que las variables de entorno estén correctas
- Confirma que el usuario existe en el dashboard de Supabase
- Revisa que el email esté confirmado

### Problemas con imágenes
- Asegúrate de que el tamaño no exceda 5MB
- Verifica que el formato sea compatible (PNG, JPG, etc.)
- Revisa los permisos de la tabla `banners`

### Problemas con programación
- Confirma que los horarios estén en formato correcto (HH:mm)
- Verifica que los días de la semana sean números del 1-7
- Revisa los permisos de la tabla `programs`

---

**El sistema está listo para usar. Solo necesitas crear el usuario administrador y comenzar a gestionar el contenido.**
