import { getApperClient } from "@/services/apperClient";

class GoalService {
  constructor() {
    this.tableName = "goal_c";
  }

  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          { field: { Name: "name_c" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "deadline_c" } }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(g => ({
        ...g,
        name: g.name_c,
        targetAmount: g.target_amount_c,
        currentAmount: g.current_amount_c,
        deadline: g.deadline_c
      }));
    } catch (error) {
      console.error("Error fetching goals:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById(this.tableName, id, {
        fields: [
          { field: { Name: "name_c" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "deadline_c" } }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        throw new Error(`Goal with Id ${id} not found`);
      }

      const g = response.data;
      return {
        ...g,
        name: g.name_c,
        targetAmount: g.target_amount_c,
        currentAmount: g.current_amount_c,
        deadline: g.deadline_c
      };
    } catch (error) {
      console.error(`Error fetching goal ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async create(goalData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [
          {
            Name: goalData.name || "Untitled Goal",
            name_c: goalData.name,
            target_amount_c: parseFloat(goalData.targetAmount),
            current_amount_c: parseFloat(goalData.currentAmount || 0),
            deadline_c: goalData.deadline
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
          console.error(`Failed to create ${failed.length} goals:`, failed);
        }

        if (successful.length > 0) {
          const g = successful[0].data;
          return {
            ...g,
            name: g.name_c,
            targetAmount: g.target_amount_c,
            currentAmount: g.current_amount_c,
            deadline: g.deadline_c
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating goal:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, goalData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: goalData.name || "Untitled Goal",
            name_c: goalData.name,
            target_amount_c: parseFloat(goalData.targetAmount),
            current_amount_c: parseFloat(goalData.currentAmount),
            deadline_c: goalData.deadline
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
          console.error(`Failed to update ${failed.length} goals:`, failed);
        }

        if (successful.length > 0) {
          const g = successful[0].data;
          return {
            ...g,
            name: g.name_c,
            targetAmount: g.target_amount_c,
            currentAmount: g.current_amount_c,
            deadline: g.deadline_c
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating goal:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete goal:`, failed);
          throw new Error("Failed to delete goal");
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting goal:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async getActiveGoals() {
    const goals = await this.getAll();
    return goals.filter(g => g.currentAmount < g.targetAmount);
  }

  async getCompletedGoals() {
    const goals = await this.getAll();
    return goals.filter(g => g.currentAmount >= g.targetAmount);
  }

  async addFunds(id, amount) {
    const goal = await this.getById(id);
    const newCurrentAmount = goal.currentAmount + parseFloat(amount);
    
    return this.update(id, {
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: newCurrentAmount,
      deadline: goal.deadline
    });
  }

  async getGoalProgress(id) {
    const goal = await this.getById(id);
    
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const remaining = goal.targetAmount - goal.currentAmount;
    const isCompleted = goal.currentAmount >= goal.targetAmount;
    
    return {
      progress: Math.min(progress, 100),
      remaining: Math.max(remaining, 0),
      isCompleted,
    };
  }
}

export const goalService = new GoalService();