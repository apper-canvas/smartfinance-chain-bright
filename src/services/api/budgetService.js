import { getApperClient } from "@/services/apperClient";

class BudgetService {
  constructor() {
    this.tableName = "budget_c";
  }

  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          { field: { Name: "amount_c" } },
          { field: { Name: "month_c" } },
          { 
            field: { Name: "category_id_c" },
            referenceField: { field: { Name: "name_c" } }
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

return (response.data || []).map(b => ({
        ...b,
        amount: b.amount_c,
        month: b.month_c,
        categoryId: b.category_id_c?.Id || null,
        spent: 0
      }));
    } catch (error) {
      console.error("Error fetching budgets:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById(this.tableName, id, {
        fields: [
          { field: { Name: "amount_c" } },
          { field: { Name: "month_c" } },
          { 
            field: { Name: "category_id_c" },
            referenceField: { field: { Name: "name_c" } }
          }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(`Budget with Id ${id} not found`);
      }

const b = response.data;
      return {
        ...b,
        amount: b.amount_c,
        month: b.month_c,
        categoryId: b.category_id_c?.Id || null,
        spent: 0
      };
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async create(budgetData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [
          {
            Name: `Budget - ${budgetData.month}`,
            amount_c: parseFloat(budgetData.amount),
            month_c: budgetData.month,
            category_id_c: parseInt(budgetData.categoryId)
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
          console.error(`Failed to create ${failed.length} budgets:`, failed);
        }

if (successful.length > 0) {
          const b = successful[0].data;
          return {
            ...b,
            amount: b.amount_c,
            month: b.month_c,
            categoryId: b.category_id_c?.Id || null,
            spent: 0
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating budget:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, budgetData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: `Budget - ${budgetData.month}`,
            amount_c: parseFloat(budgetData.amount),
            month_c: budgetData.month,
            category_id_c: parseInt(budgetData.categoryId)
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
          console.error(`Failed to update ${failed.length} budgets:`, failed);
        }

if (successful.length > 0) {
          const b = successful[0].data;
          return {
            ...b,
            amount: b.amount_c,
            month: b.month_c,
            categoryId: b.category_id_c?.Id || null,
            spent: 0
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating budget:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete budget:`, failed);
          throw new Error("Failed to delete budget");
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting budget:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async getByMonth(month) {
    const budgets = await this.getAll();
    return budgets.filter(b => b.month === month);
  }

  async getByCategory(categoryId) {
    const budgets = await this.getAll();
    return budgets.filter(b => b.categoryId === categoryId);
  }

  async getByCategoryAndMonth(categoryId, month) {
    const budgets = await this.getAll();
    return budgets.find(b => b.categoryId === categoryId && b.month === month);
  }

  async updateSpentAmount(id, spentAmount) {
    const budget = await this.getById(id);
    budget.spent = spentAmount;
    return budget;
  }
}

export const budgetService = new BudgetService();