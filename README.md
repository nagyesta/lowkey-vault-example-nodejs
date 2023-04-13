![LowkeyVault](https://raw.githubusercontent.com/nagyesta/lowkey-vault/main/.github/assets/LowkeyVault-logo-full.png)

[![GitHub license](https://img.shields.io/github/license/nagyesta/lowkey-vault-example-nodejs?color=informational)](https://raw.githubusercontent.com/nagyesta/lowkey-vault-example-nodejs/main/LICENSE)
[![Node.js CI](https://img.shields.io/github/actions/workflow/status/nagyesta/lowkey-vault-example-nodejs/nodejs.yml?logo=github&branch=main)](https://github.com/nagyesta/lowkey-vault-example-nodejs/actions/workflows/nodejs.yml)
[![Lowkey secure](https://img.shields.io/badge/lowkey-secure-0066CC)](https://github.com/nagyesta/lowkey-vault)

# Lowkey Vault - Example Node.js

This is an example for [Lowkey Vault](https://github.com/nagyesta/lowkey-vault). It demonstrates a basic scenario where
a key is used for encrypt/decrypt operations and database connection specific credentials as well as getting a PKCS12
store with a certificate and matching private key inside.

### Points of interest

* [Key "repository"](test/index.test.js#L8)
* [Secret "repository"](test/index.test.js#L37)
* [Certificate "repository"](test/index.test.js#L58)
* [Empty credentials for connecting to Lowkey Vault](test/index.test.js#L70)
* [Tests](test/index.test.js#L80)

### Usage

1. Start Lowkey Vault 
   1. Either by following the steps [here](https://github.com/nagyesta/lowkey-vault#quick-start-guide).
   2. Or running ```docker-compose up -d```
2. Run the tests

Note: In order to better understand what is needed in general to make similar examples work, please find a generic overview 
[here](https://github.com/nagyesta/lowkey-vault/wiki/Example:-How-can-you-use-Lowkey-Vault-in-your-tests).

### Note

I am not a professional JS developer. Please do not judge me by the code quality. I am open to any suggestions and
improvements.
