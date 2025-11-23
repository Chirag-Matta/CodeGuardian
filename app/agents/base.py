from abc import ABC, abstractmethod
from typing import List
from app.diff_parser import ParsedChange
from app.models import ReviewComment

class BaseAgent(ABC):
    name: str

    @abstractmethod
    def review(self, changes: List[ParsedChange]) -> List[ReviewComment]:
        ...
