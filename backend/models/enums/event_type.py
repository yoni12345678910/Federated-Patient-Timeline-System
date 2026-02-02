from enum import Enum


class EventType(str, Enum):
    SURGERY = "surgery"
    EMERGENCY_ROOM = "emergency_room"
    VITALS = "vitals"
    IMAGING = "imaging"
