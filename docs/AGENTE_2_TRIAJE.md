# Especificación Técnica — Agente 2 (Triaje y Reportes)

## Hackathon Scope (3 horas)

### Flujo de Datos
```
[ Kapso Chat (Agente 1) ] 
       │
       ▼ (HTTP POST / MCP JSON-RPC)
[ /api/kapso/webhook | /api/mcp ]
       │
       ▼
[ Triage Engine (Vercel AI SDK + BD Context Injection) ]
       │
       ▼
[ Formateador de Reporte 🚨 + Emergency Repository ]
       │
       ▼
[ Realtime Dashboard (Feed & Map Update) ]
```

### Formato de Payload de Entrada (Agente 1 -> Agente 2)
```json
{
  "name_or_dni": "Juan Perez - 38123456",
  "location": "-34.6037, -58.3816 (Av. Corrientes y 9 de Julio)",
  "description": "Choque frontal entre dos autos, hay atrapados e inconscientes",
  "affected_people": 4
}
```

### Salida esperada
1. Objeto JSON estructurado para el estado/DB de ReliefMap.
2. Texto formateado para el chat/reporte oficial:
```text
🚨 REPORTE DE EMERGENCIA

- Nombre y Apellido: Juan Perez - 38123456
- Título de la Descripción: Choque frontal con personas atrapadas
- Categorización de Riesgo: Nivel 1 - ROJO
- Motivo: Colisión grave con víctimas inconscientes y atrapadas en el vehículo.
- Ubicación del Problema: -34.6037, -58.3816 (Av. Corrientes y 9 de Julio)
- Número de Afectados: 4
```
