"""Tests de los nodos del grafo LangGraph con LLM mockeado."""

from unittest.mock import patch
import pytest

from backend.app.agents.state import AgentState
from backend.app.agents.investor_profiling_node import run_profiling
from backend.app.agents.portfolio_generation_node import run_portfolio_generation
from backend.app.agents.advisor_approval_node import run_advisor_approval
from backend.app.agents.graph import build_graph, should_continue, should_approve


class TestProfilingNode:
    @patch("backend.app.agents.investor_profiling_node.generate_profile_explanation")
    def test_run_profiling_success(self, mock_llm, profiling_state):
        mock_llm.return_value = "Perfil explicado correctamente."

        result = run_profiling(profiling_state)

        assert "profile_result" in result
        assert result["profile_result"]["profile"] in ("conservador", "moderado", "agresivo")
        assert "score" in result["profile_result"]
        assert "explanations" in result["profile_result"]
        assert result["step"] == "profiling_done"

    @patch("backend.app.agents.investor_profiling_node.generate_profile_explanation")
    def test_run_profiling_includes_version(self, mock_llm, profiling_state):
        mock_llm.return_value = "OK"
        result = run_profiling(profiling_state)
        assert result["profile_result"]["rules_version"] == "1.0.0"

    def test_run_profiling_without_answers(self):
        result = run_profiling({"error": "No se recibieron respuestas del cuestionario"})
        assert "error" in result

    @patch("backend.app.agents.investor_profiling_node.generate_profile_explanation")
    def test_run_profiling_includes_instruments(self, mock_llm, profiling_state):
        mock_llm.return_value = "OK"
        result = run_profiling(profiling_state)
        assert "instruments" in result["profile_result"]
        assert len(result["profile_result"]["instruments"]) > 0


class TestPortfolioGenerationNode:
    @patch("backend.app.agents.portfolio_generation_node.generate_portfolio_explanation")
    def test_run_portfolio_generation_success(self, mock_llm_portfolio):
        mock_llm_portfolio.return_value = "Portafolio explicado."
        state: AgentState = {
            "session_id": "test-1",
            "step": "profiling_done",
            "answers": None,
            "profile_id": "p-001",
            "profile_result": {
                "profile": "moderado",
                "score": 50,
                "rules_version": "1.0.0",
                "explanations": ["Riesgo moderado"],
                "llm_explanation": "Perfil moderado",
                "instruments": [],
            },
            "proposal_id": None,
            "proposal_result": None,
            "advisor_decision": None,
            "error": None,
        }

        result = run_portfolio_generation(state)

        assert "proposal_result" in result
        assert "allocations" in result["proposal_result"]
        assert len(result["proposal_result"]["allocations"]) > 0
        assert "risk_metrics" in result["proposal_result"]
        assert result["step"] == "portfolio_done"

    @patch("backend.app.agents.portfolio_generation_node.generate_portfolio_explanation")
    def test_portfolio_allocations_sum_100(self, mock_llm_portfolio):
        mock_llm_portfolio.return_value = "OK"
        state: AgentState = {
            "session_id": "test-1",
            "step": "profiling_done",
            "answers": None,
            "profile_id": "p-001",
            "profile_result": {
                "profile": "moderado",
                "score": 50,
                "rules_version": "1.0.0",
                "explanations": [],
                "llm_explanation": "",
                "instruments": [],
            },
            "proposal_id": None,
            "proposal_result": None,
            "advisor_decision": None,
            "error": None,
        }

        result = run_portfolio_generation(state)
        total = sum(a["percentage"] for a in result["proposal_result"]["allocations"])
        assert total == 100.0

    def test_run_portfolio_without_profile(self):
        result = run_portfolio_generation({"error": "No hay perfil"})
        assert "error" in result

    @patch("backend.app.agents.portfolio_generation_node.generate_portfolio_explanation")
    def test_portfolio_includes_explanation(self, mock_llm_portfolio):
        mock_llm_portfolio.return_value = "Texto de explicación del LLM"
        state: AgentState = {
            "session_id": "test-1",
            "step": "profiling_done",
            "answers": None,
            "profile_id": "p-001",
            "profile_result": {
                "profile": "agresivo",
                "score": 80,
                "rules_version": "1.0.0",
                "explanations": [],
                "llm_explanation": "",
                "instruments": [],
            },
            "proposal_id": None,
            "proposal_result": None,
            "advisor_decision": None,
            "error": None,
        }

        result = run_portfolio_generation(state)
        assert result["proposal_result"]["llm_explanation"] == "Texto de explicación del LLM"


class TestAdvisorApprovalNode:
    def test_approval_accepted(self):
        state: AgentState = {
            "session_id": "test-1",
            "step": "portfolio_done",
            "answers": None,
            "profile_id": "p-001",
            "profile_result": None,
            "proposal_id": "prop-001",
            "proposal_result": None,
            "advisor_decision": "aprobado",
            "error": None,
        }

        result = run_advisor_approval(state)
        assert result["step"] == "approval_done"
        assert result["advisor_decision"] == "aprobado"

    def test_approval_rejected(self):
        state: AgentState = {
            "session_id": "test-1",
            "step": "portfolio_done",
            "answers": None,
            "profile_id": "p-001",
            "profile_result": None,
            "proposal_id": "prop-001",
            "proposal_result": None,
            "advisor_decision": "rechazado",
            "error": None,
        }
        result = run_advisor_approval(state)
        assert result["step"] == "approval_done"

    def test_approval_without_decision(self):
        result = run_advisor_approval({"step": "portfolio_done"})
        assert "error" in result
        assert "asesor" in result["error"].lower()


class TestGraphConditions:
    def test_should_continue_to_portfolio(self):
        state: AgentState = {
            "session_id": "test",
            "step": "profiling_done",
            "answers": None,
            "profile_id": "p-001",
            "profile_result": {"profile": "moderado", "score": 50},
            "proposal_id": None,
            "proposal_result": None,
            "advisor_decision": None,
            "error": None,
        }
        assert should_continue(state) == "portfolio"

    def test_should_continue_end(self):
        state: AgentState = {
            "session_id": "test",
            "step": "start",
            "answers": None,
            "profile_id": None,
            "profile_result": None,
            "proposal_id": None,
            "proposal_result": None,
            "advisor_decision": None,
            "error": None,
        }
        assert should_continue(state) == "end"

    def test_should_approve_done(self):
        state: AgentState = {
            "session_id": "test",
            "step": "approval_done",
            "answers": None,
            "profile_id": None,
            "profile_result": None,
            "proposal_id": None,
            "proposal_result": None,
            "advisor_decision": "aprobado",
            "error": None,
        }
        assert should_approve(state) == "done"

    def test_should_approve_end(self):
        state: AgentState = {
            "session_id": "test",
            "step": "awaiting_approval",
            "answers": None,
            "profile_id": None,
            "profile_result": None,
            "proposal_id": None,
            "proposal_result": None,
            "advisor_decision": None,
            "error": None,
        }
        assert should_approve(state) == "end"


class TestGraphBuild:
    def test_graph_builds_successfully(self):
        graph = build_graph()
        assert graph is not None

    def test_graph_has_expected_nodes(self):
        graph = build_graph()
        nodes = list(graph.nodes.keys())
        assert "profiling" in nodes
        assert "portfolio" in nodes
        assert "approval" in nodes
