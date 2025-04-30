import { serialize, type, validate } from "@js-soft/ts-serval";
import { CoreDate, ICoreDate } from "@nmshd/core-types";
import { CoreBuffer, CryptoEncryptionAlgorithm, CryptoSecretKey, CryptoSecretKeyHandle, ICryptoSecretKey, ICryptoSecretKeyHandle } from "@nmshd/crypto";
import { nameof } from "ts-simple-nameof";
import { CoreSynchronizable, ICoreSynchronizable } from "../../../core";
import { IPasswordProtection, PasswordProtection } from "../../../core/types/PasswordProtection";
import { TokenReference } from "../transmission/TokenReference";
import { CachedToken, ICachedToken } from "./CachedToken";

export interface IToken extends ICoreSynchronizable {
    secretKey: ICryptoSecretKeyHandle;
    isOwn: boolean;
    passwordProtection?: IPasswordProtection;
    cache?: ICachedToken;
    cachedAt?: ICoreDate;
    metadata?: any;
    metadataModifiedAt?: ICoreDate;
}

@type("Token")
export class Token extends CoreSynchronizable implements IToken {
    public override readonly technicalProperties = ["@type", "@context", nameof<Token>((r) => r.secretKey), nameof<Token>((r) => r.isOwn)];
    public override readonly userdataProperties = [nameof<Token>((r) => r.passwordProtection)];
    public override readonly metadataProperties = [nameof<Token>((r) => r.metadata), nameof<Token>((r) => r.metadataModifiedAt)];

    @validate()
    @serialize()
    public secretKey: CryptoSecretKeyHandle;

    @validate()
    @serialize()
    public isOwn: boolean;

    @validate({ nullable: true })
    @serialize()
    public passwordProtection?: PasswordProtection;

    @validate({ nullable: true })
    @serialize()
    public cache?: CachedToken;

    @validate({ nullable: true })
    @serialize()
    public cachedAt?: CoreDate;

    @validate({ nullable: true })
    @serialize()
    public metadata?: any;

    @validate({ nullable: true })
    @serialize()
    public metadataModifiedAt?: CoreDate;

    public static from(value: IToken): Token {
        return this.fromAny(value);
    }

    public async toTokenReference(): Promise<TokenReference> {
        let rawSecretKey = await this.secretKey.keyHandle.extractKey()
        let algorithm = CryptoEncryptionAlgorithm.fromCalCipher(this.secretKey.spec.cipher);
        let legacySecretKey = CryptoSecretKey.from({ secretKey: new CoreBuffer(rawSecretKey), algorithm: algorithm });

        return TokenReference.from({
            id: this.id,
            key: legacySecretKey,
            forIdentityTruncated: this.cache!.forIdentity?.toString().slice(-4),
            passwordProtection: this.passwordProtection?.toSharedPasswordProtection()
        });
    }

    public async truncate(): Promise<string> {
        const reference = await this.toTokenReference();
        return reference.truncate();
    }

    public setCache(cache: CachedToken): this {
        this.cache = cache;
        this.cachedAt = CoreDate.utc();
        return this;
    }

    public setMetadata(metadata: any): void {
        this.metadata = metadata;
        this.metadataModifiedAt = CoreDate.utc();
    }
}
