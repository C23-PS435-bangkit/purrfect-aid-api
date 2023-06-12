const  nanoid  = require('nanoid-esm');
const { Router } = require('express');
const { authenticateToken } = require('./middleware');
const pool = require('../config/database');

const router = Router();

router.get('/', [authenticateToken], async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT community_post.*, COUNT(community_comment.community_comment_id) AS comment_count, COUNT(community_like.community_like_id) AS like_count FROM community_post LEFT JOIN community_comment ON community_post.community_post_id = community_comment.community_comment_post_id LEFT JOIN community_like ON community_post.community_post_id = community_like.community_like_post_id GROUP BY community_post.community_post_id');
    const community_posts = rows;
    res.status(200).json({
    status: 200,
    data: community_posts,
});

  } catch (error) {
    console.error('Error retrieving community posts:', error);
    res.status(500).json({
      status: 500,
      msg: 'Server error',
    });
  }
});

router.post('/', [authenticateToken], async (req, res) => {
  try {
    const { email, username, auth_service } = req.response;
    const { title, content } = req.body;
    const postId = nanoid(16); // Generate a unique ID for the post

    let userId;
    if (auth_service === 'None') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [4, email]);
      userId = rows[0].user_id;
    } else if (auth_service === 'Google') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [1, email]);
      userId = rows[0].user_id;
    } else if (auth_service === 'Facebook') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [2, email]);
      userId = rows[0].user_id;
    } else if (auth_service === 'Twitter') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [3, email]);
      userId = rows[0].user_id;
    }

    await pool
      .promise()
      .query('INSERT INTO community_post (community_post_id, community_post_title, community_post_content, community_post_user_id) VALUES (?, ?, ?, ?)', [postId, title, content, userId]);

    const queryResult = await pool.promise().query('SELECT * FROM community_post WHERE community_post_id = ? LIMIT 1', [postId]);
    const result = queryResult[0][0];

    res.status(200).json({
      status: 200,
      msg: 'Community post created',
      data: result,
    });
  } catch (error) {
    console.error('Error creating community post:', error);
    res.status(500).json({
      status: 500,
      msg: 'Server error',
    });
  }
});

router.post('/:postId/like', [authenticateToken], async (req, res) => {
  const { email, username, auth_service } = req.response;
  try {
    const { postId } = req.params;
    let userId;
    if (auth_service === 'None') {
        const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [4, email]);
        userId = rows[0].user_id;
    } else if (auth_service === 'Google') {
        const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [1, email]);
        userId = rows[0].user_id;
    } else if (auth_service === 'Facebook') {
        const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [2, email]);
        userId = rows[0].user_id;
    } else if (auth_service === 'Twitter') {
        const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [3, email]);
        userId = rows[0].user_id;
    }

    await pool.promise().query('INSERT INTO community_like (community_like_id, community_like_user_id, community_like_post_id) VALUES (?, ?, ?)', [nanoid(16), userId, postId]);

    res.status(200).json({
      status: 200,
      msg: 'Community post liked',
    });
  } catch (error) {
    console.error('Error liking community post:', error);
    res.status(500).json({
      status: 500,
      msg: 'Server error',
    });
  }
});

router.post('/:postId/comment', [authenticateToken], async (req, res) => {
  const { email, username, auth_service } = req.response;
  try {
    const { postId } = req.params;
    const { comment } = req.body;
    let userId;
    if (auth_service === 'None') {
        const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [4, email]);
        userId = rows[0].user_id;
    } else if (auth_service === 'Google') {
        const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [1, email]);
        userId = rows[0].user_id;
    } else if (auth_service === 'Facebook') {
        const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [2, email]);
        userId = rows[0].user_id;
    } else if (auth_service === 'Twitter') {
        const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [3, email]);
        userId = rows[0].user_id;
    }

    await pool.promise().query('INSERT INTO community_comment (community_comment_id, community_comment_content, community_comment_post_id,  community_comment_user_id) VALUES (?, ?, ?, ?)', [nanoid(16), comment, postId, userId]);

    res.status(200).json({
      status: 200,
      msg: 'Comment added',
    });
  } catch (error) {
    console.error('Error adding comment to community post:', error);
    res.status(500).json({
      status: 500,
      msg: 'Server error',
    });
  }
});

module.exports = router;