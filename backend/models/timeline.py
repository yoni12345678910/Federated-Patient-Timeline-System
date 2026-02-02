from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel

from models.enums.data_source import DataSource
from models.enums.event_type import EventType


class TimelineEvent(BaseModel):
    id: str
    type: EventType
    source: DataSource
    timestamp: datetime
    patientId: int
    data: dict
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    children: List["TimelineEvent"] = []
