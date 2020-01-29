CI/CD Workflow

Actions to perform:

- Test everything (CI), always
  -> fail if CI does not pass

Maybe split the CI step into

- Tests (unit & E2E)
- Build

The annoying thing is that the build step is both a test (does it compile ?)
and a dependency for the deployment step (at least for non-Clever deployed stuff).

- Deploy API

  - if:
    - has changed
    - running on master
  - then:
    - push code to Clever Cloud
      => needs tokens
      Clever will rebuild only what it needs,
      and take care of notifying Sentry of the release ?
    - Notify Sentry of a new release => we need the release ID

- Deploy Web
  - if:
    - has changed
    - running on master
  - then:
    - Build, export and deploy on Surge
      => needs tokens

Things to find out how to do:

- How to know if things have changed
  - Reference point
  - Lerna diff ?
- How to setup Clever cloud push
- How to setup Surge deployments
- How to setup Sentry releases with a custom release ID

## Push MVP

Service: pub/sub based on websockets for real-time
Publisher: CLI
Subscriber: React webapp
NaCl box encryption
