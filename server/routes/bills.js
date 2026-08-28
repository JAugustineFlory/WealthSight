const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile').development);
const checkAuth = require('../middleware/checkAuth');

/**---------------------------- */
//GET for bills
router.get('/', checkAuth, async (req,res) => {
    try {
        const bills = await knex('bills').where({ user_id: req.userId });
        res.status(200).json(bills);
    } catch (err) {
        res.status(500).json({ message: `Error: ${err}` });
    }
});

router.get('/:id', checkAuth, async (req, res) => {
    try {
        const bill = await knex('bills')
            .where({ id: req.params.id, user_id: req.userId })
            .first();

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        res.status(200).json(bill);
    } catch (err) {
        res.status(500).json({ message: `Error: ${err}` });
    }
});

/**------------------------------ */
//POST for bills
router.post('/', checkAuth, async (req, res) => {
    try {
        const {
            name,
            amount,
            due_date,
            status,
            recurring,
            card_id,
            category_id,
        } = req.body;

        if (card_id) {
            const cardBelongsToUser = await knex('cards')
                .where({ id: card_id, user_id: req.userId })
                .first();

            if (!cardBelongsToUser) {
                return res.status(400).json({ message: 'Invalid card_id' });
            }
        }

        if (category_id) {
            const categoryBelongsToUser = await knex('categories')
                .where({ id: category_id, user_id: req.userId })
                .first();

            if(!categoryBelongsToUser) {
                return res.status(400).json({ message: 'Invalid category_id' });
            }
        }

        const [newBill] = await knex('bills')
            .insert({
                user_id: req.userId,
                name,
                amount,
                due_date,
                status,
                recurring,
                card_id,
                category_id,
            })
            .returning('*');

        res.status(201).json(newBill);
    } catch (err) {
        res.status(400).json({ message: `Error: ${err}` });
    }
});

/**------------------------------- */
//PUT
router.put('/:id', checkAuth, async (req, res) => {
    try {
        const {
            name,
            amount,
            due_date,
            status,
            recurring,
            card_id,
            category_id,
        } = req.body;


        if (card_id) {
            const cardBelongsToUser = await knex('cards')
                .where({ id: card_id, user_id: req.userId })
                .first();

            if (!cardBelongsToUser) {
                return res.status(400).json({ message: 'Invalid card_id' });
            }
        }

        if (category_id) {
        const categoryBelongsToUser = await knex('categories')
            .where({ id: category_id, user_id: req.userId })
            .first();

            if (!categoryBelongsToUser) {
                return res.status(400).json({ message: 'Invalid category_id' });
            }
        }
        const [updatedBill] = await knex('bills')
            .where({ id: req.params.id, user_id: req.userId })
            .update({
                name,
                amount,
                due_date,
                status,
                recurring,
                card_id,
                category_id,
            })
            .returning('*');

        if(!updatedBill){
            return res.status(404).json({ message: 'Bill not found'  });
        }

        res.status(200).json(updatedBill);
    } catch(err) {
        res.status(400).json({ message: `Error: ${err}` });
    }
});

/**--------------------- */
//DELETE
router.delete('/:id', checkAuth, async (req, res) => {
    try {
        const deletedCount = await knex('bills')
            .where({ id: req.params.id, user_id: req.userId})
            .del();

        if (!deletedCount) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: `Error: ${err}` });
    }
});

module.exports = router;