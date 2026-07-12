from backend.app.models.portfolio_proposal import Instrument, InstrumentCategory

INSTRUMENTS: list[Instrument] = [
    Instrument(
        id="BND",
        name="Vanguard Total Bond Market (BND)",
        category=InstrumentCategory.FIXED_INCOME,
        risk_level="bajo",
        expected_return="4-6% anual",
        description="ETF de bonos diversificados del mercado total de EE.UU. Bajo riesgo.",
    ),
    Instrument(
        id="SHY",
        name="iShares 1-3 Year Treasury Bond (SHY)",
        category=InstrumentCategory.FIXED_INCOME,
        risk_level="muy bajo",
        expected_return="3-5% anual",
        description="Bonos del tesoro de corto plazo. Alta seguridad y liquidez.",
    ),
    Instrument(
        id="VTI",
        name="Vanguard Total Stock Market (VTI)",
        category=InstrumentCategory.EQUITY,
        risk_level="medio",
        expected_return="8-12% anual",
        description="ETF que cubre todo el mercado accionario de EE.UU. Diversificación total.",
    ),
    Instrument(
        id="VXUS",
        name="Vanguard Total International Stock (VXUS)",
        category=InstrumentCategory.EQUITY,
        risk_level="medio-alto",
        expected_return="8-14% anual",
        description="Exposición a mercados internacionales desarrollados y emergentes.",
    ),
    Instrument(
        id="QQQ",
        name="Invesco QQQ Trust (QQQ)",
        category=InstrumentCategory.EQUITY,
        risk_level="alto",
        expected_return="12-18% anual",
        description="ETF que sigue el índice Nasdaq-100. Alta exposición tecnológica.",
    ),
    Instrument(
        id="SGOV",
        name="iShares 0-3 Month Treasury Bond (SGOV)",
        category=InstrumentCategory.LIQUIDITY,
        risk_level="muy bajo",
        expected_return="2-4% anual",
        description="ETF de bonos del tesoro a cortísimo plazo. Liquidez inmediata.",
    ),
]

TICKERS_BY_CATEGORY = {
    InstrumentCategory.FIXED_INCOME: ["BND", "SHY"],
    InstrumentCategory.EQUITY: ["VTI", "VXUS", "QQQ"],
    InstrumentCategory.LIQUIDITY: ["SGOV"],
    InstrumentCategory.ALTERNATIVES: [],
}


def get_instrument_by_id(instrument_id: str) -> Instrument | None:
    for instrument in INSTRUMENTS:
        if instrument.id == instrument_id:
            return instrument
    return None


def get_instruments_by_category(category: InstrumentCategory) -> list[Instrument]:
    return [i for i in INSTRUMENTS if i.category == category]
