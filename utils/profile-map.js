'use strict';

module.exports = (user, body) => {
  // copy properties from body to user
  if (body.username) {
    user.username = body.username;
  }
  if (body.firstname) {
    user.firstname = body.firstname;
  }
  if (body.lastname) {
    user.lastname = body.lastname;
  }
  if (body.language) {
    user.language = body.language;
  }
  if (body.country) {
    user.country = body.country;
  }
  if (body.preferredSources) {
    user.preferredSources = body.preferredSources;
  }
};
