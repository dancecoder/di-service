![DI Service](di-service.svg)
# DI Service
Really simple dependency injection solution for JavaScript

## Features
* Implements DI pattern
* Do not impose any system architecture, may be introduced to any JavaScript project (FE and BE both)
* Pure JavaScript implementation (+ TypeScript declaration file) 
* Zero dependencies
* ES Module and CommonJS hybrid module

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
const connection1 = await services.getInstance(DBConnection);
const connection2 = await services.getInstance(DBConnection);
console.log(connection1 === connection2); // -> true
console.log(connection1.settings === connection2.settings); // -> true
console.log(connection1.settings.constructor.name); // -> Settings
```

## Used by
[<img src="https://avatars.githubusercontent.com/u/50610858?s=100" width="100" height="100" />](https://bllink.co/en/)
