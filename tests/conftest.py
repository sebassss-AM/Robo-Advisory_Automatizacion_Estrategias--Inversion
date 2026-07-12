from collections.abc import Generator
from unittest.mock import patch
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


@pytest.fixture
def mock_llm() -> Generator:
    with patch("backend.app.agents.investor_profiling_node.generate_profile_explanation") as mock:
        mock.return_value = "Explicación simulada del perfil."
        yield mock


@pytest.fixture
def mock_llm_portfolio() -> Generator:
    with patch("backend.app.agents.portfolio_generation_node.generate_portfolio_explanation") as mock:
        mock.return_value = "Explicación simulada del portafolio."
        yield mock


@pytest.fixture
def profiling_state() -> dict:
    return {
        "session_id": "test-session-1",
        "step": "start",
        "answers": {
            "age": 35,
            "investment_horizon": "largo_plazo",
            "risk_tolerance": "media",
            "goal": "crecimiento",
            "monthly_income": 5000.0,
            "investment_experience": 2,
        },
        "profile_id": None,
        "profile_result": None,
        "proposal_id": None,
        "proposal_result": None,
        "advisor_decision": None,
        "error": None,
    }
