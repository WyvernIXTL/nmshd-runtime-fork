import { ISerializable, ISerialized, serialize, type, validate } from "@js-soft/ts-serval";
import { ICoreId } from "@nmshd/core-types";
import {
    CoreBuffer,
    CryptoExchangeAlgorithm,
    CryptoExchangePublicKeyHandle,
    CryptoSignaturePublicKeyHandle,
    IClearable,
    ICryptoExchangePublicKey,
    ICryptoExchangePublicKeySerialized
} from "@nmshd/crypto";
import { CryptoSerializableAsync } from "@nmshd/crypto/dist/CryptoSerializable";

/**
 * Interface defining the serialized form of RelationshipTemplatePublicKeyHandle.
 */
export interface IRelationshipTemplatePublicKeyHandleSerialized extends ISerialized {
    id: ICoreId;
    /**
     * The serialized exchange public key handle.
     */
    exc: any;
    /**
     * The serialized identity public key handle.
     */
    ide?: any;
}

/**
 * Interface defining the structure of RelationshipTemplatePublicKeyHandle.
 * Explicitly extends ICryptoExchangePublicKey for compatibility.
 */
export interface IRelationshipTemplatePublicKeyHandle extends ISerializable, ICryptoExchangePublicKey {
    /**
     * An optional ID for the template.
     */
    id: ICoreId;
    /**
     * Algorithm of the public key, inherited from ICryptoExchangePublicKey.
     */
    algorithm: CryptoExchangeAlgorithm;
    /**
     * The public key buffer, inherited from ICryptoExchangePublicKey.
     */
    publicKey: CoreBuffer;
}

/**
 * Represents a handle to a relationship template public key within the crypto layer.
 *
 * This class encapsulates references to:
 *  - An exchange public key
 *  - An optional identity public key
 *
 * All are managed by the crypto provider without exposing the raw key material.
 * Explicitly implements ICryptoExchangePublicKey for compatibility.
 */
@type("RelationshipTemplatePublicKeyHandle")
export class RelationshipTemplatePublicKeyHandle extends CryptoSerializableAsync implements IRelationshipTemplatePublicKeyHandle, IClearable, ICryptoExchangePublicKey {
    /**
     * An optional ID for the template public key.
     */
    @validate({ nullable: true })
    @serialize()
    public id: ICoreId;

    /**
     * The exchange public key handle.
     */
    @validate()
    @serialize()
    public exchangeKey: CryptoExchangePublicKeyHandle;

    /**
     * The optional identity public key handle.
     */
    @validate({ nullable: true })
    @serialize()
    public identityKey?: CryptoSignaturePublicKeyHandle;

    /**
     * Getter for algorithm from the exchangeKey to implement ICryptoExchangePublicKey.
     */
    public get algorithm(): CryptoExchangeAlgorithm {
        // Map directly from the spec.asym_spec to CryptoExchangeAlgorithm
        const asymSpec = this.exchangeKey.spec.asym_spec;

        if (asymSpec === "P256") {
            return CryptoExchangeAlgorithm.ECDH_P256;
        } else if (asymSpec === "P521") {
            return CryptoExchangeAlgorithm.ECDH_P521;
        } else if (asymSpec === "Curve25519") {
            return CryptoExchangeAlgorithm.ECDH_X25519;
        }

        // Default fallback
        return CryptoExchangeAlgorithm.ECDH_X25519;
    }

    /**
     * Getter for publicKey from the exchangeKey to implement ICryptoExchangePublicKey.
     * This ensures the class is compatible with ICryptoExchangePublicKey.
     */
    public get publicKey(): CoreBuffer {
        return CoreBuffer.from(this.exchangeKey.keyPairHandle.getPublicKey());
    }

    /**
     * Serializes the handle into its JSON representation.
     *
     * @param verbose - If true, includes the "@type" property in the output.
     * @returns A Promise that resolves to the serialized representation.
     */
    public override toJSON(verbose = true): ICryptoExchangePublicKeySerialized {
        // Include the required alg and pub properties for ICryptoExchangePublicKeySerialized
        const json: ICryptoExchangePublicKeySerialized = {
            alg: this.algorithm,
            pub: this.publicKey.toBase64URL(),
            "@type": verbose ? "RelationshipTemplatePublicKeyHandle" : undefined
        };

        return json;
    }

    /**
     * Clears the sensitive data contained in this handle.
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
     * Creates an instance of RelationshipTemplatePublicKeyHandle from a plain object or instance.
     *
     * @param value - An object conforming to IRelationshipTemplatePublicKeyHandle or an instance.
     * @returns A Promise that resolves to a new instance of RelationshipTemplatePublicKeyHandle.
     */
    public static async from(value: RelationshipTemplatePublicKeyHandle | IRelationshipTemplatePublicKeyHandle): Promise<RelationshipTemplatePublicKeyHandle> {
        return await this.fromAny(value);
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
     * Deserializes a JSON object into a RelationshipTemplatePublicKeyHandle instance.
     *
     * @param value - The JSON object to deserialize.
     * @returns A Promise that resolves to a new instance of RelationshipTemplatePublicKeyHandle.
     */
    public static async fromJSON(value: IRelationshipTemplatePublicKeyHandleSerialized): Promise<RelationshipTemplatePublicKeyHandle> {
        return await this.fromAny(value);
    }

    /**
     * Deserializes a Base64 encoded string into a RelationshipTemplatePublicKeyHandle instance.
     *
     * @param value - The Base64 encoded string.
     * @returns A Promise that resolves to a new instance of RelationshipTemplatePublicKeyHandle.
     */
    public static async fromBase64(value: string): Promise<RelationshipTemplatePublicKeyHandle> {
        return await this.deserialize(CoreBuffer.base64_utf8(value));
    }
}
