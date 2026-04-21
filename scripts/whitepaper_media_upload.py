#!/usr/bin/env python3
"""Simple upload server for Whitepaper media.

Listens on 127.0.0.1:9090 and accepts POST /upload with multipart/form-data.
Saves files into /var/www/ocindonesia/media/whitepaper/.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import cgi
import os
import html
import time
from pathlib import Path
import json

UPLOAD_DIR = "/var/www/ocindonesia/media/whitepaper"
HOST = "127.0.0.1"
PORT = 9090

INDEX_FILENAME = "index.html"
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
DELETE_TOKEN_FILE = "/root/.openclaw/workspace/state/whitepaper/media_delete_token.txt"

os.makedirs(UPLOAD_DIR, exist_ok=True)


def _fmt_bytes(num: int) -> str:
    kb = num / 1024
    if kb < 1024:
        return f"{kb:.1f} KB"
    mb = kb / 1024
    return f"{mb:.1f} MB"


def _fmt_mtime(ts: float) -> str:
    # Dashboard is used by Reandy (WIB). Keep it explicit so it's readable.
    # We intentionally avoid timezone conversions here to keep the server simple.
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(ts))


def generate_media_dashboard(base_url: str) -> None:
    """Regenerate /media/whitepaper/index.html from current files on disk."""
    p = Path(UPLOAD_DIR)
    items = []
    for fp in p.iterdir():
        if not fp.is_file():
            continue
        if fp.name == INDEX_FILENAME:
            continue
        if fp.suffix.lower() not in ALLOWED_EXTS:
            continue
        st = fp.stat()
        items.append(
            {
                "name": fp.name,
                "size": st.st_size,
                "mtime": st.st_mtime,
            }
        )

    items.sort(key=lambda x: x["mtime"], reverse=True)

    def esc(s: str) -> str:
        return html.escape(s, quote=True)

    html_parts = [
        "<!doctype html>",
        "<html lang='en'>",
        "<head>",
        "  <meta charset='utf-8'>",
        "  <meta name='viewport' content='width=device-width, initial-scale=1'>",
        "  <title>Whitepaper Media Dashboard</title>",
        "  <style>",
        "    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; margin: 20px; background: #f7f7f7; }",
        "    h1 { margin-bottom: 0.25rem; }",
        "    .note { margin-bottom: 0.75rem; color: #555; }",
        "    .small { font-size: 12px; color: #6b7280; }",
        "    .grid { display: flex; flex-wrap: wrap; gap: 16px; }",
        "    .item { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); padding: 8px; width: 260px; display: flex; gap: 8px; }",
        "    .thumb img { width: 100px; height: 100px; border-radius: 4px; object-fit: cover; background: #eee; }",
        "    .meta { font-size: 12px; overflow-wrap: anywhere; }",
        "    .name { font-weight: 600; margin-bottom: 4px; }",
        "    .info { margin-bottom: 2px; }",
        "    .url { color: #336699; }",
        "    .upload-box { margin-bottom: 14px; padding: 12px; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }",
        "    .upload-box form { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }",
        "    button { border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; padding: 8px 10px; cursor: pointer; }",
        "    button:hover { background: #f9fafb; }",
        "    .btn-danger { background: #b91c1c; color: #fff; border-color: #b91c1c; }",
        "    .btn-danger:hover { background: #991b1b; }",
        "  </style>",
        "</head>",
        "<body>",
        "  <h1>Whitepaper Media Dashboard</h1>",
        "  <div class='note'>Semua foto yang sudah kamu upload dan disimpan di server untuk Whitepaper.</div>",
        "  <div class='small'>Last updated: " + esc(_fmt_mtime(time.time())) + "</div>",
        "",
        "  <div class='upload-box'>",
        "    <form method='post' enctype='multipart/form-data' action='/media/whitepaper/upload'>",
        "      <input type='file' name='file' multiple accept='image/*'>",
        "      <button type='submit'>Upload</button>",
        "    </form>",
        "    <div class='small'>Max upload: <b>50MB</b> per request. Kalau tidak muncul di list, coba refresh halaman (hard refresh).</div>",
        "  </div>",
        "",
        "  <div class='upload-box'>",
        "    <div style='display:flex; gap:8px; align-items:center; flex-wrap:wrap;'>",
        "      <button id='btnSelectAll' type='button'>Select all</button>",
        "      <button id='btnClear' type='button'>Clear</button>",
        "      <button id='btnDelete' class='btn-danger' type='button'>Delete selected</button>",
        "      <button id='btnSetToken' type='button'>Set delete token</button>",
        "      <span id='selCount' class='small'>Selected: 0</span>",
        "    </div>",
        "    <div class='small'>Delete pakai token (disimpan di browser). Kalau token salah, delete ditolak.</div>",
        "  </div>",
        "",
        "  <div class='grid'>",
    ]

    for it in items:
        name = it["name"]
        url = f"{base_url}/media/whitepaper/{name}"
        html_parts.append("    <div class='item'>")
        html_parts.append("      <div style='display:flex; flex-direction:column; gap:6px; align-items:center;'>")
        html_parts.append("        <input class='sel' type='checkbox' data-name='" + esc(name) + "'>")
        html_parts.append("        <div class='thumb'><img src='" + esc(name) + "' alt='" + esc(name) + "'></div>")
        html_parts.append("      </div>")
        html_parts.append("      <div class='meta'>")
        html_parts.append("        <div class='name'>" + esc(name) + "</div>")
        html_parts.append("        <div class='info'>Size: " + esc(_fmt_bytes(int(it["size"]))) + "</div>")
        html_parts.append("        <div class='info'>Uploaded: " + esc(_fmt_mtime(float(it["mtime"]))) + "</div>")
        html_parts.append("        <div class='info url'>URL: " + esc(url) + "</div>")
        html_parts.append("      </div>")
        html_parts.append("    </div>")

    html_parts.extend(
        [
            "  </div>",
            "",
            "  <script>",
            "    const tokenKey = 'wp_media_delete_token';",
            "    const selCount = document.getElementById('selCount');",
            "    const boxes = Array.from(document.querySelectorAll('input.sel'));",
            "    function selected(){ return boxes.filter(b => b.checked).map(b => b.dataset.name).filter(Boolean); }",
            "    function render(){ selCount.textContent = 'Selected: ' + selected().length; }",
            "    boxes.forEach(b => b.addEventListener('change', render));",
            "    document.getElementById('btnSelectAll').addEventListener('click', () => { boxes.forEach(b => b.checked = true); render(); });",
            "    document.getElementById('btnClear').addEventListener('click', () => { boxes.forEach(b => b.checked = false); render(); });",
            "    document.getElementById('btnSetToken').addEventListener('click', () => {",
            "      const cur = localStorage.getItem(tokenKey) || '';",
            "      const t = prompt('Paste delete token (32 hex). Leave empty to clear.', cur);",
            "      if (t === null) return;",
            "      const v = (t || '').trim();",
            "      if (!v) localStorage.removeItem(tokenKey); else localStorage.setItem(tokenKey, v);",
            "      alert(v ? 'Token saved.' : 'Token cleared.');",
            "    });",
            "    document.getElementById('btnDelete').addEventListener('click', async () => {",
            "      const files = selected();",
            "      if (!files.length) return alert('Belum ada yang dipilih.');",
            "      if (!confirm('Delete ' + files.length + ' file(s)? Ini tidak bisa di-undo.')) return;",
            "      const token = (localStorage.getItem(tokenKey) || '').trim();",
            "      if (!token) return alert('Token belum diset. Klik Set delete token dulu.');",
            "      try {",
            "        const res = await fetch('/media/whitepaper/delete', {",
            "          method: 'POST',",
            "          headers: { 'Content-Type': 'application/json', 'X-Delete-Token': token },",
            "          body: JSON.stringify({ files }),",
            "        });",
            "        const data = await res.json().catch(() => ({}));",
            "        if (!res.ok) throw new Error((data && data.error) ? data.error : ('HTTP ' + res.status));",
            "        alert('Deleted: ' + (data.deleted || []).length + '\\nErrors: ' + (data.errors || []).length);",
            "        location.reload();",
            "      } catch (e) {",
            "        alert('Delete failed: ' + (e && e.message ? e.message : e));",
            "      }",
            "    });",
            "    render();",
            "  </script>",
            "</body>",
            "</html>",
        ]
    )

    out = ("\n".join(html_parts)).encode("utf-8")
    tmp_path = os.path.join(UPLOAD_DIR, f".{INDEX_FILENAME}.tmp")
    final_path = os.path.join(UPLOAD_DIR, INDEX_FILENAME)
    with open(tmp_path, "wb") as f:
        f.write(out)
    os.replace(tmp_path, final_path)


def request_base_url(handler: BaseHTTPRequestHandler) -> str:
    host = handler.headers.get("X-Forwarded-Host") or handler.headers.get("Host") or "ocindonesia.my.id"
    proto = handler.headers.get("X-Forwarded-Proto") or "https"
    return f"{proto}://{host}"


def expected_delete_token() -> str:
    try:
        if os.path.exists(DELETE_TOKEN_FILE):
            with open(DELETE_TOKEN_FILE, "r", encoding="utf-8") as f:
                return f.read().strip()
    except Exception:
        return ""
    return ""


def send_json(handler: BaseHTTPRequestHandler, status: int, payload: dict) -> None:
    data = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)


class UploadHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Delete endpoint
        if self.path == "/delete":
            expected = expected_delete_token()
            if not expected:
                send_json(self, 503, {"error": "Delete not configured"})
                return

            got = (self.headers.get("X-Delete-Token") or "").strip()
            if got != expected:
                send_json(self, 403, {"error": "Invalid delete token"})
                return

            try:
                length = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                length = 0

            raw = self.rfile.read(length) if length > 0 else b"{}"
            try:
                payload = json.loads(raw.decode("utf-8")) if raw else {}
            except Exception:
                send_json(self, 400, {"error": "Invalid JSON"})
                return

            files = payload.get("files") or []
            if not isinstance(files, list):
                send_json(self, 400, {"error": "files must be a list"})
                return

            deleted = []
            errors = []
            for name in files:
                try:
                    if not isinstance(name, str):
                        continue
                    base = os.path.basename(name)
                    if not base or base.startswith("."):
                        continue
                    if base == INDEX_FILENAME:
                        continue
                    ext = os.path.splitext(base)[1].lower()
                    if ext not in ALLOWED_EXTS:
                        continue
                    target = os.path.join(UPLOAD_DIR, base)
                    if os.path.exists(target):
                        os.remove(target)
                        deleted.append(base)
                except Exception as e:
                    errors.append({"file": str(name), "error": str(e)})

            # Refresh dashboard after deletes
            try:
                generate_media_dashboard(request_base_url(self))
            except Exception as e:
                errors.append({"file": "(dashboard)", "error": str(e)})

            send_json(self, 200, {"deleted": deleted, "errors": errors})
            return

        # Upload endpoint
        if self.path != "/upload":
            self.send_error(404, "Not found")
            return

        ctype, pdict = cgi.parse_header(self.headers.get("Content-Type", ""))
        if ctype != "multipart/form-data":
            self.send_error(400, "Expected multipart/form-data")
            return

        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={
                "REQUEST_METHOD": "POST",
                "CONTENT_TYPE": self.headers.get("Content-Type", ""),
            },
        )

        files = form["file"] if "file" in form else []
        if not isinstance(files, list):
            files = [files]

        saved = []
        for field in files:
            if not getattr(field, "filename", None):
                continue
            filename = os.path.basename(field.filename)
            # Simple sanitization: replace spaces with underscores
            filename = filename.replace(" ", "_")
            target = os.path.join(UPLOAD_DIR, filename)

            with open(target, "wb") as f:
                while True:
                    chunk = field.file.read(1024 * 1024)
                    if not chunk:
                        break
                    f.write(chunk)

            saved.append(filename)

        # Refresh dashboard so newly uploaded files appear immediately.
        try:
            base_url = request_base_url(self)
            generate_media_dashboard(base_url)
        except Exception:
            # Don't fail the upload response if dashboard generation fails.
            pass

        body_lines = []
        base_url = request_base_url(self)
        if saved:
            body_lines.append("<p>Uploaded:</p><ul>")
            for name in saved:
                esc = html.escape(name)
                url = f"{base_url}/media/whitepaper/{esc}"
                body_lines.append(f"<li><a href='{url}' target='_blank'>{esc}</a></li>")
            body_lines.append("</ul>")
        else:
            body_lines.append("<p>No files received.</p>")

        body_lines.append("<p><a href='/media/whitepaper/'>Back to media dashboard</a></p>")
        body = """<!doctype html>
<html><head><meta charset='utf-8'><title>Upload result</title></head>
<body>
%s
</body></html>
""" % ("\n".join(body_lines))

        data = body.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        # Keep stdout clean; comment this out to debug
        return


def run():
    server = HTTPServer((HOST, PORT), UploadHandler)
    server.serve_forever()


if __name__ == "__main__":
    run()
