[![SketchOff Logo](https://raw.githubusercontent.com/SketchOff/SketchOff-Web/master/modules/core/client/img/brand/logo.png)](http://www.sketchoff.xyz:8443/)

[![MeanJS Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/meanjs/mean?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/meanjs/mean.svg?branch=master)](https://travis-ci.org/meanjs/mean)
[![Dependencies Status](https://david-dm.org/meanjs/mean.svg)](https://david-dm.org/meanjs/mean)
[![Coverage Status](https://coveralls.io/repos/meanjs/mean/badge.svg?branch=master&service=github)](https://coveralls.io/github/meanjs/mean?branch=master)

Sketchoff was built by a team of 6 developers for Case Western Reserve University's Fall 2015 Software Engineering class project. [**_You can play our alpha version here!_**](http://sketchoff.xyz:8443)
<br><br>
SketchOff is a web app that allows you and your friends to compete to draw pictures based on randomly generated phrases. Once a game begins, one player is randomly picked to be a judge and selects a generated phrase for players to draw within a certain time limit. Players have a wide variety of drawing tools at their disposal in the game. Once time is up, the judge selects who they think drew the best picture, and the winner is awarded experience points. Players can keep track of their points and game history in their in-game profiles, and can view the profiles of other players. If a player sees someone they enjoy playing with, they can send that user a friend request. In the game, players can use an in-game chat function, allowing them to communicate with other players as they play the game. The competition is on, as the players SketchOff!

## More Documentation
* [User Manual] (https://docs.google.com/document/d/1coS49V6luBTi-ji-fj2kvKafI0eY3KL_fFX44SYFWYE/edit?usp=sharing)
* [Vision & Scope Document] (https://docs.google.com/document/d/1maI5HTxVwyrd9LUB9Gdzrfd3K9G5FhNfYkkAdivRs4g/edit?usp=sharing)
* [Design Document] (https://docs.google.com/document/d/1a1PTWW3bEp-sBus19Q-JsQ6wDsqdNvtIOwjYhkGIkbU/edit?usp=sharing)
* [System Requirements Specifications] (https://docs.google.com/document/d/12Elm-wnKnjaN1jF_4uJHKH5rA54AtJvRcob2HiPUcQ8/edit?usp=sharing)
* [Test Plan] (https://docs.google.com/document/d/1H4uhJFtjrc2-jPTlAzzloaX4niUKC7N8PlXHPOyChZE/edit?usp=sharing)
 

# Building SketchOff

## Before You Begin
Before you begin we recommend you read about the basic building blocks that assemble a MEAN.JS application:
* MongoDB - Go through [MongoDB Official Website](http://mongodb.org/) and proceed to their [Official Manual](http://docs.mongodb.org/manual/), which should help you understand NoSQL and MongoDB better.
* Express - The best way to understand express is through its [Official Website](http://expressjs.com/), which has a [Getting Started](http://expressjs.com/starter/installing.html) guide, as well as an [ExpressJS Guide](http://expressjs.com/guide/error-handling.html) guide for general express topics. You can also go through this [StackOverflow Thread](http://stackoverflow.com/questions/8144214/learning-express-for-node-js) for more resources.
* AngularJS - Angular's [Official Website](http://angularjs.org/) is a great starting point. You can also use [Thinkster Popular Guide](http://www.thinkster.io/), and the [Egghead Videos](https://egghead.io/).
* Node.js - Start by going through [Node.js Official Website](http://nodejs.org/) and this [StackOverflow Thread](http://stackoverflow.com/questions/2353818/how-do-i-get-started-with-node-js), which should get you going with the Node.js platform in no time.


## Prerequisites
Make sure you have installed all of the following prerequisites on your development machine:
* Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager. If you encounter any problems, you can also use this [GitHub Gist](https://gist.github.com/isaacs/579814) to install Node.js.
* NOTE: Mean.js 0.4.1 is not working with the latest Node version. Use [nvm](https://github.com/creationix/nvm) to switch to Node version 0.12.7. 
* MongoDB - [Download & Install MongoDB](http://www.mongodb.org/downloads), and make sure it's running on the default port (27017).
* Bower - You're going to use the [Bower Package Manager](http://bower.io/) to manage your front-end packages. Make sure you've installed Node.js and npm first, then install bower globally using npm:

```bash
$ npm install -g bower
```

* Grunt - You're going to use the [Grunt Task Runner](http://gruntjs.com/) to automate your development process. Make sure you've installed Node.js and npm first, then install grunt globally using npm:

```bash
$ npm install -g grunt-cli
```

## Downloading SketchOff
There are several ways you can get the SketchOff code:

### Cloning The GitHub Repository
The recommended way to get SketchOff is to directly clone the repository:

```bash
$ git clone https://github.com/SketchOff/SketchOff-Web.git
```

This will clone the latest version of the SketchOff repository to a **SketchOff** folder.

### Downloading The Repository Zip File
Another way to use the SketchOff is to download a zip copy from the [master branch on GitHub](https://github.com/SketchOff/SketchOff-Web/archive/master.zip). You can also do this using `wget` command:

```bash
$ wget https://github.com/SketchOff/SketchOff-Web/archive/master.zip -O SketchOff.zip; unzip SketchOff.zip; rm SketchOff.zip
```


## Quick Install
Once you've downloaded the repo and installed all the prerequisites, you're just a few steps away from starting to develop your SketchOff application.

The first thing you should do is install the Node.js dependencies. The boilerplate comes pre-bundled with a package.json file that contains the list of modules you need to start your application. To learn more about the modules installed visit the NPM & Package.json section.

To install Node.js dependencies you're going to use npm again. In the application folder run this in the command-line:

```bash
$ npm install
```

This command does a few things:
* First it will install the dependencies needed for the application to run.
* If you're running in a development environment, it will then also install development dependencies needed for testing and running your application.
* Finally, when the install process is over, npm will initiate a bower install command to install all the front-end modules needed for the application

## Running The Application
After the install process is over, you'll be able to run the application using Grunt, just run grunt default task:

```
$ grunt
```

The application should run on port 3000 with the *development* environment configuration, so in your browser just go to [http://localhost:3000](http://localhost:3000)

That's it! The application should be running. To proceed with your development, check the other sections in this documentation.
If you encounter any problems, try the Troubleshooting section.

* explore `config/env/development.js` for development environment configuration options

### Running in Production mode
To run the application with *production* environment configuration, execute grunt as follows:

```bash
$ grunt prod
```

* explore `config/env/production.js` for production environment configuration options

### Running with User Seed
To have default account(s) seeded at runtime:

In Development:
```bash
MONGO_SEED=true grunt
```
It will try to seed the users 'user' and 'admin'. If one of the user already exists, it will display an error message on the console. Just grab the passwords from the console.

In Production:
```bash
MONGO_SEED=true grunt prod
```
This will seed the admin user one time if the user does not already exist. You have to copy the password from the console and save it.

### Running with TLS (SSL)
Application will start by default with secure configuration (SSL mode) turned on and listen on port 8443.
To run your application in a secure manner you'll need to use OpenSSL and generate a set of self-signed certificates. Unix-based users can use the following command:

```bash
$ sh ./scripts/generate-ssl-certs.sh
```

Windows users can follow instructions found [here](http://www.websense.com/support/article/kbarticle/How-to-use-OpenSSL-and-Microsoft-Certification-Authority).
After you've generated the key and certificate, place them in the *config/sslcerts* folder.

Finally, execute grunt's prod task `grunt prod`
* enable/disable SSL mode in production environment change the `secure` option in `config/env/production.js`


## Testing The Application
You can run the full test suite with the test task:

```bash
$ grunt test
```

This will run both the server-side tests (located in the app/tests/ directory) and the client-side tests (located in the public/modules/*/tests/).

To execute only the server tests, run the test:server task:

```bash
$ grunt test:server
```

And to run only the client tests, run the test:client task:

```bash
$ grunt test:client
```


## Special thanks to MEAN.js
We recommend you go over the [Official Documentation](http://meanjs.org/docs.html).
In the docs it'll try to explain both general concepts of MEAN components and give you some guidelines to help you improve your development process. You can also help them develop and improve by checking out their github repository.

## License
(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
