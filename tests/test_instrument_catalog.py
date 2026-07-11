"""Tests del catálogo de instrumentos financieros."""

import pytest

from backend.app.domain.instrument_catalog import (
    INSTRUMENTS,
    get_instrument_by_id,
    get_instruments_by_category,
)
from backend.app.models.portfolio_proposal import InstrumentCategory, Instrument


class TestInstrumentCatalog:
    def test_catalog_not_empty(self):
        assert len(INSTRUMENTS) > 0

    def test_all_instruments_have_required_fields(self):
        for instrument in INSTRUMENTS:
            assert instrument.id, f"Instrumento sin id: {instrument.name}"
            assert instrument.name, "Instrumento sin nombre"
            assert instrument.category in InstrumentCategory
            assert instrument.risk_level
            assert instrument.expected_return
            assert instrument.description

    def test_catalog_has_fixed_income(self):
        instruments = get_instruments_by_category(InstrumentCategory.FIXED_INCOME)
        assert len(instruments) >= 2

    def test_catalog_has_equity(self):
        instruments = get_instruments_by_category(InstrumentCategory.EQUITY)
        assert len(instruments) >= 1

    def test_catalog_has_liquidity(self):
        instruments = get_instruments_by_category(InstrumentCategory.LIQUIDITY)
        assert len(instruments) >= 1

    def test_catalog_has_alternatives(self):
        instruments = get_instruments_by_category(InstrumentCategory.ALTERNATIVES)
        assert len(instruments) >= 1


class TestGetInstrumentById:
    def test_existing_instrument(self):
        instrument = get_instrument_by_id("BONO-001")
        assert instrument is not None
        assert instrument.name == "Bonos del Tesoro"

    def test_non_existing_instrument(self):
        instrument = get_instrument_by_id("NO-EXISTE")
        assert instrument is None

    def test_instrument_has_valid_category(self):
        instrument = get_instrument_by_id("ETF-001")
        assert instrument is not None
        assert instrument.category == InstrumentCategory.EQUITY


class TestGetInstrumentsByCategory:
    def test_fixed_income_instruments_are_valid(self):
        instruments = get_instruments_by_category(InstrumentCategory.FIXED_INCOME)
        for inst in instruments:
            assert inst.category == InstrumentCategory.FIXED_INCOME

    def test_returns_empty_list_for_unknown_category(self):
        instruments = get_instruments_by_category("unknown")
        assert instruments == []
