from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import text

# Configuración de la conexión a la base de datos
SQLALCHEMY_DATABASE_URL = "postgresql://manol:Manol.13@db:5432/sityo"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Definir la base de declaración para las clases del modelo
Base = declarative_base()

# Definición de modelo
class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True, index=True)
    message = Column(String)

def init_db():
    # Crear tablas si no existen
    Base.metadata.create_all(bind=engine)
    # Conectar al motor de la base de datos y crear la extensión PostGIS si no existe
    with engine.connect() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))