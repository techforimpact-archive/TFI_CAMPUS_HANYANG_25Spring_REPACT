from fastapi import FastAPI
from domain import user_router
from database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인 허용 (*)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



Base.metadata.create_all(bind=engine)


app.include_router(user_router.router)


