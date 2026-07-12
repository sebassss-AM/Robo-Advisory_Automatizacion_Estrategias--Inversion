"""Tests de validación de modelos Pydantic."""

import pytest
from pydantic import ValidationError

from backend.app.models.investor_profile import (
    QuestionnaireAnswers,
    InvestmentHorizon,
    RiskTolerance,
    InvestmentGoal,
    RiskProfile,
    RiskProfileResult,
)
from backend.app.models.portfolio_proposal import (
    InstrumentCategory,
    Allocation,
    RiskMetrics,
    PortfolioProposal,
)
from backend.app.models.audit_decision import DecisionAction, AdvisorDecision


class TestQuestionnaireAnswers:
    def test_valid_answers(self):
        answers = QuestionnaireAnswers(
            age=30,
            investment_horizon=InvestmentHorizon.LONG_TERM,
            risk_tolerance=RiskTolerance.HIGH,
            goal=InvestmentGoal.AGGRESSIVE_GROWTH,
            monthly_investment=0, monthly_income=5000.0,
            investment_experience=3,
        )
        assert answers.age == 30
        assert answers.investment_experience == 3

    def test_age_below_minimum(self):
        with pytest.raises(ValidationError):
            QuestionnaireAnswers(
                age=15,
                investment_horizon=InvestmentHorizon.SHORT_TERM,
                risk_tolerance=RiskTolerance.LOW,
                goal=InvestmentGoal.INCOME,
                monthly_investment=0, monthly_income=1000.0,
                investment_experience=1,
            )

    def test_age_above_maximum(self):
        with pytest.raises(ValidationError):
            QuestionnaireAnswers(
                age=120,
                investment_horizon=InvestmentHorizon.SHORT_TERM,
                risk_tolerance=RiskTolerance.LOW,
                goal=InvestmentGoal.INCOME,
                monthly_investment=0, monthly_income=1000.0,
                investment_experience=1,
            )

    def test_experience_below_minimum(self):
        with pytest.raises(ValidationError):
            QuestionnaireAnswers(
                age=30,
                investment_horizon=InvestmentHorizon.SHORT_TERM,
                risk_tolerance=RiskTolerance.LOW,
                goal=InvestmentGoal.INCOME,
                monthly_investment=0, monthly_income=1000.0,
                investment_experience=0,
            )

    def test_experience_above_maximum(self):
        with pytest.raises(ValidationError):
            QuestionnaireAnswers(
                age=30,
                investment_horizon=InvestmentHorizon.SHORT_TERM,
                risk_tolerance=RiskTolerance.LOW,
                goal=InvestmentGoal.INCOME,
                monthly_investment=0, monthly_income=1000.0,
                investment_experience=6,
            )

    def test_negative_income(self):
        with pytest.raises(ValidationError):
            QuestionnaireAnswers(
                age=30,
                investment_horizon=InvestmentHorizon.SHORT_TERM,
                risk_tolerance=RiskTolerance.LOW,
                goal=InvestmentGoal.INCOME,
                monthly_investment=0, monthly_income=-100.0,
                investment_experience=1,
            )

    def test_string_coercion(self):
        answers = QuestionnaireAnswers(
            age="30",
            investment_horizon=InvestmentHorizon.SHORT_TERM,
            risk_tolerance=RiskTolerance.LOW,
            goal=InvestmentGoal.INCOME,
            monthly_investment=0, monthly_income="2500.50",
            investment_experience="2",
        )
        assert answers.age == 30
        assert answers.monthly_income == 2500.50
        assert answers.investment_experience == 2


class TestRiskProfileResult:
    def test_valid_result(self):
        result = RiskProfileResult(
            profile=RiskProfile.CONSERVATIVE,
            score=30,
            rules_version="1.0.0",
            explanations=["Bajo riesgo"],
        )
        assert result.score == 30
        assert result.rules_version == "1.0.0"

    def test_score_above_maximum(self):
        with pytest.raises(ValidationError):
            RiskProfileResult(
                profile=RiskProfile.AGGRESSIVE,
                score=150,
                rules_version="1.0.0",
                explanations=[],
            )

    def test_score_below_minimum(self):
        with pytest.raises(ValidationError):
            RiskProfileResult(
                profile=RiskProfile.CONSERVATIVE,
                score=-5,
                rules_version="1.0.0",
                explanations=[],
            )


class TestAllocation:
    def test_valid_allocation(self):
        alloc = Allocation(
            instrument_id="BONO-001",
            instrument_name="Bonos del Tesoro",
            category=InstrumentCategory.FIXED_INCOME,
            percentage=60.0,
        )
        assert alloc.percentage == 60.0

    def test_percentage_above_maximum(self):
        with pytest.raises(ValidationError):
            Allocation(
                instrument_id="BONO-001",
                instrument_name="Bonos",
                category=InstrumentCategory.FIXED_INCOME,
                percentage=110.0,
            )

    def test_percentage_below_minimum(self):
        with pytest.raises(ValidationError):
            Allocation(
                instrument_id="BONO-001",
                instrument_name="Bonos",
                category=InstrumentCategory.FIXED_INCOME,
                percentage=-5.0,
            )


class TestPortfolioProposal:
    def test_default_status(self):
        proposal = PortfolioProposal(
            profile_id="p-001",
            allocations=[
                Allocation(
                    instrument_id="BONO-001",
                    instrument_name="Bonos",
                    category=InstrumentCategory.FIXED_INCOME,
                    percentage=60.0,
                )
            ],
            risk_metrics=RiskMetrics(
                expected_volatility="baja",
                diversification_score=70,
                max_drawdown_estimate="5%",
            ),
            explanation="Propuesta conservadora.",
        )
        assert proposal.status == "pending"


class TestAdvisorDecision:
    def test_valid_approval(self):
        decision = AdvisorDecision(
            proposal_id="prop-001",
            advisor_id="asesor-01",
            action=DecisionAction.APPROVED,
            rules_version="1.0.0",
        )
        assert decision.action == DecisionAction.APPROVED

    def test_valid_rejection(self):
        decision = AdvisorDecision(
            proposal_id="prop-001",
            advisor_id="asesor-01",
            action=DecisionAction.REJECTED,
            comments="Cliente no califica",
            rules_version="1.0.0",
        )
        assert decision.action == DecisionAction.REJECTED

    def test_invalid_action(self):
        with pytest.raises(ValidationError):
            AdvisorDecision(
                proposal_id="prop-001",
                advisor_id="asesor-01",
                action="invalid_action",
                rules_version="1.0.0",
            )
