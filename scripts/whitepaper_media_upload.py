#!/usr/bin/env python3
"""Simple upload server for Whitepaper media.

Listens on 127.0.0.1:9090 and accepts POST /upload with multipart/form-data.
Saves files into /var/www/ocindonesia/media/whitepaper/.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import cgi
import os
import html

UPLOAD_DIR = "/var/www/ocindonesia/media/whitepaper"
HOST = "127.0.0.1"
PORT = 9090

os.makedirs(UPLOAD_DIR, exist_ok=True)


def request_base_url(handler: BaseHTTPRequestHandler) -> str:
    host = handler.headers.get("X-Forwarded-Host") or handler.headers.get("Host") or "ocindonesia.my.id"
    proto = handler.headers.get("X-Forwarded-Proto") or "https"
    return f"{proto}://{host}"


class UploadHandler(BaseHTTPRequestHandler):
    def do_POST(self):
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
