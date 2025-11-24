# 🤖 Automated GitHub PR Review Agent

An intelligent multi-agent system that automatically reviews GitHub Pull Requests using AI-powered analysis. Detects security vulnerabilities, logic bugs, performance issues, code quality problems, and readability concerns.

## ✨ Features

- **🔒 Security Analysis**: SQL injection, XSS, hardcoded secrets, insecure authentication
- **🐛 Logic Bug Detection**: Null pointer errors, off-by-one errors, incorrect conditionals
- **⚡ Performance Optimization**: N+1 queries, inefficient algorithms, memory leaks
- **📖 Readability Review**: Naming conventions, code complexity, documentation
- **✅ Code Quality**: Best practices, debugging statements, style consistency
- **🔄 API Key Rotation**: Automatic rotation for Gemini API rate limits
- **📊 Structured Output**: JSON reports with severity levels and actionable suggestions
- **🛡️ Robust Diff Parsing**: Graceful handling of malformed diffs with fallback parser

## 🏗️ Architecture

```
┌─────────────────┐
│  GitHub PR/Diff │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FastAPI Server │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Diff Parser    │
│  (with fallback)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Orchestrator   │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────┐
│      Multi-Agent System          │
├──────────────────────────────────┤
│  ├─ Security Agent                │
│  ├─ Logic Agent                   │
│  ├─ Performance Agent             │
│  ├─ Readability Agent             │
│  └─ Code Quality Agent            │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────┐
│  LLM Provider   │
│ (OpenAI/Gemini) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Review Report  │
└─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Git
- GitHub Personal Access Token (for PR fetching)
- API Key for OpenAI or Google Gemini

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/pr-review-agent.git
cd pr-review-agent
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_your_github_token_here

# LLM Provider (choose one)
LLM_PROVIDER=gemini  # or "openai"

# Gemini Configuration (FREE!)
GEMINI_API_KEY=your_gemini_api_key_here
# Optional: Multiple keys for rotation (comma-separated)
GEMINI_API_KEYS=key1,key2,key3
GEMINI_MODEL=gemini-2.0-flash-exp

# OpenAI Configuration (Alternative)
# OPENAI_API_KEY=sk-your_openai_key_here
# OPENAI_MODEL=gpt-4o

# Agent Configuration
ENABLE_SECURITY_AGENT=true
ENABLE_LOGIC_AGENT=true
ENABLE_PERFORMANCE_AGENT=true
ENABLE_READABILITY_AGENT=true
ENABLE_CODE_QUALITY_AGENT=true

# Review Settings
MIN_SEVERITY_LEVEL=info  # critical|major|minor|info
MAX_COMMENTS_PER_FILE=20
BATCH_SIZE=10
```

### 🔑 Getting API Keys

#### GitHub Token
1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Generate new token with `repo` scope
3. Copy token to `.env`

#### Google Gemini API (Recommended - FREE!)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy key to `.env`

#### OpenAI API (Alternative)
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key
3. Copy key to `.env`

## 🎮 Usage

### Start the Server

**Option 1: Using Uvicorn directly**
```bash
uvicorn app.app:app --reload --host 0.0.0.0 --port 8000
```

**Option 2: Using Python module**
```bash
python -m uvicorn app.app:app --reload --host 0.0.0.0 --port 8000
```

**Option 3: Production mode (no reload)**
```bash
uvicorn app.app:app --host 0.0.0.0 --port 8000 --workers 4
```

Server will be available at `http://localhost:8000`

### API Endpoints

#### 1. Health Check
```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "ok"
}
```

#### 2. Review GitHub PR
```bash
curl -X POST http://localhost:8000/review-pr \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "username",
    "repo": "repository",
    "pr_number": 1
  }'
```

#### 3. Review Raw Diff

**Simple Example:**
```bash
curl -X POST http://localhost:8000/review-diff \
  -H "Content-Type: application/json" \
  -d '{
    "diff": "diff --git a/app/db.py b/app/db.py\n--- a/app/db.py\n+++ b/app/db.py\n@@ -10,0 +10,3 @@\n+password = \"hardcoded_pass\"\n+query = \"SELECT * FROM users WHERE id=\" + user_id\n+print(\"Debug:\", data)\n"
  }'
```

**Using a File:**
```bash
# Create test_diff.json
cat > test_diff.json << 'EOF'
{
  "diff": "diff --git a/app/youtube.py b/app/youtube.py\n--- a/app/youtube.py\n+++ b/app/youtube.py\n@@ -45,3 +45,8 @@ async def fetch_youtube_videos():\n     for key in valid_api_keys:\n         params = {\n             \"part\": \"snippet\",\n+            \"key\": \"AIzaSyC1234567890\"\n         }\n+        for user in users:\n+            video = db.query(Video).filter_by(user_id=user.id).first()\n"
}
EOF

# Send request
curl -X POST http://localhost:8000/review-diff \
  -H "Content-Type: application/json" \
  -d @test_diff.json | jq .
```

**Python Script (Recommended):**
```python
#!/usr/bin/env python3
import requests
import json

# Sample diff with multiple issues
test_diff = """diff --git a/app/database.py b/app/database.py
--- a/app/database.py
+++ b/app/database.py
@@ -8,1 +8,5 @@
 load_dotenv()
 
+# Security issue: hardcoded credentials
+DATABASE_URL = "postgresql://admin:password123@localhost/db"
+API_KEY = "sk_live_1234567890abcdef"
+
+# Performance issue: N+1 query
+for user in users:
+    db.query(Order).filter_by(user_id=user.id).all()
"""

# Send request
response = requests.post(
    "http://localhost:8000/review-diff",
    json={"diff": test_diff}
)

# Print results
if response.status_code == 200:
    print("✅ Review successful!")
    print(json.dumps(response.json(), indent=2))
else:
    print(f"❌ Error {response.status_code}")
    print(response.text)
```

**From GitHub PR:**
```bash
#!/bin/bash

# Fetch PR diff from GitHub
PR_DIFF=$(curl -s -H "Accept: application/vnd.github.v3.diff" \
  "https://api.github.com/repos/owner/repo/pulls/1")

# Create JSON payload
cat > pr_payload.json << EOF
{
  "diff": $(echo "$PR_DIFF" | jq -Rs .)
}
EOF

# Send to review endpoint
curl -X POST http://localhost:8000/review-diff \
  -H "Content-Type: application/json" \
  -d @pr_payload.json | jq .
```

### Example Response

```json
{
  "summary": {
    "total_comments": 5,
    "critical": 2,
    "major": 2,
    "minor": 1,
    "info": 0,
    "message": "Found 5 potential issue(s): 2 critical, 2 major, 1 minor, 0 informational."
  },
  "files": {
    "app/database.py": {
      "critical": [
        {
          "agent": "security_agent",
          "comment": "Hardcoded database credentials detected in code",
          "suggestion": "Move credentials to environment variables using os.getenv()",
          "lines": [11]
        },
        {
          "agent": "security_agent",
          "comment": "Hardcoded API key detected",
          "suggestion": "Store API keys in .env file and load with python-dotenv",
          "lines": [12]
        }
      ],
      "major": [
        {
          "agent": "performance_agent",
          "comment": "N+1 query problem detected - database query inside loop",
          "suggestion": "Use eager loading or batch queries to reduce database calls",
          "lines": [15, 16]
        }
      ]
    },
    "app/youtube.py": {
      "major": [
        {
          "agent": "logic_agent",
          "comment": "Possible assignment in conditional (= instead of ==)",
          "suggestion": "Verify you meant to use comparison operator (==) not assignment (=)",
          "lines": [67]
        }
      ],
      "minor": [
        {
          "agent": "code_quality_agent",
          "comment": "Debug print statement found",
          "suggestion": "Remove debug statements or use proper logging (logging.debug())",
          "lines": [70]
        }
      ]
    }
  }
}
```

## 📁 Project Structure

```
pr-review-agent/
├── app/
│   ├── agents/
│   │   ├── base.py                 # Abstract base agent
│   │   ├── llm_base.py             # LLM-powered agent base
│   │   ├── security_agent.py       # Security vulnerability detection
│   │   ├── logic_agent.py          # Logic bug detection
│   │   ├── performance_agent.py    # Performance issue detection
│   │   ├── readability_agent.py    # Readability analysis
│   │   └── code_quality_agent.py   # Code quality checks
│   ├── utils/
│   │   ├── code_context.py         # Code parsing utilities
│   │   └── prompts.py              # LLM prompt templates
│   ├── app.py                      # FastAPI application
│   ├── config.py                   # Configuration management
│   ├── diff_parser.py              # Git diff parser (with fallback)
│   ├── github_client.py            # GitHub API client
│   ├── models.py                   # Pydantic models
│   └── orchestrator.py             # Multi-agent orchestrator
├── output/                         # Review JSON outputs
├── tests/                          # Test suite
├── .env                            # Environment variables
├── .env.example                    # Environment template
├── requirements.txt                # Python dependencies
└── README.md                       # This file
```

## 🔧 Configuration

### Agent Configuration

Enable/disable specific agents in `.env`:
```bash
ENABLE_SECURITY_AGENT=true       # Security vulnerabilities
ENABLE_LOGIC_AGENT=true          # Logic bugs
ENABLE_PERFORMANCE_AGENT=true    # Performance issues
ENABLE_READABILITY_AGENT=true    # Code readability
ENABLE_CODE_QUALITY_AGENT=true   # Code quality
```

### Review Settings

```bash
MIN_SEVERITY_LEVEL=info          # Minimum severity to report
MAX_COMMENTS_PER_FILE=20         # Limit comments per file
BATCH_SIZE=10                    # Changes processed per batch
MAX_RETRIES=3                    # API retry attempts
RETRY_DELAY=1.0                  # Retry delay in seconds
```

### LLM Settings

```bash
MAX_TOKENS_PER_REQUEST=4000      # Max tokens per API call
LLM_TEMPERATURE=0.0              # Temperature (0.0 = deterministic)
MAX_CONTEXT_TOKENS=8000          # Max context window
```

## 🧪 Testing

### Run all tests
```bash
pytest
```

### Run specific test file
```bash
pytest app/tests/test_agents.py -v
```

### Run with coverage
```bash
pytest --cov=app --cov-report=html
```

### Manual Testing with Different Scenarios

**Test Security Agent:**
```bash
python << 'EOF'
import requests

diff = """diff --git a/config.py b/config.py
--- a/config.py
+++ b/config.py
@@ -1,0 +1,2 @@
+API_KEY = "sk_live_1234567890"
+query = "SELECT * FROM users WHERE id=" + user_id
"""

r = requests.post("http://localhost:8000/review-diff", json={"diff": diff})
print(r.json())
EOF
```

**Test Performance Agent:**
```bash
python << 'EOF'
import requests

diff = """diff --git a/api.py b/api.py
--- a/api.py
+++ b/api.py
@@ -10,0 +10,3 @@
+for user in all_users:
+    orders = db.query(Order).filter_by(user_id=user.id).all()
+    for order in orders:
+        items = db.query(Item).filter_by(order_id=order.id).all()
"""

r = requests.post("http://localhost:8000/review-diff", json={"diff": diff})
print(r.json())
EOF
```

## 📊 Output Files

Reviews are automatically saved to `output/` directory:

- **PR Reviews**: `output/pr_{number}_review_{timestamp}.json`
- **Diff Reviews**: `output/diff_review_{timestamp}.json`

Example output structure:
```json
{
  "summary": {
    "total_comments": 3,
    "critical": 1,
    "major": 1,
    "minor": 1,
    "info": 0,
    "message": "Found 3 potential issue(s): 1 critical, 1 major, 1 minor, 0 informational."
  },
  "files": {
    "app/db.py": {
      "critical": [...],
      "major": [...]
    }
  }
}
```

## 🔄 API Key Rotation (Gemini Only)

To handle rate limits, configure multiple Gemini API keys:

```bash
GEMINI_API_KEYS=key1,key2,key3
```

The system automatically rotates through keys when rate limits are hit.

## 🐛 Troubleshooting

### Common Issues

**1. Model Not Found Error**
```
ERROR: 404 models/gemini-2.0-flash-live is not found
```
**Solution**: Use correct model name in `.env`
```bash
GEMINI_MODEL=gemini-2.0-flash-exp  # or gemini-1.5-flash
```

**2. Diff Parse Error**
```
UnidiffParseError: Hunk is shorter than expected
```
**Solution**: The updated diff parser now handles this automatically with a fallback parser. If issues persist:
- Ensure diff has proper format (headers, hunks)
- Check that line counts match in hunk headers
- Use the Python script method instead of raw curl

**3. GitHub API Rate Limit**
```
403 API rate limit exceeded
```
**Solution**: Use authenticated GitHub token with higher limits

**4. Empty Review Results**
```
"message": "No issues detected"
```
**Solution**: 
- Check if agents are enabled in `.env`
- Verify diff contains actual code changes (added lines with `+`)
- Check `MIN_SEVERITY_LEVEL` setting
- Try the test examples above to verify agents are working

**5. JSON Parse Error from LLM**
```
Failed to parse JSON response
```
**Solution**: 
- Increase `MAX_TOKENS_PER_REQUEST`
- Reduce `BATCH_SIZE`
- Check LLM provider status

**6. Invalid Diff Format**
```
Empty diff provided or parsing failed
```
**Solution**:
- Use proper git diff format (see examples above)
- Ensure newlines are escaped as `\n` in JSON
- Try the Python script method for automatic formatting

## 📝 Diff Format Requirements

For manual diff creation, follow this format:

```
diff --git a/file.py b/file.py
--- a/file.py
+++ b/file.py
@@ -start,count +start,count @@
 context line
+added line
-removed line
 context line
```

**Key points:**
- Must start with `diff --git a/... b/...`
- Include `---` and `+++` file markers
- Hunk headers: `@@ -old_start,old_count +new_start,new_count @@`
- Added lines start with `+`
- Removed lines start with `-`
- Context lines start with space

The fallback parser can handle some malformed diffs, but proper format is recommended.

## 🚀 Deployment

### Docker (Recommended)

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.app:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t pr-review-agent .
docker run -p 8000:8000 --env-file .env pr-review-agent
```

### Production Deployment

```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn app.app:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern web framework
- [Google Gemini](https://ai.google.dev/) - Free AI model
- [OpenAI](https://openai.com/) - GPT models
- [Unidiff](https://github.com/matiasb/python-unidiff) - Diff parsing

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/pr-review-agent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/pr-review-agent/discussions)

## 🔮 Roadmap

- [x] Multi-agent review system
- [x] Gemini API key rotation
- [x] Robust diff parsing with fallback
- [ ] GitHub App integration (automatic PR comments)
- [ ] Support for more LLM providers (Anthropic Claude, Llama)
- [ ] Custom rule configuration
- [ ] Web dashboard for review history
- [ ] Integration with CI/CD pipelines
- [ ] Multi-language support enhancement
- [ ] Code fix suggestions with diffs
- [ ] Real-time streaming responses
- [ ] Webhook support for automated reviews

---

**Made with ❤️ by developers, for developers**
