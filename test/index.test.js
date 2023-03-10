const {SecretClient} = require("@azure/keyvault-secrets");
const {ChainedTokenCredential} = require("@azure/identity");
const {KeyClient, CryptographyClient} = require("@azure/keyvault-keys");
const chai = require("chai");
const expect = chai.expect;

//The production code accessing keys
const KeyRepository = function (keyName, url, credential, options) {
    this.keyName = keyName;
    this.credential = credential;
    this.options = options;
    this.client = new KeyClient(url, credential, options);

    this.decrypt = async function (cipher) {
        let key = await this.client.getKey(this.keyName);
        let cryptographyClient = new CryptographyClient(key, this.credential, this.options);
        let result = await cryptographyClient.decrypt({
            algorithm: "RSA-OAEP-256",
            ciphertext: cipher
        });
        return result.result.toString();
    }

    this.encrypt = async function (clearText) {
        let key = await this.client.getKey(this.keyName);
        let cryptographyClient = new CryptographyClient(key, this.credential, this.options);
        let result = await cryptographyClient.encrypt({
            algorithm: "RSA-OAEP-256",
            plaintext: Uint8Array.from(clearText, x => x.charCodeAt(0))
        });
        return result.result;
    }
}


//The production code accessing secrets
const SecretRepository = function (secretNames, url, credential, options) {
    this.secretNames = secretNames;
    this.credential = credential;
    this.options = options;
    this.client = new SecretClient(url, credential, options);

    this.getDbUrl = async function () {
        return (await this.client.getSecret(this.secretNames.url)).value;
    }

    this.getDbUser = async function () {
        return (await this.client.getSecret(this.secretNames.username)).value;
    }

    this.getDbPass = async function () {
        return (await this.client.getSecret(this.secretNames.password)).value;
    }
}

//The credentials allowing tests to use LowKey Vault by bypassing authentication
class NoopCredential extends ChainedTokenCredential {
    async getToken(scopes, options) {
        return Promise.resolve({
            expiresOnTimestamp: new Date().getTime() + 30000,
            token: 'noop',
        });
    }
}

//The tests
describe('Key Vault', () => {
    it('Decrypt should return original text when called after encrypt', async () => {
        //given
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // ONLY ON CI, NEVER USE ON PROD!
        let clearText = "a secret message";
        const credential = new NoopCredential();
        const url = "https://localhost:8443";
        let options = {
            disableChallengeResourceVerification: true, // ONLY ON CI, NEVER USE ON PROD!
        };
        const client = new KeyClient(url, credential, options);
        await client.createRsaKey("rsa-key", {
            keySize: 2048,
            keyOps: ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
        });
        let underTest = new KeyRepository("rsa-key", url, credential, options);

        //when
        let cipher = await underTest.encrypt(clearText);
        let actual = await underTest.decrypt(cipher);

        //then
        expect(actual).to.equal(clearText);
    });

    it('Secrets should return previously set text when called', async () => {
        //given
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // ONLY ON CI, NEVER USE ON PROD!
        let admin = "admin";
        let pass = "s3cret";
        let dbUrl = "jdbc:h2:mem:test_mem";
        const credential = new NoopCredential();
        const url = "https://localhost:8443";
        let options = {
            disableChallengeResourceVerification: true, // ONLY ON CI, NEVER USE ON PROD!
        };
        const client = new SecretClient(url, credential, options);
        await client.setSecret("database", dbUrl);
        await client.setSecret("username", admin);
        await client.setSecret("password", pass);
        let underTest = new SecretRepository({
            url: "database",
            username: "username",
            password: "password"
        }, url, credential, options);

        //when
        let actualUrl = await underTest.getDbUrl();
        let actualUser = await underTest.getDbUser();
        let actualPass = await underTest.getDbPass();

        //then
        expect(actualUrl).to.equal(dbUrl);
        expect(actualUser).to.equal(admin);
        expect(actualPass).to.equal(pass);
    });
});
