from backend.app.models.portfolio_proposal import Instrument, InstrumentCategory

INSTRUMENTS: list[Instrument] = [
    Instrument(
        id="BONO-001",
        name="Bonos del Tesoro",
        category=InstrumentCategory.FIXED_INCOME,
        risk_level="bajo",
        expected_return="4-6% anual",
        description="Bonos soberanos de bajo riesgo. Ideales para perfiles conservadores.",
    ),
    Instrument(
        id="BONO-002",
        name="Bonos Corporativos Grado de Inversión",
        category=InstrumentCategory.FIXED_INCOME,
        risk_level="bajo-medio",
        expected_return="5-8% anual",
        description="Bonos de empresas con alta calificación crediticia.",
    ),
    Instrument(
        id="ETF-001",
        name="ETF de Mercado Global",
        category=InstrumentCategory.EQUITY,
        risk_level="medio",
        expected_return="8-12% anual",
        description="ETF diversificado que sigue índices globales de renta variable.",
    ),
    Instrument(
        id="ETF-002",
        name="ETF de Tecnología",
        category=InstrumentCategory.EQUITY,
        risk_level="alto",
        expected_return="12-18% anual",
        description="ETF sectorial enfocado en empresas tecnológicas.",
    ),
    Instrument(
        id="LIQ-001",
        name="Fondo Money Market",
        category=InstrumentCategory.LIQUIDITY,
        risk_level="muy bajo",
        expected_return="2-4% anual",
        description="Fondo de liquidez inmediata con bajo rendimiento pero alta disponibilidad.",
    ),
    Instrument(
        id="ALT-001",
        name="Fondo de Infraestructura",
        category=InstrumentCategory.ALTERNATIVES,
        risk_level="medio-alto",
        expected_return="8-14% anual",
        description="Inversión en proyectos de infraestructura con horizonte largo.",
    ),
]


def get_instrument_by_id(instrument_id: str) -> Instrument | None:
    for instrument in INSTRUMENTS:
        if instrument.id == instrument_id:
            return instrument
    return None


def get_instruments_by_category(category: InstrumentCategory) -> list[Instrument]:
    return [i for i in INSTRUMENTS if i.category == category]
