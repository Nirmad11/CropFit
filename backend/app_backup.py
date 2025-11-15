from flask import Flask

# Create Flask app
app = Flask(__name__)

@app.route('/')
def home():
    return "🌾 CropFit Backend is running successfully!"

if __name__ == '__main__':
    app.run(debug=True)
