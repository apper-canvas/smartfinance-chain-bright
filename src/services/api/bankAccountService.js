import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

class BankAccountService {
  constructor() {
    this.tableName = 'bank_account_c';
  }

  async getAll() {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
{ field: { Name: 'name_c' } },
          { field: { Name: 'account_number_c' } },
          { field: { Name: 'bank_name_c' } },
          { field: { Name: 'balance_c' } },
          { field: { Name: 'currency_c' } },
          { field: { Name: 'account_type_c' } }
        ],
        orderBy: [{ fieldName: 'Id', sorttype: 'DESC' }]
      };

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response?.data?.length) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching bank accounts:', error?.response?.data?.message || error);
      toast.error('Failed to load bank accounts');
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
{ field: { Name: 'name_c' } },
          { field: { Name: 'account_number_c' } },
          { field: { Name: 'bank_name_c' } },
          { field: { Name: 'balance_c' } },
          { field: { Name: 'currency_c' } },
          { field: { Name: 'account_type_c' } }
        ]
      };

      const response = await apperClient.getRecordById(this.tableName, id, params);

      if (!response?.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching bank account ${id}:`, error?.response?.data?.message || error);
      toast.error('Failed to load bank account details');
      return null;
    }
  }

  async create(accountData) {
    try {
      const apperClient = getApperClient();

      // Only include Updateable fields
      const params = {
        records: [
          {
            name_c: accountData.name_c,
            account_number_c: accountData.account_number_c,
bank_name_c: accountData.bank_name_c,
            balance_c: parseFloat(accountData.balance_c),
            currency_c: accountData.currency_c,
            account_type_c: accountData.account_type_c
          }
        ]
      };

      const response = await apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create bank account:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => {
                toast.error(`${error.fieldLabel}: ${error.message}`);
              });
            }
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('Bank account created successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error creating bank account:', error?.response?.data?.message || error);
      toast.error('Failed to create bank account');
      return null;
    }
  }

  async update(id, accountData) {
    try {
      const apperClient = getApperClient();

      // Only include Updateable fields plus Id
      const params = {
        records: [
          {
            Id: id,
name_c: accountData.name_c,
            account_number_c: accountData.account_number_c,
            bank_name_c: accountData.bank_name_c,
            balance_c: parseFloat(accountData.balance_c),
            currency_c: accountData.currency_c,
            account_type_c: accountData.account_type_c
          }
        ]
      };

      const response = await apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update bank account:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => {
                toast.error(`${error.fieldLabel}: ${error.message}`);
              });
            }
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('Bank account updated successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error updating bank account:', error?.response?.data?.message || error);
      toast.error('Failed to update bank account');
      return null;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();

      const params = {
        RecordIds: [id]
      };

      const response = await apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete bank account:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }

        if (successful.length > 0) {
          toast.success('Bank account deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error deleting bank account:', error?.response?.data?.message || error);
      toast.error('Failed to delete bank account');
      return false;
    }
  }
}

export const bankAccountService = new BankAccountService();