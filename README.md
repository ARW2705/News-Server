# News Proxy Server

---

Back end server and database for [News App](https://github.com/ARW2705/News-App).

*Work in progress in conjunction with [News-App](). Updates will only be performed if News App project is updated*


## Getting Started

---

### Prerequisites

To clone and run this application, you'll need [Git](https://git-scm.com/), [Node.js](https://nodejs.org/en/), and [MongoDB](https://www.mongodb.com/)

The following environment variables are required:
* **NEWS_API_KEY** - [NewsAPI](https://newsapi.org/) key
* **RESET_TOKEN_KEY** - key to generate json web token
* **MONGO_URL** - contains mongoose connection url with credentials (eg. "mongodb://dbuser:dbpass@localhost:27017/dbname")
* **TOKEN_KEY** - a secret string to generate json web tokens

SSL certification [imports](https://github.com/ARW2705/News-Server/blob/master/bin/www) must also be updated to match your installation

### Installation

Clone this repository
`$ git clone `

Change to project directory
`$ cd NewsServer`

Install Dependencies
`$ npm install`

Start server
`$ npm run start`


## Built With

---

* [NPM](https://www.npmjs.com/) - Dependency management
* [Express.js](https://expressjs.com/) - Server framework
* [Passort.js](http://www.passportjs.org/) - Authentication framework
* [Mongoose](https://mongoosejs.com/) - ODM
* [MongoDB](https://www.mongodb.com/) - Database


## Future Plans

---

### Improvements
* Finish password reset via email
* Add tests
* Add documentation


## License

---

This project is licensed under the MIT License - see the [LICENSE](https://github.com/ARW2705/News-Server/blob/master/LICENSE) file for details.
