# Technology Stack

## Languages & Runtime

- **TypeScript**: ^5.7.3
- **JavaScript/ECMAScript**: Modern (ES2022+)
- **Angular Framework**: ^19.2.21
- **Node.js**: Runtime for build tools and Electron

## Core Frameworks & Libraries

- **Angular Core**: ^19.2.21
  - `@angular/core`
  - `@angular/common`
  - `@angular/forms`
  - `@angular/platform-browser`
  - `@angular/platform-browser-dynamic`
  - `@angular/router`
  - `@angular/animations`

- **State Management**:
  - `@ngrx/store`: ^19.2.1
  - `@ngrx/effects`: ^19.2.1
  - `@ngrx/store-devtools`: ^19.2.1

## Desktop Runtime

- **Electron**: ^41.3.0
- **Electron Builder**: ^24.13.3

## Build & Tooling

- **Angular CLI**: ^19.2.21
- **TypeScript Compiler**: ^5.7.3
- **Zone.js**: ^0.15.1
- **RxJS**: ~7.8.0
- **TSLib**: ^2.3.0

## Development & Testing Tools

- **Testing Framework**: Jasmine ^5.1.0, Karma ~6.4.0
- **Test Runners**:
  - `karma-chrome-launcher`: ~3.2.0
  - `karma-jasmine`: ~5.1.0
  - `karma-jasmine-html-reporter`: ~2.1.0
  - `karma-coverage`: ~2.2.0
- **Type Definitions**:
  - `@types/jasmine`: ~5.1.0
  - `@types/jest`: ^30.0.0
  - `@types/node`: ^20.19.39
- **Build Utilities**:
  - `concurrently`: ^8.2.2
  - `cross-env`: ^7.0.3
  - `wait-on`: ^7.2.0
  - `ts-node`: ^10.9.2

## Configuration Files

- `angular.json`: Angular CLI configuration
- `tsconfig.json`: Base TypeScript configuration
- `tsconfig.app.json`: Application TypeScript configuration
- `tsconfig.electron.json`: Electron TypeScript configuration
- `tsconfig.spec.json`: Test TypeScript configuration
- `karma.conf.js`: Karma test runner configuration
- `package.json`: Node.js dependencies and scripts