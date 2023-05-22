from bson import ObjectId
from django.http import HttpResponse
from app.utils import data_collection
from django.shortcuts import redirect
from datetime import datetime


def export_data(request):
    if request.method == 'POST':
        if not request.session.get('session'):
            return redirect('/')

        # Access the form data
        start_date_str = request.POST.get('st_dt')
        end_date_str = request.POST.get('end_dt')
        event = request.POST.get('event')

        # Convert the start date and end date strings to datetime objects
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d") \
            .replace(hour=0, minute=0, second=0)
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d") \
            .replace(hour=23, minute=59, second=59)

        # Build the query to filter the data based on the provided criteria
        if event == "all":
            query = {
                "_id": ObjectId(request.session.get('session')),
                "data": {
                    '$elemMatch': {
                        "date": {"$gte": start_date, "$lte": end_date}
                    }
                }
            }
        else:
            query = {
                "_id": ObjectId(request.session.get('session')),
                "data": {
                    '$elemMatch': {
                        "event": event,
                        "date": {"$gte": start_date, "$lte": end_date}
                    }
                }
            }
        print(query)
        data = data_collection.find_one(query)

        if data:
            data = data.get('data', [])
        else:
            data = []
        # Create a CSV string from the data
        csv = "Date,Time,Event\n"
        for row in data:
            date_str = row['date'].strftime('%d/%m/%Y')
            time_str = row['date'].strftime('%H:%M:%S')
            csv += f"{date_str},{time_str},{row['event']}\n"
        # Download the CSV file
        response = HttpResponse(csv, content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="export.csv"'
        return response
    else:
        return redirect('/')
