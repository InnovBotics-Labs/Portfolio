"""
AppName:Server
purpose: will act as a server for the portfolio website
"""
# Dependencies
from flask import Flask, render_template
from flask_bootstrap import Bootstrap5

# Internal Modules

app = Flask(__name__)
app.config['SECRET_KEY'] = '8BYkEfBA6O6donzWlSihBXox7C0sKR6b'

Bootstrap5(app)

# Methods------------------------------
@app.route('/')
def home() -> str:
    """
    Takes user to Homepage of the Server website
    """
    return render_template('index.html')


# ------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
