![LowkeyVault](https://raw.githubusercontent.com/nagyesta/lowkey-vault/main/.github/assets/LowkeyVault-logo-full.png)

[![GitHub license](https://img.shields.io/github/license/nagyesta/lowkey-vault-example-nodejs?color=informational)](https://raw.githubusercontent.com/nagyesta/lowkey-vault-example-nodejs/main/LICENSE)
[![Node.js CI](https://img.shields.io/github/actions/workflow/status/nagyesta/lowkey-vault-example-nodejs/nodejs.yml?logo=github&branch=main)](https://github.com/nagyesta/lowkey-vault-example-nodejs/actions/workflows/nodejs.yml)
[![Lowkey secure](https://img.shields.io/badge/lowkey-secure-0066CC)](https://github.com/nagyesta/lowkey-vault)

# Lowkey Vault - Example Node.js

This is an example for [Lowkey Vault](https://github.com/nagyesta/lowkey-vault). It demonstrates a basic scenario where
a key is used for encrypt/decrypt operations and database connection specific credentials as well as getting a PKCS12
store with a certificate and matching private key inside.

### Points of interest

* [Key "repository"](src/index.js#L5)
* [Secret "repository"](src/index.js#L34)
* [Certificate "repository"](src/index.js#L55)
* [Empty credentials for connecting to Lowkey Vault](test/index.test.js#L11) (not needed if [Assumed Identity](https://github.com/nagyesta/assumed-identity) is used)
* Test implementations
  * [Tests using the empty credentials](test/index.test.js#L21)
  * [Tests using Managed Identity with DefaultAzureCredential](test/index-mi.test.js) (requires Assumed Identity)

### Usage

1. Start [Lowkey Vault](https://github.com/nagyesta/lowkey-vault) and [Assumed Identity](https://github.com/nagyesta/assumed-identity)
   1. Either by following the steps [here](https://github.com/nagyesta/lowkey-vault#quick-start-guide) and [here](https://github.com/nagyesta/assumed-identity#usage).
   2. Or running ```docker-compose up -d```
2. If you are not using the default `169.254.169.254:80` address for Assumed Identity (because for example you are running it in the cloud)
   1. Set ```AZURE_POD_IDENTITY_AUTHORITY_HOST``` environment variable to point to the Assumed Identity base URL e.g., http://localhost:8080
      as done in every test method of [the Managed Identity test cases](test/index-mi.test.js)
3. Run the tests

Note: In order to better understand what is needed in general to make similar examples work, please find a generic overview 
[here](https://github.com/nagyesta/lowkey-vault/wiki/Example:-How-can-you-use-Lowkey-Vault-in-your-tests).

### Note

I am not a professional JS developer. Please do not judge me by the code quality. I am open to any suggestions and
improvements.
