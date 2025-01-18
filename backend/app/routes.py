from app import app

@app.route('/api/hello', methods=['GET'])
def hello_world():
    return {"message": "Hello from Flask!"}
