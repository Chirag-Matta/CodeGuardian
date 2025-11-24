import pytest
from app.agents.security_agent import SecurityAgent
from app.agents.logic_agent import LogicAgent
from app.diff_parser import ParsedChange


@pytest.fixture
def security_agent():
    return SecurityAgent()


@pytest.fixture
def logic_agent():
    return LogicAgent()


def test_security_agent_sql_injection(security_agent):
    """Test that security agent detects SQL injection."""
    changes = [
        ParsedChange(
            file_path="app/db.py",
            new_line_no=10,
            content='query = "SELECT * FROM users WHERE id=" + user_id'
        )
    ]
    
    comments = security_agent.review(changes)
    
    assert len(comments) > 0
    assert any("injection" in c.comment.lower() for c in comments)
    assert any(c.severity in ["critical", "major"] for c in comments)


def test_security_agent_hardcoded_secret(security_agent):
    """Test detection of hardcoded secrets."""
    changes = [
        ParsedChange(
            file_path="config.py",
            new_line_no=5,
            content='AWS_SECRET_KEY = "akjs123456789"'
        )
    ]
    
    comments = security_agent.review(changes)
    
    assert len(comments) > 0
    assert any("secret" in c.comment.lower() for c in comments)