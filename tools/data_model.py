"""Create and contain database related class"""
# Dependencies
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, ScalarResult, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# Class for the Models
class Base(DeclarativeBase):
    """ Base class
    """
db = SQLAlchemy(model_class=Base)

class Inquirer(db.Model):
    """Creates a User table"""
    id: Mapped[int] = mapped_column(primary_key=True)
    f_name: Mapped[str] = mapped_column(String(250),  nullable=False)
    l_name: Mapped[str] = mapped_column(String(250), nullable=False)
    email: Mapped[str] = mapped_column(String(250), nullable=False,unique=True)
    country_code: Mapped[int] = mapped_column(String(250), nullable=False)
    phone: Mapped[int] = mapped_column(Integer, nullable=False,unique=True)
    message: Mapped[str] = mapped_column(String(250), nullable=False)

    def __repr__(self):
        return f'<Inquirer {self.email}>'

def init_db(app):
    """ Initialize the database """
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///Inquirer.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    with app.app_context():
        db.create_all()

def create_new_record(new_inquire: Inquirer) -> None:
    """ Adds a new book to the database """
    with db.session.begin():
        db.session.add(new_inquire)

def read_all_records() -> list[Inquirer]:
    """ Reads all books from the database """
    with db.session.begin():
        result = db.session.execute(db.select(Inquirer).order_by(Inquirer.f_name))
        return result.scalars().all()

def read_a_record(inquirer_id: int) -> Inquirer | None:
    """ Fetches a single book by ID """
    with db.session.begin():
        return db.session.execute(db.select(Inquirer).where(Inquirer.id == inquirer_id)).scalar()

def delete_a_record(inquirer_id: int) -> None:
    """ Deletes a book from the database """
    with db.session.begin():
        book_to_delete = db.session.execute(db.select(Inquirer).where(Inquirer.id == inquirer_id)).scalar()
        if book_to_delete:
            db.session.delete(book_to_delete)

def update_a_record(inquirer: Inquirer) -> None:
    """ Updates a book's review in the database """
    with db.session.begin():
        book_to_update = db.session.execute(db.select(Inquirer).where(Inquirer.id == inquirer.id)).scalar()
        if book_to_update:
            book_to_update.review = Inquirer.message