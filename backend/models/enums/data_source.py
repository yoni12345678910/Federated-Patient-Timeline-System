from enum import Enum


class DataSource(str, Enum):
    REGISTRY = "registry"
    PACS = "pacs"
    VITALS = "vitals"
