from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field

class PageBase(BaseModel):
    title: str
    content: Optional[List[Any]] = []

class PageCreate(PageBase):
    pass

class PageUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[List[Any]] = None

class Page(PageBase):
    id: str
    createdAt: datetime = Field(alias="created_at")
    updatedAt: datetime = Field(alias="updated_at") 
    isPublic: bool = Field(alias="is_public")
    shareToken: Optional[str] = Field(alias="share_token", default=None)

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ShareResponse(BaseModel):
    shareToken: str