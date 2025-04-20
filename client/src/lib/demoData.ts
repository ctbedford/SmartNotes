// Demo data provider for components when in demo mode
// This allows us to display the UI without requiring real Supabase authentication

import { useAuthStore } from "./stores";

// Check if we're in demo mode
export const isDemoMode = () => {
  const user = useAuthStore.getState().user;
  return user && user.id === "demo-user-id";
};

// Mock data for MandalaChart
export const getMockMandalaData = () => {
  return [
    { value_name: "Growth", resonate_count: 8 },
    { value_name: "Connection", resonate_count: 5 },
    { value_name: "Freedom", resonate_count: 7 },
    { value_name: "Creativity", resonate_count: 6 },
    { value_name: "Wisdom", resonate_count: 4 },
    { value_name: "Adventure", resonate_count: 3 },
  ];
};

// Mock data for RecentActivity
export const getMockXpActivity = () => {
  const now = new Date();
  return [
    {
      id: "xa1",
      delta: 50,
      source_description: "Completed a task",
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: "xa2",
      delta: 30,
      source_description: "Resonated with 'Growth'",
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
      id: "xa3",
      delta: 20,
      source_description: "Shared a capture",
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
  ];
};

// Mock data for RecentCaptures
export const getMockCaptures = () => {
  const now = new Date();
  return [
    {
      id: "c1",
      kind: "THOUGHT",
      body: "I should implement a new feature that allows users to tag captures with custom categories.",
      url: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      id: "c2",
      kind: "EXTERNAL_LINK",
      body: "Great article about productivity systems",
      url: "https://example.com/article",
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    },
    {
      id: "c3",
      kind: "THOUGHT",
      body: "Need to remember to update the dashboard design with more visualizations.",
      url: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    },
  ] as const;
};

// Mock data for Values
export const getMockValues = () => {
  return [
    {
      id: "v1",
      name: "Growth",
      description: "Continuously learning and evolving as a person",
      resonateCount: 8,
    },
    {
      id: "v2",
      name: "Connection",
      description: "Building meaningful relationships with others",
      resonateCount: 5,
    },
    {
      id: "v3",
      name: "Freedom",
      description: "Having autonomy and choice in life decisions",
      resonateCount: 7,
    },
    {
      id: "v4",
      name: "Creativity",
      description: "Expressing myself through innovation and imagination",
      resonateCount: 6,
    },
    {
      id: "v5",
      name: "Wisdom",
      description: "Seeking deeper understanding and making good judgments",
      resonateCount: 4,
    },
    {
      id: "v6",
      name: "Adventure",
      description: "Exploring new experiences and taking calculated risks",
      resonateCount: 3,
    },
  ];
};

// Mock data for Kanban tasks
export const getMockTasks = () => {
  const now = new Date();
  return [
    {
      id: "t1",
      title: "Design dashboard layout",
      status: "DONE",
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
      id: "t2",
      title: "Implement drag and drop for kanban board",
      status: "DOING",
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: "t3",
      title: "Add value resonance feature",
      status: "DOING",
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
      updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    },
    {
      id: "t4",
      title: "Create onboarding tutorial",
      status: "TODO",
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    },
    {
      id: "t5",
      title: "Implement user settings page",
      status: "TODO",
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    },
  ];
};

// Mock data for Feed
export const getMockFeedCaptures = () => {
  const now = new Date();
  return [
    {
      id: "fc1",
      kind: "THOUGHT",
      body: "Just had a great idea for improving our team's communication system through better async updates.",
      url: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    },
    {
      id: "fc2",
      kind: "EXTERNAL_LINK",
      body: "Fantastic article about mindfulness in the workplace",
      url: "https://example.com/mindfulness-article",
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    },
    {
      id: "fc3",
      kind: "THOUGHT",
      body: "Reflection after today's meeting: We should focus more on user feedback earlier in the development cycle.",
      url: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    },
    {
      id: "fc4",
      kind: "EXTERNAL_LINK",
      body: "Useful productivity framework that might help our team",
      url: "https://example.com/productivity-framework",
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      id: "fc5",
      kind: "THOUGHT",
      body: "Thinking about how we can better integrate our values into our daily work practices.",
      url: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    },
  ];
};