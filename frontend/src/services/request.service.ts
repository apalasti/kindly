import { api } from "./api";
import type {
  Request,
  RequestType,
  RequestFilters,
  CreateRequestData,
  UpdateRequestData,
  RequestApplication,
} from "../types";
import type { ApiResponse, PaginatedResponse } from "../types";

// ============================================
// MOCK MODE - Set to false when backend is ready
// ============================================
const USE_MOCK = true;

// Mock delay to simulate network request
const mockDelay = (ms: number = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock request types
const mockRequestTypes: RequestType[] = [
  { id: 1, name: "Grocery Shopping" },
  { id: 2, name: "Transportation" },
  { id: 3, name: "Home Repair" },
  { id: 4, name: "Heavy Lifting" },
  { id: 5, name: "Pet Care" },
  { id: 6, name: "Gardening" },
  { id: 7, name: "Technology Help" },
  { id: 8, name: "Companionship" },
];

// Mock requests data
const generateMockRequests = (): Request[] => {
  const now = new Date();
  const requests: Request[] = [
    {
      id: 1,
      name: "Need help with grocery shopping",
      description:
        "I need someone to help me carry groceries from the store to my apartment on the 3rd floor.",
      longitude: -122.4194,
      latitude: 37.7749,
      location_address: "123 Market St, San Francisco, CA 94103",
      start: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ).toISOString(),
      reward: 20,
      creator_id: 1,
      creator: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        date_of_birth: "1950-05-15",
        about_me: "Retired teacher needing occasional help",
        is_volunteer: false,
        avg_rating: 4.5,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[0], mockRequestTypes[3]],
      applications_count: 3,
      applications: [
        {
          user: {
            id: 10,
            name: "Bob Wilson",
            avg_rating: 4.7,
          },
          is_accepted: false,
          applied_at: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          user: {
            id: 11,
            name: "Alice Johnson",
            avg_rating: 4.9,
          },
          is_accepted: false,
          applied_at: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          user: {
            id: 12,
            name: "Charlie Brown",
            avg_rating: 4.6,
          },
          is_accepted: false,
          applied_at: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          user: {
            id: 13,
            name: "Janet Lee",
            avg_rating: 4.6,
          },
          is_accepted: false,
          applied_at: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          user: {
            id: 14,
            name: "Bruce Wayne",
            avg_rating: 4.6,
          },
          is_accepted: false,
          applied_at: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ],
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 5 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 5 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 2,
      name: "Doctor's appointment transportation",
      description:
        "Need a ride to my doctor's appointment downtown and back home. The appointment should take about an hour.",
      longitude: -122.4084,
      latitude: 37.7849,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 1 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
      ).toISOString(),
      reward: 35,
      creator_id: 1,
      creator: {
        id: 2,
        name: "Mary Smith",
        email: "mary@example.com",
        date_of_birth: "1945-08-20",
        about_me: "Living independently but need occasional assistance",
        is_volunteer: false,
        avg_rating: 4.8,
        created_at: "2024-01-10T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[1]],
      applications_count: 5,
      accepted_volunteer: {
        id: 10,
        name: "Bob Wilson",
        email: "bob@example.com",
        date_of_birth: "1985-03-10",
        about_me: "Happy to help!",
        is_volunteer: true,
        avg_rating: 4.7,
        created_at: "2024-01-10T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      has_applied: true,
      created_at: new Date(
        now.getTime() - 3 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 3,
      name: "Fix leaky kitchen faucet",
      description:
        "My kitchen faucet has been dripping for weeks. Need someone with basic plumbing skills to help fix it.",
      longitude: -122.4294,
      latitude: 37.7649,
      start: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ).toISOString(),
      reward: 50,
      creator_id: 1,
      creator: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        date_of_birth: "1950-05-15",
        about_me: "Retired teacher needing occasional help",
        is_volunteer: false,
        avg_rating: 4.5,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: true,
      request_types: [mockRequestTypes[2]],
      applications_count: 2,
      accepted_volunteer: {
        id: 11,
        name: "Alice Johnson",
        email: "alice@example.com",
        date_of_birth: "1990-07-22",
        about_me: "Handy with tools!",
        is_volunteer: true,
        avg_rating: 4.9,
        created_at: "2024-01-10T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      has_applied: false,
      created_at: new Date(
        now.getTime() - 10 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 1 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 4,
      name: "Move furniture to new apartment",
      description:
        "Moving to a new apartment in the same building. Need help carrying heavy furniture.",
      longitude: -122.4194,
      latitude: 37.7749,
      start: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
      ).toISOString(),
      reward: 75,
      creator_id: 3,
      creator: {
        id: 3,
        name: "Robert Brown",
        email: "robert@example.com",
        date_of_birth: "1955-12-01",
        about_me: "Recently retired, staying active",
        is_volunteer: false,
        avg_rating: 4.3,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[3]],
      applications_count: 8,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 5,
      name: "Walk my dog while I recover",
      description:
        "Recovering from surgery and can't walk my golden retriever for the next week. Need daily walks.",
      longitude: -122.4094,
      latitude: 37.7849,
      start: new Date(now.getTime()).toISOString(),
      end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 15,
      creator_id: 2,
      creator: {
        id: 2,
        name: "Mary Smith",
        email: "mary@example.com",
        date_of_birth: "1945-08-20",
        about_me: "Living independently but need occasional assistance",
        is_volunteer: false,
        avg_rating: 4.8,
        created_at: "2024-01-10T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [
        mockRequestTypes[4],
        mockRequestTypes[4],
        mockRequestTypes[4],
        mockRequestTypes[4],
        mockRequestTypes[4],
        mockRequestTypes[4],
        mockRequestTypes[4],
      ],
      applications_count: 0,
      accepted_volunteer: null,
      has_applied: true,
      created_at: new Date(
        now.getTime() - 1 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 1 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 6,
      name: "Help with garden maintenance",
      description:
        "My garden needs weeding and general maintenance. Looking for someone who enjoys gardening.",
      longitude: -122.4294,
      latitude: 37.7549,
      start: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
      ).toISOString(),
      reward: 40,
      creator_id: 1,
      creator: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        date_of_birth: "1950-05-15",
        about_me: "Retired teacher needing occasional help",
        is_volunteer: false,
        avg_rating: 4.5,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: true,
      request_types: [mockRequestTypes[5]],
      applications_count: 4,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 15 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 3 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 7,
      name: "Computer setup assistance",
      description:
        "Just got a new computer and need help setting it up and transferring files from my old one.",
      longitude: -122.4194,
      latitude: 37.7649,
      start: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ).toISOString(),
      reward: 30,
      creator_id: 4,
      creator: {
        id: 4,
        name: "Susan Davis",
        email: "susan@example.com",
        date_of_birth: "1948-03-25",
        about_me: "Learning new technology!",
        is_volunteer: false,
        avg_rating: 4.6,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[6]],
      applications_count: 2,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 4 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 4 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 8,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 9,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 10,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 11,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 12,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 13,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 14,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 15,
      name: "Help with garden maintenance",
      description:
        "My garden needs weeding and general maintenance. Looking for someone who enjoys gardening.",
      longitude: -122.4294,
      latitude: 37.7549,
      start: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
      ).toISOString(),
      reward: 40,
      creator_id: 1,
      creator: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        date_of_birth: "1950-05-15",
        about_me: "Retired teacher needing occasional help",
        is_volunteer: false,
        avg_rating: 4.5,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: true,
      request_types: [mockRequestTypes[5]],
      applications_count: 4,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 15 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 3 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 16,
      name: "Computer setup assistance",
      description:
        "Just got a new computer and need help setting it up and transferring files from my old one.",
      longitude: -122.4194,
      latitude: 37.7649,
      start: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ).toISOString(),
      reward: 30,
      creator_id: 4,
      creator: {
        id: 4,
        name: "Susan Davis",
        email: "susan@example.com",
        date_of_birth: "1948-03-25",
        about_me: "Learning new technology!",
        is_volunteer: false,
        avg_rating: 4.6,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[6]],
      applications_count: 2,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 4 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 4 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 17,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 18,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 19,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 20,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 21,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 22,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 23,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 1,
      name: "Need help with grocery shopping",
      description:
        "I need someone to help me carry groceries from the store to my apartment on the 3rd floor.",
      longitude: -122.4194,
      latitude: 37.7749,
      start: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ).toISOString(),
      reward: 20,
      creator_id: 1,
      creator: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        date_of_birth: "1950-05-15",
        about_me: "Retired teacher needing occasional help",
        is_volunteer: false,
        avg_rating: 4.5,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[0], mockRequestTypes[3]],
      applications_count: 3,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 5 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 5 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 2,
      name: "Doctor's appointment transportation",
      description:
        "Need a ride to my doctor's appointment downtown and back home. The appointment should take about an hour.",
      longitude: -122.4084,
      latitude: 37.7849,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 1 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
      ).toISOString(),
      reward: 35,
      creator_id: 2,
      creator: {
        id: 2,
        name: "Mary Smith",
        email: "mary@example.com",
        date_of_birth: "1945-08-20",
        about_me: "Living independently but need occasional assistance",
        is_volunteer: false,
        avg_rating: 4.8,
        created_at: "2024-01-10T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[1]],
      applications_count: 5,
      accepted_volunteer: {
        id: 10,
        name: "Bob Wilson",
        email: "bob@example.com",
        date_of_birth: "1985-03-10",
        about_me: "Happy to help!",
        is_volunteer: true,
        avg_rating: 4.7,
        created_at: "2024-01-10T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      has_applied: true,
      created_at: new Date(
        now.getTime() - 3 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 3,
      name: "Fix leaky kitchen faucet",
      description:
        "My kitchen faucet has been dripping for weeks. Need someone with basic plumbing skills to help fix it.",
      longitude: -122.4294,
      latitude: 37.7649,
      start: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ).toISOString(),
      reward: 50,
      creator_id: 1,
      creator: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        date_of_birth: "1950-05-15",
        about_me: "Retired teacher needing occasional help",
        is_volunteer: false,
        avg_rating: 4.5,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: true,
      request_types: [mockRequestTypes[2]],
      applications_count: 2,
      accepted_volunteer: {
        id: 11,
        name: "Alice Johnson",
        email: "alice@example.com",
        date_of_birth: "1990-07-22",
        about_me: "Handy with tools!",
        is_volunteer: true,
        avg_rating: 4.9,
        created_at: "2024-01-10T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      has_applied: false,
      created_at: new Date(
        now.getTime() - 10 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 1 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 4,
      name: "Move furniture to new apartment",
      description:
        "Moving to a new apartment in the same building. Need help carrying heavy furniture.",
      longitude: -122.4194,
      latitude: 37.7749,
      start: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
      ).toISOString(),
      reward: 75,
      creator_id: 3,
      creator: {
        id: 3,
        name: "Robert Brown",
        email: "robert@example.com",
        date_of_birth: "1955-12-01",
        about_me: "Recently retired, staying active",
        is_volunteer: false,
        avg_rating: 4.3,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[3]],
      applications_count: 8,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 5,
      name: "Walk my dog while I recover",
      description:
        "Recovering from surgery and can't walk my golden retriever for the next week. Need daily walks.",
      longitude: -122.4094,
      latitude: 37.7849,
      start: new Date(now.getTime()).toISOString(),
      end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 15,
      creator_id: 2,
      creator: {
        id: 2,
        name: "Mary Smith",
        email: "mary@example.com",
        date_of_birth: "1945-08-20",
        about_me: "Living independently but need occasional assistance",
        is_volunteer: false,
        avg_rating: 4.8,
        created_at: "2024-01-10T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[4]],
      applications_count: 6,
      accepted_volunteer: null,
      has_applied: true,
      created_at: new Date(
        now.getTime() - 1 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 1 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 6,
      name: "Help with garden maintenance",
      description:
        "My garden needs weeding and general maintenance. Looking for someone who enjoys gardening.",
      longitude: -122.4294,
      latitude: 37.7549,
      start: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
      ).toISOString(),
      reward: 40,
      creator_id: 1,
      creator: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        date_of_birth: "1950-05-15",
        about_me: "Retired teacher needing occasional help",
        is_volunteer: false,
        avg_rating: 4.5,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: true,
      request_types: [mockRequestTypes[5]],
      applications_count: 4,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 15 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 3 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 7,
      name: "Computer setup assistance",
      description:
        "Just got a new computer and need help setting it up and transferring files from my old one.",
      longitude: -122.4194,
      latitude: 37.7649,
      start: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ).toISOString(),
      reward: 30,
      creator_id: 4,
      creator: {
        id: 4,
        name: "Susan Davis",
        email: "susan@example.com",
        date_of_birth: "1948-03-25",
        about_me: "Learning new technology!",
        is_volunteer: false,
        avg_rating: 4.6,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[6]],
      applications_count: 2,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 4 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 4 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 8,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 9,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 10,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 11,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 12,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 13,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 14,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 15,
      name: "Help with garden maintenance",
      description:
        "My garden needs weeding and general maintenance. Looking for someone who enjoys gardening.",
      longitude: -122.4294,
      latitude: 37.7549,
      start: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
      ).toISOString(),
      reward: 40,
      creator_id: 1,
      creator: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        date_of_birth: "1950-05-15",
        about_me: "Retired teacher needing occasional help",
        is_volunteer: false,
        avg_rating: 4.5,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: true,
      request_types: [mockRequestTypes[5]],
      applications_count: 4,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 15 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 3 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 16,
      name: "Computer setup assistance",
      description:
        "Just got a new computer and need help setting it up and transferring files from my old one.",
      longitude: -122.4194,
      latitude: 37.7649,
      start: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(
        now.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ).toISOString(),
      reward: 30,
      creator_id: 4,
      creator: {
        id: 4,
        name: "Susan Davis",
        email: "susan@example.com",
        date_of_birth: "1948-03-25",
        about_me: "Learning new technology!",
        is_volunteer: false,
        avg_rating: 4.6,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[6]],
      applications_count: 2,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 4 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 4 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 17,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 18,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 19,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 20,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 21,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 22,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: 23,
      name: "Companion for weekly coffee chat",
      description:
        "Looking for someone to have coffee and chat once a week. I enjoy discussing books and current events.",
      longitude: -122.4094,
      latitude: 37.7749,
      start: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 0,
      creator_id: 5,
      creator: {
        id: 5,
        name: "George Wilson",
        email: "george@example.com",
        date_of_birth: "1940-11-10",
        about_me: "Retired professor, love good conversations",
        is_volunteer: false,
        avg_rating: 5.0,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
      },
      is_completed: false,
      request_types: [mockRequestTypes[7]],
      applications_count: 10,
      accepted_volunteer: null,
      has_applied: false,
      created_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 6 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
  ];

  return requests;
};

const mockRequests = generateMockRequests();

// Get current user from localStorage (mock)
const getCurrentUser = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  // Mock user data based on token
  return {
    id: 1,
    is_volunteer: token.includes("volunteer") ?? false,
  };
};

export const requestService = {
  // Common endpoints
  getRequestTypes: async (): Promise<ApiResponse<RequestType[]>> => {
    if (USE_MOCK) {
      await mockDelay(500);
      return {
        success: true,
        data: mockRequestTypes,
      };
    }

    const response = await api.get<ApiResponse<RequestType[]>>(
      "/common/request-types"
    );
    return response.data;
  },

  // Help Seeker endpoints
  getMyRequests: async (
    filters: RequestFilters
  ): Promise<PaginatedResponse<Request>> => {
    if (USE_MOCK) {
      await mockDelay(600);

      let filtered = mockRequests.filter((r) => r.creator_id === 1);

      console.log("Filters applied:", filters);

      // Apply status filter
      if (filters.status && filters.status !== "all") {
        if (filters.status === "completed") {
          filtered = filtered.filter((r) => r.is_completed);
        } else if (filters.status === "open") {
          filtered = filtered.filter((r) => !r.is_completed);
        }
      }

      console.log("Filtered requests:", filtered);

      // Apply sorting
      const sortField = filters.sort || "created_at";
      const sortOrder = filters.order || "desc";
      filtered.sort((a, b) => {
        let aVal = a[sortField as keyof Request];
        let bVal = b[sortField as keyof Request];

        if (typeof aVal === "string") aVal = new Date(aVal).getTime();
        if (typeof bVal === "string") bVal = new Date(bVal).getTime();

        if (sortOrder === "asc") {
          return (aVal as number) - (bVal as number);
        } else {
          return (bVal as number) - (aVal as number);
        }
      });

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = filtered.slice(start, end);

      return {
        success: true,
        data: paginated,
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
        },
      };
    }

    const response = await api.get<PaginatedResponse<Request>>(
      "/help-seeker/requests",
      {
        params: filters,
      }
    );
    return response.data;
  },

  createRequest: async (
    data: CreateRequestData
  ): Promise<ApiResponse<Request>> => {
    if (USE_MOCK) {
      await mockDelay(800);
      const newRequest: Request = {
        id: mockRequests.length + 1,
        ...data,
        creator_id: getCurrentUser()?.id || 1,
        is_completed: false,
        request_types: data.request_type_ids.map(
          (id) => mockRequestTypes.find((t) => t.id === id)!
        ),
        applications_count: 0,
        accepted_volunteer: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockRequests.push(newRequest);
      return {
        success: true,
        data: newRequest,
        message: "Request created successfully",
      };
    }

    const response = await api.post<ApiResponse<Request>>(
      "/help-seeker/requests",
      data
    );
    return response.data;
  },

  // Volunteer endpoints
  browseRequests: async (
    filters: RequestFilters
  ): Promise<PaginatedResponse<Request>> => {
    if (USE_MOCK) {
      await mockDelay(600);

      let filtered = [...mockRequests];

      // Apply location filter (radius-based)
      if (filters.location_lat && filters.location_lng && filters.radius) {
        const centerLat = filters.location_lat;
        const centerLng = filters.location_lng;
        const radiusKm = filters.radius;

        filtered = filtered.filter((r) => {
          if (!r.latitude || !r.longitude) return false;

          // Calculate distance using Haversine formula
          const R = 6371; // Earth's radius in km
          const dLat = ((r.latitude - centerLat) * Math.PI) / 180;
          const dLon = ((r.longitude - centerLng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((centerLat * Math.PI) / 180) *
              Math.cos((r.latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          return distance <= radiusKm;
        });
      }

      // Apply status filter
      if (filters.status && filters.status !== "all") {
        if (filters.status === "completed") {
          filtered = filtered.filter((r) => r.is_completed);
        } else if (filters.status === "open") {
          filtered = filtered.filter((r) => !r.is_completed);
        } else if (filters.status === "applied") {
          filtered = filtered.filter((r) => r.has_applied);
        }
      }

      // Apply type filter
      if (filters.type) {
        filtered = filtered.filter((r) =>
          r.request_types.some((t) => t.id === filters.type)
        );
      }

      // Apply reward filters
      if (filters.min_reward !== undefined) {
        filtered = filtered.filter((r) => r.reward >= filters.min_reward!);
      }
      if (filters.max_reward !== undefined) {
        filtered = filtered.filter((r) => r.reward <= filters.max_reward!);
      }

      // Apply sorting
      const sortField = filters.sort || "start";
      const sortOrder = filters.order || "asc";
      filtered.sort((a, b) => {
        let aVal = a[sortField as keyof Request];
        let bVal = b[sortField as keyof Request];

        if (typeof aVal === "string") aVal = new Date(aVal).getTime();
        if (typeof bVal === "string") bVal = new Date(bVal).getTime();

        if (sortOrder === "asc") {
          return (aVal as number) - (bVal as number);
        } else {
          return (bVal as number) - (aVal as number);
        }
      });

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = filtered.slice(start, end);

      return {
        success: true,
        data: paginated,
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
        },
      };
    }

    const response = await api.get<PaginatedResponse<Request>>(
      "/volunteer/requests",
      {
        params: filters,
      }
    );
    return response.data;
  },

  getRequestDetails: async (
    id: number,
    isVolunteer: boolean
  ): Promise<ApiResponse<Request>> => {
    if (USE_MOCK) {
      await mockDelay(500);
      const request = mockRequests.find((r) => r.id === id);
      if (!request) {
        throw new Error("Request not found");
      }

      // Include applications for help-seekers (creators)
      const requestWithApplications = { ...request };
      if (!isVolunteer) {
        const mockApplications: RequestApplication[] = [
          {
            user: {
              id: 10,
              name: "Bob Wilson",
              avg_rating: 4.7,
            },
            is_accepted: false,
            applied_at: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            user: {
              id: 11,
              name: "Alice Johnson",
              avg_rating: 4.9,
            },
            is_accepted: false,
            applied_at: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            user: {
              id: 12,
              name: "Charlie Brown",
              avg_rating: 4.6,
            },
            is_accepted: false,
            applied_at: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            user: {
              id: 13,
              name: "Janet Lee",
              avg_rating: 4.6,
            },
            is_accepted: false,
            applied_at: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            user: {
              id: 14,
              name: "Bruce Wayne",
              avg_rating: 4.6,
            },
            is_accepted: false,
            applied_at: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ];
        requestWithApplications.applications = mockApplications;
      }

      return {
        success: true,
        data: requestWithApplications,
      };
    }

    const endpoint = isVolunteer
      ? `/volunteer/requests/${id}`
      : `/help-seeker/requests/${id}`;
    const response = await api.get<ApiResponse<Request>>(endpoint);
    return response.data;
  },

  getApplications: async (
    requestId: number
  ): Promise<ApiResponse<RequestApplication[]>> => {
    if (USE_MOCK) {
      await mockDelay(500);
      const mockApplications: RequestApplication[] = [
        {
          user: {
            id: 10,
            name: "Bob Wilson",
            avg_rating: 4.7,
          },
          is_accepted: false,
          applied_at: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          user: {
            id: 11,
            name: "Alice Johnson",
            avg_rating: 4.9,
          },
          is_accepted: false,
          applied_at: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ];
      return {
        success: true,
        data: mockApplications,
      };
    }

    const response = await api.get<ApiResponse<RequestApplication[]>>(
      `/help-seeker/requests/${requestId}/applications`
    );
    return response.data;
  },

  // Update request
  updateRequest: async (
    id: number,
    data: UpdateRequestData
  ): Promise<ApiResponse<Request>> => {
    if (USE_MOCK) {
      await mockDelay(800);
      const requestIndex = mockRequests.findIndex((r) => r.id === id);
      if (requestIndex === -1) {
        throw new Error("Request not found");
      }

      const updatedRequest = {
        ...mockRequests[requestIndex],
        ...data,
        request_types: data.request_type_ids
          ? data.request_type_ids.map(
              (id) => mockRequestTypes.find((t) => t.id === id)!
            )
          : mockRequests[requestIndex].request_types,
        updated_at: new Date().toISOString(),
      };

      mockRequests[requestIndex] = updatedRequest;

      return {
        success: true,
        data: updatedRequest,
        message: "Request updated successfully",
      };
    }

    const response = await api.put<ApiResponse<Request>>(
      `/help-seeker/requests/${id}`,
      data
    );
    return response.data;
  },

  // Delete request
  deleteRequest: async (id: number): Promise<ApiResponse<void>> => {
    if (USE_MOCK) {
      await mockDelay(800);
      const requestIndex = mockRequests.findIndex((r) => r.id === id);
      if (requestIndex === -1) {
        throw new Error("Request not found");
      }

      mockRequests.splice(requestIndex, 1);

      return {
        success: true,
        data: undefined,
        message: "Request deleted successfully",
      };
    }

    const response = await api.delete<ApiResponse<void>>(
      `/help-seeker/requests/${id}`
    );
    return response.data;
  },

  // Suggest request types based on AI
  suggestRequestTypes: async (data: {
    name: string;
    description: string;
  }): Promise<ApiResponse<any[]>> => {
    if (USE_MOCK) {
      await mockDelay(1000);

      // Mock AI suggestions based on keywords
      const text = `${data.name} ${data.description}`.toLowerCase();
      const suggestions = [];

      if (text.includes("grocery") || text.includes("shopping")) {
        suggestions.push({
          id: 1,
          name: "Grocery Shopping",
          confidence: 0.95,
          reasoning: "Request mentions grocery shopping",
        });
      }

      if (
        text.includes("transport") ||
        text.includes("ride") ||
        text.includes("drive")
      ) {
        suggestions.push({
          id: 2,
          name: "Transportation",
          confidence: 0.85,
          reasoning: "Request involves transportation",
        });
      }

      if (
        text.includes("repair") ||
        text.includes("fix") ||
        text.includes("broken")
      ) {
        suggestions.push({
          id: 3,
          name: "Home Repair",
          confidence: 0.8,
          reasoning: "Request mentions repairs",
        });
      }

      if (
        text.includes("heavy") ||
        text.includes("lift") ||
        text.includes("move") ||
        text.includes("furniture")
      ) {
        suggestions.push({
          id: 4,
          name: "Heavy Lifting",
          confidence: 0.75,
          reasoning: "Request involves heavy lifting",
        });
      }

      if (
        text.includes("pet") ||
        text.includes("dog") ||
        text.includes("cat") ||
        text.includes("walk")
      ) {
        suggestions.push({
          id: 5,
          name: "Pet Care",
          confidence: 0.9,
          reasoning: "Request mentions pet care",
        });
        suggestions.push({
          id: 6,
          name: "Gardening",
          confidence: 0.85,
          reasoning: "Request involves gardening",
        });
      }

      if (
        text.includes("garden") ||
        text.includes("plant") ||
        text.includes("yard")
      ) {
        suggestions.push({
          id: 6,
          name: "Gardening",
          confidence: 0.85,
          reasoning: "Request involves gardening",
        });
      }

      if (
        text.includes("computer") ||
        text.includes("tech") ||
        text.includes("phone") ||
        text.includes("internet")
      ) {
        suggestions.push({
          id: 7,
          name: "Technology Help",
          confidence: 0.8,
          reasoning: "Request involves technology",
        });
      }

      if (
        text.includes("companion") ||
        text.includes("chat") ||
        text.includes("talk") ||
        text.includes("visit")
      ) {
        suggestions.push({
          id: 8,
          name: "Companionship",
          confidence: 0.9,
          reasoning: "Request involves companionship",
        });
      }

      // Sort by confidence
      suggestions.sort((a, b) => b.confidence - a.confidence);

      return {
        success: true,
        data: suggestions.slice(0, 3), // Return top 3 suggestions
      };
    }

    const response = await api.post<ApiResponse<any[]>>(
      "/help-seeker/requests/suggest-type",
      data
    );
    return response.data;
  },
};
