import { ISerializable, ISerialized, serialize, type, validate } from "@js-soft/ts-serval";
import { ICoreId } from "@nmshd/core-types";
import {
    CoreBuffer,
    CryptoExchangeAlgorithm,
    CryptoExchangePublicKey,
    CryptoSignaturePublicKey,
    IClearable,
    ICryptoExchangePublicKey,
    ICryptoExchangePublicKeySerialized,
    ICryptoSignaturePublicKeySerialized
} from "@nmshd/crypto";
import { CryptoSerializable } from "@nmshd/crypto/dist/CryptoSerializable";
import { RelationshipTemplatePublicKeyHandle } from "./RelationshipTemplatePublicKeyHandle";

/**
 * Interface defining the serialized form of RelationshipTemplatePublicKey.
 */
export interface IRelationshipTemplatePublicKeySerialized extends ISerialized {
    id: ICoreId;
    exc: ICryptoExchangePublicKeySerialized;
    ide?: ICryptoSignaturePublicKeySerialized;
}

/**
 * Interface defining the structure of RelationshipTemplatePublicKey.
 * Extends ICryptoExchangePublicKey to maintain compatibility.
 */
export interface IRelationshipTemplatePublicKey extends ISerializable, ICryptoExchangePublicKey {
    id: ICoreId;
}

/**
 * The original libsodium-based implementation preserved for backward compatibility.
 */
@type("RelationshipTemplatePublicKeyWithLibsodium")
export class RelationshipTemplatePublicKeyWithLibsodium extends CryptoSerializable implements IRelationshipTemplatePublicKey, IClearable {
    @validate({ nullable: true })
    @serialize()
    public id: ICoreId;

    @validate()
    @serialize()
    public exchangeKey: CryptoExchangePublicKey;

    @validate({ nullable: true })
    @serialize()
    public identityKey?: CryptoSignaturePublicKey;

    /**
     * Getter for algorithm from the exchangeKey to implement ICryptoExchangePublicKey.
     */
    public get algorithm(): CryptoExchangeAlgorithm {
        return this.exchangeKey.algorithm;
    }

    /**
     * Getter for publicKey from the exchangeKey to implement ICryptoExchangePublicKey.
     */
    public get publicKey(): CoreBuffer {
        return this.exchangeKey.publicKey;
    }

    /**
     * Serializes the public key into its JSON representation.
     *
     * @param verbose - If true, includes the "@type" property in the output.
     * @returns The serialized representation.
     */
    public override toJSON(verbose = true): ICryptoExchangePublicKeySerialized {
        // Make sure the output conforms to ICryptoExchangePublicKeySerialized
        const json: ICryptoExchangePublicKeySerialized = {
            alg: this.algorithm,
            pub: this.publicKey.toBase64URL(),
            "@type": verbose ? "RelationshipTemplatePublicKeyWithLibsodium" : undefined
        };

        return json;
    }

    /**
     * Clears the sensitive data contained in this public key.
     */
    public clear(): void {
        this.exchangeKey.clear();
        if (this.identityKey) {
            this.identityKey.clear();
        }
    }

    /**
     * Converts the public key to PEM format.
     *
     * @returns A string containing the PEM-encoded public key.
     */
    public toPEM(): string {
        // Delegate to the exchangeKey's toPEM method
        return this.exchangeKey.toPEM();
    }

    /**
     * Creates an instance of RelationshipTemplatePublicKeyWithLibsodium from a plain object or instance.
     *
     * @param value - An object conforming to IRelationshipTemplatePublicKey or an instance.
     * @returns An instance of RelationshipTemplatePublicKeyWithLibsodium.
     */
    public static from(value: RelationshipTemplatePublicKeyWithLibsodium | IRelationshipTemplatePublicKey): RelationshipTemplatePublicKeyWithLibsodium {
        return this.fromAny(value);
    }

    /**
     * Pre-processes the input object to normalize key aliases.
     *
     * @param value - The raw input object.
     * @returns The normalized object.
     */
    protected static override preFrom(value: any): any {
        if (value.exc) {
            value = {
                exchangeKey: value.exc,
                identityKey: value.ide,
                id: value.id
            };
        }
        return value;
    }

    /**
     * Deserializes a JSON object into a RelationshipTemplatePublicKeyWithLibsodium instance.
     *
     * @param value - The JSON object to deserialize.
     * @returns An instance of RelationshipTemplatePublicKeyWithLibsodium.
     */
    public static fromJSON(value: IRelationshipTemplatePublicKeySerialized): RelationshipTemplatePublicKeyWithLibsodium {
        return this.fromAny(value);
    }

    /**
     * Deserializes a Base64 encoded string into a RelationshipTemplatePublicKeyWithLibsodium instance.
     *
     * @param value - The Base64 encoded string.
     * @returns An instance of RelationshipTemplatePublicKeyWithLibsodium.
     */
    public static fromBase64(value: string): RelationshipTemplatePublicKeyWithLibsodium {
        return this.deserialize(CoreBuffer.base64_utf8(value));
    }
}

/**
 * Extended class that supports handle-based keys if the crypto-layer provider is available.
 * Otherwise, it falls back to the libsodium-based implementation.
 */
@type("RelationshipTemplatePublicKey")
export class RelationshipTemplatePublicKey extends RelationshipTemplatePublicKeyWithLibsodium {
    /**
     * Overrides `toJSON` to produce `@type: "RelationshipTemplatePublicKey"`.
     *
     * @param verbose - If true, includes the "@type" property in the output.
     * @returns The serialized representation with the extended type.
     */
    public override toJSON(verbose = true): ICryptoExchangePublicKeySerialized {
        // Make sure the output conforms to ICryptoExchangePublicKeySerialized
        const json: ICryptoExchangePublicKeySerialized = {
            alg: this.algorithm,
            pub: this.publicKey.toBase64URL(),
            "@type": verbose ? "RelationshipTemplatePublicKey" : undefined
        };

        return json;
    }

    /**
     * Checks if this is a crypto-layer handle.
     * @returns True if using crypto-layer, false if libsodium-based.
     */
    public isUsingCryptoLayer(): boolean {
        return this instanceof RelationshipTemplatePublicKeyHandle;
    }

    /**
     * Creates a new RelationshipTemplatePublicKey from a crypto-layer handle.
     */
    public static fromHandle(handle: RelationshipTemplatePublicKeyHandle): RelationshipTemplatePublicKey {
        return handle as unknown as RelationshipTemplatePublicKey;
    }

    /**
     * Creates an instance of RelationshipTemplatePublicKey from a plain object or instance.
     *
     * @param value - An object conforming to IRelationshipTemplatePublicKey or an instance.
     * @returns An instance of RelationshipTemplatePublicKey.
     */
    public static override from(value: RelationshipTemplatePublicKey | IRelationshipTemplatePublicKey): RelationshipTemplatePublicKey {
        if (value instanceof RelationshipTemplatePublicKeyHandle) {
            return value as unknown as RelationshipTemplatePublicKey;
        }

        const base = super.fromAny(value);
        if (base instanceof RelationshipTemplatePublicKey) {
            return base;
        }

        const extended = new RelationshipTemplatePublicKey();
        extended.id = base.id;
        extended.exchangeKey = base.exchangeKey;
        extended.identityKey = base.identityKey;
        return extended;
    }

    /**
     * Deserializes a JSON object into a RelationshipTemplatePublicKey instance.
     *
     * @param value - The JSON object to deserialize.
     * @returns An instance of RelationshipTemplatePublicKey.
     */
    public static override fromJSON(value: IRelationshipTemplatePublicKeySerialized): RelationshipTemplatePublicKey {
        const base = super.fromJSON(value);
        const extended = new RelationshipTemplatePublicKey();
        extended.id = base.id;
        extended.exchangeKey = base.exchangeKey;
        extended.identityKey = base.identityKey;
        return extended;
    }

    /**
     * Deserializes a Base64 encoded string into a RelationshipTemplatePublicKey instance.
     *
     * @param value - The Base64 encoded string.
     * @returns An instance of RelationshipTemplatePublicKey.
     */
    public static override fromBase64(value: string): RelationshipTemplatePublicKey {
        const base = super.fromBase64(value);
        const extended = new RelationshipTemplatePublicKey();
        extended.id = base.id;
        extended.exchangeKey = base.exchangeKey;
        extended.identityKey = base.identityKey;
        return extended;
    }
}
