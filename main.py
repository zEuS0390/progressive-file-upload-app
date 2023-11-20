from flask import Flask, render_template, request, make_response,jsonify
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/upload", methods=["POST"])
def upload():
    filename = request.form.get('file-name')
    chunk = request.files.get("chunk")

    with open(os.path.join("files", filename), "ab") as file:
        file.write(chunk.read())

    return make_response(jsonify(), 200)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=1234, debug=True)
