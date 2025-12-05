/**
 * Script para crear usuarios administradores en Supabase
 * 
 * IMPORTANTE: Este script requiere la SERVICE_ROLE_KEY de Supabase
 * que solo debe usarse en el servidor, nunca en el cliente.
 * 
 * Para usar este script:
 * 1. Copia tu SERVICE_ROLE_KEY desde el dashboard de Supabase
 * 2. Agrégala a tu archivo .env como SUPABASE_SERVICE_ROLE_KEY
 * 3. Ejecuta: node scripts/create-admin-user.js
 */

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

// Configuración
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.log('Asegúrate de tener:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Cliente de administración
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Interfaz para input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createAdminUser() {
  console.log('🚀 Creador de Usuarios Admin para Radio Go\n');

  try {
    // Solicitar datos del usuario
    const email = await askQuestion('📧 Email del admin: ');
    const password = await askQuestion('🔒 Contraseña: ');
    const firstName = await askQuestion('👤 Nombre (opcional): ');
    const lastName = await askQuestion('👤 Apellido (opcional): ');

    console.log('\n⏳ Creando usuario...');

    // Crear el usuario
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        role: 'admin'
      }
    });

    if (error) {
      console.error('❌ Error creando usuario:', error.message);
      return;
    }

    console.log('✅ Usuario admin creado exitosamente!');
    console.log('📧 Email:', data.user.email);
    console.log('🆔 ID:', data.user.id);
    console.log('\n🎉 El usuario puede ahora acceder al panel de administración en:');
    console.log('http://localhost:5174');

  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
  } finally {
    rl.close();
  }
}

async function listUsers() {
  console.log('📋 Usuarios existentes:\n');

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('❌ Error obteniendo usuarios:', error.message);
      return;
    }

    if (data.users.length === 0) {
      console.log('No hay usuarios registrados.');
      return;
    }

    data.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Creado: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`   Verificado: ${user.email_confirmed_at ? 'Sí' : 'No'}`);
      console.log('');
    });

  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
  }
}

async function main() {
  console.log('🎯 ¿Qué deseas hacer?');
  console.log('1. Crear nuevo usuario admin');
  console.log('2. Listar usuarios existentes');
  console.log('3. Salir');

  const choice = await askQuestion('\nSelecciona una opción (1-3): ');

  switch (choice.trim()) {
    case '1':
      await createAdminUser();
      break;
    case '2':
      await listUsers();
      break;
    case '3':
      console.log('👋 ¡Hasta luego!');
      rl.close();
      return;
    default:
      console.log('❌ Opción inválida');
      rl.close();
      return;
  }

  rl.close();
}

// Ejecutar el script
main().catch(console.error);
