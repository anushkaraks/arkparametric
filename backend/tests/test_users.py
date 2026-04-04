"""Tests for user endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_user(client: AsyncClient):
    """Test user registration."""
    res = await client.post("/api/users/", json={
        "name": "Ramesh Kumar",
        "city": "Mumbai",
        "platform": "Swiggy",
        "avg_hours_per_week": 40,
    })
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Ramesh Kumar"
    assert data["city"] == "Mumbai"
    assert "id" in data
    assert "hourly_rate" in data
    assert "risk_profile_score" in data


@pytest.mark.asyncio
async def test_create_user_validation_error(client: AsyncClient):
    """Test that invalid input is rejected."""
    # Missing required field
    res = await client.post("/api/users/", json={
        "name": "",
        "city": "Mumbai",
        "platform": "Swiggy",
        "avg_hours_per_week": 40,
    })
    assert res.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_create_user_hours_out_of_range(client: AsyncClient):
    """Test that hours > 168 is rejected."""
    res = await client.post("/api/users/", json={
        "name": "Test",
        "city": "Mumbai",
        "platform": "Swiggy",
        "avg_hours_per_week": 200,
    })
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_get_user_requires_auth(client: AsyncClient):
    """Test that GET /users/:id requires auth."""
    res = await client.get("/api/users/1")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_get_user_with_auth(client: AsyncClient, auth_headers):
    """Test getting a user with valid auth."""
    headers, user_id = auth_headers
    res = await client.get(f"/api/users/{user_id}", headers=headers)
    assert res.status_code == 200
    assert res.json()["id"] == user_id


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    """Test login flow."""
    # Register first
    reg = await client.post("/api/users/", json={
        "name": "Login Test",
        "city": "Delhi",
        "platform": "Uber",
        "avg_hours_per_week": 30,
    })
    user_id = reg.json()["id"]

    # Login
    res = await client.post("/api/auth/login", json={"user_id": user_id})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["id"] == user_id


@pytest.mark.asyncio
async def test_login_invalid_user(client: AsyncClient):
    """Test login with non-existent user."""
    res = await client.post("/api/auth/login", json={"user_id": 99999})
    assert res.status_code == 404
