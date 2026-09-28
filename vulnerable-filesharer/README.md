# Sherry Filesharer
Sherry is a filesharing cloud storage platform that allows it's users to easily upload, share and manage files. Files can be organized with tags or into folders. An advanced search allows the user to quickly search their files, files shared with them, and public files by several conditions.

## Building and Running
Sherry requires python and node to run.

### backend
In the backend folder, create a python venv using

> python -m venv [env name]

Now, using your venv, install requirements.txt

> pip install -r requirements.txt

When this is done, run the app using the venv

> python manage.py runserver

### frontend
In the frontend folder, install the needed packages.

> npm i

When this is done, run the frontend with npm

> npm start

Alternitivly, build the frontend using  

> npm run build

Then, serve the app with

> npm install -g serve
> serve -s build

When both the frontend and backend are running, the app is good to use!

## Usage
