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
        print(f"[PAGE SERVICE] Searching for page with token: {token}")
        
        # First, check if any page with this token exists at all
        any_page = db.query(Page).filter(Page.share_token == token).first()
        
        if any_page:
            print(f"[PAGE SERVICE] Found page: id={any_page.id}, title={any_page.title}")
            print(f"[PAGE SERVICE] Page is_public: {any_page.is_public}")
            print(f"[PAGE SERVICE] Page share_token: {any_page.share_token}")
        else:
            print(f"[PAGE SERVICE] No page found with token: {token}")
            
            # Debug: Show all pages with share tokens
            all_shared_pages = db.query(Page).filter(Page.share_token.isnot(None)).all()
            print(f"[PAGE SERVICE] Total pages with share tokens: {len(all_shared_pages)}")
            for p in all_shared_pages:
                print(f"[PAGE SERVICE] Existing shared page: {p.id} - token: {p.share_token} - public: {p.is_public}")
        
        # Now get the public page only
        public_page = db.query(Page).filter(
            Page.share_token == token, 
            Page.is_public == True
        ).first()
        
        if public_page:
            print(f"[PAGE SERVICE] Found public page: {public_page.id}")
        else:
            print(f"[PAGE SERVICE] No public page found with token: {token}")
        
        return public_page

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
        print(f"[PAGE SERVICE] Sharing page: {page_id}")
        
        db_page = db.query(Page).filter(Page.id == page_id).first()
        if not db_page:
            print(f"[PAGE SERVICE] Page not found: {page_id}")
            return None
        
        # Generate unique share token
        share_token = str(uuid.uuid4())
        print(f"[PAGE SERVICE] Generated share token: {share_token}")
        
        # Update page
        db_page.is_public = True
        db_page.share_token = share_token
        db_page.updated_at = datetime.utcnow()
        
        try:
            db.commit()
            db.refresh(db_page)
            print(f"[PAGE SERVICE] Page shared successfully. is_public: {db_page.is_public}, token: {db_page.share_token}")
            return share_token
        except Exception as e:
            print(f"[PAGE SERVICE] Error sharing page: {e}")
            db.rollback()
            return None

    def unshare_page(self, db: Session, page_id: str) -> bool:
        print(f"[PAGE SERVICE] Unsharing page: {page_id}")
        
        db_page = db.query(Page).filter(Page.id == page_id).first()
        if not db_page:
            print(f"[PAGE SERVICE] Page not found: {page_id}")
            return False
        
        db_page.is_public = False
        db_page.share_token = None
        db_page.updated_at = datetime.utcnow()
        
        try:
            db.commit()
            print(f"[PAGE SERVICE] Page unshared successfully")
            return True
        except Exception as e:
            print(f"[PAGE SERVICE] Error unsharing page: {e}")
            db.rollback()
            return False

page_service = PageService()