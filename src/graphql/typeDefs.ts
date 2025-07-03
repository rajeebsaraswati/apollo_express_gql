const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  directive @auth on FIELD_DEFINITION

  type Otp {
        id: ID!
        user_id: ID!
        otp: String!
        expires_at: String!
    }

    type AuthTokens {
        accessToken: String!
        refreshToken: String!
    }

    type AuthUser {
        id: ID!
        email: String!
        mobile_number: String!
    }

    type TokenInfo {
        user: AuthUser!        
        tokenType: String!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        mobile_number: String!
        password: String!
        email_verified_at: String
        mobile_number_verified_at: String
        profile: UserProfile
        topics: [Topic!]!
        communities: [Community!]!
    }

    type UserProfile {
        id: ID!
        user_id: ID!
        bio: String
        avatar_url: String
        handle: String!
        permanent_address: String!
        current_address: String!
    }

    type Category {
        id: ID!
        name: String!
        description: String
        created_at: String
        updated_at: String
        topics: [Topic]
    }

    type Topic {
        id: ID!
        name: String!
        description: String
        created_at: String
        updated_at: String
    }

    type Community {
        id: ID!
        owner_id: ID!
        name: String!
        logo: String
        description: String
        created_at: String
        updated_at: String
        members: [User!]!
    }

    input RegisterUserInput {
        name: String!
        email: String!
        mobile_number: String!
        password: String!
    }

    input CreateCommunityInput {
        name: String!
        description: String
        logo_url: String!
    }

    input CreateProfileInput {
        bio: String
        avatar_url: String
        handle: String!
        permanent_address: String!
        current_address: String!
        gender: String!
        topics: [ID!]
        communities: [ID!]
    }

    type Post {
        id: ID!
        user_id: ID!
        community_id: ID!
        topic_id: ID!
        title: String!
        content: String!
        image: String
        location_tag: String
        likes_count: Int!
        created_at: String!
        updated_at: String!
    }

    input CreatePostInput {
        community_id: ID!
        topic_id: ID!
        title: String!
        content: String!
        image: String
        location_tag: String
    }

    type Query {
        users: [User]
        me: User @auth
        verifyOtp(user_id: ID!, otp: String!): AuthTokens
        categories: [Category]
        topics: [Topic!]!
        communities: [Community]
        community(community_id: ID!): Community
        posts(community_id: ID!): [Post] @auth
    }

    type Mutation {
        registerUser(input: RegisterUserInput!): User!
        createProfile(createProfileInput: CreateProfileInput!): UserProfile! @auth
        generateOtp(mobile_number: String!): Otp!
        createCommunity(createCommunityInput: CreateCommunityInput!): Community! @auth
        createPost(createPostInput: CreatePostInput!): Post! @auth
    }
`;

export default typeDefs;