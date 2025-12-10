from pathlib import Path

_INNER_UTILS = Path(__file__).resolve().parent / "utils"

# Make sure Python looks inside the nested utils directory for submodules.
__path__ = [str(_INNER_UTILS)]

