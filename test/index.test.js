const {SecretClient} = require("@azure/keyvault-secrets");
const {ChainedTokenCredential} = require("@azure/identity");
const {KeyClient, CryptographyClient} = require("@azure/keyvault-keys");
const chai = require("chai");
const {CertificateClient} = require("@azure/keyvault-certificates");
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


//The production code accessing certificates
const CertificateRepository = function (certificateName, url, credential, options) {
    this.certificateName = certificateName;
    this.credential = credential;
    this.options = options;
    this.client = new SecretClient(url, credential, options);

    this.getBase64Pkcs12Content = async function () {
        return (await this.client.getSecret(this.certificateName)).value;
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
            serviceVersion: "7.3",
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
            serviceVersion: "7.3",
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

    it('Certificates should return base64 string of previously created certificate when called', async () => {
        //given
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // ONLY ON CI, NEVER USE ON PROD!
        let certificateName = "certificate";
        const credential = new NoopCredential();
        const url = "https://localhost:8443";
        let options = {
            serviceVersion: "7.3",
            disableChallengeResourceVerification: true, // ONLY ON CI, NEVER USE ON PROD!
        };
        const certificateClient = new CertificateClient(url, credential, options);
        await certificateClient.beginCreateCertificate(certificateName, {
            issuerName: "Self",
            subject: "CN=example.com",
            validityInMonths: 12,
            keyCurveName: "P-256",
            keyType: "EC",
            contentType: "application/x-pkcs12"
        });
        let underTest = new CertificateRepository(certificateName, url, credential, options);

        //when
        //I don't know how the certificate should be parsed, but the Base64 string is obtained
        let actualBase64 = await underTest.getBase64Pkcs12Content();

        //then
        expect(actualBase64.length > 0).to.equal(true);
    });
});
