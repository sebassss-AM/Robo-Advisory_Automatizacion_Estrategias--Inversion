import pytest

from backend.app.domain.asset_allocation_policies import (
    DETAILED_ALLOCATIONS,
    RISK_METRICS_BY_PROFILE,
    build_allocations,
    build_explanation,
)
from backend.app.models.investor_profile import RiskProfile
from backend.app.models.portfolio_proposal import (
    InstrumentCategory,
    Allocation,
    RiskMetrics,
)


class TestDetailedAllocations:
    def test_conservador_allocation(self):
        detail = DETAILED_ALLOCATIONS[RiskProfile.CONSERVATIVE]
        fix = sum(pct for _, pct in detail[InstrumentCategory.FIXED_INCOME])
        eq = sum(pct for _, pct in detail[InstrumentCategory.EQUITY])
        liq = sum(pct for _, pct in detail[InstrumentCategory.LIQUIDITY])
        assert fix == 60
        assert eq == 30
        assert liq == 10

    def test_moderado_allocation(self):
        detail = DETAILED_ALLOCATIONS[RiskProfile.MODERATE]
        fix = sum(pct for _, pct in detail[InstrumentCategory.FIXED_INCOME])
        eq = sum(pct for _, pct in detail[InstrumentCategory.EQUITY])
        liq = sum(pct for _, pct in detail[InstrumentCategory.LIQUIDITY])
        assert fix == 40
        assert eq == 50
        assert liq == 10

    def test_agresivo_allocation(self):
        detail = DETAILED_ALLOCATIONS[RiskProfile.AGGRESSIVE]
        fix = sum(pct for _, pct in detail[InstrumentCategory.FIXED_INCOME])
        eq = sum(pct for _, pct in detail[InstrumentCategory.EQUITY])
        liq = sum(pct for _, pct in detail[InstrumentCategory.LIQUIDITY])
        assert fix == 20
        assert eq == 70
        assert liq == 10

    def test_all_profiles_sum_100(self):
        for profile, detail in DETAILED_ALLOCATIONS.items():
            total = sum(pct for _, pct in sum(detail.values(), []))
            assert total == 100, f"Perfil {profile} suma {total}% (debe ser 100%)"


class TestRiskMetrics:
    def test_all_profiles_have_metrics(self):
        assert len(RISK_METRICS_BY_PROFILE) == 3
        for profile in RiskProfile:
            assert profile in RISK_METRICS_BY_PROFILE

    def test_metrics_structure(self):
        metrics = RISK_METRICS_BY_PROFILE[RiskProfile.CONSERVATIVE]
        assert isinstance(metrics, RiskMetrics)
        assert isinstance(metrics.expected_volatility, str)
        assert 0 <= metrics.diversification_score <= 100
        assert isinstance(metrics.max_drawdown_estimate, str)


class TestBuildAllocations:
    def test_conservador_build(self):
        proposal = build_allocations(RiskProfile.CONSERVATIVE, "p-001")
        assert proposal.profile_id == "p-001"
        assert len(proposal.allocations) == 3
        assert proposal.risk_metrics is not None
        assert proposal.explanation is not None

    def test_agresivo_build(self):
        proposal = build_allocations(RiskProfile.AGGRESSIVE, "p-002")
        assert len(proposal.allocations) == 3


class TestBuildExplanation:
    def test_mention_profile_in_explanation(self):
        allocs = [
            Allocation(
                instrument_id="BONO-001",
                instrument_name="Bonos del Tesoro",
                category=InstrumentCategory.FIXED_INCOME,
                percentage=60.0,
            ),
        ]
        explanation = build_explanation(RiskProfile.CONSERVATIVE, allocs)
        assert "conservador" in explanation.lower()
        assert "60%" in explanation
        assert "Renta Fija" in explanation

    def test_all_profiles_generate_explanation(self):
        for profile in RiskProfile:
            proposal = build_allocations(profile, "test")
            assert proposal.explanation
            assert profile.value in proposal.explanation.lower()
