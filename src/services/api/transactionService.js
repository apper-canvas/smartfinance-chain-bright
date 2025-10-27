import { getApperClient } from "@/services/apperClient";

class TransactionService {
  constructor() {
    this.tableName = "transaction_c";
  }

async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          { field: { Name: "amount_c" } },
          { field: { Name: "category_c" }, referenceField: { field: { Name: "name_c" } } },
          { field: { Name: "date_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "type_c" } }
        ],
        orderBy: [
          {
            fieldName: "date_c",
            sorttype: "DESC"
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(t => ({
        ...t,
        amount: t.amount_c,
        category: t.category_c,
        date: t.date_c,
        description: t.description_c,
        notes: t.notes_c,
        type: t.type_c
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error?.response?.data?.message || error);
      return [];
    }
  }

async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById(this.tableName, id, {
        fields: [
          { field: { Name: "amount_c" } },
          { field: { Name: "category_c" }, referenceField: { field: { Name: "name_c" } } },
          { field: { Name: "date_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "type_c" } }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(`Transaction with Id ${id} not found`);
      }

      const t = response.data;
      return {
        ...t,
        amount: t.amount_c,
        category: t.category_c,
        date: t.date_c,
        description: t.description_c,
        notes: t.notes_c,
        type: t.type_c
      };
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

async create(transactionData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [
          {
            category_c: transactionData.category ? parseInt(transactionData.category) : null,
            type_c: transactionData.type,
            amount_c: transactionData.amount,
            date_c: transactionData.date,
            description_c: transactionData.description || null,
            notes_c: transactionData.notes || null
          }
        ]
      };

      const response = await apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} transactions:`, failed);
        }

        if (successful.length > 0) {
          const t = successful[0].data;
          return {
            ...t,
            amount: t.amount_c,
            category: t.category_c,
            date: t.date_c,
            description: t.description_c,
            notes: t.notes_c,
            type: t.type_c
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating transaction:", error?.response?.data?.message || error);
      throw error;
    }
  }

async update(id, transactionData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [
          {
            Id: id,
            category_c: transactionData.category ? parseInt(transactionData.category) : null,
            type_c: transactionData.type,
            amount_c: transactionData.amount,
            date_c: transactionData.date,
            description_c: transactionData.description || null,
            notes_c: transactionData.notes || null
          }
        ]
      };

      const response = await apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} transactions:`, failed);
        }

        if (successful.length > 0) {
          const t = successful[0].data;
          return {
            ...t,
            amount: t.amount_c,
            category: t.category_c,
            date: t.date_c,
            description: t.description_c,
            notes: t.notes_c,
            type: t.type_c
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating transaction:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete transaction:`, failed);
          throw new Error("Failed to delete transaction");
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting transaction:", error?.response?.data?.message || error);
      throw error;
    }
  }

async getByDateRange(startDate, endDate) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          { field: { Name: "amount_c" } },
          { field: { Name: "category_c" }, referenceField: { field: { Name: "name_c" } } },
          { field: { Name: "date_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "type_c" } }
        ],
        where: [
          {
            FieldName: "date_c",
            Operator: "GreaterThanOrEqualTo",
            Values: [startDate]
          },
          {
            FieldName: "date_c",
            Operator: "LessThanOrEqualTo",
            Values: [endDate]
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(t => ({
        ...t,
        amount: t.amount_c,
        category: t.category_c,
        date: t.date_c,
        description: t.description_c,
        notes: t.notes_c,
        type: t.type_c
      }));
    } catch (error) {
      console.error("Error fetching transactions by date range:", error?.response?.data?.message || error);
      return [];
    }
  }

async getByCategory(category) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          { field: { Name: "amount_c" } },
          { field: { Name: "category_c" }, referenceField: { field: { Name: "name_c" } } },
          { field: { Name: "date_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "type_c" } }
        ],
        where: [
          {
            FieldName: "category_c",
            Operator: "EqualTo",
            Values: [category]
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(t => ({
        ...t,
        amount: t.amount_c,
        category: t.category_c,
        date: t.date_c,
        description: t.description_c,
        notes: t.notes_c,
        type: t.type_c
      }));
    } catch (error) {
      console.error(`Error fetching transactions by category:`, error?.response?.data?.message || error);
      return [];
    }
  }

async getByType(type) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          { field: { Name: "amount_c" } },
          { field: { Name: "category_c" }, referenceField: { field: { Name: "name_c" } } },
          { field: { Name: "date_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "type_c" } }
        ],
        where: [
          {
            FieldName: "type_c",
            Operator: "EqualTo",
            Values: [type]
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(t => ({
        ...t,
        amount: t.amount_c,
        category: t.category_c,
        date: t.date_c,
        description: t.description_c,
        notes: t.notes_c,
        type: t.type_c
      }));
    } catch (error) {
      console.error(`Error fetching ${type} transactions:`, error?.response?.data?.message || error);
      return [];
    }
  }
}

export const transactionService = new TransactionService();