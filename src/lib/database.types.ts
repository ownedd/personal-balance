export type AccountType =
  | "bank"
  | "cash"
  | "savings"
  | "credit_card"
  | "crypto_wallet";
export type TransactionType = "income" | "expense" | "adjustment";

export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  currency: string;
  current_balance: number;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  description: string;
  category: string | null;
  transaction_date: string;
  created_at: string;
}

export interface AccountAsset {
  id: string;
  account_id: string;
  user_id: string;
  asset_symbol: string;
  asset_name: string;
  coingecko_id: string;
  quantity: number;
  average_buy_price: number | null;
  reference_currency: string;
  created_at: string;
}

export interface AccountAssetWithPrice extends AccountAsset {
  current_price_usd: number;
  current_value_usd: number;
}

export interface MonthlySnapshot {
  id: string;
  account_id: string;
  user_id: string;
  year: number;
  month: number;
  opening_balance: number;
  closing_balance: number;
  total_income: number;
  total_expenses: number;
  closed_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id">>;
      };
      accounts: {
        Row: Account;
        Insert: Omit<Account, "id" | "created_at">;
        Update: Partial<Omit<Account, "id" | "user_id" | "created_at">>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at">;
        Update: Partial<Omit<Transaction, "id" | "user_id" | "created_at">>;
      };
      account_assets: {
        Row: AccountAsset;
        Insert: Omit<AccountAsset, "id" | "created_at">;
        Update: Partial<
          Omit<AccountAsset, "id" | "user_id" | "account_id" | "created_at">
        >;
      };
      monthly_snapshots: {
        Row: MonthlySnapshot;
        Insert: Omit<MonthlySnapshot, "id">;
        Update: Partial<Omit<MonthlySnapshot, "id" | "user_id">>;
      };
    };
  };
}
