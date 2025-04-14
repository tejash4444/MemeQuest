from app import create_app  # this 'app' refers to the folder named 'app/'

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
