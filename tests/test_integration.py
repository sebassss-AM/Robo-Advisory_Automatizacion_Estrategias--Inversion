"""Tests de integración del flujo completo con LLM mockeado."""

from unittest.mock import patch
import pytest

from backend.app.agents.graph import build_graph
from backend.app.agents.state import AgentState


class TestFullFlow:
    @patch("backend.app.agents.investor_profiling_node.generate_profile_explanation")
    @patch("backend.app.agents.portfolio_generation_node.generate_portfolio_explanation")
    def test_full_graph_execution(self, mock_portfolio, mock_profiling):
        mock_profiling.return_value = "Perfil explicado."
        mock_portfolio.return_value = "Portafolio explicado."

        graph = build_graph()
        initial_state: AgentState = {
            "session_id": "integ-test-1",
            "step": "start",
            "answers": {
                "age": 35,
                "investment_horizon": "mediano_plazo",
                "risk_tolerance": "media",
                "goal": "crecimiento",
                "monthly_investment": 0, "monthly_income": 5000.0,
                "investment_experience": 3,
            },
            "profile_id": None,
            "profile_result": None,
            "proposal_id": None,
            "proposal_result": None,
            "advisor_decision": None,
            "error": None,
        }

        final_state = graph.invoke(initial_state)

        assert final_state.get("profile_result") is not None
        assert final_state.get("proposal_result") is not None
        assert final_state["step"] in ("approval_done", "awaiting_approval")

    @patch("backend.app.agents.investor_profiling_node.generate_profile_explanation")
    @patch("backend.app.agents.portfolio_generation_node.generate_portfolio_explanation")
    def test_full_graph_with_approval(self, mock_portfolio, mock_profiling):
        mock_profiling.return_value = "Perfil explicado."
        mock_portfolio.return_value = "Portafolio explicado."

        graph = build_graph()

        initial_state: AgentState = {
            "session_id": "integ-test-2",
            "step": "start",
            "answers": {
                "age": 28,
                "investment_horizon": "largo_plazo",
                "risk_tolerance": "alta",
                "goal": "crecimiento_agresivo",
                "monthly_investment": 0, "monthly_income": 8000.0,
                "investment_experience": 5,
            },
            "profile_id": None,
            "profile_result": None,
            "proposal_id": None,
            "proposal_result": None,
            "advisor_decision": "aprobado",
            "error": None,
        }

        final_state = graph.invoke(initial_state)

        assert final_state["profile_result"]["profile"] == "agresivo"
        assert final_state["advisor_decision"] == "aprobado"
        assert final_state["step"] == "approval_done"


class TestEdgeCases:
    @patch("backend.app.agents.investor_profiling_node.generate_profile_explanation")
    def test_conservador_flow_allocations(self, mock_profiling):
        mock_profiling.return_value = "Explicación."

        graph = build_graph()
        initial_state: AgentState = {
            "session_id": "edge-test",
            "step": "start",
            "answers": {
                "age": 65,
                "investment_horizon": "corto_plazo",
                "risk_tolerance": "baja",
                "goal": "preservacion_capital",
                "monthly_investment": 0, "monthly_income": 2000.0,
                "investment_experience": 1,
            },
            "profile_id": None,
            "profile_result": None,
            "proposal_id": None,
            "proposal_result": None,
            "advisor_decision": "aprobado",
            "error": None,
        }

        state = graph.invoke(initial_state)

        assert state["profile_result"]["profile"] == "conservador"
        for alloc in state["proposal_result"]["allocations"]:
            if alloc["category"] == "renta_fija":
                assert alloc["percentage"] == 60.0
