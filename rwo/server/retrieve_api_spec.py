import json

from rwo.api_main import build_app

app = build_app()
with open("sdk/openapi.json", "wb") as f:
    f.write(json.dumps(app.openapi()).encode())
