![LowkeyVault](https://raw.githubusercontent.com/nagyesta/lowkey-vault/main/.github/assets/LowkeyVault-logo-full.png)

[![GitHub license](https://img.shields.io/github/license/nagyesta/lowkey-vault-example-nodejs?color=informational)](https://raw.githubusercontent.com/nagyesta/lowkey-vault-example-nodejs/main/LICENSE)
[![Node.js CI](https://img.shields.io/github/actions/workflow/status/nagyesta/lowkey-vault-example-nodejs/nodejs.yml?logo=github&branch=main)](https://github.com/nagyesta/lowkey-vault-example-nodejs/actions/workflows/nodejs.yml)
[![Lowkey secure](https://img.shields.io/badge/lowkey-secure-0066CC)](https://github.com/nagyesta/lowkey-vault)

# Lowkey Vault - Example Node.js

This is an example for [Lowkey Vault](https://github.com/nagyesta/lowkey-vault). It demonstrates a basic scenario where
a key is used for encrypt/decrypt operations and database connection specific credentials.

### Points of interest

* [Key "repository"](test/index.test.js#L7)
* [Secret "repository"](test/index.test.js#L35)
* [Empty credentials for connecting to Lowkey Vault](test/index.test.js#L54)
* [Tests](test/index.test.js#L64)

### Usage

1. Start Lowkey Vault 
   1. Either by following the steps [here](https://github.com/nagyesta/lowkey-vault#quick-start-guide).
   2. Or running ```docker-compose up -d```
2. Set ```REQUESTS_CA_BUNDLE``` environment variable to reference [lowkeyvault.pem](lowkeyvault.pem)
3. Run the tests

Note: In order to better understand what is needed in general to make similar examples work, please find a generic overview 
[here](https://github.com/nagyesta/lowkey-vault/wiki/Example:-How-can-you-use-Lowkey-Vault-in-your-tests).

### Note

This is my very first Node.js project after using it for 2-3 hours, please have mercy when
commenting on code quality!
