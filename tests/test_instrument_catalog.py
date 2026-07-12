import pytest

from backend.app.domain.instrument_catalog import (
    INSTRUMENTS,
    get_instrument_by_id,
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

    def test_catalog_has_all_categories(self):
        cats = {i.category for i in INSTRUMENTS}
        assert InstrumentCategory.FIXED_INCOME in cats
        assert InstrumentCategory.EQUITY in cats
        assert InstrumentCategory.LIQUIDITY in cats


class TestGetInstrumentById:
    def test_existing_instrument(self):
        instrument = get_instrument_by_id("BND")
        assert instrument is not None
        assert instrument.id == "BND"

    def test_non_existing_instrument(self):
        instrument = get_instrument_by_id("NO-EXISTE")
        assert instrument is None

    def test_instrument_has_valid_category(self):
        instrument = get_instrument_by_id("QQQ")
        assert instrument is not None
        assert instrument.category == InstrumentCategory.EQUITY
