"""Create and contain database-related classes"""
# Dependencies
from typing import Type, TypeVar, List, Optional
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


# Base Class for Models
class Base(DeclarativeBase):
    """ Base class """

# Create a single database instance
db = SQLAlchemy(model_class=Base)

# Generic Type for Models
T = TypeVar('T', bound=Base)

# Model for Inquirer Database (Default DB)
class Inquirer(db.Model):
    """Creates an Inquirer table"""
    id: Mapped[int] = mapped_column(primary_key=True)
    f_name: Mapped[str] = mapped_column(String(250), nullable=False)
    l_name: Mapped[str] = mapped_column(String(250), nullable=False)
    email: Mapped[str] = mapped_column(String(250), nullable=False, unique=True)
    country_code: Mapped[str] = mapped_column(String(10), nullable=False)
    phone: Mapped[str] = mapped_column(String(250), nullable=False, unique=True)
    message: Mapped[str] = mapped_column(String(250), nullable=False)

    def __repr__(self):
        return f'<Inquirer {self.email}>'

# Model for Authentication Database
class AuthUser(db.Model):
    """Table for auth"""
    __bind_key__ = 'auth'  # Connects to auth.db
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(250), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(250), nullable=False)

    def __repr__(self):
        return f'<AuthUser {self.email}>'

# Initialize Database with Multiple Binds
def init_db(app):
    """ Initialize the databases """
    db.init_app(app)
    with app.app_context():
        db.create_all()  # Creates tables in both DBs based on bind keys

# Common CRUD Operations
def create_record(new_record: T) -> None:
    """ Adds a new record to the database """
    with db.session.begin():
        db.session.add(new_record)

def read_all_records(model: Type[T]) -> List[T]:
    """ Reads all records from the specified model """
    with db.session.begin():
        result = db.session.execute(db.select(model))
        return result.scalars().all()

def read_a_record(model: Type[T], record_id: int) -> Optional[T]:
    """ Fetches a single record by ID """
    with db.session.begin():
        return db.session.execute(
            db.select(model).where(model.id == record_id)
        ).scalar()

def delete_a_record(model: Type[T], record_id: int) -> None:
    """ Deletes a record from the specified model """
    with db.session.begin():
        record_to_delete = db.session.execute(
            db.select(model).where(model.id == record_id)
        ).scalar()
        if record_to_delete:
            db.session.delete(record_to_delete)
            db.session.commit()

def update_a_record(model: Type[T], record_id: int, **kwargs) -> None:
    """ Updates a record's fields dynamically """
    with db.session.begin():
        record_to_update = db.session.execute(
            db.select(model).where(model.id == record_id)
        ).scalar()
        if record_to_update:
            for key, value in kwargs.items():
                setattr(record_to_update, key, value)
            db.session.commit()
