![This is an image](di-service.svg)
# DI Service
Really simple dependency injection solution for JavaScript

## Features
* Implements DI pattern
* Pure JavaScript implementation (+ TypeScript declaration file) 
* Zero dependencies
* Do not impose any system architecture, may be introduced to any JavaScript project (FE and BE both)

## Example
Declare any class
```javascript
class Settings {
    dbServer = process.ENV.DB_SERVER;
    dbUser = process.ENV.DB_USER;
    dbPassword = process.ENV.DB_PASSWORD; // don't do like this
}

module.exports = { Settings };
```

Use the class as a dependency
```javascript
const { Settings } = require('./settings');
const { SERVICE_REQUIRE } = require('di-service');

class DBConnection {
    
    static [SERVICE_REQUIRE] = [Settings];
    
    constructor(settings) {        
        // settings -> instance of the Settings class
        this.settings = settings;
    }
}

module.exports = { DBConnection };
```

Get service instance
```javascript
const { DIService } = require('di-service');
const { DBConnection } = require('./db-connection');

const services = new DIService();
const connection = await services.getInstance(DBConnection);
console.log(connection.settings.constructor.name); // -> Settings
```
