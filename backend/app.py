# File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\backend\app.py
# TODO: update this file for deployment
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///transactions_db.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False
app.config['DEBUG'] = True
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads/documents')


db = SQLAlchemy(app)

import routes

# Create database and upload folder
with app.app_context():
    # print("Dropping existing tables (if any) and creating new ones...")
    # db.drop_all() # Use with caution in production!
    db.create_all()
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


if __name__ == '__main__':
    app.run(debug=True)