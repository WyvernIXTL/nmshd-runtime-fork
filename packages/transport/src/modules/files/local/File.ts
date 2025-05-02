import { serialize, type, validate } from "@js-soft/ts-serval";
import { CoreDate, ICoreDate } from "@nmshd/core-types";
import { CoreBuffer, CryptoEncryptionAlgorithm, CryptoSecretKey, CryptoSecretKeyHandle, ICryptoSecretKey, ICryptoSecretKeyHandle } from "@nmshd/crypto";
import { nameof } from "ts-simple-nameof";
import { CoreSynchronizable, ICoreSynchronizable, TransportVersion } from "../../../core";
import { FileReference } from "../transmission/FileReference";
import { CachedFile, ICachedFile } from "./CachedFile";

export interface IFile extends ICoreSynchronizable {
    secretKey: ICryptoSecretKeyHandle;
    isOwn: boolean;
    cache?: ICachedFile;
    cachedAt?: ICoreDate;
    metadata?: any;
    metadataModifiedAt?: ICoreDate;
}

@type("File")
export class File extends CoreSynchronizable implements IFile {
    public override readonly technicalProperties = ["@type", "@context", nameof<File>((r) => r.secretKey), nameof<File>((r) => r.isOwn)];
    public override readonly metadataProperties = [nameof<File>((r) => r.metadata), nameof<File>((r) => r.metadataModifiedAt)];

    @validate()
    @serialize()
    public secretKey: CryptoSecretKeyHandle;

    @validate()
    @serialize()
    public isOwn: boolean;

    @validate({ nullable: true })
    @serialize()
    public cache?: CachedFile;

    @validate({ nullable: true })
    @serialize()
    public cachedAt?: CoreDate;

    @validate({ nullable: true })
    @serialize()
    public metadata?: any;

    @validate({ nullable: true })
    @serialize()
    public metadataModifiedAt?: CoreDate;

    public static from(value: IFile): File {
        return this.fromAny(value);
    }

    public async toFileReference(): Promise<FileReference> {
        let rawSecretKey = await this.secretKey.keyHandle.extractKey()
        let algorithm = CryptoEncryptionAlgorithm.fromCalCipher(this.secretKey.spec.cipher);
        let legacySecretKey = CryptoSecretKey.from({ secretKey: new CoreBuffer(rawSecretKey), algorithm: algorithm });

        return FileReference.from({ id: this.id, key: legacySecretKey, transportVersion: TransportVersion.Latest });
    }

    public async truncate(): Promise<string> {
        const reference = await this.toFileReference();
        return reference.truncate();
    }

    public setCache(cache: CachedFile): this {
        this.cache = cache;
        this.cachedAt = CoreDate.utc();
        return this;
    }

    public setMetadata(metadata: any): this {
        this.metadata = metadata;
        this.metadataModifiedAt = CoreDate.utc();
        return this;
    }
}
