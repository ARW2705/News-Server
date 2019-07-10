# News Proxy Server

**Work in progress**

This Express.js server acts as a proxy server for NewsAPI to keep the api key separate from the [News App](https://github.com/ARW2705/News-App). The server also provides user functionality with MongoDB database

## Usage

Install modules with `npm install`.
Update encryption keys in bin/www.
Environment running server must contain variables for:
* `PORT`
* `NEWS_API_KEY`
* `EMAIL_USER`
* `EMAIL_PASS`
* `PASSWORD_RESET_URL`
* `MONGO_URL`

## TODO

* Finish password reset via email
* Add tests
* Add documentation

## Author

Andrew Wanex

## License
[MIT](https://github.com/ARW2705/News-Server/blob/master/LICENSE)
