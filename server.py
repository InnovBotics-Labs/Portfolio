"""
AppName:Server
purpose: will act as a server for the portfolio website
"""
# Dependencies
from flask import Flask, render_template,request
from flask_bootstrap import Bootstrap5
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, TextAreaField
from wtforms.validators import DataRequired, Regexp, Optional

class MyForm(FlaskForm):
    """ Contains list of entry variables"""
    f_name = StringField('First Name', validators=[DataRequired()])
    l_name = StringField('Last Name', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired()])
    # Optional country code (e.g., +1, +91)
    country_code = StringField('Country Code', validators=[Optional()], render_kw={"placeholder": "e.g., +1"})
    phone = StringField('Phone', validators=[
        DataRequired(),
        Regexp(r'^\d{10}$', message="Phone number must be exactly 10 digits")
    ], render_kw={"placeholder": "1234567890"})
    message = TextAreaField('Message', validators=[DataRequired()], render_kw={"rows": 5})
    submit = SubmitField(label="📨 Send")

# Internal Modules

app = Flask(__name__)
app.config['SECRET_KEY'] = '8BYkEfBA6O6donzWlSihBXox7C0sKR6b'
app.secret_key = "any-string-you-want-just-keep-it-secret"

Bootstrap5(app)

# Methods------------------------------
@app.route('/')
def home() -> str:
    """
    Takes user to Homepage of the Server website
    """
    ping_form = MyForm()
    return render_template('index.html', form=ping_form)


@app.route("/ping", methods=["POST"])
def ping():
    """Q & A form"""
    data = request.form
    print(data["name"])
    print(data["email"])
    print(data["phone"])
    print(data["message"])
    return render_template('send.html')

# ------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
