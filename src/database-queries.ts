export const GET_LAST_INSERT_ID = `
    SELECT last_insert_rowid() as id;
`;

export const INSERT_INTO_USERS = `
    INSERT INTO users (name, email, mobile_number, password)
    VALUES (?, ?, ?, ?);
`;

export const GET_USER_BY_MOBILE_NUMBER = `
    SELECT * FROM users WHERE mobile_number = ? LIMIT 1;
`;

export const GET_USER_BY_EMAIL = `
    SELECT * FROM users WHERE email = ? LIMIT 1;
`;

export const GET_USER_BY_ID = `
    SELECT * FROM users WHERE id = ?;
`;

export const GET_OTP_BY_USER_ID = `
    SELECT * FROM otps WHERE user_id = ? 
    ORDER BY id DESC
    LIMIT 1;
`;

export const INSERT_INTO_OTPS = `
    INSERT INTO otps (user_id, otp, expires_at)
    VALUES (?, ?, ?);
`;

export const GET_ALL_CATEGORIES = `
    SELECT * FROM categories;
`;

export const GET_ALL_TOPICS = `
    SELECT * FROM topics;
`;

export const GET_TOPICS_BY_CATEGORY_ID = `
    SELECT topics.*
    FROM topics
    INNER JOIN category_topic ON topics.id = category_topic.topic_id
    WHERE category_topic.category_id = ?;
`;

export const GET_USER_PROFILE_BY_USER_ID = `
    SELECT * FROM user_profile WHERE user_id = ? LIMIT 1;
`;

export const GET_TOPICS_BY_USER_ID = `
    SELECT topics.*
    FROM topics
    INNER JOIN user_topic ON topics.id = user_topic.topic_id
    WHERE user_topic.user_id = ?;
`;

export const GET_COMMUNITIES_BY_USER_ID = `
    SELECT communities.*
    FROM communities
    INNER JOIN user_community ON communities.id = user_community.community_id
    WHERE user_community.user_id = ?;
`;

export const GET_USERS_BY_COMMUNITY_ID = `
    SELECT users.*
    FROM users
    INNER JOIN user_community ON users.id = user_community.user_id
    WHERE user_community.community_id = ?;
`;

export const ADD_USER_TO_TOPIC = `
    INSERT INTO user_topic (user_id, topic_id)
    VALUES (?, ?);
`;

export const ADD_USER_TO_COMMUNITY = `
    INSERT INTO user_community (user_id, community_id)
    VALUES (?, ?);
`;

export const INSERT_INTO_USER_PROFILE = `
    INSERT INTO user_profile (user_id, bio, avatar_url, handle, permanent_address, current_address, gender)
    VALUES (?, ?, ?, ?, ?, ?, ?);
`;

export const INSERT_INTO_COMMUNITIES = `
    INSERT INTO communities (owner_id, name, description, logo)
    VALUES (?, ?, ?, ?);
`;

export const GET_ALL_COMMUNITIES = `
    SELECT * FROM communities;
`;

export const GET_COMMUNITIES_BY_OWNER_ID = `
    SELECT * FROM communities WHERE owner_id = ?;
`;

export const GET_LATEST_COMMUNITY_BY_OWNER_ID = `
    SELECT * FROM communities
    WHERE owner_id = ?
    ORDER BY id DESC
    LIMIT 1;
`;

export const GET_COMMUNITY_BY_ID = `
    SELECT * FROM communities WHERE id = ?;
`;

export const INSERT_INTO_POSTS = `
    INSERT INTO posts (user_id, community_id, topic_id, title, content, image, location_tag)
    VALUES (?, ?, ?, ?, ?, ?, ?);
`;

export const GET_POST_BY_ID = `
    SELECT * FROM posts WHERE id = ?;
`;

export const GET_POSTS_BY_USER_AND_COMMUNITY = `
    SELECT * FROM posts
    WHERE user_id = ? AND community_id = ?
    ORDER BY id DESC;
`;