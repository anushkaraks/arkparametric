"""Tests for policy endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_policy(client: AsyncClient, auth_headers):
    """Test creating a policy."""
    headers, user_id = auth_headers
    res = await client.post(
        "/api/policies/",
        json={"user_id": user_id, "coverage_hours": 40},
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["user_id"] == user_id
    assert data["coverage_hours"] == 40
    assert data["active_status"] is True
    assert "weekly_premium" in data


@pytest.mark.asyncio
async def test_create_policy_requires_auth(client: AsyncClient):
    """Test that creating a policy requires auth."""
    res = await client.post("/api/policies/", json={"user_id": 1, "coverage_hours": 40})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_create_policy_invalid_hours(client: AsyncClient, auth_headers):
    """Test that coverage_hours > 168 is rejected."""
    headers, user_id = auth_headers
    res = await client.post(
        "/api/policies/",
        json={"user_id": user_id, "coverage_hours": 200},
        headers=headers,
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_toggle_policy(client: AsyncClient, auth_headers):
    """Test toggling a policy on/off."""
    headers, user_id = auth_headers

    # Create a policy
    create_res = await client.post(
        "/api/policies/",
        json={"user_id": user_id, "coverage_hours": 20},
        headers=headers,
    )
    policy_id = create_res.json()["id"]

    # Toggle off
    toggle_res = await client.patch(
        f"/api/policies/{policy_id}/toggle",
        headers=headers,
    )
    assert toggle_res.status_code == 200
    assert toggle_res.json()["active_status"] is False

    # Toggle on again
    toggle_res2 = await client.patch(
        f"/api/policies/{policy_id}/toggle",
        headers=headers,
    )
    assert toggle_res2.json()["active_status"] is True


@pytest.mark.asyncio
async def test_list_policies(client: AsyncClient, auth_headers):
    """Test listing all policies."""
    headers, _ = auth_headers
    res = await client.get("/api/policies/", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
