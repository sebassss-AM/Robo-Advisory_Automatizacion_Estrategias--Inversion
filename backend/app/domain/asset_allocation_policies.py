from backend.app.models.investor_profile import RiskProfile
from backend.app.models.portfolio_proposal import (
    Allocation,
    InstrumentCategory,
    RiskMetrics,
    PortfolioProposal,
)
from backend.app.services.market_data import _get_ticker_info
from backend.app.domain.instrument_catalog import get_instrument_by_id

DETAILED_ALLOCATIONS = {
    RiskProfile.CONSERVATIVE: {
        InstrumentCategory.FIXED_INCOME: [
            ("BND", 40),
            ("SHY", 20),
        ],
        InstrumentCategory.EQUITY: [
            ("VTI", 20),
            ("VXUS", 10),
        ],
        InstrumentCategory.LIQUIDITY: [
            ("SGOV", 10),
        ],
    },
    RiskProfile.MODERATE: {
        InstrumentCategory.FIXED_INCOME: [
            ("BND", 25),
            ("SHY", 15),
        ],
        InstrumentCategory.EQUITY: [
            ("VTI", 30),
            ("VXUS", 12),
            ("QQQ", 8),
        ],
        InstrumentCategory.LIQUIDITY: [
            ("SGOV", 10),
        ],
    },
    RiskProfile.AGGRESSIVE: {
        InstrumentCategory.FIXED_INCOME: [
            ("BND", 12),
            ("SHY", 8),
        ],
        InstrumentCategory.EQUITY: [
            ("VTI", 30),
            ("VXUS", 15),
            ("QQQ", 25),
        ],
        InstrumentCategory.LIQUIDITY: [
            ("SGOV", 10),
        ],
    },
}

RISK_METRICS_BY_PROFILE = {
    RiskProfile.CONSERVATIVE: RiskMetrics(
        expected_volatility="baja (3-7% anual)",
        diversification_score=70,
        max_drawdown_estimate="5-10%",
        expected_return_range="",
        expected_return_pct=0.0,
    ),
    RiskProfile.MODERATE: RiskMetrics(
        expected_volatility="media (8-15% anual)",
        diversification_score=75,
        max_drawdown_estimate="10-20%",
        expected_return_range="",
        expected_return_pct=0.0,
    ),
    RiskProfile.AGGRESSIVE: RiskMetrics(
        expected_volatility="alta (15-25% anual)",
        diversification_score=80,
        max_drawdown_estimate="20-35%",
        expected_return_range="",
        expected_return_pct=0.0,
    ),
}


def _enrich_with_market_data(ticker: str, percentage: float, category: InstrumentCategory) -> Allocation:
    info = _get_ticker_info(ticker)
    name = info["name"] if info and info.get("name") else ticker
    price = info["price"] if info and info.get("price") else None
    inst = get_instrument_by_id(ticker)
    exp_return = inst.expected_return if inst else ""
    return_pct = 0.0
    if exp_return:
        try:
            parts = exp_return.replace("%", "").replace("anual", "").strip().split("-")
            low = float(parts[0].strip())
            high = float(parts[1].strip()) if len(parts) > 1 else low
            return_pct = round((low + high) / 2, 1)
        except (ValueError, IndexError):
            pass
    return Allocation(
        instrument_id=ticker,
        instrument_name=name,
        category=category,
        percentage=percentage,
        amount_usd=price,
        pe_ratio=info["pe_ratio"] if info and info.get("pe_ratio") else None,
        dividend_yield=info["dividend_yield"] if info and info.get("dividend_yield") is not None else None,
        expected_return=exp_return,
        return_pct=return_pct,
    )


def _compute_weighted_return(allocations: list[Allocation]) -> tuple[str, float]:
    total_pct = sum(a.percentage for a in allocations)
    if total_pct == 0:
        return "N/A", 0.0

    weighted_mid = 0.0
    low_sum = 0.0
    high_sum = 0.0

    for a in allocations:
        inst = get_instrument_by_id(a.instrument_id)
        if inst and inst.expected_return:
            try:
                parts = inst.expected_return.replace("%", "").replace("anual", "").strip().split("-")
                low = float(parts[0].strip())
                high = float(parts[1].strip()) if len(parts) > 1 else low
            except (ValueError, IndexError):
                low, high = 0, 0
            weight = a.percentage / total_pct
            low_sum += low * weight
            high_sum += high * weight
            weighted_mid += ((low + high) / 2) * weight

    return f"{low_sum:.1f}-{high_sum:.1f}% anual", round(weighted_mid, 1)


def build_allocations(profile: RiskProfile, profile_id: str) -> PortfolioProposal:
    detail = DETAILED_ALLOCATIONS[profile]
    allocations = []
    for category, tickers in detail.items():
        for ticker, pct in tickers:
            allocations.append(
                _enrich_with_market_data(ticker, pct, category)
            )

    explanation = build_explanation(profile, allocations)
    risk_metrics = RISK_METRICS_BY_PROFILE[profile]
    return_range, return_pct = _compute_weighted_return(allocations)
    risk_metrics.expected_return_range = return_range
    risk_metrics.expected_return_pct = return_pct

    return PortfolioProposal(
        profile_id=profile_id,
        allocations=allocations,
        risk_metrics=risk_metrics,
        explanation=explanation,
    )


def build_explanation(profile: RiskProfile, allocations: list[Allocation]) -> str:
    lines = [f"Esta propuesta está alineada con tu perfil **{profile.value}**."]
    lines.append("")

    category_labels = {
        InstrumentCategory.FIXED_INCOME: "Renta Fija",
        InstrumentCategory.EQUITY: "Renta Variable",
        InstrumentCategory.LIQUIDITY: "Liquidez",
        InstrumentCategory.ALTERNATIVES: "Alternativos",
    }

    by_category: dict[InstrumentCategory, list[Allocation]] = {}
    for a in allocations:
        by_category.setdefault(a.category, []).append(a)

    for category, items in by_category.items():
        label = category_labels.get(category, category.value)
        total_pct = sum(a.percentage for a in items)
        ticker_list = ", ".join(a.instrument_id for a in items)
        lines.append(f"**{label}** ({total_pct:.0f}%): {ticker_list}")
        for a in items:
            info_id = a.instrument_id
            info = _get_ticker_info(info_id)
            if info:
                extra = []
                if info.get("price"):
                    extra.append(f"${info['price']:.2f}")
                if info.get("pe_ratio"):
                    extra.append(f"P/E {info['pe_ratio']:.1f}")
                if info.get("dividend_yield") is not None:
                    extra.append(f"Div {info['dividend_yield']:.2f}%")
                lines.append(f"  - {info['name']}: {', '.join(extra) if extra else 'sin datos'}")
            else:
                lines.append(f"  - {a.instrument_name}")

    lines.append("")
    lines.append("**Métricas de riesgo del portafolio:**")
    lines.append("")
    lines.append(
        "La **volatilidad esperada** indica cuánto puede fluctuar el valor de tu inversión. "
        "Una volatilidad más alta significa cambios más bruscos, tanto al alza como a la baja."
    )
    lines.append(
        "La **diversificación** mide qué tan repartida está tu inversión entre distintos tipos de activos. "
        "Un puntaje más alto indica menor dependencia de un solo instrumento."
    )
    lines.append(
        "El **drawdown máximo estimado** representa la mayor caída que podría experimentar tu portafolio "
        "desde su punto más alto. Es una medida de riesgo a considerar."
    )
    lines.append("")
    lines.append(
        "Esta asignación busca equilibrar tu tolerancia al riesgo con tus objetivos de inversión. "
        "Los datos de mercado mostrados son obtenidos de fuentes públicas (Yahoo Finance) como referencia. "
        "No garantiza rentabilidad y está sujeta a revisión periódica."
    )
    return "\n".join(lines)
