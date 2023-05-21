

import datetime
from bson import ObjectId
from django.http import JsonResponse
from app.utils import data_collection, session_collection


def create_event(request, event):
    try:
        # check if there is an event with the same name
        if session_collection.find_one({"_id": ObjectId(request.session.get('session')), "events": event}):
            return JsonResponse({"status": "error", "message": "Event already exists"}, status=400)
        # add the event to the user
        session_collection.update_one({"_id": ObjectId(request.session.get('session'))}, {
            "$push": {"events": event}})
        return JsonResponse({"status": "success", "message": "Event added successfully"}, status=200)
    except:
        return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)
