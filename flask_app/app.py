from flask import Flask, render_template
import os
from dotenv import load_dotenv


app = Flask(__name__)
PORT = os.getenv('PORT')
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=PORT)
