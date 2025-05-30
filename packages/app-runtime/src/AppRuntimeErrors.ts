import { UserfriendlyApplicationError } from "./UserfriendlyApplicationError";

class AppStringProcessor {
    public wrongURL(): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError("error.appruntime.appStringProcessor.wrongURL", "The given URL is in a wrong format.");
    }

    public wrongCode(): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError("error.appruntime.appStringProcessor.wrongCode", "The given code is in a wrong format.");
    }

    public invalidReference(): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError("error.appruntime.appStringProcessor.invalidReference", "The given code does not contain a valid truncated reference.");
    }

    public notSupportedTokenContent(): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError("error.appruntime.appStringProcessor.notSupportedTokenContent", "The scanned code is not supported in this context.");
    }

    public deviceOnboardingNotAllowed(): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError(
            "error.appruntime.appStringProcessor.deviceOnboardingNotAllowed",
            "The Token contains a device onboarding info, but this is not allowed in this context."
        );
    }

    public passwordNotProvided(): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError("error.appruntime.appStringProcessor.passwordNotProvided", "No password was provided.");
    }

    public passwordRetryLimitReached(): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError(
            "error.appruntime.appStringProcessor.passwordRetryLimitReached",
            "The maximum number of attempts to enter the password was reached."
        );
    }

    public noDeviceOnboardingCode(): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError(
            "error.appruntime.appStringProcessor.noDeviceOnboardingCode",
            "The scanned code does not contain a device onboarding info, but this scanner is only able to process device onboarding codes."
        );
    }
}

class General {
    public currentSessionUnavailable(): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError(
            "error.appruntime.general.currentSessionUnavailable",
            "The currentSession is not available. Try to execute login before this operation."
        );
    }

    public addressUnavailable(): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError(
            "error.appruntime.general.addressUnavailable",
            "The address of the account is not available. This might be a permanent problem caused by a failed login."
        );
    }

    public appServicesUnavailable(): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError(
            "error.appruntime.general.appServicesUnavailable",
            "The app services are not available. Try to execute login before this operation."
        );
    }

    public noAccountAvailable(error?: Error): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError(
            "error.appruntime.general.noAccountAvailable",
            "There is no account available for this action.",
            "It seems no eligible account is available for this action.",
            error
        );
    }

    public noAccountAvailableForIdentityTruncated(): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError(
            "error.appruntime.general.noAccountAvailableForIdentityTruncated",
            "There is no account matching the given 'forIdentityTruncated'.",
            "It seems no eligible account is available for this action, because the scanned code is intended for a specific Identity that is not available on this device."
        );
    }
}

class Startup {
    public bootstrapError(bootstrapError?: Error): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError("error.runtime.startup.BootstrapError", "There was an error while bootstrapping.", undefined, bootstrapError);
    }

    public bootstrapperNotInitialized(): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError("error.runtime.startup.BootstrapNotInitialized", "The given bootstrapper is not initialized.");
    }

    public uiBridgeAlreadyRegistered(): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError("error.appruntime.startup.uiBridgeAlreadyRegistered", "The UI bridge was already registered for this Runtime instance.");
    }
}

class PushNotificationModule {
    public subscriptionNotPossible(details: string, rootError?: Error): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError(
            "error.runtime.module.PushNotificationModule.SubscriptionNotPossible",
            `Subscribing to the NativeEventBus was not possible. Root cause: '${details}'`,
            "The Backbone has no push connection with this app. You might have to refresh the app manually.",
            rootError
        );
    }

    public unsubscriptionNotPossible(details: string, rootError?: Error): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError(
            "error.runtime.module.PushNotificationModule.UnsubscriptionNotPossible",
            `Unsubscribing from the NativeEventBus was not possible. Root cause: '${details}'`,
            "The Backbone still might have a push connection with this app. You might receive some unwanted notifications.",
            rootError
        );
    }

    public tokenRegistrationNotPossible(details: string, rootError?: Error): UserfriendlyApplicationError {
        return new UserfriendlyApplicationError(
            "error.runtime.module.PushNotificationModule.TokenRegistrationNotPossible",
            `Registering the Push Notification Token for the account was not possible. Root cause: '${details}'`,
            "The Backbone has no push connection with this app. You might have to refresh the app manually.",
            rootError
        );
    }
}

class Modules {
    public readonly pushNotificationModule = new PushNotificationModule();
}

export class AppRuntimeErrors {
    public static readonly appStringProcessor = new AppStringProcessor();
    public static readonly general = new General();
    public static readonly startup = new Startup();
    public static readonly modules = new Modules();
}
