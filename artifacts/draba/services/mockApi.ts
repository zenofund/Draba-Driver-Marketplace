import { drivers, messages, transactions, trips, type Driver } from '@/data/mock';

type DelayOptions = { delayMs?: number };

const wait = async (delayMs = 160) => {
  await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
};

export const driverRepository = {
  async listNearby(_destination?: string, options?: DelayOptions): Promise<Driver[]> {
    await wait(options?.delayMs);
    return drivers;
  },
  async getById(id: string, options?: DelayOptions): Promise<Driver | undefined> {
    await wait(options?.delayMs);
    return drivers.find((driver) => driver.id === id);
  },
};

export const tripRepository = {
  async list(options?: DelayOptions) {
    await wait(options?.delayMs);
    return trips;
  },
};

export const walletRepository = {
  async getBalance(options?: DelayOptions) {
    await wait(options?.delayMs);
    return { balance: 38420, currency: 'NGN', paymentMethod: 'Visa · 4242' };
  },
  async listTransactions(options?: DelayOptions) {
    await wait(options?.delayMs);
    return transactions;
  },
};

export const inboxRepository = {
  async list(options?: DelayOptions) {
    await wait(options?.delayMs);
    return messages;
  },
};

/**
 * This is the only data boundary used by the prototype.
 * Each repository can be swapped for an HTTP implementation without changing screens.
 */
export const mockApi = {
  drivers: driverRepository,
  trips: tripRepository,
  wallet: walletRepository,
  inbox: inboxRepository,
  catalog: { drivers, trips, transactions, messages },
};