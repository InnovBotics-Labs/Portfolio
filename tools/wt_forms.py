""" Contains the class for Forms """

# Dependencies
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, TextAreaField
from wtforms.fields.simple import PasswordField
from wtforms.validators import DataRequired, Regexp,Email

# Class for the FORM in the website.
class User(FlaskForm):
    """ Base class form contains only Email"""
    email = StringField('Email', validators=[DataRequired(),Email()])

class UserInfo(User):
    """ Contains list of entry variables"""
    f_name = StringField('First Name', validators=[DataRequired()])
    l_name = StringField('Last Name', validators=[DataRequired()])

class PingMeForm(UserInfo):
    """Contains parameters that need few more forms"""
    country_code = StringField('Country Code',
                               validators=[DataRequired()],
                               render_kw={"placeholder": "e.g., +1"})
    phone = StringField('Phone', validators=[
        DataRequired(),
        Regexp(r'^\d{10}$', message="Phone number must be exactly 10 digits")
    ], render_kw={"placeholder": "1234567890"})
    message = TextAreaField('Message', validators=[DataRequired()], render_kw={"rows": 5})
    submit = SubmitField(label="📨 Send")

class RegisterForm(UserInfo):
    """ Contains the elements of Registration form"""
    password = PasswordField("Password",validators=[DataRequired()])
    register = SubmitField(label="Register")

class LoginForm(User):
    """ Contains the elements of Registration form"""
    password = PasswordField("Password", validators=[DataRequired()])
    login = SubmitField(label="Login")
