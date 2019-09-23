## Summary
This is a simple demo of how one might write a server leveraging authentication using JSON Web Tokens. It includes a simple server and a mongodb database, which are spun up together using docker-compose.

## Features
 - user signup and login  
 - user passwords are not saved in the database  
 - authentication using JSON Web Tokens  
 - example of how to implement granular permissions with user "scopes"  

## Build & Run
 - Install docker & docker-compose
 - `git clone https://github.com/willzjacobson/jwt-demo.git`  
 - `cd jwt-demo/server`
 - `npm i` (necessary to install node_modules locally because we are connecting the code to the container via a data volume)  
 - `docker-compose build`  
 - `docker-compose up -d`  
 - Confirm server and database containers are running: `docker-compose ps` (should see 2 containers)  
 - Tail server logs: `docker logs server -f`  

Since the server is running with `nodemon`, you can edit the source code and the container will restart with your updates when you save the file.  

## Clean up
 - `docker-compose down`  

## Use

### Signup
`POST /auth/signup`  
Creates user in mongodb, responds with new user object
request body:
```
{
  "username": string,
  "password": string,
}
```

### Signin
`POST /auth/signin`  
Responds with valid JWT for user
request body:
```
{
  "username": string,
  "password": string,
}
```

### View Users
`GET /user`  
Responds with array of all users in mongodb  
NOTE: This would be a highly protected route in real app. It's included here to ease debugging.  

### GET Resource
`GET /protected-resource`  
Responds with "protected information" that only logged in users with the scope 'read:resource' should have access to.  
To successfully hit this route, you must first fetch a token using `auth/signin`, and include it in the `Authorization` request header as shown here.  

request headers:
```
{
  "Authorization": "Bearer <jwt_token>",
}
```

### POST Resource
`POST /protected-resource`  
This route would update the "protected information." Only logged in users with the scope 'write:resource' have access to this route.  
Even if you include a JWT token in the header correctly, you will not be able to hit this route unless you include 'write:resource' in the scope when creating the user with the `/auth/signup` route.  

request headers:
```
{
  "Authorization": "Bearer <jwt_token>",
}
```
