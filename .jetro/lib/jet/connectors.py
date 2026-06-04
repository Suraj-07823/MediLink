# jet.connectors — load agent-built data connectors
# Usage: from jet.connectors import use
#   client = use('google_sheets', spreadsheetId='1abc...')
#   data = client.fetch()
import json, os, importlib.util

WORKSPACE = os.environ.get("JET_WORKSPACE", os.getcwd())
CONNECTORS_DIR = os.path.join(WORKSPACE, ".jetro", "connectors")


def use(slug, **params):
    """Load a connector by slug and return its Client instance.

    Credentials are injected via JET_CRED_{KEY} environment variables
    by the extension before script execution.

    Args:
        slug: Connector slug (directory name under .jetro/connectors/)
        **params: Override default connector params

    Returns:
        Client instance from the connector's client.py module
    """
    # Validate slug to prevent directory traversal attacks
    if not slug or os.path.basename(slug) != slug or slug in (".", ".."):
        raise ValueError(f"Invalid connector slug: {slug}")
    
    conn_dir = os.path.join(CONNECTORS_DIR, slug)
    config_path = os.path.join(conn_dir, "connector.json")
    client_path = os.path.join(conn_dir, "client.py")
    
    # Verify conn_dir is within CONNECTORS_DIR (no directory traversal)
    real_conn_dir = os.path.realpath(conn_dir)
    real_connectors_dir = os.path.realpath(CONNECTORS_DIR)
    if not real_conn_dir.startswith(real_connectors_dir + os.sep) and real_conn_dir != real_connectors_dir:
        raise ValueError(f"Connector slug attempts to traverse outside connectors directory: {slug}")
    
    # Check that connector directory exists
    if not os.path.isdir(conn_dir):
        raise FileNotFoundError(f"Connector directory not found for slug '{slug}': {conn_dir}")
    
    # Check that config file exists
    if not os.path.isfile(config_path):
        raise FileNotFoundError(f"Connector config not found for slug '{slug}': {config_path}")
    
    # Load and parse config
    try:
        with open(config_path) as f:
            config = json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in connector config for slug '{slug}': {config_path}: {e}") from e
    except Exception as e:
        raise RuntimeError(f"Failed to load connector config for slug '{slug}': {e}") from e

    # Resolve params: spec defaults < overrides
    resolved = {}
    for key, spec in config.get("params", {}).items():
        resolved[key] = params.get(key, spec.get("default"))
    resolved.update({k: v for k, v in params.items() if k not in resolved})

    # Get credential from env (injected by extension)
    cred_key = config.get("auth", {}).get("credentialKey")
    credential = None
    if cred_key:
        env_key = "JET_CRED_" + cred_key.upper().replace("-", "_")
        credential = os.environ.get(env_key)

    # Check that client module exists
    if not os.path.isfile(client_path):
        raise FileNotFoundError(f"Connector client module not found for slug '{slug}': {client_path}")

    # Dynamic import client.py
    try:
        spec_obj = importlib.util.spec_from_file_location(
            f"jet_connector_{slug}", client_path)
        if spec_obj is None:
            raise RuntimeError(f"Failed to create module spec for slug '{slug}': {client_path}")
        mod = importlib.util.module_from_spec(spec_obj)
        spec_obj.loader.exec_module(mod)
    except Exception as e:
        raise RuntimeError(f"Failed to load connector module for slug '{slug}': {e}") from e

    return mod.Client(config=config, params=resolved, credential=credential)
