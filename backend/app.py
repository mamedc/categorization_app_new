# TODO: update this file for deployment
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///transactions_db.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False

db = SQLAlchemy(app)

import routes

# Create database
with app.app_context():
    # print("Dropping existing tables (if any) and creating new ones...")
    # db.drop_all() # Use with caution in production!
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)