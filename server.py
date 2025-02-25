"""
AppName:Server
purpose: will act as a server for the portfolio website
"""
# Dependencies
from flask import Flask, render_template,request,send_from_directory,url_for
from flask_bootstrap import Bootstrap5
from werkzeug.utils import redirect
from config import Config  # Import Config class

# Internal Modules
from tools.wt_forms import PingMeForm, RegisterForm, LoginForm
from tools.data_model import read_all_records, create_record, init_db,Inquirer


# Global Declarations/Configurations
app = Flask(__name__)
app.config.from_object(Config)  # Load configuration

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
    if form.validate_on_submit() and request.method == 'POST':
        data = request.form
        # Create an instance of the Inquirer model
        new_inquirer = Inquirer(
            f_name=data["f_name"],
            l_name=data["l_name"],
            email=data["email"],
            country_code=data["country_code"],
            phone=int(data["phone"]),  # Ensure phone is stored as an integer
            message=data["message"]
        )
        create_record(new_inquirer)
        return redirect(url_for('inquirer'))
    return redirect(url_for('home'))

@app.route('/inquirer')
def inquirer():
    """Downloads the resumes"""
    inquirers = read_all_records(Inquirer)
    return render_template('Pages/inquirer.html', inquirers=inquirers)

@app.route('/download')
def download():
    """Downloads the resumes"""
    return send_from_directory('static', path="assets/files/under-construction-sign.pdf")

@app.route('/portal')
def portal():
    """Takes you to portal page"""
    return render_template('Pages/portal.html')

@app.route('/login')
def login():
    """Takes you to login page"""
    login_form = LoginForm()
    return render_template('Pages/login.html',form = login_form)

@app.route('/register')
def register():
    """ Takes you to registration """
    register_form = RegisterForm()
    return render_template('Pages/login.html', form = register_form)

# ------------------------------------------
if __name__ == "__main__":
    app.run(debug=app.config["DEBUG"])
