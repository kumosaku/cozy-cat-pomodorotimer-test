import http.server, socketserver, os

PORT = 8080
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cozy-cat-pomodorotimer'))

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # suppress request logs

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"\n  cozy-cat-pomodorotimer")
    print(f"  http://localhost:{PORT}\n")
    httpd.serve_forever()
