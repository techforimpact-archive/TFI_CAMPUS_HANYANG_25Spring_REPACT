from sqlalchemy import Column, Integer, String
from database import Base
from sqlalchemy.dialects.sqlite import JSON

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    total_score = Column(Integer, default=0)
