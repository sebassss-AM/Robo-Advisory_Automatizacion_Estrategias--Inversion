import pytest

from backend.app.models.investor_profile import (
    QuestionnaireAnswers,
    InvestmentHorizon,
    RiskTolerance,
    InvestmentGoal,
)


@pytest.fixture
def conservative_answers() -> QuestionnaireAnswers:
    return QuestionnaireAnswers(
        age=65,
        investment_horizon=InvestmentHorizon.SHORT_TERM,
        risk_tolerance=RiskTolerance.LOW,
        goal=InvestmentGoal.CAPITAL_PRESERVATION,
        monthly_investment=0, monthly_income=3000.0,
        investment_experience=1,
    )


@pytest.fixture
def moderate_answers() -> QuestionnaireAnswers:
    return QuestionnaireAnswers(
        age=45,
        investment_horizon=InvestmentHorizon.SHORT_TERM,
        risk_tolerance=RiskTolerance.LOW,
        goal=InvestmentGoal.GROWTH,
        monthly_investment=0, monthly_income=4000.0,
        investment_experience=2,
    )


@pytest.fixture
def aggressive_answers() -> QuestionnaireAnswers:
    return QuestionnaireAnswers(
        age=28,
        investment_horizon=InvestmentHorizon.LONG_TERM,
        risk_tolerance=RiskTolerance.HIGH,
        goal=InvestmentGoal.AGGRESSIVE_GROWTH,
        monthly_investment=0, monthly_income=8000.0,
        investment_experience=5,
    )


