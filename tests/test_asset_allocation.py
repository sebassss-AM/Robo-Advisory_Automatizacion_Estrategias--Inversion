"""Tests unitarios de las políticas de asignación de activos."""

import pytest

from backend.app.domain.asset_allocation_policies import (
    ALLOCATION_POLICIES,
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


class TestAllocationPolicies:
    def test_conservador_allocation(self):
        policy = ALLOCATION_POLICIES[RiskProfile.CONSERVATIVE]
        assert policy[InstrumentCategory.FIXED_INCOME] == 60
        assert policy[InstrumentCategory.EQUITY] == 30
        assert policy[InstrumentCategory.LIQUIDITY] == 10
        assert policy[InstrumentCategory.ALTERNATIVES] == 0

    def test_moderado_allocation(self):
        policy = ALLOCATION_POLICIES[RiskProfile.MODERATE]
        assert policy[InstrumentCategory.FIXED_INCOME] == 40
        assert policy[InstrumentCategory.EQUITY] == 50
        assert policy[InstrumentCategory.LIQUIDITY] == 10

    def test_agresivo_allocation(self):
        policy = ALLOCATION_POLICIES[RiskProfile.AGGRESSIVE]
        assert policy[InstrumentCategory.FIXED_INCOME] == 20
        assert policy[InstrumentCategory.EQUITY] == 70
        assert policy[InstrumentCategory.LIQUIDITY] == 10

    def test_all_profiles_sum_100(self):
        for profile, policy in ALLOCATION_POLICIES.items():
            total = sum(policy.values())
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

    def test_allocations_match_policy(self):
        for profile in RiskProfile:
            proposal = build_allocations(profile, f"p-{profile.value}")
            policy = ALLOCATION_POLICIES[profile]
            for alloc in proposal.allocations:
                expected_pct = policy[alloc.category]
                assert alloc.percentage == expected_pct, (
                    f"Perfil {profile}: {alloc.category.value} esperado {expected_pct}%, "
                    f"obtenido {alloc.percentage}%"
                )


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
