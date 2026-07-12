from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class InstrumentCategory(str, Enum):
    FIXED_INCOME = "renta_fija"
    EQUITY = "renta_variable"
    LIQUIDITY = "liquidez"
    ALTERNATIVES = "alternativos"


class Instrument(BaseModel):
    id: str
    name: str
    category: InstrumentCategory
    risk_level: str
    expected_return: str
    description: str


class Allocation(BaseModel):
    instrument_id: str
    instrument_name: str
    category: InstrumentCategory
    percentage: float = Field(..., ge=0, le=100)
    amount_usd: float | None = None
    pe_ratio: float | None = None
    dividend_yield: float | None = None


class RiskMetrics(BaseModel):
    expected_volatility: str
    diversification_score: int = Field(..., ge=0, le=100)
    max_drawdown_estimate: str


class PortfolioProposal(BaseModel):
    id: str | None = None
    profile_id: str
    allocations: list[Allocation]
    risk_metrics: RiskMetrics
    explanation: str
    generated_at: datetime = Field(default_factory=datetime.now)
    status: str = "pending"
