const {SecretClient} = require("@azure/keyvault-secrets");
const {ChainedTokenCredential} = require("@azure/identity");
const {KeyClient} = require("@azure/keyvault-keys");
const {SecretRepository, KeyRepository, CertificateRepository} = require("../src/index");
const chai = require("chai");
const {CertificateClient} = require("@azure/keyvault-certificates");
const expect = chai.expect;


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
            serviceVersion: "7.4",
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
            serviceVersion: "7.4",
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
            serviceVersion: "7.4",
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
