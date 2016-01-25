GSO Arrangements
==============

A web service to store data about musical arrangements.


--------------
* [About](#about)
* [Installing](#installing)
* [Running](#running)

# About

This project is a web app to manage a database of musical arrangements. This project will include the following:

* RESTful API for interacting with the database
* front-end that allows for user interaction with the database
 
# Installing

After you've gotten the project, you need to make sure you have PostgreSQL set up.
You'll also need to change your package.json to replace 'db_user' and 'db_password' with the user and password you will be using.

Run ```npm install``` and follow the prompts, which will set up your database and local modules.

# Running

Run ```node app.js``` to start the server, which defaults to http://localhost:3000.

You can also use ```node run supervisor``` if you want to have it run supervisor to watch for changes as you develop.