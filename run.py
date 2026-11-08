import sys
import os
import webbrowser
import threading
import time

# Ensure backend directory is in python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(BASE_DIR, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app

def open_browser():
    time.sleep(1.2)
    url = "http://127.0.0.1:5000"
    print(f"\n=======================================================")
    print(f"  AcuFourier: Smart Noise Pollution Monitoring System")
    print(f"  Applied Mathematics Capstone Project (CO4)")
    print(f"  Opening browser at: {url}")
    print(f"=======================================================\n")
    try:
        webbrowser.open(url)
    except Exception:
        pass

if __name__ == "__main__":
    threading.Thread(target=open_browser, daemon=True).start()
    app.run(host="127.0.0.1", port=5000, debug=False)

