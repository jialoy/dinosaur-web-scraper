# Dinosaur web scraper

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.6.

## Dependencies

- **Node.js** `v18++`
- **npm** (comes bundled with Node.js)

To check your node and npm version:

```bash
node -v
npm -v
```
See [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) for instructions on downloading and installing Node.js and npm

## To run locally

### 1. Clone the repository

```bash
git clone <repository-url>
```

Or extract the zipped version to a folder

### 2. Install frontend dependencies

```bash
cd dinosaur-web-scraper
npm install
```

### 3. Navigate to the server/ dir and install backend dependencies

```bash
cd server
npm install
```

### 4. Build and serve

```bash
cd ..
npm start
```

This starts the backend server to scrape on `http://localhost:3000/` and the frontend server on `http://localhost:4200/`.
Open your browser and navigate to `http://localhost:4200/`, wait for scraping to complete and then access dinosaur data.
