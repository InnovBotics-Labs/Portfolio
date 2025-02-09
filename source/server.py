"""
AppName:Server
purpose: will act as a server for the portfolio website
"""
# Dependencies
from flask import Flask, render_template
from flask_bootstrap import Bootstrap5
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired

class MyForm(FlaskForm):
    f_name = StringField('First Name', validators=[DataRequired()])
    l_name = StringField('Last Name', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired()])
    message = StringField('Message', validators=[DataRequired()])
    submit = SubmitField(label="send")

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


@app.route("/ping")
def ping():
    """Q & A form"""
    ping_form = MyForm()
    return render_template('contact.html', form=ping_form)

# ------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
