"""Tests que demuestran el mockeo de la API del LLM (Gemini).

Estos tests verifican que los componentes del sistema funcionan correctamente
incluso cuando la API de Gemini no está disponible, usando mocks.
"""

from unittest.mock import patch, MagicMock
import pytest

from backend.app.llm.gemini_client import (
    generate_profile_explanation,
    generate_portfolio_explanation,
    generate_response,
    get_client,
)


class TestLLMMock:
    def test_generate_profile_explanation_mocked(self):
        with patch("backend.app.llm.gemini_client.generate_response") as mock:
            mock.return_value = "Explicación generada por mock."

            result = generate_profile_explanation(
                profile_name="conservador",
                score=25,
                answers={
                    "age": 65,
                    "investment_horizon": "corto_plazo",
                    "risk_tolerance": "baja",
                    "goal": "preservacion_capital",
                    "investment_experience": 1,
                },
                rules=["Horizonte corto → perfil conservador"],
            )

            assert result == "Explicación generada por mock."
            mock.assert_called_once()

    def test_generate_portfolio_explanation_mocked(self):
        with patch("backend.app.llm.gemini_client.generate_response") as mock:
            mock.return_value = "Portafolio explicado por mock."

            result = generate_portfolio_explanation(
                profile_name="conservador",
                allocations=[
                    {
                        "instrument_id": "BONO-001",
                        "instrument_name": "Bonos del Tesoro",
                        "category": "renta_fija",
                        "percentage": 60.0,
                    }
                ],
                risk_metrics={
                    "expected_volatility": "baja",
                    "diversification_score": 70,
                    "max_drawdown_estimate": "5-10%",
                },
            )

            assert result == "Portafolio explicado por mock."
            mock.assert_called_once()

    def test_generate_response_without_api_key(self):
        with patch("backend.app.llm.gemini_client.os.getenv") as mock_env:
            mock_env.return_value = None
            result = generate_response("Hola")
            assert result == ""

    def test_generate_response_with_api_error(self):
        with patch("backend.app.llm.gemini_client.get_client") as mock_get_client:
            mock_client = MagicMock()
            mock_client.models.generate_content.side_effect = Exception("API Error")
            mock_get_client.return_value = mock_client

            with patch("backend.app.llm.gemini_client.os.getenv") as mock_env:
                mock_env.return_value = "fake-key"

                result = generate_response("test prompt")

                assert "No se pudo generar explicación" in result
                assert "API Error" in result
