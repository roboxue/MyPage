__author__ = 'roboxue'
import json
import sys
import os

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


@app.route('/friends')
def friends():
    mongo = open(os.path.split(os.path.abspath(sys.argv[0]))[0] + "/mongo", 'r').read()
    collection = MongoClient(mongo).app17383606
    acts = list(collection.friend.find({},
        {"season": 1, "episode": 1, "title": 1, "act": 1, "scene": 1, "actualCharacters": 1, "_id": 0}))
    return render_template('friends/friends_chord.html', acts=json.dumps(acts))


@app.route('/travel/')
def travel():
    return render_template('travel.html')


@app.route('/text-analytics-visualization')
def text():
    return render_template('text-visualization.html')


@app.route('/work/')
def work():
    mongo = open(os.path.split(os.path.abspath(sys.argv[0]))[0] + "/mongo", 'r').read()
    collection = MongoClient(mongo).app17383606
    northwestern = list(collection.northwestern.find({}, {"_id": 0}).sort("order", -1))
    fudan = list(collection.fudan.find({}, {"_id": 0}).sort("order", -1))
    miscellaneous = list(collection.miscellaneous.find({}, {"_id": 0}).sort("order", -1))
    return render_template('about.html',
                           data=json.dumps(
                               {"northwestern": northwestern, "fudan": fudan, "miscellaneous": miscellaneous}))


if __name__ == "__main__":
    port = 8000
    app.debug = True
    app.run(port=port)
