from backend.app.models.investor_profile import (
    QuestionnaireAnswers,
    RiskProfile,
    RiskProfileResult,
    InvestmentHorizon,
    RiskTolerance,
    InvestmentGoal,
)

RULES_VERSION = "1.0.0"


def calculate_risk_score(answers: QuestionnaireAnswers) -> int:
    score = 0

    if answers.investment_horizon == InvestmentHorizon.LONG_TERM:
        score += 30
    elif answers.investment_horizon == InvestmentHorizon.MEDIUM_TERM:
        score += 20
    elif answers.investment_horizon == InvestmentHorizon.SHORT_TERM:
        score += 10

    if answers.risk_tolerance == RiskTolerance.HIGH:
        score += 30
    elif answers.risk_tolerance == RiskTolerance.MEDIUM:
        score += 20
    elif answers.risk_tolerance == RiskTolerance.LOW:
        score += 10

    if answers.goal == InvestmentGoal.AGGRESSIVE_GROWTH:
        score += 25
    elif answers.goal == InvestmentGoal.GROWTH:
        score += 20
    elif answers.goal == InvestmentGoal.INCOME:
        score += 15
    elif answers.goal == InvestmentGoal.CAPITAL_PRESERVATION:
        score += 10

    score += min(answers.investment_experience * 3, 15)

    return min(score, 100)


def classify_profile(score: int) -> RiskProfile:
    if score <= 35:
        return RiskProfile.CONSERVATIVE
    elif score <= 65:
        return RiskProfile.MODERATE
    else:
        return RiskProfile.AGGRESSIVE


def build_explanations(answers: QuestionnaireAnswers) -> list[str]:
    explanations = []

    if answers.investment_horizon == InvestmentHorizon.SHORT_TERM:
        explanations.append(
            "Tu horizonte de inversión es corto, lo que limita la exposición a activos volátiles."
        )
    elif answers.investment_horizon == InvestmentHorizon.LONG_TERM:
        explanations.append(
            "Tu horizonte largo permite asumir mayor riesgo para buscar mayor rentabilidad."
        )

    if answers.risk_tolerance == RiskTolerance.LOW:
        explanations.append("Prefieres evitar fluctuaciones significativas en tu inversión.")
    elif answers.risk_tolerance == RiskTolerance.HIGH:
        explanations.append("Tienes disposición a aceptar alta volatilidad.")

    if answers.goal in (InvestmentGoal.CAPITAL_PRESERVATION, InvestmentGoal.INCOME):
        explanations.append("Tu objetivo prioriza la estabilidad sobre el crecimiento.")
    elif answers.goal == InvestmentGoal.AGGRESSIVE_GROWTH:
        explanations.append("Buscas maximizar el crecimiento a largo plazo.")

    return explanations


def calculate_profile(answers: QuestionnaireAnswers) -> RiskProfileResult:
    score = calculate_risk_score(answers)
    profile = classify_profile(score)
    explanations = build_explanations(answers)

    return RiskProfileResult(
        profile=profile,
        score=score,
        rules_version=RULES_VERSION,
        explanations=explanations,
    )
