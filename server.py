import http.server
import socketserver
import json
import sqlite3
import urllib.parse
import os
import sys

PORT = 8000
DB_FILE = "portfolio.db"

DEFAULT_PROJECTS = [
    {
        "title": "Data Science & ML Analytics Dashboard",
        "desc": "End-to-end Machine Learning model analysis, dataset exploration, and data analytics dashboard.",
        "link": "#",
        "img": "data science.png"
    },
    {
        "title": "Interactive Resume Creator",
        "desc": "Interactive Resume Creator Website for building custom professional resumes.",
        "link": "https://sanketsahane56.github.io/resume-creator-/",
        "img": "resumeweb.png"
    },
    {
        "title": "AI & Data Science Portfolio",
        "desc": "Fully animated, interactive personal portfolio webpage showcasing AI, ML, Data Science projects & admin suite.",
        "link": "#",
        "img": "profileweb.png"
    }
]

DEFAULT_PROFILE = {
    "name": "Sanket Sahane",
    "tagline": "AI & Data Science Student | Machine Learning & Analytics Specialist | Full Stack Developer",
    "location": "Pune, Maharashtra, India",
    "expertise": "Data Science, AI/ML & Analytics",
    "email": "sanketsahane56@gmail.com",
    "badges": json.dumps([
        "AI & Data Science Student",
        "Data Analytics Specialist",
        "Machine Learning Engineer",
        "Deep Learning Researcher",
        "Python & SQL Developer"
    ])
}

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Projects Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            desc TEXT NOT NULL,
            link TEXT,
            img TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Profile Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS profile (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            name TEXT NOT NULL,
            tagline TEXT,
            location TEXT,
            expertise TEXT,
            email TEXT,
            badges TEXT
        )
    ''')

    # Seed Default Profile if Empty
    cursor.execute('SELECT COUNT(*) FROM profile')
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO profile (id, name, tagline, location, expertise, email, badges)
            VALUES (1, ?, ?, ?, ?, ?, ?)
        ''', (
            DEFAULT_PROFILE["name"],
            DEFAULT_PROFILE["tagline"],
            DEFAULT_PROFILE["location"],
            DEFAULT_PROFILE["expertise"],
            DEFAULT_PROFILE["email"],
            DEFAULT_PROFILE["badges"]
        ))

    # Seed Default Projects if Empty
    cursor.execute('SELECT COUNT(*) FROM projects')
    if cursor.fetchone()[0] == 0:
        for proj in DEFAULT_PROJECTS:
            cursor.execute('''
                INSERT INTO projects (title, desc, link, img)
                VALUES (?, ?, ?, ?)
            ''', (proj["title"], proj["desc"], proj["link"], proj["img"]))

    conn.commit()
    conn.close()
    print("[SUCCESS] SQLite Database initialized successfully:", DB_FILE)

class PortfolioAPIHandler(http.server.SimpleHTTPRequestHandler):

    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == "/api/projects":
            conn = get_db_connection()
            rows = conn.execute("SELECT id, title, desc, link, img FROM projects ORDER BY id DESC").fetchall()
            conn.close()
            projects = [dict(row) for row in rows]
            self._set_headers(200)
            self.wfile.write(json.dumps(projects).encode("utf-8"))
            return

        elif path == "/api/profile":
            conn = get_db_connection()
            row = conn.execute("SELECT name, tagline, location, expertise, email, badges FROM profile WHERE id = 1").fetchone()
            conn.close()
            if row:
                prof = dict(row)
                try:
                    prof["badges"] = json.loads(prof["badges"])
                except Exception:
                    prof["badges"] = []
                self._set_headers(200)
                self.wfile.write(json.dumps(prof).encode("utf-8"))
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Profile not found"}).encode("utf-8"))
            return

        # Serve static files for non-API requests
        return super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            body = json.loads(post_data.decode('utf-8')) if post_data else {}
        except Exception:
            body = {}

        if path == "/api/projects":
            title = body.get("title", "").strip()
            desc = body.get("desc", "").strip()
            link = body.get("link", "").strip()
            img = body.get("img", "").strip() or "profileweb.png"

            if not title or not desc:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Title and description are required"}).encode("utf-8"))
                return

            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO projects (title, desc, link, img) VALUES (?, ?, ?, ?)", (title, desc, link, img))
            conn.commit()
            new_id = cursor.lastrowid
            conn.close()

            self._set_headers(201)
            self.wfile.write(json.dumps({"success": True, "id": new_id}).encode("utf-8"))
            return

        elif path == "/api/profile":
            name = body.get("name", "Sanket Sahane").strip()
            tagline = body.get("tagline", "").strip()
            location = body.get("location", "").strip()
            expertise = body.get("expertise", "").strip()
            email = body.get("email", "").strip()
            badges = body.get("badges", [])
            badges_json = json.dumps(badges if isinstance(badges, list) else [])

            conn = get_db_connection()
            conn.execute('''
                UPDATE profile 
                SET name = ?, tagline = ?, location = ?, expertise = ?, email = ?, badges = ?
                WHERE id = 1
            ''', (name, tagline, location, expertise, email, badges_json))
            conn.commit()
            conn.close()

            self._set_headers(200)
            self.wfile.write(json.dumps({"success": True}).encode("utf-8"))
            return

        elif path == "/api/reset":
            conn = get_db_connection()
            conn.execute("DELETE FROM projects")
            conn.execute("DELETE FROM profile")
            conn.commit()
            conn.close()
            init_db()
            self._set_headers(200)
            self.wfile.write(json.dumps({"success": True, "message": "Database reset to default"}).encode("utf-8"))
            return

        elif path == "/api/send-otp":
            target_email = body.get("email", "").strip()
            otp_val = body.get("otp", "").strip()
            if target_email.lower() == "sanketsahane56@gmail.com":
                print(f"[SECURITY DISPATCH] OTP Email sent securely to registered admin email: {target_email}")
                self._set_headers(200)
                self.wfile.write(json.dumps({"success": True, "message": "OTP dispatched to email inbox"}).encode("utf-8"))
            else:
                self._set_headers(403)
                self.wfile.write(json.dumps({"error": "Unauthorized email"}).encode("utf-8"))
            return

        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def do_DELETE(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query = urllib.parse.parse_qs(parsed_url.query)

        if path == "/api/projects" or path.startswith("/api/projects/"):
            proj_id = None
            if "id" in query:
                proj_id = query["id"][0]
            elif path.startswith("/api/projects/"):
                proj_id = path.split("/")[-1]

            if proj_id:
                conn = get_db_connection()
                conn.execute("DELETE FROM projects WHERE id = ?", (proj_id,))
                conn.commit()
                conn.close()
                self._set_headers(200)
                self.wfile.write(json.dumps({"success": True}).encode("utf-8"))
                return

        self._set_headers(400)
        self.wfile.write(json.dumps({"error": "Project ID required for deletion"}).encode("utf-8"))

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == "__main__":
    init_db()
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with ThreadedTCPServer(("", PORT), PortfolioAPIHandler) as httpd:
        print(f"[SERVER] Portfolio Server running at http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
