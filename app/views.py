# example/views.py
import datetime
from bson import ObjectId
from django.template import loader
from django.http import HttpResponse


import secrets
from app.utils import data_collection, user_collection


def index(request):
    data = []
    events = []
    flag = False
    if request.session.get('user'):
        # Get the user from the database
        user = user_collection.find_one({"_id": ObjectId(request.session.get('user'))})
        if user:
            flag = True
            # Get all the events for the user
            events = user.get('events')
            if events:
                # Get last 4 rows of data for the events
                data = (data_collection.find({"_id": ObjectId(request.session.get('user'))}).sort([
                    ("date", -1)]).limit(5))[0].get('data')
    if not flag:
        # Create a new user in the database
        new_user = user_collection.insert_one({"events": []})

        # Create new data space for the user
        data_collection.insert_one({"_id": new_user.inserted_id, "data": []})

        # Set the user in the session
        request.session['user'] = str(new_user.inserted_id)
    print(data)
    dt = datetime.datetime.now().strftime("%Y-%m-%d")
    return HttpResponse(loader.get_template('default.html').render({"user": False, "dt": dt, "events": events, "data": data}))
