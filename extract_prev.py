with open("styles.css", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "grid" in line or "dashboard" in line or "workspace" in line:
        print(f"Line {i+1}: {line.strip()}")
