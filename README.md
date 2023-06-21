This is a web application I have created which I have named Friends' App. It is a full-fledged application, and I wrote the complete frontend and the backend from scratch. The tech stack used are React Framework using JS in the Frontend and Express Framework in the backend. I used MongoDB for data persistence.

Let's talk about the features.

Backend (Server Side)

There are many endpoints of GET, POST, and DELETE for the querying of the friends' data. I have added both authentication and authorization. The user can sign up and then log in to access the functionalities. The username and passowrd has to be validated and no username can be same. The password is encrypted before storing to the DB for security.

The authorization is done with the help of JWT tokens using access and refresh tokens whenever the timeout takes place. The refresh token lasts for 10 minutes, and the access token I have given for 1 minute (to check its working) after which a new access token is to be generated.

Also, I used an external API to obtain the distance between two cities based on the geoLocation. The user provides the city name, and then based on the latitude and longitude, the distance is calculated. For obtaining the geoLocation of the city, I have used a free external API.

Frontend (Client Side)

Using the frontend, the user can use the web app and the functionalities include:

Adding Friends
Checking Added Friends
Pending Requests
Sent Requests
Removing Friends
Nearby Friends
All of these pages of Friends functionalities and also Login and SignUp and accessed using React Router

All the data is fetched using Reach Query, which makes it very easy to handle the data asynchronously. Upon the expiry of the refresh token, A popup pops up, at which point the user can either increase the timer by generating a new access token or has to log out.

I have also written custom hooks such as useForm and some other functions like RefreshToken for code modularity and reusability. New features can be easily added without any modification to the present codebase.
