/* eslint-disable @typescript-eslint/naming-convention */
import { hasProviderForSecurityLevel } from "@nmshd/crypto";
import { SecurityLevel } from "@nmshd/rs-crypto-types";

// Crypto Provider Types
export type CryptoProviderTypes = "Software" | "Hardware" | "Network";

export type CryptoPurpose = "deviceKeyPair" | "deviceSecretBaseKey" | "default";

// Available Crypto Providers
export const ALL_CRYPTO_PROVIDERS = ["SoftwareProvider", "Android", "SecureEnclave", "TPM", "HSM"];

// Available Crypto Operations
export type CryptoKeyType = "signature" | "encryption" | "derivation" | "exchange";

// Objects that use Crypto Operations
export type CryptoObject =
    | "AccountController"
    | "AnonymousTokenController"
    | "Certificate"
    | "DeviceController"
    | "DeviceSecretController"
    | "IdentityController"
    | "FileController"
    | "MessageController"
    | "RelationshipTemplateController"
    | "RelationshipsController"
    | "RelationshipSecretController"
    | "SecretController"
    | "TokenController";

// Map defining *available* operations (validation)
const CRYPTO_OPERATION_OBJECT_MAP: Partial<Record<CryptoObject, CryptoKeyType[]>> = {
    AccountController: ["encryption", "signature"],
    AnonymousTokenController: ["derivation"],
    Certificate: ["encryption"],
    DeviceController: ["signature", "encryption"],
    DeviceSecretController: ["derivation"],
    FileController: ["encryption"],
    IdentityController: ["encryption"],
    MessageController: ["encryption"],
    RelationshipTemplateController: ["derivation", "encryption"],
    RelationshipsController: ["encryption"],
    RelationshipSecretController: ["encryption"],
    SecretController: ["encryption"],
    TokenController: ["encryption"]
};

/**
 * Defines specific preferences for Object + Operation combinations.
 * If a combination is not found here, we check DEFAULT_OPERATION_PREFERENCES.
 */
const OBJECT_OPERATION_PREFERENCES: Partial<
    Record<CryptoObject, Partial<Record<CryptoKeyType, SecurityLevel | Partial<Record<Exclude<CryptoPurpose, undefined>, SecurityLevel>>>>>
> = {
    AccountController: {
        signature: {
            deviceKeyPair: "Hardware",
            default: "Software"
        },
        encryption: {
            default: "Software",
            deviceSecretBaseKey: "Hardware"
        }
    },
    AnonymousTokenController: {
        derivation: "Software"
    },
    Certificate: {},
    DeviceController: {},
    DeviceSecretController: {
        encryption: "Hardware"
    },
    FileController: {
        encryption: "Software"
    },
    IdentityController: {},
    MessageController: {
        encryption: "Software"
    },
    RelationshipTemplateController: {
        encryption: "Software"
    },
    RelationshipsController: {},
    RelationshipSecretController: {},
    SecretController: {
        exchange: "Software"
    },
    TokenController: {
        encryption: "Software"
    }
};

/**
 * Defines default preferences for specific operations, regardless of the object.
 * This is checked if no specific preference is found in OBJECT_OPERATION_PREFERENCES.
 */
const DEFAULT_OPERATION_PREFERENCES: Partial<Record<CryptoKeyType, SecurityLevel>> = {
    derivation: "Software",
    signature: "Hardware",
    encryption: "Software",
    exchange: "Software"
};

/**
 * The ultimate fallback preference if no specific or default operation preference is found.
 * Choose a sensible default, e.g., Software or Unsafe depending on your security posture.
 */
const FALLBACK_PREFERENCE: SecurityLevel = "Software";

/**
 * Determines the preferred provider level (security level) for a given
 * cryptographic operation on a specific type of object.
 *
 * Lookup Priority:
 * 1. Object + Operation (and possibly Purpose) from OBJECT_OPERATION_PREFERENCES
 * 2. Operation default from DEFAULT_OPERATION_PREFERENCES
 * 3. FALLBACK_PREFERENCE
 *
 * After determining the level, checks if a provider for that level exists.
 * Returns `FALLBACK_PREFERENCE` if none exists for the desired level.
 *
 * @param cryptoObject The type of object being operated on.
 * @param cryptoOperation The cryptographic operation being performed.
 * @param purpose An optional more specific reason (e.g. "deviceKeyPair")
 * @returns A valid SecurityLevel for which a provider is available (or fallback).
 */
export function getPreferredProviderLevel(cryptoObject: CryptoObject, cryptoOperation: CryptoKeyType, purpose?: Exclude<CryptoPurpose, undefined>): SecurityLevel {
    const allowedOps = CRYPTO_OPERATION_OBJECT_MAP[cryptoObject];
    if (allowedOps && !allowedOps.includes(cryptoOperation)) {
        throw new Error(`Operation '${cryptoOperation}' is not supported for object '${cryptoObject}'.`);
    }

    // 1. Attempt to find a specific Object + Operation (and possibly Purpose) preference
    let chosenSecurityLevel: SecurityLevel | undefined;
    const objectPrefs = OBJECT_OPERATION_PREFERENCES[cryptoObject];
    if (objectPrefs) {
        const operationPrefOrMap = objectPrefs[cryptoOperation];
        if (operationPrefOrMap) {
            if (typeof operationPrefOrMap === "object") {
                // It's a map of purposes -> SecurityLevel
                if (purpose && operationPrefOrMap[purpose]) {
                    chosenSecurityLevel = operationPrefOrMap[purpose];
                }
            } else {
                // It's directly a SecurityLevel
                chosenSecurityLevel = operationPrefOrMap;
            }
        }
    }

    // 2. If we didn't find a preference above, check default operation preference
    if (!chosenSecurityLevel) {
        const operationPref = DEFAULT_OPERATION_PREFERENCES[cryptoOperation];
        chosenSecurityLevel = operationPref ?? FALLBACK_PREFERENCE;
    }

    // Finally, check if we actually have a provider for that chosen security level.
    // If none is available, we fall back (once) to FALLBACK_PREFERENCE.
    if (!hasProviderForSecurityLevel(chosenSecurityLevel)) {
        // If the chosen level is already fallback, you might choose to throw,
        // but here we'll just return fallback anyway.
        if (chosenSecurityLevel !== FALLBACK_PREFERENCE && !hasProviderForSecurityLevel(FALLBACK_PREFERENCE)) {
            throw new Error(`No provider available for either ${chosenSecurityLevel} or fallback ${FALLBACK_PREFERENCE}.`);
        }
        return FALLBACK_PREFERENCE;
    }

    return chosenSecurityLevel;
}
