"""Tests for claims endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_claims_requires_auth(client: AsyncClient):
    """Test that listing claims requires auth."""
    res = await client.get("/api/claims/")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_list_claims_empty(client: AsyncClient, auth_headers):
    """Test listing claims when none exist."""
    headers, user_id = auth_headers
    res = await client.get(f"/api/claims/?user_id={user_id}", headers=headers)
    assert res.status_code == 200
    assert res.json() == []


@pytest.mark.asyncio
async def test_list_payouts_requires_auth(client: AsyncClient):
    """Test that listing payouts requires auth."""
    res = await client.get("/api/claims/payouts")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_list_payouts_empty(client: AsyncClient, auth_headers):
    """Test listing payouts when none exist."""
    headers, _ = auth_headers
    res = await client.get("/api/claims/payouts", headers=headers)
    assert res.status_code == 200
    assert res.json() == []
