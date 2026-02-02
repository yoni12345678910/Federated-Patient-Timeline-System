from abc import ABC, abstractmethod
from datetime import datetime
from typing import List

from models.timeline import TimelineEvent


class BaseAdapter(ABC):
    @abstractmethod
    async def fetch(self, patient_id: int, start_time: datetime, end_time: datetime) -> List[TimelineEvent]:
        pass