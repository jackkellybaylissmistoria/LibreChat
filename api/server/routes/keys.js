const express = require('express');
const { logger } = require('@librechat/data-schemas');
const { updateUserKey, deleteUserKey, getUserKeyExpiry } = require('~/models');
const { requireJwtAuth } = require('~/server/middleware');

const router = express.Router();

router.put('/', requireJwtAuth, async (req, res) => {
  if (req.body == null || typeof req.body !== 'object') {
    return res.status(400).send({ error: 'Invalid request body.' });
  }
  const { name, value, expiresAt } = req.body;
  try {
    await updateUserKey({ userId: req.user.id, name, value, expiresAt });
    res.status(201).send();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Encryption misconfiguration -> respond with a clear, actionable 500
    // instead of a generic "Invalid key length" stack trace.
    if (message.includes('[encryption]') || message.toLowerCase().includes('invalid key length')) {
      logger.error(`[Keys] Encryption misconfiguration while saving user key`, err);
      return res.status(500).send({
        error: 'encryption_misconfigured',
        message:
          'The server cannot save your API key because the CREDS_KEY/CREDS_IV environment variables are missing or invalid. Please ask the administrator to set a valid 64-char hex CREDS_KEY and 32-char hex CREDS_IV (see https://www.librechat.ai/toolkit/creds_generator).',
      });
    }

    logger.error(`[Keys] Failed to save user key`, err);
    return res.status(500).send({ error: 'Failed to save key' });
  }
});

router.delete('/:name', requireJwtAuth, async (req, res) => {
  const { name } = req.params;
  await deleteUserKey({ userId: req.user.id, name });
  res.status(204).send();
});

router.delete('/', requireJwtAuth, async (req, res) => {
  const { all } = req.query;

  if (all !== 'true') {
    return res.status(400).send({ error: 'Specify either all=true to delete.' });
  }

  await deleteUserKey({ userId: req.user.id, all: true });

  res.status(204).send();
});

router.get('/', requireJwtAuth, async (req, res) => {
  const { name } = req.query;
  const response = await getUserKeyExpiry({ userId: req.user.id, name });
  res.status(200).send(response);
});

module.exports = router;
