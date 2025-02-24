"""
AppName:Server
purpose: will act as a server for the portfolio website
"""
# Dependencies
from flask import Flask, render_template,request,send_from_directory,url_for
from flask_bootstrap import Bootstrap5
from werkzeug.utils import redirect

# Internal Modules
from tools.wt_forms import PingMeForm, RegisterForm, LoginForm
from tools.data_model import *

# Global Declarations/Configurations
app = Flask(__name__)
app.config['SECRET_KEY'] = '8BYkEfBA6O6donzWlSihBXox7C0sKR6b'
app.secret_key = "any-string-you-want-just-keep-it-secret"

Bootstrap5(app)

init_db(app)

# Methods------------------------------
@app.route('/')
def home() -> str:
    """
    Takes user to Homepage of the Server website
    """
    ping_form = PingMeForm()
    return render_template('index.html', form=ping_form)


@app.route("/ping", methods=['GET', 'POST'])
def ping():
    """Q & A form"""
    form = PingMeForm()
    if form.validate_on_submit():
        data = request.form
        print(data["name"])
        print(data["email"])
        print(data["phone"])
        print(data["message"])
        inquirers = read_all_records()
        return redirect(url_for('inquires'))
    return redirect(url_for('home'))

@app.route('/download')
def download():
    return send_from_directory('static', path="assets/files/under-construction-sign.pdf")

@app.route('/portal')
def portal():
    return render_template('Pages/portal.html')

@app.route('/login')
def login():
    login_form = LoginForm()
    return render_template('Pages/login.html',form = login_form)

@app.route('/register')
def register():
    register_form = RegisterForm()
    return render_template('Pages/login.html', form = register_form)

# ------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
