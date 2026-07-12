from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, field_validator


class RiskTolerance(str, Enum):
    LOW = "baja"
    MEDIUM = "media"
    HIGH = "alta"


class InvestmentHorizon(str, Enum):
    SHORT_TERM = "corto_plazo"
    MEDIUM_TERM = "mediano_plazo"
    LONG_TERM = "largo_plazo"


class InvestmentGoal(str, Enum):
    CAPITAL_PRESERVATION = "preservacion_capital"
    INCOME = "ingresos"
    GROWTH = "crecimiento"
    AGGRESSIVE_GROWTH = "crecimiento_agresivo"


class RiskProfile(str, Enum):
    CONSERVATIVE = "conservador"
    MODERATE = "moderado"
    AGGRESSIVE = "agresivo"


class QuestionnaireAnswers(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Edad del inversionista")
    investment_horizon: InvestmentHorizon
    risk_tolerance: RiskTolerance
    goal: InvestmentGoal
    monthly_income: float = Field(..., ge=0, description="Ingreso mensual en USD")
    monthly_investment: float = Field(
        default=0, ge=0, description="Monto que puede invertir por mes en USD"
    )
    investment_experience: int = Field(
        ..., ge=1, le=5, description="Experiencia en inversiones del 1 al 5"
    )

    @field_validator("age", "investment_experience", mode="before")
    @classmethod
    def coerce_int(cls, v):
        if isinstance(v, str):
            return int(v) if v else 0
        return v

    @field_validator("monthly_income", "monthly_investment", mode="before")
    @classmethod
    def coerce_float(cls, v):
        if isinstance(v, str):
            return float(v) if v else 0.0
        return v


class RiskProfileResult(BaseModel):
    profile: RiskProfile
    score: int = Field(..., ge=0, le=100)
    rules_version: str
    explanations: list[str]
    calculated_at: datetime = Field(default_factory=datetime.now)


class InvestorProfile(BaseModel):
    id: str | None = None
    answers: QuestionnaireAnswers
    result: RiskProfileResult
    created_at: datetime = Field(default_factory=datetime.now)
