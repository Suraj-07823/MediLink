# jet.browser -- Jetro Stealth Browser helper
# Usage: from jet.browser import launch_stealth, login_and_fetch
import json, random, time

_USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
]

_VIEWPORTS = [
    {"width": 1920, "height": 1080},
    {"width": 1440, "height": 900},
    {"width": 1536, "height": 864},
    {"width": 1366, "height": 768},
]


def launch_stealth(headless=True, **kwargs):
    """Launch a stealth Playwright Chromium browser context.

    Returns (pw, browser, context, page) tuple.
    Caller MUST close: browser.close(); pw.stop()

    Anti-detection: removes navigator.webdriver, realistic viewport/UA/locale,
    disables AutomationControlled blink feature, fixes plugins/languages/chrome.runtime.
    """
    from playwright.sync_api import sync_playwright

    pw = sync_playwright().start()

    ua = kwargs.pop("user_agent", random.choice(_USER_AGENTS))
    viewport = kwargs.pop("viewport", random.choice(_VIEWPORTS))

    launch_args = [
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
        "--no-first-run",
        "--no-default-browser-check",
    ]
    if "args" in kwargs:
        launch_args.extend(kwargs.pop("args"))

    browser = pw.chromium.launch(
        headless=headless,
        args=launch_args,
        **kwargs,
    )

    context = browser.new_context(
        user_agent=ua,
        viewport=viewport,
        locale="en-US",
        timezone_id="Asia/Kolkata",
        color_scheme="light",
        java_script_enabled=True,
        bypass_csp=True,
    )

    # Stealth: remove webdriver indicators
    context.add_init_script("""
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        window.chrome = { runtime: {} };
        const origQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (params) => (
            params.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                origQuery(params)
        );
    """)

    page = context.new_page()
    return pw, browser, context, page


def login_and_fetch(url, domain=None, wait_selector=None, timeout=25000):
    """Full credential-aware fetch with auto-login.

    If credentials exist for the domain, performs login first.
    Returns dict with: html, cookies, url (final URL after redirects).
    """
    from urllib.parse import urlparse
    from jet.credentials import get_credential

    if domain is None:
        domain = urlparse(url).netloc.replace("www.", "")

    cred = get_credential(domain)
    pw, browser, context, page = launch_stealth()

    try:
        if cred and cred.get("loginUrl"):
            try:
                page.goto(cred["loginUrl"], timeout=timeout, wait_until="networkidle")
            except Exception as e:
                raise RuntimeError(
                    f"Failed to navigate to login URL {cred['loginUrl']}: {e}"
                ) from e
            time.sleep(random.uniform(0.5, 1.5))

            selectors = cred.get("loginSelectors", {})
            username_sel = selectors.get(
                "usernameField",
                'input[type="email"], input[name="username"], input[name="email"], #username, #email'
            )
            password_sel = selectors.get(
                "passwordField",
                'input[type="password"], #password'
            )
            submit_sel = selectors.get(
                "submitButton",
                'button[type="submit"], input[type="submit"], .login-btn, #login-btn'
            )

            # Validate username field exists before filling
            try:
                if not page.query_selector(username_sel):
                    raise RuntimeError(f"Username field selector not found: {username_sel}")
                page.fill(username_sel, cred["username"])
            except Exception as e:
                raise RuntimeError(
                    f"Failed to fill username field (selector={username_sel}) at {cred['loginUrl']}: {e}"
                ) from e
            time.sleep(random.uniform(0.3, 0.7))

            # Validate password field exists before filling
            try:
                if not page.query_selector(password_sel):
                    raise RuntimeError(f"Password field selector not found: {password_sel}")
                page.fill(password_sel, cred["password"])
            except Exception as e:
                raise RuntimeError(
                    f"Failed to fill password field (selector={password_sel}) at {cred['loginUrl']}: {e}"
                ) from e
            time.sleep(random.uniform(0.3, 0.7))

            # Validate submit button exists before clicking
            try:
                if not page.query_selector(submit_sel):
                    raise RuntimeError(f"Submit button selector not found: {submit_sel}")
                page.click(submit_sel)
            except Exception as e:
                raise RuntimeError(
                    f"Failed to click submit button (selector={submit_sel}) at {cred['loginUrl']}: {e}"
                ) from e

            try:
                page.wait_for_load_state("networkidle", timeout=timeout)
            except Exception as e:
                raise RuntimeError(
                    f"Login page did not reach idle state after submission at {cred['loginUrl']}: {e}"
                ) from e
            time.sleep(random.uniform(1.0, 2.0))

        try:
            page.goto(url, timeout=timeout, wait_until="networkidle")
        except Exception as e:
            raise RuntimeError(
                f"Failed to navigate to target URL {url} (timeout={timeout}ms): {e}"
            ) from e

        if wait_selector:
            try:
                page.wait_for_selector(wait_selector, timeout=timeout)
            except Exception as e:
                raise RuntimeError(
                    f"Selector did not appear {wait_selector} (timeout={timeout}ms): {e}"
                ) from e

        return {
            "html": page.content(),
            "cookies": context.cookies(),
            "url": page.url,
        }
    except Exception as e:
        # Re-raise with a general wrapper if not already a RuntimeError
        if isinstance(e, RuntimeError):
            raise
        raise RuntimeError(f"Login and fetch failed for {url}: {e}") from e
    finally:
        browser.close()
        pw.stop()
