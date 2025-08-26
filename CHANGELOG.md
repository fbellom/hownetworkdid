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

## Version 2024-09-01

Adding Event Manager and Multitenancy Support with Authentication

### Front-End

- TODO:
  - Tenant and Event Manager
  - Authentication Form

### Backend

- TODO:
  - AuthC Database
  - RBAC
  - Tenants and Events Mager API

## Version 2024-09-02

### FrontEnd

- ADD
  - New parametric URL to submit orgId and EventId `http://howurateit.com/?orgId=cisco-connect-latam&eventCode=cloud-security-pod-02`
  - Dynamic POD Label, based on eventCode
  - Custom 404.html Redirect
  - favicon
  - Rating 1 to 5

### Backend

- ADD:

  - New API URI /submit-feedback/o/:orgId/:eventCode
  - Feedback Database extended

## Version 2025-08-25

### FrontEnd GSX FY26

- ADD:
  - Cisco Look n Feel based on color pallete.
  - Cisco Icons.
  - White Outlined Smiley Faces
