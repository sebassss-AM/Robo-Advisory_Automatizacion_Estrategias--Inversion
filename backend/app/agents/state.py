from typing import TypedDict


class AgentState(TypedDict):
    session_id: str
    step: str
    answers: dict | None
    profile_id: str | None
    profile_result: dict | None
    proposal_id: str | None
    proposal_result: dict | None
    advisor_decision: str | None
    error: str | None
