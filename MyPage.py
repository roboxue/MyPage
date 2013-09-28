__author__ = 'roboxue'
from flask import Flask, render_template

app = Flask(__name__)
app.debug = True


@app.route('/resume')
def resume():
    return render_template('resume.html')


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/works/')
def works():
    return render_template('about.html')


if __name__ == "__main__":
    port = 8000
    app.debug = True
    app.run(port=port)