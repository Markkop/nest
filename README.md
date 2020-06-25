# :deciduous_tree: Nest

![Repo status](https://www.repostatus.org/badges/latest/active.svg)
[![Build Status](https://travis-ci.com/Markkop/nest.svg?token=kLjLhr4pnWBb2ZsKxrHz&branch=master)](https://travis-ci.com/Markkop/nest)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b73c2ddd14e0433698aa6d9ab1d55a3b)](https://www.codacy.com/manual/Markkop/nest?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Markkop/nest&amp;utm_campaign=Badge_Grade)
[![Moleculer](https://badgen.net/badge/Powered%20by/Moleculer/0e83cd)](https://moleculer.services)

## About

This is a [Moleculer](https://moleculer.services/)-based project to manage personal microservices.

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

-   **api**: API Gateway services
-   **greeter**: Sample service with `hello` and `welcome` actions.
-   **asana**: Asana task service.
-   **habitica**: Habitica habit and task service.
-   **mocks**: A service that returns mocked data
-   **telegram**: Telegram service
-   **trello**: `soon...`
-   **discord**: `soon...`

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
