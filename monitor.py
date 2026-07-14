import urllib.request
import json
import time
import sys
import os

TOKEN = os.environ.get("GITHUB_TOKEN", "")
REPO = "JimzFM/JFM_AI"
WORKFLOW = "build-apk.yml"

headers = {
    "Accept": "application/vnd.github+json",
    "Authorization": f"Bearer {TOKEN}" if TOKEN else "",
    "User-Agent": "Antigravity-Termux"
}

def get_latest_run():
    url = f"https://api.github.com/repos/{REPO}/actions/workflows/{WORKFLOW}/runs?per_page=1"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            if "workflow_runs" in data and len(data["workflow_runs"]) > 0:
                return data["workflow_runs"][0]
    except Exception as e:
        print(f"Error fetching runs: {e}")
    return None

print("Checking for triggered workflow...")
run = None
for _ in range(10):  # wait up to 30 seconds for it to register in GitHub Actions
    run = get_latest_run()
    if run and run["status"] in ["queued", "in_progress"]:
        break
    time.sleep(3)

if not run:
    print("Could not find the triggered workflow run.")
    sys.exit(1)

run_id = run["id"]
html_url = run["html_url"]
print(f"Found workflow run ID: {run_id}")
print(f"HTML URL: {html_url}")
print("Monitoring progress...")

last_status = None
while True:
    url = f"https://api.github.com/repos/{REPO}/actions/runs/{run_id}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            run_data = json.loads(resp.read().decode())
            status = run_data["status"]
            conclusion = run_data["conclusion"]
            
            if status != last_status:
                print(f"Status: {status}" + (f" (Conclusion: {conclusion})" if conclusion else ""))
                last_status = status
                
            if status == "completed":
                print(f"Finished! Conclusion: {conclusion}")
                if conclusion == "success":
                    print("App built successfully.")
                else:
                    print("App build failed. Please check GitHub Actions logs.")
                break
    except Exception as e:
        print(f"Error polling status: {e}")
        
    time.sleep(15)
