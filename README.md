# :deciduous_tree: Nest

![Repo status](https://www.repostatus.org/badges/latest/active.svg)
[![Build Status](https://travis-ci.com/Markkop/nest.svg?token=kLjLhr4pnWBb2ZsKxrHz&branch=master)](https://travis-ci.com/Markkop/nest)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b73c2ddd14e0433698aa6d9ab1d55a3b)](https://www.codacy.com/manual/Markkop/nest?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Markkop/nest&amp;utm_campaign=Badge_Grade)
[![Moleculer](https://badgen.net/badge/Powered%20by/Moleculer/0e83cd)](https://moleculer.services)
[![Track Package](https://badgen.net/badge/Track%20Package/TrackingMore/0e83cd)](https://www.trackingmore.com/)

## About

This is a [Moleculer](https://moleculer.services/)-based project to manage personal microservices.  
To Track Packages I'm using the cool api from TrackingMore. Check it out on https://www.trackingmore.com/

## Usage

Start the project with `npm run dev` command.  
After starting, open the http://localhost:3040/ URL in your browser.  
On the welcome page you can test the generated services via API Gateway and check the nodes & services.

In the terminal, try the following commands:

-   `nodes` - List all connected nodes.
-   `actions` - List all registered service actions.
-   `call greeter.hello` - Call the `greeter.hello` action.
-   `call greeter.welcome --name John` - Call the `greeter.welcome` action with the `name` parameter.

## Services

### :outbox_tray: [API](https://github.com/Markkop/nest/blob/master/src/services/api/api.service.js)

This is the API Gateway service which connects each service to its endpoint.

### :briefcase: [Asana](https://github.com/Markkop/nest/blob/master/src/services/asana/asana.service.js)

I've implemented this service to create an Habitica Task everytime I receive a task on Asana, which is the task manager we're using at work.    
Also, I receieve a Telegram notification when a new task is created on a specific section.  

### :crystal_ball: [Habitica](https://github.com/Markkop/nest/blob/master/src/services/habitica/habitica.service.js)

This one is to send a chat message to my Habitica's Party whenever I've leveled up and when there's a new quest invite, so my party fellows can accept it as soon as possible.

### :calling: [Telegram](https://github.com/Markkop/nest/blob/master/src/services/telegram/telegram.service.js)

The Telegram Service is mostly a bot that notifies me about new tasks and about postal orders status using the Tracking More service.

### :package: [Tracking More](https://github.com/Markkop/nest/blob/master/src/services/trackingmore/trackingMore.service.js)

To be able to create new order trackings and receive their status, I've implemented this service using the [Tracking More](https://www.trackingmore.com/
) API. Since I've been buying cool stuff on AliExpress, it's useful to know when they're dispatched and are almost being delivered.

### :bar_chart: [Trello](https://github.com/Markkop/nest/blob/master/src/services/trello/trello.service.js)

There are some projects I'm keeping track of on Trello, so this service creates a new Habitica Task whenever a Trello Task is assigned to me.

### :wrench: [Mocks](https://github.com/Markkop/nest/blob/master/src/services/mocks/mocks.service.js)

This service is only responsabile to let some mock data be available on a give endpoint, so I can consume it on others side projects.

## Useful links

-   Moleculer website: https://moleculer.services/
-   Moleculer Documentation: https://moleculer.services/docs/0.14/

## NPM scripts

-   `npm run dev`: Start development mode (load all services locally with hot-reload & REPL)
-   `npm run start`: Start production mode (set `SERVICES` env variable to load certain services)
-   `npm run cli`: Start a CLI and connect to production. Don't forget to set production namespace with `--ns` argument in script
-   `npm run lint`: Run ESLint
-   `npm run ci`: Run continuous test mode with watching
-   `npm test`: Run tests & generate coverage report

## Deploy

The deploy is made via TravisCI to Heroku
