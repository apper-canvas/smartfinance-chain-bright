import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' }
];

const BankAccountModal = ({ isOpen, onClose, onSubmit, account = null, loading = false }) => {
const [formData, setFormData] = useState({
    name_c: '',
    account_number_c: '',
    bank_name_c: '',
    balance_c: '',
    currency_c: 'USD',
    account_type_c: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
if (account) {
      setFormData({
        name_c: account.name_c || '',
        account_number_c: account.account_number_c || '',
        bank_name_c: account.bank_name_c || '',
        balance_c: account.balance_c?.toString() || '',
        currency_c: account.currency_c || 'USD',
        account_type_c: account.account_type_c || ''
      });
    } else {
      setFormData({
        name_c: '',
        account_number_c: '',
        bank_name_c: '',
        balance_c: '',
        currency_c: 'USD'
      });
    }
    setErrors({});
  }, [account, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name_c?.trim()) {
      newErrors.name_c = 'Account name is required';
    }

    if (!formData.account_number_c?.trim()) {
      newErrors.account_number_c = 'Account number is required';
    }

    if (!formData.bank_name_c?.trim()) {
      newErrors.bank_name_c = 'Bank name is required';
    }

    if (!formData.balance_c || isNaN(parseFloat(formData.balance_c))) {
      newErrors.balance_c = 'Valid balance is required';
    } else if (parseFloat(formData.balance_c) < 0) {
      newErrors.balance_c = 'Balance cannot be negative';
    }

    if (!formData.currency_c) {
      newErrors.currency_c = 'Currency is required';
    }
{/* Account Type Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <Select
                  value={formData.account_type_c}
                  onChange={(e) => setFormData({ ...formData, account_type_c: e.target.value })}
                  className="w-full"
                >
                  <option value="">Select Account Type</option>
                  <option value="Checking">Checking</option>
                  <option value="Savings">Savings</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Investment">Investment</option>
                </Select>
              </div>
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {account ? 'Edit Bank Account' : 'Add Bank Account'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              disabled={loading}
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Account Name */}
            <div>
              <label htmlFor="name_c" className="block text-sm font-medium text-gray-700 mb-1">
                Account Name *
              </label>
              <Input
                id="name_c"
                name="name_c"
                type="text"
                value={formData.name_c}
                onChange={handleInputChange}
                placeholder="e.g., Main Checking"
                disabled={loading}
                className={cn(errors.name_c && 'border-red-500')}
              />
              {errors.name_c && (
                <p className="mt-1 text-sm text-red-600">{errors.name_c}</p>
              )}
            </div>

            {/* Bank Name */}
            <div>
              <label htmlFor="bank_name_c" className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name *
              </label>
              <Input
                id="bank_name_c"
                name="bank_name_c"
                type="text"
                value={formData.bank_name_c}
                onChange={handleInputChange}
                placeholder="e.g., Chase Bank"
                disabled={loading}
                className={cn(errors.bank_name_c && 'border-red-500')}
              />
              {errors.bank_name_c && (
                <p className="mt-1 text-sm text-red-600">{errors.bank_name_c}</p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label htmlFor="account_number_c" className="block text-sm font-medium text-gray-700 mb-1">
                Account Number *
              </label>
              <Input
                id="account_number_c"
                name="account_number_c"
                type="text"
                value={formData.account_number_c}
                onChange={handleInputChange}
                placeholder="e.g., ****1234"
                disabled={loading}
                className={cn(errors.account_number_c && 'border-red-500')}
              />
              {errors.account_number_c && (
                <p className="mt-1 text-sm text-red-600">{errors.account_number_c}</p>
              )}
            </div>

            {/* Balance and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="balance_c" className="block text-sm font-medium text-gray-700 mb-1">
                  Balance *
                </label>
                <Input
                  id="balance_c"
                  name="balance_c"
                  type="number"
                  step="0.01"
                  value={formData.balance_c}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  disabled={loading}
                  className={cn(errors.balance_c && 'border-red-500')}
                />
                {errors.balance_c && (
                  <p className="mt-1 text-sm text-red-600">{errors.balance_c}</p>
                )}
              </div>

              <div>
                <label htmlFor="currency_c" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency *
                </label>
                <Select
                  id="currency_c"
                  name="currency_c"
                  value={formData.currency_c}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={cn(errors.currency_c && 'border-red-500')}
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </Select>
                {errors.currency_c && (
                  <p className="mt-1 text-sm text-red-600">{errors.currency_c}</p>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <ApperIcon name="Loader2" size={16} className="animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <span>{account ? 'Update' : 'Create'}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankAccountModal;