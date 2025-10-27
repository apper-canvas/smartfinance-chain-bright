import React, { useEffect, useState } from "react";
import { bankAccountService } from "@/services/api/bankAccountService";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import BankAccountModal from "@/components/organisms/BankAccountModal";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import StatCard from "@/components/molecules/StatCard";
import { cn } from "@/utils/cn";

const BankAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = accounts.filter(account =>
account.name_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.bank_name_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.account_number_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.account_type_c?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAccounts(filtered);
    } else {
      setFilteredAccounts(accounts);
    }
  }, [searchTerm, accounts]);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bankAccountService.getAll();
      setAccounts(data);
      setFilteredAccounts(data);
    } catch (err) {
      setError('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (accountData) => {
    setModalLoading(true);
    try {
      if (editingAccount) {
        const result = await bankAccountService.update(editingAccount.Id, accountData);
        if (result) {
          await loadAccounts();
          setIsModalOpen(false);
        }
      } else {
        const result = await bankAccountService.create(accountData);
        if (result) {
          await loadAccounts();
          setIsModalOpen(false);
        }
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteAccount = async (account) => {
    if (window.confirm(`Are you sure you want to delete "${account.name_c}"?`)) {
      const success = await bankAccountService.delete(account.Id);
      if (success) {
        await loadAccounts();
      }
    }
  };

  const calculateTotalsByTurrency = () => {
    const totals = {};
    accounts.forEach(account => {
      const currency = account.currency_c || 'USD';
      const balance = parseFloat(account.balance_c) || 0;
      totals[currency] = (totals[currency] || 0) + balance;
    });
    return totals;
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥'
    };
    return symbols[currency] || currency;
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadAccounts} />;
  }

  const totalsByCurrency = calculateTotalsByTurrency();
  const primaryCurrency = Object.keys(totalsByCurrency)[0] || 'USD';
  const primaryTotal = totalsByCurrency[primaryCurrency] || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Accounts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your bank accounts and track balances
          </p>
        </div>
        <Button onClick={handleAddAccount} className="shrink-0">
          <ApperIcon name="Plus" size={20} className="mr-2" />
          Add Account
        </Button>
      </div>

      {/* Statistics */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Balance"
            value={formatCurrency(primaryTotal, primaryCurrency)}
            icon="Wallet"
            trend="neutral"
          />
          <StatCard
            title="Total Accounts"
            value={accounts.length}
            icon="Landmark"
            trend="neutral"
          />
          <StatCard
            title="Currencies"
            value={Object.keys(totalsByCurrency).length}
            icon="Coins"
            trend="neutral"
          />
        </div>
      )}

      {/* Currency Breakdown */}
      {Object.keys(totalsByCurrency).length > 1 && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Balance by Currency</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(totalsByCurrency).map(([currency, total]) => (
              <div key={currency} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-700">
                    {getCurrencySymbol(currency)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{currency}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(total, currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search */}
      {accounts.length > 0 && (
        <div className="relative">
          <ApperIcon
            name="Search"
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Accounts List */}
      {filteredAccounts.length === 0 && accounts.length > 0 ? (
        <Empty message="No accounts match your search" icon="Search" />
      ) : filteredAccounts.length === 0 ? (
        <Empty
          message="No bank accounts yet"
          icon="Landmark"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((account) => (
            <Card
              key={account.Id}
              className="p-4 hover:shadow-card-hover transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center shrink-0">
                    <ApperIcon name="Landmark" size={20} className="text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
{account.name_c}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{account.bank_name_c}</p>
                    {account.account_type_c && (
                      <Badge variant="secondary" className="mt-1">
                        {account.account_type_c}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEditAccount(account)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                    title="Edit account"
                  >
                    <ApperIcon name="Pencil" size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete account"
                  >
                    <ApperIcon name="Trash2" size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Account Number</span>
                  <span className="text-sm font-medium text-gray-900">
                    {account.account_number_c}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Balance</span>
                  <span className="text-base font-bold text-primary-600">
                    {formatCurrency(
                      parseFloat(account.balance_c) || 0,
                      account.currency_c || 'USD'
                    )}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <BankAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        account={editingAccount}
        loading={modalLoading}
      />
    </div>
  );
};

export default BankAccounts;