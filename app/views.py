#!/usr/bin/python
# -*- coding: utf-8 -*-
# example/views.py

import datetime
from bson import ObjectId
from django.template import loader
from django.http import HttpResponse
from django.shortcuts import redirect

from app.utils import data_collection, session_collection


def show_view(request):
    """
    Renders the default view with data for the current user.

    Arguments:
        request: The Django request object.

    Returns:
        HttpResponse with the rendered template.
    """

    data = []
    events = []
    flag = False
    if request.session.get('session'):

        # Get the user from the database

        user = \
            session_collection.find_one({'_id': ObjectId(request.session.get('session'
                ))})
        if user:
            flag = True

            # Get all the events for the user

            events = user.get('events')
            if events:

                # Get last 4 rows of data for the events

                data = \
                    data_collection.find_one({'_id': ObjectId(request.session.get('session'
                        ))}, {'data': {'$slice': -5}})
                data = data.get('data', [])
    if not flag:

        # Create a new user in the database

        new_user = session_collection.insert_one({'events': [],
                'created_at': datetime.datetime.now(),
                'delete_at': datetime.datetime.now()
                + datetime.timedelta(days=1)})

        # Create new data space for the user

        data_collection.insert_one({'_id': new_user.inserted_id,
                                   'data': []})

        # Set the user in the session

        request.session['session'] = str(new_user.inserted_id)
    dt = datetime.datetime.now().strftime('%Y-%m-%d')
    return HttpResponse(loader.get_template('default.html').render({
        'dt': dt,
        'events': events,
        'data': data,
        'session': request.session.get('session'),
        }))


def session(request, session):
    """
    Sets the session and displays the view for the provided session ID.

    Arguments:
        request: The Django request object.
        session: The session ID.

    Returns:
        HttpResponse with the rendered template for the provided session ID or a 404 page if the session does not exist.
    """

    try:
        ObjectId(session)
    except:
        return HttpResponse(loader.get_template('404.html').render())
    user = session_collection.find_one({'_id': ObjectId(session)})
    if user:
        request.session['session'] = session
        return show_view(request)
    else:
        return HttpResponse(loader.get_template('404.html').render())


def index(request):
    """
    Renders the default view for the index page.

    Arguments:
        request: The Django request object.

    Returns:
        HttpResponse with the rendered template.
    """

    return show_view(request)


def new(request):
    """
    Clears the session and redirects to the home page. 
    This means index will create a new session.

    Arguments:
        request: The Django request object.

    Returns:
        HttpResponse with the redirection to the home page.
    """

    # Remove session

    request.session.flush()

    # Redirect to home

    return redirect('/')


def handler404(request, *args, **kwargs):
    """
    Handles the 404 page not found error.

    Arguments:
        request: The Django request object.

    Returns:
        HttpResponse with the rendered 404 page.
    """

    return HttpResponse(loader.get_template('404.html').render(),
                        status=404)
