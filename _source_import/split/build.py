#!/usr/bin/env python3
"""
把 pages/ 目錄下的各頁面片段，依照 manifest.json 的順序，
和 shared/_head.html、shared/_footer.html 組合回完整的 preview.html。

用法：
    python3 build.py
輸出：
    ./preview.built.html
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(HERE, "manifest.json"), encoding="utf-8") as f:
    manifest = json.load(f)

with open(os.path.join(HERE, "shared", "_head.html"), encoding="utf-8") as f:
    head = f.read()

with open(os.path.join(HERE, "shared", "_footer.html"), encoding="utf-8") as f:
    footer = f.read()

parts = [head]
for item in manifest:
    path = os.path.join(HERE, "pages", item["file"])
    with open(path, encoding="utf-8") as f:
        parts.append(f.read())
parts.append(footer)

output = "\n".join(p.rstrip("\n") for p in parts) + "\n"

out_path = os.path.join(HERE, "preview.built.html")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(output)

print(f"已輸出：{out_path}")
print(f"共整合 {len(manifest)} 個頁面 + 共用外殼")
