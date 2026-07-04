
from __future__ import annotations

import subprocess
import sys
import time

commands = [
    [sys.executable, '-m', 'uvicorn', 'server.app.main:app', '--port', '8011'],
    ['npm', 'run', 'dev'],
]

procs = []
try:
    for command in commands:
        procs.append(subprocess.Popen(command))
        time.sleep(1)
    print('Project ODIN fullstack launched. Backend: http://localhost:8011 Frontend: Vite default URL')
    for proc in procs:
        proc.wait()
finally:
    for proc in procs:
        if proc.poll() is None:
            proc.terminate()
