# Spota.js

A lightweight JavaScript library for scheduling HTTP requests to external APIs using a flexible and chainable API.

## Overview

Spota.js simplifies scheduling and executing HTTP requests to external APIs. It supports immediate and scheduled requests using a cron-like syntax or recurrence rules, making it suitable for automation tasks in Node.js environments. The library leverages `axios` for HTTP requests and `node-schedule` for scheduling.

## Key Features

- **Chainable API**: Create and schedule HTTP requests using intuitive method chaining (e.g., `spota.get(url).schedule()`).
- **Flexible Scheduling**: Schedule requests with cron strings or detailed recurrence rules.
- **HTTP Method Support**: Supports GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS requests.
- **Customizable**: Pass custom headers and Axios configuration options for fine-grained control.
- **Immediate Execution**: Execute requests immediately if no schedule is specified.

## Getting Started

### Installation

Install the package using npm:

```
npm install spota.js
```

### Basic Usage

Import the library and use it to schedule or execute HTTP requests:

```javascript
import { spota, Spota } from 'spota.js';

// Example: Schedule a daily GET request at midnight EST
spota.get('https://api.example.com/data')
  .schedule({
    rule: Spota.reoccurence({ hour: 0, minute: 0, second: 0, tz: 'America/New_York' })
  })
  .then(() => {
    console.log('Request scheduled successfully');
  })
  .catch((error) => {
    console.error('Error scheduling request:', error.message);
  });

// Example: Immediate GET request
spota.get('https://api.example.com/data')
  .execute()
  .then((response) => {
    console.log('Response:', response.data);
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });
```

## Configuration

### Spota Constructor

The `Spota` class accepts an optional `schedulerApiUrl` parameter, which defaults to `'http://localhost:3001/api/scheduler'`. You can override this using the `SPOTA_SCHEDULER_URL` environment variable.

```javascript
const spota = new Spota('https://your-scheduler-api.com/api/scheduler');
```

### Scheduling Options

The `schedule` method accepts a `SpotaScheduleConfig` object with the following properties:

- `rule`: A cron string (e.g., `'0 0 * * *'`) or a `node-schedule` `RecurrenceRule` object for scheduling.
- `callbackUrl`: An optional URL to receive callbacks when the scheduled request is executed.

Example with a cron string:

```javascript
spota.post('https://api.example.com/data', { key: 'value' })
  .schedule({ rule: '0 0 * * *', callbackUrl: 'https://your-callback.com' })
  .then(() => console.log('Scheduled'));
```

Example with a recurrence rule:

```javascript
const rule = Spota.reoccurence({
  hour: 12,
  minute: 30,
  tz: 'America/New_York'
});
spota.get('https://api.example.com/data')
  .schedule({ rule })
  .then(() => console.log('Scheduled'));
```

### HTTP Methods

The library supports the following HTTP methods:

- `get(url, config)`
- `post(url, data, config)`
- `put(url, data, config)`
- `patch(url, data, config)`
- `del(url, data, config)`
- `head(url, config)`
- `options(url, config)`

Each method returns a `SpotaRequest` instance, which can be used to either `schedule` or `execute` the request.

Example with custom headers:

```javascript
spota.get('https://api.example.com/data', {
  headers: { Authorization: 'Bearer your-token' }
})
  .execute()
  .then((response) => console.log(response.data));
```

## Dependencies

- `axios`: For making HTTP requests.
- `node-schedule`: For scheduling tasks using cron-like syntax or recurrence rules.

Ensure these are installed in your project:

```
npm install axios node-schedule
```

## Environment Variables

- `SPOTA_SCHEDULER_URL`: Overrides the default scheduler API URL.

## Contributing

Contributions are welcome! Please fork the repository, make your changes, and submit a pull request.

## License

This project is licensed under the ISC License (pending confirmation in the package).

## Acknowledgments

- [Node.js](https://nodejs.org/): For providing a robust JavaScript runtime.
- [axios](https://github.com/axios/axios): For reliable HTTP requests.
- [node-schedule](https://github.com/node-schedule/node-schedule): For flexible scheduling capabilities.
