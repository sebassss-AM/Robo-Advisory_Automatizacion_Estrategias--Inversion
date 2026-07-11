from typing import Literal, TypedDict

from langgraph.graph import StateGraph, END

from backend.app.agents.investor_profiling_node import run_profiling
from backend.app.agents.portfolio_generation_node import run_portfolio_generation
from backend.app.agents.advisor_approval_node import run_advisor_approval


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


def should_continue(state: AgentState) -> Literal["portfolio", "end"]:
    if state.get("profile_result"):
        return "portfolio"
    return "end"


def should_approve(state: AgentState) -> Literal["done", "end"]:
    if state.get("advisor_decision"):
        return "done"
    return "end"


def build_graph() -> StateGraph:
    workflow = StateGraph(AgentState)

    workflow.add_node("profiling", run_profiling)
    workflow.add_node("portfolio", run_portfolio_generation)
    workflow.add_node("approval", run_advisor_approval)

    workflow.set_entry_point("profiling")

    workflow.add_conditional_edges(
        "profiling",
        should_continue,
        {"portfolio": "portfolio", "end": END},
    )

    workflow.add_edge("portfolio", "approval")

    workflow.add_conditional_edges(
        "approval",
        should_approve,
        {"done": END, "end": END},
    )

    return workflow.compile()
