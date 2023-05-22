from datetime import datetime
from bson import ObjectId
from django.http import JsonResponse
from app.utils import data_collection, session_collection


def create_event(request, event):
    """
    Creates an event in the user collection.

    Arguments:
        request: The Django request object.
        event: The name of the event to be created.

    Returns:
        JsonResponse with the status and message indicating the success or
        failure of the request.
    """

    try:

        # Don't allow the event name "all"

        if event == 'all':
            return JsonResponse({'status': 'error',
                                'message': 'Event name not allowed'},
                                status=400)

        # Check if there is an event with the same name

        if session_collection.find_one({'_id': ObjectId(request.session.get('session'
                )), 'events': event}):

            # If there is, return an error

            return JsonResponse({'status': 'error',
                                'message': 'Event already exists'},
                                status=400)

        # Add the event to the user

        session_collection.update_one({'_id': ObjectId(request.session.get('session'
                ))}, {'$push': {'events': event}})

        return JsonResponse({'status': 'success',
                            'message': 'Event added successfully'},
                            status=200)
    except:

        # If the request fails, return an error

        return JsonResponse({'status': 'error',
                            'message': 'Request failed'}, status=500)


def remove_event(request, event):
    """
    Removes an event from the user collection.

    Arguments:
    request -- The Django request object.
    event -- The name of the event to be removed.

    Returns:
    JsonResponse with the status and message 
    indicating the success or failure of the request.
    """

    try:

        # Check if there is an event with the same name

        if not session_collection.find_one({'_id': ObjectId(request.session.get('session'
                )), 'events': event}):

            # If there is, return an error

            return JsonResponse({'status': 'error',
                                'message': 'Event does not exist'},
                                status=400)

        # Remove the event from the user

        session_collection.update_one({'_id': ObjectId(request.session.get('session'
                ))}, {'$pull': {'events': event}})

        # Remove all event registrations from the data

        data_collection.delete_many({'_id': request.session.get('session'
                                    ),
                                    'data': {'$elemMatch': {'event': event}}})

        return JsonResponse({'status': 'success',
                            'message': 'Event removed successfully'},
                            status=200)
    except:

        # If the request fails, return an error

        return JsonResponse({'status': 'error',
                            'message': 'Request failed'}, status=500)


def edit_event(request, event, new):
    """
    Edits an existing event in the user collection.

    Arguments:
        request: The Django request object.
        event: The name of the event to be edited.
        new: The new name of the event.

    Returns:
        JsonResponse with the status and message 
        indicating the success or failure of the request.
    """

    try:

        # Check if there is an event with the same name

        if not session_collection.find_one({'_id': ObjectId(request.session.get('session'
                )), 'events': event}):

            # If there is, return an error

            return JsonResponse({'status': 'error',
                                'message': 'Event does not exist'},
                                status=400)

        # Modify the event name in the user collection

        session_collection.update_one({'_id': ObjectId(request.session.get('session'
                ))}, {'$pull': {'events': event}})
        session_collection.update_one({'_id': ObjectId(request.session.get('session'
                ))}, {'$push': {'events': new}})

        # Modify the event name in the data collection

        data_collection.update_many({'_id': request.session.get('session'
                                    ),
                                    'data': {'$elemMatch': {'event': event}}},
                                    {'$set': {'data.$.event': new}})

        return JsonResponse({'status': 'success',
                            'message': 'Event modified successfully'},
                            status=200)
    except:

        # If the request fails, return an error

        return JsonResponse({'status': 'error',
                            'message': 'Request failed'}, status=500)


def log_event(request, event):
    """
    Logs an event in the data collection.

    Arguments:
        request: The Django request object.
        event: The name of the event to be logged.

    Returns:
        JsonResponse with the status, message, and
        date indicating the success or failure of the request.
    """

    try:
        session_id = request.session.get('session')

        # Check if there is an event with the same name

        if not session_collection.find_one({'_id': ObjectId(session_id),
                'events': event}):
            return JsonResponse({'status': 'error',
                                'message': 'Event does not exist'},
                                status=400)

        date = datetime.now()

        # Add event log to data collection

        data_collection.update_one({'_id': ObjectId(session_id)},
                                   {'$push': {'data': {'event': event,
                                   'date': date}}})

        return JsonResponse({'status': 'success',
                            'message': 'Event logged successfully',
                            'date': date.strftime('%d/%m/%Y - %H:%M:%S'
                            )}, status=200)
    except:

        # If the request fails, return an error

        return JsonResponse({'status': 'error',
                            'message': 'Request failed'}, status=500)
