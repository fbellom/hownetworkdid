# Changelog

## Version 2024-08-26

- Initial Version
- Minimum Viable Product
- Deployed at AWS Lightsail

## Version 2024-08-27

- User Agent Info Capture including os, Browser IP and location

## Version 2024-08-31

Refactoring the Codebase

### Backend

- Add Cookie Handling for allow one submit
- Add Rate Limit to avoid App Abuse
- Refactoring the backend moving endpoint to routes/
- make feedbackRouter Async for DB Operations
- change server side name to `api.js`

### Front End

- Modularize the Javascript app
- Add Input Validations
- Add Error Handlers to 429 Rate Limiting
- Add variables for the background-image for the hero css class
- Modularize Header and Footer to build it dynamically
