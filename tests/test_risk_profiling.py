"""Tests unitarios de las reglas de perfilamiento de riesgo."""

import pytest

from backend.app.domain.risk_profiling_rules import (
    calculate_risk_score,
    classify_profile,
    build_explanations,
    calculate_profile,
    RULES_VERSION,
)
from backend.app.models.investor_profile import (
    QuestionnaireAnswers,
    InvestmentHorizon,
    RiskTolerance,
    InvestmentGoal,
    RiskProfile,
)


class TestCalculateRiskScore:
    def test_conservador_minimo(self):
        answers = QuestionnaireAnswers(
            age=65,
            investment_horizon=InvestmentHorizon.SHORT_TERM,
            risk_tolerance=RiskTolerance.LOW,
            goal=InvestmentGoal.CAPITAL_PRESERVATION,
            monthly_investment=0, monthly_income=3000.0,
            investment_experience=1,
        )
        score = calculate_risk_score(answers)
        assert score <= 35

    def test_agresivo_maximo(self):
        answers = QuestionnaireAnswers(
            age=25,
            investment_horizon=InvestmentHorizon.LONG_TERM,
            risk_tolerance=RiskTolerance.HIGH,
            goal=InvestmentGoal.AGGRESSIVE_GROWTH,
            monthly_investment=0, monthly_income=10000.0,
            investment_experience=5,
        )
        score = calculate_risk_score(answers)
        assert score >= 66

    def test_score_no_excede_100(self):
        answers = QuestionnaireAnswers(
            age=25,
            investment_horizon=InvestmentHorizon.LONG_TERM,
            risk_tolerance=RiskTolerance.HIGH,
            goal=InvestmentGoal.AGGRESSIVE_GROWTH,
            monthly_investment=0, monthly_income=10000.0,
            investment_experience=5,
        )
        score = calculate_risk_score(answers)
        assert score <= 100

    def test_experiencia_limite_en_15_puntos(self):
        answers = QuestionnaireAnswers(
            age=30,
            investment_horizon=InvestmentHorizon.MEDIUM_TERM,
            risk_tolerance=RiskTolerance.MEDIUM,
            goal=InvestmentGoal.GROWTH,
            monthly_investment=0, monthly_income=5000.0,
            investment_experience=5,
        )
        score = calculate_risk_score(answers)
        expected = 20 + 20 + 20 + min(5 * 3, 15)
        assert score == expected


class TestClassifyProfile:
    def test_conservador_35_o_menos(self):
        assert classify_profile(35) == RiskProfile.CONSERVATIVE

    def test_moderado_entre_36_y_65(self):
        assert classify_profile(36) == RiskProfile.MODERATE
        assert classify_profile(50) == RiskProfile.MODERATE
        assert classify_profile(65) == RiskProfile.MODERATE

    def test_agresivo_66_o_mas(self):
        assert classify_profile(66) == RiskProfile.AGGRESSIVE
        assert classify_profile(100) == RiskProfile.AGGRESSIVE


class TestBuildExplanations:
    def test_conservador_tiene_explicaciones(self, conservative_answers):
        explanations = build_explanations(conservative_answers)
        assert len(explanations) > 0
        assert any("corto" in e.lower() for e in explanations)
        assert any("evitar" in e.lower() or "fluctuaciones" in e.lower() for e in explanations)

    def test_agresivo_tiene_explicaciones(self, aggressive_answers):
        explanations = build_explanations(aggressive_answers)
        assert len(explanations) > 0
        assert any("largo" in e.lower() for e in explanations)
        assert any("volatilidad" in e.lower() for e in explanations)

    def test_conservador_menciona_estabilidad(self, conservative_answers):
        explanations = build_explanations(conservative_answers)
        assert any("estabilidad" in e for e in explanations)


class TestCalculateProfile:
    def test_conservador_result(self, conservative_answers):
        result = calculate_profile(conservative_answers)
        assert result.profile == RiskProfile.CONSERVATIVE
        assert 0 <= result.score <= 100
        assert result.rules_version == RULES_VERSION
        assert len(result.explanations) > 0

    def test_moderado_result(self, moderate_answers):
        result = calculate_profile(moderate_answers)
        assert result.profile == RiskProfile.MODERATE
        assert 0 <= result.score <= 100
        assert result.rules_version == RULES_VERSION

    def test_agresivo_result(self, aggressive_answers):
        result = calculate_profile(aggressive_answers)
        assert result.profile == RiskProfile.AGGRESSIVE
        assert 0 <= result.score <= 100
        assert result.rules_version == RULES_VERSION

    def test_all_profiles_have_explanations(self, conservative_answers, moderate_answers, aggressive_answers):
        for answers in [conservative_answers, moderate_answers, aggressive_answers]:
            result = calculate_profile(answers)
            assert len(result.explanations) > 0, f"Perfil {result.profile} sin explicaciones"
