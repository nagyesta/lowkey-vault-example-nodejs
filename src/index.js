const {KeyClient, CryptographyClient} = require("@azure/keyvault-keys");
const {SecretClient} = require("@azure/keyvault-secrets");

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

module.exports = {
    KeyRepository: KeyRepository,
    SecretRepository: SecretRepository,
    CertificateRepository: CertificateRepository
}
