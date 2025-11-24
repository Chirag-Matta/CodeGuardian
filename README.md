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

#### 2. Review GitHub PR
```bash
curl -X POST http://localhost:8000/review-pr \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "Chirag-Matta",
    "repo": "YouTubeFetcherAPI",
    "pr_number": 1
  }'
```

#### 3. Review Raw Diff
```bash
curl -X POST http://localhost:8000/review-diff \
  -H "Content-Type: application/json" \
  -d '{
    "diff": "diff --git a/file.py b/file.py\n..."
  }'
```

### Example Response

```json
{
  "summary": {
    "total_comments": 5,
    "critical": 1,
    "major": 2,
    "minor": 1,
    "info": 1,
    "message": "Found 5 potential issue(s): 1 critical, 2 major, 1 minor, 1 informational."
  },
  "files": {
    "app/db.py": {
      "critical": [
        {
          "agent": "security_agent",
          "comment": "SQL injection vulnerability via string concatenation",
          "suggestion": "Use parameterized queries: cursor.execute('SELECT * FROM users WHERE id=?', (user_id,))",
          "lines": [45]
        }
      ],
      "major": [
        {
          "agent": "performance_agent",
          "comment": "N+1 query problem detected in loop",
          "suggestion": "Use eager loading or a single JOIN query",
          "lines": [67, 68]
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
│   ├── diff_parser.py              # Git diff parser
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
    "info": 0
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

**2. GitHub API Rate Limit**
```
403 API rate limit exceeded
```
**Solution**: Use authenticated GitHub token with higher limits

**3. Empty Review Results**
```
"message": "No issues detected"
```
**Solution**: 
- Check if agents are enabled in `.env`
- Verify diff contains actual code changes
- Check `MIN_SEVERITY_LEVEL` setting

**4. JSON Parse Error**
```
Failed to parse JSON response
```
**Solution**: 
- Increase `MAX_TOKENS_PER_REQUEST`
- Reduce `BATCH_SIZE`
- Check LLM provider status

## 🚀 Deployment

### Docker (Recommended)

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

- [ ] GitHub App integration (automatic PR comments)
- [ ] Support for more LLM providers (Anthropic Claude, Llama)
- [ ] Custom rule configuration
- [ ] Web dashboard for review history
- [ ] Integration with CI/CD pipelines
- [ ] Multi-language support enhancement
- [ ] Code fix suggestions with diffs

---

**Made with ❤️ by developers, for developers**