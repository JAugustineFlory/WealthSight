const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile').development);
const checkAuth = require('../middleware/checkAuth');

/**---------------------------- */
//GET for income
router.get('/', checkAuth, async (req, res) => {
    try {
        const income = await knex('income').where({ user_id: req.userId });
        res.status(200).json(income);
    } catch (err) {
        res.status(500).json({ message: `Error: ${err}` });
    }
});

router.get('/:id', checkAuth, async (req, res) => {
    try {
        const incomeEntry = await knex('income')
            .where({ id: req.params.id, user_id: req.userId })
            .first();

        if (!incomeEntry) {
            return res.status(404).json({ message: 'Income entry not found' });
        }

        res.status(200).json(incomeEntry);
    } catch (err) {
        res.status(500).json({ message: `Error: ${err}` });
    }
});

/**------------------------------ */
//POST for income
router.post('/', checkAuth, async (req, res) => {
    try {
        const {
            source,
            amount,
            date_received,
            category_id,
            recurring,
        } = req.body;

        if (category_id) {
            const categoryBelongsToUser = await knex('categories')
                .where({ id: category_id, user_id: req.userId })
                .first();

            if (!categoryBelongsToUser) {
                return res.status(400).json({ message: 'Invalid category_id' });
            }
        }

        const [newIncome] = await knex('income')
            .insert({
                user_id: req.userId,
                source,
                amount,
                date_received,
                category_id,
                recurring,
            })
            .returning('*');

        res.status(201).json(newIncome);
    } catch (err) {
        res.status(400).json({ message: `Error: ${err}` });
    }
});

/**------------------------------- */
//PUT
router.put('/:id', checkAuth, async (req, res) => {
    try {
        const {
            source,
            amount,
            date_received,
            category_id,
            recurring,
        } = req.body;

        if (category_id) {
            const categoryBelongsToUser = await knex('categories')
                .where({ id: category_id, user_id: req.userId })
                .first();

            if (!categoryBelongsToUser) {
                return res.status(400).json({ message: 'Invalid category_id' });
            }
        }

        const [updatedIncome] = await knex('income')
            .where({ id: req.params.id, user_id: req.userId })
            .update({
                source,
                amount,
                date_received,
                category_id,
                recurring,
            })
            .returning('*');

        if (!updatedIncome) {
            return res.status(404).json({ message: 'Income entry not found' });
        }

        res.status(200).json(updatedIncome);
    } catch (err) {
        res.status(400).json({ message: `Error: ${err}` });
    }
});

/**--------------------- */
//DELETE
router.delete('/:id', checkAuth, async (req, res) => {
    try {
        const deletedCount = await knex('income')
            .where({ id: req.params.id, user_id: req.userId })
            .del();

        if (!deletedCount) {
            return res.status(404).json({ message: 'Income entry not found' });
        }

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: `Error: ${err}` });
    }
});

module.exports = router;
