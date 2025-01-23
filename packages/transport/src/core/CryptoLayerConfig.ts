import { AdditionalConfig, ProviderFactoryFunctions } from "crypto-layer-ts-types";

export type CryptoLayerConfig = {
    factoryFunctions: ProviderFactoryFunctions,
    keyMetadataStoreConfig: Extract<AdditionalConfig, {"KVStoreConfig": any} | {"FileStoreConfig": any}>
}