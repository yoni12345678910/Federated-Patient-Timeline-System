from datetime import datetime
from typing import List

from models.timeline import TimelineEvent


class BaseAdapter:
    async def fetch(self, patient_id: int, from_dt: datetime, to_dt: datetime) -> List[TimelineEvent]: raise NotImplementedError