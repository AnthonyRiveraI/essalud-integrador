# 🔐 Credenciales de Prueba - Sistema ESSALUD

Este documento contiene las credenciales de los usuarios de prueba para cada módulo del sistema.

---

## 👨‍💼 Administrador

**Acceso:** [/administrador/login](http://localhost:3000/administrador/login)

- **Email:** `admin@essalud.gob.pe`
- **Contraseña:** `Admin123!`

**Permisos:**
- Gestión completa de usuarios (médicos, asistentes, pacientes)
- Visualización de estadísticas del sistema
- Acceso a historiales clínicos completos
- Administración del sistema

---

## 👨‍⚕️ Médico

**Acceso:** [/medico/login](http://localhost:3000/medico/login)

- **Email:** `jperez@essalud.gob.pe`
- **Contraseña:** `Medico123!`

**Permisos:**
- Gestión de citas del día
- Registro de triaje
- Registro de diagnósticos y recetas médicas
- Visualización de historial clínico de pacientes
- Dar de alta a pacientes
- Estadísticas personales

---

## 👩‍⚕️ Asistente de Enfermería

**Acceso:** [/asistente/login](http://localhost:3000/asistente/login)

- **Email:** `asistente@essalud.gob.pe`
- **Contraseña:** `Enfermera123!`

**Permisos:**
- Gestión de pacientes (registro, actualización)
- Visualización de historial general
- Soporte en atención médica

---

## 🧑‍🦱 Paciente

**Acceso:** [/paciente/login](http://localhost:3000/paciente/login)

- **DNI:** `78901234`
- **Contraseña:** `Paciente123!`

**Permisos:**
- Registro de citas médicas
- Consulta de citas programadas
- Visualización de historial clínico personal
- Chatbot de asistencia médica

---

## 📋 Notas Importantes

1. **Seguridad:** Estas credenciales son solo para pruebas y desarrollo. Nunca uses estas credenciales en producción.

2. **Cambio de contraseña:** Se recomienda que los usuarios cambien su contraseña en el primer acceso (funcionalidad pendiente de implementar).

3. **Base de datos:** Estos usuarios están insertados en la base de datos mediante los scripts en `/scripts/`.

4. **Roles:** El sistema valida que cada usuario acceda solo a su módulo correspondiente.

---

## 🗄️ Otros Pacientes Disponibles

Si necesitas probar con más pacientes, estos están registrados en la base de datos:

| DNI      | Nombre Completo                    | Email                     | Teléfono  |
|----------|------------------------------------|---------------------------|-----------|
| 78901234 | Pedro Antonio Sánchez Vargas       | pedro.sanchez@example.com | 987654327 |
| 78901235 | Lucía Isabel Torres Ramírez        | lucia.torres@example.com  | 987654328 |
| 78901236 | Miguel Ángel Castro Fernández      | miguel.castro@example.com | 987654329 |
| 97844662 | Anthony Grimaldo Rivera Inocencio  | null                      | 913947212 |

**Nota:** La contraseña para todos los pacientes de prueba es: `Paciente123!`

---

## 🔧 Regenerar Usuarios

Si necesitas regenerar los usuarios de prueba, ejecuta:

```bash
# Insertar usuarios de prueba
pnpm tsx scripts/insert-users.ts
```

O ejecuta manualmente los scripts SQL en orden:
1. `scripts/01-create-tables.sql`
2. `scripts/02-seed-data.sql`
3. `scripts/05-update-seed-data.sql`

---

**Última actualización:** Octubre 2025
