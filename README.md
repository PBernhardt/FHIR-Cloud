# FHIR Cloud

An AngularJS application for getting started with Fast Healthcare Interoperability Resources (FHIR). Includes helpful unit testing tools, Protractor integration and coverage testing.

## Installation

1. `npm install -g grunt-cli`
2. `npm install`
3. `grunt install`

## Development

1. `grunt dev`
2. Go to: `http://localhost:8888`

## Testing

### Run all tests with
`grunt test` 

### Unit Testing

#### Single run tests
`grunt test:unit` 

#### Auto watching tests
`grunt autotest:unit`

### End to End Testing (Protractor)

#### Single run tests
`grunt test:e2e` 

#### Auto watching tests
`grunt autotest:e2e`

### Coverage Testing

`grunt coverage`

### Project Structure

Most AngularJS applications you find are organized by type (e.g., views, controllers, services). This project is structured by feature. So if you're familiar with the FHIR specification, you can easily locate the code you're after. Each feature folder contains all the supporting code for that feature -- the controller, service, and html files. In the associated test project, you'll find the test files organized the same way.
