// Base de conocimiento médico básico
// Este archivo contiene información médica que ayuda a la IA a dar mejores respuestas

export const conocimientoMedico = {
  // Mapeo de síntomas a especialidades
  sintomas: {
    "dolor de cabeza": {
      causas: ["tensión muscular", "migraña", "deshidratación", "estrés", "sinusitis"],
      especialidad: "Neurología",
      especialidadAlternativa: "Medicina General",
      urgencia: "baja",
      consejos: [
        "Descansar en un lugar tranquilo y oscuro",
        "Beber suficiente agua",
        "Evitar luces brillantes y ruidos fuertes",
        "Aplicar compresas frías en la frente"
      ],
      cuandoBuscarAyuda: "Si el dolor es muy intenso, súbito, o viene acompañado de fiebre alta, rigidez de cuello, confusión o pérdida de conciencia"
    },
    "dolor de pecho": {
      causas: ["angina", "infarto", "ansiedad", "acidez estomacal", "problemas musculares"],
      especialidad: "Cardiología",
      urgencia: "urgente",
      consejos: [
        "Buscar atención médica inmediata",
        "No conducir, llamar una ambulancia",
        "Sentarse y tratar de mantener la calma",
        "Si tiene aspirina y no es alérgico, puede masticar una tableta"
      ],
      cuandoBuscarAyuda: "INMEDIATAMENTE - Este es un síntoma que requiere atención urgente"
    },
    "fiebre": {
      causas: ["infección viral", "infección bacteriana", "gripe", "COVID-19"],
      especialidad: "Medicina General",
      urgencia: "media",
      consejos: [
        "Mantenerse hidratado",
        "Descansar adecuadamente",
        "Tomar antipiréticos como paracetamol (según indicación)",
        "Usar ropa ligera y mantener ambiente fresco"
      ],
      cuandoBuscarAyuda: "Si la fiebre supera 39°C, dura más de 3 días, o viene con dificultad respiratoria"
    },
    "tos": {
      causas: ["resfriado común", "bronquitis", "asma", "alergias", "COVID-19"],
      especialidad: "Neumología",
      especialidadAlternativa: "Medicina General",
      urgencia: "baja",
      consejos: [
        "Beber líquidos calientes",
        "Evitar irritantes como humo",
        "Usar humidificador",
        "Miel con limón (si no es alérgico)"
      ],
      cuandoBuscarAyuda: "Si hay dificultad para respirar, tos con sangre, o dura más de 3 semanas"
    },
    "dolor abdominal": {
      causas: ["gastritis", "indigestión", "apendicitis", "cálculos", "infección"],
      especialidad: "Gastroenterología",
      especialidadAlternativa: "Medicina General",
      urgencia: "media",
      consejos: [
        "Evitar alimentos pesados",
        "Beber agua",
        "No tomar medicamentos sin receta",
        "Reposo"
      ],
      cuandoBuscarAyuda: "Si el dolor es intenso, localizado en lado derecho inferior, con fiebre o vómitos"
    },
    "mareo": {
      causas: ["presión baja", "deshidratación", "anemia", "problemas del oído interno"],
      especialidad: "Medicina General",
      urgencia: "media",
      consejos: [
        "Sentarse o acostarse inmediatamente",
        "Beber agua",
        "Respirar profundamente",
        "Evitar movimientos bruscos"
      ],
      cuandoBuscarAyuda: "Si viene con dolor de pecho, desmayo, visión doble o dificultad para hablar"
    },
    "náuseas": {
      causas: ["gastritis", "intoxicación alimentaria", "embarazo", "migraña", "infección"],
      especialidad: "Gastroenterología",
      especialidadAlternativa: "Medicina General",
      urgencia: "media",
      consejos: [
        "Evitar alimentos grasos",
        "Beber líquidos claros en pequeños sorbos",
        "Descansar",
        "Evitar olores fuertes"
      ],
      cuandoBuscarAyuda: "Si hay vómitos persistentes, deshidratación, o dolor abdominal intenso"
    },
    "dificultad respiratoria": {
      causas: ["asma", "neumonía", "COVID-19", "ansiedad", "problemas cardíacos"],
      especialidad: "Neumología",
      urgencia: "urgente",
      consejos: [
        "Buscar atención médica INMEDIATA",
        "Llamar al 106 (SAMU)",
        "Sentarse en posición vertical",
        "Mantener la calma y respirar lentamente"
      ],
      cuandoBuscarAyuda: "INMEDIATAMENTE - Este es un síntoma de emergencia"
    },
    "dolor muscular": {
      causas: ["ejercicio intenso", "gripe", "tensión", "fibromialgia"],
      especialidad: "Traumatología",
      especialidadAlternativa: "Medicina General",
      urgencia: "baja",
      consejos: [
        "Aplicar frío o calor según el caso",
        "Descansar el área afectada",
        "Estiramientos suaves",
        "Analgésicos de venta libre si es necesario"
      ],
      cuandoBuscarAyuda: "Si el dolor es muy intenso, persiste por más de una semana, o hay hinchazón significativa"
    },
    "erupción cutánea": {
      causas: ["alergia", "dermatitis", "infección", "reacción a medicamentos"],
      especialidad: "Dermatología",
      urgencia: "baja",
      consejos: [
        "No rascar la zona afectada",
        "Mantener la piel limpia y seca",
        "Evitar productos irritantes",
        "Usar ropa de algodón"
      ],
      cuandoBuscarAyuda: "Si hay fiebre, la erupción se extiende rápidamente, o hay dificultad para respirar"
    },
    "dolor de garganta": {
      causas: ["faringitis viral", "amigdalitis", "alergia", "reflujo"],
      especialidad: "Otorrinolaringología",
      especialidadAlternativa: "Medicina General",
      urgencia: "baja",
      consejos: [
        "Hacer gárgaras con agua tibia y sal",
        "Beber líquidos calientes",
        "Chupar pastillas para la garganta",
        "Descansar la voz"
      ],
      cuandoBuscarAyuda: "Si hay dificultad para tragar, respirar, o fiebre alta persistente"
    }
  },

  // Información sobre especialidades
  especialidades: {
    "Cardiología": {
      descripcion: "Especialidad médica que se ocupa del corazón y sistema cardiovascular",
      tratan: ["problemas cardíacos", "hipertensión", "arritmias", "insuficiencia cardíaca"],
      sintomas: ["dolor de pecho", "palpitaciones", "fatiga extrema", "hinchazón de piernas"]
    },
    "Neurología": {
      descripcion: "Especialidad que trata enfermedades del sistema nervioso",
      tratan: ["migrañas", "epilepsia", "párkinson", "esclerosis múltiple", "ACV"],
      sintomas: ["dolor de cabeza intenso", "mareos", "convulsiones", "pérdida de memoria"]
    },
    "Pediatría": {
      descripcion: "Especialidad dedicada a la salud de niños y adolescentes",
      tratan: ["control de niño sano", "vacunas", "enfermedades infantiles"],
      sintomas: ["fiebre en niños", "problemas de crecimiento", "infecciones comunes"]
    },
    "Gastroenterología": {
      descripcion: "Especialidad del sistema digestivo",
      tratan: ["gastritis", "úlceras", "reflujo", "colon irritable", "hepatitis"],
      sintomas: ["dolor abdominal", "acidez", "diarrea", "estreñimiento"]
    },
    "Neumología": {
      descripcion: "Especialidad de las vías respiratorias y pulmones",
      tratan: ["asma", "EPOC", "neumonía", "bronquitis", "tuberculosis"],
      sintomas: ["tos persistente", "dificultad respiratoria", "dolor al respirar"]
    },
    "Medicina General": {
      descripcion: "Atención médica integral y de primer contacto",
      tratan: ["chequeos generales", "enfermedades comunes", "control de crónicos"],
      sintomas: ["síntomas generales", "prevención", "seguimiento"]
    },
    "Traumatología": {
      descripcion: "Especialidad del sistema músculo-esquelético",
      tratan: ["fracturas", "esguinces", "lesiones deportivas", "problemas articulares"],
      sintomas: ["dolor articular", "lesiones", "problemas de movilidad"]
    },
    "Dermatología": {
      descripcion: "Especialidad de la piel, cabello y uñas",
      tratan: ["acné", "dermatitis", "psoriasis", "lunares", "infecciones cutáneas"],
      sintomas: ["erupciones", "picazón", "cambios en lunares", "caída de cabello"]
    },
    "Oftalmología": {
      descripcion: "Especialidad de los ojos y la visión",
      tratan: ["problemas visuales", "cataratas", "glaucoma", "conjuntivitis"],
      sintomas: ["visión borrosa", "dolor ocular", "lagrimeo", "enrojecimiento"]
    }
  },

  // Niveles de urgencia
  urgencias: {
    urgente: {
      mensaje: "⚠️ EMERGENCIA: Busca atención médica inmediata",
      sintomas: ["dolor de pecho intenso", "dificultad para respirar severa", "sangrado abundante", "pérdida de conciencia"]
    },
    alta: {
      mensaje: "⚠️ URGENTE: Debes ser atendido en las próximas 24 horas",
      sintomas: ["fiebre muy alta", "dolor intenso", "vómitos persistentes"]
    },
    media: {
      mensaje: "📅 IMPORTANTE: Agenda una cita en los próximos 2-3 días",
      sintomas: ["fiebre moderada", "dolor controlable", "síntomas molestos"]
    },
    baja: {
      mensaje: "📅 RECOMENDADO: Puedes agendar cita cuando gustes",
      sintomas: ["molestias leves", "consulta preventiva", "seguimiento"]
    }
  }
}

// Función para detectar síntomas en el texto del usuario
export function detectarSintomas(mensaje: string): string[] {
  const mensajeLower = mensaje.toLowerCase()
  const sintomasDetectados: string[] = []
  
  // Mapeo de palabras clave a síntomas
  const palabrasClave: Record<string, string[]> = {
    "dolor de cabeza": ["dolor de cabeza", "cabeza me duele", "migraña", "jaqueca", "cefalea"],
    "dolor de pecho": ["dolor de pecho", "pecho me duele", "dolor en el pecho", "dolor torácico", "palpitaciones", "corazón late rápido", "taquicardia"],
    "fiebre": ["fiebre", "calentura", "temperatura alta", "tengo calor", "escalofríos"],
    "tos": ["tos", "tosiendo", "toser", "carraspera"],
    "dolor abdominal": ["dolor de estómago", "dolor abdominal", "estómago me duele", "dolor de barriga", "barriga me duele", "dolor de panza"],
    "mareo": ["mareo", "mareado", "vértigo", "me mareo", "sensación de mareo"],
    "náuseas": ["náuseas", "ganas de vomitar", "asco", "nauseas"],
    "dificultad respiratoria": ["falta de aire", "no puedo respirar", "dificultad para respirar", "me ahogo", "falta el aire", "respirar difícil", "disnea"],
    "dolor muscular": ["dolor muscular", "músculos duelen", "dolor en los músculos", "adolorido"],
    "erupción cutánea": ["erupción", "sarpullido", "ronchas", "manchas en la piel", "piel irritada"]
  }
  
  // Buscar coincidencias
  Object.entries(palabrasClave).forEach(([sintoma, keywords]) => {
    const encontrado = keywords.some(keyword => mensajeLower.includes(keyword))
    if (encontrado && !sintomasDetectados.includes(sintoma)) {
      sintomasDetectados.push(sintoma)
    }
  })
  
  return sintomasDetectados
}

// Función para obtener especialidad recomendada
export function obtenerEspecialidadRecomendada(sintomas: string[]): string {
  if (sintomas.length === 0) return "Medicina General"
  
  // Obtener la especialidad del primer síntoma detectado
  const primerSintoma = sintomas[0]
  const info = conocimientoMedico.sintomas[primerSintoma as keyof typeof conocimientoMedico.sintomas]
  
  return info?.especialidad || "Medicina General"
}

// Función para determinar urgencia
export function determinarUrgencia(sintomas: string[]): 'baja' | 'media' | 'alta' | 'urgente' {
  if (sintomas.length === 0) return "baja"
  
  let maxUrgencia: 'baja' | 'media' | 'alta' | 'urgente' = "baja"
  
  sintomas.forEach(sintoma => {
    const info = conocimientoMedico.sintomas[sintoma as keyof typeof conocimientoMedico.sintomas]
    if (info) {
      // Prioridad: urgente > alta > media > baja
      if (info.urgencia === "urgente") {
        maxUrgencia = "urgente"
      } else if (info.urgencia === "alta" && maxUrgencia !== "urgente") {
        maxUrgencia = "alta"
      } else if (info.urgencia === "media" && maxUrgencia !== "alta" && maxUrgencia !== "urgente") {
        maxUrgencia = "media"
      }
    }
  })
  
  return maxUrgencia
}
