import os
from pymongo import MongoClient

# Define database connection parameters

DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_NAME = os.environ.get('DB_NAME')
DB_CLUSTER = os.environ.get('DB_CLUSTER')

# Connect to the database

connection_string = f"mongodb+srv://{DB_USER}:{DB_PASSWORD}@{DB_CLUSTER}/{DB_NAME}?retryWrites=true&w=majority"
client = MongoClient(connection_string)

# Get database and collections

db = client[DB_NAME]
data_collection = db['data']
session_collection = db['session']
