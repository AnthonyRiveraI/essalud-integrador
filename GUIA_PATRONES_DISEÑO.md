# 🎨 Guía de Patrones de Diseño - Sistema ESSALUD

**Versión:** 1.0  
**Fecha:** 29 de Octubre, 2025  
**Propósito:** Referencia rápida para mantener consistencia visual en el sistema

---

## 📚 Índice

1. [Toast Notifications](#toast-notifications)
2. [Inputs y Labels](#inputs-y-labels)
3. [Botones](#botones)
4. [Secciones de Formulario](#secciones-de-formulario)
5. [Dialogs](#dialogs)
6. [Headers con Contadores](#headers-con-contadores)
7. [Buscadores](#buscadores)

---

## 1. Toast Notifications

### ✅ Patrón Correcto

```typescript
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

// Éxito
toast({
  title: "✅ Operación exitosa",
  description: "El registro fue guardado correctamente",
})

// Error
toast({
  title: "❌ Error al guardar",
  description: "No se pudo completar la operación. Intenta nuevamente.",
  variant: "destructive",
})

// Advertencia
toast({
  title: "⚠️ Campos incompletos",
  description: "Por favor completa todos los campos requeridos (*)",
  variant: "destructive",
})

// Información
toast({
  title: "ℹ️ Información",
  description: "Descripción del mensaje informativo",
})
```

### ❌ Evitar

```typescript
// NO usar alert() ni confirm()
alert("Operación exitosa")
confirm("¿Estás seguro?")
```

---

## 2. Inputs y Labels

### ✅ Patrón Correcto

```typescript
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Campo requerido
<div className="space-y-2">
  <Label htmlFor="nombre" className="text-sm font-medium">
    Nombre <span className="text-destructive">*</span>
  </Label>
  <Input
    id="nombre"
    placeholder="Ej: Juan Carlos"
    value={formData.nombre}
    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
    className="h-11"
  />
</div>

// Campo opcional
<div className="space-y-2">
  <Label htmlFor="telefono" className="text-sm font-medium">
    Teléfono
  </Label>
  <Input
    id="telefono"
    placeholder="Ej: 987654321"
    value={formData.telefono}
    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
    className="h-11"
  />
</div>
```

### 📝 Características Clave
- ✅ Altura: `h-11`
- ✅ Labels con `text-sm font-medium`
- ✅ Asterisco rojo para campos requeridos
- ✅ Placeholders con ejemplos
- ✅ `htmlFor` coincide con `id` del input

---

## 3. Botones

### ✅ Patrón Correcto

```typescript
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

// Botón primario
<Button className="h-11 shadow-md hover:shadow-lg transition-all">
  <Save className="w-4 h-4 mr-2" />
  Guardar
</Button>

// Botón de ancho completo
<Button className="w-full h-11 shadow-md hover:shadow-lg transition-all">
  Registrar Paciente
</Button>

// Botón outline con hover personalizado
<Button
  variant="outline"
  className="gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
>
  <Edit2 className="w-3 h-3" />
  Editar
</Button>

// Botón destructivo
<Button
  variant="destructive"
  className="gap-1 hover:shadow-md transition-all"
>
  <Trash2 className="w-3 h-3" />
  Eliminar
</Button>
```

### 📝 Características Clave
- ✅ Altura: `h-11` o `h-12`
- ✅ Sombra: `shadow-md hover:shadow-lg`
- ✅ Transiciones: `transition-all`
- ✅ Iconos a la izquierda con `mr-2`

---

## 4. Secciones de Formulario

### ✅ Patrón Correcto

```typescript
import { User, CreditCard, Phone, Key } from "lucide-react"

// Sección con icono y título
<div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
    <User className="w-4 h-4 text-blue-600" />
    Información Personal
  </div>
  
  {/* Campos del formulario */}
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="nombre">Nombre <span className="text-destructive">*</span></Label>
      <Input id="nombre" className="h-11" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="apellido">Apellido <span className="text-destructive">*</span></Label>
      <Input id="apellido" className="h-11" />
    </div>
  </div>
</div>

// Panel informativo (credenciales, etc.)
<div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
  <div className="flex items-start gap-3">
    <Key className="w-5 h-5 text-blue-600 mt-0.5" />
    <div className="space-y-1">
      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
        Credenciales de Acceso
      </p>
      <p className="text-sm text-blue-700 dark:text-blue-300">
        DNI: <span className="font-mono font-bold">{formData.dni || "________"}</span>
      </p>
      <p className="text-sm text-blue-700 dark:text-blue-300">
        Contraseña: <span className="font-mono font-bold">Paciente123!</span>
      </p>
    </div>
  </div>
</div>
```

### 🎨 Colores Recomendados por Tema
- **Información Personal:** Azul (`text-blue-600`)
- **Identificación:** Verde (`text-green-600`)
- **Contacto:** Púrpura (`text-purple-600`)
- **Credenciales:** Azul (`text-blue-600`)
- **Profesional:** Naranja (`text-orange-600`)

---

## 5. Dialogs

### ✅ Patrón Correcto

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Plus, Edit2 } from "lucide-react"

<Dialog open={openDialog} onOpenChange={setOpenDialog}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader className="bg-linear-to-r from-blue-50 to-cyan-50 -m-6 mb-4 p-6 rounded-t-lg">
      <DialogTitle className="text-xl flex items-center gap-2">
        {editingItem ? (
          <>
            <Edit2 className="w-5 h-5 text-blue-600" />
            Editar Registro
          </>
        ) : (
          <>
            <Plus className="w-5 h-5 text-blue-600" />
            Nuevo Registro
          </>
        )}
      </DialogTitle>
      <DialogDescription>
        {editingItem
          ? "Actualiza los datos del registro seleccionado"
          : "Completa los datos para crear un nuevo registro"}
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-6 py-4">
      {/* Secciones del formulario */}
    </div>
  </DialogContent>
</Dialog>
```

### 📝 Características Clave
- ✅ Ancho máximo: `max-w-2xl`
- ✅ Altura máxima con scroll: `max-h-[90vh] overflow-y-auto`
- ✅ Header con gradiente
- ✅ Iconos en el título
- ✅ Espacio entre secciones: `space-y-6`

---

## 6. Headers con Contadores

### ✅ Patrón Correcto

```typescript
import { Users } from "lucide-react"

<CardHeader>
  <div className="flex items-center justify-between">
    <div>
      <CardTitle className="flex items-center gap-2">
        <Users className="w-5 h-5" />
        Lista de Pacientes
      </CardTitle>
      <CardDescription>
        Total de pacientes: <span className="font-semibold text-primary">{pacientes.length}</span>
      </CardDescription>
    </div>
    <Button className="gap-2 h-11 shadow-md hover:shadow-lg transition-all">
      <Plus className="w-4 h-4" />
      Agregar Paciente
    </Button>
  </div>
</CardHeader>

// Versión simple (sin botón)
<CardHeader>
  <CardTitle className="flex items-center gap-2">
    <FileText className="w-5 h-5" />
    Historial Médico
  </CardTitle>
  <CardDescription>
    Consulte el historial completo •{" "}
    <span className="font-semibold text-primary">{historial.length}</span> registros
  </CardDescription>
</CardHeader>
```

---

## 7. Buscadores

### ✅ Patrón Correcto

```typescript
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

// Buscador simple
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
  <Input
    placeholder="Buscar por nombre, DNI o correo..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-10 h-11"
  />
</div>

// Buscador con contador de resultados
<div className="space-y-2">
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input
      placeholder="Buscar por nombre, DNI o correo..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="pl-10 h-11"
    />
  </div>
  {searchTerm && (
    <p className="text-sm text-muted-foreground">
      Mostrando <span className="font-semibold text-primary">{filteredResults.length}</span> de{" "}
      {totalResults} resultados
    </p>
  )}
</div>
```

---

## 🎯 Checklist de Revisión

Antes de dar por terminado un componente, verifica:

- [ ] Reemplazado todos los `alert()` por `toast`
- [ ] Todos los inputs tienen `h-11`
- [ ] Todos los labels tienen `text-sm font-medium`
- [ ] Campos requeridos tienen asterisco rojo
- [ ] Botones tienen `h-11` y efectos de sombra
- [ ] Toast notifications tienen emojis
- [ ] Mensajes son descriptivos y personalizados
- [ ] Formularios organizados en secciones
- [ ] Dialogs tienen `max-w-2xl`
- [ ] Headers muestran contadores cuando aplique
- [ ] Buscadores tienen icono y `pl-10`
- [ ] Placeholders incluyen ejemplos
- [ ] Transiciones suaves en hover states

---

## 📦 Imports Comunes

```typescript
// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// Iconos más usados
import {
  User,
  Users,
  CreditCard,
  Phone,
  Mail,
  Key,
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react"

// Supabase
import { createClient } from "@/lib/supabase/client"
```

---

**Última actualización:** 29 de Octubre, 2025  
**Mantenedor:** GitHub Copilot
