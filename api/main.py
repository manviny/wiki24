from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from geoalchemy2 import Geography
from pydantic import BaseModel

app = FastAPI()

# Configuración de la base de datos
SQLALCHEMY_DATABASE_URL = "postgresql://manol:Manol.13@db:5432/sityo"
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

Base = declarative_base()

# Modelo de datos en SQLAlchemy
class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True, index=True)
    message = Column(String)
    location = Column(Geography(geometry_type='POINT', srid=4326))  

# Modelo de entrada en Pydantic
class MessageCreate(BaseModel):
    message: str
    latitude: float = 0  # Valores predeterminados en caso de que no se pasen
    longitude: float = 0

# DESCOMENTAR SI SE QUIERE BORRAR LA BD
Base.metadata.create_all(bind=engine)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/create/")
def create_message(message_data: MessageCreate):
    new_message = Message(
        message=message_data.message,
        location=f'SRID=4326;POINT({message_data.longitude} {message_data.latitude})'
    )
    try:
        with SessionLocal() as session:
            session.add(new_message)
            session.commit()
        return {"message": "Message created successfully"}
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

@app.get("/messages/")
def read_messages():
    with SessionLocal() as session:
        result = session.query(Message).all()
        messages = [{
            "id": m.id,
            "message": m.message,
            "location": str(m.location)
        } for m in result]
        return {"messages": messages}

@app.delete("/delete/{message_id}")
def delete_message(message_id: int):
    try:
        with SessionLocal() as session:
            message = session.query(Message).filter(Message.id == message_id).first()
            if not message:
                raise HTTPException(status_code=404, detail="Message not found")
            
            session.delete(message)
            session.commit()
        return {"message": "Message deleted successfully"}
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))    