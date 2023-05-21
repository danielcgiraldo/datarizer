# example/views.py
import datetime
from bson import ObjectId
from django.template import loader
from django.http import HttpResponse


from app.utils import data_collection, session_collection


def show_view(request):
    data = []
    events = []
    flag = False
    if request.session.get('session'):
        # Get the user from the database
        user = session_collection.find_one(
            {"_id": ObjectId(request.session.get('session'))})
        if user:
            flag = True
            # Get all the events for the user
            events = user.get('events')
            if events:
                # Get last 4 rows of data for the events
                data = (data_collection.find({"_id": ObjectId(request.session.get('session'))}).sort([
                    ("date", -1)]).limit(5))[0].get('data')
    if not flag:
        # Create a new user in the database
        new_user = session_collection.insert_one({"events": [], "created_at": datetime.datetime.now(
        ), "delete_at": datetime.datetime.now() + datetime.timedelta(days=1)})

        # Create new data space for the user
        data_collection.insert_one({"_id": new_user.inserted_id, "data": []})

        # Set the user in the session
        request.session['session'] = str(new_user.inserted_id)
    print(data)
    dt = datetime.datetime.now().strftime("%Y-%m-%d")
    return HttpResponse(loader.get_template('default.html').render({"dt": dt, "events": events, "data": data, "session": request.session.get('session')}))


def session(request, session):
    request.session['session'] = session
    show_view(request)


def index(request):
    show_view(request)
