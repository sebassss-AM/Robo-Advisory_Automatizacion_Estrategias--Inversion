# Parámetros del Proyecto

## 1. El documento explicativo debe incluir

1. Diagrama de arquitectura (agente, canales, integraciones externas)
2. Track asignado
3. Tipo de negocio al que aplica
4. Cómo se integraría a un sistema empresarial existente

## 2. Alcance mínimo

Cumplir como mínimo los requisitos de tu track (en tu caso, Track 3: Robo-Advisory), sin eliminar ese alcance. Se permiten datos ficticios e integraciones simuladas; las acciones sensibles quedan como propuesta o alerta.

## 3. Criterios de evaluación (cómo califican)

1. **Viabilidad técnica / arquitectura agéntica** – lógica separada de la interfaz, manejo de continuidad de conversación, confiabilidad verificable
2. **Impacto / ajuste al track** – qué tan bien resuelve el problema real y su viabilidad comercial en contexto financiero/regulatorio local
3. **Mitigación de riesgos / antialucinación** – que el agente no invente información financiera; mecanismos para respaldar respuestas
4. **Demo y experiencia de usuario** – demostración clara, fluida, que refleje capacidades reales (no solo apariencia)

## 4. Evidencia de pruebas automatizadas

Carpeta de tests en el repo, o al menos documentación en el README. Niveles (de mínimo a más completo):

- **Mínimo:** casos probados manualmente documentados (input → esperado → obtenido), capturas de cómo probar
- **Básico:** carpeta `tests/` con pytest/unittest/jest, incluyendo `test_agent.py`
- **Intermedio:** tests unitarios de funciones críticas (ej. validación de RUC/cédula), tests de nodos del grafo de estados (LangGraph), mocks de la API del LLM