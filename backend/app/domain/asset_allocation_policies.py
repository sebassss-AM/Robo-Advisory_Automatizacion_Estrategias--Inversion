from backend.app.models.investor_profile import RiskProfile
from backend.app.models.portfolio_proposal import (
    Allocation,
    InstrumentCategory,
    RiskMetrics,
    PortfolioProposal,
)

ALLOCATION_POLICIES = {
    RiskProfile.CONSERVATIVE: {
        InstrumentCategory.FIXED_INCOME: 60,
        InstrumentCategory.EQUITY: 30,
        InstrumentCategory.LIQUIDITY: 10,
        InstrumentCategory.ALTERNATIVES: 0,
    },
    RiskProfile.MODERATE: {
        InstrumentCategory.FIXED_INCOME: 40,
        InstrumentCategory.EQUITY: 50,
        InstrumentCategory.LIQUIDITY: 10,
        InstrumentCategory.ALTERNATIVES: 0,
    },
    RiskProfile.AGGRESSIVE: {
        InstrumentCategory.FIXED_INCOME: 20,
        InstrumentCategory.EQUITY: 70,
        InstrumentCategory.LIQUIDITY: 10,
        InstrumentCategory.ALTERNATIVES: 0,
    },
}

RISK_METRICS_BY_PROFILE = {
    RiskProfile.CONSERVATIVE: RiskMetrics(
        expected_volatility="baja (3-7% anual)",
        diversification_score=70,
        max_drawdown_estimate="5-10%",
    ),
    RiskProfile.MODERATE: RiskMetrics(
        expected_volatility="media (8-15% anual)",
        diversification_score=75,
        max_drawdown_estimate="10-20%",
    ),
    RiskProfile.AGGRESSIVE: RiskMetrics(
        expected_volatility="alta (15-25% anual)",
        diversification_score=80,
        max_drawdown_estimate="20-35%",
    ),
}


def build_explanation(profile: RiskProfile, allocations: list[Allocation]) -> str:
    lines = [f"Esta propuesta está alineada con tu perfil **{profile.value}**."]
    for alloc in allocations:
        category_label = {
            InstrumentCategory.FIXED_INCOME: "Renta Fija",
            InstrumentCategory.EQUITY: "Renta Variable",
            InstrumentCategory.LIQUIDITY: "Liquidez",
            InstrumentCategory.ALTERNATIVES: "Alternativos",
        }.get(alloc.category, alloc.category.value)
        lines.append(
            f"- **{alloc.percentage:.0f}%** en **{category_label}**: {alloc.instrument_name}"
        )

    lines.append("")
    lines.append(
        "Esta asignación busca equilibrar tu tolerancia al riesgo con tus objetivos de inversión. "
        "No garantiza rentabilidad y está sujeta a revisión periódica."
    )
    return "\n".join(lines)


def build_allocations(
    profile: RiskProfile, profile_id: str
) -> PortfolioProposal:
    policy = ALLOCATION_POLICIES[profile]

    instrument_map = {
        InstrumentCategory.FIXED_INCOME: {
            "name": "Bonos del Tesoro",
            "id": "BONO-001",
        },
        InstrumentCategory.EQUITY: {
            "name": "ETF de Mercado Global",
            "id": "ETF-001",
        },
        InstrumentCategory.LIQUIDITY: {
            "name": "Fondo Money Market",
            "id": "LIQ-001",
        },
        InstrumentCategory.ALTERNATIVES: {
            "name": "Fondo de Infraestructura",
            "id": "ALT-001",
        },
    }

    allocations = []
    for category, percentage in policy.items():
        if percentage > 0:
            info = instrument_map[category]
            allocations.append(
                Allocation(
                    instrument_id=info["id"],
                    instrument_name=info["name"],
                    category=category,
                    percentage=percentage,
                )
            )

    explanation = build_explanation(profile, allocations)
    risk_metrics = RISK_METRICS_BY_PROFILE[profile]

    return PortfolioProposal(
        profile_id=profile_id,
        allocations=allocations,
        risk_metrics=risk_metrics,
        explanation=explanation,
    )
