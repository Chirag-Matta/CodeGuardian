"""
Centralized prompt templates for all review agents.
"""

SYSTEM_PROMPT = """You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization.

Your task is to analyze code changes and identify potential issues. Be thorough but practical - focus on real problems, not nitpicks.

You MUST respond with valid JSON in this exact format:
{
  "issues": [
    {
      "line": <line_number>,
      "severity": "critical|major|minor|info",
      "issue": "Brief description of the problem",
      "suggestion": "How to fix it"
    }
  ]
}

If no issues are found, return: {"issues": []}

Do not include any markdown formatting, explanations, or text outside the JSON structure."""


def get_analysis_prompt(agent_type: str, code_block: str, file_path: str, language: str) -> str:
    """
    Generate analysis prompt for specific agent type.
    """
    
    prompts = {
        "logic": f"""Analyze this code change for LOGIC BUGS and POTENTIAL ERRORS:

File: {file_path}
Language: {language}

Code Changes:
```
{code_block}
```

Look for:
- Null pointer/undefined access
- Off-by-one errors in loops and array indexing
- Incorrect conditionals (== vs ===, = vs ==)
- Missing edge case handling (empty arrays, null values, boundary conditions)
- Logic inversions (wrong boolean logic, negation errors)
- Unreachable code
- Incorrect loop termination conditions
- Type mismatches
- Unhandled exceptions

Return valid JSON only:
{{
  "issues": [
    {{
      "line": <line_number>,
      "severity": "critical|major|minor|info",
      "issue": "Brief description of the bug",
      "suggestion": "How to fix it"
    }}
  ]
}}

If no issues, return: {{"issues": []}}""",

        "security": f"""Analyze this code change for SECURITY VULNERABILITIES:

File: {file_path}
Language: {language}

Code Changes:
```
{code_block}
```

Look for:
- SQL injection vulnerabilities (string concatenation in queries)
- Cross-Site Scripting (XSS) risks
- Hardcoded secrets, API keys, passwords, tokens
- Unsafe deserialization
- Command injection
- Path traversal vulnerabilities
- Insecure authentication/authorization
- Cryptographic weaknesses
- Missing input validation
- CSRF vulnerabilities
- Insecure random number generation
- Information disclosure

Return valid JSON only:
{{
  "issues": [
    {{
      "line": <line_number>,
      "severity": "critical|major|minor|info",
      "issue": "Security vulnerability description",
      "suggestion": "Secure alternative"
    }}
  ]
}}

If no issues, return: {{"issues": []}}""",

        "performance": f"""Analyze this code change for PERFORMANCE ISSUES:

File: {file_path}
Language: {language}

Code Changes:
```
{code_block}
```

Look for:
- N+1 query problems (loops with database calls)
- Inefficient algorithms (O(n²) when O(n log n) possible)
- Unnecessary nested loops
- Memory leaks (unclosed resources, circular references)
- Excessive object creation in loops
- Missing pagination for large datasets
- Blocking I/O in hot paths
- Inefficient data structures (list when set needed)
- Redundant computations
- Missing caching opportunities
- Inefficient string concatenation

Return valid JSON only:
{{
  "issues": [
    {{
      "line": <line_number>,
      "severity": "critical|major|minor|info",
      "issue": "Performance problem description",
      "suggestion": "Optimization approach"
    }}
  ]
}}

If no issues, return: {{"issues": []}}""",

        "readability": f"""Analyze this code change for READABILITY and CODE QUALITY:

File: {file_path}
Language: {language}

Code Changes:
```
{code_block}
```

Look for:
- Poor variable/function naming (too generic like 'tmp', 'data', 'var', 'x')
- High complexity (deeply nested conditions, long functions)
- Missing or misleading comments
- Inconsistent code style
- Magic numbers without explanation
- Poor error messages
- Confusing logic flow
- Abbreviations that reduce clarity
- Functions that do too many things

Return valid JSON only:
{{
  "issues": [
    {{
      "line": <line_number>,
      "severity": "minor|info",
      "issue": "Readability issue description",
      "suggestion": "Improvement suggestion"
    }}
  ]
}}

If no issues, return: {{"issues": []}}""",

        "code_quality": f"""Analyze this code change for CODE QUALITY and BEST PRACTICES:

File: {file_path}
Language: {language}

Code Changes:
```
{code_block}
```

Look for:
- Lines exceeding 120 characters
- Debug statements (print, console.log, debugger)
- Commented-out code that should be removed
- TODO/FIXME comments without context
- Missing error handling (bare try-except, no catch)
- Duplicate code
- Violations of DRY principle
- Missing type hints (Python) or type annotations
- Inconsistent formatting
- Missing documentation for complex logic

Return valid JSON only:
{{
  "issues": [
    {{
      "line": <line_number>,
      "severity": "minor|info",
      "issue": "Code quality issue",
      "suggestion": "Best practice recommendation"
    }}
  ]
}}

If no issues, return: {{"issues": []}}"""
    }
    
    return prompts.get(agent_type, "")


def get_few_shot_examples(agent_type: str) -> str:
    """
    Provide few-shot examples for better LLM performance (optional).
    """
    examples = {
        "security": """
Example 1:
Code: cursor.execute("SELECT * FROM users WHERE id=" + user_id)
Output: {"issues": [{"line": 10, "severity": "critical", "issue": "SQL injection vulnerability via string concatenation", "suggestion": "Use parameterized query: cursor.execute('SELECT * FROM users WHERE id=?', (user_id,))"}]}

Example 2:
Code: password = request.args.get('password')
Output: {"issues": [{"line": 15, "severity": "major", "issue": "Password transmitted via GET request (visible in logs)", "suggestion": "Use POST request with HTTPS for sensitive data"}]}
""",
        "performance": """
Example 1:
Code: for user in users: db.query(Order).filter_by(user_id=user.id).all()
Output: {"issues": [{"line": 20, "severity": "major", "issue": "N+1 query problem - one query per user", "suggestion": "Use eager loading or a single JOIN query"}]}
"""
    }
    return examples.get(agent_type, "")