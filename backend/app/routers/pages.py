from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..schemas.page import Page, PageCreate, PageUpdate, ShareResponse
from ..services.page_service import page_service

router = APIRouter(prefix="/pages", tags=["pages"])

@router.post("/", response_model=Page)
def create_page(page: PageCreate, db: Session = Depends(get_db)):
    return page_service.create_page(db=db, page=page)

@router.get("/", response_model=List[Page])
def read_pages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return page_service.get_pages(db, skip=skip, limit=limit)

@router.get("/{page_id}", response_model=Page)
def read_page(page_id: str, db: Session = Depends(get_db)):
    db_page = page_service.get_page(db, page_id=page_id)
    if db_page is None:
        raise HTTPException(status_code=404, detail="Page not found")
    return db_page

@router.get("/shared/{token}", response_model=Page)
def read_shared_page(token: str, db: Session = Depends(get_db)):
    db_page = page_service.get_page_by_share_token(db, token=token)
    if db_page is None:
        raise HTTPException(status_code=404, detail="Shared page not found")
    return db_page

@router.put("/{page_id}", response_model=Page)
def update_page(page_id: str, page: PageUpdate, db: Session = Depends(get_db)):
    db_page = page_service.update_page(db, page_id=page_id, page_update=page)
    if db_page is None:
        raise HTTPException(status_code=404, detail="Page not found")
    return db_page

@router.delete("/{page_id}")
def delete_page(page_id: str, db: Session = Depends(get_db)):
    success = page_service.delete_page(db, page_id=page_id)
    if not success:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"message": "Page deleted successfully"}

@router.post("/{page_id}/share")
def share_page(page_id: str, db: Session = Depends(get_db)):
    share_token = page_service.share_page(db, page_id=page_id)
    if share_token is None:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"shareToken": share_token}  

@router.delete("/{page_id}/share")
def unshare_page(page_id: str, db: Session = Depends(get_db)):
    success = page_service.unshare_page(db, page_id=page_id)
    if not success:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"message": "Page unshared successfully"}