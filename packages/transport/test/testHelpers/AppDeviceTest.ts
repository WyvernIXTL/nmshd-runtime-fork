import { ILogger } from "@js-soft/logging-abstractions";
import { EventEmitter2EventBus } from "@js-soft/ts-utils";
import { createProvider, createProviderFromName, getAllProviders, getProviderCapabilities } from "@nmshd/rs-crypto-node";
import { AccountController, DeviceSharedSecret, Transport } from "../../src";
import { DeviceTestParameters } from "./DeviceTestParameters";
import { TestUtil } from "./TestUtil";

export class AppDeviceTest {
    protected parameters: DeviceTestParameters;

    protected transport: Transport;
    protected logger: ILogger;

    private readonly createdAccounts: AccountController[] = [];

    public constructor(parameters: DeviceTestParameters) {
        const randomDigits = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0");
        const dynamicDbDir = `./test_${randomDigits}_cal_db`;

        const calConfig = {
            factoryFunctions: { getAllProviders, createProvider, createProviderFromName, getProviderCapabilities },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            keyMetadataStoreConfig: { FileStoreConfig: { db_dir: dynamicDbDir } },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            keyMetadataStoreAuth: { StorageConfigPass: "12345678" },
            providersToBeInitialized: []
        };

        this.parameters = parameters;
        this.transport = new Transport(
            this.parameters.connection,
            this.parameters.config,
            new EventEmitter2EventBus(() => {
                // ignore errors
            }),
            this.parameters.loggerFactory,
            undefined,
            {
                config: calConfig,
                initializeAllAvailableProviders: true
            }
        );
    }

    public async init(): Promise<void> {
        await this.transport.init();
    }

    public async createAccount(): Promise<AccountController> {
        const accounts = await TestUtil.provideAccounts(this.transport, 1);

        const account = accounts[0];

        this.createdAccounts.push(account);
        return account;
    }

    public async onboardDevice(sharedSecret: DeviceSharedSecret): Promise<AccountController> {
        const account = await TestUtil.onboardDevice(this.transport, sharedSecret);
        this.createdAccounts.push(account);
        return account;
    }

    public async close(): Promise<void> {
        for (const account of this.createdAccounts) {
            await account.close();
        }
    }
}
