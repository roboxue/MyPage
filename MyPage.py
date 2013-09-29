__author__ = 'roboxue'
import json
from pymongo import MongoClient

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


@app.route('/data/')
def data():
    mongo=open("mongo",'r').read()
    collection = MongoClient(mongo).app17383606
    northwestern = list(collection.northwestern.find({},{"_id":0}).sort("order",-1))
    fudan = list(collection.fudan.find({},{"_id":0}).sort("order",-1))
    return json.dumps({"northwestern": northwestern, "fudan": fudan})


if __name__ == "__main__":
    # port = 8000
    # app.debug = True
    # app.run(port=port)
    print data()