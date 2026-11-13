import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from mangum import Mangum  # noqa: E402

from server import app  # noqa: E402

handler = Mangum(app, lifespan="off")