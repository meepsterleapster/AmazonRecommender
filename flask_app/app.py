from flask import Flask, render_template, send_from_directory, request, jsonify, g
import pandas as pd
import sqlite3, os

DATABASE = '../data/amazon.db'

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/static/<path:path>')
def send_report(path):
    return send_from_directory('static', path)


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)

    def make_dicts(cursor, row):
        return dict((cursor.description[idx][0], value)
                    for idx, value in enumerate(row))

    db.row_factory = make_dicts
    # db.row_factory = sqlite3.Row
    return db


def query_db(query, args=(), action='get'):
    db = get_db()
    conn = db.execute(query, args)
    response = conn.fetchall()
    if action.lower() in ('post'):
        db.commit()
    conn.close()
    return response


user_df = pd.DataFrame(columns=[
    "firstname",
    "lastname",
    "goal",
    "age",
    "experience",
    "style",
    "time_commitment"
])


@app.route('/api/v1/submit_form', methods=['POST'])
def submit_form():
    response = request.json
    print("Received form data:", response)

    try:
        global user_df
        
        new_row = pd.DataFrame([response])
        user_df = pd.concat([user_df, new_row], ignore_index=True)

        print("\nCurrent DataFrame:")
        print(user_df)

    except Exception as e:
        print("Error:", e)
        return {
            "status": "failure",
            "status_code": 500,
            "message": "Failed to store data in DataFrame",
            "error": str(e)
        }

    return {
        'status': 'success',
        'status_code': 200,
        'message': 'Form data stored in DataFrame'
    }


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


if __name__ == '__main__':
    app.run(debug=True)
