import { GET_OTP_BY_USER_ID, INSERT_INTO_OTPS, INSERT_INTO_USERS, GET_USER_BY_ID, GET_USER_BY_MOBILE_NUMBER, GET_USER_BY_EMAIL, GET_ALL_CATEGORIES, GET_TOPICS_BY_CATEGORY_ID, INSERT_INTO_USER_PROFILE, GET_USER_PROFILE_BY_USER_ID, INSERT_INTO_COMMUNITIES, GET_COMMUNITY_BY_ID, GET_LATEST_COMMUNITY_BY_OWNER_ID, GET_ALL_COMMUNITIES, GET_TOPICS_BY_USER_ID, GET_COMMUNITIES_BY_USER_ID, GET_USERS_BY_COMMUNITY_ID, ADD_USER_TO_TOPIC, ADD_USER_TO_COMMUNITY, INSERT_INTO_POSTS, GET_LAST_INSERT_ID, GET_POST_BY_ID, GET_ALL_TOPICS, GET_POSTS_BY_USER_AND_COMMUNITY, } from '../database-queries.js';
import { generateJwtPair, generateOtp, getOtpExpiryDate, isOtpExpired, } from '../utils.js';
const DELAY = 2 * 1000;
const resolvers = {
    Query: {
        users: async (_, __, context) => {
            return context.db.all('SELECT * FROM users');
        },
        me: async (_, __, context) => {
            if (!context.auth.user) {
                throw new Error('Not authenticated');
            }
            const user = await context.db.get(GET_USER_BY_ID, [context.auth.user.id]);
            return user;
        },
        verifyOtp: async (_, { user_id, otp }, context) => {
            const otpRecord = await context.db.get(GET_OTP_BY_USER_ID, [user_id]);
            if (!otpRecord) {
                throw new Error('No OTP generated for this number.');
            }
            if (otpRecord.otp === otp && !isOtpExpired(otpRecord)) {
                const user = await context.db.get(GET_USER_BY_ID, [user_id]);
                const tokens = generateJwtPair({
                    id: user.id,
                    email: user.email,
                    mobile_number: user.mobile_number
                });
                return tokens;
            }
            else {
                throw new Error('Invalid/wrong OTP.');
            }
        },
        categories: async (_, __, context) => {
            return context.db.all(GET_ALL_CATEGORIES);
        },
        topics: async (_, __, context) => {
            return context.db.all(GET_ALL_TOPICS);
        },
        communities: async (_, __, context) => {
            return context.db.all(GET_ALL_COMMUNITIES);
        },
        community: async (_, { community_id }, context) => {
            return context.db.get(GET_COMMUNITY_BY_ID, [community_id]);
        },
        posts: async (_, { community_id }, context) => {
            if (!context.auth.user) {
                throw new Error('Not authenticated');
            }
            const posts = await context.db.all(GET_POSTS_BY_USER_AND_COMMUNITY, [context.auth.user.id, community_id]);
            return posts;
        }
    },
    Mutation: {
        registerUser: async (_, { input }, context) => {
            const existingUser = await context.db.get(GET_USER_BY_EMAIL, [input.email]);
            if (existingUser) {
                throw new Error('A user with this email already exists.');
            }
            await context.db.run(INSERT_INTO_USERS, [input.name, input.email, input.mobile_number, input.password]);
            const newUser = await context.db.get(GET_USER_BY_EMAIL, [input.email]);
            return newUser;
        },
        createProfile: async (_, { createProfileInput }, context) => {
            if (!context.auth.user) {
                throw new Error('Not authenticated');
            }
            try {
                const existingProfile = await context.db.get(GET_USER_PROFILE_BY_USER_ID, [context.auth.user.id]);
                if (existingProfile) {
                    throw new Error("User profile already exists!");
                }
                else {
                    await context.db.run(INSERT_INTO_USER_PROFILE, [
                        context.auth.user.id,
                        createProfileInput.bio,
                        createProfileInput.avatar_url,
                        createProfileInput.handle,
                        createProfileInput.permanent_address,
                        createProfileInput.current_address,
                        createProfileInput.gender,
                    ]);
                    if (undefined !== createProfileInput.topics) {
                        createProfileInput.topics.forEach(async (topic_id) => {
                            try {
                                await context.db.run(ADD_USER_TO_TOPIC, [context.auth.user.id, topic_id]);
                            }
                            catch (error) {
                                console.log(error);
                            }
                        });
                    }
                    if (undefined !== createProfileInput.communities) {
                        createProfileInput.communities.forEach(async (community_id) => {
                            try {
                                await context.db.run(ADD_USER_TO_COMMUNITY, [context.auth.user.id, community_id]);
                            }
                            catch (error) {
                                console.log(error);
                            }
                        });
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
            const userProfile = await context.db.get(GET_USER_PROFILE_BY_USER_ID, [context.auth.user.id]);
            return userProfile;
        },
        generateOtp: async (_, { mobile_number }, context) => {
            const user = await context.db.get(GET_USER_BY_MOBILE_NUMBER, [mobile_number]);
            if (!user) {
                throw new Error('User with this mobile number does not exist.');
            }
            const otpRecord = await context.db.get(GET_OTP_BY_USER_ID, [user.id]);
            if (otpRecord && !isOtpExpired(otpRecord)) {
                return otpRecord;
            }
            const otp = generateOtp();
            const expiresAt = getOtpExpiryDate();
            await context.db.run(INSERT_INTO_OTPS, [user.id, otp, expiresAt]);
            const newOtpRecord = await context.db.get(GET_OTP_BY_USER_ID, [user.id]);
            return newOtpRecord;
        },
        createCommunity: async (_, { createCommunityInput }, context) => {
            if (!context.auth.user) {
                throw new Error('Not authenticated');
            }
            await context.db.run(INSERT_INTO_COMMUNITIES, [
                context.auth.user.id,
                createCommunityInput.name,
                createCommunityInput.description,
                createCommunityInput.logo_url
            ]);
            const community = await context.db.get(GET_LATEST_COMMUNITY_BY_OWNER_ID, [context.auth.user.id]);
            await context.db.run(ADD_USER_TO_COMMUNITY, [context.auth.user.id, community.id]);
            return community;
        },
        createPost: async (_, { createPostInput }, context) => {
            if (!context.auth.user) {
                throw new Error('Not authenticated');
            }
            await context.db.run(INSERT_INTO_POSTS, [
                context.auth.user.id,
                createPostInput.community_id,
                createPostInput.topic_id,
                createPostInput.title,
                createPostInput.content,
                createPostInput.image,
                createPostInput.location_tag,
            ]);
            const newPostId = await context.db.get(GET_LAST_INSERT_ID);
            const newPost = await context.db.get(GET_POST_BY_ID, [newPostId.id]);
            return newPost;
        },
    },
    Category: {
        topics: async (parent, _, context) => {
            return context.db.all(GET_TOPICS_BY_CATEGORY_ID, [parent.id]);
        }
    },
    User: {
        profile: async (parent, _, context) => {
            return context.db.get(GET_USER_PROFILE_BY_USER_ID, [parent.id]);
        },
        topics: async (parent, _, context) => {
            return context.db.all(GET_TOPICS_BY_USER_ID, [parent.id]);
        },
        communities: async (parent, _, context) => {
            return context.db.all(GET_COMMUNITIES_BY_USER_ID, [parent.id]);
        }
    },
    Community: {
        members: async (parent, _, context) => {
            return context.db.all(GET_USERS_BY_COMMUNITY_ID, [parent.id]);
        },
    }
};
export default resolvers;
