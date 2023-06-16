# Purrfect Aid API Testing Guide

Welcome to the Purrfect Aid API Testing Guide. This guide will help you understand how to test the API endpoints and perform various operations.

## Prerequisites

Before you begin, make sure you have the following prerequisites installed:

- Node.js
- MySQL
- Postman

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/purrfect-aid-api.git
   ```
2. Install dependencies:
   ```
   cd purrfect-aid-api
   npm install
   ```
3. Configure the environment variables:
    - Create a .env file in the root directory.
    - Configure the env using the `example.env` file and rename it into `.env`
4. Start the server:
    ```
    npm start
    ```
7. The API server should now be running at http://localhost:3000

# API Endpoints
|        **Endpoint**        | **HTTP Method** |              **Description**              | **Need Bearer Token?** |                              **Request Body (if any)**                             |
|:--------------------------:|:---------------:|:-----------------------------------------:|:----------------------:|:----------------------------------------------------------------------------------:|
| `/users`                   |       GET       | Retrieve users' info                      |           Yes          |                                                                                    |
| `/users/google`            |       GET       | Sign in or sign up using Google Auth      |           No           |                                                                                    |
| `/users/signin`            |       POST      | Sign in using native method               |           No           | ```{"email":"test@example.com","password":"testpassword"}```                       |
| `/users/signup`            |       POST      | Sign up or register using native method   |           No           | ```{"email":"test@example.com","username":"testuser","password":"testpassword"}``` |
| `/communities`             |       GET       | Retrieve all communities' posts           |           Yes          |                                                                                    |
| `/communities/:id`         |       GET       | Retrieve a community by ID.               |           Yes          |                                                                                    |
| `/communities`             |       POST      | Create a new community post.              |           Yes          | ```{"content":"Test Content"}```                                                   |
| `/communities/:id/comment` |       POST      | Post a comment on communities post        |           Yes          | ```{"comment":"Test Comment"}```                                                   |
| `/communities/:id/like`    |       POST      | Like communities post.                    |           Yes          | (None)                                                                             |
| `/predict`                 |       GET       | Retrieve prediction history               |           Yes          |                                                                                    |
| `/predict`                 |       POST      | Send an image for diagnosing skin disease |           Yes          | form-data:<br> key: `image` (File type)<br> value: `picture.png` (Upload the file) |
| `/predict/:id`             |       GET       | Retrieve a prediction by ID               |           YES          |                                                                                    |



