from datetime import datetime
from bson import ObjectId
from django.http import JsonResponse
from app.utils import data_collection, session_collection


def create_event(request, event):
    try:
        if event == "all":
            return JsonResponse({"status": "error", "message": "Event name not allowed"}, status=400)
        # check if there is an event with the same name
        if session_collection.find_one({"_id": ObjectId(request.session.get('session')), "events": event}):
            return JsonResponse({"status": "error", "message": "Event already exists"}, status=400)
        # add the event to the user
        session_collection.update_one({"_id": ObjectId(request.session.get('session'))}, {
            "$push": {"events": event}})
        return JsonResponse({"status": "success", "message": "Event added successfully"}, status=200)
    except:
        return JsonResponse({"status": "error", "message": "Request failed"}, status=500)


def remove_event(request, event):
    try:
        # check if there is an event with the same name
        if not session_collection.find_one({"_id": ObjectId(request.session.get('session')), "events": event}):
            return JsonResponse({"status": "error", "message": "Event already exists"}, status=400)

        # remove the event from the user
        session_collection.update_one({"_id": ObjectId(request.session.get('session'))}, {
            "$pull": {"events": event}})
        # remove the all event reg from the data
        data_collection.delete_many(
            {"_id": request.session.get('session'), "data": {"$elemMatch": {"event": event}}})
        return JsonResponse({"status": "success", "message": "Event removed successfully"}, status=200)
    except:
        return JsonResponse({"status": "error", "message": "Request failed"}, status=500)


def edit_event(request, event, new):
    try:
        # check if there is an event with the same name
        if not session_collection.find_one({"_id": ObjectId(request.session.get('session')), "events": event}):
            return JsonResponse({"status": "error", "message": "Event already exists"}, status=400)

        # modify the event from the user
        session_collection.update_one({"_id": ObjectId(request.session.get('session'))}, {
            "$pull": {"events": event}})
        session_collection.update_one({"_id": ObjectId(request.session.get('session'))}, {
            "$push": {"events": new}})
        # modify the all event reg from the data
        data_collection.update_many(
            {"_id": request.session.get('session'), "data": {"$elemMatch": {"event": event}}}, {"$set": {"data.$.event": new}})
        return JsonResponse({"status": "success", "message": "Event modified successfully"}, status=200)
    except:
        return JsonResponse({"status": "error", "message": "Request failed"}, status=500)


def log_event(request, event):
    try:
        session_id = request.session.get('session')

        # Check if there is an event with the same name
        if not session_collection.find_one({"_id": ObjectId(session_id), "events": event}):
            return JsonResponse({"status": "error", "message": "Event already exists"}, status=400)

        date = datetime.now()

        # Add event log to data
        data_collection.update_one({"_id": ObjectId(session_id)}, {
            "$push": {"data": {"event": event, "date": date}}})

        return JsonResponse({"status": "success", "message": "Event logged successfully", "date": date.strftime("%d/%m/%Y - %H:%M:%S")}, status=200)
    except:
        return JsonResponse({"status": "error", "message": "Request failed"}, status=500)
