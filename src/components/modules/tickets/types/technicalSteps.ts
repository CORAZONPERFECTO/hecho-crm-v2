
export interface TechnicalStep {
  id: string;
  description: string;
  completed: boolean;
  observation?: string;
}

export interface ServiceSteps {
  steps: TechnicalStep[];
  tools: string[];
}

export interface TechnicalStepsData {
  [key: string]: ServiceSteps;
}

export const TECHNICAL_STEPS_DATA: TechnicalStepsData = {
  'mantenimiento': {
    steps: [
      { id: '1', description: 'Verificar estado del filtro de aire', completed: false },
      { id: '2', description: 'Inspeccionar nivel de refrigerante', completed: false },
      { id: '3', description: 'Revisar conexiones eléctricas', completed: false },
      { id: '4', description: 'Limpiar bandeja de drenaje', completed: false },
      { id: '5', description: 'Lubricar piezas móviles si aplica', completed: false },
      { id: '6', description: 'Verificar consumo de amperaje', completed: false },
      { id: '7', description: 'Probar funcionamiento completo del sistema', completed: false }
    ],
    tools: [
      'Amperímetro',
      'Termómetro infrarrojo',
      'Cepillos y trapos',
      'Lanillas',
      'Lubricante en spray',
      'Desinfectante de serpentines'
    ]
  },
  'instalacion': {
    steps: [
      { id: '1', description: 'Validar ubicación y orientación correcta', completed: false },
      { id: '2', description: 'Asegurar la estructura o soporte de instalación', completed: false },
      { id: '3', description: 'Instalar unidad interior y exterior', completed: false },
      { id: '4', description: 'Realizar vacío del sistema con bomba', completed: false },
      { id: '5', description: 'Cargar refrigerante si aplica', completed: false },
      { id: '6', description: 'Verificar fugas con nitrógeno', completed: false },
      { id: '7', description: 'Probar funcionamiento y entregar explicación al cliente', completed: false }
    ],
    tools: [
      'Taladro y brocas',
      'Soportes y tornillería',
      'Nivel de burbuja',
      'Bomba de vacío',
      'Kit de manómetros',
      'Cilindro de refrigerante',
      'Sistema de Tubería',
      'Mangueras y conexiones'
    ]
  },
  'emergencia': {
    steps: [
      { id: '1', description: 'Escuchar diagnóstico del cliente', completed: false },
      { id: '2', description: 'Identificar ruidos, fugas o cortes', completed: false },
      { id: '3', description: 'Verificar voltaje y fusibles', completed: false },
      { id: '4', description: 'Revisar componentes críticos (compresor, tarjetas, sensores)', completed: false },
      { id: '5', description: 'Dar solución inmediata si es posible o generar informe técnico', completed: false }
    ],
    tools: [
      'Amperímetro',
      'Kit de repuestos rápidos',
      'Linterna táctica',
      'Cinta aislante',
      'Cableado de prueba',
      'Soldadura rápida'
    ]
  },
  'diagnostico': {
    steps: [
      { id: '1', description: 'Revisar historial del ticket / cliente', completed: false },
      { id: '2', description: 'Probar encendido básico', completed: false },
      { id: '3', description: 'Identificar errores en el panel o display', completed: false },
      { id: '4', description: 'Comprobar continuidad eléctrica', completed: false },
      { id: '5', description: 'Determinar si requiere cambio de pieza o reparación', completed: false }
    ],
    tools: [
      'Probador de continuidad',
      'Manual del fabricante',
      'Multímetro avanzado',
      'Pinzas amperimétricas',
      'Lector de códigos de error (si aplica)'
    ]
  },
  'limpieza': {
    steps: [
      { id: '1', description: 'Asegurarse que los aires no dan error', completed: false },
      { id: '2', description: 'Desmontar carcasas', completed: false },
      { id: '3', description: 'Retirar filtros y limpiarlos con presión', completed: false },
      { id: '4', description: 'Aplicar desinfectante a serpentines', completed: false },
      { id: '5', description: 'Limpiar turbina y bandeja de condensado', completed: false },
      { id: '6', description: 'Reensamblar y probar sistema', completed: false },
      { id: '7', description: 'Asegurarse que el aire no da error', completed: false }
    ],
    tools: [
      'Hidrolavadora portátil y su manguera',
      'Desinfectante',
      'Escobillas',
      'Cubetas',
      'Guantes de goma'
    ]
  }
};
