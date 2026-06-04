# jet.credentials -- Jetro Credential Vault helper
# Usage: from jet.credentials import get_credential, has_credential
import json, os

_CREDS_CACHE = None


def _load():
    global _CREDS_CACHE
    if _CREDS_CACHE is None:
        raw = os.environ.get("JET_CREDENTIALS", "{}")
        try:
            _CREDS_CACHE = json.loads(raw)
        except json.JSONDecodeError:
            _CREDS_CACHE = {}
    return _CREDS_CACHE


def get_credential(domain):
    """Get credential for a domain.

    Returns dict with: username, password, loginUrl, loginSelectors
    or None if not found. Supports partial domain matching (parent → child only).
    
    Example: stored credential for 'example.com' matches query for 'api.example.com',
    but NOT vice versa (querying 'example.com' will not return credential for 'api.example.com').
    """
    creds = _load()
    if domain in creds:
        return creds[domain]
    for stored_domain, cred in creds.items():
        if domain.endswith("." + stored_domain):
            return cred
    return None


def has_credential(domain):
    """Check if a credential exists for the given domain."""
    return get_credential(domain) is not None


def get_all_credentials():
    """Get all available credentials as {domain: {username, password, ...}}."""
    return _load()


if __name__ == "__main__":
    # Unit tests for credential matching
    
    # Test case 1: exact domain match
    os.environ["JET_CREDENTIALS"] = json.dumps({"example.com": {"username": "user1", "password": "pass1"}})
    _CREDS_CACHE = None  # Reset cache
    assert get_credential("example.com") == {"username": "user1", "password": "pass1"}
    print("✓ Test 1 passed: exact domain match")
    
    # Test case 2: subdomain queries parent credential
    os.environ["JET_CREDENTIALS"] = json.dumps({"example.com": {"username": "user2", "password": "pass2"}})
    _CREDS_CACHE = None  # Reset cache
    assert get_credential("api.example.com") == {"username": "user2", "password": "pass2"}
    print("✓ Test 2 passed: subdomain queries parent credential")
    
    # Test case 3: parent domain does NOT return subdomain credential
    os.environ["JET_CREDENTIALS"] = json.dumps({"api.example.com": {"username": "user3", "password": "pass3"}})
    _CREDS_CACHE = None  # Reset cache
    assert get_credential("example.com") is None
    print("✓ Test 3 passed: parent domain does not return subdomain credential")
    
    # Test case 4: no match returns None
    os.environ["JET_CREDENTIALS"] = json.dumps({"other.com": {"username": "user4", "password": "pass4"}})
    _CREDS_CACHE = None  # Reset cache
    assert get_credential("example.com") is None
    print("✓ Test 4 passed: no match returns None")
    
    # Test case 5: multilevel subdomain
    os.environ["JET_CREDENTIALS"] = json.dumps({"example.com": {"username": "user5", "password": "pass5"}})
    _CREDS_CACHE = None  # Reset cache
    assert get_credential("deep.api.example.com") == {"username": "user5", "password": "pass5"}
    print("✓ Test 5 passed: multilevel subdomain queries parent credential")
    
    print("\nAll credential matching tests passed!")
