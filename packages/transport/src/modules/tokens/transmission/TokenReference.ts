import { type } from "@js-soft/ts-serval";
import { BackboneIds, CoreCrypto, IReference, Reference, TransportCoreErrors, TransportVersion } from "../../../core";
import { CryptoEncryptionAlgorithm, CryptoSecretKeyHandle } from "@nmshd/crypto";
import { CryptoObject, getPreferredProviderLevel } from "../../../core/CryptoProviderMapping";

export interface ITokenReference extends IReference { }

@type("TokenReference")
export class TokenReference extends Reference implements ITokenReference {
    protected static override preFrom(value: any): any {
        super.validateId(value, BackboneIds.token);

        return value;
    }

    public static override from(value: ITokenReference | string): TokenReference {
        return super.from(value);
    }
}
