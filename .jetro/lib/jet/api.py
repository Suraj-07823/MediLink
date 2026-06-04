# jet.api — Jetro API proxy helper
# Usage: from jet.api import jet_api
import json, os, urllib.request, urllib.error, ssl, certifi, socket

API = os.environ.get("JET_API_URL", "https://api.jetro.ai")
JWT = os.environ.get("JET_JWT", "")


def jet_api(endpoint, params=None, provider="fmp"):
    """Call the Jetro data proxy API.

    Args:
        endpoint: FMP endpoint path, e.g. "/quote/AAPL"
        params: Optional dict of query parameters
        provider: API provider ("fmp" or "polygon")

    Returns:
        Parsed JSON response from the provider
    """
    body = {"provider": provider, "endpoint": endpoint}
    if params:
        body["params"] = params
    req = urllib.request.Request(
        f"{API}/api/data",
        data=json.dumps(body).encode(),
        headers={
            "Authorization": f"Bearer {JWT}",
            "Content-Type": "application/json",
            "User-Agent": "Jetro/1.0",
        },
    )
    ctx = ssl.create_default_context(cafile=certifi.where())
    try:
        response = urllib.request.urlopen(req, context=ctx)
        response_data = response.read()
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8', errors='replace')
        raise RuntimeError(
            f"Jetro API HTTP {e.code} error calling {endpoint} (provider={provider}): {error_body}"
        ) from e
    except urllib.error.URLError as e:
        raise RuntimeError(
            f"Jetro API network error calling {endpoint} (provider={provider}): {e.reason}"
        ) from e
    except socket.timeout as e:
        raise RuntimeError(
            f"Jetro API timeout calling {endpoint} (provider={provider}): {e}"
        ) from e
    
    try:
        return json.loads(response_data)
    except json.JSONDecodeError as e:
        raise RuntimeError(
            f"Jetro API invalid JSON response from {endpoint} (provider={provider}): {e}"
        ) from e
