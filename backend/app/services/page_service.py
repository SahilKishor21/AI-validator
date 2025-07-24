import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.page import Page
from ..schemas.page import PageCreate, PageUpdate

class PageService:
    def create_page(self, db: Session, page: PageCreate) -> Page:
        db_page = Page(
            id=str(uuid.uuid4()),
            title=page.title,
            content=page.content or [],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(db_page)
        db.commit()
        db.refresh(db_page)
        return db_page

    def get_page(self, db: Session, page_id: str) -> Optional[Page]:
        return db.query(Page).filter(Page.id == page_id).first()

    def get_page_by_share_token(self, db: Session, token: str) -> Optional[Page]:
        return db.query(Page).filter(Page.share_token == token, Page.is_public == True).first()

    def get_pages(self, db: Session, skip: int = 0, limit: int = 100) -> List[Page]:
        return db.query(Page).order_by(Page.updated_at.desc()).offset(skip).limit(limit).all()

    def update_page(self, db: Session, page_id: str, page_update: PageUpdate) -> Optional[Page]:
        db_page = db.query(Page).filter(Page.id == page_id).first()
        if db_page:
            update_data = page_update.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_page, field, value)
            db_page.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(db_page)
        return db_page

    def delete_page(self, db: Session, page_id: str) -> bool:
        db_page = db.query(Page).filter(Page.id == page_id).first()
        if db_page:
            db.delete(db_page)
            db.commit()
            return True
        return False

    def share_page(self, db: Session, page_id: str) -> Optional[str]:
        db_page = db.query(Page).filter(Page.id == page_id).first()
        if db_page:
            share_token = str(uuid.uuid4())
            db_page.is_public = True
            db_page.share_token = share_token
            db_page.updated_at = datetime.utcnow()
            db.commit()
            return share_token
        return None

    def unshare_page(self, db: Session, page_id: str) -> bool:
        db_page = db.query(Page).filter(Page.id == page_id).first()
        if db_page:
            db_page.is_public = False
            db_page.share_token = None
            db_page.updated_at = datetime.utcnow()
            db.commit()
            return True
        return False

page_service = PageService()