import { BankAccount } from '../types';

export interface BankingAuthCredentials {
  accountNumber: string;
  bankCode: string;
  authMethod: 'oauth2' | 'apiKey' | 'simulator';
}

export interface BankingProvider {
  providerId: string;
  providerName: string;
  isOpenBankingSupported: boolean;
  authenticate(credentials: BankingAuthCredentials): Promise<{ success: boolean; token?: string; error?: string }>;
  fetchAccounts(token: string): Promise<BankAccount[]>;
  syncTransactions(accountId: string): Promise<{ syncedCount: number }>;
}

export class DemoBankingProvider implements BankingProvider {
  providerId = 'vietnam_open_banking_demo';
  providerName = 'Vietnam Open Banking Adapter (Sandbox Demo)';
  isOpenBankingSupported = true;

  async authenticate(credentials: BankingAuthCredentials): Promise<{ success: boolean; token?: string; error?: string }> {
    // Simulated secure token handshake
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!credentials.accountNumber) {
          resolve({ success: false, error: 'Số tài khoản không được để trống' });
        } else {
          resolve({ success: true, token: 'demo_jwt_' + Math.random().toString(36).substring(7) });
        }
      }, 700);
    });
  }

  async fetchAccounts(token: string): Promise<BankAccount[]> {
    return [];
  }

  async syncTransactions(accountId: string): Promise<{ syncedCount: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ syncedCount: 2 });
      }, 1000);
    });
  }
}

export const bankingService = new DemoBankingProvider();
